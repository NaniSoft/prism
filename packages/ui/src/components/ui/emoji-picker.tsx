'use client'

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { ScrollArea } from './scroll-area'
import { SearchField } from './search-field'
import { cn } from '../../lib/utils'

/**
 * One emoji the reader may choose, and every word the picker needs to draw it.
 *
 * **The set is the consumer's data and none of it is in this module.** That is
 * the whole of the first decision, and the cost of it is stated rather than
 * hidden: a consumer who wants a picker in an afternoon has to source or derive
 * a data set, because a table shipped here would be a second source of truth for
 * a surface whose data changes per product. Unicode adds emoji in every release,
 * a support product wants issue numbers and a documentation product wants
 * symbols, and no one of those three sets is a subset this package could pick.
 * So the type below is a *shape*, and the consumer holds the rows.
 *
 * **`glyph` is drawn and never announced, and `name` is announced and never
 * drawn.** A platform's own name for a glyph differs by operating system, by
 * reader and by version, and a screen reader that names "🎉" as "party popper"
 * in one build and as nothing in another is not a name this package can rely on,
 * so the glyph is `aria-hidden` and the button is named by `name`. The cost is
 * that a caller who passes a glyph and no name ships a row of buttons that a
 * screen reader announces as "button" and nothing else, which is why `name` is
 * required rather than optional. A data set that carries names is the ordinary
 * case, so the requirement costs a consumer who already has one nothing.
 */
export type EmojiPickerItem = {
  /**
   * The consumer's own key for this emoji, and what the picker reports.
   *
   * Required, and required as a string rather than as the glyph because two
   * entries can carry the same glyph (a skin tone, a regional indicator, a
   * variant selector) and a selection that cannot tell them apart is a selection
   * the reader cannot make. It must be unique across every group, because the
   * selected value is one id and the roving tab stop is one id: two entries
   * sharing an id make one of them unreachable rather than ambiguous.
   */
  id: string
  /** The character the cell draws. Drawn, and hidden from assistive technology. */
  glyph: string
  /**
   * What the cell is called, and the cell's accessible name.
   *
   * Required, and it is a `string` rather than a node because it is written into
   * `aria-label` and an accessible name is a string: a node here would render as
   * nothing a reader hears. It is the consumer's word, in the consumer's
   * language, which is the only place a name for a glyph can come from.
   */
  name: string
  /**
   * Words the search matches on in addition to `name`.
   *
   * Optional, and it is how a search on a bounded set stays useful: a reader who
   * types "party" wants the celebration glyphs and not the one entry whose name
   * happens to contain the word. A consumer whose set is already searchable by
   * name alone passes nothing and the search is narrower for it.
   */
  keywords?: readonly string[]
}

/**
 * One row of the rail and one block of the grid, in the consumer's own grouping.
 *
 * A group is the consumer's fact rather than a Unicode block, which is the reason
 * this is not a block list: a product's emoji rail is "Reactions" and
 * "Workflow states" far more often than it is "Symbols and Pictographs".
 */
export type EmojiPickerGroup = {
  /** The consumer's own key for the group, and what the rail button reports. */
  id: string
  /**
   * What the category is called, and the rail button's name.
   *
   * Required, and required for the same reason `EmojiPickerItem.name` is: the
   * rail is a row of buttons, a button with no name is announced as "button",
   * and the grid beside it is named by this same string while the reader browses,
   * so an unnamed category is both an unnamed button and an unnamed grid.
   */
  name: string
  /** The entries this category holds, in the order a reader should meet them. */
  items: readonly EmojiPickerItem[]
}

