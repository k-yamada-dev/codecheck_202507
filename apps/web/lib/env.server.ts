import { z } from 'zod';

// ビルド時かどうかの判定
const isBuild = process.env.npm_lifecycle_event === 'build';

const schema = z.object({
  // ビルド時は環境変数がなくてもエラーにならないよう、ダミーのデフォルト値を持つoptionalとして扱う
  // 実行時は必須項目としてバリデーションする
  GCS_BUCKET_NAME: isBuild
    ? z.string().optional().default('dummy-for-build')
    : z.string().min(1),
  GCS_SIGNED_URL_TTL: z.string().default('1800'), // seconds
  IMAGE_BASE_URL: z.string().url().optional(),
});

export const env = schema.parse(process.env);
