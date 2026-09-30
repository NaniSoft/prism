import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One dated entry, as the grid draws it.
 *
 * Only `id`, `title` and `summary` are required, and the three of them are the
 * three things an entry is: something a reader can name, something they can read,
 * and a stable key. Everything else is annotation, and an entry with no annotation
 * renders the three it has rather than a card with a line of empty space where the
 * annotation would have been. That is the whole rule for every optional field on
 * this type: a field that is absent draws nothing, because a grid of six cards
 * where four have a date and two have a blank under the title reads as two entries
 * whose dates are lost rather than as a set where the dates vary.
 */
export type ContentGrid01Entry = {
  /**
   * The entry's stable key within the set.
   *
   * A key and not a label, for the reason `CaseStudies01` states: a grid of
   * entries is reordered by a consumer as often as it is read, and a key made of
   * the words means a rename in the copy is a rename in the key.
   */
  id: string
  /**
   * The entry's own name, as a reader would name it in conversation. It is the
   * heading of the card or the row and the first thing a reader reads.
   */
  title: string
  /**
   * The line or two under the name.
   *
   * A node rather than a string, and the difference is that a caller may hand
   * Prism a plain string, a `<p>`, a list of three points, or a `<dl>` it built
   * itself, and the Block draws it inside the element it already styles. The
   * Block wraps it in a `div` and not a `p`, so a caller that passes a paragraph
   * does not get a paragraph inside a paragraph, and a caller that passes a list
   * does not get a list inside a paragraph.
   */
  summary: ReactNode
  /**
   * The moment, or the period, or the version, the entry belongs to.
   *
   * A string and not a `Date`, and the reason is `RelativeTime`'s: the absolute
   * reading a reader should see is the platform's and the relative phrase beside
   * it is the consumer's own sentence, so a Block that took a `Date` would have to
   * invent a granularity and a locale in order to print it. The Block prints the
   * string it was handed, in the mono face, because `2026-09-30`, `September 2026`,
   * `Q3` and `2.4.0` are all readings a consumer writes and Prism parses none of
   * them. A consumer that wants the platform's own formatting and a relative
   * phrase composes `RelativeTime`, which is the Component that holds that
   * decision, and renders the set itself where a relative phrase belongs.
   */
  at?: string
  /**
   * The label for what kind of entry this is, drawn above the name.
   *
   * A word and not a tier, because a tier here would be Prism's vocabulary in a
   * slot the consumer already has a name for. "Guide", "Release" and "Case study"
   * are three different claims about the same set and the set's owner is the only
   * party who can make them.
   */
  category?: string
  /** Where the entry goes. Its presence makes the card or the row carry a link. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the entry's name reads as a name: the reader sees
   * the title, assumes it is the whole of what is there, and the page behind it is
   * a click they were never invited to make. The words say what following it does,
   * which is a claim about the destination and therefore about whoever wrote that
   * destination, so they are the caller's.
   */
  hrefLabel?: string
  /**
   * How long the entry takes, as the consumer writes it. Machine notation beside
   * `at`, in the same face, because a duration is not prose either.
   */
  readingTime?: string
  /**
   * A figure for the entry, drawn above the card's text.
   *
   * A slot and not an image prop, because the figure is the caller's: a
   * screenshot, a chart, a diagram, a short video or a still from one are all
   * things a dated entry may carry and none of them is the same shape. Drawn in the
   * `cards` variant only. A row has no room for a figure, and a figure a variant
   * quietly drops is a figure the caller thought was published, so a caller
   * composing a `rows` or a `compact` set omits it.
   */
  media?: ReactNode
}

/** How many entries a grid puts on one line. The tracks, not the entry count. */
export type ContentGrid01Columns = 2 | 3 | 4

/**
 * The three arrangements a set of dated entries can be read in.
 *
 * Three rather than one, and the reason is the question a reader is asking. `cards`
 * is for choosing: a reader scanning a page is deciding which entry to open, and a
 * comparison wants the peers visible at once. `rows` is for reading: a page that
 * has already narrowed to one category gives each entry a full line and a summary
 * with room. `compact` is for skimming: a long index where the reader wants the
 * names and the dates and nothing else, and a card per entry would be four times
 * the ink for a list they scan rather than read.
 *
 * **The type is `ContentGrid01Form` and the prop is `variant`, and the two names
 * differing is the surface gate working rather than a slip.**
 * `check-surface.mjs` refuses to let a public entry export a name ending in
 * `Variant`, because in this package that shape names a cva map: a recipe a
 * consumer could read and compose with. This union is not a recipe, it is the
 * three arrangements the Block can draw, and it is named for the arrangement. The
 * prop keeps the name `variant` because a Component is allowed to take one, which
 * is the distinction `DESIGN.md`'s export surface draws: the prop is an input, a
 * `*Variants` export is an API. `ChartForm` is named the same way for the same
 * reason.
 */
