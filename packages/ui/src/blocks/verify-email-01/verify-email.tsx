'use client'

import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { LiveRegion } from '../../components/ui/live-region'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Spinner } from '../../components/ui/spinner'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The five things that can be true of a verification, and the whole design of the
 * Block is that there are five of them and each one is a different screen.
 *
 * The names say what they select rather than what colour they draw. `checking` is
 * progress, `verified` is a destination, `pending` is a wait, `failed` is a retry and
 * `expired` is a request for a new link. Four of the five are states a reader has to
 * act in, and only one of them is a sentence.
 */
export type VerifyEmail01Outcome =
  | 'checking'
  | 'verified'
  | 'pending'
  | 'failed'
  | 'expired'

/**
 * Which of the five the verification is in, what the reader is told, and the short
 * name of the state.
 *
 * **Required on the Block rather than optional on the arm, because on this screen the
 * state is the screen.** There is no resting state a reader can see and no state this
 * Block can reach on its own: the link is the proof, and the caller's server is what
 * knows whether following it proved anything. A caller that renders this without
 * saying where the verification has got to has drawn the frame and omitted the page.
 *
 * `stateLabel` is the short name beside the dot and `message` is the sentence, and
 * the split is the same one `Status` argues for. With nothing passed for it the
 * machine value is drawn instead, which is honest and rarely what was wanted: a
 * product whose readers meet the word `pending` is a product that has not named its
 * own states yet.
 */
export type VerifyEmail01Status = {
  /** Which of the five the verification is in. Read by the Block for four things. */
  state: VerifyEmail01Outcome
  /** The sentence for that state, in the product's own voice. */
  message: ReactNode
  /** The short name of the state, beside the dot. Falls back to `state`. */
  stateLabel?: string
}

/**
 * What is being verified, and the caller's own way to change it.
 *
 * The union is what makes the change control mean one thing: a control with words and
 * no handler draws a button that does nothing, and a handler with no words draws a
 * button a screen reader announces as "button" and a voice control user cannot say.
 */
export type VerifyEmail01Target = {
  /**
   * The identifier whose address is in question, drawn on the screen.
   *
   * Required, because a verification screen that does not say what is being verified
   * is a screen where a reader with two addresses has no idea which one arrived. This
   * is also the reason the screen has no code field: see the Block's JSDoc.
   */
  identifier: string
  /**
   * What the caller's product calls the identifier.
   *
   * The words beside it rather than its accessible name, because the identifier is
   * already on the page and is what a reader needs to compare against their own inbox
   * before they press anything.
   */
  identifierLabel?: string
} & (
  | {
      /** The words on the control that opens the caller's own change surface. */
      changeLabel: string
      /** Called with the identifier the reader chose. */
      onChange: (identifier: string) => void
    }
  | {
      /** A change control with no words is a button nobody can find. */
      changeLabel?: never
      /** A handler with no control is a call the caller cannot make. */
      onChange?: never
    }
)

/**
 * The route out for a reader this screen does not help, and where it goes.
 *
 * `message` and `label` are separate because they are separate jobs: the message is
 * the sentence about why the reader is stuck and the label is what following the link
 * does. A link labelled with the sentence is a link whose visible words do not say
 * what activating it does, which is a link a voice control user cannot speak.
 */
export type VerifyEmail01Help = {
  /** The sentence about why this screen is not helping, and what else exists. */
  message: ReactNode
  /** The destination, in the `href` where the status bar and the context menu reach it. */
  href: string
  /** The words on the link, and its accessible name. */
  label: string
}

/**
 * The props a VerifyEmail01 takes. Every string in this Block is one of them.
 *
 * There is no field, no form and no value this Block holds, and that is the shape of
 * the pattern rather than a limitation of it. The link is the proof; everything this
 * screen does is report what happened and offer the caller's own next moves.
 */
