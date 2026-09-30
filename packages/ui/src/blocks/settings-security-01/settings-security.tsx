'use client'

import { type FormEvent, type ReactNode, useState } from 'react'

import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Field, FieldDescription, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { PasswordField } from '../../components/ui/password-field'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { Switch } from '../../components/ui/switch'
import { cn } from '../../lib/utils'

/**
 * Where a sign-in method stands.
 *
 * `pending` is the member that is not a binary, and the Block's JSDoc says what
 * it does with it: a setup that is half finished is not a setting that is on, and
 * a control drawn on it would let a reader turn off something that was never on.
 */
export type SettingsSecurityMethodState = 'enabled' | 'disabled' | 'pending'

/**
 * The tone each method state is drawn in, from the semantic contract and no other.
 *
 * `pending` is `info` and not `warning`, for the reason `member-list-01` gives for
 * a colleague who is away: a device waiting for its owner to finish a setup is
 * work in progress rather than a fault, and a settings page where every unclaimed
 * phone is amber is a page of alarms that means nothing. `disabled` is `neutral`
 * because a method nobody has turned on is not in dispute.
 */
const METHOD_TONE: Record<SettingsSecurityMethodState, StatusTone> = {
  enabled: 'success',
  disabled: 'neutral',
  pending: 'info',
}

/**
 * Where a second factor stands.
 *
 * `enrolled` is the third answer and it is the one a two-state surface cannot
 * give: a secret has been generated and the reader has not yet confirmed it, so
 * the account is neither protected nor unprotected and the honest word is neither
 * on nor off.
 */
export type SettingsSecurityTwoFactorState = 'on' | 'off' | 'enrolled'

/**
 * The tone each second-factor state is drawn in.
 *
 * `on` is `success` because it is the state the reader is working towards.
 * `off` is `neutral` rather than `warning`, because turning a second factor off is
 * a decision a reader is allowed to make on an account they control and a page
 * that alarms about it is a page that nags. `enrolled` is `info`, because one step
 * is left and a step is not an alarm.
 */
const TWO_FACTOR_TONE: Record<SettingsSecurityTwoFactorState, StatusTone> = {
  on: 'success',
  off: 'neutral',
  enrolled: 'info',
}

/**
 * One way a reader can prove who they are.
 *
 * A method and not a credential: the Block never sees a secret, and the words in
 * every field here are the product's statements about its own authentication.
 */
export type SettingsSecurityMethod = {
  /** A stable key for the row, passed back to `onMethodChange`, and carried as `data-method`. */
  id: string
  /** The method's own name, as the product writes it: a passkey, a phrase, a code. */
  name: string
  /** Where the method stands. Required, because a row with no state cannot be acted on. */
  state: SettingsSecurityMethodState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is given, which is always, and a thrown diagnostic
   * rather than a silent absence, for the reason `Status` states in full: the tone
   * is a colour and the words are the information.
   */
  stateLabel?: string
  /**
   * The line under the method's name: where the secret is kept, when it was last
   * used, what turning it on will ask for.
   *
   * A node because half of the useful sentences in this position carry a link to
   * the document that explains the method, and a caller who has to flatten theirs
   * to a string loses it.
   */
  detail?: ReactNode
  /**
   * The line naming when this method was added, already written as it should be
   * read.
   *
   * A string rather than a moment and a formatter for the reason the other Blocks
   * in this wave take it: a Block that formatted the moment would be choosing a
   * locale and a granularity on a reader's behalf. A caller who wants "three months
   * ago" composes `relative-time` and passes the reading.
   */
  addedLabel?: string
}

/**
 * One field of the change-password form, and which of the three it is.
 *
 * The union of three is what lets the Block make the reveal decision per field,
 * which is the decision this Block's JSDoc argues for at length.
 */
