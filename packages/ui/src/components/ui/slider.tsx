'use client'

import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Slider forwards to its Base UI root.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface SliderProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** The current value, when the slider is controlled. */
  value?: number
  /** The value the slider starts at, for an uncontrolled slider. */
  defaultValue?: number
  /** The minimum allowed value. @defaultValue 0 */
  min?: number
  /** The maximum allowed value. @defaultValue 100 */
  max?: number
  /** The granularity the slider steps by. @defaultValue 1 */
  step?: number
  /** Whether the slider ignores user interaction. */
  disabled?: boolean
  /** The axis the slider moves along. @defaultValue horizontal */
  orientation?: 'horizontal' | 'vertical'
  /** The form field name submitted with the form. */
  name?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** The slider's accessible name when no visible label is used. */
  'aria-label'?: string
  /** Called as the value changes. */
  onValueChange?: (value: number) => void
}

/**
 * A control for choosing a number along a range.
 *
 * The slider renders a real range input beside the styled track, so it is
 * reachable by Tab and moved by arrow keys, with Home and End jumping to the
 * ends. Give it an `aria-label` or a visible label. Use a Slider for a value
 * that is approximate and continuous; when the exact number matters, use an
 * Input of type number.
 */
function Slider({
  className,
  'aria-label': ariaLabel,
  ...props
}: SliderProps) {
  return (
    <SliderPrimitive.Root<number>
      data-slot="slider"
      className={cn(
        'relative flex w-full touch-none items-center select-none',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        'data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="flex w-full items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track className="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
          <SliderPrimitive.Indicator className="bg-primary absolute rounded-full data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={ariaLabel}
          className={cn(
            'border-primary bg-background shadow-xs ring-ring/50 block size-4 shrink-0 rounded-full border outline-none',
            'transition-[color,box-shadow] duration-fast ease-out',
            'hover:ring-4 focus-visible:ring-4',
            'data-[disabled]:pointer-events-none',
          )}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
