'use client'

import { XIcon } from 'lucide-react'
import { useCallback, useId, useState } from 'react'

import { Calendar, type CalendarWeekdays } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { cn } from '../../lib/utils'

/** The props the Date picker accepts. */
export interface DatePickerProps {
  /**
   * The accessible name of the field.
   *
   * Required. It is rendered as the field's own name rather than as visible text,
   * because a visible label belongs above the control and that is the caller's
   * `Label` to place. What the Component owns is the name, and a field with no
   * name is a field a screen reader reader cannot say out loud.
   */
  label: string
  /**
   * Formats a chosen date for the field.
   *
   * Required, and required as a function rather than as a format string, because a
   * date is a phrase in the reader's language and their convention. This Component
   * ships no date format: a hardcoded one would be a claim about how dates are
   * written in every consumer's product.
   */
  format: (date: Date) => string
  /** The caption for a month on show, in the reader's language. */
  monthLabel: (month: Date) => string
  /** The seven weekday headings, starting from `firstWeekday`. */
  weekdayLabels: CalendarWeekdays
  /** Which day the reader's week starts on, as `Date.prototype.getDay()` numbers it. */
  firstWeekday?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** The accessible name of the control that steps back one month. */
  previousLabel: string
  /** The accessible name of the control that steps forward one month. */
  nextLabel: string
  /**
   * The accessible name of the control that clears the field.
   *
   * Omit it and the control is not rendered. The words are the caller's because
   * they are a sentence a reader hears, and a Component that chose them would be
   * shipping English into every consumer's form.
   */
  clearLabel?: string
  /**
   * What the field shows before a date is chosen.
   *
   * Hidden from the accessibility tree, because the field already has a name and
   * a placeholder that becomes a second name is a field announced twice.
   */
  placeholder?: string
  /** The chosen date, when the field is controlled. */
  value?: Date | null
  /** The date chosen initially, for an uncontrolled field. */
  defaultValue?: Date | null
  /** Called with the chosen date, or `null` when the reader clears the field. */
  onValueChange?: (date: Date | null) => void
  /** Whether a date cannot be chosen. */
  isDateDisabled?: (date: Date) => boolean
  /** The full accessible name of a day, in the reader's own date format. */
  dayLabel?: (date: Date) => string
  /** The date to mark as today. Defaults to the reader's clock. */
  today?: Date
  /** Whether the reader may not open the calendar or choose a date. */
  disabled?: boolean
  /** Whether a date must be chosen before the form submits. */
  required?: boolean
  /**
   * The form field name. The chosen date is submitted as `YYYY-MM-DD`.
   *
   * Never the displayed string. A form that posts whatever the reader's locale
   * wrote makes every reader of that data parse a phrase.
   */
  name?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** The field's own id, so a label elsewhere can point at it. */
  id?: string
  /** Layout only. */
  className?: string
}

/** `YYYY-MM-DD`, which is the only date format a form should post. */
const iso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

/**
 * A field that opens a month grid and holds the date the reader picks.
 *
 * **It is built on the Calendar rather than beside it.** The month grid is a
 * month grid: six rows, a roving tab stop, arrow keys that cross into the next
 * month, and a rule about what a disabled date means. A picker with its own grid
 * would be a second answer to all six questions, and the second answer is the one
 * that ships the bug.
 *
 * **Choosing a date commits it and closes, in one gesture.** A field that left the
 * grid open after a choice asks the reader to confirm an answer they already gave,
 * and the Popover returns focus to the trigger on close, so a reader who is
 * tabbing onward from the field is where they expect to be rather than back at
 * the top of the document.
 *
 * **The month on show follows the answer, every time the field is opened.** A
 * filled field opens on the month of its value, and an empty one on the current
 * month. Without this, re-picking a date in a different month would reset the grid
 * to the month the caller seeded it with, which is the month the reader was in
 * the first time and is a silent undo of the navigation they just did.
 *
 * **The field shows the caller's formatted date and submits an ISO day.** Those are
 * two different strings on purpose: one is read by a person and written in their
 * language, the other is read by a machine that has no locale. A field that
 * submitted what it displayed hands every downstream reader a phrase to parse.
 *
 * **The name and the value are announced separately.** The name is the field's
 * label and the value is its description, which is how a field is read: "Delivery
 * date, 17 March 2026". Letting the visible date become the button's name would
 * replace the field's name with its current answer, so a reader who tabs through
 * a form of five date fields hears five dates and no questions.
 */
