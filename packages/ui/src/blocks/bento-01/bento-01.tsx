import type { ReactNode } from 'react'

import { Card, CardDescription, CardTitle } from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * How many of the six tracks a cell takes.
 *
 * Three named members and not a number, and the reason is that a number is a layout
 * the Block has to honour exactly. A caller passing `colSpan: 3` has chosen a grid,
 * and the Block's job becomes reproducing that grid rather than laying out a
 * composition, which is the opposite of what a Block is for. Worse, a number has no
 * opinion about whether it can be laid out: a `colSpan` of 7 in a six-track grid is
 * a number that type-checks, renders, and produces a composition nobody can reason
 * about. Three named spans are three layouts that compose, because two thirds and a
 * half and a full width are the three relationships a set of cells can have to each
 * other, and they compose without the caller having to do the arithmetic.
 *
 * The names describe the cell rather than the tracks, which is what makes them
 * portable: a caller who means "a third of the width" does not have to know that
 * this Block happens to be six tracks wide.
 */
export type BentoSpan = 'sm' | 'md' | 'lg'

/**
 * The surface a cell is drawn on.
 *
 * `default` is the card surface every other Component sits on. `muted` is the quiet
 * surface, for a cell that carries supporting material rather than the argument.
 * `primary` is the pack's own hue and means *this is the cell to read first*, which is
 * a claim and therefore the caller's to make and rarely the right answer twice.
 *
 * The three are closed because a fourth would be a pastel, and a pastel is a fill for
 * a large area and never a signal: a tile of pastel behind one word is a signal a
 * reader has to learn, and a reader who has learned three of them has spent attention
 * on a palette rather than on a page.
 */
export type BentoTone = 'default' | 'muted' | 'primary'

/**
 * One cell: an identifier, a span, and whatever the cell holds.
 *
 * `id` is required and is never rendered, for the reason `ProductGrid01`'s id is: it
 * is the key, it is carried on the markup as `data-cell`, and a caller who can name
 * a cell can address it in a test or in a `data-pack` boundary above it. A cell with
 * no id and no title would be a box.
 */
export type BentoCell = {
  /** A key unique within the set, carried on the markup as `data-cell`. */
  id: string
  /** How much of the width the cell takes. See `BentoSpan`. */
  span: BentoSpan
  /** The cell's title, rendered as a heading one step below the section. */
  title?: string
  /** The cell's body. A node, so a caller may compose a list or a figure under it. */
  body?: ReactNode
  /** The cell's media, drawn above the title. A node the consumer composes. */
  media?: ReactNode
  /** The surface the cell is drawn on. See `BentoTone`. */
  tone?: BentoTone
}

/**
 * The props a Bento01 takes. Every string is a prop and the Block ships none.
 */
