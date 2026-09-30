import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Sparkline } from '../../components/ui/sparkline'
import { cn } from '../../lib/utils'

/**
 * One row of a trend list: a name, what it is at now, how it moved, and a shape
 * beside it.
 *
 * Every field except `id` and `label` is optional because a trend list is
 * heterogeneous by nature. Some of the things a list tracks have a series behind
 * them and some have only a reading, some moved and some did not, and a shape
 * that made every field required would be a list where two thirds of every row is
 * an empty cell drawn as a placeholder.
 */
export type Trend01Item = {
  /** A stable key for the row. */
  id: string
  /**
   * The name of the thing being tracked, as a reader would name it in
   * conversation. It is the label the metric carries, and it is the last thing
   * read on the row because the figure and the direction come first.
   */
  label: string
  /**
   * The current reading, already formatted by the caller.
   *
   * A `ReactNode` and not a `number`, for the reason `MetricProps.value` gives:
   * a caller's figure is often a value it formatted itself, with its own grouped
   * thousands, its own currency and its own unit, and a `number` here would push
   * that formatting onto every call site twice. Prism takes the node and formats
   * nothing.
   */
  value: ReactNode
  /**
   * The change against the previous reading, as a number whose sign is the
   * direction. See `MetricDelta` on the Component.
   */
  delta?: number
  /**
   * The words for that change, given the number. Required whenever `delta` is
   * set, and the Block throws without it. See the Component JSDoc for the full
   * argument.
   */
  deltaLabel?: (delta: number) => string
  /**
   * The readings behind the current one, oldest first, in the caller's own units.
   *
   * Raw magnitudes rather than percentages of a maximum, which is the contract
   * `Sparkline` states: a caller that pre-normalises has two chances to get the
   * shape wrong, and a series drawn against an axis nobody can see is a picture
   * of somebody's arithmetic.
   */
  series?: number[]
  /**
   * The name of that series, and the only thing a screen reader reads from the
   * shape. Required whenever `series` is set, and the Block throws without it.
   */
  seriesLabel?: string
  /** Where the row goes. Rendered as a native anchor, so the destination is real. */
  href?: string
  /** The words on that link. Required whenever `href` is set. */
  hrefLabel?: string
}

/**
 * The props a Trend01 takes.
 *
 * Every string and every number is a prop and the Block ships none. There is no
 * sample list, no default metric, no default series and no default direction, and
 * the reason is the one the whole Block rests on: the list a page shows is that
 * page's own claim about what is rising, and a Block that invented one would be
 * publishing a trend nobody collected.
 */
export type Trend01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a list with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The rows, in the order a reader should meet them. See the Component JSDoc
   * for why the Block does not sort them.
   */
  items: readonly Trend01Item[]
  /**
   * How many rows to render. Defaults to the whole set.
   *
   * A cap and not a page. A trend list that runs long is a long list of the same
   * kind of row, and a reader who wants the rest of it wants the top of it, so
   * the useful control is where to stop rather than which page they are on. A
   * paged list of trends is a table with a `DataTable01` in it, and this Block is
   * not that.
   */
  limit?: number
  /**
   * What the Block renders in place of the rows when there are none.
   *
   * A slot rather than a string, and required at the call site in the sense that
   * a Block cannot write the sentence: "nothing is rising" is a claim, and it is
   * a different claim in a product where the answer is honest and a product where
   * the pipeline is down. Omit it and a list with no rows renders nothing at all,
   * which is the honest state for a section that has nothing to say.
   */
  empty?: ReactNode
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A ranked list of rising values: a name, a current reading, the change against
 * the previous one, and a small series beside it.
 *
 * **A trend row is a metric with a shape beside it, so the Block composes
 * `Metric` and `Sparkline` rather than drawing either of them.** Both halves of
 * that sentence are load-bearing. `Metric` owns the arrangement a headline figure
 * is read in, which puts the figure first and the name under it, and it owns the
 * three things a hand-rolled version of that gets wrong: that the direction is
 * derived from the sign of the number rather than declared beside it, that the
 * rising mark is a glyph so assistive technology names it in the reader's own
 * language rather than through an English `aria-label`, and that a string value
 * is set in the mono face while a composed one is not. `Sparkline` owns the shape
 * and, more importantly, owns the fact that the numbers behind the shape are in
 * the document: a ninety-six pixel line with no axis is a picture a reader cannot
 * query, so the Component renders the same array as a table a screen reader can
 * walk and a crawler can index. A Block that hand-rolled either would be a second
 * implementation of a Component that already owns it, and the second
 * implementation would be the one without the table, because the table is the part
 * nobody draws by hand and it is the part that matters.
 *
 * **`deltaLabel` is required whenever any row carries a `delta`, and the reason
 * is that the Block cannot know which of three sentences the caller means.**
 * "up 12 percent", "+12%" and "12 higher than last week" are three sentences
 * about one number, and they are not formats of one another: the first is a
 * phrase with a unit, the second is a signed figure for a reader who is already
 * looking at a number, and the third is a comparison against a named period that
 * a reader who cannot see the period will misread as a comparison against
 * whatever they assumed. Worse, the fallback a Block would reach for is the worst
 * of the three, because a bare "+12" printed beside a figure is a number with an
 * arithmetic symbol on it, and a screen reader reads that as a formula rather
 * than as a change. So the prop is required and the Block throws without it
 * rather than printing the sign itself, and the cost of the throw is that a
 * caller who genuinely has no unit has to write the formatter that says so.
 *
 * **`seriesLabel` is required whenever any row carries a `series`, for the reason
 * the `Sparkline` JSDoc gives in full: a figure with no name is not announced
 * and not linkable.** A trend list is a column of small pictures, and a column of
 * unnamed pictures is a column of shapes a reader has to guess the meaning of from
 * the number beside them, which is the guess the whole figure exists to remove.
 * Two rows whose series are both "the last thirty days" and one row whose series
 * is the same thirty days as a percentage are three pictures that look identical
 * and mean three things, and only a name tells them apart.
 *
 * **The order is the caller's, and there is deliberately no `sort`.** A trend list
 * is ranked, and the rank is the Block's premise, but the Block cannot see what
 * it is ranking by: the caller may have ranked by the delta, by the current value,
 * by a measure of their own that is not in the data at all, or by nothing at all
 * because the list is a hand-picked set of five. A `sort` prop would have to name
 * a key, and any key it named would be wrong for at least one of those four
 * callers, and the failure would be silent: a list sorted by the wrong column
 * still looks ranked. The other answer, deriving the order from the data, is
 * worse, because it makes this Block a second derivation the caller then has to
 * keep in step with their own data, and two orderings of one list that disagree is
 * a list whose order nobody can fix without changing code in two places. So the
 * rank is the position in the array, the ordinal is drawn from it, and the caller
 * holds the one claim that ordering a ranked list makes.
 *
 * **The rows are one `<ol>`.** A list that was split by a cap, or by a variant,
 * or by whether a row had a series, would be several lists and a screen reader
 * would announce it as several. The cap shortens the list rather than dividing it,
 * and a row with no series is a shorter row, not a different kind of row.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * two Components it composes are both server Components, so a trend list costs a
 * consumer nothing in client JavaScript.
 */