export type SettingsSecurityPasswordField = {
  /** A stable key for the field, and the element's `id`. */
  id: string
  /** The field's own label, as the product writes it. */
  label: string
  /**
   * Which of the three fields this is.
   *
   * The name is a machine value and the arrangement is the whole of it: a `current`
   * field is the one a reader is proving they know a secret, and a `new` or
   * `confirm` field is the one they are about to retype. The Block draws a reveal
   * control on the second kind and not on the first, and the Block's JSDoc gives
   * the reason in full.
   */
  type: 'current' | 'new' | 'confirm'
  /**
   * The form field name the platform's password manager offers to save.
   *
   * Defaults to the right hint for the field's own kind, which is the arrangement
   * `PasswordField` insists on and the reason this prop exists at all: a
   * `current` field wants `current-password` and the other two want `new-password`,
   * and getting it wrong on a new password produces an account the browser will
   * not offer to sign in with.
   */
  autoComplete?: string
}

/**
 * The change-password form, and everything the caller has to say about it.
 *
 * `revealLabel` and `hideLabel` are here rather than being defaulted because they
 * cannot be defaulted: a reveal control that says one sentence in a product whose
 * interface is in another language is the defect the Component's own JSDoc was
 * written against, and a Block that filled them in would be shipping English into
 * every consumer's password field.
 */
export type SettingsSecurityChangePassword = {
  /** The three fields, in the order a reader should meet them. */
  fields: readonly SettingsSecurityPasswordField[]
  /**
   * Called with the three entries when the reader submits the form.
   *
   * The Block holds the values only long enough to hand them over, and it hands
   * over all three whatever the form is missing, so a caller that renders two
   * fields still receives a `confirm` of the empty string rather than `undefined`.
   */
  onSubmit: (value: { current: string; next: string; confirm: string }) => void
  /** The words on the submit control. */
  submitLabel: string
  /**
   * The accessible name of a reveal control while the password is hidden.
   *
   * Required, and a prop rather than a default for the reason
   * `PasswordField.revealLabel` gives in full.
   */
  revealLabel: string
  /**
   * The accessible name of a reveal control while the password is showing.
   *
   * Required as a second sentence rather than as a state flag, because the name
   * has to describe what pressing the control will do rather than what is
   * currently true.
   */
  hideLabel: string
  /**
   * What the product has to say about the change, after the reader pressed the
   * control.
   *
   * The state is the caller's, so a form that shows a failure is showing a truth
   * the Block cannot know, and the `error` state takes `role="alert"` so the
   * message is announced when it appears rather than when the reader finds it.
   */
  status?: {
    state: 'idle' | 'sending' | 'done' | 'error'
    message: ReactNode
  }
}

/**
 * One place a session is signed in from.
 *
 * A device and not a browser, and no address, because a security surface that
 * shows a reader their own IP addresses is showing them something they cannot act
 * on and did not ask for.
 */
export type SettingsSecuritySession = {
  /** A stable key for the row, passed back to `onRevokeSession`, and carried as `data-session`. */
  id: string
  /** The device, as the product describes it. */
  device: string
  /** Where the session was opened, in the product's own terms. */
  location?: string
  /**
   * When the session began, in whichever of the two forms the caller already has
   * it. Printed exactly as passed.
   */
  startedAt?: number | string
  /**
   * The words for the start, given the moment. A function because the honest
   * reading is a localised sentence.
   */
  startedAtLabel?: (value: number | string) => string
  /**
   * Marks the session the reader is currently signed in through.
   *
   * The mark changes no control. See the Block's JSDoc for why revocation is
   * offered on this row anyway, which is the part of this Block most likely to be
   * got wrong.
   */
  isCurrent?: boolean
  /**
   * The words that mark the reader's own session.
   *
   * Required whenever `isCurrent` is set, and a thrown diagnostic rather than a
   * silent absence: a row the Block has decided is the reader's own, marked by
   * nothing a reader can see, is a claim with no document to check it against.
   */
  currentLabel?: string
  /**
   * The caller's own control for this row, in place of the Block's revoke
   * control.
   *
   * A slot because revoking a session is an action a product usually confirms, and
   * the confirmation is the product's: a sheet on some surfaces, a toast on
   * others, and on a security surface a bare click is not a confirmation.
   */
  revoke?: ReactNode
}

