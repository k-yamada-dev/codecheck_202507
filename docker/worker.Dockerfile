FROM node:18-slim

# OpenSSLをインストール
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /work

# pnpmをインストール
RUN npm install -g pnpm

# ワークスペースの依存関係解決に必要なファイルを先にコピー
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY apps/worker/package.json ./worker/
COPY patches ./patches
# postinstallでprisma generateが実行されるため、スキーマファイルを先にコピー
COPY packages/db/prisma ./packages/db/prisma
# packages/db の package.json を先にコピーしてワークスペース認識させる
COPY packages/db/package.json ./packages/db/package.json

# 依存関係をインストール (ここでpostinstallが実行される)
RUN pnpm install --frozen-lockfile

# Prisma クライアントをワークスペースの DB パッケージで生成（型を確実に作る）
# workspace のパッケージコンテキストで prisma を実行（パッケージ内の prisma/schema.prisma を使う）
RUN pnpm -w --filter @acme/db exec prisma generate

# アプリケーションの残りのファイルをコピー
COPY . .

# workerディレクトリに移動してビルドを実行
WORKDIR /work/apps/worker
RUN pnpm build

# ビルドされたJSを実行
CMD ["node", "dist/index.js"]
