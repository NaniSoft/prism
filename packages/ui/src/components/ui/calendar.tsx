'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '../../lib/utils'

/**
 * The seven weekday headings, in the order the reader's week begins.
 *
 * A tuple rather than an array of strings, so the compiler refuses a caller who
 * passed six. A grid whose header is one column short is a grid whose first and
 * last rows are shifted by a day, and nothing on the screen shows it.
 */
export type CalendarWeekdays = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
]

/** The props the Calendar accepts. */
export interface CalendarProps {
  /**
   * The accessible name of the grid.
   *
   * Required. A grid with no name is a table of numbers, and a reader who cannot
   * tell a delivery date from a return date is being asked to guess.
   */
  label: string
  /**
   * The caption over the grid, for the month on show.
   *
   * A prop, and the reason it is a prop is the reason every word in this
   * Component is one: a month name is reader-facing text in the reader's language
   * and the reader's calendar convention, and a Component that carried a table of
   * them would ship English and a Western year into every consumer's product.
   * Format it with the same `Intl` call the rest of the product uses.
   */
  monthLabel: string
  /** The seven weekday headings, starting from `firstWeekday`. */
  weekdayLabels: CalendarWeekdays
  /**
   * Which day the reader's week starts on, as `Date.prototype.getDay()` numbers
   * it, so `0` is Sunday.
   *
   * Defaults to Sunday because that is what `getDay` returns and a default a
   * caller may override is the honest one. Pass it for a Monday-first locale, and
   * order `weekdayLabels` to match: the two are the same fact and the Component
   * cannot infer either half of it.
   */
  firstWeekday?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** The accessible name of the control that steps back one month. */
  previousLabel: string
  /** The accessible name of the control that steps forward one month. */
  nextLabel: string
  /**
   * The month on show.
   *
   * Controlled, and required to be, because the first month a calendar may open
   * on is a rule about the reader's situation rather than about the calendar: a
   * booking form opens on next month, an archive opens on the month the record is
   * in. A calendar that kept that state would have to be told the rule twice.
   */
  month: Date
  /** Called with the first day of the month when the reader moves between months. */
  onMonthChange: (month: Date) => void
  /**
   * The chosen date, or `null` for nothing chosen.
   *
   * The grid marks the chosen date with `aria-selected`, so this is also what the
   * month opens on when the reader has already answered.
   */
  value?: Date | null
  /** Called with the date the reader chooses. Never called with a disabled date. */
  onValueChange?: (date: Date) => void
  /**
   * Whether a date cannot be chosen.
   *
   * A disabled date stays in the grid and stays reachable by the arrow keys,
   * announced as unavailable and refusing to be chosen. A date that is simply
   * absent is indistinguishable from a grid that failed to draw that week, and a
   * reader who cannot land on it cannot tell a sold-out day from a bug. Say why
   * it is unavailable in text beside the field.
   */
  isDateDisabled?: (date: Date) => boolean
  /**
   * The full accessible name of a day cell.
   *
   * A date is a phrase in the reader's language and their date convention, so it
   * is the caller's. Without it the cell is named by its day number and its column
   * heading, which is what grid navigation already conveys.
   */
  dayLabel?: (date: Date) => string
  /**
   * The date to mark as today, when the reader's clock is not the renderer's.
   *
   * The mark is drawn and announced by `aria-current="date"`, which is a machine
   * value, so no word is spent on it.
   */
  today?: Date
  /** Whether the reader may not change the month or choose a date. */
  disabled?: boolean
  /**
   * The form field name. The chosen date is submitted as `YYYY-MM-DD`.
   *
   * The field is a plain hidden input rather than a date input, so the value is
   * one format the caller can parse without reading the reader's display
   * convention out of the string.
   */
  name?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** Layout only. */
  className?: string
}

/** `YYYY-MM-DD` in local time, which is the only date format a form should post. */
function iso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

const sameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/**
 * The same day of the month, `months` along.
 *
 * The day is clamped to the length of the month it lands in, so stepping back from
 * the 31st lands on the 30th, the 28th or the 29th rather than rolling into the
 * month before. A calendar that rolled would move the focus to a different month
 * than the reader asked for, and the date would be wrong by a month with nothing
 * on screen to say so.
 */
const shiftMonth = (date: Date, months: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay))
}

const DAY_CELL =
  // `transition-colors` is a property list, which Tailwind owns; the duration and
  // the easing are the motion tokens, and neither is written here as a number.
  //
  // The `pointer-coarse:h-11` is the same step `mini-calendar.tsx` takes on the same
  // control, and it was missing here for the reason a pair of identical controls in
  // one package usually diverges: the smaller grid was written first and the floor
  // was added to it, and the fuller grid kept the 36px cell that is the same cell at
  // a different size. A month grid is the densest control in the package and the one
  // most worked with a thumb, so it is the last place the floor can be argued about.
  'text-foreground hover:bg-accent hover:text-accent-foreground flex h-9 w-full cursor-pointer items-center justify-center rounded-md text-sm tabular-nums outline-none transition-colors duration-fast ease-out pointer-coarse:h-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * The two paging controls.
 *
 * Held as one string for the same reason `mini-calendar.tsx` holds its own as one:
 * they were written twice, as `size-8` each, and the small calendar's copy grew the
 * coarse-pointer floor while this one did not. The identical control in one package
 * at two target sizes is the defect, not the 32px, so the two strings are written out
 * in both files on purpose: a shared constant would couple two Components that are
 * allowed to diverge, and the line that has to stay in step is exactly the one that
 * should be visible at both call sites.
 */
