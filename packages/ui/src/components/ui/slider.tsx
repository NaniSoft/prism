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
export interface SliderProps extends Omit<ComponentProps<'div'>, 'onChange'> {
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
 *
 * The thumb is 16px for a mouse and a trackpad and takes the 44px coarse-pointer
 * floor on touch input as a transparent band around itself, so the dot you see and
 * the dot you grab are the same size on every pointer. A press inside the band
 * drags the thumb from where it was rather than jumping the value to where you
 * pressed, which is the trade the floor costs on a six pixel rail; the arrow keys
 * and the range input behind the track still reach every value.
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
            // `ring-ring` at full strength, not shadcn's stock `ring-ring/50`. The alpha
            // is applied here rather than in the token, so the contrast gate measures a
            // compliant ring and never sees that half strength fails 3:1. This thumb is
            // the element the JSDoc above says stays focusable, so it is the one
            // indicator a keyboard user has. See the comment on the Button's base class.
            'border-primary bg-background shadow-xs ring-ring block size-4 shrink-0 rounded-full border outline-none',
            // The 44px coarse-pointer floor, and here it is a band rather than a step.
            //
            // The two obvious steps are both wrong for a thumb. Growing the dot to 44px
            // puts a ball the size of a switch on a 6px track, and Base UI positions the
            // thumb with `left: <percent>%` plus a `translate`, so the value would not
            // move, but the drawing would: a slider whose handle is seven times the
            // thickness of its own rail reads as a different control. A band reaches the
            // same 44px with the 16px dot untouched.
            //
            // The band is safe here because nothing sits within fourteen pixels of a
            // thumb to be swallowed by it. It does overlap the track, and that is the
            // trade rather than an oversight: a press inside the band grabs the thumb and
            // drags it from where it was, where a press on the bare track 10px away would
            // have jumped the value to that point. On a coarse pointer the drag is the
            // model, a 6px rail cannot be tapped to a chosen value by anyone, and the
            // keyboard still reaches every value through the range input behind it.
            //
            // Nothing about the value maths moves, and that is a claim about Base UI
            // rather than about this class string. It reads the press offset from
            // `getMidpoint(thumb)`, and it computes the value from the control's own
            // `getBoundingClientRect()`, so a pseudo-element, which contributes to neither
            // box, cannot shift either. `slider.test.tsx` asserts that the value still
            // tracks a pointer press at a given coordinate.
            'transition-[color,box-shadow] duration-fast ease-out',
            'hover:ring-4 focus-visible:ring-4',
            'data-[disabled]:pointer-events-none',
            'pointer-coarse:before:absolute pointer-coarse:before:left-1/2 pointer-coarse:before:top-1/2 pointer-coarse:before:h-11 pointer-coarse:before:w-11 pointer-coarse:before:-translate-x-1/2 pointer-coarse:before:-translate-y-1/2 pointer-coarse:before:content-[""]',
          )}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
