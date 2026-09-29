'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Input } from '@nanisoft/prism-ui/components/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@nanisoft/prism-ui/components/sheet'

const EDGES = ['right', 'bottom', 'left', 'top'] as const

/**
 * The same panel on all four edges, with the page behind left in place.
 *
 * The switch is the point of the demo: a sheet that covers the whole viewport is
 * a page with a backdrop, and the only way to see that is to change the edge and
 * look at what is left of the page.
 */
export default function SheetDemo() {
  const [side, setSide] = useState<(typeof EDGES)[number]>('right')
  const [query, setQuery] = useState('')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Edge:</span>
        {EDGES.map((edge) => (
          <Button
            key={edge}
            variant={side === edge ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSide(edge)}
          >
            {edge}
          </Button>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        The panel dismisses on an outside press, because a filter the reader
        clicked away from is a filter they will come back to. A decision would
        use an AlertDialog instead, which refuses.
      </p>

      <div>
        <Sheet>
          <SheetTrigger>Open filters</SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow the table to the rows you need. The table behind stays
                visible and stays where it was.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium" htmlFor="sheet-query">
                Search runs
              </label>
              <Input
                id="sheet-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="invoice, nightly"
              />
              <p className="text-muted-foreground text-xs">
                {query === ''
                  ? 'No filter applied.'
                  : `Filtering by ${query}.`}
              </p>
            </div>

            <SheetFooter>
              <SheetClose className="bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md border px-4 text-sm font-medium">
                Clear
              </SheetClose>
              <Button onClick={() => setQuery('')}>Apply</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
