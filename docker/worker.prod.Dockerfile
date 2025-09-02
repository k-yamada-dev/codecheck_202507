# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@10.12.3 --activate

# まず lockfile と package.json だけコピーして install を安定化
COPY package.json pnpm-lock.yaml* ./
COPY patches/ ./patches/

RUN pnpm install --frozen-lockfile

# アプリ本体
COPY . .

# Prisma クライアント生成 → Worker ビルド
RUN pnpm prisma generate
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
# Prisma のネイティブエンジンを同梱（重要）
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 起動スクリプトを作成
# CLOUD_SQL_INSTANCE_CONNECTION_NAME は Cloud Run の環境変数で設定する
# 'EOF' とクォートすることで、ビルド時の変数展開を防ぐ
COPY <<'EOF' /app/start-worker.sh
#!/bin/bash
set -e
# Cloud SQL Auth Proxy をバックグラウンドで起動
# --structured-logs オプションでログを JSON 形式で出力
/usr/local/bin/cloud-sql-proxy --structured-logs --port 5432 ${CLOUD_SQL_INSTANCE_CONNECTION_NAME} &
# アプリケーションを起動。execでプロセスを置き換え、シグナルを正しく受け取れるようにする
exec node dist/index.js
EOF
RUN chmod +x /app/start-worker.sh

# Worker のエントリポイント
CMD ["/app/start-worker.sh"]
