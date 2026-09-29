import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph'

/** A pipeline: three stages on one rail, every edge carrying. */
const PIPELINE = [
  { id: 'intake', name: 'intake', note: 'one request', x: 0, y: 0.5, lane: 0 },
  { id: 'queue', name: 'queue', note: 'durable', x: 0.34, y: 0.5, lane: 1 },
  { id: 'run', name: 'run', note: 'isolated', x: 0.68, y: 0.5, lane: 2, emphasis: true },
  { id: 'report', name: 'report', note: 'signed', x: 1, y: 0.5, lane: 3 },
]

const PIPELINE_EDGES = [
  { from: 'intake', to: 'queue', carries: true },
  { from: 'queue', to: 'run', carries: true },
  { from: 'run', to: 'report', carries: true },
]

/** A field: no lanes, so no rail and no marker, and one node in focus. */
const FIELD = [
  { id: 'a', name: 'a', x: 0.1, y: 0.2 },
  { id: 'b', name: 'b', x: 0.42, y: 0.72 },
  { id: 'c', name: 'c', x: 0.72, y: 0.28, emphasis: true },
  { id: 'd', name: 'd', x: 0.9, y: 0.66 },
  { id: 'e', name: 'e', x: 0.24, y: 0.48 },
]

const FIELD_EDGES = [
  { from: 'a', to: 'c' },
  { from: 'b', to: 'c', carries: true },
  { from: 'd', to: 'c', indirect: true },
]

export default function PulseGraphDemo() {
  return (
    <div className="flex flex-col gap-6">
      <InstrumentPanel01
        label="a pipeline, running"
        state="live"
        stateLabel="live"
        caption="Four stages on one rail, with a marker travelling between them."
        footnote="Lanes make the sequence visible as an order rather than as spacing."
      >
        <PulseGraph
          nodes={PIPELINE}
          relations={PIPELINE_EDGES}
          label="Four stages on one rail, from intake to a signed report"
        />
      </InstrumentPanel01>

      <InstrumentPanel01
        label="a field, no order"
        caption="Five nodes with no lane, so the graph draws no rail."
        footnote="Without a lane there is no marker: the drawing claims a system, not a sequence."
      >
        <PulseGraph nodes={FIELD} relations={FIELD_EDGES} label="Five nodes in a field" />
      </InstrumentPanel01>
    </div>
  )
}
