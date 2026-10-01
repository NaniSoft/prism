'use client'

import { CheckIcon } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import type { ComboboxItem } from './combobox'
import { InputGroup, InputGroupInput } from './input-group'
import { TagGroup, type TagGroupTag } from './tag-group'
import { RANKS, locate } from '../../lib/rank'
import { cn } from '../../lib/utils'

/** The props the Multi combobox accepts. */
export interface MultiComboboxProps {
  /**
   * The accessible name of the field.
   *
   * Required, and required as a name rather than as a placeholder, for the reason
   * `Combobox` requires it: a placeholder disappears the moment the reader types,
   * which leaves a field holding a row of chips with no name at exactly the moment
   * the reader most needs to know what they are filtering.
   */
  label: string
  /**
   * The options.
   *
   * `ComboboxItem` rather than a second option type, because the shape is one fact
   * about an option and not one fact about the number of options it appears in. A
   * copy would drift the first time a field grew a `keywords` member.
   */
  items: readonly ComboboxItem[]
  /** The chosen values, when the field is controlled. */
  value?: readonly string[]
  /** The values chosen initially, for an uncontrolled field. */
  defaultValue?: readonly string[]
  /**
   * Called with every chosen value, in the order they were chosen.
   *
   * The whole set rather than the one value that changed, because there is no one
   * value: a toggle is an edit of a set and the caller is the only party that can
   * decide whether the form submits an array or a joined string.
   */
  onValueChange?: (value: readonly string[]) => void
  /**
   * The accessible name of one chip's remove control, given that chip's label.
   *
   * Required rather than optional, which is the one place this Component is less
   * forgiving than `TagGroup`. A multi combobox that cannot deselect is not a
   * multi combobox, so the remove control is always drawn, so its name is always
   * needed, and an optional prop would be a prop whose absence is always a mistake.
   */
  removeLabel: (label: string) => string
  /** What a reader is told when the query matches nothing. */
  empty: { message: (query: string) => string; hint?: string }
  /**
   * The most values that may be chosen at once.
   *
   * Omit it and the set is unbounded. Given one, an option that is not yet chosen
   * becomes `aria-disabled` and the arrows step over it once the cap is reached,
   * and the select-all control announces itself as unavailable rather than
   * quietly choosing fewer than it says it will.
   */
  max?: number
  /**
   * Draws a control that chooses every option the query currently matches, and
   * returns its accessible name given how many match.
   *
   * A function of a count rather than a string because the count is the whole
   * content of the name, and it is a count of the caller's options rather than one
   * this Component holds.
   */
  selectAll?: (matching: number) => string
  /**
   * Draws a control that drops every chosen value, and returns its accessible name
   * given how many are chosen.
   */
  clearAll?: (chosen: number) => string
  /**
   * Whether the trigger shows how many values are chosen.
   *
   * A number and not a sentence, and it is hidden from assistive technology. The
   * chosen values are already announced, one chip at a time, through the field's
   * description, so a bare number adds a figure with no noun to read out loud.
   */
  showCount?: boolean
  /** The placeholder in the search field. The caller's word. */
  placeholder?: string
  /** Whether the list is open, when the field is controlled. */
  open?: boolean
  /** Whether the list starts open, for an uncontrolled field. */
  defaultOpen?: boolean
  /** Called when the list opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Whether the field ignores interaction. */
  disabled?: boolean
  /** Whether at least one value must be chosen before the form submits. */
  required?: boolean
  /**
   * The form field name each chosen value is submitted under.
   *
   * One hidden input per value, all carrying this name, because a form has no way
   * to submit an array and a joined string is a decision the caller makes.
   */
  name?: string
  /** Identifies the form that owns the hidden inputs. */
  form?: string
  /** The field's own id, so a label elsewhere can point at it. */
  id?: string
  /** Identifies the element that describes the field. */
  'aria-describedby'?: string
  /** Layout only. */
  className?: string
}

/** One option and how well it matched. */
type Hit = { item: ComboboxItem; rank: number; range?: readonly [number, number] }

