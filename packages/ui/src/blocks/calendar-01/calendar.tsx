'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { MiniCalendar } from '../../components/ui/mini-calendar'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn, dayKey } from '../../lib/utils'

/**
 * One scheduled thing, on one day.
 *
 * `date` is a string and not a `Date` for the reason a date grid needs a key
 * rather than an instant: a scheduled thing is placed on a calendar day, and a
 * day is identified by its year, month and day in the reader's own timezone. An
 * `Instant` handed to a grid is a moment, and the same moment is two different
 * days on either side of the Atlantic.
 */
export type CalendarItem = {
  /** The item's stable key within the month. */
  id: string
  /**
   * The day the item is on.
   *
   * A date-only key in the form `YYYY-MM-DD` is read as that day in the reader's
   * own timezone rather than as midnight UTC, because `new Date('2026-09-01')` is
   * midnight UTC and that is the previous day in every timezone west of Greenwich.
   * Any other string is handed to the platform untouched, so an ISO 8601
   * date-time and a locale's own written date both work and neither is interpreted
   * here. An unreadable value throws rather than rendering, for the reason
   * `relative-time` gives: a day that is quietly wrong is a task on the wrong day.
   */
  date: string
  /** What the item is, in the words a reader would use about it. */
  label: string
  /**
   * The tone the item is drawn in, and a judgement only the caller can make.
   *
   * The five are the `Status` tones themselves rather than a second set, so there
   * is nothing here to translate between: a caller choosing a tone is choosing the
   * dot `Status` draws. What the caller does have to supply is the words, and see
   * `CalendarItem.stateLabel` for why.
   */
  state?: StatusTone
  /** The words for the tone, in the product's own vocabulary. */
  stateLabel?: string
  /** Where the item goes. Its presence makes the label a native anchor. */
  href?: string
  /**
   * The words on the link beside the label, and required whenever `href` is.
   *
   * A link whose only words are the item's own label tells a reader nothing about
   * what activating it does, which is the same defect `Download01` refuses.
   */
  hrefLabel?: string
}

/**
 * The props a Calendar01 takes.
 *
 * Every string is a prop and the Block ships none. There is no month name, no
 * weekday name, no day number, no item and no sentence for a month with nothing
 * on it, and the absence of the first three is the sharpest version of the rule:
 * a calendar is a claim about what a team has committed to on which days, and a
 * Block that named its months would be publishing another product's year.
 */
