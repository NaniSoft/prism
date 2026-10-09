'use client'

import { CircleAlert } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useId, useState } from 'react'

import { Alert, AlertDescription } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup } from '../../components/ui/field'
import { Label } from '../../components/ui/label'
import type { HeadingLevel } from '../../components/ui/section'
import {
  CHOICE_KINDS,
  fieldText,
  NEEDS_HIDDEN,
  renderControl,
  serialize,
  SELF_LABELLED,
  type FieldContext,
} from '../../lib/field-render'
import type { FieldKind, FieldSpecGroup } from '../../lib/spec'

/**
 * One thing wrong with the form, in the caller's own words.
 *
 * `field` is the `key` of the field the message belongs to, and the key rather
 * than the label because it is what the caller's values and the form's own
 * `FormData` are keyed by. The shape is the one the write form, the dialog and
 * the wizard already publish, so this Block mints no fifth spelling of an issue.
 */
export type AuthForm01Issue = {
  /** The `key` of the field this message belongs to. */
  field: string
  /** The message, in the product's own words. */
  message: string
}

/**
 * The remember-me row.
 *
 * It is not a field of the shared specification, and the reason is that it is a
 * control this Block owns rather than one the caller declares: a sign-in screen
 * has a remember row and the row is one control with a sentence and a starting
 * state, so a caller who wants a second one draws it in the footer rather than
 * widening the field vocabulary for a shape one screen has.
 */
