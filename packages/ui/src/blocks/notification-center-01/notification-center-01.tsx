'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { ListPanel } from '../../components/ui/list-panel'
import {
  Section,
  SectionHeading,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * One notification: a mark, a title, a body, a moment, a read state, and a slot for
 * the caller's own controls.
 *
 * `title` and `at` are the two that make a notification a notification. Everything
 * else is annotation, and a notification with no body draws its title and its moment
 * rather than a card with two empty lines where the annotation would have been, which
 * is the rule every optional field on this type follows.
 *
 * `body` is a node and not a `string` because a notification's body is the one place
 * on this surface that routinely holds something other than prose: a diff summary, a
 * list of what changed, a `CodeBlock`, a composer's own link. A `string` would make
 * each of those a second notification.
 */
export type NotificationCenter01Notification = {
  /** A key unique within the set, carried on the markup as `data-notification`. */
  id: string
  /**
   * The one line that says what happened, in the product's own words.
   *
   * The anchor of the row and the accessible name of the control a reader activates
   * to mark it read, so it is a phrase and not a sentence with a full stop.
   */
  title: string
  /** The detail under the title. A node, so it may hold a table or a code block. */
  body?: ReactNode
  /**
   * When it arrived, printed exactly as passed.
   *
   * A `number` or a `string` and never a `Date`, and the reason is the one
   * `ContentGrid01Entry`'s `at` gives: a Block ships no formatting, so the reading a
   * reader should see is the caller's own. A number is epoch milliseconds and is
   * printed as a number, which is honest and almost never what was wanted; a string
   * is printed as written. The machine value is still on the `time` element's
   * `dateTime`, so a crawler and a screen reader get a timestamp whatever the visible
   * reading says.
   *
   * A caller who wants a localised reading with a relative phrase composes
   * `relative-time` and passes the node in `body`, beside the moment.
   */
  at: number | string
  /**
   * Whether the reader has seen it.
   *
   * Read from the item's own field and never from the count, which is the decision
   * this Block's JSDoc argues in full. A `false` carries the mark; absent and `true`
   * both mean read, so a caller that never thinks about the field ships every
   * notification marked as unread, which is the honest reading of a list a reader has
   * not looked at.
   */
  read?: boolean
  /**
   * The mark beside the title, in the caller's own icon set.
   *
   * A `LucideIcon` and not a `ReactNode`, because the shape on screen is a
   * fixed-size square and a node would have to be told what to be. The icon is
   * `aria-hidden`, because it is decoration beside a title that already says what the
   * notification is, and announcing an icon name would replace the title with
   * something less useful. An icon with no `tone` is a kind; a `tone` with no icon is
   * an urgency; the two can both be there because they say different things.
   */
  icon?: LucideIcon
  /**
   * The urgency of the notification, drawn as a `Status` in the row's meta line.
   *
   * See the Block's JSDoc for why a tone arrives without a label: the label this
   * Block draws is the machine value itself, which is what `Changelog01` does with a
   * change's kind, and the alternative is a coloured dot with nothing beside it.
   */
  tone?: StatusTone
  /** Where the thing the notification is about lives. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the notification's own title tells a reader nothing
   * about what following it does, and a column of links all reading "Open" is a
   * column of identical controls.
   */
  hrefLabel?: string
  /**
   * The caller's own controls for this notification: dismiss, snooze, assign.
   *
   * A slot and not a set of named controls, because which controls a notification
   * has is the consumer's fact. A panel that drew a dismiss button would be assuming
   * every notification is dismissible, which is true of a marketing one and false of
   * a security one.
   */
  actions?: ReactNode
}

/**
 * The mark-all control, as a pair that is either present or absent.
 *
 * A union rather than an optional `onMarkAllRead` beside an optional `markAllLabel`,
 * for the reason `HeroAction` is the reference: the two are required together, and two
 * independent optionals produce three states, of which the one that compiles is a
 * control that marks everything and is announced as nothing.
 */
type MarkAll =
  | {
      /** Marks every notification read, in one call with the caller's own ids. */
      onMarkAllRead: () => void
      /**
       * The words on that control, and the accessible name a screen reader reads
       * before the reader presses it.
       *
       * "Mark all as read" and "Clear" are both ordinary and they are not the same
       * sentence, and a control a reader cannot name is a control they press with no
       * confidence.
       */
      markAllLabel: string
    }
  | {
      /** Forbidden in this arm, so a control with no words cannot be typed. */
      onMarkAllRead?: never
      markAllLabel?: never
    }

/**
 * The per-item handler, as a pair that is either present or absent.
 *
 * There is no label beside it because there is no control: the notification's own
 * title is the control, and its accessible name is the caller's own phrase. A
 * separate "mark read" button on every row would be a column of identical controls,
 * which is the arrangement this Block refuses for the very same reason it requires
 * words on a link.
 */
type MarkOne = { onMarkRead: (id: string) => void } | { onMarkRead?: never }

/**
 * The shape of the surface, as a pair that is either a page section or a bounded
 * panel.
 *
 * A union rather than a `variant` and a `listLabel` beside it, for the reason the
 * other two pairs give: `listLabel` is required in the panel arm and meaningless in
 * the section arm, and two independent optionals would let a caller write
 * `variant="panel"` with no name for the scroll region, which is the one control on
 * that surface that owes an accessible name by construction.
 */
type Shape =
  | {
      /**
       * A bounded, scrollable panel, for a notification centre that lives in a shell
       * beside the content rather than on a page of its own.
       *
       * This arm draws no `Section`, no section heading and no eyebrow, and that is
       * what `ListPanel` is for: a `Section` owns the container and 4rem of vertical
       * padding at the top and 6rem at the bottom, and a popover 24rem wide with 10rem
       * of air above it is a panel with padding, not a notification centre. The title
       * becomes the panel's own title, the count its count, and the mark-all control
       * its toolbar, so a caller reading a shell sees one surface rather than a
       * section inside a drawer. A panel's title is a `span` and not a heading for
       * the reason `ListPanel` gives, which is that four panels in a grid are four
       * titles under one section heading, and `headingLevel` and `eyebrow` are the
       * section heading's fields and are not drawn in this arm. A caller who wants a
       * heading over the panel composes it above, which is the arrangement
       * `headingLevel` exists for everywhere else in this package.
       */
      variant: 'panel'
      /**
       * The accessible name of the scrolling region, and the panel's when the panel
       * has no title.
       *
       * Required in this arm because the body scrolls, and a scroll region is a tab
       * stop. A tab stop with no name is a thing a reader lands on and cannot say
       * where they are, and this package took over the scrollbar itself precisely so
       * that the control a reader meets here is one it recognises.
       */
      listLabel: string
      /**
       * The height the panel stops at, in pixels, once the list is longer than that.
       *
       * A number and not a Tailwind class, because the bound is data rather than
       * layout: the same panel is a short one in a shell and a tall one on a page, and
       * a caller who could only say `max-h-80` would be picking one of those for the
       * other.
       */
      maxHeight?: number
    }
  | {
      /** A page section: a heading, a count, the mark-all control, and the list. */
      variant?: 'list'
      /** Forbidden in this arm, because a page section is not a scroll region. */
      listLabel?: never
      maxHeight?: never
    }

/**
 * The props a NotificationCenter01 takes, and the three pairs every one of them
 * carries.
 *
 * The base holds the content and the optional strings; the three unions hold the
 * decisions. They are separate types so that a reader can see which facts are
 * independent, and they are intersected so that none of them can be half applied.
 */
export type NotificationCenter01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title, or the panel's title. */
  title?: string
  /**
   * The notifications, newest first unless the product says otherwise.
   *
   * The Block does not sort, for the reason `ActivityFeed01` gives in full: order is a
   * claim about what the reader missed first, and a centre that reordered its own
   * unread items would be moving the thing a reader is most likely to want.
   */
  notifications: NotificationCenter01Notification[]
  /**
   * The unread count, in the reader's own words.
   *
   * Optional, and its absence is a decision rather than a gap: a product that shows
   * the mark on each item and no count at all has said the same thing with a mark
   * rather than a number, and some of them prefer it.
   *
   * A function and not a `string` for the reason `waitlist-01` gives for a position,
   * which is the same argument about a different sentence: "3 unread", "3 new" and
   * "3 since Monday" are three sentences, they differ in word order, in the noun and
   * in whether the number comes first, and a Block that composed one of them would
   * compose the English one and ship it into every consumer's product where a reader
   * in any other language would be shown a count in a language they did not choose.
   * So Prism counts, which is a fact, and hands the sentence back.
   */
  countLabel?: (count: number) => string
  /**
   * The words for the mark on an unread notification.
   *
   * Optional in the type and required in practice, and the mismatch is deliberate: a
   * consumer whose notifications are all read should not have to invent a word for a
   * mark nothing carries, and the alternative, making the prop required, is a prop
   * every consumer has to fill with a guess. So a notification with no `unreadLabel`
   * and no words for its unread state throws, which is the same enforcement
   * `StatusLedger01` uses for `statusLabel` and `Compliance01` uses for
   * `stateLabel`: the state is a mark and the words are the information, and a mark
   * with nothing beside it is invisible to a reader who cannot see it and unreadable
   * to a screen reader whatever it is.
   */
  unreadLabel?: string
  /**
   * What a reader is told when the centre has nothing in it.
   *
   * Required, and it is the sentence Prism is least entitled to write. "You are all
   * caught up" is a claim about a product and a moment, and both are the caller's.
   */
  empty: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
} & MarkAll &
  MarkOne &
  Shape

