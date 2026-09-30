'use client'

import { useState } from 'react'

import { DataToolbar } from '@nanisoft/prism-ui/components/data-toolbar'
import { Button } from '@nanisoft/prism-ui/components/button'
import { IssueList01, type IssueListColumn, type IssueListIssue } from '@nanisoft/prism-ui/blocks/issue-list-01'

/**
 * A tracker list with a vocabulary Prism has never heard of on show, because the
 * whole point of the Block is that the words are the caller's and the tone is a
 * guess that falls back to the tone that asserts nothing.
 *
 * `needs-info` and `waiting-on-third-party` are not in the Block's tone table.
 * They are drawn in the neutral tone, which says no urgency, and that is the
 * designed failure: a state this Block has never heard of costs a colour and not a
 * lie. A tracker that also uses `resolved` and `unresolved` shows the other half
 * of the argument, because the table matches whole words: `unresolved` is not read
 * as `resolved`, so an open issue is never drawn as finished.
 *
 * The filter is the caller's, in the caller's state, and the count is the caller's
 * sentence. The Block renders the array it is given and filters nothing.
 */
const ALL: IssueListIssue[] = [
  {
    id: '1',
    key: 'NEX-412',
    title: 'Okta group mapping drops the engineering role',
    state: 'blocked',
    priority: 'p1',
    priorityLabel: (priority: string) => `${priority}, two enterprise accounts`,
    assignee: 'Tomas Berg',
    assigneeAvatar: { name: 'Tomas Berg' },
    updated: '2026-09-28T09:12:00Z',
    updatedLabel: () => 'yesterday',
    labels: [
      { id: 'auth', label: 'Auth' },
      { id: 'enterprise', label: 'Enterprise' },
    ],
    href: '/issues/NEX-412',
    hrefLabel: 'Open NEX-412',
  },
  {
    id: '2',
    key: 'NEX-421',
    title: 'Invoice 4471 charged twice',
    state: 'in-review',
    priority: 'urgent',
    priorityLabel: () => 'overdue by nine days',
    assignee: 'Priya Raman',
    assigneeAvatar: { name: 'Priya Raman' },
    updated: '2026-09-27T16:40:00Z',
    updatedLabel: () => 'two days ago',
  },
  {
    id: '3',
    key: 'NEX-404',
    title: 'Nightly run rejects four rows and nobody is told',
    state: 'unresolved',
    priority: 'high',
    assignee: 'Wren Ashby',
    updated: '2026-09-25T04:44:00Z',
  },
  {
    id: '4',
    key: 'NEX-399',
    title: 'Keep the generated identifiers stable across a re-run',
    state: 'needs-info',
    assignee: 'Ops',
    updated: '2026-09-18T11:05:00Z',
  },
  {
    id: '5',
    key: 'NEX-388',
    title: 'Timezone on the daily export was UTC, not the account timezone',
    state: 'closed',
    priority: 'low',
    assignee: 'Tomas Berg',
    updated: '2026-09-11T08:00:00Z',
    labels: [{ id: 'pipeline', label: 'Pipeline' }],
  },
]

/** The columns, in the order a triage queue is worked in. */
const COLUMNS: IssueListColumn[] = [
  { id: 'key', header: 'Reference', className: 'w-28' },
  { id: 'title', header: 'What is wrong' },
  { id: 'state', header: 'Where it is' },
  { id: 'priority', header: 'How pressing' },
  { id: 'assignee', header: 'Who has it' },
  { id: 'updated', header: 'Moved' },
  { id: 'href', header: 'Go', className: 'w-32' },
]

export default function IssueList01Demo() {
  const [mine, setMine] = useState(false)
  const shown = mine ? ALL.filter((issue) => issue.assignee === 'Tomas Berg') : ALL

  return (
    <IssueList01
      headingLevel="h3"
      eyebrow="Nexus"
      title="What the team is carrying"
      description="The reference is set in the mono face, because an identifier is machine notation and the mono stack is what this repository annotates machine-readable values with. The state and the priority are your own words; the tones are a guess, and a word the guess misses comes out in the tone that asserts nothing."
      columns={COLUMNS}
      issues={shown}
      toolbar={
        <DataToolbar
          view={
            <Button
              type="button"
              size="sm"
              variant={mine ? 'outline' : 'secondary'}
              onClick={() => setMine(!mine)}
            >
              {mine ? 'Showing mine' : 'Only mine'}
            </Button>
          }
        />
      }
      footer={`${shown.length} of ${ALL.length} issues, sorted by when they last moved`}
      empty="Nothing is carrying. Nothing matches this filter and the query failed are two different facts, and the sentence that tells them apart is yours."
    />
  )
}
