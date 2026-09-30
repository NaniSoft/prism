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
  /**
   * The text alternative for the value, already resolved to a string.
   *
   * **This exists because `getAriaValueText` cannot cross a server boundary, and
   * `Progress` is a client Component.** A Block that composes this one and is
   * itself a server Component has to hand the announced text over as data, and a
   * function prop from a server Component to a client Component is a build error
   * in every framework that draws that line, not a warning. The rule is worth
   * stating once: a callback prop is only expressible when the caller is already
   * in the client graph, and a published Component that composes another published
   * Component has to offer the data form for the case where it is not.
   *
   * `valueText` wins over `getAriaValueText` when both are passed, because a
   * string the caller computed is the one they meant; a thrown diagnostic says so
   * rather than silently preferring either.
   */
  valueText?: string
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
function Progress({ className, valueText, getAriaValueText, ...props }: ProgressProps) {
  if (valueText !== undefined && getAriaValueText !== undefined) {
    throw new Error(
      'Progress: a bar was given both valueText and getAriaValueText, so the announced sentence is two ' +
        "different answers to the same question and the reader gets whichever one the framework happens to " +
        'prefer. Pass the one you meant.',
    )
  }

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('flex w-full flex-col gap-2', className)}
      aria-valuetext={valueText}
      {...(getAriaValueText ? { getAriaValueText } : {})}
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
