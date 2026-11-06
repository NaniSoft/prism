import type { MetadataRoute } from 'next'

import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

/**
 * Generated once, at build, for the reason `robots.ts` gives: a metadata route
 * under `output: 'export'` has to be told it is static, and the manifest is a
 * function of constants rather than of any request. It sits at the app root
 * beside `robots.ts` for the reason that file states: a manifest route inside a
 * route group does not emit, silently, and the only layouts this app has are
 * the two the groups hold.
 */
export const dynamic = 'force-static'

/**
 * The web app manifest, naming the icons the site already ships.
 *
 * A browser that offers "install site" reads three things here: the name, the
 * start address, and the icons. The icons are the raster set
 * `scripts/gen-icons.mjs` writes from the one mark `app/icon.svg` draws, plus
 * the SVG itself, and they are named by their stable `public/` URLs rather than
 * by the hashed names the app-directory icon routes emit, because a manifest
 * that named a hash would name a file the next build renames.
 *
 * The two colours are literals, and `opengraph-image.tsx` is the precedent: a
 * manifest is painted once, at build, into a document with no cascade and no
 * `data-pack`, so a token read here would resolve to the base pack's values.
 * `background_color` is the base pack's own ground and `theme_color` is the
 * mark's navy chip, which is the one colour the identity states outside the
 * pack system: the mark signs in navy on every product, in every pack.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}, the NaniSoft design system`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b1220',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
