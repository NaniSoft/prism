'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@nanisoft/prism-ui/components/drawer'
import { Input } from '@nanisoft/prism-ui/components/input'

const EDGES = ['bottom', 'left', 'right'] as const

/**
 * The same task panel on all three edges, and the edge is the point.
 *
 * The first two rows of each panel are the whole demonstration: a reader who can
 * throw the panel away gets a Drawer, and a reader who dismisses it gets a Sheet.
 * The third is the reason the panel keeps a header and a footer above and below
 * its body, because the controls that commit the task stay reachable after a long
 * list has been scrolled.
 */
export default function DrawerDemo() {
  const [edge, setEdge] = useState<(typeof EDGES)[number]>('bottom')
  const [query, setQuery] = useState('')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Edge:</span>
        {EDGES.map((side) => (
          <Button
            key={side}
            variant={edge === side ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEdge(side)}
          >
            {side}
          </Button>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        Drag the panel back towards the edge it came from and it closes. The grip
        is decorative: Escape does the same thing, and so does the control at the
        top right, and a reader who cannot drag is not left without a way out.
      </p>

      <div>
        <Drawer>
          <DrawerTrigger>Adjust filters</DrawerTrigger>
          <DrawerContent side={edge} closeLabel="Close the filters">
            <DrawerHeader>
              <DrawerTitle>Adjust filters</DrawerTitle>
              <DrawerDescription>
                Narrow the table to the rows you need. The page behind stays where
                it is, and the panel can be pushed away without changing it.
              </DrawerDescription>
            </DrawerHeader>

            <DrawerBody>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium" htmlFor="drawer-query">
                  Search runs
                </label>
                <Input
                  id="drawer-query"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="invoice, nightly"
                />
                <p className="text-muted-foreground text-xs">
                  {query === ''
                    ? 'No filter applied.'
                    : `Filtering by ${query}. Nothing has been applied yet.`}
                </p>
              </div>
            </DrawerBody>

            <DrawerFooter>
              <DrawerClose
                className="bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md border px-4 text-sm font-medium"
                onClick={() => setQuery('')}
              >
                Clear
              </DrawerClose>
              <DrawerClose>Apply</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}