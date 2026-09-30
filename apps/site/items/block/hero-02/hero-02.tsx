import { Hero02 } from '@nanisoft/prism-ui/blocks/hero-02'
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { PulseSeries } from '@nanisoft/prism-ui/components/pulse-series'

/**
 * Twelve readings of a queue depth, in the units the caller holds them.
 *
 * The preview's own data. A Block ships no numbers, so every figure on this page
 * is passed in like any other piece of copy.
 */
const DEPTH = [
  { id: 'd0', value: 18 },
  { id: 'd1', value: 26 },
  { id: 'd2', value: 21 },
  { id: 'd3', value: 34 },
  { id: 'd4', value: 29 },
  { id: 'd5', value: 41, emphasis: true, label: 'peak' },
  { id: 'd6', value: 33 },
  { id: 'd7', value: 27 },
  { id: 'd8', value: 22 },
  { id: 'd9', value: 16 },
  { id: 'd10', value: 12 },
  { id: 'd11', value: 9 },
]

/**
 * The figure, framed by the consumer.
 *
 * Hero02 draws no frame of its own, so the panel treatment is composed here rather
 * than inherited. That is the arrangement the Block's own JSDoc describes: a bleed
 * with an instrument panel inside it, and both are allowed.
 */
const FIGURE = (
  <InstrumentPanel01
    label="Queue depth, by stage"
    stateLabel="live"
    caption="Queue depth over the last hour, by stage"
    footnote="A reading is a count of jobs waiting, sampled every five minutes."
  >
    <PulseSeries label="Queue depth over the last hour, by stage" baseline="jobs waiting" scan bars={DEPTH} />
  </InstrumentPanel01>
)

/** One Block, one figure, and the props a caller has to supply. */
export default function Hero02Demo() {
  return (
    <Hero02
      headingLevel="h3"
      eyebrow="Preview"
      title="The claim is the figure"
      description="A narrow copy column, and a figure that fills the rest of the band to the container's edge."
      actions={[
        { label: 'Primary action', href: '#hero-02' },
        { label: 'Secondary', href: '#hero-02', variant: 'outline' },
      ]}
      figureLabel="Queue depth over the last hour, by stage"
      figure={FIGURE}
    />
  )
}