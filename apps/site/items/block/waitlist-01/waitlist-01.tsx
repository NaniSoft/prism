'use client'

import { useState } from 'react'

import { Waitlist01 } from '@nanisoft/prism-ui/blocks/waitlist-01'
import { Button } from '@nanisoft/prism-ui/components/button'

/** The code this Demo's copy control writes, named so the two cannot drift apart. */
const CODE = 'NEXUS-4KD2-1190'

/**
 * The band with the position sentence written four ways, which is the only way to
 * make the argument for a `label` function visible rather than stated.
 *
 * Each of the four is a real locale's word order and separator, and the number
 * formatting goes through `Intl` in every one of them, because the separator is the
 * reader's locale and not the sentence's. Switching between them is the Demo.
 */
const POSITIONS = {
  english: {
    label: 'English',
    build: ({ current, total }: { current: number; total?: number }) => {
      const n = new Intl.NumberFormat('en-GB').format(current)
      return total === undefined ? n : `${n} of ${new Intl.NumberFormat('en-GB').format(total)}`
    },
  },
  german: {
    label: 'German',
    build: ({ current, total }: { current: number; total?: number }) => {
      const n = new Intl.NumberFormat('de-DE').format(current)
      return total === undefined ? n : `${n} von ${new Intl.NumberFormat('de-DE').format(total)}`
    },
  },
  russian: {
    label: 'Russian',
    build: ({ current, total }: { current: number; total?: number }) => {
      const n = new Intl.NumberFormat('ru-RU').format(current)
      return total === undefined ? n : `${n} из ${new Intl.NumberFormat('ru-RU').format(total)}`
    },
  },
  plain: {
    label: 'No total',
    build: ({ current }: { current: number; total?: number }) =>
      new Intl.NumberFormat('en-GB').format(current),
  },
} as const

type PositionKey = keyof typeof POSITIONS

/** The queue, with the sentence for the position written by the caller. */
export default function Waitlist01Demo() {
  const [locale, setLocale] = useState<PositionKey>('english')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<React.ReactNode>(null)
  const [copied, setCopied] = useState(false)
  const [queued, setQueued] = useState(false)

  function submit(value: { email: string }) {
    setState('sending')
    setMessage(null)
    window.setTimeout(() => {
      const address = value.email.trim()
      if (address.length === 0) {
        setState('error')
        setMessage('An address is needed before a place can be held.')
        return
      }
      setQueued(true)
      setState('sent')
      setMessage('You are number 1,205. We write once a month.')
    }, 600)
  }

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        The same two numbers, composed four ways. The Block is handed a function and
        never writes this sentence itself, which is why a product in any of these
        languages does not inherit English.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a sentence">
        {(Object.keys(POSITIONS) as PositionKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={locale === key}
            onClick={() => setLocale(key)}
            className={
              locale === key
                ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
                : 'border-input rounded-md border px-3 py-1.5 text-sm'
            }
          >
            {POSITIONS[key].label}
          </button>
        ))}
      </div>

      <Waitlist01
        eyebrow="Nexus"
        title="Join the queue"
        description="A seat opens every Thursday morning."
        label="Email address"
        consent="Your address is held until you ask for it to be deleted, and it is never sold. One line a month, telling you when your place is close."
        submitLabel="Take a place"
        layout="inline"
        position={{
          current: queued ? 1205 : 1204,
          total: 5000,
          label: POSITIONS[locale].build,
        }}
        referral={{
          value: CODE,
          label: 'Your referral code',
          // The copy control is this Demo's, not the Block's, and that is the point
          // the shape is making. Prism will not call `navigator.clipboard` on a
          // consumer's behalf and then report a success it cannot verify, so the
          // control arrives whole: its own accessible name, its own handler, and its
          // own failure path when the clipboard refuses.
          copyControl: (
            <Button
              type="button"
              variant={copied ? 'secondary' : 'outline'}
              data-copied={copied || undefined}
              onClick={() => {
                // `navigator.clipboard` is absent in an insecure context and rejects
                // when the permission is refused, so the Demo reports both rather than
                // claiming a copy that did not happen.
                void navigator.clipboard
                  ?.writeText(CODE)
                  .then(() => setCopied(true))
                  .catch(() => {
                    setCopied(false)
                    setMessage('The clipboard was refused, so select the code and copy it.')
                  })
              }}
            >
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          ),
        }}
        status={{
          state,
          // Both sentences are this Demo's, not the Block's. The copied
          // confirmation has nowhere else to go, because Prism will not write it.
          message: copied ? 'Copied to the clipboard.' : message,
        }}
        onSubmit={submit}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCopied(true)}
          className="border-input rounded-md border px-3 py-1.5 text-sm"
        >
          Simulate the copy succeeding
        </button>
        <button
          type="button"
          onClick={() => setCopied(false)}
          className="border-input rounded-md border px-3 py-1.5 text-sm"
        >
          Clear the copied state
        </button>
      </div>

      <p className="text-muted-foreground text-sm">
        The copy control marks itself and says nothing. That is deliberate: a control
        that announced a bare Copied would be a sentence the design system shipped
        every product that installed this Block, and it would be a sentence about an
        event it cannot see, because a copy can fail. Clearing the state on a timer
        belongs to the caller, which is why there is no clock in this Block at all.
      </p>
    </div>
  )
}
