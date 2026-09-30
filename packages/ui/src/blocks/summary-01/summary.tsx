import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Price, type PriceProps } from '../../components/ui/price'
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
 * The three cells a line of a summary can draw.
 *
 * A closed set, and the closure is the point, for the reason
 * `ResourceListCell` gives: the cells are this Block's, so a column naming a
 * fourth would be a column with nothing to put in it. The names above them are the
 * caller's, which is the other half of the same thing. A summary has exactly one
 * column whose name is worth arguing over, the state column, and a product that
 * calls it "Included" and a product that calls it "What is in this plan" are both
 * right, and a product that calls the same column "Entitlements" has meant
 * something slightly different by it.
 */
export type SummaryCell = 'line' | 'state' | 'amount' | 'href'

/**
 * One column of a summary: which cell it draws, and the words above it.
 *
 * A cell id rather than a renderer, for the reason the closure above gives: the
 * cells are this Block's so that a summary reads the same in every consumer, and
 * only the words travel. A column that took a renderer would be a table the caller
 * drew, and this Item would be a bordered `div`.
 */
export type SummaryColumn = {
  /** Which cell this column draws. */
  id: SummaryCell
  /** The column's name, in the caller's own words. */
  header: ReactNode
  /** Layout only: a width, or an alignment. Applied to the head and every cell. */
  className?: string
}

/**
 * The three states a line of a summary can be in, and the tone each one draws.
 *
 * **Three, and the set is closed, and it is not `Status`'s five.** `Status`
 * publishes `neutral`, `info`, `success`, `warning` and `destructive`, and a
 * summary of what a plan includes has no use for two of them: a line is not
 * "blocked" and it is not "degraded". What it has is the three positions a line
 * in a set of lines can be in relative to the set: it is in, it is out, or it is
 * available if the reader wants it and not otherwise. The third is the one a
 * storefront has and a design system is most likely to drop, and it is the reason
 * this union exists at all: "optional" is a distinct state to a reader, because it
 * is the only one of the three that asks a question.
 *
 * The tones are the shared ones, and `optional` is `info` rather than `neutral`
 * because a neutral line reads as a line that is merely there while an optional
 * one reads as a decision the reader has not made. `excluded` is `neutral` and not
 * `destructive`, and the reason is the same one `Project01` gives for `blocked`:
 * a line that is not included is not a fault, and a table of forty lines with
 * twenty of them in red reads as twenty problems.
 */
const STATE_TONE: Record<SummaryLineState, StatusTone> = {
  included: 'success',
  excluded: 'neutral',
  optional: 'info',
}

/**
 * One of the three states a line of a summary can be in.
 *
 * A machine value and never reader-facing text. The words are the caller's: an
 * excluded line is a claim about a contract, and "Not included" and "Available on
 * the Scale plan" and "Requires a seat" are three different promises, and only
 * the product that made the promise can say which of them it made.
 */
export type SummaryLineState = 'included' | 'excluded' | 'optional'

/**
 * One line of a summary: what it is, what it comes to, and where it stands
 * relative to the set.
 *
 * **Every word in this type is a representation the caller's product makes, and
 * the state in particular is a claim about a contract rather than a drawing
 * decision.** `stateLabel` is required whenever `state` is given and the run throws
 * without it, for the reason `StatusLedger01` states in full: the state is a colour
 * and the words are the information, and a product whose plans say "add-on" where
 * another's say "optional" cannot be given one vocabulary by a design system. A
 * missing label is a thrown diagnostic rather than a silent absence, because the
 * fallback available here would be the machine value, and `excluded` printed into
 * a pricing table is a bare machine word where a sentence belongs.
 */
