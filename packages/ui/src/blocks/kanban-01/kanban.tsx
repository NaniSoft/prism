import { useId } from 'react'
import type { ReactNode } from 'react'

import { Badge } from '../../components/ui/badge'
import { CtaLink } from '../../components/ui/cta-link'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * Where a card is in its life, and the tone each of the four is drawn in.
 *
 * `blocked` is the destructive tone because it is the one state a board is wrong
 * about if a reader misses it, `active` takes the cool role that means not an
 * alarm, `ready` is muted because nothing is being asked of the reader yet, and
 * `done` is success because it is the only state that is finished.
 *
 * Four, and the fifth would be the one that splits a state that does not need
 * splitting. A board's own vocabulary is the caller's and is usually longer than
 * this, which is the reason the words are required and the tone is a guess; see
 * the Component JSDoc.
 */
export type KanbanState = 'blocked' | 'ready' | 'active' | 'done'

/**
 * The tone each of the four states is drawn in, from the semantic contract and no
 * other.
 */
const STATE_TONE: Record<KanbanState, StatusTone> = {
  blocked: 'destructive',
  ready: 'neutral',
  active: 'info',
  done: 'success',
}

/**
 * One card on a board: a title, an optional mark, an optional body, a state, an
 * owner, tags and a link.
 *
 * `title` is the only required field beside `id`, because a card with no title is
 * a rectangle. Everything else is optional because a board is heterogeneous: a
 * card somebody has written up carries a body and a card somebody has just dropped
 * on the board does not, and a shape that made every field required would be a
 * board where every card is padded to the same size with nothing in the padding.
 */
export type KanbanCard = {
  /** The card's stable key within the board. */
  id: string
  /**
   * What the card is, in the words a reader would use about it.
   *
   * It is the card's heading, so a reader navigating by heading can reach one card
   * without reading the nine above it, and it is also the words on whatever
   * control opens it. A card title that wraps to three lines costs every other
   * card in the column its alignment, so keep it to the one line a column can
   * hold.
   */
  title: string
  /**
   * One line or a short paragraph about the card, under its title.
   *
   * A node because the honest body of a card is not always a sentence: it is a
   * quoted request, a diff summary, a checklist, a chart. The Block draws it in
   * the muted ink and never truncates it, because a truncated body is a body the
   * reader has to open the card to read, and a board is where a reader decides
   * what to open next.
   */
  body?: ReactNode
  /**
   * The mark above the title: a reference, a key, a count, a face.
   *
   * A node and not a field of its own, because a board's marks are as various as
   * the products that draw boards. A card that carries a reference as its subject
   * and a card that carries a reference as a mark are the same card, and the Block
   * has no opinion about which is which.
   */
  mark?: ReactNode
  /**
   * Where the card is in its life, and a judgement only the caller can make.
   * See `KanbanCard.stateLabel` for why the words are required with it.
   */
  state?: KanbanState
  /** The words for the state, in the product's own vocabulary. */
  stateLabel?: string
  /** Who has it, in the product's own words. A person, a team, a role. */
  owner?: string
  /**
   * The owner's picture, when there is one.
   *
   * A `name` is required and the `src` is not, because the name is what the
   * fallback initials are made from and a face with no name beside it identifies
   * nobody. Both are the caller's: a board that fetched a directory would be a
   * board with a data client in it.
   */
  ownerAvatar?: { src?: string; name: string }
  /**
   * The card's other labels, in the caller's own words.
   *
   * A set rather than one string because a board's facets differ by product: one
   * tags by team, one by component, one by release. The Block draws them as small
   * secondary badges and does not decide which facets matter. The cost is named on
   * the prop: a card carrying five of them is a card that has stopped being
   * scannable, and that is the caller's decision to make rather than the Block's
   * to prevent.
   */
  tags?: readonly { id: string; label: string }[]
  /**
   * Where the card goes. Its presence makes the row carry a link, and the link
   * carries its own words rather than the card's title.
   */
  href?: string
  /**
   * The words on that link, and required whenever `href` is.
   *
   * A link whose only words are the card's own title tells a reader nothing about
   * what activating it does, which is the same defect `Download01` refuses: the
   * destination is a route in the caller's own application and only the caller
   * knows what is behind it.
   */
  hrefLabel?: string
}