/**
 * The refusals, as checks, so a row that would render a link nobody can name, a
 * moment with no machine value, or a mark with no words is a diagnostic in a console
 * rather than a rendered control.
 *
 * All three are the house pair rules and each one names the field, so a caller knows
 * which of their own props to add. The unread rule is the one that earns its place
 * here: a filled dot is a colour, and a colour is not a state a screen reader can be
 * told about, so the mark has to arrive with words or the run has to fail.
 */
function assertNotification(
  notification: NotificationCenter01Notification,
  unreadLabel: string | undefined,
): void {
  if ((notification.href === undefined) !== (notification.hrefLabel === undefined)) {
    throw new Error(
      `NotificationCenter01: the notification "${notification.title}" declares one of href and hrefLabel without the ` +
        'other, so the row would carry a link with no words on it, or a name with no link beside it. Pass the words ' +
        'that say what following it does, or omit the href.',
    )
  }

  if (!Number.isFinite(new Date(notification.at).getTime())) {
    throw new Error(
      `NotificationCenter01: the notification "${notification.title}" passes an at the platform cannot read, so there ` +
        'is no value to put in the time element and the row would claim to be a moment it cannot name. Pass epoch ' +
        'milliseconds, or a string the platform parses.',
    )
  }

  if (notification.read !== true && unreadLabel === undefined) {
    throw new Error(
      `NotificationCenter01: the notification "${notification.title}" is unread and no unreadLabel was passed, so the ` +
        'mark would be a filled dot with no words, which is a colour rather than a state. Pass the words this ' +
        'product uses for an unread notification, which are not this Block choice.',
    )
  }
}

