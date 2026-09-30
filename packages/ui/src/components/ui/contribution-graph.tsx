import type { ComponentProps } from 'react'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableRow } from './table'
import { cn } from '../../lib/utils'

/**
 * The five steps of the intensity scale, from an absent day to a full one.
 *
 * A five-step scale and not a continuous ramp, and the reason is that a reader
 * has to compare two squares at a glance. A continuous scale is smoother and
 * unreadable: the difference between a Tuesday and the Wednesday beside it is a
 * few percent of opacity, which is nothing to see, while the difference between
 * step two and step three is a band the eye can sort without being told what the
 * bands mean. Five is also the number the eye can rank in a column without
 * counting, and a heat grid is read by scanning columns.
 */
export type ContributionLevel = 0 | 1 | 2 | 3 | 4

/**
 * The fill each level is drawn in.
 *
 * Level zero is the empty cell, and it is the `muted` surface rather than a pale
 * primary, so "nothing here" is visibly a different thing from "a little here".
 * The other four are the same `primary` role at four alpha steps, so the scale
 * is one token at four strengths and moves as a unit when the pack does. The
 * alternative was a ramp of five authored colours, and that would have been a
 * second set of colour tokens for a scale the alpha modifier already expresses.
 */
const LEVEL_FILL: Record<ContributionLevel, string> = {
  0: 'bg-muted',
  1: 'bg-primary/25',
  2: 'bg-primary/50',
  3: 'bg-primary/75',
  4: 'bg-primary',
}

/** Milliseconds in a day, which is the unit a calendar is counted in. */
const DAY = 86_400_000

/** The shape of a caller's day key, checked rather than assumed. */
const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * The default bucketing: quartiles of the largest count in the window.
 *
 * A caller that pre-normalises has two chances to get the scale wrong, and a
 * mislabelled axis is a lie with a typeface on it, which is the reason
 * `PulseSeries` gives for taking raw magnitudes and scaling them against the
 * tallest column. So this takes a count and the maximum the Component worked out
 * from the days it drew, and the caller never divides anything. A count of zero
 * or less is level zero whatever the maximum is, because a negative count is not
 * a quiet day, it is data that is wrong, and this Component has no level to put
 * that in.
 */
function quartiles(count: number, max: number): ContributionLevel {
  if (!(count > 0)) return 0
  if (!(max > 0)) return 4
  const share = count / max
  if (share <= 0.25) return 1
  if (share <= 0.5) return 2
  if (share <= 0.75) return 3
  return 4
}

/**
 * A caller's day key as a count of days from the epoch, or `null` for a key the
 * calendar does not have.
 *
 * The round trip is checked rather than trusted, because `Date.UTC` accepts a
 * 31st of February and hands back the 3rd of March, so a key that names a day
 * that does not exist would be drawn on the wrong cell and the graph would be
 * quietly wrong in a way no reader could see. Returning `null` lets the caller
 * refuse the whole set rather than move one square onto a day it was not
 * reported for.
 */
function epochDayOf(key: string): number | null {
  const parts = DAY_KEY.exec(key)
  if (parts === null) return null
  const at = Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
  return new Date(at).toISOString().slice(0, 10) === key ? Math.floor(at / DAY) : null
}

/** Which day of the week a day count names, with Sunday as zero. */
function weekdayOf(day: number): number {
  // The epoch was a Thursday, which is four days past Sunday, so adding four and
  // taking the remainder counts from Sunday without a lookup table.
  return (((day + 4) % 7) + 7) % 7
}

