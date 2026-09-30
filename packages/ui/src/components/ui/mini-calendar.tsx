'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { cn } from '../../lib/utils'

/** The props the Mini calendar accepts. */
export interface MiniCalendarProps {
  /**
   * The chosen date, or nothing when the reader has not chosen one.
   *
   * Pass it and the grid is controlled, which is what a filter panel wants: the
   * panel already holds the date the page is filtered by, and a second copy of it
   * inside the grid is a second thing to keep in step.
   */
  selected?: Date
  /** Called with the date the reader chooses. Never called for a date outside `min` and `max`. */
  onSelect?: (date: Date) => void
  /**
   * The month on show.
   *
   * Pass it with `onMonthChange` to control the month, or pass `defaultMonth` to
   * let the grid keep it. A controlled month with no `onMonthChange` would draw
   * two paging controls that cannot page, so the two halves are documented
   * together rather than separately.
   */
  month?: Date
  /** The month the grid opens on, for a grid that keeps its own. */
  defaultMonth?: Date
  /** Called with the first day of the month when the reader pages. */
  onMonthChange?: (month: Date) => void
  /**
   * The locale the month name, the weekday headings and the day numbers are
   * written in.
   *
   * Omit it and the runtime's own locale is used. It is one tag, not a table of
   * words, which is the point: this Component never holds a month name, a
   * weekday name or a digit set, so there is nothing here to translate.
   */
  locale?: string
  /**
   * Which day the reader's week starts on, as `Date.prototype.getDay()` numbers
   * it, so `0` is Sunday and `1` is Monday.
   *
   * Defaults to Sunday because that is what `getDay` returns. Prism asks rather
   * than infers: the platform can answer it for a locale through
   * `new Intl.Locale(locale).getWeekInfo().firstDay`, and where that is not
   * available a grid that guesses Sunday is wrong in a Monday-first country with
   * nothing on screen to say so. The caller usually already knows, because their
   * own date handling had to.
   */
  weekStartsOn?: 0 | 1
  /** The accessible name of the control that steps back one month. */
  previousLabel: string
  /** The accessible name of the control that steps forward one month. */
  nextLabel: string
  /**
   * The accessible name of the grid, saying which question it answers.
   *
   * Required. A grid named "Calendar" is a grid that answers no question, and a
   * filter panel with two of them gives a reader two identical names to choose
   * between. Name the filter: "Booked from", "Delivery date".
   */
  label: string
  /**
   * The earliest date that may be chosen.
   *
   * Days before it are still drawn, still reachable and still announced, and
   * refuse to be chosen. A day that is simply missing is indistinguishable from a
   * grid that failed to render that week, so the shape of the month never
   * changes. Say why in text beside the grid.
   */
  min?: Date
  /** The latest date that may be chosen. Held to the same rule as `min`. */
  max?: Date
  /** Layout only. */
  className?: string
}

/** `YYYY-MM-DD` in local time, which is the only key a date grid needs. */
const iso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

const sameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

const sameDay = (a: Date, b: Date): boolean => iso(a) === iso(b)

/** Midnight local, so a range compares days rather than clock times. */
const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/**
 * The same day of the month, `months` along, clamped to the month it lands in.
 *
 * Stepping back from the 31st lands on the 30th, the 28th or the 29th rather than
 * rolling into the month before, because a roll would move the focus to a month
 * the reader did not ask for and the date would be wrong by a month with nothing
 * on screen to say so.
 */
const shiftMonth = (date: Date, months: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay))
}

/** A day cell, and nothing about which day is in it. */
const DAY_CELL =
  'text-foreground hover:bg-accent hover:text-accent-foreground flex h-8 w-full cursor-pointer items-center justify-center rounded-md text-sm tabular-nums outline-none transition-colors duration-fast ease-out pointer-coarse:h-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * How a day cell looks, and why `today` sets no ink.
 *
 * `selected` states a fill and therefore states its own ink. `today` sets none,
 * so it states none: it is a ring inside the cell and a weight, and a ring has no
 * foreground to keep in step with the two states above it.
 */
