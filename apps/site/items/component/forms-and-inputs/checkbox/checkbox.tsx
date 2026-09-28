'use client'

import { Checkbox } from '@nanisoft/prism-ui/components/checkbox'
import { FieldLabel } from '@nanisoft/prism-ui/components/field'

/** Checkbox at rest, ticked, mixed and disabled. */
export default function CheckboxDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-news" defaultChecked />
        <FieldLabel htmlFor="checkbox-news">Email me release notes</FieldLabel>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-all" indeterminate />
        <FieldLabel htmlFor="checkbox-all">Select all invoices</FieldLabel>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-quiet" />
        <FieldLabel htmlFor="checkbox-quiet">Send a weekly digest</FieldLabel>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-sso" disabled />
        <FieldLabel htmlFor="checkbox-sso" className="text-muted-foreground">
          Single sign-on (paid plan)
        </FieldLabel>
      </div>
    </div>
  )
}
