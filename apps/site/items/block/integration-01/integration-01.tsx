import { Database, Factory, Radio, ScrollText, Workflow } from 'lucide-react'

import { Integration01, type Integration, type IntegrationState } from '@nanisoft/prism-ui/blocks/integration-01'

/**
 * Eight integrations across two categories, and all four states present.
 *
 * The marks are drawn as Lucide icons here only because this Demo is a
 * documentation site that owns its own artwork. A real consumer supplies a
 * licensed vendor mark, and Prism ships none: that is the point the Block's
 * JSDoc argues, and a Demo that pretended otherwise would be the third-party logo
 * set in a smaller costume.
 */
const MARKS = {
  historian: <Radio className="size-5" />,
  warehouse: <Database className="size-5" />,
  plant: <Factory className="size-5" />,
  manual: <ScrollText className="size-5" />,
  agent: <Workflow className="size-5" />,
} as const

/** The words for a state, written per integration rather than per state. */
function stateLabel(state: IntegrationState, name: string): string {
  if (state === 'connected') return `Connected as the workspace owner`
  if (state === 'available') return `${name} can be connected`
  if (state === 'coming-soon') return 'Arriving next quarter'
  return 'Not offered in this region'
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'historian',
    name: 'The historian',
    capability: 'Reads process values from every site, continuously rather than on request.',
    state: 'connected',
    mark: MARKS.historian,
    category: 'The estate',
    href: '/settings/historian',
    hrefLabel: 'Manage the connection',
    docsHref: '/docs/historian',
    docsLabel: 'How the reader works',
  },
  {
    id: 'archive',
    name: 'The historian, two years back',
    capability: 'Fills the gap in the archive from before the estate was observed.',
    state: 'coming-soon',
    mark: MARKS.historian,
    category: 'The estate',
  },
  {
    id: 'plant',
    name: 'The access graph',
    capability: 'Shows which paths a person can actually take, and which they cannot.',
    state: 'available',
    mark: MARKS.plant,
    category: 'The estate',
    href: '/settings/access-graph',
    hrefLabel: 'Turn it on',
  },
  {
    id: 'warehouse',
    name: 'The warehouse',
    capability: 'Where the readings land, and where the findings are written.',
    state: 'connected',
    mark: MARKS.warehouse,
    category: 'Where the work happens',
    href: '/settings/warehouse',
    hrefLabel: 'Manage the connection',
  },
  {
    id: 'agent-runner',
    name: 'The agent runner',
    capability: 'Takes a finding, works it, and wakes a person only for the decision that is not its own.',
    state: 'connected',
    mark: MARKS.agent,
    category: 'Where the work happens',
    href: '/settings/agents',
    hrefLabel: 'Set the budget',
  },
  {
    id: 'manual-entry',
    name: 'Manual entry',
    capability: 'For the two sites whose historian nobody has been allowed to touch.',
    state: 'available',
    mark: MARKS.manual,
    category: 'Where the work happens',
  },
  {
    id: 'erp',
    name: 'The maintenance system',
    capability: 'Purchase orders and work orders, where the estate already keeps them.',
    state: 'unavailable',
    category: 'Where the work happens',
  },
  {
    id: 'weather',
    name: 'Site weather',
    capability: 'A reading beside every value, so a dip has something to be a dip against.',
    state: 'available',
  },
]

/** The grouped cards, then the same set as rows, then the empty state. */
export default function Integration01Demo() {
  return (
    <>
      <Integration01
        headingLevel="h3"
        eyebrow="Preview"
        title="The systems this workspace talks to"
        description="Two categories, all four states, and two integrations with no category so the untitled group is visible."
        stateLabel={stateLabel}
        groupBy="category"
        variant="cards"
        integrations={INTEGRATIONS}
      />
      <Integration01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same set as rows"
        description="One set of data and two arrangements. The state and the two links sit on one line, which is what a list of eight reads like."
        stateLabel={stateLabel}
        variant="rows"
        integrations={INTEGRATIONS.filter((one) => one.category === undefined || one.state === 'connected')}
      />
      <Integration01
        headingLevel="h3"
        eyebrow="Preview"
        title="A workspace with nothing connected"
        description="The empty sentence is yours, because the two honest answers are opposites: one is about the reader and one is about the product."
        stateLabel={stateLabel}
        integrations={[]}
        empty="This workspace has no integrations yet. An admin can connect the first one from settings."
      />
    </>
  )
}
