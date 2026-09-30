import type { ReactNode } from 'react'

import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One row: a copy column and a visual column, with the visual on a side this
 * Block derives rather than one the caller passes.
 */
export type FeatureRow = {
  /** Optional label above the row's title. It has no default, and none is a default. */
  eyebrow?: string
  /**
   * The row's title. A heading one step below the section that introduces the set,
   * derived from `headingLevel`, so a section embedded one level deeper carries its
   * outline with it.
   */
  title: string
  /** The paragraph under the title. One or two sentences. */
  body: string
  /**
   * The visual: a figure, a screenshot, a chart, or any node the consumer
   * composed. Omit it for a row that is copy only.
   *
   * The Block draws the panel around it. See the Block's own JSDoc for why the
   * frame is the Block's and not the caller's.
   */
  media?: ReactNode
  /**
   * The accessible name of the visual, published on the `<figure>` and as no
   * visible text.
   *
   * Required whenever `media` is passed, and the Block throws without it rather
   * than shipping a figure a reader cannot name. That is the rule
   * `InstrumentPanel01` states for its state, and the reason is the same one: a
   * reader navigating by figure lands on two of them on this page and can tell
   * them apart only by their names.
   */
  mediaAlt?: string
  /**
   * Forbidden, and present in the type only to say so.
   *
   * The side of the visual is derived from the row's index. See the Block's own
   * JSDoc: a per-row `align` is a decision four times over, and they disagree the
   * first time somebody inserts a row. `align` on the Block sets the first row
   * and the rest follow from the index.
   */
  align?: never
}

/**
 * The props a FeatureRows01 takes. Every string is a prop and the Block ships
 * none: no row, no title and no default set of arguments.
 */
