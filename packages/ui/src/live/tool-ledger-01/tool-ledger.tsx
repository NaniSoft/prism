'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { LiveRegion } from '../../components/ui/live-region'
import { ScrollArea } from '../../components/ui/scroll-area'
import { cn } from '../../lib/utils'

/**
 * Where a tool call has got to, as a closed set of five.
 *
 * This is a lifecycle, and that is why the set is closed and the treatment is
 * Prism's: a call is queued, then it runs, then it is one of three things, and
 * the order and the branch are the same in every agent runtime worth naming. A
 * tool that invents a sixth state has to be drawn by a package that has no
 * rendering for it, which is a string in a column with a colour beside it that
 * means nothing.
 *
 * **The words are the caller's, in the call's own fields, and this Item has no
 * `stateLabel`.** That is a deliberate gap rather than an oversight, and the
 * reason is what this type is attached to: a `ToolCall` is one event on a
 * transport, and a transport does not send a translated sentence with every
 * event. A required label per call is a field a consumer has to populate on every
 * emission, and a field nobody fills is a hole with a type over it. The words for
 * a call are the tool's own name, its arguments, its result and its error, all of
 * which the caller already has, because the caller is the thing that emitted them.
 *
 * The cost is named rather than hidden: a reader who cannot separate the inks and
 * is looking at a bare entry has been told a call finished and not whether it
 * succeeded or failed, and the fix is a prop this Item does not have. What this
 * surface does instead is make the mark and the ink agree with the words on the
 * row, so a failed call is one whose `errorText` is there.
 */
export type ToolCallState = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

/**
 * One tool call, as the surface receives it.
 *
 * Every field is a fact the consumer already had, and none of them is a figure
 * this surface computed. See the Component's JSDoc for the argument, which turns
 * on the difference between a number a consumer measured and one this package
 * inferred.
 */
export type ToolCall = {
  /**
   * The call's stable key, and the only thing its row is keyed on.
   *
   * A transport that reports one call three times reports it under one `id`, and
   * the surface needs that: a ledger with three rows for one call is a log, and a
   * log is the thing this Item exists beside.
   */
  id: string
  /**
   * The tool's name, in the caller's own vocabulary.
   *
   * `search_files`, `Read`, `web.run`: agent runtimes name their tools
   * differently from one another and from any product that fronts them, and the
   * name is the one word on the row a reader scanning for a call is looking for.
   */
  name: string
  /**
   * When the call was made, in epoch milliseconds.
   *
   * The caller's clock and the caller's unit, and the one number the surface
   * orders by. A bare number is milliseconds here as everywhere else in this
   * package, so a consumer whose transport sends seconds has a bug this surface
   * cannot detect: 1,700,000,000 is a perfectly valid millisecond timestamp.
   */
  at: number
  /** Where the call has got to. See `ToolCallState`. */
  state: ToolCallState
  /**
   * The caller's own reading of how long the call took, in their own units.
   *
   * Called with the difference between two of the consumer's own `at` values and
   * with the call's `id` and `name`, and only for a call the surface has seen
   * twice. `"1.2s"`, `"1200ms"` and `"about a second"` are three sentences in
   * three registers, and which one a product wants beside a call is a decision
   * about the product. The cost of handing it over rather than composing it here
   * is that a caller who passes nothing gets no duration, which is the correct
   * answer: a zero is a claim that a call took no time.
   *
   * It travels on the call rather than on the surface, and that is a decision
   * rather than an accident. One formatter on the surface is one register for
   * every call in the ledger, and a consumer whose ledger holds calls from two
   * producers, or a fixture beside a live stream, has two registers and no way to
   * say so. A function reference is cheap to share, so a consumer that wants one
   * register everywhere attaches one function to every call.
   */
  durationLabel?: (ms: number, call: { id: string; name: string }) => string
  /**
   * The arguments, rendered by the caller as text.
   *
   * A string and never a parsed object, for two reasons at once. A Block and a
   * surface in this package ship no structure they did not receive, and a
   * serialiser is structure: an object here would be one this file had to
   * stringify, key by key, with no rule about which keys are secrets, which are
   * large, and which order they appear in. A caller who redacts before rendering
   * can redact, because the redaction happened in their code.
   */
  argumentsText?: string
  /** What the call returned, in the caller's own rendering. Drawn as passed. */
  resultText?: string
  /**
   * What went wrong, in the caller's own rendering.
   *
   * Drawn in the destructive ink, which is the one place on this surface a
   * colour is doing the work, and the reason it is allowed to is that the words
   * are the signal: the ink is `text-destructive` beside a sentence a reader can
   * read, so a reader who cannot separate it reads the same fact.
   */
  errorText?: string
  /**
   * A name for a phase of the call, in the caller's own words.
   *
   * Traces call these spans, and a span is a named region inside one call: the
   * run inside a run, the retry inside the run. It is drawn as a small mono tag
   * beside the tool's name because that is what it is in a trace viewer, and
   * because a phase with no name is a second timeline with no ticks.
   */
  spanLabel?: string
  /**
   * A destination for this call: the trace, the replay, the row in the caller's
   * own view.
   *
   * A native anchor, and both halves required, because a link whose only words are
   * the tool's name tells a reader nothing about what following it does and the
   * tool's name is a machine name by construction.
   */
  link?: {
    /** Where it goes. */
    href: string
    /** The words on the link. */
    label: string
  }
}

