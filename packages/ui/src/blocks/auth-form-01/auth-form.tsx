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
  description?: string
  /** The credential fields, in order. */
  fields: AuthFormField[]
  /** An error message shown above the fields and marked on each control. */
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
}: AuthForm01Props) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
            {fields.map((field) => (
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
                  aria-invalid={error ? true : undefined}
                />
                {field.description ? (
                  <FieldDescription>{field.description}</FieldDescription>
                ) : null}
              </Field>
            ))}
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
