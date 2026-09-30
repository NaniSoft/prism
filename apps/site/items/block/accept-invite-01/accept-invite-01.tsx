'use client'

import { useState } from 'react'

import { AcceptInvite01 } from '@nanisoft/prism-ui/blocks/accept-invite-01'

/**
 * What is being joined, in what role, at whose invitation, and a way to refuse.
 *
 * The refusal is required, so the Demo has one. That is the whole of the design and it
 * is worth watching: press it and the secret you typed is gone, because there is
 * nothing left to decide and a screen that keeps asking has not accepted the answer.
 */
export default function AcceptInvite01Demo() {
  const [secret, setSecret] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expired, setExpired] = useState(false)
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'declined' | 'error'>('idle')
  const [message, setMessage] = useState<React.ReactNode>(null)
  const [withConfirm, setWithConfirm] = useState(true)

  function strengthOf(value: string) {
    const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((test) => test.test(value)).length
    const raw = Math.min(100, classes * 18 + (value.length >= 12 ? 25 : 0) + Math.min(20, value.length))
    const label = value.length === 0 ? 'Nothing yet' : raw < 40 ? 'Weak' : raw < 75 ? 'Fair' : 'Strong'
    return { label, value: raw }
  }

  function accept(value: { secret: string; confirm?: string }) {
    setSubmitting(true)
    setState('idle')
    setMessage(null)
    window.setTimeout(() => {
      setSubmitting(false)
      if (withConfirm && value.secret !== value.confirm) {
        setState('error')
        setMessage('Nothing was created. Correct the second entry and try again.')
        return
      }
      setState('done')
      setMessage('You are in. The estate has started sending you its overnight readings.')
    }, 600)
  }

  function decline() {
    setState('declined')
    setMessage('The invitation was declined. Bo has been told, and nothing was created.')
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        The refusal is a required prop, so it is beside the acceptance in the same row at the same size. There
        is no version of this screen where a reader has to go looking for the way out.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={withConfirm}
          onChange={(event) => setWithConfirm(event.target.checked)}
        />
        Ask for the secret twice
      </label>

      <AcceptInvite01
        eyebrow="You have been invited"
        title="Accept the invitation to Nexus Estate"
        description="Accepting starts an account for you here and gives an agent the ability to act in your name against this estate."
        workspace={{
          name: 'Nexus Estate',
          detail: 'Watching 61 properties for the Ardmore family.',
        }}
        role={{
          name: 'Maintainer',
          detail: 'You can start and stop collectors and change how they are configured.',
        }}
        invitedBy={{
          name: 'Bo Lindqvist',
          avatar: { name: 'Bo Lindqvist' },
          atLabel: 'Sent this morning',
        }}
        secret={{
          label: 'Choose a secret',
          revealLabel: 'Show the secret',
          hideLabel: 'Hide the secret',
          value: secret,
          onValueChange: setSecret,
          description: 'This secret is what authorises an agent to act for you. Nobody else will ever see it.',
          strength: strengthOf,
        }}
        confirm={
          withConfirm
            ? {
                label: 'Type it again',
                value: confirm,
                onValueChange: setConfirm,
                error:
                  state === 'error' && secret !== confirm ? 'Those two are not the same.' : undefined,
              }
            : undefined
        }
        submitLabel="Accept and set the secret"
        submitting={submitting}
        status={state === 'idle' ? undefined : { state, message }}
        decline={{ label: 'Decline this invitation', onDecline: decline }}
        expired={
          expired
            ? {
                message: 'This invitation was sent on Tuesday. Invitations last seven days, so it has run out.',
                requestLabel: 'Ask Bo for a new one',
                onRequest: () => setExpired(false),
              }
            : undefined
        }
        onSubmit={accept}
      />

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => {
            setExpired(true)
            setState('idle')
            setMessage(null)
            setSecret('')
            setConfirm('')
          }}
          className="text-sm underline underline-offset-4"
        >
          Show the expired arm
        </button>
        <button
          type="button"
          onClick={() => {
            setExpired(false)
            setState('idle')
            setMessage(null)
            setSecret('')
            setConfirm('')
          }}
          className="text-sm underline underline-offset-4"
        >
          Show the form
        </button>
      </div>
    </div>
  )
}
