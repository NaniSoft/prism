'use client'

import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status } from '../../components/ui/status'
import type { EventSpec } from '../../lib/spec'
import { cn, dayKey } from '../../lib/utils'

/**
 * The refusals, as checks, so a row that would render a link nobody can name, a
 * tone with no words beside it, or a moment with no machine value, is a
 * diagnostic in a console rather than a rendered control.
 *
 * **Two of these four pairs are already held by the type and the checks exist for
 * the caller the type never saw.** `EventSpec` names both pairs as unions, but
 * `tone` and `href` are each optional and their labels are optional beside them,
 * so a typed caller can reach neither diagnostic and a JavaScript caller can. The
 * moment rule is `RelativeTime`'s: a value the platform cannot read has nothing to
 * put in a `dateTime`, and a `time` element with no value in it claims to be a
 * moment and is not one. Every diagnostic names the field so a caller knows which
 * of their own values to fix.
 */
function assertEvent(event: EventSpec): void {
  if ((event.tone === undefined) !== (event.toneLabel === undefined)) {
    throw new Error(
      `ActivityFeed01: the event "${event.key}" declares one of tone and toneLabel without the other, so the row ` +
        'would carry a colour with no words beside it, or words with no colour. A tone is a colour and the words ' +
        'are the information, so on a record a reader may be checking a claim against, a colour alone is worse ' +
        'than anywhere else. Pass the words the tone means, or omit the tone.',
    )
  }

  if ((event.href === undefined) !== (event.hrefLabel === undefined)) {
    throw new Error(
      `ActivityFeed01: the event "${event.key}" declares one of href and hrefLabel without the other, so the row ` +
        'would carry a link with no words on it, or a name with no link beside it. Pass the words that say what ' +
        'following it does, or omit the href.',
    )
  }

  if (!Number.isFinite(new Date(event.at).getTime())) {
    throw new Error(
      `ActivityFeed01: the event "${event.key}" passes an at the platform cannot read, so there is no value to ` +
        'put in the time element and the row would claim to be a moment it cannot name. Pass epoch milliseconds, ' +
        'or a string the platform parses.',
    )
  }
}

/**
 * The props an ActivityFeed01 takes, as a union over whether the feed is grouped.
 *
 * A union rather than an optional `dayLabel` beside an optional `groupBy`, for the
 * reason `HeroAction` is the reference: a `dayLabel` that is optional in the
 * ungrouped arm and required in the grouped one is a prop whose absence is
 * sometimes a mistake and sometimes a decision, and a caller who writes
 * `groupBy="day"` and forgets the label should not compile.
 */
