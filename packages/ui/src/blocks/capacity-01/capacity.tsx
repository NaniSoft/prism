import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * The four states a resource can be in, and the tone each one draws.
 *
 * **Four, and they are the four answers to "is there room left", which is the only
 * question a capacity table asks.** `healthy` is room, `tight` is little room,
 * `exhausted` is none, and `unknown` is a resource the estate cannot measure. That
 * last one is the state most likely to be missing from a union someone else wrote,
 * and it is the one a capacity screen most needs: a collector that is not
 * reporting leaves a figure that is either stale or absent, and a table that draws
 * an absent figure as a zero is a table claiming an estate is full. So the honest
 * answer is a state that says nothing, drawn `neutral` so it reads as a state with
 * no alarm in it rather than as a fault.
 *
 * The tones are the shared ones, and the mapping is the one `MeterTone` refuses to
 * make on a caller's behalf, done here once and stated: this Block can see the
 * numbers and it cannot see whether the numbers are urgent. A disk at ninety per
 * cent is `tight` on a development estate and `exhausted` on a customer's, and the
 * number does not know which one the reader is looking at. The words beside the dot
 * are the caller's for exactly that reason, and a row with no state asserts
 * nothing at all, which is the honest default and is drawn as no mark.
 */
export type CapacityState = 'healthy' | 'tight' | 'exhausted' | 'unknown'

/**
 * The tone each state is drawn in, from the semantic contract and no other.
 *
 * `exhausted` is the only `destructive` here, and it is worth saying why the other
 * three are not, because a capacity table is the surface most tempted to paint
 * everything that is not green in red. `tight` is `warning` because little room is
 * a thing to attend to rather than a breakage, and a table of forty resources with
 * four of them in red sends a reader looking for four incidents and finds four
 * numbers. `unknown` is `neutral` because a resource that cannot be measured is not
 * a fault; it is a gap, and painting a gap red teaches a reader to ignore red for
 * the things that are urgent.
 */
const STATE_TONE: Record<CapacityState, StatusTone> = {
  healthy: 'success',
  tight: 'warning',
  exhausted: 'destructive',
  unknown: 'neutral',
}

/**
 * The seven cells a capacity row can hold.
 *
 * A closed set, and the closure is the point, for the reason `RetentionColumnId`
 * gives: the cells are this Block's, so a column naming an eighth would be a
 * column with nothing to put in it. The names above them are the caller's, which is
 * the other half of the same thing. A capacity table has one column whose name is
 * genuinely worth arguing over, the remaining column, and a product that calls it
 * "Free" and a product that calls it "Available" and a product that calls it
 * "Headroom" are describing the same figure with three different words, and a
 * product that calls it "Quota left" has meant something slightly different by it.
 */
export type CapacityCell =
  | 'resource'
  | 'kind'
  | 'committed'
  | 'limit'
  | 'remaining'
  | 'state'
  | 'href'

/**
 * One column of a capacity table: which cell it draws, and the words above it.
 *
 * A cell id rather than a renderer, for the reason the closure above gives: the
 * cells are this Block's so that a capacity table reads the same in every consumer,
 * and only the words travel. A column that took a renderer would be a table the
 * caller drew, and this Item would be a bordered `div`.
 */
export type CapacityColumn = {
  /** Which of the seven cells this column draws. */
  id: CapacityCell
  /** The column's name, in the caller's own words. */
  header: ReactNode
  /** Layout only: a width, or an alignment. Applied to the head and every cell. */
  className?: string
}

