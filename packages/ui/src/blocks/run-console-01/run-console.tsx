import { LiveRegion } from '../../components/ui/live-region'
import { Meter } from '../../components/ui/meter'
import { type HeadingLevel } from '../../components/ui/section'
import { Timeline, type TimelineEntry } from '../../components/ui/timeline'
import { cn } from '../../lib/utils'

/**
 * The words the Block does not have.
 *
 * A Block that assembled a run console out of a budget, a run's name and a list of
 * steps would have to ship English for every one of them, and every consumer would
 * inherit it. So all of it arrives here: the names of the two regions, the words
 * beside the budget reading, the empty state, and the word for the whole surface.
 * The structure is this package's; the language is the caller's.
 */
export type RunConsole01Copy = {
  /** Names the budget region, read before its reading. */
  budgetLabel: string
  /** The words for the budget's value, given the number and its maximum. */
  budgetValue: (value: number, max: number) => string
  /** Names the region the steps are in, read before them. */
  stepsLabel: string
  /** The heading over the whole surface. */
  title: string
  /** What a reader is told while the run has produced nothing yet. */
  waiting: string
}

/** The props the Run console accepts. */
export interface RunConsole01Props {
  /**
   * What this run is.
   *
   * The caller's words, and the only thing on the surface that says which run is
   * being looked at. A console showing three runs at once is a table, not a
   * console.
   */
  title: string
  /** The words this Block does not have. */
  copy: RunConsole01Copy
  /** The run's events, in the order they happened. */
  steps: readonly TimelineEntry[]
  /**
   * How much of the budget this run has spent, and the budget itself.
   *
   * Optional, because a run with no budget is ordinary: a local run, a test, a
   * command. A Block that drew an empty budget meter for those would be showing a
   * measurement of nothing, which is the thing a Meter exists to avoid.
   */
  budget?: {
    /** What has been spent. */
    value: number
    /** The ceiling. */
    max: number
    /** The values the run should be able to see at a glance, if it has any. */
    thresholds?: readonly { at: number; tone: 'neutral' | 'success' | 'warning' | 'destructive' }[]
  }
  /**
   * The line under the heading, usually where the run came from.
   *
   * Optional rather than defaulted, because a Block that invented one would be
   * inventing a fact about the run.
   */
  detail?: string
  /**
   * Whether the run is still producing events.
   *
   * This is the prop that makes the surface a live one rather than a picture of
   * one, and it does exactly two things: it marks the budget region busy while
   * events are still arriving, and it puts the steps inside a LiveRegion so an
   * append is announced. Both are the caller's decision to make because only the
   * caller knows whether the transport has finished.
   */
  streaming?: boolean
  /**
   * Heading level for the run's heading. @defaultValue 'h2'
   *
   * A prop for the reason every Block's is: the surrounding document decides where
   * this lands in the outline, not the Block. The heading was a hard-coded `<h2>`,
   * which is right at the top of a page and wrong anywhere else, because a run
   * console is a panel a product opens beside something. Three Blocks in this
   * package held that level and `SiteFooter` and `DataTable01` already take this
   * prop, so this is the fourth name being spelled the same way rather than a new
   * convention.
   */
  headingLevel?: HeadingLevel
  /** Layout only. */
  className?: string
}

/**
 * A run, as a heading, a budget and the steps that got there.
 *
 * This is the surface the fourth Kind exists for, and the reason it is a Block
 * rather than a Component is worth stating: a run console is not one thing. It is
 * a measurement beside a sequence beside a stream, and a reader needs all three in
 * the same glance to answer the only question they have, which is whether the run
 * is going to finish and what it is costing. Separating them across three
 * components and asking a consumer to assemble that is the assembly this system
 * exists to remove.
 *
 * **The budget is a Meter and the steps are a Timeline, and neither is
 * reimplemented here.** That is the whole discipline. The budget draws the limits
 * the caller gave it and stays neutral below all of them, because the Component
 * cannot see that a number is a problem. The steps draw their durations to scale
 * against the slowest one, so "where did the time go" is answerable by looking.
 * What this Block contributes is the arrangement and the two facts that belong to
 * neither: that the two belong in one frame, and that a run with no budget should
 * not be given an empty one.
 *
 * **Streaming is one prop doing two things, and both of them are about the same
 * decision.** It marks the region busy, because a caller that has stopped sending
 * events has told assistive technology a stream never ends if it leaves the flag
 * up. And it wraps the steps in a LiveRegion, so an append is announced. Neither
 * is done by default: a run that has finished should not announce anything, and a
 * Block cannot know which kind of run it is looking at. The prop is the caller's
 * knowledge expressed once, and it is the reason the steps and the budget both
 * know about the run rather than each knowing about themselves.
 *
 * **The empty state is the run's first moments, so it is authored.** A console
 * with nothing in it is what a reader sees for the first second of every run, and
 * a blank frame in that moment reads as a broken surface rather than as a run that
 * has not started.
 */
