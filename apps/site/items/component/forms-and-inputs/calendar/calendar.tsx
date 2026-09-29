'use client'

import { useState } from 'react'

import { Calendar } from '@nanisoft/prism-ui/components/calendar'
import { Label } from '@nanisoft/prism-ui/components/label'

const monthLabel = (month: Date) =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(month)

const dayLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    date,
  )

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

/**
 * A month grid with the states that matter next to each other: a chosen date, a
 * month with disabled Sundays, and a grid showing today.
 */
export default function CalendarDemo() {
  const today = new Date(2026, 2, 12)
  const [month, setMonth] = useState(() => startOfMonth(today))
  const [date, setDate] = useState<Date | null>(new Date(2026, 2, 17))
  const [weekdayStart, setWeekdayStart] = useState<1 | 0>(1)
  const [closedSundays, setClosedSundays] = useState(true)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={weekdayStart === 1}
            onChange={(event) => setWeekdayStart(event.target.checked ? 1 : 0)}
          />
          Monday first
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={closedSundays}
            onChange={(event) => setClosedSundays(event.target.checked)}
          />
          Closed on Sundays
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="calendar-picker-demo">Chosen date</Label>
        <p id="calendar-picker-demo" className="text-muted-foreground text-sm">
          {date === null
            ? 'Nothing chosen yet'
            : new Intl.DateTimeFormat('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(date)}
        </p>
      </div>

      <Calendar
        label="Delivery date"
        monthLabel={monthLabel(month)}
        weekdayLabels={
          weekdayStart === 1
            ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
            : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        }
        firstWeekday={weekdayStart}
        previousLabel="Previous month"
        nextLabel="Next month"
        month={month}
        onMonthChange={setMonth}
        value={date}
        onValueChange={setDate}
        dayLabel={dayLabel}
        today={today}
        isDateDisabled={closedSundays ? (candidate) => candidate.getDay() === 0 : undefined}
      />
    </div>
  )
}
