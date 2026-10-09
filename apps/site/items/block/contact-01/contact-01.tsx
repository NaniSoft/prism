'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Contact01 } from '@nanisoft/prism-ui/blocks/contact-01'
import type { FieldSpecGroup } from '@nanisoft/prism-ui/spec'

/**
 * The declared field list, with the field the fixed set of four would not have had.
 *
 * The order number and the budget select are the whole argument for a declared list
 * in one file. A contact form Component with four fields of its own would render
 * exactly the same picture and would have thrown away the two facts a reader came
 * here to give, and the sentence the reader then gets back is the one that was
 * assembled without them. The fields are the shared specification, so a choice
 * carries its options under the `NativeSelect` kind.
 */
const GROUPS: readonly FieldSpecGroup[] = [
  {
    fields: [
      { key: 'name', kind: 'Input', label: 'Your name', required: true, autoComplete: 'name' },
      { key: 'email', kind: 'Input', label: 'Email address', required: true, autoComplete: 'email' },
      {
        key: 'order',
        kind: 'Input',
        label: 'Order number',
        required: false,
        help: 'Only if you are writing about an order.',
        placeholder: 'NX-0000',
      },
      {
        key: 'topic',
        kind: 'NativeSelect',
        label: 'What is this about?',
        required: true,
        options: [
          { value: 'sales', label: 'Buying' },
          { value: 'support', label: 'Something is broken' },
          { value: 'press', label: 'Writing about you' },
        ],
      },
      {
        key: 'budget',
        kind: 'NativeSelect',
        label: 'Budget range',
        required: false,
        help: 'A range is enough. It decides who reads this first.',
        options: [
          { value: 'under-5k', label: 'Under 5,000' },
          { value: '5k-25k', label: '5,000 to 25,000' },
          { value: 'over-25k', label: 'Over 25,000' },
          { value: 'unknown', label: 'I do not know yet' },
        ],
      },
      { key: 'message', kind: 'Textarea', rows: 4, label: 'What would you like to say?', required: true },
    ],
  },
]

/** The address, with the label a mailto link needs to be readable as a sentence. */
const ADDRESS = {
  lines: ['Nexus Software', '14 Ashfield Row', 'Bristol BS1 4TR'],
  email: 'hello@nexus.example',
  emailLabel: 'Email us directly',
  hours: <p>Monday to Friday, nine to five, UK time.</p>,
}

export default function Contact01Demo() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<React.ReactNode>(null)
  const [variant, setVariant] = useState<'split' | 'stacked'>('split')
  const [sent, setSent] = useState<Record<string, string>>({})

  function submit(value: Record<string, string>) {
    setState('sending')
    setMessage(null)
    // Stands in for a request. Nothing leaves the browser, and that is exactly the
    // seam: the caller owns the transport, the routing and the four sentences.
    window.setTimeout(() => {
      setSent(value)
      const address = (value.email ?? '').trim()
      if (address.length === 0 || !address.includes('@')) {
        setState('error')
        setMessage('That address is not one we can write back to, so nothing was sent.')
        return
      }
      if (address.endsWith('@example.invalid')) {
        setState('sent')
        setMessage('Sent. It is with the spam filter, which a person checks by hand.')
        return
      }
      setState('sent')
      setMessage(`Sent. We will write back to ${address}.`)
    }, 600)
  }

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Nine fields would be a funnel, so this list is six. The order number and the
        budget select are the two a fixed set of four would not have had, and the
        message a reader gets back is the one assembled from what they gave.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a layout">
        <button
          type="button"
          aria-pressed={variant === 'split'}
          onClick={() => setVariant('split')}
          className={
            variant === 'split'
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Split
        </button>
        <button
          type="button"
          aria-pressed={variant === 'stacked'}
          onClick={() => setVariant('stacked')}
          className={
            variant === 'stacked'
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Stacked
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSent({})
            setState('idle')
            setMessage(null)
          }}
        >
          Clear the record
        </Button>
      </div>

      <Contact01
        eyebrow="Nexus"
        title="Write to us"
        description="A person reads every one of these, usually within a working day."
        groups={GROUPS}
        submitLabel="Send"
        consent="We use what you send to answer you and nothing else. We do not add you to a list."
        address={ADDRESS}
        variant={variant}
        status={state === 'idle' ? undefined : { state, message }}
        onSubmit={submit}
        headingLevel="h3"
      />

      {/*
        * The record the handler received, printed as the Demo saw it. The keys are
        * the caller's own field ids and the values are the strings, so the shape
        * that arrives is the shape the declaration produced.
        */}
      {Object.keys(sent).length > 0 ? (
        <div className="border-border rounded-xl border p-4">
          <p className="text-foreground mb-2 text-sm font-medium">
            What `onSubmit` received
          </p>
          <ul className="text-muted-foreground flex flex-col gap-1 font-mono text-xs">
            {Object.entries(sent).map(([key, one]) => (
              <li key={key}>
                {key}: {one === '' ? '(empty)' : one}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
