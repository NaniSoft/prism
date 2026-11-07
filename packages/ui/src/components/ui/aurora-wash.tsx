import type { CSSProperties } from 'react'

import { cn } from '../../lib/utils'

/** The props an AuroraWash takes. */
export type AuroraWashProps = {
  /**
   * Layout only, exactly as on every Component. The wash fills the nearest
   * positioned ancestor, so the caller's job is to give it one and to keep the
   * content above it; the wash never carries the content and never takes the
   * pointer.
   */
  className?: string
}

/**
 * A length in rem, assembled where it is used.
 *
 * A plane's orbit is geometry, and geometry is arithmetic rather than copy: the
 * numbers are written as numbers and the unit is attached once, where the
 * custom property is named.
 */
const rem = (value: number) => `${value}rem`

/**
 * Light moving through a ground: two or three large translucent planes in the
 * pack's own colours, each on its own long orbit of the aurora cycle.
 *
 * **It is a wash, and it follows the wash law.** The stops are semantic, the
 * element is `aria-hidden`, and it never touches text: the planes sit behind
 * content in a clipped layer, fading toward the pack's own primary and series
 * colours rather than carrying a hue of their own. A wash in one pack is a
 * different wash in another, which is the point; a wash that looked the same
 * in every pack would be an image.
 *
 * **The movement is a transform and the blur is still.** Each plane is blurred
 * once, at rest, and the aurora cycle moves it on the compositor: no animated
 * filter, no animated gradient stop, nothing that repaints. The planes differ
 * only in their custom properties, so they share one keyframe and never move
 * in step, and the orbit is long because light that moves quickly reads as a
 * strobe rather than as a day.
 *
 * **It is a server Component.** No props beyond layout, no client runtime, and
 * a reader who asked the platform for less motion gets the same washes at rest
 * through the universal reduced-motion rule, which is the figure this system
 * prefers to a summary of one.
 */
function AuroraWash({ className }: AuroraWashProps) {
  return (
    <div
      data-slot="aurora-wash"
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {/*
       * Three planes: the primary leading from the top start side, a series
       * colour answering from the bottom end side, and a quieter third that
       * keeps the middle of the ground from going flat between them. The
       * delays break the lockstep the same way the ambient delays do.
       */}
      <span
        data-slot="aurora-wash-plane"
        className="prism-ambient-aurora absolute -top-1/4 left-0 h-2/3 w-3/5 rounded-full bg-primary/20 blur-3xl"
        style={
          {
            '--ambient-aurora-x': rem(5),
            '--ambient-aurora-y': rem(-3),
          } as CSSProperties
        }
      />
      <span
        data-slot="aurora-wash-plane"
        className="prism-ambient-aurora prism-ambient-delay-2 absolute -bottom-1/4 right-0 h-3/5 w-1/2 rounded-full bg-chart-2/15 blur-3xl"
        style={
          {
            '--ambient-aurora-x': rem(-4),
            '--ambient-aurora-y': rem(2.5),
          } as CSSProperties
        }
      />
      <span
        data-slot="aurora-wash-plane"
        className="prism-ambient-aurora prism-ambient-delay-3 absolute top-1/4 left-1/3 h-1/2 w-2/5 rounded-full bg-chart-4/10 blur-3xl"
        style={
          {
            '--ambient-aurora-x': rem(3),
            '--ambient-aurora-y': rem(3.5),
          } as CSSProperties
        }
      />
    </div>
  )
}

export { AuroraWash }
