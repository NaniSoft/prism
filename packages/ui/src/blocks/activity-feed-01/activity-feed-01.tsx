'use client'

import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn, dayKey } from '../../lib/utils'

/**
 * One thing that happened: who did it, what they did, to what, and when.
 *
 * **`actor`, `action`, `target` and `at` are four fields because a record of what
 * happened has four parts and no others.** Every other surface in this repository
 * that shows a record of an event has arrived at the same four by a different route,
 * and each has added a fifth: a source, a category, a severity, a free text field. A
 * fifth field is a claim about the reader's product, because a Block cannot know
 * whether a fifth thing is required, and a caller who has one composes it in
 * `detail`, which is a node. So the shape is closed at four and the rest is a slot.
 *
 * `id` is a key and is never rendered, for the reason `ContentGrid01Entry`'s id is: a
 * feed is reordered by a consumer as often as it is read, and a key made of the
 * words means a rename in the copy is a rename in the key.
 */
export type ActivityFeed01Event = {
  /** A key unique within the feed, carried on the markup as `data-event`. */
  id: string
  /**
   * Who did it, in the words a reader would use for them.
   *
   * A `string` rather than a node because a feed is scanned down this edge and a
   * column that wraps is a column that does not line up. A caller whose actor is a
   * person with an avatar composes the avatar into `detail` instead.
   */
  actor: string
  /**
   * What they did, in the product's own verb.
   *
   * A verb and not a sentence, because the three fields are drawn as one run of
   * words: the actor, then this, then the target. A caller whose event needs a full
   * clause writes the clause here and the run reads as one, which is the same thing
   * with a different boundary.
   */
  action: string
  /**
   * What they did it to: a run, a document, a setting, a person.
   *
   * Optional because a record of what happened sometimes has nothing to point at: a
   * sign-in, a logout, a nightly job that names no document. A caller with a target
   * passes one; a caller whose target is a node composes it into `detail`.
   */
  target?: string
  /**
   * When it happened, printed exactly as passed.
   *
   * A `number` or a `string` and never a `Date`, and the reason is the one
   * `ContentGrid01Entry`'s `at` gives: a Block ships no formatting, so the reading a
   * reader should see is the caller's own. A number is epoch milliseconds and is
   * printed as a number, which is honest and almost never what was wanted; a string
   * is printed as written, so `2026-09-30`, `30 September` and `Q3` are all readings
   * a caller writes and this Block parses none of them. The machine value is still
   * there, on the `time` element's `dateTime`, so a crawler and a screen reader get a
   * timestamp whatever the visible reading says.
   *
   * A caller who wants a localised reading and a relative phrase composes
   * `relative-time` beside it and passes the node in `detail`, which is the one node
   * slot a row has, so the reading sits under the record rather than inside it. See
   * the Block's JSDoc for the whole of that argument.
   */
  at: number | string
  /**
   * The line under the record, for whatever the caller wants said about it: the
   * reason, the payload, the diff, a composed `relative-time` reading.
   *
   * A node rather than a `string` for exactly that last reason. A caller with four
   * words of context passes four words; a caller with a table, a code block or a
   * timestamp passes the Component.
   */
  detail?: ReactNode
  /**
   * The tone of the event, drawn as a `Status` beside the record.
   *
   * See the Block's JSDoc for why a tone arrives without a label: the label this
   * Block draws is the machine value itself, which is what `Changelog01` does with a
   * change's kind, and the alternative is a coloured dot with nothing beside it,
   * which is a mark only a reader who can separate the tones can see.
   */
  tone?: StatusTone
  /** Where the record is kept. Its presence puts a link on the row. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the record's own three fields tells a reader nothing
   * about what following it does, and a feed of ten links all reading "Open" is ten
   * identical controls.
   */
  hrefLabel?: string
}