export type CalendarBlock01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title, and required. A month grid with no heading is a calendar. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The month on show, when the caller holds it.
   *
   * Pass it with `onMonthChange` to control the month, or pass `defaultMonth` to
   * let the Block keep it. The two halves are documented together because a
   * controlled month with no `onMonthChange` would draw two paging controls that
   * cannot page, which is the arrangement `mini-calendar` refuses in its own right
   * and this Block inherits.
   */
  month?: Date
  /** The month the grid opens on, for a grid that keeps its own. */
  defaultMonth?: Date
  /** Called with the first day of the month when the reader pages. */
  onMonthChange?: (month: Date) => void
  /**
   * The locale the month name, the weekday headings, the day numbers and the day
   * headings under the grid are written in.
   *
   * Omit it and the runtime's own locale is used. It is one tag and not a table of
   * words, which is the whole contract: nothing in this file holds a month name, a
   * weekday name or a digit set, so there is nothing here to translate.
   */
  locale?: string
  /**
   * Which day the reader's week starts on, as `Date.prototype.getDay()` numbers
   * it, so `0` is Sunday and `1` is Monday.
   *
   * Asked rather than inferred, for the reason `mini-calendar` gives: a grid that
   * guesses Sunday is wrong in a Monday-first country with nothing on screen to
   * say so.
   */
  weekStartsOn?: 0 | 1
  /** The accessible name of the control that steps back one month. */
  previousLabel: string
  /** The accessible name of the control that steps forward one month. */
  nextLabel: string
  /**
   * The accessible name of the grid, saying which question it answers.
   *
   * Required, and for the reason `mini-calendar` states: a grid named "Calendar"
   * is a grid that answers no question, and a page with two of them gives a reader
   * two identical names to choose between.
   */
  label: string
  /**
   * The items, placed on their days by their own `date`.
   *
   * The Block does not sort them and does not keep the ones outside the month on
   * show. A month is the unit a reader arrives with, and an item whose day is not
   * in it is an item the reader did not ask about; a caller that wants a spillover
   * column composes one, which is a decision about their own product's schedule
   * and not something this Block can know.
   */
  items: readonly CalendarItem[]
  /**
   * Called with an item's `id` when the reader activates an item that has no
   * `href`.
   *
   * A callback and not a router, for the reason the whole package holds: this
   * Block reports an interaction and the consumer decides what it means. An item
   * with an `href` renders as a link and never calls this.
   */
  onSelect?: (id: string) => void
  /**
   * How many items one day shows before it says how many it is holding back.
   *
   * Three by default, and the default is the decision rather than a number. A
   * month grid with nine items on one day is a month grid nobody can read, and the
   * honest answer is to cap and say how many are hidden rather than to shrink the
   * text until it is illegible, because a day whose entries are six pixels tall
   * is a day a reader has given up on. Three is where a day's list is still a list
   * rather than a block.
   *
   * A caller with a month of single-item days should raise it, and the overflow
   * line simply stops appearing.
   */
  maxPerDay?: number
  /**
   * The words for a day holding more items than it shows, given how many it is
   * holding back.
   *
   * Required whenever a day actually overflows, and the run fails without it. A
   * cap that hides items with nothing said about the hiding is a silent loss: the
   * reader sees a day that looks complete and it is not, and the one thing a
   * calendar may never do is look finished when it is not. So the overflow line is
   * always drawn when there is an overflow, and the words are the caller's.
   */
  overflowLabel: (count: number) => string
  /**
   * What the Block draws when the month on show holds no items.
   *
   * Optional, because a month with nothing on it is an honest and common state for
   * a calendar and the empty list beside the grid already says so visually. A
   * caller whose reader would mistake a quiet month for a broken one passes a line
   * here.
   */
  empty?: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/** The first of the month, which is the identity a month is stored under. */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * A caller's `date` string as a local day.
 *
 * A date-only key is split and rebuilt rather than handed to `new Date`, and the
 * reason is specific and worth stating because the plain version is wrong: the
 * platform reads `2026-09-01` as midnight UTC, which is the evening of the 31st in
 * New York and the morning of the 1st in Berlin, so a plain parse puts a task on
 * the wrong day for every reader outside the timezone the data was written in.
 * Every other string goes to the platform untouched, and an unreadable one throws
 * rather than rendering, because a day that is quietly wrong is a task on the
 * wrong day and nothing on the page says so.
 */
function parseDay(value: string): Date {
  const keyed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (keyed !== null) {
    return new Date(Number(keyed[1]), Number(keyed[2]) - 1, Number(keyed[3]))
  }
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) {
    throw new Error(
      'Calendar01: an item carries a date the platform cannot read, so there is no day to place it on ' +
        'and the item would vanish from the month without saying why. Pass a date-only key in the form ' +
        'YYYY-MM-DD, or any string the platform parses.',
    )
  }
  return new Date(time)
}

/** One day of the month on show, and the items standing on it. */
type Day = { at: Date; items: CalendarItem[] }

