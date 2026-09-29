import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props a Spinner accepts.
 *
 * `label` is required and there is no default, which is the Component's one
 * design decision and the reason it is not simply "a div with a border on it".
 */
export interface SpinnerProps extends Omit<ComponentProps<'span'>, 'children'> {
  /**
   * The words a screen reader hears while the work is happening.
   *
   * Required, and required to be a real sentence rather than a verb. A busy
   * indicator with no name is an animation, and an animation is nothing to a
   * reader who cannot see it; the whole reason this Component exists rather
   * than a border on a `div` is that it has to be able to say what is busy in
   * the consumer's own words, because a shared library cannot know whether the
   * answer is "Loading invoices" or "Carregando faturas".
   *
   * The words name the work, not the Component. "Loading" alone is a weaker
   * name than "Loading invoices", and a caller who has two spinners on a page
   * needs to tell them apart in the same way a sighted reader does.
   */
  label: string
  /**
   * The diameter of the ring, in one of three authored steps.
   *
   * A prop rather than something a caller sets through `className`, because a
   * ring whose size is a layout decision is a ring that can be 2px and become
   * invisible, and `className` is layout only on every Component in this
   * package. Three steps is what a spinner is ever drawn at: beside body text,
   * beside a control's label, and alone in a region of its own.
   *
   * @defaultValue 'default'
   */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * The ring, at each authored size.
 *
 * `size-*` on the box and `border-2` on the arc. A spinner is drawn as a
 * rounded box with one transparent edge, which is the shape that reads as
 * "turning" without a keyframe: the gap in the border is what moves, and the
 * box is a fixed frame around it.
 *
 * The one animation is `animate-spin`, and it is the only motion in this
 * package that is a *rotation* rather than a transition between two states.
 * A keyframe cannot be authored here - the design system emits no keyframes
 * and a Component cannot add one - and `animate-spin` is a Tailwind utility
 * that already carries its own, so this is the honest ceiling: a spinner that
 * cannot be built from a transition between two states needs a loop, and a
 * loop is what `animate-spin` is. It is state feedback rather than decoration
 * for the reason `Timeline`'s pulsing mark is: it is running because work is
 * running, and it stops when the work does.
 */
const RING: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'size-4 border-2',
  default: 'size-5 border-2',
  lg: 'size-8 border-[3px]',
}

/**
 * A mark that says work is happening and nothing about how much of it is left.
 *
 * **It is not a Progress and it is not a Skeleton, and the three are confused
 * often enough to be worth stating.** A Skeleton stands in for content: it has
 * the shape of the thing that is arriving, so the page does not move when the
 * content lands. A Progress reports a position: it carries a value, a minimum
 * and a maximum, and a screen reader is told "68 percent" rather than the width
 * of a coloured bar. A Spinner reports exactly one fact, that something is
 * happening, and carries neither a shape nor a value. Pick by the question:
 * *what will arrive* is a Skeleton, *how far along* is a Progress, and *is
 * anything happening at all* is a Spinner.
 *
 * **The honest reason a Spinner is often the wrong answer is that it causes a
 * layout shift.** The ring is a fixed square, so the content it stands in for
 * is not, and everything below it moves twice: once when the content is
 * replaced by the ring, and again when the ring is replaced by the content.
 * A reader's eye has to find the thing twice. That is the whole cost of this
 * Component and it is not paid when the shape of what is coming is already
 * known, which is why:
 *
 * - **Do not use a Spinner as a page-level loading state where the layout is
 *   known.** A first paint of Skeletons is a better answer, and
 *   `Skeleton` is the Component for it. A Spinner alone in the middle of an
 *   empty page tells the reader nothing about the page they are about to get.
 * - **Do not use a Spinner for a task of known length.** A countable upload
 *   is a `Progress`, and a bar that shows real information beats a ring that
 *   shows anxiety.
 * - **Do not use a Spinner for a wait under about a second.** A control that
 *   disables itself for 400ms and then re-enables is a control that flickers.
 *   A `Skeleton` that never gets to paint, or nothing at all, is quieter.
 * - **Do not use a Spinner inside a Button next to a label that already says
 *   what is happening.** The label is the announcement; the ring is the
 *   confirmation, and beside a label that already reads "Saving..." it is a
 *   second copy of a sentence the reader can already see.
 *
 * **It is a server Component.** It reads its props and renders, so the client
 * directive would be a claim about work this Component does not do. A hundred
 * spinners on a page cost no JavaScript.
 */
function Spinner({ className, label, size = 'default', ...props }: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      // The role is what makes the label legal, and the reason is the same one
      // `LiveRegion` gives: a `span` with no role has no accessible name, so
      // `aria-label` on one is prohibited rather than merely ignored. `status`
      // is also the honest role, because a spinner is content that reports a
      // state and is not waiting for the reader. It is deliberately NOT
      // `aria-busy`: a busy *region* is still readable, and which regions are
      // busy is the caller's knowledge rather than this Component's, so a
      // consumer that wants it wraps the region in a `LiveRegion` and sets
      // `busy` there.
      role="status"
      aria-label={label}
      className={cn('inline-flex shrink-0', className)}
      {...props}
    >
      <span
        data-slot="spinner-ring"
        // The ring is `aria-hidden` because the name is already on the status and
        // a second description of a spinning circle is noise. A reader is told
        // what is busy once, in the consumer's words.
        aria-hidden="true"
        className={cn(
          'border-current animate-spin rounded-full border-transparent border-t-current',
          RING[size],
        )}
      />
    </span>
  )
}

export { Spinner }
