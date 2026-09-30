import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * The three units a scale can be drawn in, and the width of each in milliseconds.
 *
 * A month is the average one rather than the shortest, and the reason is that the
 * width is only ever used to divide a range into a number of ticks: a calendar
 * month is not a fixed number of milliseconds and any constant here is an average
 * of them. A tick that falls a day or two from the first of the month is a tick
 * in roughly the right place, and the exact dates are in the table.
 */
export type GanttScale = 'day' | 'week' | 'month'

/**
 * Where a bar is in its life, and the tone each of the three is drawn in.
 *
 * `blocked` is the destructive tone because it is the one a reader must not miss
 * and it is the reason a bar on a schedule is worth reading, `active` takes the
 * primary surface because it is the work in hand, and `done` takes the muted ink
 * because a finished bar is history and should look like it.
 */
export type GanttState = 'blocked' | 'active' | 'done'

/**
 * The tone each of the three states is drawn in, from the semantic contract and no
 * other.
 */
const STATE_TONE: Record<GanttState, StatusTone> = {
  blocked: 'destructive',
  active: 'info',
  done: 'success',
}

/**
 * The fill each state is drawn in, which is a different question from its tone.
 *
 * The tone is the dot beside the name, where the words are the information and the
 * colour is a support for them. The fill is the bar itself, and a bar is read by
 * its length and by which rows it lines up with, so a finished bar takes the
 * supporting ink: a row of dark bars at the top of a schedule is a row of work
 * that is over, and it should not be competing with the row of work that is not.
 * A bar with no state takes the primary surface, because saying nothing is the
 * neutral case and not an omission the reader has to decode.
 */
const STATE_FILL: Record<GanttState, string> = {
  blocked: 'bg-destructive',
  active: 'bg-primary',
  done: 'bg-muted-foreground',
}

const FILL_NONE = 'bg-primary'

/** How long one unit of each scale is, in milliseconds. */
const UNIT: Record<GanttScale, number> = {
  day: 86_400_000,
  week: 604_800_000,
  month: 2_629_800_000,
}

/**
 * The narrowest a bar may be drawn, as a percentage of the field.
 *
 * A task one day long inside a two-year range is under half a percent of the
 * field, which at a thousand pixels is four pixels of a row, and four pixels is a
 * speck a reader reads as a rendering fault rather than as a short task. The floor
 * makes it a visible mark. The cost is stated rather than hidden: a bar at the
 * floor is slightly longer than its true share of the range, so a reader
 * comparing two very short tasks against each other should read their exact
 * lengths from the table rather than from the field.
 */
const MIN_WIDTH = 0.5

/**
 * One task on a schedule: what it is, when it runs, how far along it is, and
 * where it is in its life.
 *
 * `name`, `start` and `end` are required, because a bar with no extent is not a
 * bar and a bar with no name is a rectangle. `progress` and `state` are optional
 * because a schedule is often drawn from a plan rather than from a report, and a
 * bar for planned work has neither.
 */
