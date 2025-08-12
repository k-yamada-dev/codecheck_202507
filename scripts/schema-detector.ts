import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

export interface ApiMetaInfo {
  name: string;
  filePath: string;
  exports: string[];
  apiMeta?: Record<string, unknown> | null;
}

/**
 * app/api/_schemas/ ディレクトリから全スキーマファイルを自動検出
 */
export async function detectApiSchemas(): Promise<ApiMetaInfo[]> {
  const schemasDir = resolve(process.cwd(), 'app/api/_schemas');
  const schemaFiles: ApiMetaInfo[] = [];

  try {
    const files = readdirSync(schemasDir).filter(
      file => file.endsWith('.ts') && file !== 'common.ts' // common.tsは除外
    );

    for (const file of files) {
      const filePath = resolve(schemasDir, file);
      const name = file.replace('.ts', '');

      try {
        // ファイル内容を読み取ってexportを解析
        const content = readFileSync(filePath, 'utf8');
        const exports = extractExports(content);

        // TypeScriptファイルから静的にApiMetaを抽出
        const apiMeta = parseApiMetaFromContent(content, name);

        schemaFiles.push({
          name,
          filePath,
          exports,
          apiMeta,
        });
      } catch (error) {
        console.warn(`Warning: Could not process schema file ${file}:`, error);
        // エラーが発生した場合もスキーマ情報は保持（apiMeta なしで）
        const content = readFileSync(filePath, 'utf8');
        const exports = extractExports(content);

        schemaFiles.push({
          name,
          filePath,
          exports,
          apiMeta: null,
        });
      }
    }
  } catch (error) {
    console.error('Error reading schemas directory:', error);
  }

  return schemaFiles;
}

/**
 * TypeScriptコードからApiMetaオブジェクトを静的に解析・抽出
 */
function parseApiMetaFromContent(
  content: string,
  schemaName: string
): Record<string, unknown> | null {
  try {
    // ApiMeta定義の候補パターンを探す
    const possibleNames = [
      `${schemaName}ApiMeta`,
      `${capitalize(schemaName)}ApiMeta`,
      `${schemaName.toUpperCase()}ApiMeta`,
      'ApiMeta',
    ];

    for (const apiMetaName of possibleNames) {
      // export const xxxApiMeta = { ... } as const; のパターン（as constありなし両対応）
      const apiMetaRegex = new RegExp(
        `export\\s+const\\s+${apiMetaName}\\s*=\\s*({[\\s\\S]*?})\\s*(?:as\\s+const)?\\s*;`,
        'g'
      );

      const match = apiMetaRegex.exec(content);
      if (match) {
        const apiMetaObjectStr = match[1];
        try {
          // オブジェクトリテラルを解析してJSONに変換
          const apiMetaObject = parseObjectLiteral(apiMetaObjectStr);
          console.log(`✅ Successfully parsed ${apiMetaName}:`, Object.keys(apiMetaObject));
          console.log(`🔍 Sample entry structure:`, Object.entries(apiMetaObject)[0]);
          return apiMetaObject;
        } catch (parseError) {
          console.warn(`Failed to parse ApiMeta object for ${apiMetaName}:`, parseError);
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    console.warn(`Failed to parse ApiMeta from content:`, error);
    return null;
  }
}

/**
 * TypeScriptオブジェクトリテラルをJSONオブジェクトに変換
 */
function parseObjectLiteral(objectStr: string): Record<string, unknown> {
  try {
    // TypeScriptのオブジェクトリテラルを簡易的にJSONに変換
    // この実装は基本的なケースのみをサポート

    // コメントを削除
    let cleanStr = objectStr.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    // 末尾のカンマを処理
    cleanStr = cleanStr.replace(/,(\s*[}\]])/g, '$1');

    // プロパティキーをクォートで囲む（unquoted keys -> quoted keys）
    cleanStr = cleanStr.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '"$1":');

    // 基本的な値の変換
    // undefined -> null
    cleanStr = cleanStr.replace(/:\s*undefined/g, ': null');

    // single quotes -> double quotes for strings
    cleanStr = cleanStr.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');

    // 関数呼び出しや複雑な式は文字列として扱う
    cleanStr = cleanStr.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$.]*\([^)]*\))/g, ': "$1"');

    // Zodスキーマの特別な処理
    cleanStr = cleanStr.replace(/:\s*(z\.[a-zA-Z][a-zA-Z0-9.()_]*)/g, ': "$1"');

    // 試しにJSONとしてパース
    const parsed = JSON.parse(cleanStr);
    return parsed;
  } catch {
    // JSON parseに失敗した場合、より手動的なアプローチを試す
    return parseObjectLiteralManually(objectStr);
  }
}

/**
 * 手動でオブジェクトリテラルを解析（フォールバック）
 */
function parseObjectLiteralManually(objectStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  try {
    // ネストしたオブジェクトを含むkey: value パアを抽出するより高度な正規表現
    const entries = parseNestedObjectEntries(objectStr);

    for (const [key, value] of entries) {
      result[key] = value;
    }
  } catch (error) {
    console.warn('Manual parsing failed:', error);
  }

  return result;
}

/**
 * ネストしたオブジェクトを含むエントリーを解析
 */