export type AuthFormRemember = {
  id: string
  label: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export type AuthForm01Props = {
  title: string
  /**
   * Heading level for the card's title. See `HeadingLevel`.
   *
   * This Block draws no Section heading of its own, so the card title is the one
   * heading it renders and takes the level directly rather than a step below one.
   * It is a prop for the same reason every Block's is: the surrounding document
   * decides where this lands in the outline, not the Block.
   */
  headingLevel?: HeadingLevel
  description?: string
  /**
   * The credential fields, grouped and ordered, as the shared field specification.
   *
   * A field carries a stable `key`, a required `label`, a required `kind` drawn
   * from Prism's own input vocabulary, and optional help, hint, placeholder,
   * autofill hint, disabled flag and starting value. A control this package does
   * not ship is the `slot` arm, and the Block still draws the label, the help and
   * the error around the caller's node. Asking for an email is an `Input` and
   * asking for a password is the `PasswordField` this package ships, so the
   * vocabulary is the same one a record write form takes.
   */
  groups: readonly FieldSpecGroup[]
  /** The issues to draw, keyed by field. Drawn under the control that owns them. */
  issues?: readonly AuthForm01Issue[]
  /**
   * An error message shown above the fields.
   *
   * A sentence about the submission rather than about a control, which is why
   * naming a field it concerns is a separate decision: an entry in `issues` marks
   * its own field, and a message here marks none. Telling a reader that two
   * correctly filled fields are wrong is how they learn to stop trusting the rest
   * of the form, so a submission sentence never marks more than the issue list
   * already did.
   */
  submitError?: ReactNode
  /** A remember-me row under the fields. */
  remember?: AuthFormRemember
  /** The submit button label. */
  submitLabel: string
  /** The label shown while `pending` is true. Falls back to `submitLabel`. */
  pendingLabel?: string
  /** Disables the submit control while a request is in flight. */
  pending?: boolean
  /**
   * Called when the reader submits, with the form's own element.
   *
   * The Block is uncontrolled where a Prism control can be, so the caller reads
   * the values out of the form element: the field keys are on the controls and a
   * control the platform will not submit carries a hidden input under its key.
   */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  /** A row under the submit button, e.g. a link to another screen. */
  footer?: ReactNode
}

/**
 * The two ways a caller's field declaration can be a form that cannot be filled,
 * checked before anything is drawn so the run fails once with the name of the
 * field rather than once per field with a nameless control on the page.
 *
 * Both reach a developer in a console rather than a reader, which is what makes
 * them refusals rather than copy. The type catches both for a TypeScript caller,
 * and the check is here for the JavaScript caller and for the value that came out
 * of a database with the type's guarantee already gone.
 */
function assertGroups(groups: readonly FieldSpecGroup[]): void {
  for (const group of groups) {
    for (const field of group.fields) {
      if (field.label === undefined || (typeof field.label === 'string' && field.label.trim() === '')) {
        throw new Error(
          `AuthForm01: the field "${field.key}" declares no label, so its control would be announced with no name ` +
            'and two fields on this page would be announced identically. Every control this Block draws is named ' +
            'by its label, so there is no fallback to fall back to.',
        )
      }
      if (
        CHOICE_KINDS.has(field.kind) &&
        ((field as { options?: readonly unknown[] }).options?.length ?? 0) === 0
      ) {
        throw new Error(
          `AuthForm01: the field "${field.key}" is a choice and passes no options, so it would render a control ` +
            'with nothing in it, which is a question no reader can answer and looks answered only because the ' +
            'control is there and focusable. Pass the choices, or declare the field as a text field and check the ' +
            'answer in your own handler.',
        )
      }
    }
  }
}

/**
 * A sign-in card, or a registration or a recovery, rendered from the shared field
 * specification.
 *
 * The block renders the card, the labelled fields, the remember row and the
 * submit control. It owns no credentials and no request: every field value comes
 * from the controls the Block draws, the submit handler comes from the consumer,
 * and a submission message is a prop so the consumer's validation decides when it
 * appears. Every string is a prop.
 *
 * **It takes the shared field specification.** `groups` is an ordered list of
 * `FieldSpecGroup`, each an optional heading and an ordered list of `FieldSpec`,
 * and a field carries a stable `key`, a required `label` and a required `kind`
 * drawn from Prism's own input vocabulary. A login, a registration and a password
 * recovery are one Block and nothing forks here: asking for an email draws the
 * `Input` this package ships and asking for a password draws its `PasswordField`,
 * and a control this package does not ship is the `slot` arm rather than a second
 * Block. The vocabulary a consumer learns on a record write form is the
 * vocabulary here, and there is no second field declaration beside it.
 *
 * **An error is one message about the submission, and it marks no field.** A
 * form-level sentence is usually not about a control at all: bad credentials, a
 * locked account and a rate limit are all things no field is wrong about. The
 * message is drawn in an `Alert`, which announces itself, and a message that
 * belongs to one field is an entry in `issues`, drawn under that control and
 * marking only it. A submission sentence never marks two fields, because a reader
 * who is told two correctly filled fields are wrong stops trusting the rest of the
 * form.
 *
 * **A field's help is drawn under it and referred to by it.** The id is derived
 * from the control's own `id`, which is stable for the life of the form, so the
 * reference cannot collide and a screen reader hears what the field is for as it
 * reaches it.
 *
 * **It is uncontrolled where a Prism control can be.** The platform submits an
 * `Input`, a `Textarea`, a `NativeSelect` and the controls that render their own
 * input, so the caller reads the values out of the form element in `onSubmit`.
 * The handful of Prism controls the platform will not submit on their own hold
 * their value and carry a hidden input under the field's key, so the payload is
 * complete either way.
 */
export function AuthForm01({
  title,
  description,
  groups,
  issues,
  submitError,
  remember,
  submitLabel,
  pendingLabel,
  pending = false,
  onSubmit,
  footer,
  headingLevel = 'h2',
}: AuthForm01Props) {
  const generated = useId()
  const [values, setValues] = useState<Record<string, unknown>>({})
  const setValue = (key: string, value: unknown) =>
    setValues((previous) => ({ ...previous, [key]: value }))

  assertGroups(groups)

  // This Block draws no section heading, so the card title is the one heading it
  // renders and takes the level directly rather than a step below one.
  const Title = headingLevel

  return (
    <form onSubmit={onSubmit} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <Title>{title}</Title>
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {submitError ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          {groups.map((group, groupIndex) => (
            <FieldGroup
              key={group.id ?? groupIndex}
              data-slot="auth-form-01-group"
              className="flex flex-col gap-4"
            >
              {group.label === undefined ? null : (
                <p data-slot="auth-form-01-group-label" className="text-foreground text-sm font-medium">
                  {group.label}
                </p>
              )}
              {group.description === undefined ? null : (
                <p data-slot="auth-form-01-group-description" className="text-muted-foreground text-sm">
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
                  <Field key={field.key} data-slot="auth-form-01-field" data-field={field.kind}>
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
                          <span key={issueIndex} data-slot="auth-form-01-issue">
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

          {remember ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id={remember.id}
                checked={remember.checked}
                defaultChecked={remember.defaultChecked}
                onCheckedChange={remember.onCheckedChange}
                disabled={remember.disabled}
              />
              <Label htmlFor={remember.id}>{remember.label}</Label>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (pendingLabel ?? submitLabel) : submitLabel}
          </Button>
          {footer}
        </CardFooter>
      </Card>
    </form>
  )
}

export default AuthForm01
