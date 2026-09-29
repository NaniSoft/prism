'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { RANKS, locate } from '../../lib/rank'
import { cn } from '../../lib/utils'

/**
 * One option the reader can choose.
 *
 * A single type rather than a union of "an option with a value" and "an option
 * that is disabled", because a disabled option is still an option and still has
 * to be rendered: a reader who cannot see what they cannot choose cannot tell a
 * sold-out flight from a flight that was never offered.
 */
export interface ComboboxItem {
  /** What the form submits. It is a machine value, never a sentence. */
  value: string
  /** The words on the row, and the words the query is matched against. */
  label: string
  /** A short run at the far end of the row, usually a region or a stock count. */
  hint?: string
  /**
   * Words that should also find this option.
   *
   * The same argument the command row makes. An option is findable by what it is
   * for as well as by what it is called, and only the caller knows the other words
   * for it.
   */
  keywords?: readonly string[]
  /** Whether the option is shown but cannot be chosen. */
  disabled?: boolean
}

/** The props the Combobox accepts. */
export interface ComboboxProps {
  /**
   * The accessible name of the field.
   *
   * Required, and required as a name rather than as a placeholder: a placeholder
   * disappears the moment a reader types, which leaves the field with no name at
   * exactly the moment the reader most needs to know what they are filling in.
   */
  label: string
  /** The options. */
  items: readonly ComboboxItem[]
  /**
   * The chosen value, when the field is controlled.
   *
   * Pass `null` for nothing chosen. Omit it for an uncontrolled field, which
   * starts at `defaultValue`.
   */
  value?: string | null
  /** The value chosen initially, for an uncontrolled field. */
  defaultValue?: string | null
  /** Called with the chosen value, or `null` when the reader clears the field. */
  onValueChange?: (value: string | null) => void
  /**
   * What a reader is told when nothing matches.
   *
   * `message` receives the query, so a caller can put it in their own sentence. A
   * field that filtered to nothing and said nothing is the state that reads as a
   * broken control rather than as a search that found nothing.
   */
  empty: { message: (query: string) => string; hint?: string }
  /** The placeholder in the field. The caller's word, and it disappears on typing. */
  placeholder?: string
  /** Whether the list is open, when the field is controlled. */
  open?: boolean
  /** Whether the list starts open, for an uncontrolled field. */
  defaultOpen?: boolean
  /** Called when the list opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Whether the field ignores interaction. */
  disabled?: boolean
  /** Whether a value must be chosen before the form submits. */
  required?: boolean
  /** The form field name. The chosen `value` is submitted under it. */
  name?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** The field's own id, so a label elsewhere can point at it. */
  id?: string
  /** Identifies the element that describes the field. */
  'aria-describedby'?: string
  /** Layout only. */
  className?: string
}

/** A row and how well it matched. */
type Hit = { item: ComboboxItem; rank: number; range?: readonly [number, number] }

/**
 * A text field that filters a list of options and commits one of them.
 *
 * **It ranks, and the ranking is not written here.** `locate` and `RANKS` are
 * imported from the command palette rather than reimplemented, because a combobox
 * that filters without ordering shows every option containing the query in the
 * order the options happened to be fetched, so the one the reader meant sits below
 * one that merely mentions what they typed. That is the defect this Component
 * exists to avoid, and a second scorer would be a second answer to it. The rank
 * table is imported, not copied, so the two surfaces cannot drift apart.
 *
 * **Typing never discards a choice.** The submitted value changes only when the
 * reader chooses an option or empties the field, both of which are acts. Filtering
 * the list under a chosen value is a question about the list, not about the
 * answer, and a combobox that cleared the selection because the reader typed one
 * more character would silently change what the form submits. The field's own
 * text is restored to the chosen label when the list closes, so a reader who typed
 * a query and changed their mind gets their answer back rather than a stray
 * string.
 *
 * **A query is the difference between the text and the choice.** A field showing
 * exactly the chosen label is not narrowing anything, so opening a filled field
 * shows every option with the chosen one selected rather than the one option whose
 * name matches what is already in the box. That is the same fact the previous
 * paragraph describes, read the other way round, and it means "chosen and
 * filtered out" cannot happen: there is no state in which the answer is a value
 * the reader cannot see.
 *
 * **Nothing matching says so in words, and keeps the list open.** The field stays
 * open and explains that the query found nothing, because a combobox that closed
 * itself on a non-match tells the reader their keystroke broke the control. The
 * explanation is a prop, since the sentence is the caller's and the query is put
 * into it.
 *
 * **The field keeps the caret for the whole interaction.** The arrows move a
 * highlight through the list and leave focus where it is, so a reader can keep
 * typing while they choose. Enter commits the highlighted option and nothing else:
 * an empty result with Enter does nothing rather than committing the first row,
 * because committing a value a reader did not point at is the one outcome this
 * Component must never produce.
 *
 * **The arrows wrap, exactly as the palette's do.** One interaction, one
 * behaviour: a reader who learned one of these surfaces has learned both, and a
 * list that stops at its end makes an overshoot cost a second keypress.
 *
 * **A disabled option is shown and skipped.** It is in the list, so a reader can
 * see that it exists, and the arrows step over it, so a reader cannot land on
 * something they cannot choose. Explain why it is unavailable in text beside the
 * field; a greyed row on its own says only that it is not available.
 *
 * The list is anchored to the field rather than portalled, so it scrolls with the
 * page and is clipped by an ancestor with `overflow: hidden`. That is the trade
 * for a list that is always the right width and never flips over the field: put
 * the field near the top of any scroll container it lives in.
 */
