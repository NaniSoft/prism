'use client'

import type { FormEvent, ReactNode } from 'react'
import { useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, FieldDescription, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { LiveRegion } from '../../components/ui/live-region'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The inbox address a link is sent to, declared by the caller.
 *
 * **A field and not a string, and the reason is that this screen's whole mechanism
 * is that something is about to be posted to this address.** The label is the
 * product's own claim about what the reader should type, and the description is a
 * node because the honest line in this position is a link to the document that says
 * which inbox a person should use, and a caller who has to flatten theirs to a
 * string loses it.
 *
 * `type` has one member rather than the two a sign-in field offers, and that is the
 * design rather than an omission: a magic link is posted, so the address is an inbox
 * and not a handle, and a phone keyboard that offers the wrong keypad for a handle
 * is a small wrongness on the one field on this screen that has to be right.
 */
export type MagicLink01Identifier = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /**
   * The type of the control, and `email` is the only value there is.
   *
   * Named as a one-member union rather than left to the platform's default so that
   * the choice is visible in the type a caller reads, and so that a consumer who
   * genuinely needs a different control is forced to say so rather than to pass
   * something the Block will quietly ignore.
   */
  type?: 'email'
  /**
   * The platform's autofill hint.
   *
   * Left to the caller rather than defaulted, because a password manager keys an
   * account on the identifier and the hint that is right depends on what this product
   * calls a person. `email` is right on most of them and the caller knows which.
   */
  autoComplete?: string
  /**
   * A line under the control, announced with it rather than printed under the row.
   *
   * A node, and wired to the control through `aria-describedby` so a screen reader
   * hears what the address is for as the reader reaches it.
   */
  description?: ReactNode
  /**
   * The address as the caller holds it.
   *
   * Required with `onValueChange` and refused without it, for the reason the Block's
   * JSDoc gives: a value this Block holds and the caller cannot see is a value the
   * caller cannot clear, and a reader who mistyped an address is exactly the reader
   * who needs to clear this one.
   */
  value?: string
  /** Called with the address as the reader changes it. */
  onValueChange?: (value: string) => void
}

/**
 * The link that has been sent, and the one control that undoes it.
 *
 * **A prop and never an internal state Prism writes, and that is the whole of the
 * decision this Block is shaped around.** A passwordless screen has two states, not
 * one: not yet sent, and sent. The obvious arrangement is a screen that replaces
 * its form with a confirmation the moment the link goes out, which is what a
 * storefront's version does, and it takes away the reader's ability to notice that
 * the address was wrong. A link posted to a mistyped address produces a page that
 * says it worked, and the reader's next four minutes are spent in an inbox that will
 * never contain it. So the confirmation is this type: it names the address it was
 * sent to, in full, and it carries a control to change it, and the caller is the one
 * who decides whether the address was right.
 */
export type MagicLink01Sent = {
  /**
   * The address the link was posted to, printed exactly as the caller recorded it.
   *
   * A string and not a node, because this is a datum a reader has to check against
   * the inbox they are about to open, and a caller who wrapped it in a `<strong>`
   * would have made the two halves of it two different readings. A caller whose own
   * product masks part of an address in this position is making a decision about
   * their own users' privacy and can hold it in their own state.
   */
  identifier: string
  /**
   * How long the link stays usable, in the caller's own words.
   *
   * A node because the honest reading is a sentence in the caller's language and
   * sometimes carries a link to the document that states the whole policy. A Block
   * that formatted a duration would be choosing a locale and a granularity on a
   * reader's behalf, on the one line where being vague reads as a shorter life than
   * the link actually has.
   */
  expiresLabel?: ReactNode
  /**
   * The words on the control that brings the form back.
   *
   * Required, and a sentence for the same reason every other control name in this
   * package is: "change" says what the control is and "use a different address" says
   * what pressing it does, and the second is the one a voice control user has to be
   * able to say out loud.
   */
  changeLabel: string
  /**
   * Called with the address when the reader asks to change it.
   *
   * The Block does nothing else with it, and cannot: bringing the form back is the
   * caller's state, because only the caller knows whether the reader is correcting a
   * typo, asking for a second link, or moving to a different account. A Block that
   * cleared its own field here would be replacing one address with another without
   * being asked.
   */
  onChange: (identifier: string) => void
}