function parseNestedObjectEntries(objectStr: string): [string, any][] {
  const entries: [string, any][] = [];
  let currentPos = 0;

  // 文字列から空白とブレースを削除して開始
  const cleanStr = objectStr.trim().replace(/^{/, '').replace(/}$/, '');

  while (currentPos < cleanStr.length) {
    // キーを探す
    const keyMatch = cleanStr.slice(currentPos).match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
    if (!keyMatch) break;

    const key = keyMatch[1];
    currentPos += keyMatch[0].length;

    // 値の開始位置を見つける
    const valueStart = currentPos;
    let value: any;
    let valueEnd: number;

    // 値がオブジェクトかどうか確認
    const nextChar = cleanStr.slice(currentPos).trim()[0];
    if (nextChar === '{') {
      // ネストしたオブジェクトを解析
      const { endPos, parsedObject } = parseNestedObject(cleanStr, currentPos);
      value = parsedObject;
      valueEnd = endPos;
    } else {
      // 単純な値を解析
      const nextCommaOrEnd = findNextCommaOrEnd(cleanStr, currentPos);
      const valueStr = cleanStr.slice(currentPos, nextCommaOrEnd).trim();
      value = parseSimpleValue(valueStr);
      valueEnd = nextCommaOrEnd;
    }

    entries.push([key, value]);

    // 次のエントリーに移動（カンマをスキップ）
    currentPos = valueEnd;
    if (cleanStr[currentPos] === ',') {
      currentPos++;
    }
  }

  return entries;
}

/**
 * ネストしたオブジェクトを解析
 */
function parseNestedObject(str: string, startPos: number): { endPos: number; parsedObject: any } {
  let braceCount = 0;
  let pos = startPos;

  // 開始ブレースを見つける
  while (pos < str.length && str[pos] !== '{') pos++;

  const objectStart = pos;

  // 対応する終了ブレースを見つける
  while (pos < str.length) {
    if (str[pos] === '{') braceCount++;
    else if (str[pos] === '}') braceCount--;

    pos++;

    if (braceCount === 0) break;
  }

  const objectStr = str.slice(objectStart, pos);

  try {
    // ネストしたオブジェクトをより積極的に解析
    const parsed = parseObjectLiteral(objectStr);
    return { endPos: pos, parsedObject: parsed };
  } catch {
    // フォールバック: 手動解析を試す
    try {
      const manualParsed = parseObjectLiteralManually(objectStr);
      return { endPos: pos, parsedObject: manualParsed };
    } catch {
      // 最終的に失敗した場合はrawとして返す
      return { endPos: pos, parsedObject: { _raw: objectStr } };
    }
  }
}

/**
 * 次のカンマまたは終端を見つける
 */
function findNextCommaOrEnd(str: string, startPos: number): number {
  let pos = startPos;
  let braceCount = 0;
  let squareBraceCount = 0;
  let inString = false;
  let stringChar = '';

  while (pos < str.length) {
    const char = str[pos];

    if (!inString) {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      } else if (char === '[') {
        squareBraceCount++;
      } else if (char === ']') {
        squareBraceCount--;
      } else if (char === ',' && braceCount === 0 && squareBraceCount === 0) {
        break;
      }
    } else {
      if (char === stringChar && str[pos - 1] !== '\\') {
        inString = false;
      }
    }

    pos++;
  }

  return pos;
}

/**
 * 単純な値を解析
 */
function parseSimpleValue(valueStr: string): any {
  const trimmed = valueStr.trim();

  if (trimmed === 'undefined' || trimmed === 'null') {
    return null;
  } else if (trimmed === 'true') {
    return true;
  } else if (trimmed === 'false') {
    return false;
  } else if (/^['"].*['"](\s+as\s+const)?$/.test(trimmed)) {
    // 文字列リテラル（'value' as const 形式も含む）
    const match = trimmed.match(/^(['"])(.*?)\1(\s+as\s+const)?$/);
    if (match) {
      return match[2]; // 引用符の中身だけを返す
    }
    return trimmed.slice(1, -1);
  } else if (/^\d+$/.test(trimmed)) {
    // 数値
    return parseInt(trimmed, 10);
  } else if (/^\d+\.\d+$/.test(trimmed)) {
    // 浮動小数点数
    return parseFloat(trimmed);
  } else {
    // その他（変数参照、関数呼び出しなど）
    return trimmed;
  }
}

/**
 * ファイル内容からexport文を抽出
 */
function extractExports(content: string): string[] {
  const exports: string[] = [];

  // export const/function/class を検出
  const exportRegex = /export\s+(?:const|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let match;

  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  return exports;
}

/**
 * 文字列の最初の文字を大文字に
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 検出されたスキーマの統計情報を表示
 */
export function printSchemaStats(schemas: ApiMetaInfo[]): void {
  console.log('\n📊 Detected API Schemas:');
  console.log('========================');

  schemas.forEach(schema => {
    console.log(`🔹 ${schema.name}`);
    console.log(`   Exports: ${schema.exports.length} items`);
    console.log(`   ApiMeta: ${schema.apiMeta ? '✅ Found' : '❌ Not found'}`);
    if (schema.apiMeta) {
      const endpoints = Object.keys(schema.apiMeta).length;
      console.log(`   Endpoints: ${endpoints}`);
    }
    console.log('');
  });
}
