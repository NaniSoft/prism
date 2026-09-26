'use client'

import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { CircleIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the RadioGroup forwards to its Base UI root.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface RadioGroupProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** The selected item's value, when the group is controlled. */
  value?: string
  /** The item selected initially, for an uncontrolled group. */
  defaultValue?: string
  /** Called when the selection changes. */
  onValueChange?: (value: string) => void
  /** The form field name submitted with the form. */
  name?: string
  /** Identifies the form that owns the hidden inputs. */
  form?: string
  /** Whether every item ignores user interaction. */
  disabled?: boolean
  /** Whether the user may not change the selection. */
  readOnly?: boolean
  /** Whether a value must be chosen before the form submits. */
  required?: boolean
  /** The group's accessible name when no visible legend is used. */
  'aria-label'?: string
}

/**
 * The props the RadioGroupItem forwards to its Base UI radio.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface RadioGroupItemProps extends Omit<ComponentProps<'span'>, 'onChange'> {
  /** The value this item contributes to the group. */
  value: string
  /** Whether this item ignores user interaction. */
  disabled?: boolean
  /** Whether this item must be chosen before the form submits. */
  required?: boolean
  /** Whether the user may not change this item's selection. */
  readOnly?: boolean
  /** The item's accessible name when no visible label is used. */
  'aria-label'?: string
}

/**
 * A set of radio items where exactly one may be chosen.
 *
 * The group owns the value and the keyboard model: arrow keys move between
 * items inside the group, while Tab moves into and out of the group as one
 * stop. Always give the group a visible legend or an `aria-label`, and use a
 * RadioGroup rather than a set of checkboxes when the choices are mutually
 * exclusive.
 */
function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive<string>
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

/**
 * One choice inside a RadioGroup.
 *
 * Renders a circular control with a hidden native radio beside it, so it
 * submits with the form. Space selects the focused item when arrow-key
 * navigation has not already selected it. Put the item beside its
 * `FieldLabel`, and keep the group's name on the RadioGroup itself.
 */
function RadioGroupItem({ className, value, ...props }: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      value={value}
      data-slot="radio-group-item"
      className={cn(
        'border-input text-primary shadow-xs aspect-square size-4 shrink-0 rounded-full border outline-none',
        'transition-[color,box-shadow,border-color] duration-fast ease-out',
        'data-[checked]:border-primary',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
