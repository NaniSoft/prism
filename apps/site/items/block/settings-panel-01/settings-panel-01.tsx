'use client'

import { useState } from 'react'

import { SettingsPanel01 } from '@nanisoft/prism-ui/blocks/settings-panel-01'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import type { FieldSpecGroup } from '@nanisoft/prism-ui/spec'

/**
 * The settings region over the shared field specification, with a save arm and a
 * caller-written secondary node.
 *
 * The groups are `FieldSpecGroup` values, so a field is the same field a record
 * write form takes, including the `slot` arm. The values are the caller's, and the
 * save is the write form's `onSubmit` arm; the footer's cancel is a `CtaLink` the
 * caller wrote rather than a control the Block declares.
 */
const GROUPS: readonly FieldSpecGroup[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Shown to everyone you collaborate with.',
    fields: [
      {
        key: 'workspace-name',
        label: 'Workspace name',
        kind: 'Input',
        defaultValue: 'Northwind',
      },
      {
        key: 'workspace-description',
        label: 'Description',
        kind: 'Textarea',
        rows: 3,
        placeholder: 'What does this workspace do?',
      },
      {
        key: 'workspace-region',
        label: 'Data region',
        kind: 'Select',
        placeholder: 'Choose a region',
        options: [
          { value: 'eu-west', label: 'Europe West' },
          { value: 'us-east', label: 'US East' },
        ],
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    fields: [
      {
        key: 'weekly-digest',
        label: 'Weekly digest',
        kind: 'Switch',
        help: 'A summary of activity every Monday.',
        defaultValue: true,
      },
      {
        key: 'mention-alerts',
        label: 'Mention alerts',
        kind: 'Switch',
        help: 'Notify me when someone mentions my name.',
      },
      {
        key: 'theme',
        label: 'Accent',
        kind: 'slot',
        help: 'A control this package does not ship, drawn inside the same shell.',
        control: (
          <input
            type="color"
            name="theme"
            defaultValue="#4f46e5"
            className="border-input bg-background h-9 w-16 rounded-md border p-1"
          />
        ),
      },
    ],
  },
]

export default function SettingsPanel01Demo() {
  const [values, setValues] = useState<Record<string, unknown>>({
    'workspace-name': 'Northwind',
    'workspace-region': 'eu-west',
    'weekly-digest': true,
  })

  return (
    <SettingsPanel01
      title="Workspace settings"
      description="Manage how this workspace behaves for everyone on the team."
      groups={GROUPS}
      values={values}
      onValueChange={(key, value) => setValues((held) => ({ ...held, [key]: value }))}
      submitLabel="Save changes"
      onSubmit={() => undefined}
      footerStart={
        <CtaLink href="#" variant="ghost">
          Cancel
        </CtaLink>
      }
    />
  )
}
