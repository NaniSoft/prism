import { useId, type ReactNode } from 'react'

import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
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
 * The seven things a retention row can say, and the cell each one draws.
 *
 * A closed set, and the closure is the point, for the reason
 * `ResourceListCell` gives: the cells are the Block's, so a column naming a
 * seventh would be a column with nothing to put in it. The names above them are the
 * caller's, which is the other half of the same thing. A compliance surface has one
 * column whose name is genuinely worth arguing over, the period column, and a
 * product that calls it "Retention" and a product that calls it "How long we keep
 * it" are both right, and a product that calls the same column "TTL" has meant
 * something slightly different by it.
 *
 * The last-review cell is `last-reviewed` and the row field it draws is
 * `reviewedAt`, and the two names are not the same on purpose. The cell id is a
 * machine name that travels through a union and through markup, and a machine name
 * in this package is lowercase; the field is the caller's data and keeps the
 * spelling a reader of their own code expects.
 */
export type RetentionColumnId =
  | 'subject'
  | 'kind'
  | 'period'
  | 'region'
  | 'policy'
  | 'last-reviewed'
  | 'href'

/**
 * One column of a retention schedule, and the words above it.
 *
 * A cell id rather than a renderer, for the reason the closure above gives: the
 * cells are the Block's so that the schedule reads the same in every consumer, and
 * only the words travel. A column that took a renderer would be a table the
 * consumer drew, and this Item would be a bordered `div`.
 */
export type RetentionColumn = {
  /** Which cell the column draws. */
  id: RetentionColumnId
  /** The heading above the column. */
  header: ReactNode
  /** Layout only: a width, or an alignment. */
  className?: string
}

/**
 * One thing that is kept, for how long, where, and under which policy.
 *
 * Every word in every field here is a representation the caller makes to a
 * regulator, to a customer or to an auditor, and Prism composes none of them. See
 * the Block's JSDoc for why that sentence is load-bearing on this surface rather
 * than a formality.
 */
export type RetentionRow = {
  /** A stable key for the row, and carried on the markup as `data-retention`. */
  id: string
  /**
   * What is kept, in the publisher's own words.
   *
   * The anchor of the row and the row header the table announces with it. It is the
   * phrase a reader checks against the sentence beside it, so it is not shortened,
   * softened or rewritten here.
   */
  subject: string
  /**
   * The kind of thing: a category that groups the subjects, such as the records a
   * category of data lives in.
   *
   * Optional, and its absence is meaningful rather than a gap: a subject with no
   * kind is a subject the publisher has chosen not to categorise, which is itself a
   * statement and not a formatting gap.
   */
  kind?: string
  /**
   * How long it is kept, as a number of days and nothing else.
   *
   * A `number` rather than a sentence, and the argument is the whole of the Block's
   * JSDoc: the sentence is `periodLabel`, and a Block that printed one of the three
   * English forms would be asserting a retention period nobody agreed to.
   */
  period?: number
  /**
   * The words for the period, given the number of days.
   *
   * Required, and a function because the sentence is the caller's. "30 days", "one
   * month" and "a month" are three sentences, and a compliance surface that printed
   * one of them in English would be asserting a period the reader never agreed to,
   * which is the one thing a retention schedule exists not to do.
   */
  periodLabel: (period: number) => string
  /**
   * Where the data is kept, in the publisher's own terms.
   *
   * Optional, and a compliance surface with no region is a claim about everywhere,
   * which is a stronger claim than any publisher can usually support, so the Block
   * does not write one for them.
   */
  region?: string
  /** The policy the period comes from, named so a reader can go and read it. */
  policy?: string
  /**
   * When the schedule was last reviewed, already written as it should be read.
   *
   * A moment rather than a reading, and the reading is `reviewedAtLabel`. The Block
   * prints the value exactly as passed when no formatter is given, which is the
   * arrangement `compliance-01` and `member-list-01` both take.
   */
  reviewedAt?: number | string
  /** The words for the review, given the moment. A function because the honest reading is a sentence. */
  reviewedAtLabel?: (value: number | string) => string
  /** Where the policy is read in full, rendered as a native anchor. */
  href?: string
  /**
   * The words on that link. Required whenever `href` is set, and a thrown diagnostic
   * rather than a silent absence: a link announced by its address is punctuation
   * rather than a name.
   */
  hrefLabel?: string
}

/**
 * One figure about the schedule as a whole, and the words under it.
 *
 * A node for the value and a string for the label, which is `metric`'s own split
 * and the reason it is composed here rather than being drawn: a figure in a
 * compliance summary is a number the publisher has already formatted, in a unit
 * only the publisher knows, and a Block that printed a bare numeral would be
 * claiming the unit.
 */
export type RetentionSummary = {
  /** What the figure measures, read under it. */
  label: string
  /** The figure, already in the publisher's own units. */
  value: ReactNode
}

