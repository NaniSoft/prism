import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

/**
 * The site is a static export.
 *
 * `trailingSlash: false` pairs with the Worker's `html_handling:
 * "auto-trailing-slash"`, so a route is emitted as `out/docs/quickstart.html`
 * and served at `/docs/quickstart`. `images.unoptimized` is required because
 * Next's default image loader cannot run without a server.
 *
 * `createMDX` compiles the hand-written MDX collections declared in
 * `src/lib/source.ts` through the macro API and the item prose under `items/`.
 * `macro.include` names the module that may call `defineCollections`, per the
 * macro contract.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
}

const withMDX = createMDX({
  // The default include (`**/*.js` through `**/*.tsx`, `node_modules`
  // excluded) is what the macro matcher expects; a narrower, path-prefixed
  // pattern matches against a basename in the webpack matcher and silently
  // stops compiling the macro.
  macro: {},
})

export default withMDX(nextConfig)
