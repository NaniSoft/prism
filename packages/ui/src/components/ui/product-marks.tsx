import type { ReactElement } from 'react'

/**
 * The five NaniSoft family marks, as drawn components.
 *
 * Each is the member's own logo, held in step with the drawing that member's own
 * site draws in its bar. A consumer that lists the family, in a header menu, a
 * product band, or a switcher, composes these into `ProductMark`'s `mark` slot
 * rather than copying a drawing, so a reader meets one sign wherever a member
 * appears.
 *
 * The ink is a token class rather than `currentColor`, which this package does
 * not use: a stroke painted through a token survives a pack boundary the way a
 * token does, and the accent classes read the pack their own boundary carries.
 * The drawing is `aria-hidden`: the name beside it is the announced half, as it
 * is on `ProductMark` itself.
 */

/** The marks' canvas: every drawing is laid out on the same grid. */
const CANVAS = 32

/** The NaniSoft mark: three product rays converge into one ink. */
function NaniSoftMark({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} fill="none" aria-hidden className={className}>
      <g strokeLinecap="round" strokeWidth={2.5}>
        <path d={`M 4 8 L 17 14`} className="prism-mark__ray-1" />
        <path d={`M 4 16 L 17 16`} className="prism-mark__ray-2" />
        <path d={`M 4 24 L 17 18`} className="prism-mark__ray-3" />
        <path d={`M 21 16 L 28 16`} className="stroke-foreground" />
        <path d={`M 17 16 L 21 11.5 L 21 20.5 Z`} className="fill-foreground" stroke="none" />
      </g>
    </svg>
  )
}

/** The Nexus mark: the three stages of one cycle. */
function NexusMark({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} fill="none" aria-hidden className={className}>
      <g strokeLinecap="round" strokeWidth={2.4} className="stroke-foreground">
        <path d={`M 17.5 10.1 L 22 17.9`} />
        <path d={`M 20.5 20.5 L 11.5 20.5`} />
        <path d={`M 10 17.9 L 14.5 10.1`} />
      </g>
      <circle cx={16} cy={7.5} r={2.8} className="prism-mark__accent" />
      <circle cx={23.5} cy={20.5} r={2.6} fill="none" strokeWidth={1.6} className="stroke-foreground" />
      <circle cx={8.5} cy={20.5} r={2.6} fill="none" strokeWidth={1.6} className="stroke-foreground" />
    </svg>
  )
}

/** The Atlas mark: the estate in ink and its twin in the pack's primary, meeting at one peak. */
function AtlasMark({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} fill="none" aria-hidden className={className}>
      <g strokeLinecap="round" strokeWidth={2.5}>
        <path d={`M 4 21.5 L 16 16`} className="stroke-foreground" />
        <path d={`M 16 16 L 28 21.5`} className="prism-mark__accent-stroke" />
      </g>
      <circle cx={16} cy={16} r={2.4} className="prism-mark__accent" />
    </svg>
  )
}

/** The AlphaLens mark: the market as parallel ink rays, the lens bending them to one point. */
function AlphaLensMark({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} fill="none" aria-hidden className={className}>
      <g strokeLinecap="round" strokeWidth={2.5} className="stroke-foreground">
        <path d={`M 4 12 L 17.5 12`} />
        <path d={`M 4 20 L 17.5 20`} />
        <path d={`M 17.5 12 L 28 16`} className="prism-mark__accent-stroke" />
        <path d={`M 17.5 20 L 28 16`} className="prism-mark__accent-stroke" />
      </g>
      <circle cx={17.5} cy={16} r={6.5} className="prism-mark__accent-stroke" />
      <circle cx={28} cy={16} r={1.9} className="prism-mark__point" />
    </svg>
  )
}

/** The Prism mark: one beam in, refracted through the chart hues. */
function PrismMark({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} fill="none" aria-hidden className={className}>
      <g strokeLinecap="round">
        <path d={`M 4 16 L 13 16`} strokeWidth={2.5} className="stroke-foreground" />
        <path d={`M 15 14 L 28 8`} strokeWidth={2.5} className="prism-mark__ray-1" />
        <path d={`M 15 16 L 28 16`} strokeWidth={2.5} className="prism-mark__ray-2" />
        <path d={`M 15 18 L 28 24`} strokeWidth={2.5} className="prism-mark__ray-3" />
        <path d={`M 13 12 L 15 20 L 13 20 Z`} stroke="none" className="prism-mark__point" />
      </g>
    </svg>
  )
}

export { NaniSoftMark, NexusMark, AtlasMark, AlphaLensMark, PrismMark }
