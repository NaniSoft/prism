'use client'

import { Radio, ScrollText, Warehouse, Workflow } from 'lucide-react'

import { Button } from '@nanisoft/prism-ui/components'
import { PackSwatch } from '@nanisoft/prism-ui/components/pack-swatch'
import {
  SettingsIntegrations01,
  type SettingsIntegrationsItem,
} from '@nanisoft/prism-ui/blocks/settings-integrations-01'

/**
 * The words on a connect control, naming the system.
 *
 * Two rows whose controls both say "Connect" are two rows a screen reader user
 * cannot tell apart, and a sighted reader scanning four buttons learns nothing
 * from any of them.
 */
function connectLabel(integration: { id: string; name: string }): string {
  return `Connect ${integration.name}`
}

/** A connection date in the reader's own locale, formatted by the Demo and not by the Block. */
function since(value: number | string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

const INTEGRATIONS: SettingsIntegrationsItem[] = [
  {
    id: 'historian',
    name: 'The historian',
    capability: 'Reads process values from every site, continuously rather than on request.',
    state: 'connected',
    stateLabel: 'Connected as the workspace owner',
    // A pack preview rather than a vendor mark, which is what a consumer's own
    // internal systems look like, and which is the case the frameless slot exists
    // for: the swatch is a fully rounded disc carrying its own `data-pack`
    // boundary, and a frame around it would pin it inside a second shape.
    mark: <PackSwatch pack="mint" label="The mint pack" size="sm" showModes={false} />,
    connectedSince: Date.UTC(2025, 4, 2),
    connectedSinceLabel: since,
    category: 'The systems that read the estate',
    href: '/settings/historian',
    hrefLabel: 'Manage the connection',
  },
  {
    id: 'lms',
    name: 'The learning record',
    capability: 'Fills the gap in the archive from before the estate was observed.',
    state: 'needs-attention',
    stateLabel: 'The token expired four days ago',
    mark: <ScrollText className="size-5" />,
    category: 'The systems that read the estate',
    action: (
      <Button size="sm" variant="outline">
        Reconnect
      </Button>
    ),
  },
  {
    id: 'graph',
    name: 'The access graph',
    capability: 'Shows which paths a person can actually take, and which they cannot.',
    state: 'available',
    stateLabel: 'Not connected yet',
    mark: <Workflow className="size-5" />,
    category: 'Where the work happens',
  },
  {
    id: 'warehouse',
    name: 'The warehouse',
    capability: 'Where the readings land, and where the findings are written.',
    state: 'connected',
    stateLabel: 'Connected as the workspace owner',
    mark: <Warehouse className="size-5" />,
    connectedSince: Date.UTC(2025, 8, 30),
    connectedSinceLabel: since,
    category: 'Where the work happens',
    href: '/settings/warehouse',
    hrefLabel: 'Manage the connection',
    action: (
      <Button size="sm" variant="ghost">
        Disconnect
      </Button>
    ),
  },
  {
    id: 'erp',
    name: 'The maintenance system',
    capability: 'Purchase orders and work orders, where the estate already keeps them.',
    state: 'unavailable',
    stateLabel: 'Not offered in this region',
    mark: <ScrollText className="size-5" />,
    category: 'Where the work happens',
    href: '/docs/maintenance',
    hrefLabel: 'What it would do',
  },
  {
    id: 'radio',
    name: 'The site radio',
    capability: 'A reading beside every value, so a dip has something to be a dip against.',
    state: 'available',
    stateLabel: 'Not connected yet',
    mark: <Radio className="size-5" />,
  },
]

/** Grouped, then the same set ungrouped, then a workspace with nothing connected. */
export default function SettingsIntegrations01Demo() {
  return (
    <>
      <SettingsIntegrations01
        headingLevel="h3"
        eyebrow="Preview"
        title="The systems this workspace talks to"
        description="Two groups, all four states, and one row with no group so the untitled group is visible. The connect control is on the one row where connecting is the action."
        groupBy="category"
        integrations={INTEGRATIONS}
        connectLabel={connectLabel}
        onConnect={() => {}}
        empty="This workspace has connected to nothing yet."
      />
      <SettingsIntegrations01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same six with no categories"
        description="One group under no title, which is the arrangement a caller with a short list usually wants."
        integrations={INTEGRATIONS}
        connectLabel={connectLabel}
        onConnect={() => {}}
        empty="This workspace has connected to nothing yet."
      />
      <SettingsIntegrations01
        headingLevel="h3"
        eyebrow="Preview"
        title="A workspace that has connected to nothing"
        description="The empty sentence is yours, because a workspace that has connected to nothing and a workspace whose connections failed to load are not the same page."
        integrations={[]}
        onConnect={() => {}}
        connectLabel={connectLabel}
        empty="This workspace has not connected to anything yet. An admin can connect the first system from settings."
      />
    </>
  )
}
