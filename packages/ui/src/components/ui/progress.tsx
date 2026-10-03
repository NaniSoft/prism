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
   *
   * **Pass it only when you have a sentence, because leaving it off is now the
   * default rather than a way to suppress one.** `ProgressRoot` computes an
   * `aria-valuetext` of its own, and this Component used to overwrite it with
   * nothing on every bar. See the note at the call site for the mechanism.
   */
  valueText?: string
}

/**
 * The fraction of the track a value fills, from 0 to 1, or `null` for a task whose
 * length is unknown.
 *
 * **This is Base UI's arithmetic restated, and the restatement is the point.**
 * `ProgressIndicator` writes `width: <percentage>%` as an inline style and
 * `ProgressRoot` owns `aria-valuenow`, and both are computed from the same three
 * numbers this function is handed. A transform needs a unitless factor rather than
 * a percentage of a box, so the factor has to exist somewhere JavaScript can put
 * it, and there are exactly two ways to get one: restate the three lines, or parse
 * the percentage back out of Base UI's own inline style string. The restatement is
 * the honest one. These are the same three operations in the same order, and a
 * reader that parses `"68%"` off another package's rendered output is coupled to
 * the way that package chooses to write it rather than to what it means.
 *
 * `progress.test.tsx` holds the two to each other by asserting the transform
 * against `aria-valuenow` rather than against a second copy of these three lines,
 * so a change on either side that the other does not follow is a failing test
 * rather than a bar that draws one number and announces another.
 */
function fillOf(value: number | null, min: number, max: number): number | null {
  /*
   * `null` and the two non-finite numbers are the indeterminate condition, and Base
   * UI reads all three as one, so this returns no transform at all for exactly the
   * three cases in which it writes no width either. That symmetry is the whole of
   * the indeterminate case: there is no transform, so there is nothing to animate
   * and nothing for a reader who cannot see motion to be missing.
   */
  if (value === null || !Number.isFinite(value)) return null
  const percent = (value - min) * 100 / (max - min)
  /*
   * `max === min` is a division by zero rather than a task, and the bar on it is a
   * bar at zero rather than a bar at `NaN`, which is the reading Base UI clamps to.
   * The infinities a real value on a reversed range produces need no case of their
   * own: the same two comparisons resolve them to the nearer bound.
   */
  const clamped = Number.isNaN(percent) ? 0 : Math.min(100, Math.max(0, percent))
  return clamped / 100
}

/**
 * A bar that reports how far a task has progressed.
 *
 * The bar exposes its value, minimum and maximum through ARIA, so a screen
 * reader announces the position rather than the pixels. It is a status, not a
 * control: the reader watches it, and an interrupting task uses an Alert
 * instead. Pass `value={null}` for a task of unknown length, where the bar is
 * announced as indeterminate.
 *
 * **A bar announces a sentence, not only a number, and the sentence is the
 * default rather than something you have to supply.** `aria-valuenow` is the
 * position on the scale; `aria-valuetext` is what a reader actually hears for it,
 * and Base UI computes one for every bar: the value as a percentage of the range
 * for a determinate task, and `indeterminate progress` for an unknown one. Pass
 * `valueText` when your task has a better sentence than a percentage, which most
 * real ones do: "42 of 300 files", "step 3 of 7", "6 minutes remaining". Passing
 * `getAriaValueText` instead computes one in the browser, and the two are mutually
 * exclusive because they are two different answers to the same question.
 *
 * **The fill is a transform and the transform is the whole of its geometry.**
 * The indicator is as wide as the track at every value and is scaled along the
 * reading axis, so advancing a bar is a compositor animation rather than a layout
 * one. `Progress` is one of the two or three most-composed Components in this
 * package, which is why this is stated here rather than left as an
 * implementation detail: an animated `width` makes the browser settle layout on
 * every frame of every bar on every page that has one, and the cost is paid by the
 * consumer who composed the most bars rather than by the one who wrote the bar.
 *
 * **A consumer who styled the indicator's width has to move with it.** A rule that
 * sized or constrained `[data-slot="progress-indicator"]` was sizing a box the
 * component no longer resizes, and the honest replacement is a rule on its
 * `transform`, on the track's `height`, or on the width of the track itself.
 *
 * **The scale runs from the inline start edge in both directions**, and it takes an
 * `rtl:` variant to say so rather than a logical property, because CSS has no
 * logical keyword for `transform-origin` and Tailwind 4.3's `origin` utility ships
 * the nine physical positions and nothing else. `origin-left` is the inline start
 * under a left-to-right `dir` and `rtl:origin-right` is the inline start under a
 * right-to-left one, which is the same edge Base UI's own `inset-inline-start: 0`
 * anchors the fill to, so the bar reads from the same end in either direction.
 */
