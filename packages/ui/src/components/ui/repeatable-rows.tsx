'use client'

import { PlusIcon, XIcon } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Button } from './button'
import { cn } from '../../lib/utils'

/**
 * What the Component hands a row's own render prop alongside the row.
 *
 * Two facts, and neither of them is the row. `index` is the row's position in the
 * caller's array, counted from zero, because that is the number a caller needs to
 * index their own array with and a one-based ordinal would be a second convention
 * to remember. `fieldId` is the id this row's first control should carry, and it
 * is the only part of the Component that reaches into the caller's markup.
 */
export type RepeatableRowInfo = {
  /**
   * The row's position in `rows`, counting from zero.
   *
   * Zero-based on purpose, and it is worth saying why twice: the row is the
   * caller's object and the caller's array is the caller's, so the number that
   * helps is the one that indexes it. It renumbers on every removal, and so does
   * everything derived from it, which is the point of the Component.
   */
  index: number
  /**
   * A generated id for this row's first control, for the caller's own `htmlFor`
   * and `aria-describedby`.
   *
   * Generated rather than derived from the position, and the difference between
   * those two is the whole accessibility story of this Component: an id that
   * followed the index would change on every removal, and every `for` pointing at
   * it would point at the next row's control by the time a reader clicked the
   * label. This one is bound to the row, so it survives the rows around it moving.
   */
  fieldId: string
}

/**
 * The props the Repeatable rows accepts.
 *
 * The props interface is generic over the row type rather than typed as `object`,
 * because a row is the caller's own domain value: a line item, a recipient, a
 * scheduled window, a matching rule. A Component that took a shape of its own
 * would make every caller restate their type to satisfy a form, and the row's
 * fields are the caller's business rather than this Component's. A consumer who
 * wants the type end to end writes their own typed wrapper over
 * `RepeatableRowsProps<TheirRow>`, which is one line and is why the interface
 * rather than a fixed shape is what is exported.
 */