/**
 * The unread mark: a filled dot that is also a graphic with a name.
 *
 * **The mark is a filled dot plus an accessible name, and the reason is that a
 * colour is not a state a screen reader can be told about.** A dot in the brand ink
 * is visible to a sighted reader who knows what it means and to nobody else: it is
 * invisible to a reader who cannot see the ink against the surface, and a screen
 * reader given a `<span>` with no role reads nothing at all, because a filled shape
 * carries no text. So the dot is `role="img"` with the caller's `unreadLabel` as its
 * name, which is the one arrangement where a graphic announces what it is. The
 * rejected alternatives are both in this package already: a bare dot beside words
 * that are not about the state, which is a mark only a sighted reader decodes, and a
 * word beside the dot, which would put a sentence in the row that the caller has
 * already written the title for.
 *
 * **It is a filled dot and not a ring, and that is a measurement rather than a
 * preference.** `status.tsx` and `timeline.tsx` both draw an unfilled ring, and the
 * reason they give is that a filled pastel dot fails contrast against a light card,
 * which is a real argument for a mark that has to be found in a row of things. This
 * mark has the opposite requirement: it is the thing a reader is looking for, and it
 * is found by contrast against the row rather than by contrast of its own edge, so it
 * is drawn in the full `primary` ink on the card, which is the strongest pair the
 * token contract publishes. The cost is stated rather than hidden: on a surface where
 * `primary` is close to `card`, the mark is a tint rather than a dot, and the
 * difference between read and unread is then carried by the title's weight, which is
 * why the title is set at a heavier weight on an unread row rather than relying on
 * the dot alone.
 */
