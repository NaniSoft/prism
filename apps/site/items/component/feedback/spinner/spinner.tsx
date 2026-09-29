'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Spinner } from '@nanisoft/prism-ui/components/spinner'

/**
 * The three authored sizes beside the three questions they answer.
 *
 * The switchable part is which claim the spinner is making, because a Spinner
 * showing a Progress's information or a Skeleton's job is the mistake this
 * Component exists to prevent. The three sizes are here so a reader can see
 * that they are three steps rather than something a caller may set.
 */
const CASES = [
  {
    key: 'invoices',
    label: 'Loading invoices',
    heading: 'Nothing is known yet',
    note: 'A filter came back empty-handed and nothing says how long it will take.',
    size: 'default' as const,
  },
  {
    key: 'saving',
    label: 'Saving',
    heading: 'Beside words the reader can already see',
    note: 'The sentence is the announcement. The ring is the confirmation.',
    size: 'sm' as const,
  },
  {
    key: 'workspace',
    label: 'Preparing your workspace',
    heading: 'Alone in a region of its own',
    note: 'The largest step, for a panel whose contents are arriving for the first time.',
    size: 'lg' as const,
  },
]

/** One Spinner at a time, switchable, so the difference is visible. */
export default function SpinnerDemo() {
  const [active, setActive] = useState(CASES[0]?.key ?? 'invoices')
  const current = CASES.find((entry) => entry.key === active) ?? CASES[0]

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        A Spinner says work is happening and nothing about how much of it is
        left. It is not a Progress, which reports a position, and not a
        Skeleton, which stands in for the shape of what is coming.
      </p>

      {/* `Button` and not a bare `button`, because `variant` and `size` are
          `Button`'s props and a bare element would render them as unknown
          attributes on the DOM node. */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a case">
        {CASES.map((entry) => (
          <Button
            key={entry.key}
            type="button"
            onClick={() => setActive(entry.key)}
            variant={active === entry.key ? 'default' : 'outline'}
            size="sm"
            aria-pressed={active === entry.key}
          >
            {entry.heading}
          </Button>
        ))}
      </div>

      <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-6">
        {current ? <Spinner label={current.label} size={current.size} /> : null}
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium">{current?.heading}</span>
          <span className="text-muted-foreground text-sm">{current?.note}</span>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        The ring is aria-hidden, so a screen reader is told what is busy exactly
        once, in the words above rather than in a description of a circle. The
        label is required: an unnamed busy indicator is an animation, and an
        animation is nothing to a reader who cannot see it.
      </p>
    </div>
  )
}
