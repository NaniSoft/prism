import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

/**
 * The one of the five series roles a series is drawn in.
 *
 * These are the token names rather than a Prism-specific alias, and that is the
 * whole contract: `chart-1` through `chart-5` is the only five-way colour set
 * the token contract publishes, so a consumer who wants a particular series in a
 * particular colour names the role and gets it in every pack and both modes. A
 * wider type here would be a wider palette, and a wider palette is a second
 * source of truth for something the tokens already own.
 */
export type ChartColor = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'

/**
 * How the series are drawn.
 *
 * Two marks, and the split is about what the reader compares. A line is for a
 * value that moves continuously across the categories, where the shape between
 * two points is the point. A bar is for a value read against a baseline, where
 * the length is the measurement and the gap between two bars means nothing. A
 * consumer that draws a bar chart of weekly signups is drawing the right mark
 * and saying the wrong thing; the bars invite a comparison of lengths that only
 * means something when the value starts at zero.
 */
export type ChartMark = 'line' | 'bar'

/** One series: a name, the role it is drawn in, and one value per category. */
export type ChartSeries = {
  /**
   * A stable key for the series.
   *
   * Required, because the same series is a line, a dot, a legend entry and a
   * table column, and a reader whose focus is in the table must land in the
   * column for the series they were reading. Keyed on the caller's own id rather
   * than on the position in the array, so reordering the series does not move a
   * reader's focus to a different series.
   */
  id: string
  /**
   * The name of the series, in the caller's words.
   *
   * It appears in the legend, in the table's column head, and nowhere else. This
   * is the string that makes a colour a name: a chart drawn in `chart-2` and
   * `chart-5` is unreadable to anyone who cannot separate teal from red, and
   * `chart-2` measures 2.49:1 against a light card, which is a second reason the
   * legend is not optional here.
   */
  label: string
  /**
   * The role this series is drawn in.
   *
   * The caller assigns it and the Component never does, because a series colour
   * is a claim about what a thing is: the revenue line is the brand hue and the
   * churn line is the alarming one, and a Component that picked by position
   * would be making that claim on the caller's behalf and getting it wrong on
   * every chart after the first.
   */
  color: ChartColor
  /**
   * One value per category, in the order the categories are given.
   *
   * A value may be `null` for a gap, and a series shorter than the categories
   * is padded with gaps rather than shifted: a value under the wrong category is
   * a wrong answer that looks right, and it is the failure this shape is most
   * likely to produce. A value longer than the categories is ignored, and it does
   * not set the vertical scale either, because a value with no category has
   * nowhere to be drawn.
   */
  values: readonly (number | null)[]
}

