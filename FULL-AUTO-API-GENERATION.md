# 完全自動化API生成パイプライン

## 🎉 完成！完全自動化システム

このプロジェクトでは、`app/api/_schemas/`にスキーマファイルを作成するだけで、全てのAPIコードが自動生成される完全自動化システムを構築しました。

## 🚀 使い方

### 新しいAPIを追加する場合

1. **スキーマファイルを作成** 📄

   ```typescript
   // app/api/_schemas/newapi.ts
   import { z } from 'zod';

   export const NewRequestSchema = z.object({
     name: z.string().min(1),
     // ...
   });

   export const NewResponseSchema = z.object({
     id: z.string().uuid(),
     // ...
   });

   export const NewApiMeta = {
     create: {
       method: 'POST' as const,
       path: '/newapi',
       summary: 'Create new item',
       description: 'Creates a new item',
       tags: ['newapi'],
       requestSchema: NewRequestSchema,
       responseSchema: NewResponseSchema,
       statusCode: 201,
     },
   } as const;
   ```

2. **自動生成を実行** 🤖

   ```bash
   pnpm gen:auto
   ```

3. **完了！** ✅
   - OpenAPI仕様書
   - TypeScript APIクライアント
   - TanStack Query hooks
   - 全て自動生成されます

## 📊 現在の自動化レベル

### ✅ 完全自動化されている部分

| 作業                 | 従来    | 現在    |
| -------------------- | ------- | ------- |
| スキーマファイル作成 | ✏️ 手動 | ✏️ 手動 |
| 生成スクリプト更新   | ✏️ 手動 | 🤖 自動 |
| OpenAPI仕様書生成    | 🤖 自動 | 🤖 自動 |
| APIクライアント生成  | 🤖 自動 | 🤖 自動 |
| React hooks生成      | 🤖 自動 | 🤖 自動 |

### 🎯 達成された自動化

- **動的スキーマ検出**: `app/api/_schemas/`の全ファイルを自動検出
- **ApiMeta駆動生成**: 各スキーマのApiMetaを自動読み込み
- **統一パイプライン**: 単一コマンドですべて生成
- **バリデーション機能**: スキーマの整合性を自動チェック

## 📈 パフォーマンス

最新のテスト結果:

```
🎉 Generated 14 API endpoints in 1.00s

📊 Generation Summary:
   Schema files: 6
   Total API endpoints: 14
   Schemas with ApiMeta: 6
```

## 🛠️ 利用可能なコマンド

```bash
# 完全自動生成（基本）
pnpm gen:auto

# 完全自動生成 + Route Handlerスタブ（新機能！）
pnpm gen:full

# Route Handlerスタブのみ生成
pnpm gen:stubs

# Route Handlerスタブ強制上書き（注意）
pnpm gen:stubs-force

# スキーマバリデーション
pnpm gen:validate

# 従来の手動生成（互換性維持）
pnpm gen:all
```

## 📁 生成されるファイル

### 1. OpenAPI仕様書

- `openapi.yaml` - 標準的なOpenAPI 3.0仕様書
- Swagger UI、Postman等で利用可能

### 2. TypeScript APIクライアント

- `__generated__/client/api.ts` - 型安全なAPIクライアント
- 自動エラーハンドリング、認証トークン管理

### 3. TanStack Query hooks

- `__generated__/hooks/index.ts` - React用のAPIフック
- Query、Mutation、無限スクロール対応

### 4. Route Handlerスタブ（新機能！）

- `app/api/v1/*/route.ts` - 実装用のひな型ファイル
- 認証・バリデーション・エラーハンドリングを自動生成
- 既存ファイルは安全に保護（上書きしない）

## 💡 使用例

### APIクライアント

