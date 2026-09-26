'use client'

import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Progress forwards to its Base UI root.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface ProgressProps extends ComponentProps<'div'> {
  /**
   * The current value. Pass `null` for an indeterminate task.
   *
   * There is no default: a progress bar without a value is a claim, so the
   * consumer states where the task is.
   */
  value: number | null
  /** The maximum value. @defaultValue 100 */
  max?: number
  /** The minimum value. @defaultValue 0 */
  min?: number
  /** Options passed to `Intl.NumberFormat` when the value is rendered. */
  format?: Intl.NumberFormatOptions
  /** The locale used when formatting the value. */
  locale?: Intl.LocalesArgument
  /** Returns the text alternative announced for a value. */
  getAriaValueText?: (formattedValue: string, value: number | null) => string
}

/**
 * A bar that reports how far a task has progressed.
 *
 * The bar exposes its value, minimum and maximum through ARIA, so a screen
 * reader announces the position rather than the pixels. It is a status, not a
 * control: the reader watches it, and an interrupting task uses an Alert
 * instead. Pass `value={null}` for a task of unknown length, where the bar is
 * announced as indeterminate.
 */
function Progress({ className, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('flex w-full flex-col gap-2', className)}
      {...props}
    >
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="bg-muted relative h-2 w-full overflow-hidden rounded-full"
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-primary h-full rounded-full transition-[width] duration-base ease-out"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