/**
 * A month grid of scheduled items: a calendar for the month, and the items
 * standing on the days that have them.
 *
 * **The grid is `mini-calendar` and the Block composes it rather than drawing a
 * second one, and that is a decision about keyboard behaviour rather than about
 * dates.** That Component owns six things a hand-rolled month grid gets wrong and
 * gets wrong quietly: a roving tab stop so the grid is one stop rather than
 * forty-two, arrow keys that cross a month boundary, a `Home` and an `End` that go
 * to the ends of the row, a month name that is announced when the reader pages,
 * a weekday row formatted from the first week's own cells so a heading cannot
 * drift from the column it sits over, and a fixed six-week height so paging a
 * month does not move the dates out from under the pointer. A second grid in this
 * package that answered those differently is the failure `mini-calendar` exists to
 * prevent, and it is cheaper to have no second grid than to have two that agree.
 *
 * **The items are a day list beside the grid rather than marks inside its cells,
 * and the reason is what `mini-calendar` accepts.** That Component draws days: a
 * number in a cell, a button, and a fill when the day is chosen. It takes no
 * content per day, and adding a slot to a published Component for the sake of one
 * Block would be a change to a surface four products already compose, made in a
 * Block's name, which is the arrangement this repository keeps separate on
 * purpose. So the Block composes the grid for the month, the locale, the weekday
 * headings and the paging, and draws the month's items as a list grouped by day
 * beside it. That is also the better reading for a queue: the grid answers which
 * days have work on them and the list answers what is on Tuesday, and a reader
 * working a backlog wants the second answer more often than the first.
 *
 * **The cost of that arrangement is named rather than hidden.** A reader who wants
 * to know that the fifteenth has anything on it at all has to look at the list, and
 * the grid will not mark it, because marking it is the content-per-day slot this
 * Block does not have. A consumer who needs the mark composes their own
 * `MiniCalendar` beside this Block and passes the same `items` to both, and the two
 * views are the same array so they cannot disagree. A second cost is that the
 * grid's day buttons press and do nothing here: the grid is composed for the month
 * it shows and for its keyboard model, and this Block's `onSelect` is about items
 * rather than days, because a day and an item are two different things and a
 * callback that took both would be a callback nobody could type. A consumer that
 * wants a day press to do something renders their own grid and reads the month off
 * their own state.
 *
 * **The cap exists because a month grid with nine items on one day is a month grid
 * nobody can read, and the honest answer is to cap and say so rather than to
 * shrink the text until it is illegible.** Both halves are the decision. Six pixel
 * entries in a forty pixel cell are not a denser calendar, they are a calendar a
 * reader has given up on, and the reader who gives up is the one who then believes
 * the day was quiet. So `maxPerDay` draws three and the rest are named, in the
 * caller's own words, by a required `overflowLabel`. A cap that hides items with
 * no overflow control is a silent loss, which is the one failure a calendar may
 * not have: it would look finished when it is not.
 *
 * **The tone is the `Status` tone and the words are required with it.** The five
 * values are the Component's own set rather than a second vocabulary, so a caller
 * choosing one is choosing the dot that gets drawn, and there is nothing to
 * translate between two lists. What the Block refuses is to print the tone's own
 * name: `destructive` and `warning` are English, and a calendar is a screen people
 * read all day in a product that is very often not in English. So an item that
 * declares a tone must declare the words, and the run fails without them. The
 * rejected alternative was to print the tone's name as a fallback, and that is the
 * defect `check-block-copy.mjs` exists to end.
 *
 * **A day is a heading one level below the section, and the items are not
 * headings at all.** A month is a set of days and the days are the things a reader
 * navigates to, so they are headings at `childLevel(headingLevel)` and moving this
 * Block from an `h2` section to an `h3` one carries them with it. The items are
 * list items, because an item is either a link label or a button label and both are
 * the text of a control rather than the title of a section; a month of items
 * promoted into the outline is a list a reader navigating by heading has to walk
 * past to reach the next month.
 *
 * It is a client Component, and the reason is the month rather than the items: the
 * month on show is state that changes when the reader pages, and a server component
 * cannot re-render its own children. The items themselves are the caller's array
 * and the Block holds no copy of them. The cost is named: the grid and the whole
 * month list are in the client graph, so a calendar costs a consumer its own
 * JavaScript rather than none.
 */
