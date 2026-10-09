import { ChartGroup01, type ChartGroup01Card } from '@nanisoft/prism-ui/blocks/chart-group-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Chart, ChartLegend } from '@nanisoft/prism-ui/components/chart'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

/**
 * Two series, declared once and used twice.
 *
 * The same array reaches `chart` and `ChartLegend`, which is the arrangement
 * `chart`'s own documentation asks for: the legend and the marks are two renderings
 * of one `series`, and a caller who passed two arrays would eventually have a legend
 * that named a series the marks no longer draw.
 */
const REQUESTS = [
  { name: 'eu-west', values: [120, 132, 141, 128, 150], tone: 'chart-1' as const },
  { name: 'us-east', values: [90, 88, 96, 104, 99], tone: 'chart-2' as const },
]

const LATENCY = [{ name: 'p95', values: [420, 388, 402, 511, 468], tone: 'chart-3' as const }]

const ERRORS = [{ name: '5xx', values: [2, 0, 1, 7, 3], tone: 'chart-4' as const }]

/**
 * Three cards, so the derived layout is visible.
 *
 * The first takes the legend through the card's own slot with `chart`'s legend turned
 * off, the second lets `chart` draw its own, and the third is a single series, which
 * is the case where `chart` drops the legend on its own. Three figures also mean
 * three across at the wide breakpoint, which is the arrangement the Block's
 * measurement argues for.
 */
const CARDS: ChartGroup01Card[] = [
  {
    id: 'requests',
    title: 'Requests',
    description: 'Per day, by region.',
    figure: (
      <Chart variant="bar" label="Requests per day by region" labels={DAYS} series={REQUESTS} legend={false} />
    ),
    legend: <ChartLegend series={REQUESTS} />,
    reading: [
      { key: 'peak', label: 'Peak day', value: '150', delta: 6, deltaFormat: '6 more than the week before', hint: 'vs last week' },
      { key: 'total', label: 'Total', value: '2,280' },
    ],
    actions: <Button size="sm" variant="ghost">Last week</Button>,
  },
  {
    id: 'latency',
    title: 'Latency',
    description: 'Milliseconds at the ninety fifth percentile.',
    figure: <Chart variant="line" label="Latency at the ninety fifth percentile" labels={DAYS} series={LATENCY} />,
    reading: [{ key: 'worst', label: 'Worst day', value: '511ms', delta: -43, deltaFormat: '43ms faster' }],
  },
  {
    id: 'errors',
    title: 'Errors',
    description: 'Responses in the five hundreds.',
    figure: <Chart variant="bar" label="Server errors per day" labels={DAYS} series={ERRORS} />,
    reading: [{ key: 'total', label: 'Total', value: '13' }],
  },
]

export default function ChartGroup01Demo() {
  return (
    <ChartGroup01
      headingLevel="h3"
      eyebrow="Preview"
      title="Section heading"
      description="Three figures, so three across at the wide breakpoint."
      cards={CARDS}
    />
  )
}