export type ContentGrid01Form = 'cards' | 'rows' | 'compact'

/**
 * The tracks a grid of entries gets, from the caller's own column count.
 *
 * Spelled out per count, as `ProcessFlow01` does, so a grid has exactly as many
 * tracks as it declared and not one empty at the end of a row. The `sm:` step is
 * a narrowing rather than a widening: on a phone every arrangement is one entry
 * per line, because a four-up row of titles and summaries at phone width is four
 * columns of four words.
 */
const TRACKS: Record<ContentGrid01Columns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * The props a ContentGrid01 takes.
 *
 * Every string, every figure and every annotation is a prop and the Block ships
 * none: no entry, no date, no category, no reading time and no placeholder card. A
 * grid that hardcoded its entries would hand every consumer a publication's
 * back catalogue, and the corpus would publish it as the design system's own.
 */
export type ContentGrid01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The entries, in the order a reader should meet them.
   *
   * Order is the caller's, because a set of dated entries is already a claim about
   * which one leads, and the grid does not sort by `at`. A consumer that wants
   * newest first sorts before it renders; a consumer that wants the reverse
   * chronological order that a case study set wants sorts by the same field.
   */
  entries: ContentGrid01Entry[]
  /**
   * How the set is drawn.
   *
   * @defaultValue 'cards'
   *
   * `cards` is the default because it is the arrangement in which a reader is
   * choosing, and choosing is the question a set of dated entries on a page is
   * most often there to answer.
   */
  variant?: ContentGrid01Form
  /**
   * How many entries sit on one line in the `cards` variant. Ignored by `rows` and
   * `compact`, which have one entry per line by definition.
   *
   * @defaultValue 3
   */
  columns?: ContentGrid01Columns
  /**
   * What the grid shows when there is nothing in it.
   *
   * A node and not a sentence, for the reason every string on this type is a prop:
   * a Block that rendered "No posts yet" would put a claim about a publication into
   * four consumer sites, and it would be the wrong claim, because an empty set is
   * a first run, a filter that matched nothing, and a feed that has been retired,
   * and those three want three different sentences. Compose `EmptyState01` here and
   * it asks for the reason and writes the words.
   *
   * Omit it and an empty set renders nothing at all, which is the right default
   * for a section that should not appear until it has something in it.
   */
  empty?: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The annotation line on one entry: the reading, the category, the length.
 *
 * Drawn only when there is at least one of the three. An entry with none of them
 * is a title and a summary and nothing else, and holding open a line for a
 * category that is not there would push every other card's name down by one line
 * and break the alignment the grid is scanned along.
 */
function EntryMeta({ entry }: { entry: ContentGrid01Entry }) {
  if (entry.at === undefined && entry.category === undefined && entry.readingTime === undefined) {
    return null
  }

  return (
    <div
      data-slot="content-grid-meta"
      className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
    >
      {/*
        The reading and the duration in the mono face, because both are machine
        notation: a date, a quarter, a version and a number of minutes are all
        names in an alphabet a machine reads, and setting them in the sans face
        would make the annotation line look like a sentence.
      */}
      {entry.at ? (
        <span data-slot="content-grid-at" className="font-mono">
          {entry.at}
        </span>
      ) : null}
      {entry.category ? (
        <span
          data-slot="content-grid-category"
          className="font-medium tracking-wide uppercase"
        >
          {entry.category}
        </span>
      ) : null}
      {entry.readingTime ? (
        <span data-slot="content-grid-reading-time" className="font-mono">
          {entry.readingTime}
        </span>
      ) : null}
    </div>
  )
}

