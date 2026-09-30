import { useId, type ReactNode } from 'react'

import { Badge } from '../../components/ui/badge'
import { Metric } from '../../components/ui/metric'
import { Prose } from '../../components/ui/prose'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One figure the customer is asserting.
 *
 * Every field is the customer's own: the number, the label that says what it
 * measures, and the delta and the hint. See the Block's JSDoc for why this row
 * is the reason the Block exists.
 */
export type CaseStudy01Result = {
  /** What the figure measures, in the customer's words. */
  label: string
  /**
   * The figure, already formatted.
   *
   * A node rather than a number, for the reason `Metric` takes a node: a figure a
   * consumer formatted itself is a machine reading, and this package attaches no
   * unit to a number it has never seen.
   */
  value: ReactNode
  /**
   * The change against the previous period, as a plain number.
   *
   * No unit, because Prism cannot know whether this is twelve percent or twelve
   * seconds, and `Metric` prints the number exactly as passed unless the caller
   * gives it a formatter. Pass `0.12` and the row reads `0.12`.
   */
  delta?: number
  /** The period, the source or the caveat that matters here. */
  hint?: ReactNode
}

/**
 * A quotation, with the person who said it.
 *
 * The words are the customer's and so are the person's: a case study that puts
 * words in a named person's mouth is a fabrication with an attribution on it.
 */
export type CaseStudy01Quote = {
  /** What the person said. */
  quote: ReactNode
  /** Who said it, as they are named. */
  name: string
  /** What they do, where the customer publishes it. */
  role?: string
}

/** Everything a CaseStudy01 takes, other than whether a quote was given. */
type CaseStudy01CommonProps = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, when it is not the customer name.
   *
   * Omit it and the customer's name is the section heading, which is the right
   * default here: a case study headed by the work rather than by the customer
   * invites the reader to read it as a claim about a customer rather than about
   * a result. The customer's name is drawn in the body either way, so passing a
   * title never hides it.
   */
  title?: ReactNode
  /**
   * Whose it is.
   *
   * Required, and required because a case study without a named customer is an
   * advertisement with a paragraph attached. The name is a claim about another
   * organisation, so it is the consumer's to publish and Prism's only to draw.
   */
  customer: string
  /** The sector the customer is in, as a label. */
  sector?: string
  /**
   * The one-paragraph account of what happened.
   *
   * Required, because a case study with no account is a logo with a number under
   * it. It is the paragraph a reader reads before deciding whether the figures
   * below it mean anything.
   */
  summary: ReactNode
  /**
   * The problem, as authored content.
   *
   * A node rather than a string because this is a run of prose and the caller
   * authors prose: paragraphs, lists, a heading. A Block that took a string would
   * be taking one paragraph where the caller wrote three. If the run contains a
   * heading, compose it at `childLevel(headingLevel)`, which is a fact about where
   * the Block was placed and so is the caller's to get right.
   */
  problem?: ReactNode
  /**
   * What was done, as authored content.
   *
   * Same shape as `problem` and the same rule about a heading inside it.
   */
  approach?: ReactNode
  /**
   * The figures the customer is asserting.
   *
   * Required, and an empty array renders no results strip at all rather than two
   * hairlines around nothing. A case study with no result is a case study with no
   * case, and the type says the row is owed while the renderer declines to draw
   * an empty frame. Every figure here is the customer's assertion and none of
   * them is Prism's.
   */
  results: readonly CaseStudy01Result[]
  /** The caller's actions, for the sentence that asks the reader what to do. */
  actions?: ReactNode
  /**
   * `stacked` puts the narrative above the figures. `split` puts the narrative in
   * the left column and the figures and the quotation in the right one.
   *
   * @defaultValue 'stacked'
   */
  layout?: 'stacked' | 'split'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The props a CaseStudy01 takes.
 *
 * The union is the one place in this Block where the type system earns its keep:
 * `quoteLabel` is required in exactly the shape where a quotation is rendered and
 * meaningless in the shape where none is, and two independent optionals could not
 * say that. This is the `HeroAction` rule applied to a figure rather than to an
 * anchor.
 */
export type CaseStudy01Props = CaseStudy01CommonProps &
  (
    | {
        /** The quotation to close with. */
        quote: CaseStudy01Quote
        /**
         * The figure's accessible name, so a reader is told this is a quotation
         * rather than body copy.
         *
         * Required whenever `quote` is given. A blockquote with no name is a run
         * of italic text that a screen reader reads as the page own words, and a
         * case study whose quotation is indistinguishable from its own prose is a
         * misattribution waiting to happen.
         */
        quoteLabel: string
      }
    | {
        /** No quotation, and therefore no name owed for one. */
        quote?: never
        quoteLabel?: never
      }
  )