export type ActivityFeed01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a feed composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The events, from the shared event specification, newest first unless the
   * product says otherwise.
   *
   * The entries are `EventSpec` from `@nanisoft/prism-ui/spec`, which is the one
   * declaration of a dated attributed occurrence every Block in this package
   * takes, so a shipment scan, a sign in and a permission change are one shape and
   * no second event type is minted here. Each entry carries a stable `key`, a
   * moment printed exactly as passed, a required `actor` and `action`, an optional
   * `target`, an optional `detail` node, a `tone` with its required `toneLabel`,
   * and an `href` with its required `hrefLabel`.
   *
   * **It names no vocabulary of what happened.** There is no `kind` member,
   * because an event's kind would name what somebody's product calls a thing that
   * happened, and no enumeration of those is this package's to publish: a caller
   * needing one puts the word in `action` or composes a status into `detail`. It
   * carries no progress figure, no severity, no duration and no role, each refused
   * for a reason rather than left out. See the specification module's own JSDoc.
   *
   * The Block does not sort, and the reason is the one `StatusLedger01` gives for
   * its rows: order is a claim about what happened first, and a feed that sorted
   * itself would be making that claim on the caller's behalf. A caller's order is
   * also the only order that can express the exceptions, because a feed is where a
   * pinned record lives and a Block cannot know an event is pinned.
   */
  events: EventSpec[]
  /**
   * Called with an event's key when its row is activated, and the only reason a row
   * is a control at all.
   *
   * A row with no handler is a `li`, which is a record a reader reads; a row with
   * one is a `button`, which is a thing a reader does. That is the whole of the
   * rule, and it is why a feed is a list first and a set of controls second. The
   * alternative was to make every row a button, which is a feed of forty tab stops
   * where a reader tabbing through the page lands on the fortieth record before
   * reaching anything after the feed.
   *
   * An event's destination is a separate control with the caller's own words, so a
   * row can be selectable and linked at once, and that is the arrangement a feed
   * actually wants: a reader activates the row to open the thing and the caller
   * marks it read on the way past.
   */
  onSelect?: (key: string) => void
  /**
   * How many of the events to draw.
   *
   * Optional, and the cost is the honest one: a capped feed that says nothing
   * about what it left out is a feed a reader believes is complete. So the words
   * that would say it are the caller's, and the caller's way of saying them is to
   * pass a limit it can stand behind and put the rest behind its own link. The
   * alternative was a `truncatedLabel` prop beside this one, which is a sentence
   * Prism would ship into every consumer's product.
   */
  limit?: number
  /**
   * What a reader is told when the feed has nothing in it.
   *
   * Required, and it is the one line a reader with a question and no answer is
   * guaranteed to read. It is also the sentence Prism is least entitled to write:
   * "Nothing has happened yet" is a claim about a product and a period, and both
   * are the caller's.
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
       * A day heading is a heading and not a divider, because a reader who
       * navigates by heading is looking for the day they want and a rule between
       * two groups is invisible to them.
       */
      groupBy: 'day'
      /**
       * The words for a day, given the day.
       *
       * Required in this arm, and a function rather than a string, because "Today",
       * "Yesterday" and "Tuesday" are the product's sentences and the key is a
       * fact. The key is an ISO calendar date in the runtime's own zone, so a
       * caller hands it to `Intl.DateTimeFormat` and gets their locale's reading of
       * it, or writes their own. The rejected alternative was the Block calling
       * `Intl` itself, which would put a locale this package does not own into
       * every consumer's feed.
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
 */
const ROW = 'flex w-full flex-col gap-1 border-b py-4 first:border-t last:border-b-0'

/**
 * One record: the shared event's fields, drawn as one run of words, with the
 * moment under it and the destination beside it.
 *
 * **The element is a decision about what a reader can do with the row, and the body
 * is built once and placed in one of two so the two cannot disagree.** A row with an
 * `onSelect` and no destination is a `button`; a row with neither is a `li`. The
 * destination is never the whole row, and that is the second decision here: a link
 * whose only words are the record's own fields tells a reader nothing about what
 * following it does, so the destination is a control with the caller's words and it
 * sits under the record. Putting it inside the row's own control was the alternative
 * and it is invalid markup, since an anchor inside a button is neither focusable in
 * the way a reader expects nor announced as two things.
 *
 * **The body is phrasing content only, so a button can hold it.** A `button` may
 * contain phrasing content and nothing else, so the record, the moment and the
 * detail line are spans and the column arrangement is a flex `span` rather than the
 * list item's own layout.
 *
 * **The tone is drawn with its words and never without them.** The `tone` is a
 * `Status` and the `toneLabel` is the text beside it, and the type pairs them; a
 * caller who sets one without the other reaches `assertEvent` rather than a row
 * with a coloured dot no screen reader can read.
 */