export type VerifyEmail01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a screen that reports a security decision with no heading is a
   * sentence in a page, and a reader who has just followed a link from their own inbox
   * needs to be told which product is speaking before they trust it.
   */
  title: ReactNode
  /**
   * What the reader is about to find out.
   *
   * **Required, and the difference from every other Block's description is the fact
   * rather than an inconsistency.** The reader has just been told something was sent
   * and has arrived here to find out whether it arrived. This is the one screen where
   * that question has a definite answer and the reader cannot see the answer until the
   * screen says it, so a frame that can ship without saying what it is about to say
   * leaves a reader guessing from a tone and a sentence. What the answer says is the
   * caller's, because what it means to have verified an address in their product is
   * their fact.
   */
  description: ReactNode
  /** What is being verified, and the caller's way to verify something else. */
  target: VerifyEmail01Target
  /**
   * Called when the reader asks for the message to be sent again.
   *
   * Required, and the requirement is the design. A verification a reader cannot
   * re-trigger is a verification that ends in a support ticket, so the control has to
   * be on the screen and the words have to be the product's own.
   */
  onResend: () => void
  /** The words on the resend control. */
  resendLabel: string
  /**
   * The words the same control carries once a resend has been asked for.
   *
   * Required rather than optional, because which of the two the control shows is
   * decided by the state and not by the caller: a state that can move into a resend
   * cannot be known at the moment the props are written, and a control that keeps
   * saying it will send the message while it is sending it has stopped agreeing with
   * itself. See the Block's JSDoc for the exact rule.
   */
  resentLabel: string
  /**
   * Whether a resend is in flight, which is also how the caller says one has happened.
   *
   * The two questions are the same question from where the reader is sitting: the one
   * control on screen should either offer the resend or report that it is under way,
   * and never do both at once.
   */
  resending?: boolean
  /**
   * The words for the wait, drawn under the resend control once one has been asked
   * for.
   *
   * A prop because the length of the wait is the caller's own rate limit. A Block that
   * guessed it would be shipping one cooldown policy to every product that installs
   * it, in a place no consumer can read it.
   */
  cooldownLabel?: string
  /** Where the verification has got to, in the caller's own words. */
  status: VerifyEmail01Status
  /**
   * The caller's own next moves, drawn under the resend control in every state.
   *
   * A slot rather than a set of named controls, because what a reader does next on this
   * screen is a fact about the caller's product: open another inbox, sign in, contact
   * an administrator, ask a colleague to resend.
   */
  actions?: ReactNode
  /** The route out for a reader this screen does not help. */
  help?: VerifyEmail01Help
  /** Heading level for the section heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The tone each state takes, taken from `StatusTone` rather than invented.
 *
 * **`neutral` is the tone that asserts least, and `pending` is the state that gets
 * it.** A reader who has just followed a link is in the middle of an action they took
 * and the honest reading of the next two seconds is that nothing has gone wrong. A
 * destructive dot on a wait is a claim about the reader's account made by a colour,
 * before any evidence exists, and the reader who believes it is the one who goes and
 * looks for the problem somewhere else.
 *
 * The other four are chosen because each is a different kind of fact. `checking` is
 * work in progress, so it borrows the informational tone. `verified` is the only
 * success this screen has, so it takes the success role. `expired` is not a failure:
 * the link died, the reader's address may be perfectly good, and the thing they have
 * to do about it is ask for a new one, so it takes the warning role rather than the
 * destructive one. `failed` is the only destructive state, because it is the only one
 * where something the reader just did did not work.
 */
const STATE_TONE: Record<VerifyEmail01Outcome, StatusTone> = {
  checking: 'info',
  verified: 'success',
  pending: 'neutral',
  failed: 'destructive',
  expired: 'warning',
}

/**
 * The three states a reader can be asked for another message from, and the two they
 * cannot.
 *
 * A progress reading and a destination have nothing to resend, and a control with
 * nothing to do is a control a reader presses to find out what happens. So the
 * resend is drawn for a wait, a failure and an expiry, which are the three states
 * where a second message is the reader's next move.
 */
const RESENDABLE: readonly VerifyEmail01Outcome[] = ['pending', 'failed', 'expired']

/** Whether a caller passed a word that is not there. Read about the value, not the type. */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/**
 * The six refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on the screen where a reader
 * has just followed a link from their own inbox and is waiting to find out whether it
 * worked.
 */