/** The props the ChartFrame accepts. */
export interface ChartFrameProps extends Omit<ComponentProps<'figure'>, 'children' | 'title'> {
  /**
   * The categories along the horizontal axis, in order. The caller's words.
   *
   * A month name, a release name, a region name, a build number. This is the
   * array that makes a chart a claim about the caller's own domain rather than
   * about a design system, which is why it is a prop and not a date range the
   * Component generates: a chart that named its own months would be wrong in
   * every product but the one it was written for.
   */
  categories: readonly string[]
  /** The series, each with the role it is drawn in. */
  series: readonly ChartSeries[]
  /**
   * The mark the series are drawn with. @defaultValue 'line'
   *
   * Every series in one chart takes the same mark. Mixing them is a chart about
   * two different things, and a reader cannot tell which series the mark is
   * making a claim about.
   */
  mark?: ChartMark
  /**
   * The accessible name of the figure.
   *
   * Required rather than defaulted, because two charts on a dashboard are two
   * figures a reader cannot tell apart, and because the name is the only thing
   * that states what is being plotted. A figure named "Chart" is a Component
   * shipping a sentence about a product it knows nothing about.
   */
  label: string
  /** The visible heading above the plot, when the surrounding layout has none. */
  title?: ReactNode
  /**
   * The words the data table is captioned with.
   *
   * Required, and separate from `label`, because the two are read at different
   * points and mean different things: the name identifies the figure, the
   * caption identifies the table a reader has just navigated into. Collapsing
   * them would leave a caption that names the figure rather than the numbers.
   */
  tableCaption: ReactNode
  /**
   * The head of the category column in the data table.
   *
   * Required for the same reason the series names are: the table's first column
   * holds the caller's categories and a column of values with no head is a
   * column of numbers a reader has to guess the meaning of. It is the word for
   * whatever the categories are: "Month", "Region", "Build".
   */
  categoryHeading: string
  /**
   * Whether the data table is seen as well as announced. @defaultValue 'visible'
   *
   * The table is always in the document either way. `hidden` moves it to
   * `sr-only`, so it is still announced, still reachable by a screen reader's
   * table navigation and still findable by the reader's own find-in-page; what
   * changes is whether a sighted reader can see it. A consumer with a dense
   * dashboard, where five visible tables under five plots is more surface than
   * the page can carry, passes `hidden` and keeps the representation. A consumer
   * whose readers are looking up exact figures leaves it visible, because a table
   * nobody can see is a table a reader does not know to ask for.
   */
  table?: 'visible' | 'hidden'
  /**
   * The words for a value on the vertical axis, given the number.
   *
   * Defaults to the number itself, and deliberately not shared with the table:
   * an axis has room for four characters and a table has room for a currency
   * symbol, so the two jobs want different renderings and a consumer that
   * compacts the axis wants the table to keep the exact figure. Passing `format`
   * alone is the normal case and is exactly the split these two jobs want.
   */
  format?: (value: number) => string
  /**
   * The words for a value in the data table, given the number.
   *
   * Defaults to the number itself, so a table of currency is a `tableFormat` away
   * and a table of raw counts needs nothing.
   */
  tableFormat?: (value: number) => string
  /**
   * What a reader is told when there is nothing to plot.
   *
   * An empty chart is a state a caller reaches on a first load, on a filter that
   * matched nothing and on a range with no events in it, and an empty plot box
   * with an axis and no marks reads as a broken chart rather than as an answer.
   * The words are the caller's, because only the caller knows whether the answer
   * is "no data yet" or "no results for this filter".
   */
  empty?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/** The fill a series is drawn in, from the role the caller assigned it. */
const FILL: Record<ChartColor, string> = {
  'chart-1': 'bg-chart-1',
  'chart-2': 'bg-chart-2',
  'chart-3': 'bg-chart-3',
  'chart-4': 'bg-chart-4',
  'chart-5': 'bg-chart-5',
}

/** The stroke a line is drawn in, from the same role and no other. */
const STROKE: Record<ChartColor, string> = {
  'chart-1': 'stroke-chart-1',
  'chart-2': 'stroke-chart-2',
  'chart-3': 'stroke-chart-3',
  'chart-4': 'stroke-chart-4',
  'chart-5': 'stroke-chart-5',
}

/**
 * Where a category label is nudged to sit, so a label never hangs off the plot.
 *
 * A label is centred on its category, which puts the first and the last half
 * outside the field. The edge labels are pinned to the edge instead, so a line
 * whose first and last points are on the boundary have their labels on it too.
 * A bar's categories are column centres with room on both sides, so every label
 * is centred.
 */
const LABEL_ALIGN = {
  first: 'translate-x-0',
  last: '-translate-x-full',
  middle: '-translate-x-1/2',
} as const

/**
 * The step a gridline is drawn at: one, two, five or ten times a power of ten.
 *
 * The point is that the axis reads 0, 50, 100 rather than 0, 37, 74. A reader
 * who has to do arithmetic to place a value on an axis is doing the chart's job,
 * and a gridline at an arbitrary fraction of the range is the first thing that
 * makes two charts look like they were built by two people.
 */
function niceStep(rough: number): number {
  if (!Number.isFinite(rough) || rough <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalised = rough / magnitude
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10
  return step * magnitude
}

/** A value that has been through a floor, a multiply and an add, back to a readable number. */
function tidy(value: number): number {
  return Number(value.toFixed(10))
}

/** The vertical scale of one chart, and the two functions that place a value on it. */
type Scale = {
  /** The lowest gridline. Zero or below, because a bar's length is measured from a baseline. */
  low: number
  /** The highest gridline. */
  high: number
  /** Every gridline's value, from the bottom of the field up. */
  lines: readonly number[]
  /** Where a value sits, as a percentage from the top of the field down. */
  at: (value: number) => number
  /** A value's bar: its top edge and its height, both as percentages of the field. */
  bar: (value: number) => { top: number; height: number }
}

/**
 * The vertical scale, derived from the values that have somewhere to be drawn.
 *
 * **The floor is zero, and that is a claim about bars rather than about lines.**
 * A bar's length is only a measurement when it starts at a shared baseline, so
 * the scale always includes zero. The cost is that a line whose values sit
 * between 900 and 1,000 is drawn almost flat, and the answer to that is a scale
 * the caller chooses, not a floor this Component drops: a reader who needs to
 * see the shape of a narrow range reads the table, which carries the numbers at
 * full precision.
 *
 * **A negative value gets a real region below the baseline** rather than a
 * zero-height bar. A profit-and-loss chart that drew a loss as nothing is a
 * chart that is confidently wrong, and the cost of the region is one more
 * gridline. Zero is always one of the lines, because both ends are multiples of
 * the step, so the baseline is always on the axis and always labelled.
 *
 * **A series whose values are all the same number, or all zero, has no range to
 * divide by.** It is given one step of scale so the field has a top and a
 * bottom and every mark inside it is a position rather than a NaN.
 */
function scaleOf(values: readonly number[]): Scale {
  let lowest = 0
  let highest = 0
  for (const value of values) {
    if (!Number.isFinite(value)) continue
    if (value < lowest) lowest = value
    if (value > highest) highest = value
  }

  const step = niceStep((highest - lowest) / 4)
  const first = Math.floor(lowest / step) * step
  // Ceiled rather than rounded, because a rounded count can leave the largest
  // value above the top gridline, and a mark drawn above its own axis is a mark
  // off the plot. The epsilon absorbs the float error that would otherwise add a
  // whole extra gridline to an axis that already lands on one exactly.
  const count = Math.max(1, Math.ceil((highest - first) / step - 1e-9))
  const last = first + count * step
  const span = last - first

  const at = (value: number) => {
    const clamped = Math.min(Math.max(value, first), last)
    return ((last - clamped) / span) * 100
  }

  return {
    low: first,
    high: last,
    lines: Array.from({ length: count + 1 }, (_, index) => tidy(first + index * step)),
    at,
    // The bar spans between the value and the zero line, which are the same
    // point when the value is zero. `at` counts from the top, so the top edge is
    // whichever of the two is nearer the top and the height is the distance
    // between them; a positive value therefore grows downward from its own top
    // edge and a negative one hangs below the baseline.
    bar: (value: number) => {
      const here = at(value)
      const baseline = at(0)
      return { top: Math.min(here, baseline), height: Math.abs(here - baseline) }
    },
  }
}

/**
 * Where a category sits on the horizontal axis, as a percentage of the field.
 *
 * A line's points run from the first category to the last, so the axis is the
 * gap between them; a single category has no gap to divide by and sits in the
 * middle, which is the only place a lone category can be read against anything.
 * A bar's category is a column rather than a point, so its position is the
 * column's centre, and that is the same reason a bar chart's first bar is not
 * flush with the axis.
 */
function categoryAt(index: number, total: number, mark: ChartMark): number {
  if (mark === 'bar') return ((index + 0.5) / total) * 100
  if (total <= 1) return 50
  return (index / (total - 1)) * 100
}

/** Where a category label is nudged to sit, so no label hangs off the plot. */
function labelAlign(index: number, total: number, mark: ChartMark): string {
  if (mark === 'bar' || total < 2) return LABEL_ALIGN.middle
  if (index === 0) return LABEL_ALIGN.first
  if (index === total - 1) return LABEL_ALIGN.last
  return LABEL_ALIGN.middle
}

/** The default reading of a value: the number itself. */
function identity(value: number): string {
  return String(value)
}

/**
 * A chart: the frame every chart in a product shares, and the numbers behind it.
 *
 * **One frame is the design.** Five charts that each draw their own axes are
 * five sets of numbers that do not line up, and a dashboard where two plots
 * disagree by six pixels looks broken in a way nobody can name, because the
 * reader cannot see the six pixels: they can only see that the two charts do not
 * agree. So the axis gutter, the field's height, the gridline spacing and the
 * category row are all fixed here, and two charts in a row have the same plot box
 * whatever their data says. The gutter in particular is a fixed width rather than
 * a width that fits the longest label, because a gutter that grows with the
 * numbers is the mechanism by which two charts stop aligning.
 *
 * **The colour is assigned by the caller and drawn from the token contract.**
 * `chart-1` through `chart-5` arrive as the five semantic utilities, and there
 * is no hex, no ramp step and no `rgb()` anywhere in this Component. A series
 * colour is a claim about what a thing is, so the Component that knows nothing
 * about the caller's product has no business choosing one.
 *
 * **The table is part of the frame, not a prop beside it, and that is the other
 * half of the design.** A chart whose accessible representation is a sibling
 * prop is a chart whose table a consumer wrote once and updated when the data
 * changed, which is to say a chart whose table says last quarter. Here the marks
 * and the cells are two renderings of one `series` array, so they cannot drift:
 * there is no second copy to fall behind. The table is always in the document,
 * and `table` decides whether it is also seen.
 *
 * **The legend is always drawn.** It is the only place the series-to-colour
 * assignment is stated in words, and it is not optional because two of the five
 * roles measure below 3:1 against a light card: `chart-2` at 2.49:1 and
 * `chart-3` at 2.15:1 in the default pack. A mark in either is found by its
 * position and its shape, not by its colour, so the name beside it is what makes
 * it a series rather than a shape. Past about three series, hue is the only
 * channel left and the table is the answer, which is a fact about the data and
 * not about this Component.
 *
 * **It is a server Component.** No hook, no state, no effect and no event
 * handler: the plot is arithmetic over props and the table is a table. A chart
 * that animated its draw-in would be refused by this system's motion rules, and
 * the one motion here is a bar resizing when its value changes, which is state
 * feedback and is the only kind this system allows.
 *
 * **What this is not.** There is no scale beyond the one described above, no
 * tick generation to choose, no hover tooltip, no crosshair, no zoom, no
 * stacking, no curve interpolation, and no draw-in animation. A tooltip would be
 * a hover affordance over a picture, and a picture a reader cannot query is the
 * failure the table exists to prevent, so the exact value is answered by the
 * table rather than by a surface that appears under a pointer. A consumer that
 * needs any of those is reaching for a charting library, and this Component is
 * the frame that library's marks should sit in rather than the library.
 */
function ChartFrame({
  categories,
  series,
  mark = 'line',
  label,
  title,
  tableCaption,
  categoryHeading,
  table = 'visible',
  format = identity,
  tableFormat = identity,
  empty,
  className,
  ...props
}: ChartFrameProps) {
  // The scale is built from the values that have a category to be drawn against.
  // A value past the end of the categories is neither drawn nor tabulated, and
  // letting one into the scale would stretch the axis around a mark that is not
  // in the picture, which is the quietest way a chart can be wrong.
  const plotted = series.flatMap((entry) =>
    categories
      .map((_, index) => entry.values[index])
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value)),
  )

