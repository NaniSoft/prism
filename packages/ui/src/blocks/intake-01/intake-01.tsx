'use client'

import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { RelativeTime } from '../../components/ui/relative-time'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The four states one arriving item can be in, and the tone each one is drawn in.
 *
 * **The tones are Prism's and the words are the caller's, and that split is the whole
 * of the design.** `new` is the cool role that means not an alarm, because an item
 * that has just arrived is a fact about age and not a problem. `queued` is muted,
 * because most of an intake list is queued and a column of anything louder than muted
 * is a column of things the reader is meant to look at. `accepted` is success, and it
 * is the only state that means the reader did the thing. `rejected` is destructive,
 * because it is the one state a reader must be able to find, and because the caller
 * who chose the word is the caller who knows what rejection means in their product:
 * a declined application, a discarded duplicate and a failed capture are the same
 * tone and three different sentences.
 *
 * A fifth would be the one that splits a state that does not need splitting, and each
 * such tier is a colour a reader must learn and a word a maintainer must keep true.
 */
export type Intake01State = 'new' | 'queued' | 'accepted' | 'rejected'

/** The tone each of the four states is drawn in, from the semantic contract. */
const STATE_TONE: Record<Intake01State, StatusTone> = {
  new: 'info',
  queued: 'neutral',
  accepted: 'success',
  rejected: 'destructive',
}

/**
 * One arriving item, and everything a reader needs to decide what to do with it: where
 * it came from, what it is about, when it arrived, and what has already happened to
 * it.
 *
 * `subject` is required because an item a reader cannot name is an item nobody can
 * act on. Everything else is optional, and that is not a thinner record: an intake
 * list draws from several systems and each of them knows a different subset, and a
 * shape that made every field required would be a column where two thirds of every
 * row is a placeholder.
 */
export type Intake01Item = {
  /** The item's stable key, and what both handlers are called with. */
  id: string
  /**
   * Where the item came from, in the product's own words: a feed, a form, a person,
   * another system.
   *
   * Drawn in the mono face, because a source is very often a machine's own name for
   * where it put something, and the mono stack is what this repository annotates
   * machine-readable values with. A source a reader is meant to read as a word belongs
   * in `detail` instead, and the JSDoc on that field says so.
   */
  source: string
  /**
   * What the item is, in the words a reader would use about it.
   *
   * The item's identity and the words on the control that opens it, so a link or a
   * button announced by this is announced by something a person would say. It is a
   * `string` because an intake row is scanned down a column and a subject that wraps
   * is a subject that has to be read one row at a time, which is the one thing an
   * intake list is not.
   */
  subject: string
  /**
   * When the item arrived, in whichever of the three forms the caller holds it.
   *
   * Drawn through `relative-time`, so a number arrives as a date in the reader's own
   * locale and a string is handed to the platform untouched. A bare number is
   * milliseconds and a string is anything, so a cell that drew the value as passed
   * would put a raw epoch on the page for every caller whose data layer holds
   * milliseconds, which is most of them, and would print a number with no date on it
   * for the rest. What this costs is that the moment is in the client graph rather
   * than the server one, which is a cost this Block was already paying because a
   * queue has controls in it.
   */
  at: number | string
  /**
   * Where the item is in its life, which is a judgement only the caller can make.
   *
   * Omit it for an item nobody has looked at yet, and the row then carries no mark
   * at all rather than a mark saying nothing happened. A Block that derived the state
   * from the presence of a handler would be inventing a fact about the item.
   */
  state?: Intake01State
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is set and the run fails without it, for the reason the
   * Component JSDoc on `Status` gives at length: the tone is a colour and the words
   * are the information, and a queue that printed "new" and "rejected" in English
   * into an operations tool that is very often not in English is the exact defect
   * `check-block-copy.mjs` exists to end. A product that says "Arrived", "Waiting",
   * "Taken" and "Turned down" is describing the same four states.
   */
  stateLabel?: string
  /**
   * One line about the item, under the subject.
   *
   * A node, because an intake item's second line is not always a sentence: it is a
   * quoted first line of a message, a diff summary, a hostname, a count. The Block
   * draws it in the muted ink and never truncates it, because a truncated sentence on
   * an intake row is a sentence the reader has to open the item to read anyway, which
   * defeats the row.
   */
  detail?: ReactNode
  /**
   * Where the item goes.
   *
   * Its presence makes the subject a real anchor rather than a button, so the
   * destination is announced as a link and the browser's own affordances all work on
   * it. A caller who wants every row to be a selection passes no `href` and sets
   * `onAccept` and `onReject` alone.
   */
  href?: string
  /**
   * The words on the link beside the subject, and required whenever `href` is.
   *
   * A link whose only words are the item's own subject tells a reader nothing about
   * what activating it does, which is the same defect `Download01` refuses and for
   * the same reason: the destination is a route in the caller's own application and
   * only the caller knows what is behind it.
   */
  hrefLabel?: string
}