```typescript
import { apiClient } from '@/__generated__/client/api';

// Job作成
const job = await apiClient.jobsCreateJob({
  type: 'EMBED',
  srcImagePath: '/path/to/image.jpg',
  params: { watermark: 'test' },
});

// Users一覧取得
const users = await apiClient.usersGetUsers({
  tenantId: 'tenant-123',
  search: 'john',
});
```

### TanStack Query hooks

```typescript
import { useJobsCreateJob, useUsersGetUsers, useAdminCreateTenant } from '@/__generated__/hooks';

function MyComponent() {
  // Query hook
  const { data: users, isLoading } = useUsersGetUsers({
    tenantId: 'tenant-123',
  });

  // Mutation hook
  const createJobMutation = useJobsCreateJob();

  const handleCreateJob = () => {
    createJobMutation.mutate({
      type: 'EMBED',
      srcImagePath: '/path/to/image.jpg',
      params: { watermark: 'test' },
    });
  };
}
```

## 🏗️ システム構成

### 検出・生成フロー

```
app/api/_schemas/*.ts
        ↓
  [schema-detector]
        ↓
   [ApiMeta収集]
        ↓
┌─────────────────────┐
│  generate-all-auto  │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ generate-openapi-   │
│       auto          │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ generate-api-client-│
│       auto          │
└─────────────────────┘
        ↓
┌─────────────────────┐
│generate-tanstack-   │
│   hooks-auto        │
└─────────────────────┘
```

### 生成コンポーネント

1. **`schema-detector.ts`** - スキーマファイル自動検出
2. **`generate-openapi-auto.ts`** - OpenAPI仕様書自動生成
3. **`generate-api-client-auto.ts`** - APIクライアント自動生成
4. **`generate-tanstack-hooks-auto.ts`** - React hooks自動生成
5. **`generate-all-auto.ts`** - 統合パイプライン

## 🔍 バリデーション機能

スキーマの整合性を自動チェック:

```bash
pnpm gen:validate
```

チェック項目:

- ApiMetaの存在確認
- 必要フィールド（method、path、summary）の確認
- パス重複の検出
- スキーマ参照の妥当性確認

## 🚦 エラーハンドリング

### よくあるエラーと対処法

1. **ApiMeta not found**

   ```
   ⚠️  No ApiMeta found. Expected: newApiMeta
   ```

   **対処**: スキーマファイルに`xxxApiMeta`をexportしてください

2. **Missing required fields**

   ```
   ⚠️  create: Missing fields: method, path
   ```

   **対処**: ApiMetaの各operationに必要フィールドを追加してください

3. **Dynamic import failed**
   ```
   Warning: Could not process schema file
   ```
   **対処**: TypeScriptの構文エラーを修正してください

## 🔄 継続的インテグレーション

### ビルド時自動生成

```json
{
  "scripts": {
    "build": "pnpm gen:auto && next build"
  }
}
```

### 開発時の推奨フロー

1. スキーマファイル作成・編集
2. `pnpm gen:validate` でバリデーション
3. `pnpm gen:auto` で自動生成
4. 生成されたコードを使用して実装

## 🎯 今後の拡張可能性

- **Route Handlerスタブ生成**: APIスキーマからexpress/Next.jsのhandler自動生成
- **テストコード生成**: スキーマからAPIテストの自動生成
- **ドキュメント生成**: より詳細なAPI仕様書の自動生成
- **モック生成**: 開発用のモックサーバー自動生成

## ✨ まとめ

このシステムにより、新しいAPIを追加する際の作業は：

**従来（手動作業多め）**

1. ✏️ スキーマファイル作成
2. ✏️ 3つの生成スクリプトを手動更新
3. ✏️ OpenAPI pathsを手動定義
4. 🤖 `pnpm gen:all` 実行

**現在（完全自動化）**

1. ✏️ スキーマファイル作成
2. 🤖 `pnpm gen:auto` 実行

**66%の作業削減**を実現し、開発効率が大幅に向上しました！

---

🎉 **完全自動化API生成パイプラインの構築完了** 🎉
