import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { detectApiSchemas, printSchemaStats } from './schema-detector';
import { format } from 'prettier';

/**
 * Zodスキーマから TypeScript interface を生成
 */
import { zodToTs, printNode } from 'zod-to-ts';

function generateTypeScriptInterface(schemaName: string, zodSchema: any): string {
  try {
    if (!zodSchema || typeof zodSchema !== 'object' || !('safeParse' in zodSchema)) {
      // Zodスキーマでなければany
      return `export type ${schemaName} = any;`;
    }
    const { node } = zodToTs(zodSchema, schemaName);
    return printNode(node);
  } catch (e) {
    // fallback: any型
    return `export type ${schemaName} = any;`;
  }
}

/**
 * すべてのスキーマから TypeScript 型定義を生成
 */
function generateTypeDefinitions(schemas: any[]): string {
  const imports: string[] = [];
  const typeAliases: string[] = [];
  const importedTypes = new Set<string>();

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;
    const schemaPath = `@/app/api/_schemas/${schema.name}`;

    Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
      if (typeof operation !== 'object' || operation === null) return;

      const { requestSchema, responseSchema, querySchema } = operation;
      const inputSchemaName = requestSchema || querySchema;

      if (inputSchemaName && typeof inputSchemaName === 'string') {
        const typeName = `${capitalize(schema.name)}${capitalize(operationName)}Request`;
        if (!importedTypes.has(inputSchemaName)) {
          imports.push(`import type { ${inputSchemaName} } from '${schemaPath}';`);
          importedTypes.add(inputSchemaName);
        }
        typeAliases.push(`export type ${typeName} = ${inputSchemaName};`);
      }

      if (responseSchema && typeof responseSchema === 'string') {
        const typeName = `${capitalize(schema.name)}${capitalize(operationName)}Response`;
        if (!importedTypes.has(responseSchema)) {
          imports.push(`import type { ${responseSchema} } from '${schemaPath}';`);
          importedTypes.add(responseSchema);
        }
        typeAliases.push(`export type ${typeName} = ${responseSchema};`);
      }
    });
  });

  return `${[...new Set(imports)].join('\n')}\n\n${typeAliases.join('\n\n')}`;
}

/**
 * API クライアントのメソッドを生成
 */
function generateApiMethods(schemas: any[]): string {
  const methods: string[] = [];

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;

    Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
      if (typeof operation !== 'object' || operation === null) {
        return;
      }

      const { method, path, requestSchema, responseSchema, querySchema } = operation;

      if (!method || !path) {
        return;
      }

      const finalPath = schema.name === 'admin' ? path.replace(/^\/admin/, '') : path;
      const methodName = `${schema.name}${capitalize(operationName)}`;

      const pathParams = (path.match(/\{([^}]+)\}/g) || []).map((p: any) => p.slice(1, -1));
      const hasPathParams = pathParams.length > 0;
      const hasBody = !!requestSchema;
      const hasQuery = !!querySchema;

      const responseType = responseSchema
        ? `${capitalize(schema.name)}${capitalize(operationName)}Response`
        : 'any';

      const argParts: string[] = [];
      if (hasPathParams) {
        argParts.push(`path: { ${pathParams.map((p: any) => `${p}: string`).join('; ')} }`);
      }
      if (hasBody) {
        const requestType = `${capitalize(schema.name)}${capitalize(operationName)}Request`;
        argParts.push(`body: ${requestType}`);
      }
      if (hasQuery) {
        const queryType = `${capitalize(schema.name)}${capitalize(operationName)}Request`;
        argParts.push(`query?: ${queryType}`);
      }

      const argsString = argParts.length > 0 ? `data: { ${argParts.join('; ')} }` : '';

      let methodBody = '';
      let endpoint = `\`${finalPath}\``;
      if (hasPathParams) {
        endpoint = `\`${finalPath.replace(/\{([^}]+)\}/g, (_: any, p: any) => `\${data.path.${p}}`)}\``;
      }

      if (method.toUpperCase() === 'GET') {
        const queryPart = hasQuery
          ? "const queryParams = data?.query ? new URLSearchParams(data.query as any).toString() : '';\n" +
            `  const finalEndpoint = \`\${endpoint}\${queryParams ? \`?\${queryParams}\` : ''}\`;`
          : 'const finalEndpoint = endpoint;';

        methodBody = `
  async ${methodName}(${argsString}): Promise<${responseType}> {
    const endpoint = ${endpoint};
    ${queryPart}
    return this.request(finalEndpoint);
  }`;
      } else {
        methodBody = `
  async ${methodName}(${argsString}): Promise<${responseType}> {
    const endpoint = ${endpoint};
    return this.request(endpoint, {
      method: '${method.toUpperCase()}',
      ${hasBody ? 'body: JSON.stringify(data.body),' : ''}
    });
  }`;
      }

      methods.push(methodBody);
    });
  });

  return methods.join('\n\n');
}

