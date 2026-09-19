import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export → Cloudflare Workers Static Assets (map decision, ticket 03).
  output: 'export',
  images: {
    unoptimized: true,
  },
};

// fumadocs-mdx's Macro API integration (ticket 03): compiles content collections
// and transforms `lib/source.ts`'s defineDocs/defineCollections calls.
// Call, not wrap: createMDX() returns the config decorator. `createMDX(nextConfig)`
// would hand Next a function that spreads the 22-char phase string into the
// config (numeric-key soup, `output` dropped).
export default createMDX()(nextConfig);