function assertVerify(input: {
  target: VerifyEmail01Target
  status: VerifyEmail01Status
  resendLabel: string
  resentLabel: string
  help: VerifyEmail01Help | undefined
}): void {
  const { target, status, resendLabel, resentLabel, help } = input

  if (blank(target.identifier)) {
    throw new Error(
      'VerifyEmail01: the target declares no identifier, so the screen would report the state of a verification ' +
        'without saying what is being verified, and a reader with two addresses has no way to know which one ' +
        'arrived. Pass the identifier the caller\'s own product prints.',
    )
  }

  if (
    (target.changeLabel === undefined) !== (target.onChange === undefined) ||
    (target.onChange !== undefined && blank(target.changeLabel))
  ) {
    throw new Error(
      'VerifyEmail01: the target was passed one half of its change control, so the screen would either offer ' +
        'a button that does nothing or call a handler no control can reach, and a button with no words is ' +
        'announced as "button" and cannot be spoken by a voice control. Pass changeLabel and onChange ' +
        'together, or neither.',
    )
  }

  if (blank(resendLabel) || blank(resentLabel)) {
    throw new Error(
      'VerifyEmail01: the resend control is missing one of its two labels. A control with no name is announced ' +
        'as a button, and this is the one control on the screen a reader reaches who cannot get into their ' +
        'account. Pass both labels in your own language.',
    )
  }

  if (status.stateLabel !== undefined && blank(status.stateLabel)) {
    throw new Error(
      'VerifyEmail01: stateLabel was passed with no words, so the dot beside it would be a colour with no name ' +
        'beside it, which is exactly the thing a Status refuses to render. Pass the name of the state or ' +
        'nothing.',
    )
  }

  if (help !== undefined && blank(help.label)) {
    throw new Error(
      `VerifyEmail01: the help link to ${JSON.stringify(help.href)} declares no label, so the anchor accessible ` +
        'name would be its destination, which a screen reader reads as a run of characters and a mouse reader ' +
        'cannot copy. Pass the sentence that says what following it does.',
    )
  }
}