export type Bento01Props = {
  /**
   * The cells, in the order the caller composed them.
   *
   * Order and span together are the composition, and both are the caller's. See the
   * Block's own JSDoc for why this Block holds no opinion about which cell is the big
   * one.
   */
  cells: readonly BentoCell[]
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * Heading level for the section title and, one step below it, for each cell's
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
 * What each named span takes of the six tracks, at the breakpoint the grid appears.
 *
 * A map of machine values rather than three conditional class strings, so the
 * relationship between a span name and a track count is one table a reader can check
 * in one place. Every value is a `col-span` utility and nothing else: the grid
 * placement is layout, and layout is the one thing `className` is for, so it lives
 * here rather than on the caller.
 */
const SPAN: Record<BentoSpan, string> = {
  sm: 'lg:col-span-2',
  md: 'lg:col-span-3',
  lg: 'lg:col-span-6',
}

/**
 * What each tone adds to the cell's own surface.
 *
 * **`primary` sets its own ink as well as its own fill, and that is the rule rather
 * than a preference.** `check-variant-ink` exists because a fill without an ink is
 * correct everywhere the design system put it and wrong everywhere else, and the
 * failure it records measured 1.01:1 in lavender dark: a `Button` carrying
 * `bg-background` with no `text-` inherited whatever was behind it. `toast.tsx` states
 * the same rule on the surface where it bites hardest, and a bento cell is that
 * surface: a cell is a coloured panel with body text sitting on it, so an inherited
 * ink is not this package's foreground by accident. So `primary` states both halves.
 *
 * `muted` states only its fill, and that is a measured decision rather than an
 * oversight: `Card` declares `bg-card text-card-foreground` on itself and the
 * override replaces the fill while the ink arrives with the base, so a muted cell
 * renders the muted surface behind the card's own ink. That pairing is 13.88:1 in the
 * base pack's dark mode and 16.44:1 in its light, and it is the one pair
 * `check-contrast.mjs` measures directly.
 */
const TONE: Record<BentoTone, string> = {
  default: '',
  muted: 'bg-muted',
  primary: 'bg-primary text-primary-foreground',
}

/**
 * An asymmetric grid whose composition the caller decides: the cells arrive with an
 * explicit span and the Block lays them out and frames them.
 *
 * **This Block is a layout and not a design, and the whole of that is in whose hands
 * the composition is.** The tempting version holds a fixed composition: one large
 * cell, two medium ones, a row of three small ones, with the argument on the left.
 * That version is a template. A template carries an opinion about hierarchy, every
 * consumer inherits that opinion, and the consumer who wants the argument on the right
 * has one of three answers: restyle a catalogue item, which the no-override-path rule
 * does not allow; wrap it, which is the override path wearing another name; or accept
 * a page whose most important cell is the one Prism happened to put in the second
 * position. So the composition is the caller's and this Block holds none of it. It
 * draws a six-track grid, honours the span it was given, and frames each cell the same
 * way.
 *
 * **The span is a union of three names and not a number, and that is what makes the
 * caller's composition composable.** A `colSpan: number` prop would be a way of
 * handing this Block a grid rather than a cell: the Block's job would become
 * reproducing an arrangement exactly, including the arrangements nobody can lay out,
 * because a `colSpan` of 7 in a six-track grid type-checks and renders and produces a
 * composition no reader can reason about. Three names are three relationships a set of
 * cells can have to each other, a third of the width, half of it, and all of it, and
 * they add up to compositions by arithmetic the caller never has to do: two thirds
 * side by side, a half above a third and a third, a full width under a row of three.
 *
 * **The grid is six tracks at `lg` and one column below it.** A bento is the one
 * arrangement on a marketing page that is worse on a phone than a list, because the
 * asymmetry is the point and a phone has one column to be asymmetric in. Below the
 * breakpoint every cell is full width and the composition is a stack, which loses the
 * arrangement and keeps the content, and that is the right trade on a screen 360
 * pixels wide.
 *
 * **Cells are cards, and a card's title is a heading one step below the section.** The
 * set is a set of titled regions, so the outline says so, and the level is derived
 * from `headingLevel` rather than written as an `h3`: a Block embedded one level
 * deeper carries its outline with it instead of announcing six siblings of the section
 * that introduces them. A cell with no title renders its body alone, which is a cell a
 * reader cannot jump to by heading, so a title is the right default even though the
 * type does not require it: a cell of media with no words is a poster.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and the
 * vertical rhythm rather than re-deriving either, and it adds no container width and
 * no section padding of its own.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Bento01({
  cells,
  eyebrow,
  title,
  description,
  headingLevel = 'h2',
  className,
}: Bento01Props) {
  // A cell's title is a heading one step below the section that introduces the set,
  // derived rather than written, so a Block embedded one level deeper carries its
  // outline with it.
  const Title = childLevel(headingLevel)

  return (
    <Section data-slot="bento-01" className={className}>
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

      {/*
        The six tracks. Below `lg` there is one column and every span resolves to
        the full width, because a bento is worse on a phone than a list and the
        composition is the first thing to lose.
      */}
      <div data-slot="bento-01-grid" className="grid gap-4 lg:grid-cols-6">
        {cells.map((cell) => (
          <div key={cell.id} data-slot="bento-01-cell" data-span={cell.span} className={SPAN[cell.span]}>
            <Card className={cn('h-full gap-4 py-6', TONE[cell.tone ?? 'default'])}>
              {cell.media ? <div data-slot="bento-01-media">{cell.media}</div> : null}
              {cell.title ? (
                <CardTitle as={Title} className="text-base">
                  {cell.title}
                </CardTitle>
              ) : null}
              {cell.body ? <CardDescription>{cell.body}</CardDescription> : null}
            </Card>
          </div>
        ))}
      </div>
    </Section>
  )
}

export default Bento01