export type GanttTask = {
  /** The task's stable key within the schedule. */
  id: string
  /**
   * What the task is, in the words a reader would use about it.
   *
   * It is the row's name in the field, and it is the row head of the table behind
   * the figure, so a reader who cannot see the geometry at all still knows which
   * row each set of numbers belongs to. The Block does not make it a heading: a
   * schedule of forty tasks is read by scanning the names down a column, and forty
   * entries in the outline is a list a reader navigating by heading has to walk
   * past to reach anything else on the page.
   */
  name: string
  /**
   * When the task starts, in whichever of the three forms the caller holds it.
   *
   * A `Date`, epoch milliseconds, or a string the platform parses. A bare number
   * is milliseconds and nothing else, for the reason `relative-time` states: a
   * consumer who passes seconds gets 1970 and blames the library, which is a
   * mistake this Block cannot detect from the value.
   */
  start: string | number
  /** When the task ends, in the same three forms as `start`. */
  end: string | number
  /**
   * How much of the task is done, as a fraction between zero and one.
   *
   * Omitted for a bar that is drawn whole, which is the right state for planned
   * work and for a task whose progress the caller has not measured. The value is
   * clamped rather than refused, because a fraction of 1.2 from a division that
   * did not quite work is a figure to draw and not a reason to fail a page.
   */
  progress?: number
  /**
   * The words for the progress, given the fraction and the task's own name.
   *
   * Optional, and used only when `progress` is set, because the sentence is the
   * caller's and the number is the caller's. A fraction in a cell is a figure no
   * reader can act on; "two thirds of the way through" is a sentence they can, and
   * which of the two a progress figure should be depends on the product.
   */
  progressLabel?: (value: number, name: string) => string
  /** Where the task is in its life, and a judgement only the caller can make. */
  state?: GanttState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is set and the run fails without it, for the reason
   * the Component JSDoc on `Status` gives at length: a status with no words is a
   * coloured dot, and a coloured dot is invisible to a reader who cannot separate
   * the tones.
   */
  stateLabel?: string
  /** Where the task goes. Its presence makes the row carry a link. */
  href?: string
  /** The words on that link, and required whenever `href` is. */
  hrefLabel?: string
}

/**
 * The range the field is drawn over, in the same three forms as a task's dates.
 *
 * Both ends are required together, because a range with one end is not a range and
 * a bar positioned against an open end has nothing to be a fraction of.
 */
export type GanttRange = { from: string | number; to: string | number }

/**
 * The props a Gantt01 takes.
 *
 * Every string is a prop and the Block ships none. There is no task, no date, no
 * unit name, no state word and no sentence for an empty schedule, and the absence
 * of the second is the sharpest version of the rule: a schedule is a claim about
 * when a piece of work will be finished, and a Block that shipped one would be
 * publishing another product's plan.
 */
export type Gantt01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * A figure with no heading is a picture on a page, and this is the one Block in
   * this wave whose whole content is a picture.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The tasks, in the order a reader should meet them.
   *
   * Order is the caller's and the Block does not sort. A schedule is very often
   * already ordered by the thing that produced it, by start date or by a dependency
   * order the Block cannot see, and a Block that sorted by start would quietly
   * discard a sequence that meant something.
   */
  tasks: readonly GanttTask[]
  /**
   * The dates the field is drawn over.
   *
   * Omit it and the Block derives the range from the tasks themselves: the
   * earliest start and the latest end. That is the right default and it is the
   * reason a task which starts before every other task is not clipped, because
   * that task is what sets the left edge of the field. Pass it when the reader
   * needs to see empty time at either end, a quarter that has not started yet, or
   * a run that ends after the last task does, and in that case the range is the
   * claim the figure is making about the period on show.
   */
  range?: GanttRange
  /**
   * The unit the scale above the field is drawn in. @defaultValue 'week'
   *
   * A week is the default because it is the unit a plan is written in, and a plan
   * is what a schedule most often shows. Day and month are for a schedule being
   * read as a delivery window or as a programme of releases.
   */
  scale?: GanttScale
  /**
   * The moment to mark on the field, in the same three forms as a task's dates.
   *
   * Optional because a schedule is often historical or projected, in which case
   * there is no today on it to mark. When it is set the field carries a rule at
   * that position and the caller's `todayLabel` beside it, because an
   * unlabelled rule is a mark a reader has to be told the meaning of.
   */
  today?: string | number
  /**
   * The words for the rule that marks today, and required whenever `today` is
   * set. The run fails without it rather than drawing an unlabelled line, for the
   * reason it fails without a `stateLabel`: a mark with no words is a mark a
   * reader has to guess at.
   */
  todayLabel?: string
  /**
   * The words for one tick of the scale, given the unit and the tick's index from
   * zero.
   *
   * Required, and the reason is that a tick label is a sentence about a position
   * on a range: "1 September", "Week 36", "Q3", "semaine 36". A Block that
   * formatted those itself would have chosen a locale, and this package has no
   * locale to choose: it is a token pipeline and a component library, and the
   * components that do format dates are the ones that were given a `locale` prop
   * to do it with. So the caller writes the formatter and this Block asks it once
   * per tick.
   *
   * The `unit` is a parameter rather than a closure over `scale` for a reason that
   * is only visible from the call site: a caller who changes `scale` in one place
   * and forgets the formatter in another gets a fortnight of dates labelled as
   * weeks. Taking the unit as an argument means the formatter is told what it is
   * formatting on every call.
   */
  scaleLabel: (unit: GanttScale, count: number) => string
  /**
   * The figure's accessible name, and the only name the geometry carries.
   *
   * Required rather than defaulted, for the reason `Chart` states: two schedules
   * on one page are two figures a reader cannot tell apart, and a figure named
   * "Chart" is a Block shipping a sentence about a product it knows nothing
   * about. It is also the caption of the table behind the figure, so the numbers
   * are announced with the same name the picture is.
   */
  label: string
  /**
   * What the Block renders in place of the figure when there are no tasks.
   *
   * Required and a node, for the reason it is required on every Block here: a
   * schedule with nothing on it is a claim, and "nothing is planned" is a
   * different claim in a product that is between releases and in a product whose
   * plan failed to load.
   */
  empty: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * A moment as a number of milliseconds, or a refusal.
 *
 * The refusal is the whole of the function. A value this cannot read would place a
 * bar at a position derived from `NaN`, which renders as a bar with no width on a
 * schedule that looks finished, and a caller would have no way of telling the
 * broken row from a task that is genuinely zero-length. The diagnostic reaches a
 * developer in a console and never a reader, which is the opposite of copy.
 */
