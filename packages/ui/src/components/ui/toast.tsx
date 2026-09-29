'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The surface and the four tones, and nothing else.
 *
 * Every tone states its own fill AND its own ink, and that is the
 * `check-variant-ink` rule rather than a style preference. A toast is the one
 * surface in this package that is a *coloured* surface with body text sitting
 * on it, so an inherited ink is not the page's foreground by accident: it is
 * whatever happened to be behind the viewport, and the failure `Cta01`
 * measured was 1.01:1 on a filled `bg-primary` band. A tone that set only a
 * fill would be the same button in a different colour.
 */
const toastVariants = cva(
  // `pointer-events-auto` because the viewport that hosts a toast is a fixed
  // layer over one corner of the page, and a toast that inherited
  // `pointer-events-none` from that layer would be a toast nobody can click.
  'bg-popover text-popover-foreground pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 pr-10 shadow-md',
  {
    variants: {
      variant: {
        default: 'border-border',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        // A destructive toast is for a failure the reader did not cause and
        // would not otherwise learn: a payment declined on the server, a session
        // that expired, a deploy that failed. It is NOT for a mistake the reader
        // made, which belongs in an `Alert` beside the control where they can
        // see what to change. That distinction is the reason a destructive tone
        // exists here at all.
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

/**
 * Where a toast is in its own life, which is the only thing the transition reads.
 *
 * Three phases and not two, and the middle one is the reason: a toast that went
 * straight from visible to gone has no exit to animate, because there is no
 * longer anything on the page to animate it. `leaving` is the window in which
 * the element is still present and has been told to stop being here, and the
 * handoff to the caller happens at the end of it rather than at the start.
 */
type ToastPhase = 'entering' | 'open' | 'leaving'

/**
 * The props the Toast root accepts.
 *
 * Every reader-facing string on this surface is a prop, and the reason is the
 * library's reason: this package is installed into four products in at least
 * two languages, and a toast that shipped a close button named in English
 * would be a control those products cannot localise.
 */
export interface ToastProps
  extends Omit<ComponentProps<'div'>, 'children' | 'title'>,
    VariantProps<typeof toastVariants> {
  /**
   * The short line: what happened, in the fewest words that are still true.
   *
   * A `<p>` and not a heading, deliberately. A notification that appears and
   * then disappears must not put an entry in the page outline, because a reader
   * who navigates by heading lands on the document, selects "Saved", and finds
   * nothing there any more. `Alert` is a heading for the same words because an
   * Alert is on the page for as long as the condition is.
   *
   * A `ReactNode`, so a caller can put an emphasis or an icon inside it, and it
   * is also why the native `title` attribute is removed from the pass-through
   * rather than forwarded. The two names are the same words with opposite
   * consequences: a toast's title is the notification itself, read by everyone
   * at once, while `title` is a tooltip that appears under the pointer to
   * whoever happens to hover, and nothing else. A toast that forwarded both
   * would say the same sentence twice to a mouse reader and once to a keyboard
   * reader, in a surface whose whole purpose is to say a thing once.
   */
  title?: ReactNode
  /**
   * The sentence under the title, when there is one.
   *
   * Separate from the title for the same reason `Alert` separates them: a
   * title is scanned and a sentence is read, and a toast that merged them
   * forces a reader to read a heading.
   */
  description?: ReactNode
  /**
   * The one control the toast offers, as a slot.
   *
   * A `ReactNode` rather than a label and a handler, and that is the design
   * decision rather than a convenience: **a toast's action is never the only
   * route to what it does.** A toast is transient by definition, and a reader
   * who missed it, or whose screen reader had not finished announcing it when
   * it went, cannot take an action that exists only inside it. So whatever the
   * action does has to be reachable in the surface the reader is already
   * looking at, and the toast is the shortcut rather than the gate.
   */
  action?: ReactNode
  /**
   * Called when the toast wants to be taken off the page: the clock ran out, the
   * reader pressed the dismiss control, or the reader pressed Escape while the
   * toast held focus.
   *
   * **The caller unmounts; this Component never hides itself.** That is what
   * makes the leave transition possible at all, and it is stated here because a
   * caller who expects the toast to remove itself will write a no-op and leave
   * a toast parked on the page forever.
   *
   * **Omitting it makes the toast permanent, and that is deliberate.** Without a
   * handoff there is nobody to take the toast off the page, so a clock with
   * nothing to fire and a dismiss control with nothing to do would both be
   * controls that lie. A toast with no `onDismiss` therefore does not run its
   * clock, renders no dismiss control and ignores Escape: it stays until the
   * caller unmounts it. The alternative is worse, because a toast that faded out
   * and was never removed is an invisible element still in the document, still
   * in the live region and still taking the pointer.
   */
  onDismiss?: () => void
  /**
   * How long the toast stays up before it asks to be dismissed, in milliseconds.
   *
   * **The default is a judgement about a reader, and it is deliberately longer
   * than a toast usually wants to be.** The failure this number exists to avoid
   * is a toast vanishing before a screen reader has finished announcing it,
   * which is worse than no toast at all: the reader is told something happened
   * and then told, by its absence, that they missed it. Four seconds clears a
   * title and a sentence at a conservative assistive-technology speaking rate.
   * The pause on hover and on focus covers the reader who is looking at the
   * toast rather than hearing it.
   *
   * `0` turns the clock off, for the toast the reader must act on. That is a
   * real case and it is the one case where a toast earns the name, because the
   * reader's next step is the toast's entire purpose.
   *
   * @defaultValue 4000
   */
  duration?: number
  /**
   * The accessible name of the dismiss control.
   *
   * **Required, with no default, and this is the one surface in the package
   * where a default would be wrong rather than merely unhelpful.** Every other
   * close button here sits inside a dialog the reader opened, so its name is
   * already implied by the thing it is closing. A toast arrived on its own: an
   * icon-only control the reader reaches towards has to say what it is before
   * they press it, and four products in two languages cannot all be told the
   * control says "Close".
   */
  closeLabel: string
  /**
   * Whether the dismiss control is rendered.
   *
   * A prop and not a decision made here, because a toast the reader cannot
   * dismiss is a toast that can only be waited out, and a toast the reader must
   * not dismiss is a dialog. Neither is this Component's call.
   *
   * Set to `false` for a toast the reader must not dismiss, and note that it
   * costs the toast its only keyboard route out: with no control and no Escape,
   * the caller has to offer the way to leave somewhere else, or the toast is a
   * dialog with the focus trap left out. The control is also not rendered when
   * there is no `onDismiss` to call, because a control that cannot do anything
   * is worse than no control.
   *
   * @defaultValue true
   */
  showCloseButton?: boolean
  /**
   * Whether the clock is paused regardless of the pointer or focus.
   *
   * The escape hatch for a caller holding a toast open while something else is
   * still in flight, which is the ordinary case for a batch of operations
   * reporting one at a time.
   *
   * @defaultValue false
   */
  paused?: boolean
}

/**
 * A transient notification for something the reader did not have to be told.
 *
 * **What a toast is FOR, stated narrowly, because the broad reading is why
 * toasts get used for the wrong things.** A toast reports a fact the reader
 * would otherwise miss: work finished in the background, a document was shared
 * with them, a setting took effect. It is deliberately NOT the place for an
 * error the reader caused and must act on, because a message that requires an
 * action cannot be allowed to expire before the action is taken. That is an
 * `Alert` beside the control, or a `Dialog` when it blocks. A toast carrying a
 * blocking message is a modal in a costume.
 *
 * **It never takes focus, and that is the load-bearing accessibility claim.** A
 * surface that moves focus to itself has interrupted the reader, and being
 * interrupted is the whole thing a toast exists to avoid: the reader is typing,
 * or reading, or doing something else entirely. So the root is a
 * `role="status"` region that is announced without being entered, the dismiss
 * control is reachable by Tab from wherever the reader already was, and nothing
 * in this Component calls `focus()`. A consumer who needs attention right now
 * wants a `Dialog`; one who needs the reader to act before the message goes
 * away wants `duration={0}`.
 *
 * **It is announced once, and that is why there is no countdown on screen.** A
 * visible timer would have to be a text or an attribute that changes, and
 * anything that changes inside a live region is something a screen reader may
 * announce again. A toast that read out its remaining time every second would
 * be read thirty times. So the clock lives in a ref, it changes no text, and
 * the region speaks once on arrival and again only if the caller changes the
 * words.
 *
 * **It pauses on hover and on focus, for the same reason the default is long.**
 * A reader who has moved the pointer onto a toast is reading it, and one who
 * has tabbed into it is about to press something; in both cases the clock is
 * the enemy of what the reader is doing. The pause *holds* the remaining time
 * rather than restarting it, so a reader who hovers for ten seconds and then
 * leaves gets the four seconds they had left, not four more.
 *
 * **The enter and the leave are the one motion in this package that is
 * legitimate, because they are a state change and not decoration.** A toast is
 * arriving and a toast is leaving, the reader can watch both happen, and that
 * is what state feedback is. It is a fade and a short rise on `duration-slow`
 * with `ease-out`, expressed with utilities this package already uses and with
 * no keyframe: a transition plus a `data-phase` attribute carries both
 * directions. There is no slide, because a travelling toast is a transition
 * between two positions rather than a transition of one element, and expressing
 * that without a keyframe would mean a transform the element does not otherwise
 * have.
 *
 * **It never removes its own transition, and the reason is the caller's
 * unmount.** The exit hands over on the end of the root's own opacity
 * transition, so under reduced motion the fade is *shortened* rather than
 * removed and the handoff still happens. Removing the fade there would have
 * needed this Component to read the media query and hand over at once instead,
 * which would be the same rule written twice: once in the stylesheet and once in
 * TypeScript, free to disagree the day the motion policy is retuned. Leaving
 * the fade in and shortening it keeps the decision in one place, and it is the
 * same choice `DESIGN.md` states for the package: motion is state feedback,
 * shortened rather than removed under reduced motion. The travel is the part
 * that is movement, so that is the part `motion-safe:` guards.
 *
 * **It is a client Component** because it holds a clock, runs effects, and
 * attaches three handlers. The clock is a single `setTimeout` whose
 * `clearTimeout` is the effect's own return, so nothing outlives the Component:
 * unmounting a toast takes its timer with it rather than leaving one to fire
 * against a component that is no longer on the page.
 *
 * **A toast with no `onDismiss` never leaves, and that is the safe answer.**
 * Every way out of this Component hands over to the caller, so with nobody to
 * hand to there is no clock to run, no dismiss control to render and no Escape
 * to answer. The alternative would be a toast that faded to `opacity-0` and was
 * never removed from the document: invisible, still in the live region, still
 * taking the pointer, and gone in every way except the ones that matter.
 */
function Toast({
  className,
  variant,
  title,
  description,
  action,
  onDismiss,
  duration = 4000,
  closeLabel,
  showCloseButton = true,
  paused = false,
  ...props
}: ToastProps) {
  const [phase, setPhase] = useState<ToastPhase>('entering')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  // The remaining time, in a ref rather than in state, because it is written by
  // this Component's own clock and read by nothing the reader can see. State
  // would re-render the whole toast four times a second to update a number no
  // reader is shown, and every re-render of a live region is a chance to be
  // announced again.
  const remaining = useRef(duration)
  const startedAt = useRef(0)

  // The three reasons the clock stops, and the reason the pointer and the
  // keyboard are two of them rather than one: a reader who has tabbed into the
  // dismiss control has not finished with the toast, and neither has a reader
  // who is reading it.
  const held = paused || hovered || focused

  // The one thing without which nothing can leave: without a handoff there is
  // nobody to take the toast off the page, so the clock has nothing to fire and
  // the dismiss control has nothing to do. Every way out is gated on it, so a
  // toast rendered without an `onDismiss` is a toast that stays rather than one
  // that fades to invisible and is never removed.
  const canLeave = onDismiss !== undefined

  useEffect(() => {
    // Entering is one frame and not a duration. A transition needs a rendered
    // state to transition *from*, and the first frame is the one that has it.
    // The frame is cancelled on unmount, so a toast removed before its first
    // paint does not leave a request behind.
    //
    // Deliberately not awaited by anything. A frame is a frame: if the browser
    // never delivers one, because the tab is in the background, the toast is
    // still on the page, still dismissible and still on its clock. The enter is
    // the only part of this Component that is allowed to be skipped, and it is
    // skipped on its own.
    if (phase !== 'entering') return
    const frame = requestAnimationFrame(() => setPhase('open'))
    return () => cancelAnimationFrame(frame)
  }, [phase])

  useEffect(() => {
    // A new duration is a new clock. Written before the clock effect below
    // re-runs, because that effect reads this one on its first line.
    remaining.current = duration
    startedAt.current = 0
  }, [duration])

  useEffect(() => {
    // `duration === 0` is the "the reader must act on this" case, and a toast
    // with the clock off is the one toast entitled to stay.
    //
    // The guard is `leaving` and not `open`, because the clock is about the
    // reader's patience rather than about the animation: tying the clock to the
    // visual phase would mean a backgrounded tab, which never gets a frame, kept
    // a toast up forever for a reason the reader never saw.
    if (phase === 'leaving' || held || duration === 0 || !canLeave) return

    startedAt.current = Date.now()
    const timer = setTimeout(() => setPhase('leaving'), remaining.current)

    // The single place the clock is stopped. It runs on unmount as well as on
    // every pause, which is what keeps a toast's timer from outliving it, and
    // the subtraction is what makes a resume a *continuation* rather than a
    // restart.
    return () => {
      clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current))
    }
  }, [phase, held, duration, canLeave])

  const dismiss = useCallback(() => {
    // Already leaving does not restart the exit, so the handoff to the caller
    // is one call rather than one per reason the toast was dismissed.
    setPhase((current) => (current === 'leaving' ? current : 'leaving'))
  }, [])

  useEffect(() => {
    if (phase !== 'leaving') return
    const root = rootRef.current
    if (root === null) return

    // The leave ends when the transition the CSS declared has run, and not on a
    // second clock of this Component's own: the length of the leave is a CSS
    // decision, and a number in TypeScript would be a second source of truth
    // for it that would stop agreeing with the stylesheet the day the token
    // moved.
    //
    // It is the root's own opacity rather than "the first transition to end",
    // and that holds under reduced motion too. The fade is shortened there and
    // not removed, so an opacity transition always runs and always ends, and the
    // caller is always told to unmount. Reading the media query in JavaScript
    // would put the same decision in two places: the stylesheet would shorten
    // the fade and this code would have to guess the same rule to know whether
    // to expect the event.
    //
    // A `const` arrow and not a hoisted declaration, for one reason that is not
    // taste: a function declaration could be called before the null check above
    // ran, so TypeScript drops the narrowing on `root` inside it, while an arrow
    // assigned to a `const` cannot exist until the check has passed.
    const finish = (event: Event) => {
      // Filtered to this element's own opacity, because a child control's
      // colour transition would otherwise end the toast's exit early and the
      // caller would unmount it half way through the fade.
      if (event.target !== root) return
      if ((event as TransitionEvent).propertyName !== 'opacity') return
      // Removed on the way through, because the phase does not change on the
      // way out and so this effect is not re-run to clean up. A listener left
      // attached would call the caller's unmount again on the next opacity
      // transition on this element, and an unmount that runs twice is a state
      // update on a component that is no longer there.
      root.removeEventListener('transitionend', finish)
      onDismiss?.()
    }
    root.addEventListener('transitionend', finish)
    return () => root.removeEventListener('transitionend', finish)
  }, [phase, onDismiss])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Escape dismisses, and only when the toast itself holds focus. A toast
    // that answered a document-level Escape would swallow the key from whatever
    // the reader is actually typing in, which is the failure every floating
    // surface causes when it listens globally.
    if (event.key !== 'Escape') return
    if (!canLeave) return
    if (!rootRef.current?.contains(event.target as Node)) return
    event.stopPropagation()
    dismiss()
  }

  return (
    <div
      ref={rootRef}
      data-slot="toast"
      data-phase={phase}
      // The role is what makes the announcement happen at all, and it is the one
      // `LiveRegion` uses and for the same reason: a toast is content that
      // changed and is not waiting for the reader. `aria-live` is written
      // explicitly so the politeness is a stated fact rather than an implication
      // of the role, and `aria-atomic` is on because a title and a sentence
      // arrive together and a reader should hear one notification rather than
      // two.
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={cn(
        toastVariants({ variant }),
        // The enter and the leave as one transition on two properties.
        // `duration-slow` rather than `duration-base` because a toast crosses
        // the page and a fast one is over before a reader has registered that
        // anything arrived; `ease-out` because both directions are decelerating
        // into a resting state rather than accelerating out of one.
        'transition-[opacity,transform] duration-slow ease-out',
        // Reduced motion shortens the fade and removes the travel, rather than
        // removing the transition. The fade is what tells a reader the toast is
        // there and then that it is gone, and a reader who asked for less motion
        // has not asked to be told nothing; the rise is movement, and movement is
        // what they asked not to have. It is also why the handoff below waits on
        // an opacity transition rather than reading the media query in JavaScript:
        // an opacity that always transitions always ends, so there is no case in
        // which the caller is never told to unmount.
        'motion-reduce:duration-fast',
        'motion-safe:data-[phase=entering]:translate-y-1 motion-safe:data-[phase=leaving]:translate-y-1',
        'data-[phase=entering]:opacity-0 data-[phase=leaving]:opacity-0',
        className,
      )}
      {...props}
    >
      {/*
       * A plain flow container rather than a grid or a section, so a caller who
       * puts three sentences in `description` gets three lines and a caller who
       * puts one gets one, and the height follows the content rather than a
       * fixed arrangement the Component picked.
       */}
      <div data-slot="toast-body" className="flex min-w-0 flex-1 flex-col gap-1">
        {title === undefined ? null : (
          <p data-slot="toast-title" className="text-sm font-medium">
            {title}
          </p>
        )}
        {description === undefined ? null : (
          <p data-slot="toast-description" className="text-pretty text-sm opacity-90">
            {description}
          </p>
        )}
        {action === undefined ? null : (
          <div data-slot="toast-action" className="mt-1.5 flex items-center">
            {action}
          </div>
        )}
      </div>

      {showCloseButton && canLeave ? (
        <button
          type="button"
          data-slot="toast-close"
          aria-label={closeLabel}
          onClick={dismiss}
          // The ring is at full strength for the reason `Button`'s is: half alpha
          // composites to under 3:1 against every surface in every pack, and this
          // is the one indicator on a control a reader reaches for without
          // having opened anything.
          className={cn(
            'ring-offset-background focus-visible:ring-ring absolute top-2 right-2 rounded-sm opacity-70 outline-none',
            'transition-opacity duration-fast ease-out',
            'hover:opacity-100 focus-visible:ring-[3px]',
          )}
        >
          <XIcon className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export { Toast }
