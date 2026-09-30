'use client'

import { usePathname } from 'next/navigation'
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar'

import { COPY, DEFAULT_MODE, DEFAULT_PACK, NAV, SITES } from '@/lib/bar'

/**
 * The site bar, and the one reason this file exists.
 *
 * **A root layout is not told which route it is rendering, and this site's bar
 * lives in the root layout.** A server render knows the route it is serving; a
 * layout is rendered once and handed no pathname, so a header declared there cannot
 * mark the reader's place from the server. The four consumer sites solved this by
 * moving the bar out of the layout and into a component each page renders, which
 * keeps the whole bar a server Component. That is the better arrangement and this
 * site cannot take it without moving the bar into four route files and the
 * documentation shell, so it takes the other one: a client wrapper that reads the
 * pathname and hands it to the Block as `currentPath`.
 *
 * The cost is stated rather than hidden. This wrapper is a client Component, so the
 * bar's lockup and its navigation are rendered on the server and their markup is
 * still server rendered, but the bar as a whole now sits inside a client boundary
 * and the Sections array crosses it on every page. The array is nine small objects
 * and the boundary is the price of a bar that can say where the reader is. A site
 * that can render the bar per page should, and should not copy this file.
 *
 * **The search index is this site's own, already built.** `app/api/search/route.ts`
 * emits it as a static file from the same content tree every page is generated
 * from, so the search a reader gets here is over the same routes the navigation and
 * the sitemap are, and there is no second tree to keep in step.
 */
export function SiteBar() {
  const pathname = usePathname()

  return (
    <SiteNavbar
      product={{ id: 'prism', name: 'Prism' }}
      defaultPack={DEFAULT_PACK}
      defaultMode={DEFAULT_MODE}
      navLabel={COPY.nav}
      currentPath={pathname}
      nav={NAV}
      sitesLabel={COPY.sites}
      currentSiteId="prism"
      sites={SITES}
      search={{
        indexUrl: '/api/search',
        label: COPY.search,
        hint: COPY.searchHint,
        messages: {
          close: COPY.searchClose,
          loading: COPY.searchLoading,
          failed: COPY.searchFailed,
          empty: COPY.searchEmpty,
          one: COPY.searchOne,
          other: COPY.searchOther,
        },
      }}
      theme={{ label: COPY.theme }}
      mode={{ lightLabel: COPY.toDark, darkLabel: COPY.toLight }}
      mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
    />
  )
}
