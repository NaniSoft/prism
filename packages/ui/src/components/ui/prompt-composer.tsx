'use client'

import { PaperclipIcon, RefreshCwIcon, SendIcon, XIcon } from 'lucide-react'
import { useEffect, useId, useRef, type ChangeEvent, type ReactNode } from 'react'

import { Button } from './button'
import { FieldError } from './field'
import { Textarea } from './textarea'
import { cn } from '../../lib/utils'

/**
 * The five points a request can be at.
 *
 * A closed set of five, and the fifth is the one that makes it a lifecycle rather
 * than a flag. A request that is being sent, a request whose answer is arriving
 * one piece at a time, and a request that has ended are three different situations
 * with three different affordances, and the difference between them is not a
 * matter of degree: there is nothing to stop in the first and everything to stop in
 * the second, and a surface that has only a busy flag has to pretend otherwise.
 * `failed` and `done` are the two ends of the answer, and they are separate
 * members rather than one `finished` flag because a request that ended and a
 * request that ended badly call for different words and different next actions.
 */
export type PromptComposerPhase = 'idle' | 'sending' | 'streaming' | 'done' | 'failed'

/**
 * Where the request is, as a value the caller holds.
 *
 * A union rather than a `phase` prop beside four booleans, and the reason is that
 * four booleans can say things this type cannot. `sending` and `streaming` are
 * mutually exclusive, `failed` and `done` are mutually exclusive, and an optional
 * prop set cannot say either. A boolean is a fact about one axis, and a lifecycle
 * is a position on one line, so the line is what the value is. A caller that
 * switched exhaustively over it is broken by a sixth state later rather than
 * rendering a control that is two things at once.
 */
export type PromptComposerState =
  /** Nothing has been asked, and the request field is the reader's to write in. */
  | { phase: 'idle' }
  /** The request is on its way and no part of the answer has arrived. */
  | { phase: 'sending' }
  /** Part of the answer has arrived and more is coming. */
  | { phase: 'streaming' }
  /** The answer is complete. */
  | { phase: 'done' }
  /** The request ended badly, with the caller's own sentence about why. */
  | { phase: 'failed'; reason?: ReactNode }

/**
 * One thing attached to the request, and the two things the tray knows about it.
 *
 * A reference and not a file, for the reason `ImageListField` states at length:
 * what a composer holds is whatever the caller's own store calls this thing, and a
 * `File` object would make the tray meaningful only on the machine that produced
 * it. There is no size and no transfer state, because an attachment in a prompt is
 * usually already in the caller's storage and a byte count for it is a measurement
 * of something the reader did not choose to see.
 */
export type PromptComposerAttachment = {
  /**
   * The caller's own identity for the attachment, and what the remove control
   * reports.
   *
   * Required, and a string rather than the name: a reader can attach the same
   * document twice, and two remove controls announcing the same name are two
   * controls nobody can tell apart.
   */
  id: string
  /** The name a reader recognises the attachment by. */
  name: string
}

/**
 * The props the Prompt composer accepts.
 *
 * A declared interface rather than a forwarded native one, and the reason is
 * visible in the list: every one of these is either a state the caller holds or a
 * sentence the caller owns, and there is no native attribute left over once the
 * fourteen are spent.
 */
