'use client'

import type { FormEvent, ReactNode } from 'react'
import { useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { Field, FieldDescription, FieldError, FieldGroup } from '../../components/ui/field'
import { Label } from '../../components/ui/label'
import { LiveRegion } from '../../components/ui/live-region'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import {
  CHOICE_KINDS,
  fieldText,
  NEEDS_HIDDEN,
  renderControl,
  serialize,
  SELF_LABELLED,
  type FieldContext,
} from '../../lib/field-render'
import type { FieldKind, FieldSpec, FieldSpecGroup } from '../../lib/spec'
import { cn } from '../../lib/utils'

/**
 * One thing wrong with the form, in the caller's own words.
 *
 * `field` is the `key` of the field the message belongs to, and the key rather
 * than the label because it is what the caller's values and the form's own
 * `FormData` are keyed by: a message matched by a label's words breaks the moment
 * the label is translated. The shape is the one the dialog, the wizard and the
 * write form already publish, so this Block mints no fifth spelling of an issue.
 */
export type Contact01Issue = {
  /** The `key` of the field this message belongs to. */
  field: string
  /** The message, in the product's own words. */
  message: string
}

/**
 * Where a reader can reach a person, and the one address this Block links.
 *
 * **The `email` and `emailLabel` arms are a union, and the reason is the sentence
 * a screen reader would otherwise read.** A mailto link whose accessible name is
 * the address itself is announced as `mailto` and a run of characters read out
 * one at a time, which is the one link on the page no reader can follow and the
 * one a mouse reader cannot copy either. So a link is never drawn from a bare
 * address: `emailLabel` is the sentence that says what activating it does, and it
 * is required inside the arm where `email` is. The alternative was an optional
 * `emailLabel` beside an optional `email` and a fallback, and the fallback would
 * have been the address, which is the defect.
 */
export type Contact01Address = {
  /** The postal lines, one per entry, in the order a reader reads them. */
  lines: string[]
  /**
   * What a reader is told about the hours, if the caller has hours to state.
   *
   * A node rather than a string, because the honest content is a table on three of
   * the four consumer sites rather than a sentence, and a Block that accepted a
   * string would force the caller to flatten it.
   */
  hours?: ReactNode
} & (
  | {
      /** The address the mailto link points at. */
      email: string
      /** The words on the link, which is its accessible name. */
      emailLabel: string
    }
  | {
      /** No link, so no accessible name to owe. */
      email?: never
      emailLabel?: never
    }
)

/**
 * Everything the caller declared, keyed by the caller's own `id`.
 *
 * A record and not a fixed shape, and the reason is the same one that makes
 * `fields` a list: the keys are facts about the caller's product, so a named type
 * would be a claim about what a contact form is made of. The value type is `string`
 * because the five control types here all submit strings, and a contact form that
 * collects a file is a different Block.
 */
export type ContactValue = Record<string, string>

/**
 * The outcome of the caller's own request, as the Block draws it.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * wave states: a success sentence this package wrote would be inherited verbatim
 * by every consumer, and a contact request has more outcomes than any other form
 * here, from a delivered message to a spam folder to a rate limit to an address
 * that was never deliverable.
 */
export type Contact01Status = {
  /** Which of the four the request is in. Read by the Block for two things only. */
  state: 'idle' | 'sending' | 'sent' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/** The props a Contact01 takes. Every string in this Block is one of them. */
export type Contact01Props = {
  /** The short line above the title, usually what the desk is called. */
  eyebrow?: ReactNode
  /** The heading. Required, because a form with no heading is a form in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * Called with the declared fields' values when the reader submits.
   *
   * **Required, and the requirement is the design.** `onSubmit` is the only thing
   * this Block does with what it collected, and there is no arm of this component
   * in which a message is gathered and then nowhere to go. The obvious
   * alternative is an optional handler with a form that renders and does nothing,
   * which is a component that collects a personal datum, displays it back to the
   * reader and then discards it without telling anyone.
   */
  onSubmit: (value: ContactValue) => void
  /**
   * The fields, grouped and ordered, as the shared field specification.
   *
   * **Required, and this list is the whole design rather than a convenience.** A
   * contact form Component with a fixed set of fields is a Component that decides
   * what a reader may say, and the decision is invisible in a review because the
   * rendered form looks complete. It is also the decision that loses the message
   * a contact form was given: a form that cannot ask for an order number has to
   * be abandoned and retried through a support channel, a form that cannot ask for
   * a company size sends a one-line hello to a sales team that then spends a week
   * on discovery calls, and a form that cannot ask for a budget guarantees the
   * reply nobody wanted. The fields arrive as `FieldSpecGroup`, which is the same
   * type a record write form takes, so the vocabulary a consumer learns on one
   * screen is the vocabulary here, and a control this package does not ship is the
   * `slot` arm rather than a second Block. The cost is stated rather than hidden: a
   * consumer that wants a second column for a subset of its fields composes two
   * `Contact01`s or reaches for a `Page`, because this Block draws one column in
   * the order the list gives.
   */
  groups: readonly FieldSpecGroup[]
  /**
   * The issues to draw, keyed by field. Drawn under the control that owns them.
   *
   * An entry names a field's `key` and a message in the product's own words, and
   * a control's issue is drawn under that control. A message about the submission
   * rather than about a control is the caller's `status`, which names no field.
   */
  issues?: readonly Contact01Issue[]
  /** The label on the one control that submits. */
  submitLabel: string
  /**
   * What the reader is told happens to what they type.
   *
   * Optional here, and the difference from `Newsletter01` is the fact rather than
   * an inconsistency: a newsletter's consent line is about a marketing list and a
   * jurisdiction may require it to be there, while a contact form's disclosure is
   * about a reply, and most jurisdictions are satisfied by the caller's own footer
   * and by this Block's status sentence. A caller whose counsel asks for one
   * passes it, and it is drawn under the fields where the reader is about to press
   * the control rather than in a page they have already scrolled past.
   */
  consent?: ReactNode
  /** Where a reader can reach a person, drawn beside the form in the split layout. */
  address?: Contact01Address
  /**
   * Whether the address sits beside the form or under it.
   *
   * `split` is right where the address is a real destination rather than a
   * decoration, which is most of the time, and `stacked` is right on a narrow
   * page and wherever a reader on a phone would otherwise have to scroll past four
   * postal lines before reaching the field they came for. There is no third
   * arrangement that changes Prism's drawing rather than this Block's spacing,
   * because `className` is layout only.
   */
  variant?: 'split' | 'stacked'
  /**
   * The outcome of the caller's request, drawn in a live region and announced.
   *
   * A prop and never an internal state Prism writes, for the reason the type
   * states: a success sentence this package wrote would be inherited by every
   * consumer and would be the one sentence on the page most certainly wrong.
   */
  status?: Contact01Status
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * Whether a caller-supplied string never arrived, arrived empty, or arrived as
 * nothing but space.
 *
 * Read as `string | undefined` rather than as the declared `string`, because the
 * check is about the value that turned up rather than about what the type
 * promised. A JavaScript caller and a value out of a database both arrive with
 * the type's guarantee already gone, and the diagnostic below is the last place
 * that can still say what was wrong.
 */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/**
 * Whether a caller passed a list that is not there, or is there and empty.
 *
 * The same argument as `blank` above, and the reason a select with no options is
 * caught rather than drawn: a control with nothing in it is a question no reader
 * can answer, and it is a question that looks answered because the control is
 * there and focusable.
 */
function blankList(value: readonly unknown[] | undefined): boolean {
  return value === undefined || value.length === 0
}

/**
 * The two ways a caller's field declaration can be a form that cannot be filled,
 * checked before anything is drawn so the run fails once with the name of the
 * field rather than once per field with a nameless control on the page.
 *
 * Both reach a developer in a console rather than a reader, which is what makes
 * them refusals rather than copy: the message says what was passed and what to
 * pass instead, and neither of those sentences is ever shown to a reader. The
 * type catches both for a TypeScript caller, and the check is here for the
 * JavaScript caller and for the value that came out of a database with the
 * type's guarantee already gone.
 */
function assertGroups(groups: readonly FieldSpecGroup[]): void {
  for (const group of groups) {
    for (const field of group.fields) {
      if (blank(typeof field.label === 'string' ? field.label : undefined)) {
        throw new Error(
          `Contact01: the field "${field.key}" declares no label, so the control would be announced with no name and ` +
            'two fields on this page would be announced identically. Every control this Block draws is named by its ' +
            'label, so there is no fallback to fall back to.',
        )
      }

      if (
        CHOICE_KINDS.has(field.kind) &&
        blankList((field as { options?: readonly unknown[] }).options)
      ) {
        throw new Error(
          `Contact01: the field "${field.key}" is a choice and passes no options, so it would render a control with ` +
            'nothing in it, which is a question no reader can answer and looks answered only because the control is ' +
            'there and focusable. Pass the choices, or declare the field as a text field and check the answer in your ' +
            'own handler.',
        )
      }
    }
  }
}

/**
 * A contact form whose fields the caller declares, beside the address a reader can
 * reach a person at.
 *
 * **The declared field list is the whole design, and the reason is that a contact
 * form is a form about the message.** A contact form Component with a fixed set of
 * fields is a Component that decides what a reader may say, and the decision is
 * invisible in a review because the rendered form looks complete: four labelled
 * controls and a submit button read as a finished surface in a screenshot. What it
 * is is a claim about what enquiries are, and it is a claim that loses the message
 * the form was given. A form that cannot ask for an order number is a form a
 * reader abandons and retried through a support channel. A form that cannot ask for
 * a company size sends a one-line hello to a sales team that then spends a week on
 * discovery calls. A form that cannot ask for a budget guarantees the reply nobody
 * wanted, because the reader has already told the sender what they can afford and
 * the send has nowhere to put it. So `fields` is a prop list of the caller's own,
 * Prism names the five control types it can draw and supplies no fields at all, and
 * a contact desk that asks for a tax number, a preferred contact window and three
 * product interests is three fields and a select. The honest cost is the mirror of
 * the argument: one column in the order the list gives, so a consumer that wants a
 * two-column form for a subset of its fields composes two of these or reaches for
 * a Page, and no single field here can be described by a caller's own validation
 * message, which is the second cost and is stated below.
 *
 * **`onSubmit` is required and the Block sends nothing, which is what makes it
 * installable.** The alternative shape, the one this Block is shaped to refuse, is a
 * component that collects a name, an address and a message and posts them to a route
 * it guessed at: four consumers with four back ends then either patch it or rewrite
 * it, and in the meantime the message has been handled, stored, retried, threaded
 * and forgotten by a piece of code that was installed to draw a form. Every one of
 * those five is a decision about the caller's product and its data, and a frame that
 * takes one of them is a frame that has to be replaced rather than configured. A
 * consumer who wants a transport writes one, and a consumer who already has one
 * passes it straight in.
 *
 * **There is no success message anywhere in this file, and that is the other half
 * of the same argument.** A form that owns its own outcome sentence puts that
 * sentence into every product that installs the Block, the corpus publishes it as
 * this design system's own voice, and it is the single line on the page most
 * certainly to be wrong: a contact request can be delivered, held by a filter,
 * filed by a bot, refused as a duplicate, and answered, and one sentence cannot be
 * true of all five. So `status` is a prop with a caller-written message, this file
 * holds no `sent` flag and no `error` flag, and a consumer who installs this Block
 * owns the promise it makes.
 *
 * **The run throws on a field with no label and on a select with no options, and
 * both refusals are about a control that cannot be used.** A nameless control is
 * announced as "text field", which is the one name every other field on the page
 * shares, so two fields in this same form become indistinguishable to a screen
 * reader and the form is unusable for exactly the readers the label exists for. A
 * select with nothing in it is a question no reader can answer that looks answered
 * only because the control is there and focusable. The type catches the second
 * one for a TypeScript caller through the union above, and the check is here for
 * the JavaScript caller and for the value that came out of a database with the
 * type's guarantee already gone. Each message names the field rather than the
 * index, because a caller with nine fields needs to know which one.
 *
 * **`emailLabel` is required wherever there is an email, because a mailto link
 * whose accessible name is the address is unreadable as a sentence.** The link
 * would be announced as the word mailto and then a run of characters read out one
 * at a time, which is the one link on the page no reader can follow and the one a
 * mouse reader cannot copy either, because the words a reader selects are the ones
 * on the control rather than the ones in the address bar. So the visible text is
 * the caller's sentence about what the link does, and the address itself is in the
 * `href` where it belongs. The union on `Contact01Address` is what holds it: an
 * optional `emailLabel` beside an optional `email` would need a fallback, and the
 * only fallback available is the address.
 *
 * **Every field goes through `Field`, so its label, its description and the control
 * that announces them are Prism's wiring rather than a caller's.** That is the
 * second reason the field list is data: the wiring is the part that has to be right
 * on every field, and a Block that drew a bespoke row per type would have six
 * places to get it wrong. What `field.tsx` offers and this Block does not draw is
 * `FieldError`, and the omission is a decision rather than an oversight: the
 * sentence saying what is wrong with a value is the one sentence a native control
 * already gets right in the reader's own language for free, because the browser
 * writes it, so the `required` and `type` attributes this Block forwards are the
 * error path and a per-field message from the caller is composed beside `Field`
 * rather than inside this Block. The cost is named: a consumer whose validation
 * rules are its own rather than the platform's has no seam here, and the answer is
 * that it validates in its handler and puts the message in `status`, which is one
 * sentence about all the fields rather than one per field.
 *
 * **Nothing here validates anything.** There is no address format check, no message
 * length, no required consent and no spam rule. Each of those is a decision about
 * the caller's product and its data, and a Block that guessed one would refuse a
 * reader on the caller's behalf. What Prism does with `status` is refuse a second
 * press: while the state reads `sending` the submit control is disabled, because a
 * second press while the first request is in flight is a duplicate enquiry a
 * support inbox cannot merge. That is the whole of Prism's reading of the state,
 * and it is stated here because the alternative is a Block that has begun to have
 * opinions about the request.
 *
 * It is a client Component, and the reason is the handler rather than the state.
 * `onSubmit` is a function, a function is a piece of state, and state is a client
 * module: a server component cannot hand an event handler down to a `<form>`, so a
 * caller rendering this from a server component gets a form that submits and calls
 * nothing. The rest of the rendering is a section and five controls, which is the
 * price of the argument above and not a claim about what else this Block might do.
 */
export function Contact01({
  eyebrow,
  title,
  description,
  onSubmit,
  groups,
  issues,
  submitLabel,
  consent,
  address,
  variant = 'split',
  status,
  headingLevel = 'h2',
  className,
}: Contact01Props) {
  const generated = useId()
  const sending = status?.state === 'sending'
  const [values, setValues] = useState<Record<string, unknown>>({})
  const setValue = (key: string, value: unknown) =>
    setValues((previous) => ({ ...previous, [key]: value }))

  assertGroups(groups)
  const fields = groups.flatMap((group) => group.fields)

  /*
   * The values are read out of the form rather than out of any prop, because a
   * contact form is uncontrolled by nature: there are as many fields as the caller
   * declared and no state to hold them in. The keys are the caller's own field
   * `key`s, so the record that arrives is shaped like the declaration that produced
   * it, and a caller that renames a field in one place renames it in one place. The
   * handful of Prism controls the platform will not submit on their own hold their
   * value here and carry a hidden input under the field's key.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const read = new FormData(event.currentTarget)
    const next: ContactValue = {}
    for (const field of fields) {
      const one = read.get(field.key)
      if (typeof one === 'string') next[field.key] = one
    }
    onSubmit(next)
  }

  return (
    <Section data-slot="contact-01" className={cn(className)}>
      <div data-slot="contact-01-body" className="flex flex-col gap-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        <div
          data-slot="contact-01-columns"
          data-variant={variant}
          className={cn(
            'grid items-start gap-10',
            variant === 'split' ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14' : null,
          )}
        >
          <form
            data-slot="contact-01-form"
            onSubmit={handleSubmit}
            className="flex w-full max-w-measure flex-col gap-4"
          >
            {groups.map((group, groupIndex) => (
              <FieldGroup
                key={group.id ?? groupIndex}
                data-slot="contact-01-group"
                className="flex flex-col gap-4"
              >
                {group.label === undefined ? null : (
                  <p
                    data-slot="contact-01-group-label"
                    className="text-foreground text-sm font-medium"
                  >
                    {group.label}
                  </p>
                )}
                {group.description === undefined ? null : (
                  <p
                    data-slot="contact-01-group-description"
                    className="text-muted-foreground text-sm"
                  >
                    {group.description}
                  </p>
                )}
                {group.fields.map((field, fieldIndex) => {
                  const id = `${generated}-${groupIndex}-${fieldIndex}`
                  const labelId = `${id}-label`
                  const helpId = field.help === undefined ? undefined : `${id}-help`
                  const fieldIssues = (issues ?? []).filter((issue) => issue.field === field.key)
                  const errorId = fieldIssues.length > 0 ? `${id}-error` : undefined
                  const describedBy =
                    helpId === undefined
                      ? errorId
                      : errorId === undefined
                        ? helpId
                        : `${helpId} ${errorId}`
                  const kind = field.kind.toLowerCase() as Lowercase<FieldKind>
                  const ctx: FieldContext = {
                    id,
                    labelId,
                    describedBy,
                    invalid: fieldIssues.length > 0,
                    text: fieldText(field),
                    values,
                    setValue,
                  }

                  return (
                    <Field key={field.key} data-slot="contact-01-field" data-field={field.kind}>
                      {SELF_LABELLED.has(kind) ? null : (
                        <Label
                          id={labelId}
                          htmlFor={id}
                          required={field.required}
                          disabled={field.disabled}
                        >
                          {field.label}
                        </Label>
                      )}
                      {renderControl(field, ctx)}
                      {NEEDS_HIDDEN.has(kind) ? (
                        <input
                          type="hidden"
                          name={field.key}
                          value={serialize(values[field.key] ?? field.defaultValue)}
                        />
                      ) : null}
                      {field.help === undefined ? null : (
                        <FieldDescription id={helpId}>{field.help}</FieldDescription>
                      )}
                      {fieldIssues.length === 0 ? null : (
                        <FieldError id={errorId}>
                          {fieldIssues.map((issue, issueIndex) => (
                            <span key={issueIndex} data-slot="contact-01-issue">
                              {issue.message}
                            </span>
                          ))}
                        </FieldError>
                      )}
                    </Field>
                  )
                })}
              </FieldGroup>
            ))}

            {consent === undefined ? null : (
              <p data-slot="contact-01-consent" className="text-muted-foreground text-sm">
                {consent}
              </p>
            )}

            <div data-slot="contact-01-actions" className="flex flex-col gap-3">
              <Button
                data-slot="contact-01-submit"
                type="submit"
                disabled={sending}
                className="self-start"
              >
                {submitLabel}
              </Button>

              {/*
               * The outcome, and it renders nothing while there is no message.
               * `assertive` only for a refusal, because that is the one state where
               * the reader is waiting for an answer and nothing else follows it, and
               * a form in its resting state carries no live region at all rather than
               * an empty one announcing every unrelated change of its ancestors.
               */}
              <LiveRegion
                politeness={status?.state === 'error' ? 'assertive' : 'polite'}
                busy={sending}
                className="text-sm"
              >
                {status?.message}
              </LiveRegion>
            </div>
          </form>

          {address === undefined ? null : (
            /*
             * An `address` element, because that is what this is: contact
             * information for the organisation, which is what the element names and
             * which a `<div>` does not. The platform renders it in italics and no
             * token in this stylesheet resets that, so the one display utility
             * restores the reading type. It is here rather than in a token
             * because an italic address is a platform default rather than a design
             * decision, and because the reset belongs on every element that draws
             * postal lines: this one and `contact-page`'s office rows, which is why
             * it is written out twice rather than pushed into the base layer, since
             * a base reset for one element a package happens to draw is a decision
             * about the platform default made in a place no reader looks.
             */
            <address
              data-slot="contact-01-address"
              className="text-muted-foreground flex w-full max-w-measure-narrow flex-col gap-4 not-italic"
            >
              {address.lines.map((line) => (
                <span key={line} data-slot="contact-01-address-line" className="block">
                  {line}
                </span>
              ))}

              {address.email === undefined ? null : (
                /*
                 * A `CtaLink` and not a bare anchor, so the link carries the focus
                 * ring, the hover state and the announced role of one, and so the
                 * address is in the `href` where a reader can copy it rather than
                 * being the only words on the control. The words are the caller's,
                 * and the union on `Contact01Address` is what refuses to draw this
                 * one at all without them.
                 */
                <CtaLink
                  data-slot="contact-01-email"
                  href={`mailto:${address.email}`}
                  variant="ghost"
                  size="sm"
                  className="self-start"
                >
                  {address.emailLabel}
                </CtaLink>
              )}

              {address.hours === undefined ? null : (
                <div data-slot="contact-01-hours" className="flex flex-col gap-2 text-sm">
                  {address.hours}
                </div>
              )}
            </address>
          )}
        </div>
      </div>
    </Section>
  )
}

export default Contact01