/**
 * The props a Retention01 takes.
 *
 * Every string is a prop and the Block ships none. There is no schedule, no
 * subject, no period, no region, no policy, no review reading, no link name and not
 * one of the three sentences a retention period can be written as. A retention
 * schedule is a set of representations made to regulators, to customers and to
 * auditors, and a design system that contributed a word to one of them would be
 * publishing a representation it has no standing to make.
 */
export type Retention01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The section title, required.
   *
   * Required because this is the one surface in the system where an unlabelled
   * table of retentions is a defect rather than a layout: a schedule with no
   * statement of whose it is reads as a document nobody issued.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The column names, in the order a reader should meet them. */
  columns: readonly RetentionColumn[]
  /** The rows, in the order a reader should meet them. The Block does not sort. */
  rows: readonly RetentionRow[]
  /**
   * The figures about the schedule as a whole.
   *
   * Drawn as the table's own summary row, so they travel with the table in the
   * accessibility tree rather than sitting in a band below it that a reader
   * navigating the table never meets.
   */
  summary?: readonly RetentionSummary[]

  /**
   * What the surface shows when there are no rows.
   *
   * Required, and the reason is the one `compliance-01` states against itself: a
   * retention schedule with a heading and no rows says the publisher retains
   * nothing, and hiding the section would leave a reader wondering whether it was
   * missed. The sentence is the caller's because only the caller knows whether the
   * answer is "we keep nothing" or "this has not been written yet".
   */
  empty: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The two refusals, so that a compliance surface never renders a cell it cannot
 * justify.
 *
 * A column naming a cell this Block does not draw, and a link with no name. Both
 * are a caller's mistake rather than a request, so both throw in a console rather
 * than rendering the quiet version of themselves.
 */
function assertProps(props: {
  columns: readonly RetentionColumn[]
  rows: readonly RetentionRow[]
}): void {
  const known: readonly RetentionColumnId[] = [
    'subject',
    'kind',
    'period',
    'region',
    'policy',
    'last-reviewed',
    'href',
  ]

  for (const column of props.columns) {
    if (!known.includes(column.id)) {
      throw new Error(
        `Retention01: a column names the cell ${JSON.stringify(column.id)}, which is not one of the seven ` +
          'cells this schedule can draw. A column with nothing to put in it is a column a reader counts past, ' +
          'so add the cell rather than the heading.',
      )
    }
  }

  for (const row of props.rows) {
    if (row.href !== undefined && (row.hrefLabel === undefined || row.hrefLabel.trim() === '')) {
      throw new Error(
        `Retention01: the row ${JSON.stringify(row.subject)} carries an href with no hrefLabel, so the link ` +
          'would be announced by its address, which is punctuation rather than a name. Pass the words that say ' +
          'which document it is.',
      )
    }
  }
}

/**
 * A retention schedule: what is kept, for how long, in which region, under which
 * policy, and when it was last reviewed, as a real table with a summary row.
 *
 * **Every word in every cell is the publisher's own representation, and on this
 * surface that is not a formality.** A retention schedule is a document made to
 * regulators, to customers and to auditors, and a design system that contributed a
 * single word to one of them would be publishing a representation it has no
 * standing to make. There is no schedule here, no subject, no region, no policy and
 * not one of the three sentences a retention period can be written as. The cost is
 * real and worth stating: a consumer wiring this Block up writes every label
 * themselves, and a half-built schedule is a build error rather than a page that
 * ships six confident numbers.
 *
 * **`period` is a number of days and the sentence is the caller's, and the reason
 * is that a Block cannot know which sentence is right.** "30 days", "one month" and
 * "a month" are three sentences for the same number, and they are not variants of
 * one another. The first is a measurement and it is the one a regulator will check
 * against a system configuration. The second is a rounding of that measurement to
 * a calendar unit, and it is a different promise, because thirty days is not a
 * month and a reader who is told "one month" and is then deleted from on the
 * thirty-first day has been told something the schedule did not say. The third is
 * the same promise as the second with the article left off, which matters because
 * a period is a noun phrase in one column and a verb phrase in a table caption. So
 * the Block holds the number and hands back the sentence, and a compliance surface
 * that printed one of the three in English would be asserting a retention period
 * the reader never agreed to, which is the one thing this table exists not to do.
 * The same argument is why the function is on the row rather than on the Block: the
 * sentence may be per product, per row, or per language, and none of those is a
 * fact this package can hold.
 *
 * **It is a real table, for the same reason `compliance-01` is one.** A schedule
 * is read down the subject column and across the period, region and policy columns,
 * and the reader's question is almost always a comparison: is this kept longer than
 * that, is it in the same place, is it under the same policy. A reader using a
 * screen reader navigates a table by asking for a column and hearing its heading,
 * and this is the table where a header the reader cannot ask for is a cell they
 * cannot place. The cost of the table is the one every real table carries:
 * `Table` wraps the whole thing in a horizontally scrollable container, because
 * seven columns do not fit a phone, and a schedule that reflowed into a stack would
 * no longer be comparable.
 *
 * **The subject is the row header, so the table announces it with every cell.** The
 * subject cell is a `th` with `scope="row"`, which is what lets a screen reader say
 * which subject each period, region and policy belongs to. The row header and the
 * cells carry `whitespace-normal`, because `TableHead` and `TableCell` set
 * `whitespace-nowrap` and that is right for a figure in a data grid and wrong for a
 * phrase that is a representation. That is the one place in this Block where a
 * `className` changes a Prism-owned property rather than placing something, and it
 * is stated here rather than left to be discovered.
 *
 * **The summary is the table's own row, and its figures are `metric`s.** Drawing
 * the figures with the same Component every other figure in this package uses is
 * the small half of the decision. The large half is the placement: the summary is
 * a `tfoot`, so it is inside the table and travels with it, rather than a band of
 * figures below the table that a reader navigating the table never meets and a
 * crawler reads as unrelated to the rows above it. Each figure takes a node for its
 * value, because the number is the publisher's and is usually in a unit only the
 * publisher knows, and a Block that printed a bare numeral next to the word
 * "records" would be claiming the unit.
 *
 * **An empty schedule renders the table with no rows and the caller's sentence,
 * which is the opposite of the rule every other Block in this package follows, and
 * deliberately so.** A retention schedule with a heading and no rows says the
 * publisher retains nothing, and hiding the section would leave a reader wondering
 * whether it was missed. The cost is that a heading can survive on a page whose
 * schedule has been withdrawn, so a consumer who would rather see nothing should
 * not render the Block. That is the honest trade and it is the one `compliance-01`
 * takes for the same reason.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * values are printed exactly as passed and the arithmetic is the caller's.
 */