function UnreadMark({ label }: { label: string }) {
  return (
    <span
      data-slot="notification-center-01-unread"
      role="img"
      aria-label={label}
      className="bg-primary mt-2 inline-block size-2 shrink-0 rounded-full"
    />
  )
}

/**
 * The shared class list for one notification, so the list and the panel arms cannot
 * drift apart.
 *
 * One constant rather than two, and the two arms call this in the same order. The
 * reason they share it is that a notification in a panel and a notification on a page
 * are the same notification, and a reader who moves one from a drawer to a page
 * should not find a different border or a different gap.
 */
const ROW = 'flex w-full gap-3 border-b px-4 py-3 last:border-b-0'

/**
 * One notification, in whichever of the two forms the caller chose.
 *
 * **The title is the control when the caller gave the rows something to do, and it is
 * never a link.** An `onMarkRead` makes the title a `button` whose accessible name is
 * the caller's own phrase, so marking a notification read costs a reader one
 * activation and no words they have to learn. The destination is a separate control
 * with the caller's words on it, which is the same arrangement `activity-feed-01`
 * takes and the same reason: a link whose only words are the notification's own title
 * tells a reader nothing about what following it does, and a control that both
 * navigates and acts is a control no reader can predict.
 *
 * **The body is phrasing content, because it can sit inside a button.** A `button` may
 * contain phrasing content and nothing else, so the body is a `span` and the column
 * arrangement is a flex `span` rather than the row's own layout. That is the one place
 * this Block is shaped by what an element is allowed to contain rather than by what it
 * looks like, and it is why the two forms are the same height.
 */
