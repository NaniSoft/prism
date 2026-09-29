import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph'

/** The centered form, with a heading level that nests under the page. */
function Centered() {
  return (
    <Hero01
      headingLevel="h3"
      eyebrow="Preview"
      title="A headline that fits on two lines"
      description="One or two sentences of supporting copy, so you can judge the measure and the spacing around it."
      actions={[
        { label: 'Primary action', href: '#centered' },
        { label: 'Secondary', href: '#split', variant: 'outline' },
      ]}
    />
  )
}

/**
 * The split form, with a live figure beside the copy.
 *
 * The figure is a PulseGraph of three stages on one rail, which is the shape a
 * pipeline takes: the stages are lanes, the edges carry, and the marker travels
 * between them. The names are the preview's own and are passed in like any other
 * copy, because a Block ships none.
 */
const STAGES = [
  { id: 'issue', name: 'issue', note: 'one', x: 0, y: 0.5, lane: 0 },
  { id: 'build', name: 'build', note: 'fresh', x: 0.5, y: 0.5, lane: 1, emphasis: true },
  { id: 'review', name: 'review', note: 'a person', x: 1, y: 0.5, lane: 2 },
]

const EDGES = [
  { from: 'issue', to: 'build', carries: true },
  { from: 'build', to: 'review', carries: true },
]

function Split() {
  return (
    <Hero01
      headingLevel="h3"
      eyebrow="Preview"
      title="The same block, beside a running system"
      description="A figure that shows the mechanism. It is still correct with every animation stopped."
      actions={[
        { label: 'Primary action', href: '#split' },
        { label: 'Secondary', href: '#centered', variant: 'outline' },
      ]}
      instrument={
        <InstrumentPanel01
          label="the loop, running"
          state="live"
          stateLabel="live"
          caption="Three stages on one rail, with a marker travelling between them."
          footnote="A figure in this block is the consumer's. This one is a PulseGraph of three stages."
        >
          <PulseGraph nodes={STAGES} relations={EDGES} label="Three stages on one rail" />
        </InstrumentPanel01>
      }
    />
  )
}

export default function Hero01Demo() {
  return (
    <div id="centered">
      <Centered />
      <div id="split">
        <Split />
      </div>
    </div>
  )
}