export interface PromptComposerProps {
  /**
   * The request field's name, drawn above it and used as the name of the whole
   * region.
   *
   * A `ReactNode` and not a string, because the element a sighted reader reads is
   * the element a screen reader names the region by, and the two cannot drift
   * when they are one node. Write it as the question the reader is about to ask:
   * "What should the agent do?", or "Message the pipeline".
   */
  label: ReactNode
  /**
   * Where the request is.
   *
   * Required and controlled, and the whole of the Component's reason to be
   * separate from a form field: the lifecycle is the caller's, because the request
   * is the caller's, and a Component that held the state would hold the transport
   * with it. Prism draws the affordances a position implies and calls the four
   * callbacks; it never moves the position itself.
   */
  state: PromptComposerState
  /**
   * The request text.
   *
   * Controlled, and not held here, for the same reason the position is not. A
   * composer whose draft lives inside a design system is a draft a caller cannot
   * seed from a conversation, cannot restore from a store, cannot count tokens
   * against, and cannot clear when a send succeeds without the Component offering
   * a prop for it. Every one of those is a decision about the caller's product.
   */
  text: string
  /**
   * Called with the whole request text on every keystroke.
   *
   * The value rather than the change, because a controlled field whose callback
   * reports a delta is a field whose caller has to reconstruct the value to know
   * what it is now, and every one of them does.
   */
  onTextChange: (text: string) => void
  /**
   * Called with the request text when the reader asks for the request to be made.
   *
   * Takes the text rather than reading it from a field, so the callback is the
   * caller's whole input and the Component holds nothing. The caller decides what
   * happens next, which in practice means moving the position to `sending`.
   */
  onSubmit: (text: string) => void
  /**
   * Called when the reader stops a request that is still arriving.
   *
   * Required rather than optional, and the reason is the lifecycle. The union names
   * `streaming`, so a caller who reaches that position owes a way out of it, and a
   * Component that rendered a state it had no exit for would be a surface where a
   * reader's request runs on with no way to end it. Prism has no opinion about
   * what stopping means: an abort on the caller's transport, a socket closed, a
   * value discarded. It draws the control and calls this.
   */
  onStop: () => void
  /**
   * Called when the reader asks for the failed request to be made again.
   *
   * Required for the same argument as `onStop`, over `failed`. A failure with no
   * way to try again is a dead end, and the affordance belongs here rather than
   * beside the send control because the two actions are not the same: retrying is
   * a claim that the same request is worth making again, and sending is a claim
   * that a different one is.
   */
  onRetry: () => void
  /**
   * The visible label of the send control, in the product's own words.
   *
   * Required and never defaulted: "Send", "Run the agent" and "Enviar" are three
   * products' answers, and a reader who cannot tell what a control will do before
   * pressing it will press it to find out.
   */
  sendLabel: ReactNode
  /**
   * The visible label of the stop control, shown only while a request is streaming.
   *
   * Required even though the control exists in one position out of five, for the
   * same reason `Spinner`'s label is: a shared library cannot know whether the
   * reader is stopping a request, a job or a transfer, and "Stop" alone is a
   * weaker name than "Stop generating".
   */
  stopLabel: ReactNode
  /**
   * The visible label of the retry control, shown only after a failure.
   *
   * Required, and worth writing with the cost in it where there is one: "Try
   * again" for a request that may succeed unchanged, and "Try again, shorter" when
   * a length limit is the likely cause.
   */
  retryLabel: ReactNode
  /**
   * The visible label of the attach control, in the product's own words.
   *
   * Required, and the same argument as `sendLabel`. It names what is being
   * attached: "Attach", "Attach a file", "Add a document".
   */
  attachLabel: ReactNode
  /**
   * Called when the reader asks to attach something.
   *
   * A callback, and the same seam `ImageListField` opens. A composer cannot know
   * what an attachment is on the caller's side: a browser `File` on its way to an
   * upload, a reference to a document already in the caller's store, a frame from
   * a camera the browser has no input for. Prism draws the control that asks, and
   * the caller opens whatever picker it owns. The alternative, Prism rendering a
   * `Dropzone` and taking `File` objects, would make a composer for model requests
   * into a file upload with a text box on it.
   */
  onAttach: () => void
  /**
   * What is attached, in the order the reader attached it.
   *
   * Required, and an array that is usually empty. A composer is not a receipt: the
   * things on it are still part of a request the reader is composing, so they are
   * always removable and there is no read-only arrangement to express.
   */
  attachments: readonly PromptComposerAttachment[]
  /**
   * Called with an attachment's `id` when the reader takes it off the request.
   *
   * Required, and for the same reason `onRemove` is required on `ImageListField`:
   * an attachment a reader cannot detach before sending is a mistake they have to
   * live with.
   */
  onRemoveAttachment: (id: string) => void
  /**
   * The accessible name of one tray row's remove control, given that row's
   * attachment name.
   *
   * Required, and a function because the name has to name the attachment and the
   * name is the caller's string. A nameless control in a tray of six is announced
   * as "button" six times.
   */
  removeAttachmentLabel: (name: string) => string
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The tray's remove control, drawn once and used by every row.
 *
 * The muted ink because every row is the same surface, and the 44px coarse-pointer
 * floor because a tray on a phone is reached with a thumb. Duplicated as a
 * constant for the reason `ImageListField` gives: there is no shared recipe on this
 * package's surface, and exporting one class string would be publishing a styling
 * hook.
 */
const REMOVE_CONTROL =
  'text-muted-foreground hover:text-foreground inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-none transition-colors duration-fast ease-out pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/** The Component's own slots, read back through one root ref after a change. */
const TRAY_REMOVE_SLOT = '[data-slot="prompt-composer-attachment-remove"]'
const ATTACH_SLOT = '[data-slot="prompt-composer-attach"]'

/**
 * A field for writing a request, what is attached to it, and the controls that
 * make it, stop it and try it again.
 *
 * **It owns a request lifecycle, and that is the reason it is not a form field
 * with a button beside it.** A request that is being sent, one whose answer is
 * arriving in pieces, and one that has ended are three situations with three
 * different affordances, and the difference between the first two is not degree:
 * there is nothing to stop in the first and everything to stop in the second. A
 * field with a `busy` flag has to render one control for both, and every product
 * that has tried ends up either offering a stop that stops nothing or hiding the
 * stop for the whole of a transfer it was most needed during. The state here is
 * five positions on a line, the union says so, and the affordances are a table
 * rather than a judgement.
 *
 * **The stop control exists in exactly one position, and that is what makes it
 * trustworthy.** A stop control that is present and disabled is a promise the
 * reader will test; a stop control that is absent during the sending position is
 * honest, because there is genuinely nothing to stop yet. So the row is: nothing
 * to stop while `sending`, a stop while `streaming`, and nothing but a retry after
 * a failure. The absence is drawn as absence, not as a greyed control, which is
 * the one place this Component breaks from the unavailable-is-drawn rule the rest
 * of the package follows, and the reason is that the rule protects a reader from
 * a mystery, and there is no mystery here: a control that is not there is a
 * control that is not needed.
 *
 * **Prism owns no model and no transport, and the position is the caller's for
 * that reason.** The socket, the request, the persistence, the order the pieces
 * arrive in and what happens when one arrives out of order are all the caller's,
 * and the state prop is the whole of the contract between them. That is the same
 * division `LiveRegion` makes with the events it announces, and it is why this is
 * a control surface over a state machine rather than a client: a Component that
 * opened a connection would be a Component every consumer inherits a connection
 * from, and the no-override-path law decides that. Nothing here fetches, and
 * nothing here knows what a model is.
 *
 * **The request field goes read-only while the answer is coming, rather than
 * disappearing or going disabled.** A reader mid-stream usually wants to read what
 * they sent, and often wants to select part of it to quote in the next turn.
 * `readOnly` keeps the field focusable, selectable and in the tab order while
 * making the edit impossible, and `disabled` would take all three away over a
 * field the reader may still want to look at.
 *
 * **The tray is a nested list with its own remove behaviour, and the focus moves
 * there too.** An attachment is not a chip: a chip is a selected value in a set
 * the reader chose between, and an attachment is one item in a list the reader is
 * still building, so it is drawn as a row with a name and a control, inside a list
 * the whole region is named by. Removing one of six has the same focus problem as
 * removing a row from any other list here, and it gets the same answer: the row
 * that moved up, or the one above it, or the attach control when the last one goes,
 * because that is the only operable thing left. A reader who detaches a document
 * and is then returned to the top of the page has been dropped on a detached node
 * and cannot tell it from a page that reloaded.
 *
 * **The one line of failure is `FieldError`, and the reuse is deliberate.** It is
 * exactly one line of destructive text carrying `role="alert"`, which is what a
 * one-line failure is, and an alert with its own border and padding inside a
 * composer would be a card inside a card that changes the height of the box the
 * reader is about to type into. The cost is named rather than hidden: the
 * Component is called a field error and this is a request outcome, so the two are
 * indistinguishable to a screen reader, and a composer that also holds a control
 * with its own validation error will announce both as alerts. A caller who needs
 * them told apart composes their own region beside the field.
 *
 * **There is no spinner while a request streams, and the omission is a decision.**
 * The one thing this Component could honestly report is that pieces of the answer
 * are arriving, and that is visible in the caller's own editor, where they land. A
 * ring beside a stop control is a second animation saying what the arriving text
 * already says, and DESIGN.md's first motion law is that feedback is a response
 * to something the reader did. The reader pressed send; the text appearing is the
 * answer.
 *
 * **It is a client Component**, because the request field is controlled, because
 * five callbacks cross into it and because the tray moves focus after a change.
 * What that costs is the ordinary one, and worth stating because the surface
 * invites a server render: a server Component may render a composer with its
 * state and text already in place and it will look right, and what it may not do
 * is offer the stop control, the retry, or focus that behaves, because those are
 * facts about what happens after the reader acts.
 */
function PromptComposer({
  label,
  state,
  text,
  onTextChange,
  onSubmit,
  onStop,
  onRetry,
  sendLabel,
  stopLabel,
  retryLabel,
  attachLabel,
  onAttach,
  attachments,
  onRemoveAttachment,
  removeAttachmentLabel,
  className,
}: PromptComposerProps) {
  const generated = useId()
  const labelId = `${generated}-label`
  const fieldId = `${generated}-field`
  const rootRef = useRef<HTMLDivElement>(null)
  // The tray row whose remove control should take focus after the caller's value
  // settles. Armed before the callback runs, because the row that is going away
  // cannot be focused and the row that replaces it does not exist yet.
  const pending = useRef<number | null>(null)

  const streaming = state.phase === 'streaming'
  const inFlight = state.phase === 'sending' || streaming
  const failed = state.phase === 'failed'
  // A send control in two of the five positions, and its absence in the other three
  // is the point: while a request is in the air there is nothing to send, and after
  // a failure the action is to try that one again rather than to send a second one.
  const showSend = state.phase === 'idle' || state.phase === 'done'

  useEffect(() => {
    const index = pending.current
    if (index === null) return
    pending.current = null

    const root = rootRef.current
    if (root === null) return

    const buttons = root.querySelectorAll<HTMLElement>(TRAY_REMOVE_SLOT)
    const button = buttons.item(Math.min(index, buttons.length - 1))
    if (button === null) root.querySelector<HTMLElement>(ATTACH_SLOT)?.focus()
    else button.focus()
  })

  const removeAt = (index: number) => {
    const attachment = attachments[index]
    if (attachment === undefined) return
    pending.current = index
    onRemoveAttachment(attachment.id)
  }

  const onFieldChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(event.target.value)
  }

