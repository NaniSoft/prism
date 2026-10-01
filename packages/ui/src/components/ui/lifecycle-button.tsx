'use client'

import { CircleCheckIcon, RefreshCwIcon, TriangleAlertIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './button'
import { LiveRegion } from './live-region'
import { Progress } from './progress'
import { cn } from '../../lib/utils'

/**
 * The four points a button's work can be at.
 *
 * A closed set of four, and the fourth is the one that makes it a lifecycle. A
 * control that is idle, one that is working and one that has finished are three
 * states, and every system that stops at three has folded success and failure
 * into a single "done" and then had to choose which of the two words to print. The
 * answer is a flag, and a flag that says `done` when the request was refused tells
 * a reader their work was saved, which is the most expensive sentence a control
 * can get wrong.
 */
export type LifecycleButtonPhase = 'idle' | 'in-flight' | 'succeeded' | 'failed'

/**
 * Where the work is, as a value the caller holds.
 *
 * A union rather than a `loading` boolean beside an `error` message, and the reason
 * is the pair. A boolean has two answers and this has four, and the two answers
 * nobody can express with a boolean are the two that matter: a request that
 * failed, and a request whose position is known. A caller holding `loading` plus a
 * string has to encode four states across two props that do not know about each
 * other, and every one of those four combinations has to be drawn.
 */
export type LifecycleButtonState =
  /** Nothing has been asked. The control is the caller's primary action. */
  | { phase: 'idle' }
  /**
   * The work is running.
   *
   * `progress` is a fraction between zero and one and it is a real measurement, not
   * a timer: a caller that has a byte count, a row count or a completed-step count
   * passes the ratio and the reader is told the position. Omit it and the work is
   * of unknown length, which is a different fact and is drawn and announced as
   * such. It is never defaulted, because a bar that fills on its own is a
   * measurement of nothing.
   */
  | { phase: 'in-flight'; progress?: number; progressText?: string }
  /** The work finished. */
  | { phase: 'succeeded' }
  /** The work did not finish, with the caller's own sentence about why. */
  | { phase: 'failed'; reason?: ReactNode }

/**
 * The props the Lifecycle button accepts.
 *
 * A declared interface rather than a forwarded native one, and the reason is the
 * gate on the surface: a forwarded `onClick` would be a second way to say what the
 * control does, and a forwarded `children` would be a second way to say what it
 * says. Both are decided here. The five words are five props rather than one
 * `labels` record because a record's keys are a second list of the lifecycle, and
 * the lifecycle is already stated in the type of `state`; two lists of the same
 * four states is two lists that can disagree.
 */
export interface LifecycleButtonProps {
  /**
   * Where the work is.
   *
   * Required and controlled, and the whole of the Component: the caller owns the
   * request, so the caller owns where the request is. Prism draws the label, the
   * mark, the meter and the retry that a position implies, and calls back. It
   * never moves the position, and it holds no promise, no transport and no timer.
   */
  state: LifecycleButtonState
  /**
   * Called when the reader presses the control while it is idle.
   *
   * Required, and it is called only from `idle`. A control that accepts presses
   * while its work is running would let a reader queue a second request without
   * knowing whether the first had finished, and a control that accepts presses
   * after a failure would be a second way of retrying with a different meaning.
   * The caller moves the position to `in-flight`; nothing here does.
   */
  onActivate: () => void
  /** The label in the idle position, in the product's own words. */
  idleLabel: ReactNode
  /** The label while the work is running, in the product's own words. */
  inFlightLabel: ReactNode
  /**
   * The label after the work finished.
   *
   * Required rather than derived from the icon, because a check mark is a
   * drawing and a control whose outcome is a drawing is a control whose outcome a
   * screen reader never hears. Write the outcome: "Saved", "Published",
   * "Enqueued".
   */
  succeededLabel: ReactNode
  /**
   * The label after the work failed.
   *
   * Required, and it is the label a reader sees on a control they already pressed
   * and already believe worked, so it has to be the sentence that tells them
   * otherwise. "Not saved" is a control that is still the same control and now
   * says the opposite; "Try again" is a different action and belongs on the retry
   * beside it.
   */
  failedLabel: ReactNode
  /**
   * The label of the retry control, which exists only in the failed position.
   *
   * Required, and the same word for every product's "try this again" is not
   * something this package may choose: "Retry", "Save again" and "Reintentar" are
   * three products' answers.
   */
  retryLabel: ReactNode
  /**
   * The fill the control is drawn in.
   *
   * The four fills that make no claim about the outcome, and the reason the other
   * two are absent is the Stated Ink Rule read from the other side. The failed
   * position is not drawn destructive: destructive is for an action that cannot be
   * undone, and a failed save is not that. Nor is it drawn `link`, which is a
   * control inside a sentence and a lifecycle control is a sentence of its own.
   * Nor is the failed position left as `default`, because a filled primary beside a
   * failure is a control inviting a press that has already been shown not to work.
   * The failure is carried by the label, the mark and the line beneath, and those
   * are enough.
   *
   * @defaultValue 'default'
   */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  /**
   * The control's height. @defaultValue 'default'
   *
   * The four authored steps including `icon` are not offered, because a lifecycle
   * control that has collapsed to a glyph has thrown away the one thing the
   * lifecycle adds, which is the words that change as it runs.
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * Whether the control submits the form it sits in.
   *
   * Passed through rather than drawn, so a lifecycle control can be a form's submit
   * button. Note what the Component does with it: a press from `in-flight` or
   * `failed` is still refused, so a submit control here will not submit twice
   * because the first submit is still running.
   *
   * @defaultValue 'button'
   */
  type?: 'button' | 'submit' | 'reset'
  /**
   * The name the control submits under, when it submits.
   *
   * A native attribute the Component forwards untouched, because a submit button's
   * name is a fact about the caller's form and about nothing in this Component.
   */
  name?: string
  /**
   * The form the control submits, when it is not inside one.
   *
   * Forwarded for the same reason as `name`, and it is the one native attribute
   * worth forwarding on a control that can submit: a lifecycle button placed in a
   * dialog's footer is outside the form it acts on.
   */
  form?: string
  /**
   * Whether the control is unavailable for a reason of the caller's own.
   *
   * Drawn and not set, for the reason `Dropzone` states in full: a natively
   * disabled control is out of the tab order, so a keyboard reader tabs onto where
   * it was, presses Enter, and nothing happens with no announcement to explain it.
   * This one keeps its place, keeps its ring and announces itself as unavailable.
   * The cost is a tab stop that does nothing, which is the price every disabled
   * control pays and the reason disabled controls are drawn rather than omitted.
   */
  disabled?: boolean
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The mark each settled position carries, and the ink it is drawn in.
 *
 * Two entries and not four, because the idle and in-flight positions carry the
 * meter or nothing rather than a mark, and a ring or a bar beside a label that
 * already says what is happening is a second copy of a sentence the reader can
 * already see. Both marks are `aria-hidden` at the call site and the label carries
 * the meaning, which is the order the whole package keeps: the attribute is the
 * fact and the drawing is the reminder. The inks are the semantic state roles and
 * not a ramp step, and the shapes differ as well as the colours so a reader who
 * cannot separate them still reads which is which.
 */
const SETTLED_MARK: Record<'succeeded' | 'failed', { Mark: LucideIcon; ink: string }> = {
  succeeded: { Mark: CircleCheckIcon, ink: 'text-success' },
  failed: { Mark: TriangleAlertIcon, ink: 'text-destructive' },
}

/**
 * A button whose label, mark and meter follow an asynchronous outcome: idle, in
 * flight, succeeded or failed, with a retry beside it after a failure.
 *
 * **It is a state machine and not a loading flag, and the difference from
 * `Button` is larger than it first looks.** `Button` has no `loading` prop and no
 * loading state of any kind: it renders a native `<button>` and takes `variant`
 * and `size`, and that is the whole of its interface. So there is no overlap to
 * argue about, and the honest reason this Item is not a `Button` with one more
 * boolean is that the boolean was never there. What a caller does today is write
 * three controls: a `Button` whose label swaps while a request runs, a second
 * `Button` that appears when it fails, and a `Progress` or a `Spinner` beside the
 * first. This is those three, and the reason they were three is that they are
 * three positions of one line and `Button` is a control rather than a line. If a
 * `loading` boolean is ever added to `Button`, the honest response is to narrow
 * this Item to the two positions a boolean cannot express, the failure and the
 * fraction, rather than to delete it.
 *
 * **A boolean has two answers and a lifecycle has four, and the two it cannot
 * express are the two that cost the most.** A request that failed is not
 * `loading: false`: it is a control the reader already pressed, which is now
 * telling them their work was not saved, and it needs different words, a
 * different mark and a different next action from a control that has never been
 * pressed. Encoding that as a boolean plus a string puts four states across two
 * props that do not know about each other, and every consumer redraws the
 * combinations. The union puts them in one value, and adding a sixth state later
 * is a compile error at every place that switches over it.
 *
 * **The determinate bar is legal motion and the reason is that it is bound to a
 * real state transition.** The fill is `Progress`, which animates its width on the
 * base duration and eases out; there is no keyframe, no loop and no cycle, because
 * a bar that is moving because a number changed is state feedback under the first
 * of the two motion laws and nothing else. A bar with no number is not drawn as a
 * moving one: a caller that passes no `progress` gets the same component with
 * `value={null}`, which is announced as indeterminate and is the truth about work
 * of unknown length. The Component refuses to fill a bar it has no number for, and
 * the refusal is a thrown diagnostic rather than a silently invented position.
 *
 * **`Progress` is composed and not drawn, and that is why the in-flight position
 * has one indicator rather than two.** A determinate fraction and an indeterminate
 * request are the same question asked with and without an answer, so they are the
 * same Component, and the alternative is a bar in one position and a ring in the
 * other, which is two answers to how far along a task is on one button. The width
 * is bounded by `className` because width is layout, and everything else about the
 * bar is Prism's.
 *
 * **A fraction is announced in the caller's words or not at all.** `Progress`
 * exposes its value, minimum and maximum through ARIA, so a fraction between zero
 * and one is announced as a decimal, and "0.42" is a measurement of nothing a
 * reader can act on. So a state carrying `progress` must carry `progressText`, and
 * the Component throws without it rather than letting a number through as an
 * accessible name. Write the position as the reader would say it: "Uploading,
 * 42 percent", "3 of 8 steps".
 *
 * **The outcome is announced, and the announcement is the transition rather than
 * the control.** A reader who pressed a control and watched its label change has
 * been answered; a reader who pressed it and looked away has not, and the
 * succeeded position is the one that arrives with no other evidence on the page
 * when the control that caused it has scrolled out of view. So the Component
 * composes `LiveRegion` with the settled label in it, polite for a success and
 * assertive for a failure, which is the politeness rule `LiveRegion` states and
 * for its reasons: a save that landed waits its turn, and a save that was refused
 * interrupts. The reason line beneath the control is deliberately not an alert, so
 * the failure is announced once rather than twice in the same commit.
 *
 * **The region is mounted at the outcome rather than held empty, and the cost is
 * real.** `LiveRegion` deliberately renders nothing when it has nothing to say,
 * because a live region sitting on the page permanently announces unrelated
 * changes of its ancestors, which is the noise the Component exists to avoid as
 * well as to cause. The consequence is that this region is created at the moment
 * of its content, and a live region created with its content is announced by most
 * screen readers and not by all of them. A caller who needs the guarantee on every
 * transition keeps a `LiveRegion` of their own beside this Component and passes
 * the outcome into it, which is two lines and no override of anything here.
 *
 * **The retry is a second control and not a state of the first, because the two
 * actions are not the same.** Pressing the control again after a failure is a
 * claim that the same request is worth making again, and the caller may well have
 * changed their mind; a control that quietly became the retry would make a reader
 * who wants to send something different press it twice to find out. So the failed
 * position draws the control, still labelled as the failed outcome, with a second
 * control beside it. The cost is a row that is two controls wide in one position
 * out of four, and a caller who has nowhere to put it composes the retry in their
 * own layout rather than dropping the affordance.
 *
 * **It is a client Component**, because `Progress` is one, because the outcome is
 * announced through a region whose behaviour the browser's mutation observer
 * provides and whose mounting is React's, and because the only callback it takes
 * is one the caller has to be in the client graph to supply. What that costs is
 * the price of every client control, and it is worth naming because the surface
 * invites a server render: a server Component can render the idle position and it
 * will look right, and what it cannot do is move the position, show a fraction, or
 * announce an outcome, because those are facts about what happens after the reader
 * acts.
 */
function LifecycleButton({
  state,
  onActivate,
  idleLabel,
  inFlightLabel,
  succeededLabel,
  failedLabel,
  retryLabel,
  variant = 'default',
  size = 'default',
  type = 'button',
  name,
  form,
  disabled = false,
  className,
}: LifecycleButtonProps) {
  const inFlight = state.phase === 'in-flight'
  const failed = state.phase === 'failed'
  const succeeded = state.phase === 'succeeded'
  const unavailable = inFlight || disabled

  if (inFlight && state.progress !== undefined && state.progressText === undefined) {
    throw new Error(
      'LifecycleButton: the in-flight state carries a progress fraction and no progressText, so the bar would be ' +
        'announced as a decimal between zero and one, which is a measurement of nothing a reader can act on. Pass ' +
        'the position in the words the reader would say it, or drop progress and let the bar be indeterminate.',
    )
  }

  const label =
    state.phase === 'idle'
      ? idleLabel
      : inFlight
        ? inFlightLabel
        : succeeded
          ? succeededLabel
          : failedLabel

  const settled = succeeded || failed
  const mark = settled ? SETTLED_MARK[state.phase] : null

  return (
    <div
      data-slot="lifecycle-button"
      className={cn('inline-flex flex-col items-start gap-1.5', className)}
    >
      <div data-slot="lifecycle-button-actions" className="flex items-center gap-2">
        <Button
          data-slot="lifecycle-button-control"
          type={type}
          variant={variant}
          size={size}
          name={name}
          form={form}
          // `aria-disabled` and not the native attribute, for the reason the
          // `disabled` prop states. The control keeps its place in the tab order
          // and its ring, and the label beside the bar is what explains the
          // unavailability, which is the answer a disabled control never gives.
          aria-disabled={unavailable || undefined}
          onClick={unavailable ? () => undefined : onActivate}
        >
          {mark === null ? null : <mark.Mark className={mark.ink} aria-hidden="true" />}

          <span data-slot="lifecycle-button-label">{label}</span>

          {inFlight ? (
            <Progress
              data-slot="lifecycle-button-progress"
              // The clamped fraction and the same component with no value, so the
              // two are one question asked with and without an answer rather than
              // a bar and a ring on one button.
              value={state.progress === undefined ? null : Math.min(1, Math.max(0, state.progress))}
              max={1}
              valueText={state.progressText}
              className="w-16"
            />
          ) : null}
        </Button>

        {failed ? (
          <Button
            data-slot="lifecycle-button-retry"
            type="button"
            variant="outline"
            size={size}
            onClick={onActivate}
          >
            <RefreshCwIcon aria-hidden="true" />
            {retryLabel}
          </Button>
        ) : null}
      </div>

      {/*
       * The reason, and deliberately not an alert. The live region below has
       * already announced this transition, and a `role="alert"` in the same commit
       * is a second announcement of one event, so a screen reader user hears the
       * failure twice and cannot tell which one is the sentence with the detail.
       * The line is visible text in the destructive ink and the region carries the
       * announcement.
       */}
      {failed && state.reason !== undefined && state.reason !== null && state.reason !== false ? (
        <p data-slot="lifecycle-button-message" className="text-destructive text-sm">
          {state.reason}
        </p>
      ) : null}

      {settled ? (
        <LiveRegion
          className="sr-only"
          politeness={failed ? 'assertive' : 'polite'}
        >
          {label}
        </LiveRegion>
      ) : null}
    </div>
  )
}

export { LifecycleButton }