/**
 * The second factor's state, and the caller's own control for it.
 *
 * A named type and not an inline object, for the ordinary reason: a consumer
 * assembling a security surface in its own module has to be able to declare this
 * shape once and hand the same object to the Block.
 */
export type SettingsSecurityTwoFactor = {
  /** Where the second factor stands. */
  state: SettingsSecurityTwoFactorState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is given, which is always, and a thrown diagnostic
   * rather than a silent absence: this is the most load-bearing control on the page
   * and a coloured dot with nothing beside it is a claim about the reader's account
   * that nothing in the document backs up.
   */
  stateLabel?: string
  /**
   * The control that moves the second factor, because it is a different control in
   * each of the three states: enroll, turn on, turn off. A Block that chose would be
   * choosing for every product that has one.
   */
  action?: ReactNode
}

/**
 * The four group names, all optional, and the reason they are optional is the
 * Block's JSDoc.
 *
 * A caller who names a group gets a real heading one level below the section; a
 * caller who names none gets a section of rows under the section heading, which
 * is the right arrangement for the common case of a product with one group.
 */
export type SettingsSecurityLabels = {
  /** Above the sign-in methods. */
  methods?: ReactNode
  /** The card's title, on the change-password form. */
  password?: ReactNode
  /** Above the sessions list. */
  sessions?: ReactNode
  /** Above the second-factor row. */
  twoFactor?: ReactNode
}

/**
 * The props a SettingsSecurity01 takes.
 *
 * Every string is a prop and the Block ships none. There is no method list, no
 * session list, no device vocabulary, no state word, no field label, no submit
 * sentence, no reveal sentence and not one of the sentences a security surface is
 * most tempted to ship. A security surface is where a hardcoded word is least
 * excusable and most likely, because the reader is reading about their own
 * account and assumes every word on the page was chosen for them.
 */
export type SettingsSecurity01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Required, because a security surface with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The names of the four groups this surface can draw.
   *
   * All four optional, and the reason is in the Block's JSDoc: a group with no name
   * is not a mystery, and four required names would be four sentences a consumer
   * writes for groups they may not have. A group whose name is passed becomes a
   * real heading at `childLevel(headingLevel)`; a group whose name is not passed
   * draws no heading and is a set of rows under the section's own.
   */
  labels?: SettingsSecurityLabels
  /** The sign-in methods, in the order a reader should meet them. */
  methods: readonly SettingsSecurityMethod[]
  /**
   * Called when a reader turns a method on or off.
   *
   * A request and not a mutation, for the same reason as the other Blocks in this
   * wave: the row's state comes from the data, so a control that moved and rolled
   * back would show a reader a method state the product did not change.
   */
  onMethodChange?: (id: string) => void
  /**
   * The accessible name of a method's control, given the method and the state the
   * control would move to.
   *
   * Required whenever `onMethodChange` is set, and a function for the reasons
   * `SettingsNotifications01.updateLabel` is one: a control's accessible name has
   * to say what pressing it does, and the sentence has to contain the method's own
   * name because that is the visible label of the control and the WCAG rule that a
   * visible label must be inside the accessible name is what lets a reader using
   * voice control act on the words they can see.
   *
   * It is not consulted for a method in the `pending` state, which draws no
   * control at all, for the reason the Block's JSDoc gives.
   */
  methodToggleLabel?: (
    method: { id: string; name: string },
    on: boolean,
  ) => string
  /**
   * The change-password form. Omit it and the card is not drawn, which is right
   * for a product that authenticates entirely by a method this Block already
   * lists.
   */
  changePassword?: SettingsSecurityChangePassword
  /**
   * The sessions this workspace is signed in from. Omit the group and it is not
   * drawn.
   */
  sessions?: readonly SettingsSecuritySession[]
  /**
   * Called when a reader revokes a session.
   *
   * Offered on every row, including the reader's own. See the Block's JSDoc.
   */
  onRevokeSession?: (id: string) => void
  /**
   * The words on a revoke control, given the session.
   *
   * Required whenever `onRevokeSession` is set, and a function because a column of
   * controls all announced as "Revoke" is a column a screen reader user cannot act
   * on, and because the honest sentence names the device: "Revoke the session on a
   * work laptop" and "Revoke the session on a phone" are different consequences.
   */
  revokeLabel?: (session: { id: string; device: string }) => string
  /**
   * The second factor's state, and the caller's own control for it.
   *
   * Omit it and the row is not drawn, which is right for a product with no second
   * factor at all.
   */
  twoFactor?: SettingsSecurityTwoFactor
  /**
   * What the surface shows when there are no methods.
   *
   * Required, and the reason is the one the other Blocks in this wave take: a
   * workspace with no way to sign in and a workspace whose methods failed to load
   * are not the same page.
   */
  empty: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/** The three entries the change-password form hands over, and nothing else. */
