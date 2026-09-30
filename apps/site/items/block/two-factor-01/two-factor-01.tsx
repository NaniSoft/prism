'use client'

import { useState } from 'react'

import { TwoFactor01, type TwoFactor01Status } from '@nanisoft/prism-ui/blocks/two-factor-01'

/**
 * The second factor, with a transport that refuses without counting anything.
 *
 * The Demo owns the attempt count, because the Block deliberately does not have one.
 * Press the control four times with the wrong code and the Demo says three tries
 * left, then two, then one, and locks the account. That counter is a security
 * decision and an availability one, and a design system that made it would be
 * shipping a lockout policy into every product that installed it, in a file none of
 * them read, with a denial of service aimed at a reader built in.
 */
export default function TwoFactor01Demo() {
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(false)
  const [status, setStatus] = useState<TwoFactor01Status>()
  const [tries, setTries] = useState(3)
  const [error, setError] = useState<string>()

  function verify(value: { code: string; method?: string; remember: boolean }) {
    setError(undefined)
    setStatus({ state: 'working', message: 'Checking the code.' })
    // Stands in for a request. The attempt count below is the Demo's, deliberately.
    window.setTimeout(() => {
      if (tries === 0) {
        setStatus({
          state: 'error',
          message: 'This account is locked. An administrator has to unlock it.',
        })
        return
      }
      if (value.code !== '418902') {
        const left = tries - 1
        setTries(left)
        setCode('')
        setError(
          left === 0
            ? 'That is the last try. The account is now locked.'
            : `That code is not the one we sent. ${left} ${left === 1 ? 'try' : 'tries'} left.`,
        )
        setStatus({ state: 'error', message: 'The code was refused.' })
        return
      }
      setStatus({
        state: 'idle',
        message: value.remember
          ? 'Accepted, and this device will not be asked again for thirty days.'
          : 'Accepted. Your machine may act on this account now.',
      })
    }, 600)
  }

  return (
    <div className="flex max-w-measure flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        The code is six digits. Type <code>418902</code> to be let in, and anything else to be refused: the
        Demo counts the refusals, locks the account on the fourth, and writes the sentence. The Block counts
        nothing, has no clock, and cannot know whether an attempt reached the server at all.
      </p>

      <TwoFactor01
        headingLevel="h3"
        eyebrow="Nexus"
        title="One more thing before your machine may act"
        description="The six digits are in the message we sent to the phone ending 41. They are good for ten minutes and they stop working the moment they are used once."
        methods={[
          { id: 'message', name: 'A message to your phone', detail: 'Sent to the number ending 41.', selected: true },
          { id: 'token', name: 'The token in your keychain', detail: 'Registered in March.' },
          { id: 'printed', name: 'A printed set from March', detail: 'Four codes left of ten.' },
        ]}
        code={{
          label: 'The six digits from the message',
          length: 6,
          value: code,
          onValueChange: setCode,
          description: 'Paste the whole code. The segments fill themselves and the form submits when they are full.',
          error,
        }}
        remember={{
          label: 'Do not ask this device again for thirty days',
          description: 'A shared machine is the case where this is the wrong answer.',
          value: remember,
          onValueChange: setRemember,
        }}
        resend={{
          label: 'Send another message',
          onResend: () => {
            setError(undefined)
            setStatus({ state: 'working', message: 'Another message is on its way to the phone ending 41.' })
            window.setTimeout(() => {
              setStatus({ state: 'idle', message: 'Another message was sent. The old one still works.' })
            }, 600)
          },
          confirmLabel: 'Another message was sent',
          cooldownLabel: 'Wait for the one you asked for',
        }}
        submitLabel="Verify and let this machine act"
        submitting={status?.state === 'working'}
        status={status}
        cancel={{ label: 'Not you. Take me back to the sign-in.', onCancel: () => setCode('') }}
        onSubmit={verify}
      />

      {tries < 3 ? (
        <button
          type="button"
          className="text-muted-foreground self-start text-sm underline underline-offset-4"
          onClick={() => {
            setTries(3)
            setCode('')
            setError(undefined)
            setStatus(undefined)
          }}
        >
          Give the account its three tries back
        </button>
      ) : null}
    </div>
  )
}