/**
 * The refusals, as checks, so a row that would render a link nobody can name, or a
 * moment with no machine value, is a diagnostic in a console rather than a rendered
 * control.
 *
 * The pair rule is the one `Changelog01` and `ContentGrid01` make, and the moment
 * rule is `RelativeTime`'s: a value the platform cannot read has nothing to put in a
 * `dateTime`, and a `time` element with no value in it claims to be a moment and is
 * not one. Both diagnostics name the field so a caller knows which of their own
 * values to fix.
 */
function assertEvent(event: ActivityFeed01Event): void {
  if ((event.href === undefined) !== (event.hrefLabel === undefined)) {
    throw new Error(
      `ActivityFeed01: the event "${event.actor} ${event.action}" declares one of href and hrefLabel without the ` +
        'other, so the row would carry a link with no words on it, or a name with no link beside it. Pass the words ' +
        'that say what following it does, or omit the href.',
    )
  }

  if (!Number.isFinite(new Date(event.at).getTime())) {
    throw new Error(
      `ActivityFeed01: the event "${event.actor} ${event.action}" passes an at the platform cannot read, so there is ` +
        'no value to put in the time element and the row would claim to be a moment it cannot name. Pass epoch ' +
        'milliseconds, or a string the platform parses.',
    )
  }
}


/**
 * The props an ActivityFeed01 takes, as a union over whether the feed is grouped.
 *
 * A union rather than an optional `dayLabel` beside an optional `groupBy`, for the
 * reason `HeroAction` is the reference: a `dayLabel` that is optional in the ungrouped
 * arm and required in the grouped one is a prop whose absence is sometimes a mistake
 * and sometimes a decision, and a caller who writes `groupBy="day"` and forgets the
 * label should not compile.
 */
export type ActivityFeed01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a feed composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The events, newest first unless the product says otherwise.
   *
   * The Block does not sort, and the reason is the one `StatusLedger01` gives for its
   * rows: order is a claim about what happened first, and a feed that sorted itself
   * would be making that claim on the caller's behalf. A caller's order is also the
   * only order that can express the exceptions, because a feed is where a pinned
   * record lives and a Block cannot know an event is pinned.
   */
  events: ActivityFeed01Event[]
  /**
   * Called with an event's id when its row is activated, and the only reason a row is
   * a control at all.
   *
   * A row with no handler is a `li`, which is a record a reader reads; a row with one
   * is a `button`, which is a thing a reader does. That is the whole of the rule, and
   * it is why a feed is a list first and a set of controls second. The alternative
   * was to make every row a button, which is a feed of forty tab stops where a reader
   * tabbing through the page lands on the fortieth record before reaching anything
   * after the feed.
   *
   * An event's destination is a separate control with the caller's own words, so a
   * row can be selectable and linked at once, and that is the arrangement a feed
   * actually wants: a reader activates the row to open the thing and the caller
   * marks it read on the way past.
   */
  onSelect?: (id: string) => void
  /**
   * How many of the events to draw.
   *
   * Optional, and the cost is the honest one: a capped feed that says nothing about
   * what it left out is a feed a reader believes is complete. So the words that would
   * say it are the caller's, and the caller's way of saying them is to pass a limit it
   * can stand behind and put the rest behind its own link. The alternative was a
   * `truncatedLabel` prop beside this one, which is a sentence Prism would ship into
   * every consumer's product.
   */
  limit?: number
  /**
   * What a reader is told when the feed has nothing in it.
   *
   * Required, and it is the one line a reader with a question and no answer is
   * guaranteed to read. It is also the sentence Prism is least entitled to write:
   * "Nothing has happened yet" is a claim about a product and a period, and both are
   * the caller's.
   */
  empty: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
} & (
  | {
      /**
       * Group the events under a heading per day.
       *
       * A day heading is a heading and not a divider, because a reader who navigates
       * by heading is looking for the day they want and a rule between two groups is
       * invisible to them.
       */
      groupBy: 'day'
      /**
       * The words for a day, given the day.
       *
       * Required in this arm, and a function rather than a string, because "Today",
       * "Yesterday" and "Tuesday" are the product's sentences and the key is a fact.
       * The key is an ISO calendar date in the runtime's own zone, so a caller hands
       * it to `Intl.DateTimeFormat` and gets their locale's reading of it, or writes
       * their own. The rejected alternative was the Block calling `Intl` itself, which
       * would put a locale this package does not own into every consumer's feed.
       */
      dayLabel: (key: string) => string
    }
  | {
      /** One list, no headings inside it. @defaultValue 'none' */
      groupBy?: 'none'
      /** Forbidden in this arm, because there is no day to name. */
      dayLabel?: never
    }
)

