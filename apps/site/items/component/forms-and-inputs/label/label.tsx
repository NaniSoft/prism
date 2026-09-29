'use client'

import { useState } from 'react'

import { Input } from '@nanisoft/prism-ui/components/input'
import { Label } from '@nanisoft/prism-ui/components/label'

/**
 * The three states a standalone label has to get right: plain, required with the
 * reader's own mark, and dimmed with a disabled control.
 */
export default function LabelDemo() {
  const [filter, setFilter] = useState('')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label-demo-filter">Filter runs</Label>
        <Input
          id="label-demo-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="by name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label-demo-email" required requiredText=" (required)">
          Email
        </Label>
        <Input id="label-demo-email" type="email" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label-demo-legacy" disabled>
          Workspace identifier
        </Label>
        <Input id="label-demo-legacy" defaultValue="pr_01HZX" disabled readOnly />
      </div>
    </div>
  )
}
