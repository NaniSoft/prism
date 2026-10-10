'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { LiveRegion } from '../../components/ui/live-region'
import { ScrollArea } from '../../components/ui/scroll-area'
import { headingSizeClass } from '../../components/ui/section'
import { cn } from '../../lib/utils'
import { STATUS_INK, type RunStatus } from '../status'
import { ToolCallRow } from '../tool-call-row'
import type { ToolCall } from '../tool-ledger-01/tool-ledger'

/**
 * Who a message is from, as a closed set.
 *
 * The four are the ones a conversation actually has, and they are closed for the
 * reason `RunEventRole` is: a sender is a slot for a mark and an ink, and a
 * free-text sender would be a string with no rendering behind it. The **words**
 * are still the caller's, in `senderLabel`. Prism owns which sender looks like
 * what, and ships none of the labels.
 */
export type MessageSender = 'user' | 'assistant' | 'system' | 'tool'

/** A run of text, in the consumer's words. */
export type MessageTextPart = {
  kind: 'text'
  /** What the sender said. */
  text: string
}

/**
 * A reasoning block: the model's own working, shown collapsed.
 *
 * `label` is required because a disclosure whose summary has no words is announced
 * as a disclosure and nothing else, and the word on it is the consumer's.
 */
export type MessageReasoningPart = {
  kind: 'reasoning'
  /** The words on the disclosure's summary. */
  label: string
  /** The reasoning itself. */
  text: string
}

/**
 * A tool call inside a message, drawn through the ledger's own row.
 *
 * The call is a `ToolCall`, which is the shape `ToolLedger01` already receives, so
 * a tool call is drawn the same way in a message as in the ledger and there is no
 * second tool-call shape.
 */
export type MessageToolPart = {
  kind: 'tool'
  /** The call, in the vocabulary `ToolLedger01` already publishes. */
  call: ToolCall
}

/** A citation: a labelled destination for a claim in the message. */
export type MessageCitationPart = {
  kind: 'citation'
  /** The words on the link, required because a link with no name announces as a link. */
  label: string
  /** Where it goes. */
  href: string
  /** Anything the label cannot hold: a page, a line, a quote. */
  detail?: string
}

/**
 * An attachment in the thread.
 *
 * `preview` is the consumer's own node, because the media an attachment shows is
 * drawn by Items this package already ships rather than by this surface. It is
 * placed above the name and never inside the link, so a preview that holds a
 * control cannot nest one inside the anchor.
 */
export type MessageAttachmentPart = {
  kind: 'attachment'
  /** The name a reader recognises it by. */
  name: string
  /** Where the attachment lives, absent for one that is only named. */
  href?: string
  /** The consumer's own rendering of the attachment's contents. */
  preview?: ReactNode
}

/**
 * One part of a message, as the surface receives it.
 *
 * The five are the ones every surveyed stream converges on, and the set is closed
 * because a part is a slot for a rendering rather than a free-text kind. Several
 * tool calls fit in one message without a second key, which is the reason the
 * content shape is a message with ordered parts rather than a flat event list.
 */
export type MessagePart =
  | MessageTextPart
  | MessageReasoningPart
  | MessageToolPart
  | MessageCitationPart
  | MessageAttachmentPart

/**
 * One message, as the surface receives it.
 *
 * A message has a stable identity, a sender, an optional metadata node and an
 * ordered list of parts. The `id` is stable across deliveries, so a transport that
 * reports the same message again as more parts arrive updates one message rather
 * than appending a second. `at` is the consumer's own epoch milliseconds and the
 * only value the surface orders by.
 */
export type ChatMessage = {
  /** Stable across deliveries, so a re-reported message updates in place. */
  id: string
  /** Who sent it. See `MessageSender`. */
  sender: MessageSender
  /** The sender's own name for the reader, absent for a surface that draws only the mark. */
  senderLabel?: string
  /** Epoch milliseconds, used for order. */
  at: number
  /**
   * The caller's own per-message metadata, drawn in the message's header.
   *
   * A message carries one node of the caller's choosing beside the sender and the
   * time: the model a provider stated for the turn, a token count it reported, and
   * the cost or the latency the caller derived. It is a node rather than a set of
   * Prism fields because the last two are the consumer's own derivation, which the
   * conversation decision in `DESIGN.md` rules: no provider read publishes a cost
   * or a latency, so the surface draws only what the caller hands it and states no
   * model, no count and no figure for itself. The parts are content a reader reads
   * as the message; this is metadata about the message and sits above its parts.
   *
   * It is the same `meta` shape `ItemEntry` takes, read at the message.
   */
  meta?: ReactNode
  /** The message's parts, in the order they are drawn and never re-sorted. */
  parts: readonly MessagePart[]
}

