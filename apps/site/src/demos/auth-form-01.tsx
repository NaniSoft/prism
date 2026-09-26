'use client'

import { useState } from 'react'

import { AuthForm01 } from '@nanisoft/prism-ui/blocks/auth-form-01'

/** A sign-in card with controlled fields and a submit-time error. */
export default function AuthForm01Demo() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  return (
    <AuthForm01
      title="Sign in"
      description="Welcome back. Enter your details to continue."
      error={error}
      submitLabel="Sign in"
      fields={[
        {
          id: 'auth-email',
          label: 'Email',
          type: 'email',
          autoComplete: 'email',
          placeholder: 'you@example.com',
          value: email,
          onChange: setEmail,
          required: true,
        },
        {
          id: 'auth-password',
          label: 'Password',
          type: 'password',
          autoComplete: 'current-password',
          value: password,
          onChange: setPassword,
          required: true,
        },
      ]}
      remember={{ id: 'auth-remember', label: 'Remember me for 30 days' }}
      onSubmit={(event) => {
        event.preventDefault()
        setError(
          email && password ? undefined : 'Enter your email and password to continue.',
        )
      }}
      footer={
        <p className="text-muted-foreground text-center text-sm">
          No account yet? Create one.
        </p>
      }
    />
  )
}