export type FeatureRows01Props = {
  /**
   * The rows, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which capability matters first.
   */
  rows: readonly FeatureRow[]
  /**
   * Which side the FIRST row's copy column takes. Every row after it alternates.
   *
   * One decision for the whole set rather than one per row, for the reason the
   * row type forbids `align`: a per-row value is a decision four times over and
   * the four answers will disagree the first time somebody inserts a row above
   * them, and the disagreement is invisible because each row on its own looks
   * deliberate.
   *
   * @defaultValue 'left'
   */
  align?: 'left' | 'right'
  /**
   * Starts the alternation from the other side, so the first row's copy takes the
   * side `align` does not name.
   *
   * It is a second spelling of the same single decision rather than a second
   * decision, and both exist because a page's composition is written two ways: a
   * layout is described as "copy on the right" by someone reading the grid and as
   * "image first" by someone reading the page. When both are passed, `reverse`
   * wins, and that is stated here rather than left for a reader to infer from the
   * order of two keywords.
   *
   * @defaultValue false
   */
  reverse?: boolean
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a set of rows composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * Heading level for the section title and, one step below it, for each row's
   * title. Defaults to `h2` because a Block is composed, not a page. See
   * `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A set of two-column rows: a copy column and a visual column, with the visual
 * alternating sides down the set.
 *
 * **The alternation is derived from the row's index, and the row type forbids the
 * prop that would stop it.** The obvious API is `align` on each row, and it is
 * wrong for a reason that only shows up over time: a set of four rows with four
 * alignments is one decision made four times, and the four answers agree until
 * somebody inserts a row in the middle, at which point every row below it is
 * wrong and each of them looks deliberate. A Block exists to end exactly that
 * drift, so the Block ends it here: the section's `align` sets the first row and
 * the index does the rest. Inserting a row re-alternates the whole set, which is
 * the correct answer, and the alternative is a page where row three and row four
 * both put the visual on the same side because somebody copied row two.
 *
 * **The visual is inside a panel, and the panel is the Block's.** The rule is
 * `Hero01`'s and it is repeated rather than assumed: a bare figure on the page
 * ground reads as an illustration, and the same figure inside a bordered panel
 * reads as an instrument, which is what it is. A screenshot of a dashboard with
 * no frame is a picture of a dashboard; the same screenshot in a panel is a
 * product making a claim about itself. Here Prism draws the frame because the
 * rows are the section's rhythm rather than the consumer's, and a set of rows
 * where four of the six frames are missing reads as four rows somebody forgot.
 * The cost is real: the panel is not free, it is a border and a surface on every
 * row, and a consumer with one row and no other frame on the page has added a
 * box for a box's sake. `mediaAlt` is required alongside `media` for the same
 * reason the panel exists: a figure a reader cannot name is a figure a reader
 * navigating by figure cannot find again.
 *
 * **The copy is first in the DOM on every row, whatever side it is drawn on.** The
 * alternation is expressed with `order` rather than by swapping the markup, so a
 * screen reader reaches the title before the figure on all four rows instead of
 * first on two of them, and a reader with styles off still gets title then
 * figure. The visual order changes; the reading order does not.
 *
 * **The rows are `<section>`s inside the section, and that nesting is on
 * purpose.** Each row is a topic of its own, with its own title, so it is a
 * region a reader can jump to and one a browser can scroll to. A page of four
 * rows rendered as four `<div>`s is four topics with no names, and the outline
 * stops at the section heading. The rows are headings one level below the
 * section, derived with `childLevel` for the same reason every other Block that
 * draws titled cards derives it: a Block moved from an `h2` section into an `h3`
 * one carries its outline with it instead of announcing four siblings of itself.
 *
 * **The heading is aligned left.** `SectionHeading` states the rule: `center` is
 * for a band that is only a heading, and this section has four rows of content
 * under it. A centred title above an alternating set reads as two unrelated
 * pieces, because every row below it is flush left or flush right.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and the
 * vertical rhythm rather than re-deriving either, and it adds no container width
 * and no section padding of its own.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function FeatureRows01({
  rows,
  align = 'left',
  reverse = false,
  eyebrow,
  title,
  description,
  headingLevel = 'h2',
  className,
}: FeatureRows01Props) {
  // A row's title is a heading one step below the section that introduces the set,
  // derived rather than written, so a Block embedded one level deeper carries its
  // outline with it.
  const Title = childLevel(headingLevel)
  // The side the first row's copy takes, resolved once. `reverse` is the second
  // spelling of the same decision and wins when both are passed, which the prop
  // documents rather than leaves to the order of two keywords.
  const firstCopyLeft = reverse ? align === 'right' : align === 'left'

  for (const row of rows) {
    if (row.media !== undefined && !row.mediaAlt) {
      throw new Error(
        'FeatureRows01: a row was passed a media node with no mediaAlt, so the figure would be one a reader ' +
          'navigating by figure cannot tell from the next one on the page. Pass the words you mean, or omit the media.',
      )
    }
  }

  return (
    <Section data-slot="feature-rows-01" className={className}>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-16"
        />
      ) : null}

      <div data-slot="feature-rows" className="flex flex-col gap-20">
        {rows.map((row, index) => {
          // The derivation, and the whole of the prop decision: the first row takes
          // the section's side and every row after it is the other one.
          const copyOnLeft = index % 2 === 0 ? firstCopyLeft : !firstCopyLeft

          return (
            <section
              key={row.title}
              data-slot="feature-rows-row"
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {/*
                The copy column. It is first in the DOM on every row, and the side
                is expressed with `order` rather than by swapping the two columns in
                the markup, so the reading order does not alternate with the visual
                order.
              */}
              <div
                data-slot="feature-rows-copy"
                className={cn(
                  'flex flex-col gap-4',
                  !copyOnLeft ? 'lg:order-2' : 'lg:order-1',
                )}
              >
                {row.eyebrow ? (
                  <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    {row.eyebrow}
                  </span>
                ) : null}
                <Title className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {row.title}
                </Title>
                <p className="text-muted-foreground text-pretty text-base">{row.body}</p>
              </div>

              {/*
                The visual. The panel is drawn here rather than left to the caller
                for the reason the Block's own JSDoc states: a bare figure on the
                page ground reads as an illustration, and the same figure inside a
                panel reads as an instrument. The name is required, and the block
                throws without it, because a figure a reader cannot name is a figure
                they cannot find again.
              */}
              {row.media ? (
                <figure
                  data-slot="feature-rows-media"
                  aria-label={row.mediaAlt}
                  className={cn(
                    'bg-card flex min-w-0 flex-col justify-center rounded-xl border p-4 shadow-sm',
                    copyOnLeft ? 'lg:order-1' : 'lg:order-2',
                  )}
                >
                  {row.media}
                </figure>
              ) : null}
            </section>
          )
        })}
      </div>
    </Section>
  )
}

export default FeatureRows01