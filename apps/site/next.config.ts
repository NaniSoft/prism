import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export → Cloudflare Workers Static Assets (map decision, ticket 03).
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
