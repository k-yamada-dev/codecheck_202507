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
COPY worker/package.json ./worker/
COPY patches ./patches
# postinstallでprisma generateが実行されるため、スキーマファイルを先にコピー
COPY prisma ./prisma

# 依存関係をインストール (ここでpostinstallが実行される)
RUN pnpm install --frozen-lockfile

# アプリケーションの残りのファイルをコピー
COPY . .

# workerディレクトリに移動してビルドを実行
WORKDIR /work/worker
RUN pnpm build

# ビルドされたJSを実行
CMD ["node", "dist/index.js"]
