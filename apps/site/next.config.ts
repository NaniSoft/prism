import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The library is consumed as built output (`dist/**` JS plus declarations)
  // through its `exports` map, so there is no raw TSX to transpile.
}

export default nextConfig
