import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { ChartColor } from './chart-frame'
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
 * The marks this Component draws.
 *
 * This is the one place in the package where the word is a prop rather than a
 * catalogue unit, and the shape of the type is the reason that is allowed.
 * DESIGN.md's export surface says a component takes `variant` and `size` props
 * and that what it will not publish is a variant recipe: a raw map of class
 * strings is a CSS recipe wearing a component's name, and a consumer who
 * receives one has been handed a styling API to memorise. So the value is a
 * closed set of four marks, each a machine value the drawing branches on, and
 * the class strings stay here where the drawing is. A caller picks a mark; a
 * caller does not pick a colour, a radius, a shadow and a border width to get
 * one.
 *
 * `bar` and `line` are the pair `ChartFrame` already separates, and the
 * separation is about what the reader compares rather than about taste. A line
 * is for a value that moves continuously across the categories, where the shape
 * between two points is the point. A bar is for a value read against a shared
 * baseline, where the length is the measurement and the gap between two bars
 * means nothing. `area` is the line with the region under it filled, which
 * changes what the reader is asked to do: a line asks where it went and an area
 * asks how much there was. `donut` is a part-to-whole, and it is the narrowest
 * of the four; read `Chart` for why it is here at all.
 *
 * **The type is `ChartForm` and the prop is `variant`, and the two names
 * differing is the gate working rather than a slip.** `check-surface.mjs` refuses
 * to let a public entry export a name ending in `Variant`, because in this
 * package that shape means a cva map: a recipe a consumer could read and compose
 * with. This union is not a recipe, it is the closed set of marks a drawing
 * branches on, and it is named for the marks rather than for the prop. The prop
 * keeps the name `variant` because a Component is allowed to take one, which is
 * the distinction `DESIGN.md`'s export surface draws: the prop is an input, a
 * `*Variants` export is an API. `MeterTone`, `StatusTone` and `AnnouncementTone`
 * are named the same way for the same reason.
 */
export type ChartForm = 'bar' | 'line' | 'area' | 'donut'

/**
 * One series: what it is called, its values, and the role it is drawn in.
 *
 * `tone` is `ChartColor`, imported from `chart-frame` rather than redeclared
 * here, and that import is the whole contract. `chart-1` through `chart-5` is
 * the only five-way colour set the token contract publishes, so a consumer who
 * wants a particular series in a particular colour names the role and gets it
 * in every pack and both modes. A Prism-specific alias spelled differently here
 * would be a wider type, a wider type would be a wider palette, and a wider
 * palette is a second source of truth for something the tokens already own.
 * `chart-frame.tsx` states the same reasoning on its own type and this file
 * takes the same answer rather than a parallel one, which is the only way two
 * Components in one package end up agreeing about what `chart-3` is.
 *
 * **The name is `ChartData` and not `ChartSeries`, and the reason is a collision
 * rather than a preference.** `chart-frame.tsx` already exports a `ChartSeries`,
 * a time series with nullable points, and it shipped: it is in the catalogue at
 * `0.13.0` and a consumer reaches it at
 * `@nanisoft/prism-ui/components/chart-frame`. A published type cannot be
 * renamed cheaply, so this file took the other name. `ChartData` says what an
 * entry is, which is a measured column with a name and a tone, and the two types
 * are close enough that a reader who meets both will assume they are the same
 * one. They are not, and the honest place to say so is here.
 */
export type ChartData = {
  /**
   * The name of the series, in the caller's words.
   *
   * It appears in the legend and in the head of the table's column, and nowhere
   * else. This is the string that makes a colour a name: a chart drawn in
   * `chart-2` and `chart-5` is unreadable to anyone who cannot separate teal
   * from red, and `chart-2` measures 2.49:1 against a light card, which is a
   * second reason the legend is not decoration.
   */
  name: string
  /**
   * One value per category, in the order the categories are given.
   *
   * `labels` on `Chart` is the array that says what a category is, and a value
   * with no label is a value drawn against nothing. A series longer than the
   * labels is drawn past the last category and clipped by its own field, and it
   * does not widen the field either, because a value with no category has
   * nowhere to be drawn.
   */
  values: number[]
  /**
   * The role this series is drawn in. Omitted, the series is drawn in the
   * supporting ink rather than in a series role.
   *
   * The default is not `chart-1` and the reason is `chart-frame`'s: a series
   * colour is a claim about what a thing is, and a Component that picked by
   * position would be making that claim on the caller's behalf and getting it
   * wrong on every chart after the first. Handing out the five roles in order
   * would put five names on a chart whose caller never named any of them, and a
   * reader who has learned that `chart-1` is revenue in one product would carry
   * that into the next. So an unnamed series takes `muted-foreground`, which is
   * the ink for a mark that supports a claim rather than making one, and a
   * chart whose series all omit `tone` is visibly a shape rather than five
   * things. Naming the tone is how a caller says the series are meant to be
   * told apart, and the cost of that is stated on the prop: two of the five
   * roles measure below 3:1 against a light card, so a name beside every mark is
   * not optional once hue is doing work.
   */
  tone?: ChartColor
}

