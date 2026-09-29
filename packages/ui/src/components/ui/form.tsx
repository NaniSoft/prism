'use client'

import { Field as FieldPrimitive } from '@base-ui/react/field'
import { Form as FormPrimitive } from '@base-ui/react/form'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/** The props the Form accepts. */
export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  /**
   * The errors the server returned, keyed by field name.
   *
   * This is the whole point of the binding. A submission fails and comes back with
   * a record of what was wrong with it, and a form that cannot take that record has
   * to either drop it or turn it into a banner above the form that the reader has to
   * match to a field themselves. Passed here, each `FormField` named after the key
   * renders it under the control that caused it, and the control is marked invalid.
   * Pass an empty record to clear them: the errors are cleared as data, not by
   * reloading the page. A key with no error is an absent key rather than a key
   * holding nothing, because a record that says "this field is wrong" and does not
   * say how is not one this can draw.
   */
  errors?: Record<string, string | string[]>
  /**
   * Called with the field values when the form submits.
   *
   * The native submit event is prevented, so this is where a server action goes.
   * Nothing is submitted to the browser and no navigation happens unless the caller
   * does it.
   */
  onSubmit?: (values: Record<string, unknown>) => void
  /**
   * Whether the browser's own validation bubbles are off. @defaultValue true
   *
   * On by default, because the binding reports validity on the field and a form
   * that shows the browser's bubble and a styled message is two reports of one
   * problem, in two places, in two voices.
   */
  noValidate?: boolean
}

/** The props the Form field accepts. */
export interface FormFieldProps extends ComponentProps<'div'> {
  /**
   * The name of the field, and the key its error arrives under.
   *
   * Required, and it is the join between the control's `name`, the key in the
   * server's `errors` and the field the error is drawn under. A field that is not
   * named cannot receive an error, so this is the one prop that makes the rest of
   * the binding work.
   */
  name: string
  /**
   * The rule the field is checked against, returning the message to show.
   *
   * The message is the caller's, because it is a sentence about their product's
   * rules. Returning nothing means the value is valid.
   */
  validate?: (value: unknown) => string | string[] | null | void
  /** Whether the field is invalid, for a value a library of the caller's owns. */
  invalid?: boolean
  /** Whether the field ignores interaction. */
  disabled?: boolean
}

/** The props the Form label accepts. */
export interface FormLabelProps extends ComponentProps<'label'> {}

/** The props the Form description accepts. */
export interface FormDescriptionProps extends ComponentProps<'p'> {}

/** The props the Form control accepts. */
export type FormControlProps = ComponentProps<typeof FieldPrimitive.Control>

/** The props the Form error accepts. */
export interface FormErrorProps extends ComponentProps<'div'> {
  /**
   * What the reader can do about the error, drawn after the message.
   *
   * The message and the way out are one unit. "That address is already registered"
   * with nothing after it is a dead end, and the reader is left to guess whether
   * they should sign in instead, change the address or ask somebody. So this
   * Component renders both in the same live region: the recovery is announced with
   * the problem rather than being something the reader has to find.
   */
  action?: React.ReactNode
}

