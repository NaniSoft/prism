'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { ChartFrame, type ChartMark, type ChartSeries } from '@nanisoft/prism-ui/components/chart-frame'

/**
 * Six months, two surfaces, and the three states a reader meets: a line, a bar,
 * and a filter that matched nothing.
 *
 * The switch between line and bar is the interesting control. The same numbers
 * read as two different claims: a line says the shape between March and April
 * matters, and a bar says each month is a length to be compared. The demo shows
 * both from one dataset so the difference is visible rather than described.
 *
 * The five-series view is here because that is where the legend stops being
 * optional. Past about three series, hue is the only channel left, which is the
 * point the documentation makes about when to stop adding series.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const TWO: ChartSeries[] = [
  { id: 'api', label: 'API', color: 'chart-1', values: [120, 180, 150, 240, 210, 300] },
  { id: 'web', label: 'Web', color: 'chart-2', values: [60, 90, 140, 120, 160, 180] },
]

/** A profit-and-loss shape, so the region below the baseline is visible. */
const PROFIT: ChartSeries[] = [
  { id: 'gross', label: 'Gross', color: 'chart-1', values: [180, 210, 190, 260, 240, 310] },
  { id: 'net', label: 'Net', color: 'chart-2', values: [40, 25, -30, 60, 45, 90] },
]

const FIVE: ChartSeries[] = [
  { id: 'api', label: 'API', color: 'chart-1', values: [120, 180, 150, 240, 210, 300] },
  { id: 'web', label: 'Web', color: 'chart-2', values: [60, 90, 140, 120, 160, 180] },
  { id: 'workers', label: 'Workers', color: 'chart-3', values: [20, 30, 25, 45, 40, 60] },
  { id: 'cli', label: 'CLI', color: 'chart-4', values: [10, 15, 12, 22, 18, 30] },
  { id: 'sdk', label: 'SDK', color: 'chart-5', values: [5, 8, 6, 14, 11, 19] },
]

const DATASETS: { id: string; name: string; series: ChartSeries[] }[] = [
  { id: 'two', name: 'Two series', series: TWO },
  { id: 'profit', name: 'A value below zero', series: PROFIT },
  { id: 'five', name: 'All five roles', series: FIVE },
]

/** Every state a chart is in, switchable, so a reader sees the difference rather than a description of it. */
export default function ChartFrameDemo() {
  const [mark, setMark] = useState<ChartMark>('line')
  const [dataset, setDataset] = useState('two')
  const [empty, setEmpty] = useState(false)

  const shown = DATASETS.find((entry) => entry.id === dataset) ?? DATASETS[0]!
  // A gap in the data is a real state and not an error, so it is a value rather
  // than a special case: a chart that drew April as zero because the collector
  // was down is a chart that is confidently wrong.
  const series: ChartSeries[] = empty
    ? shown.series.map((entry, index) =>
        index === 0 ? entry : { ...entry, values: entry.values.map(() => null) },
      )
    : shown.series

  return (
    <div className="flex max-w-measure flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={mark === 'line' ? 'default' : 'outline'} onClick={() => setMark('line')}>
          Line
        </Button>
        <Button variant={mark === 'bar' ? 'default' : 'outline'} onClick={() => setMark('bar')}>
          Bar
        </Button>
        <span className="bg-border mx-1 h-6 w-px" aria-hidden="true" />
        {DATASETS.map((entry) => (
          <Button
            key={entry.id}
            variant={dataset === entry.id ? 'default' : 'outline'}
            onClick={() => setDataset(entry.id)}
          >
            {entry.name}
          </Button>
        ))}
        <Button variant="outline" onClick={() => setEmpty((value) => !value)}>
          {empty ? 'Restore the data' : 'Empty the data'}
        </Button>
      </div>

      <ChartFrame
        categories={MONTHS}
        series={series}
        mark={mark}
        label="Requests per month by surface"
        title="Requests"
        tableCaption="Requests per month, by surface"
        categoryHeading="Month"
        format={(value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
        empty="No requests in this period"
      />

      <p className="text-muted-foreground text-sm">
        The table under the plot is the same <code>series</code> array the marks are
        drawn from, so the two cannot disagree. Emptying the data leaves the box
        exactly as tall as the plot it replaces, so a row on a dashboard does not
        move when its numbers arrive.
      </p>
    </div>
  )
}
