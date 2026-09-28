'use client'

import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * How insistently a change is announced.
 *
 * `polite` waits for a pause, which is right for a log that grows, a result count
 * that updates while someone types, and every other change that is not waiting
 * for an answer. `assertive` interrupts, which is right for a run that failed or a
 * payment that was declined and nothing else.
 *
 * There is no `off` here, deliberately. A live region with no politeness is not
 * silent, it is a region whose behaviour a screen reader guesses at, and the
 * component that wants no announcement is a component that should not be a live
 * region.
 */
export type LivePoliteness = 'polite' | 'assertive'

/** The props the Live region accepts. */
export interface LiveRegionProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The content whose arrival is announced.
   *
   * This is the whole job of the component: the region renders exactly what it is
   * given and announces the change. A consumer owns the words.
   */
  children?: ReactNode
  /**
   * How insistently a change is announced. @defaultValue 'polite'
   *
   * The default is the least interruptive value that is still announced, because
   * a run log that announces assertively interrupts a screen reader mid-sentence
   * and a consumer with a genuinely urgent event can say so here.
   */
  politeness?: LivePoliteness
  /**
   * Whether more content is expected.
   *
   * This is about the caller's knowledge rather than about an animation: a region
   * that is busy is still readable, and a caller that sets it permanently has told
   * assistive technology the stream never ends. A caller that leaves it false
   * while appending to the region is announcing every chunk, which is usually what
   * a log that has finished wants and usually not what one still running wants.
   *
   * @defaultValue false
   */
  busy?: boolean
  /**
   * An accessible name for the region, read before its content.
   *
   * A live region is announced by what arrives, so a name is only worth passing
   * when a reader would otherwise hear an update with nothing to place it. A
   * streamed run whose messages are self-describing does not need one; a region
   * that announces bare status needs it to say what the status is about.
   */
  label?: string
}

/**
 * A region that announces what just changed in it.
 *
 * The first of the three primitives the expansion found missing, and the one the
 * fourth Kind is specified to depend on: an event log surface is a live region,
 * and an unannounced append is not accessible, so a run log built before this
 * existed is a run log a screen reader cannot follow.
 *
 * **The empty case is the one that matters.** A region that is always present
 * announces on every state change of its container, so a live region that renders
 * nothing focusable when it has nothing to say is the correct shape and a region
 * that renders an empty div forever is a defect. When `children` is empty this
 * renders no element at all rather than an empty one, which is also why there is
 * no focusable child to put in it.
 *
 * **This owns the region, not the transport.** A consumer owns the connection: the
 * socket, the retry, the persistence, and the order the events arrive in. This
 * receives what has arrived and announces it. That split is the same one the
 * documentation Page makes with its navigation, and the reason Prism stays
 * transport-agnostic and no consumer inherits a connection it did not ask for.
 */
function LiveRegion({
  className,
  children,
  politeness = 'polite',
  busy = false,
  label,
  ...props
}: LiveRegionProps) {
  // An empty region is not a region. Rendering the element with nothing in it
  // would put a live region on the page permanently, and a permanently present
  // live region announces every unrelated state change of its ancestors, which is
  // the noise this component exists to avoid as well as to cause.
  //
  // The test is "renders nothing" rather than a list of the nothing values, because
  // a caller passing an empty string, a null from a state that has not resolved, or
  // a false from a condition are three routes to the same state and a list of three
  // is a list the fourth route would miss.
  if (children === undefined || children === null || children === false || children === '') return null

  return (
    <div
      data-slot="live-region"
      // `role="status"` and not a bare div, and the reason is that a `div` with no
      // role has no accessible name: `aria-label` on one is prohibited rather than
      // merely ignored, which the accessibility gate in this repository caught the
      // first time this Component was rendered. A status is also the honest role,
      // because it is what this is: content that changed and is not waiting for
      // the reader. The role carries an implicit `aria-live="polite"`, and the
      // explicit attribute is written anyway so that `assertive` is a real
      // override rather than an implication the reader has to infer.
      role="status"
      aria-live={politeness}
      aria-busy={busy || undefined}
      {...(label === undefined ? null : { 'aria-label': label })}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { LiveRegion }
