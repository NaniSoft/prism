import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** The props a Reveal takes. */
export type RevealProps = {
  /** The band, grid or figure that arrives. */
  children: ReactNode
  /**
   * How far into the page's rhythm this arrival sits behind the one before
   * it, as a fraction of the entry rather than as a wait: the reader's scroll
   * is the only clock, and a delay a reader could not hurry would be a delay
   * the reader did not cause. Three steps, as on the ambient delays.
   */
  delay?: 1 | 2 | 3
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A section that meets the reader: the wrapper that carries the third law of
 * motion, under which an arrival is bound to the reader's own scroll position
 * and to nothing else.
 *
 * **The content is present from the first paint.** The reveal is a style the
 * browser resolves, not a state a script flips: there is no observer, no
 * listener and no client boundary, and the answer to "when does the content
 * exist" is "when the page does". A browser that does not ship scroll-driven
 * animations declines the whole rule and the section is simply there; a reader
 * who asked the platform for less motion is handed the same still page by the
 * universal reduced-motion rule; a crawler and a print stylesheet meet the
 * full document. Nothing waits, and nothing can be left waiting by a failed
 * script, because there is no script.
 *
 * **A section that has finished entering is simply present.** The reveal plays
 * across a section's entry and holds at its end; it never runs again, and a
 * section above the fold when the page loads, the hero included, is better
 * left unwrapped. The page does not introduce itself twice, and the one
 * authored moment a page carries belongs to its hero, not to every band under
 * it. Wrap the bands a reader scrolls to; let the first one be still.
 *
 * **It is a wrapper and not a prop.** Every Block keeps its own surface, and
 * the caller composes this around the Block the way it composes a Section
 * around content, so no Block widens for a behaviour the whole page shares.
 */
function Reveal({ children, delay, className }: RevealProps) {
  return (
    <div
      data-slot="reveal"
      data-delay={delay}
      className={cn('prism-reveal', delay ? `prism-reveal-delay-${delay}` : undefined, className)}
    >
      {children}
    </div>
  )
}

export { Reveal }
