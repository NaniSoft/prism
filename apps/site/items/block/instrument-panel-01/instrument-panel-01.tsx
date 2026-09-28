import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'

/** The frame around an instrument: a titled bar, a state, a slot and a footnote. */
export default function InstrumentPanel01Demo() {
  return (
    <InstrumentPanel01
      label="The estate, as one graph"
      state="live"
      stateLabel="live view"
      caption="The access graph"
      footnote="Edges are the paths a person can actually take, not the ones they might."
      actions={<span className="font-mono">last 60s</span>}
    >
      <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-xs">
        The instrument goes here: a graph, a chart, a canvas, your own markup.
      </div>
    </InstrumentPanel01>
  )
}
