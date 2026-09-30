'use client'

import { useState } from 'react'

import { MiniCalendar } from '@nanisoft/prism-ui/components/mini-calendar'

const longDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(date)

/**
 * Three grids: one bounded and chosen, one bounded with nothing chosen, and one
 * that begins the week on Monday and is read only.
 */
export default function MiniCalendarDemo() {
  const [booked, setBooked] = useState<Date | undefined>(undefined)
  const [delivered, setDelivered] = useState<Date | undefined>(undefined)

  const today = new Date()
  const horizon = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())

  return (
    <div className="flex max-w-measure flex-wrap items-start gap-8">
      <div className="flex flex-col gap-2">
        <MiniCalendar
          label="Booked from"
          locale="en-GB"
          weekStartsOn={0}
          previousLabel="Previous month"
          nextLabel="Next month"
          min={today}
          max={horizon}
          selected={booked}
          onSelect={setBooked}
        />
        <p className="text-muted-foreground text-sm">
          {booked === undefined
            ? 'Nothing booked. Days before today and after the horizon are drawn, reachable and refusing.'
            : `Booked from ${longDate(booked)}.`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <MiniCalendar
          label="Delivered on"
          locale="en-GB"
          weekStartsOn={1}
          previousLabel="Previous month"
          nextLabel="Next month"
          min={today}
          selected={delivered}
          onSelect={setDelivered}
        />
        <p className="text-muted-foreground text-sm">
          The same grid on a Monday-first week, with no upper bound. The weekday
          headings come from the locale, so this one starts on Monday without a
          table of names anywhere in the Component.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <MiniCalendar
          label="Archive month"
          locale="en-GB"
          weekStartsOn={1}
          previousLabel="Previous month"
          nextLabel="Next month"
          defaultMonth={new Date(2025, 10, 1)}
        />
        <p className="text-muted-foreground text-sm">
          Read only. A grid with no `onSelect` shows the month and its paging
          controls and refuses to answer, which is what an archive panel wants.
        </p>
      </div>
    </div>
  )
}