/**
 * The form binding: a form, its fields, and the errors that came back from it.
 *
 * **`Field` is the layout; this is the wiring.** `Field` is presentational and says
 * so: nothing in it generates an `id`, so the consumer owns the control's id and
 * wires it to the label's `htmlFor` and to the description or error's `id` through
 * `aria-describedby`. That is the right default for a layout, and it is a lot of
 * hand-written ids in a form with eleven fields, none of which a reader can see
 * and all of which a screen reader depends on. This module is the part that
 * generates them: `FormField` owns the name, `FormControl` registers itself with
 * the field, and `FormLabel` and `FormDescription` find the control and point at
 * it. Nothing here changes how `Field` looks.
 *
 * **A server error arrives as data and lands under the control that caused it.**
 * `errors` is a record keyed by field name and `FormField` is keyed by the same
 * name, so the message a submission came back with is drawn under the control the
 * reader has to fix, the control is marked invalid, and the message is added to the
 * control's description so it is read out when the reader reaches the field. The
 * errors clear when the record clears: a field that fixed itself still shows the
 * server's complaint until the caller stops passing it, which is exactly as
 * honest as it sounds.
 *
 * **The error and the way out are rendered together, in one live region.** The
 * recovery is the half of an error that is usually missing. A `FormError` renders
 * the message and then the caller's `action`, and the region is in the document
 * before either of them is, because a live region inserted at the same moment as
 * its content is not announced by every screen reader. The region is therefore
 * present and empty while the field is valid, which is the cost of the reliable
 * half.
 *
 * **Use a `FormControl` inside a `FormField`.** The control is the part that
 * registers itself, which is what makes the label's `for` resolve and what puts the
 * description and the error into the control's accessible description. A plain
 * `Input` renders and submits perfectly well inside a `FormField` and is not
 * registered, so its label points at an id that is on nothing and its error is
 * never announced with it. That is the one rule this module asks for, and it is
 * the rule `Field` deliberately leaves to the caller.
 */
function Form({ errors, onSubmit, noValidate = true, className, ...props }: FormProps) {
  return (
    <FormPrimitive<Record<string, unknown>>
      className={cn('flex w-full flex-col gap-6', className)}
      noValidate={noValidate}
      {...(errors === undefined ? null : { errors })}
      onFormSubmit={(values) => onSubmit?.(values)}
      {...props}
    />
  )
}

/** One field's name, its rule and the control that answers to it. */
function FormField({
  name,
  validate,
  invalid,
  disabled,
  className,
  ...props
}: FormFieldProps) {
  return (
    <FieldPrimitive.Root
      data-slot="form-field"
      name={name}
      className={cn('flex w-full flex-col gap-1.5', className)}
      {...(validate === undefined ? null : { validate })}
      {...(invalid === undefined ? null : { invalid })}
      {...(disabled === undefined ? null : { disabled })}
      {...props}
    />
  )
}

/** The control's accessible name, associated with it rather than placed near it. */
function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <FieldPrimitive.Label
      data-slot="form-label"
      className={cn('text-foreground text-sm leading-none font-medium', className)}
      {...props}
    />
  )
}

/** The control itself, registered with the field so the label and errors find it. */
function FormControl({ className, ...props }: FormControlProps) {
  return (
    <FieldPrimitive.Control
      data-slot="form-control"
      className={cn(
        'border-input bg-background text-foreground placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] duration-fast ease-out outline-none md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/** A short helper line under the control, announced with the control itself. */
function FormDescription({ className, ...props }: FormDescriptionProps) {
  return (
    <FieldPrimitive.Description
      data-slot="form-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/**
 * The field's error and what to do about it, in one announced region.
 *
 * The region is always in the document and the message is not, because a live
 * region that arrives with its content is missed by some screen readers. It is
 * empty while the field is valid.
 */
function FormError({ className, action, ...props }: FormErrorProps) {
  return (
    <div
      data-slot="form-error"
      role="alert"
      className={cn('flex flex-col items-start gap-1', className)}
      {...props}
    >
      <FieldPrimitive.Error
        data-slot="form-error-message"
        className="text-destructive text-sm font-medium"
      />
      {/*
       * The recovery is drawn only while there is a problem. A "change the
       * address" link under a field that is perfectly valid is an invitation to
       * change an address that did not need changing, and the validity here is the
       * combined one, so a server error gates it as surely as a client rule does.
       */}
      {action === undefined ? null : (
        <FieldPrimitive.Validity>
          {(state) => (state.validity.valid === false ? action : null)}
        </FieldPrimitive.Validity>
      )}
    </div>
  )
}

export { Form, FormControl, FormDescription, FormError, FormField, FormLabel }
