'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { Dialog, DialogContent, DialogTitle } from './dialog'
import { locate, RANKS, type Rank } from '../../lib/rank'
import { cn } from '../../lib/utils'

/**
 * One thing a reader can do from the palette.
 *
 * `keywords` is what makes the palette good rather than merely present. A command
 * called "Toggle theme" is findable by "theme" and not by "dark" or "colour", and
 * a caller who has to name a command exactly has to already know it exists, which
 * defeats the surface. Keywords are how a command is found by what it does rather
 * than by what it is called, and they are the caller's because only the caller
 * knows the other words for it.
 */
export type CommandItem = {
  /** A stable key. */
  id: string
  /** The words on the row. */
  label: string
  /** A second line, usually the shortcut. The caller's word. */
  hint?: string
  /** Words that should also find this command. */
  keywords?: readonly string[]
  /** What happens when it is chosen. */
  onSelect: () => void
}

/** A named set of commands, kept together in the list. */
export type CommandGroup = {
  id: string
  /** The words on the group heading. */
  label: string
  items: readonly CommandItem[]
}

/** The props the Command palette accepts. */
export interface CommandPaletteProps {
  /** Whether the palette is open. */
  open: boolean
  /** Called when it should open or close. */
  onOpenChange: (open: boolean) => void
  /**
   * The accessible name of the palette.
   *
   * Required, because a palette is announced as a dialog and a reader who opened
   * one needs to know what they opened. The name is the caller's word.
   */
  label: string
  /** The accessible name of the search field. */
  inputLabel: string
  /** The placeholder in the search field. The caller's word. */
  placeholder?: string
  /** The commands, grouped. */
  groups: readonly CommandGroup[]
  /**
   * The commands shown before anything is typed.
   *
   * A palette that opens onto an empty list makes a reader type before they know
   * what is available, which inverts the point of a surface whose whole purpose is
   * to be faster than the menu it replaces. This is where recent and suggested
   * commands go, and it is the caller's data.
   */
  suggest?: { label: string; items: readonly CommandItem[] }
  /**
   * What a reader is told when nothing matches.
   *
   * `message` receives the query, so a caller can put it in their own sentence. An
   * empty result with no words is the one state a palette must never show, because
   * it reads as a broken surface rather than as a search that found nothing.
   */
  empty: { message: (query: string) => string; hint?: string }
  /** Layout only. */
  className?: string
}

/**
 * One row of the result, whatever produced it.
 *
 * A single type rather than two, because an empty query and a typed query both
 * produce rows and a listbox that renders rows cannot hold a union of a row and
 * something that will become a row. A row with no `range` is a row with no match
 * to emphasise, which is exactly what an untyped palette has.
 */
type Hit = { item: CommandItem; rank: number; range?: readonly [number, number] }

/** A group of rows, kept together in the list. */
type HitGroup = { id: string; label: string; hits: Hit[] }

