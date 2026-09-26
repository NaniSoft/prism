'use client'

import { SettingsPanel01 } from '@nanisoft/prism-ui/blocks/settings-panel-01'

/** A grouped settings form with text, select and switch fields. */
export default function SettingsPanel01Demo() {
  return (
    <SettingsPanel01
      title="Workspace settings"
      description="Manage how this workspace behaves for everyone on the team."
      submitLabel="Save changes"
      secondaryAction={{ label: 'Cancel' }}
      sections={[
        {
          id: 'general',
          title: 'General',
          description: 'Shown to everyone you collaborate with.',
          fields: [
            {
              kind: 'text',
              id: 'workspace-name',
              label: 'Workspace name',
              defaultValue: 'Northwind',
            },
            {
              kind: 'textarea',
              id: 'workspace-description',
              label: 'Description',
              placeholder: 'What does this workspace do?',
              rows: 3,
            },
            {
              kind: 'select',
              id: 'workspace-region',
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
        {
          id: 'notifications',
          title: 'Notifications',
          fields: [
            {
              kind: 'switch',
              id: 'weekly-digest',
              label: 'Weekly digest',
              description: 'A summary of activity every Monday.',
              defaultChecked: true,
            },
            {
              kind: 'switch',
              id: 'mention-alerts',
              label: 'Mention alerts',
              description: 'Notify me when someone mentions my name.',
            },
          ],
        },
      ]}
    />
  )
}
