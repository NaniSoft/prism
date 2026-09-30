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
 * **A shape rather than a bare string, and the reason is what a transport needs.**
 * `email` alone would be the minimum, and it is not wrong. It is just that the
 * moment a caller stores a subscription, the two questions that arrive next are
 * which consent they recorded and when, and an object they receive is a place to
 * answer them while a bare string is a place to reconstruct them from whatever
 * happened to be in scope at the call site. The alternative was to hand over the
 * form's own `SubmitEvent` the way `AuthForm01` does, which puts the address
 * behind `FormData` at the consumer and makes every one of them write the same
 * eight lines. Prism reads the value out of the form and hands over the value.
 */
export type NewsletterValue = {
  /** What the reader typed, exactly as they typed it. Prism validates nothing. */
  email: string
}

/**
 * The outcome of the caller's own request, as the Block draws it.
 *
 * **`message` is the caller's sentence and Prism has no default for it, because
 * there is no default that is true.** "You are subscribed" is a claim about a list
 * Prism never joined, "Something went wrong" is a claim about a failure Prism never
 * saw, and "Thanks" is a claim about a reader's day. So `state` is a machine value
 * the Block can act on and `message` is a node the caller has to supply, and a
 * `status` with no message draws nothing at all.
 *
 * The four states are the four a request actually has: not started, in flight,
 * finished, refused. `error` is a state and not a fifth kind of message, because a
 * caller that draws a failure as ordinary body copy is a caller whose failure is
 * the same size as its success.
 */
