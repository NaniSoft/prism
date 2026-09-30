'use client'

import { useState } from 'react'

import {
  QuickView01,
  type QuickView01Fact,
} from '@nanisoft/prism-ui/blocks/quick-view-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card'
import { ProductMark } from '@nanisoft/prism-ui/components/product-mark'
import { Status } from '@nanisoft/prism-ui/components/status'

/** One capability, and the summary the panel shows about it. */
type Capability = {
  id: string
  name: string
  standfirst: string
  state: 'success' | 'info' | 'warning'
  stateLabel: string
  facts: readonly QuickView01Fact[]
  href: string
  hrefLabel: string
}

/**
 * Three capabilities, and the grid underneath the panel is the point of the whole
 * Demo rather than the panel.
 *
 * Everything the quick view shows is also on this page: the name, the state, the price
 * and the four lines of the specification are all in the card behind it, and the panel
 * adds nothing the page does not already carry. That is the law this Block exists to
 * enforce, and a Demo that showed the panel on its own would be demonstrating the
 * thing it is not allowed to do.
 */
const CAPABILITIES: readonly Capability[] = [
  {
    id: 'agent-handoff',
    name: 'Agent handoff',
    standfirst: 'A finding arrives with the agent that will act on it.',
    state: 'info',
    stateLabel: 'Preview, open to twelve named sites',
    facts: [
      { id: 'gateways', label: 'Gateways supported', value: '2' },
      { id: 'tools', label: 'Tools per agent', value: 'Up to 40' },
      { id: 'sandbox', label: 'Sandboxed by default', value: 'Yes' },
      { id: 'approval', label: 'Needs a human approval', value: 'For any write' },
    ],
    href: '/capabilities/agent-handoff',
    hrefLabel: 'Read about agent handoff',
  },
  {
    id: 'historian-tags',
    name: 'Historian tag normalisation',
    standfirst: 'One spelling per node, proposed rather than written.',
    state: 'success',
    stateLabel: 'In general availability',
    facts: [
      { id: 'depth', label: 'Tag depth supported', value: '8 levels' },
      { id: 'access', label: 'Access required', value: 'Read only' },
      { id: 'walk', label: 'Walk interval', value: 'Every 15 minutes' },
      { id: 'cost', label: 'Cost', value: 'GBP 180 per site, per month' },
    ],
    href: '/connectors/historian-tags',
    hrefLabel: 'Read the connector note',
  },
  {
    id: 'retention',
    name: 'Retention and export',
    standfirst: 'How long a reading is kept, and the format it leaves in.',
    state: 'warning',
    stateLabel: 'Shortened on the smallest plan',
    facts: [
      { id: 'kept', label: 'Kept', value: '90 days on the smallest plan' },
      { id: 'formats', label: 'Export formats', value: '4' },
      { id: 'full', label: 'Full history', value: 'On the two larger plans' },
      { id: 'deletion', label: 'Deletion', value: 'Immediate, and proved' },
    ],
    href: '/capabilities/export',
    hrefLabel: 'Read the export formats',
  },
]

/**
 * The trigger, which is the caller's and not the Block's.
 *
 * One `Button` per capability rather than a card-wide hit area, for the reason
 * `Gallery01` refuses a tile that is both a trigger and a link: two controls in one
 * hit area is one thing a reader activating it cannot predict.
 */
function OpenButton({
  capability,
  onOpen,
}: {
  capability: Capability
  onOpen: () => void
}) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={onOpen}>
      Summarise
      <span className="sr-only">{capability.name}</span>
    </Button>
  )
}

/**
 * The grid, the panel and the one piece of state that opens it.
 *
 * `open` is a single index rather than a boolean, so the panel can never be open with
 * no capability behind it: that is the state a controlled dialog gets into when a
 * caller holds `open` and a separate `selected` and forgets that deleting the selected
 * row leaves the panel showing the last one. Holding one value rather than two removes
 * the way that happens.
 */
export default function QuickView01Demo() {
  const [openAt, setOpenAt] = useState<number | null>(null)

  const current = openAt === null ? CAPABILITIES[0] : (CAPABILITIES[openAt] ?? CAPABILITIES[0])

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-6 sm:grid-cols-2">
        {CAPABILITIES.map((capability, index) => (
          <li key={capability.id} className="h-full">
            <Card className="h-full gap-4 py-6">
              <CardHeader>
                <CardTitle>{capability.name}</CardTitle>
                <CardDescription>{capability.standfirst}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Status size="sm" tone={capability.state} label={capability.stateLabel} />

                {/*
                  The same four lines the panel shows, on the page as well. That is
                  the law: everything a quick view shows must be reachable on the page
                  it sits on, and the Block cannot enforce it, so the Demo has to
                  demonstrate the arrangement rather than just the panel.
                */}
                <dl className="text-sm">
                  {capability.facts.map((fact) => (
                    <div
                      key={fact.id}
                      className="border-border flex items-baseline justify-between gap-4 border-b py-1.5 last:border-b-0"
                    >
                      <dt className="text-muted-foreground">{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-wrap gap-2">
                  <CtaLink href={capability.href} size="sm">
                    {capability.hrefLabel}
                  </CtaLink>
                  <OpenButton capability={capability} onOpen={() => setOpenAt(index)} />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground text-pretty text-sm">
        Every card above already carries the name, the state, the four lines and the
        link. The panel repeats them so a reader can check a capability without
        scrolling, and it is closed by Escape, by the outside press, by the control in
        its corner, and by the link the reader follows out of it.
      </p>

      <QuickView01
        open={openAt !== null}
        onOpenChange={(open) => {
          if (!open) setOpenAt(null)
        }}
        // `h4` because the card that opened the panel is a title under this page's own
        // `h3`, and the level follows the document rather than the Block.
        headingLevel="h4"
        size="lg"
        closeLabel="Close the summary"
        title={current.name}
        body={current.standfirst}
        facts={current.facts}
        mark={<ProductMark id={current.id} name={current.name} pack="mint" size="sm" />}
        actions={
          <>
            <CtaLink href={current.href} size="sm">
              {current.hrefLabel}
            </CtaLink>
            <Button size="sm" variant="outline" onClick={() => setOpenAt(null)}>
              Close
            </Button>
          </>
        }
      />
    </div>
  )
}
