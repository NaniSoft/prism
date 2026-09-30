import { Kanban01, type KanbanCard } from '@nanisoft/prism-ui/blocks/kanban-01'

/**
 * A board with all four states on show, a column that is over its limit, and a
 * column that is empty.
 *
 * The limit and the overflow line are the two things a screenshot of a resting
 * board never shows, so they are here. A column holding six cards against a limit
 * of four draws four and a line in your own words saying how many are behind, and
 * the alternative is a board that looks finished when it is not.
 *
 * Note what is absent: there is no drag. Nothing in this Demo is draggable and
 * nothing is trying to be, which is the decision the Block is built around rather
 * than a thing it is missing.
 */
const COLUMNS = [
  {
    id: 'inbox',
    label: 'Inbox',
    cards: [
      {
        id: 'nex-412',
        title: 'Okta group mapping drops the engineering role',
        mark: 'NEX-412',
        body: 'The assertion carries the group and the claim does not. Two enterprise accounts are affected.',
        state: 'blocked' as const,
        stateLabel: 'Blocked on the identity team',
        tags: [
          { id: 'auth', label: 'Auth' },
          { id: 'enterprise', label: 'Enterprise' },
        ],
        href: '/issues/NEX-412',
        hrefLabel: 'Open the issue',
      },
      {
        id: 'nex-418',
        title: 'Warehouse export that keeps its own identifiers',
        mark: 'NEX-418',
        state: 'ready' as const,
        stateLabel: 'Ready to pick up',
        owner: 'Wren Ashby',
        ownerAvatar: { name: 'Wren Ashby' },
        tags: [{ id: 'export', label: 'Export' }],
      },
      {
        id: 'req-203',
        title: 'A customer asked for this twice and it was closed as duplicate',
        mark: 'Request',
        state: 'ready' as const,
        stateLabel: 'Ready to pick up',
        owner: 'Nexus',
      },
    ],
  },
  {
    id: 'active',
    label: 'In progress',
    limit: 2,
    limitLabel: (limit: number, count: number) => `${count} cards, ${limit} shown`,
    cards: [
      {
        id: 'nex-404',
        title: 'Nightly run rejects four rows and nobody is told',
        mark: 'NEX-404',
        body: 'The rejection is counted and the count is not on any page the team looks at.',
        state: 'active' as const,
        stateLabel: 'Being worked this week',
        owner: 'Tomas Berg',
        ownerAvatar: { name: 'Tomas Berg' },
        tags: [{ id: 'pipeline', label: 'Pipeline' }],
        href: '/issues/NEX-404',
        hrefLabel: 'Open the issue',
      },
      {
        id: 'nex-409',
        title: 'Access review for the reporting warehouse',
        mark: 'NEX-409',
        state: 'active' as const,
        stateLabel: 'Being worked this week',
        owner: 'Priya Raman',
        ownerAvatar: { name: 'Priya Raman' },
      },
      {
        id: 'nex-421',
        title: 'Invoice 4471 charged twice',
        mark: 'NEX-421',
        state: 'active' as const,
        stateLabel: 'Being worked this week',
        owner: 'Billing',
      },
    ],
  },
  {
    id: 'review',
    label: 'In review',
    cards: [
      {
        id: 'nex-399',
        title: 'Keep the generated identifiers stable across a re-run',
        mark: 'NEX-399',
        state: 'active' as const,
        stateLabel: 'Waiting on a second pair of eyes',
        owner: 'Wren Ashby',
      },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    cards: [
      {
        id: 'nex-388',
        title: 'Timezone on the daily export was UTC, not the account timezone',
        mark: 'NEX-388',
        state: 'done' as const,
        stateLabel: 'Shipped last week',
      },
    ],
  },
  {
    id: 'icebox',
    label: 'Not now',
    cards: [] as KanbanCard[],
  },
]

export default function Kanban01Demo() {
  return (
    <>
      <Kanban01
        headingLevel="h3"
        eyebrow="Nexus"
        title="How the work moved this week"
        description="Five columns, four states, one column over its limit and one empty. No card is draggable, and the reason is in the JSDoc rather than in a missing feature."
        columns={COLUMNS}
        empty="Nothing here. That is usually the right state for a column and it rarely needs a sentence."
      />

      <Kanban01
        headingLevel="h3"
        eyebrow="Nexus"
        title="And a board with a limit and no overflow, so no line is drawn"
        description="A column at its limit draws every card and says nothing, because there is nothing behind."
        columns={[
          {
            id: 'now',
            label: 'This week',
            limit: 3,
            cards: COLUMNS[0]?.cards.slice(0, 3) ?? [],
          },
        ]}
        empty="Nothing here."
      />
    </>
  )
}