export type SummaryLine = {
  /** A stable key for the line, carried on the markup as `data-line`. */
  id: string
  /**
   * What the line is, in the caller's own words.
   *
   * The anchor of the line and the row header the table announces with it, so a
   * reader who lands on the amount is told which line it belongs to. A short noun
   * phrase: it is scanned down a column, and a label that wraps to two lines is a
   * row whose amount sits below its neighbours'.
   */
  label: string
  /**
   * The line under the label, for the qualifier the label has no room for: what
   * the feature is, what the seat buys, which region it covers.
   *
   * A node, because three of the four consumer sites put a link in it, pointing at
   * the document that describes the feature, and a `string` would force a
   * flattening that loses whichever of those it could not hold.
   */
  detail?: ReactNode
  /**
   * What the line comes to.
   *
   * A node rather than a `PriceProps`, and the difference is load-bearing: a
   * summary has lines that are not amounts at all. "Ten thousand rows", "the first
   * five gigabytes" and "$0" are three different things a line of a summary holds,
   * and two of the four consumer sites hold the first two. A `PriceProps` here
   * would have printed an amount beside a line that is a count, which is a claim
   * about a unit Prism cannot see.
   */
  value: ReactNode
  /** Where the line is described in full. Rendered as a real link. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is set.
   *
   * A link announced by its address is punctuation rather than a name, which is
   * the same defect `Retention01` throws on and the same answer. A line whose only
   * destination is an address a reader has to decode is a line a screen reader
   * user cannot follow.
   */
  hrefLabel?: string
  /**
   * Where the line stands relative to the set.
   *
   * Optional, and its absence is meaningful rather than a gap: a line with no
   * state is a line the product has not positioned, which on a summary is a real
   * and common thing. A row with no state draws no mark, and the table does not
   * carry a state column's worth of blanks pretending otherwise. See
   * `SummaryLineState` for why there are three and not five.
   */
  state?: SummaryLineState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is given, and not defaulted, for the reason the type
   * states in full. See `StatusLedger01` for the argument, which is that a system
   * saying "reverted" where another's says "reverted by policy" cannot be given one
   * vocabulary by a design system.
   */
  stateLabel?: string
}

/**
 * The props a Summary01 takes.
 *
 * Every string is a prop and the Block ships none. There is no line, no amount, no
 * state, no total label and not one word of the sentence that says what a line
 * includes. A summary is the densest claim a product makes about itself per square
 * inch, so a single hardcoded state word on this Block would be a sentence about a
 * contract in four consumer products at once.
 */
