import type { TOCItemType } from 'fumadocs-core/toc'
import type { ReactNode } from 'react'

import type { FlatNav, NavSection } from '@/lib/nav'

import { Pager } from './pager'
import { SectionNav } from './section-nav'
import { TableOfContents } from './table-of-contents'

/**
 * The documentation frame: section navigation, the article, the table of
 * contents, and prev/next.
 *
 * It is a site component, not a package export. It encodes this site's page
 * tree, its search URL and its theme defaults, so shipping it would hand a
 * consumer our information architecture rather than a Component, Block or Page.
 * It composes Prism exports and the semantic utilities the same token `@theme`
 * emits, which is what lets the site be built with the system it documents.
 *
 * **The left rail is on the `sidebar` token family, and that is the load-bearing
 * decision in this file.** The token package authors a whole `sidebar` surface
 * (`sidebar`, `sidebar-foreground`, `sidebar-border`, `sidebar-accent`,
 * `sidebar-accent-foreground`, `sidebar-primary`, `sidebar-primary-foreground`)
 * and gates three rows of the contrast table against `sidebar` specifically,
 * which is a surface that exists to carry navigation. The site was rendering its
 * navigation on the page ground in `muted-foreground`, so those tokens were
 * authored, contrast-checked and then used by nothing. A design system whose own
 * reserved surface goes unused is why a site built with it reads as generic: the
 * system has a place for the thing and the thing is not in it.
 *
 * The rail bleeds one gutter to the left of the container (`-ml-6` with `pl-6`),
 * so the tint reaches the container's edge and the links inside stay on the page
 * measure. Without the bleed the rail reads as a floating panel with a border
 * around it, which is a card, and a sidebar is not a card.
 *
 * The rail scrolls itself rather than scrolling away. `sticky top-14` pins it
 * under the header, whose height is `h-14`, and the `max-h` is that height
 * subtracted from the viewport, so a reader on a laptop sees the whole of the
 * current Section without the rail's own scrollbar appearing on a page short
 * enough not to need one. `overscroll-contain` stops a rail that has reached its
 * end from handing the gesture to the page, which is the same scroll-chaining
 * that makes a two-pane layout feel loose.
 */
export function DocsShell({
  sections,
  currentUrl,
  flat,
  toc,
  children,
}: {
  sections: NavSection[]
  currentUrl: string
  flat: FlatNav[]
  toc?: TOCItemType[]
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-page gap-10 px-6">
      <aside className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 border-r lg:-ml-6 lg:block lg:pl-6">
        <div className="sticky top-14 flex max-h-[calc(100dvh-3.5rem)] flex-col gap-8 overflow-y-auto overscroll-contain py-10 pr-6">
          <SectionNav sections={sections} currentUrl={currentUrl} />
        </div>
      </aside>

      <div className="min-w-0 flex-1 py-10">
        <article className="flex flex-col gap-8">{children}</article>
        <Pager flat={flat} currentUrl={currentUrl} />
      </div>

      {toc && toc.length ? (
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-14 flex max-h-[calc(100dvh-3.5rem)] flex-col gap-8 overflow-y-auto overscroll-contain py-10">
            <TableOfContents toc={toc} />
          </div>
        </aside>
      ) : null}
    </div>
  )
}
