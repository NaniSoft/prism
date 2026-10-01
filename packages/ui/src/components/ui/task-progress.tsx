import { CircleCheckIcon, TriangleAlertIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { LiveRegion } from './live-region'
import { Progress } from './progress'
import { cn } from '../../lib/utils'

/**
 * Where a task is, as one value the caller holds.
 *
 * Four positions and a union, for the reason `LifecycleButtonState` states in
 * full: a boolean has two answers, and the two this cannot express are the two
 * that cost the most. A task that failed is not "running: false", and a task
 * whose position is known is not a spinner. Encoding four positions across a
 * boolean and a number puts them in two props that do not know about each other,
 * and every consumer then draws all four combinations itself.
 *
 * `idle` exists so a caller can hold a resting position in the same state it
 * holds the other three, rather than unmounting on the transitions it did not
 * expect. See the JSDoc on the Component for what `idle` draws, which is nothing.
 */
export type TaskProgressPhase =
  /** Nothing has been asked, or nothing is running. This Component draws no bar. */
  | { phase: 'idle' }
  /**
   * The task is running.
   *
   * `progress` is a real measurement rather than a clock: a byte count, a row
   * count or a completed-step count gives a ratio, and the reader is told the
   * position. Omit it and the work is of unknown length, which is a different
   * fact and is drawn and announced as such.
   */
  | { phase: 'running'; progress?: number; progressText?: string }
  /** The task finished, with the caller's own sentence about what it did. */
  | { phase: 'succeeded'; outcome: ReactNode }
  /** The task did not finish, with the caller's own sentence about why. */
  | { phase: 'failed'; reason: ReactNode }

/**
 * The props the Task progress accepts.
 *
 * A declared interface rather than a forwarded native one. There is no single
 * element to forward to, because the Component draws a line, a bar and an
 * announcement, and it takes no callback at all, so there is nothing for a
 * forwarded handler to add.
 */
export interface TaskProgressProps {
  /**
   * Where the task is.
   *
   * Required and controlled, and the whole of the Component: the caller owns the
   * request, so the caller owns where the request is. Prism draws the line, the
   * mark, the bar and the announcement that a position implies, and calls nothing.
   * It never moves the position, holds no promise and runs no clock.
   */
  phase: TaskProgressPhase
  /**
   * What the task is, read beside the bar and at the outcome.
   *
   * Required, and a `ReactNode` because a caller's task is often more than a
   * word: "Exporting 12 invoices", "Rebuilding the estate index". It is drawn
   * rather than derived, because a Component cannot describe work it has not been
   * told about.
   */
  label: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The mark each settled position carries, and the ink it is drawn in.
 *
 * Two entries and not four, because the running position carries a bar rather
 * than a mark, and a ring beside a line that already says what is happening is a
 * second copy of a sentence the reader can already see. The inks are the semantic
 * state roles rather than a ramp step, and the shapes differ as well as the
 * colours, so a reader who cannot separate them still reads which is which.
 */
const SETTLED_MARK: Record<'succeeded' | 'failed', { Mark: LucideIcon; ink: string }> = {
  succeeded: { Mark: CircleCheckIcon, ink: 'text-success' },
  failed: { Mark: TriangleAlertIcon, ink: 'text-destructive' },
}

/**
 * One line that follows a pending task from start to resolution, and announces the
 * outcome.
 *
 * **It is the running state and not the control that starts it.**
 * `LifecycleButton` is the button a reader presses to begin a save, a publish or
 * an export, and it carries the label, the mark, the meter, the failure and the
 * retry because all of those belong to a control somebody is looking at. This is
 * the other half: a task the caller started somewhere else, or started on a
 * schedule, or started on another device, whose position the reader has to be able
 * to find without hunting for the control that began it. The difference is not
 * that one has a bar and the other does not; both draw a bar. The difference is
 * that this Component has no `onActivate`, no retry and no idle label, because a
 * line is not something a reader presses, and a control that pressed nothing is a
 * control that lies. A caller who wants both in one place composes the two.
 *
 * **The bar exists only while the task is running, and that is the honest shape.**
 * A bar at one hundred percent is a measurement of nothing, and it would sit on
 * the page until the caller cleared it while the outcome line said what actually
 * happened. So the bar is the running position's own, it leaves with it, and the
 * settled positions draw the caller's sentence and a mark. The cost is that a
 * reader watching a long task sees no completion bar to watch reach the end; the
 * announcement is what tells them, and that is the same arrangement
 * `LifecycleButton` settles at.
 *
 * **`idle` renders nothing, and the reason is the same one `LiveRegion` gives.**
 * A Component holding a task that is not running has nothing to report, and a bar
 * at zero is a claim that work is in progress. So the resting position draws no
 * element, which also means a caller that wants the task's name visible before it
 * starts draws the name themselves. **The cost is that this Component cannot be
 * the only thing on the page**, because a line that vanishes is a line whose
 * arrival shifts the layout around it, and a caller who needs the space held
 * reserves it.
 *
 * **The determinate fill is legal motion, and the reason is that it is bound to a
 * real state transition.** The bar is `Progress`, which eases its width on the
 * base duration; there is no keyframe, no loop and no cycle anywhere in this
 * Component, because a bar that is moving because a number changed is state
 * feedback under the first of the two motion laws in this system and nothing
 * else. A task with no number is drawn and announced as indeterminate, and the
 * Component refuses to fill a bar it has no number for: the refusal is a thrown
 * diagnostic rather than a silently invented position.
 *
 * **`Progress` and `LiveRegion` are composed, not redrawn, and the reason the
 * outcome is announced at all is that the control is not on screen.** A reader who
 * started a task, watched it run and looked away has had no answer, and the
 * settled line is often the only evidence on the page that anything happened. So
 * the outcome goes through a live region, polite for a success because a finished
 * export waits its turn, and assertive for a failure because a refused one does
 * not. The reason line beneath is deliberately not an alert, so a failure is
 * announced once rather than twice in the same commit.
 *
 * **The region is mounted at the outcome rather than held empty, and the cost is
 * real.** `LiveRegion` deliberately renders nothing when it has nothing to say,
 * because a region sitting on the page permanently announces unrelated changes of
 * its ancestors. The consequence is that this region is created at the moment of
 * its content, and a live region created with its content is announced by most
 * screen readers and not by all of them. A caller who needs the guarantee on every
 * transition keeps a `LiveRegion` of their own beside this Component and passes
 * the outcome into it, which is two lines and no override of anything here.
 *
 * **It is a server Component**, and that is a deliberate claim rather than an
 * accident. It holds no state, runs no hook, reads no context and takes no
 * handler: the only callback-shaped thing here is the caller's `phase`, which is
 * data. The two Components it composes carry the client work between them, so
 * `Progress` is a client island inside a server line and `LiveRegion` needs no
 * JavaScript at all, because a live region is announced by the browser's own
 * mutation observer. What that costs is that the caller owns the transition, so a
 * caller who moves the phase from a response handler is already in the client
 * graph and pays for it there; a caller who moves it on a server action gets the
 * line redrawn with no announcement, which is the ordinary case for a page load
 * and the wrong case for a task that finished while the reader was on the page.
 */
function TaskProgress({ phase, label, className }: TaskProgressProps) {
  if (phase.phase === 'idle') return null

  if (phase.phase === 'running' && phase.progress !== undefined && phase.progressText === undefined) {
    throw new Error(
      'TaskProgress: the running phase carries a progress fraction and no progressText, so the bar would be ' +
        'announced as a decimal between zero and one, which is a measurement of nothing a reader can act on. ' +
        'Pass the position in the words the reader would say it, or drop progress and let the bar be indeterminate.',
    )
  }

  const running = phase.phase === 'running'
  const settled = phase.phase === 'succeeded' || phase.phase === 'failed'
  const mark = settled ? SETTLED_MARK[phase.phase] : null
  const outcome = phase.phase === 'succeeded' ? phase.outcome : phase.phase === 'failed' ? phase.reason : undefined

  return (
    <div data-slot="task-progress" className={cn('flex w-full flex-col gap-1.5', className)}>
      <div data-slot="task-progress-line" className="flex items-center gap-2">
        {mark === null ? null : <mark.Mark className={mark.ink} aria-hidden="true" />}

        <span data-slot="task-progress-label" className="text-sm font-medium">
          {label}
        </span>
      </div>

      {running ? (
        <Progress
          data-slot="task-progress-bar"
          // The clamped fraction and the same Component with no value, so the two
          // are one question asked with and without an answer rather than a bar
          // and a ring on one line.
          value={phase.progress === undefined ? null : Math.min(1, Math.max(0, phase.progress))}
          max={1}
          valueText={phase.progressText}
        />
      ) : null}

      {outcome === undefined ? null : (
        <p data-slot="task-progress-outcome" className="text-muted-foreground text-sm">
          {outcome}
        </p>
      )}

      {/*
       * The announcement, and deliberately not an alert on the line above. A
       * `role="alert"` in the same commit as this region is a second announcement
       * of one event, so a screen reader user hears a failure twice and cannot
       * tell which one carries the sentence.
       */}
      {settled ? (
        <LiveRegion className="sr-only" politeness={phase.phase === 'failed' ? 'assertive' : 'polite'}>
          {outcome}
        </LiveRegion>
      ) : null}
    </div>
  )
}

export { TaskProgress }