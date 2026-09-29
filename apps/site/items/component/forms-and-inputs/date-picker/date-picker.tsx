'use client'

import { useState } from 'react'

import { DatePicker } from '@nanisoft/prism-ui/components/date-picker'
import { Label } from '@nanisoft/prism-ui/components/label'

const format = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(date)

const monthLabel = (month: Date) =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(month)

const dayLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(date)

/**
 * A date field with a second one that refuses Thursdays and the coming fortnight,
 * so the two halves of the picker are visible in one place.
 */
export default function DatePickerDemo() {
  const [delivery, setDelivery] = useState<Date | null>(null)
  const [review, setReview] = useState<Date | null>(new Date(2026, 4, 6))

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-picker-delivery" required>
          Delivery date
        </Label>
        <DatePicker
          id="date-picker-delivery"
          label="Delivery date"
          placeholder="Choose a date"
          name="delivery"
          format={format}
          monthLabel={monthLabel}
          weekdayLabels={['Mon', 'Tue', 'We', 'Th', 'Fr', 'Sa', 'Sun']}
          firstWeekday={1}
          previousLabel="Previous month"
          nextLabel="Next month"
          dayLabel={dayLabel}
          value={delivery}
          onValueChange={setDelivery}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-picker-review">Review date</Label>
        <DatePicker
          id="date-picker-review"
          label="Review date"
          format={format}
          monthLabel={monthLabel}
          weekdayLabels={['Mon', 'Tue', 'We', 'Th', 'Fr', 'Sa', 'Sun']}
          firstWeekday={1}
          previousLabel="Previous month"
          nextLabel="Next month"
          clearLabel="Clear the review date"
          dayLabel={dayLabel}
          value={review}
          onValueChange={setReview}
          isDateDisabled={(date) => {
            if (date.getDay() === 4) return true
            const today = new Date(2026, 2, 12)
            const fortnight = 14 * 24 * 60 * 60 * 1000
            return date.getTime() > today.getTime() && date.getTime() < today.getTime() + fortnight
          }}
        />
        <p className="text-muted-foreground text-sm">
          Thursdays and the fortnight after {monthLabel(new Date(2026, 2, 12))} cannot be
          chosen. They stay on the grid so you can see they exist.
        </p>
      </div>
    </div>
  )
}
