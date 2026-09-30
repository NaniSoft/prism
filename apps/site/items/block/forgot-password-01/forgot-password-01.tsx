'use client'

import { useState } from 'react'

import { ForgotPassword01 } from '@nanisoft/prism-ui/blocks/forgot-password-01'

/**
 * One identifier, one control, and one sentence for both outcomes.
 *
 * The Demo owns the transport and, more to the point, it owns the sentence. The Block
 * holds no prop that could say whether an account was found, which is the whole
 * design: the two cases below reach the same confirmation and the only thing that
 * differed between them was decided here, in words, where the disclosure decision
 * belongs.
 */
export default function ForgotPassword01Demo() {
  const [identifier, setIdentifier] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<React.ReactNode>(null)

  // The one sentence both outcomes reach, and the Demo writes it rather than the Block.
  const CONFIRMATION = 'If that address is on an account here, a link is on its way to it now.'

  function recover(value: { identifier: string }) {
    setSubmitting(true)
    setState('idle')
    setMessage(null)
    // Stands in for a request. Nothing leaves the browser, and that is exactly the
    // seam: the caller owns the transport and the sentences.
    window.setTimeout(() => {
      setSubmitting(false)
      const address = value.identifier.trim().toLowerCase()
      if (address.endsWith('@example.invalid')) {
        // The one refusal there is, and it is a refusal of the request rather than of
        // the account. A refusal this Block shipped would be the sentence on the screen
        // most certainly wrong in somebody else's product.
        setSent(false)
        setState('error')
        setMessage('The recovery service is not answering. Try again in a minute.')
        return
      }
      // The arm replaces the form, and the arm is what reports the outcome, so no
      // status is passed here. Passing the same sentence in both would draw it twice.
      setSent(true)
      setState('idle')
      setMessage(null)
    }, 600)
  }

  function resend() {
    setSubmitting(true)
    setMessage(null)
    window.setTimeout(() => {
      setSubmitting(false)
      // A different sentence from the confirmation, because this is the outcome of the
      // second request rather than the announcement that one was taken.
      setState('sent')
      setMessage('Sent again. It replaces the first link, so the older one no longer works.')
    }, 500)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Type an address ending in <code>@example.invalid</code> to see the one refusal there is. Everything
        else reaches the same confirmation, whether or not an account exists, because this Demo writes one
        sentence for both cases and the Block has nowhere to put a second one.
      </p>

      <ForgotPassword01
        eyebrow="Account recovery"
        title="Send me a way back in"
        description="We will send a link to the address on the account. If nobody is expecting it, they can ignore it and nothing else will happen."
        identifier={{
          label: 'Email address',
          type: 'email',
          value: identifier,
          onValueChange: setIdentifier,
        }}
        submitLabel="Send the link"
        submitting={submitting}
        onSubmit={recover}
        status={state === 'idle' ? undefined : { state, message }}
        sent={
          sent
            ? {
                message: CONFIRMATION,
                resendLabel: 'Send it again',
                onResend: resend,
              }
            : undefined
        }
        back={{ label: 'Back to signing in', href: '/sign-in' }}
      />

      {sent ? (
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setState('idle')
            setMessage(null)
          }}
          className="self-start text-sm underline underline-offset-4"
        >
          Start again
        </button>
      ) : null}
    </div>
  )
}
