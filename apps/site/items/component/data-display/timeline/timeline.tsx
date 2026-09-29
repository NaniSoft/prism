'use client'

import { useState } from 'react'

import { Timeline, type TimelineEntry } from '@nanisoft/prism-ui/components/timeline'

/**
 * A run, and the three things worth showing about it.
 *
 * The bars are the reason this surface exists: a reader who wants to know why a
 * run took five seconds can see that the read step took four of them, without
 * adding up a column of numbers. The last step reports no duration, because a
 * run's opening event has no length and a bar beside it would claim the step was
 * instant rather than that its duration is meaningless.
 */
const INITIAL: TimelineEntry[] = [
  { id: 'plan', title: 'Plan the change', duration: 900, state: 'done' },
  {
    id: 'read',
    title: 'Read the feed',
    duration: 4200,
    state: 'done',
    children: '1,284 events, 3 sources',
  },
  { id: 'edit', title: 'Edit source', duration: 1200, state: 'done' },
  { id: 'verify', title: 'Run the checks', duration: 2600, state: 'done' },
  { id: 'report', title: 'Write the summary' },
]

/** The run, with one step still running so the states are visible rather than described. */
export default function TimelineDemo() {
  const [running, setRunning] = useState(false)

  const steps: TimelineEntry[] = running
    ? [
        ...INITIAL.slice(0, 4),
        { id: 'report', title: 'Write the summary', state: 'running' },
        { id: 'close', title: 'Close the run' },
      ]
    : INITIAL

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <Timeline entries={steps} label="Run steps" empty="Waiting for the first event" />
      <div>
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
        >
          {running ? 'Show the finished run' : 'Show the run still going'}
        </button>
      </div>
    </div>
  )
}
