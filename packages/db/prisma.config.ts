import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// packages/db/.env を明示的に読み込む。
// Prisma CLI はプロジェクトルートで実行されるため、相対パスの .env が見つからない場合がある。
// そのためこのファイルのあるディレクトリの .env を優先して読み込む。
const envPath = path.join(__dirname, '.env');
// 開発環境のみ .env を読み込む（本番では環境変数管理を使う想定）
if (process.env.NODE_ENV !== 'production' && fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  // 開発時のデバッグ出力：どの .env を読み込んだかを明示する
  // 本番ではこのブロック自体が走らないため安全
  if (result.parsed) {
    console.log(
      `[prisma.config] loaded env from ${envPath} (${Object.keys(result.parsed).length} keys)`
    );
  } else {
    console.log('[prisma.config] dotenv.load returned no parsed keys');
  }
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: { path: path.join('prisma', 'migrations') },
});