/**
 * A searchable list of commands, over the Dialog this system already has.
 *
 * **It ranks, and that is the difference between this and a filtered menu.** A
 * palette that filters without ordering shows every command containing the query
 * in whatever order the groups happened to be declared, so the command you meant
 * sits below one that merely mentions your query. Ranking by where the match falls
 * puts it first, and the whole premise of a palette is that typing three letters
 * is faster than navigating to it.
 *
 * **It is composed on the Dialog rather than beside it.** Focus trapping, Escape,
 * the portal, the scroll lock and the return of focus to the trigger are five
 * behaviours that are correct in the Dialog and would be five chances to get one
 * wrong here. A palette that rolled its own overlay would be a second answer to
 * all five questions, and the second answer is the one that ships the bug.
 *
 * **The matched run is emphasised by weight, not by a background.** A Mark is the
 * right treatment in a list of results, where the match is the reason the row is
 * there and a full background is the point. In a palette the match is a hint while
 * the row's label is what the reader is reading, and a saturated background on
 * every matched character fights the text it is inside. So the palette uses the
 * quieter of the two, and the two surfaces are not the same surface. See the Mark
 * documentation for the other half of that decision.
 *
 * **The search field keeps focus for the whole interaction.** Arrows move a
 * highlight through the list rather than moving focus into it, so a reader can keep
 * typing while they choose, and the highlighted row carries the state. That is the
 * combobox pattern and it is the reason the arrows do not steal the caret.
 *
 * **A query that matched nothing is a popup that is still open.** The panel stays,
 * it says so in the caller's sentence, and the field announces itself expanded,
 * because a palette that closed itself on a non-match tells the reader their
 * keystroke broke it. The message is a sibling of the listbox rather than a child of
 * it, because a listbox owns `option` and `group` and nothing else, and
 * `aria-controls` points at the palette rather than at the listbox, because the
 * listbox is not on the page in that state and `aria-controls` is required on an
 * expanded combobox. `Combobox`, `MultiCombobox` and `CreatableCombobox` make the
 * same choices, and they make them here rather than each answering the question
 * again.
 */
