import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The ratio Prism falls back to when a caller passes one that cannot be drawn.
 *
 * A number that is not finite, or is zero or negative, is not a ratio: it is the
 * result of a division that has not happened yet, and it is a state a caller
 * reaches by computing a ratio from data that has not loaded. Handing it to CSS
 * collapses the box to nothing, which reads as "the image failed" rather than as
 * "the ratio was not known", so the default is drawn instead and the value the
 * caller passed is reported on the element for a caller to debug.
 */
const FALLBACK_RATIO = 16 / 9

/** The props the AspectRatio accepts. */
export interface AspectRatioProps extends ComponentProps<'div'> {
  /**
   * The ratio to hold, as CSS's `aspect-ratio` value: width over height.
   *
   * A number rather than a pair, and not a keyword. `16 / 9` is the shape the
   * CSS property takes and the shape a designer writes, and the keyword set
   * (`square`, `video`) is closed and short of every ratio a caller actually has.
   */
  ratio?: number
  /** Layout only. */
  className?: string
}

/**
 * A box whose height follows its width at a stated ratio.
 *
 * **Why this is a Component and not a class.** The instinct is `className="aspect-video"`
 * and a caller who has run out of keywords writes `className="aspect-[4/3]"`. Neither
 * reaches a consumer's browser. Prism's stylesheet scans Prism's own source and
 * nothing else, because Tailwind is an internal build dependency of this package
 * and never the consumer's, so a utility that appears in no Prism source file is
 * a utility no consumer's stylesheet contains. An arbitrary value typed by a
 * consumer is therefore not a layout decision, it is a silently missing rule and
 * a box at whatever ratio its content happens to have. `ratio` is a prop so the
 * ratio is a number this package reads and applies, not a name this package
 * cannot see.
 *
 * **It is not the Diagram's canvas, and the two do not overlap.** The Diagram
 * draws nodes and the relations between them into a fixed 640 by 400 coordinate
 * space, fitting whatever coordinates a caller gives it into that space with their
 * aspect ratio kept, and its own ratio is a consequence of the canvas it draws
 * into rather than a thing the caller chooses. It is also `role="img"`: the whole
 * subtree is presentational, and the caller's sentence is what a screen reader
 * gets. This Component holds arbitrary content at a caller's ratio and keeps that
 * content in the accessibility tree, so a video, a screenshot, a map or a
 * placeholder that has not loaded can sit in one without being turned into a
 * picture of itself. A Diagram cannot be used for any of those, and this cannot
 * draw a relation.
 *
 * **The content is clipped.** A ratio that is only a ratio leaves the content free
 * to overflow it, and a box whose height is fixed by its width with content
 * spilling out of the bottom is a box that has failed at the one job it has. A
 * caller whose content should escape passes `overflow-visible` through
 * `className`, which is the only override the Component has and which is a
 * decision a caller makes about their own content rather than about the ratio.
 *
 * **A ratio that cannot be drawn falls back rather than collapsing.** A caller
 * computing a ratio from data that has not arrived passes `NaN` or `0`, and
 * `aspect-ratio: 0` is a box with no height at all, which looks like a failed
 * image rather than a missing number. The default ratio is drawn instead and the
 * value the caller passed is carried on the element as `data-ratio`, so the
 * substitution is visible in the markup rather than only in the screenshot.
 *
 * It is a server Component. It holds no state and reads nothing, so a hundred
 * media placeholders cost no JavaScript.
 */
function AspectRatio({ ratio = FALLBACK_RATIO, className, style, ...props }: AspectRatioProps) {
  const drawable = typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0

  return (
    <div
      data-slot="aspect-ratio"
      // The caller's own value is reported beside the one that was drawn, so a
      // substituted ratio is legible in the DOM and not only in the layout.
      data-ratio={drawable ? ratio : String(ratio)}
      style={{ aspectRatio: drawable ? ratio : FALLBACK_RATIO, ...style }}
      className={cn('relative w-full overflow-hidden', className)}
      {...props}
    />
  )
}

export { AspectRatio }
