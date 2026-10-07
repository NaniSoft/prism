import { Card, CardContent } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Sparkline } from '../../components/ui/sparkline'
import type { MetricSpec } from '../../lib/spec'

/**
 * The props a Stats01 takes. Every string and every figure is a prop and the Block
 * ships none.
 */
export type Stats01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a row composed under its own heading. */
  title?: string
  /**
   * The figures, in the order a reader should meet them.
   *
   * **The shared `MetricSpec` and not a shape of this Block's own.** `key`,
   * `label` and `value` are required on each figure, `delta` is a number whose sign
   * is the direction, `deltaFormat` is the caller's own words for that change,
   * `hint` carries the period or the caveat, and a `series` and an `href` each travel
   * with the label or the words they cannot be read without. The type is published as
   * `@nanisoft/prism-ui/spec`, so the words a caller learns on a summary are the
   * words on this row.
   */
  stats: MetricSpec[]
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * The refusals, as checks, so a tile that would render a link nobody can name is a
 * diagnostic in a console rather than a rendered link.
 *
 * **The type already holds both pairs, and these checks exist for the caller the
 * type never saw.** `MetricSpec` requires a destination's words wherever it has a
 * destination and a series name wherever it has a series, so a typed caller cannot
 * reach either diagnostic. A JavaScript caller can, and the cost of reaching one is
 * a figure that draws a link with no words or a shape no reader can announce, so the
 * same rule is stated once more where a runtime value can be read: the pair rule is
 * the one `Dashboard01` makes.
 */
function assertMetrics(metrics: readonly MetricSpec[]): void {
  for (const metric of metrics) {
    if ((metric.href === undefined) !== (metric.hrefLabel === undefined)) {
      throw new Error(
        `Stats01: the statistic "${metric.key}" declares one of href and hrefLabel without the other, so the ` +
          'tile would carry a link with no words on it, or a name with no link beside it. Pass the words that say ' +
          'what following it does, or omit the href.',
      )
    }
    if ((metric.series === undefined) !== (metric.seriesLabel === undefined)) {
      throw new Error(
        `Stats01: the statistic "${metric.key}" declares one of series and seriesLabel without the other, so the ` +
          'figure would be a picture with no name, which a screen reader cannot announce and two shapes in one row ' +
          'cannot be told apart. Pass the series name in the words the product uses, or omit the series.',
      )
    }
  }
}

/**
 * A KPI row whose figures are the shared `MetricSpec` drawn by `Metric` and
 * `Sparkline`. Every figure is a prop.
 *
 * **This block used to carry a hardcoded set reading "128 blocks shipped" and
 * "9.4k weekly installs".** Those were invented figures about a library nobody
 * installs yet, and because they lived in the component rather than at the call site,
 * a consumer who installed the block shipped fabricated metrics into their own
 * dashboard. A stat block with invented stats in it is worse than no stat block.
 *
 * **It declared its own statistic type and guessed the unit, and that guess is the
 * reason it is in this migration.** Its `delta` was documented as a percentage change
 * and the Block appended a percent sign to the number, which is the one guess
 * `Metric` refuses to make, because a delta of `0.12` is twelve percent, twelve cents
 * or twelve milliseconds. It also carried no series, so the trend a metric summary
 * names had nowhere to go. After this migration a delta with no formatter prints the
 * number the caller passed and a delta with a formatter prints the caller's words,
 * and the same consumer stops seeing a formatted change on one screen and a bare
 * number on another.
 *
 * **The Block keeps its own name, kind and arrangement.** It is the same job as a row
 * of figures with less of it declared, and a consumer who wants figures above
 * supporting detail composes the dashboard Block beside them rather than either
 * becoming the other. Only the statistic shape moves, because a shape is shared and a
 * screen is not.
 *
 * **It still aggregates nothing and judges nothing.** It does not sum, count,
 * average, bucket, rank or divide, it owns no threshold, no target, no severity and
 * no freshness, and it draws no period switcher, no comparison toggle and no export.
 * The period is the caller's words, carried by the `hint` and the delta formatter,
 * and no period member exists.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Stats01({ eyebrow, title, stats, headingLevel = 'h2' }: Stats01Props) {
  assertMetrics(stats)

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          eyebrow={eyebrow}
          title={title}
          align="left"
          className="mb-10"
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((metric) => {
          // The delta's words are the caller's own node, and `Metric` takes a
          // formatter, so the node is placed through one. A delta with no words is
          // left to `Metric`, which prints the number the caller passed.
          const deltaWords = metric.deltaFormat
          return (
            <Card
              key={metric.key}
              data-slot="stats-01-stat"
              data-metric={metric.key}
              className="gap-2 py-5"
            >
              <CardContent className="flex flex-col gap-3">
                <Metric
                  value={metric.value}
                  label={metric.label}
                  delta={metric.delta}
                  deltaFormat={deltaWords === undefined ? undefined : () => deltaWords}
                  hint={metric.hint}
                />
                {metric.series === undefined ? null : (
                  <div data-slot="stats-01-sparkline" className="flex">
                    <Sparkline values={metric.series} label={metric.seriesLabel} className="ms-auto" />
                  </div>
                )}
                {metric.href === undefined ? null : (
                  <CtaLink href={metric.href} variant="ghost" size="sm">
                    {metric.hrefLabel}
                  </CtaLink>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}

export default Stats01
