import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Sparkline } from '../../components/ui/sparkline'
import { cn } from '../../lib/utils'

/**
 * One ranked entry: who or what it is, what it reads, and the shape behind it.
 *
 * Four facts and two optional ones. `value` is a number rather than a node, and
 * that is the one place in this roster where the figure is a number instead of
 * something the caller formatted, because a ranking is computed: the order of a
 * leaderboard is derived from these numbers by the caller's own query, and a caller
 * whose figures arrive as pre-formatted strings cannot sort them. So the number is
 * the datum and the reading is the caller's sentence about it, which is why
 * `valueLabel` is required and why it takes the entry rather than the number.
 */
export type Leaderboard01Entry = {
  /**
   * A stable key for the entry, within this set.
   *
   * Also what `emphasis` names, because a border that follows a position moves to
   * a different entry after a reorder, and a border is a claim about who is on this
   * page.
   */
  id: string
  /** The name, as a reader would say it in conversation. */
  name: string
  /**
   * The reading this entry is ranked by.
   *
   * Drawn as it arrives, with no grouping and no rounding, and the reason is the
   * same one `MilestoneTimeline` gives for a stage's moment: a Block that grouped
   * the figure would ship one locale's grouping into every consumer's product, and
   * a server-rendered grouping is the server's locale rather than the reader's. The
   * grouped, rounded and unit-bearing reading is the caller's, in `valueLabel`,
   * which is also the reading every assistive technology is given, so the visible
   * figure is the one thing on the page that is deliberately unformatted. The cost
   * is named rather than hidden: a leaderboard of five-figure numbers reads as a
   * column of bare numerals, and the answer is a `valueLabel` the reader can see,
   * which means composing the figure as a node of the caller's own beside the
   * number.
   */
  value: number
  /**
   * The sentence the reading is announced as, given the entry.
   *
   * Required, and a function of the whole entry rather than of the number, because
   * the same figure is three different sentences in three different products and
   * only the caller knows which one is meant. See the Block JSDoc for the argument
   * in full: "1,204 runs", "1,204 this month" and "1,204" are three sentences, and
   * a bare numeral beside a name tells a screen reader nothing about what it
   * counts.
   */
  valueLabel: (entry: { id: string; name: string; value: number }) => string
  /**
   * The mark beside the name, as a node.
   *
   * A node and not a src, because a mark in a leaderboard is not always a picture:
   * it is a monogram, a flag, a product's own glyph, a rank badge the product
   * draws. Rendered as given, so whether it is announced is the caller's decision
   * rather than this Block's.
   */
  mark?: ReactNode
  /**
   * The readings behind this one, oldest first, in the caller's own units.
   *
   * Raw magnitudes rather than percentages of a maximum, which is the contract
   * `Sparkline` states: a caller that pre-normalises has two chances to get the
   * shape wrong, and a series drawn against an axis nobody can see is a picture of
   * somebody's arithmetic.
   */
  series?: number[]
  /**
   * The name of that series, and the only thing a screen reader reads from the
   * shape.
   *
   * Optional in the type and required in practice whenever any entry carries a
   * `series`, and the run throws without it. A leaderboard is a column of small
   * pictures, and a column of unnamed pictures is a column of shapes a reader has
   * to guess the meaning of from the number beside them, which is the guess the
   * whole figure exists to remove.
   */
  seriesLabel?: string
  /** Where the entry goes. Rendered as a native anchor, so the destination is real. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is set.
   *
   * A link whose only words are the name tells a reader nothing about what
   * activating it will do, which is the same defect `ProjectList01` refuses for the
   * same reason. Trailing rather than wrapping the row, because a row whose
   * accessible name is its name, its figure and its series is a name a reader
   * cannot hear the end of.
   */
  hrefLabel?: string
}

/**
 * The props a Leaderboard01 takes.
 *
 * Every string and every number is a prop and the Block ships none: no entry, no
 * figure, no ordinal, no mark, no series and not one word of the sentence that
 * says what the numbers count. The noun the figures count is a prop because it is
 * the caller's noun: a leaderboard of runs, of stars, of installs, of points and of
 * invoices all want the same arrangement and five different headings, and a Block
 * that named one of them would be publishing a claim about a product it knows
 * nothing about.
 */