/** The props the Chart accepts. */
export interface ChartProps {
  /** The series drawn, in the order their marks are drawn and their names are read. */
  series: readonly ChartData[]
  /**
   * The mark the series are drawn with.
   *
   * Required, and defaulted by nothing, because the mark is the claim the chart
   * makes about the data and a default would be this Component making it. A
   * chart of weekly signups drawn as bars invites a comparison of lengths that
   * only means something when the value starts at zero, and a caller who never
   * thought about the mark is exactly the caller who gets that wrong.
   */
  variant: ChartForm
  /**
   * The categories along the horizontal axis, in order. The caller's words.
   *
   * A month name, a release name, a region name, a build number. This is the
   * array that makes a chart a claim about the caller's own domain rather than
   * about a design system, which is why it is a prop and not a date range the
   * Component generates: a chart that named its own months would be wrong in
   * every product but the one it was written for. It is drawn for `bar` and
   * `line` only, and read on the table for every variant.
   */
  labels?: readonly string[]
  /**
   * The accessible name of the figure, and the only name the marks carry.
   *
   * Required rather than defaulted, because two charts on a dashboard are two
   * figures a reader cannot tell apart, and because the name is the only thing
   * that states what is being plotted. A figure named "Chart" is a Component
   * shipping a sentence about a product it knows nothing about.
   */
  label: string
  /**
   * The height of the plot field, in pixels. @defaultValue 240
   *
   * The default is `h-60` on the authored scale, so the figure a caller gets by
   * passing nothing lands on the spacing and type scale rather than beside it.
   * A number rather than a `size` prop because the value is the plot box's
   * proportion rather than a size of the component: the same component at three
   * heights is one component, and a `size` that doubled the plot and the gutter
   * together would be a different claim.
   */
  height?: number
  /**
   * Whether the legend is drawn. @defaultValue true when there is more than one series
   *
   * The default is a function of the series count rather than a constant,
   * because the legend has two jobs and only one of them is a key. With one
   * series there is nothing to tell apart, so the legend would be a name beside
   * a caption and it is left off. With two or more it is the only statement of
   * the series-to-colour assignment anywhere on the figure, and that is not
   * optional: `chart-2` measures 2.49:1 and `chart-3` 2.15:1 against a light
   * card in the default pack, so a mark in either is found by its position and
   * its shape rather than by its colour, and the name beside it is what makes it
   * a series. Pass `false` to put the legend somewhere else: `ChartLegend` is
   * its own export for exactly that, and a legend under a legend is a
   * component's fixed layout costing a layout the caller wanted.
   */
  legend?: boolean
  /**
   * The sentence the chart needs underneath it.
   *
   * The caller's words, because the sentence is a claim about the data and only
   * the caller knows which one is true: a fall, a seasonal dip, a collection
   * that changed, a filter that matched nothing. This Component ships none, and
   * a chart whose meaning is in a sentence the Component wrote is a chart whose
   * meaning is wrong in every product but one.
   */
  caption?: ReactNode
  /**
   * The top of the vertical axis, for `bar`, `line` and `area`. Omitted, the
   * axis is derived from the data.
   *
   * The opt-in exists because one case genuinely needs it: a line whose values
   * sit between 900 and 1,000 is drawn almost flat when the floor is zero, and
   * the reader wants the shape. What it costs is named in `Chart`, and it is not
   * only the flatness it fixes. A caller who normalises a dataset to start the
   * axis themselves has two chances to get the axis wrong rather than one, and
   * a mislabelled axis is a lie with a typeface on it: the numbers come from the
   * caller, the words on the axis are the ones a reader reads, and nothing joins
   * them. So this is one number and not a pair, the floor stays at zero, and a
   * value above the ceiling is drawn clamped to the top gridline and counted on
   * the element as `data-clamped`, so a ceiling that is too low is a fact in the
   * markup rather than a mark floating above its own axis.
   */
  yMax?: number
  /**
   * The content at the centre of a `donut`, which is where the total goes.
   *
   * A `ReactNode` rather than a number because the number is usually not the
   * total: it is the total in a currency, the total as a percentage of a target,
   * or the total with a unit and a comparison beside it. Computing any of those
   * here would be this Component shipping a sentence about a product it knows
   * nothing about, so it takes the caller's rendering and positions it in the
   * hole. It is drawn over the ring rather than inside the `<svg>`, so type in a
   * scaled viewBox is not a thing anyone has to think about.
   */
  centreLabel?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/** The fill and the stroke a named series is drawn in, from the tone it was given. */
const PAINT: Record<ChartColor, { fill: string; stroke: string }> = {
  'chart-1': { fill: 'fill-chart-1', stroke: 'stroke-chart-1' },
  'chart-2': { fill: 'fill-chart-2', stroke: 'stroke-chart-2' },
  'chart-3': { fill: 'fill-chart-3', stroke: 'stroke-chart-3' },
  'chart-4': { fill: 'fill-chart-4', stroke: 'stroke-chart-4' },
  'chart-5': { fill: 'fill-chart-5', stroke: 'stroke-chart-5' },
}

/**
 * The ink a series with no tone is drawn in.
 *
 * The supporting ink, and not a series role, on the reasoning on `ChartData`.
 * It is a real class string rather than a token name so that the fill and the
 * stroke stay one entry the drawing reads the same way in both directions.
 */
const UNTONE = { fill: 'fill-muted-foreground', stroke: 'stroke-muted-foreground' }

/**
 * The field's own coordinate space, in the units the drawing is measured in.
 *
 * A viewBox rather than no viewBox, which is the opposite of what
 * `chart-frame.tsx` does for its lines, and for one reason: an area is a filled
 * region, and a region's outline is a list of coordinate pairs. That list is
 * assembled here as a template, which is the same reason the assembly is a
 * template in every Component in this package: a `Component` ships no
 * reader-facing string, and a literal list of pairs is one. A viewBox is what
 * lets the numbers be numbers. The cost is that the viewBox scales, so every
 * stroked mark carries `vector-effect: non-scaling-stroke` and the stroke stays
 * a device width in a box of any proportion. The alternative was percentage
 * coordinates on HTML elements, which is what `ChartFrame` does, and a filled
 * region has no percentage coordinate in SVG, so the region is what forced this
 * answer.
 */
const FIELD = 100

/**
 * The gap between neighbouring marks, in field units.
 *
 * A fraction of the field rather than a pixel, because a pixel is a length the
 * viewBox would scale and a gap is a proportion. It exists because a gap nobody
 * can see is a grouping the colour has to carry on its own, and two series
 * side by side in the same ink are not two series.
 */
const GAP = 0.8

/** The ring's radius in the donut's own coordinate space. */
const RING_RADIUS = 38

/** The ring's thickness in the same units, which sets the inner and outer edges. */
const RING_THICKNESS = 8

/** The step a gridline is drawn at: one, two, five or ten times a power of ten. */
function niceStep(rough: number): number {
  if (!Number.isFinite(rough) || rough <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalised = rough / magnitude
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10
  return step * magnitude
}

/** A coordinate to two places, so the emitted markup is not a run of float noise. */
function unit(value: number): number {
  return Math.round(value * 100) / 100
}

/** A value held inside the axis, which is what keeps a mark off its own plot. */
function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high)
}

