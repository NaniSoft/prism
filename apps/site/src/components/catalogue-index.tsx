import { Suspense } from 'react'

import { buildCatalog, type CatalogKind } from '@nanisoft/prism-ui/catalog'
import { headingSizeClass } from '@nanisoft/prism-ui/components/section'

import { CategoryGrid } from './category-grid'
import { CategoryNav } from './category-nav'
import { DocsShell } from './docs-shell'
import { ItemGrid, type GridItem } from './item-grid'
import { SECTIONS } from '@/lib/catalogue'
import type { FlatNav, NavSection } from '@/lib/nav'

/**
 * A catalogue section index: `/components`, `/blocks`, `/pages`.
 *
 * The full grid is the `Suspense` fallback, so it is in the initial HTML for
 * crawlers and readers without JavaScript. The client island only re-renders
 * the same metadata filtered by `?category=`, which the server cannot read
 * under a static export.
 */
export function CatalogueIndex({
  kind,
  sections,
  flat,
  currentUrl,
}: {
  kind: CatalogKind
  sections: NavSection[]
  flat: FlatNav[]
  currentUrl: string
}) {
  const section = SECTIONS[kind]
  const items: GridItem[] = buildCatalog()
    .filter((item) => item.kind === kind)
    .map((item) => ({
      name: item.name,
      slug: item.slug,
      description: item.description,
      kind: item.kind,
      category: item.category,
      url: `/${section.segment}/${item.slug}`,
    }))

  const categories =
    kind === 'component'
      ? [
          ...new Set(
            items
              .map((item) => item.category)
              .filter(
                (value): value is NonNullable<GridItem['category']> => value !== null,
              ),
          ),
        ].sort()
      : []

  return (
    <DocsShell sections={sections} currentUrl={currentUrl} flat={flat}>
      <header className="flex flex-col gap-3">
        {/*
          The title is the catalogue's own and the count is read from the build,
          so a reader opening this page can see how large it is before deciding
          whether to filter it. The count is in the mono face because it is a
          number about a build rather than a word about the system, which is the
          split the type system already draws elsewhere on the site.
        */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className={`font-semibold tracking-tight ${headingSizeClass('h1')}`}>
            {section.title}
          </h1>
          <span className="text-muted-foreground font-mono text-sm">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <p className="text-muted-foreground max-w-measure text-lg text-pretty">
          {section.description}
        </p>
      </header>

      <CategoryNav segment={section.segment} categories={categories} items={items} />

      <Suspense fallback={<ItemGrid items={items} />}>
        <CategoryGrid items={items} />
      </Suspense>
    </DocsShell>
  )
}
