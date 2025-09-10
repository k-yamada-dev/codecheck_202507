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

# Next.js のビルドに必要な環境変数を設定
# 実行時にはCloud Runから実際の値が渡されるため、ビルドを通過させるためのダミー値を設定する
RUN echo "GCS_BUCKET_NAME=dummy-bucket-for-build" > apps/web/.env && \
    echo "DATABASE_URL=postgresql://user:pass@host:port/db?schema=public" >> apps/web/.env && \
    echo "NEXTAUTH_SECRET=dummy-secret-for-build" >> apps/web/.env && \
    echo "NEXTAUTH_URL=http://localhost:3000" >> apps/web/.env && \
    echo "CLOUD_SQL_INSTANCE_CONNECTION_NAME=dummy:connection:string" >> apps/web/.env && \
    echo "FIREBASE_SERVICE_ACCOUNT_JSON={}" >> apps/web/.env && \
    echo 'NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"dummy","authDomain":"dummy.firebaseapp.com","projectId":"dummy","storageBucket":"dummy.appspot.com","messagingSenderId":"dummy","appId":"dummy"}' >> apps/web/.env

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