/**
 * A grid of dated entries, as cards, as full-width rows, or as a compact index.
 *
 * **The name is the decision, and it is recorded here because a reader will ask.**
 * Every other slug in this wave came off a published list, and this one did not.
 * DESIGN.md's Known Open Items rules that the old `blog-layout` item never ships,
 * and the reason it gives is that the blog does not exist. A dated-entry card grid
 * is nevertheless needed, by four surfaces in this repository and by every product
 * that keeps one: the changelog, the resources index, the case study set and this
 * documentation site. So the shape ships and the word does not. Calling it
 * `content-grid` is the claim: it is a grid of content, and the content is the
 * caller's. Every consumer that has ever needed this band has needed it for
 * something that is not a blog, and the four above are the proof, because a
 * changelog is a dated record and a case study set is dated only sometimes and
 * neither of them is a series of posts. The cost is real and worth naming: a slug
 * a reader can recognise from a competitor's inventory is a slug a reader reaches
 * for in a search box and does not find, and a consumer who wants the other name
 * wraps this Block in their own. The alternative was the other name, and the
 * alternative's cost was that a design system would then be claiming a publication
 * it does not run, in a name every catalogue and every agent surface would then
 * repeat.
 *
 * **A consumer composes it with a documentation changelog, a research index, a
 * release history, or a case study set.** The four differ in their annotations
 * rather than in their shape, which is the test the props were drawn around: the
 * changelog passes `at` and nothing else, a research index passes `category` and
 * `href` and `hrefLabel`, a release history passes `at` and `readingTime`, and a
 * case study set passes `media` and `summary` and reaches for `variant="rows"`.
 * Four surfaces, one record, and the difference is which annotations the reader
 * needs beside the name.
 *
 * **The entry is a heading one step below the section, in all three variants.** A
 * `cards` grid of six titles under one section is six children of that section, and
 * a `rows` set of forty is forty, and both read correctly to a reader navigating by
 * heading. The level is derived rather than written, so a Block embedded one level
 * deeper than it was authored for carries its titles with it, which is the whole
 * reason `headingLevel` is a prop. The cost of making the title a heading in the
 * `compact` variant is an outline of one line per entry, and a forty entry index
 * is a long outline; that is the price of letting a reader jump to an entry by
 * heading rather than by scrolling, and it is the price a `rows` set already pays.
 *
 * **`at` and `readingTime` are strings, and Prism parses neither.** The Block prints
 * what it was handed in the mono face. A consumer that wants the platform's own
 * absolute reading and a relative phrase composes `RelativeTime` itself, because
 * the date, the locale and the sentence are three facts about the consumer's
 * content and not one fact about a Block. Formatting a `Date` here would have meant
 * picking a granularity and a locale, and a consumer in a second locale would then
 * have had a correct Block rendering its page in the wrong language.
 *
 * **The link carries the caller's words, and the Block refuses a link that carries
 * none.** `href` without `hrefLabel` would render a card with a control on it that
 * has no text, so the pair is checked before anything is drawn and the run fails
 * with the name of the field. The pair is flat rather than a union in the way
 * `CaseStudies01` spells its own, and that is a departure with its cost stated: the
 * type will let a caller pass `href` alone, and the refusal arrives at render
 * rather than at build. The reason is that `entries` is a flat list a caller maps
 * from its own records rather than a set of arms the Block branches between, and a
 * union on a mapped record is a shape every call site has to satisfy by hand for
 * one optional pair. A union is the better type and this one is the cheaper
 * interface, and the diagnostic is what keeps the cheaper one honest.
 *
 * **An empty set renders the caller's `empty` node, or nothing at all.** It never
 * renders a frame, because a dashed box under a section title reads as a section
 * whose contents failed to load rather than as a section with none, and the honest
 * state for a set that has not started is for the set not to be there. When
 * `empty` is passed the section title still draws, so the reader is told which
 * section is empty and not merely that something is.
 *
 * **The three variants draw the same tree, not three trees.** The `li` is the same
 * element and the entry's content is the same elements in the same order in all
 * three; the arrangement is carried by the classes on the `li` and the `ul`. Two
 * trees would have put the same entry in the accessibility tree twice and for a
 * crawler twice, and a reader who narrowed the window would have watched one copy
 * swap for the other.
 *
 * It is a server Component: no hook, no state and no client code. A caller that
 * wants a card whose whole area is the link composes `CtaLink` itself in `media` or
 * in `summary`, which is the arrangement a consumer reaches for when the tile is
 * the target rather than the name.
 */