/**
 * The class list every row shares, so the selectable and the plain row are the same
 * row with a different element and cannot drift apart.
 *
 * One constant rather than two, and the alternative was a function returning a
 * `ReactNode` per element shape. There are two shapes, so a constant is the cheaper
 * way to be sure they are identical, and a third shape would be the moment to reach
 * for the function.
 */
const ROW = 'flex w-full flex-col gap-1 border-b py-4 first:border-t last:border-b-0'

/**
 * One record: the four fields, the detail line, and the destination.
 *
 * **The element is a decision about what a reader can do with the row, and the body
 * is built once and placed in one of two so the two cannot disagree.** A row with an
 * `onSelect` and no destination is a `button`; a row with neither is a `li`. The
 * destination is never the whole row, and that is the second decision here: a link
 * whose only words are the record's own three fields tells a reader nothing about
 * what following it does, so the destination is a control with the caller's words and
 * it sits under the record. Putting it inside the row's own control was the
 * alternative and it is invalid markup, since an anchor inside a button is neither
 * focusable in the way a reader expects nor announced as two things.
 *
 * **The body is phrasing content only, so a button can hold it.** A `button` may
 * contain phrasing content and nothing else, so the record, the moment and the
 * detail line are spans and the column arrangement is a flex `span` rather than the
 * list item's own layout. That is the one place this Block is shaped by what an
 * element is allowed to contain rather than by what it looks like, and it is why the
 * two shapes are the same height.
 */
function EventRow({
  event,
  onSelect,
}: {
  event: ActivityFeed01Event
  onSelect?: (id: string) => void
}) {
  const record = (
    <>
      <span
        data-slot="activity-feed-01-record"
        className="flex flex-wrap items-baseline gap-x-2 text-sm"
      >
        {event.tone === undefined ? null : (
          <Status
            data-slot="activity-feed-01-tone"
            tone={event.tone}
            label={event.tone}
            size="sm"
          />
        )}
        <span className="font-medium">{event.actor}</span>
        <span className="text-muted-foreground">{event.action}</span>
        {event.target === undefined ? null : (
          <span className="font-medium">{event.target}</span>
        )}
      </span>

      {/*
        The moment, printed exactly as passed, on a `time` element carrying the ISO
        form in its `dateTime`. The two are deliberately different values: the
        attribute is the machine reading, so a crawler and a screen reader get a
        timestamp, and the text is the caller's own, so this Block formats no moment
        and picks no locale.
      */}
      <span data-slot="activity-feed-01-at" className="text-muted-foreground font-mono text-xs">
        <time dateTime={new Date(event.at).toISOString()}>{event.at}</time>
      </span>

      {event.detail === undefined ? null : (
        <span data-slot="activity-feed-01-detail" className="text-muted-foreground text-sm">
          {event.detail}
        </span>
      )}
    </>
  )

  return (
    <li
      data-slot="activity-feed-01-event"
      data-event={event.id}
      className={ROW}
    >
      {onSelect === undefined ? (
        record
      ) : (
        <button
          type="button"
          data-slot="activity-feed-01-select"
          onClick={() => onSelect(event.id)}
          className="w-full rounded-sm text-left focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <span className="flex flex-col gap-1">{record}</span>
        </button>
      )}

      {event.href === undefined ? null : (
        <CtaLink
          data-slot="activity-feed-01-link"
          href={event.href}
          variant="ghost"
          size="sm"
          className="self-start"
        >
          {event.hrefLabel}
        </CtaLink>
      )}
    </li>
  )
}

