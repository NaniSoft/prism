'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import type { ComboboxItem } from './combobox'
import { FieldError } from './field'
import { Input } from './input'
import { RANKS, locate } from '../../lib/rank'
import { cn } from '../../lib/utils'

/** The props the Creatable combobox accepts. */
export interface CreatableComboboxProps {
  /**
   * The accessible name of the search field.
   *
   * Required, and it names the search field rather than the whole control, because
   * this control has two fields inside one popover and the reader has to be told
   * which one they are in.
   */
  label: string
  /** The options the reader may choose from. */
  items: readonly ComboboxItem[]
  /** The chosen value, when the field is controlled. */
  value?: string | null
  /** The value chosen initially, for an uncontrolled field. */
  defaultValue?: string | null
  /** Called with the chosen option's value, or `null` when the reader clears it. */
  onValueChange?: (value: string | null) => void
  /**
   * Called with the trimmed draft when the reader commits a value that is not in
   * the list.
   *
   * Required, because a creatable combobox whose create path does nothing is a
   * combobox with an extra field in it. It is the only call a created value makes:
   * `onValueChange` is not fired for it, because whether a newly typed string
   * becomes the selection is the caller's decision and not this Component's. A
   * caller who wants it selected sets `value` from here, and a caller whose records
   * reject the duplicate has already been told about it by their own `validate`.
   */
  onCreate: (draft: string) => void
  /**
   * The accessible name of the control that commits the draft.
   *
   * A string and not a function of the draft, because the draft is data and a
   * control's name is a sentence the caller writes. The draft is attached to the
   * control as its description rather than interpolated into its name, so a
   * caller who localises the sentence gets a localised name and a value they did
   * not have to translate.
   */
  createLabel: string
  /**
   * The accessible name of the create field, the second editable control in the
   * popover.
   *
   * Separate from `createLabel` because the field and the control that reads it are
   * two controls with two jobs, and one name over both is a reader who is told they
   * are somewhere they are not.
   */
  draftLabel: string
  /**
   * Judges the draft, returning the message to show or `null` when it is fine.
   *
   * Optional, and the Component ships no rule of its own: what may be created is the
   * caller's fact about their own data, so Prism holds no length limit, no pattern
   * and no uniqueness check. It must be pure, because it is read on every render of
   * the draft rather than on a keystroke, so the Component never has to guess when
   * the answer changed.
   */
  validate?: (draft: string) => string | null
  /** What a reader is told when the query matches nothing. */
  empty: { message: (query: string) => string; hint?: string }
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
  /** Whether a value must be chosen or created before the form submits. */
  required?: boolean
  /** The form field name. The chosen or created value is submitted under it. */
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

/** One option and how well it matched. */
type Hit = { item: ComboboxItem; rank: number; range?: readonly [number, number] }

/**
 * A text field that filters a list of options and lets the reader commit a value
 * that is not in it, from inside the same popover.
 *
 * **The second editable control is the reason this is not `Combobox` with a prop.**
 * Creating a value needs somewhere to type it, and the honest place for that
 * somewhere is inside the surface the reader is already looking at. Everything
 * downstream of that decision is different from a single-select combobox and none of
 * it is reachable from a boolean:
 *
 *  - **The focus order gains a stop inside the popover.** Tab out of the search
 *    field enters the create field and the list stays open, because closing on Tab
 *    and reopening is the two-acts-for-one-keystroke cost the sibling is built to
 *    avoid. Arrow Up from the create field goes back into the list with the
 *    highlight on the first option, so the path is reversible. Escape in the create
 *    field returns to the search field with the list still open; only Escape in the
 *    search field closes.
 *  - **The create row is not an option, and is kept out of the listbox element.**
 *    `aria-activedescendant` names an element inside the element `aria-controls`
 *    points at, and a screen reader announces the node it lands on as a choice from
 *    that list. A create row carried inside the listbox would therefore be announced
 *    as an option, and it would be counted by the index that names options, so
 *    pressing Enter could commit a row the reader never highlighted. Here the row
 *    is a sibling of the listbox, the highlight index runs over matched options
 *    only, and `aria-activedescendant` is never written with the create row's id.
 *  - **The validation is the create field's own, and it is the caller's rule.** The
 *    message renders as a `FieldError`, so it carries `role="alert"` and is announced
 *    as it appears, and while a message is showing the create control is not drawn
 *    at all. A control that commits an invalid draft and then complains is a control
 *    a reader learns to press anyway.
 *
 * **Typing never discards a choice, and this is the same commitment `Combobox`
 * makes.** The value changes when the reader chooses an option or empties the
 * field, both of which are acts, and a keystroke into the create field is a draft
 * rather than an answer. Closing the list restores the chosen label into the search
 * field, so a reader who typed a near miss and changed their mind gets their answer
 * back rather than a stray string.
 *
 * **The draft is seeded from the query and then runs on its own.** Focusing the
 * create field copies the query into it, because the reader's typed words are what
 * they want to create. After that the two are deliberately not wired together: the
 * list filters on the query and the create control commits the draft, and editing
 * the draft does not narrow the list. Wiring them would mean a half-typed new value
 * filtering the list to nothing on every keystroke, which reads as a broken search
 * rather than as a new entry being written.
 *
 * **The row disappears when the draft is already an option.** A create row offering
 * to create something that is already in the list is an offer to make a duplicate,
 * so the row is drawn for a draft that is non-empty, has no complaint from
 * `validate`, and matches no option's label or value exactly. A caller who wants the
 * duplicate behaviour anyway is answering a question about their own data, and
 * `onCreate` is where they answer it.
 *
 * **The list is ranked by the scorer imported from `lib/rank`**, so a query that
 * floats one option to the top floats it in the command palette and in
 * `MultiCombobox` too. A second scorer would be a second answer to the same
 * question and the two surfaces would disagree within a release.
 *
 * The list is anchored to the field rather than portalled, for the trade
 * `Combobox` states: put the field near the top of any scroll container it lives
 * in.
 */
function CreatableCombobox({
  label,
  items,
  value,
  defaultValue = null,
  onValueChange,
  onCreate,
  createLabel,
  draftLabel,
  validate,
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
}: CreatableComboboxProps) {
  const [ownValue, setOwnValue] = useState<string | null>(defaultValue)
  const [ownOpen, setOwnOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const draftRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const generated = useId()
  const inputId = id ?? generated
  const listId = `${generated}-list`
  const draftId = `${generated}-draft`
  const draftErrorId = `${generated}-draft-error`

  const chosen = value === undefined ? ownValue : value
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
   * The field text follows the chosen value, and only the chosen value, so this
   * effect does not run while a reader is typing. That is what lets the field hold
   * a query that is not yet an answer.
   */
  const chosenLabel = useMemo(
    () => items.find((item) => item.value === chosen)?.label ?? '',
    [items, chosen],
  )

  useEffect(() => {
    setQuery(chosenLabel)
  }, [chosenLabel])

  // A field showing exactly what is chosen is not narrowing anything, so the
  // narrowing is read off the difference between the two rather than off a flag.
  const narrowing = query !== chosenLabel
  const trimmed = narrowing ? query.trim() : ''

  const ranked = useMemo<Hit[]>(() => {
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
  }, [items, trimmed])

  const activeIndex = Math.min(active, Math.max(ranked.length - 1, 0))

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

  const draftValue = draft.trim()
  // Read on every render rather than on a keystroke, so the answer cannot go stale
  // against a draft the reader has already moved on from.
  const draftError = draftValue === '' ? null : (validate?.(draftValue) ?? null)
  const alreadyListed = items.some(
    (item) =>
      item.label.toLowerCase() === draftValue.toLowerCase() ||
      item.value.toLowerCase() === draftValue.toLowerCase(),
  )
  const canCreate = draftValue !== '' && draftError === null && !alreadyListed

  /** Commits an option and closes, which is the sibling's contract unchanged. */
  const run = (item: ComboboxItem) => {
    if (item.disabled) return
    choose(item.value)
    setDraft('')
    setOpen(false)
  }

  const create = () => {
    if (!canCreate) return
    onCreate(draftValue)
    setDraft('')
    setOpen(false)
  }

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        setOpen(true)
        setActive(0)
        return
      }
      setActive((index) =>
        step(Math.min(index, Math.max(ranked.length - 1, 0)), event.key === 'ArrowDown' ? 1 : -1),
      )
      return
    }

