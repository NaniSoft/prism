import { Suspense } from 'react'

import { buildCatalog, type CatalogKind } from '@nanisoft/prism-ui/catalog'

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
        <h1 className="text-3xl font-semibold tracking-tight">{section.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg text-pretty">{section.description}</p>
      </header>

      <CategoryNav segment={section.segment} categories={categories} />

      <Suspense fallback={<ItemGrid items={items} />}>
        <CategoryGrid items={items} />
      </Suspense>
    </DocsShell>
  )
}