/**
 * A chronological list of what happened: an actor, an action, a target, a moment,
 * and an optional line under the record.
 *
 * **The words are the caller's and the shape is Prism's, and that is the whole of the
 * design.** A feed that composed the sentence would ship English into every
 * consumer's product: "Ada published a release four hours ago" is a word order, an
 * article, an inflected verb and a relative phrase, and a Block that assembled it
 * would have assembled the English one and given the consumer no way to translate
 * it, inflect it or reorder it, because the string would be inside a package rather
 * than inside their own code. So this Block takes the three parts as three props and
 * draws them as one run of words, which is the most a design system can do without
 * writing a sentence.
 *
 * **The four fields are four because a record of what happened has four parts and no
 * others.** Who, what they did, to what, and when. Each is required except the target,
 * and the target's absence is a real state rather than a gap: a sign-in, a logout, a
 * nightly job that names no document. The fifth field every similar surface reaches
 * for, a source or a category or a severity, is `tone` and `detail`, both optional
 * and one of them a node. A closed shape of four with two slots is the answer to a
 * feed that has grown a sixth field because the Block could not say no.
 *
 * **`at` is printed exactly as passed, and the Block formats no moment.** A Block
 * that formatted one would have to pick a locale, a calendar and a granularity, and
 * `relative-time` already holds that decision and holds it well: it formats the
 * absolute reading with the platform and hands the sentence back rather than writing
 * it, which is the only arrangement a shared package can offer a product shipping in
 * more than one language. So this Block prints the caller's value, puts the ISO form
 * on the `time` element's `dateTime` so a crawler and a screen reader get a timestamp
 * whatever the visible reading says, and says in the prop's own note that a caller
 * who wants a relative phrase composes the node beside the record in `detail`. The
 * cost is named rather than hidden: a caller who passes epoch milliseconds gets epoch
 * milliseconds, which is honest and almost never what was wanted.
 *
 * **A row is a control only when there is something for it to do.** An event with no
 * handler renders as a `li`, which is a record a reader reads and not a thing they
 * act on. The destination is a separate control carrying the caller's own words, so a
 * row can be selectable and linked at once, which is the arrangement a feed actually
 * wants: a reader activates the row to open the thing, and the caller marks it read on
 * the way past. The alternative was to make every row a link, and a feed of forty
 * links is a page where the tab order runs down the whole feed before it reaches
 * anything after it.
 *
 * **A day group is a list item holding a heading and a nested list, and not a merged
 * row.** The structure is an `ol` of `li` and each `li` is a heading plus its own
 * `ol`, because a reader moving by list item should hear how many days there are and
 * then how many records are in the day they are reading. The alternative was a table
 * with a row spanning every column, which is a table and not a feed, and which would
 * have given four unrelated fields column semantics they do not have. The day heading
 * is at `childLevel(headingLevel)`, so a feed embedded one level deeper carries its
 * outline with it, and the day groups themselves are not headings at the same level,
 * which is what makes a list of days a list rather than a flat run of headings.
 *
 * **The order is the caller's and the Block never sorts.** A feed is the surface
 * where the exceptions live: a pinned event, a run that arrived late, a record the
 * caller wants beside its own retry. A Block that sorted by moment would move the
 * pin, and the caller would have to add a flag and this Block would have to know what
 * the flag meant. The groups follow the order the days first appear, so a pinned
 * event from yesterday puts yesterday first, which is the only arrangement that
 * survives a pin.
 *
 * **The tone is a mark with a machine word beside it, and the cost is that word.** A
 * feed is a scanning surface, so the mark has to be there, and a mark that is colour
 * alone is invisible to a reader who cannot separate the tones and unreadable to a
 * screen reader whatever the tones are. So the tone is drawn by `Status` with the
 * machine value as its label, which is what `Changelog01` does with a change's kind
 * and the reason is the same: a tone is a judgement about urgency that only the
 * caller can make, and a Block that wrote the sentence for it would be picking an
 * alarm for four products at once. A caller whose product words these states
 * differently composes its own mark into `detail` and leaves `tone` unset. That is
 * the cost of the split, stated rather than hidden.
 *
 * It is a client Component, and the reason is the handler rather than the state, as
 * in `data-table-01`: `onSelect` is a function, a function is a piece of state, and
 * state is a client module. The cost is stated rather than implied: a feed with no
 * `onSelect` is a static list that ships this file's client runtime for nothing, and
 * the fix for a consumer who needs that surface to be static is a `ReactNode` slot of
 * their own rather than a Block that attaches a handler to every row.
 */