export type Summary01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The section title, required.
   *
   * Required because a table of claims about what a plan contains is unreadable
   * without a statement of whose plan it is: a summary with a heading and no
   * context reads as a set of assertions nobody issued.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order a reader should meet them.
   *
   * Order and naming are both the caller's, and both are claims. The order is a
   * claim about what a reader checks first, and on a summary that is usually the
   * line itself rather than its amount. The set of cells is closed, so a column
   * this Block cannot fill throws rather than rendering an empty one.
   */
  columns: readonly SummaryColumn[]
  /**
   * The lines, in the order a reader should meet them.
   *
   * The Block does not sort, for the reason `AuditLog01` gives: the order of a
   * summary is a claim about what a product leads with, and a Block that reordered
   * one would be making that claim on the caller's behalf. A caller whose lines
   * arrive out of order sorts them upstream, once.
   */
  lines: readonly SummaryLine[]
  /**
   * What the lines come to before whatever else is added to them.
   *
   * Optional, and its absence is a decision rather than a gap: a summary whose
   * total is the sum of its lines has no subtotal worth drawing, and a subtotal
   * that is not labelled by the caller is a figure with no name, which is the one
   * thing a total row must never be.
   */
  subtotal?: PriceProps
  /**
   * What the whole summary comes to.
   *
   * **Required, and the reason is that a summary without a total is a list.** The
   * two halves of the argument are that a total is the thing a reader came for, so
   * a summary that stops at the lines has made them do the addition themselves, and
   * that a summary which computed one would be pricing a caller's catalogue with
   * the caller's rules it cannot see: a threshold discount, a credit already on the
   * account, a tax that depends on where the reader is, a floor under the whole
   * thing, a rounding rule applied once at the end rather than per line. A Block
   * that added the lines up would be choosing between those rules without knowing
   * any of them, and the figure it printed would be wrong by exactly the amount a
   * reader cared about. So the total is a `PriceProps`, which is the same
   * relationship a real invoice has with the thing that issued it.
   */
  total: PriceProps
  /**
   * The name of the total row, in the caller's own words.
   *
   * Required beside a required `total`, and it is a separate prop rather than a
   * heading the Block writes because "Total", "What you pay" and "Due today" are
   * three products' decisions and the last of them is a claim about when money
   * moves, which Prism is in no position to make.
   */
  totalLabel: string
  /**
   * The line under the table: the rounding rule, the billing granularity, the
   * sentence that qualifies every number on it.
   *
   * A node rather than a string, because three of the four consumer sites carry a
   * link in it, pointing at the tax treatment or the full tariff.
   */
  footnote?: ReactNode
  /**
   * The control under the table, for the call to action that follows from what the
   * reader has just read.
   *
   * A slot rather than a named button, because which control a summary ends in is
   * the caller's fact: a product that sells a plan and a product that sells seats
   * from the same table end in different controls, and re-declaring it here would
   * give a product two buttons that say the same thing in two weights.
   */
  actions?: ReactNode
  /**
   * What the surface shows when there are no lines.
   *
   * Required, and the reason is the one `compliance-01` states against itself: a
   * summary with a heading and no lines says the product includes nothing, and
   * hiding the section would leave a reader wondering whether it was missed. The
   * sentence is the caller's because only the caller knows whether the answer is
   * "this plan has nothing in it" or "this has not been written yet".
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
 * The refusals, so a summary never renders a cell it cannot justify.
 *
 * A column naming a cell this Block does not draw, a link with no name, a state
 * with no words, and a summary whose total row is the only row. All four are a
 * caller's mistake rather than a request, so all four throw in a console rather
 * than rendering the quiet version of themselves, and each message names the line
 * rather than the index, because a caller with thirty lines needs to know which
 * one.
 */
function assertProps(props: {
  columns: readonly SummaryColumn[]
  lines: readonly SummaryLine[]
  subtotal?: PriceProps
  total: PriceProps
  totalLabel: string
}): void {
  const known: readonly SummaryCell[] = ['line', 'state', 'amount', 'href']

  for (const column of props.columns) {
    if (!known.includes(column.id)) {
      throw new Error(
        `Summary01: a column names the cell ${JSON.stringify(column.id)}, which is not one of the four ` +
          'cells this summary can draw. A column with nothing to put in it is a column a reader counts ' +
          'past, so add the cell rather than the heading.',
      )
    }
  }

  if (props.columns.length === 0) {
    throw new Error(
      'Summary01: columns is empty, so the table would have no named columns, which is a grid of ' +
        'assertions with nothing to check them against. Name the columns in the order they should be read.',
    )
  }

  if (props.total.amount === undefined) {
    throw new Error(
      'Summary01: total is required and carries no amount, so the row that names what the whole summary ' +
        'comes to would render with nothing in it. A total with no figure is a sentence with no number, ' +
        'and a summary that draws one has chosen the reader a question rather than an answer.',
    )
  }

  if (props.subtotal !== undefined && props.subtotal.amount === undefined) {
    throw new Error(
      'Summary01: subtotal is set and carries no amount, so the row above the total would be a figure ' +
        'that is not there. Omit the subtotal, or pass the amount it comes to.',
    )
  }

  if (props.totalLabel.trim() === '') {
    throw new Error(
      'Summary01: totalLabel is empty, so the total row would be a figure with no name beside it, which ' +
        'is the one thing a total row must never be. Pass the words your readers use for it.',
    )
  }

  for (const line of props.lines) {
    if ((line.href === undefined) !== (line.hrefLabel === undefined)) {
      throw new Error(
        `Summary01: the line "${line.label}" declares one of href and hrefLabel without the other, so ` +
          'the row would carry a link with no words on it, or a name with no link beside it. Pass the ' +
          'words that say what following it does, or drop the href.',
      )
    }
    if (line.state !== undefined && (line.stateLabel === undefined || line.stateLabel.trim() === '')) {
      throw new Error(
        `Summary01: the line "${line.label}" declares a state and no words for it, so the mark beside ` +
          'it would be a colour with nothing to read beside it, on a surface whose every word is a claim ' +
          'about a contract. Pass stateLabel in the vocabulary the product uses, which is not this ' +
          "Block's choice.",
      )
    }
  }
}

