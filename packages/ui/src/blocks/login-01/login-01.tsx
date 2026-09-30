'use client'

import type { FormEvent, ReactNode } from 'react'
import { useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { CtaLink } from '../../components/ui/cta-link'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { LiveRegion } from '../../components/ui/live-region'
import { PasswordField } from '../../components/ui/password-field'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The thing a reader types to say who they are, declared by the caller.
 *
 * **A field and not a string, and the reason is that the identifier is the first
 * decision this screen cannot make for the caller.** A product that signs people in
 * by email and a product that signs people in by a handle, a staff number or a
 * workspace name all need the same labelled text control, and the words above it
 * are the product's own claim about what identifies a person there. So the label is
 * required, the type is a choice between the two that a platform can do something
 * different with, and the description is a node because the honest line in this
 * position is often a link to the document that says what the identifier is.
 */
export type Login01Identifier = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /**
   * Which of the two the platform's own behaviour differs on.
   *
   * `email` is the default because it is the answer on most of these products and
   * because a keyboard on a phone turns a different keypad up for it. `text` is
   * right for a handle, a staff number and a workspace name, and it is also the
   * only one of the two that will accept an address a mail server will not.
   */
  type?: 'email' | 'text'
  /**
   * The platform's autofill hint.
   *
   * Left out of this type's defaults on purpose: the hint that is right depends on
   * the identifier rather than on the Block, and `email` is the one a password
   * manager keys an account on. Pass it when the identifier is not an address.
   */
  autoComplete?: string
  /**
   * A line under the control, announced with it rather than printed under the row.
   *
   * A node, because half of the useful sentences in this position carry a link to
   * the document that explains the product's idea of an identifier, and a caller
   * who has to flatten theirs to a string loses it.
   */
  description?: ReactNode
  /**
   * The identifier as the caller holds it.
   *
   * Required with `onValueChange` and refused without it, for the reason the Block's
   * JSDoc gives: a value this Block holds and the caller cannot see is a value the
   * caller cannot clear, and a credential field that cannot be cleared is a
   * credential field a reader has to reload the page to abandon.
   */
  value?: string
  /** Called with the identifier as the reader changes it. */
  onValueChange?: (value: string) => void
}

/**
 * The secret, and the two sentences a reveal control has to be named with.
 *
 * **`revealLabel` and `hideLabel` are here and cannot be defaulted, and the reason is
 * the one `PasswordField` argues for at length.** A reveal control that says one
 * sentence in a product whose interface is in another language looks localised,
 * because the icon is the same everywhere and the half a screen reader user actually
 * hears is English. A Block that filled them in would be shipping English into every
 * consumer's password field, which is the exact defect `check-block-copy` was
 * written to end.
 */
export type Login01Secret = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** The accessible name of a reveal control while the secret is hidden. */
  revealLabel: string
  /** The accessible name of a reveal control while the secret is showing. */
  hideLabel: string
  /** The secret as the caller holds it. Refused without `onValueChange`. */
  value?: string
  /** Called with the secret as the reader changes it. */
  onValueChange?: (value: string) => void
  /**
   * A line under the control.
   *
   * Replaced by `error` while the field is invalid rather than stacked under it, so
   * the reader has one instruction at a time. That replacement is `PasswordField`'s
   * own and this Block does not re-decide it.
   */
  description?: ReactNode
  /**
   * What is wrong with the entry, in the destructive token and announced as it
   * appears. It also marks the control invalid.
   *
   * The caller's sentence, and the reason is the same one the field's label is: a
   * product that says "That password has been in three breaches" and a product that
   * says "Wrong password" are making different claims about their own credential
   * store, and one of them is a decision about whether the account exists.
   */
  error?: ReactNode
}

/**
 * The remember control, and what it remembers.
 *
 * **A row and not a checkbox, and the reason is that the label is a sentence about
 * a duration.** "Keep me signed in" is a claim about a session length and a cookie,
 * and "Remember this device for 30 days" is a different claim with a different
 * consequence if the device is shared. Both are the caller's, and both belong beside
 * the control rather than inside it.
 */
export type Login01Remember = {
  /** The words on the control, and its accessible name. */
  label: string
  /** Whether the row is ticked, as the caller holds it. Refused without `onValueChange`. */
  value?: boolean
  /** Called with the new state as the reader ticks the control. */
  onValueChange?: (value: boolean) => void
  /** A line under the label, read after it rather than instead of it. */
  description?: ReactNode
}

