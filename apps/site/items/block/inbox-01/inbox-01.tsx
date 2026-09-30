'use client'

import { useState } from 'react'

import { DataToolbar } from '@nanisoft/prism-ui/components/data-toolbar'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Inbox01, type InboxColumn, type InboxItem } from '@nanisoft/prism-ui/blocks/inbox-01'

/**
 * A queue with every priority and every state on show at once, and a filter the
 * Demo owns.
 *
 * The filter is the point of the second half. This Block takes the rows it is
 * given and does not filter them, so the state that narrows the queue lives in the
 * caller: two buttons in a `DataToolbar`, one boolean, and the filtered array
 * passed back in. That is the whole contract, and a Demo that showed a queue
 * without a filter would not show it.
 *
 * `onSelect` is wired to the subject buttons, and only the two rows without an
 * `href` are buttons, which is the arrangement the JSDoc argues: a destination
 * gives a real anchor and no destination gives a real button, and a row that
 * listened for a click would be unreachable by keyboard.
 */
const ALL: InboxItem[] = [
  {
    id: 'inv-4471',
    subject: 'Invoice 4471 charged twice',
    source: 'Billing',
    priority: 'urgent',
    priorityLabel: () => 'Overdue by nine days',
    at: '2026-09-02T08:14:00Z',
    state: 'open',
    stateLabel: 'With billing',
    excerpt: 'Two captures on the same card, both settled, both for the same invoice.',
  },
  {
    id: 'sso-88',
    subject: 'Okta group mapping is dropping the engineering role',
    source: 'Support',
    priority: 'high',
    priorityLabel: () => 'Two enterprise accounts affected',
    at: '2026-09-24T11:02:00Z',
    state: 'waiting',
    stateLabel: 'Waiting on the customer',
    excerpt: 'The assertion carries the group, the claim does not, and the claim is the one we read.',
  },
  {
    id: 'run-1193',
    subject: 'Nightly run 1193 finished with four rows rejected',
    source: 'Pipeline',
    priority: 'high',
    priorityLabel: () => 'Blocking the morning report',
    at: '2026-09-27T04:41:00Z',
    state: 'new',
    stateLabel: 'Not picked up',
  },
  {
    id: 'req-203',
    subject: 'Request: a warehouse export that keeps its own identifiers',
    source: 'Nexus',
    priority: 'normal',
    priorityLabel: () => 'Next sprint',
    at: '2026-09-20T16:30:00Z',
    state: 'open',
    stateLabel: 'Scheduled',
    href: '/requests/203',
    hrefLabel: 'Open the request',
  },
  {
    id: 'note-77',
    subject: 'Access review signed off for the reporting warehouse',
    source: 'Compliance',
    priority: 'low',
    priorityLabel: () => 'No deadline',
    at: '2026-09-18T09:00:00Z',
    state: 'done',
    stateLabel: 'Closed',
    excerpt: 'Eleven grants removed, four kept with a note, the review is on file.',
  },
  {
    id: 'alert-12',
    subject: 'Warehouse disk at 91 percent and the alert is not firing',
    source: 'Monitoring',
    priority: 'urgent',
    priorityLabel: () => 'The alert is broken, not the disk',
    at: '2026-09-28T22:05:00Z',
    state: 'waiting',
    stateLabel: 'Waiting on the platform team',
  },
]

/** The columns, in the order a reader works the queue in. */
const COLUMNS: InboxColumn[] = [
  { id: 'subject', header: 'What is waiting' },
  { id: 'source', header: 'From' },
  { id: 'priority', header: 'How pressing' },
  { id: 'at', header: 'Arrived' },
  { id: 'state', header: 'Where it is' },
]

export default function Inbox01Demo() {
  const [onlyMine, setOnlyMine] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const shown = onlyMine
    ? ALL.filter((item) => item.state === 'new' || item.state === 'open')
    : ALL
  const subject = ALL.find((item) => item.id === picked)?.subject

  return (
    <>
      <Inbox01
        headingLevel="h3"
        eyebrow="Nexus"
        title="What is waiting for a person"
        description="Six items and not one of them is decided by this Block. The priority words, the state words, the columns and the count are all yours, and the run fails without the first two rather than printing them in English."
        columns={COLUMNS}
        items={shown}
        toolbar={
          <DataToolbar
            view={
              <Button
                type="button"
                size="sm"
                variant={onlyMine ? 'outline' : 'secondary'}
                onClick={() => setOnlyMine(!onlyMine)}
              >
                {onlyMine ? 'Showing the open two' : 'Show only the open ones'}
              </Button>
            }
          />
        }
        count={`${shown.length} of ${ALL.length} waiting`}
        onSelect={setPicked}
        empty="Nothing is waiting. The queue is empty rather than broken, which is a different sentence and yours to write."
      />

      {/*
        * The caller reporting the activation in its own copy. The Block hands over
        * an id and nothing else, so the sentence that says what picking an item
        * means is the caller's, on the caller's page.
        */}
      {subject === undefined ? null : (
        <p className="text-muted-foreground mt-4 text-sm">
          Picked <strong>{subject}</strong>. A row with an <code>href</code> is a link and
          never calls this, so the two are told apart by the Block rather than by the
          Demo.
        </p>
      )}
    </>
  )
}
