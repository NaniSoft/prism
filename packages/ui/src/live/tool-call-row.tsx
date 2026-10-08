import { cn } from '../lib/utils'
import type { ToolCall, ToolCallState } from './tool-ledger-01/tool-ledger'

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
export const clockOf = (at: number): string => new Date(at).toISOString().slice(11, 19)

/**
 * One tool call, drawn as the ledger draws it.
 *
 * **This is the tool-call row the `live` Kind owns, and it is shared rather than
 * copied.** `ToolLedger01` draws one row per call in its ledger, and a
 * conversation's tool-call part draws the same row inside a message, so the two
 * surfaces cannot drift into two shapes for one call. `ToolLedger01` renders this
 * inside its own `<li>`; the message thread renders it inside a part. The
 * Component owns no `<li>`, so it can sit in either list without nesting one.
 *
 * **The duration is the difference between two sightings of the same call, and
 * only when there are two.** `openedAt` is the moment the surface first saw the
 * call's `id`; a call seen once has no second timestamp and draws no duration,
 * because a zero is a claim that a call took no time. The sentence is the
 * consumer's, on `call.durationLabel`, and the arithmetic is one subtraction of
 * the consumer's own `at` values. There is no clock in this file.
 */
export function ToolCallRow({ call, openedAt }: { call: ToolCall; openedAt: number }) {
  // The difference between two sightings of the same call, and only when there
  // are two. The sentence is the consumer's, the arithmetic is one subtraction of
  // the consumer's own timestamps, and there is no clock in this file.
  const elapsed = call.at - openedAt
  const duration =
    elapsed > 0 && call.durationLabel !== undefined
      ? call.durationLabel(elapsed, { id: call.id, name: call.name })
      : null

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {/*
         * The tick and the clock, both decoration beside the words: the tick
         * names the state for a reader who can see it and the clock is the same
         * fact as the `datetime` on the `time` element, so neither is announced
         * as a character.
         */}
        <span aria-hidden="true" className={cn('font-mono text-xs', STATE_INK[call.state])}>
          {STATE_MARK[call.state]}
        </span>
        <time
          dateTime={new Date(openedAt).toISOString()}
          className="text-muted-foreground font-mono text-xs tabular-nums"
        >
          {clockOf(openedAt)}
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
        <span data-slot="tool-ledger-error" className="text-destructive text-pretty text-xs">
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
    </>
  )
}

export default ToolCallRow