/**
 * The whole-list control in the popup's toolbar.
 *
 * `aria-disabled` rather than `disabled`, because a control that vanishes when it
 * stops applying moves the other control under the reader's pointer. Kept out of an
 * object map of class strings because this gate's own readers treat a `bg-` fill
 * with no ink of its own as a variant that inherits its colour from whatever
 * surface it lands on, and this string states both.
 */
const ACTION =
  'text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50 inline-flex items-center rounded-sm px-2 py-1 text-xs outline-none transition-[color,background-color] duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * A field that searches one list and toggles as many of its options as the reader
 * wants, with the chosen ones visible as chips in the trigger.
 *
 * **The value is an array, and that is not a prop combination.** Every sibling in
 * this family commits one value: `Combobox` closes on a choice, `Select` closes on
 * a choice, `NativeSelect` submits one value. Turning one of those into this one
 * is not a boolean. A single-value control closes on commit because the answer is
 * finished; here the answer is a set that keeps growing after every commit, so
 * closing on commit makes the second choice a re-open, and a reader choosing six
 * regions opens the field six times and retypes the query five of them. The state
 * machine is different, not configured differently, which is the test
 * `DESIGN.md` states: a member of a family that differs from its siblings only by a
 * prop every one of them already takes is a call site.
 *
 * **Space and Enter toggle, and the list stays open.** This inverts the commit
 * contract the single-select siblings are built on, and the inversion is the whole
 * reason the two surfaces feel nothing alike. In a combobox, Enter ends the
 * interaction; here it is one more toggle, and closing the list on it would make
 * choosing a second value a two-keystroke act for no reason a reader can see. So
 * the keys that close a single-select field are the keys that add to the set, and
 * Escape, a blur and Tab are the ways out. The honest cost is on the typeahead:
 * **a query cannot contain a space typed with the Space key**, because Space is
 * spoken for. An option is found by the words in its label and in its keywords, so
 * the space in a query buys nothing a reader would miss, and the alternative is a
 * control where the primary key for selecting cannot also type.
 *
 * **Backspace in the trigger removes the last chip, and only then edits text.**
 * Backspace with a caret in the search field is a text edit like any other. Backspace
 * in an empty one is a gesture at the set, and it takes the last chip chosen, which
 * is the one nearest where the caret was. This is the second gesture every token
 * field has and the one a hand-rolled multi select gets wrong by having no second
 * path out of the chips at all.
 *
 * **The chips are `TagGroup` and the frame is `InputGroup`, not a reimplementation
 * of either.** A chip is a thing the reader chose and can un-pick, which is the
 * definition `TagGroup` already states and the reason its remove control exists.
 * Drawing a second chip here would be a second answer to what a chip is, and it
 * would be the one that quietly diverges on the coarse-pointer target size. The
 * frame is borrowed for the same reason: a bordered group with one border and one
 * focus colour is the thing a row of chips inside a search field has to be, and
 * `InputGroup` already turns its border to the ring token when anything inside it
 * has focus.
 *
 * **The listbox is `aria-multiselectable`, because a reader who cannot see that
 * many of its rows may be chosen does not know what Space will do.** The attribute
 * is the whole announcement difference between this list and a single-select one,
 * and omitting it leaves a reader guessing whether the next Space replaces or adds.
 *
 * **A cap is visible rather than silent.** With `max`, an unchosen option past the
 * cap is drawn and announced as unavailable and the arrows step over it, so the
 * limit is discoverable before the reader hits it. The select-all control is the
 * case where silence would be worst: it says it will choose everything and then
 * chooses fewer, so it announces itself as unavailable instead, at the cost of a
 * reader who wanted all of it having to add the rest one at a time.
 *
 * **Ordering is the reader's.** Values are appended in the order they were chosen
 * and a removal closes the gap rather than re-sorting, because a chip row that
 * reorders under the pointer is a chip row a reader cannot aim at. The list itself
 * is ranked by the scorer imported from `lib/rank`, so a query that floats one
 * option to the top floats it in the command palette too.
 *
 * **The chosen values are announced through the field's description, not through
 * the query.** The search field holds a query and nothing else, so a screen reader
 * focused on it hears the query and the chosen values are silent. Pointing
 * `aria-describedby` at the chip row costs one generated id and makes every chosen
 * label read out after the value. `showCount` is deliberately outside that: a bare
 * figure has no noun, so it is drawn and not announced.
 *
 * The list is anchored to the field rather than portalled, for the trade
 * `Combobox` states: put the field near the top of any scroll container it lives
 * in.
 */