export interface RepeatableRowsProps<TRow extends object> {
  /**
   * The rows, in the order they are shown.
   *
   * Required, and the objects must be the same objects across renders. The
   * Component keys each row by its identity rather than by its position, which is
   * what lets a middle row leave without the rows around it losing their
   * controls, and identity is only stable if the caller holds the rows somewhere
   * rather than rebuilding them. A caller that writes `rows.map((r) => ({ ...r }))`
   * on every render hands over a new object each time and every row remounts on
   * every keystroke, which is a cost worth knowing about before it is paid. The
   * same requirement React's own `key` has, met by the same arrangement: rows in
   * state.
   */
  rows: readonly TRow[]
  /**
   * Called when the reader asks for another row.
   *
   * Required, and the Component appends nothing itself. A row is a record with
   * fields the caller defines and defaults the caller decides, so a Component
   * that manufactured an empty one would have to invent those defaults. The
   * callback is also what tells the Component a row is coming, which is the only
   * way it can put the reader's cursor in the right place afterwards.
   */
  onAdd: () => void
  /**
   * The visible label of the add affordance, in the product's own words.
   *
   * Required and never defaulted: "Add recipient", "Add a line" and "Ajouter un
   * destinataire" are three products' answers, and the affordance is where a
   * reader decides whether the set is one they can extend.
   */
  addLabel: ReactNode
  /**
   * Called with the row to take off the set.
   *
   * The row and not its index, because the caller's array is the caller's and an
   * index is only meaningful to whoever wrote the array. The Component keeps the
   * index for itself, for the two things it has to do with it that a caller cannot:
   * renumber what remains, and move focus to a neighbour.
   */
  onRemove: (row: TRow) => void
  /**
   * The accessible name of one row's remove control, given that row's position.
   *
   * Required, and a function of the position rather than of the row, for the same
   * reason `rowLabel` is: the sentence has to be true after a removal, and a
   * sentence written from the row's own fields is a sentence that goes stale the
   * moment the rows move. Written as the action and the position, the way a reader
   * counts: "Remove stop 2".
   */
  removeLabel: (index: number) => string
  /**
   * The visible position label of one row, and the accessible name of that row's
   * region, given the row's position.
   *
   * Required, and it is one string in one place for two jobs on purpose. The
   * number a sighted reader reads and the name a screen reader announces come from
   * the same call, so they cannot disagree, and both are recomputed from the
   * position on every render, so a removal in the middle renumbers the rows below
   * it rather than leaving a gap. Return the bare ordinal when the set is
   * self-evidently numbered, and a noun with it when it is not: `"2"`, or
   * `` `Stop ${index + 1}` ``.
   */
  rowLabel: (index: number) => string
  /**
   * The row's own cells, given the row and its facts.
   *
   * A render prop rather than a slot, and the reason is that the Component has to
   * hand the row's cells a generated `id` for their labels to point at. A `children`
   * slot receives the row and nothing else, which leaves the caller minting ids
   * per row and reintroducing exactly the arrangement this Component exists to
   * hold still. Everything inside is the caller's: which controls a row has, what
   * they are called, how they are arranged.
   */
  children: (row: TRow, info: RepeatableRowInfo) => ReactNode
  /**
   * The set's own name, drawn above it and used as its accessible name.
   *
   * Optional, and the omission is deliberate rather than an oversight: this is
   * the one place in the package where a region may arrive anonymous, and
   * `ListPanel` says why at length. A set called "Rows" is a claim that is wrong
   * in every consumer's product, and a screen reader user hearing a generic name
   * learns less than hearing none. Pass one when the set sits among several.
   */
  label?: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The remove control, drawn once and used by every row.
 *
 * The muted ink because every row is the same surface and a control that changed
 * colour with its row's state would be a second thing to read, and the 44px
 * coarse-pointer floor so a set of five rows on a phone is a set of rows a thumb
 * can hit. Duplicated as a constant rather than imported, because the remove
 * controls in this package are each drawn inside the module that owns them and
 * there is no shared recipe on the surface: a caller cannot reach into another
 * Component's row geometry, and a design system that exported one class string as
 * a public API would be publishing a styling hook.
 */
const REMOVE_CONTROL =
  'text-muted-foreground hover:text-foreground inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-none transition-colors duration-fast ease-out pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * The first control in a row, found by asking the row rather than by being told.
 *
 * The Component cannot be told which of the caller's cells is first, because a
 * cell is whatever the caller's render prop returned and the Component never sees
 * the caller's field. So it asks the row. Three groups are excluded and each
 * exclusion is a real case: a hidden input is focusable and invisible, a
 * disabled control refuses focus, and a control already opted out with
 * `tabindex="-1"` asked not to be.
 */
const FIRST_FOCUSABLE =
  'input:not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[contenteditable],[tabindex]:not([tabindex="-1"])'

/** The Component's own slots, read back through one root ref after a change. */
const ROW_SLOT = '[data-slot="repeatable-rows-row"]'
const REMOVE_SLOT = '[data-slot="repeatable-rows-remove"]'
const ADD_SLOT = '[data-slot="repeatable-rows-add"]'

/**
 * A variable-length set of row objects: add one, take one away, and keep every
 * label, every name and the reader's focus pointing at the right row.
 *
 * **It is a set of objects and not a set of values, and that is the first thing
 * that makes it a Component rather than a loop.** A list of strings is a
 * `TagGroup`, and a list of values with no fields at all is a `ListPanel` of
 * `Item` rows. What this is for is a set of records the reader is editing one at
 * a time, where each record needs a stable identity that the caller's type does
 * not carry. A line item, a recipient, a scheduled window: the domain object is
 * what the caller's store already holds, and asking for a `key` field on it means
 * either a new field on a type the caller does not own or a parallel array the
 * caller has to keep in step with a second time. So the Component mints the
 * identity, keyed to the row object's own identity, and the caller never sees it.
 *
 * **The generated key follows the object, and that is what makes a middle removal
 * survivable.** The key is held in a `WeakMap` against the row object itself, so
 * a row that stays where it is keeps its key, its element, its control values and
 * its caret, however many rows are taken out above it. A key derived from the
 * index would reuse one element for a different record, which is invisible in a
 * controlled field and destructive in an uncontrolled one. The honest cost is on
 * the other side of the same decision: the map is keyed by identity, so the row
 * objects have to be the same objects across renders, and a caller who rebuilds
 * them on every render pays a remount on every keystroke. The prop says so where
 * a caller will read it.
 *
 * **The generated id follows the row and the ordinal follows the position, and a
 * removal has to move one without moving the other.** This is the accessibility
 * argument for the whole Component, so it is worth being exact. A field label's
 * `for` resolves to a control's `id`; if that `id` carried the position, removing
 * the second of three rows would renumber the third row's control, and every
 * label pointing at the old id would then name the wrong control, silently, on a
 * form that still looks correct. So `fieldId` is derived from the row's key and
 * survives everything that happens around it. The number the reader reads and the
 * name the screen reader announces are the opposite: they are the position, they
 * are recomputed from the index on every render, and the group around each row is
 * named by that same visible label through `aria-labelledby` rather than by a
 * second string. One string, two jobs, so the two can never disagree, and a
 * removal in the middle renumbers the rows below it instead of leaving a hole
 * where a number used to be.
 *
 * **Adding moves the reader into the new row, and it moves them into the first
 * cell rather than onto the row.** A row that receives focus and nothing else is
 * a reader who is told "stop 4" and then has to Tab to find out what is in it,
 * which is the same dead end as focus landing on `body`: the work of finding the
 * first control is pushed back onto the person who just asked for the row. So the
 * Component looks for the row's first focusable cell and puts the reader in it.
 * When there is none, because the caller's row is a read-only summary or a row of
 * custom controls, the focus lands on the row itself, which carries
 * `tabindex="-1"` and the row's own name so the reader at least hears where they
 * are. The cost of that fallback is stated rather than hidden: a container
 * focused by script draws its ring only when the browser believes the reader is
 * navigating by keyboard, which is the same rule every programmatically focused
 * container follows, and a caller who needs a guaranteed visible landing point
 * gives the row a real control first.
 *
 * **Removing moves the reader to a neighbour, because the button they pressed is
 * about to stop existing.** Same argument as the field, and the destination is
 * the same one: the row that moved up into the removed row's place, or the row
 * above it when the removed row was last, and the add control when the set is now
 * empty. A set whose last row is removed leaves one operable thing in the
 * Component, and it is the one the reader will press next.
 *
 * **The Component owns the row's frame and the caller owns the row's cells, which
 * is the same division `Item` draws one level up.** The position label, the
 * remove control and the region semantics are Prism's, because they are the parts
 * that have to stay consistent across every set in every consumer and they are
 * the parts a caller gets wrong. The controls are the caller's, because what a
 * row contains is a fact about the caller's record. `Button` draws the add
 * affordance rather than this Component re-deriving a control's metrics, and the
 * focus targets are the Component's own `data-slot` values read back through one
 * root ref, because a ref per row would be a second bookkeeping list to reconcile
 * against the caller's array on every commit.
 *
 * **It draws no empty state, and the omission is a decision.** A repeatable set
 * with no rows is the ordinary first state of every form that has one, and a
 * sentence about it is a claim about the caller's form that Prism cannot make. A
 * bordered box with a heading above it and nothing in it reads as a rendering
 * failure, so with no rows the Component draws no frame at all, and the add
 * affordance is the only thing on the page.
 *
 * **It is a client Component**, because both focus moves happen after the reader
 * acts and neither can be known at a server render, and because every one of its
 * value props is a function the caller hands it, which is a client-to-client
 * boundary wherever it is written. What that costs is the price of every client
 * field: a server Component may render the set once with the rows already in
 * place, and what it may not do is offer the add and remove affordances with
 * focus that behaves.
 *
 * **The row type is not a type parameter of this function, and the reason is a
 * gate rather than a preference, so it is worth stating exactly.** A Component
 * declared as `function RepeatableRows<TRow>(...)` is invisible to
 * `check-item-docs.mjs`, which finds an Item's declaration by matching a function
 * name followed by an open parenthesis; a generic's angle bracket sits between the
 * two, so the gate reports the module as declaring no Item at all and the build
 * fails. The whole Component layer of this package is therefore written without
 * generics, and this Component pays for it in exactly one place: the props
 * interface is generic, and the exported function instantiates it without a row
 * type. The cost is that a caller's render prop receives its row untyped, so a
 * caller who wants the type either annotates the parameter in the prop, which is
 * one word, or writes their own wrapper over `RepeatableRowsProps<TheirRow>`,
 * which is one line. The benefit is that the Item stays a documented Item with an
 * interface the corpus can read, and that is worth more than inference on a
 * callback whose row the caller has just handed the Component themselves.
 */
function RepeatableRows({
  rows,
  onAdd,
  addLabel,
  onRemove,
  removeLabel,
  rowLabel,
  children,
  label,
  className,
}: RepeatableRowsProps<any>) {
  const generated = useId()
  const labelId = `${generated}-label`
  const rootRef = useRef<HTMLDivElement>(null)
  // One generated key per row object, held against the object rather than
  // against the position. A `WeakMap` rather than a counter keyed by index is the
  // whole difference between "the third row is still the third row" and "the
  // third slot is still the third slot", and the second one silently moves a
  // caller's control values when a row above it is removed.
  const keys = useRef(new WeakMap<object, string>())
  const minted = useRef(0)
  // The row to put the reader in after the caller's value settles: a position, or
  // `'add'` for the row the caller has been asked to append. Armed before the
  // callback runs, because the row that is going away cannot be focused and the
  // row that replaces it does not exist yet.
  const pending = useRef<number | 'add' | null>(null)
  const seen = useRef(rows.length)

  useEffect(() => {
    const target = pending.current
    const count = rows.length

    if (target === null) {
      seen.current = count
      return
    }

    // An add that the caller has not acted on yet stays armed. The alternative is
    // to focus the row that is currently last, which is the worst outcome
    // available: the reader is typing into a record they did not ask for.
    if (target === 'add' && count <= seen.current) return

    pending.current = null
    seen.current = count

    const root = rootRef.current
    if (root === null) return

    if (target === 'add') {
      const row = root.querySelectorAll<HTMLElement>(ROW_SLOT).item(count - 1)
      if (row === null) return
      const cell = row.querySelector<HTMLElement>(FIRST_FOCUSABLE)
      ;(cell ?? row).focus()
      return
    }

    // A removal: the row that moved up into the removed row's place, or the one
    // above it when the removed row was the last. An empty set has no row to land
    // on and the add control is the only operable thing left in the Component.
    if (count === 0) {
      root.querySelector<HTMLElement>(ADD_SLOT)?.focus()
      return
    }
    const buttons = root.querySelectorAll<HTMLElement>(REMOVE_SLOT)
    const button = buttons.item(Math.min(target, buttons.length - 1))
    if (button === null) root.querySelector<HTMLElement>(ADD_SLOT)?.focus()
    else button.focus()
  })

  const keyFor = (row: object): string => {
    const known = keys.current.get(row)
    if (known !== undefined) return known
    minted.current += 1
    const made = `row-${minted.current}`
    keys.current.set(row, made)
    return made
  }

  const removeAt = (index: number) => {
    const row = rows[index]
    if (row === undefined) return
    pending.current = index
    onRemove(row)
  }

  return (
    <div
      ref={rootRef}
      data-slot="repeatable-rows"
      role="group"
      aria-labelledby={label === undefined ? undefined : labelId}
      className={cn('flex w-full flex-col gap-2', className)}
    >
      {label === undefined ? null : (
        <span
          id={labelId}
          data-slot="repeatable-rows-label"
          className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
        >
          {label}
        </span>
      )}

      {/*
       * An `ol` rather than a `ul`, and the list is always drawn even when it is
       * empty. The position is already in every row's own label, so the ordinal
       * information here would be a second copy read out twice; what the `ol` buys
       * is the set being a set to a screen reader, which is the difference between
       * "group, stop 2" arriving with a count behind it and arriving alone. The
       * region is named once, on the wrapper, by the element the reader can see,
       * so the name a screen reader announces and the name a sighted reader reads
       * are the same text by construction.
       */}
      <ol data-slot="repeatable-rows-list" className="flex w-full flex-col gap-2">
        {rows.map((row, index) => {
          const key = keyFor(row)
          const fieldId = `${generated}-field-${key}`

          return (
            <li
              key={key}
              data-slot="repeatable-rows-item"
              className="border-border bg-card flex items-end gap-2 rounded-md border px-3 py-2"
            >
              {/*
               * The region, and the fallback focus target. `tabindex="-1"` is what
               * makes the row focusable by script without adding a stop to the tab
               * sequence: a row that is a tab stop would put the reader's cursor
               * on a group rather than in a cell, and a reader who tabs into a row
               * and presses Enter has nothing to press. The ring is drawn at full
               * strength for the reason every ring in this package is.
               */}
              <div
                data-slot="repeatable-rows-row"
                role="group"
                tabIndex={-1}
                aria-labelledby={`${generated}-label-${key}`}
                className={cn(
                  'flex min-w-0 flex-1 flex-wrap items-end gap-2 rounded-sm outline-none',
                  'focus-visible:ring-ring focus-visible:ring-[3px]',
                )}
              >
                <span
                  id={`${generated}-label-${key}`}
                  data-slot="repeatable-rows-position"
                  className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums"
                >
                  {rowLabel(index)}
                </span>

                {children(row, { index, fieldId })}
              </div>

              <button
                type="button"
                data-slot="repeatable-rows-remove"
                aria-label={removeLabel(index)}
                onClick={() => removeAt(index)}
                className={REMOVE_CONTROL}
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ol>

      <div data-slot="repeatable-rows-actions" className="flex items-center">
        <Button
          data-slot="repeatable-rows-add"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            pending.current = 'add'
            onAdd()
          }}
        >
          <PlusIcon aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
    </div>
  )
}

export { RepeatableRows }
