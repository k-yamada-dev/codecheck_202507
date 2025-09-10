# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@10.12.3 --activate

# まず lockfile と package.json だけコピーして install を安定化
COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml ./
# ワークスペース内の package.json をコピー
COPY apps/worker/package.json ./apps/worker/
COPY packages/db/package.json ./packages/db/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/contracts/package.json ./packages/contracts/
# postinstallでprisma generateが実行されるため、スキーマファイルを先にコピー
COPY packages/db/prisma ./packages/db/prisma

RUN pnpm install --frozen-lockfile

# pnpm の hoisting により @prisma が packages/db/node_modules に配置される場合があるため
# ビルドステージ内でルートの node_modules/@prisma を作成しておく（runner側の COPY を安定化）
RUN if [ -d packages/db/node_modules/@prisma ]; then mkdir -p node_modules && cp -a packages/db/node_modules/@prisma node_modules/@prisma; fi

# アプリ本体
COPY . .

# Prisma クライアント生成 → Worker ビルド
RUN pnpm --filter @acme/db exec prisma generate
RUN pnpm --filter worker build

# ---------- runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Cloud SQL Auth Proxy をインストール
# arm64/amd64 両対応
# hadolint ignore=DL3008
RUN apk add --no-cache libc6-compat curl bash && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -o /usr/local/bin/cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.18.0/cloud-sql-proxy.linux.${ARCH} && \
    chmod +x /usr/local/bin/cloud-sql-proxy

# ビルド済み worker アプリケーションをコピー
COPY --from=builder /app/apps/worker/dist ./dist
# 実行に必要な node_modules のみをコピー
COPY --from=builder /app/node_modules ./node_modules
# Prisma のネイティブエンジンとスキーマファイルを同梱（重要）
# pnpmのhoistingにより、@prismaはpackages/db配下にインストールされるため、そこからコピーする
COPY --from=builder /app/packages/db/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/packages/db/prisma/schema.prisma ./

# 起動スクリプトを作成（worker はバックグラウンドで起動し、HTTPヘルスエンドポイントを前景でlistenします）
RUN printf '%s\n' '#!/bin/bash' 'set -euo pipefail' '' 'if [ -n "${CLOUD_SQL_INSTANCE_CONNECTION_NAME:-}" ]; then' '  echo "Starting cloud-sql-proxy with $CLOUD_SQL_INSTANCE_CONNECTION_NAME"' '  /usr/local/bin/cloud-sql-proxy --structured-logs --port 5432 ${CLOUD_SQL_INSTANCE_CONNECTION_NAME} &' 'else' '  echo "CLOUD_SQL_INSTANCE_CONNECTION_NAME not set; skipping cloud-sql-proxy"' 'fi' '' 'echo "---- /app content ----"' 'ls -la /app || true' '' 'if [ -f /app/dist/index.js ]; then' '  echo "Starting worker (background): /app/dist/index.js"' '  node /app/dist/index.js &' 'else' '  echo "Warning: /app/dist/index.js not found. Worker will not start."' 'fi' '' 'echo "Starting minimal HTTP health server on port ${PORT:-8080}"' 'exec node -e "const http=require(\"http\");const p=process.env.PORT||8080;const s=http.createServer((req,res)=>{if(req.url===\"/health\")return res.end(\"ok\");res.end(\"ok\");});s.listen(p,()=>console.log(`health server listening ${p}`));"' > /app/start-worker.sh && chmod +x /app/start-worker.sh

# Worker のエントリポイント
CMD ["/app/start-worker.sh"]
