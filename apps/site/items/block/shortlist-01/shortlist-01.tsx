'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'

import { Shortlist01, type Shortlist01Item } from '@nanisoft/prism-ui/blocks/shortlist-01'

/**
 * The four things a reader is considering, with a mark for two of them.
 *
 * The marks are the caller's own nodes and the two that have none draw no frame at
 * all, which is the point the Block's JSDoc makes: a grey disc where a logo would
 * be is a claim that the absence is a gap, and a capability with no logo is a
 * complete capability. The initials below are the Demo's own composition, not a
 * mark Prism drew.
 */
const CONSIDERED: Shortlist01Item[] = [
  {
    id: 'ingest-sftp',
    name: 'SFTP ingest',
    mark: (
      <span className="text-muted-foreground text-mono text-xs" aria-hidden="true">
        SF
      </span>
    ),
    reason: 'Two suppliers still push files rather than call an endpoint.',
    price: { amount: 180, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 0 },
    note: 'Added from the connectors page on 4 October.',
    href: '/capabilities/sftp-ingest',
    hrefLabel: 'Read what it does',
  },
  {
    id: 'retention-90',
    name: 'Ninety day retention',
    mark: (
      <span className="text-muted-foreground text-mono text-xs" aria-hidden="true">
        90
      </span>
    ),
    reason: 'Compliance asked for a quarter of history on every tracked node.',
    price: { amount: 240, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 0 },
  },
  {
    id: 'agent-triage',
    name: 'Agent triage',
    reason: 'Eleven alerts a week reach a person who reads them in order.',
    price: { amount: 320, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 0 },
    href: '/capabilities/agent-triage',
    hrefLabel: 'See the run ledger',
  },
  {
    id: 'regional-warehouse',
    name: 'Regional warehouse',
    reason: 'The Frankfurt estate would stop shipping rows to the default region.',
    price: { amount: 410, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 0 },
    note: 'Two regions, one replicated.',
  },
]

/**
 * The four items as the Demo holds them, so the remove control has something to
 * remove and the reader can see a set change under them.
 */
export default function Shortlist01Demo() {
  const [items, setItems] = useState(CONSIDERED)
  const [moved, setMoved] = useState<string | null>(null)

  return (
    <div className="flex flex-col">
      <Shortlist01
        headingLevel="h3"
        eyebrow="Nexus"
        title="What you are considering"
        description="Four capabilities. Move one to a quote, or take it off the list. Both control names are yours, and both carry the item's own name, which is the only thing telling one control from the next."
        items={items}
        onMove={(id) => setMoved(id)}
        moveLabel={(item) => `Take ${item.name} to a quote`}
        onRemove={(id) => setItems((was) => was.filter((item) => item.id !== id))}
        removeLabel={(item) => `Stop considering ${item.name}`}
        actions={
          <Button type="button" size="sm" variant="outline">
            Compare the four side by side
          </Button>
        }
        empty="Nothing is on the list. Everything you have looked at so far has been decided, which is a different sentence from the list failing to load and yours to write."
      />

      {/*
        The caller reporting the activation in its own copy, beside the Block. The
        Block hands over an id and nothing else, so the sentence saying what moving
        an item means is the caller's, on the caller's page, in the caller's
        language.
      */}
      <p className="text-muted-foreground mt-6 text-sm">
        {moved === null
          ? 'The Block reports which item and never decides what moving it means, so promote, send and quote are all still yours to choose between.'
          : `Asked to move ${items.find((item) => item.id === moved)?.name ?? moved}. Nothing moved yet, because what moving means is a fact about this product and not about this Block.`}
      </p>

      <Shortlist01
        headingLevel="h3"
        eyebrow="Nexus"
        title="The same four as rows"
        description="Both arrangements draw the same accessibility tree, so a reader who navigates by heading lands on the item rather than on a list position. The order is the reader's and the Block never sorts."
        items={CONSIDERED}
        variant="rows"
        onMove={() => {}}
        moveLabel={(item) => `Take ${item.name} to a quote`}
        onRemove={() => {}}
        removeLabel={(item) => `Stop considering ${item.name}`}
        empty="Nothing is on the list."
      />

      <Shortlist01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A shortlist with no controls on it"
        description="With both handlers off the Block draws no buttons at all, which is the honest answer for a set the reader can look at but not change. It is a list rather than a shortlist, and that is a difference the reader can see."
        items={CONSIDERED}
        empty="Nothing is on the list."
      />
    </div>
  )
}
