'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { InputGroup, InputGroupButton, InputGroupInput } from './input-group'
import { cn } from '../../lib/utils'

/** The props the Password field accepts. */
export interface PasswordFieldProps {
  /**
   * The password as the caller holds it.
   *
   * Required, and the field is controlled because of it, for the same reason the
   * search field is: a value the Component cannot see is a value it cannot hand
   * to a reveal control, to a clear control or to a form on submit.
   */
  value: string
  /**
   * Called with the password as the reader changes it.
   *
   * Required. There is no uncontrolled arm here, because a password field with
   * no caller holding its value cannot be submitted by a server action and
   * cannot be cleared when the reader has given up on the form.
   */
  onValueChange: (value: string) => void
  /**
   * The field's visible name, drawn above the control.
   *
   * Required, and a node rather than a string because a sign-in form's label
   * often carries more than one word: a product name, a hint about which of two
   * accounts it belongs to. The accessible name comes from the same node through
   * the label element.
   */
  label: ReactNode
  /**
   * A short helper line under the control, announced with it.
   *
   * Replaced by `error` while the field is invalid rather than stacked under it,
   * so the reader has one instruction at a time.
   */
  description?: ReactNode
  /**
   * What is wrong with the entry, drawn in the destructive token and announced
   * as it appears. Also marks the control `aria-invalid`.
   *
   * Never write the entered value into an error about a password. The message
   * is the caller's sentence about their own product.
   */
  error?: ReactNode
  /**
   * The accessible name of the control while the password is hidden.
   *
   * Required, and a prop because a screen reader reads it. A reveal control that
   * says "Show password" in a product whose interface is in another language is
   * the exact defect `check-block-copy` was written to end: the control looks
   * localised because the icon is the same everywhere, and the half a reader
   * actually hears is English.
   */
  revealLabel: string
  /**
   * The accessible name of the control while the password is showing.
   *
   * Required for the same reason as `revealLabel`, and it is a second sentence
   * rather than a state flag because the name has to describe what pressing the
   * control will do, not what is currently true.
   */
  hideLabel: string
  /**
   * The form field name the platform's password manager offers to save.
   *
   * Defaults to `current-password`, which is the right answer for a sign-in and
   * the wrong one for a new password, a confirmation and a change. Pass
   * `new-password` for the last three: a password manager that offers to save a
   * new password as if the reader were signing in produces an account nobody can
   * sign into.
   */
  autoComplete?: string
  /** Layout only. */
  className?: string
}

/**
 * A password input with a reveal toggle.
 *
 * **The reveal control is a Component and not a caller's own button.** A toggle
 * a consumer writes is a `<button>` with three things that can each be wrong in
 * a way nothing on screen shows. Leave `type` off and it is a submit button by
 * default, so pressing it on a form that submits on enter posts the form, and
 * the reader's half-typed password is sent before they have read a character of
 * it. Give it no accessible name and it is announced as "button", so the only
 * way a keyboard or screen reader user finds it is by counting buttons. Give it
 * a real name in one language and ship it into a product in another. All three
 * are silent, all three typecheck, and none of them is visible in a screenshot
 * of the field, which is where this defect is normally caught. So the button is
 * here, with `type="button"` already set, a name the caller wrote, and the
 * `type` toggle on the input already wired.
 *
 * **The two names are props rather than a label and a boolean.** The alternative
 * was one name, "Show password", plus `aria-pressed` to carry the state. It is a
 * real pattern and it needs a sentence for the state that no one asked for, and
 * it is wrong in a way that is easy to miss: a name that describes the current
 * state rather than the next action means the reader has to combine what the
 * control is with what pressing it will do, every time. Two names are two
 * sentences for the caller to write, which is a cost, and it buys a control
 * whose announced name is always the thing it does next.
 *
 * **The reveal state is local and is not reported.** Nothing outside this
 * Component needs to know whether a password is currently on screen: the value
 * is the same either way, the field submits the same either way, and a
 * `revealed` prop would be a second source of truth for a fact that only this
 * control cares about. What a consumer does need is to be able to clear the
 * field, and it can, because the field is controlled and `onValueChange` takes an
 * empty string.
 *
 * **The `autoComplete` default is right for a sign-in and wrong for everything
 * else.** `current-password` is a platform hint, and the platform uses it to
 * decide whether to offer to fill a field it already knows and whether to offer
 * to save the entry. Getting it wrong on a registration form produces an account
 * whose password the browser will not offer to sign in with. The default is
 * there so the common case is right without a prop, and the JSDoc above says
 * plainly that the other three cases have to say so.
 *
 * It needs the client directive because it holds one piece of state, the reveal
 * toggle, and that state is what a server render cannot know: whether a reader
 * has looked at their own password is decided after the HTML is sent.
 */
function PasswordField({
  value,
  onValueChange,
  label,
  description,
  error,
  revealLabel,
  hideLabel,
  autoComplete = 'current-password',
  className,
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false)
  const generated = useId()
  const inputId = `${generated}-input`
  const invalid = error !== undefined
  const descriptionId = description === undefined ? undefined : `${generated}-description`
  const errorId = invalid ? `${generated}-error` : undefined

  // The error comes first when both are present, so the reader hears what is
  // wrong before the background detail, which is the order the two are drawn in.
  const describedBy =
    errorId === undefined
      ? descriptionId
      : descriptionId === undefined
        ? errorId
        : `${errorId} ${descriptionId}`

  return (
    <div data-slot="password-field" className={cn('flex w-full flex-col', className)}>
      <Field>
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id={inputId}
            type={revealed ? 'text' : 'password'}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            autoComplete={autoComplete}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          />
          <InputGroupButton
            data-slot="password-field-reveal"
            aria-label={revealed ? hideLabel : revealLabel}
            onClick={() => setRevealed((was) => !was)}
          >
            {revealed ? (
              <EyeOffIcon className="size-4" aria-hidden="true" />
            ) : (
              <EyeIcon className="size-4" aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroup>

        {invalid ? <FieldError id={errorId}>{error}</FieldError> : null}
        {descriptionId === undefined ? null : (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}
      </Field>
    </div>
  )
}

export { PasswordField }
