import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { detectApiSchemas, printSchemaStats } from './schema-detector';

/**
 * Zodスキーマから簡単なOpenAPIスキーマを生成
 */
function zodToOpenApiSchema(zodSchema: any): any {
  // これは簡略化された実装です
  // 実際にはzod-to-openapi等のライブラリを使用することを推奨
  return {
    type: 'object',
    properties: {},
    additionalProperties: true,
  };
}

/**
 * ApiMetaからOpenAPI pathsを自動生成
 */
function generateOpenApiPaths(schemas: any[]): any {
  const paths: any = {};

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;

    Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
      const {
        method,
        path,
        summary,
        description,
        tags,
        requestSchema,
        responseSchema,
        statusCode,
      } = operation;

      if (!paths[path]) {
        paths[path] = {};
      }

      // セキュリティ設定
      const security = [{ bearerAuth: [] }];

      // リクエストボディ
      const requestBody = requestSchema
        ? {
            required: true,
            content: {
              'application/json': {
                schema: zodToOpenApiSchema(requestSchema),
              },
            },
          }
        : undefined;

      // レスポンス
      const responses: any = {
        [statusCode]: {
          description: `${summary} - Success`,
          content: {
            'application/json': {
              schema: zodToOpenApiSchema(responseSchema),
            },
          },
        },
        400: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      };

      paths[path][method.toLowerCase()] = {
        summary,
        description,
        tags: tags || [schema.name],
        security,
        ...(requestBody && { requestBody }),
        responses,
      };
    });
  });

  return paths;
}

/**
 * 共通スキーマ定義を生成
 */
function generateCommonSchemas(): any {
  return {
    ErrorResponse: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
          required: ['code', 'message'],
        },
      },
      required: ['error'],
    },
  };
}

/**
 * 完全自動化されたOpenAPI仕様書生成
 */
async function generateOpenApiSpec() {
  console.log('🚀 Auto-generating OpenAPI specification...');

  // 1. スキーマファイルを自動検出
  const schemas = await detectApiSchemas();
  printSchemaStats(schemas);

  // 2. OpenAPI仕様書を生成
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Acuagraphy Online API',
      version: '1.0.0',
      description: 'Auto-generated API for watermark embedding and decoding service',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Main API v1',
      },
      {
        url: '/api/admin',
        description: 'Admin API',
      },
    ],
    paths: generateOpenApiPaths(schemas),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: generateCommonSchemas(),
    },
  };

  // 3. ファイルに出力
  const outputPath = resolve(process.cwd(), 'openapi.yaml');
  const yamlContent = `# Auto-generated OpenAPI specification
# Generated from app/api/_schemas/ at ${new Date().toISOString()}
# DO NOT EDIT MANUALLY - This file is auto-generated

${JSON.stringify(openApiSpec, null, 2)}
`;

  writeFileSync(outputPath, yamlContent, 'utf8');

  console.log(`✅ OpenAPI specification auto-generated at: ${outputPath}`);
  console.log(
    `📈 Generated ${Object.keys(openApiSpec.paths).length} API paths from ${schemas.length} schema files`
  );

  return openApiSpec;
}

// メイン実行
if (require.main === module) {
  generateOpenApiSpec().catch(console.error);
}

export { generateOpenApiSpec };
