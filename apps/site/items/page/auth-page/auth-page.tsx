'use client'

import { useState } from 'react'

import { AuthPage } from '@nanisoft/prism-ui/pages/auth-page'
import type { FieldSpecGroup } from '@nanisoft/prism-ui/spec'

const GROUPS: readonly FieldSpecGroup[] = [
  {
    fields: [
      {
        key: 'auth-page-email',
        label: 'Email',
        kind: 'Input',
        autoComplete: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
      {
        key: 'auth-page-password',
        label: 'Password',
        kind: 'PasswordField',
        autoComplete: 'current-password',
        required: true,
      },
    ],
  },
]

/** The auth page, with an uncontrolled credential form and a supporting card. */
export default function AuthPageDemo() {
  const [error, setError] = useState<string>()

  return (
    <AuthPage
      form={{
        title: 'Sign in',
        description: 'Welcome back. Enter your details to continue.',
        submitError: error,
        submitLabel: 'Sign in',
        groups: GROUPS,
        remember: { id: 'auth-page-remember', label: 'Remember me for 30 days' },
        onSubmit: (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const email = String(data.get('auth-page-email') ?? '').trim()
          const password = String(data.get('auth-page-password') ?? '')
          setError(email && password ? undefined : 'Enter your email and password to continue.')
        },
      }}
      aside={{
        title: 'Everything in one workspace',
        description: 'Projects, deployments and usage, without a second tool.',
        children: (
          <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
            <li>One place for every team</li>
            <li>Usage that updates as you deploy</li>
            <li>Roles from viewer to admin</li>
          </ul>
        ),
      }}
      footer={<p>No account yet? Create one.</p>}
    />
  )
}
