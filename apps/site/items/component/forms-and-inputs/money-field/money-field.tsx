'use client'

import { useState } from 'react'

import { Label } from '@nanisoft/prism-ui/components/label'
import { MoneyField } from '@nanisoft/prism-ui/components/money-field'

/**
 * The same amount in two markets, so the round trip is visible rather than
 * described.
 *
 * The number under each field is the caller's own, printed with the platform's own
 * plain formatter rather than by this Component. While the reader is typing, the
 * field holds their text and the caller holds the parse of it, and the two disagree
 * on purpose: the text is never rewritten under a caret. Leave the field and the
 * text becomes what the caller's market writes, which is the only moment this
 * Component reformats anything.
 */
export default function MoneyFieldDemo() {
  const [dollars, setDollars] = useState<number | null>(1234.56)
  const [euros, setEuros] = useState<number | null>(null)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="money-field-usd">Amount in US dollars</Label>
        <MoneyField
          id="money-field-usd"
          aria-label="Amount in US dollars"
          locale="en-US"
          currency="USD"
          value={dollars}
          onValueChange={setDollars}
        />
        <span className="text-muted-foreground text-sm">
          The caller holds {dollars === null ? 'nothing' : dollars}. Type a trailing point, a
          leading point or a lone minus and watch what happens: all three are legitimate states
          of a field somebody is in the middle of typing into.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="money-field-eur">Betrag in Euro</Label>
        <MoneyField
          id="money-field-eur"
          aria-label="Betrag in Euro"
          locale="de-DE"
          currency="EUR"
          value={euros}
          onValueChange={setEuros}
        />
        <span className="text-muted-foreground text-sm">
          The caller holds {euros === null ? 'nothing' : euros}. This field groups with a full
          stop and separates with a comma, and it says so by writing it, because neither is a
          literal anywhere in the Component. Empty is reported as null rather than as zero.
        </span>
      </div>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        Nothing in the field can be typed that this locale and this currency could not have
        written, and the currency symbol lives in the frame rather than in the value: the number
        above is 1234.56 whether or not anyone typed a dollar sign.
      </p>
    </div>
  )
}