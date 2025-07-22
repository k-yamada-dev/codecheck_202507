/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 本番環境での最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // キャッシュの設定
  generateEtags: true,
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
