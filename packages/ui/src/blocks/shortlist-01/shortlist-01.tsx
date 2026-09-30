'use client'

import { ArrowUpDown, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { Price, type PriceProps } from '../../components/ui/price'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * How a shortlist is drawn: a grid of cards or a list of full-width rows.
 *
 * The type is `Shortlist01Form` and the prop is `variant`, and the two names
 * differing is the surface gate working rather than a slip: `check-surface.mjs`
 * refuses a public entry export whose name ends in `Variant`, because in this
 * package that shape names a cva map. This union is the two arrangements the
 * Block can draw and it is named for the arrangement, which is what
 * `AddressBook01Form` and `ContentGrid01Form` are named for the same reason.
 */
export type Shortlist01Form = 'cards' | 'rows'

/**
 * One thing a reader is considering, and everything they need to decide whether
 * to keep considering it.
 *
 * **`name` is required and nothing else is, and the reason is that a shortlist is
 * a set a reader chose.** A row with no name is a row a reader cannot point at,
 * say out loud, or match against the sentence they are about to write, and a set
 * of nameless things is not a shortlist. Everything else is optional because a
 * reader's set is heterogeneous: some things a reader is considering have a
 * price, some do not, some have a reason recorded and some do not, and a shape
 * that made every field required would be a grid where two thirds of every card
 * is an empty line drawn as a placeholder.
 *
 * **There is no `position` and no `order` field, and that is the surface's whole
 * claim.** The array a caller passes is the order the reader chose, and the Block
 * draws it in that order and never sorts it, for the reason every Block in this
 * package gives: order is a claim about importance and a Block that sorted a
 * reader's own choices would be making that claim on their behalf. A caller who
 * wants the list ranked sorts it once, upstream, and the render is their rank.
 */
export type Shortlist01Item = {
  /**
   * A stable key for the item, passed back to `onMove` and `onRemove`, and
   * carried on the markup as `data-item`.
   *
   * Required as a `string` rather than derived from the name, and the reason is
   * the one `TagGroupTag.id` gives at length: two things a reader is considering
   * can carry the same name, and a remove control that named the item would
   * announce two identical buttons and leave the reader guessing which one they
   * are on.
   */
  id: string
  /**
   * What the thing is called, in the words the reader would use about it.
   *
   * A `string` rather than a node, and for a reason the other Blocks give
   * elsewhere: this value is interpolated into the accessible name of the two
   * controls below, and a name Prism cannot compose is a name its controls cannot
   * announce. A reader comparing two items reads this column, and a name that
   * wraps to two lines costs every other card its alignment.
   */
  name: string
  /**
   * Why the reader is considering it, in one line.
   *
   * A node, because a shortlist's reason is rarely a sentence: it is a quoted
   * line from a document, a figure the reader has already looked up, a mark
   * beside a name, a link. Drawn in the muted ink and never truncated, because a
   * truncated reason on a shortlist is a reason the reader has to open the thing
   * to read, which is the opposite of what a shortlist is for. A caller who wants
   * three lines writes three lines.
   */
  reason?: ReactNode
  /**
   * The mark that identifies the thing, which is a slot and never a mark this
   * Block draws.
   *
   * A capability is identified by a logo, an icon from a vendor's own set, a
   * monogram the product has already composed, or nothing at all, and there is no
   * mark that is correct for all four. So the space is here, it is the caller's
   * node, and the Block draws a frame of a fixed size and nothing inside it when
   * the field is absent, for the reason `UserProfile01`'s portrait states: a grey
   * disc where a logo would be is a claim that the absence is a gap, and a thing
   * with no mark is a complete thing.
   */
  mark?: ReactNode
  /**
   * What it costs, when the product prices it.
   *
   * A `PriceProps` rather than a number and a symbol, for the argument
   * `RateCard01` makes at length: a symbol says the currency and nothing else,
   * while a price also has a currency code, a precision, a period and a locale,
   * and `Intl` already knows all four. Omit it for a capability with no price,
   * which is a real and common case rather than a thin one.
   */
  price?: PriceProps
  /** Where the thing goes. Its presence makes the name a native anchor. */
  href?: string
  /**
   * The words on the link beside the name, and required whenever `href` is.
   *
   * A link whose only words are the item's own name tells a reader nothing about
   * what activating it does, which is the same defect `ResourceList01` refuses and
   * for the same reason: the destination is a route in the caller's own
   * application and only the caller knows what is behind it. So the destination
   * is a real anchor and the caller's sentence is what a reader meets.
   */
  hrefLabel?: string
  /**
   * The line under the name, for whatever the caller's product has to say about
   * this item: where the estimate came from, who added it, when.
   *
   * A node, because half of the useful sentences in this position carry a link to
   * the document that explains the thing, and a caller who has to flatten theirs
   * to a string loses it.
   */
  note?: ReactNode
}

/**
 * The props a Shortlist01 takes.
 *
 * Every string is a prop and the Block ships none: no capability, no name, no
 * reason, no mark, no price, no unit, no link and not one of the two sentences a
 * shortlist is most tempted to ship. A shortlist is a claim about what somebody is
 * considering, and a Block that named one would be publishing somebody else's
 * shortlist.
 */
export type Shortlist01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * Required because a set of things a reader chose with no statement of whose
   * choices they are reads as a catalogue rather than as somebody's working list,
   * and the difference is the whole subject of the surface.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The things being considered, in the order the reader put them.
   *
   * Order is the caller's and the Block does not sort, for the reason
   * `Shortlist01Item` states: a list that reordered a reader's own choices would
   * be making a claim about which of them matters most.
   */
  items: readonly Shortlist01Item[]
  /**
   * Called with an item's `id` when the reader asks to move it.
   *
   * **One handler and no direction, and that is the decision worth naming.** A
   * shortlist is a set a reader is still arguing with, and the ways a reader
   * argues with a set are more than one: promote it to the front, send it to a
   * colleague, open it in a comparison, take it to a quote. A Block that drew an
   * up and a down would be drawing one product's idea of reordering, and the
   * cost of getting it wrong is a control that moves a thing the reader did not
   * ask to move. So the Block reports which item and the caller decides what
   * moving it means, which is the same arrangement `Inbox01`'s `onSelect` holds:
   * a Block reports an interaction and the consumer decides what it meant.
   */
  onMove?: (id: string) => void
  /**
   * The accessible name of the move control, given the item it moves.
   *
   * Required whenever `onMove` is set, and a function rather than a string for
   * the reason `TagGroup`'s `removeLabel` is one, which is that a name Prism
   * cannot compose is a name its control cannot announce: a column of eight
   * controls all announced as "Move" is a column a screen reader user cannot act
   * on, and a reader using voice control has to be able to say the words they can
   * see. The cost is real and is named rather than hidden: every caller writes the
   * sentence, once, in their own language.
   */
  moveLabel?: (item: { id: string; name: string }) => string
  /**
   * Called with an item's `id` when the reader takes it off the shortlist.
   *
   * A request and not a mutation, for the same reason every other Block in this
   * package takes one: which things are still being considered is the caller's
   * state, so a control that removed the item and put it back when the request
   * failed would be a control that lied.
   */
  onRemove?: (id: string) => void
  /**
   * The accessible name of the remove control, given the item it removes.
   *
   * Required whenever `onRemove` is set, and a function rather than a string for
   * the argument `TagGroup` makes about its own remove control: a remove control
   * that announced only "Remove" gives a screen reader two identical buttons and
   * leaves the reader guessing which item they are on, which is the same defect
   * with a more expensive consequence here, because a shortlist is read one item
   * at a time and every item has its own remove. So the name has to include the
   * item's own name, the item's name is a `string` precisely so that Prism can
   * hand it to the function, and the caller writes the sentence in their own
   * language.
   */
  removeLabel?: (item: { id: string; name: string }) => string
  /**
   * The controls that act on the shortlist as a whole: compare what is here, send
   * it to somebody, export it.
   *
   * A slot and not a set of named controls, because which controls a shortlist
   * has is the caller's fact, and a Block that drew a compare button and an
   * export button would be drawing two products' ideas of what a shortlist is
   * for. A plain row with no role, for the reason `Item`'s trailing slot is one:
   * the controls inside are the controls.
   */
  actions?: ReactNode
  /**
   * What the Block draws in place of the set when there is nothing in it.
   *
   * Required, and the reason is the sharpest one on this surface: a reader who
   * came to look at what they were considering and found nothing is reading one
   * line, and that line has to distinguish a shortlist they have finished from a
   * shortlist that failed to load, because only the caller knows which one the
   * reader is looking at. "Nothing saved yet" is a claim, and it is a different
   * claim from the one a broken query would need.
   */
  empty: ReactNode
  /**
   * How the set is drawn.
   *
   * @defaultValue 'cards'
   *
   * `cards` is right for a set a reader recognises rather than compares, which is
   * the ordinary case for a shortlist of eight things with a mark and a reason.
   * `rows` is right for a long set or a narrow column, where the reason wants to
   * wrap under the name and a grid would put three columns of prose in a phone's
   * width. Both arrangements draw the same accessibility tree, so a consumer who
   * switches at render time gets one list rather than two.
   */
  variant?: Shortlist01Form
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a column of buttons a screen reader cannot
 * tell apart.
 *
 * Five, and each is a control that cannot be used. A move control with no name,
 * and a remove control with no name, because a button announced as "button" is
 * the one control a screen reader user cannot act on and it is invisible to
 * everybody else. A move handler with no label, which is the same defect arriving
 * from the other direction. A link with no words, or a name with no link beside
 * it. And a caller who has passed a handler and not the sentence, or the sentence
 * and not the handler, which is a caller who believes they have named controls on
 * a surface that has none.
 */
function assertShortlist(props: {
  items: readonly Shortlist01Item[]
  onMove?: (id: string) => void
  moveLabel?: (item: { id: string; name: string }) => string
  onRemove?: (id: string) => void
  removeLabel?: (item: { id: string; name: string }) => string
}): void {
  const { items, onMove, moveLabel, onRemove, removeLabel } = props

  if (onMove !== undefined && moveLabel === undefined) {
    throw new Error(
      'Shortlist01: onMove was passed with no moveLabel, so every move control would be announced by the same ' +
        'word and a reader would be told which thing to move by nothing. Pass the function that names the item.',
    )
  }

  if (moveLabel !== undefined && onMove === undefined) {
    throw new Error(
      'Shortlist01: moveLabel was passed with no onMove, so the sentences would be composed and then discarded, ' +
        'which is a caller who believes they have named the controls on a surface that has none.',
    )
  }

  if (onRemove !== undefined && removeLabel === undefined) {
    throw new Error(
      'Shortlist01: onRemove was passed with no removeLabel, so every remove control would be announced by the ' +
        'same word and a reader would be guessing which item they were on. Pass the function that names the ' +
        'item.',
    )
  }

  if (removeLabel !== undefined && onRemove === undefined) {
    throw new Error(
      'Shortlist01: removeLabel was passed with no onRemove, so the sentences would be composed and then ' +
        'discarded, which is a caller who believes they have named the controls on a surface that has none.',
    )
  }

  for (const item of items) {
    if ((item.href === undefined) !== (item.hrefLabel === undefined)) {
      throw new Error(
        `Shortlist01: the item ${JSON.stringify(item.name)} declares one of href and hrefLabel without the ` +
          'other, so the row would carry a link with no words of its own, or a name with no link beside it. Pass ' +
          'both, or neither.',
      )
    }
  }
}

/**
 * A set of capabilities a reader is considering, each of which they can move or
 * take off the list, in cards or in rows.
 *
 * **The storefront version of this pattern is a wishlist, and the pattern is the
 * same one.** A shop shows a reader the things they saved to buy later, each with
 * a mark, a name, a price, and a control to take it off the list. What changes
 * here is what is on the list. Prism's products observe a pipeline, capture a
 * market, watch an estate and run agents, so what a reader is weighing up is a
 * capability: an ingest, a retention policy, a connector, an agent. Nothing here
 * is for sale, nothing here has a basket, and the "price" is a rating the product
 * publishes, not a figure anybody will be charged. A reader who has used both will
 * recognise the shape, and the difference that matters is that a wishlist is a
 * list of things and a shortlist is a list of decisions.
 *
 * **The controls are part of the item rather than a row action, and that is the
 * one decision this Block has that a list does not.** A list is a list of things
 * somebody published, and the only thing a reader can do with one is read it. A
 * shortlist is a set the reader chose and can change, which means the ability to
 * change it is not an affordance sitting beside the item, it is part of what the
 * item is: a row with no control is not a shortlist item that happens to lack a
 * control, it is a list the reader is looking at and cannot act on, and a reader
 * who cannot act on a list stops treating it as theirs. So the two controls are
 * drawn inside the item, in both arrangements, and the Block never draws a kebab
 * menu for them either, for the reason `Item` states: a row whose only route to an
 * action is a menu in the corner hides its own content from a reader who is not
 * looking for a menu, and on a shortlist that reader is the reader who is
 * comparing. The cost is stated rather than hidden: a caller who wants a single
 * control for the whole set uses the `actions` slot and leaves both of these off,
 * and a shortlist drawn with neither is a reader's list that the product cannot
 * act on, which is a legitimate page and not the page this Block is for.
 *
 * **Both control names are functions, and the reason is the one `tag-group` gives
 * about its own remove control.** A remove control that announced only "Remove"
 * gives a screen reader reader two identical buttons and leaves the reader guessing
 * which item they are on. On a tag group that is an annoyance, because the tags
 * are read left to right and a reader can usually tell. On a shortlist it is
 * worse, because a reader works through a shortlist one item at a time, every item
 * carries its own remove, and the item is the only thing that distinguishes one
 * control from the next. So the name has to contain the item's name, the item's
 * name is typed as a `string` rather than a node precisely so that Prism can hand
 * it to a function rather than trying to interpolate a node into a sentence, and
 * the sentence itself is the caller's because it is a sentence in their language.
 * The move control is a function for the same reason and one more: a column of
 * eight controls all announced as "Move" is a column nobody can act on, and the
 * honest sentence usually says what moving means in this product, which is a fact
 * this Block cannot see.
 *
 * **The Block reports which item and never decides what moving it means.** A
 * shortlist is a set a reader is still arguing with, and the ways a reader argues
 * with a set are more than one: promote it, send it to a colleague, open it in a
 * comparison, take it to a quote. A Block that drew an up and a down would be
 * drawing one product's idea of reordering, so `onMove` takes an id and nothing
 * else, and what happens next is the caller's. That is the arrangement
 * `SettingsMembers01` uses for a role change and `SettingsSecurity01` uses for a
 * toggle: the control reports a request, the data decides whether it happened,
 * and a request that failed leaves the item exactly where the reader left it,
 * which is a control that told the truth.
 *
 * **The order is the caller's and the Block never sorts.** The array a caller
 * passes is the order the reader chose, and sorting it would be a Block making a
 * claim about which of a reader's own considerations matters most. That is the
 * same refusal every list in this package makes, and it is stronger here because
 * the order is not the store's or the catalogue's, it is one person's thinking at
 * one moment, and a component that reorders it is editing that.
 *
 * **The name is a heading one step below the section, in both arrangements.** A
 * reader who has built a shortlist and then navigates by heading wants to land on
 * one of the things they were considering, not on a list item in a column, and a
 * name in a `span` is a name they cannot come back to. The two arrangements draw
 * the same tree rather than two, so a consumer who switches `variant` at render
 * time gets one list in the accessibility tree rather than two, and the outline
 * does not depend on a layout prop.
 *
 * **The mark is a slot and no mark is drawn in its place.** The reason is the one
 * `UserProfile01` gives for its portrait: a placeholder where a logo would be is
 * a claim that the absence is a gap, and it says the same thing about every reader
 * of every product that installs this Block. So the frame is a fixed size, the
 * node inside it is the caller's, and a thing with no mark draws no frame at all,
 * which is the honest state for a capability the product has no logo for.
 *
 * It is a client Component, and the directive is unconditional. The rule this
 * follows is the one `AddressBook01` states in full: a surface that attaches a
 * handler is a client Component, and the directive is on the module rather than in
 * a leaf so that a consumer composing a server page gets the boundary in one place
 * they can see. The cost is that with both handlers omitted the whole module is
 * still in the client graph, where the static arrangement would have shipped no
 * JavaScript at all; the price was judged worth paying for one boundary rather
 * than two arrangements of the same surface.
 */
export function Shortlist01({
  eyebrow,
  title,
  description,
  items,
  onMove,
  moveLabel,
  onRemove,
  removeLabel,
  actions,
  empty,
  variant = 'cards',
  headingLevel = 'h2',
  className,
}: Shortlist01Props) {
  assertShortlist({ items, onMove, moveLabel, onRemove, removeLabel })

  // An item's name is a heading one step below the section that introduces the
  // set, derived rather than written, so a Block embedded one level deeper carries
  // its names with it.
  const Title = childLevel(headingLevel)
  const asCards = variant === 'cards'

  return (
    <Section data-slot="shortlist-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-8"
      />

      {actions === undefined ? null : (
        /*
          The caller's controls for the set as a whole, at the trailing edge above
          it rather than inside any item, because they act on the list and not on
          one of its entries. A plain row with no role, for the reason `Item`'s
          trailing slot is one: the controls inside are the controls, and a group
          here would be a group with no name and one more thing a reader walks
          past.
        */
        <div data-slot="shortlist-01-actions" className="mb-6 flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}

      {items.length === 0 ? (
        /*
          The caller's own sentence, drawn where the set would have been rather
          than above it, so a reader is not told there is nothing at the foot of a
          page that shows a shortlist. A reader who has finished deciding and a
          reader whose query failed are both looking at an empty page, and only
          the caller knows which one it is.
        */
        <p data-slot="shortlist-01-empty" className="text-muted-foreground max-w-measure-narrow text-pretty text-sm">
          {empty}
        </p>
      ) : asCards ? (
        <ul
          data-slot="shortlist-01-items"
          data-variant={variant}
          className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <li
              key={item.id}
              data-slot="shortlist-01-item"
              data-item={item.id}
              className="border-border bg-card flex h-full flex-col gap-4 rounded-xl border p-5 shadow-sm"
            >
              {item.mark === undefined ? null : (
                /*
                  The caller's own mark in a fixed frame. The frame is a size and a
                  clip and nothing else, so a caller's logo and a caller's monogram
                  are the same height whichever they pass, and an item with no mark
                  draws no frame rather than a grey disc where a logo would be.
                */
                <span
                  data-slot="shortlist-01-mark"
                  className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover"
                >
                  {item.mark}
                </span>
              )}

              <Title data-slot="shortlist-01-name" className="text-base font-semibold">
                {item.name}
              </Title>

              {item.reason === undefined ? null : (
                <span data-slot="shortlist-01-reason" className="text-muted-foreground text-pretty text-sm">
                  {item.reason}
                </span>
              )}

              {item.price === undefined ? null : (
                <Price data-slot="shortlist-01-price" {...item.price} size="sm" />
              )}

              {item.note === undefined ? null : (
                <span data-slot="shortlist-01-note" className="text-muted-foreground mt-auto text-xs">
                  {item.note}
                </span>
              )}

              {item.href === undefined || item.hrefLabel === undefined ? null : (
                <CtaLink
                  data-slot="shortlist-01-link"
                  href={item.href}
                  variant="outline"
                  size="sm"
                  className="self-start"
                >
                  {item.hrefLabel}
                </CtaLink>
              )}

              <Controls
                data-slot="shortlist-01-controls"
                item={{ id: item.id, name: item.name }}
                onMove={onMove}
                moveLabel={moveLabel}
                onRemove={onRemove}
                removeLabel={removeLabel}
                className="mt-auto"
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul
          data-slot="shortlist-01-items"
          data-variant={variant}
          className="border-border flex flex-col border-t"
        >
          {items.map((item) => (
            <li
              key={item.id}
              data-slot="shortlist-01-item"
              data-item={item.id}
              className="border-border flex flex-wrap items-center gap-x-4 gap-y-3 border-b px-3 py-4"
            >
              {item.mark === undefined ? null : (
                <span
                  data-slot="shortlist-01-mark"
                  className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover"
                >
                  {item.mark}
                </span>
              )}

              <div data-slot="shortlist-01-body" className="flex min-w-0 flex-1 flex-col gap-1">
                <Title data-slot="shortlist-01-name" className="text-sm font-semibold">
                  {item.name}
                </Title>
                {item.reason === undefined ? null : (
                  <span data-slot="shortlist-01-reason" className="text-muted-foreground text-pretty text-xs">
                    {item.reason}
                  </span>
                )}
                {item.price === undefined ? null : (
                  <Price data-slot="shortlist-01-price" {...item.price} size="sm" />
                )}
                {item.note === undefined ? null : (
                  <span data-slot="shortlist-01-note" className="text-muted-foreground text-xs">
                    {item.note}
                  </span>
                )}
              </div>

              {item.href === undefined || item.hrefLabel === undefined ? null : (
                <CtaLink
                  data-slot="shortlist-01-link"
                  href={item.href}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {item.hrefLabel}
                </CtaLink>
              )}

              <Controls
                data-slot="shortlist-01-controls"
                item={{ id: item.id, name: item.name }}
                onMove={onMove}
                moveLabel={moveLabel}
                onRemove={onRemove}
                removeLabel={removeLabel}
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

/**
 * The two controls that make an item part of a set the reader owns.
 *
 * Both are real buttons with a real focus ring and a real hit target, and both
 * take their accessible name from the caller because the item's own name is the
 * only thing that distinguishes one from the next. The icons are `aria-hidden`
 * and the names are the answer, which is the pattern every icon-only region in
 * this package uses: the shape is decoration, the words are the information.
 *
 * The move control is a single button with no direction, and the reason is in the
 * Block's JSDoc: the ways a reader moves a thing on a shortlist are more than
 * one, and the Block reports which item rather than choosing how it travels.
 */
function Controls({
  item,
  onMove,
  moveLabel,
  onRemove,
  removeLabel,
  className,
}: {
  /** Carried on the wrapper so a test and a caller can find the controls. */
  'data-slot'?: string
  item: { id: string; name: string }
  onMove?: (id: string) => void
  moveLabel?: (item: { id: string; name: string }) => string
  onRemove?: (id: string) => void
  removeLabel?: (item: { id: string; name: string }) => string
  className?: string
}) {
  if (onMove === undefined && onRemove === undefined) return null

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onMove !== undefined && moveLabel !== undefined ? (
        <Button
          data-slot="shortlist-01-move"
          type="button"
          variant="ghost"
          size="icon"
          aria-label={moveLabel(item)}
          onClick={() => onMove(item.id)}
        >
          <ArrowUpDown aria-hidden="true" />
        </Button>
      ) : null}

      {onRemove !== undefined && removeLabel !== undefined ? (
        <Button
          data-slot="shortlist-01-remove"
          type="button"
          variant="ghost"
          size="icon"
          aria-label={removeLabel(item)}
          onClick={() => onRemove(item.id)}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}

export default Shortlist01