function at(value: string | number): number {
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) {
    throw new Error(
      'Gantt01: a start, an end, a range end or today was not a date the platform can read, so there is no ' +
        'position to draw it at. Pass a Date, epoch milliseconds, or a string the platform parses.',
    )
  }
  return time
}

/** A moment as the machine reading, which is what the table behind the figure carries. */
function machine(value: string | number): string {
  return new Date(at(value)).toISOString()
}

/** A position on the field as a percentage, held inside the field. */
function shareOf(time: number, from: number, span: number): number {
  return Math.min(100, Math.max(0, ((time - from) / span) * 100))
}

/**
 * A time-banded schedule: a column of task names, a field of bars positioned
 * against a range of dates, a scale above and a rule for today.
 *
 * **The bars are in their final positions at first paint, and that is what makes
 * reduced motion cost the reader nothing.** There is no draw-in, no bar that grows
 * from nothing, no scroll effect and no entrance, and the reason is the motion
 * law rather than a preference: DESIGN.md refuses entrance animation outright on
 * the grounds that a reader who did not ask for a thing moving is owed a page
 * that is still. A schedule is the case where that is most obviously right, because
 * a bar that arrives is a bar whose arrival a reader has to wait for before they
 * can read the relationship it has with the bar above it, and the whole claim of a
 * Gantt is that relationship. So every bar's geometry is arithmetic over props,
 * evaluated during the render, and a reader with motion turned off, a crawler, a
 * print stylesheet and a browser that never runs an animation all get the same
 * complete figure.
 *
 * **The geometry comes from the range rather than from the widest bar, and that
 * is the other half of why the figure is correct.** The two decisions are the same
 * decision. A field sized to its own content would put the left edge of the figure
 * at the earliest bar that happens to be there, so a task that starts before every
 * other task would be drawn hanging off the left of its own chart, clipped by the
 * field, and a reader would see a short bar where the truth is a long one. So the
 * field is a range: the caller's, or the earliest start and the latest end of the
 * tasks, and every bar is a fraction of it. A bar that falls outside a range the
 * caller passed is clipped at the edge rather than pushing the field wider, and the
 * table behind the figure carries its true dates, which is the answer for a bar
 * that has to be read exactly.
 *
 * **The table behind the figure is the same rule `sparkline` and `chart` follow,
 * and it is why the bars are `aria-hidden`.** Everything a schedule draws is a
 * position, and a position is the one thing a screen reader, a crawler and a print
 * stylesheet cannot read: a screen reader given a figure full of rectangles is
 * read a list of nothing, and a crawler sees the field and no dates at all. So the
 * same tasks are rendered as a table in a visually hidden wrapper, generated from
 * the same array the bars were drawn from, which means there is no second copy to
 * fall behind. The cost is real and worth naming: a table of every task in the
 * document for a figure that is a few hundred pixels tall, which is the same cost
 * `sparkline` pays and accepts for the same reason.
 *
 * **The table has no column headings, and that is a gap with a reason rather than
 * an oversight.** `Sparkline` states the reasoning and this Block inherits it
 * whole: this Block has no words for what a start is called, and inventing "Start"
 * and "End" and "Progress" would be a claim about the caller's plan, in a package
 * whose rule is that every such word is a prop. The row head is the task's own
 * name, the caption is the caller's own `label`, and the cells carry the caller's
 * own words wherever there are any. A caller who needs a visible table with named
 * columns is looking for `DataTable01`, which is that surface.
 *
 * **The date cells carry the machine reading in the mono face, and the reason is
 * that this Block has no locale to format with.** `relative-time` and
 * `mini-calendar` both format dates and both take a `locale` to do it in, because
 * they were given one. This Block was not, and adding a `locale` prop here would
 * mean choosing a default for it, which is a decision about somebody's product
 * made in a design system. So the cell carries the ISO 8601 reading, set in the
 * mono face because a timestamp is machine notation and that is what the mono stack
 * is for in this repository, and the axis above carries the caller's own words for
 * the same instants. The cost is that a reader meeting the table first hears a
 * timestamp rather than a date, which is readable and is checkable and is in the
 * reader's language in no case.
 *
 * **The scale is one tick per unit with no cap, and the labels are the caller's
 * because the collision is theirs to solve.** A day scale over two years is seven
 * hundred and thirty ticks, and the Block draws all of them: a Block that dropped
 * ticks to fit would be hiding marks the reader can see and leaving the reader to
 * assume the scale is regular, which it then is not. The labels are the caller's
 * string, so a caller whose range needs shorter labels writes a shorter formatter
 * and every problem on that axis goes away at once, which is the same lever this
 * package offers everywhere else. The cost is named: a caller who returns a long
 * written date for every tick of a long range will find the labels touching, and
 * the answer is in their formatter rather than in the Block's layout.
 *
 * It is a server Component: no hook, no state, no effect and no router. The whole
 * figure is arithmetic over props, so a schedule costs a consumer nothing in
 * client JavaScript and reads identically with scripting off.
 */
