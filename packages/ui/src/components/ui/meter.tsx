import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The tones a Meter's fill can take, and what each one is for.
 *
 * A tone is a judgement the caller makes, not something the Component infers. The
 * Component can see that a value is 95 percent of a maximum; it cannot see that
 * 95 percent is a problem. The same number is routine on a latency budget and
 * urgent on a disk quota, so a Component that coloured itself would be making a
 * claim about the caller's product on the caller's behalf.
 */
export type MeterTone = 'neutral' | 'success' | 'warning' | 'destructive'

/**
 * A line on the scale, and the tone the fill takes once the value is past it.
 *
 * Thresholds are how a bounded measure earns its keep. A fill alone says "this
 * much"; a fill with a notch on it says "this much, and the limit is there". That
 * is the information a quota, a budget and a usage limit actually need, and it is
 * the reason this is a Meter rather than a Progress.
 *
 * The list is sorted and the last threshold that `value` has passed wins, so a
 * caller does not have to get the order right. Equal thresholds resolve to the
 * later one, which is the same rule a ladder of limits follows.
 */
export type MeterThreshold = {
  /** The value at which this threshold begins to apply. */
  at: number
  /** The tone the fill takes from here up to the next threshold. */
  tone: MeterTone
}

/** The props the Meter accepts. */
export interface MeterProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The measured value.
   *
   * There is no default. A meter with no value is a scale with no reading, which
   * is a picture rather than a measurement, and the caller states the number.
   */
  value: number
  /**
   * The upper bound of the scale. @defaultValue 100
   *
   * A percentage is a special case of a bounded measure, not the general one, so
   * `max` exists and a meter of 4096 gigabytes is as ordinary as one of 100
   * percent.
   */
  max?: number
  /** The lower bound of the scale. @defaultValue 0 */
  min?: number
  /**
   * The accessible name of the meter, read before its value.
   *
   * Required rather than defaulted, because a page with two meters is a page where
   * a reader cannot tell which is which, and the name is the caller's word. A
   * meter that ships its own name is a meter every consumer inherits in English.
   */
  label: string
  /**
   * The words for the value, read instead of the number.
   *
   * A bare number is a poor announcement: "72" says nothing about what is being
   * measured or in what unit. A caller with a formatted value passes it here, and
   * a caller whose number is self-describing leaves it unset.
   */
  valueText?: string
  /**
   * The lines on the scale, in any order.
   *
   * Each is a notch the reader can see and the tone the fill takes past it. A
   * meter with no thresholds is a neutral fill, which is the honest default: most
   * measurements are not near a limit.
   */
  thresholds?: readonly MeterThreshold[]
  /**
   * The tone of the fill when no threshold applies, or above the last one.
   *
   * Left unset the fill is the foreground colour, which is the neutral reading.
   * Set it when the high end of the scale is itself the alarm.
   */
  tone?: MeterTone
  /**
   * The text under the scale, which is where the reading goes.
   *
   * The visible value belongs beside the track rather than inside it, because a
   * number printed on a two-pixel bar is unreadable at any size worth reading. A
   * caller that wants no text passes nothing and gets the track alone, which is
   * correct for a meter inside a dense row where the number is in the row.
   */
  children?: ReactNode
}

