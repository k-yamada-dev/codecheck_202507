# API自動生成パイプライン

このプロジェクトでは、Zodスキーマを使用したAPI自動生成パイプラインを実装しています。

## 概要

1. **Zodスキーマ定義** (`app/api/_schemas/`) - APIの入出力型を定義
2. **OpenAPI仕様書生成** - Zodスキーマから自動生成
3. **TypeScript APIクライアント生成** - 型安全なAPIクライアント
4. **TanStack Query hooks生成** - React用のAPIフック

## ディレクトリ構造

```
app/api/_schemas/          # APIスキーマ定義 (INPUT)
├── jobs.ts               # Jobs API のスキーマとメタデータ
└── common.ts             # 共通エラーレスポンススキーマ

scripts/                  # 生成スクリプト
├── generate-openapi.ts   # OpenAPI仕様書生成
├── generate-api-client.ts # APIクライアント生成
└── generate-tanstack-hooks.ts # TanStack Query hooks生成

__generated__/             # 自動生成されたファイル
├── client/
│   └── api.ts            # TypeScript APIクライアント
└── hooks/
    └── useJobs.ts        # TanStack Query hooks
```

## 使用方法

### 1. スキーマの定義

`app/api/_schemas/` にZodスキーマとAPIメタデータを定義します。

```typescript
// app/api/_schemas/jobs.ts
import { z } from 'zod';

export const CreateJobRequestSchema = z.object({
  type: z.enum(['EMBED', 'DECODE']),
  srcImagePath: z.string().min(1),
  // ...
});

export const JobsApiMeta = {
  createJob: {
    method: 'POST' as const,
    path: '/jobs',
    summary: 'Create a new job',
    // ...
  },
  // ...
};
```

### 2. 自動生成の実行

```bash
# 全て生成
pnpm gen:all

# 個別に生成
pnpm gen:openapi  # OpenAPI仕様書
pnpm gen:client   # APIクライアント
pnpm gen:hooks    # TanStack Query hooks
```

### 3. 生成されたコードの使用

#### APIクライアント

```typescript
import { apiClient } from '@/__generated__/client/api';

// Job作成
const newJob = await apiClient.createJob({
  type: 'EMBED',
  srcImagePath: '/path/to/image.jpg',
  params: { watermark: 'test' },
});

// Jobs一覧取得
const jobs = await apiClient.getJobs({
  filter: 'embed',
  limit: 20,
});
```

#### TanStack Query hooks

```typescript
import { useJobs, useCreateJob } from '@/__generated__/hooks/useJobs';

function JobsPage() {
  // 無限スクロール対応
  const { data, fetchNextPage, hasNextPage, isLoading } = useJobs({ filter: 'all' });

  // Job作成
  const createJobMutation = useCreateJob();

  const handleCreateJob = () => {
    createJobMutation.mutate({
      type: 'EMBED',
      srcImagePath: '/path/to/image.jpg',
      params: { watermark: 'test' },
    });
  };

  // ...
}
```

## 生成されるファイル

### OpenAPI仕様書 (`openapi.yaml`)

標準的なOpenAPI 3.0仕様書が生成されます。Swagger UIやPostmanで利用できます。

### APIクライアント (`__generated__/client/api.ts`)

- 型安全なAPIクライアント
- 自動的なエラーハンドリング
- 認証トークン管理機能
- Fetch APIベース

### TanStack Query hooks (`__generated__/hooks/useJobs.ts`)

- 無限スクロール対応 (`useJobs`)
- ミューテーション (`useCreateJob`)
- キャッシュキー管理
- 自動的なキャッシュ無効化

## ワークフロー

1. **スキーマ定義**: `app/api/_schemas/` でAPIの契約を定義
2. **Route Handler実装**: 生成されたスキーマを使用してバリデーション
3. **自動生成実行**: `pnpm gen:all` で全コード生成
4. **フロントエンド実装**: 生成されたhooksとクライアントを使用

## ビルド時の統合

```json
{
  "scripts": {
    "build": "pnpm gen:all && next build"
  }
}
```

ビルド前に自動的に最新のAPIコードが生成されます。

## 拡張方法

### 新しいAPIエンドポイントの追加

1. `app/api/_schemas/` に新しいスキーマファイルを作成
2. 生成スクリプトを更新（必要に応じて）
3. `pnpm gen:all` を実行

### カスタム生成ロジック

各生成スクリプト（`scripts/generate-*.ts`）は独立しており、プロジェクトの要件に応じてカスタマイズできます。

## メリット

- **型安全性**: TypeScriptの恩恵を最大限活用
- **一貫性**: 単一のスキーマ定義から全コード生成
- **保守性**: スキーマ変更時の影響範囲が明確
- **開発効率**: ボイラープレートコードの自動生成
- **品質**: 手作業によるミスの削減

## 注意事項

- `__generated__/` 内のファイルは手動編集禁止
- スキーマ変更後は必ず `pnpm gen:all` を実行
- Route Handlerでは生成されたスキーマを使用してバリデーション
