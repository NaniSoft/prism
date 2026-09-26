'use client'

import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Switch forwards to its Base UI root.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface SwitchProps extends Omit<ComponentProps<'span'>, 'onChange'> {
  /** The control's accessible name when no visible label is used. */
  'aria-label'?: string
  /** The controlled active state. */
  checked?: boolean
  /** The initially active state, for an uncontrolled switch. */
  defaultChecked?: boolean
  /** Whether the control ignores user interaction. */
  disabled?: boolean
  /** Whether the user may not change the state. */
  readOnly?: boolean
  /** Whether the state must be active before the form submits. */
  required?: boolean
  /** The form field name submitted with the form. */
  name?: string
  /** The value submitted when the switch is on. */
  value?: string
  /** The value submitted when the switch is off. */
  uncheckedValue?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** Called when the active state changes. */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * A binary control that takes effect immediately.
 *
 * Use a Switch when flipping it applies the change at once, without a submit
 * step: enabling notifications, turning a feature on. The control renders a
 * hidden native input, so it submits with a form, and Space toggles it while
 * focused. When the change needs an explicit save, use a Checkbox instead.
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'border-transparent bg-input shadow-xs inline-flex h-5 w-9 shrink-0 items-center rounded-full border p-0.5 outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'data-[checked]:bg-primary data-[unchecked]:bg-input',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-background pointer-events-none block size-4 rounded-full shadow-xs',
          'transition-transform duration-base ease-out',
          'data-[checked]:translate-x-4 data-[unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
