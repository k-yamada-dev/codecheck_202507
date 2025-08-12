import { generateOpenApiSpec } from './generate-openapi-auto';
import { generateApiClient } from './generate-api-client-auto';
import { generateTanstackHooks } from './generate-tanstack-hooks-auto';
import { generateRouteStubs } from './generate-route-stubs';
import { detectApiSchemas, printSchemaStats } from './schema-detector';

/**
 * 完全自動化された API 生成パイプライン
 *
 * 1. app/api/_schemas/ から全スキーマファイルを自動検出
 * 2. OpenAPI仕様書を自動生成
 * 3. TypeScript APIクライアントを自動生成
 * 4. TanStack Query hooksを自動生成
 */
async function generateAll() {
  console.log('🚀 Starting fully automated API generation pipeline...');
  console.log('='.repeat(60));

  const startTime = Date.now();

  try {
    // 1. スキーマファイルの検出と統計表示
    console.log('\n📂 Step 1: Detecting API schemas...');
    const schemas = await detectApiSchemas();

    if (schemas.length === 0) {
      console.warn('⚠️  No API schema files found in app/api/_schemas/');
      console.log('💡 Make sure you have schema files with ApiMeta exports.');
      return;
    }

    printSchemaStats(schemas);

    // 統計情報
    const totalEndpoints = schemas.reduce((total, schema) => {
      return total + (schema.apiMeta ? Object.keys(schema.apiMeta).length : 0);
    }, 0);

    console.log('\n📊 Generation Summary:');
    console.log(`   Schema files: ${schemas.length}`);
    console.log(`   Total API endpoints: ${totalEndpoints}`);
    console.log(`   Schemas with ApiMeta: ${schemas.filter(s => s.apiMeta).length}`);

    // 2. OpenAPI仕様書生成
    console.log('\n📄 Step 2: Generating OpenAPI specification...');
    await generateOpenApiSpec();

    // 3. TypeScript APIクライアント生成
    console.log('\n🔧 Step 3: Generating TypeScript API client...');
    await generateApiClient();

    // 4. TanStack Query hooks生成
    console.log('\n⚛️  Step 4: Generating TanStack Query hooks...');
    await generateTanstackHooks();

    // 完了
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n✅ Fully automated API generation completed!');
    console.log('='.repeat(60));
    console.log(`🎉 Generated ${totalEndpoints} API endpoints in ${duration}s`);
    console.log('\n📁 Generated files:');
    console.log('   📄 openapi.yaml - OpenAPI specification');
    console.log('   🔧 __generated__/client/api.ts - TypeScript API client');
    console.log('   ⚛️  __generated__/hooks/index.ts - TanStack Query hooks');

    console.log('\n🚀 Usage:');
    console.log("   import { apiClient } from '@/__generated__/client/api';");
    console.log("   import { useJobsCreateJob } from '@/__generated__/hooks';");
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

/**
 * 開発用テストファンクション - 新しいスキーマファイルを検証
 */
async function validateSchemas() {
  console.log('🔍 Validating API schemas...');

  const schemas = await detectApiSchemas();
  let hasErrors = false;

  schemas.forEach(schema => {
    console.log(`\n📄 Validating ${schema.name}:`);

    if (!schema.apiMeta) {
      console.warn(`   ⚠️  No ApiMeta found. Expected: ${schema.name}ApiMeta`);
      hasErrors = true;
      return;
    }

    Object.entries(schema.apiMeta).forEach(([operationName, operation]: [string, any]) => {
      const requiredFields = ['method', 'path', 'summary'];
      const missingFields = requiredFields.filter(field => !operation[field]);

      if (missingFields.length > 0) {
        console.warn(`   ⚠️  ${operationName}: Missing fields: ${missingFields.join(', ')}`);
        hasErrors = true;
      } else {
        console.log(`   ✅ ${operationName}: ${operation.method} ${operation.path}`);
      }
    });
  });

  if (hasErrors) {
    console.error('\n❌ Schema validation failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ All schemas are valid!');
  }
}

/**
 * CLI インターフェース
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'validate':
      await validateSchemas();
      break;
    case 'generate':
    case undefined:
      await generateAll();
      break;
    default:
      console.log('Usage:');
      console.log('  pnpm tsx scripts/generate-all-auto.ts           # Generate all');
      console.log('  pnpm tsx scripts/generate-all-auto.ts validate  # Validate schemas');
      break;
  }
}

// メイン実行
if (require.main === module) {
  main().catch(console.error);
}

export { generateAll, validateSchemas };