export function RunConsole01({
  title,
  copy,
  steps,
  budget,
  detail,
  streaming = false,
  headingLevel = 'h2',
  className,
}: RunConsole01Props) {
  const waiting = steps.length === 0
  const Heading = headingLevel

  // Built once and placed in one of two places, so the streaming and the finished
  // rendering cannot drift apart. Two copies of this markup would be two answers
  // to what a run looks like, and the second one is the one that goes stale.
  const body = waiting ? (
    <p data-slot="run-console-01-waiting" className="text-muted-foreground text-sm">
      {copy.waiting}
    </p>
  ) : (
    <Timeline entries={steps} label={copy.stepsLabel} empty={copy.waiting} />
  )

  return (
    <div
      data-slot="run-console-01"
      className={cn('border-border bg-card flex flex-col gap-6 rounded-lg border p-5', className)}
    >
      <header data-slot="run-console-01-header" className="flex flex-col gap-1">
        {/*
         * The heading is a real heading rather than a styled span, at the level the
         * caller says. A console is a region of a page, and a reader navigating by
         * heading has to be able to find it and skip it, and neither works with a div
         * that looks like a heading. The level was fixed at two, which answers the
         * first half and not the second: a console opened as a panel inside a page
         * that already has an `h2` becomes a sibling of it rather than a child, so
         * "skip to the next heading at or below level two" walks straight past the
         * run the reader came to read.
         */}
        <Heading className="text-foreground text-base font-semibold tracking-tight">{title}</Heading>
        {detail === undefined ? null : (
          <p className="text-muted-foreground text-sm">{detail}</p>
        )}
      </header>

      {/*
       * The budget sits above the steps rather than beside them. A reader's first
       * question about a run is whether it is going to finish, and the answer is
       * the budget, so the budget is read first and the sequence second. A
       * two-column arrangement would put them at the same height and make the
       * reader choose, which is the choice this Block is removing.
       */}
      {budget === undefined ? null : (
        <div data-slot="run-console-01-budget">
          <Meter
            value={budget.value}
            max={budget.max}
            label={copy.budgetLabel}
            valueText={copy.budgetValue(budget.value, budget.max)}
            thresholds={budget.thresholds}
          >
            <span>{copy.budgetValue(budget.value, budget.max)}</span>
          </Meter>
        </div>
      )}

      {/*
       * The region exists only while the run is still arriving, and that is a
       * decision rather than an optimisation. A live region that is present for a
       * run that has already finished announces nothing on mount, but it is still
       * on the page, and a later re-render with different steps is an unrelated
       * change that it will announce. That is the same trap as any permanently
       * present live region, and this Block is the last place that should walk into
       * it.
       *
       * Mounting it when the run starts and unmounting it when the run ends is also
       * the order that does not lose an announcement: the region is on the page
       * before the first event arrives, which is when a screen reader is listening.
       * A region that mounted at the same moment as its first event would race it.
       *
       * It wraps the steps and not the budget. Announcing the budget alongside them
       * would re-read the spending on every append, and a region that announces more
       * than what changed is a region whose announcements stop being read.
       */}
      {streaming ? (
        <LiveRegion busy label={copy.stepsLabel} className="min-w-0">
          {body}
        </LiveRegion>
      ) : (
        body
      )}
    </div>
  )
}

export default RunConsole01