/**
 * What is being verified, where it has got to, and the caller's own way to ask again.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a confirm-your-email screen: the address it was sent to, a
 * line that says to check your inbox, and a button that sends it again, and its
 * purpose is to let a shopper reach an order history and a saved card. Prism's
 * products observe a pipeline, capture a market, watch an estate and run agents, and a
 * machine acting on behalf of a person is the whole subject, so this is the screen
 * where a person proves they read what a machine sent them, because the address on
 * file is the address an operator's actions will be attributed to. The composition is
 * the storefront's and is unchanged: the address, the outcome, a resend. What is
 * different is the standard, and that is the next paragraph.
 *
 * **What it assumes about the reader in front of it, because this is the screen where
 * the cost of an assumption is highest.** It assumes they followed a link, that the
 * link came from the product they expect, and that they are waiting. It refuses to
 * assume they can tell from a sentence what has happened to them, and it refuses to
 * assume they will read a tone correctly, or that they will try again patiently
 * rather than immediately, or that they know the difference between the five states
 * this screen can be in.
 *
 * **The five states are five screens and not five messages, and that is the design.**
 * `checking` is progress: something is happening and the reader's job is to wait.
 * `verified` is a destination: the work is finished and the reader's job is to leave.
 * `pending` is a wait: nothing has gone wrong and the reader's job is to keep an eye
 * on an inbox. `failed` is a retry: something the reader just did did not work.
 * `expired` is a request for a new link: the one that arrived is dead and another is
 * needed. A screen that drew any of these as a sentence in the middle of a form would
 * be asking a reader to work out what has happened from a sentence, and a reader who
 * cannot tell whether their address is verified will try again, and a second attempt
 * on a verification is a second attempt on a machine's authorisation and eventually a
 * lockout. So each state changes the arrangement: which indicator is drawn, whether
 * the resend is offered, and how insistently the outcome is announced.
 *
 * **There is no code field on this screen, and the reason is one sentence: the link is
 * the proof, and a field invites a reader to type a code they do not have.** A reader
 * who arrives without the link has one action available to them and it is asking for
 * another one, and a field in front of them invites them to type the six characters
 * they can half remember from a text they did not read. Prisms that render a code
 * field on a link-based verification are answering a product that sends codes.
 *
 * **`stateLabel` falls back to the machine value rather than to nothing, and the cost
 * of that is named.** A dot with no name beside it is a colour a reader cannot read,
 * and `Status` refuses to render one, so there has to be something. The machine value
 * is the honest something: a product whose readers meet the word `pending` is a
 * product that has not named its own states, and seeing its own key on the screen is
 * a faster way to find that out than shipping it.
 *
 * **`resentLabel` is required and the rule that uses it is about the state rather than
 * about the caller.** The resend control is drawn for a wait, a failure and an expiry,
 * and withheld for progress and for the destination, because a control with nothing to
 * do is a control a reader presses to find out what happens. While `resending` is
 * true the control is disabled and carries `resentLabel`, because a control that keeps
 * offering to do the thing it is currently doing has stopped agreeing with itself. The
 * cooldown is the caller's own line beside it, because the length of the wait is a
 * rate limit and a Block that guessed one would be shipping one policy to four
 * products in a place no consumer can read it.
 *
 * **The announcement is assertive only for the two states where something the reader
 * did did not work.** A confirmation and a wait are things a reader can take in order,
 * and a progress reading is the last thing that should interrupt a sentence; a failure
 * and an expiry are the answer to the thing they just clicked and nothing else
 * follows, which is the case `LiveRegion` names as the one that interrupts.
 *
 * **There is no form, no `<form>` element and no value this Block holds, and the
 * absence is the pattern.** The link carried the proof and the caller's server knows
 * whether it proved anything, so the only things left to draw are what happened and
 * the reader's own next moves. The change control is a `Button` rather than a dialog
 * because where a new identifier is typed is a fact about the caller's product, and a
 * Block that opened a dialog would have to own that field's label, its description and
 * its sentences.
 *
 * It is a client Component, and the directive is unconditional even though it holds no
 * state of its own. `onResend` and `onChange` are functions, a function is a piece of
 * state, and state is a client module: a server Component cannot hand an event handler
 * to a `<button>`, so a caller rendering this from a server Component gets a screen
 * whose controls press and do nothing. The cost is a module in the client graph whose
 * static arrangement would have shipped no JavaScript at all, and the price was judged
 * worth paying for one boundary rather than a split where the reporting half is a
 * server Component and the controls half is not.
 */
