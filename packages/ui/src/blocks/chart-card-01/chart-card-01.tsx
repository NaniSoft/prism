import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Metric } from '../../components/ui/metric'
import { childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * How much of a six-track grid one card takes.
 *
 * Three names rather than a number, for the reason `Bento01`'s span states in full: a
 * `colSpan: number` hands the Block a grid instead of a panel, because a number
 * type-checks and renders whatever it is told to and produces an arrangement nobody
 * can reason about when it does not fit. A third, a half and the whole are the three
 * relationships a set of cards can have to each other, and they add up by arithmetic
 * the caller never performs.
 *
 * `full` is the empty string rather than `col-span-6`, and that is the decision worth
 * stating: a card that fills its track needs no placement at all, and a card that
 * declares `col-span-6` in a three-track grid is a card that has silently left two
 * tracks empty in every grid but the one it was written for. So the ordinary case
 * places nothing, and the two narrower spans place themselves in whatever six-track
 * grid the caller composed them into.
 */
export type ChartCard01Span = 'full' | 'half' | 'third'

/**
 * One figure the card states about what the figure shows.
 *
 * A node and not a number for the reason `Metric` gives: a caller's figure is often a
 * value it formatted itself, and a number prop would make it either ship that as a
 * string outside the Component or lose the unit it belongs to. `deltaFormat` is here
 * for the same reason: Prism formats the delta and nothing else, and a delta of `0.12`
 * is twelve percent, twelve cents or twelve milliseconds.
 */
export type ChartCard01Reading = {
  /** What the figure measures, read under the figure rather than above it. */
  label: string
  /** The figure itself, in the caller's own units and the caller's own formatting. */
  value: ReactNode
  /** The change against the previous reading, where the sign is the direction. */
  delta?: number
  /** The words for the delta, given the number. See the note on this type. */
  deltaFormat?: (value: number) => string
}

/**
 * The props a ChartCard01 takes. Every string is a prop and the Block ships none.
 */
export type ChartCard01Props = {
  /**
   * The card's title, rendered as a heading one step below the section that
   * introduces the card.
   */
  title: ReactNode
  /** One line under the title, for what the figure is a reading of. */
  description?: ReactNode
  /**
   * The figure itself, and the caller's own.
   *
   * A slot rather than a prop with a variant, and the whole of the reason is in the
   * Block's JSDoc: a Block that named a chart type would be choosing the caller's
   * data shape, and a chart is the one thing on an operate screen a consumer most
   * often replaces once they know what they are measuring. Compose `chart`,
   * `chart-frame`, a `pulse-series`, an image, or anything else.
   */
  figure: ReactNode
  /**
   * The key for the figure, wherever the caller wants it.
   *
   * A slot rather than a rendered legend, because `chart` already exports
   * `ChartLegend` as its own Item for exactly this reason: a legend is a layout
   * decision the surrounding design usually has an opinion about, and a card that
   * fixed one position made the other two a workaround. A caller who wants it in
   * this slot passes `legend={false}` to `chart` and renders the same `series` array
   * here, which is the only reason the swatch and the mark cannot disagree.
   */
  legend?: ReactNode
  /** The figures this card states about what the figure shows. */
  reading?: ChartCard01Reading[]
  /** The controls that act on the figure: a range, a segment, a download. */
  actions?: ReactNode
  /** The band under the figure, for the line that qualifies it. */
  footer?: ReactNode
  /** How much of a six-track grid the card takes. See `ChartCard01Span`. */
  span?: ChartCard01Span
  /**
   * The level of the heading that introduces this card, so the card's own title
   * nests one step below it. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * What each named span takes of a six-track grid, at the breakpoint the grid appears.
 *
 * A map of machine values rather than three conditional class strings, so the
 * relationship between a span name and a track count is one table a reader can check
 * in one place. Every value is a `col-span` utility and nothing else, and `full` is
 * the empty string because a card that fills its track needs no placement.
 */
const SPAN: Record<ChartCard01Span, string> = {
  full: '',
  half: 'lg:col-span-3',
  third: 'lg:col-span-2',
}

/**
 * A titled panel holding one figure, the key for it, the controls that act on it, and
 * the figures the card states about it.
 *
 * **The figure is a slot, and the reason is one sentence long: a Block that named a
 * chart type would be choosing the caller's data shape, and a chart is the one thing
 * on an operate screen a consumer most often replaces once they know what they are
 * measuring.** Every product that installs this card knows something this package
 * does not, which is whether a bar or a line or a table of numbers is the honest
 * rendering of their own series. A `figureVariant` prop would be a Block guessing,
 * and a guess here is not a wrong colour: a bar chart of weekly signups invites a
 * comparison of lengths that only means something when the value starts at zero, so
 * the mark a caller never thought about is the mark that makes the chart wrong. So
 * the card takes the figure as a node, and `chart` holds the decisions it does own,
 * which are the mark it was given, the axis derived from the data, and the table.
 *
 * **Whatever the figure is, it must also be readable as numbers, and this Block does
 * not check that.** `chart` states the rule in full: a chart is a picture whose entire
 * content is a position, and a position is the one thing a screen reader, a crawler
 * and a print stylesheet cannot read, so the marks and the cells are two renderings
 * of one `series` array and the table is in the document whether or not anybody can
 * see it. That rule holds for the caller's figure and this Block cannot see inside a
 * slot to find out whether the caller honoured it. The duty passes to the caller, and
 * this JSDoc says so rather than pretending the Block verified it. The cost of a slot
 * is named here rather than hidden: a caller who passes a hand-rolled SVG gets a
 * panel with an unreadable figure in it and no warning, and the only reason that is
 * acceptable is that a Block cannot see inside a slot, so a warning would be a warning
 * about the wrong thing.
 *
 * **The card title is a heading one step below the section that introduces it, and
 * the level is derived rather than written.** Three cards in a grid are three regions
 * a reader can jump between, and the step is `childLevel` rather than a literal `h3`
 * so a card composed one level deeper carries its outline with it instead of
 * announcing three siblings of the section that introduces them.
 *
 * **The readings sit in a flex row that wraps, and they share the width rather than
 * holding a fixed one.** The measurement that decides it: a `third` card at the
 * 72rem container is about 22rem wide, so three readings across it are about 7rem
 * each, which holds a four character figure and nothing else. Sharing the width
 * means one reading is as wide as the figure above it, which is what a single reading
 * wants, and two share, which is what two want. The cost is stated rather than hidden:
 * a caller with three long figures wants `span="half"`, and a caller who needs a fixed
 * column is looking for a table under the figure rather than a reading line.
 *
 * **The card is a `Card` and not a `Section`, and that is what makes it a card.** A
 * `Section` owns the container and the vertical rhythm, and a panel that owns a
 * container cannot be a grid item in somebody else's, because a `Section` inside a
 * grid cell is a second `max-w-6xl` at one third of the width. So this Block
 * composes the card and takes the rhythm from whatever composed it, which is
 * `chart-group-01` for the ordinary case and the caller's own grid otherwise.
 *
 * It is a server Component: no hook, no state, no client code and no motion. The
 * figure decides whether it is one: a caller who passes a figure that animates is
 * passing a client Component in a slot, which is the arrangement a `ReactNode` exists
 * for, and this file is not what puts it in the client graph.
 */
export function ChartCard01({
  title,
  description,
  figure,
  legend,
  reading = [],
  actions,
  footer,
  span = 'full',
  headingLevel = 'h2',
  className,
}: ChartCard01Props) {
  // One step below the heading that introduces this card, so the card's own title
  // nests under the section rather than beside it.
  const Title = childLevel(headingLevel)

  return (
    <div data-slot="chart-card-01" data-span={span} className={cn(SPAN[span], className)}>
      <Card className="h-full gap-4 py-5">
        <CardHeader className="grid-cols-[minmax(0,1fr)_auto] gap-x-3">
          <div data-slot="chart-card-01-head" className="flex min-w-0 flex-col gap-1.5">
            <CardTitle as={Title} className="text-base">
              {title}
            </CardTitle>
            {description === undefined ? null : (
              <CardDescription className="text-pretty">{description}</CardDescription>
            )}
          </div>

          {/*
            The controls sit in the header rather than the footer because a range
            picker or a segment changes what the figure is showing, and a reader who
            changes the question wants the control beside the thing it changes. The
            footer's line qualifies the reading and comes after it.
          */}
          {actions === undefined ? null : (
            <div data-slot="chart-card-01-actions" className="flex shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div data-slot="chart-card-01-figure" className="min-w-0">
            {figure}
          </div>

          {legend === undefined ? null : (
            <div data-slot="chart-card-01-legend" className="min-w-0">
              {legend}
            </div>
          )}

          {reading.length === 0 ? null : (
            <div
              data-slot="chart-card-01-reading"
              className="border-border flex flex-wrap items-end gap-x-6 gap-y-3 border-t pt-4"
            >
              {reading.map((entry) => (
                <div key={entry.label} className="min-w-0 flex-1">
                  <Metric
                    value={entry.value}
                    label={entry.label}
                    delta={entry.delta}
                    deltaFormat={entry.deltaFormat}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {footer === undefined ? null : (
          <CardFooter data-slot="chart-card-01-footer">{footer}</CardFooter>
        )}
      </Card>
    </div>
  )
}

export default ChartCard01
