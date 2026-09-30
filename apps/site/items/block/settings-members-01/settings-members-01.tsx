'use client'

import { Button } from '@nanisoft/prism-ui/components'

import {
  SettingsMembers01,
  type SettingsMembersMember,
} from '@nanisoft/prism-ui/blocks/settings-members-01'

/**
 * The words for a role, written per option rather than per state.
 *
 * They carry the option's own label because that is the visible text of the
 * control, and a visible label has to be inside the accessible name for a reader
 * using voice control to be able to act on the words they can see.
 */
function roleLabel(option: { id: string; label: string }): string {
  return `${option.label} of this workspace`
}

/**
 * A joined reading, formatted in the reader's own locale.
 *
 * The Demo formats it because a Demo is the documentation site's own content and
 * not a Block's: a Block that formatted a moment would be choosing a locale and a
 * calendar on a reader's behalf.
 */
function joinedLabel(value: number | string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

const MEMBERS: SettingsMembersMember[] = [
  {
    id: 'ada',
    name: 'Ada Okonkwo',
    email: 'ada@example.com',
    role: 'owner',
    roleLabel: 'Owner of this workspace',
    avatar: { name: 'Ada Okonkwo' },
    isSelf: true,
    selfLabel: 'That is you',
  },
  {
    id: 'bo',
    name: 'Bo Lindqvist',
    email: 'bo@example.com',
    role: 'admin',
    roleLabel: 'Admin of this workspace',
    avatar: { src: '/people/bo.jpg', name: 'Bo Lindqvist' },
    joined: Date.UTC(2025, 2, 3),
    joinedLabel,
    actions: (
      <Button size="sm" variant="ghost">
        Remove
      </Button>
    ),
  },
  {
    id: 'cy',
    name: 'Cy Ramaswamy',
    email: 'cy@example.com',
    role: 'member',
    roleLabel: 'Member of this workspace',
    avatar: { name: 'Cy Ramaswamy' },
    joined: Date.UTC(2025, 8, 19),
    joinedLabel,
    actions: (
      <Button size="sm" variant="ghost">
        Remove
      </Button>
    ),
  },
  {
    id: 'dee',
    name: 'Dee Vasquez',
    email: 'dee@example.com',
    role: 'viewer',
    roleLabel: 'Viewer of this workspace',
    joined: Date.UTC(2026, 0, 8),
    joinedLabel,
    actions: (
      <Button size="sm" variant="ghost">
        Remove
      </Button>
    ),
  },
]

/** Rows first, then the table arrangement, then the workspace of one. */
export default function SettingsMembers01Demo() {
  return (
    <>
      <SettingsMembers01
        headingLevel="h3"
        eyebrow="Preview"
        title="Members"
        description="Four people, one of them the reader. The reader's own row states its role as words and offers no control, which is the decision the flag exists for."
        members={MEMBERS}
        invitations={[
          { id: 'inv-1', email: 'fen@example.com', sentAt: 'Sent 12 September' },
          { id: 'inv-2', email: 'gus@example.com', sentAt: 'Sent 2 September' },
          {
            id: 'inv-3',
            email: 'hal@example.com',
            sentAt: 'Sent 18 August',
            expiresLabel: 'Expired five days ago',
          },
        ]}
        pendingTitle="Invitations you have sent"
        inviteLabel={<Button>Invite someone</Button>}
        roleOptions={[
          { id: 'owner', label: 'Owner' },
          { id: 'admin', label: 'Admin' },
          { id: 'member', label: 'Member' },
          { id: 'viewer', label: 'Viewer' },
        ]}
        roleLabel={roleLabel}
        onRoleChange={() => {}}
        empty="Nobody else is in this workspace yet."
      />
      <SettingsMembers01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same four as a table"
        description="With columns the members become a real table, and the name column is the one that names the row, so a screen reader can navigate it."
        members={MEMBERS}
        columns={[
          { id: 'name', header: 'Person' },
          { id: 'role', header: 'Access' },
          { id: 'joined', header: 'Joined' },
        ]}
        roleOptions={[
          { id: 'owner', label: 'Owner' },
          { id: 'admin', label: 'Admin' },
          { id: 'member', label: 'Member' },
          { id: 'viewer', label: 'Viewer' },
        ]}
        roleLabel={roleLabel}
        onRoleChange={() => {}}
        empty="Nobody else is in this workspace yet."
      />
      <SettingsMembers01
        headingLevel="h3"
        eyebrow="Preview"
        title="A workspace of one"
        description="The empty sentence is yours, because a workspace nobody has been added to and a workspace whose list failed to load are not the same page."
        members={[]}
        empty="This workspace has only you in it. Invite someone and they will appear here."
      />
    </>
  )
}