  const heading =
    title === undefined ? null : (
      <figcaption data-slot="chart-title" className="text-sm font-medium">
        {title}
      </figcaption>
    )

  if (plotted.length === 0) {
    // The empty state keeps the height of the field it replaces. A chart whose
    // empty state is one line of text is a row on a dashboard that changes height
    // when its data arrives, and the row that moves is the row the reader was
    // looking at.
    return (
      <figure
        data-slot="chart-frame"
        aria-label={label}
        className={cn('flex w-full flex-col gap-3', className)}
        {...props}
      >
        {heading}
        <div
          data-slot="chart-empty"
          className="text-muted-foreground flex h-48 items-center justify-center rounded-md border border-dashed text-sm"
        >
          {empty ?? null}
        </div>
      </figure>
    )
  }

  const scale = scaleOf(plotted)
  const total = categories.length

  return (
    <figure
      data-slot="chart-frame"
      aria-label={label}
      className={cn('flex w-full flex-col gap-3', className)}
      {...props}
    >
      {heading}

      <div data-slot="chart-plot" className="flex flex-col gap-3">
        <div data-slot="chart-plot-row" className="flex items-stretch gap-2">
          {/*
           * The gutter is a fixed width and the field is a fixed height, and
           * neither is derived from the data. That is the whole alignment claim,
           * and it is why a chart of four-digit numbers and a chart of one-digit
           * numbers put their plots in the same box: a gutter that sized itself
           * to its longest label would move the second chart's plot sideways the
           * first time a number grew a digit.
           */}
          <div data-slot="chart-axis-y" className="relative w-14 shrink-0">
            {scale.lines.map((value) => (
              <span
                key={value}
                data-slot="chart-tick"
                className="text-muted-foreground absolute right-0 -translate-y-1/2 text-xs tabular-nums"
                style={{ top: `${scale.at(value)}%` }}
              >
                {format(value)}
              </span>
            ))}
          </div>

          <div data-slot="chart-field" className="relative h-48 flex-1">
            {scale.lines.map((value) => (
              <span
                key={value}
                data-slot="chart-gridline"
                aria-hidden="true"
                className="border-border absolute inset-x-0 border-t"
                style={{ top: `${scale.at(value)}%` }}
              />
            ))}

            {mark === 'bar' ? (
              /*
               * One column per category, each holding one bar per series, so the
               * series are side by side inside a category rather than stacked
               * across the whole field. The column is a flex child, so a plot 600
               * pixels wide and a plot 240 pixels wide divide the same way, which
               * is the other half of the alignment claim.
               */
              <div data-slot="chart-columns" aria-hidden="true" className="absolute inset-0 flex">
                {categories.map((_, column) => (
                  <div key={column} data-slot="chart-column" className="relative flex-1">
                    {series.map((entry, seriesIndex) => {
                      const value = entry.values[column]
                      if (typeof value !== 'number' || !Number.isFinite(value)) return null
                      const { top, height } = scale.bar(value)
                      const slot = 100 / series.length
                      return (
                        <span
                          key={entry.id}
                          data-slot="chart-bar"
                          data-series={entry.id}
                          aria-hidden="true"
                          className={cn(
                            'absolute transition-[top,height] duration-base ease-out',
                            value < 0 ? 'rounded-b-sm' : 'rounded-t-sm',
                            FILL[entry.color],
                          )}
                          style={{
                            // The one-pixel inset on each side is the gap between
                            // neighbouring series. A pixel rather than a
                            // percentage, because a percentage of a narrow column
                            // is less than a pixel, and a gap nobody can see is a
                            // grouping the colour has to carry on its own.
                            left: `calc(${seriesIndex * slot}% + 1px)`,
                            width: `calc(${slot}% - 2px)`,
                            top: `${top}%`,
                            height: `${height}%`,
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              series.map((entry) => {
                const points = categories
                  .map((_, index) => ({ index, value: entry.values[index] }))
                  .filter(
                    (point): point is { index: number; value: number } =>
                      typeof point.value === 'number' && Number.isFinite(point.value),
                  )
                if (points.length === 0) return null
                const place = (point: { index: number; value: number }) => ({
                  x: categoryAt(point.index, total, mark),
                  y: scale.at(point.value),
                })
                return (
                  <div key={entry.id} data-slot="chart-line" data-series={entry.id} className="contents">
                    {points.length > 1 ? (
                      /*
                       * The stroke is drawn as one `line` per pair of points, in
                       * percentages of the plot box, inside an `svg` with no
                       * `viewBox`. That is deliberate on both counts. No `viewBox`
                       * means no coordinate system to stretch, so a 2-pixel stroke
                       * is 2 pixels rather than 2 units in a box that was scaled
                       * unevenly, and it is why no `vector-effect` is needed
                       * either. Percentages mean a mark's position is a share of
                       * the plot box and not a number the caller has to agree on.
                       *
                       * One `line` per pair rather than a `polyline` is the
                       * other half, and it is a constraint rather than a
                       * preference: a Component here ships no reader-facing
                       * string, and a polyline's `points` is a list of coordinate
                       * pairs joined by a space, which is a word-shaped literal in
                       * a Component. Rounded caps on each segment meet at the
                       * joints as a 2-pixel circle, which is what a rounded line
                       * join draws anyway.
                       */
                      <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 size-full overflow-visible"
                      >
                        {points.slice(1).map((point, index) => {
                          const from = place(points[index] as { index: number; value: number })
                          const to = place(point)
                          return (
                            <line
                              key={point.index}
                              x1={`${from.x}%`}
                              y1={`${from.y}%`}
                              x2={`${to.x}%`}
                              y2={`${to.y}%`}
                              className={STROKE[entry.color]}
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          )
                        })}
                      </svg>
                    ) : null}
                    {points.map((point) => (
                      <span
                        key={point.index}
                        data-slot="chart-point"
                        data-series={entry.id}
                        aria-hidden="true"
                        className={cn(
                          'absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                          FILL[entry.color],
                        )}
                        style={{
                          left: `${categoryAt(point.index, total, mark)}%`,
                          top: `${scale.at(point.value)}%`,
                        }}
                      />
                    ))}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div data-slot="chart-axis-x-row" className="flex items-stretch gap-2">
          {/*
           * The category row carries the same gutter as the plot row, so a label
           * is positioned against the same left edge the gridlines start at. The
           * gutter is empty and `aria-hidden` because it holds no information: it
           * is the space the vertical axis's numbers occupy above.
           */}
          <span data-slot="chart-axis-x-gutter" aria-hidden="true" className="w-14 shrink-0" />
          <div data-slot="chart-axis-x" className="relative h-4 flex-1">
            {categories.map((category, index) => (
              <span
                // Positional, because a category is a place on the axis rather
                // than a record, and two categories may legitimately share a name.
                key={index}
                data-slot="chart-category"
                className={cn(
                  'text-muted-foreground absolute top-0 max-w-20 truncate text-xs',
                  labelAlign(index, total, mark),
                )}
                style={{ left: `${categoryAt(index, total, mark)}%` }}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/*
       * The legend is drawn whatever the series count, because it is the only
       * statement of the series-to-colour assignment anywhere on the frame. A
       * chart in one colour needs no legend to say which colour, and pays one
       * line for the guarantee that no chart in this package can be read by
       * colour alone.
       */}
      <ul data-slot="chart-legend" className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {series.map((entry) => (
          <li key={entry.id} data-slot="chart-legend-entry" className="flex items-center gap-1.5">
            <span
              data-slot="chart-swatch"
              aria-hidden="true"
              className={cn('size-2.5 shrink-0 rounded-sm', FILL[entry.color])}
            />
            {entry.label}
          </li>
        ))}
      </ul>

      {/*
       * The table is the frame's own rendering of the same `series` array the
       * marks came from, which is what makes "the table and the marks agree" a
       * property of the Component rather than a thing a consumer has to keep up.
       * A cell for a value that is `null`, and a cell for a value a series did
       * not reach, are both empty, so a gap is visibly not a zero.
       */}
      <div
        data-slot="chart-table"
        className={table === 'visible' ? undefined : 'sr-only'}
      >
        <Table>
          <TableCaption>{tableCaption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">{categoryHeading}</TableHead>
              {series.map((entry) => (
                <TableHead key={entry.id} className="text-right tabular-nums">
                  {entry.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={index}>
                <TableHead scope="row" className="font-medium">
                  {category}
                </TableHead>
                {series.map((entry) => {
                  const value = entry.values[index]
                  return (
                    <TableCell
                      key={entry.id}
                      className="text-right tabular-nums"
                      data-series={entry.id}
                    >
                      {typeof value === 'number' && Number.isFinite(value)
                        ? tableFormat(value)
                        : null}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </figure>
  )
}

export { ChartFrame }