function DatePicker({
  label,
  format,
  monthLabel,
  weekdayLabels,
  firstWeekday = 0,
  previousLabel,
  nextLabel,
  clearLabel,
  placeholder,
  value,
  defaultValue = null,
  onValueChange,
  isDateDisabled,
  dayLabel,
  today = new Date(),
  disabled = false,
  required = false,
  name,
  form,
  id,
  className,
}: DatePickerProps) {
  const [ownValue, setOwnValue] = useState<Date | null>(defaultValue)
  const [ownOpen, setOwnOpen] = useState(false)
  const [month, setMonth] = useState(() => startOfMonth(defaultValue ?? today))
  const generated = useId()
  const triggerId = id ?? generated
  const valueId = `${generated}-value`

  const chosen = value === undefined ? ownValue : value
  const open = ownOpen
  const shown = chosen === null ? '' : format(chosen)

  const choose = (date: Date) => {
    if (value === undefined) setOwnValue(date)
    onValueChange?.(date)
    setOwnOpen(false)
  }

  const clear = useCallback(() => {
    if (value === undefined) setOwnValue(null)
    onValueChange?.(null)
  }, [onValueChange, value])

  const onOpenChange = (next: boolean) => {
    // Reseeded on every open rather than held, so the grid always arrives on the
    // month the reader is about to edit.
    if (next) setMonth(startOfMonth(chosen ?? today))
    setOwnOpen(next)
  }

  const canClear = chosen !== null && clearLabel !== undefined

  return (
    <div data-slot="date-picker" className={cn('relative w-full', className)}>
      {canClear ? (
        <button
          type="button"
          data-slot="date-picker-clear"
          aria-label={clearLabel}
          disabled={disabled}
          onClick={clear}
          className={cn(
            'text-muted-foreground hover:text-foreground absolute top-1/2 right-9 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm outline-none',
            'transition-colors duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px]',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <XIcon className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          data-slot="date-picker-trigger"
          id={triggerId}
          aria-label={label}
          aria-describedby={shown === '' ? undefined : valueId}
          aria-invalid={required && chosen === null ? true : undefined}
          disabled={disabled}
          className={cn(
            'border-input bg-background text-foreground w-full justify-between outline-none',
            'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
            canClear && 'pr-16',
          )}
        >
          {/*
           * The visible answer is hidden from the accessibility tree and repeated
           * in a visually hidden description, so the field is announced as its name
           * and its value rather than as its value alone.
           */}
          <span
            data-slot="date-picker-value"
            aria-hidden="true"
            className={shown === '' ? 'text-muted-foreground' : undefined}
          >
            {shown === '' ? placeholder : shown}
          </span>
        </PopoverTrigger>

        {/*
         * The Popover is a dialog and a dialog is announced as one, so it is named
         * by the same prop that names the field. Naming it by the field rather than
         * by the month is deliberate: a reader who opens it wants to know which
         * question they are answering, and they already know which month the
         * caption says.
         */}
        <PopoverContent sideOffset={4} aria-label={label} className="w-auto p-0">
          <Calendar
            label={label}
            monthLabel={monthLabel(month)}
            weekdayLabels={weekdayLabels}
            firstWeekday={firstWeekday}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            month={month}
            onMonthChange={setMonth}
            value={chosen}
            onValueChange={choose}
            isDateDisabled={isDateDisabled}
            dayLabel={dayLabel}
            today={today}
          />
        </PopoverContent>
      </Popover>

      {shown === '' ? null : (
        <span id={valueId} className="sr-only">
          {shown}
        </span>
      )}

      {name === undefined ? null : (
        <input
          type="hidden"
          name={name}
          {...(form === undefined ? null : { form })}
          value={chosen === null ? '' : iso(chosen)}
          readOnly
        />
      )}
    </div>
  )
}

export { DatePicker }
