import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { PulseSeries } from '@nanisoft/prism-ui/components/pulse-series'

/**
 * A captured run, in the demo's own made-up but honestly-labelled units.
 *
 * The docs site is a place where a shape has to be shown before a consumer can
 * judge the component, so the numbers here are illustrative and the baseline
 * says so in its own name rather than in a footnote. A caller shipping this to a
 * product page would pass what it measured.
 */
const CAPTURED = [
  { id: 't0', value: 4 },
  { id: 't1', value: 7 },
  { id: 't2', value: 11 },
  { id: 't3', value: 9 },
  { id: 't4', value: 18, label: 'peak', emphasis: true },
  { id: 't5', value: 14 },
  { id: 't6', value: 6 },
  { id: 't7', value: 3 },
]

export default function PulseSeriesDemo() {
  return (
    <div className="flex flex-col gap-6">
      <InstrumentPanel01
        label="a capture run, scanning"
        state="live"
        stateLabel="live"
        caption="Eight readings, with a reticle crossing them."
        footnote="The reticle marks the column being read at this instant."
      >
        <PulseSeries
          bars={CAPTURED}
          baseline="illustrative readings"
          scan
          label="Eight illustrative readings, with the fourth tallest marked"
        />
      </InstrumentPanel01>

      <InstrumentPanel01
        label="a settled series, not scanning"
        caption="The same eight readings with the reticle off."
        footnote="Turn scan off for a report. The reticle is a claim about time, and a static chart is not making one."
      >
        <PulseSeries
          bars={CAPTURED}
          baseline="illustrative readings"
          label="Eight illustrative readings, with the tallest marked"
        />
      </InstrumentPanel01>
    </div>
  )
}
