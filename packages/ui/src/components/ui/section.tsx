import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * Container primitive. Every block composes its own section from this so vertical
 * rhythm stays consistent across the catalog instead of being re-invented per block.
 *
 * The page column is `max-w-page` and there is one spelling of it. This line used
 * to name the sixth step of Tailwind's own container namespace, which ships at
 * the same 72rem, so nothing rendered differently and nothing failed; the two
 * names drifted the moment `--container-page` was retuned, because a retune of the
 * authored token moved every surface reaching it by name and left every surface
 * reaching it by the other where it was, with no gate firing. That namespace is
 * now closed in the token build, and `scripts/check-elevation-layout.mjs` reads
 * the authored container names out of the token source so the retired spelling is
 * a finding rather than a synonym.
 *
 * **The retired name is written here in prose and not as a class, on purpose.**
 * Tailwind's extractor reads this file, comments included, so a utility quoted in
 * a JSDoc block is a utility the shipped stylesheet emits. A record of a retired
 * class written as a class is a second copy of the tree nobody edits.
 */
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('py-16 sm:py-24', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-page px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

/**
 * The six heading levels a block can be composed at.
 *
 * Every block takes a `headingLevel` prop typed with this and forwards it to the
 * one heading it renders, so the surrounding document decides where the block
 * sits in the outline rather than the block deciding for itself. `h2` is the
 * default because a block is composed, not a page.
 *
 * A block rendered where the document *already* owns a heading for the same
 * content passes one level deeper. A catalog card already names the block in its
 * own `h2`, so the copy of the block embedded inside that card passes `h3`: the
 * embedded heading then reads as a child of the card that introduces it instead
 * of as a second, competing sibling. This is a fact about where the block was
 * placed, not about the block, which is why it is a prop and not a default.
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/** The six levels in outline order, so a level can be stepped rather than compared. */
const LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const satisfies readonly HeadingLevel[]

/**
 * The level one step below a section's own heading, which is the level a title
 * *inside* that section is composed at.
 *
 * **Why a function and not a second prop.** A block that draws a set of titled
 * cards has two headings in it: the section's own, and one per card. Asking the
 * caller for both is asking them to keep two levels in step by hand, and the two
 * drift the moment a block is embedded one level deeper than it was written for.
 * Deriving the child from the parent means a block moved from an `h2` section to an
 * `h3` one carries its card titles with it, which is the whole reason
 * `headingLevel` is a prop.
 *
 * This is what answers the question for every block that draws a titled card, so
 * the answer is one function rather than six independent guesses. A block that
 * hardcodes `h3` is right exactly once, at the nesting depth it was written for.
 *
 * **The clamp at `h6`, and why it is a clamp rather than a wrap.** A section
 * already at `h6` has no child level, so a card title inside it is asked to be
 * something it cannot be. Wrapping to `h1` would put a card's title above the
 * section that introduces it, which is worse than a sibling of it: a reader
 * navigating by heading would meet the card before the section it belongs to.
 * Holding at `h6` costs a repeated level, which a screen reader announces as the
 * same depth rather than as a break in the outline, and a `h6` section holding
 * cards is already a document that has run out of levels.
 */
export function childLevel(level: HeadingLevel): HeadingLevel {
  const at = LEVELS.indexOf(level)
  return LEVELS[Math.min(at + 1, LEVELS.length - 1)]
}

/**
 * The step of the authored type scale each heading level renders at.
 *
 * Private, and read through `headingSizeClass`, so there is one list and a caller
 * cannot add a step to it. The table and the reasoning behind it are on
 * `SectionHeading`, which is the documentation source the declaration build
 * preserves and the corpus reads, and `scripts/check-heading-scale.mjs` holds the
 * two copies in step.
 */
const HEADING_SIZE: Record<HeadingLevel, string> = {
  h1: 'text-5xl sm:text-6xl',
  h2: 'text-4xl sm:text-5xl',
  h3: 'text-3xl sm:text-4xl',
  h4: 'text-2xl sm:text-3xl',
  h5: 'text-xl sm:text-2xl',
  h6: 'text-lg sm:text-xl',
}

/**
 * The size classes a heading at `level` renders at.
 *
 * Exported for the one Block that resolves its own heading tag on a filled
 * surface rather than composing `SectionHeading`: `Cta01` cannot borrow this
 * Component's markup, because its copy sits on a `bg-primary` panel where the
 * muted description colour and `gap-4` are wrong, so it writes the element itself
 * and used to write the size with it. Two answers to the same question is how the
 * one-size defect reached a second surface, so it asks here rather than keeping a
 * second table.
 *
 * The classes are the whole answer, `font-semibold`, `tracking-tight` and
 * `text-balance` are not included, so a caller composes them onto the surface it
 * owns and cannot inherit this Component's decisions by accident.
 */
export function headingSizeClass(level: HeadingLevel): string {
  return HEADING_SIZE[level]
}

/**
 * The heading a section opens with: an optional eyebrow, the title, an optional
 * supporting line, and the level of the one heading it renders.
 *
 * `align` is the block's own decision about where the heading sits in the
 * container. `center` is right for a band that is only a heading, and `left` is
 * right for a section with content under it, where a centred title above a
 * left-aligned list reads as two unrelated pieces.
 *
 * **`as` decides the size as well as the tag, and the size is derived rather than
 * passed.** `as` was already on every Block as `headingLevel` and `childLevel()`
 * already existed to carry a level down a level, so the document decided where
 * each heading sits in the outline and the visual size simply never followed it.
 * One class string was written for all six levels, so a page `h1` and the `h2`
 * sections under it came out byte-identical, and a landing page of a hero and six
 * Blocks showed one `h1` and six section titles at 36 pixels with no hierarchy
 * between what the page claims and what it elaborates. A consumer could not
 * correct it: the size was hardcoded here, no Block exposed a way to change it,
 * and restyling a catalogue item is what the no-override-path rule does not allow.
 *
 * **The table is the authored scale walked down one step per level, and it stops
 * at the floor rather than running off the bottom.**
 *
 * | level | step | authored value | at `sm` | authored value |
 * | --- | --- | --- | --- | --- |
 * | `h1` | `text-5xl` | 3rem / 1 | `sm:text-6xl` | 3.75rem / 1 |
 * | `h2` | `text-4xl` | 2.25rem / 1.111 | `sm:text-5xl` | 3rem / 1 |
 * | `h3` | `text-3xl` | 1.875rem / 1.2 | `sm:text-4xl` | 2.25rem / 1.111 |
 * | `h4` | `text-2xl` | 1.5rem / 1.333 | `sm:text-3xl` | 1.875rem / 1.2 |
 * | `h5` | `text-xl` | 1.25rem / 1.4 | `sm:text-2xl` | 1.5rem / 1.333 |
 * | `h6` | `text-lg` | 1.125rem / 1.556 | `sm:text-xl` | 1.25rem / 1.4 |
 *
 * **`h1` is Display and Display is the ceiling of the scale**, because that is
 * the role `DESIGN.md` gives it: a page's own heading is the largest thing on the
 * page. The two steps above `4xl` are authored rather than invented here, and they
 * are authored as a pair rather than as one step, because every rung of this table
 * is a pair: a base step and one step up at `sm`. A single new step would have made
 * Display the one heading in the system that does not grow, which is a smaller
 * defect than the one this table was written to remove and is still a defect.
 * `5xl` is `4xl` times four thirds, which is the first gap in the group wider than
 * any gap it already had, and `6xl` is `5xl` times five fourths. Nothing in the
 * system goes above `6xl`, and no heading level steps above Display.
 *
 * **`h2` is one step below it, and `h2` is what almost every Block renders**,
 * because a Block is composed under a heading the document already owns. That is
 * the whole of what a consumer sees: a section title moves from 1.5rem to
 * 2.25rem, and above `sm` from 1.875rem to 3rem.
 *
 * **The floor is `h6`, and the floor is `text-lg`.** `lg` is the deepest authored
 * step that is not smaller than Body, and Body is 400 at 1.125rem, so a heading
 * that stepped one further would render smaller than the copy it introduces and
 * read as a caption rather than as a heading. The table has six rows and the scale
 * has exactly six steps at or above Body, so the ladder lands on the floor rather
 * than running off the bottom of it: every level now holds a step of its own, where
 * before `h4` through `h6` shared one. `childLevel()` clamps at `h6` for the same
 * reason the table stops there. A heading at the floor is still a heading: it keeps
 * `font-semibold`, keeps `tracking-tight`, and keeps `text-balance` at every step,
 * so weight and tracking tell it apart from body copy where size no longer can.
 *
 * So a consumer gets the hierarchy by passing the level it was already passing,
 * and a Block moved from an `h2` section into an `h3` one carries its size with
 * it, which is what `headingLevel` was introduced to do.
 *
 * **`Prose` walks this ladder from one rung down**, because its measure is the
 * reading measure rather than the page column and the Display step does not fit a
 * 42rem column. See `Prose`.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  as: Heading = 'h2',
  description,
  align = 'center',
  id,
  className,
}: {
  /**
   * A short ordinal for the section: "01", "02", "7". It is rendered in the mono
   * face above the title, because a section's position in a sequence is machine
   * notation rather than a word, and the mono stack is what this repository
   * annotates machine-readable values with.
   *
   * It is a separate prop from `eyebrow` and not a default value of it, because
   * the two say different things: an eyebrow is a word a reader reads, and an
   * index is a number that is only meaningful beside the section it counts. All
   * four NaniSoft sites render one of these above every section heading, and
   * three of them render it beside a label rather than above a title, which is
   * the same fact in a different arrangement.
   */
  index?: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  /**
   * Heading level. Defaults to `h2` because blocks compose under a page heading.
   * A page that renders a block as its primary heading passes `as="h1"`; a
   * document with no `h1` gives screen-reader and search engines no top-level
   * entry point.
   *
   * It also picks the size, and there is no prop for the size. The table is in
   * this Component's JSDoc above: `h1` at 3rem, `h2` at 2.25rem, `h3` at
   * 1.875rem, `h4` at 1.5rem, `h5` at 1.25rem and `h6` at 1.125rem, each
   * stepping up one authored step above `sm`. Passing a deeper level is
   * therefore a typographic decision as well as an outline one, which is the
   * point: a Block composed one level deeper should read as one level deeper.
   */
  as?: HeadingLevel
  /**
   * The heading's own id, so something else on the page can name itself from it.
   *
   * A prop rather than a generated id because the reference is the point: a caller
   * that draws a table, a list or a region under this heading and wants that thing
   * to carry an accessible name needs a handle on this element, and an id nobody
   * can write down is no handle. `aria-labelledby` on the table is the case that
   * made it necessary, and it is the arrangement `ChoiceCard` uses for its legend.
   *
   * Not generated here, because a generated id cannot be referred to and an unused
   * one on every section heading is noise in the markup.
   */
  id?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {index ? (
        <span className="text-muted-foreground font-mono text-xs font-normal tracking-normal">
          {index}
        </span>
      ) : null}
      {eyebrow ? (
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {eyebrow}
        </span>
      ) : null}
      <Heading
        id={id}
        className={cn('font-semibold tracking-tight text-balance', headingSizeClass(Heading))}
      >
        {title}
      </Heading>
      {description ? (
        <p className="text-muted-foreground max-w-measure text-lg text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  )
}
