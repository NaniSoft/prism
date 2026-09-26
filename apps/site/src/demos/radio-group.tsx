'use client'

import { FieldLabel } from '@nanisoft/prism-ui/components/field'
import { RadioGroup, RadioGroupItem } from '@nanisoft/prism-ui/components/radio-group'

/** A radio group with one option preselected and one disabled. */
export default function RadioGroupDemo() {
  return (
    <RadioGroup
      defaultValue="daily"
      aria-label="Notification frequency"
      className="max-w-measure-narrow"
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem id="radio-daily" value="daily" className="mt-0.5" />
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="radio-daily">Daily digest</FieldLabel>
          <span className="text-muted-foreground text-sm">One message each morning.</span>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <RadioGroupItem id="radio-weekly" value="weekly" className="mt-0.5" />
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="radio-weekly">Weekly summary</FieldLabel>
          <span className="text-muted-foreground text-sm">One message on Monday.</span>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <RadioGroupItem id="radio-never" value="never" disabled className="mt-0.5" />
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="radio-never" className="text-muted-foreground">
            Never
          </FieldLabel>
          <span className="text-muted-foreground text-sm">
            Disabled while an audit hold is active.
          </span>
        </div>
      </div>
    </RadioGroup>
  )
}