function EventRow({
  event,
  onSelect,
}: {
  event: EventSpec
  onSelect?: (key: string) => void
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
            label={event.toneLabel}
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
      data-event={event.key}
      className={ROW}
    >
      {onSelect === undefined ? (
        record
      ) : (
        <button
          type="button"
          data-slot="activity-feed-01-select"
          onClick={() => onSelect(event.key)}
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
 * A chronological list of what happened: the shared event specification, one record
 * per entry, with an optional line under each.
 *
 * **The trail's entry declaration is `EventSpec`, and this Block mints no second
 * event shape beside it.** `@nanisoft/prism-ui/spec` is the one declaration of a
 * dated attributed occurrence in this package, so a shipment scan, a sign in and a
 * permission change are one type and the vocabulary a consumer learns on this Block
 * is the vocabulary everywhere an occurrence is drawn. An event carries a stable
 * `key` that is never the words of a label, a moment printed exactly as the caller
 * passed it with the machine value on the element, a required `actor` and `action`,
 * an optional `target`, an optional `detail` node for the diff, the payload or the
 * composed reading that four fields cannot hold, a `tone` whose label is required
 * wherever the tone is set, and a destination whose words are required wherever it
 * is set.
 *
 * **It names no vocabulary of what happened, and there is no `kind` member.** An
 * event's kind would name what somebody's product calls a thing that happened, and
 * no enumeration of those is this package's to publish: a member on a Prism type
 * would be promising that every consumer's world is this one. A caller needing one
 * puts the word in `action` or composes a `Status` into `detail`. It carries no
 * `progress`, no `severity`, no `duration` and no `role`, each refused for a reason
 * rather than left out, and the specification module's own JSDoc is the whole of
 * that argument.
 *
 * **The words are the caller's and the shape is Prism's.** A feed that composed the
 * sentence would ship English into every consumer's product: "Ada published a
 * release four hours ago" is a word order, an article, an inflected verb and a
 * relative phrase, and a Block that assembled it would have assembled the English
 * one and given the consumer no way to translate it, inflect it or reorder it. So
 * this Block takes the parts as the caller's own nodes and draws them as one run of
 * words, which is the most a design system can do without writing a sentence.
 *
 * **`at` is printed exactly as passed, and the Block formats no moment.** A Block
 * that formatted one would have to pick a locale, a calendar and a granularity, and
 * `relative-time` already holds that decision: it formats the absolute reading with
 * the platform and hands the sentence back. So this Block prints the caller's value,
 * puts the ISO form on the `time` element's `dateTime` so a crawler and a screen
 * reader get a timestamp whatever the visible reading says, and a caller who wants a
 * relative phrase composes the node beside the record in `detail`.
 *
 * **A vertical arrangement's only spatial claim is order, and this Block draws no
 * length.** There is no scale, no range, no bar and no axis: a bar's length is a
 * claim about a difference between two caller moments, and time as an axis belongs
 * to a screen that composes `Gantt01` or `Calendar01` instead. Append only is a
 * rendering fact and nothing more: what is rendered is the entries it was handed, in
 * the order it was handed, with no control that edits one, removes one or reorders
 * one, and that absence is what append only means. What the Block cannot render is
 * that the record is immutable, tamper evident, signed, sealed or retained, because
 * a Block has no authority over the store behind it: so there is no `immutable`
 * prop, no seal glyph and no verification mark, and no retention window, archive,
 * purge, legal hold, export, freshness or as-of clock. A consumer whose domain
 * requires one enforces it in its own store and shows what the store says.
 *
 * **A row is a control only when there is something for it to do.** An event with
 * no handler renders as a `li`, which is a record a reader reads and not a thing
 * they act on. The destination is a separate control carrying the caller's own
 * words, so a row can be selectable and linked at once, which is the arrangement a
 * feed actually wants: a reader activates the row to open the thing, and the caller
 * marks it read on the way past.
 *
 * **A day group is a list item holding a heading and a nested list, and not a merged
 * row.** The structure is an `ol` of `li` and each `li` is a heading plus its own
 * `ol`, because a reader moving by list item should hear how many days there are and
 * then how many records are in the day they are reading. The day heading is at
 * `childLevel(headingLevel)`, so a feed embedded one level deeper carries its outline
 * with it, and the groups follow the order the days first appear, so a pinned event
 * from yesterday keeps yesterday where the caller put it.
 *
 * **The order is the caller's and the Block never sorts, groups or aggregates.** A
 * feed is the surface where the exceptions live: a pinned event, a run that arrived
 * late, a record the caller wants beside its own retry. The day grouping is content
 * rather than structure, a caller-supplied key with a caller-supplied label, and the
 * Block owns no count, no rate and no elapsed figure. It owns no navigation and no
 * address, so the only route out of an entry is the caller's `href`, and it holds no
 * selection state, because a trail is read and the index holds the set a batch action
 * acts on.
 *
 * It is a client Component, and the reason is the handler rather than the state, as
 * in `data-table-01`: `onSelect` is a function, a function is a piece of state, and
 * state is a client module.
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
    this is the guard for a JavaScript caller who did not get that far.
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
    const days = new Map<string, EventSpec[]>()
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
                  <EventRow key={event.key} event={event} onSelect={onSelect} />
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
          <EventRow key={event.key} event={event} onSelect={onSelect} />
        ))}
      </ol>
    </Section>
  )
}

export default ActivityFeed01