const DAY_STATE = {
  selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold',
  today: 'ring-ring ring-1 ring-inset font-semibold',
  unavailable: 'text-muted-foreground aria-disabled:hover:bg-transparent',
} as const

/** The two paging controls, which are controls and get a ring of their own. */
const NAV_CONTROL =
  'text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md outline-none transition-colors duration-fast ease-out pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * A compact month grid for placing in a panel, a filter list or a sidebar.
 *
 * **It is the small sibling of `Calendar`, and the difference is where it
 * lives.** `Calendar` is a full control: it is drawn inside a popover, it owns
 * the roving tab stop for a form, and it is what a `DatePicker` opens. This one
 * is a grid you place. It owns no popover and no trigger, because the two things
 * a trigger needs, a field to sit in and a place to open, are the caller's in a
 * filter panel and a sidebar, and a Component that drew its own would be a
 * control inside a control. Everything else is deliberately the same: six rows, a
 * roving tab stop, arrows that cross a month boundary, and a rule about what a
 * date outside the range means. Two date grids in one product that behave
 * differently is the failure this Component exists to prevent, so the keyboard
 * model is `Calendar`'s rather than a second answer written for a smaller box.
 *
 * **Every name and every number comes from `Intl` and from `locale`, and there
 * is no array of weekday names anywhere in this file.** A calendar whose weekday
 * row is a literal array of English abbreviations is wrong in every locale the
 * caller has, in a way no screenshot of the control shows, and it is the most
 * common single defect in a date control: it is the shape every tutorial and
 * every hand-rolled grid arrives at, because the seven names are the first thing
 * a grid needs and the seventh thing anybody looks up. So the headings are
 * formatted from the first week's own cells, which means the heading over a
 * column is the weekday that column actually holds, and the month name and the
 * day numbers come from the same locale. The caller's only job is a locale tag.
 *
 * **The visible heading is short and the full weekday rides on `abbr`.** A
 * seven-column grid has no room for "Wednesday", and a truncated weekday name is
 * a weekday a reader has to guess at. The short form is what is drawn and the
 * long form is what the header cell names itself with, so the abbreviation a
 * reader sees and the word a screen reader says are both right.
 *
 * **The table is the structure and the buttons are the controls.** A grid whose
 * cells are the focusable elements is a grid of divs that a reader has to be told
 * is operable, and the gate on focus indicators is the gate that says so. Here the
 * table carries the rows, the columns, the weekday associations and the caption,
 * so the screen reader's structure is the table, and each day is a `<button>`
 * inside its cell, which is a control the platform already knows how to press
 * with Enter and Space and how to focus with a ring. The cell carries
 * `aria-selected` because that is the only place the attribute is valid, and a
 * chosen day announced as an ordinary cell has told the reader nothing about
 * whether it is the one they picked.
 *
 * **The month name is a `<caption>` and the paging controls live inside it.** A
 * caption is the one place in a table that is allowed to hold flow content, and
 * putting the month name and its two controls there means the month is named by
 * the table's own structure rather than by a heading that happens to sit above
 * it. The alternative was a header row outside the table, which reads fine and
 * leaves the table unnamed.
 *
 * **The grid is always six weeks tall and a day outside the range is still
 * there.** Both are the same decision. A month that needs five rows and one that
 * needs six would otherwise resize as the reader pages, which moves the dates
 * under the pointer: a reader who aims at the 24th after reading its position in
 * a five-row month clicks the 31st in a six-row one. So the edge cells are padded
 * and the out-of-range days are drawn, dimmed, reachable and refusing, because a
 * day that is simply missing is indistinguishable from a grid that failed to
 * render that week, and a reader who cannot land on it cannot tell a sold-out
 * day from a bug. The costs are paid visibly: a short month carries one empty row
 * and an in-range filter still shows a month of greyed days.
 *
 * **The month is marked today from the renderer's clock.** That is the same
 * choice `DatePicker` makes and it has the same cost: a server render and a
 * hydration that straddle midnight disagree about which day is today, and React
 * reports the attribute. It is one attribute on one cell, and the alternative
 * was a prop every caller of a small grid would have to pass to avoid a warning
 * they would never see.
 */