/** The props the ContributionGraph accepts. */
export interface ContributionGraphProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * One entry per day, keyed by its own date.
   *
   * `date` is a `YYYY-MM-DD` key because that is the key a collector stores and
   * the one a database index is on, so the caller passes what it already has
   * rather than a second shape this Component would have to convert. The array
   * is in any order: each day is placed by its own key, so a collector that
   * returns newest first draws the same grid as one that returns oldest first.
   *
   * A day with a count of zero is a day the caller looked and found nothing. A
   * day that is not in the array at all is a day nobody reported, and the two are
   * drawn the same way and must be, because there is no third state to draw.
   */
  days: readonly { date: string; count: number }[]
  /**
   * The name of the figure, read before the grid and captioned on the table.
   *
   * Required rather than defaulted, for the two reasons `ChartFrame` states: two
   * heat grids on a page are two figures a reader cannot tell apart, and a
   * picture with no name is neither announced nor linkable. A figure named
   * "Chart" is a Component shipping a sentence about a product it knows nothing
   * about.
   */
  label: string
  /**
   * The accessible name of one day's square, given the day.
   *
   * Required, and it is the one prop here that is a function rather than data,
   * because it is the one thing Prism cannot compose. "4 contributions on 1
   * March 2026" is a sentence in a language and a calendar, and a design system
   * that wrote it would put English and a Gregorian month name into every
   * consumer's product, in a figure that is otherwise entirely the caller's. The
   * day is passed whole so the caller can say as much or as little as its own
   * words need, and can reach for a translated month or a relative phrase.
   *
   * A day the caller did not report is never named, because there is nothing to
   * name: an absence is not a zero and not a row.
   */
  dayLabel: (day: { date: string; count: number }) => string
  /**
   * How many week columns to draw. @defaultValue 26
   *
   * Half a year, which is the range a contribution graph is read at when the
   * question is "do I keep going" rather than "what did last Tuesday look like".
   * The window is the most recent `weeks` weeks ending with the latest day given,
   * so a day older than the window is not drawn rather than pushing everything
   * else out of view. A grid whose window slid to fit every day would move under
   * the reader every time a collector caught up.
   */
  weeks?: number
  /**
   * Which day each row starts on. @defaultValue 1
   *
   * Zero for Sunday and one for Monday, and it is a prop because the caller's
   * week is not the design system's: a grid that started on Monday when the
   * product's week starts on Sunday puts a Saturday in the row above a Monday
   * and the reader has to work that out before they can read anything. The
   * default is Monday because that is the first day ISO 8601 names, and it is
   * overridable for exactly the reason it is right most of the time.
   */
  weekStartsOn?: 0 | 1
  /**
   * How a count becomes a level, given the count and the largest count drawn.
   *
   * The default is quartiles of the maximum, and the reason is stated in full on
   * the helper above: a caller that pre-normalises has two chances to get the
   * scale wrong. A caller with a real reason to bucket differently, a log
   * distribution where the top day is a hundred times the median, a set where
   * zero means something other than nothing, passes one function and gets a
   * scale nobody else has to explain.
   */
  levelFor?: (count: number, max: number) => ContributionLevel
}

/**
 * A calendar of days, one square each, filled by how much happened on it.
 *
 * **The scale is the caller's counts and this Component's arithmetic.** The
 * caller passes counts and the Component works out the largest count in the
 * window and buckets against it, because a caller that pre-normalises has two
 * chances to get the scale wrong and a mislabelled scale is a lie with a
 * typeface on it. That is the reasoning `PulseSeries` states for its columns and
 * the reason this Item is not a prop called `max` the caller had to divide by.
 * The cost is named rather than hidden: quartiles of the maximum put most squares
 * at level one or two when one day is an outlier, because that is what quartiles
 * of an outlier are. A caller with a distribution like that passes `levelFor` and
 * the cost goes away.
 *
 * **The maximum is taken from the days that are drawn, not from every day given.**
 * A day that falls outside the window is neither drawn nor tabulated, and letting
 * one into the maximum would stretch the scale around a square that is not in the
 * picture, which is the quietest way a chart can be wrong. That is the rule
 * `ChartFrame` states for a value past the end of its categories.
 *
 * **The four filled levels are one token at four strengths, never five
 * colours.** `primary` at a quarter, a half, three quarters and full, over a
 * `muted` empty cell. A ramp of five authored colour tokens would have been a
 * second set of colour roles for a scale the alpha modifier already expresses, and
 * it would not have moved with a scoped pack boundary the way an alpha step on one
 * semantic role does. The cost is that the five steps are the same hue, so the
 * grid reads as intensity rather than as categories, which is what a calendar of
 * activity should read as.
 *
 * **A day the caller did not report is an absence, not a zero, and the two look
 * the same on purpose.** Both are the empty cell, because there is no third
 * drawing available: a hole in the grid would imply something happened, and a
 * zero-filled cell for an unreported day would claim a measurement nobody made.
 * The difference survives where it matters, in the table, where an unreported day
 * has no row at all and a reported zero has a row reading zero. A short `days`
 * array therefore leaves the leading weeks of the window empty rather than
 * compressing the days it has, because a compressed grid is a grid whose cells no
 * longer mean days.
 *
 * **Each square is named by the caller and the numbers are also in a table.** The
 * squares carry `dayLabel` rather than a name this Component composed, because a
 * composed name is a sentence in English and a Gregorian month. The counts are
 * additionally rendered as a visually hidden table from the same array, so a
 * screen reader's table navigation can reach a number directly and a crawler
 * indexing the page finds the figures. The table has one row per reported day, its
 * row head is the caller's own date key and its caption is the caller's own label;
 * it has no column heading, because this Item has no word for "count" that is true
 * in the caller's domain and inventing one would be a claim.
 *
 * The cost of naming every square is that a screen reader meets one stop per day
 * before it reaches the table, which is a lot of stops for a hundred and eighty-two
 * squares. That is the trade this design makes, and it is the same trade
 * `ContributionGraph`'s table makes in the other direction: the grid answers "which
 * days", the table answers "how many".
 *
 * It is a server Component. The window is arithmetic over props, there is no
 * clock to read and no state to hold, so a contribution graph on a static page
 * costs no client code.
 */