/**
 * What the caller's own request is doing, in the caller's own words.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: a mail transport has more outcomes than any other transport in this
 * package, from delivered to filtered to delayed to bounced to silently never
 * queued, and one sentence cannot be true of all five.
 */
export type MagicLink01Status = {
  /**
   * Which of the four the request is in. Read by the Block for two things only.
   *
   * `resent` is the member that changes the resend control's words, because a
   * control that still says the same sentence immediately after the reader pressed it
   * is a control inviting a second request against a limit the Block cannot see. The
   * other two that matter are `sent` and `error`, and they are the caller's to say:
   * whether a link was accepted by the transport is a fact about the caller's server.
   */
  state: 'idle' | 'sent' | 'resent' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The props a MagicLink01 takes. Every string in this Block is one of them.
 *
 * There is one field here and no field list, and the reason is that there is
 * genuinely one field: a magic link is posted to an inbox, so there is one address
 * and no second question. A Block with a declared list would have been a shape
 * waiting to be wrong, and a caller who wants a name and an address here is asking
 * for a different screen.
 */
export type MagicLink01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a screen that is about to post something to an inbox and says
   * nothing about what is being posted is a form a reader will hesitate over.
   */
  title: ReactNode
  /**
   * What is about to happen, in the caller's own words. Required, and the reason is
   * the one the whole Block is named after.
   *
   * **Every other Block in this package makes `description` optional and this one
   * does not, and a passwordless screen's whole mechanism is that the reader is
   * about to be sent something.** Press the control and nothing visible happens: no
   * page loads, no code arrives on the screen, no field changes. The one thing the
   * reader has to be told is that something has been posted and where it went, and
   * the place to tell them is above the control where they are about to press it. A
   * reader who does not know will treat the form as broken, and they will be right
   * about the form and wrong about the product, and the second of those is the more
   * expensive mistake: they will press it again, and then again, and a screen that
   * can be pressed three times in four seconds is a screen a rate limiter will meet
   * before the reader reads the sentence that was there all along.
   *
   * So the type makes it required rather than the Block defaulting to something, and
   * the cost of that is named: a product that genuinely has nothing to say about what
   * arrives has to write the sentence anyway, and the sentence is usually one it
   * should have written on its sign-in screen too.
   */
  description: ReactNode
  /**
   * Called with the address, and the only thing this Block does with it.
   *
   * **Required, and the requirement is the design.** There is no transport here, no
   * mailer, no queue and no route, because every one of those is a decision about the
   * caller's product and its data, and a frame that takes one is a frame that has to
   * be replaced rather than configured. A consumer who wants a transport writes one; a
   * consumer who already has one passes it straight in. The Block sends nothing, and
   * the sentence saying that something was sent is the caller's.
   */
  onSubmit: (value: { identifier: string }) => void
  /** The address field, declared by the caller. See `MagicLink01Identifier`. */
  identifier: MagicLink01Identifier
  /** The words on the one control that posts the link. */
  submitLabel: string
  /**
   * Called with the address when the reader asks for the link again.
   *
   * **A separate control and not a second press of submit, and the reason is the
   * whole of what the `sent` state is for.** The two actions look identical from the
   * outside and are not the same at all: submitting posts a link for an address the
   * reader has just typed, and asking again posts a link for an address that is
   * already on the screen in the confirmation. A reader who mistyped an address needs
   * the first, and a reader who opened the wrong inbox needs the second, and a screen
   * that offers one control for both makes the second reader retype an address they
   * have already confirmed to get the thing they were already offered. So the
   * confirmation carries its own control, with its own two names, and the caller's
   * function receives the address the link was sent to rather than whatever happens to
   * be in a field.
   */
  onResend?: (identifier: string) => void
  /**
   * The accessible name of the resend control while nothing has been resent.
   *
   * Required whenever `onResend` is set, and a sentence rather than a noun phrase for
   * the reason every other control name in this package is: a control announced as
   * "resend" tells a voice control user what the control is and not what pressing it
   * does, and on this screen pressing it posts a message to an inbox.
   */
  resendLabel?: string
  /**
   * The accessible name of the resend control once a resend has been requested.
   *
   * Required whenever `onResend` is set, and required as a second sentence rather
   * than as a state flag, for the reason `PasswordField.revealLabel` and
   * `PasswordField.hideLabel` give in full: the name has to describe what pressing
   * the control will do next, not what is currently true. Without it the control
   * would read the same sentence before and after the reader pressed it, which is an
   * invitation to press it again against a limit the Block cannot see.
   */
  resendConfirmLabel?: string
  /**
   * What the caller's own request is doing, drawn in a live region and announced.
   *
   * See the Block's JSDoc for why there is no sent sentence anywhere in this file.
   */
  status?: MagicLink01Status
  /**
   * The link that has been sent, and the control that brings the form back.
   *
   * Omit it and the form is what is on screen, which is the state this Block starts
   * in. Pass it and the confirmation replaces the form, because a passwordless
   * screen has two states and a reader who cannot see the address the link went to
   * cannot tell whether the thing that went wrong was the address. The address stays
   * on the screen in full, and the control to change it is drawn beside it, and the
   * caller's `status` is expected to carry the sentence that says what to look for.
   */
  sent?: MagicLink01Sent
  /** Heading level for the section heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * Whether a caller passed a word that is not there.
 *
 * Read as `string | undefined` rather than as the declared type, because the check
 * is about the value that turned up rather than about what the type promised. A
 * JavaScript caller and a value out of a session store both arrive with the type's
 * guarantee already gone, and the diagnostic below is the last place that can still
 * say what was wrong.
 */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on a screen a reader is
 * about to post an address to.
 *
 * Five shapes, and each one is a control that cannot be used or a sentence that
 * would be read in the wrong language. A nameless field is announced as a text field,
 * which is the only name on the page and says nothing about what it is for. A value
 * with no `onValueChange` is a field the caller cannot clear, and a reader who
 * mistyped an address is the reader who needs to clear it. A resend control with one
 * name and not the other announces the same sentence before and after the reader
 * pressed it. A resend handler with nowhere to draw its control composes a function
 * and two labels and then discards them, which is a caller who believes they have a
 * control on a screen that has none. A change control with no words is a button a
 * reader can reach and not identify.
 */
function assertMagicLink(input: {
  identifier: MagicLink01Identifier
  submitLabel: string
  onResend: ((identifier: string) => void) | undefined
  resendLabel: string | undefined
  resendConfirmLabel: string | undefined
  sent: MagicLink01Sent | undefined
}): void {
  const { identifier, submitLabel, onResend, resendLabel, resendConfirmLabel, sent } = input

  if (blank(identifier.label)) {
    throw new Error(
      'MagicLink01: the address field declares no label, so its control would be announced as a text ' +
        'field, which is the only name on this screen and says nothing about what it is for. Pass the words ' +
        'the product uses for a person inbox.',
    )
  }

  if (blank(submitLabel)) {
    throw new Error(
      'MagicLink01: submitLabel is blank, so the one control this screen has would be announced as a button ' +
        'and a reader would have to guess that pressing it posts a link to an inbox. Pass the sentence.',
    )
  }

  if (identifier.value !== undefined && identifier.onValueChange === undefined) {
    throw new Error(
      'MagicLink01: identifier.value was passed with no onValueChange, so the field would show the address ' +
        'once and then stop telling the caller what is in it, and the Block would have nowhere to post a ' +
        'corrected one to. Pass the pair, or neither.',
    )
  }

  if (onResend === undefined) {
    if (resendLabel !== undefined || resendConfirmLabel !== undefined) {
      throw new Error(
        'MagicLink01: a resend label was passed with no onResend, so the sentence would be composed and then ' +
          'discarded, which is a caller who believes they have named a control on a screen that has none. Pass ' +
          'the handler, or drop the labels.',
      )
    }
    return
  }

  if (blank(resendLabel) || blank(resendConfirmLabel)) {
    throw new Error(
      'MagicLink01: onResend was passed with fewer than two names for its control. One name means the control ' +
        'reads the same sentence before and after the reader pressed it, which is an invitation to press it ' +
        'again against a limit this Block cannot see. Pass the resting name and the name it takes afterwards.',
    )
  }

  if (sent === undefined) {
    throw new Error(
      'MagicLink01: onResend was passed with no sent, so the control that asks for the link again has nowhere ' +
        'to be drawn and the address it would resend to is not on the screen. A resend is not a second press ' +
        'of submit; it belongs in the confirmation. Pass sent, or drop onResend.',
    )
  }

  if (blank(sent.changeLabel)) {
    throw new Error(
      'MagicLink01: the confirmation was passed with no changeLabel, so the control that brings the form back ' +
        'would be a button a reader can reach and not identify, on the one screen where a reader who mistyped ' +
        'an address needs to know it is there. Pass the sentence.',
    )
  }
}

/**
 * A passwordless sign-in: one address, one control that posts a link to it, and the
 * caller's own sentence about what is about to arrive.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a magic-link card: an email field, a button, and a line that
 * says a link is on its way, and its purpose is to let a shopper past the gate
 * without inventing a password they would then have to remember. Prism's products
 * observe a pipeline, capture a market, watch an estate and run agents, and a machine
 * acting on behalf of a person is the whole subject, so this is the screen where a
 * human authorises a machine with something that expires and cannot be replayed by
 * whoever finds the inbox. The composition is the storefront's and is unchanged: one
 * field, one control, one sentence about what is coming. What differs is what the
 * reader is trusting, and that shows up in the two decisions below.
 *
 * **What it authorises.** A successful `onSubmit` means the caller's own server has
 * posted a link and will accept a request carrying that link's token. It does not
 * mean the link arrived, that the address can receive mail, or that the reader is who
 * they say they are; the first is a fact about a mail transport and the third is
 * exactly what the link is for. The Block has done no more than carry one string
 * across a form boundary. It posts nothing.
 *
 * **What it deliberately does not do.** It will not say whether the address exists.
 * It will not rate-limit how many links can be asked for. And it will not decide
 * whether the address was right. Each of those is the consumer's, and each is a
 * security decision rather than a rendering one, so a Block that made any of them
 * would be something other than a composition: a Block that looked an address up
 * would be an account directory, which is the enumeration oracle the sign-in surface
 * refuses to be, and it would be the worst possible place for one because a reader
 * arriving at this screen has just been told that a passwordless sign-in is
 * available. A Block that rate-limited would be a rate limiter in a component
 * library, shipping one policy to every product that installed it, in a place no
 * consumer reads it. And a Block that judged the address would be guessing at a
 * format on the reader's behalf, on the one field where a wrong guess is a lockout
 * for somebody whose address is unusual and perfectly deliverable. So the Block draws
 * the field the caller declared, hands over the string, and prints back what the
 * caller says was sent.
 *
 * **There are two states, not one, and keeping them apart is the decision this Block
 * is shaped around.** Not yet sent, and sent. The obvious arrangement is a screen
 * that replaces its form with a confirmation the instant the link goes out, which is
 * what the storefront version does, and it is the arrangement that makes this screen
 * dangerous on an instrument. A link posted to a mistyped address produces a page that
 * says it worked, so the reader opens an inbox that will never contain anything,
 * decides the product is broken, and tries again with a second address, which is now
 * two accounts and a support ticket. A screen that keeps the address on the screen,
 * in full, beside a control to change it, turns that four minutes into one glance.
 * So `sent` is a prop rather than an internal state: the caller says the link is out,
 * the Block draws the address and the change control and nothing else, and the cost
 * is stated rather than hidden, which is that a reader who arrives at a confirmation
 * with no `sent` on screen sees a form again and will press it again, so the caller
 * has to pass `sent` at the same moment they pass a `status` of `sent`. That is one
 * piece of state in step with another, in the caller's own reducer, and it is stated
 * here because the alternative was a Block that invented its own sent flag and then
 * could not know whether the link it believed it had sent was the one the caller's
 * server had.
 *
 * **The resend control is a separate action from submit, and the reason is that the
 * two look identical and are not.** Submitting posts a link for an address the reader
 * has just typed. Asking again posts a link for an address that is already on the
 * screen in the confirmation. A reader who opened the wrong inbox needs the second,
 * and a screen that offers one control for both makes that reader retype an address
 * they have already confirmed in order to get the thing they were already offered. So
 * the confirmation carries its own control, the caller's handler receives the address
 * the link was sent to rather than whatever happens to be in a field, and the two
 * names it needs are both required, because a control that reads the same sentence
 * before and after the reader pressed it is an invitation to press it again against a
 * limit this Block cannot see.
 *
 * **The honest failure state is the caller's sentence, and the reason is that a mail
 * transport has more outcomes than one sentence can be true of.** A send can be
 * accepted and delivered, accepted and filtered, accepted and delayed by an hour,
 * accepted and bounced, refused at the first hop because the domain cannot receive
 * mail, and refused because the caller's own queue is full. None of those is knowable
 * from here, and a screen that says "we sent it" is making a claim about a
 * transport it has never spoken to. So `status` is a prop, this file holds no `sent`
 * flag and no `error` flag, and the sentence is the product's. What the Block does
 * about it is the two rendering decisions: the outcome is drawn in one live region
 * that is rendered on both sides of the state change rather than one per state,
 * because a live region that appears together with its first message is the one case
 * a screen reader is least reliable about, and a region that was already on the page
 * is already watching. The submit control is not disabled, and the status union has
 * no in-flight member to disable it with; the caller's way to refuse a second press
 * is to pass `sent`, which takes the form off the screen, and the cost of that is
 * named on the `sent` prop.
 *
 * **`description` is required here and optional on every other Block in this package,
 * and the reason is that this screen's whole mechanism is invisible.** Press the
 * control and nothing visible happens: no page loads, no code appears on the screen,
 * no field changes. A reader who does not know a link is about to be posted treats
 * the form as broken, and presses it again, and the reader is right about the form
 * and wrong about the product, and a screen that can be pressed three times in four
 * seconds meets a rate limiter before the reader has read the sentence that was there
 * all along. So the type makes it required rather than the Block defaulting to
 * something, and the cost is named: a product with nothing to say about what arrives
 * has to write a sentence anyway.
 *
 * **The address is held by this Block, and the reason is that a reader who mistyped
 * it has to be able to clear it.** The Block keeps the string, hands it to the caller
 * on every change when an `onValueChange` was passed, and adopts a `value` prop the
 * moment it changes, which is the arrangement React documents for a prop that can
 * change under a stateful child. The cost is that a caller who never passes `value`
 * owns nothing, and can bring the form back only by changing their own state, which is
 * also how they bring it back from the confirmation, so the two are the same decision
 * in the same place.
 *
 * **It is a client Component, and the directive is unconditional.** `onSubmit` and
 * `onResend` are functions, a function is a piece of state, and state is a client
 * module: a server Component cannot hand an event handler to a `<form>` or a
 * `<button>`, so a caller rendering this from a server component gets a form that
 * posts and calls nothing.
 */
export function MagicLink01({
  eyebrow,
  title,
  description,
  onSubmit,
  identifier,
  submitLabel,
  onResend,
  resendLabel,
  resendConfirmLabel,
  status,
  sent,
  headingLevel = 'h2',
  className,
}: MagicLink01Props) {
  assertMagicLink({ identifier, submitLabel, onResend, resendLabel, resendConfirmLabel, sent })

  const generated = useId()
  const identifierId = `${generated}-identifier`
  const identifierDescriptionId = `${generated}-identifier-description`
  const resent = status?.state === 'resent'
  const posted = sent !== undefined

  /*
   * The address, and the two pieces of render-time state that let the Block adopt a
   * caller's value and keep it in step. Both are adjusted during render rather than
   * in an effect, because the trigger is a prop changing and this is the arrangement
   * React documents for it: a set during render is applied before the browser paints,
   * so a controlled caller never sees the field disagree with the value it just sent,
   * which on this screen is the difference between a reader seeing a correction and a
   * reader posting to the address they had already decided was wrong.
   */
  const [typed, setTyped] = useState(identifier.value ?? '')
  const [seen, setSeen] = useState(identifier.value)
  if (seen !== identifier.value) {
    setSeen(identifier.value)
    setTyped(identifier.value ?? '')
  }

  const setIdentifier = (value: string) => {
    setTyped(value)
    identifier.onValueChange?.(value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ identifier: typed })
  }

  return (
    <Section data-slot="magic-link-01" className={cn(className)}>
      <div data-slot="magic-link-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <Card data-slot="magic-link-01-card" className="max-w-measure-narrow gap-0 px-6">
          {posted ? (
            /*
              The second state, and the whole of why the first one gets a form. The
              address is printed in full rather than masked, truncated or summarised,
              because the reader's next action is to open an inbox and compare, and a
              confirmation that does not show what it posted to cannot be checked. The
              change control is beside it rather than under it, so a reader who
              recognises the mistake can act on it without reading past the sentence
              about expiry first.
            */
            <div data-slot="magic-link-01-sent" className="flex flex-col gap-5">
              <div data-slot="magic-link-01-sent-body" className="flex flex-col gap-1.5">
                <span data-slot="magic-link-01-sent-identifier" className="text-base font-medium break-words">
                  {sent.identifier}
                </span>
                {sent.expiresLabel === undefined ? null : (
                  <span
                    data-slot="magic-link-01-sent-expires"
                    className="text-muted-foreground text-sm text-pretty"
                  >
                    {sent.expiresLabel}
                  </span>
                )}
              </div>

              {/*
                The two controls for the two things a reader can want next, in the
                order they are likely to want them: correct the address, or ask for the
                link again. The resend control's words follow the caller's own state,
                because a control that reads the same sentence immediately after the
                reader pressed it is an invitation to press it again against a limit
                this Block cannot see, and the run above has already refused to draw it
                without both names.
              */}
              <div data-slot="magic-link-01-sent-actions" className="flex flex-wrap items-center gap-3">
                <Button
                  data-slot="magic-link-01-change"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => sent.onChange(sent.identifier)}
                >
                  {sent.changeLabel}
                </Button>

                {onResend === undefined ? null : (
                  <Button
                    data-slot="magic-link-01-resend"
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={resent}
                    onClick={() => onResend(sent.identifier)}
                  >
                    {resent ? resendConfirmLabel : resendLabel}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form
              data-slot="magic-link-01-form"
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-5"
            >
              <Field data-slot="magic-link-01-identifier">
                <FieldLabel htmlFor={identifierId}>{identifier.label}</FieldLabel>
                <Input
                  id={identifierId}
                  type={identifier.type ?? 'email'}
                  autoComplete={identifier.autoComplete}
                  value={typed}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                  aria-describedby={
                    identifier.description === undefined ? undefined : identifierDescriptionId
                  }
                />
                {identifier.description === undefined ? null : (
                  <FieldDescription id={identifierDescriptionId}>
                    {identifier.description}
                  </FieldDescription>
                )}
              </Field>

              <Button
                data-slot="magic-link-01-submit"
                type="submit"
                className="w-full"
              >
                {submitLabel}
              </Button>
            </form>
          )}

          {/*
            One region for both states, and the reason it sits outside the branch
            above is the reason it is here at all. A live region that is added to the
            document together with its first message is the one case assistive
            technology is least reliable about, because the announcement depends on
            the mutation observer seeing content arrive in a region it had already
            decided to watch. This one is on the page from the first paint, in both
            states, and it renders no element at all while there is no message, which
            is the arrangement `LiveRegion` was written for: no region at rest, and a
            region already watching when the sentence that matters arrives.

            It is never busy, and there is no `working` state in this Block's status
            union to be busy about. That is a real gap and it is stated rather than
            papered over: this screen has no in-flight member, so the submit control
            is not disabled, and a caller whose mail queue takes three seconds has a
            form a reader can press three times in three seconds. The caller's way to
            refuse that is `sent`, which replaces the form with controls that are not
            submit controls, and the cost of doing it there rather than on a pending
            flag is that the confirmation arrives when the caller's server says the
            link is out rather than when the reader presses the control. The sentence
            in the heading is what carries the wait, which is the other reason
            `description` is required above.
          */}
          <LiveRegion
            data-slot="magic-link-01-status"
            politeness={status?.state === 'error' ? 'assertive' : 'polite'}
            className={cn(
              'mt-5 text-sm',
              status?.state === 'error' ? 'text-destructive font-medium' : 'text-muted-foreground',
            )}
          >
            {status?.message}
          </LiveRegion>
        </Card>
      </div>
    </Section>
  )
}

export default MagicLink01
