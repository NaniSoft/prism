'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Field, FieldDescription, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { LiveRegion } from '../../components/ui/live-region'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The thing the reader types to say which account they mean, declared by the caller.
 *
 * The same shape `Login01` takes and the same argument: a product that identifies a
 * person by an address and a product that identifies an operator by a handle or a
 * staff number both need the same labelled text control, and the words above it are
 * the product's own claim about what identifies a person there. `autoComplete` is
 * deliberately not defaulted here either, because the hint a password manager wants
 * is a fact about the identifier rather than about this screen, and the type a
 * platform can do something different with is `email` on most of these products and
 * `text` on the rest.
 */
export type ForgotPassword01Identifier = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /**
   * Which of the two the platform's own behaviour differs on.
   *
   * `email` turns up a different keypad on a phone and lets a browser offer the
   * address it already knows; `text` is right for a handle and for a workspace name.
   */
  type?: 'email' | 'text'
  /** The platform's autofill hint, when the identifier is not an address. */
  autoComplete?: string
  /**
   * A line under the control, announced with it rather than printed under the row.
   *
   * A node, because the honest line in this position is often a sentence naming the
   * accounts this product can recover, and a caller who has to flatten theirs to a
   * string loses it.
   */
  description?: ReactNode
  /** The identifier as the caller holds it. Refused without `onValueChange`. */
  value?: string
  /** Called with the identifier as the reader changes it. */
  onValueChange?: (value: string) => void
}

/**
 * The three things the caller's own recovery request can be doing, named after what
 * they select rather than after the field they fill.
 *
 * `idle` is the form at rest and `error` is the one refusal this Block is willing to
 * hear about, which is a refusal of the request itself: a transport that could not
 * be reached, a rate limit the caller owns, a captcha that would not pass. It is not
 * a statement about the account, and that is the decision the whole Block is shaped
 * by. `sent` is the machine value for the announcement that the request was taken,
 * and it deliberately carries no claim that a message is on its way to an address
 * that exists.
 */
export type ForgotPassword01Outcome = 'idle' | 'sent' | 'error'

/**
 * The outcome of the caller's own request, as this Block draws it.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: there is no sentence anywhere in this file, and the sentence this
 * screen most needs is the one a design system has no business writing.
 */