export function Retention01({
  eyebrow,
  title,
  description,
  columns,
  rows,
  summary,
  empty,
  headingLevel = 'h2',
  className,
}: Retention01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  assertProps({ columns, rows })

  return (
    <Section className={className} data-slot="retention">
      <SectionHeading
        as={headingLevel}
        id={headingId}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="retention-table" className="flex flex-col gap-4">
        <div className="border-border overflow-hidden rounded-xl border">

          {/*
           * The table takes its name from the heading above it rather than from a
           * second copy of the same words. A `<table>` is named by a caption, an
           * `aria-label` or an `aria-labelledby`, and none of the three is inferred
           * from a heading that happens to be nearby, so a reader listing the tables
           * on a page found this one anonymous while every other element around it was
           * named. A reference rather than a caption because a caption is drawn, and a
           * visible line repeating the heading is noise; a reference because `title`
           * is the caller own words and a Block may not compose a second set. See
           * `Table`, which asks for exactly one of the three.
           */}
          <Table aria-labelledby={headingId}>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
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
                <TableRow data-slot="retention-empty">
                  <TableCell
                    colSpan={Math.max(columns.length, 1)}
                    className="text-muted-foreground whitespace-normal"
                  >
                    {empty}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} data-slot="retention-row" data-retention={row.id}>
                    {columns.map((column) => {
                      if (column.id === 'subject') {
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
                            {row.subject}
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

                      if (column.id === 'period') {
                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal', column.className)}
                          >
                            {row.period === undefined
                              ? null
                              : row.periodLabel(row.period)}
                          </TableCell>
                        )
                      }

                      if (column.id === 'region') {
                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal', column.className)}
                          >
                            {row.region ?? null}
                          </TableCell>
                        )
                      }

                      if (column.id === 'policy') {
                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal', column.className)}
                          >
                            {row.policy ?? null}
                          </TableCell>
                        )
                      }

                      if (column.id === 'last-reviewed') {
                        return (
                          <TableCell
                            key={column.id}
                            data-column={column.id}
                            className={cn('whitespace-normal tabular-nums', column.className)}
                          >
                            {row.reviewedAt === undefined
                              ? null
                              : row.reviewedAtLabel === undefined
                                ? row.reviewedAt
                                : row.reviewedAtLabel(row.reviewedAt)}
                          </TableCell>
                        )
                      }

                      return (
                        <TableCell
                          key={column.id}
                          data-column={column.id}
                          className={cn('whitespace-normal', column.className)}
                        >
                          {row.href === undefined ? null : (
                            <a
                              data-slot="retention-href"
                              href={row.href}
                              className="text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors duration-fast ease-out focus-visible:ring-[3px] focus-visible:outline-none"
                            >
                              {row.hrefLabel}
                            </a>
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
                <TableRow data-slot="retention-summary">
                  <TableCell colSpan={Math.max(columns.length, 1)} className="whitespace-normal">
                    {/*
                      The figures, inside the table so they travel with it. A band of
                      metrics below the table is a band a reader navigating the table
                      never meets, and a crawler reads as unrelated to the rows above.
                    */}
                    <span className="flex flex-wrap items-start gap-x-10 gap-y-4">
                      {summary.map((figure) => (
                        <Metric
                          key={figure.label}
                          data-slot="retention-summary-figure"
                          value={figure.value}
                          label={figure.label}
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

export default Retention01