export function VerifyEmail01({
  eyebrow,
  title,
  description,
  target,
  onResend,
  resendLabel,
  resentLabel,
  resending = false,
  cooldownLabel,
  status,
  actions,
  help,
  headingLevel = 'h2',
  className,
}: VerifyEmail01Props) {
  assertVerify({ target, status, resendLabel, resentLabel, help })

  const busy = resending || status.state === 'checking'
  const resendable = RESENDABLE.includes(status.state)
  /*
   * The ring is drawn only when the caller supplied the words to name it, and the
   * reason is `Spinner`'s own: a busy indicator with no name is an animation, and an
   * animation is nothing to a reader who cannot see it. So `checking` falls back to
   * the informational dot rather than to an unnamed ring, which is the same fact
   * reported in a way that needs no name.
   */
  const working = status.state === 'checking'

  return (
    <Section data-slot="verify-email-01" className={cn(className)}>
      <div data-slot="verify-email-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <Card data-slot="verify-email-01-card" className="max-w-measure-narrow gap-0 px-6">
          {/*
            What is being verified, above everything else on the screen. It is drawn in
            every one of the five states, because a reader whose address is being
            verified and whose verification has just failed has exactly one piece of
            information they need and it is the address they should compare against the
            message in their inbox.
          */}
          <div data-slot="verify-email-01-target" className="flex flex-col gap-2">
            {target.identifierLabel === undefined ? null : (
              <span
                data-slot="verify-email-01-target-label"
                className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
              >
                {target.identifierLabel}
              </span>
            )}

            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <span data-slot="verify-email-01-identifier" className="min-w-0 text-sm font-medium break-all">
                {target.identifier}
              </span>

              {target.changeLabel === undefined ? null : (
                /*
                  The caller's way to verify something else. A `Button` and not a
                  `CtaLink` because this does not navigate: it opens whatever surface
                  the caller's product uses to take a new identifier, and a control that
                  changes nothing about the address on screen is not a link to
                  somewhere.
                */
                <Button
                  data-slot="verify-email-01-change"
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => target.onChange?.(target.identifier)}
                >
                  {target.changeLabel}
                </Button>
              )}
            </div>
          </div>

          {/*
            The state, which is the screen. A bordered region rather than a sentence in
            the flow, because the sentence is what a reader would otherwise have to
            interpret: the indicator says which of the five this is before the words
            say anything, and a reader who reads the dot and stops there has still been
            told the only thing that was ambiguous.
          */}
          <div
            data-slot="verify-email-01-state"
            data-state={status.state}
            className="border-border flex flex-col gap-2 rounded-lg border px-4 py-3"
          >
            {working && status.stateLabel !== undefined ? (
              <Spinner data-slot="verify-email-01-spinner" label={status.stateLabel} size="sm" />
            ) : (
              <Status
                data-slot="verify-email-01-status-label"
                tone={STATE_TONE[status.state]}
                label={status.stateLabel ?? status.state}
                size="sm"
              />
            )}

            {/*
              The sentence, and it is inside the live region rather than beside it.
              One sentence is drawn once and announced once: a visible paragraph with a
              live region beside it holding the same words would read the same news
              twice on the one screen where a reader is waiting for an answer about
              whether their address is verified. `assertive` only for the two states
              where something the reader just did did not work, which is the case
              `LiveRegion` names as the one that interrupts.
            */}
            <LiveRegion
              data-slot="verify-email-01-status"
              politeness={
                status.state === 'failed' || status.state === 'expired' ? 'assertive' : 'polite'
              }
              busy={busy}
              className={cn(
                'text-sm text-pretty',
                status.state === 'failed' ? 'text-destructive font-medium' : '',
              )}
            >
              {status.message}
            </LiveRegion>
          </div>

          <div data-slot="verify-email-01-actions" className="flex flex-col items-start gap-3">
            {resendable ? (
              <Button
                data-slot="verify-email-01-resend"
                type="button"
                variant="outline"
                onClick={onResend}
                disabled={resending}
              >
                {resending ? resentLabel : resendLabel}
              </Button>
            ) : null}

            {/*
              The cooldown, and it is drawn only once a resend has been asked for,
              because a wait that has not started is not a wait. The words are the
              caller's because the length of the wait is their rate limit.
            */}
            {!resending || cooldownLabel === undefined ? null : (
              <p data-slot="verify-email-01-cooldown" className="text-muted-foreground text-xs">
                {cooldownLabel}
              </p>
            )}

            {/*
              The caller's own next moves, in whatever arrangement their product has:
              a sign-in link, a button that opens another inbox, a route to an
              administrator. A slot rather than a set of named controls, because what a
              reader does next here is a fact about the caller's product and not about a
              verification.
            */}
            {actions === undefined ? null : (
              <div data-slot="verify-email-01-next" className="flex w-full flex-col gap-2">
                {actions}
              </div>
            )}
          </div>
        </Card>

        {/*
          The way out for a reader this screen does not help, below the card rather
          than above the heading. It is drawn as a sentence and a link rather than as a
          link alone, because the sentence is what tells a reader who has just been
          told their link expired that there is another route, and both words are the
          caller's.
        */}
        {help === undefined ? null : (
          <div
            data-slot="verify-email-01-help"
            className="flex max-w-measure-narrow flex-col items-start gap-2"
          >
            <p className="text-muted-foreground text-sm text-pretty">{help.message}</p>
            <CtaLink href={help.href} variant="ghost" size="sm">
              {help.label}
            </CtaLink>
          </div>
        )}
      </div>
    </Section>
  )
}

export default VerifyEmail01
