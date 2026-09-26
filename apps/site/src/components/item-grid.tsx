import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { CatalogKind, ComponentCategory } from '@nanisoft/prism-ui/catalog'

export type GridItem = {
  name: string
  slug: string
  description: string
  kind: CatalogKind
  category: ComponentCategory | null
  url: string
}

const KIND_LABEL: Record<CatalogKind, string> = {
  component: 'Component',
  block: 'Block',
  page: 'Page',
}

/**
 * The presentational grid of catalogue items.
 *
 * It is deliberately plain and free of hooks so both a Server Component and the
 * client category island can render it. The section index uses it as the
 * `Suspense` fallback, which is what puts the full list in the initial HTML for
 * crawlers and readers without JavaScript.
 */
export function ItemGrid({ items, empty }: { items: GridItem[]; empty?: string }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {empty ?? 'No items in this section yet.'}
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.url}
          className="border-border bg-card flex flex-col gap-3 rounded-xl border p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium tracking-tight">{item.name}</h2>
            <span className="text-muted-foreground shrink-0 font-mono text-[10px] uppercase">
              {item.category ?? KIND_LABEL[item.kind]}
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-pretty">{item.description}</p>
          <Link
            href={item.url}
            className="text-foreground mt-auto inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            View {item.name}
            <ArrowRight className="size-3.5" />
          </Link>
        </article>
      ))}
    </div>
  )
}