const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' }

/** The values the form holds, keyed by the three field kinds rather than by id. */
type Passwords = typeof EMPTY_PASSWORDS

/**
 * The platform hint a field of each kind wants.
 *
 * Defaults are read from the field's own `type` rather than taken from the caller
 * on every field, because the hint that matters is the one that is easy to get
 * wrong on exactly the two fields where getting it wrong breaks an account. See
 * `SettingsSecurityPasswordField.autoComplete`.
 */
const DEFAULT_AUTO_COMPLETE: Record<SettingsSecurityPasswordField['type'], string> = {
  current: 'current-password',
  new: 'new-password',
  confirm: 'new-password',
}

/**
 * The refusals, so that a security surface never renders a control or a word it
 * cannot justify.
 *
 * A state with no words, a row the Block has decided is the reader's own and has
 * marked in no way a reader can see, a control whose name the caller did not
 * write, and a sentence for a control that is not there. Each is a caller's
 * mistake rather than a request.
 */
function assertProps(props: {
  methods: readonly SettingsSecurityMethod[]
  onMethodChange?: (id: string) => void
  methodToggleLabel?: (method: { id: string; name: string }, on: boolean) => string
  sessions?: readonly SettingsSecuritySession[]
  onRevokeSession?: (id: string) => void
  revokeLabel?: (session: { id: string; device: string }) => string
  twoFactor?: SettingsSecurityTwoFactor
}): void {
  const { methods, onMethodChange, methodToggleLabel, sessions, onRevokeSession, revokeLabel, twoFactor } = props

  if (onMethodChange !== undefined && methodToggleLabel === undefined) {
    throw new Error(
      'SettingsSecurity01: onMethodChange was passed with no methodToggleLabel, so every method control would ' +
        'be announced by the name of the method alone, which says what the control is and not what pressing it ' +
        'does. Pass the function.',
    )
  }

  if (onMethodChange === undefined && methodToggleLabel !== undefined) {
    throw new Error(
      'SettingsSecurity01: methodToggleLabel was passed with no onMethodChange, so the sentences would be ' +
        'composed and then discarded, which is a caller who believes they have named the controls on a ' +
        'surface that has none.',
    )
  }

  if (onRevokeSession !== undefined && revokeLabel === undefined) {
    throw new Error(
      'SettingsSecurity01: onRevokeSession was passed with no revokeLabel, so every control would be ' +
        'announced by the same word and a reader would be told which session to end by nothing. Pass the ' +
        'function that names the device.',
    )
  }

  if (onRevokeSession === undefined && revokeLabel !== undefined) {
    throw new Error(
      'SettingsSecurity01: revokeLabel was passed with no onRevokeSession, so the sentences would be composed ' +
        'and then discarded, which is a caller who believes they have named the controls on a surface that has ' +
        'none.',
    )
  }

  for (const method of methods) {
    if (method.stateLabel === undefined || method.stateLabel.trim() === '') {
      throw new Error(
        `SettingsSecurity01: the method ${JSON.stringify(method.name)} declares a state and no words for it, ` +
          'so the row would be a coloured dot with nothing to read beside it, on the one page where a reader ' +
          'is most entitled to an answer. Pass stateLabel.',
      )
    }
  }

  for (const session of sessions ?? []) {
    if (session.isCurrent === true && (session.currentLabel === undefined || session.currentLabel.trim() === '')) {
      throw new Error(
        `SettingsSecurity01: the session on ${JSON.stringify(session.device)} is marked isCurrent and passed ` +
          'no currentLabel, so the row the Block has decided is the reader own would be marked by nothing a ' +
          'reader can see. Pass the words that say so.',
      )
    }
  }

  if (twoFactor !== undefined && (twoFactor.stateLabel === undefined || twoFactor.stateLabel.trim() === '')) {
    throw new Error(
      'SettingsSecurity01: a second factor was passed with no stateLabel, so the row would be a coloured dot ' +
        'about the most load-bearing control on the page. Pass the words.',
    )
  }
}