/**
 * How the surface receives calls.
 *
 * The consumer owns the socket, the transport and the persistence, so this is a
 * function it supplies rather than a connection Prism opens. It is called once on
 * mount and must return an unsubscribe, which is what makes a WebSocket, an
 * `EventSource`, a polling timer and a test's own array all the same shape to the
 * surface. Nothing here knows which one it got.
 */
export type ToolSubscribe = (emit: (call: ToolCall) => void) => () => void

/**
 * The props a ToolLedger01 takes.
 *
 * Every string is a prop and the surface ships none: no tool name, no state
 * word, no duration, no arguments, no "no calls yet" and no "3 earlier calls are
 * not shown".
 */
export type ToolLedger01Props = {
  /**
   * Called once to begin receiving, and again whenever `resubscribeKey` changes.
   *
   * Must return an unsubscribe; the surface calls it on unmount and before
   * re-subscribing, so a consumer that returns nothing leaks its connection. It
   * is also the only way content arrives: this surface fetches nothing, polls
   * nothing and holds no timer, so a consumer that wants the ledger to have
   * content before the transport has said anything passes `callbacks`.
   */
  subscribe: ToolSubscribe
  /**
   * The calls already known when this run is opened, so a surface opened
   * mid-run is not blank. Oldest first.
   *
   * Read when the run is opened, and again whenever `resubscribeKey` changes. It
   * is **not** read on every render: a prop that looked like the current call list
   * and quietly seeded only once would be a trap, and a prop that re-seeded on
   * every render would discard the stream. This seeds, and the stream takes over.
   *
   * It is the answer to a pause, too: see `pauseControl` for why a paused ledger
   * throws away what arrived rather than queueing it, and this is how a reader
   * gets it back.
   */
  callbacks?: readonly ToolCall[]
  /**
   * Which run this surface is showing, and the reset lever.
   *
   * Changing it clears the ledger and reseeds it from `callbacks`, as well as
   * tearing the subscription down and opening a new one. A run is identified by
   * whatever the consumer already uses to identify it, and a second run in the
   * same surface is a new subscription rather than two consumers of one. It is
   * also a new ledger rather than the old run's calls with the new run's
   * appended, which is a reading no reader could distinguish from one run being
   * longer than it was.
   */
  resubscribeKey?: string
  /**
   * The accessible name of the ledger.
   *
   * Required, and required for the reason `ScrollArea` requires it, which is the
   * right one: a scroll region with no name is announced as a group of focusable
   * nothing, and a keyboard reader who tabs into it cannot tell what is in it or
   * what is past the edge. The words are the consumer's.
   */
  label: string
  /**
   * What the surface says while it holds no calls.
   *
   * A node, because the honest first state of a ledger is three different
   * sentences in three different situations: nothing has been called yet, the run
   * is between steps, and the calls that were here are not shown because the
   * ledger is holding a window.
   */
  empty: ReactNode
  /**
   * How many calls the surface keeps. Older calls fall off the top. @defaultValue 200
   *
   * Two hundred, and the argument for a bounded number is on the Component below:
   * a run with four hundred tool calls is a log, and a ledger that kept all of
   * them would put four hundred rows in front of a reader who wants the last ten.
   */
  limit?: number
  /**
   * The caller's own sentence about how many calls are not shown.
   *
   * A function and not a string with a number in it, for the reason every count
   * in this package is a function: "12 earlier calls" and "showing the last 200 of
   * 412" are two sentences in two languages, and the moment a reader needs this
   * line is the moment they have most reason to believe the ledger is lying.
   */
  droppedLabel?: (count: number) => string
  /**
   * Whether the surface opens paused.
   *
   * Read when the ledger opens, and the control below owns it from the first
   * press after that. The honest name for this prop, following `MiniCalendar`'s
   * `defaultMonth`, would be `defaultPaused`; it is documented as what it is
   * rather than dressed up as a controlled value, because a controlled value with
   * no callback is a prop that looks live and is read once, which is the trap
   * `RunStream01` names on `initial`.
   *
   * The missing half is a callback, and it is missing because the control is the
   * surface's own: a pause control with no `onPauseChange` cannot be a control
   * over the caller's state, so this surface keeps the state and the caller keeps
   * the transport. The cost is that a consumer who pauses the ledger from their
   * own UI has no lever here, and the answer for them is a new `resubscribeKey`,
   * which is a heavier one than a callback and is named rather than pretended
   * away.
   */
  paused?: boolean
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
} & (
  | { pauseControl?: false; pauseLabel?: never; resumeLabel?: never }
  | { pauseControl: true; pauseLabel: string; resumeLabel: string }
)

