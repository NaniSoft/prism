import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * A change against the previous reading, as a number whose sign is the direction.
 *
 * The sign is the direction, and that is the whole of the type. The shape this
 * refuses is `{ value: number, direction: 'up' | 'down' }`, which is the shape a
 * caller reaches for first and which is wrong twice over: it lets a caller put a
 * rising mark on a falling number, and it gives one fact two spellings, so a
 * call site holding one of them wrong reads the wrong way with nothing to catch
 * it. A number has exactly one sign and there is nothing left to declare.
 *
 * **There is no flat member, and a zero draws no direction mark.** A zero is a
 * real reading and the number is still shown, but nothing is drawn beside it,
 * because a mark on a figure that did not move is a claim the data does not
 * make. An arrow says the reading changed, and a reader who believes it is
 * looking at movement that is not there.
 *
 * The number is the caller's own figure in the caller's own units. A delta of
 * `0.12` is not a mistake here, and Prism does not attach a percent sign to it
 * on the chance that it is one; see `MetricProps.deltaFormat` for what it prints
 * instead.
 */
export type MetricDelta = number

/** The mark a rising reading takes. A glyph, not a drawing, and the reason is in the JSDoc. */
const RISING = '↑'

/** The mark a falling reading takes. */
const FALLING = '↓'

/** The props the Metric accepts. */
export interface MetricProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The figure itself, the number the whole Item exists to show.
   *
   * A `ReactNode` rather than a `number`, for the reason a Component cannot
   * print a figure it cannot see the unit of: a caller's figure is often a value
   * it formatted itself, and a `number` prop would make it either ship that as a
   * string outside this Component or lose the unit it belongs to. Prism takes the
   * node and formats nothing.
   */
  value: ReactNode
  /**
   * What the figure measures, read under it rather than above it.
   *
   * Required, because a figure with nothing saying what it is is a number a
   * reader has to guess the meaning of, which is the one thing a headline figure
   * cannot afford.
   */
  label: ReactNode
  /**
   * The unit, set beside the figure at the Label step.
   *
   * A prop rather than part of `value` so a consumer that wants the unit to scale
   * with the figure puts it in `value` and a consumer that wants it quiet puts
   * it here. Omit it for a figure that is self-describing.
   */
  unit?: ReactNode
  /** The change against the previous reading. See `MetricDelta`. */
  delta?: MetricDelta
  /**
   * The words for the delta, given the number.
   *
   * There is no default that knows the unit, and that is the point: a delta of
   * `0.12` is twelve percent, twelve cents or twelve milliseconds, and a
   * Component that guessed would be claiming a caller's units. The fallback is
   * the number itself, so a caller who passes a fraction and no formatter gets
   * `0.12` printed, which is honest and usually not what was wanted. Pass the
   * formatter. The return is a `ReactNode` rather than a string, because a caller
   * that already composed the words carries them as one and a plain string is the
   * same value.
   */
  deltaFormat?: (value: number) => ReactNode
  /**
   * The line under the label, for whatever the caller wants said about the
   * figure: the period it covers, the source it came from, the caveat that
   * matters this week.
   */
  hint?: ReactNode
}

/**
 * One figure, read first, with the words that say what it is underneath it.
 *
 * **A metric is read as a number, so the label goes under the value.** The
 * label-first arrangement is the one most stat tiles use, and it asks a reader
 * to read a heading before they know what the heading is about. A Metric
 * inverts it: the figure lands first, at the Title step of the type scale, and
 * the name is the second thing read. The cost is real and worth naming, because
 * a column of metrics read top to bottom puts the names at different heights. A
 * dashboard row is scanned by the figures and settled by the names, and a caller
 * who wants a column of named figures is looking for a table rather than for
 * this.
 *
 * **The direction is derived, never declared.** See `MetricDelta`. A Metric that
 * took a `direction` beside the number would be able to draw a rising mark on a
 * falling reading, which is a defect a reader sees and a type checker does not,
 * so the direction has nowhere to be written but the sign it already came from.
 *
 * **The mark is a glyph rather than a drawing, and that is what makes the
 * direction localisable.** The mark is a character, not an icon set and not a
 * CSS triangle, so assistive technology announces it with the platform's own
 * name for the character, in the reader's own language. The rejected
 * alternative is a `title` attribute, or an `aria-label`, holding the word up or
 * down, which would put a sentence in English into every consumer's product and
 * leave the consumer no way to translate it. The cost of the glyph is that not
 * every screen reader names every arrow, so the number beside it is the reading
 * and the mark is the quicker one.
 *
 * **A string value is set in the mono face and a composed value is not.** The
 * mono stack in this system annotates machine-readable readings, and a figure a
 * consumer formatted itself is one of them: a caller's grouped thousands, its
 * percentage, its currency. The rejected alternative is a `monospace` prop,
 * which pushes the same decision onto every caller, and the decision is the same
 * for all of them. A value that arrives as a node rather than a string is a
 * figure the consumer composed out of several parts, and setting that in mono
 * would put a machine face on a sentence.
 *
 * **Prism formats only the delta, and the fallback is the bare number.** The
 * figure is a node and the unit is a node, so the only number this Component
 * prints is the delta, and it prints it with the caller's formatter when there is
 * one and with the number itself when there is not. A Component cannot print a
 * delta it has no unit for, and a default that guessed a percent sign would be a
 * claim about the caller's domain. The cost of that refusal is visible: a caller
 * who passes a fraction and no formatter gets `0.12` printed, which is honest and
 * usually not what was wanted. See `deltaFormat`.
 *
 * It is a server Component: no hook, no state, no effect, and nothing here is
 * decided at hydration time. The whole figure is markup.
 */
function Metric({
  className,
  value,
  label,
  unit,
  delta,
  deltaFormat,
  hint,
  ...props
}: MetricProps) {
  // A delta that is not a finite number is dropped rather than printed, because
  // "NaN" under a figure is a second claim about the figure and "Infinity" is a
  // third, and neither is a reading.
  const shown = typeof delta === 'number' && Number.isFinite(delta) ? delta : undefined
  const read = deltaFormat ?? ((change: number) => String(change))

  return (
    <div data-slot="metric" className={cn('flex w-full flex-col', className)} {...props}>
      <div data-slot="metric-figure" className="flex flex-wrap items-baseline gap-x-2">
        <span
          data-slot="metric-value"
          className={cn(
            'text-2xl font-semibold tracking-tight tabular-nums',
            // A string is a machine-readable reading, and the mono stack is what
            // this system annotates one with. A node is a composed figure and
            // stays in the interface face.
            typeof value === 'string' && 'font-mono',
          )}
        >
          {value}
        </span>
        {unit === undefined ? null : (
          <span data-slot="metric-unit" className="text-muted-foreground text-sm font-medium">
            {unit}
          </span>
        )}
      </div>

      {shown === undefined ? null : (
        <span
          data-slot="metric-delta"
          className="text-muted-foreground mt-1 flex items-baseline gap-1 text-sm tabular-nums"
        >
          {shown === 0 ? null : (
            <span data-slot="metric-delta-mark">{shown > 0 ? RISING : FALLING}</span>
          )}
          {read(shown)}
        </span>
      )}

      <span data-slot="metric-label" className="text-muted-foreground text-sm font-medium">
        {label}
      </span>

      {hint === undefined ? null : (
        <span data-slot="metric-hint" className="text-muted-foreground text-xs">
          {hint}
        </span>
      )}
    </div>
  )
}

export { Metric }