export type ForgotPassword01Status = {
  /** Which of the three the request is in. Read by the Block for two things only. */
  state: ForgotPassword01Outcome
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/** What the confirmation arm carries, and the union is what makes the pair mean one thing. */
export type ForgotPassword01Sent = {
  /**
   * The confirmation itself.
   *
   * **Required, and the whole of the decision this Block is named for.** It is the
   * caller's sentence and it is not this Block's job to check that the caller wrote
   * the same one in both cases, because that check is the Block asserting it knows
   * whether an account was found. What the Block does instead is hold no prop that
   * could carry the fact, so the leak cannot be expressed in the interface at all.
   * See the Block's JSDoc for the trade in both directions.
   */
  message: ReactNode
} & (
  | {
      /** The words on the control that sends the request again. */
      resendLabel: string
      /** Called when the reader asks for the request to be sent again. */
      onResend: () => void
    }
  | {
      /** A resend control with no words is a button nobody can find. */
      resendLabel?: never
      /** A handler with no control is a call the caller cannot make. */
      onResend?: never
    }
)

/**
 * One way off this screen, and where it goes.
 *
 * A sentence and not a noun phrase, for the argument `Login01Link` gives: a link
 * whose visible words do not say what activating it does is a link a voice control
 * user cannot speak, because the words they can see are the words they can say.
 */
export type ForgotPassword01Link = {
  /** The words on the link, and its accessible name. */
  label: string
  /** The destination, in the `href` where the status bar and the context menu reach it. */
  href: string
}

/**
 * The props a ForgotPassword01 takes. Every string in this Block is one of them.
 *
 * There is no field list here and that is the design rather than an omission. A
 * recovery form that could ask for a second identifier has already decided something
 * about the caller's product, and the one thing it must not do is decide whether the
 * first one was right.
 */
export type ForgotPassword01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a credential surface with no heading is a form in a page, and
   * a reader who cannot get in deserves to be told which product refused them before
   * they type anything personal into it.
   */
  title: ReactNode
  /**
   * What is about to happen to the identifier.
   *
   * **Required, and the difference from every other Block's description is the fact
   * rather than an inconsistency.** A product page can omit a description and the
   * omission is a design choice. This screen cannot: the reader has just discovered
   * they cannot get in, they are about to type the one datum that ties them to an
   * account, and the confirmation that follows is deliberately the same whether or
   * not the account exists. That leaves the frame as the only place left to say what
   * is about to happen, so a description this Block can ship without would be a
   * screen where a reader who mistyped their address is told nothing at all, for
   * ever, and concludes the message went somewhere. What the description says is the
   * caller's, because what happens to an address in their product is their fact.
   */
  description: ReactNode
  /**
   * Called with the identifier, and the only thing this Block does with it.
   *
   * **Required, and the requirement is the whole of the Block's neutrality.** There
   * is no transport here, no route, no mail queue and no session store, because each
   * of those is a decision about the caller's product and its data, and a frame that
   * takes one is a frame that has to be replaced rather than configured.
   */
  onSubmit: (value: { identifier: string }) => void
  /** The identifier field, declared by the caller. See `ForgotPassword01Identifier`. */
  identifier: ForgotPassword01Identifier
  /** The words on the one control that submits. */
  submitLabel: string
  /**
   * Whether the caller's request is in flight.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `submitting` is the control and `status.state` is the outcome. It covers a resend
   * as well as the first request, because from where the reader is sitting the two
   * are the same request and the one control on screen should be the one that goes
   * quiet.
   */
  submitting?: boolean
  /**
   * The outcome of the caller's request, drawn in a live region and announced.
   *
   * Drawn in both arms, which is why it is a separate prop from `sent`: the
   * announcement is needed while the form is up and after it is replaced, and the
   * confirmation is needed in only one of them. A single object would force a caller
   * to invent a confirmation sentence for a form that is still on the screen.
   *
   * **A caller that passes `sent` normally passes no `status`, and that is the rule
   * rather than an oversight.** The arm has already said the outcome, in
   * `sent.message`, and putting the same sentence in both would draw it twice on the
   * one screen where a reader is reading it for the only time. `status` is for
   * everything after the first press: a resend that was refused, or a resend whose
   * second sentence is worth saying.
   */
  status?: ForgotPassword01Status
  /**
   * The arm that replaces the form.
   *
   * Passing it takes the identifier field and the submit control away and draws the
   * caller's confirmation in their place. **There is no field in this type that says
   * whether an account was found**, and the absence is the design; see the Block's
   * JSDoc for the argument in both directions.
   */
  sent?: ForgotPassword01Sent
  /** The link that leaves this screen without recovering anything. */
  back?: ForgotPassword01Link
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
 * The three refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on the screen where a
 * reader is about to type the one datum that ties them to an account.
 */
function assertForgot(input: {
  identifier: ForgotPassword01Identifier
  sent: ForgotPassword01Sent | undefined
  back: ForgotPassword01Link | undefined
}): void {
  const { identifier, sent, back } = input

  if (blank(identifier.label)) {
    throw new Error(
      'ForgotPassword01: the identifier field declares no label, so its control would be announced as a text ' +
        'field, which is the same name every other field in the reader recovery flow is announced by. Pass the ' +
        'words your product uses for a person or an operator.',
    )
  }

  if (identifier.value !== undefined && identifier.onValueChange === undefined) {
    throw new Error(
      'ForgotPassword01: identifier.value was passed with no onValueChange, so the field would show the value ' +
        'once and then stop telling the caller what is in it, which is a value the caller cannot clear when a ' +
        'reader mistypes it. Pass the pair, or neither.',
    )
  }

  if (back !== undefined && blank(back.label)) {
    throw new Error(
      `ForgotPassword01: the link to ${JSON.stringify(back.href)} declares no label, so the anchor accessible ` +
        'name would be its destination, which a screen reader reads as a run of characters and a mouse reader ' +
        'cannot copy. Pass the sentence that says what following it does.',
    )
  }

  if (sent !== undefined && (sent.resendLabel === undefined) !== (sent.onResend === undefined)) {
    throw new Error(
      'ForgotPassword01: the confirmation arm was passed one half of its resend control, so the screen would ' +
        'either offer a button that does nothing or call a handler no control can reach. Pass resendLabel and ' +
        'onResend together, or neither.',
    )
  }

  if (sent !== undefined && blank(sent.resendLabel)) {
    throw new Error(
      'ForgotPassword01: the confirmation arm was passed a resend control with no words, so the one control on ' +
        'the screen after a reader presses the button would be a button a screen reader announces as "button" ' +
        'and a voice control user cannot say out loud.',
    )
  }
}

/**
 * One identifier, one control, and a confirmation that says the same thing whether or
 * not the account exists.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a forgot-password card: an address field, one button, and a
 * line that says to check your inbox, and its purpose is to get a shopper past a
 * locked door so their order history is waiting on the other side. Prism's products
 * observe a pipeline, capture a market, watch an estate and run agents, and a machine
 * acting on behalf of a person is the whole subject, so this is the screen where
 * somebody who is responsible for an instrument asks for a way back in to it. The
 * composition is the storefront's and is deliberately unchanged: one labelled field,
 * one control, one outcome line, one way off the screen. What is different is the
 * sentence after the press, and the rest of this note is about that sentence.
 *
 * **What it assumes about the reader in front of it, because a recovery flow that
 * assumes a careful reader is a flow that fails the one time it is needed.** It
 * assumes the reader cannot get in, that they are often in a hurry, and that they
 * may be on a machine they do not fully control. It assumes nothing about the state
 * of their account, nothing about whether they know their own address by heart, and
 * nothing about whether they will read the frame. It refuses to assume they typed
 * correctly, because the whole design exists to make that assumption unnecessary.
 *
 * **The decision that makes this a separate Item from `contact-01` is that the
 * confirmation is the same whether or not the account exists, and it is expressed in
 * the shape rather than in the prose.** There is no `found` flag, no `unknown`, no
 * `registered` and no second message. `sent.message` is one sentence, and the type
 * has nowhere to put a second one. The alternative was a `status` that grew an arm
 * for the negative case, which is a two-line change to the props and a permanent
 * capability to leak in every product that installs this Block, and a leak that is
 * cheap to add and expensive to remove once a product's support process depends on
 * it.
 *
 * **The trade is real and it is argued in both directions, because it is not a
 * clean win.** A message that differs leaks which addresses are registered, and that
 * is an enumeration oracle: an attacker with any address list learns which of them
 * hold an account here, and a reader with a mistyped address learns the same thing
 * about themselves. A message that is identical teaches the reader that a mistyped
 * address succeeded, and it is the version that is more often wrong in practice,
 * because a recovery form is the one form a reader is most likely to fill from memory
 * and most likely to get wrong. Both sentences are true. The resolution that does
 * not pick a side is a confirmation that names the next step without confirming the
 * account: it says what has been sent and where to look, and it does not say what was
 * found. That is a sentence the caller's product can write in a way that is true of
 * both cases, and it is the reason `sent.message` is a node and the whole of what the
 * arm carries. **The words are the caller's.** A consumer that wants the other trade
 * can write it in `sent.message` and the Block will not stop them, because the Block
 * has no opinion about a disclosure decision; what it does is refuse to make the
 * choice on their behalf by refusing to have a place to put it.
 *
 * **`status` and `sent` are two props because they answer two questions.** `status`
 * is the announcement, and it is needed while the form is up and after it is
 * replaced: a caller whose transport failed on the first press and then succeeded on
 * the second needs a region in both arms. `sent` is the arm, and passing it is what
 * takes the field and the control away. Merging them would force a caller to invent a
 * confirmation sentence for a form that is still on the screen, which is the shape
 * that makes designers add a placeholder they then ship. The corollary is the rule
 * above: the arm reports the first press, and `status` reports everything after it,
 * so the two never carry the same sentence and the reader never reads it twice.
 *
 * **The card stays and the form inside it is replaced, so the reader's page does not
 * change size under them at the moment they are reading the one line that matters.**
 * A recovery screen that reflows on success looks like a fault, and the reader who
 * has just mistyped their address is the reader least able to tell a reflow from a
 * failure.
 *
 * **The Block owns one string and hands it over, and it validates nothing.** There
 * is no address format check, no rate limit, no redirect to a "did you mean" page and
 * no enumeration defence beyond the shape of the confirmation, because each of those
 * is a decision about the caller's product and its data. What the Block does about
 * the request is the one thing that is rendering rather than policy: it refuses a
 * second press while `submitting` is true, because a second press is a second message
 * queued into somebody's inbox that nobody asked for.
 *
 * **There is no `Alert` in this file, and the alternative was a callout with
 * `role="alert"` beside the live region.** That announces the same sentence twice, and
 * on a screen where a reader is waiting for an answer about whether they can get in,
 * a doubled announcement is the one place it is least forgivable. So the outcome is
 * a `LiveRegion` whose politeness follows the caller's own state, and `assertive`
 * only for the refusal.
 *
 * It is a client Component, and the directive is unconditional. `onSubmit` is a
 * function, a function is a piece of state, and state is a client module: a server
 * Component cannot hand an event handler to a `<form>`, so a caller rendering this
 * from a server Component gets a form that submits and calls nothing. The cost is
 * that the whole module is in the client graph even where a consumer never presses
 * the button, and the price was judged worth paying for one boundary rather than
 * two arrangements of the same screen.
 */
export function ForgotPassword01({
  eyebrow,
  title,
  description,
  onSubmit,
  identifier,
  submitLabel,
  submitting = false,
  status,
  sent,
  back,
  headingLevel = 'h2',
  className,
}: ForgotPassword01Props) {
  assertForgot({ identifier, sent, back })

  const generated = useId()
  const inputId = `${generated}-identifier`
  const descriptionId = `${generated}-identifier-description`

  /*
   * The value lives here rather than only in the caller, for one reason: a field a
   * caller cannot clear is a field a reader who mistyped their address has to reload
   * the page to escape from, and the reader most likely to mistype it is the one who
   * can least afford to lose the screen. The Block therefore holds the identifier
   * itself, reports every change to the caller when one was asked for, and adopts a
   * `value` prop the moment it changes, which is the arrangement React documents for
   * a prop that can change under a stateful child. Both halves are adjusted during
   * render rather than in an effect, because the trigger is a prop changing and a set
   * during render is applied before the browser paints.
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
    <Section data-slot="forgot-password-01" className={cn(className)}>
      <div data-slot="forgot-password-01-body" className="flex flex-col gap-10">
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
          product, and a form floating on the page ground has no edge to say so. The
          measure-narrow cap is the one piece of layout here, because a form at the
          full container width is a form with a 1300 pixel row of text labels, which is
          the width a form was never readable at. It is drawn in both arms on purpose,
          so the page does not change size at the moment the reader is reading the one
          line that matters.
        */}
        <Card data-slot="forgot-password-01-card" className="max-w-measure-narrow gap-0 px-6">
          {sent === undefined ? (
            <form
              data-slot="forgot-password-01-form"
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-5"
            >
              <Field data-slot="forgot-password-01-identifier" data-field="identifier">
                <FieldLabel htmlFor={inputId}>{identifier.label}</FieldLabel>
                <Input
                  id={inputId}
                  type={identifier.type ?? 'email'}
                  autoComplete={identifier.autoComplete}
                  value={typed}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                  aria-describedby={
                    identifier.description === undefined ? undefined : descriptionId
                  }
                />
                {identifier.description === undefined ? null : (
                  <FieldDescription id={descriptionId}>{identifier.description}</FieldDescription>
                )}
              </Field>

              <div data-slot="forgot-password-01-actions" className="flex flex-col gap-3">
                <Button
                  data-slot="forgot-password-01-submit"
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitLabel}
                </Button>

                {/*
                  The outcome, and it renders nothing while there is no message.
                  `LiveRegion` draws no element at all for an empty child, which is why
                  a form in its resting state carries no live region rather than an
                  empty one announcing every unrelated change of its ancestors.
                  `busy` is the caller's own in-progress state, because a caller that
                  knows more work is coming is the only one that can say so.
                */}
                <LiveRegion
                  data-slot="forgot-password-01-status"
                  politeness={status?.state === 'error' ? 'assertive' : 'polite'}
                  busy={submitting}
                  className={cn(
                    'text-sm',
                    status?.state === 'error'
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground',
                  )}
                >
                  {status?.message}
                </LiveRegion>
              </div>
            </form>
          ) : (
            /*
             * The confirmation arm. The field and the control are gone and the card is
             * still there, and the region survives below it so a resend that fails has
             * somewhere to be announced. `sent.message` is the caller's sentence and
             * there is nowhere in this file to put a second one; that absence is the
             * Block's whole contribution to the decision the caller is making.
             */
            <div data-slot="forgot-password-01-sent" className="flex w-full flex-col gap-4">
              <p data-slot="forgot-password-01-sent-message" className="text-sm text-pretty">
                {sent.message}
              </p>

              {sent.resendLabel === undefined ? null : (
                <Button
                  data-slot="forgot-password-01-resend"
                  type="button"
                  variant="outline"
                  onClick={() => sent.onResend?.()}
                  disabled={submitting}
                  className="self-start"
                >
                  {sent.resendLabel}
                </Button>
              )}

              <LiveRegion
                data-slot="forgot-password-01-status"
                politeness={status?.state === 'error' ? 'assertive' : 'polite'}
                busy={submitting}
                className={cn(
                  'text-sm',
                  status?.state === 'error'
                    ? 'text-destructive font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {status?.message}
              </LiveRegion>
            </div>
          )}
        </Card>

        {/*
          The way off the screen, below the card rather than above the heading,
          because a reader who arrived here by following a link and changed their mind
          is looking for the way back, and a reader who is here on purpose never sees
          it until they have finished. It is a `CtaLink` so it carries the focus ring,
          the hover state and the announced role of a link, and so the destination is in
          the `href` where a reader can copy it. The words are the caller's sentence and
          the run above has already refused to draw it without one.
        */}
        {back === undefined ? null : (
          <CtaLink
            data-slot="forgot-password-01-back"
            href={back.href}
            variant="ghost"
            size="sm"
            className="self-start"
          >
            {back.label}
          </CtaLink>
        )}
      </div>
    </Section>
  )
}

export default ForgotPassword01
