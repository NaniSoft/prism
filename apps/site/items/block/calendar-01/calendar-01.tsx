'use client'

import { useState } from 'react'

import { Calendar01, type CalendarItem } from '@nanisoft/prism-ui/blocks/calendar-01'

/**
 * A month with a day that is over its cap, so the overflow line and the cap are
 * both visible, and a second copy of the same month held in the caller's own state
 * so the paging is wired up.
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
 */
const ITEMS: CalendarItem[] = [
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

export default function Calendar01Demo() {
  const [month, setMonth] = useState(new Date(2026, 9, 1))
  const [picked, setPicked] = useState<string | null>(null)
  const subject = ITEMS.find((item) => item.id === picked)?.label

  return (
    <>
      <Calendar01
        headingLevel="h3"
        eyebrow="Nexus"
        title="October"
        description="The grid is the published mini-calendar, so the paging, the roving tab stop and the weekday headings are that Component's rather than a second implementation. The items are a day list beside it, grouped by the day they fall on."
        month={month}
        onMonthChange={setMonth}
        locale="en-GB"
        weekStartsOn={1}
        previousLabel="The month before"
        nextLabel="The month after"
        label="Scheduled work, by month"
        items={ITEMS}
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