/**
 * One resource on an estate: what it is, what has been committed against it, what
 * the limit is, what is left, and how it stands.
 *
 * **The three figures are three props and the Block subtracts nothing, and that is
 * the important sentence in this file.** A design system that computed the third
 * from the first two would be asserting an arithmetic fact about an estate it
 * cannot see. An estate has overcommit, a burst allowance, a soft limit nobody
 * enforces, a quota reserved for a team that has not been created yet, a figure
 * that is a rolling average rather than an instant, and a limit that changed ten
 * minutes ago while the committed figure did not. A Block that added them up would
 * be choosing between those relationships without knowing any of them, and the
 * number it printed would be a claim about somebody's infrastructure that the
 * reader has no way to check. Worse, it would be wrong quietly: a capacity screen
 * whose arithmetic disagrees with the product's is a screen that makes a reader
 * distrust every other number on it, and the numbers on this surface are the ones
 * people act on. So the caller states the relationship and this Block draws three
 * figures that the caller has already made agree.
 *
 * Each figure is optional, and its absence is meaningful rather than a gap. A
 * resource with no `limit` is a resource nobody has bounded, which on a shared
 * estate is common and on a metered one is impossible. A resource with no
 * `remaining` is one the estate cannot measure, which is exactly what `state:
 * 'unknown'` is for. A resource with only a `committed` figure is a thing in use
 * with no stated ceiling. All three are real states, and the Block draws an empty
 * cell for each rather than a zero, because a zero beside "Remaining" is a claim
 * that an estate is full.
 */
export type CapacityRow = {
  /** A stable key for the row, carried on the markup as `data-capacity`. */
  id: string
  /**
   * What the resource is, in the caller's own words.
   *
   * The anchor of the row and the row header the table announces with it, so a
   * reader who lands on the remaining figure is told which resource it belongs to.
   * A short noun phrase: the column is scanned down its left edge, and a resource
   * that wraps to two lines is a row whose figures sit below their neighbours'.
   */
  resource: string
  /**
   * The kind of thing it is, in the product's own vocabulary: a pool, a tier, a
   * bucket, a quota.
   *
   * Optional, and a row with no kind is a resource the product has chosen not to
   * categorise, which is a statement and not a formatting gap.
   */
  kind?: string
  /**
   * How much of it has been committed.
   *
   * A number and nothing else. See the type's own JSDoc for the whole of why the
   * third figure is not derived from this one: the relationship between the three
   * is the caller's and the Block cannot see it.
   */
  committed?: number
  /** The limit, in the same unit as `committed`. A number and nothing else. */
  limit?: number
  /**
   * How much of it is left, in the same unit, as the caller's own arithmetic.
   *
   * **Never computed from `limit` and `committed`, and the reason is on this
   * type.** A capacity screen whose arithmetic disagrees with the product's is a
   * screen that makes a reader distrust every other number on it.
   */
  remaining?: number
  /**
   * What the three figures count, in the caller's own words and grammar: nodes,
   * gigabytes, seats, requests per minute.
   *
   * A string and not a number, because a capacity figure is very rarely a bare
   * number. "Nodes", "GB of capture" and "10k rows" are three products' decisions,
   * and a `number` here would make two of them impossible. It is separate from the
   * figures so the column heading can be the product's noun while each row's
   * reading is the caller's sentence.
   */
  unit?: string
  /**
   * The sentence a figure is announced as, given the unit and the value.
   *
   * Optional in the type and required in practice whenever a row carries a `unit`
   * that is not the column's own heading, and the run throws without it. A bare
   * numeral beside a resource name tells a screen reader nothing about what it
   * counts, and "128" and "128 nodes" and "128 of 200 nodes" are three different
   * facts about the same figure. The rejected alternative was a template, and a
   * template has to know the word order, which is the reader's language and not
   * this package's.
   */
  unitLabel?: (unit: string, value: number) => string
  /**
   * Where the resource stands.
   *
   * Optional, and a row with none asserts nothing, which is the honest default.
   * There are estates whose capacity is measured, estates where it is not, and
   * rows inside one estate that are both: a row whose collector has never reported
   * has no state, and a Block that defaulted it would be making the most confident
   * claim on the page about the row it knows least about. The words are the
   * caller's for the reason `MeterTone` gives: this Block can see the numbers and
   * cannot see whether they are urgent.
   */
  state?: CapacityState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is given, and not defaulted, for the reason
   * `StatusLedger01` states in full: the state is a colour and the words are the
   * information, and a system whose estates say "nearly full" where another's say
   * "at 94 per cent of quota" cannot be given one vocabulary by a design system. A
   * missing label is a thrown diagnostic rather than a silent absence, because the
   * fallback available here would be the machine value, and `tight` printed into an
   * estate view is a bare machine word where a sentence belongs.
   */
  stateLabel?: string
  /** Where the resource is described in full. Rendered as a real link. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is set.
   *
   * A link announced by its address is punctuation rather than a name, and a reader
   * following a link to check a claim deserves to know what they are about to open.
   */
  hrefLabel?: string
}

