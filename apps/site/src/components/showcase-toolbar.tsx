'use client'

import { Check, ChevronDown, Monitor, Moon, Smartphone, Sun, Tablet } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { PREVIEW_WIDTHS } from '@/lib/preview'
import { SHOWCASE_MODES, SHOWCASE_PACKS, WIDTH_LABELS, type PreviewWidth } from '@/lib/showcase'

/**
 * The showcase's toolbar: the pack chooser, the mode pair and the resolution row.
 *
 * **It is a client component because all three controls are state the parent holds
 * and none of them is a form.** A reader picks a pack and every token beneath the
 * toolbar re-points, which is not a navigation and not a submission, so there is
 * no form to own it and no server to round-trip it to. The pack and the mode arrive
 * as props and leave as callbacks, which keeps this file a drawing rather than a
 * second source of what is selected.
 *
 * **The controls are drawn in site markup rather than composed from package
 * Components, for the reason `item-header.tsx` gives.** `Select` and `ToggleGroup`
 * are the right Components for a product form, where the caller has a `Field`, a
 * label and a value that has to submit; this is a chrome bar over a preview, three
 * controls whose states are already held above them, and a popover positioned
 * against a portal inside a frame whose height the control itself decides. Writing
 * the markup costs three buttons and a list and buys exact control of that.
 *
 * `ToggleGroup` was the obvious third candidate and was rejected on its own
 * contract rather than on taste: in single mode pressing the pressed member
 * clears the set, so a two-value row would hand `onModeChange` an empty array, and
 * the mode and the width have no third state to clear to. Handling that at the call
 * site means discarding a callback the library deliberately fires.
 *
 * **Every control is a native element with a role that names what it is.** The pack
 * chooser is a combobox over a listbox, the mode and the width are radiogroups, and
 * the selected member carries `aria-checked`. A reader is told one question and
 * gets one answer, which is the arrangement Prism's own `ToggleGroup` argues for at
 * length and the one a row of independent `aria-pressed` buttons would contradict.
 *
 * **Drawing the roles is half of it, and the keyboard model is the other half.**
 * The file carried no `onKeyDown` at all: the arrows moved nothing, Escape closed
 * nothing, and focus neither entered the popup nor came back out of it, so the
 * chooser was reachable by Tab and operable by pointer and by nothing else. The two
 * radio rows had a second version of the same gap, because a `radiogroup` whose
 * members are all in the tab order is N stops with none of the arrows. So both rows
 * hold a roving tab stop on the current answer, which is what `ToggleGroup` does
 * and what the ARIA pattern for a radio group says, and the chooser owns the four
 * keys a listbox answers.
 *
 * **A `title` on an icon is a tooltip, not a name.** The mode row's members were
 * named only by the `title` on a glyph the markup marks `aria-hidden`, which leaves
 * the name resting on the last fallback in the accname algorithm. Each one now
 * carries an `aria-label` with the same words, so the tooltip stays a tooltip and a
 * reader is told what the control does.
 */
