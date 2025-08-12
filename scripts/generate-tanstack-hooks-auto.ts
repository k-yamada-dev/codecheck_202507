import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { detectApiSchemas, printSchemaStats } from './schema-detector';
import { format } from 'prettier';

/**
 * 型名を組み立てる
 */
function getRequestType(schemaName: string, operationName: string, operation: any): string | null {
  const { requestSchema, querySchema, pathParamsSchema } = operation;
  const hasBody = !!requestSchema;
  const hasQuery = !!querySchema;
  const hasPath = !!pathParamsSchema;

  if (!hasBody && !hasQuery && !hasPath) {
    return null;
  }

  const typeName = `${capitalize(schemaName)}${capitalize(operationName)}Request`;
  // Note: This assumes that if multiple schemas are present, they are combined into one Request type.
  // This logic might need adjustment if query, body, and path params have distinct types.
  return typeName;
}
function getResponseType(schemaName: string, operationName: string, operation: any): string | null {
  if (!operation.responseSchema) return null;
  return `${capitalize(schemaName)}${capitalize(operationName)}Response`;
}

/**
 * Query Keys を生成
 */
function generateQueryKeys(schemas: any[]): string {
  const queryKeys: string[] = [];

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;

    const schemaName = schema.name;
    queryKeys.push(`
export const ${schemaName}Keys = {
  all: ['${schemaName}'] as const,
  lists: () => [...${schemaName}Keys.all, 'list'] as const,
  list: (filters: any) => [...${schemaName}Keys.lists(), filters] as const,
  details: () => [...${schemaName}Keys.all, 'detail'] as const,
  detail: (id: string) => [...${schemaName}Keys.details(), id] as const,
} as const;`);
  });

  return queryKeys.join('\n');
}

/**
 * API 関数を生成
 */
function generateApiFunctions(schemas: any[]): string {
  const apiFunctions: string[] = [];

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;

    const clientName = schema.name === 'admin' ? 'adminApiClient' : 'apiV1Client';

    const functions: string[] = [];
    Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
      const methodName = `${schema.name}${capitalize(operationName)}`;
      // The client method expects a single object, so we just pass it through.
      functions.push(`  ${operationName}: (params: any) => ${clientName}.${methodName}(params)`);
    });

    if (functions.length > 0) {
      apiFunctions.push(`
export const ${schema.name}Api = {
${functions.join(',\n')}
} as const;`);
    }
  });

  return apiFunctions.join('\n');
}

/**
 * React Query hooks を型付きで生成
 */
function generateReactQueryHooks(schemas: any[]): { hooks: string; typeImports: Set<string> } {
  const hooks: string[] = [];
  const typeImports = new Set<string>();

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;

    Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
      const { method } = operation;
      const hookName = `use${capitalize(schema.name)}${capitalize(operationName)}`;
      const schemaName = schema.name;

      const reqType = getRequestType(schemaName, operationName, operation);
      const resType = getResponseType(schemaName, operationName, operation);

      if (reqType) typeImports.add(reqType);
      if (resType) typeImports.add(resType);

      const { pathParamsSchema, requestSchema, querySchema } = operation;
      const pathParams = (operation.path.match(/\{([^}]+)\}/g) || []).map((p: any) =>
        p.slice(1, -1)
      );

      const hasPathParams = pathParams.length > 0;
      const hasBody = !!requestSchema;
      const hasQuery = !!querySchema;

      let variablesType = 'void';
      if (hasPathParams || hasBody || hasQuery) {
        const parts: string[] = [];
        if (hasPathParams)
          parts.push(`path: { ${pathParams.map((p: any) => `${p}: string`).join('; ')} }`);
        if (hasBody) parts.push(`body: ${reqType}`);
        if (hasQuery) parts.push(`query: ${reqType}`);
        variablesType = `{ ${parts.join('; ')} }`;
      }

      if (method.toUpperCase() === 'GET') {
        // Query hook for GET requests
        hooks.push(`
export const ${hookName} = (params: ${variablesType}, options?: any) => {
  return useQuery<${resType || 'any'}>({
    queryKey: ${schemaName}Keys.list(params),
    queryFn: () => ${schemaName}Api.${operationName}(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};`);
      } else {
        // Mutation hook for POST/PUT/DELETE requests
        hooks.push(`
export const ${hookName} = (options?: any) => {
  const queryClient = useQueryClient();
  
  return useMutation<${resType || 'any'}, unknown, ${variablesType}>({
    mutationFn: ${schemaName}Api.${operationName},
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ${schemaName}Keys.all });
      options?.onSuccess?.(...args);
    },
    onError: (error: any, variables, context) => {
      console.error('${hookName} failed:', error);
      options?.onError?.(error, variables, context);
    },
  });
};`);
      }
    });
  });

  return { hooks: hooks.join('\n'), typeImports };
}

