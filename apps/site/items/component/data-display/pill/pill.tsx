'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Pill } from '@nanisoft/prism-ui/components/pill'

/**
 * Pills, and the two ends a slot buys.
 *
 * This Demo is a client Component and `Pill` is not. That difference is the whole
 * of the arrangement: the chip ships no JavaScript, and the remove control a
 * caller puts in the trailing slot brings the client runtime with it, because a
 * control that removes needs somewhere to remember what it removed.
 */
export default function PillDemo() {
  const [recipients, setRecipients] = useState([
    'Northwind Traders',
    'Fabrikam Industries',
    'Contoso Ltd',
  ])

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">The five tones</span>
        <div className="flex flex-wrap items-center gap-2">
          <Pill label="Standard" />
          <Pill label="Trial" tone="info" />
          <Pill label="Active" tone="success" />
          <Pill label="Overdue" tone="warning" />
          <Pill label="Lapsed" tone="destructive" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">
          The two steps, beside a word and a count
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Pill label="Escalation tier" size="sm" />
          <Pill label="Escalation tier" />
          <Pill label="Attachments" size="sm" trailing={<span>12</span>} />
        </div>
      </div>

      {/*
        The leading slot, holding a mark the caller owns rather than one this
        package draws, and the trailing slot holding a control the caller owns
        rather than a cross. The accessible name is the caller's sentence in the
        caller's language, and it names the value it removes: three buttons
        announced as "Remove" would leave a screen reader guessing which one they
        were on.
      */}
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">
          A mark at the leading end and a remove control at the trailing end
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {recipients.map((name) => (
            <Pill
              key={name}
              label={name}
              leading={
                <span
                  aria-hidden="true"
                  className="bg-muted flex size-5 items-center justify-center rounded-full text-xs font-medium"
                >
                  {name.slice(0, 1)}
                </span>
              }
              trailing={
                /*
                 * The ghost variant's two hover declarations are replaced rather
                 * than kept, and this is the Stated Ink Rule applied one level in.
                 * A ghost button inherits its ink, so inside a pill it inherits the
                 * pill's tone ink, and `hover:text-accent-foreground` would put
                 * that ink on the accent surface instead of the tone's. So the
                 * hover changes the opacity and nothing else, and the ring still
                 * comes from the Button. The size is the 16px a chip can hold and
                 * the coarse-pointer size above it is left alone, so a finger
                 * still gets 44px and the pill grows to hold it.
                 */
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 rounded-full opacity-70 transition-opacity duration-fast ease-out hover:bg-transparent hover:text-inherit hover:opacity-100"
                  aria-label={`Remove ${name}`}
                  onClick={() =>
                    setRecipients((current) => current.filter((entry) => entry !== name))
                  }
                >
                  <X aria-hidden="true" className="size-3" />
                </Button>
              }
            />
          ))}
          {recipients.length === 0 ? (
            <span className="text-muted-foreground text-sm">
              Every recipient has been removed. There is no placeholder chip here,
              because a chip drawn where the values go is a chip a reader will try
              to remove.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
