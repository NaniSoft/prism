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
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-6 py-10">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-20">
          <SectionNav sections={sections} currentUrl={currentUrl} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <article className="flex flex-col gap-8">{children}</article>
        <Pager flat={flat} currentUrl={currentUrl} />
      </div>

      {toc && toc.length ? (
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-20">
            <TableOfContents toc={toc} />
          </div>
        </aside>
      ) : null}
    </div>
  )
}
