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

# Standalone buildの成果物をコピー
COPY --from=builder /app/apps/web/.next/standalone ./

# publicアセットをコピー
COPY --from=builder /app/apps/web/public ./apps/web/public

# staticアセットをコピー
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Prisma スキーマをコピー
COPY --from=builder /app/packages/db/prisma/schema.prisma ./packages/db/prisma/

# ポート 3000 を公開
EXPOSE 3000

# サーバーを起動
CMD ["node", "apps/web/server.js"]