function ContributionGraph({
  className,
  days,
  label,
  dayLabel,
  weeks = 26,
  weekStartsOn = 1,
  levelFor = quartiles,
  ...props
}: ContributionGraphProps) {
  const given = days.map((day) => {
    const at = epochDayOf(day.date)
    if (at === null) {
      throw new Error(
        `ContributionGraph: a day is keyed '${day.date}', which is not a YYYY-MM-DD date the ` +
          'calendar has, so there is no cell to draw it in. Pass the key your collector stores, and ' +
          'a day the calendar does not have is a bug in the collector rather than a square to move.',
      )
    }
    return { day, at }
  })

  // A nonsense `weeks` gets a floor of one rather than an empty grid, because an
  // empty grid is a figure with nothing in it and this Component already refuses
  // to draw one of those on the Sparkline.
  const columns = Math.max(1, Math.floor(weeks))

  // The window is the most recent `columns` weeks ending with the latest day
  // given, so the caller's data fills the right-hand edge rather than the left.
  // With no days at all the anchor is the epoch, which draws `columns` empty weeks
  // rather than a special case, because an empty window and a window with nothing
  // in it are the same picture.
  const latest = given.length === 0 ? 0 : Math.max(...given.map((entry) => entry.at))
  const first = latest - (((weekdayOf(latest) - weekStartsOn + 7) % 7) + (columns - 1) * 7)

  const byDay = new Map(given.map((entry) => [entry.at, entry.day] as const))
  const drawn = given.filter((entry) => entry.at >= first)
  const max = drawn.length === 0 ? 0 : Math.max(...drawn.map((entry) => entry.day.count))

  const cells = Array.from({ length: columns * 7 }, (_, index) => {
    const at = first + index
    const day = byDay.get(at)
    return { at, day, level: day === undefined ? 0 : levelFor(day.count, max) }
  })

  return (
    <div
      data-slot="contribution-graph"
      role="group"
      aria-label={label}
      className={cn('flex w-full flex-col gap-2', className)}
      {...props}
    >
      {/*
        Columns are flex children and days are rows inside them, rather than a
        CSS grid with an explicit column count, so a `weeks` the caller chose and
        a `weeks` the grid drew cannot disagree, and a cell is never skipped to
        make the arithmetic come out. The row scroller is on the wrapper because a
        narrow screen has to reach the recent weeks, which are on the right.
      */}
      <div data-slot="contribution-weeks" className="w-full overflow-x-auto pb-1">
        <div data-slot="contribution-grid" className="flex gap-1">
          {Array.from({ length: columns }, (_, column) => (
            <div key={column} data-slot="contribution-week" className="flex flex-col gap-1">
              {cells.slice(column * 7, column * 7 + 7).map((cell) => (
                <span
                  key={cell.at}
                  data-slot="contribution-day"
                  data-date={cell.day?.date}
                  data-level={cell.level}
                  // A square is a picture of a day rather than text, so it takes
                  // the image role and the caller's own name for that day. An
                  // unreported day is hidden instead, because there is nothing
                  // to name and an absence has no row in the table either.
                  role="img"
                  aria-label={cell.day === undefined ? undefined : dayLabel(cell.day)}
                  aria-hidden={cell.day === undefined ? true : undefined}
                  className={cn('size-3 shrink-0 rounded-sm', LEVEL_FILL[cell.level])}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/*
        The counts, from the same `days` array the squares were drawn from, so
        the two cannot disagree. A day outside the drawn window is not tabulated
        either, for the reason the maximum ignores it.
      */}
      <div data-slot="contribution-table" className="sr-only">
        <Table>
          <TableCaption>{label}</TableCaption>
          <TableBody>
            {drawn.map((entry) => (
              <TableRow key={entry.day.date}>
                <TableHead scope="row" className="font-mono font-normal">
                  {entry.day.date}
                </TableHead>
                <TableCell className="tabular-nums">{entry.day.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export { ContributionGraph }
