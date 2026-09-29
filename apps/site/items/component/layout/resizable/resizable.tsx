'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from '@nanisoft/prism-ui/components/resizable'

const RUNS = ['Nightly reconciliation', 'Invoice export', 'Backfill attempt', 'Usage rollup']

/**
 * A split the reader drives, with the number reported underneath.
 *
 * The reported number is the whole of the persistence story: the Component hands
 * the position to the caller and keeps nothing, so a product that wants a
 * reader's split to survive a reload has to store it. The reset button stands in
 * for the store: it puts back the value a real product would have read out.
 */
export default function ResizableDemo() {
  const [position, setPosition] = useState(35)
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={orientation === 'horizontal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setOrientation('horizontal')}
        >
          Side by side
        </Button>
        <Button
          variant={orientation === 'vertical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setOrientation('vertical')}
        >
          Stacked
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPosition(35)}>
          Forget the split
        </Button>
        <span className="text-muted-foreground text-sm">
          Divider at {Math.round(position)} percent
        </span>
      </div>

      <p className="text-muted-foreground text-sm">
        Drag the divider, or focus it and use the arrow keys. Home and End take it
        to either end. The Component stores nothing, so the number above is the
        caller state and the only thing a reload would lose.
      </p>

      <Resizable
        label="Runs and details"
        orientation={orientation}
        className="border-border h-80 overflow-hidden rounded-lg border"
        position={position}
        onPositionChange={setPosition}
      >
        <ResizablePanel
          size={position}
          className="bg-muted/40 p-4"
        >
          <p className="text-sm font-medium">Runs</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {RUNS.map((run) => (
              <li key={run} className="text-muted-foreground truncate">
                {run}
              </li>
            ))}
          </ul>
        </ResizablePanel>

        <ResizableHandle label="Resize the run list" />

        <ResizablePanel size={100 - position} className="p-4">
          <p className="text-sm font-medium">Nightly reconciliation</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Twelve runs, four of them still going. The detail pane takes whatever
            the list leaves it, which is the point of a divider the reader can
            move.
          </p>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}
