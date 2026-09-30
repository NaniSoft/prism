import type { ComponentProps } from 'react'

import type { ChartColor } from './chart-frame'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableRow } from './table'
import { cn } from '../../lib/utils'

/** The fill a series mark is drawn in, from the role the caller assigned it. */
const FILL: Record<ChartColor, string> = {
  'chart-1': 'bg-chart-1',
  'chart-2': 'bg-chart-2',
  'chart-3': 'bg-chart-3',
  'chart-4': 'bg-chart-4',
  'chart-5': 'bg-chart-5',
}

/**
 * The stroke a line is drawn in, from the same role and no other.
 *
 * The same five entries `ChartFrame` draws from, spelled here because that
 * Component keeps its maps to itself, and the honest cost is a sixth series role
 * added to the token contract would have to be answered in two places. What keeps
 * the restatement from drifting is the annotation: both maps are typed
 * `Record<ChartColor, string>`, so a new role in `ChartColor` is a type error at
 * the map rather than a mark that silently falls through to no ink.
 */
const STROKE: Record<ChartColor, string> = {
  'chart-1': 'stroke-chart-1',
  'chart-2': 'stroke-chart-2',
  'chart-3': 'stroke-chart-3',
  'chart-4': 'stroke-chart-4',
  'chart-5': 'stroke-chart-5',
}

/**
 * The band left empty at the top and bottom of the box, as a percentage.
 *
 * The stroke is a pixel and a half on a box two dozen pixels tall, with round
 * caps, so a value at the very top of the range would put half its stroke outside
 * the box and collide with whatever is on the line above. Ten percent of the
 * height is a little over two pixels at the default size, which is the stroke and
 * its cap, and it costs a fifth of the vertical range. A sparkline is read for its
 * shape and not for its extremes, so that is the right thing to spend.
 */
const INSET = 10

/** The props the Sparkline accepts. */
export interface SparklineProps extends Omit<ComponentProps<'figure'>, 'children'> {
  /**
   * The readings, in order, in the caller's own units.
   *
   * Raw magnitudes rather than percentages of a maximum, for the reason
   * `PulseSeries` gives for its columns and the reason `ChartFrame` gives for its
   * scale: a caller that pre-normalises has two chances to get the axis wrong, and
   * a mislabelled axis is a lie with a typeface on it. The tallest reading sets
   * the top of the box here, and the smallest sets the bottom.
   */
  values: readonly number[]
  /**
   * The name of the series, and the only thing a screen reader reads before the
   * numbers.
   *
   * Required rather than defaulted, and required for the same two reasons
   * `ChartFrame` gives: two sparklines in a table of numbers are two pictures a
   * reader cannot tell apart, and a picture with no name is not announced and not
   * linkable. A sparkline named "Chart" is a Component shipping a sentence about a
   * product it knows nothing about.
   */
  label: string
  /**
   * The role the line is drawn in. @defaultValue 'chart-1'
   *
   * One of the five the token contract publishes, and never a raw colour: a
   * series colour is a claim about what a thing is, and a Component that knows
   * nothing about the caller's product has no business choosing one, so the caller
   * chooses and gets the same ink in every pack and both modes. The default is
   * `chart-1` because a sparkline is usually alone in its cell and has no series
   * to be distinguished from.
   */
  tone?: ChartColor
  /**
   * The width of the box, in pixels. @defaultValue 96
   *
   * A number in pixels rather than a token, and the cost is that a sparkline is
   * not fluid: one in a column that resizes does not resize with it. The reason is
   * that a sparkline lives in a table cell or a list row, where its job is to sit
   * at one size in a column of rows and line up with the figures beside it, and a
   * percentage of a fluid cell would make every row a different width.
   */
  width?: number
  /**
   * The height of the box, in pixels. @defaultValue 24
   *
   * Two dozen pixels because a sparkline is a mark, not a plot: it is read beside
   * its number rather than examined, and a box tall enough to read an axis would
   * be a chart, which is `ChartFrame`.
   */
  height?: number
  /**
   * Whether the last reading takes a mark.
   *
   * Off by default, because a line with a dot on its end is a claim that the end
   * is special. On when the series is a live reading, where the last value is the
   * one the reader came for and the shape behind it is context.
   */
  emphasizeLast?: boolean
}