/**
 * The three cell steps, and the column count that goes with each one.
 *
 * The columns and the cell are one fact in one table rather than two, because
 * the keyboard model reads the column count and the layout reads the class, and
 * two tables would be two numbers that could disagree. A reader who presses the
 * down arrow and lands two rows further down has been told the grid is wider
 * than it is, and nothing about a Component can make that recoverable except
 * keeping one number.
 *
 * `min-h` and not `size` on the cell: the columns are fractions of the caller's
 * container, so a fixed square would overflow a narrow picker and leave a gap in
 * a wide one. The floor is what carries the step, and it is raised to 44 pixels
 * on a coarse pointer because an emoji cell is a target a finger has to hit.
 */
const EMOJI_SIZE = {
  sm: { columns: 10, grid: 'grid-cols-10', cell: 'min-h-8', glyph: 'text-base' },
  md: { columns: 8, grid: 'grid-cols-8', cell: 'min-h-10', glyph: 'text-xl' },
  lg: { columns: 7, grid: 'grid-cols-7', cell: 'min-h-12', glyph: 'text-2xl' },
} as const

/**
 * The three cell steps a picker is drawn at.
 *
 * @defaultValue 'md'
 */
export type EmojiPickerSize = keyof typeof EMOJI_SIZE

/** The props an EmojiPicker accepts. */
export interface EmojiPickerProps {
  /**
   * The categories, in the order the rail draws them and the reader meets them.
   *
   * Required, and order is the consumer's because which category a reader lands
   * on first is a claim about their product. Passing an empty array draws a
   * picker with a search field and no rail, which is the honest shape of a
   * product whose emoji set has not been chosen yet.
   */
  groups: readonly EmojiPickerGroup[]
  /**
   * The `id` of the chosen entry, as the consumer holds it.
   *
   * Required, and required as a controlled value for the reason `SearchField`
   * states: the selection is the consumer's state, and a picker that owns it
   * cannot be embedded in a form the consumer validates, cannot be restored from
   * a save, and cannot be cleared by anything outside itself.
   *
   * An `id` that names no entry in `groups` selects nothing and announces
   * nothing, which is a real state and not a throw: a store holding an emoji the
   * product has since withdrawn is the consumer's data problem, and taking the
   * page down over it is worse than drawing a picker with nothing chosen.
   */
  value: string
  /**
   * Called with an entry's `id` when the reader presses its cell.
   *
   * Required, and a request rather than a mutation, for the reason every other
   * control in this package takes one: which emoji is current is the consumer's
   * state, and this Component does not write into a form, does not store
   * anything and does not know what choosing an emoji is for.
   */
  onValueChange: (id: string) => void
  /**
   * The search field's visible name, and the grid's name while a query is present.
   *
   * Required, and it is a `string` rather than a node because the same prop names
   * the field through a label element and names the grid through
   * `aria-labelledby`. The words are the consumer's: "Find an emoji", "Reactions"
   * and "Buscar" are all the same control, and Prism chooses none of them.
   */
  searchLabel: string
  /**
   * What the search field shows while it is empty.
   *
   * Optional, and a hint rather than a name: it disappears on the first
   * keystroke and it is drawn in the muted ink, so it reads as an instruction
   * rather than as an answer. A picker with no placeholder is a picker whose
   * field is a bare box, which is fine and is the caller's choice.
   */
  searchPlaceholder?: string
  /**
   * The accessible name of the control that empties the search field.
   *
   * Required, because the clear control is an icon-only button and a button with
   * no name is announced as "button" and nothing else. The prop is also what
   * makes the control exist: with no `clearLabel` the field is drawn with no
   * clear control at all, rather than a nameless X that does something.
   */
  clearLabel: string
  /**
   * The sentence drawn when the reader can see no entries at all.
   *
   * Required, and one prop for both empty states: a query that matched nothing
   * and a category the consumer left empty. The cost is stated rather than
   * hidden, and it is that a product which words those two differently has to
   * pass the more important one, which is the search, because a reader looking
   * for the sentence is a reader whose query matched nothing. A consumer who
   * would rather never see it than see it worded wrongly passes a sentence for
   * the case they care about and keeps every category non-empty.
   */
  emptyLabel: string
  /**
   * The sentence announced after the reader chooses an entry.
   *
   * Required, and a function of the entry rather than a string because it has to
   * name the entry that was chosen, and the only word this package has for an
   * entry is the consumer's own `name`. It is a polite live region and not an
   * assertive one, so it never interrupts; the visible grid is the answer and
   * this is the sentence a reader who cannot see the change needs beside it.
   */
  selectLabel: (item: EmojiPickerItem) => string
  /**
   * Called when the reader presses Escape anywhere inside the picker.
   *
   * Optional, and it is how the picker closes the surface it was composed into:
   * Prism does not draw a popover or a dialog, so a picker sitting in one cannot
   * close it on its own, and a consumer who wants Escape to dismiss passes the
   * handler their own surface already has. With no handler, Escape still does
   * the picker's own cancel: it empties the query, which puts the whole category
   * back in the grid under the reader's hands. The cost is that a consumer who
   * persists the picker and expects Escape to leave the query alone will not get
   * that, and there is no prop to turn the cancel off, because a cancel that
   * can be switched off is not a cancel.
   */
  onDismiss?: () => void
  /** The cell step, and with it the column count. @defaultValue 'md' */
  size?: EmojiPickerSize
  /** Layout only, and the picker is unbounded without it. */
  className?: string
}

