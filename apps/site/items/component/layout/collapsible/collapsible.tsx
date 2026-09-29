'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@nanisoft/prism-ui/components/collapsible'

/**
 * Three independent sections, with the state of each reported underneath.
 *
 * Three of them is the point: a reader can have all three open at once, which is
 * what an Accordion forbids and what a settings page usually wants.
 */
export default function CollapsibleDemo() {
  const [open, setOpen] = useState<string[]>(['billing'])

  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id) ? current.filter((each) => each !== id) : [...current, id],
    )

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Each section keeps its own state, so opening one closes nothing. The
        trigger stays in the document either way, which is the way back for a
        reader who closes a section.
      </p>

      <div className="divide-border divide-y rounded-lg border px-4">
        <Collapsible
          id="billing"
          open={open.includes('billing')}
          onOpenChange={() => toggle('billing')}
        >
          <CollapsibleTrigger>Advanced billing</CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-muted-foreground pb-4 text-sm">
              Usage is billed per seat, at the end of the month. Seats added
              mid-month are prorated to the day.
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          id="retention"
          open={open.includes('retention')}
          onOpenChange={() => toggle('retention')}
        >
          <CollapsibleTrigger>Data retention</CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-muted-foreground pb-4 text-sm">
              Run logs are kept for thirty days and then deleted. Exports are kept
              until you remove them.
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          id="raw"
          open={open.includes('raw')}
          onOpenChange={() => toggle('raw')}
        >
          <CollapsibleTrigger>Show raw events</CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-muted-foreground pb-4 text-sm">
              Every run emits a start, a tick and a finish. The tick carries no
              payload and is safe to ignore.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(['billing', 'retention', 'raw'])}>
          Open all three
        </Button>
        <Button variant="outline" onClick={() => setOpen([])}>
          Close all three
        </Button>
        <span className="text-muted-foreground text-sm">
          {open.length === 0
            ? 'Nothing open.'
            : `${open.length} open, none of them at anyone else’s expense.`}
        </span>
      </div>
    </div>
  )
}