/**
 * One figure about the estate as a whole, and the words under it.
 *
 * **A node for the value and a string for the label, and the delta is a number
 * whose sign is the direction.** This is `metric`'s own split, and the reason it is
 * composed here rather than drawn: a figure about an estate is almost always a
 * number the caller has already formatted, in a unit only the caller knows, and a
 * Block that printed a bare numeral beside the word "nodes" would be claiming the
 * unit. The delta is a number because a delta is a measurement and the sign is the
 * direction, which is the Component's contract and not this Block's to restate; a
 * caller whose delta is a fraction passes `deltaFormat`, and a caller who does not
 * gets the bare number printed, which is honest and usually not what was wanted.
 */
export type CapacitySummary = {
  /** What the figure measures, read under it. */
  label: string
  /** The figure, already in the caller's own units. */
  value: ReactNode
  /**
   * The change against the previous reading, as a number whose sign is the
   * direction. See `MetricDelta` on the Component.
   */
  delta?: number
  /**
   * The words for the delta, given the number.
   *
   * Optional, and the fallback is the number itself, which is the same arrangement
   * `Metric` takes. A delta of `0.12` is twelve per cent, twelve nodes or twelve
   * seconds, and a Block that guessed would be claiming a caller's units.
   */
  deltaFormat?: (value: number) => string
}

/**
 * The props a Capacity01 takes.
 *
 * Every string and every figure is a prop and the Block ships none: no resource, no
 * committed figure, no limit, no remaining figure, no unit, no state, no verdict
 * and not one word of the sentence that says what the numbers count. The state
 * words are the sharpest version of that rule, because a Block that hardcoded
 * "Healthy" would put a sentence about somebody else's estate into four consumer
 * products at once, and a reader looking at a nearly full estate deserves to be
 * told that in the words the product uses for it.
 */
export type Capacity01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The section title, required.
   *
   * Required because a table of numbers about an estate is unreadable without a
   * statement of whose estate it is: a capacity table with a heading and no
   * context reads as a set of figures nobody measured.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order a reader should meet them.
   *
   * Order and naming are both the caller's, and both are claims. The order is a
   * claim about what a reader checks first, and on a capacity table that is
   * usually the resource rather than the remaining figure. The set of cells is
   * closed, so a column this Block cannot fill throws rather than rendering an
   * empty one, and the `resource` cell is required because a row with no resource
   * name is a row nobody can be referred to.
   */
  columns: readonly CapacityColumn[]
  /**
   * The rows, in the order a reader should meet them.
   *
   * The Block does not sort, for the reason `AuditLog01` gives and it is stronger
   * here: a capacity table a Block reordered would be a claim about which resource
   * matters most, and on an estate that claim is a claim about somebody's
   * infrastructure. A caller whose rows arrive in a random order sorts them once,
   * upstream, with whatever rule their product uses, which is usually by the state
   * or by the remaining figure and is never the same twice.
   */
  rows: readonly CapacityRow[]
  /**
   * The figures about the estate as a whole.
   *
   * Drawn as the table's own summary row, so they travel with the table in the
   * accessibility tree rather than sitting in a band below it that a reader
   * navigating the table never meets and a crawler reads as unrelated to the rows
   * above it. Optional because an estate with no estate-wide figure is a real state,
   * and a Block that drew a summary row of nothing would be drawing a claim that
   * there is nothing to summarise.
   */
  summary?: readonly CapacitySummary[]
  /**
   * What the surface shows when there are no rows.
   *
   * Required, and the reason is the one `compliance-01` states against itself: a
   * capacity table with a heading and no rows says the estate has nothing on it,
   * and hiding the section would leave a reader wondering whether it was missed.
   * The sentence is the caller's because only the caller knows whether the answer
   * is "nothing is provisioned" or "this collector has not reported yet".
   */
  empty: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, so a capacity surface never renders a figure or a cell it cannot
 * justify.
 *
 * A column naming a cell this Block does not draw, a table with no resource
 * column, a link with no name, a state with no words, and a unit with no sentence
 * for the figures that use it. All five are a caller's mistake rather than a
 * request, so all five throw in a console rather than rendering the quiet version
 * of themselves, and each message names the row rather than the index, because a
 * caller with forty rows needs to know which one.
 */