/**
 * One row of the ledger: the call as last reported, and the moment it was first
 * seen.
 *
 * The two are kept apart because a call arrives more than once. A transport that
 * reports `queued`, then `running`, then `succeeded` sends three emissions under
 * one `id`, and a ledger that appended them would be a log. `openedAt` is the
 * first sighting, and it is what the row is ordered by and what its clock reads,
 * so a row does not jump to the end of the list at the moment it finishes.
 */
type LedgerRow = {
  /** The call as last reported. */
  call: ToolCall
  /** The `at` of the first sighting of this id. */
  openedAt: number
}

/** The ledger, held against the key that produced it. */
type LedgerRun = {
  key: string | undefined
  rows: LedgerRow[]
  dropped: number
}

/**
 * The one source of truth for order, so a late call with an earlier `at` sorts
 * there and two runs of the same suite render the same ledger. Ties break on
 * `id`, which is the same rule `RunStream01` states for its own events.
 */
const byOpened = (a: LedgerRow, b: LedgerRow): number =>
  a.openedAt - b.openedAt || a.call.id.localeCompare(b.call.id)

/**
 * The seed a run opens with, already trimmed to the window.
 *
 * The trim is here rather than only on the arrival path because a caller who
 * passes four hundred `callbacks` to a ledger that keeps two hundred has to be
 * told so on the first paint, and a surface that only counted what it dropped
 * after it dropped it would print a count of zero over a ledger missing half its
 * history.
 */
function seedOf(calls: readonly ToolCall[], limit: number): Pick<LedgerRun, 'rows' | 'dropped'> {
  const rows = [...calls].map((call) => ({ call, openedAt: call.at })).sort(byOpened)
  if (rows.length <= limit) return { rows, dropped: 0 }
  const dropped = rows.length - limit
  return { rows: rows.slice(dropped), dropped }
}

/**
 * The ink each state is stated in, and the tick beside it.
 *
 * The tick is the state's own first letter rather than a glyph this file invented,
 * so there is nothing to translate and nothing to learn twice: `f` is the failed
 * call in every locale, and it is a letter rather than a shape, so it survives a
 * monochrome render and a screen at 200 per cent the way a hairline does not.
 *
 * `queued` and `cancelled` share the muted ink, and the letters are what tell them
 * apart. That is the same trade `Status` makes and states: a wider palette on a
 * surface a reader scans is a wider set of colours they have to learn, and the
 * cost of a shared ink is one letter.
 */
const STATE_INK: Record<ToolCallState, string> = {
  queued: 'text-muted-foreground',
  running: 'text-foreground',
  succeeded: 'text-success',
  failed: 'text-destructive',
  cancelled: 'text-muted-foreground',
}

/** The tick each state draws, so the five are told apart without relying on colour. */
const STATE_MARK: Record<ToolCallState, string> = {
  queued: 'q',
  running: 'r',
  succeeded: 's',
  failed: 'f',
  cancelled: 'c',
}

