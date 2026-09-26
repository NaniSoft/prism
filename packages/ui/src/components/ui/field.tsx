import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The layout and labelling components that wrap a form control.
 *
 * The module ships `Field`, `FieldLabel`, `FieldDescription`, `FieldError` and
 * `FieldGroup`, and each is presentational: the consumer owns the control's
 * `id` and wires it to the label's `htmlFor` and to the description or error's
 * `id` through `aria-describedby`. Nothing here generates an `id`, so a field
 * stays a Server Component and no markup is decided at hydration time.
 */
function Field({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field"
      role="group"
      className={cn('flex w-full flex-col gap-1.5', className)}
      {...props}
    />
  )
}

/** Groups several related fields, for example one row of a settings form. */
function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      role="group"
      className={cn('flex w-full flex-col gap-6', className)}
      {...props}
    />
  )
}

/**
 * The control's accessible name.
 *
 * Renders a native `<label>`; pass the control's `id` as `htmlFor` so the name
 * is programmatically attached rather than merely adjacent.
 */
function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        'text-foreground text-sm leading-none font-medium',
        className,
      )}
      {...props}
    />
  )
}

/**
 * A short helper line under the control.
 *
 * Give it an `id` and reference it from the control's `aria-describedby`; the
 * text is an explanation, not the accessible name.
 */
function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/**
 * The field's error message.
 *
 * Carries `role="alert"`, so it is announced when it appears. It is shown only
 * while the field is invalid; render nothing otherwise.
 */
function FieldError({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn('text-destructive text-sm font-medium', className)}
      {...props}
    />
  )
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup }
