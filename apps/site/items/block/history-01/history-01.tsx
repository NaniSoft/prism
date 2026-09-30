import { Button } from '@nanisoft/prism-ui/components/button'
import { DataToolbar } from '@nanisoft/prism-ui/components/data-toolbar'

import { History01, type HistoryEntry, type HistoryState } from '@nanisoft/prism-ui/blocks/history-01'

/**
 * The state words, written per state rather than derived from it.
 *
 * Between the four NaniSoft products there are eleven words for these four
 * positions, so the Block takes a function of the state and this Demo supplies its
 * own. "Settled" and "Paid" are the same position and the words belong to the
 * product, not to the design system.
 */
const STATE_WORDS: Record<HistoryState, string> = {
  settled: 'Settled on the 2nd',
  pending: 'Authorised, not captured',
  refunded: 'Credited back in full',
  disputed: 'Under query with the card issuer',
}

/** The unit a quantity is counted in, given the line it belongs to. */
function quantityLabel(value: number, entry: { id: string; reference: string }): string {
  const unit = entry.id.startsWith('cap') ? 'GB captured' : 'agent runs'
  return `${new Intl.NumberFormat('en-GB').format(value)} ${unit}`
}

/**
 * Two months of a workspace's ledger, in the order the store holds it.
 *
 * The order is deliberately not newest first for its own sake: it is the order a
 * billing export arrives in, and the Block draws the array it is given, which is
 * the whole of the argument in the JSDoc. A caller who wants newest first sorts
 * once, upstream.
 */
const LEDGER: HistoryEntry[] = [
  {
    id: 'run-2026-09',
    at: '2026-09-30T23:59:00Z',
    reference: 'NX-2026-09-0417',
    kind: 'Agent runs',
    amount: { amount: 214.6, currency: 'GBP', locale: 'en-GB' },
    quantity: 12040,
    quantityLabel,
    state: 'settled',
    stateLabel: STATE_WORDS.settled,
    href: '/billing/runs/2026-09',
    hrefLabel: 'Open the run ledger',
  },
  {
    id: 'cap-2026-09',
    at: '2026-09-30T23:59:00Z',
    reference: 'NX-2026-09-0418',
    kind: 'Capture storage',
    amount: { amount: 68.2, currency: 'GBP', locale: 'en-GB' },
    quantity: 2410,
    quantityLabel,
    state: 'settled',
    stateLabel: STATE_WORDS.settled,
  },
  {
    id: 'sub-platform',
    at: '2026-09-01T00:00:00Z',
    reference: 'NX-PLATFORM-0001',
    kind: 'Platform subscription',
    kindLabel: 'Platform subscription, annual',
    amount: { amount: 3600, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 0 },
    state: 'settled',
    stateLabel: STATE_WORDS.settled,
    href: '/billing/subscriptions/platform',
    hrefLabel: 'Read the subscription',
  },
  {
    id: 'run-2026-10',
    at: '2026-10-31T23:59:00Z',
    reference: 'NX-2026-10-0503',
    kind: 'Agent runs',
    amount: { amount: 241.85, currency: 'GBP', locale: 'en-GB' },
    quantity: 13960,
    quantityLabel,
    state: 'pending',
    stateLabel: STATE_WORDS.pending,
  },
  {
    id: 'cap-2026-10',
    at: '2026-10-31T23:59:00Z',
    reference: 'NX-2026-10-0504',
    kind: 'Capture storage',
    amount: { amount: 74.9, currency: 'GBP', locale: 'en-GB' },
    quantity: 2680,
    quantityLabel,
    state: 'disputed',
    stateLabel: STATE_WORDS.disputed,
  },
  {
    id: 'adj-2026-08',
    at: '2026-08-14T11:20:00Z',
    reference: 'NX-ADJ-2026-08-0009',
    kind: 'Goodwill credit',
    amount: { amount: -42, currency: 'GBP', locale: 'en-GB' },
    state: 'refunded',
    stateLabel: STATE_WORDS.refunded,
  },
]

/** The columns, in the order a reader checks them: what, when, how much, what for. */
const COLUMNS = [
  { id: 'at' as const, header: 'When' },
  { id: 'reference' as const, header: 'Reference' },
  { id: 'kind' as const, header: 'What for' },
  { id: 'quantity' as const, header: 'How much' },
  { id: 'amount' as const, header: 'Charged' },
  { id: 'state' as const, header: 'Where it stands' },
  { id: 'link' as const, header: null },
]

/** A history, a period summary above it, and a quiet period below it. */
export default function History01Demo() {
  return (
    <>
      <History01
        headingLevel="h3"
        eyebrow="Nexus"
        title="What this workspace has been charged for"
        description="Six lines over two months. The reference is in the mono face because an identifier is machine notation, the same rule SectionHeading states for its own index prop, and the order is the ledger's order because this Block never sorts."
        columns={COLUMNS}
        entries={LEDGER}
        summary={[
          { label: 'Charged this period', value: 'GBP 316.75' },
          { label: 'Runs metered', value: '26,000' },
          { label: 'Storage metered', value: '5,090 GB' },
          { label: 'Credit applied', value: 'GBP 42.00' },
        ]}
        toolbar={
          <DataToolbar
            view={
              <Button type="button" size="sm" variant="outline">
                Export the period
              </Button>
            }
          />
        }
        empty="Nothing was charged in this period. That is a different sentence from the query having failed, and it is yours to write."
      />

      <History01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A period with nothing in it"
        description="No table is drawn at all, because a table of column heads over no rows reads as a statement that was truncated."
        columns={COLUMNS}
        entries={[]}
        empty="Nothing was charged between the 1st and the 14th. The capture run was paused on the 2nd and restarted on the 13th."
      />
    </>
  )
}