export function Gantt01({
  eyebrow,
  title,
  description,
  tasks,
  range,
  scale = 'week',
  today,
  todayLabel,
  scaleLabel,
  label,
  empty,
  headingLevel = 'h2',
  className,
}: Gantt01Props) {
  if (today !== undefined && todayLabel === undefined) {
    throw new Error(
      'Gantt01: today was set and no todayLabel, so the field would carry a rule with nothing to say what ' +
        'it marks. Pass the words for it, or drop the rule.',
    )
  }
  for (const task of tasks) {
    if (task.state !== undefined && task.stateLabel === undefined) {
      throw new Error(
        `Gantt01: the task "${task.name}" declares a state and no stateLabel, so the mark beside its name ` +
          'would be a coloured dot with no sentence beside it. Pass the words for the state, or drop the ' +
          'state.',
      )
    }
    if (task.href !== undefined && task.hrefLabel === undefined) {
      throw new Error(
        `Gantt01: the task "${task.name}" declares an href with no hrefLabel, so the link would carry no ` +
          'words of its own. Pass the words that say what it does, or omit the href.',
      )
    }
  }

  if (tasks.length === 0) {
    return (
      <Section data-slot="gantt-01" className={cn(className)}>
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-8"
        />
        <p data-slot="gantt-01-empty" className="text-muted-foreground text-pretty">
          {empty}
        </p>
      </Section>
    )
  }

  /*
   * The range, and the two halves of why it is a range rather than a measurement
   * of the bars. The left edge comes from the earliest start the tasks have, so a
   * task that begins before all the others is inside the field rather than hanging
   * off the left of it, and the right edge from the latest end, so a bar is never
   * truncated by its own chart.
   */
  const bounds = tasks.map((task) => [at(task.start), at(task.end)] as const)
  const from = range === undefined ? Math.min(...bounds.map((pair) => pair[0])) : at(range.from)
  const to = range === undefined ? Math.max(...bounds.map((pair) => pair[1])) : at(range.to)
  const span = to - from
  if (!(span > 0)) {
    throw new Error(
      'Gantt01: the range runs from the same moment to itself, so every bar would be a fraction of nothing ' +
        'and the field would be a line. Pass a range that covers the work, or a task whose end is after its ' +
        'start.',
    )
  }

  const rows = tasks.map((task) => {
    const start = at(task.start)
    const end = at(task.end)
    const left = shareOf(start, from, span)
    return {
      task,
      start,
      end,
      left,
      // Clamped to the field, so a bar that runs past the right edge stops at the
      // edge rather than drawing over the row above it, and floored so a task one
      // day long in a two-year range is a mark rather than a speck.
      width: Math.max(MIN_WIDTH, Math.min(100 - left, shareOf(end, from, span) - left)),
    }
  })

  const ticks = Math.floor(span / UNIT[scale]) + 1
  const todayAt = today === undefined ? null : shareOf(at(today), from, span)

  return (
    <Section data-slot="gantt-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-8"
      />

      <figure
        data-slot="gantt-01-figure"
        aria-label={label}
        className="border-border overflow-hidden rounded-xl border"
      >
        {/*
         * The sideways region, for the same reason a board scrolls and a table
         * does. A schedule of names and bars needs more width than a phone has, and
         * the alternative is a figure whose bars are eight pixels long and whose
         * names are truncated to two words, which is a picture of nothing.
         */}
        <div className="overflow-x-auto p-4">
          <div className="flex gap-4">
            <div className="w-48 shrink-0">
              {/*
               * An empty cell above the first row, so the names start level with
               * the bars and not one row below them. The two columns line up
               * because every row is the same authored height rather than because
               * anything measures the other one.
               */}
              <div className="h-8" />
              {tasks.map((task) => (
                <div
                  key={task.id}
                  data-slot="gantt-01-name"
                  className="border-border flex h-10 flex-col justify-center gap-0.5 border-t"
                >
                  <span className="truncate text-sm font-medium">{task.name}</span>
                  {task.state === undefined || task.stateLabel === undefined ? null : (
                    <Status size="sm" tone={STATE_TONE[task.state]} label={task.stateLabel} />
                  )}
                </div>
              ))}
            </div>

            <div data-slot="gantt-01-field" className="relative min-w-96 flex-1">
              <div data-slot="gantt-01-scale" className="relative h-8">
                {Array.from({ length: ticks }, (_, index) => {
                  const here = shareOf(from + index * UNIT[scale], from, span)
                  return (
                    <span
                      key={index}
                      data-slot="gantt-01-tick"
                      className={cn(
                        'text-muted-foreground absolute bottom-0 text-xs whitespace-nowrap',
                        // The first label is pinned to its tick and the last is
                        // pinned to the other side of it, so neither hangs off the
                        // field, and every label between them is centred on its own
                        // tick.
                        index === 0 ? null : index === ticks - 1 ? '-translate-x-full' : '-translate-x-1/2',
                      )}
                      style={{ left: `${here}%` }}
                    >
                      {scaleLabel(scale, index)}
                    </span>
                  )
                })}

                {todayAt === null ? null : (
                  <span
                    data-slot="gantt-01-today"
                    className={cn(
                      'text-foreground absolute bottom-4 text-xs font-medium whitespace-nowrap',
                      todayAt >= 80
                        ? '-translate-x-full'
                        : todayAt < 20
                          ? null
                          : '-translate-x-1/2',
                    )}
                    style={{ left: `${todayAt}%` }}
                  >
                    {todayLabel}
                  </span>
                )}
              </div>

              <div className="relative">
                {/*
                 * The grid, drawn once for the whole field rather than once per
                 * row, because it is the same set of vertical rules and drawing
                 * it twice is a second copy to keep in step with the first.
                 */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  {Array.from({ length: ticks }, (_, index) => (
                    <span
                      key={index}
                      className="bg-border absolute inset-y-0 w-px"
                      style={{ left: `${shareOf(from + index * UNIT[scale], from, span)}%` }}
                    />
                  ))}
                </div>

                {todayAt === null ? null : (
                  <span
                    aria-hidden="true"
                    data-slot="gantt-01-today-rule"
                    className="bg-foreground absolute inset-y-0 w-px"
                    style={{ left: `${todayAt}%` }}
                  />
                )}

                {rows.map((row) => {
                  const fill =
                    row.task.state === undefined ? FILL_NONE : STATE_FILL[row.task.state]
                  const progress =
                    row.task.progress === undefined
                      ? null
                      : Math.min(1, Math.max(0, row.task.progress))
                  return (
                    <div
                      key={row.task.id}
                      data-slot="gantt-01-row"
                      data-state={row.task.state}
                      className="border-border relative h-10 border-t"
                    >
                      {/*
                        The bar, and the whole of it is `aria-hidden` because the
                        table behind the figure carries the same rows as numbers. A
                        bar that announced itself would be announced as a rectangle,
                        which is the announcement a screen reader gives a `<div>`.
                      */}
                      <span
                        aria-hidden="true"
                        data-slot="gantt-01-bar"
                        className="bg-muted absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
                        style={{ left: `${row.left}%`, width: `${row.width}%` }}
                      >
                        <span
                          data-slot="gantt-01-fill"
                          className={cn('absolute inset-y-0 left-0 rounded-full', fill)}
                          style={{ width: `${progress === null ? 100 : progress * 100}%` }}
                        />
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/*
          The same rows as numbers, generated from the same array the bars came
          from so the two cannot disagree. See the JSDoc for why it has no column
          headings and why the date cells carry the machine reading.
        */}
        <div data-slot="gantt-01-table" className="sr-only">
          <Table>
            <TableCaption>{label}</TableCaption>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableHead scope="row" className="font-medium">
                    {task.name}
                  </TableHead>
                  <TableCell className="font-mono text-xs">{machine(task.start)}</TableCell>
                  <TableCell className="font-mono text-xs">{machine(task.end)}</TableCell>
                  {task.progress === undefined ? null : (
                    <TableCell>
                      {task.progressLabel?.(task.progress, task.name) ?? task.progress}
                    </TableCell>
                  )}
                  {task.state === undefined || task.stateLabel === undefined ? null : (
                    <TableCell>{task.stateLabel}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </figure>

      {/*
       * The link row, below the field and outside the figure, so the geometry is
       * not claiming to be part of the destination list and the reader meets the
       * links after the picture rather than inside it.
       */}
      {tasks.some((task) => task.href !== undefined) ? (
        <ul data-slot="gantt-01-links" className="mt-4 flex flex-wrap gap-3">
          {tasks.map((task) =>
            task.href === undefined || task.hrefLabel === undefined ? null : (
              <li key={task.id}>
                <CtaLink href={task.href} variant="ghost" size="sm">
                  {task.hrefLabel}
                </CtaLink>
              </li>
            ),
          )}
        </ul>
      ) : null}
    </Section>
  )
}

export default Gantt01
