'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, FieldError, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { LiveRegion } from '../../components/ui/live-region'
import { Meter } from '../../components/ui/meter'
import { PasswordField } from '../../components/ui/password-field'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The new secret, and the two sentences a reveal control has to be named with.
 *
 * **`revealLabel` and `hideLabel` are here and cannot be defaulted, for the reason
 * `PasswordField` argues at length.** A reveal control that says one sentence in a
 * product whose interface is another language looks localised, because the icon is
 * the same everywhere and the half a screen reader user actually hears is the word
 * this package would have invented.
 */
export type ResetPassword01Secret = {
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
   * The caller's sentence, because whether a secret is acceptable and why is the
   * caller's own policy. A product that says "That has been in three breaches" and a
   * product that says "Add a number" are making different claims about their own
   * rules, and neither is Prism's to make.
   */
  error?: ReactNode
  /**
   * How strong the secret is, in the caller's own words and on a number.
   *
   * **A function and not a `strengthLabel` string, and the reason is that the honest
   * reading of a secret's strength changes as the reader types.** Four products rate
   * one on a letter grade, one on a word, one on a count of character classes and one
   * on a list of breached passwords, and the sentence a reader needs beside a
   * four-character entry is not the sentence they need beside a twenty-character one.
   * A string prop would be a single reading of that, frozen at the first render.
   *
   * The Block draws what is returned and nothing more: the `label` is the name of the
   * grade and the `value` is read against the hundred-point scale `Meter` publishes.
   * The number is the bar and the label is the reading, which is the same split
   * `Status` argues for a dot and a sentence. The tone is left at the Meter's own
   * neutral default, because a colour here would be a judgement about how bad a weak
   * secret is in this product, and the words are where that judgement belongs.
   */
  strength?: (value: string) => { label: string; value: number }
}

/**
 * The second entry, and the caller's own sentence about whether the two agree.
 *
 * **There is no `match` and no mismatch message in this type, and that absence is a
 * decision.** Whether two entries are the same is the product's validation, the words
 * beside a mismatch are its too, and a Block that compared them would be a second
 * place a consumer has to keep the same rule in step with itself. The cost is named:
 * a caller who passes no `confirm.error` gets a form that submits two different
 * strings and finds out from its own transport, which is why `confirm` is required
 * rather than optional on this Block.
 */
export type ResetPassword01Confirm = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** The confirmation as the caller holds it. Refused without `onValueChange`. */
  value?: string
  /** Called with the confirmation as the reader changes it. */
  onValueChange?: (value: string) => void
  /**
   * What is wrong with the confirmation, drawn in the destructive token and announced
   * as it appears. It also marks the control invalid.
   *
   * This is where a mismatch belongs, and the sentence is the caller's because a
   * product that says "Those do not match" and a product that says "You typed it
   * differently the first time" are making different claims about the same fact.
   */
  error?: ReactNode
}

/**
 * The four things the caller's own request can be doing, named after what they select
 * rather than after the field they fill.
 *
 * `done` is a destination rather than an outcome, which is why the Block treats it
 * differently from `error`: a changed secret means the form has nothing left to ask
 * for, while a refused request means the form is still the reader's next move.
 */
export type ResetPassword01Outcome = 'idle' | 'working' | 'done' | 'error'

/**
 * The outcome of the caller's own request, as this Block draws it.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: there is no sentence anywhere in this file, and the sentence a
 * credential surface gets wrong is the one it ships itself.
 */