/**
 * The security surface of a workspace: the ways in, the form that changes the one
 * secret a reader is most likely to have forgotten, the places it is signed in
 * from, and whether there is a second factor.
 *
 * **A settings surface is where a design system's care is most visible and least
 * appreciated, and this is the one where the stakes of a small mistake are
 * highest.** The reader came to change one thing and leave. They came because
 * something worried them: a login they do not recognise, a device they do not
 * own, a warning they read somewhere else. They are not reading this page, they
 * are checking it, and the two or three questions they arrived with are answered
 * somewhere in it. Everything below is arranged so that those questions are
 * answerable without reading anything twice and without finding that the page
 * moved while they were on it.
 *
 * **The reveal control is on the new password and the confirmation, and not on
 * the current one, and the reason is what each field is for.** A reader retyping
 * a password they have just chosen needs to see the characters, because they are
 * checking their own memory of what they typed and the failure they are guarding
 * against is a single wrong character in a string they cannot read. A reader
 * typing the password they set six months ago is doing the opposite: they are
 * proving they know a secret, and a reveal control on that field turns the proof
 * into a lookup. Put it there and the field stops being a check, it becomes a
 * read, and a password change is exactly the moment at which an observer over a
 * reader's shoulder is most likely to be looking. The arrangement also matches
 * what the platform already knows: the current field is the one a password manager
 * can fill, and the other two are the ones it must offer to save.
 *
 * **A method that is pending draws no control, because a half-finished setup is
 * not a setting that is on.** The three states are not a boolean with an extra
 * case, and a switch drawn on a pending method would be a control offering to turn
 * off something that was never on, in a panel whose whole job is to tell a reader
 * what is protecting their account. A pending method is a device that asked to be
 * added and has not been confirmed, and the only honest thing to draw beside it
 * is the caller's words about that, and the reader's own control for finishing it.
 *
 * **The revoke control is offered on the session the reader is in, and that is the
 * decision most likely to be got wrong.** Every instinct on a security page is to
 * withhold the dangerous control from the row the reader is sitting on, and the
 * instinct is wrong for a reason that has nothing to do with the interface: a
 * reader who wants to end the session they are in is a reader who will find
 * another way. They will ask an administrator, or they will sign out everywhere and
 * guess, or they will simply carry on, and the third is the common one and the one
 * that leaves the thing they were worried about open. Withholding the control does
 * not remove the wish, it removes the honest route to it, and what it leaves behind
 * is a support ticket and a still-open session. So the control is drawn on every
 * row, and the mark on the reader's own row says which one they are in, so the
 * consequence is legible rather than surprising. What the Block does not do is
 * confirm: a bare click that signs the reader out of the page they are reading is
 * not a confirmation, and the caller's `revoke` slot is where that belongs.
 *
 * **The three entries are handed over together whatever the form contains, and the
 * form holds them only long enough to hand them over.** A caller who renders two
 * fields receives a `confirm` of the empty string rather than `undefined`, because
 * a value that is sometimes a string and sometimes absent is a value every caller
 * has to narrow before it can use, and a password is not a value to narrow. The
 * Block clears the three entries when the caller's status becomes `done`, which is
 * the one piece of state it keeps about them, and that is a decision rather than an
 * omission: a new password sitting in a form on a page about the reader's security
 * is a worse thing than a caller who wanted to keep it, and the caller's `status`
 * prop is exactly where the truth about the change lives.
 *
 * **The second factor has three states, and the third is the one a two-state
 * surface cannot give.** A secret has been generated and the reader has not
 * confirmed it, so the account is neither protected nor unprotected, and a surface
 * offering only on and off makes a consumer draw an enrolled account as one of the
 * two, which is either a false claim of protection or a false claim of exposure.
 * The tone for it is `info` and for an off factor `neutral`, because turning a
 * second factor off is a decision a reader is allowed to make on an account they
 * control, and a page that alarms about it is a page that nags about something
 * legal.
 *
 * **The four group names are optional, and the reason is that a group with no name
 * is not a mystery.** A caller who names a group gets a real heading one level
 * below the section's own, and a caller who names none gets a section of rows
 * under the section heading, which is the right arrangement for the common case of
 * a product with one group and no second factor. The alternative, four required
 * names, is four sentences a consumer writes for a page they may not have: a
 * product with no second factor would have to name that group's heading to satisfy
 * a type, and the name would then sit in their source describing something they do
 * not render. The cost is stated rather than hidden: a Block with four groups and
 * no names is four lists under one heading, and a reader navigating by heading
 * finds one entry where there are four regions. That is the caller's arrangement
 * to make and easy to correct by passing four words.
 *
 * It is a client Component, and the directive is unconditional: the form holds
 * state, the controls attach handlers, and a surface that owns either owns the
 * JavaScript that carries it.
 */