const NAV_CONTROL =
  'text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md outline-none transition-colors duration-fast ease-out pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * How a day cell looks.
 *
 * `selected` states a fill and therefore states its own ink. `today` does not set
 * a fill, so it does not set an ink: it is a ring inside the cell and a weight,
 * and a ring has no foreground to keep in step with the two states above it.
 */
const DAY_STATE = {
  selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold',
  today: 'ring-ring ring-1 ring-inset font-semibold',
  unavailable: 'text-muted-foreground aria-disabled:hover:bg-transparent',
} as const

/**
 * A month grid for picking one date.
 *
 * **It is built here because Base UI does not ship one.** The package at 1.8.0
 * has a combobox, a number field, an OTP field and a field, and no calendar, so
 * there is nothing to compose and everything here is the Component's own. That is
 * stated rather than implied because "the docs show one" is not evidence, and a
 * wrapper around a module that is not in the installed package is the failure this
 * Component could have shipped.
 *
 * **The grid is always six weeks tall.** A month that needs five rows and a month
 * that needs six would otherwise resize as the reader pages through, which moves
 * the dates under the pointer and under the highlight: a reader who aims at the
 * 24th after reading its position in a five-row month clicks the 31st in a
 * six-row one. The empty cells at the edges are marked `aria-hidden` rather than
 * filled with the neighbouring month's dates, because a date from another month in
 * this grid is a date the reader did not come for.
 *
 * **Every date, weekday name and month name is the caller's.** The caption, the
 * seven column headings and the month the reader moves to are all reader-facing
 * text in the reader's language, and the Component has no business carrying a
 * table of them. What it does carry is the geometry: which column a date falls in
 * and which day it sits on.
 *
 * **One cell is in the tab order, and the arrows move it.** The roving tab stop
 * sits on the chosen date, or on today, or on the first of the month, so a reader
 * who tabs in lands on the date they care about rather than on the 1st. The arrows
 * step a day and a week, Home and End step to the ends of the week, and PageUp and
 * PageDown step a month, with Shift for a year. Moving past the end of a month
 * changes the month on show and carries the focus with it, so paging never leaves
 * the highlight on a cell that is no longer drawn.
 *
 * **A disabled date is drawn, reachable and refused.** It stays in the grid and
 * stays in the arrow path, because a date that is simply missing is
 * indistinguishable from a grid that failed to render that week, and a reader who
 * cannot reach it cannot tell a fully booked day from a bug. Enter, Space and a
 * click on it do nothing, and it announces as unavailable. Explain the reason in
 * text beside the field; a greyed cell on its own says only that it is not
 * available.
 *
 * **The caption is a live region.** Paging a month changes the month with no other
 * visible change for a reader who is on the grid, so the caption announces itself
 * when it changes.
 *
 * **A coarse pointer gets the 44px floor and the desktop metrics are untouched.**
 * Both the day cell and the two paging controls grow inside `@media (pointer: coarse)`
 * and are 36px and 32px for a mouse and a trackpad. The grid is the densest control
 * in this package, so the floor costs it the most: on a phone six rows of 44px is a
 * taller panel than six rows of 36px, and that is the price the whole package has
 * already agreed to pay for every other control rather than a reason this one is the
 * exception. A month grid is also the control a finger is least able to aim at, so it
 * is the last place the floor can be argued about.
 */