/**
 * The words a query is matched against, folded to lower case once per change.
 *
 * The name and the keywords are one haystack rather than two fields, so a query
 * word matches a keyword and a keyword matches a name with no rule to learn: the
 * reader types words and the words are found. Folding happens here rather than
 * at each comparison so a filter over a bounded set is one pass, not one fold
 * per term per entry.
 */
function haystack(item: EmojiPickerItem): string {
  return `${item.name} ${item.keywords?.join(' ') ?? ''}`.toLowerCase()
}

/**
 * A grid of emoji the reader chooses one of, with a search field and a rail of
 * categories.
 *
 * **The emoji set is a prop and this module ships no table, and the cost of that
 * is a real one.** A data set is a licensed asset or a derived one, it changes
 * every Unicode release, and what a product's rail contains is that product's
 * claim about itself. Shipping a table here would be a second source of truth
 * for the picker, and it would be wrong in a way no gate could see: a consumer
 * who wanted 40 workflow glyphs would have to delete three thousand rows, and a
 * consumer who wanted the full set would have to wait for this package to
 * refresh. So the picker takes the rows, and what the consumer gets back is a
 * control rather than a data set. The honest cost: a consumer who wants a picker
 * in an afternoon has to source the set first.
 *
 * **The caller's duty is to pass a bounded set, and this Component will not
 * virtualise for them.** Every entry is a real button in the document, which is
 * what makes the roving tab stop a button, what makes the browser's own
 * find-in-page reach a glyph, and what makes the accessibility tree tell the
 * truth about how many entries there are. Virtualising would take all three away
 * and would make this a different control wearing this name: the tab stop would
 * be a placeholder, find-in-page would stop finding glyphs, and the entry count a
 * screen reader reports would be a number the Component asserted rather than one
 * it could see. It would also need the row height and the scroll offset, which
 * are layout measurements, which is a measurement a server render cannot make
 * and a caller who has already said how wide the picker is would have to
 * override. So a set of three thousand emoji in an eight column grid is a slow
 * grid, and the honest answer to that is a different surface, a search first
 * field with a result list, rather than a virtualised one under this name. Pass
 * what a reader would actually scroll through: a few hundred entries at most,
 * which is several screens and not several minutes.
 *
 * **The grid is a radio group of buttons with a roving tab stop, and the two
 * halves of that sentence are both deliberate.** The single selection is a real
 * fact, and `role="radiogroup"` with `role="radio"` and `aria-checked` on each
 * cell is the only description of it that is true, for the reason
 * `ToggleGroup` argues in full: pressed buttons say each cell is independent,
 * which is the claim one selection is denying. The roving tab stop is ours
 * because the platform's version of it belongs to a native radio group, and
 * these are buttons in a grid whose column count the caller chose. The cost of
 * owning it is that it has to be maintained: a grid where every cell is a tab
 * stop is a grid a keyboard reader has to Tab through three hundred times, and a
 * grid where no cell is one cannot be entered at all.
 *
 * **The keyboard model, in full, because a reader cannot discover it.** The
 * whole grid is one Tab stop and the stop sits on the chosen entry, or on the
 * first cell when nothing is chosen. The arrow keys move focus and do not
 * choose: left and right by one cell, up and down by one column, each clamped at
 * the edge rather than wrapped, because a grid that wraps surprises a reader
 * who is reading a row as a row. Home and End go to the first and the last
 * visible cell. Arrow Down from the search field moves into the grid on the
 * current stop, which is what makes the field and the grid one control to a
 * reader rather than two stops to learn. Enter and Space choose, because the
 * cells are buttons. Escape empties the query and calls `onDismiss` when one was
 * passed.
 *
 * **The rail is a row of ordinary tab stops and is not a composite widget.**
 * `role="tablist"` is the role that describes it, and a tablist is a
 * required-name role, so using it would need a seventh string prop for a control
 * whose members are already named by the category names. The rail instead draws
 * plain buttons with `aria-current` on the one showing, which says "this is the
 * current item in this set" without claiming the grid is a tab panel. The cost is
 * that a reader Tabs through each category rather than arrowing them, and with a
 * handful of categories that is the better trade; a picker with forty categories
 * is a picker with the wrong rail.
 *
 * **The rail is drawn only while the query is empty, and that is a decision
 * rather than an omission.** A search that filtered only the showing category
 * would mean a reader who has landed on Reactions and typed "cat" is told there
 * is no cat, which is a false statement about the product's own set. So a query
 * searches every category at once, the grid flattens them in the order the
 * categories were passed, and the rail is not drawn while it does, because a
 * category button that does nothing is a control that lies. The cost is a layout
 * change when the reader types the first character, and the alternative, keeping
 * the rail, is a worse failure than a shift.
 *
 * **The arrow step follows the declared column count and not the measured one,
 * and the gap is named rather than hidden.** A grid that renders fewer columns
 * than `size` says, because the caller put it in a narrow container, moves down
 * by a row the reader cannot see. Prism could measure the rendered column count
 * and it does not, for the reason it does not virtualise: a measurement is a
 * layout read, it is not available in a server render, and it would put the
 * keyboard model at the mercy of whatever the caller did to the width. Passing a
 * smaller `size` is the fix and it is one prop.
 *
 * **Motion is state feedback on two tokens and there is no keyframe.** The cell
 * and the rail change ink with `duration-fast ease-out`, which is the same
 * feedback the rest of the package gives, and the press scales by a token-free
 * factor on `transition-[color,background-color,scale]`. Neither carries a
 * `motion-safe:`: `packages/ui/src/styles.css` ends with one unlayered
 * `prefers-reduced-motion` rule that stops every transition in the package, so a
 * reader who has asked for less motion gets the colour change at full strength
 * and the press with no movement at all, and the two decisions live in one place
 * rather than one per cell. Nothing here waits for a script, a scroll position or
 * a timer, so the picker is complete and legible at first paint whatever the
 * reader's settings are.
 *
 * **It is a client Component, and the directive is unconditional.** The picker
 * holds the query, the showing category, the roving stop and the announcement,
 * and all four are the control rather than a decoration of it. The cost is named
 * rather than hidden: a consumer who renders a read-only list of the set they
 * already hold ships a client runtime for it, and the honest answer for that case
 * is their own list, because a picker with no search and no selection is a grid
 * of glyphs and the grid is three lines of their own markup.
 */
