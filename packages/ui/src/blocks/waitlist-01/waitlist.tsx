'use client'

import type { FormEvent, ReactNode } from 'react'
import { useId } from 'react'

import { Button } from '../../components/ui/button'
import { Field, FieldDescription, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { LiveRegion } from '../../components/ui/live-region'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The one thing this Block collects, and the whole of what it hands over.
 *
 * The same shape `NewsletterValue` is, and for the same reason: the two Blocks
 * differ in what they show a reader, not in what they collect, and a caller who has
 * a subscribe handler already has one that takes a field named `email`.
 */
export type WaitlistValue = {
  /** What the reader typed, exactly as they typed it. Prism validates nothing. */
  email: string
}

/**
 * The outcome of the caller's own request, as the Block draws it.
 *
 * A prop and never a state this Block writes, for the reason `Newsletter01` states
 * in full: a success sentence this package wrote would be inherited by every
 * consumer and would be the one sentence on the page most certainly wrong. A
 * waitlist has more outcomes than a newsletter has, not fewer: a full list, a
 * closed list, a duplicate, a position that has not been assigned yet.
 */
export type Waitlist01Status = {
  /** Which of the four the request is in. Read by the Block for two things only. */
  state: 'idle' | 'sending' | 'sent' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * Where the reader is, and how that sentence is built.
 *
 * **`label` is a function and that is the whole design of this prop.** A position
 * reads as "1,204 of 5,000" in English, as "1.204 von 5.000" in German, as
 * "5,000 名のうち 1,204 番目" in Japanese and as "1 204 из 5 000" in Russian, and the
 * differences are word order, a separator, an inflected noun and sometimes the
 * direction of the whole phrase. A Block that composed the sentence would compose
 * the English one and ship it into every consumer's product, where a reader in any
 * other language would be shown a number formatted by a locale that is not theirs.
 * So Prism takes the two numbers, which are facts, and hands them back to a
 * function the caller wrote, and the sentence is the caller's in every locale their
 * product ships.
 *
 * The numbers handed to `label` are the ones passed in, not a value Prism derived,
 * which is what lets a caller show a cached position rather than a fresh one, show
 * a rounded figure, or decline to show a total at all.
 *
 * `label` is required inside this object rather than optional beside it, and the
 * type is the enforcement: a waitlist that showed a bare pair of numbers with no
 * sentence would be a figure a reader has to interpret, which is the thing
 * `Metric` exists to avoid.
 */
export type Waitlist01Position = {
  /** Where the reader is. One number, formatted by the caller's own `label`. */
  current: number
  /** The size of the list, when there is one to state. */
  total?: number
  /**
   * The sentence, built from the position.
   *
   * Required, and a function rather than a template string for the reason above.
   */
  label: (position: { current: number; total?: number }) => string
}

/**
 * The code a reader shares, and the control that copies it.
 *
 * **Every word here is the caller's, including the one that says it worked.** `value`
 * is the caller's code, `label` is the caller's name for it, and `copyLabel` is the
 * accessible name of the one control, which a screen reader reads before the reader
 * presses it. `copied` is the state Prism marks on the control, and Prism marks it
 * with ink and an attribute and writes no sentence about it: a control that says
 * "Copied" is a sentence every consumer of this Block inherits, and it is a
 * sentence about an event Prism cannot see, because a copy can fail.
 *
 * So the confirmation is the caller's, and the place to put it is `status`. A caller
 * whose transport is local sets `status` with their own "Copied to clipboard" for as
 * long as they want it on the page. The cost is stated rather than hidden: a caller
 * who passes nothing gets a button whose ink changes and no words, which tells a
 * sighted reader that something happened and tells a screen reader nothing at all.
 * That is the correct default for a frame that refuses to write the sentence, and
 * the fix is one prop rather than a fork.
 *
 * There is no remove control here either. A code is a fact about a waitlist entry
 * rather than a thing the reader chose a moment ago, and a control that undoes a
 * code is a control whose effect a caller would have to reverse.
 */
export type Waitlist01Referral = {
  /** The code itself. A string, so it can be selected, copied and read aloud. */
  value: string
  /** The caller's name for what the code is, drawn as the control's label. */
  label: string
  /** The accessible name of the control that copies it. */
  copyLabel: string
  /**
   * Whether the caller considers the code copied right now.
   *
   * Drawn as a state on the control: a second weight and `data-copied`, so the
   * change is visible. Not announced by Prism, because the sentence is the
   * caller's. See the note on `status`.
   */
  copied: boolean
}

/** The props a Waitlist01 takes. Every string in this Block is one of them. */
export type Waitlist01Props = {
  /** The short line above the title, usually what the product is. */
  eyebrow?: ReactNode
  /** The heading. Required, because a band with no heading is a form in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * Called with the address when the reader submits, and the only thing this Block
   * does with the address.
   *
   * **Required, for the reason `Newsletter01` states in full.** A waitlist Block
   * that collected an address and posted it somewhere it guessed at would be a
   * component that handles, stores, retries and forgets a personal datum for four
   * products that each need a different one of those. Handing the address over
   * keeps the frame a frame, and a consumer who already has a transport passes it
   * straight in.
   */
  onSubmit: (value: WaitlistValue) => void
  /**
   * The address, as the caller holds it, which makes the field controlled.
   *
   * Optional because handing the value over at submit is enough for a caller with
   * nothing to look up. Pair it with `onSubmit` when the caller has to check the
   * address before sending it, which is also the case where the caller has to be
   * able to clear the field.
   */
  value?: string
  /** The address the field starts with, for an uncontrolled field. */
  defaultValue?: string
  /**
   * Where the reader is.
   *
   * Optional, and its absence is a legitimate state rather than a gap: a launch
   * page that opens a waitlist before there is anything to count has a field and a
   * promise and no number, and a number Prism invented would be a figure about
   * somebody else's list. When it is given, `label` is required inside it.
   */
  position?: Waitlist01Position
  /** The caller's referral code and its copy control. Omit for a closed list. */
  referral?: Waitlist01Referral
  /**
   * What the reader is told happens to the address.
   *
   * **Required, and the reason is the same one `Newsletter01` gives.** A waitlist
   * form that can be shipped without saying what happens to the address lets a
   * consumer make a legal claim they did not write, and a waitlist has more to
   * disclose than a newsletter does: that a position is not a queue with a date on
   * it, that the list may be closed, that the address is not sold. None of that is
   * Prism's to write and all of it has to be said somewhere, so the sentence is
   * required and wired to the field as its description.
   */
  consent: ReactNode
  /** The label on the one control, in the product's own words. */
  submitLabel: string
  /**
   * The field's visible label, and the accessible name a screen reader announces.
   *
   * Required, and a `string` because an address field has one name and that name is
   * the caller's. A control with no name is announced as "text field", which is the
   * one name every other field on the page shares.
   */
  label: string
  /**
   * The outcome of the caller's request, drawn in a live region and announced.
   *
   * A prop and never an internal state, and it is also where a caller puts the
   * confirmation for `referral.copied`, because that sentence is the caller's for
   * the same reason the success sentence is.
   */
  status?: Waitlist01Status
  /**
   * Whether the field and the control share a row or stack.
   *
   * The same two arrangements `Newsletter01` offers and the same reason there is
   * no third: `className` is layout only, so a caller who wants the control
   * somewhere else composes the pieces rather than restyling a Block.
   */
  layout?: 'inline' | 'stacked'
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The waitlist band: the same frame as `Newsletter01`, plus the reader's place in
 * the line and a code they can pass on.
 *
 * **Everything `Newsletter01` argues about the address, this Block argues too, and
 * it says so here rather than leaving a reader to assume it.** `onSubmit` is
 * required and the Block sends nothing, so the address is never handled, stored,
 * retried or forgotten by a component that was installed to draw a form; `consent`
 * is required because a form that can ship without saying what happens to the
 * address lets a consumer make a legal claim they did not write; and `status` is a
 * prop and never an internal state Prism writes, because a success sentence this
 * package wrote would be inherited verbatim by every consumer and would be the one
 * sentence on the page most certainly wrong. A waitlist has more outcomes than a
 * newsletter does rather than fewer: a full list, a closed list, a duplicate, and a
 * position that has not been assigned yet.
 *
 * **`label` is a function and not a template, and the reason is the sentence.** A
 * position reads as "1,204 of 5,000" in English and as something else in German, in
 * Japanese and in Russian, and what differs is the word order, the separator, an
 * inflected noun and sometimes the direction of the whole phrase. A Block that
 * composed the sentence would compose the English one and ship it into every
 * consumer's product, so a reader in any other language would be shown a figure
 * grouped by a locale that is not theirs. Prism takes the two numbers, which are
 * facts, and hands them to a function the caller wrote. `SearchDialog` makes the
 * same argument about its own two count strings and puts both in a `messages` object
 * for the same reason; the difference is that a position is a pair of numbers
 * rather than a fixed phrase, so the honest interface is a function and not two
 * strings.
 *
 * **The referral copy button is fully caller-driven, including its own copied
 * confirmation, and the reason is that a control saying "Copied" is a sentence Prism
 * would be shipping.** The value, the name for it, the accessible name of the
 * control and the state that says it has fired are all the caller's, and what Prism
 * does with `copied` is change the control's weight and mark `data-copied`, which is
 * visible and says nothing. The sentence that says it worked belongs in `status`,
 * because a copy can fail and Prism cannot see whether it did. The cost is stated
 * rather than hidden: a caller who passes nothing gets a button whose ink changes
 * and no words, so a screen reader hears nothing at all. That is the honest default
 * for a frame that will not write the sentence, and the fix is one prop.
 *
 * **The position line is drawn above the field and the referral below it, and the
 * order is a decision about what the reader is looking at.** A reader who opens a
 * waitlist page is asking how far away the front is, and the number answers that
 * before the field does. The code is what they look at once they believe there is a
 * place for them, so it comes after the ask rather than above it.
 *
 * It is a client Component, and the reason is the handler rather than the state, as
 * in `Newsletter01`. `onSubmit` is a function, a function is a piece of state, and
 * state is a client module.
 */
export function Waitlist01({
  eyebrow,
  title,
  description,
  onSubmit,
  value,
  defaultValue,
  position,
  referral,
  consent,
  submitLabel,
  label,
  status,
  layout = 'stacked',
  headingLevel = 'h2',
  className,
}: Waitlist01Props) {
  const generated = useId()
  const inputId = `${generated}-email`
  const consentId = `${generated}-consent`
  const codeId = `${generated}-code`
  const sending = status?.state === 'sending'

  /*
   * Read out of the form rather than out of `value`, so a controlled field and an
   * uncontrolled one reach the same handler. A Block that read `value` would hand
   * an empty address over from every consumer who left the field uncontrolled.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const read = new FormData(event.currentTarget).get('email')
    onSubmit({ email: typeof read === 'string' ? read : '' })
  }

  return (
    <Section data-slot="waitlist-01" className={cn(className)}>
      <div data-slot="waitlist-01-body" className="flex flex-col gap-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        <form
          data-slot="waitlist-01-form"
          onSubmit={handleSubmit}
          className="flex w-full max-w-measure flex-col gap-4"
        >
          {position === undefined ? null : (
            <p data-slot="waitlist-01-position" className="text-muted-foreground text-sm tabular-nums">
              {position.label({ current: position.current, total: position.total })}
            </p>
          )}

          <Field>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

            <div
              data-slot="waitlist-01-row"
              className={cn(
                'flex w-full flex-col gap-3',
                layout === 'inline' ? 'sm:flex-row sm:items-start' : null,
              )}
            >
              <Input
                data-slot="waitlist-01-field"
                id={inputId}
                name="email"
                type="email"
                autoComplete="email"
                value={value}
                defaultValue={defaultValue}
                aria-describedby={consentId}
              />
              <Button data-slot="waitlist-01-submit" type="submit" disabled={sending}>
                {submitLabel}
              </Button>
            </div>

            <FieldDescription id={consentId}>{consent}</FieldDescription>
          </Field>

          {/*
           * The live region, and it renders nothing while there is no message, which
           * is the correct shape for a region rather than an empty div that
           * announces every unrelated change of its ancestors. `assertive` only for a
           * refusal, because that is the one state where the reader is waiting for
           * an answer and nothing else follows it.
           */}
          <LiveRegion
            politeness={status?.state === 'error' ? 'assertive' : 'polite'}
            busy={sending}
            className="text-sm"
          >
            {status?.message}
          </LiveRegion>

          {referral === undefined ? null : (
            <div data-slot="waitlist-01-referral" className="flex flex-col gap-2">
              <FieldLabel htmlFor={codeId}>{referral.label}</FieldLabel>
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start">
                <Input
                  data-slot="waitlist-01-code"
                  id={codeId}
                  readOnly
                  value={referral.value}
                  className="font-mono"
                />
                <Button
                  data-slot="waitlist-01-copy"
                  type="button"
                  variant={referral.copied ? 'secondary' : 'outline'}
                  data-copied={referral.copied || undefined}
                >
                  {referral.copyLabel}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Section>
  )
}

export default Waitlist01