/**
 * One column of a board: its name in the caller's own words, an optional limit,
 * and the cards standing in it.
 *
 * `label` is required and it is a string rather than a node, because it is the
 * column's own name and it is also the accessible name of the section the Block
 * draws around the stack. A board whose columns are anonymous is a set of columns
 * a screen reader user cannot navigate to, and the alternative, an invented name
 * per position, is a claim about somebody else's process.
 */
export type KanbanColumn = {
  /** The column's stable key. The route or the state name is the usual choice. */
  id: string
  /** The column's own name, and the accessible name of its region. */
  label: string
  /**
   * How many cards this column shows before it says how many it is holding back.
   *
   * A work-in-progress limit is a real thing and it is a fact about the caller's
   * process rather than about the layout, so it is a prop: a team that caps a
   * column at five has said something about how the work moves, and a Block that
   * decided the number itself would be deciding that for every product that draws
   * a board.
   */
  limit?: number
  /**
   * The words for a column holding more cards than it shows, given the limit and
   * the real count.
   *
   * Required whenever the column actually overflows, and the run fails without it
   * rather than printing a number. The cost of hiding a card with no sentence
   * about it is that the board looks finished, which is the one thing a board must
   * never be, so the overflow line is always drawn and the words are always the
   * caller's.
   */
  limitLabel?: (limit: number, count: number) => string
  /** The cards in the column, in the order a reader should meet them. */
  cards: readonly KanbanCard[]
}

/**
 * The props a Kanban01 takes.
 *
 * Every string is a prop and the Block ships none. There is no column name, no
 * state word, no tag, no owner and not one card, and the absence of the last is
 * the sharpest version of the rule: a board is a picture of somebody's process
 * this week, and a Block that shipped three columns of it would be publishing
 * another product's week.
 */
export type Kanban01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title.
   *
   * Optional, because a board is very often composed into a page that already owns
   * a heading for it, and a Block that insisted on a second one would put two `h2`s
   * in the same place.
   */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order a reader should meet them.
   *
   * Order is the caller's and it is a claim about how the work moves, so the Block
   * does not sort and cannot: a board whose columns were sorted alphabetically
   * would be a diagram of a filing system rather than of a process.
   */
  columns: readonly KanbanColumn[]
  /**
   * What the Block draws inside a column that holds no cards.
   *
   * Optional because an empty column often needs no sentence: a board that shows
   * nothing under "Done" says the right thing already, and a line of words in
   * every empty column is a board where four of six columns are text. A caller
   * whose reader needs to know that "In progress" being empty is a good sign says
   * so here.
   */
  empty?: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The two-letter mark a face falls back to, from a name the caller already holds.
 *
 * Two letters and not three, because the circle this sits in is fourteen pixels
 * across and a third letter is a mark narrower than the gap between two of them.
 * The name is the caller's data, so this reads it and invents nothing.
 */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

