'use client'

import { useState } from 'react'

import { Newsletter01 } from '@nanisoft/prism-ui/blocks/newsletter-01'

/**
 * The band, with the four outcomes a real list has rather than the two a demo would
 * reach for.
 *
 * The Demo owns the transport and the four sentences on purpose. That is the whole
 * point of this Block: the frame ships and the promise does not, so a preview that
 * showed one ideal state would have shown the part Prism did not write.
 */
export default function Newsletter01Demo() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<React.ReactNode>(null)
  const [layout, setLayout] = useState<'stacked' | 'inline'>('stacked')

  function subscribe(value: { email: string }) {
    setState('sending')
    setMessage(null)
    // Stands in for a request. Nothing leaves the browser, and that is exactly the
    // seam: the caller owns the transport and the four sentences.
    window.setTimeout(() => {
      const address = value.email.trim().toLowerCase()
      if (address.endsWith('@example.invalid')) {
        setState('error')
        setMessage('That domain cannot receive mail, so nothing was sent.')
        return
      }
      if (address.length > 0 && address.charAt(0) === 'd') {
        setState('sent')
        setMessage('That address was already on the list.')
        return
      }
      setState('sent')
      setMessage('Check your inbox to confirm the address.')
    }, 600)
  }

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Type an address ending in <code>@example.invalid</code> to see the refusal,
        or one starting with <code>d</code> to see the duplicate. Everything else
        confirms.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a layout">
        <button
          type="button"
          aria-pressed={layout === 'stacked'}
          onClick={() => setLayout('stacked')}
          className={
            layout === 'stacked'
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Stacked
        </button>
        <button
          type="button"
          aria-pressed={layout === 'inline'}
          onClick={() => setLayout('inline')}
          className={
            layout === 'inline'
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Inline
        </button>
      </div>

      <Newsletter01
        eyebrow="Product notes"
        title="What changed this month"
        description="One note a month, written by the people who built it."
        label="Email address"
        consent="One email a month, from the people who build the product. Every note carries an unsubscribe link in its footer."
        submitLabel="Subscribe"
        layout={layout}
        status={state === 'idle' ? undefined : { state, message }}
        onSubmit={subscribe}
      />
    </div>
  )
}