export type Newsletter01Status = {
  /**
   * Which of the four the request is in. Read by the Block for exactly two things:
   * the submit control is disabled while it reads `sending`, and the live region
   * is marked busy. Nothing else.
   */
  state: 'idle' | 'sending' | 'sent' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/** The props a Newsletter01 takes. Every string in this Block is one of them. */
export type Newsletter01Props = {
  /** The short line above the title, usually what the list is. */
  eyebrow?: ReactNode
  /** The heading. Required, because a band with no heading is a form in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * Called with the address when the reader submits, and the only thing this Block
   * does with the address.
   *
   * **Required, and the requirement is the design.** There is no arm of this
   * component in which an address is collected and then nothing happens, because
   * there is no way for Prism to know what should happen to it. The obvious
   * alternative is an `onSubmit` that is optional, with a form that renders and
   * does nothing when it is absent, and that is a form which collects a personal
   * datum, displays it back to the reader, and then discards it without telling
   * anyone. Making the handler required moves the question to the caller, where it
   * is answerable.
   */
  onSubmit: (value: NewsletterValue) => void
  /**
   * The address, as the caller holds it, which makes the field controlled.
   *
   * Optional because a reader's own address in an uncontrolled field is ordinary
   * for a form that hands the value over at submit and is gone. Pair it with
   * `onSubmit` when the caller has to look the address up before sending it, which
   * is the case where the caller also has to be able to clear the field.
   */
  value?: string
  /** The address the field starts with, for an uncontrolled field. */
  defaultValue?: string
  /**
   * What the reader is told happens to the address: the frequency, the sender, the
   * way out.
   *
   * **Required, and this is the second half of the design.** A newsletter form
   * that can be shipped without saying what happens to the address is a form that
   * lets a consumer make a promise they did not write, in the one place on the page
   * where the reader is about to hand over something personal. Prism is not in a
   * position to write that sentence: the frequency, the sender and the unsubscribe
   * route are facts about the caller's list, and any sentence Prism produced would
   * be inherited verbatim by every product that installs this Block and would be
   * wrong for at least one of them. So the sentence is required rather than
   * optional, and it is wired to the field as its description rather than left
   * floating under the form, so a screen reader announces it with the control the
   * reader is about to type into rather than as a footnote they may never reach.
   */
  consent: ReactNode
  /** The label on the one control, in the product's own words. */
  submitLabel: string
  /**
   * The outcome of the caller's request, drawn in a live region and announced.
   *
   * **A prop and never a state this Block writes, and the reason is the sentence
   * Prism refuses to ship.** A form that owns its own success message renders one
   * the moment `onSubmit` returns, and that sentence then belongs to every consumer
   * of the Block: it is published by the corpus as part of this Block's own
   * documentation and it is read on a page about a list Prism never joined. It is
   * also the one sentence on the page most certainly wrong, because the outcomes a
   * real request has are a subscription, a duplicate, a soft bounce, a hard bounce,
   * a rate limit and a consent withdrawal, and one sentence cannot be true of all
   * six. So Prism holds no pending, no sent and no failed flag, `LiveRegion`
   * renders nothing at all while there is no message, and the caller passes the
   * sentence it means. The cost is that a consumer wires four states into its own
   * handler instead of getting them for free, and that is the correct place for it:
   * the four states are the consumer's transport, not this frame's.
   */
  status?: Newsletter01Status
  /**
   * The field's visible label, and the accessible name a screen reader announces.
   *
   * Required, and a `string` rather than a node because an address field has one
   * name and "Email" or "Your email address" is the whole of it. A control with no
   * name is announced as "text field", which is the one name every other field on
   * the page shares.
   */
  label: string
  /**
   * Whether the field and the control share a row or stack.
   *
   * `inline` is right where the section is narrow in words and wide in space, which
   * is most landing pages. `stacked` is right everywhere the address is long, and
   * it is the safe default to reach for when a page is already narrow. There is no
   * third arrangement that changes Prism's drawing rather than this Block's
   * spacing, and the reason is that `className` is layout only: a caller who wants
   * the control somewhere else composes this Block's pieces rather than reaching
   * for the buttons, which is a decision they can see.
   */
  layout?: 'inline' | 'stacked'
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The band that takes an address: a heading, one field, one control, the line that
 * says what happens to it, and a region that announces the outcome.
 *
 * **This Block renders no success message, and that is the whole argument of it.**
 * Every other part of this component is ordinary: a section, a labelled field, a
 * button and a live region, each of which a consumer could have written in a
 * morning. The part that is not ordinary is the hole where the sentence "You are
 * on the list" would go. A success message this package wrote is a sentence every
 * consumer of the Block inherits, the corpus publishes it as this design system's
 * own voice, and it is the single sentence on the page most certainly to be wrong,
 * because the outcomes a real subscription request has are more than one and none
 * of them is the one Prism would have guessed. So `status` is a prop, `onSubmit` is
 * required, and a consumer who installs this Block owns the promise it makes.
 *
 * **`onSubmit` is required and the Block sends nothing, which is what makes it
 * installable.** The alternative shape, the one this Block is shaped to refuse, is a
 * component that collects an address and posts it to a route it guesses at: four
 * consumers with four back ends then either patch it or rewrite it, and in the
 * meantime the address has been handled, stored, retried, de-duplicated and
 * forgotten by a piece of code that was installed to draw a form. Every one of
 * those five is a decision about the caller's product and its data, and a frame
 * that takes one of them is a frame that has to be replaced rather than configured.
 * Handing the address over at submit keeps the frame a frame: a consumer who wants
 * a transport writes one, and a consumer who already has one passes it straight in.
 *
 * **`consent` is required for the same reason in a different register.** A newsletter
 * form that can be shipped without saying what happens to the address is a form
 * that lets a consumer make a legal claim they did not write: the frequency, the
 * sender and the way out are facts about the caller's list, and a Block that
 * defaulted to a sentence about a generic list would publish it as the design
 * system's voice to a product it knows nothing about. Requiring it also puts it
 * where it is useful, wired to the field as the control's description, so a screen
 * reader hears what will happen to the address as it focuses the address rather
 * than after the reader has already typed it.
 *
 * **`status` is a prop and never an internal state Prism writes.** The reason is the
 * one above and it is worth saying in the second form it takes: there is no
 * internal `sent` flag, no internal `error` flag and no internal message anywhere
 * in this file, so a consumer cannot accidentally inherit a success sentence by
 * forgetting a prop. They either pass the sentence they mean or the region renders
 * nothing, and a form with no outcome shown is a worse form than one with a wrong
 * one.
 *
 * **`LiveRegion` renders nothing when it has nothing to say**, which is the correct
 * shape and is also why a caller whose transport answers slowly should pass a
 * `status` from the first paint with their own in-progress sentence rather than
 * adding it later. Prism cannot hold the region open on the caller's behalf,
 * because Prism does not know whether a message is ever coming, and a permanently
 * present live region announces every unrelated state change of its ancestors.
 *
 * **The one thing Prism does with `status` is refuse a second press.** While the
 * state reads `sending`, the submit control is disabled, because a second press
 * while the first request is in flight is a duplicate subscription that no
 * transport wants and that the caller cannot see. The control is disabled rather
 * than replaced by a spinner, so the label never changes under the reader's finger
 * and the live region carries the busy state instead. That is the whole of Prism's
 * reading of the state, and it is stated here because the alternative is a Block
 * that has begun to have opinions about the request.
 *
 * **This is one of the four items DESIGN.md's Known Open Items lists as deferred to
 * v1.1**, alongside three Blocks that have since been written as well. The deferral
 * was a specification of what was still to come rather than a decision not to build
 * it, and this is that item arriving; the table in `DESIGN.md` still names it, and
 * removing it from that row is a maintainer's line rather than this file's.
 *
 * It is a client Component, and the reason is the handler rather than the state.
 * `onSubmit` is a function, a function is a piece of state, and state is a client
 * module: a server component cannot hand an event handler down to a `<form>`, so a
 * caller rendering this from a server component gets a form that submits and calls
 * nothing. The rest of the rendering is a section and a field, which is the price
 * of the argument above and not a claim about what else this Block might do.
 */
export function Newsletter01({
  eyebrow,
  title,
  description,
  onSubmit,
  value,
  defaultValue,
  consent,
  submitLabel,
  status,
  label,
  layout = 'stacked',
  headingLevel = 'h2',
  className,
}: Newsletter01Props) {
  const generated = useId()
  const inputId = `${generated}-email`
  const consentId = `${generated}-consent`
  const sending = status?.state === 'sending'

  /*
   * The value is read out of the form rather than out of `value`, because a
   * controlled field and an uncontrolled one have to reach the same handler. A
   * Block that read `value` would hand over an empty address from every consumer
   * who left the field uncontrolled, and one that kept its own copy would own the
   * address, which is the thing this whole Block is shaped to refuse.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const read = new FormData(event.currentTarget).get('email')
    onSubmit({ email: typeof read === 'string' ? read : '' })
  }

  return (
    <Section data-slot="newsletter-01" className={cn(className)}>
      <div data-slot="newsletter-01-body" className="flex flex-col gap-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        <form
          data-slot="newsletter-01-form"
          onSubmit={handleSubmit}
          className="flex w-full max-w-measure flex-col gap-4"
        >
          <Field>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

            <div
              data-slot="newsletter-01-row"
              className={cn(
                'flex w-full flex-col gap-3',
                layout === 'inline' ? 'sm:flex-row sm:items-start' : null,
              )}
            >
              <Input
                data-slot="newsletter-01-field"
                id={inputId}
                name="email"
                type="email"
                autoComplete="email"
                value={value}
                defaultValue={defaultValue}
                aria-describedby={consentId}
              />
              <Button data-slot="newsletter-01-submit" type="submit" disabled={sending}>
                {submitLabel}
              </Button>
            </div>

            {/*
             * The consent line is the field's description rather than a paragraph
             * under the form, because it is a statement about what will happen to
             * this control's value and a reader filling in a form is entitled to it
             * at the control. `aria-describedby` is what carries it there for a
             * screen reader, so what a sighted reader reads under the field and
             * what is announced with the field are the same sentence.
             */}
            <FieldDescription id={consentId}>{consent}</FieldDescription>
          </Field>

          {/*
           * `assertive` only for a refusal, and that is the difference the two
           * politeness values make: a request that succeeded is a note a reader is
           * waiting for and can take in order, while a request that was refused is
           * the answer to the thing they just did and nothing else follows it. The
           * region itself renders nothing when there is no message, so a form in
           * its resting state carries no live region at all.
           */}
          <LiveRegion
            politeness={status?.state === 'error' ? 'assertive' : 'polite'}
            busy={sending}
            className="text-sm"
          >
            {status?.message}
          </LiveRegion>
        </form>
      </div>
    </Section>
  )
}

export default Newsletter01