/**
 * How the surface receives messages.
 *
 * The consumer owns the socket, the transport and the persistence, so this is a
 * function it supplies rather than a connection Prism opens. It is called once on
 * mount and must return an unsubscribe, which is what makes a WebSocket, an
 * `EventSource`, a polling timer or a test's own array all the same shape to the
 * surface. Nothing here knows which one it got.
 */
export type MessageSubscribe = (emit: (message: ChatMessage) => void) => () => void

export type MessageThread01Props = {
  /**
   * Called once to begin receiving, and again whenever `resubscribeKey` changes.
   * Must return an unsubscribe; the surface calls it on unmount and before
   * re-subscribing, so a consumer that returns nothing leaks its connection.
   */
  subscribe: MessageSubscribe
  /**
   * The messages already known when this thread is opened, so a surface opened
   * mid-thread is not blank. Oldest first.
   *
   * Read when the thread is opened, and again whenever `resubscribeKey` changes. It
   * is **not** read on every render: a prop that looked like the current message
   * list and quietly seeded only once would be a trap, and a prop that re-seeded on
   * every render would discard the stream. This seeds, and the stream takes over.
   *
   * It is also the whole of the resumption seam: the durable buffer that outlives
   * a mount is the consumer's, and a surface opened after a reconnect is seeded
   * from the consumer's own record rather than from anything Prism kept.
   */
  initial?: readonly ChatMessage[]
  /**
   * Which thread this surface is showing, and the reset lever.
   *
   * Changing it **clears the thread and reseeds it from `initial`**, as well as
   * tearing the subscription down and opening a new one. A thread is identified by
   * whatever the consumer already uses to identify it, so a second thread in the
   * same surface is a new subscription rather than two consumers of one, and it is
   * a new thread rather than the old messages with the new ones appended.
   */
  resubscribeKey?: string | number
  /** Where the thread has got to. The tiers are the `live` Kind's own. */
  status?: RunStatus
  /** The word beside the status. Required when a status is passed. */
  statusLabel?: string
  /** Optional label above the surface's heading. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The surface's heading. Omit it for one composed under its own. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** What the surface says when it holds no messages yet. */
  emptyLabel?: string
  /**
   * The accessible name of the scrolling region.
   *
   * Required, because `ScrollArea` requires it and the reason is the right one: a
   * scroll region with no name is announced as a group of focusable nothing, and a
   * keyboard reader who tabs into it cannot tell what is in it or what is past the
   * edge. The name is the consumer's word, as every other word here is.
   */
  messagesLabel: string
  /** Announced to assistive technology as messages arrive. */
  liveLabel?: string
  /** How many messages to keep. Older messages fall off the top. @defaultValue 200 */
  limit?: number
  /**
   * Whether the surface opens paused.
   *
   * Read when the thread opens, and the control below owns it from the first press
   * after that. It pauses the **surface** and never the run: the subscription stays
   * open, because the connection is the consumer's and they may be sharing it with
   * a `RunStream01` beside it.
   */
  paused?: boolean
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
} & (
  | { pauseControl?: false; pauseLabel?: never; resumeLabel?: never }
  | { pauseControl: true; pauseLabel: string; resumeLabel: string }
)

/** The ink each sender is stated in. */
const SENDER_INK: Record<MessageSender, string> = {
  user: 'text-foreground',
  assistant: 'text-foreground',
  system: 'text-muted-foreground',
  tool: 'text-muted-foreground',
}

/** The mark each sender draws, so the four are told apart without relying on colour. */
const SENDER_MARK: Record<MessageSender, string> = {
  user: 'u',
  assistant: 'a',
  system: 's',
  tool: 't',
}

