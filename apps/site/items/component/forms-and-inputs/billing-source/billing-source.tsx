'use client'

import { useState } from 'react'

import {
  BillingSource,
  BillingSources,
  type BillingSourceItem,
} from '@nanisoft/prism-ui/components/billing-source'

/**
 * Three sources on file, and none of the facts this package refuses to hold.
 *
 * The number is already masked here, in the Demo, because masking is the Demo's
 * decision and not the Component's. The words a screen reader hears are on the
 * first entry and on no other, which is the shape of the rule: `valueLabel` is for
 * a value that says nothing aloud, and "Invoice account NET-30" is a value a reader
 * can hear perfectly well, so the second entry passes none.
 *
 * The marks are the Demo's own marks rather than a card network's. Prism ships
 * none, and the reason is in the documentation: they are licensed assets, and a set
 * of them in a component package is a set that is out of date within a year.
 */
const SOURCES: BillingSourceItem[] = [
  {
    id: 'src_4417',
    name: 'Corporate card',
    value: '**** **** **** 4417',
    valueLabel: 'Card ending 4417',
    kind: 'Card',
    note: 'Expires 03/2029',
    mark: (
      <span aria-hidden="true" className="text-xs font-medium">
        CC
      </span>
    ),
  },
  {
    id: 'inv_0031',
    name: 'Invoice account NET-30',
    value: 'INV-0031',
    kind: 'Invoice',
    note: 'Due on receipt',
  },
  {
    id: 'dd_0007',
    name: 'Direct debit mandate',
    value: '**** 0007',
    valueLabel: 'Account ending 0007',
    kind: 'Direct debit',
    note: 'Verification pending',
    disabled: true,
  },
]

/**
 * The chooser and the single display, over one set.
 *
 * The chooser is wired to state the Demo holds, because applying the choice is the
 * caller's and not the Component's. The display underneath is the same entry drawn
 * on its own, which is the point of the two sharing a shape: moving between a
 * chooser and a statement is a change of arrangement and not a change of data.
 */
export default function BillingSourceDemo() {
  const [active, setActive] = useState('src_4417')
  const chosen = SOURCES.find((source) => source.id === active) ?? SOURCES[0]

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs">
          The chooser, over three sources, one of which cannot be chosen
        </span>
        <BillingSources
          sources={SOURCES}
          value={active}
          onChange={setActive}
          label="Charge to"
          name="billingSource"
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs">
          The same entry on its own, as a statement rather than a question
        </span>
        <div className="border-border rounded-lg border p-3">
          <BillingSource source={chosen} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs">A workspace with nothing on file</span>
        <BillingSources
          sources={[]}
          value=""
          onChange={setActive}
          label="Charge to"
          empty="No payment source is on file. Add one to continue."
        />
      </div>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        The disabled source is still here. A row that silently vanished is a row a
        reader will think has been removed, and the notice beside it is the
        product&apos;s sentence rather than this package&apos;s.
      </p>
    </div>
  )
}
