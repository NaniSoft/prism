'use client'

import { CircleAlert } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import type { HeadingLevel } from '../../components/ui/section'

export type AuthFormField = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  description?: string
  /**
   * This field is the one the form-level `error` is about.
   *
   * A form-level message with no field named is a statement about the submission:
   * "those credentials do not match" is not a claim about the password field any
   * more than it is a claim about the email field, and marking both of them
   * `aria-invalid` tells a reader that two correctly filled fields are wrong. So the
   * Block marks the field the caller names and no other, and a caller with nothing
   * to name leaves every field unmarked, which is the honest state: the message
   * still sits above the fields in an `Alert`, so it is still announced and still
   * identified, and WCAG 3.3.1 is answered by the message rather than by a mark on a
   * control that is not the problem.
   *
   * Omit it rather than setting it on every field. That was the arrangement this
   * replaces and it is the arrangement a reader pays for, because the first thing a
   * screen reader says about each field is "invalid" and a reader who is told two
   * correct answers are wrong stops trusting the rest of the form.
   */
  errorId?: string
}

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
  /** The credential fields, in order. */
  fields: AuthFormField[]
  /**
   * An error message shown above the fields.
   *
   * A sentence about the submission rather than about a control, which is why
   * naming the field it concerns is a separate decision: pass the same id as one
   * field's `errorId` and that field carries `aria-invalid`, and pass nothing and
   * none does. See `AuthFormField.errorId`.
   */
  error?: string
  /** A remember-me row under the fields. */
  remember?: AuthFormRemember
  /** The submit button label. */
  submitLabel: string
  /** The label shown while `pending` is true. Falls back to `submitLabel`. */
  pendingLabel?: string
  /** Disables the submit control while a request is in flight. */
  pending?: boolean
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  /** A row under the submit button, e.g. a link to another screen. */
  footer?: ReactNode
}

/**
 * A sign-in card.
 *
 * The block renders the card, the labelled fields, the remember row and the
 * submit control. It owns no credentials and no request: every field value and
 * the submit handler come from the consumer, and the error line is a prop so
 * the consumer's validation decides when it appears. Every string is a prop.
 *
 * **An error is one message about the submission, and it marks at most one field.**
 * The two are separate decisions because a form-level sentence is usually not about
 * a control at all: bad credentials, a locked account and a rate limit are all
 * things no field is wrong about. The message is drawn in an `Alert`, which
 * announces itself, and the field the caller names in `errorId` carries
 * `aria-invalid`, and every other field carries nothing. Marking them all was the
 * arrangement before, and it told a reader that two fields they had filled in
 * correctly were wrong.
 *
 * **A field's description is drawn under it and referred to by it.** The id is
 * derived from the field's own `id`, which is already the one stable caller-owned
 * string on the field, so the reference costs a template and cannot collide.
 */
export function AuthForm01({
  title,
  description,
  fields,
  error,
  remember,
  submitLabel,
  pendingLabel,
  pending = false,
  onSubmit,
  footer,
  headingLevel = 'h2',
}: AuthForm01Props) {
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
          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            {fields.map((field) => {
              /*
               * Derived from the field's own id rather than from a `useId`, because
               * `field.id` is already the one stable, caller-owned string on the
               * field and a generated one would have to be threaded through the
               * description and the input to meet itself.
               */
              const descriptionId = field.description === undefined ? undefined : `${field.id}-description`
              const marked = error !== undefined && field.errorId === field.id

              return (
                <Field key={field.id}>
                  <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
                  <Input
                    id={field.id}
                    type={field.type ?? 'text'}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    value={field.value}
                    defaultValue={field.defaultValue}
                    onChange={
                      field.onChange
                        ? (event) => field.onChange?.(event.target.value)
                        : undefined
                    }
                    required={field.required}
                    disabled={field.disabled}
                    // Only the field the caller named. See `AuthFormField.errorId`.
                    aria-invalid={marked ? true : undefined}
                    // The description is drawn under the field and is never announced
                    // without this reference, so a hint about a format or a constraint
                    // was on the page and not in the field. `login-01` and `signup-01`
                    // wire the same pair and this Block is the one that had not.
                    {...(descriptionId === undefined ? null : { 'aria-describedby': descriptionId })}
                  />
                  {field.description === undefined ? null : (
                    <FieldDescription id={descriptionId}>{field.description}</FieldDescription>
                  )}
                </Field>
              )
            })}
          </FieldGroup>

          {remember ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id={remember.id}
                checked={remember.checked}
                defaultChecked={remember.defaultChecked}
                onCheckedChange={remember.onCheckedChange}
                disabled={remember.disabled}
              />
              <FieldLabel htmlFor={remember.id}>{remember.label}</FieldLabel>
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
