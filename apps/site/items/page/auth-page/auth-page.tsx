'use client'

import { useState } from 'react'

import { AuthPage } from '@nanisoft/prism-ui/pages/auth-page'

/** The auth page, with a controlled form and a supporting card. */
export default function AuthPageDemo() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  return (
    <AuthPage
      form={{
        title: 'Sign in',
        description: 'Welcome back. Enter your details to continue.',
        error,
        submitLabel: 'Sign in',
        fields: [
          {
            id: 'auth-page-email',
            label: 'Email',
            type: 'email',
            autoComplete: 'email',
            placeholder: 'you@example.com',
            value: email,
            onChange: setEmail,
            required: true,
          },
          {
            id: 'auth-page-password',
            label: 'Password',
            type: 'password',
            autoComplete: 'current-password',
            value: password,
            onChange: setPassword,
            required: true,
          },
        ],
        remember: { id: 'auth-page-remember', label: 'Remember me for 30 days' },
        onSubmit: (event) => {
          event.preventDefault()
          setError(
            email && password ? undefined : 'Enter your email and password to continue.',
          )
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
