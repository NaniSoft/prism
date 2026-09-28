'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { RunConsole01 } from '@nanisoft/prism-ui/blocks/run-console-01'
import type { TimelineEntry } from '@nanisoft/prism-ui/components/timeline'

/**
 * The same run in three states, which is the only way the Block's one prop is
 * visible.
 *
 * The first console is a run that has finished, so it carries no live region at
 * all. The second is a run still arriving, so its region is present and busy and
 * an append is announced. The third is a run with no budget, which is the case
 * that shows why the budget is optional: a local run has no ceiling to be near,
 * and an empty meter would be a measurement of nothing.
 */
const FINISHED: TimelineEntry[] = [
  { id: 'plan', title: 'Plan the change', duration: 900, state: 'done' },
  { id: 'read', title: 'Read the feed', duration: 4200, state: 'done', children: '1,284 events, 3 sources' },
  { id: 'edit', title: 'Edit source', duration: 1200, state: 'done' },
  { id: 'verify', title: 'Run the checks', duration: 2600, state: 'done' },
  { id: 'report', title: 'Write the summary', duration: 800, state: 'done' },
]

const ARRIVING: TimelineEntry[] = [
  { id: 'plan', title: 'Plan the change', duration: 900, state: 'done' },
  { id: 'read', title: 'Read the feed', duration: 4200, state: 'done' },
  { id: 'edit', title: 'Edit source', duration: 1200, state: 'done' },
  { id: 'verify', title: 'Run the checks', state: 'running' },
  { id: 'report', title: 'Write the summary' },
]

const COPY = {
  budgetLabel: 'Budget spent',
  budgetValue: (value: number, max: number) => `${value} of ${max} credits`,
  stepsLabel: 'Run steps',
  title: 'Run',
  waiting: 'Waiting for the first step',
}

/** Three states of one surface. */
export default function RunConsole01Demo() {
  const [arriving, setArriving] = useState(false)

  return (
    <div className="flex max-w-measure-wide flex-col gap-8">
      <RunConsole01
        title="Nightly reconcile"
        detail="Finished, 9.7 seconds"
        copy={COPY}
        steps={FINISHED}
        budget={{
          value: 4200,
          max: 5000,
          thresholds: [{ at: 4500, tone: 'warning' }],
        }}
      />

      <RunConsole01
        title="Nightly reconcile"
        detail="Still arriving"
        streaming={arriving}
        copy={COPY}
        steps={arriving ? ARRIVING : FINISHED}
        budget={{
          value: 4820,
          max: 5000,
          thresholds: [
            { at: 4500, tone: 'warning' },
            { at: 4900, tone: 'destructive' },
          ],
        }}
      />

      <RunConsole01
        title="Local dry run"
        detail="No budget: a local run has no ceiling to be near"
        copy={COPY}
        steps={FINISHED.slice(0, 2)}
      />

      <Button variant="outline" onClick={() => setArriving((value) => !value)}>
        {arriving ? 'Mark the run finished' : 'Mark the run still arriving'}
      </Button>
    </div>
  )
}
