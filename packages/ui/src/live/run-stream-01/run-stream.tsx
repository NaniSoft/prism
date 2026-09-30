'use client'

import { useEffect, useRef, useState } from 'react'

import { LiveRegion } from '../../components/ui/live-region'
import { ScrollArea } from '../../components/ui/scroll-area'
import { cn } from '../../lib/utils'

/**
 * Who produced an event, as a closed set.
 *
 * The four are the ones an agent run actually has, and they are closed because the
 * treatment is not the caller's: a role is a slot for a colour, a mark and an
 * announcement, and a free-text role would be a string with no rendering behind it.
 * The **words** are still the caller's, in `message`. Prism owns which role looks
 * like what, and ships none of the labels.
 */
export type RunEventRole = 'agent' | 'tool' | 'system' | 'error'

/** One event, as the surface receives it. */
export type RunEvent = {
  /** Stable across re-renders, so an event is never re-announced because its index moved. */
  id: string
  role: RunEventRole
  /** Epoch milliseconds, used for order and for the elapsed column. */
  at: number
  /** What happened, in the consumer's words. */
  message: string
  /** Optional second line: a tool's arguments, a path, a code. */
  detail?: string
}

/** Where a run has got to. The tiers are Prism's; the words beside them are the caller's. */
export type RunStatus = 'queued' | 'running' | 'waiting' | 'done' | 'failed'

/**
 * How the surface receives events.
 *
 * The consumer owns the socket, the transport and the persistence, so this is a
 * function it supplies rather than a connection Prism opens. It is called once on
 * mount and must return an unsubscribe, which is what makes a WebSocket, an
 * `EventSource`, a polling timer or a test's own array all the same shape to the
 * surface. Nothing here knows which one it got.
 */
export type RunSubscribe = (emit: (event: RunEvent) => void) => () => void

export type RunStream01Props = {
  /**
   * Called once to begin receiving, and again whenever `resubscribeKey` changes.
   * Must return an unsubscribe; the surface calls it on unmount and before
   * re-subscribing, so a consumer that returns nothing leaks its connection.
   */
  subscribe: RunSubscribe
  /**
   * Which run this surface is showing, and the reset lever.
   *
   * Changing it **clears the log and reseeds it from `initial`**, as well as
   * tearing the subscription down and opening a new one. A run is identified by
   * whatever the consumer already uses to identify it, so a second run in the same
   * surface is a new subscription rather than two consumers of one, and it is a new
   * log rather than the old run's events with the new run's appended, which is the
   * reading a reader would not distinguish from one run being longer than it was.
   */
  resubscribeKey?: string | number
  /**
   * The events already known when this run is opened, so a surface opened mid-run
   * is not blank. Oldest first.
   *
   * Read when the run is opened, and again whenever `resubscribeKey` changes. It is
   * **not** read on every render: a prop that looked like the current event list
   * and quietly seeded only once would be a trap, and a prop that re-seeded on
   * every render would discard the stream. This seeds, and the stream takes over.
   */
  initial?: readonly RunEvent[]
  /** Where the run has got to. */
  status?: RunStatus
  /** The word beside the status. Required when a status is passed. */
  statusLabel?: string
  /** Optional label above the surface's heading. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The surface's heading. Omit it for one composed under its own. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** What the surface says when it holds no events yet. */
  emptyLabel?: string
  /**
   * The accessible name of the scrolling region.
   *
   * Required, because `ScrollArea` requires it and the reason is the right one: a
   * scroll region with no name is announced as a group of focusable nothing, and a
   * keyboard reader who tabs into it cannot tell what is in it or what is past the
   * edge. The name is the consumer's word, as every other word here is.
   */
  eventsLabel: string
  /** Announced to assistive technology as events arrive. */
  liveLabel?: string
  /** How many events to keep. Older events fall off the top. */
  limit?: number
  className?: string
}

/** The ink each role is stated in, and the tick beside it. */
const ROLE_INK: Record<RunEventRole, string> = {
  agent: 'text-foreground',
  tool: 'text-foreground',
  system: 'text-muted-foreground',
  error: 'text-destructive',
}

/** The tick each role draws, so the four are told apart without relying on colour. */
const ROLE_MARK: Record<RunEventRole, string> = {
  agent: '●',
  tool: '▸',
  system: '·',
  error: '×',
}

const STATUS_INK: Record<RunStatus, string> = {
  queued: 'text-muted-foreground',
  running: 'text-foreground',
  waiting: 'text-warning',
  done: 'text-success',
  failed: 'text-destructive',
}

/** The one source of truth for order, so a late event with an earlier `at` sorts there. */
const byTimeThenId = (a: RunEvent, b: RunEvent): number =>
  a.at - b.at || a.id.localeCompare(b.id)

