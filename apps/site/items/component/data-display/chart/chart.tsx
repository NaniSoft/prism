'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import {
  Chart,
  ChartLegend,
  type ChartData,
  type ChartForm,
} from '@nanisoft/prism-ui/components/chart'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

/** Two series with a tone each, which is the case the legend exists for. */
const TONES: ChartData[] = [
  { name: 'API', values: [120, 180, 150, 240, 210, 300], tone: 'chart-1' },
  { name: 'Web', values: [60, 90, 140, 120, 160, 180], tone: 'chart-2' },
]

/**
 * One series with no tone, so the default ink is on the page rather than only in
 * the documentation. Without a tone the series is drawn in the supporting ink
 * rather than in one of the five series roles, because a colour is a claim about
 * what a thing is and a component that knows nothing about the product has no
 * business making it.
 */
const UNTONED: ChartData[] = [{ name: 'Sessions', values: [420, 510, 480, 640, 700, 810] }]

/** A part-to-whole of two, which is the only shape a ring is drawn for. */
const SPLIT: ChartData[] = [
  { name: 'Shipped', values: [72], tone: 'chart-1' },
  { name: 'In review', values: [28], tone: 'chart-2' },
]

const MARKS: { id: ChartForm; name: string }[] = [
  { id: 'bar', name: 'Bar' },
  { id: 'line', name: 'Line' },
  { id: 'area', name: 'Area' },
  { id: 'donut', name: 'Donut' },
]

/**
 * All four marks from one set of numbers, switchable.
 *
 * The point of the switch is that the same numbers read as four different
 * claims, and a reader who has seen all four in a row stops treating a mark as
 * decoration. Bars say each month is a length. A line says the shape between
 * March and April matters. An area says how much there was. A ring says these
 * are two parts of one thing, and it is only offered for two parts, so the
 * refusal is visible too.
 */
export default function ChartDemo() {
  const [mark, setMark] = useState<ChartForm>('bar')
  const [ceiling, setCeiling] = useState(false)
  const [tall, setTall] = useState(240)

  const series = mark === 'donut' ? SPLIT : TONES
  const labels = mark === 'donut' ? undefined : MONTHS
  // A ceiling of 200 against a series that reaches 300, so `data-clamped` has
  // something to report. The point of the opt-in is that the caller can see what
  // their ceiling cost, and a clamped mark above the top gridline is only
  // honest if the number of them is on the element.
  const yMax = ceiling ? 200 : undefined

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle as="h3">The same six months, four marks</CardTitle>
          <CardDescription>
            One set of numbers. Bars compare lengths, a line follows the shape, an
            area measures the mass, and a ring only claims a split in two.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {MARKS.map((entry) => (
              <Button
                key={entry.id}
                variant={mark === entry.id ? 'default' : 'outline'}
                onClick={() => setMark(entry.id)}
              >
                {entry.name}
              </Button>
            ))}
          </div>

          <Chart
            variant={mark}
            labels={labels}
            series={series}
            label="Requests per month by surface"
            caption={
              mark === 'donut'
                ? 'A part-to-whole with two parts. Three would be a puzzle to read, so the ring refuses it.'
                : 'April is the month the collector changed, and both surfaces jumped.'
            }
            yMax={yMax}
            centreLabel={mark === 'donut' ? '72 shipped' : undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">The two props that change the claim</CardTitle>
          <CardDescription>
            A caller supplied ceiling, and a plot box that is not the default
            height. Neither is decoration: the first can put a mark above the top
            gridline, and the second is the difference between a chart that fits
            a card and one that fits a column.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={ceiling ? 'default' : 'outline'} onClick={() => setCeiling((v) => !v)}>
              {ceiling ? 'Derive the axis' : 'Cap the axis at 200'}
            </Button>
            <Button variant={tall === 240 ? 'default' : 'outline'} onClick={() => setTall(240)}>
              240 tall
            </Button>
            <Button variant={tall === 320 ? 'default' : 'outline'} onClick={() => setTall(320)}>
              320 tall
            </Button>
          </div>

          <Chart
            variant="line"
            labels={MONTHS}
            series={TONES}
            label="Requests per month by surface"
            height={tall}
            yMax={yMax}
            caption={
              ceiling
                ? 'With the ceiling at 200 the two values above it are clamped to the top gridline, and the count is on the figure as data-clamped.'
                : 'With no ceiling the axis runs to the largest value and rounds up to a readable step.'
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">One series, no tone</CardTitle>
          <CardDescription>
            A series with no <code className="font-mono">tone</code> takes the
            supporting ink and the legend is left off, because with one series
            there is nothing to tell apart.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Chart
            variant="area"
            labels={MONTHS}
            series={UNTONED}
            label="Sessions per month"
            caption="The default ink is not a series role."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">The legend on its own</CardTitle>
          <CardDescription>
            <code className="font-mono">ChartLegend</code> takes the same series
            array, so a layout that wants the legend beside the figure rather than
            under it passes <code className="font-mono">{'legend={false}'}</code> and
            renders it here. The two cannot disagree, because there is only one
            array.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Chart
            variant="bar"
            labels={MONTHS}
            series={TONES}
            label="Requests per month by surface"
            legend={false}
          />
          <ChartLegend series={TONES} className="mt-4 justify-center" />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        There is a table under every chart on this page, and you cannot see it. It
        is in the document, visually hidden, holding the same numbers the marks
        were drawn from: a screen reader navigates it by row and by cell, a
        crawler reads the figures out of it, and a print stylesheet that has lost
        every colour on this page still gets the values. Turn on your reader mode
        or print the page to see it. Nothing about the drawing depends on it and
        no prop turns it off.
      </p>
    </div>
  )
}
