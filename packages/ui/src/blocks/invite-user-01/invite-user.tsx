'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { ListPanel } from '../../components/ui/list-panel'
import { LiveRegion } from '../../components/ui/live-region'
import { NativeSelect } from '../../components/ui/native-select'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Textarea } from '../../components/ui/textarea'
import { cn } from '../../lib/utils'

/**
 * The address field, and the caller's own sentence about what is wrong with it.
 *
 * **There is no `type` here and that is the decision.** An invitation goes to an
 * address and an address is an address, but a product that invites by handle or by
 * staff number needs the same labelled control with a different platform hint, and a
 * `type` prop on an invitation field would be a Block claiming to know which. The
 * caller composes a different control beside this one if that is what their product
 * does.
 */
export type InviteUser01Identifier = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** The address as the caller holds it. Refused without `onValueChange`. */
  value?: string
  /** Called with the address as the reader changes it. */
  onValueChange?: (value: string) => void
  /** A line under the control, announced with it rather than printed under the row. */
  description?: ReactNode
  /** What is wrong with the entry, in the destructive token and announced as it appears. */
  error?: ReactNode
}

/**
 * One role an invitation can grant, as the caller names it.
 *
 * Two fields and no state, which is the whole of the argument a design system can
 * make about somebody else's permission model: the set of roles a workspace has is
 * that workspace's own fact, it changes with its plan and with its commercial
 * agreements, and a Block that shipped a list would install a permission model into
 * every consumer's settings page.
 */
export type InviteUser01Option = {
  /** The value handed to `onSubmit` and to `role.onValueChange`. */
  id: string
  /** The role's own name, in the product's own language. */
  label: string
}

/**
 * The role the invitation will grant.
 *
 * **`options` is a `readonly` array and that is not decoration.** A caller writes
 * `const ROLES = [{ id: 'reader', label: 'Reader' }] as const` because it keeps the
 * role list beside its own type definitions, and a mutable prop type rejects that
 * fixture with an error about `readonly`, which is a compile error whose message
 * names nothing about the caller. Two Blocks in this package shipped that class of
 * error before the list was written as `readonly`, so the type here is the fix rather
 * than a preference.
 */
export type InviteUser01Role = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /**
   * The roles, in the order a reader should meet them.
   *
   * The Block draws a `NativeSelect` rather than the Base UI one because a role is a
   * plain string with a plain name, and a native select is one element with the
   * platform's own picker behind it. A role that needs a description beside it or a
   * count in it is a control the platform cannot render, and the honest answer to
   * that is a caller who composes their own.
   */
  options: readonly InviteUser01Option[]
  /** The role as the caller holds it. Falls back to the first option. */
  value?: string
  /** Called with the role as the reader changes it. */
  onValueChange?: (value: string) => void
  /** A line under the control, announced with it. */
  description?: ReactNode
}

/** What the caller writes to the person they are inviting, and the two numbers around it. */
type InviteUser01MessageBase = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** The message as the caller holds it. Refused without `onValueChange`. */
  value?: string
  /** Called with the message as the reader changes it. */
  onValueChange?: (value: string) => void
  /** A line under the control, announced with it. */
  description?: ReactNode
}

/**
 * The note that travels with the invitation.
 *
 * **The counter is a union rather than an optional boolean because a count with no
 * limit beside it is not a counter.** A reader who is told there are 400 characters
 * written and not what the limit is has been given a number to act on with nothing to
 * act against, so `maxLength` is required in the arm that draws the count and the two
 * are drawn together. The cost is stated rather than hidden: a caller that wants a
 * live count and an enforced limit has to set both, which is the arrangement it
 * wanted.
 */
export type InviteUser01Message = InviteUser01MessageBase &
  (
    | {
        /** Draws the count beside the control. */
        counter: true
        /** The limit, enforced by the control and printed beside the count. */
        maxLength: number
      }
    | {
        /** No count is drawn. */
        counter?: false
        /** The limit, enforced by the control and printed by the platform. */
        maxLength?: number
      }
  )