/**
 * Columns of cards: a titled stack per column, a count beside the title, and a
 * card with a title, an optional mark, a state, an owner and a link.
 *
 * **There is no drag and there is no drop, and that is the decision this Block is
 * built around rather than the thing it is missing.** Three arguments, and each
 * one is a reason rather than a preference.
 *
 * The first is the motion law. DESIGN.md's Motion section refuses entrance
 * animation and attention motion outright, on the grounds that a reader who did
 * not ask for a thing moving is owed a page that is still. A draggable card is a
 * continuous spatial motion with a lift and a shadow that follows the pointer
 * across a column, and it is not a response to anything the reader asked for on
 * the frame the motion begins: they press a card, and then they are dragging a
 * card, and the system is running a cycle they did not start. A drag handler here
 * would be a Block authoring an interaction this system does not author.
 *
 * The second is ownership of the data, and it is the one that would have broken
 * regardless. A Block that moves a caller's card has to own the ordering, the
 * persistence and the conflict. The ordering is a claim about what the caller's
 * board means, and two products with the same column names mean different things
 * by them. The persistence is a write to a store this package has no opinion
 * about, and the conflict is the interesting one: two people moving two cards
 * into the same column at the same time is a case every caller solves differently,
 * optimistically or with a lock or by refusing the second move, and there is no
 * answer here that is right for all of them. A Block that shipped drag would have
 * picked one silently and shipped it to everybody.
 *
 * The third is that there is a way to have it that is honest. A caller who needs
 * drag composes their own control in the card's `mark` slot or beside its
 * `actions`, using whatever library owns their board's state, and passes the
 * result in. The card stays a card and the drag stays the consumer's, which is the
 * arrangement the rest of this package takes for every interaction it refuses.
 *
 * **The columns are `<section>`s and not `<div role="group">`, and the reason is
 * that the platform already has the element.** A column is a labelled region a
 * reader navigates to: it has a name, it holds a set, and a reader moving through
 * the page by landmark should be able to step over "In progress" and land on
 * "Waiting". `role="group"` with an `aria-label` conveys the name and nothing
 * else, and it is a role added to an element that already has a better one. A
 * `div` with no role is the other common answer and it is worse: an unnamed set of
 * cards is a set of cards a screen reader announces as a flat run, and a board is
 * the one surface where the grouping is the entire content.
 *
 * **The board scrolls sideways on a narrow screen and does not wrap, and a wrapped
 * column is not a column.** Four columns at phone width are four columns of about
 * eighty pixels each, which holds a two-word title and nothing else, and a reader
 * has learned nothing about any of the other three. So the board is a horizontal
 * region: each column keeps its own width, the board scrolls, and the reader moves
 * between columns the way they move between anything else that is wider than the
 * screen. The rejected alternative was a grid that stacks the columns into four
 * rows, and the cost of that is that a board read as four lists: the relationship
 * between a card and the column it is in becomes a vertical arrangement, and the
 * left to right order that says which stage comes next is gone.
 *
 * **The state is drawn in the caller's words or not at all, and the tone is a
 * guess rather than a translation.** The dot comes from the closed union above, so
 * the Block is drawing a judgement the caller made and the words beside it are the
 * caller's own. What the Block refuses is to print `blocked` and `ready` in
 * English, because those are English and a board is a screen a team reads all day
 * in a product that is very often not in English. The cost of requiring the words
 * is a prop per card, and the cost of the tone being a guess is that a board with
 * a fifth state the union does not name has to draw that fifth state itself, which
 * is the honest arrangement: the Block colours the four it was given and does not
 * colour the one it was not.
 *
 * **The count is a bare number, and that is a deliberate cost.** It sits
 * immediately after the column's own name, in the muted ink at the type scale's
 * small step, so "In progress 4" reads as a count of the column the reader is
 * already looking at and needs no sentence to be unambiguous. The rejected
 * alternative was a worded count, and a worded count is a sentence this package
 * would have to write in its own language; the same reasoning that makes every
 * other Block take a node here stops at the point where the number is beside its
 * own subject.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * only hook in the file is `useId`, which React runs during a server render as
 * well as a client one, and the two Components it composes are server Components,
 * so a board costs a consumer nothing in client JavaScript.
 */