/** The clock a row reads, in UTC, because the surface holds no locale to format in. */
const clockOf = (at: number): string => new Date(at).toISOString().slice(11, 19)

/** One call merged into the ledger, and what fell off the top doing it. */
function merge(rows: readonly LedgerRow[], call: ToolCall, limit: number): Pick<LedgerRun, 'rows' | 'dropped'> {
  const at = rows.findIndex((row) => row.call.id === call.id)
  const next =
    at === -1
      ? [...rows, { call, openedAt: call.at }].sort(byOpened)
      : rows.map((row, index) => (index === at ? { call, openedAt: row.openedAt } : row))
  if (next.length <= limit) return { rows: next, dropped: 0 }
  const dropped = next.length - limit
  return { rows: next.slice(dropped), dropped }
}

/**
 * The tool-call ledger of a run in flight: what was called, what it returned, and
 * what it cost, as it arrives.
 *
 * **The surface opens no connection, and that is the whole boundary.** There is no
 * socket in this file, no endpoint, no retry policy, no backoff, no heartbeat and
 * no persistence, and there is no provider to mount. `subscribe` is a function the
 * consumer supplies and a function it tears down, which is what makes a WebSocket,
 * an `EventSource`, a polling timer, a server-sent stream and a test's own array
 * all the same shape to this surface: nothing here knows which one it got. A
 * consumer that already has a connection passes it in, and a consumer that does
 * not has not acquired a client runtime by importing this.
 *
 * **It is the second of the two surfaces Prism owns for a run, and the two are
 * separate because a reader debugging a run wants them at different times and in
 * different shapes.** `RunStream01` says what happened in words: an ordered log of
 * events, each one a sentence the caller wrote, which is what a reader reads to
 * follow what an agent is doing. This one says what was called and what it cost in
 * structure: a name, a state, an elapsed figure, the arguments, the return value
 * or the error, keyed and ordered so two calls can be compared. Those are not two
 * renderings of one thing, because the word log answers "what did it say" and the
 * word ledger answers "what did it spend". A reader watching a run wants the
 * first; a reader with a bill, a latency regression or a bill from a provider
 * wants the second. Folding them into one surface would give a reader a table and
 * a narrative fighting over one scroll, each of them half as good at the job the
 * other was for, and a single surface is a single surface a consumer can only
 * take or leave.
 *
 * **It times nothing, measures nothing, and does not decide that a call
 * succeeded.** `at` is the consumer's timestamp and `durationLabel` is the
 * consumer's sentence, and the surface never starts a clock, never reads
 * `Date.now()` and never infers a duration from the gap between one call and the
 * next. That gap is a real number and it is not a duration: it is how long the
 * consumer's transport took to deliver two consecutive events, which is a fact
 * about the transport, and a ledger that printed it in a column headed "took"
 * would be reporting a figure nobody produced. The only subtraction here is
 * between two sightings of the *same* `id`, both of which are the consumer's own
 * `at` values, and even that is drawn only when the second sighting is later than
 * the first: a call seen once has no second timestamp, and a zero would be a
 * claim that a call took no time. For the same reason the surface does not decide
 * a call succeeded. It draws the state it was sent, in the ink that state is drawn
 * in, and a consumer whose transport reports `succeeded` for a call that raised is
 * a consumer with a bug in their transport that this surface cannot see and should
 * not paper over. The cost of all of that is named: a caller who wants a duration
 * they did not measure passes `durationLabel` and gets one, and a caller who
 * wants the surface to measure has the wrong surface.
 *
 * **A row is keyed on `id` and never on its index, and the reason is a screen
 * reader told something twice.** A ledger that grows at the top re-keys every row
 * below it when the index of each one moves, and React's reconciliation then
 * replaces those rows rather than moving them. A replaced node is a new node to
 * assistive technology, so a call the reader had already reached is announced
 * again as though it had just happened, once per arrival, in a surface whose whole
 * job is to report arrivals. Keying on `id` means an existing row is the same row
 * however far it has moved, which is also why a re-reported call updates its own
 * row in place instead of adding a second one: the same id is the same call.
 *
 * **`limit` drops the oldest and says how many, because a run with four hundred
 * tool calls is a log and not a table.** A ledger is a bounded set of rows a
 * reader scans and compares; a log is a sequence a reader searches. A run that
 * calls a tool four hundred times is normal rather than exceptional, and a ledger
 * that kept every call would put four hundred rows in front of a reader who wants
 * the last ten, in a `<ol>` inside a scroll region, at a moment when the run is
 * still going and the rows at the bottom are the ones that explain it. So the
 * oldest fall off the top, the direction a reader wants, and the count of what
 * fell is drawn rather than inferred: a bounded list that does not say it is
 * bounded reads as the whole thing, and a reader who believes a ledger is
 * complete and is not will draw the wrong conclusion from it. The dropped calls
 * are not lost to the consumer, who has the transport and the run; they are lost
 * to this surface's window, and the count is how big that window's blind spot is.
 *
 * **A paused ledger stops recording, and it does not stop the run.** While paused,
 * a call that arrives is dropped rather than queued, and the announcement is not
 * made. Queuing is the alternative and it is worse in both directions: a queue
 * that grows is a list whose contents the surface cannot show, and a queue that
 * flushes on resume dumps a hundred rows at once, which is a worse thing to happen
 * to a reader who pressed pause in order to read. The calls that happened are the
 * consumer's, and the way to get them back into this surface is a new
 * `resubscribeKey` with `callbacks` reseeded from the consumer's own record. What
 * a pause does not do is close the subscription, because the connection is the
 * consumer's and they may be sharing it with a `RunStream01` beside it.
 *
 * **It draws no heading.** This surface takes `label` and no `title`, because it is
 * the thing a consumer reaches for inside a region they have already named, and a
 * surface that named itself would either duplicate the caller's heading or push
 * them to omit theirs. `label` names the region for assistive technology, which is
 * a different job from a visible heading, and it is the same split `ScrollArea`
 * already makes.
 *
 * It draws a heading nowhere and it animates nowhere. There is no entrance, no
 * attention loop and no motion on an arriving row, because the reader was not
 * waiting for a row to arrive and the motion law refuses decoration outright; the
 * fact that something changed is reported by the polite region in it, which is the
 * one channel in this package built for exactly that.
 */
