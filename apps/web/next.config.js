/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
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
  eslint: {
    // Lint 対象のディレクトリのみ列挙（lib/zod は入れない）
    dirs: [
      'app',
      'lib/api',
      'lib/dto',
      'lib/errors',
      'lib/gcs',
      'lib/i18n',
      'lib/types',
      'lib/utils',
      'hooks',
      'components',
      'providers',
      'styles',
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
