'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { VerifyEmail01 } from '@nanisoft/prism-ui/blocks/verify-email-01'

/**
 * The five states, all five reachable from the Demo.
 *
 * The Block has no internal state on this screen, so the Demo holds all of it. That is
 * the point of the pattern rather than a limitation of the Demo: the link is the
 * proof, the caller's server knows whether it proved anything, and everything the Block
 * does is report what happened and offer the caller's own next moves.
 */
export default function VerifyEmail01Demo() {
  const STATES = ['checking', 'verified', 'pending', 'failed', 'expired'] as const

  const [state, setState] = useState<(typeof STATES)[number]>('checking')
  const [resending, setResending] = useState(false)

  const COPY: Record<(typeof STATES)[number], { label: string; message: string }> = {
    checking: {
      label: 'Checking',
      message: 'Following the link you clicked and asking our records whether it matched.',
    },
    verified: {
      label: 'Verified',
      message: 'That address is confirmed. An agent acting for you will now be attributed to it.',
    },
    pending: {
      label: 'Nothing yet',
      message: 'The message has not been opened from that address. It can take a few minutes, and some gateways hold it back.',
    },
    failed: {
      label: 'That link did not work',
      message: 'It may have been copied incompletely, or opened in a different browser than the one that received it.',
    },
    expired: {
      label: 'That link has expired',
      message: 'Links last thirty minutes. Ask for another one and the old link stops working.',
    },
  }

  const copy = COPY[state]

  function resend() {
    setResending(true)
    setState('pending')
    window.setTimeout(() => {
      setResending(false)
    }, 900)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        The five states are five screens rather than five sentences, so this Demo reaches all five. A
        verification screen has no code field: the link is the proof, and a field would invite a reader to
        type a code they do not have.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a state">
        {STATES.map((one) => (
          <button
            key={one}
            type="button"
            aria-pressed={state === one}
            onClick={() => {
              setState(one)
              setResending(false)
            }}
            className={
              state === one
                ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
                : 'border-input rounded-md border px-3 py-1.5 text-sm'
            }
          >
            {COPY[one].label}
          </button>
        ))}
      </div>

      <VerifyEmail01
        eyebrow="Sign up"
        title="Confirm that address"
        description="This is where you find out whether the message arrived. Nothing else about your account changes until it does."
        target={{
          identifier: 'ops@nexus-estate.example',
          identifierLabel: 'Address on the account',
          changeLabel: 'Verify a different address',
          onChange: () => undefined,
        }}
        status={{ state, message: copy.message, stateLabel: copy.label }}
        resendLabel="Send it again"
        resentLabel="Sending it now"
        resending={resending}
        cooldownLabel="You can ask again in about a minute."
        onResend={resend}
        actions={
          <Button variant="outline" size="sm" className="self-start">
            Open the other inbox
          </Button>
        }
        help={{
          message: 'If this address belongs to somebody else, or you are using a shared machine, ask whoever sent the invitation to check the address they used.',
          href: '/support/recovery',
          label: 'Ask for help with this address',
        }}
      />
    </div>
  )
}