/**
 * The event log of a run, receiving events as they arrive.
 *
 * **This is the first surface in the package that is a client Component**, and that
 * is the whole of what the fourth Kind is for. A Block takes its content as props,
 * so it is rendered once and re-rendered when the consumer's framework decides; a
 * `live` surface's content changes **without a navigation event**, which no amount
 * of prop-passing expresses. So this owns a subscription and the accumulation
 * behind it.
 *
 * **Prism owns the surface, the consumer owns the transport.** `subscribe` is a
 * function the consumer supplies and a function it tears down. There is no socket
 * in this file, no endpoint, no retry policy and no persistence, and there is no
 * provider to mount: a consumer that already has a connection passes it in, and one
 * that does not has not acquired a client runtime by importing this.
 *
 * **The events are kept sorted by `at`, not by arrival.** A consumer's transport
 * decides when a message is delivered, and a reconnect can deliver an older event
 * after a newer one. Sorting on arrival would put a run's own history out of order
 * in exactly the case where a reader is most likely to be watching. Ties break on
 * `id`, so the order is total and two runs of the same suite render the same log.
 *
 * **New events are announced once, politely, and the log itself is not a live
 * region.** Announcing a growing list would make a screen reader read the whole run
 * again on every arrival, which is the failure a live region on a list guarantees.
 * `LiveRegion` carries the newest event's message alone, and the log is an ordinary
 * scrollable list a reader can move through at their own pace.
 *
 * `limit` bounds what is held, because an agent run can produce thousands of events
 * and a surface that grows without bound is a surface that eventually stops
 * repainting. Older events fall off the top, which is the direction a reader wants:
 * the run's beginning is the part they can scroll back to in another surface.
 */
export function RunStream01({
  subscribe,
  resubscribeKey,
  initial,
  status,
  statusLabel,
  eyebrow,
  title,
  description,
  emptyLabel,
  eventsLabel,
  liveLabel,
  limit = 500,
  className,
}: RunStream01Props) {
  /**
   * The run's log, held against the key that produced it.
   *
   * Adjusting state during render when the key changes is React's documented
   * pattern for "a prop changed, start over", and it is the right one here: the
   * alternative is an effect, and an effect that clears the log runs *after* a
   * render, so the surface would paint one frame holding the previous run's events
   * under the new run's heading.
   */
  const [newest, setNewest] = useState<string | undefined>(undefined)

  const [run, setRun] = useState<{ key: string | number | undefined; events: RunEvent[] }>(() => ({
    key: resubscribeKey,
    events: [...(initial ?? [])].sort(byTimeThenId),
  }))
  if (run.key !== resubscribeKey) {
    setRun({ key: resubscribeKey, events: [...(initial ?? [])].sort(byTimeThenId) })
    // The announcement is cleared with the log it announced, so a run switch does
    // not leave the previous run's last event in the live region saying so.
    setNewest(undefined)
  }
  const events = run.events
  const setEvents = (next: (current: RunEvent[]) => RunEvent[]): void => {
    setRun((current) => ({ ...current, events: next(current.events) }))
  }

  // A ref rather than state, so the effect does not re-subscribe because an event
  // arrived. An effect that depended on the value it writes re-runs itself, and the
  // surface would open a new subscription per event.
  const emit = useRef<(event: RunEvent) => void>(() => {})

  useEffect(() => {
    emit.current = (event: RunEvent) => {
      setEvents((current) => {
        const next = [...current, event].sort(byTimeThenId)
        return next.length > limit ? next.slice(next.length - limit) : next
      })
      setNewest(event.message)
    }

    const stop = subscribe(emit.current)
    return () => {
      // Calling an unsubscribe the consumer did not return would throw during
      // unmount, so a missing one is stepped over and the leak is the consumer's to
      // fix rather than a crash in someone else's teardown.
      if (typeof stop === 'function') stop()
    }
  }, [subscribe, resubscribeKey, limit])

  return (
    <section
      data-slot="run-stream"
      className={cn('border-border flex flex-col gap-4 rounded-lg border p-4', className)}
    >
      {LiveRegion({ politeness: 'polite', label: liveLabel, children: newest })}

      {title !== undefined || eyebrow !== undefined || description !== undefined ? (
        <header className="flex flex-col gap-1">
          {eyebrow ? (
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {eyebrow}
            </span>
          ) : null}
          {/*
            The heading is the title and only the title. An earlier version fell back
            to `statusLabel` when no title was given, which rendered "Failed after 3
            attempts" twice: once as the surface's heading and once as its status. A
            status is not a heading, and a reader meeting the same sentence as both
            the subject of a region and its state has been told the same thing twice
            and learned nothing.
          */}
          {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : null}
          {description ? (
            <p className="text-muted-foreground text-pretty text-sm">{description}</p>
          ) : null}
        </header>
      ) : null}

      {status !== undefined ? (
        <p data-slot="run-status" className={cn('font-mono text-xs', STATUS_INK[status])}>
          {statusLabel}
        </p>
      ) : null}

      {events.length === 0 ? (
        <p data-slot="run-stream-empty" className="text-muted-foreground text-sm">
          {emptyLabel}
        </p>
      ) : (
        <ScrollArea label={eventsLabel} className="max-h-80">
          <ol data-slot="run-events" className="flex flex-col gap-2">
            {events.map((event) => (
              <li
                key={event.id}
                data-slot="run-event"
                data-role={event.role}
                className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-3 gap-y-0.5"
              >
                <span
                  aria-hidden="true"
                  className={cn('font-mono text-xs', ROLE_INK[event.role])}
                >
                  {ROLE_MARK[event.role]}
                </span>
                <time
                  dateTime={new Date(event.at).toISOString()}
                  className="text-muted-foreground font-mono text-xs tabular-nums"
                >
                  {new Date(event.at).toISOString().slice(11, 19)}
                </time>
                <span className={cn('text-pretty text-sm', ROLE_INK[event.role])}>
                  {event.message}
                  {event.detail ? (
                    <span className="text-muted-foreground block font-mono text-xs">
                      {event.detail}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </ScrollArea>
      )}
    </section>
  )
}

export default RunStream01