export function ShowcaseToolbar({
  pack,
  onPack,
  mode,
  onMode,
  width,
  onWidth,
  showResolution,
}: {
  /** The pack the preview document is currently loaded with. */
  pack: string
  /** Called with a pack id when the reader picks one. */
  onPack: (pack: string) => void
  /** The mode the preview document is currently loaded with. */
  mode: 'light' | 'dark'
  /** Called with the mode the reader picks. */
  onMode: (mode: 'light' | 'dark') => void
  /** The width a Block or a Page is held at. */
  width: PreviewWidth
  /** Called with a width when the reader picks one. */
  onWidth: (width: PreviewWidth) => void
  /** Whether this Item's Kind has a layout a resolution could change. */
  showResolution: boolean
}) {
  const [open, setOpen] = useState(false)
  const active = SHOWCASE_PACKS.find((entry) => entry.id === pack) ?? SHOWCASE_PACKS[0]
  /*
   * The button points at the listbox it opens, which `role="combobox"` requires and
   * which is also what lets a reader arriving by screen reader jump from the trigger
   * into the options. The id is generated rather than written, because a page can
   * hold more than one showcase and a written id would be duplicated by the second.
   */
  const listId = useId()
  const listRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  /*
   * Where the popup should put focus once it exists. A ref and not state, for two
   * reasons. The option cannot be focused in the key handler because the list is not
   * rendered until the state has landed, so the intent has to survive one render; and
   * it is spent the moment it is used, so putting it in state would mean a `setState`
   * inside an effect to clear it, which is a cascading render for a value nothing
   * renders. `null` is the "the reader arrived by pointer" case, which leaves focus
   * where the browser put it, on the trigger.
   */
  const focusIndex = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const index = focusIndex.current
    if (index === null) return
    focusIndex.current = null
    listRef.current?.querySelectorAll<HTMLElement>('[role="option"]').item(index)?.focus()
  }, [open])

  /** The options in the order a reader meets them, read from the DOM as drawn. */
  const options = () => [
    ...(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
  ]

  /** Opens the popup and asks it to put focus on `index`, or on the chosen one. */
  const openAt = (index: number | 'chosen') => {
    focusIndex.current =
      index === 'chosen'
        ? Math.max(0, SHOWCASE_PACKS.findIndex((entry) => entry.id === pack))
        : index
    setOpen(true)
  }

  const close = (backToTrigger: boolean) => {
    setOpen(false)
    focusIndex.current = null
    if (backToTrigger) triggerRef.current?.focus()
  }

  /**
   * The four keys a listbox answers, on the popup and on the trigger that opens it.
   *
   * One handler for both states rather than one each, because the states share three
   * of the four answers and a second handler would be a second place to get one
   * wrong. Escape is the fourth: it closes and hands focus back to the trigger,
   * which is the only way out of a listbox for a reader who did not Tab into it.
   */
  const onPackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (!open) return
      event.preventDefault()
      close(true)
      return
    }

    if (event.key === 'Tab') {
      // Tab leaves rather than being consumed, and the popup goes with it. A reader
      // who has found the pack they wanted presses Tab to carry on down the page, and
      // a listbox that holds them has turned one keypress into six.
      if (open) close(false)
      return
    }

    if (!open) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        openAt('chosen')
        return
      }
      if (event.key === 'ArrowUp' || event.key === 'End') {
        event.preventDefault()
        openAt(SHOWCASE_PACKS.length - 1)
        return
      }
      // Enter and Space are the trigger's own activation and a `<button>` already
      // answers both by clicking, so the click handler is left to do it. Home is the
      // only remaining member of the list and nothing is gained by answering it on a
      // closed popup, so it does nothing here either.
      return
    }

    const all = options()
    if (all.length === 0) return
    const at = all.indexOf(document.activeElement as HTMLElement)
    if (at === -1) return
    event.preventDefault()

    if (event.key === 'Home') {
      all[0]?.focus()
      return
    }
    if (event.key === 'End') {
      all[all.length - 1]?.focus()
      return
    }
    const step = event.key === 'ArrowDown' ? 1 : -1
    all[(at + step + all.length) % all.length]?.focus()
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      <div className="relative" onKeyDown={onPackKeyDown}>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={`Preview pack, currently ${active.name}`}
          onClick={() => (open ? close(false) : openAt('chosen'))}
          className="border-border bg-background hover:bg-muted flex h-8 items-center gap-2 rounded-md border px-2 text-xs font-medium transition-colors"
        >
          <PackDot pack={active.id} />
          <span>{active.name}</span>
          <ChevronDown aria-hidden className="text-muted-foreground size-3.5" />
        </button>

        {open ? (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Preview pack"
            className="bg-popover text-popover-foreground border-border absolute top-full left-0 z-30 mt-1 max-h-72 w-64 overflow-y-auto rounded-lg border p-1 shadow-md"
          >
            {SHOWCASE_PACKS.map((entry) => {
              const chosen = entry.id === pack
              return (
                /*
                 * `role="none"` because a listbox owns `option` and `group` and
                 * nothing else, and a `listitem` in between is announced as a row of
                 * the list that cannot be chosen. The same shape `Tree` uses for the
                 * same reason.
                 */
                <li key={entry.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={chosen}
                    /*
                     * Every option is focusable and none of them is a Tab stop. Focus
                     * enters the list from the trigger by an arrow key and leaves by
                     * Escape or Tab, which is the listbox model, and a Tab stop on
                     * each option would put a reader six presses into the page to
                     * reach the thing they came to change.
                     */
                    tabIndex={-1}
                    onClick={() => {
                      onPack(entry.id)
                      close(true)
                    }}
                    className={`hover:bg-accent hover:text-accent-foreground flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                      chosen ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    {/*
                      The mark is `aria-hidden` because the option's own name is the
                      words beside it. A reader hearing "Primary, Base, option,
                      selected, 1 of 6" is told the name twice and has to work out
                      which half is the name.
                    */}
                    <span aria-hidden className="pt-0.5">
                      <PackDot pack={entry.id} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        {entry.name}
                        {chosen ? <Check aria-hidden className="size-3.5" /> : null}
                      </span>
                      {/*
                        `text-xs` and not a value of its own. A pack description is
                        a sentence in the product's own words, so it is reading copy
                        and takes a reading step; it was at 11 pixels, which is on no
                        step of the authored scale at all, and a hard value is also the
                        one length form that does not move when a reader raises their
                        browser's default size.
                      */}
                      <span className="text-muted-foreground text-pretty text-xs leading-snug">
                        {entry.description}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label="Preview mode"
        className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5"
        {...rovingRadioKeys('ArrowRight', 'ArrowLeft')}
      >
        {SHOWCASE_MODES.map((entry) => (
          <button
            key={entry}
            type="button"
            role="radio"
            aria-checked={mode === entry}
            /*
             * The words a press does, as a name rather than as a tooltip. The glyph
             * beside it is `aria-hidden` and a `title` is the last thing the accname
             * algorithm reaches for, so before this the row announced as "radio" and
             * left the reader to work out what the sun and the moon were for.
             */
            aria-label={
              entry === 'dark' ? 'Show the preview in dark mode' : 'Show the preview in light mode'
            }
            // The roving tab stop, on the current answer. See the JSDoc.
            tabIndex={mode === entry ? 0 : -1}
            onClick={() => onMode(entry)}
            title={entry === 'dark' ? 'Show the preview in dark mode' : 'Show the preview in light mode'}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${
              mode === entry
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {entry === 'dark' ? (
              <Moon aria-hidden className="size-3.5" />
            ) : (
              <Sun aria-hidden className="size-3.5" />
            )}
          </button>
        ))}
      </div>

      {showResolution ? (
        <>
          <span aria-hidden className="bg-border mx-0.5 h-5 w-px" />
          <div
            role="radiogroup"
            aria-label="Preview width"
            className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5"
            {...rovingRadioKeys('ArrowRight', 'ArrowLeft')}
          >
            {PREVIEW_WIDTHS.map((entry) => (
              <button
                key={entry}
                type="button"
                role="radio"
                aria-checked={width === entry}
                tabIndex={width === entry ? 0 : -1}
                onClick={() => onWidth(entry)}
                className={`flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors ${
                  width === entry
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <WidthIcon width={entry} />
                {/* A device width is a number a machine reports, so it is the mono step. */}
                <span className="font-mono text-mono">{WIDTH_LABELS[entry]}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

/**
 * The arrow keys for one row of mutually exclusive choices.
 *
 * A function rather than a hook because the only thing it needs is the two keys that
 * mean forward and backward on that row, and a hook would have to be called once per
 * row from the top of the Component to satisfy the rules of hooks while returning a
 * handler for a row that is drawn further down. What it reads is the DOM inside the
 * element the handler is attached to, which is the row itself.
 *
 * **It wraps, because a radio group does.** A list that stops at its end makes a
 * reader who overshot press the other key to come back, and a row of two or four
 * choices is short enough that overshoot is the common case. It moves focus and does
 * not choose: an arrow past a member of a radio group lands on it and leaves it
 * unchecked, because choosing is what Space and Enter are for.
 */
function rovingRadioKeys(forward: string, backward: string) {
  return {
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (![forward, backward, 'Home', 'End'].includes(event.key)) return
      const all = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')]
      if (all.length === 0) return
      const at = all.indexOf(document.activeElement as HTMLElement)
      if (at === -1) return
      event.preventDefault()
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? all.length - 1
            : (at + (event.key === forward ? 1 : -1) + all.length) % all.length
      all[next]?.focus()
    },
  }
}

/**
 * The mark beside a pack's name: the pack's primary beside its own dark primary.
 *
 * **It is two halves because a pack is two axes and a reader choosing between packs
 * has to see both.** The halves are painted by the cascade from the pack's own
 * emitted values, not from anything read out of the token package, so a pack change
 * moves this dot along with every other token rather than leaving it as a stale
 * picture of a palette it was built from.
 *
 * **The first half wears the ancestor's mode, which is what a boundary does.** It
 * carries `data-pack` and nothing else, so it resolves the pack in whatever mode
 * the page above it is in, which is the rule DESIGN.md states and the only form a
 * server can render.
 *
 * **The second half holds the dark, with the compound form rather than a `dark:`
 * variant.** The token build publishes `[data-pack="<id>"].dark` beside
 * `.dark [data-pack="<id>"]` for exactly this case: an element that must hold a
 * fixed mode. So the half carries the literal `dark` class, which makes the first
 * member match IT and puts the declaration of `--primary` on the element itself,
 * where nothing above it can be consulted.
 *
 * **It used to be `dark:bg-primary`, which was a different element asking a
 * different question.** `dark:` is a Tailwind *variant*, and both stylesheets
 * declare it `@custom-variant dark (&:is(.dark *))`, so it compiles to
 * `:is(.dark *)`: it matches only a DESCENDANT of `.dark`. The half carried no
 * `dark` class, so on a light page the variant never matched and the half fell
 * through to `bg-background`, showing a pack primary beside a pack background with
 * no second mode in it; on a dark page it did match and painted `--primary` in the
 * page's own mode, which is the value the first half was already painting. Two
 * halves, one figure, and no claim either of them could make. A variant is not a
 * mode: it is a condition on an ancestor, and the thing that has to hold the dark
 * is the element that paints.
 *
 * **What it still cannot do, because the token build does not publish a way.** A
 * light-forced boundary does not exist: `[data-pack="<id>"]` is (0,1,0) and
 * `.dark [data-pack="<id>"]` is (0,2,0), so on a dark page the first half wears the
 * dark primary as well and the pair shows one colour twice. Showing both modes on a
 * dark page needs a third emitted selector, which is a token-build decision rather
 * than a class this file can write, so the comment stops where the emission stops.
 * The rule and the reason are written down rather than left to this file: DESIGN.md
 * states the absence, why the mode axis makes it a decision rather than a gap, and
 * what it would cost to change.
 *
 * Both halves carry no radius utility and sit inside a `rounded-full` frame, so the
 * pack boundary moves no corner anywhere.
 */
function PackDot({ pack }: { pack: string }) {
  return (
    <span aria-hidden className="flex shrink-0 overflow-hidden rounded-full">
      <span data-pack={pack} className="bg-primary size-2.5" />
      <span data-pack={pack} className="dark bg-primary size-2.5" />
    </span>
  )
}

/**
 * The icon beside a width, and why `auto` has none.
 *
 * A device icon names the class of hardware a width stands for. `auto` has no
 * class, it is the frame's own width, and drawing a device beside it would claim
 * a device that is not being held.
 */
function WidthIcon({ width }: { width: PreviewWidth }) {
  if (width === '390') return <Smartphone aria-hidden className="size-3.5" />
  if (width === '834') return <Tablet aria-hidden className="size-3.5" />
  if (width === '1280') return <Monitor aria-hidden className="size-3.5" />
  return null
}
