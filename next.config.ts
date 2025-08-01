// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ❌ REMOVED: output: 'export' — breaks API routes
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;