function Calendar({
  label,
  monthLabel,
  weekdayLabels,
  firstWeekday = 0,
  previousLabel,
  nextLabel,
  month,
  onMonthChange,
  value = null,
  onValueChange,
  isDateDisabled,
  dayLabel,
  today,
  disabled = false,
  name,
  form,
  className,
}: CalendarProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  // `null` means "wherever the reader would expect to land", which is derived
  // rather than stored, so an external change to `value` or `month` moves the tab
  // stop without this Component having to watch for it.
  const [movedTo, setMovedTo] = useState<Date | null>(null)

  const isUnavailable = useMemo(
    () => (date: Date) => disabled || (isDateDisabled?.(date) ?? false),
    [disabled, isDateDisabled],
  )

  /**
   * Six weeks from the Sunday, or the reader's first day, on or before the first
   * of the month.
   */
  const cells = useMemo(() => {
    const first = startOfMonth(month)
    const offset = (first.getDay() - firstWeekday + 7) % 7
    const start = addDays(first, -offset)
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [month, firstWeekday])

  /**
   * Where a reader who tabs into the grid lands: the chosen date, else today, else
   * the first of the month. A month on show is never empty, so there is always an
   * answer and the grid is always reachable by one Tab.
   */
  const landing = useMemo(() => {
    if (value !== null && sameMonth(value, month)) return value
    if (today !== undefined && sameMonth(today, month)) return today
    return startOfMonth(month)
  }, [value, today, month])

  const focused = movedTo !== null && sameMonth(movedTo, month) ? movedTo : landing

  /** Focus follows a move, because a move that changed month draws a new cell. */
  useEffect(() => {
    if (movedTo === null) return
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${iso(movedTo)}"]`)?.focus()
  }, [movedTo, month])

  /** Moves the tab stop, and the month on show when the move crosses a month. */
  const goTo = (date: Date) => {
    setMovedTo(date)
    if (!sameMonth(date, month)) onMonthChange(startOfMonth(date))
  }

  const choose = (date: Date) => {
    // The tab stop follows whatever the reader last operated, so a click leaves the
    // grid in the state the reader is now looking at rather than snapping the stop
    // back to the landing cell.
    setMovedTo(date)
    if (isUnavailable(date)) return
    onValueChange?.(date)
  }

  /**
   * The keys on one day cell.
   *
   * The date comes from the cell the event fired on rather than from state,
   * because a reader may have reached a cell by Tab or by a click and the tab stop
   * is the Component's own decision. Deriving the move from state would step from
   * wherever the tab stop happened to be, which is a cell the reader is not on.
   */
  const onDayKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>, date: Date) => {
    const row = Math.floor(cells.findIndex((entry) => sameDay(entry, date)) / 7)
    const first = cells[row * 7]
    const last = first === undefined ? null : addDays(first, 6)

    // Enter by `key`, Space by `code`. The space bar's `key` has been reported as a
    // space, as "Spacebar" and as "Space" by different engines over the years, and
    // its `code` has been the same in all of them, so this is the one activation key
    // whose physical position is the more reliable half of the event.
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

  const focusedIso = iso(focused)
  const chosenIso = value === null ? null : iso(value)
  const todayIso = today === undefined ? null : iso(today)

  return (
    <div
      data-slot="calendar"
      className={cn('bg-popover text-popover-foreground w-64 rounded-md border p-3 shadow-md', className)}
    >
      <div className="mb-2 flex items-center justify-between gap-1">
        <button
          type="button"
          data-slot="calendar-previous"
          aria-label={previousLabel}
          disabled={disabled}
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          className={cn(
            NAV_CONTROL,
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <ChevronLeftIcon className="size-4" />
        </button>

        {/*
         * A live region, because paging a month is the one navigation in this
         * Component with no other visible consequence for a reader sitting on the
         * grid: the header changes, the cells change, and nothing says which month
         * they are now in.
         */}
        <div
          data-slot="calendar-caption"
          aria-live="polite"
          className="text-foreground text-sm font-medium tabular-nums"
        >
          {monthLabel}
        </div>

        <button
          type="button"
          data-slot="calendar-next"
          aria-label={nextLabel}
          disabled={disabled}
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          className={cn(
            NAV_CONTROL,
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      <div ref={gridRef}>
        <table
          data-slot="calendar-grid"
          role="grid"
          aria-label={label}
          className="w-full border-collapse tabular-nums"
        >
          <thead>
            <tr>
              {weekdayLabels.map((weekday, column) => (
                <th
                  key={`${weekday}-${column}`}
                  scope="col"
                  data-slot="calendar-weekday"
                  className="text-muted-foreground flex h-8 items-center justify-center text-xs font-medium"
                >
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, row) => (
              <tr key={row}>
                {cells.slice(row * 7, row * 7 + 7).map((date) => {
                  const key = iso(date)
                  if (!sameMonth(date, month)) {
                    // The cells that pad the month out. They are hidden from the
                    // accessibility tree rather than filled with the neighbouring
                    // month's dates, because a date from another month drawn in
                    // this grid is a date the reader did not come for.
                    return (
                      <td key={key} role="gridcell" aria-hidden="true" className="p-0" />
                    )
                  }
                  const unavailable = isUnavailable(date)
                  const isSelected = key === chosenIso
                  const isToday = key === todayIso
                  return (
                    <td
                      key={key}
                      role="gridcell"
                      data-slot="calendar-day"
                      data-date={key}
                      tabIndex={key === focusedIso ? 0 : -1}
                      aria-selected={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-disabled={unavailable || undefined}
                      {...(dayLabel === undefined ? null : { 'aria-label': dayLabel(date) })}
                      onClick={() => choose(date)}
                      onKeyDown={(event) => onDayKeyDown(event, date)}
                      className={cn(
                        DAY_CELL,
                        unavailable && DAY_STATE.unavailable,
                        isToday && !isSelected && DAY_STATE.today,
                        isSelected && DAY_STATE.selected,
                      )}
                    >
                      {date.getDate()}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {name === undefined ? null : (
        <input
          type="hidden"
          name={name}
          {...(form === undefined ? null : { form })}
          value={chosenIso ?? ''}
          readOnly
        />
      )}
    </div>
  )
}

export { Calendar }
