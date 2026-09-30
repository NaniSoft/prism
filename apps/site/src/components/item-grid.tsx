import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { CatalogKind, ComponentCategory } from '@nanisoft/prism-ui/catalog'

import { kindLabel } from '@/lib/kinds'

export type GridItem = {
  name: string
  slug: string
  description: string
  kind: CatalogKind
  category: ComponentCategory | null
  url: string
}

/**
 * The presentational list of catalogue items.
 *
 * It is deliberately plain and free of hooks so both a Server Component and the
 * client category island can render it. The section index uses it as the
 * `Suspense` fallback, which is what puts the full list in the initial HTML for
 * crawlers and readers without JavaScript.
 *
 * **Rows rather than cards, and the count is the reason.** A Component index is
 * twenty-eight items today and grows with every release. As cards that is
 * twenty-eight boxes, and the reader's eye lands on the boxes rather than on the
 * names, which is the wrong thing to land on for a page whose whole job is
 * finding a name. As rows, the page reads as the list it is, one item is one line
 * of type plus one of description, and adding a Component adds a line rather
 * than another tile in a grid the reader has to scan past.
 *
 * **The whole row is the link, and the row's own text is its name.** A card with
 * a "View X" link inside it asks a reader to aim at the link rather than at the
 * item, and it puts the item's name and its destination in two separate places
 * that can disagree. One anchor per row, with the name as its text and the
 * description beside it, is one target and one accessible name. The arrow marks
 * direction and is `aria-hidden`, because the link's own text already says where
 * it goes.
 *
 * The hairline is under every row rather than between rows, for the reason
 * `Principles` gives: with two columns the border on the first item of each column
 * draws one continuous rule under the filter row, and the second item of each
 * column draws the line between the two rows, so the count can change without the
 * rule moving.
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
    <ul className="grid gap-x-10 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.url} className="border-border border-t">
          <Link
            href={item.url}
            className="group focus-visible:border-ring focus-visible:ring-ring hover:bg-accent/60 -mx-3 flex flex-col gap-1 rounded-md px-3 py-4 focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-medium tracking-tight">{item.name}</span>
              <span className="text-muted-foreground shrink-0 font-mono text-[10px] uppercase">
                {item.category ?? kindLabel(item.kind)}
              </span>
            </span>
            <span className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground text-pretty text-sm">{item.description}</span>
              <ArrowRight
                aria-hidden
                className="motion-safe:transition-transform group-focus-visible:opacity-100 group-hover:translate-x-0.5 group-hover:opacity-100 mt-1 size-3.5 shrink-0 opacity-0"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
