'use client'

import { useState } from 'react'

import { ScrollArea } from '@nanisoft/prism-ui/components/scroll-area'
import { Button } from '@nanisoft/prism-ui/components/button'

/**
 * A long output, and the two states worth seeing.
 *
 * The overflow is the point, and the reason the Demo has one control is that a
 * ScrollArea which has nothing to scroll draws no bar at all. A reader who has
 * learned that a bar is always there will look for it on a region that has nothing
 * past the edge, and the honest behaviour is for the bar to be absent until there
 * is something to reach.
 */
const LINES = Array.from({ length: 40 }, (_, index) => ({
  id: `line-${index + 1}`,
  text: `  ${String(index + 1).padStart(3, ' ')}  ${index % 4 === 3 ? 'WARN ' : 'INFO '}  collector.${
    ['open', 'read', 'verify', 'close'][index % 4]
  }(batch-${Math.floor(index / 8)})`,
}))

/** Enough lines to overflow the region and not enough to need one. */
const SHORT = LINES.slice(0, 6)

/** The region, and the switch between one that overflows and one that does not. */
export default function ScrollAreaDemo() {
  const [full, setFull] = useState(true)
  const [frame, setFrame] = useState<'card' | 'plain'>('card')

  return (
    <div className="flex max-w-measure-wide flex-col gap-4">
      <ScrollArea
        label="Collector run output"
        className={
          frame === 'card' ? 'bg-card h-56 rounded-md border p-4' : 'h-56'
        }
      >
        <pre className="font-mono text-xs leading-relaxed">
          {(full ? LINES : SHORT).map((line) => line.text).join('\n')}
        </pre>
      </ScrollArea>

      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm" variant="outline" onClick={() => setFull((value) => !value)}>
          {full ? 'Shorten the output' : 'Fill the region'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setFrame((value) => (value === 'card' ? 'plain' : 'card'))}>
          {frame === 'card' ? 'Put it on the page ground' : 'Put it on a card'}
        </Button>
      </div>
    </div>
  )
}
