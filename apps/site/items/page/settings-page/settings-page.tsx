'use client'

import { SettingsPage } from '@nanisoft/prism-ui/pages/settings-page'

const LINKS = [
  { href: '#general', label: 'General', current: false },
  { href: '#settings', label: 'Settings', current: true },
  { href: '#members', label: 'Members', current: false },
]

/** The settings page, with a grouped form per tab. */
export default function SettingsPageDemo() {
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
            submitLabel: 'Save changes',
            secondaryAction: { label: 'Cancel' },
            sections: [
              {
                id: 'identity',
                title: 'Identity',
                fields: [
                  {
                    kind: 'text',
                    id: 'settings-workspace-name',
                    label: 'Workspace name',
                    defaultValue: 'Northwind',
                  },
                  {
                    kind: 'textarea',
                    id: 'settings-workspace-description',
                    label: 'Description',
                    placeholder: 'What does this workspace do?',
                    rows: 3,
                  },
                  {
                    kind: 'select',
                    id: 'settings-workspace-region',
                    label: 'Data region',
                    placeholder: 'Choose a region',
                    defaultValue: 'eu-west',
                    options: [
                      { label: 'Europe West', value: 'eu-west' },
                      { label: 'US East', value: 'us-east' },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          value: 'notifications',
          label: 'Notifications',
          panel: {
            title: 'Notifications',
            description: 'Choose what the workspace sends and when.',
            submitLabel: 'Save changes',
            sections: [
              {
                id: 'email',
                title: 'Email',
                fields: [
                  {
                    kind: 'switch',
                    id: 'settings-weekly-digest',
                    label: 'Weekly digest',
                    description: 'A summary of activity every Monday.',
                    defaultChecked: true,
                  },
                  {
                    kind: 'switch',
                    id: 'settings-mention-alerts',
                    label: 'Mention alerts',
                    description: 'Notify me when someone mentions my name.',
                  },
                ],
              },
            ],
          },
        },
      ]}
    />
  )
}