/**
 * The three things the caller's own invitation request can be doing, named after what
 * they select rather than after the field they fill.
 */
export type InviteUser01Outcome = 'idle' | 'sent' | 'error'

/**
 * The outcome of the caller's request, as this Block draws it.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: an invitation has more outcomes than any other form here, from a
 * delivered message to a spam folder to a domain that cannot receive mail to a
 * workspace with no room for another person, and one sentence cannot be true of all
 * of them.
 */
export type InviteUser01Status = {
  /** Which of the three the request is in. Read by the Block for two things only. */
  state: InviteUser01Outcome
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * One invitation that has been sent and not yet taken up.
 *
 * Four words and no state, which is the decision this Block's JSDoc defends: the only
 * signal that an invitation has gone stale is that the caller passed `expiresLabel`,
 * because the Block holds no clock and a design system that guessed would be guessing
 * about somebody else's deadline.
 */
export type InviteUser01Invitation = {
  /** A stable key for the row, carried on the markup as `data-invitation`. */
  id: string
  /** The address the invitation went to, and the row's identity. */
  identifier: string
  /** The words for when it went, given in the caller's own reading. */
  sentLabel?: ReactNode
  /**
   * The words for an invitation that has gone stale.
   *
   * Its presence is the mark: the row is dimmed, the words are read beside the
   * address, and the invitation is not removed from the list. See the Block's JSDoc
   * for why a list that shrinks is worse than a list with a faded row.
   */
  expiresLabel?: ReactNode
} & (
  | {
      /** The words on the control that calls the invitation back. */
      revokeLabel: string
      /** Called when the reader calls this invitation back. */
      onRevoke: () => void
    }
  | {
      /** A revoke control with no words is a button nobody can find. */
      revokeLabel?: never
      /** A handler with no control is a call the caller cannot make. */
      onRevoke?: never
    }
)

/**
 * The invitations already sent, under a name of the caller's.
 *
 * `empty` is required in practice and its absence is a thrown diagnostic rather than
 * a quiet panel, for the reason `SettingsMembers01` gives for the same prop: a group
 * with no rows and no sentence reads as a fault, and the reader who is trying to work
 * out whether an invitation they sent is still pending is exactly the reader who
 * needs to be able to see that the list is not broken.
 */
export type InviteUser01Pending = {
  /** The name of the group, drawn as a heading one level below the section's own. */
  title: ReactNode
  /**
   * The invitations, in the order a reader should meet them.
   *
   * The Block does not sort them: which invitations a reader should see first is a
   * fact about the caller's product, and a designer sorting a list on their behalf is
   * an opinion about somebody else's workspace.
   */
  items: readonly InviteUser01Invitation[]
  /** What the group shows when there are no invitations. */
  empty?: ReactNode
}

/**
 * The props an InviteUser01 takes. Every string in this Block is one of them.
 *
 * Two groups and one control between them, and the second group is the reason this
 * is a Block rather than a row in somebody's settings form.
 */
export type InviteUser01Props = {
  /** The short line above the title, usually which workspace this is. */
  eyebrow?: ReactNode
  /** The heading. Required, because an invitation surface with no heading is a form in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * Called with the three values, and the only thing this Block does with them.
   *
   * **Required, and the requirement is the whole of the Block's neutrality.** There is
   * no transport, no route, no membership store and no role resolver here, because
   * each of those is a decision about the caller's product and its data.
   */
  onSubmit: (value: { identifier: string; role: string; message?: string }) => void
  /** The address field. */
  identifier: InviteUser01Identifier
  /** The role the invitation will grant, from the caller's own list. */
  role: InviteUser01Role
  /**
   * The note that travels with the invitation.
   *
   * Omit it and the note is not asked for, which is a real answer for a product that
   * sends its own boilerplate and a poor one for a product whose invitations are read
   * by the people who receive them.
   */
  message?: InviteUser01Message
  /** The words on the one control that sends. */
  submitLabel: string
  /**
   * Whether the caller's request is in flight.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `submitting` is the control and `status.state` is the outcome.
   */
  submitting?: boolean
  /** The outcome of the caller's request, drawn in a live region and announced. */
  status?: InviteUser01Status
  /**
   * The invitations already sent, in a second group beside the form.
   *
   * See the Block's JSDoc for why this is a group and not a second form.
   */
  pending?: InviteUser01Pending
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
 * The six refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on a screen where a reader
 * is about to give a colleague access to an instrument.
 */
function assertInvite(input: {
  identifier: InviteUser01Identifier
  role: InviteUser01Role
  message: InviteUser01Message | undefined
  pending: InviteUser01Pending | undefined
}): void {
  const { identifier, role, message, pending } = input

  if (blank(identifier.label)) {
    throw new Error(
      'InviteUser01: the identifier field declares no label, so its control would be announced as a text field, ' +
        'which is the same name every other field on this screen is announced by. Pass the words your product uses ' +
        'for the person being invited.',
    )
  }

  if (identifier.value !== undefined && identifier.onValueChange === undefined) {
    throw new Error(
      'InviteUser01: identifier.value was passed with no onValueChange, so the field would show the value once ' +
        'and then stop telling the caller what is in it, which is an address the caller cannot clear when a ' +
        'reader changes their mind. Pass the pair, or neither.',
    )
  }

  if (blank(role.label)) {
    throw new Error(
      'InviteUser01: the role field declares no label, so its control would be announced as a button, which is ' +
        'the one control on this screen that grants access. Pass the words your product uses for the set of ' +
        'roles.',
    )
  }

  if (role.options.length === 0) {
    throw new Error(
      'InviteUser01: the role field passes no options, so it would render a control with nothing in it, which ' +
        'is a question no reader can answer and looks answered only because the control is there and focusable. ' +
        'Pass the roles, or drop the field and grant your own default in the handler.',
    )
  }

  if (role.options.some((option) => blank(option.label))) {
    throw new Error(
      'InviteUser01: one of the role options declares no label, so the select would show a bare machine value ' +
        'where a reader is choosing what access they are about to grant. Pass the words your product uses.',
    )
  }

  if (message !== undefined) {
    if (blank(message.label)) {
      throw new Error(
        'InviteUser01: a message field was passed with no label, so its control would be announced as a text ' +
          'area with no name. Pass the words your product uses for the note.',
      )
    }
    if (message.value !== undefined && message.onValueChange === undefined) {
      throw new Error(
        'InviteUser01: message.value was passed with no onValueChange, so the Block would hold a note the ' +
          'caller has lost track of and cannot clear. Pass the pair, or neither.',
      )
    }
  }

  if (pending === undefined) return

  if (pending.items.length === 0 && pending.empty === undefined) {
    throw new Error(
      'InviteUser01: the pending group was passed with no items and no sentence for the empty case, so the ' +
        'screen would show a named panel with nothing in it, which reads as a fault rather than as an answer. ' +
        'Pass the sentence your product uses when nobody is invited.',
    )
  }

  for (const item of pending.items) {
    if (blank(item.identifier)) {
      throw new Error(
        `InviteUser01: the pending invitation ${JSON.stringify(item.id)} declares no address, so the row would ` +
          'be an empty line in a list a reader is scanning to find their own invitation. Pass the address it ' +
          'went to.',
      )
    }
    if (
      (item.revokeLabel === undefined) !== (item.onRevoke === undefined) ||
      (item.onRevoke !== undefined && blank(item.revokeLabel))
    ) {
      throw new Error(
        `InviteUser01: the pending invitation ${JSON.stringify(item.id)} was passed one half of its revoke ` +
          'control, so the row would either offer a button that does nothing or call a handler no control can ' +
          'reach. Pass revokeLabel and onRevoke together, or neither.',
      )
    }
  }
}

/**
 * An address, a role and a note, sent as an invitation, beside the invitations already
 * sent.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes an invite-a-friend panel: an address field, a dropdown, a
 * message box and a button, and its purpose is to put a shopper's own contact into a
 * marketing list. Prism's products observe a pipeline, capture a market, watch an
 * estate and run agents, and a machine acting on behalf of a person is the whole
 * subject, so this is the screen where a person authorises a machine on somebody
 * else's behalf: the machine is the workspace, the estate or the agent, and the person
 * answering the invitation is about to decide what it is allowed to do. The
 * composition is the storefront's and is unchanged: the field, the dropdown, the note,
 * the control. What is different is the second group, and that is the next paragraph.
 *
 * **What it assumes about the reader in front of it.** It assumes they are already
 * authorised themselves, that they know what the thing they are admitting to is, and
 * that they may not know what the roles in the dropdown are called. It refuses to
 * assume they will remember what they sent, and it refuses to assume they have sent
 * it at all, which is the assumption the pending group exists to remove.
 *
 * **The pending list is a second group and not a second form, and the reason is a
 * support ticket.** A reader who has just sent an invitation and cannot see it will
 * send another, and a second invitation is not a harmless duplicate: it is a second
 * message, a second row in the caller's own audit trail, and a second thing for the
 * person receiving it to work out. So the invitations already sent are drawn, named,
 * and given their own heading rather than being summarised in a sentence under the
 * submit control, and a list that shrank silently is a list a reader stops trusting.
 *
 * **A stale invitation is dimmed and not removed, and the only signal is the caller's
 * own `expiresLabel`.** The Block holds no clock and a design system that guessed
 * would be guessing about somebody else's deadline. The reason for keeping the row is
 * the reason `SettingsMembers01` gives for a closed role: a reader who sent an
 * invitation and finds it gone learns nothing at all, because the absence is
 * indistinguishable from a fault and from a product that quietly discards invitations.
 *
 * **The role list is the caller's, and the `readonly` on it is the fix for a compile
 * error rather than a preference.** A caller writes its roles as `as const` beside its
 * own types, and a mutable prop type rejects that fixture with a message about
 * `readonly` that names nothing about the caller. What the Block refuses to do is
 * ship the list, because the set of roles a workspace has is that workspace's own fact
 * and it changes with its plan and with its commercial agreements.
 *
 * **The select starts on the caller's first option when no value is passed, and the
 * Block does not reorder the list to pick a safer one.** Reordering somebody's roles
 * would be a claim about their permission model, and the alternative, requiring
 * `value`, would put a prop on the type that most callers do not have and would want
 * anyway. A product whose least privileged role is not first passes it first. The cost
 * is that a caller who forgets `value` grants whatever is at the top of their own
 * list, and the honest place to catch that is their own handler, which already has to
 * validate the address.
 *
 * **The counter is not a live region, and that is a decision about a reader typing.**
 * A count that announces itself on every keystroke interrupts a screen reader
 * mid-sentence four hundred times, and the limit is already enforced by the control's
 * own `maxLength` and described by the platform. So the count is drawn and hidden from
 * assistive technology, and a reader who wants it announced as they type reads it.
 *
 * **Nothing here validates anything.** There is no address format check, no rule about
 * whether the address is already a member, no check that the role exists any more and
 * no decision about whether the workspace has room. Each of those is a fact about the
 * caller's product, and a Block that guessed one would refuse a reader on the
 * caller's behalf. What the Block does with the request is the one thing that is
 * rendering rather than policy: it refuses a second press while `submitting` is true,
 * because a second press is a second invitation queued into somebody's inbox.
 *
 * It is a client Component, and the directive is unconditional. `onSubmit` is a
 * function, a function is a piece of state, and state is a client module: a server
 * Component cannot hand an event handler to a `<form>`, so a caller rendering this
 * from a server Component gets a form that submits and calls nothing and a list whose
 * revoke controls press and do nothing.
 */
export function InviteUser01({
  eyebrow,
  title,
  description,
  onSubmit,
  identifier,
  role,
  message,
  submitLabel,
  submitting = false,
  status,
  pending,
  headingLevel = 'h2',
  className,
}: InviteUser01Props) {
  assertInvite({ identifier, role, message, pending })

  const generated = useId()
  const identifierId = `${generated}-identifier`
  const identifierErrorId = `${generated}-identifier-error`
  const identifierDescriptionId = `${generated}-identifier-description`
  const roleId = `${generated}-role`
  const roleDescriptionId = `${generated}-role-description`
  const messageId = `${generated}-message`
  const messageDescriptionId = `${generated}-message-description`

  // The group holding the invitations already sent is a group inside the section, so
  // its title is one level below the section's own and travels with it.
  const GroupTitle = childLevel(headingLevel)

  /*
   * The three entries live here rather than only in the caller, for the same reason
   * the rest of this family holds its values: a field the caller cannot reach is a
   * field the caller cannot clear, and a reader who has just discovered they
   * addressed the invitation to the wrong person should not have to reload the page to
   * correct it. The Block reports every change to the caller when one was asked for
   * and adopts a `value` prop the moment it changes, which is the arrangement React
   * documents for a prop that can change under a stateful child.
   */
  const [entries, setEntries] = useState({
    identifier: identifier.value ?? '',
    role: role.value ?? role.options[0]?.id ?? '',
    message: message?.value ?? '',
  })
  const [seen, setSeen] = useState({
    identifier: identifier.value,
    role: role.value,
    message: message?.value,
  })
  if (
    seen.identifier !== identifier.value ||
    seen.role !== role.value ||
    seen.message !== message?.value
  ) {
    setSeen({ identifier: identifier.value, role: role.value, message: message?.value })
    setEntries({
      identifier: identifier.value ?? '',
      role: role.value ?? role.options[0]?.id ?? '',
      message: message?.value ?? '',
    })
  }

  const setIdentifier = (value: string) => {
    setEntries((was) => ({ ...was, identifier: value }))
    identifier.onValueChange?.(value)
  }

  const setRole = (value: string) => {
    setEntries((was) => ({ ...was, role: value }))
    role.onValueChange?.(value)
  }

  const setMessage = (value: string) => {
    setEntries((was) => ({ ...was, message: value }))
    message?.onValueChange?.(value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      identifier: entries.identifier,
      role: entries.role,
      ...(message === undefined ? null : { message: entries.message }),
    })
  }

  return (
    <Section data-slot="invite-user-01" className={cn(className)}>
      <div data-slot="invite-user-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div
          data-slot="invite-user-01-columns"
          className="grid items-start gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14"
        >
          {/*
            The form in a `Card`, for the reason the rest of this family uses one: this
            is a place where the reader is looking at a form rather than at a product,
            and a form floating on the page ground has no edge to say so. The cap is
            the one piece of layout here, because a form at the full column width is a
            form with a very long row of text labels.
          */}
          <Card
            data-slot="invite-user-01-card"
            className="w-full max-w-measure-narrow gap-0 px-6"
          >
            <form
              data-slot="invite-user-01-form"
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-5"
            >
              <Field data-slot="invite-user-01-identifier" data-field="identifier">
                <FieldLabel htmlFor={identifierId}>{identifier.label}</FieldLabel>
                <Input
                  id={identifierId}
                  type="email"
                  autoComplete="off"
                  value={entries.identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                  aria-invalid={identifier.error === undefined ? undefined : true}
                  aria-describedby={
                    identifier.error === undefined
                      ? identifier.description === undefined
                        ? undefined
                        : identifierDescriptionId
                      : identifierErrorId
                  }
                />
                {identifier.error === undefined ? null : (
                  <FieldError id={identifierErrorId}>{identifier.error}</FieldError>
                )}
                {identifier.description === undefined ? null : (
                  <FieldDescription id={identifierDescriptionId}>
                    {identifier.description}
                  </FieldDescription>
                )}
              </Field>

              {/*
                The role, and it is a `NativeSelect` because a role is a plain string
                with a plain name and the platform's own picker is better on a phone
                than anything this package could draw. The hint is `off` rather than
                `email` because the value is a role, and a password manager has nothing
                useful to offer for one.
              */}
              <Field data-slot="invite-user-01-role" data-field="role">
                <FieldLabel htmlFor={roleId}>{role.label}</FieldLabel>
                <NativeSelect
                  id={roleId}
                  value={entries.role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                  aria-describedby={role.description === undefined ? undefined : roleDescriptionId}
                >
                  {role.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
                {role.description === undefined ? null : (
                  <FieldDescription id={roleDescriptionId}>{role.description}</FieldDescription>
                )}
              </Field>

              {message === undefined ? null : (
                /*
                  The note, and the count is drawn beside the control rather than under
                  it so a reader watching the limit sees it next to the thing they are
                  typing against.
                */
                <Field data-slot="invite-user-01-message" data-field="message">
                  <FieldLabel htmlFor={messageId}>{message.label}</FieldLabel>
                  <Textarea
                    id={messageId}
                    rows={4}
                    value={entries.message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={message.maxLength}
                    aria-describedby={
                      message.description === undefined ? undefined : messageDescriptionId
                    }
                  />
                  {message.counter !== true ? null : (
                    <span
                      data-slot="invite-user-01-counter"
                      aria-hidden="true"
                      className="text-muted-foreground self-end text-xs tabular-nums"
                    >
                      {entries.message.length} / {message.maxLength}
                    </span>
                  )}
                  {message.description === undefined ? null : (
                    <FieldDescription id={messageDescriptionId}>
                      {message.description}
                    </FieldDescription>
                  )}
                </Field>
              )}

              <div data-slot="invite-user-01-actions" className="flex flex-col gap-3">
                <Button
                  data-slot="invite-user-01-submit"
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitLabel}
                </Button>

                {/*
                  The outcome, and it renders nothing while there is no message.
                  `LiveRegion` draws no element at all for an empty child, so a form in
                  its resting state carries no live region rather than an empty one
                  announcing every unrelated change of its ancestors.
                */}
                <LiveRegion
                  data-slot="invite-user-01-status"
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
          </Card>

          {/*
            The invitations already sent, in their own bounded region rather than as a
            second form. A reader looking for an invitation they sent is not looking
            for a form, and putting the two in one arrangement is an arrangement whose
            halves have opposite lifetimes: one grows every time the control is
            pressed and the other only changes when the caller says so. The title is
            passed as an element rather than as a string so the group is a real heading
            at one level below the section and not a label element the outline skips.
          */}
          {pending === undefined ? null : (
            <ListPanel
              data-slot="invite-user-01-pending"
              scroll={false}
              title={
                <GroupTitle
                  data-slot="invite-user-01-pending-title"
                  className="text-sm font-semibold"
                >
                  {pending.title}
                </GroupTitle>
              }
            >
              {pending.items.length === 0 ? (
                <p
                  data-slot="invite-user-01-pending-empty"
                  className="text-muted-foreground px-4 py-3 text-pretty text-sm"
                >
                  {pending.empty}
                </p>
              ) : (
                <ul data-slot="invite-user-01-pending-list" className="flex flex-col">
                  {pending.items.map((item) => (
                    <li
                      key={item.id}
                      data-slot="invite-user-01-invitation"
                      data-invitation={item.id}
                      data-expired={item.expiresLabel === undefined ? undefined : 'true'}
                      className="border-border flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-3 last:border-b-0"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">{item.identifier}</span>

                      {item.sentLabel === undefined ? null : (
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {item.sentLabel}
                        </span>
                      )}

                      {item.expiresLabel === undefined ? null : (
                        <span
                          data-slot="invite-user-01-invitation-expired"
                          className="text-muted-foreground shrink-0 text-xs"
                        >
                          {item.expiresLabel}
                        </span>
                      )}

                      {item.revokeLabel === undefined ? null : (
                        <Button
                          data-slot="invite-user-01-revoke"
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => item.onRevoke?.()}
                          className="shrink-0"
                        >
                          {item.revokeLabel}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </ListPanel>
          )}
        </div>
      </div>
    </Section>
  )
}

export default InviteUser01
