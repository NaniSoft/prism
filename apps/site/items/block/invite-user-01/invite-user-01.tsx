'use client'

import { useState } from 'react'

import { InviteUser01 } from '@nanisoft/prism-ui/blocks/invite-user-01'

/**
 * An address, a role, a note, and the invitations already sent.
 *
 * The roles are written `as const` on purpose. The Block's `options` is a `readonly`
 * array because a mutable prop type rejects that fixture with a compile error whose
 * message names nothing about the caller, and two Blocks in this package shipped that
 * class of error before the list was written as readonly.
 */
const ROLES = [
  { id: 'reader', label: 'Reader' },
  { id: 'operator', label: 'Operator' },
  { id: 'maintainer', label: 'Maintainer' },
] as const

/** One invitation as the caller's own membership query would return it. */
type Sent = {
  id: string
  identifier: string
  sentLabel: string
  expiresLabel?: string
}

export default function InviteUser01Demo() {
  const [identifier, setIdentifier] = useState('')
  const [role, setRole] = useState<string>('reader')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [outcome, setOutcome] = useState<React.ReactNode>(null)
  const [sent, setSent] = useState<Sent[]>([
    {
      id: 'inv-1',
      identifier: 'cy.okonkwo@nexus-estate.example',
      sentLabel: 'Two hours ago',
    },
    {
      id: 'inv-2',
      identifier: 'dee.lindqvist@nexus-estate.example',
      sentLabel: 'Six days ago',
      expiresLabel: 'Ran out yesterday',
    },
  ])

  function invite(value: { identifier: string; role: string; message?: string }) {
    setSubmitting(true)
    setState('idle')
    setOutcome(null)
    // Stands in for the caller's own request. Nothing leaves the browser, and that is
    // exactly the seam: the caller owns the transport and every sentence, including
    // the one about whether this workspace has room for another person.
    window.setTimeout(() => {
      setSubmitting(false)
      if (sent.some((one) => one.identifier === value.identifier)) {
        setState('error')
        setOutcome('That address already has an invitation waiting on it.')
        return
      }
      const name = ROLES.find((one) => one.id === value.role)?.label ?? value.role
      setSent((was) => [
        ...was,
        { id: `inv-${was.length + 1}`, identifier: value.identifier, sentLabel: 'Just now' },
      ])
      setState('sent')
      setOutcome(`Sent to ${value.identifier}. They will join as ${name}.`)
      setIdentifier('')
      setMessage('')
    }, 600)
  }

  return (
    <InviteUser01
      eyebrow="Nexus Estate"
      title="Let somebody else in"
      description="An invitation grants what the role below allows, and nothing else. They can read what they are sent before they accept."
      identifier={{
        label: 'Their email address',
        value: identifier,
        onValueChange: setIdentifier,
        description: 'One address, one invitation. Inviting twice sends two messages.',
      }}
      role={{
        label: 'What they will be able to do',
        options: ROLES,
        value: role,
        onValueChange: setRole,
        description: 'Operators can start and stop collectors. Maintainers can change how they are configured.',
      }}
      message={{
        label: 'A note with the invitation',
        value: message,
        onValueChange: setMessage,
        counter: true,
        maxLength: 240,
      }}
      submitLabel="Send the invitation"
      submitting={submitting}
      status={state === 'idle' ? undefined : { state, message: outcome }}
      onSubmit={invite}
      pending={{
        title: 'Invitations you have sent',
        empty: 'Nobody has been invited yet.',
        items: sent.map((one) => ({
          ...one,
          revokeLabel: 'Call it back',
          onRevoke: () => setSent((was) => was.filter((other) => other.id !== one.id)),
        })),
      }}
    />
  )
}