  return (
    <div
      ref={rootRef}
      data-slot="prompt-composer"
      data-phase={state.phase}
      role="group"
      aria-labelledby={labelId}
      aria-busy={inFlight || undefined}
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <span
        id={labelId}
        data-slot="prompt-composer-label"
        className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
      >
        {label}
      </span>

      {/*
       * The tray, above the field. An attachment belongs to the request, and a
       * request is read top to bottom, so the list of what is already on it comes
       * before the box that adds to it. Drawn only when it holds something: a
       * bordered strip above an empty list is a gap the reader looks through.
       */}
      {attachments.length === 0 ? null : (
        <ul
          data-slot="prompt-composer-attachments"
          aria-labelledby={labelId}
          className="flex w-full flex-col gap-1"
        >
          {attachments.map((attachment, index) => (
            <li
              key={attachment.id}
              data-slot="prompt-composer-attachment"
              className="border-border flex items-center gap-2 rounded-md border px-2 py-1.5"
            >
              <span
                data-slot="prompt-composer-attachment-name"
                className="min-w-0 flex-1 truncate text-sm"
              >
                {attachment.name}
              </span>
              <button
                type="button"
                data-slot="prompt-composer-attachment-remove"
                aria-label={removeAttachmentLabel(attachment.name)}
                onClick={() => removeAt(index)}
                className={REMOVE_CONTROL}
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Textarea
        id={fieldId}
        data-slot="prompt-composer-field"
        value={text}
        onChange={onFieldChange}
        readOnly={inFlight}
        className="min-h-24"
      />

      {failed && state.reason !== undefined && state.reason !== null && state.reason !== false ? (
        <FieldError data-slot="prompt-composer-reason">{state.reason}</FieldError>
      ) : null}

      <div data-slot="prompt-composer-actions" className="flex flex-wrap items-center gap-2">
        {/*
         * The attach control, and the one affordance here that is marked
         * unavailable rather than removed. It is drawn in two of the five positions
         * and there is no honest third state to draw it in, so while a request is
         * in the air it stays where it is, keeps its place in the tab order and
         * announces itself as unavailable. The dimming is on the wrapper because
         * `Button` styles the native `disabled` attribute and this Component does
         * not set it, for the reason `Dropzone` gives at length.
         */}
        <span
          data-slot="prompt-composer-attach-control"
          className={cn('inline-flex', inFlight && 'opacity-50')}
        >
          <Button
            data-slot="prompt-composer-attach"
            type="button"
            variant="ghost"
            size="sm"
            aria-disabled={inFlight || undefined}
            onClick={inFlight ? () => undefined : onAttach}
          >
            <PaperclipIcon aria-hidden="true" />
            {attachLabel}
          </Button>
        </span>

        <div className="ms-auto flex items-center gap-2">
          {failed ? (
            <Button
              data-slot="prompt-composer-retry"
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              <RefreshCwIcon aria-hidden="true" />
              {retryLabel}
            </Button>
          ) : null}

          {streaming ? (
            <Button data-slot="prompt-composer-stop" type="button" variant="destructive" size="sm" onClick={onStop}>
              <XIcon aria-hidden="true" />
              {stopLabel}
            </Button>
          ) : null}

          {showSend ? (
            <Button data-slot="prompt-composer-send" type="button" size="sm" onClick={() => onSubmit(text)}>
              <SendIcon aria-hidden="true" />
              {sendLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export { PromptComposer }