export type Leaderboard01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a ranking with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The noun the figures count, in the product's own words.
   *
   * Required, and it is stated in the reading of every row rather than as a column
   * heading above the list. See the Block JSDoc for why a leaderboard is a list and
   * not a table, because that is the whole of the answer: a table's other two
   * columns are the position and the name, and Prism has no words for either of
   * them, so a table drawn here would be a table a screen reader user has to be
   * told about out loud. Stating the noun in each row's reading says the same thing
   * with none of the invention.
   */
  unit: string
  /**
   * The entries, in rank order, as the caller has ranked them.
   *
   * Order is the caller's and this Block does not sort, which is the argument the
   * whole JSDoc turns on. See it below.
   */
  entries: Leaderboard01Entry[]
  /**
   * Whether the position is drawn.
   *
   * On by default, because a ranking whose positions are not shown is a list and a
   * caller who wanted a list has `ProjectList01`. Off is right for a set of five
   * things a reader is meant to read as peers, where the first three positions would
   * say more about the page than about the entries.
   */
  rank?: boolean
  /**
   * The ids to treat as the caller's own rows.
   *
   * Ids rather than names or positions, because a mark that follows a position
   * moves to a different entry after a reorder. The Block draws a border and a
   * weight and nothing else: no fill, no ring, no badge, no trophy, because a
   * leaderboard is read by people who are on it, and the only statement this Block
   * can make is the one the caller asked for. An id here that is not in `entries`
   * throws, because a highlight that silently does nothing is worse than one that
   * fails.
   */
  emphasis?: readonly string[]
  /**
   * What the Block renders in place of the entries when there are none.
   *
   * Required, and a slot rather than a string, because a leaderboard's empty state
   * is a claim about a product: "no runs yet" is true of a new installation and
   * false of a filter that matched nobody, and a Block that wrote either one would
   * be wrong in half the products that installed it.
   */
  empty: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Block. */
  className?: string
}

/**
 * A ranked set: a position, a name, a mark where there is one, a figure with the
 * caller's own reading of it, and a small series where there is one behind it.
 *
 * **The order is the caller's and there is deliberately no `sort`, and that is the
 * decision the whole Block rests on.** A leaderboard is a ranking, and the ranking
 * is the Block's premise, so the obvious prop is the one this Block refuses: the
 * caller may have ranked by this figure, by a change in it, by a measure of their
 * own that is not in the data at all, or by nothing at all, because a set of five is
 * very often a hand-picked set. A `sort` prop would have to name a key, and any key
 * it named would be wrong for at least one of those four callers, and the failure
 * would be silent: a list sorted by the wrong column still looks ranked, and the
 * reader who trusts it is misled about something the caller is responsible for. The
 * other answer, deriving the order from the figure, is worse, because it makes this
 * Block a second derivation the caller then has to keep in step with their own
 * data, and two orderings of one list that disagree is a list whose order nobody can
 * fix without changing code in two places. So the rank is the position in the array
 * and the caller holds the one claim that ordering a ranked set makes.
 *
 * **`valueLabel` is required for the reason `Waitlist01` gives about a position, and
 * the three sentences are the same three.** "1,204 runs" and "1,204 this month" and
 * "1,204" are three different sentences about one figure, and they are not formats
 * of one another: the first is a phrase with a noun, the second is a figure with a
 * period, and the third is a numeral that means whatever the reader assumed. Beside
 * a name, a bare numeral tells a screen reader nothing about what it counts, and it
 * tells a reader skimming the column nothing either, which is the whole reason a
 * leaderboard is hard to read. So the Block draws the figure and takes the sentence
 * beside it from the caller, and the row's announced reading is that sentence with
 * the `unit` in front of it, so a reader hears the noun and the figure together.
 * The cost is named rather than hidden: a caller whose `valueLabel` already names
 * the noun hears it twice, because the noun is a separate prop and the Block will
 * not compose the two strings itself, so the honest split is that `unit` is the
 * noun and `valueLabel` is the figure at a period.
 *
 * **It is a list and not a table, and the reason is that a table's other two
 * columns have no names here.** A leaderboard is a set a reader compares down a
 * column, and a table is the honest answer to that, so the first instinct is right
 * and the second half of it is not available: a `<th scope="col">` needs a name,
 * and the only column this Block can name is the one the caller's `unit` names. The
 * other two are the position and the name, and Prism has no words for either of
 * them, because "Rank", "Name" and "Entry" are three inventions about a caller's
 * data and the roster does not ship them. A table with two unnamed header cells is
 * worse than a list, because a screen reader announces the cells under a header with
 * no name, which is a reader being told nothing about the one thing they navigated
 * to find out. So the rows are a list, the noun is stated in each row's reading, and
 * a caller who genuinely has words for the other two columns has `DataTable01`, which
 * takes the caller's own header for every column it draws.
 *
 * **The series is `Sparkline`, because the numbers behind a small picture are the
 * part nobody draws by hand and the part that matters.** A ninety-six pixel line
 * with no axis, no labels and no legend is a shape, and a shape a reader cannot
 * query is the failure every figure in this package exists to prevent, so the
 * Component renders the same array as a table a screen reader can walk and a crawler
 * can index, generated from the array the line is drawn from so the two cannot
 * disagree. A Block that hand-rolled the line would be a second implementation of a
 * Component that already owns it, and the second one would be the one without the
 * table. `seriesLabel` is required whenever a series is, for the same reason it is
 * on `Trend01`: two entries whose series are both "the last thirty days" and one
 * whose series is the same thirty days as a rate are three pictures that look
 * identical and mean three things.
 *
 * **The mark is a border and a weight, and it is not a trophy.** A leaderboard is
 * read by people who are on it, including the person at the bottom, and the usual
 * way to mark one's own row is to give it something the others do not have: a fill, a
 * ring, a badge, a crown, a medal. Each of those is a statement about rank that the
 * page makes to the reader rather than a fact the reader can check, and on a
 * leaderboard that statement is the one thing most likely to be wrong about somebody
 * standing on their own screen. So `emphasis` draws a rule at the leading edge and a
 * heavier weight on the name, which is the two-channel mark the rest of this package
 * uses for a caller's own row, and the cost is stated rather than hidden: a reader
 * who cannot see either channel does not learn which row is theirs. The answer is
 * the caller's own `mark` node, which is a slot, and not a sentence Prism writes
 * about "you".
 *
 * **It is a server Component: no hook, no state, no client code and no router.**
 * Both Components it composes are server Components, so a leaderboard of forty
 * entries with a series each costs a consumer nothing in client JavaScript.
 */