function assertProps(props: {
  columns: readonly CapacityColumn[]
  rows: readonly CapacityRow[]
}): void {
  const known: readonly CapacityCell[] = [
    'resource',
    'kind',
    'committed',
    'limit',
    'remaining',
    'state',
    'href',
  ]

  for (const column of props.columns) {
    if (!known.includes(column.id)) {
      throw new Error(
        `Capacity01: a column names the cell ${JSON.stringify(column.id)}, which is not one of the ` +
          'seven cells a capacity table can draw. A column with nothing to put in it is a column a ' +
          'reader counts past, so add the cell rather than the heading.',
      )
    }
  }

  if (props.columns.length === 0) {
    throw new Error(
      'Capacity01: columns is empty, so the table would have no named columns, which is a grid of ' +
        'figures with nothing to check them against. Name the columns in the order they should be read.',
    )
  }

  if (!props.columns.some((column) => column.id === 'resource')) {
    throw new Error(
      'Capacity01: the columns name no resource cell, so the header row would have a cell fewer than ' +
        'every body row and the table would have no row header to announce the figures against. Name ' +
        'the resource column, in the position it should be read.',
    )
  }

  for (const row of props.rows) {
    if (row.resource.trim() === '') {
      throw new Error(
        `Capacity01: the row "${row.id}" declares no resource name, so the row has no header to announce ` +
          'its figures against and a reader who lands on a remaining figure is told nothing about what it ' +
          'belongs to. Pass the name your readers use for the resource.',
      )
    }

    if ((row.href === undefined) !== (row.hrefLabel === undefined)) {
      throw new Error(
        `Capacity01: the row "${row.resource}" declares one of href and hrefLabel without the other, so ` +
          'the row would carry a link with no words on it, or a name with no link beside it. Pass the ' +
          'words that say what following it does, or drop the href.',
      )
    }

    if (row.state !== undefined && (row.stateLabel === undefined || row.stateLabel.trim() === '')) {
      throw new Error(
        `Capacity01: the row "${row.resource}" declares a state and no words for it, so the mark beside ` +
          'it would be a colour with nothing to read beside it, on the surface where a reader is about to ' +
          'act on the number. Pass stateLabel in the vocabulary the product uses, which is not this ' +
          "Block's choice.",
      )
    }

    if (row.unit !== undefined && row.unitLabel === undefined) {
      throw new Error(
        `Capacity01: the row "${row.resource}" carries a unit and no unitLabel, so its figures would ` +
          'be announced as bare numerals, and a numeral beside a resource name tells a screen reader ' +
          'nothing about what it counts. Pass the function that reads a figure, or drop the unit and let ' +
          'the column heading carry it.',
      )
    }
  }
}

