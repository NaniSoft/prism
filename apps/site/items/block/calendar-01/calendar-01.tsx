'use client'

import { useState } from 'react'

import { Calendar01, type CalendarItem } from '@nanisoft/prism-ui/blocks/calendar-01'
import { Button } from '@nanisoft/prism-ui/components/button'

/**
 * A month with a day that is over its cap, so the overflow line and the cap are
 * both visible, and the same month held in the caller's own state so the paging
 * and the per-item reschedule are wired up.
 *
 * The ninth of October has five items against a cap of three, which is the case
 * `maxPerDay` and `overflowLabel` exist for: a month grid with five entries on one
 * day is a month nobody can read, and the honest answer is to cap and say how many
 * are behind rather than to shrink the text until it is illegible. The overflow
 * line is always drawn and its words are the caller's, because a day that looks
 * complete and is not is the one failure a calendar may not have.
 *
 * The grid is the published `mini-calendar`, and the Demo passes the month in as a
 * controlled value. That is the arrangement the Block's JSDoc argues: the Block
 * holds the month rather than reading it back out of the grid, because the day list
 * beside it is filtered by the same month and two sources of truth for one month
 * is a list and a grid that disagree.
 *
 * Each item that is not a link carries a `handle`, and the Demo fills it with its
 * own control that moves the item a day later. That is the whole of the move: the
 * Block places the node and owns no drag, no drop and no move, so the Demo's
 * handler is the caller's own write to the caller's own array, exactly as a real
 * consumer wires it to their schedule's store.
 */
const SEED: CalendarItem[] = [
  { id: 'a', date: '2026-10-02', label: 'Access review with the data owner' },
  { id: 'b', date: '2026-10-05', label: 'Ship the group mapping fix' },
  { id: 'c', date: '2026-10-05', label: 'Reconcile September invoices', state: 'warning', stateLabel: 'Blocked on billing' },
  { id: 'd', date: '2026-10-05', label: 'Draft the run rejection notice' },
  { id: 'e', date: '2026-10-05', label: 'Answer the two access questions' },
  { id: 'f', date: '2026-10-05', label: 'Rotate the signing key' },
  {
    id: 'g',
    date: '2026-10-09',
    label: 'Export with stable identifiers',
    state: 'info',
    stateLabel: 'Scheduled',
    href: '/requests/203',
    hrefLabel: 'Open the request',
  },
  {
    id: 'h',
    date: '2026-10-16',
    label: 'Warehouse incident review',
    state: 'destructive',
    stateLabel: 'Incident open',
  },
  { id: 'i', date: '2026-10-23', label: 'Quarterly access review', state: 'success', stateLabel: 'Signed off' },
]

/** The same day, one along, in the `YYYY-MM-DD` form the Block reads as a local day. */
function dayAfter(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(year, month - 1, day + 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

export default function Calendar01Demo() {
  const [month, setMonth] = useState(new Date(2026, 9, 1))
  const [items, setItems] = useState<CalendarItem[]>(SEED)
  const [picked, setPicked] = useState<string | null>(null)
  const subject = items.find((item) => item.id === picked)?.label

  const withHandles = items.map((item) =>
    item.href === undefined
      ? {
          ...item,
          handle: (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Move ${item.label} a day later`}
              onClick={() =>
                setItems((current) =>
                  current.map((entry) =>
                    entry.id === item.id ? { ...entry, date: dayAfter(entry.date) } : entry,
                  ),
                )
              }
            >
              Later
            </Button>
          ),
        }
      : item,
  )

  return (
    <>
      <Calendar01
        headingLevel="h3"
        eyebrow="Nexus"
        title="October"
        description="The grid is the published mini-calendar, so the paging, the roving tab stop and the weekday headings are that Component's rather than a second implementation. The items are a day list beside it, grouped by the day they fall on, and each item's move is the caller's own control in its handle."
        month={month}
        onMonthChange={setMonth}
        locale="en-GB"
        weekStartsOn={1}
        previousLabel="The month before"
        nextLabel="The month after"
        label="Scheduled work, by month"
        items={withHandles}
        onSelect={setPicked}
        maxPerDay={3}
        overflowLabel={(count: number) => `${count} more on this day`}
        empty="Nothing is scheduled this month. The empty list already says so, so this sentence is optional."
      />

      {subject === undefined ? null : (
        <p className="text-muted-foreground mt-4 text-sm">
          Picked <strong>{subject}</strong>. The day buttons in the grid are the grid&apos;s
          own, and this Block does not claim them: a day and an item are two different
          things and one callback cannot be both.
        </p>
      )}
    </>
  )
}