export function Leaderboard01({
  eyebrow,
  title,
  description,
  unit,
  entries,
  rank = true,
  emphasis,
  empty,
  headingLevel = 'h2',
  className,
}: Leaderboard01Props) {
  // Checked before anything is drawn, so the run fails once with the name of the
  // entry rather than once per row with a malformed cell on the page.
  for (const id of emphasis ?? []) {
    if (!entries.some((entry) => entry.id === id)) {
      throw new Error(
        `Leaderboard01: emphasis names the id "${id}", which is not in entries, so the border would be ` +
          'drawn beside nobody and the page would look deliberate. Name an entry, or drop the id.',
      )
    }
  }

  for (const entry of entries) {
    if (entry.series !== undefined && !entry.seriesLabel) {
      throw new Error(
        `Leaderboard01: the entry "${entry.name}" carries a series and no seriesLabel, so the shape ` +
          'beside its figure would be an unnamed picture, and a figure with no name is not announced. ' +
          'Pass what the series is.',
      )
    }
    if (entry.href !== undefined && !entry.hrefLabel) {
      throw new Error(
        `Leaderboard01: the entry "${entry.name}" carries an href with no hrefLabel, so the link would ` +
          'be announced by its address, which is punctuation rather than a name. Pass the words that ' +
          'say where it goes, or drop the href.',
      )
    }
  }

  if (entries.length === 0) {
    return (
      <Section data-slot="leaderboard-01" data-empty="true" className={cn(className)}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          <div data-slot="leaderboard-empty" className="text-muted-foreground text-pretty text-sm">
            {empty}
          </div>
        </div>
      </Section>
    )
  }

  const marked = (id: string): boolean => emphasis?.includes(id) === true

  return (
    <Section data-slot="leaderboard-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {/*
        One `<ol>`. A ranking split by a cap, by a variant, or by whether an entry
        carried a series would be several lists and a screen reader would announce it
        as several, and the ordinal is the Block's claim about the set, which is
        that the order is a rank.
      */}
      <ol data-slot="leaderboard" className="flex flex-col">
        {entries.map((entry, index) => {
          // The reading is handed the entry rather than the whole record, so a
          // caller writing `valueLabel` has the three facts a sentence about a
          // figure can need and not a `series` it has no use for.
          const read = entry.valueLabel({
            id: entry.id,
            name: entry.name,
            value: entry.value,
          })

          return (
            <li
              key={entry.id}
              data-slot="leaderboard-row"
              data-entry={entry.id}
              data-emphasis={marked(entry.id) ? 'true' : undefined}
              className={cn(
                'border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b py-3 first:border-t',
                marked(entry.id) ? 'border-primary border-l-2 ps-4' : null,
              )}
            >
              <span className="flex min-w-0 items-center gap-x-3 gap-y-1">
                {rank ? (
                  <span
                    data-slot="leaderboard-rank"
                    className="text-muted-foreground w-6 shrink-0 font-mono text-xs tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                ) : null}

                {entry.mark === undefined ? null : (
                  <span data-slot="leaderboard-mark" className="flex shrink-0 items-center">
                    {entry.mark}
                  </span>
                )}

                <span className={cn('min-w-0 text-sm', marked(entry.id) ? 'font-semibold' : 'font-medium')}>
                  {entry.name}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-x-5 gap-y-2">
                {/*
                  The figure and its reading. The number is drawn as the caller
                  passed it and hidden from assistive technology, because the row's
                  reading is the caller's sentence and a figure that is read twice,
                  once as a numeral and once as a sentence, is a figure a reader has
                  to reconcile. The noun goes in front of the sentence so the row
                  says what it counts, and the two are joined by a space rather than
                  by punctuation, because a comma here would be a mark this Block
                  chose. See the JSDoc above for why the number carries no grouping.
                */}
                <span
                  data-slot="leaderboard-value"
                  className="flex items-baseline justify-end gap-2 tabular-nums"
                >
                  <span aria-hidden="true" className="font-mono text-sm">
                    {entry.value}
                  </span>
                  <span className="sr-only">{`${unit} ${read}`}</span>
                </span>

                {entry.series !== undefined && entry.seriesLabel !== undefined ? (
                  <Sparkline values={entry.series} label={entry.seriesLabel} />
                ) : null}

                {entry.href === undefined || entry.hrefLabel === undefined ? null : (
                  <CtaLink data-slot="leaderboard-link" href={entry.href} size="sm" variant="ghost">
                    {entry.hrefLabel}
                  </CtaLink>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

export default Leaderboard01