/**
 * The props an Intake01 takes.
 *
 * Every string is a prop and the Block ships none: no subject, no source, no state
 * word, no action label and not one sentence for an empty list. An intake list is a
 * claim about what is arriving right now, and a Block that named one would be
 * publishing somebody else's backlog.
 */
export type Intake01Props = {
  /** The short line above the title, usually what this list is for. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, and the reason is the same one `inbox-01` gives: a stream of arriving
   * work with no heading is a column of subjects a reader cannot name, and a reader
   * who cannot name a region cannot navigate back to it.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The items, in the order a reader should act on them.
   *
   * Order is the caller's and the Block does not sort, because an intake list's
   * order is a claim about what matters first and a Block that sorted it would be
   * making that claim on the caller's behalf. A stream that arrives newest first
   * should be passed newest first, and a consumer who wants a different order sorts
   * before passing, which is one line in their own code and a decision they are
   * better placed to make than this Block is.
   */
  items: readonly Intake01Item[]
  /**
   * The words on the control that takes an item, given the item.
   *
   * A function and not a string, and the reason is that a queue's take control is
   * rarely one sentence for every row: "Take this", "Accept Priya's request", "Claim
   * for Bristol" and "Open the run" are four actions and four sentences, and the
   * Block cannot know which one the caller means. Required whenever `onAccept` is
   * set, and the run fails without it, because a button with no name is announced as
   * a button and nothing else.
   */
  acceptLabel?: (item: Intake01Item) => string
  /**
   * Called with an item's `id` when the reader presses the control that takes it.
   *
   * A callback and not a router, for the reason the whole package holds: a Block
   * reports an interaction and the consumer decides what it means. There is no
   * `accepting` state written here either, because whether the caller's server took
   * the item is a fact about the caller's server.
   */
  onAccept?: (id: string) => void
  /**
   * The words on the control that turns an item away, given the item.
   *
   * Required whenever `onReject` is set, for the reason `acceptLabel` is. It is a
   * separate function rather than one function with a flag, because "Turn down" and
   * "Take" are not two moods of one sentence.
   */
  rejectLabel?: (item: Intake01Item) => string
  /**
   * Called with an item's `id` when the reader presses the control that turns it
   * away.
   *
   * A callback, and no state written here. Whether a refused item is gone, is kept
   * for an audit, or is retried is a decision about the caller's data, and a Block
   * that removed the row would be making it.
   */
  onReject?: (id: string) => void
  /**
   * The caller's own line about how much is here.
   *
   * A function and not a node, because the count a reader reads is a sentence whose
   * word order and noun inflection belong to their language, and a Block that composed
   * it would compose the English one. It is handed the number of items the Block drew
   * rather than the number it was given, so a caller using `limit` can say what is
   * left rather than what arrived. A function is also what lets a caller say nothing
   * before anything has arrived, by returning null.
   */
  summary?: (count: number) => ReactNode
  /**
   * How many of the newest items to draw.
   *
   * Optional and not defaulted, because a cap is a claim about how much of a stream a
   * reader can see and only the caller knows whether the stream is forty items or
   * forty thousand. The Block takes the first `limit` items in the order it was
   * given, which is the order the caller said was the order a reader should act in.
   */
  limit?: number
  /**
   * The caller's own sentence for a list with nothing in it.
   *
   * Required, and the reason is the sharpest one in this file: a reader who opened
   * an intake list and found nothing is reading exactly one line, and that line is
   * the most load-bearing sentence on the page. "Nothing waiting" is a claim, and it
   * is a different claim in a product where the list is genuinely empty and in one
   * where the query that fills it is broken.
   */
  empty: ReactNode
  /**
   * Heading level for the section heading. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on a page.
 *
 * Four, and each one is a control or a mark that cannot be used. A state with no words
 * is a coloured dot. A link with no sentence is announced by its destination. A take
 * control with no label is announced as a button. A refuse control with no label is
 * the same button, and the pair matters: a reader who hears two identical unnamed
 * buttons on a row has no way to choose between them. Each message names the item,
 * because a caller with a hundred arriving items needs to know which one and not
 * which number.
 */
function assertItems(items: readonly Intake01Item[]): void {
  for (const item of items) {
    if (item.state !== undefined && (item.stateLabel === undefined || item.stateLabel.trim() === '')) {
      throw new Error(
        `Intake01: the item "${item.subject}" declares a state and no stateLabel, so the mark would be a ` +
          'coloured dot with nothing to read beside it, which is invisible to a reader who cannot separate ' +
          'the tones and unreadable to a screen reader whatever the tones are. Pass the words for the state ' +
          'in your own language, or drop the state.',
      )
    }

    if (item.href !== undefined && (item.hrefLabel === undefined || item.hrefLabel.trim() === '')) {
      throw new Error(
        `Intake01: the item "${item.subject}" declares an href with no hrefLabel, so the link would carry no ` +
          'words of its own and a reader would not know what activating it does. Pass the words that say what ' +
          'it does, or omit the href.',
      )
    }

    if (item.href === undefined && item.hrefLabel !== undefined) {
      throw new Error(
        `Intake01: the item "${item.subject}" declares an hrefLabel with no href, so the row would carry a ` +
          'sentence about following something and nothing to follow. Pass the href, or drop the label.',
      )
    }
  }
}

/**
 * A stream of arriving work, fed by the consumer: a source, a subject, a moment, a
 * state, and up to two controls the caller names.
 *
 * **This is a Block and not a `live` surface, and the difference is the whole of
 * what it is.** A Block is rendered once and re-rendered when the consumer's
 * framework decides; a live surface's content changes on its own over a subscription
 * the surface owns. An intake list a consumer feeds by re-rendering with a new array
 * is a Block, and one that has to update by itself is a live surface, and the
 * existing `run-stream-01` is that. So this module holds no socket, no poll, no
 * interval and no timer, and there is no prop that starts one. The cost is stated
 * rather than hidden: a consumer who wants the list to grow while they read it
 * composes the new `Announcement` bar above their own region and re-renders this one
 * from their own state, or asks upstream for a live intake surface, and the roster
 * records that request rather than this Block pretending to be the thing. The falsifiable
 * test the two laws are separated by is what settles it: stop the animation, is the
 * figure still true and still legible? There is no figure here at all, so the question
 * does not arise, and a stream that only showed its newest item when a subscription
 * happened to deliver it would be a video with extra steps.
 *
 * **A subject that is a link is a real anchor, and a subject that is not is a
 * `span`, and neither is a `div` with a click handler.** An item with an `href`
 * renders its subject as a native anchor, so the destination is announced as a link,
 * the status bar shows where it goes, and the middle click opens it in a new tab. An
 * item without one renders as a `span`, because this Block does not invent a
 * destination and the two controls are how a reader acts on an item they cannot open.
 * The rejected arrangement is a `<li onClick>`, and it is rejected for the reason
 * `Todo01` and `inbox-01` each refuse it: an element that listens for a click is not
 * in the tab order at all, so a queue built that way is one a keyboard user cannot
 * work, and the gate on focus indicators is the gate that says so. A caller who needs
 * a third arrangement composes their own control in `detail`.
 *
 * **The subject is a heading one step below the section, because an intake row is a
 * thing a reader may come back to and a link label is not one.** This is the opposite
 * answer to the one `Help01` gives, and the difference is what the row is about. A
 * help index's articles are documents a reader reads, and their names are the text
 * of the links, so forty link labels in the outline say nothing the category title
 * has not already said. An intake row is a piece of work a reader may claim, refuse
 * and come back to, so its subject is the row's identity and belongs in the outline.
 * The cost is a long intake list with many headings, and the answer is `limit`, which
 * is the caller's to set.
 *
 * **The state is a prop and the words beside it are the caller's, and the run fails
 * without them.** The four states are a closed union, and a Block that printed the
 * union's own name would put a sentence into every product that installs it, inside a
 * design system rather than inside their own code, which is where a translation tool
 * is least likely to look. The tones are mapped here and not derived: `new` is the
 * cool role that means not an alarm, `queued` is muted because most of a queue is
 * queued, `accepted` is success because it is the only state that means the reader
 * did the thing, and `rejected` is destructive because it is the one a reader must be
 * able to find. The rejected alternative was deriving the state from whether a handler
 * was set, which would have been a Block inventing a fact about the item.
 *
 * **The moment goes through `relative-time` rather than being printed.** A bare
 * number is milliseconds and a string is anything, so a cell that drew the value as
 * passed would put a raw epoch on the page for every caller whose data layer holds
 * milliseconds, which is most of them. `relative-time` hands the value to the
 * platform, which knows the reader's locale and does the formatting in it, and hands
 * the sentence back to the caller for the relative half. The caller who wants "four
 * minutes ago" composes `relative-time` in `detail` and passes the node, which is the
 * one place the Block does not format anything itself.
 *
 * **A refused item keeps its row.** Nothing here removes a row, whatever the caller
 * does with the id, because a stream is read to decide what to do next and a row
 * that disappears is a decision a reader cannot audit. Filtering the list is the
 * consumer's, and the consumer is the only one who knows whether a reader was meant
 * to see the refused item or not. The cost is that a consumer who wants the row gone
 * has to pass a shorter array, which is one line in their own code.
 *
 * It is a client Component, and the reason is the handlers rather than the state:
 * `onAccept` and `onReject` are functions, a function is a piece of state, and state
 * is a client module. A server component cannot hand an event handler to a `<button>`,
 * so a caller rendering this from a server component would get a stream whose two
 * controls do nothing. The rest of the rendering is a list and a moment, which is the
 * price of that argument and a small one. With no handler set the rendered output is
 * entirely static, and a consumer that passes no handler at all pays for the directive
 * and nothing else.
 */
export function Intake01({
  eyebrow,
  title,
  description,
  items,
  acceptLabel,
  onAccept,
  rejectLabel,
  onReject,
  summary,
  limit,
  empty,
  headingLevel = 'h2',
  className,
}: Intake01Props) {
  // An item's subject is a heading one step below the section that introduces the
  // stream, derived rather than written, so a Block embedded one level deeper
  // carries its subjects with it.
  const Title = childLevel(headingLevel)

  assertItems(items)

  if (onAccept !== undefined && acceptLabel === undefined) {
    throw new Error(
      'Intake01: onAccept was passed with no acceptLabel, so the control would be a button announced as a ' +
        'button and nothing else, and a reader who hears two identical unnamed buttons on a row has no way ' +
        'to choose between them. Pass the words for the action, or drop the handler.',
    )
  }

  if (onReject !== undefined && rejectLabel === undefined) {
    throw new Error(
      'Intake01: onReject was passed with no rejectLabel, so the control would be a button announced as a ' +
        'button and nothing else. Pass the words for the action, or drop the handler.',
    )
  }

  const shown = limit === undefined ? items : items.slice(0, Math.max(0, limit))

  return (
    <Section data-slot="intake-01" className={cn(className)}>
      <div data-slot="intake-01-body" className="flex flex-col gap-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        {summary === undefined ? null : (
          <p data-slot="intake-01-summary" className="text-muted-foreground text-sm tabular-nums">
            {summary(shown.length)}
          </p>
        )}

        {shown.length === 0 ? (
          /*
           * The caller's own sentence, drawn where the rows would have been rather
           * than above them, so a reader who opened the stream is not told at the
           * foot of a page that shows a stream that there is nothing in it. The
           * `text-pretty` is because the honest sentence is sometimes a paragraph
           * and `text-balance` would leave a one-word last line in it.
           */
          <p
            data-slot="intake-01-empty"
            className="text-muted-foreground max-w-measure-narrow text-pretty"
          >
            {empty}
          </p>
        ) : (
          <ol
            data-slot="intake-01-items"
            className="border-border flex flex-col border-t"
          >
            {shown.map((item) => (
              <li
                key={item.id}
                data-slot="intake-01-item"
                data-item={item.id}
                data-state={item.state}
                className="border-border flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-start sm:gap-6"
              >
                <div
                  data-slot="intake-01-identity"
                  className="flex min-w-0 flex-1 flex-col gap-1.5"
                >
                  <Title data-slot="intake-01-subject" className="text-sm font-semibold">
                    {item.href === undefined ? (
                      item.subject
                    ) : (
                      /*
                       * A real anchor rather than a button, so the destination is
                       * announced as a link, the status bar shows it, and the middle
                       * click opens it in a new tab. `rounded-sm` with the full
                       * strength ring rather than the browser's outline is the same
                       * trade `Button` and `CtaLink` make, for the reason their
                       * JSDoc gives: half alpha composites below 3:1 against every
                       * surface in all six themes.
                       */
                      <a
                        data-slot="intake-01-link"
                        href={item.href}
                        className="focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
                      >
                        {item.subject}
                      </a>
                    )}
                  </Title>

                  {item.detail === undefined ? null : (
                    <span
                      data-slot="intake-01-detail"
                      className="text-muted-foreground text-pretty text-sm"
                    >
                      {item.detail}
                    </span>
                  )}

                  {/*
                   * The source and the moment on one line, in that order. The
                   * source is machine notation and the moment is the platform's own
                   * reading, so the line is the two facts a reader scans past on
                   * their way to the subject, and both are in the muted ink because
                   * neither is the row's identity.
                   */}
                  <div
                    data-slot="intake-01-meta"
                    className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                  >
                    <span data-slot="intake-01-source" className="font-mono">
                      {item.source}
                    </span>
                    <RelativeTime
                      data-slot="intake-01-at"
                      date={item.at}
                      dateStyle="medium"
                      className="text-xs"
                    />
                  </div>
                </div>

                {item.state === undefined || item.stateLabel === undefined ? null : (
                  /*
                   * The mark, with the caller's words beside it. `aria-hidden` is on
                   * the dot inside `Status` and not here, so the words are what a
                   * screen reader hears and a reader who cannot separate the tones
                   * still reads which is which.
                   */
                  <Status
                    data-slot="intake-01-state"
                    size="sm"
                    tone={STATE_TONE[item.state]}
                    label={item.stateLabel}
                    className="shrink-0"
                  />
                )}

                {onAccept === undefined && onReject === undefined ? null : (
                  /*
                   * The two controls, and the caller writes the labels for both. They
                   * sit after the mark and the words, never inside them, so a reader
                   * who wants to know what happened to an item is not also reaching
                   * for a button. `accept` is the default weight and `reject` is the
                   * outline beside it, which is the same arrangement `Consent01`
                   * argues for from the other side: a filled control beside a ghost one
                   * is a dark pattern, and taking an item is not more important than
                   * refusing one.
                   */
                  <div
                    data-slot="intake-01-controls"
                    className="flex shrink-0 flex-wrap items-center gap-2"
                  >
                    {onAccept === undefined ? null : (
                      <Button
                        data-slot="intake-01-accept"
                        type="button"
                        size="sm"
                        onClick={() => onAccept(item.id)}
                      >
                        {acceptLabel?.(item)}
                      </Button>
                    )}
                    {onReject === undefined ? null : (
                      <Button
                        data-slot="intake-01-reject"
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(item.id)}
                      >
                        {rejectLabel?.(item)}
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Section>
  )
}

export default Intake01
