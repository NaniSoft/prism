'use client'

import { useState } from 'react'

import { ResetPassword01 } from '@nanisoft/prism-ui/blocks/reset-password-01'

/**
 * Two entries and the three states this screen actually spends its life in.
 *
 * The Demo owns the transport, the strength function and every sentence, including
 * the one the expired arm is for. The Block draws the arms and refuses to compare the
 * two entries, because whether they match is the product's validation and the words
 * beside a mismatch are its too.
 */
export default function ResetPassword01Demo() {
  const [secret, setSecret] = useState('')
  const [confirm, setConfirm] = useState('')
  const [expired, setExpired] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<React.ReactNode>(null)

  /**
   * The strength note, and it is a function because the honest reading changes as the
   * reader types. Four products rate a secret on four different scales; this one rates
   * it out of a hundred and names the band in its own words.
   */
  function strengthOf(value: string) {
    const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((test) => test.test(value)).length
    const longEnough = value.length >= 12 ? 25 : 0
    const raw = Math.min(100, classes * 18 + longEnough + Math.min(20, value.length))
    const label = value.length === 0 ? 'Nothing yet' : raw < 40 ? 'Weak' : raw < 75 ? 'Fair' : 'Strong'
    return { label, value: raw }
  }

  function submit(value: { secret: string; confirm: string }) {
    setSubmitting(true)
    setState('idle')
    setMessage(null)
    window.setTimeout(() => {
      setSubmitting(false)
      // The mismatch is caught here and not in the Block. That is the whole of the
      // decision: a design system that compared the two entries would be installing a
      // rule, and a sentence about it, in four products at once.
      if (value.secret !== value.confirm) {
        setState('error')
        setMessage('Those two are not the same. Type the second one again.')
        return
      }
      setState('done')
      setMessage('The secret has changed. Anything still using the old one is signed out.')
    }, 600)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        This Demo opens on the expired arm, because that is the state a real reset screen spends most of its
        life in. Type the two entries differently to see the refusal, which the Demo decides and the Block
        draws.
      </p>

      <ResetPassword01
        eyebrow="Account recovery"
        title="Choose a new secret"
        description="Pick something this product has not asked you for before. You will be signed out of every other session."
        secret={{
          label: 'New secret',
          revealLabel: 'Show the secret',
          hideLabel: 'Hide the secret',
          value: secret,
          onValueChange: setSecret,
          description: 'Twelve characters or more is the floor this product uses.',
          strength: strengthOf,
        }}
        confirm={{
          label: 'Type it again',
          value: confirm,
          onValueChange: setConfirm,
          error: state === 'error' && secret !== confirm ? 'Those two are not the same.' : undefined,
        }}
        submitLabel="Save the new secret"
        submitting={submitting}
        status={state === 'idle' ? undefined : { state, message }}
        expired={
          expired
            ? {
                message: 'That link was made an hour ago and links last fifteen minutes. Nothing you type here can use it.',
                requestLabel: 'Send me a new link',
                onRequest: () => setExpired(false),
              }
            : undefined
        }
        onSubmit={submit}
      />

      {state === 'done' || expired === false ? (
        <button
          type="button"
          onClick={() => {
            setExpired(true)
            setState('idle')
            setMessage(null)
            setSecret('')
            setConfirm('')
          }}
          className="self-start text-sm underline underline-offset-4"
        >
          Start again
        </button>
      ) : null}
    </div>
  )
}
