'use client'

import { useState } from 'react'

import { Label } from '@nanisoft/prism-ui/components/label'
import { NumberField } from '@nanisoft/prism-ui/components/number-field'

/**
 * A clamped quantity, a percentage with grouping, and one that arrives out of
 * range, so all three halves of the clamping claim can be seen.
 */
export default function NumberFieldDemo() {
  const [seats, setSeats] = useState<number | null>(2)
  const [budget, setBudget] = useState<number | null>(24500)
  const [overdue, setOverdue] = useState<number | null>(900)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="number-field-seats">Seats</Label>
        <NumberField
          id="number-field-seats"
          labels={{
            increment: 'Increase the number of seats',
            decrement: 'Decrease the number of seats',
          }}
          aria-label="Seats"
          name="seats"
          min={1}
          max={20}
          step={1}
          value={seats}
          onValueChange={setSeats}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="number-field-budget">Monthly budget</Label>
        <NumberField
          id="number-field-budget"
          labels={{
            increment: 'Increase the budget',
            decrement: 'Decrease the budget',
          }}
          aria-label="Monthly budget"
          unit="GBP"
          format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }}
          step={500}
          value={budget}
          onValueChange={setBudget}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="number-field-overdue">Overdue invoices</Label>
        <NumberField
          id="number-field-overdue"
          labels={{
            increment: 'Increase the overdue invoice count',
            decrement: 'Decrease the overdue invoice count',
          }}
          aria-label="Overdue invoices"
          min={0}
          max={100}
          defaultValue={overdue}
        />
        <p className="text-muted-foreground text-sm">
          This one starts at 900 and is pulled to 100 on the way in: a field that
          accepted it would submit a count the caller has already said is impossible.
        </p>
      </div>
    </div>
  )
}
