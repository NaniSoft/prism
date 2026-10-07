'use client'

import { useState } from 'react'

import { AuthForm01 } from '@nanisoft/prism-ui/blocks/auth-form-01'
import type { FieldSpecGroup } from '@nanisoft/prism-ui/spec'

/**
 * The credential fields, as the shared field specification.
 *
 * An email is an `Input` with the platform's `autoComplete` hint a password
 * manager reads, and a password is the `PasswordField` this package ships, so the
 * vocabulary is the same one a record write form takes. The Block is uncontrolled,
 * so the values are read out of the form element at submit rather than held here.
 */
const GROUPS: readonly FieldSpecGroup[] = [
  {
    fields: [
      {
        key: 'auth-email',
        label: 'Email',
        kind: 'Input',
        autoComplete: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
      {
        key: 'auth-password',
        label: 'Password',
        kind: 'PasswordField',
        autoComplete: 'current-password',
        required: true,
      },
    ],
  },
]

/** A sign-in card with a submit-time message about the submission. */
export default function AuthForm01Demo() {
  const [error, setError] = useState<string>()

  return (
    <AuthForm01
      title="Sign in"
      description="Welcome back. Enter your details to continue."
      submitError={error}
      submitLabel="Sign in"
      groups={GROUPS}
      remember={{ id: 'auth-remember', label: 'Remember me for 30 days' }}
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const email = String(data.get('auth-email') ?? '').trim()
        const password = String(data.get('auth-password') ?? '')
        setError(email && password ? undefined : 'Enter your email and password to continue.')
      }}
      footer={
        <p className="text-muted-foreground text-center text-sm">
          No account yet? Create one.
        </p>
      }
    />
  )
}
