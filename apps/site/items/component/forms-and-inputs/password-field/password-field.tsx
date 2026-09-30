'use client'

import { useState } from 'react'

import { PasswordField } from '@nanisoft/prism-ui/components/password-field'

const LONGEST = 12

/**
 * The same field in the two jobs a password field has: signing in to something
 * that exists, and choosing something that does not exist yet. The second one
 * needs `autoComplete` said out loud, and the first one does not.
 */
export default function PasswordFieldDemo() {
  const [signIn, setSignIn] = useState('')
  const [chosen, setChosen] = useState('')
  const [confirmed, setConfirmed] = useState('')

  const tooShort = chosen !== '' && chosen.length < LONGEST
  const mismatch = confirmed !== '' && confirmed !== chosen

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <PasswordField
        label="Password"
        description="Your account password. A password manager can fill this in."
        value={signIn}
        onValueChange={setSignIn}
        revealLabel="Show the password"
        hideLabel="Hide the password"
      />

      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Two fields on one page need two different names and two different
          `autoComplete` values. Without the second one the platform offers to
          save a new secret as though the reader were signing back in.
        </p>

        <PasswordField
          label="New password"
          description={`At least ${LONGEST} characters. A passphrase is fine.`}
          value={chosen}
          onValueChange={setChosen}
          revealLabel="Show the new password"
          hideLabel="Hide the new password"
          autoComplete="new-password"
          error={tooShort ? `Use at least ${LONGEST} characters.` : undefined}
        />

        <PasswordField
          label="Confirm new password"
          value={confirmed}
          onValueChange={setConfirmed}
          revealLabel="Show the confirmation"
          hideLabel="Hide the confirmation"
          autoComplete="new-password"
          error={mismatch ? 'The two passwords are not the same.' : undefined}
        />
      </div>
    </div>
  )
}
