'use client'

import { useState } from 'react'

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import {
  RecordForm01,
  type RecordForm01Issue,
} from '@nanisoft/prism-ui/blocks/record-form-01'
import type { FieldSpecGroup } from '@nanisoft/prism-ui/spec'

const GROUPS: readonly FieldSpecGroup[] = [
  {
    id: 'identity',
    label: 'Identity',
    description: 'What the workspace is called and who owns it.',
    fields: [
      {
        key: 'name',
        label: 'Workspace name',
        kind: 'Input',
        placeholder: 'Northwind',
        help: 'Shown in the workspace switcher.',
      },
      {
        key: 'slug',
        label: 'Slug',
        kind: 'Input',
        placeholder: 'northwind',
        help: 'Used in the workspace URL.',
      },
      {
        key: 'owner',
        label: 'Owner',
        kind: 'Combobox',
        placeholder: 'Find a person',
        options: [
          { value: 'ada', label: 'Ada Lovelace' },
          { value: 'grace', label: 'Grace Hopper' },
          { value: 'alan', label: 'Alan Turing' },
        ],
      },
      {
        key: 'plan',
        label: 'Plan',
        kind: 'Select',
        required: true,
        placeholder: 'Choose a plan',
        options: [
          { value: 'team', label: 'Team' },
          { value: 'business', label: 'Business' },
        ],
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    fields: [
      {
        key: 'seats',
        label: 'Seats',
        kind: 'NumberField',
        defaultValue: 5,
      },
      {
        key: 'budget',
        label: 'Monthly budget',
        kind: 'MoneyField',
        currency: 'USD',
        locale: 'en-US',
        defaultValue: 250,
      },
      {
        key: 'renewal',
        label: 'Renewal date',
        kind: 'DatePicker',
        help: 'Leave it empty to renew monthly.',
      },
    ],
  },
  {
    id: 'options',
    fields: [
      {
        key: 'notifications',
        label: 'Email me about usage',
        kind: 'Switch',
        defaultValue: true,
      },
      {
        key: 'regions',
        label: 'Regions',
        kind: 'ToggleGroup',
        options: [
          { value: 'us', label: 'US' },
          { value: 'eu', label: 'EU' },
          { value: 'apac', label: 'APAC' },
        ],
      },
      {
        key: 'note',
        label: 'Internal note',
        kind: 'slot',
        help: 'A control this package does not ship, drawn inside the same shell.',
        control: (
          <textarea
            name="note"
            rows={2}
            placeholder="Anything the next reader should know"
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
          />
        ),
      },
    ],
  },
]

/** A record write form rendered from a typed field specification. */
export default function RecordForm01Demo() {
  const [issues, setIssues] = useState<readonly RecordForm01Issue[]>([])
  const [formError, setFormError] = useState('')

  return (
    <RecordForm01
      title="New workspace"
      description="Create a workspace and choose who owns it."
      columns={2}
      groups={GROUPS}
      issues={issues}
      submitError={formError || undefined}
      footerStart={
        <CtaLink href="#" variant="ghost">
          Cancel
        </CtaLink>
      }
      submitLabel="Create workspace"
      onSubmit={(form) => {
        const data = new FormData(form)
        const name = String(data.get('name') ?? '').trim()
        const owner = String(data.get('owner') ?? '')

        const found: RecordForm01Issue[] = []
        if (name === '') found.push({ field: 'name', message: 'A workspace needs a name.' })
        if (owner === '') found.push({ field: 'owner', message: 'Choose an owner.' })

        setIssues(found)
        setFormError(
          found.length === 0
            ? ''
            : found.length > 1
              ? 'Two fields need attention before this is saved.'
              : 'One field needs attention before this is saved.',
        )
      }}
    />
  )
}
