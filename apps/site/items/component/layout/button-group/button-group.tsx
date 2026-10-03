'use client'

import { useState } from 'react'

import { ButtonGroup } from '@nanisoft/prism-ui/components/button-group'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Separator } from '@nanisoft/prism-ui/components/separator'

/** Three joined sets, and the two things worth comparing. */
const ALIGNMENTS = ['Left', 'Centre', 'Right']
const ZOOMS = ['Out', 'Reset', 'In']

/** The joined group, and the two arrangements worth seeing. */
export default function ButtonGroupDemo() {
  const [alignment, setAlignment] = useState('Left')
  const [vertical, setVertical] = useState(false)

  return (
    <div className="flex max-w-page flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Three alternatives. The ring is drawn once around the group, so tabbing
          along it moves one indicator rather than three.
        </p>
        <ButtonGroup
          label="Text alignment"
          orientation={vertical ? 'vertical' : 'horizontal'}
        >
          {ALIGNMENTS.map((value) => (
            <Button
              key={value}
              variant="outline"
              aria-pressed={alignment === value}
              className={alignment === value ? 'bg-accent text-accent-foreground' : ''}
              onClick={() => setAlignment(value)}
            >
              {value}
            </Button>
          ))}
        </ButtonGroup>
        <p className="text-muted-foreground text-sm tabular-nums">Aligned {alignment}</p>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          The same set as loose buttons beside it, which is what a row looks like
          without the join.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {ZOOMS.map((value) => (
            <Button key={value} variant="outline" size="sm">
              {value}
            </Button>
          ))}
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost" size="sm">
            Fit
          </Button>
        </div>
      </section>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setVertical((value) => !value)}
        className="self-start"
      >
        {vertical ? 'Join them horizontally' : 'Join them vertically'}
      </Button>
    </div>
  )
}