function Combobox({
  label,
  items,
  value,
  defaultValue = null,
  onValueChange,
  empty,
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
}: ComboboxProps) {
  const [ownValue, setOwnValue] = useState<string | null>(defaultValue)
  const [ownOpen, setOwnOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const generated = useId()
  const inputId = id ?? generated
  const listId = `${generated}-list`

  const chosen = value === undefined ? ownValue : value

  /** The chosen option, resolved against the option set the caller passed. */
  const chosenItem = useMemo(
    () => items.find((item) => item.value === chosen) ?? null,
    [items, chosen],
  )
  const chosenLabel = chosenItem?.label ?? ''

  const isOpen = (open ?? ownOpen) && !disabled

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setOwnOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange, open],
  )

  const choose = useCallback(
    (next: string | null) => {
      if (value === undefined) setOwnValue(next)
      onValueChange?.(next)
    },
    [onValueChange, value],
  )

  /**
   * The field text follows the chosen value, and only the chosen value. Typing
   * does not change the choice, so this effect does not run while a reader is
   * typing, which is what lets the field hold a query that is not yet an answer.
   */
  useEffect(() => {
    setQuery(chosenLabel)
  }, [chosenLabel])

  // A field showing exactly what is chosen is not narrowing the list. Reading the
  // narrowing off the difference between the two rather than off a flag is what
  // makes "chosen and filtered out" impossible: there is no sequence of keystrokes
  // that produces a query equal to the chosen label and still filters.
  const narrowing = query !== chosenLabel
  const trimmed = narrowing ? query.trim() : ''

  const ranked = useMemo<Hit[]>(() => {
    if (trimmed === '') return items.map((item) => ({ item, rank: RANKS.prefix }))
    return items
      .map((item): Hit | null => {
        const inLabel = locate(item.label, trimmed)
        if (inLabel.rank < RANKS.keyword) return { item, rank: inLabel.rank, range: inLabel.range }
        // Keywords are read only after the label misses, so a keyword can never
        // outrank a name that matched. Same rule, same scorer, same reason.
        const keywordHit = (item.keywords ?? []).some((word) =>
          word.toLowerCase().includes(trimmed.toLowerCase()),
        )
        return keywordHit ? { item, rank: RANKS.keyword } : null
      })
      .filter((hit): hit is Hit => hit !== null)
      .sort((a, b) => a.rank - b.rank)
  }, [items, trimmed])

  // Clamped rather than reset on every keystroke. A reader who has moved the
  // highlight and then types one more character is choosing from a list that just
  // changed under them, and putting the highlight back at the top discards where
  // they were.
  const activeIndex = Math.min(active, Math.max(ranked.length - 1, 0))

  /**
   * Moves the highlight by `delta` rows, stepping over the options that cannot be
   * chosen. It stops on the row it started from if every option in that direction
   * is disabled, so a list of nothing but unavailable options cannot spin.
   */
  const step = (from: number, delta: number): number => {
    if (ranked.length === 0) return 0
    let next = from
    for (let moved = 0; moved < ranked.length; moved += 1) {
      next += delta
      if (next >= ranked.length) next = 0
      if (next < 0) next = ranked.length - 1
      if (!ranked[next]?.item.disabled) return next
    }
    return from
  }

  /** Opens the list with the chosen option under the highlight, or the first one. */
  const openAt = useCallback(
    (from: number) => {
      setOpen(true)
      setActive(from)
    },
    [setOpen],
  )

  const openWithHighlight = () => {
    const at = ranked.findIndex((hit) => hit.item.value === chosen && !hit.item.disabled)
    openAt(at === -1 ? 0 : at)
  }

  /** Puts the chosen label back, for the paths that abandon a query. */
  const restore = () => {
    setQuery(chosenLabel)
    setActive(0)
  }

  const run = (item: ComboboxItem) => {
    if (item.disabled) return
    choose(item.value)
    setOpen(false)
    restore()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        openWithHighlight()
        return
      }
      setActive((index) => step(Math.min(index, Math.max(ranked.length - 1, 0)), event.key === 'ArrowDown' ? 1 : -1))
      return
    }

    if (event.key === 'Enter') {
      const hit = ranked[activeIndex]
      // Enter with nothing selectable highlighted does nothing. Committing the
      // first row because the reader pressed Enter is the one outcome a combobox
      // must never produce.
      if (hit === undefined || hit.item.disabled) return
      event.preventDefault()
      run(hit.item)
      return
    }

    if (event.key === 'Escape') {
      // Escape abandons the query and keeps the answer. A reader who pressed it to
      // get the list out of the way did not mean to discard their choice, and a
      // field that emptied itself here would submit nothing they asked for.
      if (!isOpen) return
      event.preventDefault()
      setOpen(false)
      restore()
      return
    }

    if (event.key === 'Tab') {
      // Tab commits the highlighted option and leaves, rather than dropping the
      // highlight on the floor. A reader tabbing past a field they just narrowed
      // was on their way to submitting it.
      const hit = ranked[activeIndex]
      if (isOpen && hit !== undefined && !hit.item.disabled) choose(hit.item.value)
      setOpen(false)
    }
  }

  /** Keeps the highlighted row in view when the arrows move it. */
  useEffect(() => {
    const list = listRef.current
    if (list === null) return
    list.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen])

  const activeRow = isOpen ? ranked[activeIndex] : undefined

  return (
    <div data-slot="combobox" className={cn('relative w-full', className)}>
      <input
        data-slot="combobox-input"
        id={inputId}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={isOpen && ranked.length > 0}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-label={label}
        aria-required={required || undefined}
        aria-activedescendant={
          activeRow === undefined ? undefined : `${listId}-option-${activeIndex}`
        }
        {...(describedBy === undefined ? null : { 'aria-describedby': describedBy })}
        {...(placeholder === undefined ? null : { placeholder })}
        value={query}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value
          setQuery(next)
          setActive(0)
          if (!isOpen) setOpen(true)
          // Emptying the field is the one edit that changes the answer, because it
          // is the only way a reader can say "not that one". Any other keystroke
          // is a query, and a query is not a submission.
          if (next === '') choose(null)
        }}
        onFocus={() => {
          openWithHighlight()
        }}
        onClick={() => {
          if (!isOpen) openWithHighlight()
        }}
        onBlur={() => {
          setOpen(false)
          restore()
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'border-input bg-background text-foreground placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] duration-fast ease-out outline-none md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />

      {/*
       * The submitted value is the option's value, and the field shows its label,
       * so the two cannot live on the same element. The hidden input is what the
       * form reads; the visible one carries the reader's words.
       */}
      {name === undefined ? null : (
        <input type="hidden" name={name} {...(form === undefined ? null : { form })} value={chosen ?? ''} readOnly />
      )}

      {isOpen ? (
        ranked.length === 0 ? (
          <div
            data-slot="combobox-popup"
            className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full min-w-(--anchor-width) rounded-md border p-1 shadow-md"
          >
            <p
              data-slot="combobox-empty"
              role="status"
              className="text-muted-foreground px-3 py-6 text-center text-sm"
            >
              {empty.message(trimmed)}
              {empty.hint === undefined ? null : (
                <span className="mt-1 block text-xs">{empty.hint}</span>
              )}
            </p>
          </div>
        ) : (
          <div
            data-slot="combobox-popup"
            className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full min-w-(--anchor-width) rounded-md border p-1 shadow-md"
          >
            <div
              data-slot="combobox-list"
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label={label}
              className="max-h-72 overflow-y-auto"
            >
              {ranked.map((hit, index) => {
                const isActive = index === activeIndex
                return (
                  <div
                    key={hit.item.value}
                    id={`${listId}-option-${index}`}
                    data-slot="combobox-option"
                    data-active={isActive}
                    role="option"
                    aria-selected={hit.item.value === chosen}
                    aria-disabled={hit.item.disabled || undefined}
                    onMouseEnter={() => {
                      if (!hit.item.disabled) setActive(index)
                    }}
                    // The mousedown is swallowed so the field does not blur and
                    // restore the query before the click lands. Without it a
                    // pointer choice is a blur, and the blur is the path that puts
                    // the old answer back into the field.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => run(hit.item)}
                    className={cn(
                      'flex cursor-pointer items-baseline justify-between gap-3 rounded-sm px-3 py-2 text-sm outline-none',
                      'focus-visible:ring-ring focus-visible:ring-[3px]',
                      hit.item.disabled && 'text-muted-foreground cursor-not-allowed opacity-50',
                      !hit.item.disabled && isActive && 'bg-accent text-accent-foreground',
                      !hit.item.disabled && !isActive && 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className="min-w-0 truncate">
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
          </div>
        )
      ) : null}
    </div>
  )
}

export { Combobox }
