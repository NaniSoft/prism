'use client'

import { FieldLabel } from '@nanisoft/prism-ui/components/field'
import { Switch } from '@nanisoft/prism-ui/components/switch'

/** Switches that take effect immediately, one of them already on. */
export default function SwitchDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="switch-notifications">Release notifications</FieldLabel>
          <span className="text-muted-foreground text-sm">
            A message when a new version is published.
          </span>
        </div>
        <Switch id="switch-notifications" defaultChecked />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="switch-preview">Preview builds</FieldLabel>
          <span className="text-muted-foreground text-sm">
            Build every pull request on the free plan.
          </span>
        </div>
        <Switch id="switch-preview" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <FieldLabel htmlFor="switch-sso" className="text-muted-foreground">
          Single sign-on
        </FieldLabel>
        <Switch id="switch-sso" disabled />
      </div>
    </div>
  )
}