/** The clock a message reads, in UTC, because the surface holds no locale to format in. */
const clockOf = (at: number): string => new Date(at).toISOString().slice(11, 19)

/** The one source of truth for order, so a late message with an earlier `at` sorts there. */
const byTimeThenId = (a: ChatMessage, b: ChatMessage): number =>
  a.at - b.at || a.id.localeCompare(b.id)

/** The seed a thread opens with, already sorted and trimmed to the window. */
function seedOf(messages: readonly ChatMessage[], limit: number): ChatMessage[] {
  const sorted = [...messages].sort(byTimeThenId)
  return sorted.length > limit ? sorted.slice(sorted.length - limit) : sorted
}

/** One message merged into the thread, and the window applied. */
function merge(
  messages: readonly ChatMessage[],
  message: ChatMessage,
  limit: number,
): ChatMessage[] {
  const at = messages.findIndex((current) => current.id === message.id)
  const next =
    at === -1
      ? [...messages, message]
      : messages.map((current, index) => (index === at ? message : current))
  next.sort(byTimeThenId)
  return next.length > limit ? next.slice(next.length - limit) : next
}

/**
 * The one line the live region announces for an arriving message.
 *
 * The region carries a single short string rather than the message, because a live
 * region around a growing list makes a screen reader read the whole thread again
 * on every arrival. The string is the message's own first readable part, in the
 * consumer's words: the first text, reasoning, tool name, citation or attachment
 * name it carries.
 */
function announcementOf(message: ChatMessage): string | undefined {
  for (const part of message.parts) {
    if (part.kind === 'text' || part.kind === 'reasoning') return part.text
    if (part.kind === 'tool') return part.call.name
    if (part.kind === 'citation') return part.label
    if (part.kind === 'attachment') return part.name
  }
  return undefined
}

/**
 * The message thread of a conversation, receiving messages as they arrive.
 *
 * **This is the `live` Kind's second family, and it is the second client surface in
 * the package beside `RunStream01`.** A conversation's content changes over time
 * without a navigation event, which is the definition of the Kind, and a chat that
 * cannot stream is not a chat. So this surface owns a subscription and the bounded
 * window behind it, exactly as the run log does.
 *
 * **Prism owns the surface, the consumer owns the transport.** `subscribe` is a
 * function the consumer supplies and a function it tears down. There is no socket
 * in this file, no endpoint, no retry policy, no persistence and no provider to
 * mount, so a WebSocket, an `EventSource`, a polling timer and a test's own array
 * are all the same shape to this surface. A consumer that already has a connection
 * passes it in, and one that does not has not acquired a client runtime by
 * importing this.
 *
 * **The content is a message list with ordered parts, and neither an event list nor
 * a turn list is taken.** A message is an artifact a reader reads and addresses,
 * where an occurrence is not, so the run's flat `RunEvent` stays the run log's own
 * vocabulary. A turn is a derived grouping of a request and its answers, the
 * transport does not preserve it as a unit, and the order of a stream after a
 * reconnect is unsettled, so a surface that grouped by turn would impose a
 * structure the consumer's data may not have. The message and part vocabulary lives
 * here, beside `RunEvent` and `ToolCall`, and is deliberately not a member of the
 * shared specification module.
 *
 * **Per-message metadata is the caller's own node.** The model a provider stated
 * for a turn, a token count it reported, and the cost and the latency a consumer
 * derived are metadata about a message rather than content a reader reads as it, so
 * a message carries an optional `meta` the surface draws in its header beside the
 * sender and the time. It is a node, and deliberately not a set of Prism fields:
 * cost and latency are the consumer's own derivation, because no provider read
 * publishes either, so the surface draws what it was handed and states no figure
 * for itself. This is the `ItemEntry.meta` shape read at the message.
 *
 * **The four things the Kind already names are reused rather than answered twice.**
 * A tool-call part is drawn through `ToolLedger01`'s own row, so there is no second
 * tool-call shape. The status tiers are the ones `RunStatus` already publishes. The
 * run controls are `PromptComposer`'s send, stop, retry and attach, which the
 * consumer composes beside this surface rather than this surface drawing a second
 * set of them. The one surface it does not reuse is `RunStream01`, because a run's
 * log is a sequence of occurrences and a conversation is a sequence of messages.
 *
 * **The surface draws no control it cannot act on.** The only control in it is the
 * pause control, which pauses this surface and never the run, and which a consumer
 * opts into with `pauseControl`. Send, stop, retry and attach are not here: they are
 * `PromptComposer`'s, and a settled thread composed outside the live module reaches
 * a decision through a `CtaLink` with its required `href` or a slot the consumer
 * fills.
 *
 * **Prism holds a bounded in-memory window and promises no resumption.** The
 * durable buffer that outlives a mount is the consumer's, because Prism ships no
 * permanent client runtime and cannot assume a server framework. The seam is
 * `initial` and `resubscribeKey`: a surface opened mid-thread is seeded from the
 * consumer's own record, a reconnect is a new key over a fresh seed, and the
 * surface promises no resumption so it cannot fail to keep one.
 *
 * **Messages are kept sorted by `at`, not by arrival.** A transport decides when a
 * message is delivered, and a reconnect can deliver an older message after a newer
 * one. Ties break on `id`, so the order is total and the same thread renders the
 * same way every time. The same `id` is also the same message, so a transport that
 * reports it again as more parts arrive updates one message rather than adding a
 * second.
 *
 * **New messages are announced once, politely, and the thread itself is not a live
 * region.** Announcing a growing list would make a screen reader read the whole
 * thread again on every arrival, which is the failure a live region on a list
 * guarantees. `LiveRegion` carries the newest message's first readable part alone,
 * and the thread is an ordinary scrollable list a reader moves through at their own
 * pace.
 *
 * `limit` bounds what is held, because a long conversation produces thousands of
 * messages and a surface that grows without bound eventually stops repainting.
 * Older messages fall off the top, which is the direction a reader wants: the
 * thread's beginning is the part they can scroll back to in the consumer's store.
 */
