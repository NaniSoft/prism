import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The registry ships un-built TSX so its source can be both published and rendered.
  transpilePackages: ['@nanisoft/prism-ui'],
}

export default nextConfig
