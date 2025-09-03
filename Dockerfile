# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@10.12.3 --activate

# まず lockfile と package.json だけコピーして install を安定化
COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml ./
# ワークスペース内の package.json をコピー
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/contracts/package.json ./packages/contracts/
# postinstallでprisma generateが実行されるため、スキーマファイルを先にコピー
COPY packages/db/prisma ./packages/db/prisma

RUN pnpm install --frozen-lockfile

# アプリ本体
COPY . .

# Prisma クライアント生成 → Next ビルド
RUN pnpm --filter @acme/db exec prisma generate

# Next.js のビルドに必要な環境変数を設定
# Cloud Runの実行時に実際値が設定されるため、ビルドを通過させるためのダミー値を設定する
RUN echo "NEXTAUTH_SECRET=dummy-secret-for-build" > apps/web/.env.local && \
    echo "GCS_BUCKET_NAME=dummy-bucket-for-build" >> apps/web/.env.local && \
    echo "NEXTAUTH_URL=http://localhost:3000" >> apps/web/.env.local && \
    echo "CLOUD_SQL_INSTANCE_CONNECTION_NAME=dummy:connection:string" >> apps/web/.env.local && \
    echo "DATABASE_URL=postgresql://user:pass@host:port/db" >> apps/web/.env.local && \
    echo "FIREBASE_SERVICE_ACCOUNT_JSON={}" >> apps/web/.env.local && \
    echo 'NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"dummy","authDomain":"dummy.firebaseapp.com","projectId":"dummy","storageBucket":"dummy.appspot.com","messagingSenderId":"dummy","appId":"dummy"}' >> apps/web/.env.local

RUN pnpm build

# ---------- runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Cloud SQL Auth Proxy をインストール
# arm64/amd64 両対応
# hadolint ignore=DL3008
RUN apk add --no-cache libc6-compat curl bash && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -o /usr/local/bin/cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.18.0/cloud-sql-proxy.linux.${ARCH} && \
    chmod +x /usr/local/bin/cloud-sql-proxy

# standalone サーバと静的ファイルを配置
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

# Prisma のネイティブエンジンを同梱（重要）
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 起動スクリプトを作成
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '# Cloud SQL Auth Proxy をバックグラウンドで起動' >> /app/start.sh && \
    echo '# --structured-logs オプションでログを JSON 形式で出力' >> /app/start.sh && \
    echo '/usr/local/bin/cloud-sql-proxy --structured-logs --port 5432 ${CLOUD_SQL_INSTANCE_CONNECTION_NAME} &' >> /app/start.sh && \
    echo '# アプリケーションを起動。execでプロセスを置き換え、シグナルを正しく受け取れるようにする' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Next の standalone のエントリ
CMD ["/app/start.sh"]