export function Calendar01({
  eyebrow,
  title,
  description,
  month,
  defaultMonth,
  onMonthChange,
  locale,
  weekStartsOn,
  previousLabel,
  nextLabel,
  label,
  items,
  onSelect,
  maxPerDay = 3,
  overflowLabel,
  empty,
  headingLevel = 'h2',
  className,
}: CalendarBlock01Props) {
  const [ownMonth, setOwnMonth] = useState<Date | undefined>(defaultMonth)
  const shown = startOfMonth(month ?? ownMonth ?? new Date())
  const shownKey = `${shown.getFullYear()}-${shown.getMonth()}`
  const DayTitle = childLevel(headingLevel)

  for (const item of items) {
    if (item.state !== undefined && item.stateLabel === undefined) {
      throw new Error(
        `Calendar01: the item "${item.label}" on ${item.date} declares a tone and no stateLabel, so ` +
          'the mark beside it would be a coloured dot with no sentence beside it, which is invisible to a ' +
          'reader who cannot separate the tones. Pass the words for the state, or drop the tone.',
      )
    }
    if (item.href !== undefined && item.hrefLabel === undefined) {
      throw new Error(
        `Calendar01: the item "${item.label}" on ${item.date} declares an href with no hrefLabel, so ` +
          'the link would carry no words of its own. Pass the words that say what it does, or omit the href.',
      )
    }
  }

  /**
   * The month grouped by day, in date order.
   *
   * Keyed on the month rather than on the `Date` it was derived from, because a
   * `startOfMonth` call returns a new object on every render and a memo keyed on
   * it never holds. The grouping itself is a `Map` because a date is any string a
   * consumer wrote, and an object keyed by it would coerce.
   */
  const days: Day[] = useMemo(() => {
    const buckets = new Map<string, Day>()
    for (const item of items) {
      const at = parseDay(item.date)
      if (`${at.getFullYear()}-${at.getMonth()}` !== shownKey) continue
      const key = dayKey(at)
      const bucket = buckets.get(key)
      if (bucket === undefined) buckets.set(key, { at, items: [item] })
      else bucket.items.push(item)
    }
    return [...buckets.values()].sort((left, right) => left.at.getTime() - right.at.getTime())
  }, [items, shownKey])

  const dayHeading = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [locale],
  )

  function changeMonth(next: Date) {
    if (month === undefined) setOwnMonth(next)
    onMonthChange?.(next)
  }

  return (
    <Section data-slot="calendar-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="calendar-01-body" className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/*
          * The grid, with the month it shows handed in as a controlled value. The
          * Block holds the month rather than reading it back out of the grid,
          * because the day list beside it has to be filtered by the same month
          * and two sources of truth for one month is a list and a grid that
          * disagree.
          */}
        <MiniCalendar
          month={shown}
          onMonthChange={changeMonth}
          locale={locale}
          weekStartsOn={weekStartsOn}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          label={label}
          className="w-full shrink-0 lg:w-64"
        />

        <div data-slot="calendar-01-days" className="min-w-0 flex-1">
          {days.length === 0 ? (
            empty === undefined ? null : (
              <p data-slot="calendar-01-empty" className="text-muted-foreground text-pretty text-sm">
                {empty}
              </p>
            )
          ) : (
            <ul className="flex flex-col gap-6">
              {days.map((day) => {
                const visible = day.items.slice(0, maxPerDay)
                const held = day.items.length - visible.length
                return (
                  <li key={dayKey(day.at)} data-slot="calendar-01-day" className="flex flex-col gap-2">
                    {/*
                      The day as a heading, derived from the section's own level so
                      a month embedded one step deeper carries its days with it. A
                      hardcoded `h3` would be right exactly once.
                    */}
                    <DayTitle className="text-sm font-semibold">
                      {dayHeading.format(day.at)}
                    </DayTitle>

                    <ul className="flex flex-col gap-1.5">
                      {visible.map((item) => (
                        <li
                          key={item.id}
                          data-slot="calendar-01-item"
                          data-state={item.state}
                          className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1"
                        >
                          {activatorOf(item, onSelect)}

                          {item.state === undefined || item.stateLabel === undefined ? null : (
                            <Status size="sm" tone={item.state} label={item.stateLabel} />
                          )}

                          {item.href === undefined || item.hrefLabel === undefined ? null : (
                            <CtaLink href={item.href} variant="ghost" size="sm">
                              {item.hrefLabel}
                            </CtaLink>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/*
                      The overflow line, drawn whenever a day is holding items
                      back, because a day that looks complete and is not is the
                      one failure a calendar may not have. The words are the
                      caller's, since the sentence is theirs and the number alone
                      would say nothing about where the rest went.
                    */}
                    {held > 0 ? (
                      <p data-slot="calendar-01-overflow" className="text-muted-foreground text-xs">
                        {overflowLabel(held)}
                      </p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Section>
  )
}

/**
 * The control that opens one scheduled item, and the whole of the keyboard
 * question in this Block.
 *
 * A destination gives a native anchor, so the item is announced as a link and the
 * browser's own affordances all work on it. No destination gives a `Button`, which
 * is a real `<button>` with its focus ring and its coarse-pointer hit target
 * already solved. What neither arrangement is, is a `span` with an `onClick`: that
 * is not in the tab order at all, and a month whose every item is unreachable is a
 * month a keyboard user cannot read.
 */
function activatorOf(item: CalendarItem, onSelect?: (id: string) => void): ReactNode {
  if (item.href !== undefined) {
    return (
      <CtaLink
        data-slot="calendar-01-link"
        href={item.href}
        variant="ghost"
        size="sm"
        className="self-start"
      >
        {item.label}
      </CtaLink>
    )
  }
  if (onSelect === undefined) {
    return <span data-slot="calendar-01-label" className="text-sm">{item.label}</span>
  }
  return (
    <Button
      data-slot="calendar-01-select"
      type="button"
      variant="ghost"
      size="sm"
      className="self-start"
      onClick={() => onSelect(item.id)}
    >
      {item.label}
    </Button>
  )
}

export default Calendar01