/**
 * 便利なAPIオブジェクトを生成
 */
function generateApiObjects(schemas: any[]): string {
  const apiObjects: string[] = [];

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;

    const clientName = schema.name === 'admin' ? 'adminApiClient' : 'apiV1Client';
    const methods: string[] = [];

    Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
      // operationが文字列の場合は無視（例：path, summary, descriptionなど）
      if (typeof operation !== 'object' || operation === null) {
        return;
      }

      // method または path が存在しない場合は無視
      if (!operation.method || !operation.path) {
        return;
      }

      const methodName = `${schema.name}${capitalize(operationName)}`;
      const inputSchema = operation.requestSchema || operation.querySchema;
      const paramName = inputSchema ? 'data' : '';

      methods.push(
        `  ${operationName}: (${paramName}) => ${clientName}.${methodName}(${paramName})`
      );
    });

    if (methods.length > 0) {
      apiObjects.push(`
export const ${schema.name}Api = {
${methods.join(',\n')}
};`);
    }
  });

  return apiObjects.join('\n');
}

/**
 * 完全自動化された API クライアント生成
 */
async function generateApiClient() {
  console.log('🚀 Auto-generating API client...');

  // 1. スキーマファイルを自動検出
  const schemas = await detectApiSchemas();
  printSchemaStats(schemas);

  // 2. スキーマを admin と v1 に分類
  const adminSchemas = schemas.filter(s => s.name === 'admin');
  const v1Schemas = schemas.filter(s => s.name !== 'admin');

  // 3. API クライアントを生成
  const clientContent = `
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from app/api/_schemas/ at ${new Date().toISOString()}

import { AppError, ErrorCode } from '@/lib/errors/core';

${generateTypeDefinitions(schemas)}

// Common Error Response
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// Base API configuration
export interface ApiConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

// Base API client class
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || '/api/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: {
            code: 'UNKNOWN_ERROR',
            message: response.statusText || 'Unknown error occurred',
          },
        };
      }
      throw new AppError(
        (errorData.error.code as any) || ErrorCode.UNKNOWN,
        errorData.error.message,
        response.status
      );
    }

    // No content
    if (response.status === 204) {
      return Promise.resolve({} as T);
    }
    return response.json();
  }

  // Add authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = \`Bearer \${token}\`;
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
}

// V1 API client
export class V1ApiClient extends ApiClient {
  ${generateApiMethods(v1Schemas)}
}

// Admin API client
export class AdminApiClient extends ApiClient {
  ${generateApiMethods(adminSchemas)}
}


// API client instances
export const apiV1Client = new V1ApiClient({ baseUrl: '/api/v1' });
export const adminApiClient = new AdminApiClient({ baseUrl: '/api/admin' });

// Default export for backward compatibility (optional)
export const apiClient = apiV1Client;

${generateApiObjects(schemas)}
`.trim();

  // 4. ファイルに出力
  const outputDir = resolve(process.cwd(), '__generated__/client');
  mkdirSync(outputDir, { recursive: true });

  const outputPath = resolve(outputDir, 'api.ts');

  // Prettierで整形
  const formatted = await format(clientContent, {
    parser: 'typescript',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
  });
  writeFileSync(outputPath, formatted, 'utf8');

  console.log(`✅ API client auto-generated at: ${outputPath}`);

  const totalMethods = schemas.reduce((total, schema) => {
    return total + (schema.apiMeta ? Object.keys(schema.apiMeta).length : 0);
  }, 0);

  console.log(`📈 Generated ${totalMethods} API methods from ${schemas.length} schema files`);
}

/**
 * 文字列の最初の文字を大文字に
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// メイン実行
if (require.main === module) {
  generateApiClient().catch(console.error);
}

export { generateApiClient };
