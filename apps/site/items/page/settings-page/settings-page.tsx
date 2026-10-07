'use client'

import { useState } from 'react'

import { SettingsPage } from '@nanisoft/prism-ui/pages/settings-page'
import type { FieldSpecGroup } from '@nanisoft/prism-ui/spec'

const LINKS = [
  { href: '#general', label: 'General', current: false },
  { href: '#settings', label: 'Settings', current: true },
  { href: '#members', label: 'Members', current: false },
]

const GENERAL: readonly FieldSpecGroup[] = [
  {
    id: 'identity',
    label: 'Identity',
    fields: [
      {
        key: 'settings-workspace-name',
        label: 'Workspace name',
        kind: 'Input',
        defaultValue: 'Northwind',
      },
      {
        key: 'settings-workspace-description',
        label: 'Description',
        kind: 'Textarea',
        rows: 3,
        placeholder: 'What does this workspace do?',
      },
      {
        key: 'settings-workspace-region',
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
]

const NOTIFICATIONS: readonly FieldSpecGroup[] = [
  {
    id: 'email',
    label: 'Email',
    fields: [
      {
        key: 'settings-weekly-digest',
        label: 'Weekly digest',
        kind: 'Switch',
        help: 'A summary of activity every Monday.',
        defaultValue: true,
      },
      {
        key: 'settings-mention-alerts',
        label: 'Mention alerts',
        kind: 'Switch',
        help: 'Notify me when someone mentions my name.',
      },
    ],
  },
]

/** The settings page, with a grouped shared-specification form per tab. */
export default function SettingsPageDemo() {
  const [values, setValues] = useState<Record<string, unknown>>({
    'settings-workspace-name': 'Northwind',
    'settings-workspace-region': 'eu-west',
    'settings-weekly-digest': true,
  })

  const change = (key: string, value: unknown) =>
    setValues((held) => ({ ...held, [key]: value }))

  return (
    <SettingsPage
      shell={{
        navigationLabel: 'Primary',
        brand: <span className="text-sm font-semibold">Northwind</span>,
        breadcrumbs: [{ label: 'Settings', href: '#settings' }, { label: 'Workspace' }],
        navigation: (
          <ul className="flex flex-col gap-1 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={
                    link.current
                      ? 'bg-accent text-accent-foreground block rounded-md px-3 py-2 font-medium'
                      : 'text-muted-foreground hover:text-foreground block rounded-md px-3 py-2'
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ),
      }}
      header={{
        title: 'Workspace settings',
        description: 'Manage how this workspace behaves for everyone on the team.',
      }}
      tabs={[
        {
          value: 'general',
          label: 'General',
          panel: {
            title: 'General',
            description: 'Shown to everyone you collaborate with.',
            groups: GENERAL,
            values,
            onValueChange: change,
            submitLabel: 'Save changes',
            onSubmit: () => undefined,
            footerStart: <a href="#general">Cancel</a>,
          },
        },
        {
          value: 'notifications',
          label: 'Notifications',
          panel: {
            title: 'Notifications',
            description: 'Choose what the workspace sends and when.',
            groups: NOTIFICATIONS,
            values,
            onValueChange: change,
            submitLabel: 'Save changes',
            onSubmit: () => undefined,
          },
        },
      ]}
    />
  )
}
