'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Bundle01, type BundleItem } from '@nanisoft/prism-ui/blocks/bundle-01'

/**
 * A selection of two nodes, with the second one over its limit, so the clamping
 * and the remove control are both visible in one screenshot.
 *
 * The Demo is a client module because the Block takes two function props, and a
 * function cannot cross from a server Component to a client one. That is the rule
 * the roster learned the hard way, and this file is where it shows: the directive
 * has to be on the Demo's own first line and not only on the Block's.
 */
const START: BundleItem[] = [
  {
    id: 'collector',
    name: 'Market collector',
    detail: 'Reads one exchange feed and writes normalised events into the lakehouse.',
    mark: 'MC',
    quantity: 3,
    min: 1,
    max: 12,
    unit: { amount: 48, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 },
    href: '/catalogue/collector',
    hrefLabel: 'Read the collector specification',
    note: 'Billed yearly. The first month is free on a new estate.',
  },
  {
    id: 'runner',
    name: 'Agent runner',
    detail: 'Runs one agent at a time against a connected tool set.',
    mark: 'AR',
    quantity: 2,
    min: 1,
    max: 8,
    unit: { amount: 120, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 },
    note: 'The second runner on an estate is free.',
  },
]

/**
 * The same selection with no handlers at all, which is the second thing worth
 * showing: a bundle whose quantities were finalised somewhere else draws no
 * stepper and no remove control, because a control that changes nothing is a
 * control that lies about what is on the page.
 */
const SETTLED: BundleItem[] = [
  {
    id: 'collector',
    name: 'Market collector',
    quantity: 6,
    unit: { amount: 48, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 },
  },
]

export default function Bundle01Demo() {
  const [items, setItems] = useState<BundleItem[]>(START)
  const [committed, setCommitted] = useState(false)

  if (committed) {
    return (
      <div className="flex flex-col gap-6">
        <Bundle01
          headingLevel="h3"
          eyebrow="Nexus"
          title="Nodes to provision"
          description="This run was committed, so the selection is a record of what was asked for rather than a set of things to change."
          items={items}
          summary={[{ id: 'due', label: 'Committed', value: 'GBP 384.00', emphasis: true }]}
          total={{ amount: 384, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 }}
          empty="Nothing selected."
        />
        <div>
          <Button
            variant="outline"
            onClick={() => {
              setCommitted(false)
              setItems(START)
            }}
          >
            Start the run again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <Bundle01
        headingLevel="h3"
        eyebrow="Nexus"
        title="Nodes to provision"
        description="Two node types, a quantity for each, and the breakdown the reader checks the total against."
        items={items}
        quantityLabels={{
          increment: 'One more',
          decrement: 'One fewer',
          field: (item) => `How many ${item.name} to provision`,
        }}
        onQuantityChange={(id, quantity) =>
          setItems((held) => held.map((one) => (one.id === id ? { ...one, quantity } : one)))
        }
        onRemove={(id) => setItems((held) => held.filter((one) => one.id !== id))}
        removeLabel={(item) => `Take ${item.name} off this run`}
        summary={[
          { id: 'lines', label: 'Lines before discount', value: 'GBP 384.00' },
          { id: 'credit', label: 'Credit already on the account', value: 'GBP 24.00' },
          { id: 'due', label: 'Due on the first of the month', value: 'GBP 360.00', emphasis: true },
        ]}
        total={{ amount: 360, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 }}
        actions={<Button onClick={() => setCommitted(true)}>Provision these nodes</Button>}
        empty="Nothing selected. Add a node type to start a run."
      />

      <Bundle01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A run already in flight"
        description="No handlers, so no stepper and no remove control. The quantity is a figure because that is all it is."
        items={SETTLED}
        summary={[{ id: 'due', label: 'Committed on Tuesday', value: 'GBP 288.00', emphasis: true }]}
        total={{ amount: 288, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 }}
        empty="Nothing selected."
      />
    </div>
  )
}