/**
 * 追加のユーティリティフックを生成
 */
function generateUtilityHooks(schemas: any[]): string {
  const utilityHooks: string[] = [];

  schemas.forEach(schema => {
    if (!schema.apiMeta) return;

    const schemaName = schema.name;

    // Regular query hook (non-infinite)
    const hasListOperation = Object.keys(schema.apiMeta).some(
      op =>
        op.includes('list') ||
        (op.includes('get') && schema.apiMeta[op].method.toUpperCase() === 'GET')
    );

    if (hasListOperation) {
      utilityHooks.push(`
// Non-infinite query version for ${schemaName}
export const use${capitalize(schemaName)}Query = (params: any) => {
  return useQuery({
    queryKey: ${schemaName}Keys.list(params),
    queryFn: () => ${schemaName}Api.get?.(params) || ${schemaName}Api.list?.(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!params,
  });
};`);
    }
  });

  return utilityHooks.join('\n');
}

/**
 * 完全自動化された TanStack Query hooks 生成
 */
async function generateTanstackHooks() {
  console.log('🚀 Auto-generating TanStack Query hooks...');

  // 1. スキーマファイルを自動検出
  const schemas = await detectApiSchemas();
  printSchemaStats(schemas);

  // 2. 型付きTanStack Query hooks を生成
  const { hooks: hooksContent, typeImports } = generateReactQueryHooks(schemas);

  const allApiTypes = Array.from(typeImports).join(',\n  ');

  const hooksFileContent = `
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from app/api/_schemas/ at ${new Date().toISOString()}

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiV1Client, adminApiClient } from '../client/api';
import type {
  ${allApiTypes}
} from '../client/api';

// ===== Query Keys =====
${generateQueryKeys(schemas)}

// ===== API Functions =====
${generateApiFunctions(schemas)}

// ===== React Query Hooks =====
${hooksContent}

// ===== Utility Hooks =====
${generateUtilityHooks(schemas)}

// ===== Export All Query Keys =====
export const queryKeys = {
${schemas
  .filter(s => s.apiMeta)
  .map(s => `  ${s.name}: ${s.name}Keys`)
  .join(',\n')}
} as const;
`.trim();

  // 3. ファイルに出力
  const outputDir = resolve(process.cwd(), '__generated__/hooks');
  mkdirSync(outputDir, { recursive: true });

  const outputPath = resolve(outputDir, 'index.ts');

  // Prettierで整形
  const formatted = await format(hooksFileContent, {
    parser: 'typescript',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
  });
  writeFileSync(outputPath, formatted, 'utf8');

  console.log(`✅ TanStack Query hooks auto-generated at: ${outputPath}`);

  const totalHooks = schemas.reduce((total, schema) => {
    return total + (schema.apiMeta ? Object.keys(schema.apiMeta).length : 0);
  }, 0);

  console.log(`📈 Generated ${totalHooks} React hooks from ${schemas.length} schema files`);
}

/**
 * 文字列の最初の文字を大文字に
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// メイン実行
if (require.main === module) {
  generateTanstackHooks().catch(console.error);
}

export { generateTanstackHooks };