export function SettingsSecurity01({
  eyebrow,
  title,
  description,
  labels,
  methods,
  onMethodChange,
  methodToggleLabel,
  changePassword,
  sessions,
  onRevokeSession,
  revokeLabel,
  twoFactor,
  empty,
  headingLevel = 'h2',
  className,
}: SettingsSecurity01Props) {
  assertProps({ methods, onMethodChange, methodToggleLabel, sessions, onRevokeSession, revokeLabel, twoFactor })

  // Every group is a group inside the section, so every group title is one level
  // below the section's own heading and travels with it.
  const GroupTitle = childLevel(headingLevel)
  const groups = labels ?? {}

  // The form's three entries, and the two pieces of render-time state that let the
  // Block clear them when the caller's status says the change was accepted. Both
  // are adjusted during render rather than in an effect because the trigger is a
  // prop changing and this is the arrangement React documents for it: a set during
  // render is applied before the browser paints, so the reader never sees the new
  // password sitting in the form for a frame after it has been changed.
  const [passwords, setPasswords] = useState<Passwords>(EMPTY_PASSWORDS)
  const [lastStatus, setLastStatus] = useState(changePassword?.status?.state)
  const statusState = changePassword?.status?.state
  if (statusState !== lastStatus) {
    setLastStatus(statusState)
    if (statusState === 'done') setPasswords(EMPTY_PASSWORDS)
  }

  const setPassword = (key: keyof Passwords) => (value: string) =>
    setPasswords((was) => ({ ...was, [key]: value }))

  if (methods.length === 0) {
    return (
      <Section className={className} data-slot="settings-security">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <p data-slot="settings-security-empty" className="text-muted-foreground text-pretty text-sm">
          {empty}
        </p>
      </Section>
    )
  }

  return (
    <Section className={className} data-slot="settings-security">
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="settings-security-groups" className="flex flex-col gap-10">
        <section data-slot="settings-security-methods" className="flex flex-col gap-4">
          {groups.methods === undefined ? null : (
            <GroupTitle
              data-slot="settings-security-group-title"
              className="text-lg font-semibold tracking-tight"
            >
              {groups.methods}
            </GroupTitle>
          )}

          <ul data-slot="settings-security-method-rows" className="border-border flex flex-col border-t">
            {methods.map((method) => {
              const controlId = `${method.id}-method`
              const pending = method.state === 'pending'
              const live = method.state === 'enabled'

              return (
                <li
                  key={method.id}
                  data-slot="settings-security-method"
                  data-method={method.id}
                  data-state={method.state}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-3 py-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <Field>
                      <FieldLabel htmlFor={controlId} className="text-base">
                        {method.name}
                      </FieldLabel>
                      {method.detail === undefined ? null : (
                        <FieldDescription>{method.detail}</FieldDescription>
                      )}
                    </Field>
                    {method.addedLabel === undefined ? null : (
                      <span
                        data-slot="settings-security-method-added"
                        className="text-muted-foreground text-xs"
                      >
                        {method.addedLabel}
                      </span>
                    )}
                  </div>

                  <Status
                    data-slot="settings-security-method-state"
                    size="sm"
                    tone={METHOD_TONE[method.state]}
                    label={method.stateLabel}
                    className="shrink-0"
                  />

                  {/*
                    The control, drawn on the two states that are genuinely binary
                    and withheld on the third, for the reason the Block JSDoc gives: a
                    half-finished setup is not a setting that is on, and a switch drawn
                    on it offers to turn off something that was never on.
                  */}
                  {pending || onMethodChange === undefined || methodToggleLabel === undefined ? null : (
                    <Switch
                      data-slot="settings-security-method-toggle"
                      id={controlId}
                      checked={live}
                      aria-label={methodToggleLabel(method, !live)}
                      onCheckedChange={() => onMethodChange(method.id)}
                      className="shrink-0"
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {changePassword === undefined ? null : (
          <section data-slot="settings-security-password" className="flex flex-col gap-4">
            <Card className="gap-0">
              <CardHeader>
                {groups.password === undefined ? null : (
                  <CardTitle
                    as={GroupTitle}
                    data-slot="settings-security-group-title"
                    className="text-lg tracking-tight"
                  >
                    {groups.password}
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent>
                {/*
                  The form, and the three fields, and the one place in this Block
                  where the type of the field decides what is drawn. A `current`
                  field is a plain input and the other two are `PasswordField`, so
                  the reveal control is on the entry a reader is about to retype and
                  not on the one they are proving they know. See the Block JSDoc.
                */}
                <form
                  data-slot="settings-security-password-form"
                  onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault()
                    changePassword.onSubmit(passwords)
                  }}
                >
                  <div className="flex flex-col gap-5">
                    {changePassword.fields.map((field) => {
                      const controlId = `${field.id}-password`

                      if (field.type === 'current') {
                        return (
                          <Field key={field.id}>
                            <FieldLabel htmlFor={controlId}>{field.label}</FieldLabel>
                            <Input
                              id={controlId}
                              type="password"
                              autoComplete={field.autoComplete ?? DEFAULT_AUTO_COMPLETE.current}
                              value={passwords.current}
                              onChange={(event) => setPassword('current')(event.target.value)}
                            />
                          </Field>
                        )
                      }

                      const next = field.type === 'new' ? 'next' : 'confirm'
                      return (
                        <PasswordField
                          key={field.id}
                          value={passwords[next]}
                          onValueChange={setPassword(next)}
                          label={field.label}
                          revealLabel={changePassword.revealLabel}
                          hideLabel={changePassword.hideLabel}
                          autoComplete={field.autoComplete ?? DEFAULT_AUTO_COMPLETE[field.type]}
                        />
                      )
                    })}
                  </div>

                  {changePassword.status === undefined ? null : (
                    <p
                      data-slot="settings-security-password-status"
                      data-status={changePassword.status.state}
                      // `alert` for a failure and `status` for the rest, so a
                      // message about a change that did not happen is announced when
                      // it appears and a message that did is announced politely.
                      role={changePassword.status.state === 'error' ? 'alert' : 'status'}
                      className={cn(
                        'mt-5 text-pretty text-sm',
                        changePassword.status.state === 'error'
                          ? 'text-destructive font-medium'
                          : 'text-muted-foreground',
                      )}
                    >
                      {changePassword.status.message}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      data-slot="settings-security-password-submit"
                      disabled={statusState === 'sending'}
                    >
                      {changePassword.submitLabel}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>
        )}

        {sessions === undefined || sessions.length === 0 ? null : (
          <section data-slot="settings-security-sessions" className="flex flex-col gap-4">
            {groups.sessions === undefined ? null : (
              <GroupTitle
                data-slot="settings-security-group-title"
                className="text-lg font-semibold tracking-tight"
              >
                {groups.sessions}
              </GroupTitle>
            )}

            <ul data-slot="settings-security-session-rows" className="border-border flex flex-col border-t">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  data-slot="settings-security-session"
                  data-session={session.id}
                  data-current={session.isCurrent === true ? 'true' : undefined}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-3 py-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{session.device}</span>
                    <span className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 text-xs">
                      {session.location === undefined ? null : <span>{session.location}</span>}
                      {session.startedAt === undefined ? null : (
                        <span className="tabular-nums">
                          {session.startedAtLabel === undefined
                            ? session.startedAt
                            : session.startedAtLabel(session.startedAt)}
                        </span>
                      )}
                      {session.currentLabel === undefined ? null : (
                        <span data-slot="settings-security-session-current" className="font-medium">
                          {session.currentLabel}
                        </span>
                      )}
                    </span>
                  </div>

                  {/*
                    The revoke control, drawn on every row including the reader own,
                    for the reason the Block JSDoc gives at length: withholding it
                    from the row they are in does not remove the wish, it removes the
                    honest route to it.
                  */}
                  {session.revoke !== undefined ? (
                    <span data-slot="settings-security-session-revoke" className="shrink-0">
                      {session.revoke}
                    </span>
                  ) : onRevokeSession !== undefined && revokeLabel !== undefined ? (
                    <Button
                      data-slot="settings-security-session-revoke"
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onRevokeSession(session.id)}
                      className="shrink-0"
                    >
                      {revokeLabel({ id: session.id, device: session.device })}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {twoFactor === undefined ? null : (
          <section data-slot="settings-security-two-factor" className="flex flex-col gap-4">
            {groups.twoFactor === undefined ? null : (
              <GroupTitle
                data-slot="settings-security-group-title"
                className="text-lg font-semibold tracking-tight"
              >
                {groups.twoFactor}
              </GroupTitle>
            )}

            <div
              data-slot="settings-security-two-factor-row"
              data-state={twoFactor.state}
              className="border-border flex flex-wrap items-center gap-x-4 gap-y-3 border-y px-3 py-4"
            >
              <Status
                data-slot="settings-security-two-factor-state"
                size="md"
                tone={TWO_FACTOR_TONE[twoFactor.state]}
                label={twoFactor.stateLabel}
                className="min-w-0 flex-1"
              />

              {twoFactor.action === undefined ? null : (
                <span data-slot="settings-security-two-factor-action" className="shrink-0">
                  {twoFactor.action}
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </Section>
  )
}

export default SettingsSecurity01
