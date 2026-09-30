import { Showcase01 } from '@nanisoft/prism-ui/blocks/showcase-01'
import { CodeBlock } from '@nanisoft/prism-ui/components/code-block'
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph'

/**
 * The capture loop, as one graph.
 *
 * The nodes are the stages and the edges carry. A graph is a cycle made visible, which
 * is why this Block's media slot is a node rather than a screenshot: what the product
 * does is a loop, and a loop draws better than a picture of one.
 */
const NODES = [
  { id: 'walk', name: 'walk', note: 'the market', x: 0, y: 0.5, lane: 0 },
  { id: 'price', name: 'price', note: 'in source currency', x: 0.5, y: 0.5, lane: 1, emphasis: true },
  { id: 'write', name: 'write', note: 'once', x: 1, y: 0.5, lane: 2 },
]

const EDGES = [
  { from: 'walk', to: 'price', carries: true },
  { from: 'price', to: 'write', carries: true },
]

const COMMAND = 'nanisoft capture run --market spot --cadence 15m'

/**
 * The specification.
 *
 * One row's value is a `CodeBlock`, which is possible because `Fact.value` is a node
 * rather than a string. A specification row whose answer is a command is a
 * specification, and a caller who cannot put source in a cell ends up with a
 * paragraph underneath, which is where specifications go to stop being readable.
 */
const FACTS = [
  { label: 'Cadence', value: 'Every 15 minutes' },
  { label: 'Sources', value: '14 exchanges, 3 vendor feeds' },
  { label: 'Run it yourself', value: <CodeBlock language="bash" code={COMMAND} /> },
  { label: 'Last run', value: 'Run 812, complete', href: '#showcase-01' },
]

/** One Block, one capability, with the panel on its default side. */
function PanelRight() {
  return (
    <Showcase01
      headingLevel="h3"
      eyebrow="Preview"
      name="Market capture"
      standfirst="A market is walked, priced and written down once, in the source's own currency."
      facts={FACTS}
      mediaLabel="The capture loop, as one graph"
      media={<PulseGraph nodes={NODES} relations={EDGES} label="The capture loop" />}
      actions={[
        { label: 'Primary action', href: '#showcase-01' },
        { label: 'Secondary', href: '#showcase-01', variant: 'outline' },
      ]}
    />
  )
}

/** The same capability with the panel moved, and no panel at all on the second one. */
function PanelLeft() {
  return (
    <Showcase01
      headingLevel="h3"
      layout="panel-left"
      eyebrow="Preview"
      name="Estate observation"
      standfirst="An estate is walked on a cycle and only the differences between two walks are kept."
      facts={[
        { label: 'Cadence', value: 'Every 6 hours' },
        { label: 'Hosts in scope', value: '1,204' },
      ]}
    />
  )
}

export default function Showcase01Demo() {
  return (
    <div className="flex flex-col">
      <PanelRight />
      <PanelLeft />
    </div>
  )
}