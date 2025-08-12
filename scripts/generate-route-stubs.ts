import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { detectApiSchemas, printSchemaStats } from './schema-detector';

interface StubGenerationResult {
  created: string[];
  skipped: string[];
  errors: string[];
}

/**
 * Route Handlerスタブの内容を生成
 */
function generateStubContent(schemaName: string, operation: any): string {
  const { method, path, summary, requestSchema, responseSchema, querySchema } = operation;
  const methodUpper = method.toUpperCase();

  // インポート文を生成
  const imports = [`import { NextRequest, NextResponse } from 'next/server';`];

  // 認証が必要な場合
  if (operation.auth) {
    imports.push(`import { getServerSession } from 'next-auth/next';`);
    imports.push(`import { authOptions } from '@/lib/auth';`);
  }

  imports.push(`import { withErrorHandling } from '@/lib/errors/apiHandler';`);
  imports.push(`import { AppError, ErrorCode } from '@/lib/errors/core';`);

  // スキーマインポート
  const schemaImports = [];
  if (requestSchema) {
    const requestTypeName = `${capitalize(schemaName)}${capitalize(getOperationName(operation))}RequestSchema`;
    schemaImports.push(requestTypeName);
  }
  if (querySchema) {
    const queryTypeName = `${capitalize(schemaName)}${capitalize(getOperationName(operation))}QuerySchema`;
    schemaImports.push(queryTypeName);
  }

  if (schemaImports.length > 0) {
    imports.push(`import { ${schemaImports.join(', ')} } from '@/app/api/_schemas/${schemaName}';`);
  }

  // ハンドラー本体を生成
  let handlerBody = '';

  // 認証チェック
  if (operation.auth) {
    handlerBody += `
  // 認証チェック
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Unauthorized', 401);
  }
`;
  }

  // バリデーション処理
  if (methodUpper === 'GET' && querySchema) {
    handlerBody += `
  // クエリパラメータ解析・バリデーション
  const { searchParams } = new URL(req.url);
  const queryParams = Get${capitalize(schemaName)}QuerySchema.parse({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    search: searchParams.get('search') || undefined,
    // TODO: Add other query parameters as needed
  });
`;
  } else if (requestSchema) {
    handlerBody += `
  // リクエストボディ解析・バリデーション
  const body = await req.json();
  const validatedData = Create${capitalize(schemaName)}RequestSchema.parse(body);
`;
  }

  // ビジネスロジック部分（TODO）
  handlerBody += `
  // ✏️ TODO: Implement your business logic here
  console.log('${summary} - Implementation needed');
  
  // Example implementation:
  // const result = await prisma.${schemaName.toLowerCase()}.${getDbOperation(methodUpper)}({
  //   data: validatedData,
  //   where: { tenantId: session.user.tenantId },
  // });
`;

  // レスポンス
  if (methodUpper === 'GET') {
    handlerBody += `
  return NextResponse.json({
    message: 'TODO: Implement ${summary.toLowerCase()}',
    ${querySchema ? 'queryParams,' : ''}
    data: [] // Replace with actual data
  });`;
  } else {
    const statusCode = operation.statusCode || (methodUpper === 'POST' ? 201 : 200);
    handlerBody += `
  return NextResponse.json({
    message: 'TODO: Implement ${summary.toLowerCase()}',
    ${requestSchema ? 'receivedData: validatedData,' : ''}
    // Add actual response data here
  }, { status: ${statusCode} });`;
  }

  const stubContent = `// 🏷️ AUTO-GENERATED ROUTE STUB - Safe to modify
// Generated at: ${new Date().toISOString()}
// Operation: ${methodUpper} ${path}
// Summary: ${summary}

${imports.join('\n')}

/**
 * ${summary}
 * ${operation.description || ''}
 */
export const ${methodUpper} = withErrorHandling(async (req: NextRequest) => {${handlerBody}
});
`;

  return stubContent;
}

/**
 * Operation名を推測
 */
function getOperationName(operation: any): string {
  const { method, path } = operation;

  if (method.toUpperCase() === 'POST') return 'create';
  if (method.toUpperCase() === 'GET') return path.includes('{') ? 'get' : 'list';
  if (method.toUpperCase() === 'PUT') return 'update';
  if (method.toUpperCase() === 'DELETE') return 'delete';

  return 'operation';
}

/**
 * データベース操作を推測
 */
function getDbOperation(method: string): string {
  switch (method) {
    case 'POST':
      return 'create';
    case 'GET':
      return 'findMany';
    case 'PUT':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'findMany';
  }
}

/**
 * 文字列の最初の文字を大文字に
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Route Handlerスタブを安全に生成
 */
async function generateRouteStubs(
  options: { force?: boolean } = {}
): Promise<StubGenerationResult> {
  console.log('🏗️  Generating Route Handler stubs...');

  const result: StubGenerationResult = {
    created: [],
    skipped: [],
    errors: [],
  };

  try {
    // 1. スキーマファイルを自動検出
    const schemas = await detectApiSchemas();

    if (schemas.length === 0) {
      console.warn('⚠️  No API schema files found');
      return result;
    }

    // 2. 各スキーマのRoute Handlerを生成
    for (const schema of schemas) {
      if (!schema.apiMeta) continue;

      Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
        const { path } = operation;
        const routePath = path.startsWith('/') ? path.slice(1) : path;
        const filePath = resolve(process.cwd(), `app/api/v1/${routePath}/route.ts`);

        try {
          // 🛡️ 既存ファイルチェック
          if (existsSync(filePath) && !options.force) {
            result.skipped.push(filePath);
            return;
          }

          // バックアップ作成（force使用時）
          if (existsSync(filePath) && options.force) {
            const backupPath = `${filePath}.backup.${Date.now()}`;
            require('fs').copyFileSync(filePath, backupPath);
            console.log(`📦 Backup created: ${backupPath}`);
          }

          // ディレクトリ作成
          mkdirSync(dirname(filePath), { recursive: true });

          // スタブ生成
          const stubContent = generateStubContent(schema.name, operation);
          writeFileSync(filePath, stubContent, 'utf8');

          result.created.push(filePath);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`${filePath}: ${errorMessage}`);
        }
      });
    }

    // 3. 結果表示
    console.log('\n📊 Route Stub Generation Results:');
    console.log('==================================');

    if (result.created.length > 0) {
      console.log(`✅ Created ${result.created.length} new stubs:`);
      result.created.forEach(file => console.log(`   📁 ${file}`));
    }

    if (result.skipped.length > 0) {
      console.log(`⚠️  Skipped ${result.skipped.length} existing files:`);
      result.skipped.forEach(file => console.log(`   📁 ${file}`));
    }

    if (result.errors.length > 0) {
      console.log(`❌ Failed ${result.errors.length} operations:`);
      result.errors.forEach(error => console.log(`   ❌ ${error}`));
    }

    console.log(`\n🎉 Route stub generation completed!`);
    console.log(`   New stubs: ${result.created.length}`);
    console.log(`   Preserved existing: ${result.skipped.length}`);
    console.log(`   Errors: ${result.errors.length}`);
  } catch (error) {
    console.error('\n❌ Route stub generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(`Generation failed: ${errorMessage}`);
  }

  return result;
}

/**
 * CLI インターフェース
 */
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  if (force) {
    console.log('⚠️  WARNING: Force mode enabled - existing files will be overwritten!');
  }

  await generateRouteStubs({ force });
}

// メイン実行
if (require.main === module) {
  main().catch(console.error);
}

export { generateRouteStubs };