function NotificationRow({
  notification,
  onMarkRead,
  unreadLabel,
}: {
  notification: NotificationCenter01Notification
  onMarkRead?: (id: string) => void
  unreadLabel: string | undefined
}) {
  const unread = notification.read !== true
  const Icon = notification.icon

  const title = (
    <span
      data-slot="notification-center-01-title"
      className={cn('text-sm', unread ? 'font-semibold' : 'font-medium')}
    >
      {notification.title}
    </span>
  )

  return (
    <li
      data-slot="notification-center-01-item"
      data-notification={notification.id}
      data-read={unread ? undefined : 'true'}
      className={ROW}
    >
      {/*
        The leading marks. The unread dot comes first because it is the thing a reader
        is scanning for, and the icon sits beside it rather than in place of it: the
        dot says whether the reader has seen this and the icon says what kind of thing
        it is, and collapsing them into one mark would make the kind of notification
        unreadable to a reader who cannot separate the ink.
      */}
      <span data-slot="notification-center-01-marks" className="flex shrink-0 items-start gap-2">
        {/*
          The mark is drawn only when there are words to draw it with. The check above
          has already refused the case, so this is the same rule a second time and it
          draws nothing rather than drawing an unnamed mark, which is a colour with no
          state attached and therefore not a mark.
        */}
        {unread && unreadLabel !== undefined ? <UnreadMark label={unreadLabel} /> : null}
        {Icon === undefined ? null : (
          <span
            data-slot="notification-center-01-icon"
            className="bg-muted text-muted-foreground inline-flex size-6 items-center justify-center rounded-md"
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </span>

      <span data-slot="notification-center-01-body" className="flex min-w-0 flex-1 flex-col gap-1">
        {onMarkRead === undefined ? (
          title
        ) : (
          <button
            type="button"
            data-slot="notification-center-01-select"
            onClick={() => onMarkRead(notification.id)}
            className="self-start rounded-sm text-left focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none"
          >
            {title}
          </button>
        )}

        {notification.body === undefined ? null : (
          <span
            data-slot="notification-center-01-detail"
            className="text-muted-foreground text-pretty text-sm"
          >
            {notification.body}
          </span>
        )}

        {/*
          The meta line: the moment and the tone. They share a line because they are
          both machine annotation about the same record, and putting the tone on its
          own line would give a notification with no body two lines of nothing.
        */}
        <span
          data-slot="notification-center-01-meta"
          className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
        >
          <span className="font-mono">
            <time dateTime={new Date(notification.at).toISOString()}>{notification.at}</time>
          </span>
          {notification.tone === undefined ? null : (
            <Status
              data-slot="notification-center-01-tone"
              tone={notification.tone}
              label={notification.tone}
              size="sm"
            />
          )}
        </span>
      </span>

      {/*
        The trailing slot, and the two things that can be in it. The caller's own
        controls come first and the destination last, because a destination is a
        commitment and the controls beside it are the reversible things.
      */}
      <span
        data-slot="notification-center-01-actions"
        className="flex shrink-0 items-start gap-2"
      >
        {notification.actions}
        {notification.href === undefined ? null : (
          <CtaLink href={notification.href} variant="ghost" size="sm">
            {notification.hrefLabel}
          </CtaLink>
        )}
      </span>
    </li>
  )
}

/**
 * A list of notifications with an unread count and a mark-all control.
 *
 * **The unread count is a number beside a noun, and the noun is the caller's through
 * `countLabel`.** The argument is the one `waitlist-01` makes about a position, applied
 * to a different sentence: "3 unread", "3 new" and "3 since Monday" are three
 * sentences, they differ in word order, in the noun, in the plural and in whether the
 * number comes first at all, and a Block that composed one of them would compose the
 * English one and ship it into every consumer's product, where a reader in any other
 * language is shown a count in a language they did not choose. So Prism counts, which
 * is a fact, and hands the sentence back. The cost is stated rather than hidden: a
 * caller who passes no `countLabel` gets no count, and a reader who relies on the
 * number has to look for the marks instead.
 *
 * **Read is derived from each item's own field and never from the count, and that is
 * what lets the count mean something else without anything being a mismatch.** The
 * count is computed from the notifications this Block was handed, and it is about
 * those notifications. A caller whose badge means something wider, every workspace
 * rather than this one, or everything since Monday, renders that badge in their own
 * header and this Block's count is the one about the list in front of the reader, and
 * the two are not in conflict because they are not about the same set. What would be
 * a mismatch is deriving the marks from the count: four unread items under a count of
 * zero would then be four items whose own fields say read, and the reader would be
 * told the opposite thing by the same Block from two places. So the mark comes from
 * `read` and only from `read`, and a caller who filters a hundred notifications down
 * to the four unread ones gets four marks and a count of four, each true of the list
 * as given.
 *
 * **The unread mark is a filled dot plus an accessible name, and the second half is
 * the point.** A colour is not a state a screen reader can be told about: a `<span>`
 * with a background and no role announces nothing, and a reader who cannot separate
 * the ink from the card sees no mark at all. So the dot is `role="img"` with the
 * caller's required `unreadLabel` as its name, and the title is set at a heavier
 * weight on an unread row so the difference survives even where the ink is a tint.
 * The rejected alternatives are both in this package already and both were refused
 * somewhere: a bare dot beside words that are not about the state, and a word beside
 * the dot, which would put a sentence in the row that the caller's own title already
 * fills.
 *
 * **A row is a control only when the caller gave it something to do.** With
 * `onMarkRead` the title is a `button` whose accessible name is the caller's own
 * phrase, so a reader marks one read with one activation and no words to learn. The
 * destination is a separate control carrying the caller's own words, and that is the
 * arrangement `activity-feed-01` takes for the same reason: a link whose only words
 * are the record's own title tells a reader nothing, and a control that both navigates
 * and marks read is a control no reader can predict. A centre with no handlers is a
 * list, which is a record a reader reads and not a set of tab stops.
 *
 * **The two shapes are a page section and a bounded panel, and the panel arm draws
 * no `Section`.** A `Section` owns the container and 4rem of vertical padding at the
 * top and 6rem at the bottom, and a popover 24rem wide with 10rem of air above it is
 * not a notification centre. So `variant="panel"` composes `ListPanel` with the title
 * as its title, the count as its count and the mark-all control as its toolbar, which
 * is exactly the set of slots that Component already has, and the scroll region is
 * named by the caller's required `listLabel` because a scroll region is a tab stop and
 * a tab stop owes a name. The cost is that the two arms are not one surface, so a
 * caller moving a centre from a page into a shell restyles the frame by choosing an
 * arm rather than by passing a prop.
 *
 * **The moment is printed exactly as passed, and the Block formats none.** A Block
 * that formatted one would have to pick a locale, a calendar and a granularity, and
 * `relative-time` already holds that decision and holds it well: it formats the
 * absolute reading with the platform and hands the sentence back rather than writing
 * it, which is the only arrangement a shared package can offer a product shipping in
 * more than one language. So the ISO form goes on the `time` element's `dateTime` and
 * the caller's own string goes in the text, and a caller who wants "four minutes ago"
 * composes the node into `body`. The cost is named rather than hidden: a caller who
 * passes epoch milliseconds gets epoch milliseconds, which is honest and almost never
 * what was wanted.
 *
 * **The tone is a mark with a machine word beside it, and the cost is that word.** The
 * same split `activity-feed-01` and `changelog-01` make: a tone is a judgement about
 * urgency that only the caller can make, and a mark that is colour alone is invisible
 * to a reader who cannot separate the tones and unreadable to a screen reader whatever
 * the tones are. So the tone is drawn by `Status` with the machine value as its label,
 * and a caller whose product words these states differently composes its own mark and
 * leaves `tone` unset.
 *
 * It is a client Component, and the reason is the handlers rather than the state, as
 * in `data-table-01`: a function is a piece of state, and state is a client module.
 * The cost is stated rather than implied: a centre with no handler on any row ships
 * this file's client runtime for nothing, and the fix for a consumer who needs that
 * surface to be static is a `ReactNode` slot of their own.
 */
export function NotificationCenter01({
  eyebrow,
  title,
  notifications,
  countLabel,
  unreadLabel,
  empty,
  onMarkRead,
  onMarkAllRead,
  markAllLabel,
  variant = 'list',
  listLabel,
  maxHeight,
  headingLevel = 'h2',
  className,
}: NotificationCenter01Props) {
  for (const notification of notifications) {
    assertNotification(notification, unreadLabel)
  }

  // Counted from the items themselves rather than passed, because the count is a fact
  // about the list in front of the reader and a passed count could disagree with it.
  // The mark on each item comes from that item's own field and never from this
  // number, which is what lets a caller's wider badge sit beside it without a
  // mismatch. See the JSDoc above.
  const unread = notifications.filter((notification) => notification.read !== true).length
  const count = countLabel === undefined ? null : countLabel(unread)

  const markAll =
    onMarkAllRead === undefined || markAllLabel === undefined ? null : (
      <Button
        data-slot="notification-center-01-mark-all"
        type="button"
        variant="ghost"
        size="sm"
        onClick={onMarkAllRead}
      >
        {markAllLabel}
      </Button>
    )

  const rows = notifications.map((notification) => (
    <NotificationRow
      key={notification.id}
      notification={notification}
      onMarkRead={onMarkRead}
      unreadLabel={unreadLabel}
    />
  ))

  if (variant === 'panel' && listLabel !== undefined) {
    return (
      <div data-slot="notification-center-01" data-variant="panel" className={cn('min-w-0', className)}>
        <ListPanel
          label={listLabel}
          maxHeight={maxHeight}
          title={title}
          count={count ?? undefined}
          actions={markAll}
        >
          {notifications.length === 0 ? (
            <div
              data-slot="notification-center-01-empty"
              className="text-muted-foreground px-4 py-6 text-sm"
            >
              {empty}
            </div>
          ) : (
            <ul data-slot="notification-center-01-list" className="flex flex-col">
              {rows}
            </ul>
          )}
        </ListPanel>
      </div>
    )
  }

  return (
    <Section data-slot="notification-center-01" data-variant="list" className={className}>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          className="mb-6"
        />
      ) : null}

      {/*
        The count and the mark-all control sit on one row above the list rather than
        inside the first item, because both are about the whole set. A count drawn
        inside a row is a count of that row, which is a different claim.
      */}
      {count === null && markAll === null ? null : (
        <div
          data-slot="notification-center-01-header"
          className="mb-4 flex flex-wrap items-center justify-between gap-3"
        >
          {count === null ? (
            <span />
          ) : (
            <span
              data-slot="notification-center-01-count"
              className="text-muted-foreground text-sm tabular-nums"
            >
              {count}
            </span>
          )}
          {markAll}
        </div>
      )}

      {notifications.length === 0 ? (
        <div data-slot="notification-center-01-empty" className="text-muted-foreground text-sm">
          {empty}
        </div>
      ) : (
        <ul
          data-slot="notification-center-01-list"
          className="border-border flex flex-col border-b"
        >
          {rows}
        </ul>
      )}
    </Section>
  )
}

export default NotificationCenter01
