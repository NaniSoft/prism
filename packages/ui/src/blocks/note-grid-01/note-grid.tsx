import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'

/**
 * One note in the grid: a title and one or two sentences under it.
 *
 * Both are required, and a note with no title is a bullet and a note with no
 * body is a heading. The grid is a set of titled points, and each point is
 * short enough that neither half is optional.
 */
export type NoteGrid01Note = {
  /**
   * The point's title: a short noun phrase, not a sentence. The grid is scanned
   * down its left edge, so a title that wraps to two lines costs every other row
   * its alignment.
   */
  title: string
  /** One or two sentences about the point. */
  body: string
}

/**
 * The props a NoteGrid01 takes.
 *
 * Every string is a prop and the Block ships none: no note, no title and no
 * default set of arguments. A grid that hardcoded its points would hand every
 * consumer an argument for a product that is not theirs.
 */
export type NoteGrid01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The notes, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which point matters first.
   */
  notes: readonly NoteGrid01Note[]
  /**
   * The line under the grid, for the sentence that qualifies it: what the points
   * do not cover, or where to read more.
   */
  caption?: string
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * A grid of short points: a title and a sentence or two, on a hairline above each
 * one, with no tile and no icon.
 *
 * Three of the four NaniSoft sites compose this section, immediately after the
 * process rail and before the next numbered band, and each one drew it as the
 * same thing: a multi-column set of short points, each a bold title and a short
 * paragraph, with no card and no icon. All three also composed it *twice* - once
 * under the rail and once under a different section - so three hand-written grids
 * became six, each with its own column count and its own spacing.
 *
 * It is a `dl` rather than a grid of `div`s, because each note is a term and its
 * explanation and a definition list is what says so. The titles are `dt`s and the
 * bodies are `dd`s, so a screen reader announces "the title, the body" for each
 * point rather than reading six bold words and then six paragraphs and leaving a
 * reader to pair them up.
 *
 * **No tile, no icon, no badge.** The point of this section is that it carries
 * more words than a card does, and a card's job is to carry few. A note with an
 * icon tile in front of it reads as a feature and is read as one, and a section of
 * twelve features is a page that argues rather than explains. Where a point wants
 * an icon and a card, that is `FeatureGrid01`, and the two Blocks are two
 * different jobs rather than two densities of one.
 *
 * The column count is two on a wide viewport and three at the largest, with four
 * notes as the comfortable case. A note whose body runs past three lines stops
 * being a note, so the detail belongs in the row that needs it or above the grid
 * in `description`.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function NoteGrid01({
  eyebrow,
  title,
  description,
  notes,
  caption,
  headingLevel = 'h2',
}: NoteGrid01Props) {
  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <dl data-slot="note-grid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div key={note.title} data-slot="note-grid-note" className="border-border flex flex-col gap-2 border-t pt-4">
            <dt className="text-sm font-semibold">{note.title}</dt>
            <dd className="text-muted-foreground text-pretty text-sm">{note.body}</dd>
          </div>
        ))}
      </dl>

      {caption ? <p className="text-muted-foreground mt-6 text-pretty text-sm">{caption}</p> : null}
    </Section>
  )
}

export default NoteGrid01
