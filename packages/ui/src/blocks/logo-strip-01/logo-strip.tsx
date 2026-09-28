import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One item of the strip, as a string.
 *
 * A string rather than a node, because the strip is a run of short words and a
 * node would let a caller put a paragraph in a slot whose whole job is to be
 * scannable in one glance. A caller with more than a few words about one item
 * wants a `NoteGrid01` row or a `StatusLedger01` row, not a longer strip.
 */
export type LogoStripItem = string

/**
 * The props a LogoStrip01 takes.
 *
 * Every string is a prop and the Block ships none. There is no default list of
 * technologies, no default list of customers and no default list of words: a
 * strip that hardcoded any of them would hand every consumer a claim about who
 * uses their product.
 */
export type LogoStrip01Props = {
  /**
   * The items, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which item matters first.
   */
  items: readonly LogoStripItem[]
  /**
   * The strip's accessible name, for a strip that is not inside a region the
   * reader can already name. It is rendered as the list's name and as no visible
   * text, because the items are the visible content and a heading above them would
   * be a heading about a heading.
   *
   * It is required because it is a word a reader hears. A Block that ships no copy
   * ships no reader-facing copy either, so "Highlights" is not this Block's to
   * choose: on one site the strip is a list of data sources and on another it is a
   * list of capabilities, and the word that says which is the caller's.
   */
  label: string
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a strip composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A single line of short items: the transition band between a hero and the
 * section that follows it.
 *
 * All four NaniSoft sites compose this band, immediately after the hero and
 * before the first numbered section, and each one wrote it as the same thing: a
 * row of three to six short phrases, separated by a middot, in muted text, with
 * no heading at all. Four hand-written strips, four sets of site CSS, and one
 * question each of them answered differently - whether the strip is a list, a
 * paragraph with separators, or a decorative row of spans.
 *
 * It is a `ul`, so a screen reader hears how many items there are before it
 * hears the first one. That is the whole answer to the question: a strip whose
 * items are spans in a `div` is announced as one run of text with no count, and a
 * reader deciding whether to keep listening has nothing to weigh.
 *
 * **The strip does not move.** A band of items that slides is an entrance
 * animation, and this system has none: motion is state feedback only, shortened
 * rather than removed under reduced motion. What the four sites actually wanted
 * from their strips was a second, quieter statement of what the product is, and
 * repetition of the type does that without anything moving. A strip of more than
 * about eight items wraps onto three lines on a phone and stops being a band, so
 * a longer set belongs in a `StackGrid01`.
 *
 * The items are `text-balance` so a two-word item does not break across lines
 * where a one-word item beside it does not. There is no separator glyph between
 * them: a middot is punctuation a screen reader reads and a sighted reader parses
 * as content, and the gap already separates two words from two words.
 *
 * It is a server Component: no hook, no state, no keyframes and no client code.
 */
export function LogoStrip01({
  items,
  label,
  eyebrow,
  title,
  description,
  headingLevel = 'h2',
  className,
}: LogoStrip01Props) {
  if (items.length === 0) return null

  return (
    <Section className="py-10 sm:py-14">
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-10"
        />
      ) : null}

      <ul
        data-slot="logo-strip"
        aria-label={items.length > 1 ? label : undefined}        className={cn(
          'text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm',
          className,
        )}
      >
        {items.map((item) => (
          <li key={item} data-slot="logo-strip-item" className="text-balance">
            {item}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default LogoStrip01
