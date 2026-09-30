'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
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
 * The workspace the reader is being let into, named by the invitation.
 *
 * Required, and a name rather than an identifier, because the reader is being asked
 * to trust a stranger's description of a place and the name is the only part of that
 * they can check against something they already know.
 */
export type AcceptInvite01Workspace = {
  /** The workspace's own name, as the invitation named it. */
  name: string
  /**
   * Whatever else the caller's product wants to say about it.
   *
   * A node, because the honest second line in this position is a sentence with a
   * number in it, a plan, a sentence about who can see what, or a link to a document
   * that says what joining means. A caller who has to flatten theirs to a string
   * loses whichever of those they had.
   */
  detail?: ReactNode
}

/**
 * The role the invitation named, which is the only role on this screen.
 *
 * **The reader does not choose it and that is the point.** A role a reader picks for
 * themselves is a role they picked without reading what it allows, and the whole
 * purpose of an invitation is that somebody who can already see the workspace decided
 * what this person should get. The Block renders the name the invitation named and
 * offers no control, because a control here would be an invitation to a reader to
 * grant themselves more than they were offered.
 */
export type AcceptInvite01Role = {
  /** The role's name, as the caller's product writes it. */
  name: string
  /** What the role may do, in the caller's own words. */
  detail?: ReactNode
}

/**
 * Who sent the invitation, and the initials rule for the portrait.
 *
 * Optional because a machine sending an invitation is a real arrangement, but the
 * field is `name` and not `label` because the reader is being asked whether they know
 * this person: a sender identified only by an address is a sender the reader cannot
 * place, and a sender identified by a name is one they can ask about afterwards.
 */
export type AcceptInvite01Inviter = {
  /** The sender's name, and the identity the row is read by. */
  name: string
  /**
   * The portrait, with the name the initials come from.
   *
   * Omit it for a sender the caller has no photograph of, and the initials rule is
   * the one `AvatarGroup` applies and is repeated rather than imported; see that
   * Component for why the helper is not exported.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The name the initials come from. */
    name: string
  }
  /** When the invitation was sent, in the caller's own reading. */
  atLabel?: ReactNode
}

/**
 * The new secret, and the two sentences a reveal control has to be named with.
 *
 * **The three words cannot be defaulted, for the reason `PasswordField` argues at
 * length.** A reveal control that says one sentence in a product whose interface is
 * another language looks localised, because the icon is the same everywhere and the
 * half a screen reader user hears is the word this package would have invented.
 *
 * **`strength` is a function rather than a `strengthLabel` string for the reason
 * `ResetPassword01Secret` gives at length**: the honest reading of a secret's strength
 * changes as the reader types, and the Block draws whatever the function returns as a
 * `Meter` whose accessible name is the caller's own word for the grade.
 */
export type AcceptInvite01Secret = {
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
  /** A line under the control, replaced by `error` while the field is invalid. */
  description?: ReactNode
  /** What is wrong with the entry, in the destructive token and announced as it appears. */
  error?: ReactNode
  /** How strong the secret is, in the caller's own words and on a number. */
  strength?: (value: string) => { label: string; value: number }
}

/**
 * The second entry, and the caller's own sentence about whether the two agree.
 *
 * **There is no comparison here and no mismatch message, for the reason
 * `ResetPassword01Confirm` gives in full.** Whether two strings are equal is the
 * product's validation and the words beside a mismatch are its too.
 */
export type AcceptInvite01Confirm = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** The confirmation as the caller holds it. Refused without `onValueChange`. */
  value?: string
  /** Called with the confirmation as the reader changes it. */
  onValueChange?: (value: string) => void
  /** What is wrong with the confirmation, drawn in the destructive token. */
  error?: ReactNode
}

/**
 * The five things the reader's own answer can be, named after what they select rather
 * than after the field they fill.
 *
 * `declined` is a destination rather than a failure, and the Block treats it as one: a
 * reader who has said no has nothing left to decide on this screen, which is the same
 * position as having said yes.
 */
export type AcceptInvite01Outcome = 'idle' | 'working' | 'done' | 'declined' | 'error'

/**
 * The outcome of the reader's own answer, as this Block draws it.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: the sentence a credential surface gets wrong is the one it ships
 * itself.
 */
