'use client'

import { useState } from 'react'

import { Signup01, type Signup01Status, type Signup01Reading } from '@nanisoft/prism-ui/blocks/signup-01'

/**
 * A strength reading this Demo wrote, and the reason it is a function.
 *
 * The label and the number are both this Demo's, and both are a policy: "Workable"
 * is a word Prism has no business putting into somebody's account creation, and the
 * threshold that earns it is a decision about a policy document this Demo has never
 * read. A Block that scored the secret would be shipping that policy into every
 * product that installed it, in a file none of them read.
 */
function read(password: string): Signup01Reading {
  if (password.length === 0) return { label: 'Nothing typed yet', value: 0 }
  const words = password.trim().split(/\s+/).filter(Boolean)
  let score = 0
  if (password.length >= 12) score += 40
  if (password.length >= 18) score += 20
  if (words.length > 1) score += 20
  if (/\d/.test(password)) score += 10
  if (/[^A-Za-z0-9]/.test(password)) score += 10
  const value = Math.min(score, 100)
  if (value < 40) return { label: 'Too short to be worth having', value }
  if (value < 70) return { label: 'Workable, and one more word would help', value }
  return { label: 'Long, and not a word from a dictionary', value }
}

/**
 * The account creation, with a transport that can refuse twice.
 *
 * Every sentence is the Demo's, and the two refusals are the two an account request
 * really has: the address is already registered, and the domain cannot receive mail.
 * The Block renders neither of them and knows neither of them.
 */
export default function Signup01Demo() {
  const [status, setStatus] = useState<Signup01Status>()

  function create(value: { fields: Record<string, string>; password: string }) {
    setStatus({ state: 'working', message: 'Creating the account.' })
    const typed = value.fields.email ?? ''
    // Stands in for a request. Nothing leaves the browser, and that is the seam.
    window.setTimeout(() => {
      if (typed.length === 0) {
        setStatus({ state: 'error', message: 'That address is not on the list, so nothing was created.' })
        return
      }
      if (typed.endsWith('@example.invalid')) {
        setStatus({
          state: 'error',
          message: 'That domain cannot receive mail, so the account would never be confirmed.',
        })
        return
      }
      if (typed.startsWith('used')) {
        setStatus({ state: 'error', message: 'That address already has an account.' })
        return
      }
      setStatus({
        state: 'done',
        message: 'The account exists. The form above is empty, because the secret was cleared with it.',
      })
    }, 600)
  }

  return (
    <div className="flex max-w-measure flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Press the control. An address starting with <code>used</code> gives the already-registered refusal, one
        ending in <code>@example.invalid</code> gives the undeliverable one, and anything else creates the
        account. The reading under the field is this Demo&rsquo;s function returning this Demo&rsquo;s word and
        this Demo&rsquo;s number.
      </p>

      <Signup01
        headingLevel="h3"
        eyebrow="Nexus"
        title="Create an account that may run an estate"
        description="The account acts on your behalf, so it is created with the estate in mind rather than as a shop."
        groups={[
          {
            fields: [
              {
                key: 'name',
                kind: 'Input',
                label: 'Your name',
                required: true,
                autoComplete: 'name',
                placeholder: 'Jide Abara',
              },
              {
                key: 'email',
                kind: 'Input',
                label: 'Work email',
                required: true,
                autoComplete: 'email',
                placeholder: 'you@nanisoft.example',
                help: 'The account is keyed on this, and the invitation goes there.',
              },
              {
                key: 'workspace',
                kind: 'Input',
                label: 'Workspace name',
                required: false,
                help: 'Optional. Every run this account starts is scoped to one workspace.',
              },
              {
                key: 'sector',
                kind: 'NativeSelect',
                label: 'What the estate is',
                required: true,
                options: [
                  { value: 'pipeline', label: 'A pipeline' },
                  { value: 'market', label: 'A market' },
                  { value: 'estate', label: 'An estate' },
                  { value: 'agents', label: 'A fleet of agents' },
                ],
              },
              {
                key: 'phone',
                kind: 'Input',
                label: 'Phone',
                required: false,
                autoComplete: 'tel',
                help: 'Only used when a capture fails and somebody has to call.',
              },
            ],
          },
        ]}
        password={{
          label: 'Secret phrase',
          revealLabel: 'Show the secret phrase',
          hideLabel: 'Hide the secret phrase',
          strength: read,
        }}
        terms={
          <>
            By creating the account you agree to the terms and acknowledge the processing notice. Neither is
            linked here, because the two documents are yours to version.
          </>
        }
        submitLabel="Create the account"
        submitting={status?.state === 'working'}
        status={status}
        signIn={{ label: 'Sign in to an account you already have', href: '/login' }}
        onSubmit={create}
      />

      <p className="text-muted-foreground text-xs">
        When the account is created the whole form empties, the secret phrase included. That is the Block
        clearing what it held on the Demo&rsquo;s own <code>done</code>, and it is the only state this Block
        writes.
      </p>
    </div>
  )
}
