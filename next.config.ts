import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Increased to support image uploads (base64 adds ~33% overhead)
      // 10MB body allows ~7MB images after encoding
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