/**
 * One case study in full: a customer, a sector, the problem, what was done, the
 * figures the customer asserts, and optionally a quotation.
 *
 * **The results row is the reason this Block exists, and every figure in it is
 * the caller's.** A case study is the one page on a marketing site where a
 * number is legally dangerous. Every other number on a marketing page is
 * decoration the reader can discount, and a number under the word "results" is a
 * statement of fact about a third party that a publisher is accountable for. So
 * `results` is a prop, every field of it is a prop, `Metric` is handed the value
 * the consumer formatted and is never asked what unit it is in, and there is not
 * one figure, one percentage and one period in this package. The alternative was
 * a Block that shipped a plausible reduction figure, which is worse than useless:
 * it is a false advertising claim that installs itself into every consumer's
 * product, on a page nobody in this repository has any standing to publish, and
 * the consumer who left it alone would inherit it silently. That is the whole
 * design, and every other decision below is smaller than it.
 *
 * **`delta` is a bare number and the row says exactly what it was given.** `0.12`
 * prints as `0.12`, because `Metric` takes an optional formatter and Prism has no
 * formatter for a caller's domain. The honest arrangement is to put the unit in
 * `value`, where the consumer formatted it, or to pass a formatter; the cost of
 * the refusal is a row that says `0.12` where the reader hoped for `12%`, which is
 * honest and usually not what was wanted. Stating that is better than guessing
 * a percent sign onto a number about somebody else's revenue.
 *
 * **`quoteLabel` is required with a quotation, and it names the `figure`.** The
 * quotation is a `figure` rather than a `blockquote` on its own so that it has a
 * name, and the name is drawn as a visually hidden node inside that figure and
 * reached with `aria-labelledby` from a generated id. Without it a screen reader
 * reads the quotation as the page's own sentences, and a case study in which the
 * quotation cannot be told from the prose is a case study that misattributes
 * words. `useId` is the source of that id for the reason `ListPanel` states: a
 * hand-counted id collides the moment two case studies are on one page, which is
 * exactly what happens on a marketing site.
 *
 * **The narrative is `Prose`, so the caller writes prose and Prism holds the
 * measure.** `problem` and `approach` are nodes rather than strings because they
 * are runs of authored content: paragraphs, lists, a heading. A Block that took a
 * string would take one paragraph where the consumer wrote three, which is how a
 * case study ends up with a wall of semicolon-separated claims. The cost is
 * stated rather than hidden: the run arrives unstyled, so a caller who wants a
 * label above it composes its own heading, and that heading should be at
 * `childLevel(headingLevel)` because the level of a heading inside authored prose
 * is a fact about where the Block was placed.
 *
 * **`stacked` and `split` are two arrangements of the same content and neither
 * changes what is claimed.** A stacked study reads the account first and the
 * figures after it, which suits a long narrative; a split one puts the figures
 * beside the account, which suits a reader who came for the number. The Block
 * does not choose between them and does not decide how many figures fit either
 * way, so a caller with five figures gets five figures in both.
 *
 * The section title is `title` when given and the customer's name otherwise, and
 * the customer's name is drawn in the body either way. The section is the one
 * place in this package where the heading is a claim about a third party, which
 * is why the name is a required prop and never a default: there is no anonymous
 * case study here, and a generic label standing in for a name would be an
 * advertisement rather than a study.
 *
 * It is a server Component: no hook, no state and no client code. `useId` is the
 * one React call it makes, and it is the call the server render supports, which
 * `ListPanel`, `FilterPanel` and `FileUpload` already depend on.
 */
export function CaseStudy01({
  eyebrow,
  title,
  customer,
  sector,
  summary,
  problem,
  approach,
  results,
  quote,
  quoteLabel,
  actions,
  layout = 'stacked',
  headingLevel = 'h2',
  className,
}: CaseStudy01Props) {
  const quoteId = useId()

  const account = (
    <>
      {problem === undefined ? null : (
        <Prose data-slot="case-study-problem">{problem}</Prose>
      )}
      {approach === undefined ? null : (
        <Prose data-slot="case-study-approach">{approach}</Prose>
      )}
    </>
  )

  const figures =
    results.length === 0 ? null : (
      <div
        data-slot="case-study-results"
        className="border-border grid gap-6 border-y py-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {results.map((result, index) => (
          <Metric
            key={`${result.label}-${index}`}
            data-result={result.label}
            value={result.value}
            label={result.label}
            delta={result.delta}
            hint={result.hint}
          />
        ))}
      </div>
    )

  const quotation =
    quote === undefined ? null : (
      <figure data-slot="case-study-quote" aria-labelledby={quoteId} className="flex flex-col gap-3">
        <span id={quoteId} className="sr-only">
          {quoteLabel}
        </span>
        <blockquote
          data-slot="case-study-quotation"
          className="text-balance text-lg font-medium text-pretty sm:text-xl"
        >
          {quote.quote}
        </blockquote>
        <figcaption data-slot="case-study-attribution" className="flex flex-col gap-0.5 text-sm">
          <span className="font-medium">{quote.name}</span>
          {quote.role === undefined ? null : (
            <span className="text-muted-foreground">{quote.role}</span>
          )}
        </figcaption>
      </figure>
    )

  return (
    <Section className={className}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title ?? customer}
        className="mb-8"
      />

      <div
        data-slot="case-study"
        data-layout={layout}
        className={cn(layout === 'split' ? 'flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-12' : 'flex flex-col gap-10')}
      >
        <div
          data-slot="case-study-account"
          className={cn('flex flex-col gap-6', layout === 'split' ? 'lg:col-span-2' : '')}
        >
          <div data-slot="case-study-meta" className="flex flex-wrap items-center gap-3">
            <span data-slot="case-study-customer" className="text-sm font-semibold">
              {customer}
            </span>
            {sector === undefined ? null : (
              <Badge variant="outline" data-sector={sector}>
                {sector}
              </Badge>
            )}
          </div>

          <p data-slot="case-study-summary" className="max-w-measure text-lg text-pretty">
            {summary}
          </p>

          {account}
        </div>

        <div data-slot="case-study-evidence" className="flex flex-col gap-8">
          {figures}
          {quotation}
        </div>
      </div>

      {actions === undefined ? null : (
        <div data-slot="case-study-actions" className="mt-10 flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </Section>
  )
}

export default CaseStudy01