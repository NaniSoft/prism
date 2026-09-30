'use client'

import { useState } from 'react'

import { Login01, type Login01Status } from '@nanisoft/prism-ui/blocks/login-01'

/**
 * The sign-in, with a transport that can refuse in three different ways.
 *
 * The Demo owns every sentence and every decision, on purpose. That is the whole of
 * what this Block refuses: it will not rate-limit, will not decide whether the
 * identifier exists, and will not say whether the secret was right, so a preview that
 * showed one tidy failure would have shown the part Prism did not write. The three
 * refusals below are the three a real sign-in has, and each one is a different
 * sentence about a different fact.
 */
export default function Login01Demo() {
  const [identifier, setIdentifier] = useState('')
  const [secret, setSecret] = useState('')
  const [remember, setRemember] = useState(true)
  const [status, setStatus] = useState<Login01Status>()
  const [secondFactor, setSecondFactor] = useState(false)

  function signIn(value: { identifier: string; secret: string; remember: boolean }) {
    setStatus({ state: 'working', message: 'Checking the credentials.' })
    // Stands in for a request. Nothing leaves the browser, and that is the seam: the
    // caller owns the transport, the attempt counting and all three sentences.
    window.setTimeout(() => {
      if (value.identifier.length === 0) {
        setStatus({ state: 'error', message: 'That address is not on the list.' })
        return
      }
      if (value.secret.length < 8) {
        setSecret('')
        setStatus({
          state: 'error',
          message: 'That secret is not the one on file. Three tries left on this address.',
        })
        return
      }
      if (value.identifier.endsWith('@example.invalid')) {
        setStatus({
          state: 'error',
          message: 'Too many attempts from this network. Try again in a minute.',
        })
        return
      }
      setStatus({ state: 'error', message: 'Signed in. The machine on this account is now live.' })
    }, 600)
  }

  return (
    <div className="flex max-w-measure flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Press the control. A secret of fewer than eight characters gives the wrong-secret refusal, an
        address ending in <code>@example.invalid</code> gives the rate limit, and an empty address gives the
        unknown-address refusal. Anything else is signed in. Every one of those sentences is this Demo&rsquo;s,
        and there are no others in the Block.
      </p>

      <Login01
        headingLevel="h3"
        eyebrow="Nexus"
        title="Sign in to run an estate"
        description="An account here acts on your behalf: it observes estates, starts captures and holds the keys those runs use."
        identifier={{
          label: 'Work email',
          type: 'email',
          autoComplete: 'email',
          value: identifier,
          onValueChange: setIdentifier,
          description: 'The address your invitation went to. We key the account on it.',
        }}
        secret={{
          label: 'Secret phrase',
          revealLabel: 'Show the secret phrase',
          hideLabel: 'Hide the secret phrase',
          value: secret,
          onValueChange: setSecret,
          error: status?.state === 'error' && secret.length === 0 ? 'Enter the phrase you set.' : undefined,
        }}
        remember={{ label: 'Keep this device signed in for thirty days', value: remember, onValueChange: setRemember }}
        submitLabel="Sign in"
        submitting={status?.state === 'working'}
        status={status}
        secondFactor={
          secondFactor ? (
            <button
              type="button"
              onClick={() => setSecondFactor(false)}
              className="text-primary text-sm underline underline-offset-4"
            >
              Finish the second factor in your authenticator app, then come back here.
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSecondFactor(true)}
              className="text-primary text-sm underline underline-offset-4"
            >
              This account also has a second factor.
            </button>
          )
        }
        providers={
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="border-input hover:bg-accent rounded-md border px-3 py-2 text-sm"
            >
              Continue with your workplace identity provider
            </button>
            <p className="text-muted-foreground text-xs">
              The provider row is your slot, because a provider&rsquo;s mark is a licensed asset.
            </p>
          </div>
        }
        forgot={{ label: 'Reset the secret phrase', href: '/reset' }}
        signup={{ label: 'Create an account instead', href: '/signup' }}
        onSubmit={signIn}
      />
    </div>
  )
}
