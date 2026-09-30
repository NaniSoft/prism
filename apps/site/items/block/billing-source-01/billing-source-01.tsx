'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'

import {
  BillingSource01,
  type BillingSource01Source,
} from '@nanisoft/prism-ui/blocks/billing-source-01'

/**
 * The sources on file, with a mark for two of them and none for the third.
 *
 * The two marks are the Demo's own composition rather than a card network's. That
 * is not modesty: a card network's mark is a licensed asset with brand rules
 * governing its size, its clear space and its use on a third party's surface, and
 * a set of them shipped inside a component package is a set that is out of date
 * within a year. So the slot is the consumer's and this Demo composes its own.
 *
 * The third source has no mark at all and draws no frame, which is the honest
 * state for an invoice account that has no logo to show.
 */
const ON_FILE: BillingSource01Source[] = [
  {
    id: 'corporate-card',
    name: 'Corporate card ending 4417',
    kind: 'card',
    kindLabel: 'Business debit card',
    mark: (
      <span className="text-muted-foreground text-mono text-xs" aria-hidden="true">
        CC
      </span>
    ),
    expiresAt: '2027-03-31',
    expiresLabel: (value, source) =>
      `Expires ${new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(value))} on ${source.name}`,
    isDefault: true,
    defaultLabel: 'Charged by default',
    href: '/billing/sources/corporate-card',
    hrefLabel: 'See the charges',
  },
  {
    id: 'direct-debit',
    name: 'Direct debit from Nexus Operations',
    kind: 'mandate',
    mark: (
      <span className="text-muted-foreground text-mono text-xs" aria-hidden="true">
        DD
      </span>
    ),
    expiresAt: '2026-11-14',
    expiresLabel: (value) =>
      `Mandate runs to ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))}`,
    actions: (
      <Button type="button" size="sm" variant="ghost">
        Confirm the mandate
      </Button>
    ),
  },
  {
    id: 'invoice-account',
    name: 'Invoice account, purchase order 4471',
    kind: 'invoice',
    kindLabel: 'Invoiced, paid on 30 day terms',
    expiresAt: Date.UTC(2026, 11, 31),
    expiresLabel: (value) =>
      `Purchase order renews ${new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(value))}`,
  },
]

/** Two accounts on file, with the controls the reader can act on. */
export default function BillingSource01Demo() {
  const [sources, setSources] = useState(ON_FILE)
  const [defaultId, setDefaultId] = useState('corporate-card')

  return (
    <div className="flex flex-col gap-12">
      <BillingSource01
        headingLevel="h3"
        eyebrow="Nexus"
        title="What this workspace is charged to"
        description="Three sources on file and one of them takes the charges. Both control names are yours, and both carry the source's own name, which is the only thing telling one control from the next."
        sources={sources}
        onSetDefault={(id) => setDefaultId(id)}
        setDefaultLabel={(source) => `Charge to ${source.name}`}
        onRemove={(id) => setSources((was) => was.filter((source) => source.id !== id))}
        removeLabel={(source) => `Stop charging to ${source.name}`}
        addLabel="Add a billing source"
        onAdd={() => {}}
        empty="This workspace has no billing source on file, so nothing can be charged to it yet. That is a different sentence from the list having failed to load, and yours to write."
      />

      <p className="text-muted-foreground -mt-8 text-sm">
        The Block reports which source and nothing else, so the sentence saying what
        setting a default means is yours, on your page. The source it would move to is
        currently{' '}
        <strong>{sources.find((source) => source.id === defaultId)?.name ?? 'none'}</strong>. The
        set-as-default control is withheld on that row, because a control offering to
        set something to the value it already holds is a control that promises a change
        and makes none. Remove is not withheld on it, because a reader who wants to
        stop charging to the source in use is a reader who will find another way.
      </p>

      <BillingSource01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A workspace with nothing on file"
        description="No panel is drawn, because a bounded frame around no rows reads as a set that failed to load rather than as a set that is empty."
        sources={[]}
        empty="This workspace has no billing source on file. Charges cannot be taken until one is added, and a support engineer can add one from the workspace menu."
      />
    </div>
  )
}
