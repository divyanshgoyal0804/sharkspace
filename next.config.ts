// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true // Temporarily enable this for deployment
  },
  eslint: {
    ignoreDuringBuilds: true // Temporarily enable this for deployment
  }
};

export default nextConfig;