/**
 * What is available and what is committed, as a real table with a summary row.
 *
 * **The Block does not compute `remaining`, and this is the important sentence of
 * this file.** A design system that subtracted one figure from another would be
 * asserting an arithmetic fact about an estate it cannot see. An estate has
 * overcommit, a burst allowance, a soft limit nobody enforces, a quota reserved for
 * a team that has not been created yet, a figure that is a rolling average rather
 * than an instant, and a limit that changed ten minutes ago while the committed
 * figure did not. A Block that added them up would be choosing between those
 * relationships without knowing any of them, and the number it printed would be
 * wrong quietly. So the three numbers are three props and the caller states the
 * relationship between them, and this Block draws three figures the caller has
 * already made agree. The cost is real and is named rather than hidden: a caller
 * with a flat rule, where remaining is simply limit minus committed, writes that
 * subtraction in three places or once in a helper, and that is a small amount of
 * duplicated intent in exchange for a table that cannot be wrong. The alternative
 * is a table whose numbers can be wrong, and a capacity screen whose arithmetic
 * disagrees with the product's is a screen that makes a reader distrust every other
 * number on it, and the numbers on this surface are the ones people act on.
 *
 * **`state` is optional and a row with none asserts nothing, which is the honest
 * default and is stated as a decision rather than as an omission.** There are
 * estates whose capacity is measured and estates where it is not, and rows inside
 * one estate that are both: a row whose collector has never reported has no state,
 * and a Block that defaulted it would be making the most confident claim on the
 * page about the row it knows least about. The four states are the four answers to
 * "is there room left", which is the only question a capacity table asks, and
 * `unknown` is in the set because a resource that cannot be measured is a real
 * state and a table that draws an absent figure as a zero is a table claiming an
 * estate is full.
 *
 * **The colours are the shared tones and the mapping is made here rather than left
 * to the caller, and the reason is that a caller who picked one would be making a
 * judgement this Block can support but cannot make.** This Block can see the
 * numbers and it cannot see whether the numbers are urgent: a disk at ninety per
 * cent is `tight` on a development estate and `exhausted` on a customer's, and the
 * number does not know which one the reader is looking at. So the tone is derived,
 * the words are the caller's, and the four tones are the four the semantic
 * contract publishes. The cost is stated rather than hidden: a product that wants
 * a fifth tone for a state it can measure and this Block cannot has no seam here,
 * and the answer is the caller's own `summary` figure beside the table, which is
 * the arrangement `Project01` uses for the same reason.
 *
 * **It is a real table, for the reason `RateCard01` and `AuditLog01` are both
 * one.** A capacity table is read down the resource column and across the three
 * figures, and the reader's question is nearly always a comparison: is this one
 * tighter than that, which of these two is at its limit, is the estate full. A
 * reader using a screen reader navigates a table by asking for a column and hearing
 * its heading, and on this surface a header the reader cannot ask for is a cell
 * they cannot place. The cost of the table is the one every real table carries:
 * `Table` wraps the thing in a horizontally scrollable container, because seven
 * columns do not fit a phone, and a capacity table that reflowed into a stack would
 * no longer be comparable, which is the only reason it exists.
 *
 * **The resource is the row header, so the table announces it with every cell.**
 * The resource cell is a `th` with `scope="row"`, which is what lets a screen
 * reader say which resource each figure belongs to, and it carries
 * `whitespace-normal` and `h-auto` because `TableHead` and `TableCell` set
 * `whitespace-nowrap` and a fixed header height, which is right for a figure in a
 * data grid and wrong for a noun phrase a reader scans. That is the one place in
 * this Block where a `className` changes a Prism-owned property rather than
 * placing something, and it is stated here rather than left to be discovered, and
 * it is the same override `Retention01` and `Summary01` make for the same reason.
 *
 * **An empty estate draws the table with no rows and the caller's sentence, which
 * is the opposite of what most Blocks here do, and deliberately so.** A capacity
 * table with a heading and no rows says the estate has nothing on it, and hiding
 * the section would leave a reader wondering whether it was missed. The cost is
 * that a heading can survive on a page whose estate has been deprovisioned, so a
 * consumer who would rather see nothing should not render the Block. That is the
 * honest trade and it is the one `compliance-01` takes for the same reason.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * figures are printed exactly as passed and the arithmetic, such as it is, is the
 * caller's.
 */
