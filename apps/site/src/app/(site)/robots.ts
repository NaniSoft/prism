import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site'

/**
 * Generated once, at build.
 *
 * Under `output: 'export'` a metadata route has to be told it is static, and
 * without this the build fails with a message about `dynamic` rather than about
 * the file. It is also true rather than a formality: the answer is a function of
 * one constant, so there is no request that could change it.
 */
export const dynamic = 'force-static'

/**
 * `robots.txt`, generated rather than written into `public/`.
 *
 * **It is generated because the one thing it has to be right about is the host,
 * and the host is a constant rather than a habit.** A `public/robots.txt` is a
 * file nobody opens when the domain moves, and the one line in it that matters is
 * `Sitemap:`.
 *
 * The Sitemap's address is the site's own `/sitemap.xml`, served from the export
 * by the same `sitemap.ts` that writes it, so the two cannot name different
 * things. There is no `Disallow` beyond the mirrored Markdown: a mirror is a page
 * of this site at a different extension, it carries its own directive in the
 * Worker that serves it, and a rule here would be a second place that has to know
 * about mirrors.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL.href}sitemap.xml`,
    host: SITE_URL.origin,
  }
}
