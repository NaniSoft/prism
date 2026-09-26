'use client'

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon, MinusIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Checkbox forwards to its Base UI root.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface CheckboxProps extends Omit<ComponentProps<'span'>, 'onChange'> {
  /** The control's accessible name when no visible label is used. */
  'aria-label'?: string
  /** The controlled ticked state. */
  checked?: boolean
  /** The initially ticked state, for an uncontrolled checkbox. */
  defaultChecked?: boolean
  /** Whether the checkbox shows a mixed state: neither ticked nor unticked. */
  indeterminate?: boolean
  /** Whether the control ignores user interaction. */
  disabled?: boolean
  /** Whether the value must be ticked before the form submits. */
  readOnly?: boolean
  /** Whether the value must be ticked before the form submits. */
  required?: boolean
  /** The form field name submitted with the form. */
  name?: string
  /** The value submitted when the checkbox is ticked. */
  value?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** Called when the ticked state changes. */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * A ticked or unticked choice, with an optional mixed state.
 *
 * The Checkbox renders as a span with a hidden native input beside it, so it
 * submits and validates like a checkbox while accepting Prism's styling. Space
 * toggles the focused control, and the indeterminate state is announced as
 * `mixed` to assistive technology. Pair it with a `FieldLabel` in a `Field`,
 * and mark it invalid with `aria-invalid` when the value is rejected.
 */
function Checkbox({ className, indeterminate, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={indeterminate}
      className={cn(
        'border-input bg-background text-primary-foreground shadow-xs peer size-4 shrink-0 rounded-sm border outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'data-[checked]:border-primary data-[checked]:bg-primary data-[indeterminate]:border-primary data-[indeterminate]:bg-primary',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {indeterminate ? (
          <MinusIcon className="size-3.5" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
