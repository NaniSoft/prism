'use client'

import { useState } from 'react'

import { AspectRatio } from '@nanisoft/prism-ui/components/aspect-ratio'
import { Button } from '@nanisoft/prism-ui/components/button'

/** Three ratios a caller actually has, rather than a keyword set. */
const RATIOS: { label: string; value: number }[] = [
  { label: 'Wide', value: 21 / 9 },
  { label: 'Video', value: 16 / 9 },
  { label: 'Classic', value: 4 / 3 },
  { label: 'Square', value: 1 },
]

/** A box, a chart and a player: the three things a ratio is for. */
function Panel({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="bg-muted text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1 p-6 text-center">
      <span className="text-foreground text-sm font-medium">{name}</span>
      <span className="text-xs">{detail}</span>
    </div>
  )
}

/** The three ratios worth comparing, and the switch between them. */
export default function AspectRatioDemo() {
  const [wide, setWide] = useState(false)
  const ratio = wide ? RATIOS[0] : RATIOS[2]

  return (
    <div className="flex max-w-page flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <AspectRatio ratio={ratio.value}>
          <Panel name="A screenshot" detail={`${ratio.label}, ${ratio.value.toFixed(2)}`} />
        </AspectRatio>
        <AspectRatio ratio={16 / 9}>
          <Panel name="A video" detail="16 / 9, fixed" />
        </AspectRatio>
      </div>

      <AspectRatio ratio={wide ? 1 : 16 / 9} className="border-border rounded-md border">
        <Panel
          name="One box, two shapes"
          detail={wide ? 'Square' : 'Video, and it holds the row above it in place'}
        />
      </AspectRatio>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setWide((value) => !value)}
        className="self-start"
      >
        {wide ? 'Go back to 4 / 3' : 'Widen the first box to 21 / 9'}
      </Button>
    </div>
  )
}