export function ActivityFeed01({
  eyebrow,
  title,
  description,
  events,
  onSelect,
  limit,
  empty,
  groupBy = 'none',
  dayLabel,
  headingLevel = 'h2',
  className,
}: ActivityFeed01Props) {
  // A day's heading is one step below the section that introduces the feed, so a
  // feed embedded one level deeper carries its outline with it.
  const GroupHeading = childLevel(headingLevel)

  for (const event of events) assertEvent(event)

  // The cap is applied before the grouping rather than after, so a day heading never
  // appears over a group the cap cut in half.
  const shown = limit === undefined ? events : events.slice(0, Math.max(0, limit))

  /*
    The test is on `dayLabel` and not on `groupBy` alone, because destructuring the
    props loses the discriminant the union carries: a caller who wrote
    `groupBy="day"` without the label has a type error rather than a runtime one, and
    this is the guard for a JavaScript caller who did not get that far. The grouped
    branch is built once and the two arms below are the two renderings of it.
  */
  const grouped = groupBy === 'day' && dayLabel !== undefined

  const heading =
    title === undefined ? null : (
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />
    )

  if (shown.length === 0) {
    return (
      <Section data-slot="activity-feed-01" className={className}>
        {heading}
        <div data-slot="activity-feed-01-empty" className="text-muted-foreground text-sm">
          {empty}
        </div>
      </Section>
    )
  }

  if (grouped) {
    /*
      Two passes over the shown events and the order of both is the caller's: the
      days come out in the order they first appear rather than sorted, so a pinned
      event from yesterday keeps yesterday where the caller put it. `new Map` rather
      than `Array.find` because a feed of a thousand events over a month of days is
      thirty one lookups rather than a thousand.
    */
    const days = new Map<string, ActivityFeed01Event[]>()
    for (const event of shown) {
      const key = dayKey(event.at)
      const found = days.get(key)
      if (found === undefined) days.set(key, [event])
      else found.push(event)
    }

    return (
      <Section data-slot="activity-feed-01" className={className}>
        {heading}
        <ol data-slot="activity-feed-01-days" className="flex flex-col">
          {[...days].map(([key, inDay]) => (
            <li
              key={key}
              data-slot="activity-feed-01-day"
              data-day={key}
              className="flex flex-col gap-3 py-2 first:pt-0"
            >
              <GroupHeading
                data-slot="activity-feed-01-day-label"
                className="text-muted-foreground text-sm font-medium"
              >
                {dayLabel(key)}
              </GroupHeading>

              <ol data-slot="activity-feed-01-events" className="flex flex-col">
                {inDay.map((event) => (
                  <EventRow key={event.id} event={event} onSelect={onSelect} />
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </Section>
    )
  }

  return (
    <Section data-slot="activity-feed-01" className={className}>
      {heading}
      <ol data-slot="activity-feed-01-events" className="flex flex-col">
        {shown.map((event) => (
          <EventRow key={event.id} event={event} onSelect={onSelect} />
        ))}
      </ol>
    </Section>
  )
}

export default ActivityFeed01
