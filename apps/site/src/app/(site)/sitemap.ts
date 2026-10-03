import type { MetadataRoute } from 'next'

import { flattenNav, projectNav } from '@/lib/nav'
import { SITE_URL } from '@/lib/site'
import { source } from '@/lib/source'

/**
 * Generated once, at build, for the reason `robots.ts` gives: a metadata route
 * under `output: 'export'` has to be told it is static, and the sitemap is a
 * function of the content tree rather than of any request.
 */
export const dynamic = 'force-static'

/**
 * The sitemap, generated from the one navigation.
 *
 * **Every route the site publishes is in it, once, and the list is the navigation
 * rather than a directory walk.** `flattenNav(projectNav(source.getPageTree()))` is
 * the same projection the sidebar renders, so a page a reader can reach from the
 * sidebar is a page in the sitemap, and a page that reaches neither is the
 * failure `projectNav` throws on. A sitemap built by globbing the content
 * directory would omit the virtual catalogue pages, which are most of the site
 * and have no file of their own.
 *
 * **One entry per page, with no per-category duplicates.** The catalogue index is
 * one address and the filter's query parameter is a view of it rather than a page
 * of its own, which is the same thing each page's canonical says. A sitemap that
 * listed `?category=` variants would tell a crawler that one page lives at many
 * addresses, which is the opposite of what a canonical is for.
 *
 * **No `lastModified`, and no `changeFrequency` or `priority` either.** None of
 * the three is a fact this repository holds. `lastmod` is the one a reader would
 * expect and the one worth refusing: the page schemas strip it from frontmatter,
 * so nothing records when a page was last edited, and the honest substitute, a
 * content file's modification time, is the checkout time on a CI runner and the
 * clone time on a laptop, so publishing it would put a build machine's clock into
 * a document as the date of an author's edit. The other two are advisory hints no
 * crawler is required to act on, and writing them down would be a claim about how
 * often a maintainer edits this repository, which nothing here knows. A sitemap
 * of the routes that exist is the part that is true, and it is the part a crawler
 * needs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = flattenNav(projectNav(source.getPageTree()))

  return routes.map((entry) => ({ url: new URL(entry.url, SITE_URL).href }))
}
