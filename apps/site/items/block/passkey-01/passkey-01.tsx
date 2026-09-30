'use client'

import { useState } from 'react'

import {
  Passkey01,
  type Passkey01Authenticator,
  type Passkey01Status,
} from '@nanisoft/prism-ui/blocks/passkey-01'

/**
 * The list, and a stand-in for the ceremony the Block refuses to run.
 *
 * The Demo owns the rows, the moments, the transport wording and the outcome, and it
 * owns the callback that would call `navigator.credentials` in a real product. The
 * point worth pressing is that a preview of this Block looks complete and contains
 * no WebAuthn at all: `onRegister` here is a timer, and in a real product it is
 * `navigator.credentials.create` with the origin, the user-verification flag and the
 * relying party identifier this product chose.
 */
export default function Passkey01Demo() {
  const [authenticators, setAuthenticators] = useState<Passkey01Authenticator[]>([
    {
      id: 'phone',
      name: 'The phone in my coat pocket',
      created: '2025-11-02T09:14:00Z',
      lastUsed: '2026-09-29T18:40:00Z',
      transport: 'This phone',
    },
    {
      id: 'laptop',
      name: 'The laptop on my desk',
      created: '2026-02-19T16:03:00Z',
      lastUsed: '2026-09-30T07:22:00Z',
      transport: 'This laptop',
    },
  ])
  const [status, setStatus] = useState<Passkey01Status>()

  function register() {
    setStatus({ state: 'registering', message: 'The platform is asking for a fingerprint or a face.' })
    // Stands in for a ceremony. In a real product this is `navigator.credentials.create`,
    // and the three things this Block refuses to choose are the arguments to it.
    window.setTimeout(() => {
      setAuthenticators((was) => [
        ...was,
        {
          id: 'tablet',
          name: 'The tablet on the bench',
          created: '2026-09-30T08:05:00Z',
          transport: 'This tablet',
        },
      ])
      setStatus({ state: 'idle', message: 'Registered. The reader chose the name it is listed under.' })
    }, 900)
  }

  function remove(id: string) {
    // No confirmation is drawn by the Block, and that is the decision its JSDoc
    // argues for: withholding the control from the row the reader is in does not
    // remove the wish, it removes the honest route to it. A real product composes
    // its own dialog and calls this from there.
    setAuthenticators((was) => was.filter((one) => one.id !== id))
    setStatus({ state: 'idle', message: 'The credential is gone from the list the Demo is holding.' })
  }

  return (
    <div className="flex max-w-measure flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Press the register control and a row appears, because the Demo&rsquo;s callback is a timer. Nothing here
        calls <code>navigator.credentials</code>, and that is the Block&rsquo;s argument rather than an omission
        in the Demo: a ceremony chooses the origin, the user-verification flag and the relying party
        identifier, and a design system that chose all three would be choosing them for every consumer that
        installed it.
      </p>

      <Passkey01
        headingLevel="h3"
        eyebrow="Nexus"
        title="What can sign in as you"
        description="Each one is a credential your machine holds. Removing one means that device stops being able to act for you."
        authenticators={authenticators}
        onRegister={register}
        registerLabel="Register a passkey on this device"
        registering={status?.state === 'registering'}
        onRemove={remove}
        removeLabel={(one) => `Remove the credential called ${one.name}`}
        status={status}
        empty="No credentials registered. Register one and the machine you are on will be able to act for you without a phrase."
      />

      <Passkey01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A reader with nothing registered"
        description="The same Block with an empty list. A reader with no credentials and a server that failed to answer are not the same page, which is why the sentence is yours."
        authenticators={[]}
        status={{ state: 'error', message: 'The list could not be read, so this may not be the whole of it.' }}
        empty="Nothing registered on this account yet."
      />
    </div>
  )
}
