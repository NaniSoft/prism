'use client'

import { useState } from 'react'

import {
  MagicLink01,
  type MagicLink01Sent,
  type MagicLink01Status,
} from '@nanisoft/prism-ui/blocks/magic-link-01'

/**
 * The two states, and a transport that can fail in two of the ways a mail transport
 * really can.
 *
 * The Demo owns `sent`, which is the point of the Block. A preview that replaced the
 * form with a fixed confirmation would show the reader something they cannot check,
 * and the whole argument for this Block is that the address stays on the screen beside
 * a control to change it. So the Demo holds the address, the expiry sentence, and the
 * two sentences a mail queue can produce.
 */
export default function MagicLink01Demo() {
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState<MagicLink01Status>()
  const [sent, setSent] = useState<MagicLink01Sent>()

  function post(value: { identifier: string }, again: boolean) {
    // No in-flight sentence here, and that is not an oversight in the Demo: this
    // Block's status union has no working member, because the confirmation is what
    // replaces the form and the two are the same decision. Reporting an outcome only
    // once it exists is also the honest arrangement, since a screen that says "posting"
    // for two seconds is a screen that has to be trusted about a queue it has never
    // spoken to.
    // Stands in for a request. Nothing leaves the browser, and that is the seam: the
    // caller owns the transport, the rate limit and every sentence about it.
    window.setTimeout(() => {
      if (value.identifier.length === 0) {
        setStatus({ state: 'error', message: 'That address cannot receive mail, so nothing was posted.' })
        return
      }
      if (value.identifier.endsWith('@example.invalid')) {
        setStatus({ state: 'error', message: 'Nothing was posted. The domain does not accept mail.' })
        return
      }
      if (again) {
        setStatus({ state: 'resent', message: 'Another link is on its way to the same address.' })
        return
      }
      setStatus({ state: 'sent', message: 'A link is on its way. It is good for fifteen minutes.' })
      setSent({
        identifier: value.identifier,
        expiresLabel: 'Good for fifteen minutes, and it stops working the moment it is used once.',
        changeLabel: 'Use a different address',
        onChange: (identifier) => {
          setAddress(identifier)
          setSent(undefined)
          setStatus(undefined)
        },
      })
    }, 600)
  }

  return (
    <div className="flex max-w-measure flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Press the control. An address ending in <code>@example.invalid</code> gives the refusal, and anything
        else gives the confirmation, which keeps the address on the screen in full and offers to change it. The
        resend control is a separate action from the submit control, because a reader who opened the wrong inbox
        should not have to retype an address they have already confirmed.
      </p>

      <MagicLink01
        headingLevel="h3"
        eyebrow="Nexus"
        title="Sign in without a secret phrase"
        description="We post a link to the address below and you open it on the device you want signed in. There is no phrase to remember and nothing to type into a second field."
        identifier={{
          label: 'Work email',
          autoComplete: 'email',
          value: address,
          onValueChange: setAddress,
        }}
        submitLabel="Post the link"
        onSubmit={(value) => post(value, false)}
        /*
         * The resend props are spread rather than passed, and the Block's own rule
         * is why: `onResend` is refused with no `sent`, because a control that
         * asks for the link again has to be drawn beside the address it would
         * send to, and before the first link that address is not on the screen.
         * Passing `onResend={undefined}` would satisfy the type and still trip the
         * check at run time, so the Demo expresses the same thing the type does.
         */
        {...(sent === undefined
          ? {}
          : {
              onResend: (identifier: string) => post({ identifier }, true),
              resendLabel: 'Post another link to this address',
              resendConfirmLabel: 'Another link is on its way',
            })}
        status={status}
        sent={sent}
      />

      {sent === undefined ? null : (
        <button
          type="button"
          className="text-muted-foreground self-start text-sm underline underline-offset-4"
          onClick={() => {
            setSent(undefined)
            setStatus(undefined)
            setAddress('')
          }}
        >
          Put the screen back to before anything was sent
        </button>
      )}
    </div>
  )
}