/**
 * A set of lines and what they come to, as a real table, with a total the caller
 * states and a footnote that qualifies it.
 *
 * **It is a real table, for the reason `RateCard01` and `AuditLog01` are both
 * one.** A summary is read down the line column and across the amount column, and
 * a reader using a screen reader navigates it by asking for a column and hearing
 * its heading. That reader's question is nearly always a comparison: is this in
 * or out, does this cost anything, is this the one I would pay for. A grid of
 * `div`s has no columns to ask for, so the whole comparison has to happen by eye.
 * The cost of the table is the one every real table carries: `Table` wraps the
 * thing in a horizontally scrollable container, because four columns do not fit a
 * phone, and a summary that reflowed into a stack would no longer be a summary a
 * reader can check.
 *
 * **The line is the row header, so the table announces it with every cell.** The
 * line cell is a `th` with `scope="row"`, which is what lets a screen reader say
 * which line each amount and each state belongs to. It carries `whitespace-normal`
 * and `h-auto`, because `TableHead` and `TableCell` set `whitespace-nowrap` and a
 * fixed header height, which is right for a figure in a data grid and wrong for a
 * phrase that is a claim about a contract. That is the one place in this Block
 * where a `className` changes a Prism-owned property rather than placing
 * something, and it is stated here rather than left to be discovered, and it is
 * the same override `Retention01` and `AuditLog01` make for the same reason.
 *
 * **The three states need a caller's words and the run throws without them, and
 * that is the whole of the state design.** `included`, `excluded` and `optional`
 * are the three positions a line can be in relative to the set, and they are not
 * `Status`'s five tones narrowed: a line is not blocked and a line is not
 * degraded, and a union with five members would have four rungs a reader has to
 * learn for a surface where three is what the shape of the question allows. The
 * words are the caller's because an excluded line is a claim about a contract and
 * "Not included" and "Available on the Scale plan" and "Requires a seat" are three
 * different promises. The colours are the shared tones, and `excluded` is
 * `neutral` rather than `destructive` for the reason `Project01` gives for a
 * blocked project: a line that is not included is not a fault, and a table of
 * forty lines with twenty of them in red reads as twenty problems.
 *
 * **The total is required and it is a prop, and the second half of that is the
 * argument.** A summary without a total is a list, so `total` is required; and a
 * summary that computed one would be pricing a caller's catalogue with the caller's
 * rules it cannot see. A threshold discount, a credit already on the account, a
 * tax that depends on where the reader is, a floor under the whole thing, a
 * rounding rule applied once at the end rather than per line: a Block that added
 * the lines up would be choosing between those rules without knowing any of them,
 * and the figure it printed would be wrong by exactly the amount a reader cared
 * about. The total is a `PriceProps` and the name beside it is a prop too, so the
 * one sentence on this surface that is a claim about when money moves is the
 * caller's. The cost is named rather than hidden: a caller with a flat catalogue
 * writes the sum as well as the lines, and that is the cheaper mistake.
 *
 * **The subtotal is optional and drawn only when there is one.** A summary whose
 * total is the sum of its lines has no subtotal worth drawing, and a subtotal
 * labelled only by the caller's arithmetic would be a figure with no name, which
 * is the one thing a total row must never be. The row above the total is
 * deliberately unlabelled in that case: this Block has no word for it, and a word
 * it invented would be a claim about the order the figures add up in.
 *
 * **An empty summary draws the table with no rows and the caller's sentence,
 * which is the opposite of what most Blocks here do, and deliberately so.** A
 * summary with a heading and no lines says the product includes nothing, and
 * hiding the section would leave a reader wondering whether it was missed. The
 * cost is that a heading can survive on a page whose plan has been withdrawn, so a
 * consumer who would rather see nothing should not render the Block. That is the
 * honest trade and it is the one `compliance-01` takes for the same reason.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * values are printed exactly as passed and the arithmetic is the caller's.
 */