function MiniCalendar({
  selected,
  onSelect,
  month,
  defaultMonth,
  onMonthChange,
  locale,
  weekStartsOn = 0,
  previousLabel,
  nextLabel,
  label,
  min,
  max,
  className,
}: MiniCalendarProps) {
  const today = new Date()
  const [ownSelected, setOwnSelected] = useState<Date | undefined>(undefined)
  const [ownMonth, setOwnMonth] = useState<Date>(() =>
    startOfMonth(defaultMonth ?? selected ?? today),
  )
  // `null` means "wherever the reader would expect to land", derived rather than
  // stored, so a change to `selected` or `month` moves the tab stop without this
  // Component having to watch for it.
  const [movedTo, setMovedTo] = useState<Date | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const shown = month === undefined ? ownMonth : startOfMonth(month)
  const chosen = selected === undefined ? ownSelected : selected

  const monthText = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(shown),
    [locale, shown],
  )

  const dayText = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric' }),
    [locale],
  )

  /** Six weeks from the reader's first day, on or before the first of the month. */
  const cells = useMemo(() => {
    const first = startOfMonth(shown)
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    return Array.from({ length: 42 }, (_, index) => addDays(addDays(first, -offset), index))
  }, [shown, weekStartsOn])

  /**
   * The seven headings, formatted from the first week's own cells.
   *
   * From the cells and not from a reference date, because a cell in column `n` of
   * the first row is by construction the weekday that column holds, so a heading
   * cannot drift from the column it sits over the way a computed weekday index
   * can. There is no table of weekday names in this file to drift in the first
   * place.
   */
  const headings = useMemo(() => {
    const short = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long' })
    return cells.slice(0, 7).map((cell) => ({ short: short.format(cell), long: long.format(cell) }))
  }, [cells, locale])

  /** Where a reader who tabs into the grid lands: the choice, else today, else the first. */
  const landing =
    chosen !== undefined && sameMonth(chosen, shown)
      ? chosen
      : sameMonth(today, shown)
        ? today
        : startOfMonth(shown)

  const focused = movedTo !== null && sameMonth(movedTo, shown) ? movedTo : landing
  const focusedIso = iso(focused)
  const chosenIso = chosen === undefined ? null : iso(chosen)
  const todayIso = iso(today)

  const isUnavailable = (date: Date): boolean => {
    const at = startOfDay(date)
    if (min !== undefined && at < startOfDay(min)) return true
    if (max !== undefined && at > startOfDay(max)) return true
    return false
  }

  /** Focus follows a move, because a move that changed month draws a new cell. */
  useEffect(() => {
    if (movedTo === null) return
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${iso(movedTo)}"]`)?.focus()
  }, [movedTo, shown])

  const move = (next: Date) => {
    if (month === undefined) setOwnMonth(next)
    onMonthChange?.(next)
  }

  const choose = (date: Date) => {
    setMovedTo(date)
    if (isUnavailable(date)) return
    if (selected === undefined) setOwnSelected(date)
    onSelect?.(date)
  }

  /** Moves the tab stop, and the month on show when the move crosses a month. */
  const goTo = (date: Date) => {
    setMovedTo(date)
    if (!sameMonth(date, shown)) move(startOfMonth(date))
  }

  /**
   * The keys on one day.
   *
   * The date comes from the cell the event fired on rather than from state,
   * because a reader may have arrived at a cell by Tab or by a click and the tab
   * stop is this Component's own decision. Deriving the move from state would
   * step from wherever the tab stop happened to be, which is a cell the reader is
   * not on.
   */
  const onDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const row = Math.floor(cells.findIndex((entry) => sameDay(entry, date)) / 7)
    const first = cells[row * 7]
    const last = first === undefined ? null : addDays(first, 6)

    // Enter by `key`, Space by `code`. The space bar's `key` has been reported as
    // a space, as "Spacebar" and as "Space" by different engines over the years,
    // and its `code` has been the same in all of them.
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault()
      choose(date)
      return
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        goTo(addDays(date, -1))
        return
      case 'ArrowRight':
        event.preventDefault()
        goTo(addDays(date, 1))
        return
      case 'ArrowUp':
        event.preventDefault()
        goTo(addDays(date, -7))
        return
      case 'ArrowDown':
        event.preventDefault()
        goTo(addDays(date, 7))
        return
      case 'Home':
        event.preventDefault()
        if (first !== undefined) goTo(first)
        return
      case 'End':
        event.preventDefault()
        if (last !== null) goTo(last)
        return
      case 'PageUp':
        event.preventDefault()
        goTo(shiftMonth(date, event.shiftKey ? -12 : -1))
        return
      case 'PageDown':
        event.preventDefault()
        goTo(shiftMonth(date, event.shiftKey ? 12 : 1))
        return
      default:
    }
  }

  return (
    <div
      ref={gridRef}
      data-slot="mini-calendar"
      className={cn(
        'bg-card text-card-foreground w-64 rounded-md border p-3 shadow-sm',
        className,
      )}
    >
      <table
        data-slot="mini-calendar-grid"
        role="grid"
        aria-label={label}
        className="w-full border-collapse tabular-nums"
      >
        <caption data-slot="mini-calendar-caption" className="mb-2">
          <span className="flex items-center justify-between gap-1">
            <button
              type="button"
              data-slot="mini-calendar-previous"
              aria-label={previousLabel}
              onClick={() => move(shiftMonth(shown, -1))}
              className={NAV_CONTROL}
            >
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
            </button>

            {/*
             * A live region, because paging a month is the one navigation here
             * with no other consequence for a reader sitting on the grid: the
             * cells change and nothing says which month they are now in.
             */}
            <span
              data-slot="mini-calendar-month"
              aria-live="polite"
              className="text-foreground text-sm font-medium"
            >
              {monthText}
            </span>

            <button
              type="button"
              data-slot="mini-calendar-next"
              aria-label={nextLabel}
              onClick={() => move(shiftMonth(shown, 1))}
              className={NAV_CONTROL}
            >
              <ChevronRightIcon className="size-4" aria-hidden="true" />
            </button>
          </span>
        </caption>

        <thead>
          <tr>
            {headings.map((heading) => (
              <th
                key={heading.long}
                scope="col"
                abbr={heading.long}
                data-slot="mini-calendar-weekday"
                className="text-muted-foreground flex h-8 items-center justify-center text-xs font-medium"
              >
                {heading.short}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 6 }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((date) => {
                const key = iso(date)
                if (!sameMonth(date, shown)) {
                  // The cells that pad the month out. Hidden from the accessibility
                  // tree rather than filled with the neighbouring month's dates,
                  // because a date from another month drawn in this grid is a date
                  // the reader did not come for.
                  return <td key={key} role="gridcell" aria-hidden="true" className="p-0" />
                }
                const unavailable = isUnavailable(date)
                const isSelected = key === chosenIso
                const isToday = key === todayIso
                return (
                  <td
                    key={key}
                    role="gridcell"
                    data-slot="mini-calendar-cell"
                    aria-selected={isSelected}
                    className="p-0"
                  >
                    <button
                      type="button"
                      data-slot="mini-calendar-day"
                      data-date={key}
                      tabIndex={key === focusedIso ? 0 : -1}
                      aria-current={isToday ? 'date' : undefined}
                      aria-disabled={unavailable || undefined}
                      onClick={() => choose(date)}
                      onKeyDown={(event) => onDayKeyDown(event, date)}
                      className={cn(
                        DAY_CELL,
                        unavailable && DAY_STATE.unavailable,
                        isToday && !isSelected && DAY_STATE.today,
                        isSelected && DAY_STATE.selected,
                      )}
                    >
                      {dayText.format(date)}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { MiniCalendar }