function Progress({
  className,
  valueText,
  getAriaValueText,
  value,
  max = 100,
  min = 0,
  ...props
}: ProgressProps) {
  /*
   * The guard is here, above the return, and that is the only place it could be.
   * The conflict is between two of this Component's own props, so it is decided
   * before any element exists: no prop merge runs, nothing Base UI does can change
   * the outcome, and the diagnostic names the choice rather than a framework's
   * preference. `aria-valuetext` reaching the root is a separate question with a
   * separate answer, and one does not decide the other.
   */
  if (valueText !== undefined && getAriaValueText !== undefined) {
    throw new Error(
      'Progress: a bar was given both valueText and getAriaValueText, so the announced sentence is two ' +
        "different answers to the same question and the reader gets whichever one the framework happens to " +
        'prefer. Pass the one you meant.',
    )
  }

  const fill = fillOf(value, min, max)

  /*
   * `aria-valuetext` is SPREAD onto the root below rather than assigned, and that
   * is the whole of this Component's part in what a reader hears.
   *
   * `ProgressRoot` builds a default for it: the clamped value formatted as a
   * percentage of the range for a determinate bar, and `indeterminate progress`
   * for an unknown one. Base UI's prop merge (`mergeProps` into
   * `mutablyMergeInto`) assigns every key the caller passes, including an explicit
   * `undefined`, and the root merges its own `defaultProps` FIRST and the caller's
   * `elementProps` second. So writing `aria-valuetext={undefined}` here did not
   * leave the default alone, it replaced it with nothing, on every bar in every
   * consumer: the value was announced through `aria-valuenow` and the formatted
   * sentence was never in the tree at all. The same overwrite ate
   * `getAriaValueText`'s return value, so the callback ran and its answer was
   * discarded, which is also why `format` and `locale` had nothing to shape.
   *
   * Passing the key only when `valueText` is defined is what lets the default
   * survive. `{...props}` lands after both of this Component's own answers, so a
   * consumer who writes `aria-valuetext` on the Component directly still wins over
   * the default underneath, which is the precedence the callback and the string
   * already have between them.
   */
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('flex w-full flex-col gap-2', className)}
      value={value}
      min={min}
      max={max}
      {...(valueText !== undefined ? { 'aria-valuetext': valueText } : {})}
      {...(getAriaValueText ? { getAriaValueText } : {})}
      {...props}
    >
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="bg-muted relative h-2 w-full overflow-hidden rounded-full"
      >
        {/*
          `scaleX` rather than a width, and the origin is a property of reading
          direction rather than of the component: `origin-left` fills from the inline
          start under a left-to-right `dir`, `rtl:origin-right` fills from the inline
          start under a right-to-left one, and both compile to a single-value origin
          so the bar keeps growing about its own centre line. Tailwind emits the
          variant after the bare rule, and the variant's `:where()` contributes no
          specificity, so the two tie exactly and the later one is the one that wins.

          The inline `width` is the load-bearing part of that. Base UI sets
          `width: <percentage>%` on this element itself, an inline declaration, so no
          class can override it and `w-full` alone would leave every bar at the width
          Base UI last wrote. The style is merged over Base UI's own rather than
          beside it, which is the only way to reach it: the upstream `style` prop is
          the last thing merged into the element, so this is the one place a width
          can be taken back.

          At zero the fill is a zero-area box inside a track that clips, and a box
          with no area paints nothing, so `value={0}` is an empty track rather than a
          track with a hairline in it. Nothing sets `opacity` here to achieve that:
          an opacity that reached zero with the value would take the shrink away with
          it, so a bar falling back to zero would blink out instead of emptying, and
          that is a worse defect than the one it prevents.
        */}
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-primary origin-left h-full w-full rounded-full transition-transform duration-base ease-out rtl:origin-right"
          style={fill === null ? undefined : { width: '100%', transform: `scaleX(${fill})` }}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