export function Summary01({
  eyebrow,
  title,
  description,
  columns,
  lines,
  subtotal,
  total,
  totalLabel,
  footnote,
  actions,
  empty,
  headingLevel = 'h2',
  className,
}: Summary01Props) {
  assertProps({ columns, lines, subtotal, total, totalLabel })

  const hasState = lines.some((line) => line.state !== undefined)
  const hasHref = lines.some((line) => line.href !== undefined)
  const drawn = columns.filter(
    (column) =>
      (column.id !== 'state' || hasState) &&
      (column.id !== 'href' || hasHref || lines.length === 0),
  )

  return (
    <Section data-slot="summary-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="summary-01-table" className="flex flex-col gap-4">
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
              {lines.length === 0 ? (
                <TableRow data-slot="summary-01-empty">
                  <TableCell
                    colSpan={Math.max(drawn.length, 1)}
                    className="text-muted-foreground whitespace-normal"
                  >
                    {empty}
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line) => (
                  <TableRow key={line.id} data-slot="summary-01-line" data-line={line.id}>
                    {drawn.map((column) => {
                      if (column.id === 'line') {
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
                            <span className="flex flex-col gap-1">
                              <span>{line.label}</span>
                              {line.detail === undefined ? null : (
                                <span className="text-muted-foreground text-pretty text-sm font-normal">
                                  {line.detail}
                                </span>
                              )}
                            </span>
                          </TableHead>
                        )
                      }

                      if (column.id === 'amount') {
                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal', column.className)}
                          >
                            {line.value}
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
                            {line.state === undefined || line.stateLabel === undefined ? null : (
                              <Status
                                data-slot="summary-01-state"
                                tone={STATE_TONE[line.state]}
                                label={line.stateLabel}
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
                          {line.href === undefined || line.hrefLabel === undefined ? null : (
                            <CtaLink href={line.href} variant="ghost" size="sm">
                              {line.hrefLabel}
                            </CtaLink>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>

            {/*
              The figures, inside the table so they travel with it. A band of totals
              below the table is a band a reader navigating the table never meets,
              and a crawler reads as unrelated to the rows above it. The subtotal row
              is drawn only when there is one, and it is deliberately unlabelled: this
              Block has no word for a subtotal and would be inventing a claim about
              the order the figures add up in.
            */}
            <TableFooter>
              {subtotal === undefined ? null : (
                <TableRow data-slot="summary-01-subtotal">
                  <TableCell
                    colSpan={Math.max(drawn.length, 1)}
                    className="whitespace-normal"
                  >
                    <span className="flex items-baseline gap-3">
                      <Price {...subtotal} size="md" />
                    </span>
                  </TableCell>
                </TableRow>
              )}

              <TableRow data-slot="summary-01-total">
                <TableHead
                  scope="row"
                  data-slot="summary-01-total-label"
                  className="text-foreground h-auto whitespace-normal font-semibold"
                >
                  {totalLabel}
                </TableHead>
                <TableCell className="whitespace-normal">
                  <Price data-slot="summary-01-total" {...total} size="lg" />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {footnote === undefined ? null : (
          <p data-slot="summary-01-footnote" className="text-muted-foreground text-pretty text-sm">
            {footnote}
          </p>
        )}

        {actions === undefined ? null : (
          <div data-slot="summary-01-actions" className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </Section>
  )
}

export default Summary01
