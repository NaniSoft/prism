import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { Status } from '@nanisoft/prism-ui/components/status'
import { Table, TableCell, TableRow } from '@nanisoft/prism-ui/components/table'
import {
  RecordDetail01,
  type RecordDetail01Relation,
} from '@nanisoft/prism-ui/blocks/record-detail-01'

/**
 * The relationships of one subscription, one entry per arrangement this package
 * ships, plus a relation with nothing in it so the caller's empty state is on the
 * page rather than only described.
 *
 * The members of a `Table` relation are the caller's own row nodes, of a
 * `ListPanel` relation the caller's own list rows, of a `Timeline` relation
 * `TimelineEntry` values, and of an `AvatarGroup` relation people. That is what
 * the shared `RelationSpec`'s deliberately weakest member type buys: the
 * arrangement decides what a member is.
 */
const RELATIONS: readonly RecordDetail01Relation[] = [
  {
    key: 'invoices',
    label: 'Invoices',
    kind: 'Table',
    href: '/invoices?account=northwind',
    hrefLabel: 'Open the invoice index',
    count: '18 issued, 2 open',
    members: [
      <TableRow key="inv-1042">
        <TableCell>INV-1042</TableCell>
        <TableCell>Due 1 October</TableCell>
        <TableCell>
          <Status tone="warning" label="Overdue" size="sm" />
        </TableCell>
      </TableRow>,
      <TableRow key="inv-1031">
        <TableCell>INV-1031</TableCell>
        <TableCell>Paid 1 September</TableCell>
        <TableCell>
          <Status tone="success" label="Paid" size="sm" />
        </TableCell>
      </TableRow>,
      <TableRow key="inv-1019">
        <TableCell>INV-1019</TableCell>
        <TableCell>Paid 1 August</TableCell>
        <TableCell>
          <Status tone="success" label="Paid" size="sm" />
        </TableCell>
      </TableRow>,
    ],
    empty: {
      reason: 'first-run',
      title: 'No invoices yet',
      body: 'The first one is issued on the next billing date.',
    },
  },
  {
    key: 'activity',
    label: 'Activity',
    kind: 'Timeline',
    count: 'Last 30 days',
    members: [
      { id: 'renewed', title: 'Subscription renewed', state: 'done' },
      { id: 'seats', title: 'Seats increased to 24', state: 'done' },
      { id: 'card', title: 'Payment method updated', state: 'done' },
    ],
    empty: {
      reason: 'first-run',
      title: 'Nothing has happened yet',
      body: 'Renewals, seat changes and payment updates appear here.',
    },
  },
  {
    key: 'people',
    label: 'People with access',
    kind: 'AvatarGroup',
    href: '/settings/members',
    hrefLabel: 'Manage members',
    count: '6 people',
    members: [
      { name: 'Ada Lovelace' },
      { name: 'Grace Hopper' },
      { name: 'Alan Turing' },
      { name: 'Katherine Johnson' },
      { name: 'Edsger Dijkstra' },
      { name: 'Barbara Liskov' },
    ],
    empty: {
      reason: 'not-permitted',
      title: 'The member list is restricted',
      body: 'Ask an owner for access to see who can reach this subscription.',
    },
  },
  {
    key: 'credits',
    label: 'Account credits',
    kind: 'ListPanel',
    count: '0 applied',
    members: [],
    empty: {
      reason: 'emptied-by-reader',
      title: 'Every credit has been applied',
      body: 'A new credit arrives with the next renewal, and applied credits are listed on the invoices above.',
    },
  },
]

/** One record in full, its relationships drawn open, and its actions beside it. */
export default function RecordDetail01Demo() {
  return (
    <RecordDetail01
      eyebrow="SUB-4821"
      title="Northwind subscription"
      description="A monthly subscription billed to Northwind Traders, with three relationships and one empty collection."
      headingLevel="h3"
      fields={[
        { id: 'plan', label: 'Plan', value: 'Scale' },
        { id: 'seats', label: 'Seats', value: '24' },
        { id: 'renews', label: 'Renews', value: '1 November' },
        { id: 'owner', label: 'Owner', value: 'Ada Lovelace' },
      ]}
      actions={
        <>
          <CtaLink href="/subscriptions/sub-4821/edit">Edit record</CtaLink>
          <CtaLink href="/subscriptions/sub-4821/archive" variant="ghost">
            Archive
          </CtaLink>
        </>
      }
      relations={RELATIONS}
    />
  )
}
