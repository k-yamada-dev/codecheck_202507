# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@latest --activate

# 必要な package.json と lockfile をコピー
COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/contracts/package.json ./packages/contracts/

# Prisma スキーマをコピー
COPY packages/db/prisma ./packages/db/prisma

# 依存関係をインストール
RUN pnpm install --frozen-lockfile


# ソースコードをコピー
COPY . .

# Prisma クライアントを生成
RUN pnpm --filter @acme/db exec prisma generate

# ------------------------------------------------------------------
# ▼▼▼▼▼ デバッグステップ（任意） ▼▼▼▼▼
# pnpm build を実行する前に、.envファイルが存在し、
# 中身が正しいかを確認するためにログに出力する
# ------------------------------------------------------------------
RUN echo "--- Listing files in /app/apps/web ---" && \
    ls -la /app/apps/web && \
    echo "--- Content of /app/apps/web/.env ---" && \
    cat /app/apps/web/.env && \
    echo "--- End of debug output ---"
# ▲▲▲▲▲ デバッグステップ（任意） ▲▲▲▲▲
# ------------------------------------------------------------------


# Next.js アプリケーションをビルド
RUN pnpm --filter web build

# standaloneビルドの成果物にQuery Engineを手動でコピー
# pnpmのhoistingを考慮し、@prisma/enginesからコピーする
RUN cp \
    node_modules/.pnpm/@prisma+engines*/node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node \
    apps/web/.next/standalone/apps/web/.next/server/

# ---------- runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Cloud SQL Auth Proxy をインストール
RUN apk add --no-cache libc6-compat curl bash && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -o /usr/local/bin/cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.18.0/cloud-sql-proxy.linux.${ARCH} && \
    chmod +x /usr/local/bin/cloud-sql-proxy

# Standalone buildの成果物をコピー
COPY --from=builder /app/apps/web/.next/standalone ./

# publicアセットをコピー
COPY --from=builder /app/apps/web/public ./apps/web/public

# staticアセットをコピー
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Prisma スキーマをコピー
COPY --from=builder /app/packages/db/prisma/schema.prisma ./packages/db/prisma/

# サーバーを起動
# Cloud SQL Proxyをバックグラウンドで起動し、その後Next.jsサーバーを起動する
CMD ["/bin/bash", "-c", "/usr/local/bin/cloud-sql-proxy --structured-logs --port 5432 ${CLOUD_SQL_INSTANCE_CONNECTION_NAME} & exec node apps/web/server.js"]
