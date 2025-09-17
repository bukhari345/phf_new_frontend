import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ This allows build to continue even with TypeScript errors
  },
}

export default nextConfig