/**
 * A series drawn small enough to sit in a cell, and the numbers behind it.
 *
 * **It is decorative and described, and both halves are needed.** The drawing is
 * `aria-hidden` and carries no information a reader can use on its own: a
 * 96-pixel line with no axis, no labels and no legend is a shape, and a shape a
 * reader cannot query is the failure a chart exists to prevent. So the values are
 * also rendered as a table in a visually hidden wrapper, generated from the same
 * array the line is drawn from, which means a screen reader reaches every number,
 * a reader's own table navigation can walk it, and a crawler indexing the page
 * finds the figures rather than a picture. That is the honest answer for a figure
 * whose entire claim is its shape, and the cost is real: a table of two hundred
 * rows in the document for a sparkline that occupies ninety-six pixels.
 *
 * **The table has no column headings, and that is a gap with a reason.** The
 * positions are numbered rather than named, because this Item has no words for
 * what a position is called and inventing "Time" or "Index" would be a claim
 * about the caller's data. The row head carries the position, the cell carries the
 * number, and the caption is the caller's own `label`. A caller whose readings
 * have names, a category axis, a legend, a second series or a visible table is
 * looking for `ChartFrame`, which is the Component that has room for all of it.
 *
 * **Two inputs throw rather than draw, because a drawn lie is worse than a
 * refusal.** An empty `values` array is a frame with no claim in it, and a series
 * whose readings are all the same number is a straight stroke with no information
 * in it. A reader cannot tell a flat line from a broken chart, and the only thing
 * that separates them is a diagnostic the caller sees. The alternative was to draw
 * a horizontal line, which is what a charting library does, and which answers
 * "the data is flat" with a picture that also answers "the chart is broken".
 *
 * **A line is scaled to its own range, with no floor at zero, and the cost is
 * named here.** A bar has to start at zero or its length is not a measurement,
 * which is why `ChartFrame` floors every scale. A line is read for the shape
 * between its points, and a series between 900 and 1,000 floored at zero is a
 * flat line drawn faithfully, which is a picture that hides the thing it was put
 * there to show. So the range is the data's own. The price is that a series that
 * moves by two percent looks dramatic, and the answer is the table, which carries
 * the numbers at the precision the caller gave them.
 *
 * **The geometry is `ChartFrame`'s geometry.** The `<svg>` has no `viewBox` and
 * its coordinates are percentages of the box, so the stroke is pixels rather than
 * user units and a two-pixel line is two pixels in every box size, and one
 * `<line>` is drawn per pair of readings rather than a `polyline`, because a
 * `points` attribute is a list of coordinate pairs joined by a space and a
 * Component here ships no word-shaped literal. The tone is a semantic utility from
 * the contract, so a scoped pack boundary restyles the line through the cascade
 * rather than through a value the drawing is holding.
 *
 * It is a server Component. No hook, no state, and the line is arithmetic over
 * props, so a dashboard full of sparklines costs no client code at all.
 */
function Sparkline({
  className,
  values,
  label,
  tone = 'chart-1',
  width = 96,
  height = 24,
  emphasizeLast = false,
  ...props
}: SparklineProps) {
  if (values.length === 0) {
    throw new Error(
      'Sparkline: values is empty, so there is no series to draw. A sparkline with nothing in it ' +
        'is a frame carrying no claim. Pass the readings, or render the number instead of a line.',
    )
  }

  const lowest = Math.min(...values)
  const tallest = Math.max(...values)
  if (lowest === tallest) {
    throw new Error(
      'Sparkline: every reading in the series is the same number, so a line through them is a ' +
        'stroke with no information in it and a reader cannot tell that from a broken chart. Pass ' +
        'the series, or if the quantity genuinely never changes, render the number instead of a line.',
    )
  }

  // The range is the data's own, so a narrow series is still a readable shape and
  // the stroke stays a stroke at any box size. See the JSDoc above for why there
  // is no floor at zero. A single reading has thrown above, because one value is
  // a series whose readings are all equal, so the divisor below is never zero.
  const span = tallest - lowest
  const at = (index: number) => (index / (values.length - 1)) * 100
  const up = (value: number) => INSET + (1 - (value - lowest) / span) * (100 - INSET * 2)

  const last = values.length - 1

  return (
    <figure
      data-slot="sparkline"
      aria-label={label}
      className={cn('inline-flex shrink-0 flex-col', className)}
      style={{ width, height }}
      {...props}
    >
      <span data-slot="sparkline-plot" aria-hidden="true" className="relative block size-full">
        {/*
          No `viewBox`, and coordinates in percentages, for the reason the
          JSDoc gives: without a viewBox there is no coordinate system to
          stretch, so the stroke is a stroke rather than a number of user units
          in a box that was scaled unevenly.
        */}
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible">
          {values.slice(1).map((value, index) => (
            <line
              key={index}
              x1={`${at(index)}%`}
              y1={`${up(values[index])}%`}
              x2={`${at(index + 1)}%`}
              y2={`${up(value)}%`}
              className={STROKE[tone]}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {emphasizeLast ? (
          <span
            data-slot="sparkline-last"
            className={cn(
              'absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
              FILL[tone],
            )}
            style={{ left: `${at(last)}%`, top: `${up(values[last])}%` }}
          />
        ) : null}
      </span>

      {/*
        The numbers, from the same array the line came from, so the two cannot
        disagree. There is no second copy of the data to fall behind, which is
        the failure `ChartFrame` states in full and the reason this table is
        generated here rather than passed in as a prop.
      */}
      <div data-slot="sparkline-table" className="sr-only">
        <Table>
          <TableCaption>{label}</TableCaption>
          <TableBody>
            {values.map((value, index) => (
              <TableRow key={index}>
                <TableHead scope="row" className="font-medium tabular-nums">
                  {index + 1}
                </TableHead>
                <TableCell className="tabular-nums">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </figure>
  )
}

export { Sparkline }
