import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * How far along an event is, where the run is still going.
 *
 * Four states, and this is a different vocabulary from the four product-capability
 * tiers a StatusLedger01 row carries. Those answer "what can this product do
 * today" and these answer "what happened to this run", so they are two lists
 * about two different subjects rather than two lists about one. A `planned` agent
 * run is a category error, and a `failed` capability is a category error, which is
 * the test that tells them apart.
 *
 * `running` is the only one that moves. It is the state a run is in while it is
 * still arriving events, and it is the reason a Timeline is normally wrapped in a
 * LiveRegion rather than being one.
 */
export type TimelineState = 'pending' | 'running' | 'done' | 'failed'

/** One event in a run. */
export type TimelineEntry = {
  /**
   * A stable key for the entry.
   *
   * Required, because a run's entries arrive and are reordered as it goes, and a
   * list keyed by index would have a reader's focus jump to a different step when
   * an earlier one is inserted.
   */
  id: string
  /** The words naming what happened. */
  title: string
  /**
   * How long the step took, in milliseconds.
   *
   * Omit it for a step whose duration is meaningless: a run's opening event has no
   * length, and a bar drawn for it would be a bar comparing nothing.
   */
  duration?: number
  /** Where the step is. @defaultValue 'done' */
  state?: TimelineState
  /** Anything the caller wants under the step: a command, a diff, a payload. */
  children?: ReactNode
}

/** The props the Timeline accepts. */
export interface TimelineProps extends Omit<ComponentProps<'ol'>, 'children'> {
  /**
   * The events, in the order they happened.
   *
   * Order is the caller's, not this Component's: a run log arrives in the order
   * the transport delivered it, and a Timeline that sorted by duration or by state
   * would be a different component that answers a different question.
   */
  entries: readonly TimelineEntry[]
  /**
   * The accessible name of the list, read before its entries.
   *
   * Required rather than defaulted, because two timelines on a page are two lists a
   * reader cannot tell apart, and the name is the caller's word.
   */
  label: string
  /**
   * The words for a duration, given the number of milliseconds.
   *
   * The default renders seconds with at most one decimal, which is a measurement
   * rather than a sentence. A caller whose steps are measured in minutes or whose
   * readers want a different precision passes its own.
   */
  format?: (ms: number) => string
  /** Layout only. */
  className?: string
  /**
   * What a reader is told when the run has no events yet.
   *
   * An empty list is the state a run spends its first moments in, so it is
   * authored rather than left to a caller to notice.
   */
  empty?: ReactNode
}

/**
 * The mark each state draws, and the fill of its duration bar.
 *
 * Every mark is a ring rather than a filled dot, for the measurement reason the
 * StatusLedger01 mark gives: a filled pastel dot fails contrast against a light
 * card, and a state a reader cannot see is not a state. The ring carries the state
 * and the entry's own words carry it too, so nothing here is colour alone.
 */
const STATE_MARK: Record<TimelineState, string> = {
  pending: 'border-border bg-background',
  running: 'border-primary bg-background',
  done: 'border-brand-ink bg-brand-ink',
  failed: 'border-destructive bg-destructive',
}

const STATE_BAR: Record<TimelineState, string> = {
  // A pending step's bar is the border colour rather than a muted fill, because a
  // bar that is drawn but empty says "this took no time" rather than "this has not
  // run yet". Those are different claims and only one of them is true.
  pending: 'bg-border',
  running: 'bg-primary',
  done: 'bg-brand-ink',
  failed: 'bg-destructive',
}

/** A duration in the compact form the default uses, and the guard against a non-number. */
function defaultFormat(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return ''
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  return `${seconds >= 10 ? Math.round(seconds) : Math.round(seconds * 10) / 10}s`
}

/**
 * A run's events in order, with the time each one took drawn to scale.
 *
 * The second half of an agent console is always the same question: not what
 * happened, but where the time went. A list of events in order answers the first
 * and is silent on the second, so a reader who wants to know why a run took forty
 * seconds has to read every number and do the arithmetic themselves.
 *
 * **The bars share a left edge and are drawn to scale against the longest step in
 * the run.** That is the whole idea. The scale is relative rather than absolute,
 * which is the right choice here: the shape of the run is the question, and a
 * shared zero baseline would be a second axis nobody reads. The consequence worth
 * stating is that the bars answer "which step was slow" and deliberately do not
 * answer "how long did the run take", because only the caller knows whether its
 * steps were sequential or overlapping, and a bar that implied otherwise would be
 * claiming something about the run it cannot see.
 *
 * **A step with no duration draws no bar.** A run's opening event has no length,
 * and a zero-width bar beside it would read as "this was instant" rather than
 * "this has no duration", which are different claims and only one is true.
 *
 * **It is a list, not a live region.** The order is the accessibility tree: an
 * ordered list, so a reader hears the sequence and the count. A run that is still
 * arriving is normally wrapped in a LiveRegion by the caller, because the arrival
 * is the event worth announcing and the list is the thing worth reading
 * afterwards. Making the list itself live would announce the whole run again on
 * every append.
 */
