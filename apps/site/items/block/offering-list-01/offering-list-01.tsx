'use client'

import { useMemo, useState } from 'react'

import { CtaLink } from '@nanisoft/prism-ui'
import {
  OfferingList01,
  type OfferingList01Offering,
} from '@nanisoft/prism-ui/blocks/offering-list-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { TagGroup } from '@nanisoft/prism-ui/components/tag-group'

/**
 * Six capabilities, four of them in the states a real catalogue actually holds.
 *
 * Between them the four NaniSoft products already use more states than a closed union
 * could hold, which is the argument the open `state` string rests on: `two-of-three`
 * and `awaiting-certificate` are not Prism's words and no closed set here could say
 * them. So each row carries the product&apos;s own word and, where that word is not the
 * sentence a reader should see, its own longer one.
 */
const OFFERINGS: readonly OfferingList01Offering[] = [
  {
    id: 'historian-tags',
    name: 'Historian tag normalisation',
    standfirst: 'One spelling per node, proposed rather than written.',
    state: 'available',
    price: { amount: 180, currency: 'GBP', locale: 'en-GB' },
    facts: [
      { id: 'depth', label: 'Tag depth supported', value: '8 levels' },
      { id: 'access', label: 'Access required', value: 'Read only' },
    ],
    href: '/connectors/historian-tags',
    hrefLabel: 'Read the connector note',
  },
  {
    id: 'nightly-reconcile',
    name: 'Nightly reconciliation run',
    standfirst: 'Walks the estate and writes down what changed, with its own failures.',
    state: 'available',
    price: { amount: 46, currency: 'GBP', locale: 'en-GB', period: 'per run' },
    href: '/runs/reconcile',
    hrefLabel: 'Read about the run',
  },
  {
    id: 'agent-handoff',
    name: 'Agent handoff',
    standfirst: 'A finding arrives with the agent that will act on it.',
    state: 'in-preview',
    stateLabel: 'Preview, open to twelve named sites',
    facts: [{ id: 'gateways', label: 'Gateways supported', value: 'Two' }],
  },
  {
    id: 'order-book',
    name: 'Order book reconstruction',
    standfirst: 'Visible depth from the trades the exchange publishes.',
    state: 'coming-soon',
    stateLabel: 'Planned, on the design partner list',
    facts: [{ id: 'venues', label: 'Venues measured', value: '4' }],
  },
  {
    id: 'tag-relational',
    name: 'Relational tag migration',
    standfirst: 'Moves a flat tag set into a hierarchy without a maintenance window.',
    state: 'awaiting-certificate',
    facts: [{ id: 'window', label: 'Maintenance window needed', value: 'None claimed' }],
  },
  {
    id: 'scrap-realtime',
    name: 'Realtime scrap price capture',
    standfirst: 'A quote per plant per minute, with the plant the quote belongs to.',
    state: 'unavailable',
    stateLabel: 'Withdrawn in this release',
  },
]

/**
 * The columns for the table arrangement, in the order a reader comparing six
 * capabilities actually checks them.
 *
 * The names are this Demo's, not Prism's, which is the whole argument for `header`
 * being a prop: a product that calls the third column "Plan" and one that calls it
 * "State" are both right, and a Block that named them would put one product's
 * vocabulary into every consumer's page.
 */
const COLUMNS = [
  { id: 'name', header: 'Capability' },
  { id: 'standfirst', header: 'What it does' },
  { id: 'state', header: 'State' },
  { id: 'price', header: 'Cost' },
  { id: 'href', header: '' },
] as const

/** The result line, composed here because the sentence is the caller's. */
function summary(matches: number): string {
  return matches === OFFERINGS.length
    ? `All ${matches} capabilities.`
    : `${matches} of ${OFFERINGS.length} capabilities match.`
}

/**
 * The catalogue, with the search switched on and the arrangement switched live.
 *
 * The arrangement toggle is the Demo's own control and it is not a prop of the
 * Block, which is the point of `variant` being a prop rather than something the
 * Block decides. Six capabilities with a search field is more rows than a reader can
 * scan without one, which is why the pair is passed here; delete the four search
 * props and the field disappears, the filtering stops, and the six rows come back,
 * which is the same Block and the resting state a twelve-row catalogue should be in.
 */
export default function OfferingList01Demo() {
  const [query, setQuery] = useState('')
  const [table, setTable] = useState(false)
  const [stateOnly, setStateOnly] = useState(false)

  /*
   * The filter is the Demo's, and the set it produces is what the Block receives.
   * That is the arrangement the JSDoc describes: the Block filters what it was given
   * and never reaches further, so a consumer's own facets are the consumer's own
   * work. `stateOnly` here is the shape of a filter a Block could not have drawn,
   * because the states are open strings.
   */
  const visible = useMemo(
    () => (stateOnly ? OFFERINGS.filter((offering) => offering.state !== undefined) : OFFERINGS),
    [stateOnly],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={table ? 'ghost' : 'outline'}
          aria-pressed={table}
          onClick={() => setTable((value) => !value)}
        >
          {table ? 'Show the cards' : 'Show the table'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={stateOnly ? 'secondary' : 'ghost'}
          aria-pressed={stateOnly}
          onClick={() => setStateOnly((value) => !value)}
        >
          Only capabilities with a state
        </Button>
      </div>

      <OfferingList01
        headingLevel="h3"
        eyebrow="Capabilities"
        title="What the platform can do for an estate"
        description="Six of them. Four are built, one is planned, and one is withdrawn, and all three facts are in the list because a catalogue that hides two of them is a catalogue a reader cannot plan against."
        value={query}
        onValueChange={setQuery}
        label="Search the capabilities"
        clearLabel="Clear the search"
        offerings={visible}
        summary={summary}
        filters={
          stateOnly ? (
            <TagGroup
              label="Applied filters"
              tags={[{ id: 'has-state', label: 'Has a state', tone: 'info' }]}
              onRemove={() => setStateOnly(false)}
              removeLabel={() => 'Remove the state filter'}
            />
          ) : undefined
        }
        empty="Nothing here matches that. Try the capability's own name rather than a phrase from this page."
        variant={table ? 'table' : 'cards'}
        {...(table ? { columns: COLUMNS } : null)}
      />

      <p className="text-muted-foreground text-pretty text-sm">
        The two arrangements are the same six capabilities and the same four states.
        What changes is the reading: cards are browsed and a table is compared, and
        the table&apos;s column names are the only words on it that are not data, which is
        why they are a prop.
      </p>

      <p className="text-muted-foreground text-pretty text-sm">
        The fifth row carries a state no closed set here would hold. It is drawn in
        the neutral tone because the Block has never heard of the word, and the word
        beside it is the product&apos;s own rather than a translation of ours.
      </p>

      <div className="flex flex-wrap gap-2">
        <CtaLink href="/capabilities" variant="outline">
          Read the full capability list
        </CtaLink>
        <CtaLink href="/contact" variant="ghost">
          Ask which one fits an estate
        </CtaLink>
      </div>
    </div>
  )
}
