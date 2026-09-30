import { ChartCard01 } from '@nanisoft/prism-ui/blocks/chart-card-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Chart, ChartLegend } from '@nanisoft/prism-ui/components/chart'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

/** One array, two renderings, so the key and the marks cannot disagree. */
const SERIES = [
  { name: 'eu-west', values: [120, 132, 141, 128, 150], tone: 'chart-1' as const },
  { name: 'us-east', values: [90, 88, 96, 104, 99], tone: 'chart-2' as const },
]

/**
 * The card with all five slots filled, so the arrangement is visible in one render.
 *
 * The legend is drawn by `ChartLegend` from the same `series` array the marks come
 * from, with `chart`'s own legend turned off, which is the arrangement `chart` asks
 * for when the surrounding design wants the key somewhere other than under the plot.
 * The readings carry deltas with a formatter, so the number beside each arrow has the
 * unit the figure is measured in rather than a bare fraction.
 */
export default function ChartCard01Demo() {
  return (
    <ChartCard01
      headingLevel="h3"
      title="Requests"
      description="Per day, by region."
      figure={
        <Chart
          variant="bar"
          label="Requests per day by region"
          labels={DAYS}
          series={SERIES}
          legend={false}
        />
      }
      legend={<ChartLegend series={SERIES} />}
      reading={[
        { label: 'Peak day', value: '150', delta: 6, deltaFormat: (value) => `${value}` },
        { label: 'Total', value: '2,280' },
      ]}
      actions={<Button size="sm" variant="ghost">Last week</Button>}
      footer="The dip on Wednesday is the maintenance window."
    />
  )
}