export type ResetPassword01Status = {
  /** Which of the four the request is in. Read by the Block for three things only. */
  state: ResetPassword01Outcome
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The state this screen spends most of its life in, which is the state a Block that
 * forgot it would push into the consumer's error handling.
 *
 * A reset link has a short life, and the reader who followed one an hour later is the
 * common case rather than the edge case. So the expiry is an arm this Block draws:
 * the caller's message and the caller's way to ask for a new one. The alternative was
 * a Block that renders a form regardless and lets the caller's server refuse it on
 * submit, which is a screen that takes a reader's typing and then throws it away, and
 * which leaves the product's own error boundary to render a sentence about a
 * condition the design system could have named.
 */
export type ResetPassword01Expired = {
  /** What the reader is told about the link they followed. */
  message: ReactNode
  /** The words on the control that asks for a new link. */
  requestLabel: string
  /** Called when the reader asks for a new link. */
  onRequest: () => void
}

/**
 * The props a ResetPassword01 takes. Every string in this Block is one of them.
 *
 * Two controls and nothing else, and the count is the design rather than a
 * limitation: a reset screen that could ask for a second identifier has decided
 * something about the caller's product, and the one thing it must never do is decide
 * whether the first identifier was the right one.
 */
export type ResetPassword01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a credential surface with no heading is a form in a page, and a
   * reader who arrived by following a link in their own inbox deserves to be told
   * which product is asking before they choose a new secret.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * Called with the two entries, and the only thing this Block does with them.
   *
   * **Required, and the requirement is the whole of the Block's neutrality.** The
   * Block stores nothing, verifies nothing, sends nothing and starts no session, so
   * every question a reset raises is the caller's: whether the link was genuine,
   * whether the new secret is acceptable, and whether the two entries agree.
   */
  onSubmit: (value: { secret: string; confirm: string }) => void
  /** The new secret, its reveal control's two names and the caller's strength note. */
  secret: ResetPassword01Secret
  /** The second entry and the caller's own sentence about a mismatch. */
  confirm: ResetPassword01Confirm
  /** The words on the one control that submits. */
  submitLabel: string
  /**
   * Whether the caller's request is in flight.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `submitting` is the control and `status.state` is the outcome.
   */
  submitting?: boolean
  /** The outcome of the caller's request, drawn in a live region and announced. */
  status?: ResetPassword01Status
  /**
   * The state this link has expired in.
   *
   * Passing it takes both fields and the submit control away and draws the caller's
   * message with the caller's way to ask for a new link. A Block without this arm
   * would render a form to a reader who cannot use it, take what they typed, and hand
   * the refusal to the consumer's own error handling, which is a runtime error in a
   * code path the design system could have named.
   */
  expired?: ResetPassword01Expired
  /** Heading level for the section heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/** Whether a caller passed a word that is not there. Read about the value, not the type. */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/**
 * The five refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on the screen where a reader
 * is about to choose the secret that opens their account.
 */
function assertReset(input: {
  secret: ResetPassword01Secret
  confirm: ResetPassword01Confirm
  status: ResetPassword01Status | undefined
  expired: ResetPassword01Expired | undefined
}): void {
  const { secret, confirm, status, expired } = input

  if (blank(secret.label) || blank(secret.revealLabel) || blank(secret.hideLabel)) {
    throw new Error(
      'ResetPassword01: the secret field is missing one of its three words. A reveal control with no name is ' +
        'announced as a button, and it is the only control on this screen a keyboard reader reaches with Tab. ' +
        'Pass label, revealLabel and hideLabel in your own language.',
    )
  }

  if (blank(confirm.label)) {
    throw new Error(
      'ResetPassword01: the confirmation field declares no label, so its control would be announced as a text ' +
        'field, which is the same name the secret field above it is announced by once the reveal control is out ' +
        'of the way. Pass the words your product uses for a repeated secret.',
    )
  }

  if (secret.value !== undefined && secret.onValueChange === undefined) {
    throw new Error(
      'ResetPassword01: secret.value was passed with no onValueChange, so the Block would hold a secret the ' +
        'caller has lost track of and cannot clear. Pass the pair, or neither.',
    )
  }

  if (confirm.value !== undefined && confirm.onValueChange === undefined) {
    throw new Error(
      'ResetPassword01: confirm.value was passed with no onValueChange, so the Block would hold a confirmation ' +
        'the caller cannot clear when a reader gives up on the form. Pass the pair, or neither.',
    )
  }

  if (status !== undefined && expired !== undefined && status.state !== 'error') {
    throw new Error(
      'ResetPassword01: an expired link was passed together with a status that is not a refusal, so the screen ' +
        'would show the caller\'s confirmation for a link that is dead beside an arm saying it is dead. Draw one ' +
        'or the other.',
    )
  }
}

/**
 * Two entries, one control, and the arm that says the link is dead.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a reset-password card: a new password with an eye beside it, a
 * repeat of it, a button and a line about what happens next, and its purpose is to get
 * a shopper back into an account holding an order history. Prism's products observe a
 * pipeline, capture a market, watch an estate and run agents, and a machine acting on
 * behalf of a person is the whole subject, so this is the screen where somebody
 * re-authorises the agent they are responsible for after the credential that let them
 * in has gone. The composition is the storefront's and is unchanged: the secret with
 * its reveal, the repeat, one control, one outcome line. What is different is the
 * assumption the screen is built on, which is set out next.
 *
 * **What it assumes about the reader in front of it.** It assumes the link they
 * followed is genuine, because the Block has no way to make it so and the caller has
 * already decided to send it; it assumes they cannot get in without this form; it
 * assumes they are in a hurry and may be on a machine they do not fully control. It
 * refuses to assume they typed the two entries the same, that their new secret is
 * acceptable, or that they read the frame before pressing anything.
 *
 * **`expired` is a first-class arm and it is the state this screen spends most of its
 * life in.** A reset link has a short life and the reader who arrives after it is the
 * common case, not the edge case. So the Block takes the state, draws the caller's
 * message and the caller's way to ask for a new link, and takes the form away. The
 * rejected alternative is the one every form-shaped Block would reach for by default:
 * render the two fields regardless, let the caller's server refuse on submit, and let
 * the consumer's own error boundary render the sentence. That is a runtime error in
 * the consumer's code for a condition this design system can name, it happens to the
 * reader the product should be kindest to, and it throws away what they typed. The
 * cost of the arm is that the caller has to hold the state and pass it, and the payoff
 * is that the most frequent thing this screen has to say is a thing the screen can
 * say.
 *
 * **The two entries do not compare themselves, and the reason is that the comparison
 * is the product's rule and the sentence is the product's words.** Whether two
 * strings are equal is a one-line check that any Block could do, and doing it here
 * would install a rule in four products at once and put a fixed sentence about a
 * mismatch beside the field. A product that says "Those do not match" and a product
 * that says "You typed it differently the first time" are making different claims
 * about the same fact, and a product that has told a reader its secret cannot be
 * recovered wants different words again. So `confirm.error` is the caller's and the
 * Block draws none of its own. The cost is named rather than hidden: a caller who
 * passes no `error` gets a form that submits two different strings and finds out
 * from its own transport, which is why `confirm` is required rather than optional
 * here.
 *
 * **The strength note is a caller's function and is drawn only once there is a
 * secret in the field.** The function is the caller's because the honest reading of
 * strength changes as the reader types, and a Block that drew a bar at the empty
 * string would be putting a claim about a secret nobody has typed yet directly under
 * a field the reader has not touched. A `Meter` and not a `Progress`, because a
 * strength is a standing measurement bounded by a ceiling the caller knows rather than
 * a task moving toward an end.
 *
 * **`autoComplete` is set to `new-password` here and that is the Block's one platform
 * decision.** `PasswordField` defaults to `current-password`, which is correct for a
 * sign-in and wrong for every other place a password appears, and the cost of getting
 * it wrong is an account the browser then refuses to offer to sign into. A sign-in
 * screen is the one exception and it composes this Block's field for a different
 * purpose; this Block exists only to set a new secret, so the hint is not a caller
 * fact here.
 *
 * **The confirmation field is not masked, and the reason is that the reader is
 * transcribing a secret they can already reveal one field above.** Hiding the second
 * entry buys nothing once the first is on the same screen with a reveal, and it costs
 * the reader the one check that catches a transposition without a space.
 *
 * It is a client Component, and the directive is unconditional. `onSubmit` is a
 * function, a function is a piece of state, and state is a client module: a server
 * Component cannot hand an event handler to a `<form>`, so a caller rendering this
 * from a server Component gets a form that submits and calls nothing. `PasswordField`
 * needs the directive on its own account, so the cost of that boundary is already
 * paid either way and the Block adds nothing to it.
 */
export function ResetPassword01({
  eyebrow,
  title,
  description,
  onSubmit,
  secret,
  confirm,
  submitLabel,
  submitting = false,
  status,
  expired,
  headingLevel = 'h2',
  className,
}: ResetPassword01Props) {
  assertReset({ secret, confirm, status, expired })

  const generated = useId()
  const confirmId = `${generated}-confirm`
  const confirmErrorId = `${generated}-confirm-error`

  /*
   * Both entries live here rather than only in the caller. `PasswordField` is a
   * controlled control because a reveal toggle has to show and hide the same value, so
   * the secret has to exist before the reader types anything; and the confirmation is
   * held for the same reason as the identifier in `ForgotPassword01`, which is that a
   * value the caller cannot reach is a value the caller cannot clear. The Block
   * reports every change to the caller when one was asked for, and adopts a `value`
   * prop the moment it changes, which is the arrangement React documents for a prop
   * that can change under a stateful child.
   */
  const [entries, setEntries] = useState({ secret: secret.value ?? '', confirm: confirm.value ?? '' })
  const [seen, setSeen] = useState({ secret: secret.value, confirm: confirm.value })
  if (seen.secret !== secret.value || seen.confirm !== confirm.value) {
    setSeen({ secret: secret.value, confirm: confirm.value })
    setEntries({ secret: secret.value ?? '', confirm: confirm.value ?? '' })
  }

  const setSecret = (value: string) => {
    setEntries((was) => ({ ...was, secret: value }))
    secret.onValueChange?.(value)
  }

  const setConfirm = (value: string) => {
    setEntries((was) => ({ ...was, confirm: value }))
    confirm.onValueChange?.(value)
  }

  const working = submitting || status?.state === 'working'
  const reading = secret.strength === undefined || entries.secret === '' ? undefined : secret.strength(entries.secret)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ secret: entries.secret, confirm: entries.confirm })
  }

  const outcome = (
    <LiveRegion
      data-slot="reset-password-01-status"
      politeness={status?.state === 'error' ? 'assertive' : 'polite'}
      busy={working}
      className={cn(
        'text-sm',
        status?.state === 'error' ? 'text-destructive font-medium' : 'text-muted-foreground',
      )}
    >
      {status?.message}
    </LiveRegion>
  )

  return (
    <Section data-slot="reset-password-01" className={cn(className)}>
      <div data-slot="reset-password-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/*
          The card, and it is a `Card` for the reason `Login01` gives: this is the one
          place in the package where the reader is looking at a form rather than at a
          product, and a form floating on the page ground has no edge to say so. It is
          drawn in every arm so the page does not change size at the moment the reader
          is reading the one line that matters.
        */}
        <Card data-slot="reset-password-01-card" className="max-w-measure-narrow gap-0 px-6">
          {expired === undefined ? (
            status?.state === 'done' ? (
              /*
               * The destination arm. The secret has changed and the form has nothing
               * left to ask for, so it goes rather than sitting there refusing. The
               * message is the caller's, and the region below it is kept so a caller
               * that wants to add a next step has somewhere to announce it.
               */
              <div data-slot="reset-password-01-done" className="flex w-full flex-col gap-4">
                <p data-slot="reset-password-01-done-message" className="text-sm text-pretty">
                  {status?.message}
                </p>
              </div>
            ) : (
              <form
                data-slot="reset-password-01-form"
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-5"
              >
                {/*
                  The wrapper exists so the strength note can sit under the field
                  without being inside it. `PasswordField` owns its own `Field`
                  completely, label, control, error and description, and a note inside
                  that would have to be smuggled through `description`, where a screen
                  reader would hear it as part of the field's name rather than as a
                  reading about what was typed.
                */}
                <div data-slot="reset-password-01-secret" className="flex flex-col gap-2.5">
                  <PasswordField
                    value={entries.secret}
                    onValueChange={setSecret}
                    label={secret.label}
                    description={secret.description}
                    error={secret.error}
                    revealLabel={secret.revealLabel}
                    hideLabel={secret.hideLabel}
                    autoComplete="new-password"
                  />

                  {/*
                    The strength note, and the caller's function is what decides both
                    halves of it. The Meter takes the label as its accessible name, so
                    the words a reader hears and the words a reader reads are the same
                    sentence by construction. The number is read against the hundred
                    * scale the Meter publishes; a scale this Block invented would be a
                    * second set of numbers for the caller to remember.
                    */}
                  {reading === undefined ? null : (
                    <Meter
                      data-slot="reset-password-01-strength"
                      label={reading.label}
                      value={reading.value}
                    />
                  )}
                </div>

                {/*
                  The repeat, plain and unmasked. It is the reader transcribing a
                  secret they can reveal one field above, so hiding it buys nothing and
                  costs the one check that catches a transposition without a space.
                  The `error` is the caller's sentence about whether the two agree, and
                  the Block makes no comparison of its own; see the JSDoc for why.
                */}
                <Field data-slot="reset-password-01-confirm" data-field="confirm">
                  <FieldLabel htmlFor={confirmId}>{confirm.label}</FieldLabel>
                  <Input
                    id={confirmId}
                    type="text"
                    value={entries.confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    autoComplete="new-password"
                    required
                    aria-invalid={confirm.error === undefined ? undefined : true}
                    aria-describedby={confirm.error === undefined ? undefined : confirmErrorId}
                  />
                  {confirm.error === undefined ? null : (
                    <FieldError id={confirmErrorId}>{confirm.error}</FieldError>
                  )}
                </Field>

                <div data-slot="reset-password-01-actions" className="flex flex-col gap-3">
                  <Button
                    data-slot="reset-password-01-submit"
                    type="submit"
                    disabled={working}
                    className="w-full"
                  >
                    {submitLabel}
                  </Button>

                  {outcome}
                </div>
              </form>
            )
          ) : (
            /*
             * The expired arm, and the reason this Block is not `Login01` with a
             * different title. The two fields are gone because a reader cannot use
             * them, and the one control on screen is the caller's way out. The card
             * stays so the page does not jump at the moment the reader is reading.
             */
            <div data-slot="reset-password-01-expired" className="flex w-full flex-col gap-4">
              <p data-slot="reset-password-01-expired-message" className="text-sm text-pretty">
                {expired.message}
              </p>

              <Button
                data-slot="reset-password-01-request"
                type="button"
                variant="outline"
                onClick={() => expired.onRequest()}
                disabled={working}
                className="self-start"
              >
                {expired.requestLabel}
              </Button>

              {outcome}
            </div>
          )}
        </Card>
      </div>
    </Section>
  )
}

export default ResetPassword01