export type AcceptInvite01Status = {
  /** Which of the five the answer is in. Read by the Block for three things only. */
  state: AcceptInvite01Outcome
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The refusal, and it is required rather than optional.
 *
 * A pair and not a label and a handler separately, so there is no way to draw a
 * refusal with words that do nothing.
 */
export type AcceptInvite01Decline = {
  /** The words on the control that refuses the invitation. */
  label: string
  /** Called when the reader refuses. */
  onDecline: () => void
}

/**
 * The state this screen spends a real share of its life in.
 *
 * An invitation has a life like a reset link, and a reader who answers on the third
 * day is a reader whose address is now somebody else's problem. So the expiry is an
 * arm this Block draws rather than a refusal the caller's server returns after the
 * reader has typed a secret.
 */
export type AcceptInvite01Expired = {
  /** What the reader is told about the invitation they followed. */
  message: ReactNode
  /** The words on the control that asks for a new invitation. */
  requestLabel: string
  /** Called when the reader asks for a new invitation. */
  onRequest: () => void
}

/**
 * The props an AcceptInvite01 takes. Every string in this Block is one of them.
 */
export type AcceptInvite01Props = {
  /** The short line above the title, usually what kind of invitation this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a credential surface with no heading is a form in a page, and a
   * reader who has followed a link from a stranger is entitled to be told what is
   * being asked of them before they choose a secret.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /** The workspace being joined, as the invitation named it. */
  workspace: AcceptInvite01Workspace
  /** The role the invitation named. There is no control for it and there is not going to be one. */
  role: AcceptInvite01Role
  /** Who sent it, when they sent it, and their portrait if there is one. */
  invitedBy?: AcceptInvite01Inviter
  /**
   * Called with the secret, and with the confirmation when one was asked for.
   *
   * **Required, and the requirement is the whole of the Block's neutrality.** The
   * Block adds nobody to anything, verifies nothing and starts no session.
   */
  onSubmit: (value: { secret: string; confirm?: string }) => void
  /** The new secret, its reveal control's two names and the caller's strength note. */
  secret: AcceptInvite01Secret
  /** The second entry. Omit it and the screen asks for one secret, which is a real answer. */
  confirm?: AcceptInvite01Confirm
  /** The words on the control that accepts. */
  submitLabel: string
  /**
   * Whether the caller's request is in flight.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `submitting` is the controls and `status.state` is the outcome.
   */
  submitting?: boolean
  /**
   * The way out.
   *
   * **Required, and the requirement is the most important sentence in this file.** A
   * person invited to a workspace they do not want to be in must be able to say no, and
   * an invitation screen with only an accept is a screen that asks for a decision the
   * reader cannot refuse. See the Block's JSDoc for the whole of that argument.
   */
  decline: AcceptInvite01Decline
  /** The outcome of the reader's answer, drawn in a live region and announced. */
  status?: AcceptInvite01Status
  /** The state this invitation has expired in, which takes the form away. */
  expired?: AcceptInvite01Expired
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
 * The seven refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on the screen where a reader
 * is choosing whether to be let into somebody else's workspace.
 */
function assertAccept(input: {
  workspace: AcceptInvite01Workspace
  role: AcceptInvite01Role
  invitedBy: AcceptInvite01Inviter | undefined
  secret: AcceptInvite01Secret
  confirm: AcceptInvite01Confirm | undefined
  decline: AcceptInvite01Decline
  status: AcceptInvite01Status | undefined
  expired: AcceptInvite01Expired | undefined
}): void {
  const { workspace, role, invitedBy, secret, confirm, decline, status, expired } = input

  if (blank(workspace.name)) {
    throw new Error(
      'AcceptInvite01: the workspace declares no name, so the screen would ask a reader to set a secret for a ' +
        'place they cannot name, which is the one thing a reader agreeing to this needs to be able to check. ' +
        'Pass the name the invitation carried.',
    )
  }

  if (blank(role.name)) {
    throw new Error(
      'AcceptInvite01: the role declares no name, so the screen would ask a reader to accept access without ' +
        'saying what the access is. Pass the role the invitation named.',
    )
  }

  if (invitedBy !== undefined && blank(invitedBy.name)) {
    throw new Error(
      'AcceptInvite01: an inviter was passed with no name, so the row would be an empty circle of initials ' +
        'beside nothing, which is a sender the reader cannot place and cannot ask about afterwards. Pass the ' +
        'name or drop the inviter.',
    )
  }

  if (blank(secret.label) || blank(secret.revealLabel) || blank(secret.hideLabel)) {
    throw new Error(
      'AcceptInvite01: the secret field is missing one of its three words. A reveal control with no name is ' +
        'announced as a button, and it is the only control on this screen a keyboard reader reaches with Tab. ' +
        'Pass label, revealLabel and hideLabel in your own language.',
    )
  }

  if (secret.value !== undefined && secret.onValueChange === undefined) {
    throw new Error(
      'AcceptInvite01: secret.value was passed with no onValueChange, so the Block would hold a secret the ' +
        'caller has lost track of and cannot clear. Pass the pair, or neither.',
    )
  }

  if (confirm !== undefined) {
    if (blank(confirm.label)) {
      throw new Error(
        'AcceptInvite01: a confirmation field was passed with no label, so its control would be announced as a ' +
          'text field, which is the same name the secret field above it is announced by once the reveal control ' +
          'is out of the way. Pass the words your product uses for a repeated secret.',
      )
    }
    if (confirm.value !== undefined && confirm.onValueChange === undefined) {
      throw new Error(
        'AcceptInvite01: confirm.value was passed with no onValueChange, so the Block would hold a confirmation ' +
          'the caller cannot clear when a reader gives up on the form. Pass the pair, or neither.',
      )
    }
  }

  if (blank(decline.label)) {
    throw new Error(
      'AcceptInvite01: decline was passed with no words, so the screen would offer a refusal a screen reader ' +
        'announces as "button" and a voice control user cannot say out loud, on the one control standing between ' +
        'a reader and an obligation they did not ask for. Pass the sentence your product uses.',
    )
  }

  if (status !== undefined && expired !== undefined && status.state !== 'error') {
    throw new Error(
      'AcceptInvite01: an expired invitation was passed together with a status that is not a refusal, so the ' +
        'screen would show the reader a confirmation beside an arm saying the invitation is dead. Draw one or ' +
        'the other.',
    )
  }
}

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a single
 * word. It is the same rule `AvatarGroup` applies, repeated rather than imported, and
 * the boundary is the reason: that helper is private to its module and exporting it
 * would make a private derivation part of a published surface to save six lines in a
 * Block. The cost is stated rather than hidden: two modules carry the rule, so a
 * change to it is a change in both.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * What is being joined, in what role, at whose invitation, and a secret with a way to
 * refuse.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes an accept-invitation screen: the shop's name, what the reader
 * will get, who sent it, a password with an eye beside it and one button, and its
 * purpose is to put a shopper into a checkout that already knows their cart. Prism's
 * products observe a pipeline, capture a market, watch an estate and run agents, and a
 * machine acting on behalf of a person is the whole subject, so this is the screen
 * where a person lets a machine act on their behalf and sets the secret that will
 * authorise it. The composition is the storefront's and is unchanged: the place, the
 * role, the sender, the secret, the control. What is different is the second control,
 * and the assumptions underneath, and both are set out below.
 *
 * **What it assumes about the reader in front of it, because this is the screen where
 * assuming wrongly does the most damage.** It assumes they followed a link somebody
 * else sent them, that they may not know the workspace exists, and that they may have
 * arrived in a hurry. It refuses to assume they want to be there, that they have read
 * what the role allows, and that they are going to read anything at all before they
 * press the button. The refusal control exists because of the second and the third of
 * those, and the next paragraph is why it is required rather than offered.
 *
 * **The `decline` control is required and it sits beside the acceptance, and that is
 * the most important decision in this file.** A person invited to a workspace they do
 * not want to be in must be able to say no. An invitation screen with only an accept
 * is a screen that asks for a decision the reader cannot refuse: the only way out of
 * it is to abandon the tab, and an abandoned tab leaves an invitation the sender is
 * still waiting on and a reader who never learned whether saying no would have been
 * easy. Making the control required moves the question to the caller, where it is
 * answerable, and a type that requires it is a type that cannot be quietly dropped by
 * a wrapper. **A screen where the refusal sits beside the acceptance, at the same size
 * and in the same row, is the only version of this that is honest.** Not a link at the
 * foot of the page, which is where a design system puts the thing it is least sure
 * anybody will use, and not a control behind a menu, which is a control the reader has
 * to go looking for at the exact moment they have decided they want to leave. The
 * acceptance is filled and the refusal is outlined, because a screen with two identical
 * buttons is a screen where a reader has to read both to know which one is the trap,
 * and the two are otherwise the same size, in the same row, at the same distance from
 * the edges of the card.
 *
 * **The summary is three names with qualifiers and no labels above them, and the
 * reason is that the labels would be words this package would have to invent.** A
 * workspace summary whose rows are labelled Workspace and Role in English is three
 * sentences every consumer of this Block inherits, published by the corpus as this
 * design system's own voice, and a product whose product is called a Team and whose
 * roles are called Access would have to fight them. So the three rows are drawn the
 * way `SettingsMembers01` draws a member: the name on one line and the qualifier
 * under it in the muted ink. A caller who wants the terms named composes `FactList`
 * beside this Block, where the terms are its own.
 *
 * **What this Block does not decide, and these are the three the reader cannot check
 * for themselves.** It does not decide whether the invitation is still valid; it does
 * not decide whether the workspace has room; and it does not decide what the role may
 * do. All three are the product's, and all three are the caller's own facts about
 * their own tenancy. The `role` the Block renders is the one the invitation named and
 * not the one the reader chose, because there is no control here and there is not
 * going to be one: a role a reader picks for themselves is a role they picked without
 * reading what it allows. The consequence is that the reader is trusting the sender on
 * the strength of a name and a sentence, which is why the sender's name is drawn and
 * why the expiry is a first-class arm rather than a refusal the server returns later.
 *
 * **The expiry takes the form away.** An invitation has a life and a reader who
 * answers on the third day is a reader whose address is now somebody else's problem,
 * so the Block draws the caller's message and the caller's way to ask for a new
 * invitation instead of two fields the reader cannot use. The rejected alternative is
 * a form that renders regardless and refuses on submit, which wastes what the reader
 * typed and pushes the condition into the consumer's own error handling.
 *
 * **The two secret fields do not compare themselves**, for the reason
 * `ResetPassword01Confirm` gives: whether two entries match is the product's
 * validation and the words beside a mismatch are its too. `confirm` is optional here
 * rather than required, because a product whose secret is set elsewhere and verified
 * by an identity provider has one field and not two, and the Block does not ask for a
 * repetition the product does not use.
 *
 * **`autoComplete` is set to `new-password` here and that is the Block's one platform
 * decision.** `PasswordField` defaults to `current-password`, which is correct for a
 * sign-in and wrong for every other place a password appears, and the cost of getting
 * it wrong is an account the browser then refuses to offer to sign into. This screen
 * exists only to set a new secret, so the hint is not a caller fact here.
 *
 * It is a client Component, and the directive is unconditional. `onSubmit` and
 * `onDecline` are functions, a function is a piece of state, and state is a client
 * module: a server Component cannot hand an event handler to a `<button>`, so a caller
 * rendering this from a server Component gets a screen whose controls press and do
 * nothing. `PasswordField` needs the directive on its own account, so the cost of that
 * boundary is already paid either way.
 */
export function AcceptInvite01({
  eyebrow,
  title,
  description,
  workspace,
  role,
  invitedBy,
  onSubmit,
  secret,
  confirm,
  submitLabel,
  submitting = false,
  decline,
  status,
  expired,
  headingLevel = 'h2',
  className,
}: AcceptInvite01Props) {
  assertAccept({ workspace, role, invitedBy, secret, confirm, decline, status, expired })

  const generated = useId()
  const confirmId = `${generated}-confirm`
  const confirmErrorId = `${generated}-confirm-error`

  /*
   * The entries live here rather than only in the caller, for the same reason the rest
   * of this family holds its values: `PasswordField` is a controlled control because a
   * reveal toggle has to show and hide the same value, so the secret has to exist
   * before the reader types anything; and a value the caller cannot reach is a value
   * the caller cannot clear when a reader gives up. The Block reports every change to
   * the caller when one was asked for and adopts a `value` prop the moment it changes,
   * which is the arrangement React documents for a prop that can change under a
   * stateful child.
   */
  const [entries, setEntries] = useState({
    secret: secret.value ?? '',
    confirm: confirm?.value ?? '',
  })
  const [seen, setSeen] = useState({ secret: secret.value, confirm: confirm?.value })
  if (seen.secret !== secret.value || seen.confirm !== confirm?.value) {
    setSeen({ secret: secret.value, confirm: confirm?.value })
    setEntries({ secret: secret.value ?? '', confirm: confirm?.value ?? '' })
  }

  const setSecret = (value: string) => {
    setEntries((was) => ({ ...was, secret: value }))
    secret.onValueChange?.(value)
  }

  const setConfirm = (value: string) => {
    setEntries((was) => ({ ...was, confirm: value }))
    confirm?.onValueChange?.(value)
  }

  const working = submitting || status?.state === 'working'
  const reading = secret.strength === undefined || entries.secret === '' ? undefined : secret.strength(entries.secret)
  const settled = status?.state === 'done' || status?.state === 'declined'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      secret: entries.secret,
      ...(confirm === undefined ? null : { confirm: entries.confirm }),
    })
  }

  const outcome = (
    <LiveRegion
      data-slot="accept-invite-01-status"
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
    <Section data-slot="accept-invite-01" className={cn(className)}>
      <div data-slot="accept-invite-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <Card data-slot="accept-invite-01-card" className="max-w-measure-narrow gap-0 px-6">
          {/*
            What is being joined, above everything else and in every arm. It is drawn
            the way `SettingsMembers01` draws a member rather than as a labelled table,
            because the labels would be three sentences this package would have to
            write and every consumer would inherit.
          */}
          <div data-slot="accept-invite-01-summary" className="flex flex-col gap-3">
            <div data-slot="accept-invite-01-workspace" className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{workspace.name}</span>
              {workspace.detail === undefined ? null : (
                <span className="text-muted-foreground text-xs">{workspace.detail}</span>
              )}
            </div>

            {/*
              The role, drawn as words and with no control anywhere near it. The gap
              above the role is a rule rather than spacing, so a reader can see that the
              role is a separate fact from the workspace and not a second line of the
              same one.
            */}
            <div data-slot="accept-invite-01-role" className="border-border flex flex-col gap-0.5 border-t pt-3">
              <span className="text-sm font-medium">{role.name}</span>
              {role.detail === undefined ? null : (
                <span className="text-muted-foreground text-xs">{role.detail}</span>
              )}
            </div>

            {invitedBy === undefined ? null : (
              <div
                data-slot="accept-invite-01-inviter"
                className="border-border flex items-center gap-3 border-t pt-3"
              >
                <Avatar className="size-7">
                  {invitedBy.avatar?.src === undefined ? null : (
                    <AvatarImage src={invitedBy.avatar.src} alt="" />
                  )}
                  <AvatarFallback className="text-mono">
                    {initialsOf(invitedBy.avatar?.name ?? invitedBy.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{invitedBy.name}</span>
                  {invitedBy.atLabel === undefined ? null : (
                    <span className="text-muted-foreground text-xs">{invitedBy.atLabel}</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {expired === undefined ? (
            settled ? (
              /*
               * The reader has answered, either way. The secret and the controls are
               * gone in both arms because there is nothing left to decide on this
               * screen, and a reader who has said no does not get to keep being asked
               * by a form that no longer has a question.
               */
              <div data-slot="accept-invite-01-settled" className="flex w-full flex-col gap-4">
                <p data-slot="accept-invite-01-settled-message" className="text-sm text-pretty">
                  {status?.message}
                </p>
              </div>
            ) : (
              <form
                data-slot="accept-invite-01-form"
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-5"
              >
                <div data-slot="accept-invite-01-secret" className="flex flex-col gap-2.5">
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

                  {reading === undefined ? null : (
                    <Meter
                      data-slot="accept-invite-01-strength"
                      label={reading.label}
                      value={reading.value}
                    />
                  )}
                </div>

                {confirm === undefined ? null : (
                  <Field data-slot="accept-invite-01-confirm" data-field="confirm">
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
                )}

                <div data-slot="accept-invite-01-actions" className="flex flex-col gap-3">
                  {/*
                    The two decisions, in one row and at the same size, and that is the
                    whole argument for the refusal being required. The acceptance is
                    filled because two identical buttons would make a reader read both
                    to work out which one is the trap; the refusal is outlined, the
                    same size, in the same row, at the same distance from the edges of
                    the card. Nothing here is at the foot of the page behind a rule.
                  */}
                  <div data-slot="accept-invite-01-decisions" className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      data-slot="accept-invite-01-submit"
                      type="submit"
                      disabled={working}
                      className="w-full sm:flex-1"
                    >
                      {submitLabel}
                    </Button>

                    <Button
                      data-slot="accept-invite-01-decline"
                      type="button"
                      variant="outline"
                      onClick={() => decline.onDecline()}
                      disabled={working}
                      className="w-full sm:flex-1"
                    >
                      {decline.label}
                    </Button>
                  </div>

                  {outcome}
                </div>
              </form>
            )
          ) : (
            <div data-slot="accept-invite-01-expired" className="flex w-full flex-col gap-4">
              <p data-slot="accept-invite-01-expired-message" className="text-sm text-pretty">
                {expired.message}
              </p>

              <Button
                data-slot="accept-invite-01-request"
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

export default AcceptInvite01
