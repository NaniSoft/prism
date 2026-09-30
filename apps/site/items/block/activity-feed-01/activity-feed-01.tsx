'use client'

import { useState } from 'react'

import { ActivityFeed01, type ActivityFeed01Event } from '@nanisoft/prism-ui/blocks/activity-feed-01'
import { RelativeTime } from '@nanisoft/prism-ui/components/relative-time'

/**
 * The feed, grouped by day, with the four cases worth showing at once.
 *
 * The first event is the linked one, so the caller own words on a destination are
 * visible rather than asserted. The second is in a different day, so the grouping
 * has more than one heading in it. The third has no target, which is the real case
 * for a sign-in and the one a reader has to be able to read. The fourth is a
 * selectable row with a tone, so the mark beside it is visible. The last carries a
 * composed `relative-time` reading, which is the arrangement the Block's own note
 * points at: Prism prints the machine value and the caller prints the sentence.
 */
const EVENTS: ActivityFeed01Event[] = [
  {
    id: 'release',
    actor: 'Ada',
    action: 'published a release for',
    target: 'nexus-api',
    at: '2026-09-30T08:14:00.000Z',
    tone: 'success',
    detail: (
      <RelativeTime
        date="2026-09-30T08:14:00.000Z"
        renderRelative={(at) => {
          const hours = Math.round((at.getTime() - Date.now()) / 3_600_000)
          return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(hours, 'hour')
        }}
      />
    ),
    href: '/overview',
    hrefLabel: 'Read the release note',
  },
  {
    id: 'rebuild',
    actor: 'Nightly',
    action: 'finished',
    target: 'ledger rebuild',
    at: '2026-09-30T04:02:00.000Z',
  },
  { id: 'signin', actor: 'Bo', action: 'signed in', at: '2026-09-29T21:40:00.000Z' },
  {
    id: 'rotate',
    actor: 'Cleo',
    action: 'rotated the key for',
    target: 'nexus-api',
    at: '2026-09-29T18:05:00.000Z',
    tone: 'warning',
  },
]

/** A day heading in the reader's own words, which is the prop's whole job. */
function dayLabel(key: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date(key))
}

export default function ActivityFeed01Demo() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex max-w-measure flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        The rows are buttons, so activating one reports its id here. The last one in
        each day is a plain record, and the first carries a link with its own words.
      </p>
      <p className="text-muted-foreground text-sm">
        {selected === null ? 'Nothing selected yet.' : `Selected ${selected}.`}
      </p>

      <ActivityFeed01
        headingLevel="h3"
        eyebrow="Preview"
        title="Section heading"
        description="A feed grouped by day, with a link, a tone and a composed reading."
        groupBy="day"
        dayLabel={dayLabel}
        events={EVENTS}
        onSelect={setSelected}
        empty="Nothing has happened in this workspace yet."
      />
    </div>
  )
}