export function MessageThread01({
  subscribe,
  initial,
  resubscribeKey,
  status,
  statusLabel,
  eyebrow,
  title,
  description,
  emptyLabel,
  messagesLabel,
  liveLabel,
  limit = 200,
  paused,
  pauseControl,
  pauseLabel,
  resumeLabel,
  className,
}: MessageThread01Props) {
  /**
   * The thread, held against the key that produced it.
   *
   * Adjusting state during render when the key changes is React's documented
   * pattern for "a prop changed, start over", and it is the right one here: the
   * alternative is an effect, and an effect that clears the thread runs *after* a
   * render, so the surface would paint one frame holding the previous thread's
   * messages under the new thread's heading.
   */
  const [newest, setNewest] = useState<string | undefined>(undefined)

  const [thread, setThread] = useState<{ key: string | number | undefined; messages: ChatMessage[] }>(
    () => ({
      key: resubscribeKey,
      messages: seedOf(initial ?? [], limit),
    }),
  )
  if (thread.key !== resubscribeKey) {
    setThread({ key: resubscribeKey, messages: seedOf(initial ?? [], limit) })
    // The announcement is cleared with the thread it announced, so a thread switch
    // does not leave the previous thread's last message in the live region saying so.
    setNewest(undefined)
  }
  const messages = thread.messages

  /**
   * Whether this surface is holding still, kept in a ref as well as in state.
   *
   * The ref is what the arrival path reads, and it is why the subscription effect
   * does not list the pause among its dependencies: an effect that depended on the
   * pause would tear the consumer's connection down and open a new one every time a
   * reader pressed the control. The button writes both, so the value the effect
   * reads is the value the reader set.
   */
  const [held, setHeldState] = useState(paused === true)
  const heldRef = useRef(held)
  const setHeld = (next: boolean): void => {
    heldRef.current = next
    setHeldState(next)
  }

  // A ref rather than state, so the effect does not re-subscribe because a message
  // arrived. An effect that depended on the value it writes re-runs itself, and the
  // surface would open a new subscription per message.
  const emit = useRef<(message: ChatMessage) => void>(() => {})

  useEffect(() => {
    emit.current = (message: ChatMessage) => {
      // Read through the ref, so a paused surface decides without re-subscribing.
      if (heldRef.current) return
      setThread((current) => ({
        ...current,
        messages: merge(current.messages, message, limit),
      }))
      setNewest(announcementOf(message))
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
      data-slot="message-thread"
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
          {title ? (
            <h2 className={cn('font-semibold tracking-tight text-balance', headingSizeClass('h2'))}>
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-pretty text-sm">{description}</p>
          ) : null}
        </header>
      ) : null}

      {status !== undefined ? (
        <p data-slot="thread-status" className={cn('font-mono text-xs', STATUS_INK[status])}>
          {statusLabel}
        </p>
      ) : null}

      {pauseControl === true ? (
        <div data-slot="thread-bar" className="flex flex-wrap items-center gap-3">
          <Button
            data-slot="thread-pause"
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={held}
            className="ml-auto"
            onClick={() => setHeld(!heldRef.current)}
          >
            {held ? resumeLabel : pauseLabel}
          </Button>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <p data-slot="message-thread-empty" className="text-muted-foreground text-sm">
          {emptyLabel}
        </p>
      ) : (
        <ScrollArea label={messagesLabel} className="max-h-96">
          <ol data-slot="thread-messages" className="flex flex-col gap-4">
            {messages.map((message) => (
              <li
                key={message.id}
                data-slot="thread-message"
                data-sender={message.sender}
                className="flex flex-col gap-2"
              >
                <div className="flex items-baseline gap-x-2">
                  <span
                    aria-hidden="true"
                    className={cn('font-mono text-xs', SENDER_INK[message.sender])}
                  >
                    {SENDER_MARK[message.sender]}
                  </span>
                  {message.senderLabel ? (
                    <span className="text-foreground text-xs font-medium">
                      {message.senderLabel}
                    </span>
                  ) : null}
                  <time
                    dateTime={new Date(message.at).toISOString()}
                    className="text-muted-foreground font-mono text-xs tabular-nums"
                  >
                    {clockOf(message.at)}
                  </time>
                  {message.meta === undefined ? null : (
                    <span data-slot="thread-message-meta" className="text-muted-foreground text-xs">
                      {message.meta}
                    </span>
                  )}
                </div>

                <ol data-slot="message-parts" className="flex flex-col gap-2">
                  {message.parts.map((part, index) => (
                    <li
                      key={`${message.id}-${index}`}
                      data-slot="message-part"
                      data-kind={part.kind}
                      className="text-sm"
                    >
                      {renderPart(part)}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </ScrollArea>
      )}
    </section>
  )
}

/** One part, drawn by its kind. */
function renderPart(part: MessagePart): ReactNode {
  if (part.kind === 'text') {
    return <p className="text-foreground text-pretty text-sm">{part.text}</p>
  }

  if (part.kind === 'reasoning') {
    return (
      <details data-slot="message-reasoning" className="text-muted-foreground text-sm">
        <summary className="cursor-pointer text-xs font-medium">{part.label}</summary>
        <p className="text-muted-foreground text-pretty text-sm">{part.text}</p>
      </details>
    )
  }

  if (part.kind === 'tool') {
    return (
      <div className="border-border flex flex-col gap-1 rounded-md border p-2">
        <ToolCallRow call={part.call} openedAt={part.call.at} />
      </div>
    )
  }

  if (part.kind === 'citation') {
    return (
      <span className="flex flex-col gap-0.5">
        <a
          data-slot="message-citation"
          href={part.href}
          className="text-foreground self-start rounded-sm text-sm underline-offset-4 hover:underline"
        >
          {part.label}
        </a>
        {part.detail ? (
          <span className="text-muted-foreground text-pretty text-xs">{part.detail}</span>
        ) : null}
      </span>
    )
  }

  return (
    <span
      data-slot="message-attachment"
      className="border-border flex flex-col gap-1 rounded-md border p-2"
    >
      {part.preview ? <span className="block">{part.preview}</span> : null}
      {part.href ? (
        <a
          data-slot="message-attachment-link"
          href={part.href}
          className="text-foreground self-start rounded-sm text-sm underline-offset-4 hover:underline"
        >
          {part.name}
        </a>
      ) : (
        <span className="text-foreground text-sm">{part.name}</span>
      )}
    </span>
  )
}

export default MessageThread01