function CommandPalette({
  open,
  onOpenChange,
  label,
  inputLabel,
  placeholder,
  groups,
  suggest,
  empty,
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // The surface the field controls, which is the palette itself. Separate from the
  // listbox id because the listbox is not rendered at all when nothing matched, and
  // `aria-controls` is a required attribute on an expanded combobox.
  const popupId = `${titleId}-popup`

  const trimmed = query.trim()

  /**
   * The ranked result: groups in their declared order, items within a group by
   * rank. A group whose every item filtered out disappears rather than rendering
   * an empty heading, because a heading over nothing is a divider a reader has to
   * read past.
   */
  const results = useMemo<HitGroup[]>(() => {
    if (trimmed === '') {
      // With nothing typed there is nothing to rank, so every row is a row with no
      // match to emphasise. Suggestions replace the groups rather than joining
      // them, because a palette that opens showing both a suggestion list and the
      // full command list is a palette with two answers to what it is for.
      return suggest
        ? [
            {
              id: '__suggest',
              label: suggest.label,
              hits: suggest.items.map((item) => ({ item, rank: RANKS.prefix })),
            },
          ]
        : groups.map((group) => ({
            id: group.id,
            label: group.label,
            hits: group.items.map((item) => ({ item, rank: RANKS.prefix })),
          }))
    }

    const scored: HitGroup[] = []

    for (const group of groups) {
      const hits = group.items
        .map((item): Hit | null => {
          const inLabel = locate(item.label, trimmed)
          if (inLabel.rank < RANKS.keyword) return { item, rank: inLabel.rank, range: inLabel.range }
          // Keywords are searched only after the label misses, so a keyword can
          // never outrank a label match. A reader who typed the name of a command
          // wants that command, and a synonym is a fallback rather than a rival.
          const keywordHit = (item.keywords ?? []).some((word) =>
            word.toLowerCase().includes(trimmed.toLowerCase()),
          )
          return keywordHit ? { item, rank: RANKS.keyword } : null
        })
        .filter((hit): hit is Hit => hit !== null)
        .sort((a, b) => a.rank - b.rank)

      if (hits.length > 0) scored.push({ id: group.id, label: group.label, hits })
    }

    // The groups are ordered by their best hit, not by where they were declared.
    // Ranking only *within* a group leaves the premise of the surface broken: a
    // command in a later group that matches exactly sits below a command in an
    // earlier group that matches badly, so a reader still scans. Ordering the
    // groups by their strongest member puts the best answer at the top and keeps
    // the headings, which is the whole of what a grouped list is for. The sort is
    // stable, so groups whose best hits tie keep the order they were declared in.
    return scored.sort((a, b) => Math.min(...a.hits.map((hit) => hit.rank)) - Math.min(...b.hits.map((hit) => hit.rank)))
  }, [groups, suggest, trimmed])

  /** The flat order, which is the order the arrows walk. */
  const flat = useMemo(() => results.flatMap((group) => group.hits.map((hit) => hit.item)), [results])

  // The highlight is clamped rather than reset on every keystroke. Resetting to
  // zero is the obvious choice and it is wrong: a reader who arrows down three
  // rows and then types one more character is choosing from a list that just
  // changed under them, and yanking the highlight back to the top discards where
  // they were. Clamping keeps the position when it still exists.
  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0))

  useEffect(() => {
    if (!open) {
      // Reset on close rather than on open, so the palette does not reopen showing
      // the last query typed into it. A surface that remembers its filter between
      // visits is a surface whose state the reader has to reason about.
      setQuery('')
      setActive(0)
    }
  }, [open])

  const run = useCallback(
    (item: CommandItem) => {
      onOpenChange(false)
      item.onSelect()
    },
    [onOpenChange],
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (flat.length === 0) return
      event.preventDefault()
      // Wraps, and that is the one place a list is allowed to: a list that stops
      // at the end makes a reader who overshot press Up to come back, and a
      // palette is a transient surface where overshoot is common.
      setActive((index) => {
        const next =
          event.key === 'ArrowDown' ? index + 1 : index - 1
        return (next + flat.length) % flat.length
      })
      return
    }

    if (event.key === 'Enter') {
      const item = flat[activeIndex]
      // Enter with nothing highlighted does nothing rather than running the first
      // item, because running a command a reader did not point at is the one
      // outcome a palette must never produce.
      if (item === undefined) return
      event.preventDefault()
      run(item)
    }
  }

  /** Keeps the highlighted row in view when the arrows move it. */
  useEffect(() => {
    const list = listRef.current
    if (list === null) return
    const row = list.querySelector<HTMLElement>('[data-active="true"]')
    row?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // The palette is a wide, top-anchored surface rather than a centred card,
        // and it carries no visible heading: the search field is what a reader
        // looks at, and a heading above it would be a label for the surface the
        // reader is already in. The DialogTitle is still rendered and still names
        // the dialog for assistive technology, which is the whole reason it
        // exists separately from anything visible.
        //
        // The id is the field's `aria-controls`. It is on the surface rather than on
        // the listbox because the listbox is not rendered when nothing matched, and
        // the field is expanded whenever the palette is open.
        id={popupId}
        side="top"
        showCloseButton={false}
        className={cn('max-w-overlay-palette gap-0 p-0', className)}
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>

        <div className="border-border flex items-center border-b px-3">
          <input
            data-slot="command-palette-input"
            type="text"
            role="combobox"
            /*
             * `aria-expanded` is `open`, and the alternative it replaced was
             * `flat.length > 0`. That expression answered "are there results" and
             * the attribute asks "is the popup displayed", and the two came apart
             * in exactly the state this Component exists to render: a query that
             * matched nothing, which draws a bordered panel saying so. The field
             * announced collapsed while a visible popup stood under it, so a reader
             * pressing Down to reach the answer was told there was nothing to
             * reach. `Combobox` states the same refusal in prose: a surface that
             * closes itself on a non-match tells the reader their keystroke broke
             * it.
             *
             * `aria-controls` points at the surface the field opens, which is the
             * palette, rather than at the listbox inside it. The listbox is not
             * rendered when nothing matched, and `aria-controls` is a required
             * attribute on an expanded combobox, so a reference to it was a reference
             * to an id nothing carried in exactly the state that says nothing
             * matched.
             */
            aria-expanded={open}
            aria-controls={open ? popupId : undefined}
            aria-activedescendant={
              flat[activeIndex] === undefined ? undefined : `${titleId}-item-${flat[activeIndex]?.id}`
            }
            aria-label={inputLabel}
            {...(placeholder === undefined ? null : { placeholder })}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            // The field is focused when the palette opens, so a reader can type
            // immediately. Nothing else in the surface is focusable, which is what
            // makes this a combobox rather than a list of buttons.
            autoFocus
            // The ring is at full strength, and it is drawn at all because this is
            // the control focus lands in and `outline-none` is what removed the
            // browser's indicator from it. A field with no visible focus is a field
            // a keyboard reader cannot say they are inside. The ring and not the
            // border, as `Command` draws it: this field has no border to colour.
            //
            // `text-base` then `md:text-sm`, which is the pair `Input`, `Textarea`,
            // `Combobox`, `Form` and `NumberField` all carry and which this field
            // was the one exception to. The reason is iOS Safari and not a visual
            // one: it zooms the viewport on a focused input under 16 pixels and does
            // not zoom back out, so a palette opened on a phone was a page the reader
            // could not get out of.
            className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-base outline-none focus-visible:ring-ring focus-visible:ring-[3px] md:text-sm"
          />
        </div>

        {/*
         * The listbox and the empty message are two branches rather than one
         * element with two children, and the reason is what a listbox owns: an
         * element inside a `listbox` that is not an `option` or a `group` is
         * announced as an option, so a `<p>` in the empty branch was a phantom row
         * the index counted and no reader could choose. So the empty state sits
         * beside the listbox rather than inside it, which is the arrangement
         * `Combobox`, `MultiCombobox` and `CreatableCombobox` already share, and
         * the two branches carry the same box so the panel does not change size or
         * position when the last result is filtered out.
         */}
        {results.length === 0 ? (
          <div
            data-slot="command-palette-empty-state"
            className="max-h-80 overflow-y-auto p-1"
          >
            <p
              data-slot="command-palette-empty"
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
            data-slot="command-palette-list"
            id={`${titleId}-list`}
            ref={listRef}
            role="listbox"
            aria-label={label}
            className="max-h-80 overflow-y-auto p-1"
          >
            {results.map((group) => (
              /*
               * `role="group"` and not a bare `<div>`. A listbox owns `option` and
               * `group` and nothing else, so a wrapper with no role puts its options
               * straight into the listbox and the heading beside them becomes an
               * unowned loose text node: a reader hears the heading as another row
               * and has no way to ask what the rows under it belong to. The name is
               * `aria-labelledby` on the heading that is already drawn rather than a
               * second copy of the words in an attribute that could drift from it.
               */
              <div
                key={group.id}
                role="group"
                aria-labelledby={`${titleId}-group-${group.id}`}
                data-slot="command-palette-group"
                className="mb-1 last:mb-0"
              >
                {/*
                 * Sticky, so the group a reader is choosing from stays named while
                 * they move through a long list. A heading that scrolls away is a
                 * heading that has to be re-found, and a palette is faster than a
                 * menu only if it does not make the reader work to keep their
                 * place.
                 */}
                <div
                  id={`${titleId}-group-${group.id}`}
                  data-slot="command-palette-group-label"
                  className="text-muted-foreground bg-popover text-xs font-medium tracking-wide uppercase sticky top-0 px-3 py-1.5"
                >
                  {group.label}
                </div>
                {group.hits.map((hit) => {
                  const index = flat.indexOf(hit.item)
                  const isActive = index === activeIndex
                  return (
                    <div
                      key={hit.item.id}
                      id={`${titleId}-item-${hit.item.id}`}
                      data-slot="command-palette-item"
                      data-active={isActive}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => run(hit.item)}
                      className={cn(
                        'flex cursor-pointer items-baseline justify-between gap-3 rounded-sm px-3 py-2 text-sm',
                        isActive && 'bg-accent text-accent-foreground',
                        !isActive && 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <span className="min-w-0 truncate">
                        {hit.range === undefined ? (
                          hit.item.label
                        ) : (
                          <>
                            {hit.item.label.slice(0, hit.range[0])}
                            <strong className="text-foreground font-semibold">
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
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { CommandPalette }