export function Capacity01({
  eyebrow,
  title,
  description,
  columns,
  rows,
  summary,
  empty,
  headingLevel = 'h2',
  className,
}: Capacity01Props) {
  assertProps({ columns, rows })

  /*
    The two optional columns follow the data rather than the declaration, for the
    reason `RateCard01` gives for its allowance and overage columns: a column that
    exists for some rows and not others is a column a reader has to check, and a
    table with a state column of empty cells because one row happens to have no
    state is a table making a claim about that row. So each is drawn when at least
    one row carries it, and a row that does not gets an empty cell rather than a
    placeholder.
  */
  const hasState = rows.some((row) => row.state !== undefined)
  const hasHref = rows.some((row) => row.href !== undefined)
  const drawn = columns.filter(
    (column) =>
      (column.id !== 'state' || hasState) &&
      (column.id !== 'href' || hasHref || rows.length === 0),
  )

  return (
    <Section data-slot="capacity-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="capacity-01-table" className="flex flex-col gap-4">
        <div className="border-border overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                {drawn.map((column) => (
                  <TableHead
                    key={column.id}
                    scope="col"
                    data-column={column.id}
                    className={cn('whitespace-normal', column.className)}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow data-slot="capacity-01-empty">
                  <TableCell
                    colSpan={Math.max(drawn.length, 1)}
                    className="text-muted-foreground whitespace-normal"
                  >
                    {empty}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} data-slot="capacity-01-row" data-capacity={row.id}>
                    {drawn.map((column) => {
                      if (column.id === 'resource') {
                        return (
                          <TableHead
                            key={column.id}
                            scope="row"
                            data-column={column.id}
                            className={cn(
                              'text-foreground h-auto whitespace-normal font-medium',
                              column.className,
                            )}
                          >
                            {row.resource}
                          </TableHead>
                        )
                      }

                      if (column.id === 'kind') {
                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal', column.className)}
                          >
                            {row.kind ?? null}
                          </TableCell>
                        )
                      }

                      if (
                        column.id === 'committed' ||
                        column.id === 'limit' ||
                        column.id === 'remaining'
                      ) {
                        const figure =
                          column.id === 'committed'
                            ? row.committed
                            : column.id === 'limit'
                              ? row.limit
                              : row.remaining

                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal tabular-nums', column.className)}
                          >
                            {/*
                              One cell, three figures, and the reading is the
                              caller's. An absent figure is an empty cell rather
                              than a zero, because a zero beside "Remaining" is a
                              claim that an estate is full, and the row's `unknown`
                              state is the honest way to say that nothing is
                              known. See the type's JSDoc for why the three are
                              never combined here.
                            */}
                            {figure === undefined || row.unitLabel === undefined || row.unit === undefined
                              ? (figure ?? null)
                              : row.unitLabel(row.unit, figure)}
                          </TableCell>
                        )
                      }

                      if (column.id === 'state') {
                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal', column.className)}
                          >
                            {row.state === undefined || row.stateLabel === undefined ? null : (
                              <Status
                                data-slot="capacity-01-state"
                                tone={STATE_TONE[row.state]}
                                label={row.stateLabel}
                                size="sm"
                              />
                            )}
                          </TableCell>
                        )
                      }

                      return (
                        <TableCell
                          key={column.id}
                          data-column={column.id}
                          className={cn('whitespace-normal', column.className)}
                        >
                          {row.href === undefined || row.hrefLabel === undefined ? null : (
                            <CtaLink href={row.href} variant="ghost" size="sm">
                              {row.hrefLabel}
                            </CtaLink>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>

            {summary === undefined || summary.length === 0 ? null : (
              <TableFooter>
                <TableRow data-slot="capacity-01-summary">
                  <TableCell colSpan={Math.max(drawn.length, 1)} className="whitespace-normal">
                    {/*
                      The estate-wide figures, inside the table so they travel with
                      it. A band of metrics below the table is a band a reader
                      navigating the table never meets, and a crawler reads as
                      unrelated to the rows above. Each figure is a `Metric`, so the
                      arrangement a headline figure is read in and the mono face a
                      machine reading is set in are the Component's, and the only
                      thing Prism composes here is the value and the label the
                      caller wrote.
                    */}
                    <span className="flex flex-wrap items-start gap-x-10 gap-y-4">
                      {summary.map((figure) => (
                        <Metric
                          key={figure.label}
                          data-slot="capacity-01-summary-figure"
                          value={figure.value}
                          label={figure.label}
                          delta={figure.delta}
                          deltaFormat={figure.deltaFormat}
                          className="min-w-32"
                        />
                      ))}
                    </span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>
    </Section>
  )
}

export default Capacity01