export function Kanban01({
  eyebrow,
  title,
  description,
  columns,
  empty,
  headingLevel = 'h2',
  className,
}: Kanban01Props) {
  const uid = useId()
  const ColumnTitle = childLevel(headingLevel)

  for (const column of columns) {
    if (column.limit !== undefined && column.cards.length > column.limit && column.limitLabel === undefined) {
      throw new Error(
        `Kanban01: the column "${column.label}" holds ${column.cards.length} cards against a limit of ` +
          `${column.limit} and no limitLabel, so the overflow line would print a bare number and the board ` +
          'would look finished when it is not. Pass the words for the overflow, or drop the limit.',
      )
    }
    for (const card of column.cards) {
      if (card.state !== undefined && card.stateLabel === undefined) {
        throw new Error(
          `Kanban01: the card "${card.title}" in the column "${column.label}" declares a state and no ` +
            'stateLabel, so the tone would be a coloured dot with no sentence beside it, which is invisible to ' +
            'a reader who cannot separate the tones. Pass the words for the state, or drop the state.',
        )
      }
      if (card.href !== undefined && card.hrefLabel === undefined) {
        throw new Error(
          `Kanban01: the card "${card.title}" in the column "${column.label}" declares an href with no ` +
            'hrefLabel, so the link would carry no words of its own. Pass the words that say what it does, or ' +
            'omit the href.',
        )
      }
    }
  }

  return (
    <Section data-slot="kanban-01" className={cn(className)}>
      {title === undefined ? null : (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-10"
        />
      )}

      <div
        data-slot="kanban-01-board"
        className="border-border flex gap-4 overflow-x-auto rounded-xl border p-4"
      >
        {columns.map((column) => {
          const headingId = `${uid}-${column.id}`
          const shown = column.limit === undefined ? column.cards : column.cards.slice(0, column.limit)
          const held = column.cards.length - shown.length
          return (
            <section
              key={column.id}
              data-slot="kanban-01-column"
              data-column={column.id}
              aria-labelledby={headingId}
              className="flex w-72 shrink-0 flex-col gap-3"
            >
              {/*
               * The column's own name as a heading one level below the section,
               * so a reader navigating by heading reaches a column rather than
               * one of its cards, and moving this Block from an `h2` section to
               * an `h3` one carries the columns with it. A hardcoded `h3` would
               * be right exactly once.
               */}
              <div className="flex items-baseline justify-between gap-2">
                <ColumnTitle id={headingId} className="text-sm font-semibold">
                  {column.label}
                </ColumnTitle>
                <span
                  data-slot="kanban-01-count"
                  className="text-muted-foreground text-xs tabular-nums"
                >
                  {column.cards.length}
                </span>
              </div>

              {shown.length === 0 ? (
                <p data-slot="kanban-01-empty" className="text-muted-foreground text-pretty text-sm">
                  {empty}
                </p>
              ) : (
                <ul data-slot="kanban-01-cards" className="flex flex-col gap-3">
                  {shown.map((card) => (
                    <li
                      key={card.id}
                      data-slot="kanban-01-card"
                      data-state={card.state}
                      className="border-border bg-card text-card-foreground flex flex-col gap-2 rounded-lg border p-3 shadow-xs"
                    >
                      {card.mark === undefined ? null : (
                        <span data-slot="kanban-01-mark" className="text-muted-foreground text-xs">
                          {card.mark}
                        </span>
                      )}

                      {/*
                       * The card's title as a heading, and never as the link. The
                       * link carries its own words below, because a card's title
                       * is a heading a reader navigates to and a link is a control
                       * a reader presses, and making one the other means the only
                       * way to name the destination is to reuse the title, which
                       * says nothing about where the reader is about to go.
                       */}
                      <ColumnTitle className="text-sm font-medium">{card.title}</ColumnTitle>

                      {card.body === undefined ? null : (
                        <span className="text-muted-foreground text-pretty text-sm">{card.body}</span>
                      )}

                      <div
                        data-slot="kanban-01-meta"
                        className="flex flex-wrap items-center gap-2"
                      >
                        {card.state === undefined || card.stateLabel === undefined ? null : (
                          <Status size="sm" tone={STATE_TONE[card.state]} label={card.stateLabel} />
                        )}

                        {card.ownerAvatar === undefined && card.owner === undefined ? null : (
                          <span className="text-muted-foreground inline-flex min-w-0 items-center gap-1.5 text-xs">
                            {/*
                             * The initials as a plain circle rather than the
                             * `Avatar` Component, and the reason is what a board
                             * costs otherwise. `Avatar` is a client Component, so
                             * composing it here would pull Base UI's avatar into
                             * the client graph for a fourteen pixel decoration on a
                             * surface whose whole point is that it is server
                             * markup. The circle is `aria-hidden` and the owner's
                             * name sits beside it, so the face is never the only
                             * statement of who has the card.
                             */}
                            {card.ownerAvatar === undefined ? null : (
                              <span
                                data-slot="kanban-01-owner"
                                className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                                aria-hidden="true"
                              >
                                {initialsOf(card.ownerAvatar.name)}
                              </span>
                            )}
                            {card.owner ?? card.ownerAvatar?.name}
                          </span>
                        )}

                        {card.tags === undefined
                          ? null
                          : card.tags.map((tag) => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.label}
                              </Badge>
                            ))}

                        {card.href === undefined || card.hrefLabel === undefined ? null : (
                          <CtaLink
                            data-slot="kanban-01-open"
                            href={card.href}
                            variant="ghost"
                            size="sm"
                          >
                            {card.hrefLabel}
                          </CtaLink>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/*
               * The overflow line, always drawn when a column is holding cards
               * back, because a board that hides a card with nothing said about it
               * is a board that looks finished. The words are the caller's, since
               * the sentence is theirs and the count alone would say nothing about
               * what happened to the cards.
               */}
              {held > 0 && column.limitLabel !== undefined ? (
                <p
                  data-slot="kanban-01-overflow"
                  className="text-muted-foreground text-xs"
                >
                  {column.limitLabel(column.cards.length - held, column.cards.length)}
                </p>
              ) : null}
            </section>
          )
        })}
      </div>
    </Section>
  )
}

export default Kanban01
