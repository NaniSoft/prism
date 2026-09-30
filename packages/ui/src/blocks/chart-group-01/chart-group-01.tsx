import type { ReactNode } from 'react'

import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'
import { ChartCard01, type ChartCard01Reading } from '../chart-card-01/chart-card-01'

/**
 * One card in the grid: a title, a figure, and everything the card carries around it.
 *
 * The shape is `ChartCard01`'s own minus the placement, and the reason is in the
 * Block's JSDoc: a card in a grid fills its track, so a width on the entry would be
 * a fact about the grid rather than about the card, and the grid is derived here
 * from the count.
 */
export type ChartGroup01Card = {
  /**
   * A key unique within the set, used as the list key and never rendered.
   *
   * A key and not a label, for the reason `CaseStudies01` states: a grid of figures is
   * reordered by a consumer as often as it is read, and a key made of the words means
   * a rename in the title is a rename in the key.
   */
  id: string
  /** The card's title, rendered as a heading one step below the section. */
  title: ReactNode
  /** One line under the title, for what the figure is a reading of. */
  description?: ReactNode
  /**
   * The figure, and the caller's own.
   *
   * A slot rather than a `chart` with a `variant`, for the reason `chart`'s own
   * JSDoc states: the mark is the claim the chart makes about the data, and a caller
   * who never thought about the mark is exactly the caller who gets it wrong.
   */
  figure: ReactNode
  /** The key for the figure, wherever the caller wants it. */
  legend?: ReactNode
  /** The figures this card states about what the figure shows. */
  reading?: ChartCard01Reading[]
  /** The controls that act on the figure: a range, a segment, a download. */
  actions?: ReactNode
}

/**
 * The props a ChartGroup01 takes. Every string is a prop and the Block ships none.
 */
export type ChartGroup01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The cards, in the order a reader should meet them.
   *
   * Order is the caller's because it is a claim about which figure answers the
   * question the reader arrived with, and a grid that sorted itself by size or by
   * title would be making that claim on the caller's behalf.
   */
  cards: ChartGroup01Card[]
  /**
   * The most columns the grid takes at the wide breakpoint.
   *
   * Two or three and not a number, for the reason `Bento01`'s span states: a number
   * type-checks and renders whatever it is told to, and a number of 5 in a grid of
   * figures produces figures narrower than the legend under them. The default is 3,
   * and it is a ceiling rather than a setting: the count can take fewer columns than
   * this and never more, because a caller who wants six figures across a 68rem
   * container is asking for 11rem figures, and the measurement in the Block's JSDoc
   * says what 11rem buys.
   */
  columns?: 2 | 3
  /**
   * What stands in for the grid when there are no cards.
   *
   * Optional, and the rule is `FactList`'s: an empty grid is a set of gaps a reader
   * looks through, so nothing is drawn. A caller that wants a sentence there passes
   * one, and a caller that wants nothing passes nothing and gets nothing.
   */
  empty?: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The grid each column count takes, at the breakpoint the grid appears.
 *
 * A map of machine values rather than two conditional class strings, and the classes
 * are literals rather than assembled, because Tailwind reads the source and a class
 * built at runtime from a number is not in the sheet. Every value is a `grid-cols`
 * utility and nothing else, which is what `className` being layout only is for.
 */
const GRID: Record<2 | 3, string> = {
  2: 'grid gap-4 lg:grid-cols-2',
  3: 'grid gap-4 lg:grid-cols-3',
}

/**
 * A responsive grid of chart cards whose column count is derived from how many there
 * are rather than passed.
 *
 * **The layout is derived, and the measurement is why.** One card takes the full
 * width, because a single figure in half a container is a figure with a card around
 * it and no reason for the card. Two sit side by side, because two is the one count
 * where a single column is worse than two. Three or more are three across at `lg` and
 * one below it. The number that decides the ceiling is the width: the container is
 * `Section`'s 72rem measure with 2rem of padding at each edge, so 68rem of content,
 * and a four-across grid takes 1rem of gap three times over, which leaves about 16rem
 * for each figure. `chart` then spends 3rem of that on a fixed axis gutter before any
 * mark is drawn, so a four-across bar chart would be asked to draw into about 13rem
 * while its category labels are truncated to 5rem each. The three-across arrangement
 * this Block uses gives each figure about 22rem, which is about 19rem of plot, and
 * that is the difference between reading a shape and guessing at one. Below `lg` there
 * is one column, because a figure in a third of a phone is a figure nobody can read
 * and the grid is the first thing to lose.
 *
 * **`columns` is a ceiling and the count can take fewer, never more.** A caller with
 * four cards who wants two across says so, and a caller with six cannot ask for six,
 * because a number of 6 would produce about 10rem figures and the honest answer to
 * that is a Page over two groups rather than one grid of unreadable figures. The
 * alternative was a plain number prop, and a plain number prop is a layout the Block
 * would have to honour exactly, including the arrangements nobody can lay out.
 *
 * **Each card is `ChartCard01`, and the reason is that a second panel would be a
 * second answer.** The title's element, the description's step, where the controls go,
 * the rule above the readings and the gap between figure and key are all decisions
 * `chart-card-01` has already made and argued, and a grid that re-derived them would
 * put two panels on one page whose cards differ in ways no reader could name. So this
 * Block composes the card and adds exactly one thing, which is the grid.
 *
 * **The heading level is passed straight through, and the card titles nest under it.**
 * A card derives its own title level as one step below the heading that introduces
 * it, so passing the section's level here puts three card titles one step below the
 * section, which is what the outline should say. Passing a stepped-up level would put
 * the cards at the section's own depth and announce them as siblings of the thing
 * that introduces them.
 *
 * **An empty set draws no grid, and that is `FactList`'s rule rather than a new one.**
 * A grid of nothing is a set of gaps a reader looks through and reads as a surface
 * that failed, so the `empty` node stands where the grid would have been and a caller
 * who passes nothing gets nothing. The cost is that a section heading can survive on
 * a page whose figures have all been withdrawn, and a caller who would rather see
 * nothing at all should not render the Block.
 *
 * It is a server Component: no hook, no state, no client code and no motion. A caller
 * who wants a control in a card composes it in that card's own `actions` slot.
 */
export function ChartGroup01({
  eyebrow,
  title,
  description,
  cards,
  columns = 3,
  empty,
  headingLevel = 'h2',
  className,
}: ChartGroup01Props) {
  // One column for a single card, and otherwise the ceiling capped by the count, so
  // two cards are two across whichever ceiling the caller passed and four are three
  // across unless the caller asked for two.
  const tracks = cards.length <= 1 ? 0 : Math.min(columns, cards.length)

  return (
    <Section data-slot="chart-group-01" className={className}>
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

      {cards.length === 0 ? (
        <div data-slot="chart-group-01-empty">{empty}</div>
      ) : (
        <div
          data-slot="chart-group-01-grid"
          data-tracks={tracks}
          className={cn(tracks === 0 ? 'flex flex-col' : GRID[tracks === 2 ? 2 : 3])}
        >
          {cards.map((card) => (
            <ChartCard01
              key={card.id}
              title={card.title}
              description={card.description}
              figure={card.figure}
              legend={card.legend}
              reading={card.reading}
              actions={card.actions}
              headingLevel={headingLevel}
            />
          ))}
        </div>
      )}
    </Section>
  )
}

export default ChartGroup01
