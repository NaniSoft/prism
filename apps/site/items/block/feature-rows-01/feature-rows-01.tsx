import { FeatureRows01 } from '@nanisoft/prism-ui/blocks/feature-rows-01'
import { Chart } from '@nanisoft/prism-ui/components/chart'
import { PulseSeries } from '@nanisoft/prism-ui/components/pulse-series'

/**
 * Two rows with a visual each, and a third with none.
 *
 * The third row is in the demo on purpose: a row that omits `media` is a real state of
 * this Block, and a demo that only shows the framed case teaches a caller that the
 * panel is mandatory.
 */
const FINDINGS = [
  { name: 'Opened', values: [12, 19, 14, 22, 31, 26, 34], tone: 'chart-1' as const },
  { name: 'Closed', values: [9, 15, 13, 18, 24, 25, 29], tone: 'chart-2' as const },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEPTH = [
  { id: 'w0', value: 12 },
  { id: 'w1', value: 19 },
  { id: 'w2', value: 27 },
  { id: 'w3', value: 22, emphasis: true, label: 'peak' },
  { id: 'w4', value: 16 },
  { id: 'w5', value: 11 },
]

/** One Block, three rows, two panels and one row with no visual at all. */
export default function FeatureRows01Demo() {
  return (
    <FeatureRows01
      headingLevel="h3"
      eyebrow="Preview"
      title="Three rows, alternating, with the copy first in the markup every time"
      description="The visual changes sides down the set and the reading order does not, because the side is expressed with order rather than by swapping the columns."
      rows={[
        {
          eyebrow: 'Capture',
          title: 'One finding enters once',
          body: 'The record is written where it was found and is never copied forward into a second store.',
          media: (
            <Chart
              variant="bar"
              series={FINDINGS}
              labels={DAYS}
              label="Findings opened and closed over the last week"
              caption="Opened runs ahead of closed by about three a day, which is the backlog the loop is designed to absorb."
            />
          ),
          mediaAlt: 'A bar chart of findings opened and closed over the last week',
        },
        {
          eyebrow: 'Observe',
          title: 'The estate is walked on a cycle',
          body: 'Two walks of the same estate are compared and only the differences are kept, so the record stays small enough to read.',
          media: (
            <PulseSeries
              label="Depth of the change set over the last hour"
              baseline="hosts changed"
              bars={DEPTH}
            />
          ),
          mediaAlt: 'A series of the change set depth over the last hour',
        },
        {
          eyebrow: 'Prove',
          title: 'Every claim is traceable to a run',
          body: 'A page states what it measured, when, and which run measured it. This row has no visual because the sentence is the evidence.',
        },
      ]}
    />
  )
}