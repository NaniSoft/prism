'use client'

import type { FormEvent, ReactNode } from 'react'
import { useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '../../components/ui/field'
import { LiveRegion } from '../../components/ui/live-region'
import { OneTimeCode } from '../../components/ui/one-time-code'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One way of proving who the reader is, and whether this screen is asking for that
 * one.
 *
 * **A name, a line and a flag, and the flag is the caller's.** A second factor is
 * not one thing: a product may have a code delivered by message, a code read from a
 * token, a key held in a platform's own store, and a backup set of printed codes,
 * and only the first three of those can be typed into a field. So the list is the
 * caller's declaration, and `selected` is the caller's own state, because the Block
 * has no way to know which factor a reader's session is currently asking for: that is
 * a fact about a half-completed sign-in on the caller's server.
 *
 * The alternative was a `<select>` and a chooser, and both were rejected for the
 * ordinary reason: on a screen where the reader is about to be asked for six
 * characters, a control that has to be operated before the field they came for is a
 * control in the way, and a chooser that can change which factor is being asked for
 * after the code was sent is a screen that can be answered with the wrong factor.
 * So the list is a list, it reports the selection, and the reader sees which of the
 * available factors this screen wants before they type anything.
 */
export type TwoFactor01Method = {
  /** A stable key for the row, and the value `onSubmit` reports. */
  id: string
  /** The method's own name, as the product writes it: a message, a token, a key. */
  name: string
  /**
   * The line under the name: where the factor was sent, which device holds it, what
   * it will be asked for next time.
   *
   * A node because half of the useful sentences in this position carry a link to the
   * document that explains the method, and a caller who has to flatten theirs to a
   * string loses it.
   */
  detail?: ReactNode
  /**
   * Whether this screen is asking for this factor.
   *
   * Reported and never changed, because the selection is the caller's state: it is
   * the half of a sign-in that lives on the caller's server, and a Block that moved
   * it would be telling a reader that the factor changed when only a row moved. The
   * selected row is marked with `aria-current` and a rule in the pack's own primary
   * colour, which is the arrangement DESIGN.md's Do list names for exactly this case,
   * so the mark is not a colour alone.
   *
   * At most one method may set it, and the run throws if two do: two selected
   * methods is a screen that asks for one factor and reports another.
   */
  selected?: boolean
}

/**
 * The code field, and the caller's own reading of it.
 *
 * **Every member of this type is forwarded to `OneTimeCode` unchanged, and that is
 * the reason it is spelled out rather than composed from the Component's own props
 * type.** Prism publishes surfaces rather than mechanisms, so a Block's props type
 * naming another Component's props type would put that Component's whole interface
 * into this Block's published surface, and every one of the four consumer sites
 * would inherit whatever `OneTimeCode` grows next. Naming the members keeps this
 * surface the set of things a second factor needs.
 */
export type TwoFactor01Code = {
  /**
   * The code's visible name, and the accessible name the segments announce.
   *
   * Required, and a sentence wherever the product has one: a row of six
   * single-character fields with no name is six anonymous fields, and a reader cannot
   * say out loud which one they are in.
   */
  label: string
  /**
   * How many characters the code has.
   *
   * Required and refused below one, because a code with no segments is a form that
   * cannot be completed and a field that looks like a text box with a border.
   */
  length: number
  /** The code, as the caller holds it. Required, because the Component is controlled. */
  value: string
  /** Called with the code as it changes. */
  onValueChange: (value: string) => void
  /**
   * The characters the code may contain, in the Component's own closed set.
   *
   * A pass-through and not a default of `numeric` on this Block's part, because
   * `OneTimeCode` does default to numeric and a Block that did not expose the set
   * would be deciding that every second factor in every product that installed it is
   * six digits. That is false for the case this Block most exists for: a set of
   * printed recovery codes is alphabetic, and a reader typing one into a field that
   * refuses letters is a reader who cannot finish signing in and has no way to find
   * out why. `alphanumeric` is the right answer for a one-time token delivered by
   * message, and `alpha` is the right answer for a printed code.
   */
  characters?: 'numeric' | 'alpha' | 'alphanumeric' | 'none'
  /**
   * The accessible name of one segment, receiving its zero-based index.
   *
   * A pass-through for the same reason as `characters`. Without it every segment
   * after the first announces the code's own label, which satisfies the form and
   * tells a reader nothing about which of the six they are in, and the Component's
   * own documentation says so in those words. Only this Block's caller knows what
   * their product calls the first, the second and the last character.
   */
  segmentLabel?: (index: number) => string
  /**
   * A line under the field, read before the segments.
   *
   * `OneTimeCode` forwards no props beyond the ones it declares, so this line cannot
   * be wired to the segments through `aria-describedby`; it is drawn above them
   * where a reader reaches it first, which is the next best arrangement and is stated
   * rather than hidden.
   */
  description?: ReactNode
  /**
   * What is wrong with the code, in the destructive token and announced as it
   * appears.
   *
   * The caller's sentence, and the reason is the same one the status message is: a
   * second factor's failure has more shapes than a design system can enumerate, from
   * a wrong code to a code that expired to a code for a factor that was never
   * enrolled to an account that has been locked, and a Block that named one of them
   * would be leaking a fact about the caller's authentication to whoever guesses
   * right.
   */
  error?: ReactNode
}

/**
 * The remember-this-device row, and what remembering means.
 *
 * A row and not a checkbox for the reason `Login01Remember` gives: the label is a
 * sentence about a duration, and "remember this device" and "do not ask me again for
 * 30 days" are different claims with different consequences on a shared machine.
 */
export type TwoFactor01Remember = {
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
 * Asking for the code again, and the three sentences one control needs.
 *
 * **Three names and a disabled state, because a second factor is the one request on
 * a product that genuinely has a limit and a cooldown, and the caller is the only one
 * who knows either.** How many codes a reader may ask for in a minute, how long the
 * answer waits before it can be sent again, and what a reader is told while they
 * wait are three different facts about three different systems, and none of them is
 * knowable from a form.
 */
export type TwoFactor01Resend = {
  /** The words on the resend control at rest. */
  label: string
  /** Called when the reader asks for the code again. */
  onResend: () => void
  /**
   * The words the control takes once a resend has been requested.
   *
   * Optional, and the control keeps `label` without it. A control that still reads
   * "send another code" immediately after the reader pressed it invites a second
   * press against a limit this Block cannot see, so a caller whose transport reports
   * an outcome should pass this and change their own `status` afterwards, which is
   * the one signal this Block has that the outcome was reported. The cost is stated
   * rather than hidden: a caller with no status at all stays in the confirm state
   * once they have asked, so the resting words do not come back, and the answer is to
   * pass a status whose state changes.
   */
  confirmLabel?: string
  /**
   * The words the control takes while the caller's own state says a request is in
   * flight, during which the control is disabled.
   *
   * Optional, and the control keeps `label` without it. A second press while the
   * first request is in flight is a second code asked for against a limit the Block
   * cannot see, so the control is disabled in that state whether or not a name is
   * passed for it; the name is here for the caller who can say what a reader should
   * be told while they wait.
   */
  cooldownLabel?: string
}

/**
 * What the caller's own request is doing, in the caller's own words.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: a second factor's outcome has more shapes than any other request in
 * this package, from accepted to expired to replayed to refused to a session that was
 * never waiting for a factor, and one sentence cannot be true of them all.
 */
export type TwoFactor01Status = {
  /**
   * Which of the three the request is in. Read by the Block for two things only.
   *
   * `working` disables the submit control and the resend control, and marks the
   * outcome region busy. Everything else is the caller's to say, and the reason is
   * the Block's own argument: whether a code was accepted is a fact about the
   * caller's server, and the Block has no way to observe it.
   */
  state: 'idle' | 'working' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The way off this screen without answering it.
 *
 * A named pair and not a control with a default name, because a reader who arrived
 * here through a deep link and is not the account's owner needs a way out, and
 * whether abandoning the second factor signs them out, returns them to the previous
 * step or closes the whole flow is a decision about the caller's own session. The
 * words are the caller's for the same reason every other control name in this package
 * is.
 */
export type TwoFactor01Cancel = {
  /** The words on the control. */
  label: string
  /** Called when the reader abandons the second factor. */
  onCancel: () => void
}

/**
 * The props a TwoFactor01 takes. Every string in this Block is one of them.
 *
 * There is no second factor vocabulary in this file: no list of methods this package
 * believes in, no length this package believes in, no code it would generate and no
 * attempt count it would enforce. A second factor is the point at which a design
 * system is most tempted to have opinions, and every one of those opinions is a
 * security policy.
 */
export type TwoFactor01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a screen asking for six characters with no heading is a form
   * in a page.
   */
  title: ReactNode
  /**
   * Which factor is being asked for, in the caller's own words. Required, and the
   * reason is the one `MagicLink01` gives for the same prop and a stronger one here.
   *
   * **On this screen the reader cannot tell what is being asked for by looking at the
   * screen.** A sign-in says what it wants in its title because the reader knows they
   * are signing in. A second factor arrives after the reader has already proved who
   * they are, sometimes on another device, sometimes minutes after they started, and
   * the code in front of them could be for a message, a token, a key or a printed
   * backup. A reader who does not know will type the code they were given an hour ago,
   * and a reader who types the wrong factor's code has failed an attempt against a
   * limit the Block cannot see. So the type makes it required rather than the Block
   * defaulting to something, and the cost is named: a product with one factor and
   * nothing to add has to write the sentence anyway, and it is usually the sentence
   * that should have been on the sign-in screen.
   */
  description: ReactNode
  /**
   * The factors this account can prove itself with, in the order a reader should meet
   * them.
   *
   * Omit it for a product with exactly one factor, which is the common case and needs
   * no list: the description above already says which one is being asked for, and a
   * list of one is a heading over a single row.
   */
  methods?: readonly TwoFactor01Method[]
  /**
   * The code field. Required, because a second factor screen without a code field is
   * a screen for something else and there is already a Component for that.
   */
  code: TwoFactor01Code
  /**
   * Called with what the reader typed, and the only thing this Block does with it.
   *
   * **Required, and the requirement is what makes it installable.** The Block reads no
   * code, checks no code, stores no code, and keeps no count. It holds the caller's
   * value in order to render a controlled field and hands it over once, which is the
   * arrangement a `OneTimeCode` cannot avoid because a segmented field has to know
   * its own value to know whether it is complete.
   *
   * `method` is the selected method's `id`, and it is absent rather than guessed when
   * no method is selected: a caller with one factor has no id to report and should not
   * have to invent one to satisfy a type.
   */
  onSubmit: (value: { code: string; method?: string; remember: boolean }) => void
  /** The words on the one control that submits. */
  submitLabel: string
  /**
   * Whether the caller's request is in flight.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `submitting` is the controls and `status.state` is the outcome. Passing both is
   * ordinary, and this is the one screen where it is close to mandatory, because the
   * request in flight might be a resend rather than a submit.
   */
  submitting?: boolean
  /** The remember-this-device row. Omit it and the row is not drawn. */
  remember?: TwoFactor01Remember
  /** Asking for the code again, and the three sentences its control needs. */
  resend?: TwoFactor01Resend
  /**
   * What the caller's own request is doing, drawn in a live region and announced.
   *
   * See the Block's JSDoc for why there is no accepted sentence anywhere in this file
   * and what the honest failure of a second factor looks like.
   */
  status?: TwoFactor01Status
  /** The way off this screen without answering it. */
  cancel?: TwoFactor01Cancel
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
 * diagnostic in a console rather than a nameless control on the screen where a reader
 * is about to be asked to prove who they are.
 *
 * Six shapes, and this is the screen on which they are least forgivable. A code with
 * no name is six anonymous fields. A code of length zero is a form that cannot be
 * completed, and a reader cannot tell that from a broken one. Two selected methods is
 * a screen that asks for one factor and reports another. A nameless remember row is a
 * tick box a reader cannot find, and a tick box they cannot find is a session
 * somebody else's colleague can walk into. A nameless resend control is a button
 * whose only job is to be pressed and which announces itself as a button. A
 * `remember.value` with no `onValueChange` is a control that will show one state and
 * then stop agreeing with the caller, which on this screen is a claim about the
 * reader's session.
 */
function assertTwoFactor(input: {
  code: TwoFactor01Code
  methods: readonly TwoFactor01Method[] | undefined
  remember: TwoFactor01Remember | undefined
  resend: TwoFactor01Resend | undefined
  cancel: TwoFactor01Cancel | undefined
  submitLabel: string
}): void {
  const { code, methods, remember, resend, cancel, submitLabel } = input

  if (blank(code.label)) {
    throw new Error(
      'TwoFactor01: the code field declares no label, so its six segments would be six anonymous fields ' +
        'and a reader could not say out loud which one they were in. Pass the words the product uses for the ' +
        'code it has sent.',
    )
  }

  if (!Number.isInteger(code.length) || code.length < 1) {
    throw new Error(
      `TwoFactor01: the code field declares a length of ${JSON.stringify(code.length)}, so the field would ` +
        'render no segments at all, which is a form that cannot be completed and looks to a reader exactly ' +
        'like one that is broken. Pass the number of characters the code your service issues has.',
    )
  }

  let chosen = 0
  for (const method of methods ?? []) {
    if (blank(method.name)) {
      throw new Error(
        `TwoFactor01: the method ${JSON.stringify(method.id)} declares no name, so the row would announce ` +
          'nothing about which factor it is, on the one screen where the reader has to be able to tell. Pass ' +
          'the words the product uses.',
      )
    }
    if (method.selected === true) chosen += 1
  }

  if (chosen > 1) {
    throw new Error(
      `TwoFactor01: ${chosen} methods are marked selected, so the screen would be asking the reader for one ` +
        'factor while handing their caller another, and the code that would be accepted is not the one the ' +
        'reader was told to look for. Mark one, or none.',
    )
  }

  if (blank(submitLabel)) {
    throw new Error(
      'TwoFactor01: submitLabel is blank, so the one control that verifies the reader would be announced as ' +
        'a button. Pass the sentence.',
    )
  }

  if (remember !== undefined) {
    if (blank(remember.label)) {
      throw new Error(
        'TwoFactor01: a remember row was passed with no label, so the control would be a tick box with no ' +
          'words beside it, and a tick box a reader cannot find is a session somebody can walk into on a ' +
          'shared machine. Pass the sentence, or drop the row.',
      )
    }
    if (remember.value !== undefined && remember.onValueChange === undefined) {
      throw new Error(
        'TwoFactor01: remember.value was passed with no onValueChange, so the row would show one state and ' +
          'then stop agreeing with the caller, which on this screen is a claim about the reader own session. ' +
          'Pass the pair, or neither.',
      )
    }
  }

  if (resend !== undefined && blank(resend.label)) {
    throw new Error(
      'TwoFactor01: a resend control was passed with no label, so the button whose only job is to be pressed ' +
        'would be announced as a button. Pass the sentence.',
    )
  }

  if (cancel !== undefined && blank(cancel.label)) {
    throw new Error(
      'TwoFactor01: a cancel control was passed with no label, so the way off this screen would be a button ' +
        'a reader can reach and not identify, which is the wrong thing to leave unnamed on the screen where a ' +
        'reader who arrived on the wrong link most needs to leave. Pass the sentence.',
    )
  }
}

/**
 * A second factor: which one is being asked for, the code itself, the control that
 * asks for it again, and the caller's own words for what happened.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a verification screen: a method line saying where the code
 * came from, a field for the code, a "send another" link, a "remember this device"
 * tick, a button and the way back, and its purpose is to confirm that the person
 * holding the card is the person who has the account, before a purchase is taken. The
 * composition is that screen and is unchanged, down to the composition of the code
 * field. What the screen authorises is a machine acting on this reader's behalf for
 * the first time, and that is why the standard for what it refuses is higher here
 * than anywhere else in this package.
 *
 * **It does not verify the code. It does not count the attempts. And it does not own
 * the lockout.** Each of those is the consumer's, and each is a security decision
 * rather than a rendering one, and the three together are what this Block is for.
 *
 * A Block that counted attempts would be shipping a lockout policy into every product
 * that installed it: three tries on one product and five on another, with no
 * configuration point a consumer can find, in a file none of them reads. A lockout is
 * an availability decision and it belongs to the product, because only the product
 * knows what being locked out of an estate observation tool costs. It costs a
 * two-person shift nothing when a market is closed, and it costs a whole capture
 * window when the market is open, and the number of attempts a caller will accept is
 * a different number on Tuesday from the number it will accept on Wednesday at nine.
 * Worse, a lockout is a denial of service that anybody can aim at a reader: a
 * component library that enforces one has handed every installer a way for a stranger
 * to lock a colleague out of their own work by typing six wrong characters, and it
 * has done that invisibly.
 *
 * So the Block hands the code across a form boundary and draws what it is given. It
 * keeps no count because it has no memory between the reader's attempts to record, it
 * has no clock to expire a lockout with, and it cannot know whether an attempt even
 * reached the caller's server. The caller's `status` is the only thing on this screen
 * that says whether anything happened, and the caller's `code.error` is the only thing
 * that says what was wrong with the entry.
 *
 * **What it authorises.** A successful `onSubmit` means the caller's own server has
 * accepted this code for this session and will now let this reader's machine act. That
 * is a larger grant than the sign-in it completes: a sign-in opens a session for a
 * person, and a second factor decides whether the machine that person is holding may
 * act on their behalf. It is also the least reversible grant on this surface, because
 * the reader is here because something already knows they are the account's owner, and
 * a code that was guessed, replayed or phished is accepted exactly the same as one
 * that was typed by the person it belongs to.
 *
 * **What it deliberately does not do, beside the three above.** It will not generate
 * a code, and it will not say how long one is valid. Both of those are the caller's
 * verification service, and a Block that drew an expiry it had invented would be
 * telling a reader their code is still good when the caller's server has already
 * stopped accepting it, which is the one error on this screen that costs a reader a
 * second attempt they could have avoided. The `expiresLabel` idea from the
 * passwordless screen is deliberately absent here for that reason: there is no prop
 * for it, because there is no honest reading of a duration this Block can reach, and
 * a caller that wants to state one composes it into `description` or `status.message`
 * where it is their sentence and not this Block's claim.
 *
 * **The code field is `OneTimeCode` and not six `<input>` elements written here, and
 * the Component's own arguments are the reason and they are worth restating once
 * because this is the screen they matter on.** A paste of the whole code lands in
 * every segment: a reader who has the code on their clipboard has already done the
 * hard part, and a field that accepted one character per paste would make them retype
 * it one box at a time, which is what they are on their phone to avoid. A refused
 * character is refused rather than stored, so "123 456" pastes as `123456` and
 * `12345a6` pastes as `123456`, because the alternative is a field that looks right
 * and a form that does not submit. The code is one value and not six, so Backspace
 * removes a character from the string and the characters after it close up, because
 * six boxes that each had to be emptied by hand would need a rule for what Backspace
 * on an empty box means and every version of that rule is wrong for somebody. And the
 * whole code is one Tab stop, so the reader reaches the first segment once and the
 * rest follow as they type. Five decisions, each of which is wrong in a different
 * product if this Block made its own.
 *
 * **The code's description cannot be wired to the segments, and the reason is that
 * `OneTimeCode` forwards no props beyond the ones it declares.** It is a deliberate
 * decision in that Component, so a caller cannot attach a description or an error to
 * the segments by accident. The consequence here is that `code.description` is drawn
 * above the field where a reader reaches it first and `code.error` is drawn below it
 * with `role="alert"` so it is announced when it appears rather than when the reader
 * finds it. That is the next best arrangement available and it is stated rather than
 * hidden, because on a security surface a wiring somebody assumed and did not check
 * is exactly the kind of thing this Block's documentation exists to prevent.
 *
 * **The honest failure state is the caller's sentence, and the reason is that a
 * second factor has more failure shapes than a design system should be able to name.**
 * The code can be wrong, expired, already used, for a factor the reader did not
 * choose, for a session that has gone, or for an account that has just been locked by
 * the caller's own attempt counter. The reader can dismiss a prompt, arrive with a
 * code for another device, or be rate limited. And the distinction between them is
 * itself a security fact: a screen that says "that code has expired" is telling a
 * reader something an attacker learns too. So `status` and `code.error` are both props
 * with the caller's words, this file holds no accepted flag and no failure flag, and
 * what the Block does about an outcome is the two rendering decisions: the submit and
 * resend controls are refused while the caller's own state says a request is in
 * flight, because a second press is a second attempt counted against a limit the
 * Block cannot see, and the outcome is drawn in one live region, `assertive` for the
 * refusal, because a reader who has typed six characters and got nothing back is a
 * reader who will type six more.
 *
 * **The method list is drawn and never changed, and the cost is that the Block cannot
 * offer the reader another way in.** A product with three factors and a reader
 * without access to the one being asked for has a problem, and the honest answer is a
 * control that changes the selection, which is a request to the caller's server and a
 * state this Block would then be reporting rather than holding. So `selected` is the
 * caller's, the selected row is marked with `aria-current` and a rule in the primary
 * colour so the mark is not a colour alone, and a consumer who needs the chooser
 * composes their own beside this Block.
 *
 * **It is a client Component, and the directive is unconditional.** `onSubmit` is a
 * function, a function is a piece of state, and state is a client module: a server
 * Component cannot hand an event handler to a `<form>`, so a caller rendering this
 * from a server component gets a form that submits and calls nothing. The code itself
 * is already client-side for the same reason it is a segmented field, and
 * `OneTimeCode` is a client Component whichever way this one is drawn.
 */
export function TwoFactor01({
  eyebrow,
  title,
  description,
  methods,
  code,
  onSubmit,
  submitLabel,
  submitting = false,
  remember,
  resend,
  status,
  cancel,
  headingLevel = 'h2',
  className,
}: TwoFactor01Props) {
  assertTwoFactor({ code, methods, remember, resend, cancel, submitLabel })

  const generated = useId()
  const codeId = `${generated}-code`
  const rememberId = `${generated}-remember`
  const rememberDescriptionId = `${generated}-remember-description`
  const errorId = code.error === undefined ? undefined : `${generated}-code-error`
  const busy = submitting || status?.state === 'working'
  const chosen = methods?.find((method) => method.selected === true)

  /*
   * The tick, and the one piece of render-time state that lets the control leave the
   * confirmed state. The confirm state is entered by the reader pressing resend, which
   * the Block knows about because it is the Block own control, and it is left when the
   * caller's own status changes, which is the only signal this Block has that the
   * outcome of that resend was reported. Adjusted during render rather than in an
   * effect, because the trigger is a prop changing and this is the arrangement React
   * documents for it.
   */
  const [remembered, setRemembered] = useState(remember?.value ?? false)
  const [seenRemember, setSeenRemember] = useState(remember?.value)
  if (seenRemember !== remember?.value) {
    setSeenRemember(remember?.value)
    setRemembered(remember?.value ?? false)
  }

  const [resent, setResent] = useState(false)
  const [seenState, setSeenState] = useState(status?.state)
  if (seenState !== status?.state) {
    setSeenState(status?.state)
    setResent(false)
  }

  const setRemember = (value: boolean) => {
    setRemembered(value)
    remember?.onValueChange?.(value)
  }

  /*
   * The three sentences the resend control can carry, resolved once here rather than
   * as a nested ternary inside the call: the caller's own state first, because a
   * second press while the first request is in flight is a second code asked for
   * against a limit this Block cannot see; then the fact that the reader has already
   * asked; then the resting name. Each of the two optional names falls back to the
   * one that is required, so a caller who passes only `label` gets one sentence
   * throughout, which is a control that reads the same before and after and a trap
   * the caller's own status can still get them out of.
   */
  const resendText =
    resend === undefined
      ? undefined
      : busy && resent
        ? (resend.cooldownLabel ?? resend.confirmLabel ?? resend.label)
        : resent
          ? (resend.confirmLabel ?? resend.label)
          : resend.label

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ code: code.value, method: chosen?.id, remember: remembered })
  }

  return (
    <Section data-slot="two-factor-01" className={cn(className)}>
      <div data-slot="two-factor-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <Card data-slot="two-factor-01-card" className="max-w-measure-narrow gap-0 px-6">
          <form
            data-slot="two-factor-01-form"
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-5"
          >
            {/*
              The methods, drawn and never changed. A list rather than a chooser for
              the reason the prop's own documentation gives: on a screen where the
              reader is about to be asked for six characters, a control that has to be
              operated before the field they came for is a control in the way, and a
              chooser that can change which factor is being asked for after the code
              was sent is a screen that can be answered with the wrong factor. The
              selected row is marked with `aria-current` and a rule in the pack own
              primary colour rather than by colour alone, which is the arrangement
              DESIGN.md names for marking the current thing.
            */}
            {methods === undefined || methods.length === 0 ? null : (
              <ul data-slot="two-factor-01-methods" className="border-border flex flex-col border-t">
                {methods.map((method) => (
                  <li
                    key={method.id}
                    data-slot="two-factor-01-method"
                    data-method={method.id}
                    aria-current={method.selected === true ? 'true' : undefined}
                    className={cn(
                      'flex flex-col gap-0.5 border-b border-s-2 py-3 ps-3 last:border-b-0',
                      // One colour class and not two, because the two would be two
                      // single-class declarations of the same property and the one that
                      // won would be the one Tailwind happened to emit last.
                      method.selected === true ? 'border-primary' : 'border-border',
                    )}
                  >
                    <span data-slot="two-factor-01-method-name" className="text-sm font-medium">
                      {method.name}
                    </span>
                    {method.detail === undefined ? null : (
                      <span
                        data-slot="two-factor-01-method-detail"
                        className="text-muted-foreground text-sm text-pretty"
                      >
                        {method.detail}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <Field data-slot="two-factor-01-code" data-invalid={errorId === undefined ? undefined : 'true'}>
              {/*
                The description, above the field rather than wired to it, and the
                reason is that `OneTimeCode` forwards no props beyond the ones it
                declares. That is a deliberate decision in the Component and this
                Block does not route around it.
              */}
              {code.description === undefined ? null : (
                <FieldDescription>{code.description}</FieldDescription>
              )}

              <FieldLabel htmlFor={codeId}>{code.label}</FieldLabel>

              {/*
                The code, and it is the Component rather than six inputs written here,
                and the Component own arguments are the reason: a paste of the whole
                code lands in every segment, a refused character is refused rather than
                stored, the code is one value rather than six so Backspace closes the
                gap up, and the whole thing is one Tab stop. Five decisions, each of
                which is wrong in a different product if this Block made its own.

                `id` is passed so the visible label above names the first segment
                through a real `<label>` element, which is also the element the
                platform uses to name its own autofill prompt. With an `id`, the
                Component steps its hidden label aside rather than leaving two names
                on one segment.
              */}
              <OneTimeCode
                id={codeId}
                label={code.label}
                length={code.length}
                value={code.value}
                onValueChange={code.onValueChange}
                {...(code.characters === undefined ? null : { characters: code.characters })}
                {...(code.segmentLabel === undefined ? null : { segmentLabel: code.segmentLabel })}
              />

              {errorId === undefined ? null : (
                <FieldError id={errorId}>{code.error}</FieldError>
              )}
            </Field>

            {/*
              The resend control, and the three names it can carry. It is disabled
              while the caller's own state says a request is in flight, because a
              second press is a second code asked for against a limit this Block cannot
              see, and it is not disabled by anything this Block counts, because it
              counts nothing. The words follow the reader having asked, then the
              caller's own state, and the run above has already refused to draw the
              control without a name.
            */}
            {resend === undefined ? null : (
              <div data-slot="two-factor-01-resend-row">
                <Button
                  data-slot="two-factor-01-resend"
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    setResent(true)
                    resend.onResend()
                  }}
                  className="self-start"
                >
                  {resendText}
                </Button>
              </div>
            )}

            {remember === undefined ? null : (
              <div data-slot="two-factor-01-remember" className="flex items-start gap-2.5">
                <Checkbox
                  id={rememberId}
                  checked={remembered}
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

            <div data-slot="two-factor-01-actions" className="flex flex-col gap-3">
              <Button
                data-slot="two-factor-01-submit"
                type="submit"
                disabled={busy}
                className="w-full"
              >
                {submitLabel}
              </Button>

              {/*
                The outcome, and it renders nothing while there is no message.
                `LiveRegion` draws no element at all for an empty child, which is why a
                second factor screen at rest carries no live region rather than an
                empty one announcing every unrelated change of its ancestors.
                `assertive` for the refusal, because that is the one state where the
                reader is waiting for an answer and nothing else follows it, and a
                reader who has typed six characters and heard nothing will type six
                more.
              */}
              <LiveRegion
                data-slot="two-factor-01-status"
                politeness={status?.state === 'error' ? 'assertive' : 'polite'}
                busy={busy}
                className={cn(
                  'text-sm',
                  status?.state === 'error' ? 'text-destructive font-medium' : 'text-muted-foreground',
                )}
              >
                {status?.message}
              </LiveRegion>
            </div>
          </form>

          {/*
            The way off this screen, last and quiet, because a reader who arrived on the
            wrong link most needs it and a reader on the right one never sees it. The
            Block does not decide what cancelling means: it does not know whether the
            caller's session is a half-finished sign-in, an already-open one, or a
            deep link, and the three want different things done to them.
          */}
          {cancel === undefined ? null : (
            <div data-slot="two-factor-01-cancel-row" className="border-border border-t pt-5">
              <Button
                data-slot="two-factor-01-cancel"
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancel.onCancel}
              >
                {cancel.label}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Section>
  )
}

export default TwoFactor01
