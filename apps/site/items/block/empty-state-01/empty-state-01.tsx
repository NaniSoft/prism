'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  EmptyState01,
  type EmptyReason,
} from '@nanisoft/prism-ui/blocks/empty-state-01'

/**
 * The three reasons, switchable, so the difference is visible rather than stated.
 *
 * The switcher is the Demo. An empty state looks identical in all three cases
 * until you read the words and the button, so a Demo that renders one instance
 * has shown the frame and nothing else. Each case here carries the action its
 * reason calls for, and the third carries none at all, because that is the case
 * a consumer gets most wrong.
 */
const CASES = [
  {
    key: 'first-run' as const,
    label: 'First run',
    title: 'No invoices yet',
    body: 'An invoice is what you send when you need to be paid. There is one to send.',
    actionLabel: 'Create your first invoice',
    icon: 'file-plus',
  },
  {
    key: 'no-match' as const,
    label: 'No match',
    title: 'No invoices match',
    body: 'Three filters are active. Clearing them brings back everything you can see.',
    actionLabel: 'Clear the filters',
    icon: 'search-x',
  },
  {
    key: 'not-permitted' as const,
    label: 'Not permitted',
    title: 'Billing is not on your plan',
    body: 'Ask an owner of this workspace to enable it.',
    actionLabel: undefined,
    icon: 'lock',
  },
] as const

/** The three marks, drawn here rather than chosen by the Block. */
const MARKS: Record<string, React.ReactNode> = {
  'file-plus': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-10">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11v5M9.5 13.5h5" strokeLinecap="round" />
    </svg>
  ),
  'search-x': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-10">
      <circle cx="11" cy="11" r="6" strokeLinecap="round" />
      <path d="m20 20-4.35-4.35M9 9l4 4M13 9l-4 4" strokeLinecap="round" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-10">
      <rect x="4" y="10" width="16" height="11" rx="2" strokeLinecap="round" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

/** One empty state at a time, switchable by reason. */
export default function EmptyState01Demo() {
  const [reason, setReason] = useState<EmptyReason>('first-run')
  const [count, setCount] = useState(0)

  const current = CASES.find((entry) => entry.key === reason) ?? CASES[0]

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        The three reasons a region can be empty are three different situations,
        not three ways of saying the same one. Each wants different words and a
        different action, so the reason is a required prop rather than a guess.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a reason">
        {CASES.map((entry) => (
          <Button
            key={entry.key}
            type="button"
            variant={reason === entry.key ? 'default' : 'outline'}
            size="sm"
            aria-pressed={reason === entry.key}
            onClick={() => setReason(entry.key)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      {current ? (
        <EmptyState01
          reason={current.key}
          title={current.title}
          body={current.body}
          icon={MARKS[current.icon]}
          actionLabel={current.actionLabel}
          onAction={
            current.actionLabel === undefined ? undefined : () => setCount((n) => n + 1)
          }
        />
      ) : null}

      <p className="text-muted-foreground text-sm" role="status">
        {current?.actionLabel === undefined
          ? 'No action, because a permission boundary has no next step.'
          : `The action was taken ${count} time${count === 1 ? '' : 's'}.`}
      </p>

      <p className="text-muted-foreground text-sm">
        The third case is the one that is usually got wrong. A region a reader
        cannot see through has nothing for them to do, so it gets no button; a
        Block that offered to create something there would be inviting a reader
        to make a second copy of something they already have and cannot see.
      </p>
    </div>
  )
}