function EmojiPicker({
  groups,
  value,
  onValueChange,
  searchLabel,
  searchPlaceholder,
  clearLabel,
  emptyLabel,
  selectLabel,
  onDismiss,
  size = 'md',
  className,
}: EmojiPickerProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [stop, setStop] = useState<string | null>(null)
  const [announced, setAnnounced] = useState('')

  const drawn = EMOJI_SIZE[size]

  // Every entry with its search words folded once, so a filter over the set is a
  // comparison per term rather than a fold per term per entry. The id is the
  // consumer's own key, so the flat list is also where the chosen entry is found.
  const flat = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => ({ item, hay: haystack(item) }))),
    [groups],
  )

  // The showing category, falling back to the first when the state names one the
  // consumer has since removed, so a picker survives its data changing under it
  // rather than drawing an empty grid beside a rail whose buttons do nothing.
  const shown = groups.find((group) => group.id === category) ?? groups[0]
  const searching = query.trim() !== ''

  const visible = useMemo(() => {
    if (!searching) return shown?.items ?? []
    // Every term has to match somewhere, so a two word query narrows rather than
    // widens. That is the rule a reader expects from a search field and it is
    // the one a consumer cannot change without losing the set.
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return flat
      .filter((entry) => terms.every((term) => entry.hay.includes(term)))
      .map((entry) => entry.item)
  }, [flat, query, shown])

  const chosen = flat.find((entry) => entry.item.id === value)?.item

  // The stop is a derivation with a piece of state over it, and the derivation
  // is what makes it self healing: a stop naming an entry the current query has
  // filtered out falls back to the chosen entry and then to the first cell, so
  // the grid always has exactly one Tab stop and never has none.
  const current =
    visible.find((item) => item.id === stop) ??
    visible.find((item) => item.id === chosen?.id) ??
    visible[0]
  const currentAt = current === undefined ? -1 : visible.indexOf(current)

  // The grid is named by the category while the reader browses and by the search
  // field's own label while a query is present, because those are the two sets
  // on screen and each has a name the consumer already wrote. The scroll region
  // takes the same one for the reason `ListPanel` gives: the region and the grid
  // hold the same entries, and a reader who tabs into one and hears a different
  // name from the other has been told two things about the same content.
  //
  // `aria-label` rather than a generated id pointing at the field's own label
  // element, and the reason is a duplicate rather than a convenience: an
  // `sr-only` copy of a label that is already on screen is a second copy of the
  // same words in the accessibility tree, and a reader walking the page hears it
  // twice. The name is a string here because the words are the same words the
  // field shows, so there is nothing for a node to carry.
  const regionName = searching || shown === undefined ? searchLabel : shown.name

  const cells = () => [
    ...(gridRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="emoji-picker-cell"]') ??
      []),
  ]

  const move = (to: number) => {
    const all = cells()
    if (all.length === 0) return
    const target = all[Math.min(Math.max(to, 0), all.length - 1)]
    if (target === undefined) return
    // Focus is what records the stop, through the cell's own onFocus, so there
    // is one place that writes it and the arrow handler cannot move the stop to
    // a cell the reader did not reach.
    target.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setQuery('')
      onDismiss?.()
      return
    }

    const target = event.target
    if (target instanceof HTMLInputElement) {
      // The one key a single line text field has no use for, and the one a
      // reader expects to move from a search field into the results. Without it
      // the field and the grid are two stops and the reader has to guess that
      // Tab crosses between them.
      if (event.key === 'ArrowDown' && currentAt !== -1) {
        event.preventDefault()
        move(currentAt)
      }
      return
    }

    if (!(target instanceof HTMLButtonElement)) return
    if (target.dataset.slot !== 'emoji-picker-cell') return
    const from = cells().indexOf(target)
    if (from === -1) return

    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -drawn.columns,
      ArrowDown: drawn.columns,
    }
    const step = steps[event.key]
    if (step !== undefined) {
      event.preventDefault()
      move(from + step)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      move(event.key === 'Home' ? 0 : cells().length - 1)
    }
  }

  return (
    <div
      data-slot="emoji-picker"
      onKeyDown={onKeyDown}
      className={cn('flex w-full items-start gap-3', className)}
    >
      {/*
       * The rail, drawn only while the reader is browsing. A category button
       * shown during a search would be a control that does nothing, and a reader
       * who pressed one would be told the product's own set has no answer.
       */}
      {searching || groups.length === 0 ? null : (
        <div data-slot="emoji-picker-rail" className="flex shrink-0 flex-col gap-0.5">
          {groups.map((group) => {
            const currentCategory = group.id === shown?.id
            return (
              <button
                key={group.id}
                type="button"
                data-slot="emoji-picker-rail-item"
                data-category={group.id}
                aria-current={currentCategory ? true : undefined}
                onClick={() => {
                  setCategory(group.id)
                  setStop(null)
                }}
                className={cn(
                  'rounded-md px-2 py-1 text-left text-sm whitespace-nowrap outline-none',
                  'transition-colors duration-fast ease-out',
                  'focus-visible:ring-ring focus-visible:ring-[3px]',
                  'pointer-coarse:min-h-11',
                  currentCategory
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {group.name}
              </button>
            )
          })}
        </div>
      )}

      <div data-slot="emoji-picker-panel" className="flex min-w-0 flex-1 flex-col gap-2">
        <SearchField
          value={query}
          onValueChange={setQuery}
          label={searchLabel}
          placeholder={searchPlaceholder}
          clearLabel={clearLabel}
        />

        <ScrollArea label={regionName} orientation="vertical" className="min-h-0 flex-1">
          {visible.length === 0 ? (
            <p data-slot="emoji-picker-empty" className="text-muted-foreground p-3 text-sm">
              {emptyLabel}
            </p>
          ) : (
            <div
              ref={gridRef}
              data-slot="emoji-picker-grid"
              role="radiogroup"
              aria-label={regionName}
              className={cn('grid gap-1 p-0.5', drawn.grid)}
            >
              {visible.map((item) => {
                const checked = item.id === value
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-slot="emoji-picker-cell"
                    data-item={item.id}
                    role="radio"
                    aria-checked={checked}
                    // The roving tab stop. Exactly one cell is in the tab order,
                    // and `current` is a derivation that always resolves to one,
                    // so the grid can always be entered and never entered twice.
                    tabIndex={item.id === current?.id ? 0 : -1}
                    onFocus={() => setStop(item.id)}
                    onClick={() => {
                      onValueChange(item.id)
                      setAnnounced(selectLabel(item))
                    }}
                    className={cn(
                      'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex aspect-square w-full min-w-0 items-center justify-center rounded-md outline-none',
                      // The scale is the one spatial change in this Component, and
                      // it is guarded so a reader who asked for less movement gets
                      // the ink change at full strength and no movement. The colour
                      // changes are feedback and are not guarded, which is the
                      // position DESIGN.md takes on reduced motion.
                      'transition-[color,background-color,scale] duration-fast ease-out',
                      'active:scale-95',
                      'focus-visible:ring-ring focus-visible:ring-[3px]',
                      drawn.cell,
                      'pointer-coarse:min-h-11',
                      checked && 'bg-accent text-accent-foreground',
                    )}
                  >
                    <span
                      data-slot="emoji-picker-glyph"
                      aria-hidden="true"
                      className={cn('leading-none select-none', drawn.glyph)}
                    >
                      {item.glyph}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/*
         * The announcement, and it is in the document from the first paint with
         * nothing in it. A live region that arrives with its first message is the
         * one case a live region is least reliable for, and the fix is to render
         * it empty and fill it later, which is why the state starts as an empty
         * string rather than as a prop that may or may not arrive.
         */}
        <p data-slot="emoji-picker-announcement" aria-live="polite" className="sr-only">
          {announced}
        </p>
      </div>
    </div>
  )
}

export { EmojiPicker }