export function Trend01({
  eyebrow,
  title,
  description,
  items,
  limit,
  empty,
  headingLevel = 'h2',
  className,
}: Trend01Props) {
  for (const item of items) {
    if (item.delta !== undefined && !item.deltaLabel) {
      throw new Error(
        'Trend01: an item carries a delta with no deltaLabel, so the change would print as a signed ' +
          'number beside a figure, which a screen reader reads as a formula. Pass the words for the ' +
          'change, or drop the delta and let the row carry the reading alone.',
      )
    }
    if (item.series !== undefined && !item.seriesLabel) {
      throw new Error(
        'Trend01: an item carries a series with no seriesLabel, so the shape beside the figure would be ' +
          'an unnamed picture. A figure with no name is not announced. Pass what the series is.',
      )
    }
    if (item.href !== undefined && !item.hrefLabel) {
      throw new Error(
        'Trend01: an item carries an href with no hrefLabel, so the link would be announced by its ' +
          'destination alone. A space name is a name, and the sentence saying that following the link ' +
          'is a thing you can do belongs to the caller.',
      )
    }
  }

  const shown = items.slice(0, limit ?? items.length)

  if (shown.length === 0) {
    if (empty === undefined) return null
    return (
      <Section className={className}>
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div data-slot="trend-empty" className="text-muted-foreground text-pretty text-sm">
          {empty}
        </div>
      </Section>
    )
  }

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <ol data-slot="trend-list" className={cn('flex flex-col', className)}>
        {shown.map((item, index) => (
          <li
            key={item.id}
            data-slot="trend-row"
            data-has-series={item.series === undefined ? undefined : true}
            className="border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b py-4 first:border-t"
          >
            {/*
              The ordinal, drawn from the position and not from the data. It is
              the Block's whole claim about the list, which is that the order is a
              rank, and the number is how a reader scanning the left edge reads
              it. It is the same continuity mechanism `ProcessFlow01` uses and for
              the same reason: nothing else on the row says which position it is.
            */}
            <span
              data-slot="trend-rank"
              className="text-muted-foreground w-6 shrink-0 font-mono text-xs tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <Metric
              className="min-w-0 flex-1"
              value={item.value}
              label={item.label}
              delta={item.delta}
              deltaFormat={item.deltaLabel}
            />

            {item.series !== undefined || item.href !== undefined ? (
              <div data-slot="trend-row-end" className="flex shrink-0 items-center gap-4">
                {/*
                  Both pairs are narrowed rather than asserted. The diagnostics
                  above have already refused a series with no name and a link with
                  no words, so these two conditions cannot be false here, and
                  spelling them out means the type system reads the same rule the
                  runtime does instead of a non-null assertion standing in for it.
                */}
                {item.series !== undefined && item.seriesLabel !== undefined ? (
                  <Sparkline values={item.series} label={item.seriesLabel} />
                ) : null}
                {item.href !== undefined && item.hrefLabel !== undefined ? (
                  <CtaLink href={item.href} size="sm" variant="ghost">
                    {item.hrefLabel}
                  </CtaLink>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  )
}

export default Trend01
