'use client'

import { Button } from '@nanisoft/prism-ui/components'

import {
  SettingsSecurity01,
  type SettingsSecurityMethod,
  type SettingsSecuritySession,
} from '@nanisoft/prism-ui/blocks/settings-security-01'

/** The sentence a method's control announces, and it carries the visible name. */
function methodToggleLabel(
  method: { id: string; name: string },
  on: boolean,
): string {
  return on ? `Turn ${method.name.toLowerCase()} on` : `Turn ${method.name.toLowerCase()} off`
}

/** A revoke control that names the device, because "revoke" twice is not an instruction. */
function revokeLabel(session: { id: string; device: string }): string {
  return `Sign out ${session.device.toLowerCase()}`
}

/** A start date in the reader's own locale, formatted by the Demo and not by the Block. */
function startedAtLabel(value: number | string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

const METHODS: SettingsSecurityMethod[] = [
  {
    id: 'passkey',
    name: 'A passkey on this device',
    state: 'enabled',
    stateLabel: 'In use',
    detail: 'Held by the browser on this device, and never sent to us.',
    addedLabel: 'Added 3 March',
  },
  {
    id: 'app',
    name: 'A code from the mobile app',
    state: 'enabled',
    stateLabel: 'In use',
    addedLabel: 'Added 3 March',
  },
  {
    id: 'backup',
    name: 'A recovery code',
    state: 'pending',
    stateLabel: 'Waiting for you to confirm it',
    detail: 'A code was generated on 28 August and has not been written down.',
  },
  {
    id: 'phrase',
    name: 'A password',
    state: 'disabled',
    stateLabel: 'Not turned on',
    detail: 'Turning this on asks every reader of this workspace for a phrase.',
  },
]

const SESSIONS: SettingsSecuritySession[] = [
  {
    id: 'here',
    device: 'This laptop',
    location: 'Where you are',
    isCurrent: true,
    currentLabel: 'Signed in here',
  },
  {
    id: 'phone',
    device: 'A phone',
    location: 'Somewhere else',
    startedAt: Date.UTC(2026, 6, 14),
    startedAtLabel,
  },
  {
    id: 'kiosk',
    device: 'The screen in the corridor',
    location: 'The site office',
    startedAt: Date.UTC(2026, 8, 2),
    startedAtLabel,
    // The caller's own control, in place of the Block's, because revoking a shared
    // screen is a thing a product confirms and a thing an admin may not do alone.
    revoke: (
      <Button size="sm" variant="ghost">
        Sign out the screen
      </Button>
    ),
  },
]

/** Every group named, then the same surface with no group names at all. */
export default function SettingsSecurity01Demo() {
  return (
    <>
      <SettingsSecurity01
        headingLevel="h3"
        eyebrow="Preview"
        title="How this workspace keeps its readers in"
        description="Four ways in, one of them half finished and therefore carrying no control. The revoke control is on the reader's own session, which is the decision most often got wrong."
        labels={{
          methods: 'Ways to sign in',
          password: 'Change your password',
          sessions: 'Where this workspace is signed in',
          twoFactor: 'A second factor',
        }}
        methods={METHODS}
        onMethodChange={() => {}}
        methodToggleLabel={methodToggleLabel}
        changePassword={{
          fields: [
            { id: 'current', label: 'Your current password', type: 'current' },
            { id: 'next', label: 'A new password', type: 'new' },
            { id: 'confirm', label: 'The new password again', type: 'confirm' },
          ],
          onSubmit: () => {},
          submitLabel: 'Change the password',
          revealLabel: 'Show the password',
          hideLabel: 'Hide the password',
        }}
        sessions={SESSIONS}
        onRevokeSession={() => {}}
        revokeLabel={revokeLabel}
        twoFactor={{
          state: 'off',
          stateLabel: 'Not turned on',
          action: (
            <Button size="sm" variant="outline">
              Turn it on
            </Button>
          ),
        }}
        empty="This workspace has no way to sign in yet."
      />
      <SettingsSecurity01
        headingLevel="h3"
        eyebrow="Preview"
        title="A second factor that is half set up"
        description="Enrolled is the third answer, and it is the one a two-state surface cannot give: a secret has been generated and the reader has not confirmed it."
        labels={{ methods: 'Ways to sign in', twoFactor: 'A second factor' }}
        methods={METHODS.slice(0, 1)}
        twoFactor={{
          state: 'enrolled',
          stateLabel: 'A code is waiting for you to confirm it',
          action: (
            <Button size="sm" variant="outline">
              Finish setting it up
            </Button>
          ),
        }}
        empty="This workspace has no way to sign in yet."
      />
      <SettingsSecurity01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same surface with no group names"
        description="Every group name is optional. A group with no name is not a mystery, and four required names would be four sentences a consumer writes for groups they may not have."
        methods={METHODS}
        empty="This workspace has no way to sign in yet."
      />
      <SettingsSecurity01
        headingLevel="h3"
        eyebrow="Preview"
        title="A workspace with no ways in"
        description="The empty sentence is yours, because a workspace with no way to sign in and a workspace whose methods failed to load are not the same page."
        methods={[]}
        empty="This workspace has no way to sign in yet. An owner has to add one before anybody can reach it."
      />
    </>
  )
}
