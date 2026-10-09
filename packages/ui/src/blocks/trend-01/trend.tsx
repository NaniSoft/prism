import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Sparkline } from '../../components/ui/sparkline'
import type { MetricSpec } from '../../lib/spec'
import { cn } from '../../lib/utils'

/**
 * The refusals, as checks, so an item that would render a link nobody can name is a
 * diagnostic in a console rather than a rendered link.
 *
 * **The type already holds both pairs, and these checks exist for the caller the
 * type never saw.** `MetricSpec` requires a destination's words wherever it has a
 * destination and a series name wherever it has a series, so a typed caller cannot
 * reach either diagnostic. A JavaScript caller can, and the cost of reaching one is a
 * row that draws a link with no words or a shape no reader can announce, so the same
 * rule is stated once more where a runtime value can be read: the pair rule is the
 * one `Dashboard01` makes.
 */
function assertMetrics(items: readonly MetricSpec[]): void {
  for (const metric of items) {
    if ((metric.href === undefined) !== (metric.hrefLabel === undefined)) {
      throw new Error(
        `Trend01: the item "${metric.key}" declares one of href and hrefLabel without the other, so the ` +
          'row would carry a link with no words on it, or a name with no link beside it. Pass the words that say ' +
          'what following it does, or omit the href.',
      )
    }
    if ((metric.series === undefined) !== (metric.seriesLabel === undefined)) {
      throw new Error(
        `Trend01: the item "${metric.key}" declares one of series and seriesLabel without the other, so the ` +
          'shape beside the figure would be a picture with no name, which a screen reader cannot announce. Pass ' +
          'the series name in the words the product uses, or omit the series.',
      )
    }
  }
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
   *
   * Each row is the shared `MetricSpec`: a stable `key` that is never the words of
   * the label, a required `label` and `value`, a `delta` whose sign is the
   * direction, an optional `deltaFormat` for the caller's own words, an optional
   * `hint`, and an optional `series` and `href` with the names they travel with.
   */
  items: readonly MetricSpec[]
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
 * **The rows are the shared `MetricSpec`, so a row here and a figure on a summary
 * are one shape rather than two that disagree.** Each row carries a stable `key`
 * that is never the words of the label, a required `label` and `value`, an optional
 * `delta` whose sign is the direction, an optional `deltaFormat` carrying the
 * caller's own words for the change, an optional `hint` for the period or the
 * caveat, and an optional `series` and `href` each travelling with the name it
 * cannot be read without. This closes the absence that put this Block in the
 * migration: a reading now has a place for a series and for a destination, so the
 * trend a metric summary names has somewhere to go when the two sit on one screen.
 *
 * **The words for the change stay the caller's, and the Block mints no period and
 * no arithmetic.** `deltaFormat` is the caller's own node rather than a formatter
 * this Block could write, because "up 12 percent", "+12%" and "12 higher than last
 * week" are three sentences about one number and no single fallback is right for
 * all three. A delta with a formatter prints the caller's words and one without
 * prints the number the caller passed, which is `Metric`'s own contract. There is
 * no period member, no derived rate of change and no period-over-period arithmetic
 * over the series the caller passed, because each of those is a second arithmetic
 * this package would be doing over a population it never fetched.
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
  assertMetrics(items)

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
            key={item.key}
            data-slot="trend-row"
            data-metric={item.key}
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
              deltaFormat={
                item.deltaFormat === undefined ? undefined : () => item.deltaFormat
              }
              hint={item.hint}
            />

            {item.series !== undefined || item.href !== undefined ? (
              <div data-slot="trend-row-end" className="flex shrink-0 items-center gap-4">
                {/*
                  Both pairs are held by `MetricSpec`: a series is declared with its
                  name and a destination with its words, so the type system reads the
                  same rule the runtime does instead of a non-null assertion standing
                  in for it.
                */}
                {item.series === undefined ? null : (
                  <Sparkline values={item.series} label={item.seriesLabel} />
                )}
                {item.href === undefined ? null : (
                  <CtaLink href={item.href} size="sm" variant="ghost">
                    {item.hrefLabel}
                  </CtaLink>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  )
}

export default Trend01
