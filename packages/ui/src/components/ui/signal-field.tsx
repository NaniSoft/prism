import type { CSSProperties } from 'react'

import { cn } from '../../lib/utils'

/**
 * How many marks a field draws, and how they are arranged.
 *
 * A field is atmosphere, and atmosphere is the one thing in this system that is
 * allowed to be a number rather than data. The count is a prop rather than a
 * constant because a hero panel beside a two-column hero and a full-bleed
 * background behind a title want very different densities, and a fixed count
 * would have one of them too sparse or the other too busy.
 */
export type SignalFieldProps = {
  /**
   * How many marks the field draws. Read as a suggestion and clamped to a small
   * range, because a field is a texture and a texture with four hundred marks is
   * a chart that lost its labels.
   */
  count?: number
  /**
   * A mark the drawing is about, given as a fraction of the field. The field
   * centres the emphasis and dims the rest, which is what makes a field read as
   * a system with a focus rather than as scattered dots.
   */
  emphasisAt?: number
  /** The name of the drawing, or `decorative`. See `PulseGraphProps`. */
  label?: string
  decorative?: boolean
  /**
   * Whether the marks drift. Off by default: a field behind a reading passage
   * is the worst place for movement a reader did not ask for, and the drift is
   * the first thing a reader with vestibular sensitivity will ask to have gone.
   */
  drift?: boolean
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The canvas the field draws into, in its own user units.
 *
 * Deliberately oversized relative to the panel it usually fills, because a field
 * that ends where the panel ends is a grid and a grid reads as content. The
 * marks are placed on a low-discrepancy walk rather than at random, so no two
 * fields ever look alike and none of them looks hand-scattered, while remaining
 * reproducible between server render and client hydration. A field that changed
 * on every render would be a hydration mismatch, which is a correctness bug
 * dressed as variety.
 */
const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 700

/** The largest a mark is drawn, in user units. */
const MAX_MARK = 3

/**
 * The marks, placed by a golden-angle walk.
 *
 * A golden angle is the one arrangement that looks uncorrelated while being
 * fully determined by its index, which is what this needs: reproducible
 * without a seed, and evenly spread without a grid. The modulus keeps every
 * mark inside the canvas without a rejection loop, so the count is honoured
 * exactly rather than approximately.
 */
function marks(count: number): Array<{ x: number; y: number; r: number }> {
  const golden = 2.399963229728653
  return Array.from({ length: count }, (_, index) => {
    const t = (index + 0.5) / count
    return {
      x: ((index * golden) % 1) * CANVAS_WIDTH,
      y: t * CANVAS_HEIGHT,
      r: MAX_MARK * (0.5 + ((index * 7919) % 5) / 10),
    }
  })
}

/**
 * A field of marks: the atmosphere a figure is drawn over, and the one thing in
 * this system that is allowed to be nothing more than texture.
 *
 * The retired line drew this as a canvas behind the hero type, and the defect
 * was never the idea: it was that the canvas was opaque, animated continuously,
 * and had to be redrawn by a `requestAnimationFrame` loop to keep a decorative
 * sweep moving. This is the same idea with the three costs removed. It is SVG,
 * so it scales, prints and costs no runtime; it is `aria-hidden` by default,
 * because a field of dots is not information and a screen reader being made to
 * read one is a cost with no reader attached; and its movement is off unless a
 * caller asks for it.
 *
 * **It is atmosphere, and it is labelled as such.** The reason it exists is that
 * a hero with a hard flat ground behind it reads as a document, and a hero with
 * a field behind it reads as a product with a surface. Everything else about it
 * is restraint: no mark is emphasised by default, no two marks are the same
 * colour, and nothing in the field moves unless `drift` is set. It is the
 * weakest mark in the system and the easiest one to overdo, and the props are
 * shaped to make the restrained version the easy one.
 *
 * **It never carries the meaning.** A field is `aria-hidden` unless a caller
 * deliberately names it, and the default is that it names nothing, because a
 * caller reaching for this has atmosphere and not data. When a figure needs to
 * say what it is showing, that figure is `PulseGraph` or `PulseSeries`, both of
 * which require a name and both of which a screen reader can be given.
 *
 * **It is a server Component.** No hook, no client runtime, nothing to hydrate.
 */
function SignalField({
  count = 28,
  emphasisAt,
  label,
  decorative = true,
  drift = false,
  className,
}: SignalFieldProps) {
  const placed = marks(Math.max(4, Math.min(120, Math.round(count))))
  const emphasised = emphasisAt === undefined ? -1 : Math.round(emphasisAt * (placed.length - 1))

  return (
    <svg
      data-slot="signal-field"
      data-marks={placed.length}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
    >
      {placed.map((mark, index) => (
        <circle
          data-slot="signal-field-mark"
          data-emphasis={index === emphasised || undefined}
          cx={mark.x}
          cy={mark.y}
          r={index === emphasised ? mark.r * 1.9 : mark.r}
          strokeWidth={0}
          className={cn(
            index === emphasised ? 'fill-brand-ink/45' : 'fill-foreground/12',
            drift && index % 3 === 0 ? 'prism-ambient-drift' : undefined,
            drift && index % 3 === 1 ? 'prism-ambient-delay-1' : undefined,
            drift && index % 3 === 2 ? 'prism-ambient-delay-2' : undefined,
          )}
          style={
            drift
              ? ({
                  '--ambient-drift-x': `${(index % 2 === 0 ? 1 : -1) * (0.4 + (index % 5) * 0.15)}rem`,
                  '--ambient-drift-y': `${(index % 3 === 0 ? 1 : -1) * 0.35}rem`,
                } as CSSProperties)
              : undefined
          }
        />
      ))}
    </svg>
  )
}

export { SignalField }
