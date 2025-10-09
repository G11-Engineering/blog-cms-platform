/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3003',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost',
    NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_CONTENT_SERVICE_URL: process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:3002',
    NEXT_PUBLIC_MEDIA_SERVICE_URL: process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3003',
    NEXT_PUBLIC_CATEGORY_SERVICE_URL: process.env.NEXT_PUBLIC_CATEGORY_SERVICE_URL || 'http://localhost:3004',
    NEXT_PUBLIC_COMMENT_SERVICE_URL: process.env.NEXT_PUBLIC_COMMENT_SERVICE_URL || 'http://localhost:3005',
  },
}

module.exports = nextConfig