/** The vertical scale of one chart, and the two functions that place a value on it. */
type Scale = {
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
 * **The floor is zero on purpose.** A bar's length is only a measurement when
 * it starts at a shared baseline, so zero is always one of the gridlines and is
 * always labelled. The cost is a line whose values sit in a narrow band above
 * zero is drawn almost flat, and the answer to that is the caller's `yMax` and
 * the table, not a floor this Component drops.
 *
 * **A negative value gets a region below the baseline** rather than a
 * zero-height bar. A profit and loss chart that drew a loss as nothing is a
 * chart that is confidently wrong, and the region costs one more gridline.
 *
 * **A ceiling, when the caller passed one, is honoured exactly** and the
 * intermediate gridlines are the step below it. That is the cost of the opt-in
 * stated as arithmetic: if the ceiling is not a multiple of the step, the top
 * band is shorter than the others, and the top gridline is the caller's number
 * rather than a readable one. The alternative was rounding the ceiling away,
 * which would have made the prop a suggestion.
 */
function scaleOf(values: readonly number[], ceiling: number | undefined): Scale {
  let lowest = 0
  let highest = 0
  for (const value of values) {
    if (!Number.isFinite(value)) continue
    if (value < lowest) lowest = value
    if (value > highest) highest = value
  }

  const step = niceStep((Math.max(highest, ceiling ?? highest) - lowest) / 4)
  const first = Math.floor(lowest / step) * step
  // Ceiled rather than rounded, because a rounded count can leave the largest
  // value above the top gridline, and a mark drawn above its own axis is a mark
  // off the plot.
  const last =
    ceiling ?? first + Math.max(1, Math.ceil((highest - first) / step - 1e-9)) * step
  const span = last - first

  const at = (value: number) => unit(((last - clamp(value, first, last)) / span) * 100)
  const count = Math.max(1, Math.round((last - first) / step))

  return {
    lines: Array.from({ length: count + 1 }, (_, index) => unit(first + index * step)),
    at,
    // The bar spans between the value and the zero line, which are the same
    // point when the value is zero, so a zero draws nothing rather than a sliver.
    bar: (value: number) => {
      const here = at(value)
      const baseline = at(0)
      return { top: Math.min(here, baseline), height: Math.abs(here - baseline) }
    },
  }
}

/**
 * Where a category sits on the horizontal axis, as a share of the field.
 *
 * A line's points run from the first category to the last, so the axis is the
 * gap between them and a single category sits in the middle, which is the only
 * place a lone category can be read against anything. A bar's category is a
 * column rather than a point, so its position is the column's centre, and that
 * is the same reason a bar chart's first bar is not flush with the axis.
 */
function categoryAt(index: number, total: number, variant: ChartForm): number {
  if (variant === 'bar') return unit(((index + 0.5) / total) * FIELD)
  if (total <= 1) return FIELD / 2
  return unit((index / (total - 1)) * FIELD)
}

/**
 * Where a category label is nudged to sit, so no label hangs off the plot.
 *
 * A line's label is centred on its point, which puts the first and the last
 * half outside the field, so the edge labels are pinned to the edge instead. A
 * bar's categories are column centres with room on both sides, so every label is
 * centred.
 */
function labelAlign(index: number, total: number, variant: ChartForm): string {
  if (variant === 'bar' || total < 2) return '-translate-x-1/2'
  if (index === 0) return 'translate-x-0'
  if (index === total - 1) return '-translate-x-full'
  return '-translate-x-1/2'
}

/** The shares a donut may draw, as a percentage of the ring, or nothing at all. */
function donutShares(series: readonly ChartData[]): number[] | null {
  const single = (entry: ChartData) =>
    entry.values.length === 1 && Number.isFinite(entry.values[0])
  if (series.length === 1 && single(series[0])) {
    return [100]
  }
  if (series.length === 2 && series.every(single)) {
    const parts = series.map((entry) => entry.values[0])
    const total = parts[0] + parts[1]
    if (!(total > 0)) return null
    return [unit((parts[0] / total) * 100), unit((parts[1] / total) * 100)]
  }
  return null
}

/** The fill and the stroke one series is drawn in, from the tone it was given. */
function paintOf(entry: ChartData): { fill: string; stroke: string } {
  return entry.tone ? PAINT[entry.tone] : UNTONE
}

/** The marks one series contributes to the field, for a bar chart. */
function barsOf(
  entry: ChartData,
  index: number,
  scale: Scale,
  columns: number,
  total: number,
  fill: string,
) {
  const slot = FIELD / Math.max(1, columns) / Math.max(1, total)
  return entry.values.map((value, column) => {
    if (!Number.isFinite(value)) return null
    const { top, height } = scale.bar(value)
    return (
      <rect
        key={`${index}-${column}`}
        data-slot="chart-bar"
        data-series={index}
        x={unit(column * slot * total + index * slot + GAP / 2)}
        y={top}
        width={unit(slot - GAP)}
        height={height}
        className={fill}
      />
    )
  })
}

/** The polyline one series contributes to the field, for a line or an area. */
function pathOf(
  entry: ChartData,
  index: number,
  scale: Scale,
  columns: number,
  variant: ChartForm,
  paint: { fill: string; stroke: string },
  area: boolean,
) {
  const points = entry.values
    .map((value, at) => ({ at, value }))
    .filter((point) => Number.isFinite(point.value))
    .map((point) => ({
      x: categoryAt(point.at, columns, variant),
      y: scale.at(point.value),
    }))
  if (points.length === 0) return null

  // A series with one value has no shape to draw, and a line chart of a single
  // value is a flat line rather than nothing. A rule across the field says
  // exactly that and nothing more, where a dot would have said a position and
  // invited a reading of a trend that is not in the data.
  if (points.length === 1) {
    const only = points[0] as { x: number; y: number }
    return (
      <line
        key={`${index}-flat`}
        data-slot="chart-line"
        data-series={index}
        vectorEffect="non-scaling-stroke"
        strokeWidth={2}
        strokeLinecap="round"
        x1={0}
        y1={only.y}
        x2={FIELD}
        y2={only.y}
        className={paint.stroke}
      />
    )
  }

  const first = points[0] as { x: number; y: number }
  const last = points[points.length - 1] as { x: number; y: number }
  const baseline = scale.at(0)
  // The outline is assembled as a template rather than written out, because a
  // literal list of coordinate pairs is a word-shaped string in a Component that
  // ships no reader-facing copy, and because the list is not known here anyway.
  const outline = `${first.x} ${baseline}${points.map((point) => ` ${point.x} ${point.y}`).join('')}${last.x} ${baseline}`

  return (
    <g key={`${index}-path`} data-slot={area ? 'chart-area' : 'chart-line'} data-series={index}>
      {/*
       * The wash is the series' own fill at a lower alpha and never `fill-none`,
       * never `current` and never a value read from anywhere. `current` is the
       * one that looks like a token and is not one: a resolved value does not
       * move when a `data-pack` boundary lands above the figure, which is the
       * defect `check-vector-ink` exists to catch, and the alpha is Tailwind's
       * rather than a colour of its own.
       */}
      {area ? <polygon points={outline} className={`${paint.fill}/40`} /> : null}
      {points.slice(1).map((point, at) => {
        const from = points[at] as { x: number; y: number }
        return (
          <line
            key={at}
            vectorEffect="non-scaling-stroke"
            strokeWidth={2}
            strokeLinecap="round"
            x1={from.x}
            y1={from.y}
            x2={point.x}
            y2={point.y}
            className={paint.stroke}
          />
        )
      })}
    </g>
  )
}

/**
 * A chart: the marks, the axes, and the numbers behind them.
 *
 * **The chart is never the only way to read the numbers.** That is the
 * constraint worth making, and it is a constraint on the caller as much as on
 * this Component. The argument is the one `carousel.tsx` makes about everything
 * a carousel shows: everything this Component draws, a reader must be able to
 * reach some other way, because a chart is a picture whose entire content is a
 * position, and a position is the one thing a screen reader, a crawler and a
 * print stylesheet cannot read. There is a concrete failure behind each of
 * them. A screen reader given a `<figure>` full of rectangles is read a list of
 * nothing. A crawler sees the labels and the marks and no values at all, so
 * every figure a product site publishes is invisible to the thing that indexes
 * it. A print stylesheet loses the channel the series were separated by, and
 * two of the five roles measure below 3:1 on a light card and go to the same
 * grey, so a printed chart is a chart where the legend is the only difference
 * between two lines.
 *
 * So the marks and the cells are two renderings of one `series` array rather
 * than a chart and a table a caller kept in step, and the table is in the
 * document whether or not anybody can see it. A `<table>` with a `<caption>`,
 * a row head for each category and a column head for each series, so a reader
 * navigates it by row and by cell and hears the figures the marks are drawn
 * from. The alternative was a `table` prop, and the reasoning against it is
 * `chart-frame`'s: a chart whose accessible representation is a sibling prop is
 * a chart whose table a consumer wrote once and updated when the data changed,
 * which is to say a chart whose table says last quarter. There is no prop that
 * turns it off, because a prop is a default and the default would be off and
 * the failure would be invisible.
 *
 * **There is no hover tooltip, and that is the same argument from the other
 * side.** A tooltip is the usual answer to the exact value, and it answers a
 * question a pointer asked, which is a question a keyboard never asks and a
 * print stylesheet cannot receive. A picture a reader cannot query is the
 * failure the table exists to prevent, so the exact value is answered by the
 * table rather than by a surface that appears under a pointer.
 *
 * **The geometry does not move.** There is no draw-in, no bar that grows, no
 * transition on any of the marks, and the reason is that the motion law refuses
 * entrance effects outright, so a chart would not need an argument to be
 * refused: a bar arriving is decoration, and the reader was not waiting for it.
 * There is also no reason for one. A bar's height is its value, and a value
 * that changes is the caller rendering a different number, so a transition
 * between two values is a transition between two facts, and a reader watching
 * one arrive has learned nothing they could not have read from the second one.
 * This is a server Component: no hook, no state, no effect, and the whole
 * figure is arithmetic over props, which is why `check-client-budget` has no
 * reason to know it exists.
 *
 * **The axis is derived and a caller's maximum is opt-in.** Prism does not take
 * a vertical maximum by default, and the reason is specific: a caller who
 * pre-normalises has two chances to get the axis wrong rather than one. They
 * compute the maximum, and then they label the gridlines, and a mistake in
 * either step is invisible in the rendered chart because the picture is drawn
 * perfectly faithfully to the wrong number. A mislabelled axis is a lie with a
 * typeface on it, and it is a worse lie than a flat line because a flat line
 * looks like a flat line. `yMax` exists for the one case that genuinely needs
 * it, a line in a narrow band high on the scale that the reader wants to see
 * the shape of, and it costs what the prop says: the caller owns the top, a
 * value above it is clamped to the top gridline and counted on the element as
 * `data-clamped`, and a ceiling that is not a multiple of the step leaves a
 * shorter band at the top. The floor stays at zero whatever is passed, because
 * a bar measured from anywhere but the baseline is not a measurement.
 *
 * **The donut is here for one shape of data, and the shape is named.** A bar
 * chart is the honest default: it is read as lengths against a common baseline,
 * it is the mark that survives greyscale, and it holds up at eight parts where a
 * ring does not. What it is bad at is a part-to-whole with two or three parts,
 * because there the reader is not comparing lengths, they are reading a
 * proportion, and two lengths that must be mentally added are the harder task.
 * A ring answers "what share is this" in one glance where the bars answer it
 * after a division, and the centre answers the total the reader then wants
 * anyway. So the variant exists for that condition and refuses everything else:
 * `donut` takes exactly two series with one value each, or one series with a
 * single value, which is the same claim with nothing to divide. At three parts
 * the ring stops being read as a proportion and starts being read as a puzzle,
 * and a ring that a reader has to count the segments of is worse than three
 * bars. Naming the condition is the point: an unmarked donut prop would let the
 * choice be casual, and a casual donut is a pie with nine slices in a
 * dashboard.
 *
 * **The five series roles are the token contract's, not this file's.** `tone` is
 * `ChartColor` from `chart-frame`, for the reason that type's own documentation
 * gives: `chart-1` through `chart-5` is the only five-way set the contract
 * publishes, so a wider type here would be a wider palette and a second source
 * of truth for something the tokens already own. Every stroke and every fill
 * below is one of those roles, `muted-foreground`, `muted`, `foreground` or
 * `border`, named as a utility so a scoped `data-pack` boundary above the
 * figure restyles all of it through the cascade. The gridlines are `border`,
 * which is the contract's own low emphasis, rather than a lighter value invented
 * here, and there is no gradient: a gradient of contract stops would be allowed
 * and there is no decision behind one.
 *
 * **What this is not.** There is no axis a caller can log, no second axis, no
 * stacking, no curve interpolation, no zoom, no crosshair, and no per-point
 * mark on a line. A distribution, a ranking, a correlation and a histogram are
 * a charting library's work, and this Component is the frame and the table that
 * library's marks should sit inside rather than the library.
 */
function Chart({
  series,
  variant,
  labels,
  label,
  height = 240,
  legend,
  caption,
  yMax,
  centreLabel,
  className,
}: ChartProps) {
  // The legend's default is a function of the series count, so it is resolved
  // here rather than as a default in the signature: `series.length > 1` is not a
  // literal a caller may override, it is the answer to a question about the data
  // that only the data can answer.
  const wantsLegend = legend ?? series.length > 1
  const plotted = series.flatMap((entry) => entry.values.filter((value) => Number.isFinite(value)))
  const shares = variant === 'donut' ? donutShares(series) : null
  const clamped = plotted.filter(
    (value) => yMax !== undefined && value > yMax,
  ).length

  // The caption of the table names the figure and then every series in it, so a
  // reader who has navigated into the table knows which chart they are in and
  // which column is which. It is assembled at runtime from the caller's own
  // words, because the punctuation is not a sentence this Component is entitled
  // to write and a literal joining two props would be one.
  const tableCaption = `${label}: ${series.map((entry) => entry.name).join(', ')}`

  const table = (
    <div data-slot="chart-table" className="sr-only">
      <Table>
        <TableCaption>{tableCaption}</TableCaption>
        <TableHeader>
          <TableRow>
            {/*
             * The corner is empty, and deliberately so. The column heads name the
             * series and the row heads name the caller's categories, and there is
             * no third name to put here: the figure's own `label` is already the
             * table's caption, so repeating it in the corner would be the same
             * sentence twice. `ChartFrame` takes a `categoryHeading` for exactly
             * this cell and this Component's prop set does not, which is the cost
             * of a smaller surface and the reason a reader navigating by column
             * hears the series name first.
             */}
            <TableHead className="w-24" />
            {series.map((entry, index) => (
              <TableHead key={index} className="text-right tabular-nums">
                {entry.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/*
           * The rows follow the caller's labels rather than the drawn axis, so a
           * chart whose horizontal axis is not drawn still tabulates every
           * category. The table is the data; the axis is a drawing of part of it.
           */}
          {Array.from({ length: labels === undefined ? 1 : Math.max(1, labels.length) }, (_, row) => (
            <TableRow key={row}>
              <TableHead scope="row" className="font-medium">
                {labels === undefined ? null : (labels[row] ?? null)}
              </TableHead>
              {series.map((entry, index) => (
                <TableCell key={index} className="text-right tabular-nums" data-series={index}>
                  {labels === undefined ? (entry.values[0] ?? null) : (entry.values[row] ?? null)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const captionNode =
    caption === undefined ? null : (
      <p data-slot="chart-caption" className="text-muted-foreground text-sm">
        {caption}
      </p>
    )

  const legendNode = wantsLegend ? <ChartLegend series={series} /> : null

  if (variant === 'donut') {
    return (
      <figure
        data-slot="chart"
        data-variant="donut"
        data-plotted={shares === null ? 0 : shares.length}
        aria-label={label}
        className={cn('flex w-full flex-col gap-3', className)}
      >
        <div data-slot="chart-field" className="flex justify-center">
          {shares === null ? null : (
            <div data-slot="chart-donut" className="relative">
              {/*
               * The ring is its own viewBox rather than a share of the field's,
               * because a ring is square and a non-uniform scale turns it into an
               * ellipse. The track underneath is the `muted` surface, which is
               * what a part of zero leaves visible: a part-to-whole that does not
               * add up is a fact about the data and the drawing shows it.
               */}
              <svg
                data-slot="chart-geometry"
                viewBox={`0 0 ${FIELD} ${FIELD}`}
                aria-hidden="true"
                className="size-40"
              >
                <circle
                  data-slot="chart-donut-track"
                  cx={FIELD / 2}
                  cy={FIELD / 2}
                  r={RING_RADIUS}
                  strokeWidth={RING_THICKNESS}
                  className="fill-none stroke-muted"
                />
                {/*
                 * The segments are dashes on one circle rather than arc paths,
                 * which is the decision that makes a whole ring possible at all.
                 * A path from an angle back to its own start is degenerate, so the
                 * one-part case would have needed a second code path and a
                 * `fill-rule` to render. `pathLength` normalises the circumference
                 * to 100, so a share is the number of units the dash takes and
                 * nothing here has to know the radius.
                 *
                 * The rotation puts the start of the ring at the top, and it is a
                 * template because a rotation carries a space and a literal
                 * coordinate list is word-shaped to the copy gate. The dash offset
                 * is the running total of the shares before it, negated, which is
                 * what starts a dash at a point on the path rather than at its
                 * beginning.
                 */}
                <g
                  data-slot="chart-donut-segments"
                  transform={`rotate(-90 ${FIELD / 2} ${FIELD / 2})`}
                >
                  {shares.map((share, index) => {
                    const before = shares.slice(0, index).reduce((total, value) => total + value, 0)
                    return (
                      <circle
                        key={index}
                        data-slot="chart-donut-segment"
                        data-series={index}
                        cx={FIELD / 2}
                        cy={FIELD / 2}
                        r={RING_RADIUS}
                        pathLength={FIELD}
                        strokeWidth={RING_THICKNESS}
                        strokeDasharray={`${share} ${FIELD - share}`}
                        strokeDashoffset={before === 0 ? 0 : -unit(before)}
                        className={cn('fill-none', paintOf(series[index]).stroke)}
                      />
                    )
                  })}
                </g>
              </svg>
              {centreLabel === undefined ? null : (
                <div
                  data-slot="chart-donut-centre"
                  className="absolute inset-0 flex items-center justify-center px-6 text-center"
                >
                  {centreLabel}
                </div>
              )}
            </div>
          )}
        </div>
        {legendNode}
        {captionNode}
        {table}
      </figure>
    )
  }

  const scale = scaleOf(plotted, yMax)
  const columns =
    labels !== undefined && labels.length > 0
      ? labels.length
      : series.reduce((most, entry) => Math.max(most, entry.values.length), 0)

  const onAxis = variant === 'bar' || variant === 'line'

  return (
    <figure
      data-slot="chart"
      data-variant={variant}
      data-plotted={plotted.length}
      data-clamped={clamped === 0 ? undefined : clamped}
      aria-label={label}
      className={cn('flex w-full flex-col gap-3', className)}
    >
      <div data-slot="chart-plot" className="flex flex-col gap-2">
        <div data-slot="chart-plot-row" className="flex items-stretch gap-2">
          {/*
           * The gutter is a fixed width and the field is the caller's height, and
           * neither is derived from the data. That is the alignment claim: a
           * gutter that sized itself to its longest label would move the second
           * chart's field sideways the first time a number grew a digit, and the
           * symptom on a dashboard is two plots that no longer line up.
           */}
          <div data-slot="chart-axis-y" className="relative w-12 shrink-0">
            {scale.lines.map((value) => (
              <span
                key={value}
                data-slot="chart-tick"
                className="text-muted-foreground absolute right-0 -translate-y-1/2 text-xs tabular-nums"
                style={{ top: `${scale.at(value)}%` }}
              >
                {value}
              </span>
            ))}
          </div>

          <div data-slot="chart-field" className="relative flex-1" style={{ height }}>
            <svg
              data-slot="chart-geometry"
              viewBox={`0 0 ${FIELD} ${FIELD}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 size-full"
            >
              {scale.lines.map((value) => (
                <line
                  key={value}
                  data-slot="chart-gridline"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={1}
                  x1={0}
                  x2={FIELD}
                  y1={scale.at(value)}
                  y2={scale.at(value)}
                  className="stroke-border"
                />
              ))}
              {/*
               * The zero line, in the strongest ink, and only for a bar. On a bar
               * the baseline is the thing every length is measured from, so it is
               * drawn as the reference it is. On a line it is one gridline among
               * several and a heavier line through the middle of a shape would be
               * a mark the data did not ask for.
               */}
              {variant === 'bar' ? (
                <line
                  data-slot="chart-baseline"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={1.5}
                  x1={0}
                  x2={FIELD}
                  y1={scale.at(0)}
                  y2={scale.at(0)}
                  className="stroke-foreground"
                />
              ) : null}
              {series.flatMap((entry, index) =>
                variant === 'bar'
                  ? barsOf(entry, index, scale, columns, series.length, paintOf(entry).fill)
                  : [
                      pathOf(
                        entry,
                        index,
                        scale,
                        columns,
                        variant,
                        paintOf(entry),
                        variant === 'area',
                      ),
                    ],
              )}
            </svg>
          </div>
        </div>

        {/*
         * The category row, and the two variants that do not get one. A bar and a
         * line place one mark in one column, so a tick under it is true. An area
         * is a region, and where one category's region ends and the next begins
         * is not something the eye can find in a filled shape, so a tick under it
         * would be a claim the drawing cannot support. A donut has no horizontal
         * dimension at all, because its parts are not positions in an order. In
         * both cases the table carries the categories, which is the point of the
         * table.
         */}
        {onAxis && labels !== undefined && labels.length > 0 ? (
          <div data-slot="chart-axis-x-row" className="flex items-stretch gap-2">
            <span data-slot="chart-axis-x-gutter" aria-hidden="true" className="w-12 shrink-0" />
            <div data-slot="chart-axis-x" className="relative h-4 flex-1">
              {labels.map((name, index) => (
                <span
                  key={index}
                  data-slot="chart-category"
                  className={cn(
                    'text-muted-foreground absolute top-0 max-w-20 truncate text-xs',
                    labelAlign(index, columns, variant),
                  )}
                  style={{ left: `${categoryAt(index, columns, variant)}%` }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {legendNode}
      {captionNode}
      {table}
    </figure>
  )
}

/**
 * A legend: a swatch and a name for each series, and nothing else.
 *
 * Its own export rather than a fixed position under the plot, because a legend
 * is a layout decision the surrounding design usually has an opinion about. A
 * chart in a dashboard card, in a full-width figure between two paragraphs, and
 * beside a key in a table of figures are three different places, and a Component
 * that fixed one of them made the other two a workaround. So `Chart` draws it
 * where the figure puts it and a caller who needs it elsewhere passes
 * `legend={false}` and renders this with the same `series` array, which is the
 * only reason the swatch and the mark cannot disagree.
 *
 * It is a `<ul>` rather than a `<div>` of spans, so a reader moving by list
 * item is told how many series there are, and each entry is a swatch and a name
 * with the swatch hidden, because a screen reader has no use for a colour and
 * announcing one would replace the name with the thing the name is there to
 * avoid. The same warning applies to a printed legend: two of the five roles go
 * to the same grey on paper, so the legend is what tells a printed chart's
 * series apart rather than an addition to it.
 */
function ChartLegend({
  series,
  className,
}: {
  /** The series to name, in the order their marks are drawn. */
  series: readonly ChartData[]
  /** Layout only, exactly as on every Component. */
  className?: string
}) {
  return (
    <ul
      data-slot="chart-legend"
      className={cn('text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs', className)}
    >
      {series.map((entry, index) => (
        <li key={index} data-slot="chart-legend-entry" className="flex items-center gap-1.5">
          <span
            data-slot="chart-swatch"
            aria-hidden="true"
            className={cn('size-2.5 shrink-0 rounded-sm', paintOf(entry).fill)}
          />
          {entry.name}
        </li>
      ))}
    </ul>
  )
}

export { Chart, ChartLegend }