    if (event.key === 'Enter') {
      const hit = ranked[activeIndex]
      // Enter commits the highlighted option and nothing else. It never creates:
      // creating is a separate act made in a separate field, and a key that both
      // commits a choice and writes a new record is a key a reader cannot aim.
      if (hit === undefined || hit.item.disabled) return
      event.preventDefault()
      run(hit.item)
      return
    }

    if (event.key === 'Escape') {
      // Escape abandons the query and keeps the answer. A reader who pressed it to
      // get the list out of the way did not mean to discard what they had chosen.
      if (!isOpen) return
      event.preventDefault()
      setOpen(false)
      setQuery(chosenLabel)
      return
    }

    if (event.key === 'Tab' && !event.shiftKey && canCreate) {
      // The focus move into the create field, and the reason the list stays open.
      // Tab closes a single-select field because the answer is finished; here the
      // answer may not be, and closing would make creating a value two acts.
      event.preventDefault()
      draftRef.current?.focus()
    }
  }

  const onDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (!canCreate) return
      event.preventDefault()
      create()
      searchRef.current?.focus()
      return
    }

    if (event.key === 'Escape') {
      // Escape in the create field abandons the draft and goes back to the search
      // field rather than closing the list, so a reader who mistyped has not thrown
      // away the list they were reading.
      event.preventDefault()
      setDraft('')
      searchRef.current?.focus()
      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // The way back into the list. Reversible is the point: a one-way focus order
      // into a popover is a trap a keyboard reader cannot see.
      event.preventDefault()
      setActive(event.key === 'ArrowUp' ? 0 : Math.max(ranked.length - 1, 0))
      searchRef.current?.focus()
      return
    }

    if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const list = listRef.current
    if (list === null) return
    list.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen])

  const activeRow = isOpen ? ranked[activeIndex] : undefined

  return (
    <div data-slot="creatable-combobox" className={cn('relative w-full', className)}>
      <Input
        ref={searchRef}
        data-slot="creatable-combobox-search"
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
          // is the only way a reader can say "not that one".
          if (next === '') choose(null)
        }}
        onFocus={() => {
          setOpen(true)
          setActive(0)
        }}
        onClick={() => {
          if (!isOpen) setOpen(true)
        }}
        onBlur={(event) => {
          // Only when the caret leaves the whole control. Moving into the create
          // field is inside it, and closing on that would be closing on the focus
          // move the popover exists to support.
          const next = event.relatedTarget
          if (next instanceof Node && event.currentTarget.parentElement?.contains(next)) {
            return
          }
          setOpen(false)
          setQuery(chosenLabel)
        }}
        onKeyDown={onSearchKeyDown}
      />

      {/*
       * The submitted value is a machine value and the field shows its label, so
       * the two cannot live on the same element. A created value has no machine
       * value until the caller's `onCreate` has made one, which is the caller's
       * half of the decision and the reason this input follows the chosen value.
       */}
      {name === undefined ? null : (
        <input type="hidden" name={name} {...(form === undefined ? null : { form })} value={chosen ?? ''} readOnly />
      )}

      {isOpen ? (
        <div
          data-slot="creatable-combobox-popup"
          className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full min-w-(--anchor-width) rounded-md border p-1 shadow-md"
        >
          <div
            data-slot="creatable-combobox-list"
            id={listId}
            ref={listRef}
            role="listbox"
            aria-label={label}
            className="max-h-72 overflow-y-auto"
          >
            {ranked.length === 0 ? (
              <p
                data-slot="creatable-combobox-empty"
                role="status"
                className="text-muted-foreground px-3 py-6 text-center text-sm"
              >
                {empty.message(trimmed)}
                {empty.hint === undefined ? null : (
                  <span className="mt-1 block text-xs">{empty.hint}</span>
                )}
              </p>
            ) : (
              ranked.map((hit, index) => {
                const isActive = index === activeIndex
                return (
                  <div
                    key={hit.item.value}
                    id={`${listId}-option-${index}`}
                    data-slot="creatable-combobox-option"
                    data-active={isActive}
                    role="option"
                    aria-selected={hit.item.value === chosen}
                    aria-disabled={hit.item.disabled || undefined}
                    onMouseEnter={() => {
                      if (!hit.item.disabled) setActive(index)
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      run(hit.item)
                    }}
                    className={cn(
                      'flex cursor-pointer items-baseline justify-between gap-3 rounded-sm px-3 py-2 text-sm',
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
              })
            )}
          </div>

          {/*
           * The create surface is a sibling of the listbox and never a child of it.
           * An element inside a listbox that is not an option is announced as an
           * option, and it would be counted by the index that names options, so the
           * create control here is reachable by focus and by Enter from its own
           * field rather than by the highlight.
           */}
          <div data-slot="creatable-combobox-create" className="border-border flex flex-col gap-2 border-t p-2">
            <Input
              ref={draftRef}
              data-slot="creatable-combobox-draft"
              id={draftId}
              type="text"
              autoComplete="off"
              aria-label={draftLabel}
              aria-invalid={draftError === null ? undefined : true}
              {...(draftError === null ? null : { 'aria-describedby': draftErrorId })}
              value={draft}
              disabled={disabled}
              onFocus={() => {
                // Seeded from the query, because the reader's typed words are what
                // they want to create. The copy is one way: after this the draft is
                // its own value, so editing it does not move the list.
                setDraft(query)
              }}
              onChange={(event) => {
                setDraft(event.target.value)
              }}
              onKeyDown={onDraftKeyDown}
              className="h-8"
            />

            {draftError === null ? null : (
              <div id={draftErrorId}>
                <FieldError>{draftError}</FieldError>
              </div>
            )}

            {canCreate ? (
              <button
                type="button"
                data-slot="creatable-combobox-create-button"
                aria-label={createLabel}
                aria-describedby={draftId}
                onClick={create}
                className={cn(
                  'border-input bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-left text-sm outline-none',
                  'transition-[color,background-color] duration-fast ease-out',
                  'focus-visible:ring-ring focus-visible:ring-[3px]',
                )}
              >
                <span className="min-w-0 truncate">{draftValue}</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { CreatableCombobox }