export function ToolLedger01({
  subscribe,
  callbacks,
  resubscribeKey,
  label,
  empty,
  limit = 200,
  droppedLabel,
  pauseControl,
  pauseLabel,
  resumeLabel,
  paused,
  className,
}: ToolLedger01Props) {
  const [newest, setNewest] = useState<string | undefined>(undefined)

  const [run, setRun] = useState<LedgerRun>(() => ({
    key: resubscribeKey,
    ...seedOf(callbacks ?? [], limit),
  }))
  /*
   * Adjusting state during render when the key changes is React's documented
   * pattern for "a prop changed, start over", and it is the right one here for the
   * reason `RunStream01` gives: an effect that clears the ledger runs *after* a
   * render, so the surface would paint one frame holding the previous run's calls
   * under the new run's subscription.
   */
  if (run.key !== resubscribeKey) {
    setRun({ key: resubscribeKey, ...seedOf(callbacks ?? [], limit) })
    // The announcement is cleared with the ledger it announced, so a run switch does
    // not leave the previous run's last call in the live region saying so.
    setNewest(undefined)
  }
  const rows = run.rows

  /**
   * Whether this surface is holding still, kept in a ref as well as in state.
   *
   * The ref is what the arrival path reads, and it is why the subscription effect
   * does not list the pause among its dependencies: an effect that depended on the
   * pause would tear the consumer's connection down and open a new one every time
   * a reader pressed the control, and a consumer who shares one socket between this
   * surface and a `RunStream01` would see it reconnect under them. The button
   * writes both, so the value the effect reads is the value the reader set.
   */
  const [held, setHeldState] = useState(paused === true)
  const heldRef = useRef(held)
  const setHeld = (next: boolean): void => {
    heldRef.current = next
    setHeldState(next)
  }

  /*
   * A ref rather than state, so the effect does not re-subscribe because a call
   * arrived. An effect that depended on the value it writes re-runs itself, and the
   * surface would open a new subscription per call.
   */
  const emit = useRef<(call: ToolCall) => void>(() => {})

  useEffect(() => {
    emit.current = (call: ToolCall) => {
      // Read through the ref, so a paused surface decides without re-subscribing.
      if (heldRef.current) return
      setRun((current) => {
        const added = merge(current.rows, call, limit)
        return {
          ...current,
          rows: added.rows,
          dropped: current.dropped + added.dropped,
        }
      })
      setNewest(call.name)
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
      data-slot="tool-ledger"
      className={cn('border-border flex flex-col gap-4 rounded-lg border p-4', className)}
    >
      {LiveRegion({ politeness: 'polite', children: newest })}

      {/*
        * The note about what is not shown and the reader's own pause control, in one
        * row and in that order: the count is a fact about the list and the control is
        * an act, and a reader who has just pressed pause wants the control under
        * their hand rather than at the far end of a sentence.
        */}
      {droppedLabel === undefined && pauseControl !== true ? null : (
        <div data-slot="tool-ledger-bar" className="flex flex-wrap items-center gap-3">
          {run.dropped > 0 && droppedLabel !== undefined ? (
            <p data-slot="tool-ledger-dropped" className="text-muted-foreground text-xs">
              {droppedLabel(run.dropped)}
            </p>
          ) : null}
          {pauseControl !== true ? null : (
            <Button
              data-slot="tool-ledger-pause"
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={held}
              className="ml-auto"
              onClick={() => setHeld(!heldRef.current)}
            >
              {held ? resumeLabel : pauseLabel}
            </Button>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <p data-slot="tool-ledger-empty" className="text-muted-foreground text-sm">
          {empty}
        </p>
      ) : (
        <ScrollArea label={label} className="max-h-96">
          <ol data-slot="tool-ledger-calls" className="flex flex-col">
            {rows.map((row) => {
              const { call } = row
              // The difference between two sightings of the same call, and only when
              // there are two. The sentence is the consumer's, the arithmetic is one
              // subtraction of the consumer's own timestamps, and there is no clock
              // in this file.
              const elapsed = call.at - row.openedAt
              const duration =
                elapsed > 0 && call.durationLabel !== undefined
                  ? call.durationLabel(elapsed, { id: call.id, name: call.name })
                  : null
              return (
                <li
                  key={call.id}
                  data-slot="tool-ledger-call"
                  data-state={call.state}
                  className="border-border flex flex-col gap-1 border-b py-3 last:border-b-0"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {/*
                      * The tick and the clock, both decoration beside the words: the
                      * tick names the state for a reader who can see it and the clock
                      * is the same fact as the `datetime` on the `time` element, so
                      * neither is announced as a character.
                      */}
                    <span
                      aria-hidden="true"
                      className={cn('font-mono text-xs', STATE_INK[call.state])}
                    >
                      {STATE_MARK[call.state]}
                    </span>
                    <time
                      dateTime={new Date(row.openedAt).toISOString()}
                      className="text-muted-foreground font-mono text-xs tabular-nums"
                    >
                      {clockOf(row.openedAt)}
                    </time>

                    <span className="text-foreground text-sm font-medium">{call.name}</span>

                    {call.spanLabel ? (
                      <span
                        data-slot="tool-ledger-span"
                        className="border-border text-muted-foreground rounded border px-1 font-mono text-xs"
                      >
                        {call.spanLabel}
                      </span>
                    ) : null}

                    {duration === null ? null : (
                      <span
                        data-slot="tool-ledger-duration"
                        className="text-muted-foreground ml-auto font-mono text-xs tabular-nums"
                      >
                        {duration}
                      </span>
                    )}
                  </div>

                  {call.argumentsText === undefined ? null : (
                    <span
                      data-slot="tool-ledger-arguments"
                      className="text-muted-foreground font-mono text-xs break-words"
                    >
                      {call.argumentsText}
                    </span>
                  )}

                  {call.resultText === undefined ? null : (
                    <span
                      data-slot="tool-ledger-result"
                      className="text-muted-foreground text-pretty text-xs"
                    >
                      {call.resultText}
                    </span>
                  )}

                  {call.errorText === undefined ? null : (
                    <span
                      data-slot="tool-ledger-error"
                      className="text-destructive text-pretty text-xs"
                    >
                      {call.errorText}
                    </span>
                  )}

                  {call.link === undefined ? null : (
                    <a
                      data-slot="tool-ledger-link"
                      href={call.link.href}
                      className="text-foreground self-start rounded-sm text-xs underline-offset-4 hover:underline"
                    >
                      {call.link.label}
                    </a>
                  )}
                </li>
              )
            })}
          </ol>
        </ScrollArea>
      )}
    </section>
  )
}

export default ToolLedger01