export function ContentGrid01({
  eyebrow,
  title,
  description,
  entries,
  variant = 'cards',
  columns = 3,
  empty,
  headingLevel = 'h2',
  className,
}: ContentGrid01Props) {
  // Every entry's name is a heading one step below the section that introduces the
  // set, so a reader navigating by heading meets the entries under the section
  // rather than as siblings of it.
  const Title = childLevel(headingLevel)
  const asCards = variant === 'cards'
  const asCompact = variant === 'compact'

  // Checked before anything is drawn, so the run fails once with the name of the
  // field rather than once per entry with a card that has an unnamed control on it.
  for (const entry of entries) {
    if (entry.href !== undefined && entry.hrefLabel === undefined) {
      throw new Error(
        'ContentGrid01: an entry passed an href with no hrefLabel, so the card would carry a link with no ' +
          'words on it at all, and a link a reader cannot name is a control they cannot act on with confidence. ' +
          'Pass the words that say what following it does, or omit the href.',
      )
    }
  }

  // An empty set with nothing to say in place of it draws nothing, which is the
  // state a section that has not started is honestly in.
  if (entries.length === 0 && empty === undefined) return null

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

      {entries.length === 0 ? (
        <div data-slot="content-grid-empty">{empty}</div>
      ) : (
        <ul
          data-slot="content-grid"
          data-variant={variant}
          className={cn(
            asCards ? 'grid gap-6' : 'flex flex-col',
            asCards && TRACKS[columns],
            className,
          )}
        >
          {entries.map((entry) => {
            const hasMeta =
              entry.at !== undefined ||
              entry.category !== undefined ||
              entry.readingTime !== undefined
            const link =
              entry.href === undefined || entry.hrefLabel === undefined ? null : (
                <CtaLink href={entry.href} variant="ghost" size="sm" className="self-start">
                  {entry.hrefLabel}
                </CtaLink>
              )

            return (
              <li
                key={entry.id}
                data-slot="content-grid-entry"
                className={cn(
                  asCards && 'h-full',
                  // A hairline above every row and none above the first, in both of
                  // the full-width variants. The rule rather than a border on the
                  // list, because the list wraps in the cards variant and a rule
                  // across four columns is four rules.
                  !asCards && 'border-border border-t pt-4 first:border-t-0',
                  asCompact && 'pb-4',
                )}
              >
                {asCards ? (
                  <Card className="h-full gap-4 py-5">
                    {entry.media ? (
                      <div data-slot="content-grid-media" className="min-w-0">
                        {entry.media}
                      </div>
                    ) : null}
                    <CardHeader className="gap-2">
                      <EntryMeta entry={entry} />
                      <CardTitle className="text-base leading-snug">
                        <Title>{entry.title}</Title>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <div
                        data-slot="content-grid-summary"
                        className="text-muted-foreground text-pretty text-sm"
                      >
                        {entry.summary}
                      </div>
                      {link}
                    </CardContent>
                  </Card>
                ) : (
                  <div
                    data-slot="content-grid-row"
                    className={cn(
                      'flex min-w-0 flex-col gap-1.5',
                      asCompact
                        ? 'sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6'
                        : 'sm:flex-row sm:items-baseline sm:justify-between sm:gap-8',
                    )}
                  >
                    <div
                      className={cn(
                        'flex min-w-0 flex-col gap-1.5',
                        // The compact arrangement is one line of text rather than
                        // two, so the name and the summary sit beside each other and
                        // the name takes a fixed share of the width. The row form
                        // stacks them, because there the summary is a paragraph and
                        // a paragraph beside a title is a column.
                        asCompact && 'sm:flex-row sm:items-baseline sm:gap-4',
                      )}
                    >
                      {/*
                        The annotation line draws above the name in the row form and
                        at the trailing end of the line in the compact one, because
                        a compact line is a single row of text and a reader
                        skimming it reads the name first and the reading last. It is
                        drawn once in each, never twice.
                      */}
                      {asCompact ? null : <EntryMeta entry={entry} />}
                      {/*
                        In the compact arrangement the name takes a fixed share of
                        the line and the summary takes the rest, so a reader
                        skimming down the left edge reads a column of names rather
                        than a ragged one. It is a spacing step and not an arbitrary
                        width, so the value is one this stylesheet already emits.
                      */}
                      <Title
                        className={cn(
                          'font-semibold',
                          asCompact ? 'text-sm sm:w-48 sm:shrink-0' : 'text-base',
                        )}
                      >
                        {entry.title}
                      </Title>
                      <div
                        data-slot="content-grid-summary"
                        className="text-muted-foreground min-w-0 text-pretty text-sm"
                      >
                        {entry.summary}
                      </div>
                    </div>
                    {link !== null || (asCompact && hasMeta) ? (
                      <div
                        data-slot="content-grid-aside"
                        className="flex shrink-0 items-center gap-3 sm:justify-end"
                      >
                        {asCompact ? <EntryMeta entry={entry} /> : null}
                        {link}
                      </div>
                    ) : null}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

export default ContentGrid01