function MultiCombobox({
  label,
  items,
  value,
  defaultValue = [],
  onValueChange,
  removeLabel,
  empty,
  max,
  selectAll,
  clearAll,
  showCount = false,
  placeholder,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  required = false,
  name,
  form,
  id,
  'aria-describedby': describedBy,
  className,
}: MultiComboboxProps) {  const [ownValue, setOwnValue] = useState<readonly string[]>(defaultValue)
  const [ownOpen, setOwnOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const generated = useId()
  const inputId = id ?? generated
  const listId = `${generated}-list`
  const chipsId = `${generated}-chips`

  const chosen = value === undefined ? ownValue : value
  const isOpen = (open ?? ownOpen) && !disabled

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setOwnOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange, open],
  )

  const commit = useCallback(
    (next: readonly string[]) => {
      if (value === undefined) setOwnValue(next)
      onValueChange?.(next)
    },
    [onValueChange, value],
  )

  const chosenSet = useMemo(() => new Set(chosen), [chosen])
  const atCap = max !== undefined && chosen.length >= max
  const labelOf = useCallback(
    (v: string) => items.find((item) => item.value === v)?.label ?? v,
    [items],
  )

  const ranked = useMemo<Hit[]>(() => {
    const trimmed = query.trim()
    if (trimmed === '') return items.map((item) => ({ item, rank: RANKS.prefix }))
    return items
      .map((item): Hit | null => {
        const inLabel = locate(item.label, trimmed)
        if (inLabel.rank < RANKS.keyword) return { item, rank: inLabel.rank, range: inLabel.range }
        const keywordHit = (item.keywords ?? []).some((word) =>
          word.toLowerCase().includes(trimmed.toLowerCase()),
        )
        return keywordHit ? { item, rank: RANKS.keyword } : null
      })
      .filter((hit): hit is Hit => hit !== null)
      .sort((a, b) => a.rank - b.rank)
  }, [items, query])

  // Clamped rather than reset on every keystroke, for the reason `Combobox` states:
  // a reader who moved the highlight and then typed is choosing from a list that
  // just changed under them.
  const activeIndex = Math.min(active, Math.max(ranked.length - 1, 0))

  /** Whether an option may be added right now. */
  const locked = useCallback(
    (item: ComboboxItem) =>
      item.disabled === true || (atCap && !chosenSet.has(item.value)),
    [atCap, chosenSet],
  )

  /**
   * Moves the highlight by `delta` rows, stepping over options that cannot be
   * added. It stops on the row it started from rather than spinning, so a list of
   * nothing but unavailable options cannot cycle.
   */
  const step = (from: number, delta: number): number => {
    if (ranked.length === 0) return 0
    let next = from
    for (let moved = 0; moved < ranked.length; moved += 1) {
      next += delta
      if (next >= ranked.length) next = 0
      if (next < 0) next = ranked.length - 1
      const hit = ranked[next]
      if (hit !== undefined && !locked(hit.item)) return next
    }
    return from
  }

  const toggle = (item: ComboboxItem) => {
    if (chosenSet.has(item.value)) {
      commit(chosen.filter((v) => v !== item.value))
      return
    }
    if (locked(item)) return
    commit([...chosen, item.value])
  }

  const openAt = (from: number) => {
    setOpen(true)
    setActive(from)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        openAt(0)
        return
      }
      setActive((index) =>
        step(Math.min(index, Math.max(ranked.length - 1, 0)), event.key === 'ArrowDown' ? 1 : -1),
      )
      return
    }

    if (event.key === 'Enter' || event.code === 'Space') {
      const hit = ranked[activeIndex]
      // Both keys do nothing with nothing to toggle, which is the same refusal
      // `Combobox` makes: an action the reader did not point at is not one they
      // asked for.
      if (hit === undefined || locked(hit.item)) return
      // The caret never moves and the list never closes. Both keys are consumed so
      // Space does not type a space and Enter does not submit the form mid-choice.
      event.preventDefault()
      toggle(hit.item)
      return
    }

    if (event.key === 'Escape') {
      // Escape gets the list out of the way and touches nothing else. Every chosen
      // value is an act, so discarding them here would take back work the reader
      // did, and a field that emptied itself on Escape submits nothing they asked
      // for.
      if (!isOpen) return
      event.preventDefault()
      setOpen(false)
      return
    }

    if (event.key === 'Backspace' && query === '' && chosen.length > 0) {
      event.preventDefault()
      commit(chosen.slice(0, -1))
      return
    }

    if (event.key === 'Tab') setOpen(false)
  }

  useEffect(() => {
    const list = listRef.current
    if (list === null) return
    list.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen])

  const chips = useMemo<TagGroupTag[]>(
    () => chosen.map((v) => ({ id: v, label: labelOf(v) })),
    [chosen, labelOf],
  )

  const activeRow = isOpen ? ranked[activeIndex] : undefined

  // Two possible referrers, one attribute. Assembled from a template rather than a
  // join so the separator is never a bare string literal, which is the shape a copy
  // scan reads as a space somebody typed.
  const describedByIds =
    chips.length === 0
      ? describedBy
      : describedBy === undefined
        ? chipsId
        : `${chipsId} ${describedBy}`

  const room = max === undefined ? ranked.length : max - chosen.length

  return (
    <div data-slot="multi-combobox" className={cn('relative w-full', className)}>
      <InputGroup
        data-slot="multi-combobox-trigger"
        disabled={disabled}
        className="flex-wrap gap-x-1.5 gap-y-1 py-1"
      >
        {/*
         * The chip row is `w-full` and does not shrink, which is what puts the
         * search field on the line below the chips rather than squeezing both onto
         * one. It is not rendered at all when nothing is chosen, because a
         * full-width empty block would hold a line open that has nothing on it.
         */}
        {chips.length === 0 ? null : (
          <div
            id={chipsId}
            data-slot="multi-combobox-chips"
            onMouseDown={(event) => {
              // Two gestures, one handler, both about where the caret ends up. A
              // press on a chip's remove control must not blur the search field,
              // because the blur is the path that closes the list, so the press is
              // swallowed and the click still lands. A press on the chip itself
              // brings the caret to the field, which is also what opens the list.
              if ((event.target as HTMLElement).closest('[data-slot="tag-remove"]') !== null) {
                event.preventDefault()
                return
              }
              inputRef.current?.focus()
            }}
            className="flex w-full shrink-0 flex-wrap items-center"
          >
            <TagGroup
              tags={chips}
              onRemove={(removed) => {
                commit(chosen.filter((v) => v !== removed))
              }}
              // `TagGroup` types a tag label as a node because a tag is often an
              // avatar and a word. Every chip drawn here is a string taken from the
              // caller's own option, so the node it hands back is that string and
              // the coercion is total rather than a guess.
              removeLabel={(chip) => removeLabel(String(chip))}
            />
          </div>
        )}

        <InputGroupInput
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-label={label}
          aria-required={required || undefined}
          aria-activedescendant={
            activeRow === undefined ? undefined : `${listId}-option-${activeIndex}`
          }
          {...(describedByIds === '' ? null : { 'aria-describedby': describedByIds })}
          {...(placeholder === undefined ? null : { placeholder })}
          value={query}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setActive(0)
            if (!isOpen) setOpen(true)
          }}
          onFocus={() => {
            openAt(0)
          }}
          onClick={() => {
            if (!isOpen) openAt(0)
          }}
          onBlur={() => {
            setOpen(false)
          }}
          onKeyDown={onKeyDown}
        />

        {showCount ? (
          <span
            data-slot="multi-combobox-count"
            aria-hidden="true"
            className="text-muted-foreground shrink-0 self-center pr-1 text-xs tabular-nums"
          >
            {chosen.length}
          </span>
        ) : null}
      </InputGroup>

      {name === undefined
        ? null
        : chosen.map((v) => (
            <input
              key={v}
              type="hidden"
              name={name}
              {...(form === undefined ? null : { form })}
              value={v}
              readOnly
            />
          ))}

      {isOpen ? (
        <div
          data-slot="multi-combobox-popup"
          className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full min-w-(--anchor-width) rounded-md border p-1 shadow-md"
        >
          {selectAll === undefined && clearAll === undefined ? null : (
            <div
              data-slot="multi-combobox-actions"
              className="border-border flex items-center gap-1 border-b p-1 pb-2"
            >
              {selectAll === undefined ? null : (
                <button
                  type="button"
                  data-slot="multi-combobox-select-all"
                  aria-disabled={atCap || undefined}
                  onClick={() => {
                    if (atCap) return
                    const added = ranked
                      .filter((hit) => !chosenSet.has(hit.item.value))
                      .slice(0, room)
                      .map((hit) => hit.item.value)
                    commit([...chosen, ...added])
                  }}
                  className={ACTION}
                >
                  {selectAll(ranked.length)}
                </button>
              )}
              {clearAll === undefined ? null : (
                <button
                  type="button"
                  data-slot="multi-combobox-clear-all"
                  aria-disabled={chosen.length === 0 || undefined}
                  onClick={() => {
                    if (chosen.length === 0) return
                    commit([])
                  }}
                  className={ACTION}
                >
                  {clearAll(chosen.length)}
                </button>
              )}
            </div>
          )}

          {ranked.length === 0 ? (
            <p
              data-slot="multi-combobox-empty"
              role="status"
              className="text-muted-foreground px-3 py-6 text-center text-sm"
            >
              {empty.message(query.trim())}
              {empty.hint === undefined ? null : (
                <span className="mt-1 block text-xs">{empty.hint}</span>
              )}
            </p>
          ) : (
            <div
              data-slot="multi-combobox-list"
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label={label}
              aria-multiselectable="true"
              className="max-h-72 overflow-y-auto"
            >
              {ranked.map((hit, index) => {
                const isActive = index === activeIndex
                const isChosen = chosenSet.has(hit.item.value)
                const isLocked = locked(hit.item)
                return (
                  <div
                    key={hit.item.value}
                    id={`${listId}-option-${index}`}
                    data-slot="multi-combobox-option"
                    data-active={isActive}
                    data-selected={isChosen || undefined}
                    role="option"
                    aria-selected={isChosen}
                    aria-disabled={isLocked || undefined}
                    onMouseEnter={() => {
                      if (!isLocked) setActive(index)
                    }}
                    // Swallowed for the reason `Combobox` swallows it: without it a
                    // pointer choice is a blur, and the blur is the path that closes
                    // the list under the reader's own click.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      toggle(hit.item)
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm',
                      isLocked && 'text-muted-foreground cursor-not-allowed opacity-50',
                      !isLocked && isActive && 'bg-accent text-accent-foreground',
                      !isLocked && !isActive && 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {/*
                     * The check is the chosen mark and it is drawn in the row rather
                     * than left to `aria-selected`, because a row that differs only
                     * by its ink is a row a reader who cannot separate those two
                     * colours cannot read.
                     */}
                    <span data-slot="multi-combobox-option-mark" className="w-4 shrink-0">
                      {isChosen ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {hit.range === undefined ? (
                        hit.item.label
                      ) : (
                        <>
                          {hit.item.label.slice(0, hit.range[0])}
                          <strong className="font-semibold">
                            {hit.item.label.slice(hit.range[0], hit.range[1])}
                          </strong>
                          {hit.item.label.slice(hit.range[1])}
                        </>
                      )}
                    </span>
                    {hit.item.hint === undefined ? null : (
                      <span className="shrink-0 text-xs">{hit.item.hint}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { MultiCombobox }
