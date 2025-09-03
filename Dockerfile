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

# デバッグ: builder ステージ内に存在する server.js を列挙（standalone の実際のエントリを確認）
RUN find /app -type f -name "server.js" -print -exec ls -la {} \; || true

# ビルド成果物の「standalone」位置を標準化（複数パターンに対応）
#  - Next の出力が /app/.next/standalone または /app/apps/web/.next/standalone のどちらかになる場合があるため、
#    どちらか存在する方を /app/standalone にコピーしておく（runnerステージではここをコピーする）
RUN sh -c 'if [ -d "/app/.next/standalone" ]; then cp -a /app/.next/standalone /app/standalone; elif [ -d "/app/apps/web/.next/standalone" ]; then cp -a /app/apps/web/.next/standalone /app/standalone; else echo "no standalone found"; fi'

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
# builder 側で /app/standalone に正しい standalone を生成しているので、それをルートへ展開する
# これにより standalone 内の server.js が /app/server.js 相当に配置され、確実に起動できるようにする
COPY --from=builder /app/standalone/. /app/
# 静的アセットと public を配置
COPY --from=builder /app/apps/web/.next/static /app/.next/static
COPY --from=builder /app/apps/web/public /app/public

# Prisma のネイティブエンジンとスキーマファイルを同梱（重要）
# pnpmのhoistingにより、@prismaはpackages/db配下にインストールされるため、そこからコピーする
COPY --from=builder /app/packages/db/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/packages/db/prisma/schema.prisma ./

# 起動スクリプトを作成（standalone 配下を再帰的に検索して server.js を見つけて起動）
RUN printf '%s\n' '#!/bin/bash' 'set -euo pipefail' '/usr/local/bin/cloud-sql-proxy --structured-logs --port 5432 ${CLOUD_SQL_INSTANCE_CONNECTION_NAME} &' '' 'echo "---- /app content ----"' 'ls -la /app || true' '' 'echo "---- Searching for server.js under /app/.next/standalone ----"' 'if [ -d /app/.next/standalone ]; then' '  while IFS= read -r ENTRY; do' '    echo "Found: $ENTRY"' '    ls -la "$ENTRY" || true' '    echo "Starting server: $ENTRY"' '    exec node "$ENTRY"' '  done < <(find /app/.next/standalone -type f -name "server.js" -print)' 'fi' '' '# Fallback: app root candidates' 'for CAND in /app/server.js /app/next-server.js /app/main.js; do' '  if [ -f "$CAND" ]; then' '    echo "Starting fallback server: $CAND"' '    exec node "$CAND"' '  fi' 'done' '' 'echo "No server entry found; listing /app for debugging:"' 'ls -la /app || true' 'exit 1' > /app/start.sh && chmod +x /app/start.sh

# Next の standalone のエントリ
CMD ["/app/start.sh"]