function Timeline({
  entries,
  label,
  format = defaultFormat,
  className,
  empty,
  ...props
}: TimelineProps) {
  if (entries.length === 0) {
    // A run spends its first moments with nothing in it, and an empty list with no
    // words in it is a gap rather than a state.
    return (
      <div data-slot="timeline-empty" className={cn('text-muted-foreground text-sm', className)}>
        {empty ?? null}
      </div>
    )
  }

  // The longest step with a duration sets the scale. A run whose steps all report
  // no duration has no scale, and every bar is then omitted rather than drawn at
  // an arbitrary width.
  const longest = Math.max(
    0,
    ...entries
      .map((entry) => entry.duration)
      .filter((duration): duration is number => typeof duration === 'number' && duration > 0),
  )

  return (
    <ol
      data-slot="timeline"
      aria-label={label}
      className={cn('flex flex-col', className)}
      {...props}
    >
      {entries.map((entry, index) => {
        const state = entry.state ?? 'done'
        // Bound to a local before the test, because a boolean derived from a
        // narrowing check does not carry the narrowing to its own use: reading
        // `entry.duration` after `hasDuration` is still `number | undefined` to
        // the checker, which is the sort of thing a boolean is a poor carrier for.
        const duration = entry.duration
        const hasDuration = typeof duration === 'number' && duration > 0 && longest > 0
        const width = hasDuration ? (duration / longest) * 100 : 0
        const isLast = index === entries.length - 1

        return (
          <li
            key={entry.id}
            data-slot="timeline-entry"
            data-state={state}
            className="grid grid-cols-[auto_1fr] gap-x-3"
          >
            {/*
             * The mark and the spine, in one column. The spine runs to the bottom
             * of the entry rather than to the next mark, so the rule stops at the
             * last entry instead of trailing past the end of the run, which is the
             * detail that separates a spine from a border.
             */}
            <div
              data-slot="timeline-rail"
              aria-hidden="true"
              className="flex flex-col items-center"
            >
              <span
                data-slot="timeline-mark"
                className={cn(
                  'mt-1.5 size-2 shrink-0 rounded-full border-2',
                  STATE_MARK[state],
                  // A running step is the one that is still moving, and a ring that
                  // pulses is the only motion in the Component. It is state
                  // feedback, not decoration: it stops when the step stops.
                  state === 'running' && 'animate-pulse',
                )}
              />
              {isLast ? null : <span data-slot="timeline-spine" className="bg-border w-px flex-1" />}
            </div>

            <div
              className={cn(
                // The last entry has nothing under it, so its bottom padding is
                // dropped rather than leaving a gap the reader reads as a
                // missing step.
                'flex min-w-0 flex-col gap-1.5',
                isLast ? 'pb-0' : 'pb-4',
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span
                  data-slot="timeline-title"
                  className={cn(
                    'min-w-0 truncate text-sm',
                    state === 'pending' && 'text-muted-foreground',
                    state === 'failed' && 'text-destructive',
                    state === 'done' || state === 'running'
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {entry.title}
                </span>
                {/*
                 * Tabular numerals, because a column of durations is read as a
                 * column and proportional digits make the decimal points drift
                 * sideways between rows. This is the browser default that belongs
                 * to no design system and is the cheapest signal that a surface
                 * was built rather than assembled.
                 */}
                {typeof entry.duration === 'number' && entry.duration > 0 ? (
                  <span
                    data-slot="timeline-duration"
                    className="text-muted-foreground shrink-0 text-xs tabular-nums"
                  >
                    {format(entry.duration)}
                  </span>
                ) : null}
              </div>

              {hasDuration ? (
                <span
                  data-slot="timeline-bar"
                  className={cn('block h-1 w-full overflow-hidden rounded-full', STATE_BAR[state])}
                  style={{ width: `${width}%` }}
                />
              ) : null}

              {entry.children === undefined ? null : (
                <div data-slot="timeline-detail" className="text-muted-foreground min-w-0 text-sm">
                  {entry.children}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { Timeline }