/** The fill and the ring, per tone, from the existing semantic roles. */
const TONE_FILL: Record<MeterTone, string> = {
  neutral: 'bg-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

const TONE_NOTCH: Record<MeterTone, string> = {
  // A neutral notch is the border colour, because a notch that is the same weight
  // as the fill disappears into it, and a scale whose own ticks cannot be seen is
  // a scale with no limit on it.
  neutral: 'bg-border',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

/** The value clamped into the scale, so a reading outside the bounds is not drawn outside the track. */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

/** The tone the fill takes, which is the last threshold passed and then the caller's default. */
function toneFor(
  value: number,
  thresholds: readonly MeterThreshold[],
  fallback: MeterTone | undefined,
): MeterTone {
  const passed = [...thresholds]
    .filter((threshold) => Number.isFinite(threshold.at) && value >= threshold.at)
    .sort((a, b) => a.at - b.at)
    .at(-1)
  return passed?.tone ?? fallback ?? 'neutral'
}

/**
 * A bounded measure, drawn as a scale with its limits on it.
 *
 * A Meter and a Progress both show a value against a maximum, and the difference
 * is the whole reason this is a separate Component. A Progress is a task moving
 * toward an end whose length is not known in advance, and it is read while it
 * moves. A Meter is a quantity that already has an answer, bounded by a limit the
 * caller knows, and it is read as a standing measurement. A disk at 95 percent, a
 * token budget, a score out of a hundred, a queue depth against its ceiling.
 *
 * **The thresholds are the design.** A fill on its own is one number, and a number
 * with no limit beside it cannot be acted on: 72 percent of what, and is that
 * much? Drawing the caller's own limits as notches on the track puts the answer
 * next to the reading, and a consumer who passes a latency budget gets a latency
 * budget rather than a generic bar that happens to be filled to a similar
 * fraction. The Component has no opinion about which numbers matter; the notches
 * are the caller's.
 *
 * **It is drawn as a hairline, not a bar.** The Progress in this system is a
 * two-pixel rounded bar, and a Meter that looked like one would be read as one.
 * The difference is visible before it is read: a Meter is a scale, drawn on a rule
 * with ticks, where a Progress is a task, drawn as a fill in a trough.
 *
 * **It is not a live region.** A meter's value changing is usually the result of
 * something else happening, and that something else is what should be announced. A
 * consumer that wants the reading announced wraps it in a LiveRegion, which is
 * the same split every other Component here makes between the thing that changed
 * and the thing that reports it.
 */
function Meter({
  className,
  value,
  max = 100,
  min = 0,
  label,
  valueText,
  thresholds = [],
  tone,
  children,
  ...props
}: MeterProps) {
  const reading = clamp(value, min, max)
  const span = max - min
  // A zero-width scale has no fraction, and dividing by it yields a NaN that
  // reaches the DOM as a width. A degenerate scale draws empty and still
  // announces, because a Component that renders nothing is worse than one that
  // renders an empty track.
  const percent = span === 0 ? 0 : ((reading - min) / span) * 100
  const resolved = toneFor(reading, thresholds, tone)

  return (
    <div data-slot="meter" className={cn('flex w-full flex-col gap-1.5', className)} {...props}>
      <div
        data-slot="meter-track"
        // `role="meter"` and not `role="progressbar"`: the two are distinguished
        // by exactly the distinction this Component exists for, and assistive
        // technology reports them differently. A meter is a standing measurement.
        role="meter"
        aria-label={label}
        aria-valuenow={reading}
        aria-valuemin={min}
        aria-valuemax={max}
        {...(valueText === undefined ? null : { 'aria-valuetext': valueText })}
        className="bg-border relative block h-px w-full"
      >
        <div
          data-slot="meter-fill"
          className={cn('absolute inset-y-0 left-0', TONE_FILL[resolved])}
          style={{ width: `${percent}%` }}
        />
        {/*
         * The notches sit above the fill and are `aria-hidden`, because the value
         * is already announced and a tick mark is not an additional reading. They
         * are one pixel wide and full height, so a limit reads as a mark on the
         * rule rather than as another segment of the fill, which is what
         * distinguishes a threshold from a portion.
         */}
        {thresholds.map((threshold, index) => {
          const at = clamp(threshold.at, min, max)
          if (span === 0) return null
          return (
            <span
              key={`${threshold.at}-${index}`}
              data-slot="meter-threshold"
              aria-hidden="true"
              className={cn('absolute inset-y-0 w-px', TONE_NOTCH[threshold.tone])}
              style={{ left: `${((at - min) / span) * 100}%` }}
            />
          )
        })}
      </div>
      {children === undefined ? null : (
        <div data-slot="meter-caption" className="text-muted-foreground flex items-baseline justify-between gap-3 text-xs">
          {children}
        </div>
      )}
    </div>
  )
}

export { Meter }
