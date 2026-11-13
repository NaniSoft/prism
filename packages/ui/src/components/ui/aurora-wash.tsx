import type { CSSProperties } from 'react'

import { cn } from '../../lib/utils'

/** The props an AuroraWash takes. */
export type AuroraWashProps = {
  /**
   * How present the light is, as one step down the veil ladder for every plane
   * at once. `present` is the figure a landing wears; `subtle` is the same
   * figure on a surface a reader works at, where the light is a setting rather
   * than a claim. The two are the only choices because a third is a mood, and
   * this Component will not offer one: dimming a wash by wrapping it in an
   * `opacity-*` utility multiplies whatever the planes happen to carry into
   * values nobody chose, while a step down the ladder keeps each plane on a
   * named rung.
   */
  intensity?: 'subtle' | 'present'
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
 * Each intensity is the veil step every plane carries, in the order the planes
 * are drawn: the primary leading, a series colour answering, a quieter third
 * holding the middle. `subtle` is the same ladder one rung down, so the figure
 * keeps its shape and loses one measure of presence.
 */
const VEILS = {
  present: ['bg-primary/(--veil-light)', 'bg-chart-2/(--veil-soft)', 'bg-chart-4/(--veil-whisper)'],
  subtle: ['bg-primary/(--veil-soft)', 'bg-chart-2/(--veil-whisper)', 'bg-chart-4/(--veil-faint)'],
} as const

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
 * **Every plane names a rung of the veil ladder.** The translucency a plane
 * carries is not a number this Component picked; it is one of the published
 * `veil` steps, so the wash and the bar that turns to glass and a dialog's
 * scrim are all reading one scale, and a retune of the scale reaches every
 * translucent surface in the system at once.
 *
 * **The movement is a transform and the blur is still.** Each plane is blurred
 * once, at rest, and the aurora cycle moves it on the compositor: no animated
 * filter, no animated gradient stop, nothing that repaints. The planes differ
 * only in their custom properties, so they share one keyframe and never move
 * in step, and the orbit is long because light that moves quickly reads as a
 * strobe rather than as a day. Each plane also feathers its own last tenth at
 * both ends with a mask, because a plane is a percentage of the ground it
 * fills and a fixed blur against a wide edge reads as a band on a quiet
 * surface; a tenth of the plane grows with the plane and dissolves the edge at
 * every scale.
 *
 * **It is a server Component.** No client runtime, and a reader who asked the
 * platform for less motion gets the same washes at rest through the universal
 * reduced-motion rule, which is the figure this system prefers to a summary of
 * one.
 */
function AuroraWash({ intensity = 'present', className }: AuroraWashProps) {
  const [leading, answering, holding] = VEILS[intensity]
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
       *
       * Each plane feathers its own last tenth at both ends. A plane is a
       * percentage of the ground it fills, so on a tall ground its blur is a
       * fixed 64 pixels against an edge hundreds of pixels wide, and the
       * straight bottom of the leading plane reads as a band in the middle of
       * a quiet surface. The mask is a tenth of the plane, so the feather
       * grows with the plane and the edge dissolves at every scale.
       */}
      <span
        data-slot="aurora-wash-plane"
        className={cn(
          'prism-ambient-aurora mask-t-from-90% mask-b-from-90% absolute -top-1/4 left-0 h-2/3 w-3/5 rounded-full blur-3xl',
          leading,
        )}
        style={
          {
            '--ambient-aurora-x': rem(5),
            '--ambient-aurora-y': rem(-3),
          } as CSSProperties
        }
      />
      <span
        data-slot="aurora-wash-plane"
        className={cn(
          'prism-ambient-aurora prism-ambient-delay-2 mask-t-from-90% mask-b-from-90% absolute -bottom-1/4 right-0 h-3/5 w-1/2 rounded-full blur-3xl',
          answering,
        )}
        style={
          {
            '--ambient-aurora-x': rem(-4),
            '--ambient-aurora-y': rem(2.5),
          } as CSSProperties
        }
      />
      <span
        data-slot="aurora-wash-plane"
        className={cn(
          'prism-ambient-aurora prism-ambient-delay-3 mask-t-from-90% mask-b-from-90% absolute top-1/4 left-1/3 h-1/2 w-2/5 rounded-full blur-3xl',
          holding,
        )}
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
