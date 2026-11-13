import type { NextConfig } from 'next'

/**
 * The export is hosted at prism.nanisoft.com/showcase/admin, so the base path
 * prefixes every address the build emits while leaving the files under out/
 * where the build writes them. The gate chain declares the same base path, once
 * per route-derived gate, and the routes it names stay app-internal.
 */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/showcase/admin',
  images: { unoptimized: true },
}

export default nextConfig