/**
 * One of the two ways off this screen, and where each of them goes.
 *
 * A sentence and not a noun phrase, and the reason is the defect the whole
 * component family is written against: a link whose visible words do not say what
 * activating it does is a link a voice control user cannot say out loud, because
 * the words they can see are the words they can speak. "Reset your password" and
 * "Create an account instead" are sentences. "Forgot?" and "Sign up" are two
 * destinations a reader has to stop and read the context of.
 */
export type Login01Link = {
  /** The words on the link, and its accessible name. */
  label: string
  /** The destination, in the `href` where the status bar and the context menu can reach it. */
  href: string
}

/**
 * What the caller's own sign-in request is doing, in the caller's own words.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states and stated hardest here: a credential surface has more failure
 * sentences than any other surface in the package, and the one this package wrote
 * would be the one most certainly wrong. See the Block's JSDoc.
 */
export type Login01Status = {
  /**
   * Which of the three the request is in. Read by the Block for two things only.
   *
   * `working` disables the submit control, because a second press while the first
   * request is in flight is a second credential sent to the caller's own server and
   * a second attempt counted against whatever limit the caller has. `error` is the
   * only other member that changes anything, and it changes one thing: the region
   * announces the message rather than waiting for a pause, because a reader who
   * pressed a button and got nothing back is a reader who will press it again.
   */
  state: 'idle' | 'working' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The props a Login01 takes. Every string in this Block is one of them.
 *
 * There is no field list here and that is the design rather than an omission. A
 * sign-in form is two controls wide on four of the four consumer sites and three on
 * the other, and a list would have been a shape that has to be validated against
 * every arrangement a product actually ships. What this Block does take as a
 * declaration is the one thing that varies in kind rather than in number: the
 * identifier.
 */
export type Login01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a credential surface with no heading is a form in a page, and
   * a reader who has just been asked to authorise a machine deserves to be told
   * which one before they type.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * Called with what the reader typed, and the only thing this Block does with it.
   *
   * **Required, and the requirement is the whole of the Block's neutrality.** There
   * is no transport here, no route, no session store and no cookie, because every
   * one of those is a decision about the caller's product and its data, and a frame
   * that takes one is a frame that has to be replaced rather than configured. A
   * consumer who wants a transport writes one; a consumer who already has one
   * passes it straight in.
   */
  onSubmit: (value: { identifier: string; secret: string; remember: boolean }) => void
  /** The identifier field, declared by the caller. See `Login01Identifier`. */
  identifier: Login01Identifier
  /** The secret field, and the two sentences its reveal control is named with. */
  secret: Login01Secret
  /** The remember row. Omit it and the row is not drawn, which is a real choice. */
  remember?: Login01Remember
  /** The words on the one control that submits. */
  submitLabel: string
  /**
   * Whether the caller's request is in flight.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `submitting` is the control, and `status.state` is the outcome. A caller whose
   * transport is a server action gets a pending state without a status, and a caller
   * with a status of their own gets one without wiring a pending flag.
   */
  submitting?: boolean
  /**
   * What the caller's own request is doing, drawn in a live region and announced.
   *
   * See the Block's JSDoc for why there is no sentence anywhere in this file and
   * what the honest failure of a sign-in looks like.
   */
  status?: Login01Status
  /**
   * The caller's own second factor, drawn under the status.
   *
   * **A slot and not a `two-factor-01`, and the reason is that a second factor is
   * not one arrangement.** A product that asks for a code composes `two-factor-01`
   * and passes it here, a product that asks for a passkey puts a caller's own
   * ceremony control here, and a product that does both renders a chooser. All three
   * are the same screen at different moments and none of them is this Block's to
   * decide, so the region is drawn and the words, the controls and the states are the
   * caller's.
   */
  secondFactor?: ReactNode
  /**
   * The caller's own ways in that are not a typed identifier and a secret.
   *
   * **A slot, and the reason is the licensed asset.** A provider's mark is a
   * trademark this repository has no right to ship and no licence to redistribute,
   * and Prism's icon lane is Lucide, whose whole vocabulary is line drawings of
   * objects. So the marks, the names, the order and the accessible names of three
   * identity providers are the caller's, and so is whatever separates the row from
   * the form above it: this Block draws a rule above the slot and no words, because
   * the honest separator on a sign-in screen is a sentence in the product's language
   * and the word that most often appears there is the one a design system has no
   * business choosing.
   */
  providers?: ReactNode
  /** The link that leaves this screen to recover a secret. */
  forgot?: Login01Link
  /** The link that leaves this screen to create an account. */
  signup?: Login01Link
  /** Heading level for the section heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The three entries the form hands over, and the empty triple it starts from.
 *
 * `remember` is in here rather than being read from a control, because a checkbox
 * the reader ticks and forgets is not one this Block can report. The Block owns the
 * three values and the caller sees all of them at once, which is the arrangement
 * `settings-security-01` uses for its three password entries and the reason there.
 */
const EMPTY_CREDENTIALS = { identifier: '', secret: '', remember: false }

type Credentials = typeof EMPTY_CREDENTIALS

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
 * diagnostic in a console rather than a nameless control on the screen where a
 * reader is about to hand over a secret.
 *
 * Six shapes, and each one is a control that cannot be used or a sentence that would
 * be read in the wrong language. A nameless field is announced as a text field, and
 * two nameless fields on one page are announced identically. A nameless reveal
 * control is announced as a button, and it is the only button on a sign-in form
 * that a reader can reach with Tab. An English `revealLabel` in a product that does
 * not use the word is the half-localised control the copy gate was written to end. A
 * `value` with no `onValueChange` is a field the caller cannot clear. A
 * `remember.label` with no words is a checkbox nobody can find.
 */
function assertLogin(input: {
  identifier: Login01Identifier
  secret: Login01Secret
  remember: Login01Remember | undefined
  forgot: Login01Link | undefined
  signup: Login01Link | undefined
}): void {
  const { identifier, secret, remember, forgot, signup } = input

  if (blank(identifier.label)) {
    throw new Error(
      'Login01: the identifier field declares no label, so its control would be announced as a text ' +
        'field, which is the same name the secret field below it is announced by once the reveal control is ' +
        'out of the way. Pass the words the product uses for a person or a workspace.',
    )
  }

  if (blank(secret.label) || blank(secret.revealLabel) || blank(secret.hideLabel)) {
    throw new Error(
      'Login01: the secret field is missing one of its three words. A reveal control with no name is ' +
        'announced as a button, and it is the only control on this screen a keyboard reader reaches with ' +
        'Tab. Pass label, revealLabel and hideLabel in your own language.',
    )
  }

  if (identifier.value !== undefined && identifier.onValueChange === undefined) {
    throw new Error(
      'Login01: identifier.value was passed with no onValueChange, so the field would show the value once ' +
        'and then stop telling the caller what is in it, which is a credential the caller cannot clear when ' +
        'a reader gives up on the form. Pass the pair, or neither.',
    )
  }

  if (secret.value !== undefined && secret.onValueChange === undefined) {
    throw new Error(
      'Login01: secret.value was passed with no onValueChange, so the Block would hold a password the ' +
        'caller has lost track of and cannot clear. Pass the pair, or neither.',
    )
  }

  if (remember === undefined) return

  if (blank(remember.label)) {
    throw new Error(
      'Login01: a remember row was passed with no label, so the control would be a tick box with no words ' +
        'beside it and a reader could not tell what ticking it changes about the session. Pass the sentence ' +
        'your product uses, or drop the row.',
    )
  }

  if (remember.value !== undefined && remember.onValueChange === undefined) {
    throw new Error(
      'Login01: remember.value was passed with no onValueChange, so the row would show one state and then ' +
        'stop agreeing with the caller, which on a credential surface is a control that lies about the ' +
        'session the reader is about to be given. Pass the pair, or neither.',
    )
  }

  for (const link of [forgot, signup]) {
    if (link === undefined) continue
    if (blank(link.label)) {
      throw new Error(
        `Login01: the link to ${JSON.stringify(link.href)} declares no label, so the anchor's accessible name ` +
          'would be its destination, which a screen reader reads as a run of characters and a mouse reader ' +
          'cannot copy. Pass the sentence that says what following it does.',
      )
    }
  }
}

/**
 * A sign-in: the identifier a person is known by, the secret they keep, the one
 * control that hands both to the caller, and the caller's own words for what
 * happened.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a sign-in card: an email field, a password with an eye, a
 * remember-me tick, a button, a row of third-party marks and two links, and its
 * purpose is to get a shopper past the gate so their order history is waiting on the
 * other side. Prism's products observe a pipeline, capture a market, watch an estate
 * and run agents, and a machine acting on behalf of a person is the whole subject,
 * so this is the screen where a human authorises a machine. The composition is the
 * storefront's and is unchanged: the labelled identifier, the reveal, the remember
 * row, the single control, the provider row, the two links. What it authorises is a
 * session on an instrument, which is a claim with consequences a shopping account
 * does not have, and the difference shows up in exactly one place: the sentence on
 * the failure.
 *
 * **What it authorises.** A successful `onSubmit` means the caller's own server has
 * accepted an identifier and a secret and is about to open a session, and the Block
 * has done nothing more than carry two strings and a boolean across a form
 * boundary. It reads no credential off the page, verifies nothing, stores nothing,
 * and starts nothing. A reader who signs in here has authorised their own machine
 * and the caller's server is what decides whether that authorisation took.
 *
 * **What it deliberately does not do, and these are the three decisions every
 * credential surface has to make.** It will not rate-limit. It will not decide
 * whether the identifier exists. And it will not say whether the secret was right.
 * Each of those is the consumer's, and each is a security decision rather than a
 * rendering one, so a Block that made any of them would be something other than a
 * composition: a Block that rate-limited would be a rate limiter in a component
 * library, and it would be shipping one policy to every product that installed it, in
 * a place no consumer can read it. A Block that decided whether the identifier exists
 * would be an account directory, and it would also be an enumeration oracle: the
 * difference between "no such account" and "wrong password" is the difference between
 * a screen that can be used to discover who has an account and one that cannot, and
 * that difference is a product's disclosure decision. A Block that said whether the
 * secret was right would be a password verifier, which is the mechanism this package
 * is furthest from owning. So the Block hands over what was typed and draws what it
 * was given, and the three decisions are the caller's in the order they want to make
 * them.
 *
 * **The honest failure state is a single sentence, and the sentence is the caller's,
 * and the reason is that a credential surface's failures are not enumerable here.**
 * A sign-in can fail because the identifier is unknown, because the secret is wrong,
 * because the account is disabled, because the address was never verified, because
 * the session was revoked elsewhere, because a rate limit was reached, because a
 * breached-password list caught the secret, because the second factor was declined,
 * because the caller's identity provider is down, or because the caller's own database
 * is unreachable. Those are eleven outcomes with eleven different sentences, and the
 * product's choice about which of them a reader is told about is a disclosure
 * decision with a security consequence. One sentence this package wrote would be
 * inherited verbatim by every consumer and would be the one line on this screen most
 * certainly wrong. So `status` is a prop, this file holds no `error` flag and no
 * `success` flag, and the words for the field come from `secret.error` rather than
 * from anything here. What the Block does do about a failure is the two things that
 * are rendering rather than policy: it refuses a second press while the caller's
 * request is in flight, because a second press is a second credential sent to the
 * caller's server and a second attempt counted against a limit the Block cannot see,
 * and it marks the secret's own field invalid, so the reader is told which control
 * the sentence is about rather than being left to work it out.
 *
 * **There is no `Alert` anywhere in this file, and the alternative was a callout with
 * `role="alert"` beside the live region.** That would announce the same sentence
 * twice, once through the alert and once through the region, and on a screen where a
 * reader is waiting for an answer that is the one place a doubled announcement is
 * least forgivable: a screen reader user hears the refusal, is interrupted by the
 * refusal again, and cannot tell whether the two are the same message. So the
 * outcome is a `LiveRegion` whose politeness follows the caller's own state, and
 * `assertive` only for the refusal.
 *
 * **The Block owns the three values and adopts a caller's, and the reason is that
 * `PasswordField` is a controlled control.** A reveal toggle has to be able to show
 * and hide the same value, so the field cannot be uncontrolled, so the value has to
 * exist before the reader types anything, and so a Block that declared `value` and
 * `onValueChange` optional and then read them off the props would render a field that
 * accepts keystrokes into nothing. The Block therefore holds the three entries itself,
 * hands them to the caller on every change when an `onValueChange` was passed, and
 * adopts a `value` prop the moment it changes, which is the arrangement React
 * documents for a prop that can be changed under a stateful child. The cost is
 * stated rather than hidden: a caller who never passes `value` owns nothing and can
 * clear the form only by changing the caller's own state somewhere else, and a caller
 * who passes `value` without `onValueChange` is a caller whose control and whose
 * value are about to disagree, which is why that pair is refused above.
 *
 * **The secret field's `autoComplete` is left at `PasswordField`'s own default of
 * `current-password`, which is the right answer here and only here.** A sign-in is
 * the one place that hint is correct, and the other three places a password appears
 * want `new-password`, which is the argument `PasswordField` makes in full. The
 * identifier's hint is left to the caller rather than guessed, because a password
 * manager keys an account on the identifier and the right hint depends on what the
 * product calls a person.
 *
 * **It is a client Component, and the directive is unconditional.** `onSubmit` is a
 * function, a function is a piece of state, and state is a client module: a server
 * Component cannot hand an event handler to a `<form>`, so a caller rendering this
 * from a server component gets a form that submits and calls nothing. A consumer who
 * needs this to stay in the server graph can render it inside their own client
 * boundary, and the cost of that is their boundary rather than this Block's silence.
 */
export function Login01({
  eyebrow,
  title,
  description,
  onSubmit,
  identifier,
  secret,
  remember,
  submitLabel,
  submitting = false,
  status,
  secondFactor,
  providers,
  forgot,
  signup,
  headingLevel = 'h2',
  className,
}: Login01Props) {
  assertLogin({ identifier, secret, remember, forgot, signup })

  const generated = useId()
  const identifierId = `${generated}-identifier`
  const identifierDescriptionId = `${generated}-identifier-description`
  const rememberId = `${generated}-remember`
  const rememberDescriptionId = `${generated}-remember-description`

  /*
   * The three entries, and the two pieces of render-time state that let the Block
   * adopt a caller's value and keep it in step. Both are adjusted during render
   * rather than in an effect, because the trigger is a prop changing and this is the
   * arrangement React documents for it: a set during render is applied before the
   * browser paints, so a controlled caller never sees the field disagree with the
   * value it just sent.
   */
  const [typed, setTyped] = useState<Credentials>({
    identifier: identifier.value ?? '',
    secret: secret.value ?? '',
    remember: remember?.value ?? false,
  })
  const [seen, setSeen] = useState({ identifier: identifier.value, secret: secret.value, remember: remember?.value })
  if (
    seen.identifier !== identifier.value ||
    seen.secret !== secret.value ||
    seen.remember !== remember?.value
  ) {
    setSeen({ identifier: identifier.value, secret: secret.value, remember: remember?.value })
    setTyped({
      identifier: identifier.value ?? '',
      secret: secret.value ?? '',
      remember: remember?.value ?? false,
    })
  }

  const working = submitting || status?.state === 'working'

  /*
   * Three setters rather than one keyed by name, and the reason is that the three
   * report to three different callables with three different types. A single
   * `setEntry(key)` would be shorter and would need a cast on every call to make the
   * three `onValueChange` signatures agree, and a cast is where a credential would
   * be handed to the wrong callback.
   */
  const setIdentifier = (value: string) => {
    setTyped((was) => ({ ...was, identifier: value }))
    identifier.onValueChange?.(value)
  }

  const setSecret = (value: string) => {
    setTyped((was) => ({ ...was, secret: value }))
    secret.onValueChange?.(value)
  }

  const setRemember = (value: boolean) => {
    setTyped((was) => ({ ...was, remember: value }))
    remember?.onValueChange?.(value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(typed)
  }

  return (
    <Section data-slot="login-01" className={cn(className)}>
      <div data-slot="login-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/*
          The card, and it is a `Card` because a credential surface is the one place
          in this package where the reader is looking at a form rather than at a
          product, and a form floating on the page ground has no edge to say so. The
          measure-narrow cap is the one piece of layout here: a sign-in form at the
          full container width is a form with a 1300 pixel row of text labels, which
          is the width a form was never readable at.
        */}
        <Card data-slot="login-01-card" className="max-w-measure-narrow gap-0 px-6">
          <form
            data-slot="login-01-form"
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-5"
          >
            <FieldGroup data-slot="login-01-fields">
              <Field data-slot="login-01-identifier" data-field="identifier">
                <FieldLabel htmlFor={identifierId}>{identifier.label}</FieldLabel>
                <Input
                  id={identifierId}
                  type={identifier.type ?? 'email'}
                  autoComplete={identifier.autoComplete}
                  value={typed.identifier}
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

              {/*
                The secret, and it is `PasswordField` rather than an `Input` with a
                caller's own button beside it. The Component's own argument is the
                reason and it is worth repeating once here because this is the
                surface it matters most on: a reveal control a consumer writes is a
                `<button>` with three things that can each be wrong in a way nothing
                on screen shows. Leave `type` off and it submits the form, so pressing
                it on a phone keyboard's go key posts a half-typed password before
                the reader has read a character of it. Give it no accessible name and
                it is announced as a button, and it is the only button on this screen
                a Tab key reaches. Give it a real name in one language and ship it
                into a product in another. So the button is the Component's, with
                `type="button"` already set, a name the caller wrote, and the `type`
                toggle on the input already wired.
              */}
              <PasswordField
                value={typed.secret}
                onValueChange={setSecret}
                label={secret.label}
                description={secret.description}
                error={secret.error}
                revealLabel={secret.revealLabel}
                hideLabel={secret.hideLabel}
              />
            </FieldGroup>

            {remember === undefined ? null : (
              <div data-slot="login-01-remember" className="flex items-start gap-2.5">
                <Checkbox
                  id={rememberId}
                  checked={typed.remember}
                  onCheckedChange={(next) => setRemember(next === true)}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <FieldLabel htmlFor={rememberId} className="font-normal">
                    {remember.label}
                  </FieldLabel>
                  {remember.description === undefined ? null : (
                    <FieldDescription id={rememberDescriptionId}>
                      {remember.description}
                    </FieldDescription>
                  )}
                </div>
              </div>
            )}

            {/*
              The recovery link, at the end of the row that asked for the secret
              rather than at the foot of the form, because that is where a reader who
              has realised they do not know it is looking. It is a `CtaLink` and not a
              bare anchor so it carries the focus ring, the hover state and the
              announced role of one, and so the destination is in the `href` where a
              reader can copy it. The words are the caller's sentence, and the run
              above has already refused to draw it without one.
            */}
            {forgot === undefined ? null : (
              <CtaLink
                data-slot="login-01-forgot"
                href={forgot.href}
                variant="ghost"
                size="sm"
                className="self-start"
              >
                {forgot.label}
              </CtaLink>
            )}

            <div data-slot="login-01-actions" className="flex flex-col gap-3">
              <Button
                data-slot="login-01-submit"
                type="submit"
                disabled={working}
                className="w-full"
              >
                {submitLabel}
              </Button>

              {/*
                The outcome, and it renders nothing while there is no message.
                `LiveRegion` draws no element at all for an empty child, which is the
                reason a sign-in in its resting state carries no live region rather
                than an empty one announcing every unrelated change of its ancestors.
                `busy` is the caller's own in-progress state, because a caller that
                knows more work is coming is the only one that can say so.
              */}
              <LiveRegion
                data-slot="login-01-status"
                politeness={status?.state === 'error' ? 'assertive' : 'polite'}
                busy={working}
                className={cn(
                  'text-sm',
                  status?.state === 'error' ? 'text-destructive font-medium' : 'text-muted-foreground',
                )}
              >
                {status?.message}
              </LiveRegion>
            </div>

            {/*
              The second factor and the provider row, both in the caller's own words
              and both behind a rule rather than a sentence. The two slots are drawn
              the same way on purpose: a divider this Block wrote would be a claim
              about how the two are related, and the honest divider on a credential
              screen is the product's own sentence about which of the ways in is
              which.
            */}
            {secondFactor === undefined ? null : (
              <div data-slot="login-01-second-factor" className="border-border border-t pt-5">
                {secondFactor}
              </div>
            )}

            {providers === undefined ? null : (
              <div data-slot="login-01-providers" className="border-border border-t pt-5">
                {providers}
              </div>
            )}
          </form>
        </Card>

        {signup === undefined ? null : (
          <CtaLink
            data-slot="login-01-signup"
            href={signup.href}
            variant="ghost"
            size="sm"
            className="self-start"
          >
            {signup.label}
          </CtaLink>
        )}
      </div>
    </Section>
  )
}

export default Login01
