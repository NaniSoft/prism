import type { ReactNode } from 'react'

import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * The four cells a limit row can draw, and the set is closed.
 *
 * A specification row is a measurement, and a measurement has four parts: what was
 * measured, what it measured, in what unit, and under what conditions. Anything
 * else is not a fifth cell, it is a fact that belongs in the note. Closing the set
 * is what lets the Block keep a real table with a real row header while the four
 * column names stay the caller's, and the cost of the closure is named on
 * `SpecTableColumn`: a capability whose limits need a fifth column cannot render it
 * here.
 */
export type SpecTableCell = 'label' | 'value' | 'unit' | 'note'

/**
 * One column of the table: which cell it draws, and the words above it.
 *
 * `header` is a prop and `id` is not, for the reason `ResourceListColumn` states:
 * what a reader needs a column called varies by product, and "Limit", "Measure" and
 * "Property" are three names for one column and only the set's owner can say which
 * is right. `className` is layout, applied to the header cell and to every cell
 * under it, and it changes where a column sits and never what a cell looks like.
 */
export type SpecTableColumn = {
  /** Which of the four cells this column draws. */
  id: SpecTableCell
  /** The column's name, in the product's own words. */
  header: ReactNode
  /** Layout classes for the column. Alignment and a fixed width are what this is for. */
  className?: string
}

/**
 * One limit: what is measured, what it measures, the unit, and the caveat.
 *
 * `value` is a `ReactNode` and that is the whole of this Block's contract with the
 * caller: a number on a specification page is a measurement somebody made, and this
 * Block cannot see it, cannot check it and must not print it. See the Block's JSDoc
 * for the three things it therefore refuses to do with a figure.
 */
export type SpecTable01Row = {
  /** The limit's stable key, carried on the markup as `data-row`. */
  id: string
  /**
   * What is measured, in the product's own words.
   *
   * It is the row header, so a screen reader announces it with every cell beneath
   * it, and it is the sentence a reader checks the value against. It is a `string`
   * rather than a node because a column of terms is read by scanning the left edge
   * and a term that wraps costs every other row its alignment.
   */
  label: string
  /**
   * The measured value, exactly as the caller composed it.
   *
   * A node and not a number, for the reason `Metric` gives for its own `value`: a
   * caller's figure is very often a value it formatted itself, and a `number` prop
   * would make it either ship that as a string outside this Block or lose the
   * precision it belongs to. Prism formats nothing here and rounds nothing here.
   */
  value: ReactNode
  /**
   * The unit the value is in, as a string beside it.
   *
   * Not part of `value`, and that separation is the decision this type exists to
   * hold. "12k" and "12 thousand" and "12000" are three renderings of one figure,
   * and which of them is right is a fact about the measurement and the audience:
   * a reader checking a bill wants the full number, a reader scanning a column wants
   * the short one, and a machine reading the export wants neither. So the caller
   * owns the rendering in `value` and owns the precision in `unit`, and the Block
   * draws them as two cells rather than concatenating them into one string it could
   * not take apart again.
   */
  unit?: string
  /**
   * The condition the value holds under.
   *
   * The sentence that qualifies the number beside it: the measurement window, the
   * percentile, the region it was taken in, the caveat that matters this month. It
   * is a node because it is frequently more than a string, and a caller who wants a
   * `CodeBlock` or a `Status` in it can pass one.
   */
  note?: ReactNode
  /**
   * Whether this is the row a reader should land on.
   *
   * Optional and a single boolean rather than a `tone`, because a specification has
   * no urgency axis. What it has is one limit that decides the answer for everybody
   * else on the page, and this row is the one to read first: the retention window
   * on a data table, the ceiling on a tier, the region a connector cannot reach
   * yet. The Block draws it in the foreground ink and at a heavier weight and adds
   * nothing else, because a reader who has to work out which row matters is doing
   * the Block's job. The cost is that weight is the only signal, so a caller with
   * two equally important limits should pass it on one and let the note carry the
   * other.
   */
  emphasis?: boolean
}

/**
 * One caller-named group of limits, drawn as one body of the table.
 *
 * `title` is a string rather than a node because a group name is read down the left
 * edge of the table and the same alignment argument applies. The groups are the
 * caller's own taxonomy: "Collection", "Retention", "Regions", "Limits" are four
 * shapes four products would use and Prism has no opinion on which of them is right.
 */
export type SpecTable01Group = {
  /** The group's own name, in the product's words. */
  title: string
  /** The limits in it, in the order a reader should meet them. */
  rows: readonly SpecTable01Row[]
}

/**
 * One figure in the summary band under the table, which is where a caller puts the
 * two or three numbers the whole specification reduces to.
 *
 * `value` is a node and `label` is a string, which is the same split every other
 * figure in this package makes: the label names what is measured and is read down a
 * column, and the value is whatever the caller composed for it.
 */
export type SpecTable01Summary = {
  /** What the figure measures. */
  label: string
  /** The figure, exactly as the caller composed it. */
  value: ReactNode
}

/**
 * The props a SpecTable01 takes.
 *
 * Every figure is a prop and the Block ships none. There is no throughput number,
 * no retention window, no region list and not one column heading: a specification
 * table is a set of claims about a product's limits, and a Block that shipped a
 * figure would be publishing a measurement it never made.
 */
export type SpecTable01Props = {
  /** Optional label above the section title. It has no default. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * Required for the same reason `ResourceList01`'s is: a table carries no caption
   * here because the heading above it names it, which `table.tsx` states as the
   * exception to its own rule. A specification with no heading above it is a table
   * with no name, and a table with no name is four columns a screen reader user has
   * to be told about out loud.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order the reader should meet them.
   *
   * Order is the caller's because a specification has two plausible orders and each
   * is a claim: what it handles first for a reader deciding, what it costs first for
   * a reader already committed. The `label` column has to be among them and the run
   * fails without it, because the label is the row header every other cell is read
   * under.
   */
  columns: readonly SpecTableColumn[]
  /**
   * The groups, in the order a reader should meet them, each with its limits.
   *
   * A group with no limits is not drawn. A group name over an empty body is a
   * heading with nothing under it, which is the defect every list in this package
   * avoids by rendering nothing rather than rendering a frame. The cost is that a
   * caller who wants a named empty group has to say so in the `empty` node instead.
   */
  groups: readonly SpecTable01Group[]
  /**
   * The figures the whole table reduces to, drawn as `Metric` under it.
   *
   * Optional, and the Block composes `Metric` rather than drawing its own figure
   * row, for the reason `ChartCard01` and `Dashboard01` give: a figure has an
   * arrangement, it has a rule about whether a string is set in the mono face, and
   * it has one about where the label goes relative to the value. Re-deriving any of
   * that here would put a second answer to "how does a figure read" in one package.
   * `label` is a string because `Metric` names the figure with a node and a band of
   * figures is read down its left edge, and `value` is a node because `Metric` takes
   * one and this Block formats nothing.
   */
  summary?: readonly SpecTable01Summary[]
  /**
   * The caller's own sentence for a specification with no rows in it.
   *
   * Required, and a node. A specification table with nothing in it means three
   * different things to three different readers, and only the caller knows which:
   * the capability publishes no limits, the limits have not loaded, or the capability
   * is not available in this region. "No limits published" is English and it is the
   * one sentence on the page a reader is guaranteed to read.
   */
  empty: ReactNode
  /**
   * Heading level for the section title.
   *
   * Defaults to `h2` because a Block is composed, not a page. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The classes each cell takes, before the caller's own layout classes merge in.
 *
 * The value is tabular and the unit is mono, which are two different answers to two
 * different questions. Tabular figures are for a column a reader compares down, and
 * a unit is a short notation rather than a figure, so it takes the face this system
 * annotates machine-readable values with. Neither is a raw ramp utility and both are
 * authored steps.
 */
const CELL: Record<SpecTableCell, string> = {
  label: 'text-foreground whitespace-normal',
  value: 'tabular-nums whitespace-normal',
  unit: 'text-muted-foreground font-mono whitespace-nowrap',
  note: 'text-muted-foreground whitespace-normal',
}

/**
 * A capability's limits as a real table, grouped, with a summary band underneath.
 *
 * **The storefront version of this pattern is a product's specification table, and
 * the translation is what the numbers are about.** What that table publishes is a
 * list of attributes for an item for sale: the material, the weight, the dimensions,
 * the care instructions, in a two-column table under a heading, sometimes grouped
 * into sections. Every part of the layout and every part of the accessibility work
 * transfers without a change, because a specification is a table whichever subject it
 * describes: a screen reader announces the row's name with every cell beneath it in
 * one, and a table of key and value cells in a grid of `div`s does not. What does not
 * transfer is the subject. The figures here are a capability's limits: what it
 * handles, what it costs, what it will not do. A reader arrives at that table to
 * decide whether the thing can carry their estate, their market or their run, and the
 * only reason the pattern survives the translation intact is that the access work
 * was never about the noun.
 *
 * **This Block will not derive a value, infer a unit, or round a number, and those
 * three refusals are the reason it exists rather than a limitation of it.** A
 * specification table is the one surface in this system where a number a reader
 * cannot check is a liability rather than a convenience: every figure on it is
 * something the reader is about to plan against, and a figure this package printed
 * would be a measurement the product never made. So a throughput number is a node
 * the caller composed, a unit is a string the caller wrote, and a precision is the
 * caller's decision made in its own formatter before the value reached this Block.
 * The alternatives were each rejected for the same reason and are worth naming. A
 * `format` prop would move the arithmetic into this package and put a locale and a
 * rounding rule into a Block that has no business choosing either. A `number` value
 * would make the caller format outside the Block or lose the precision it belongs
 * to, and a number prop is what produced a bare `12000` on a page that should have
 * said `12,000`. And a `compact` or `approximate` boolean would be a rounding rule
 * with no name, applied to a figure this package cannot see the meaning of, and a
 * rounded retention window is a wrong retention window.
 *
 * **`unit` is a string beside the value and not part of it, because "12k", "12
 * thousand" and "12000" are three renderings and the caller owns the precision as
 * well as the number.** Which of the three is right is a fact about the measurement
 * and the audience rather than about the measurement alone: a reader reconciling a
 * bill wants the full number, a reader scanning a column of twelve wants the short
 * one, and a machine reading an export wants neither. Concatenating the unit into
 * the value would also make the unit unaddressable: a screen reader announces a run
 * of characters, and a column of units aligned under a column of figures is a
 * comparison a reader can make in a way a run of strings is not. The cost is that a
 * caller who wants them joined has to join them, which is the right place for the
 * decision because it is their figure and their audience.
 *
 * **A group is a body and not a merged cell, for the reason `ResourceList01` states
 * in full.** A reader navigates a table by its headers, and a cell spanning every
 * row of a group is a `<td rowspan="n">`, which is not a header at all. A group named
 * in one such cell is announced once, to nobody in particular, and every row beneath
 * it looks to a reader navigating by header like a row of the group above. The same
 * set rendered as a sequence of bodies inside one table has the group as each body's
 * own row-group header, and a reader hears the group before the first row of it
 * every time.
 *
 * **It is one `<table>` and not one table per group.** The groups are facets of one
 * set rather than separate documents, the columns are the same in each, and a reader
 * who has learned the columns in the first body has learned them for the rest. The
 * honest cost is that a reader navigating by column header meets the columns before
 * the group, not after it. A caller whose groups are separate documents wants one
 * table per group, which is two `SpecTable01`s.
 *
 * **The row header is the limit's own label and the note is the cell that
 * qualifies it.** Neither is shortened here. A specification without its conditions
 * is a claim about every case rather than about the one it was measured in, which is
 * a stronger claim than a product can usually support, and this Block does not write
 * the scope for them.
 *
 * **A specification with no rows renders the caller's `empty` sentence and no
 * table at all**, which is the opposite of what `Compliance01` does with an empty
 * claims table and the same argument applied to a different surface. A compliance
 * section wants its heading visible so a reader can see that nothing is published
 * there; a specification table with a header row and no body is four column names
 * and nothing else, which tells a reader less than the sentence the caller wrote for
 * exactly this case. The cost is that a heading can survive on a page whose limits
 * have all been withdrawn, and a consumer who would rather see nothing should not
 * render the Block.
 *
 * **The heading is aligned left**, because the table is content and it sits under the
 * heading. `SectionHeading` states the rule and this Block has rows underneath it.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and the
 * vertical rhythm rather than re-deriving either, and it adds no container width and
 * no section padding of its own.
 *
 * It is a server Component: no hook, no state, no client code and no motion. Every
 * figure it draws is the caller's node, passed straight through.
 */
export function SpecTable01({
  eyebrow,
  title,
  description,
  columns,
  groups,
  summary,
  empty,
  headingLevel = 'h2',
  className,
}: SpecTable01Props) {
  const rows = groups.flatMap((group) => group.rows)

  /*
   * Checked before anything is drawn, so the run fails once with the name of the
   * field rather than once per row with a malformed table on the page.
   */
  const seen = new Set<SpecTableCell>()
  for (const column of columns) {
    const id = column.id
    if (seen.has(id)) {
      throw new Error(
        `SpecTable01: the column "${id}" is declared twice, so the table would have two columns ` +
          'reading the same value and every cell after the first would be read under the wrong name. ' +
          'Declare each cell once.',
      )
    }
    if (id !== 'label' && !rows.some((row) => carries(row, id))) {
      throw new Error(
        `SpecTable01: the "${id}" column was declared and no limit carries it, so the table would ` +
          'carry a column of empty cells, which is a column every reader scans twice. Pass the value on at ' +
          'least one limit, or drop the column.',
      )
    }
    seen.add(id)
  }
  if (!seen.has('label')) {
    throw new Error(
      'SpecTable01: the columns name no "label" cell, so the header row would have a cell fewer than every ' +
        'body row and no row would have a header for a reader to navigate into. Declare the label column, ' +
        'which is also the row header for every row.',
    )
  }

  const rowIds = new Set<string>()
  for (const row of rows) {
    if (rowIds.has(row.id)) {
      throw new Error(
        `SpecTable01: two limits share the key "${row.id}", so one of them is drawn with the other's ` +
          'identity and a test cannot name which is which. Give every limit its own key.',
      )
    }
    rowIds.add(row.id)
  }

  // A group with no limits is not drawn: a group name over an empty body is a
  // heading with nothing under it, which is the frame-with-nothing-in-it every list
  // in this package refuses to render.
  const drawn = groups.filter((group) => group.rows.length > 0)

  return (
    <Section data-slot="spec-table-01" className={className}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {drawn.length === 0 ? (
        /*
         * The caller's own sentence, drawn where the table would have been rather
         * than above it, so a reader is not left with four column names and no rows.
         * `text-pretty` because the honest empty line is sometimes a paragraph and
         * `text-balance` would leave a one-word last line in it.
         */
        <p data-slot="spec-table-01-empty" className="text-muted-foreground max-w-measure-narrow text-pretty">
          {empty}
        </p>
      ) : (
        <>
          <div
            data-slot="spec-table-01-table"
            className={cn('border-border overflow-hidden rounded-xl border', className)}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.id}
                      scope="col"
                      className={cn(CELL[column.id], column.className)}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {drawn.map((group, groupIndex) => (
                // The group title is the caller's own and two groups may carry the
                // same one, so the position is part of the key rather than a second
                // identifier the Block would have to ask for.
                <TableBody key={`${group.title}-${groupIndex}`}>
                  {/*
                    One body per group, and the group named once in a header cell
                    scoped to the row group. The alternative, a cell with a `rowspan`
                    across every row of the group, is not a header: a screen reader
                    navigating by header passes straight over a data cell, so the
                    group would be announced once to nobody and every row beneath it
                    would look like a row of the group above.
                  */}
                  <TableRow>
                    <TableHead scope="rowgroup" colSpan={columns.length} className="bg-muted/50">
                      <span
                        data-slot="spec-table-01-group"
                        className="text-foreground text-sm font-semibold"
                      >
                        {group.title}
                      </span>
                    </TableHead>
                  </TableRow>

                  {group.rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-slot="spec-table-01-row"
                      data-row={row.id}
                      data-emphasised={row.emphasis === true}
                    >
                      {columns.map((column) =>
                        /*
                         * The limit's own label is the row header, so a reader who
                         * navigates into a single cell is told what is being measured
                         * rather than hearing a figure with nothing to attach it to.
                         */
                        column.id === 'label' ? (
                          <TableHead
                            key={column.id}
                            scope="row"
                            className={cn(
                              CELL[column.id],
                              // The emphasised row is the one a reader should land on,
                              // so it is drawn in the foreground ink at a heavier
                              // weight and nothing else is added to it.
                              row.emphasis === true ? 'text-foreground font-semibold' : null,
                              column.className,
                            )}
                          >
                            {row.label}
                          </TableHead>
                        ) : (
                          <TableCell
                            key={column.id}
                            className={cn(
                              CELL[column.id],
                              column.id === 'value' && row.emphasis === true ? 'font-medium' : null,
                              column.className,
                            )}
                          >
                            {cellOf(column.id, row)}
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              ))}
            </Table>
          </div>

          {summary === undefined || summary.length === 0 ? null : (
            /*
             * The band of figures the table reduces to. `Metric` draws each one,
             * because a figure has an arrangement and a rule about the mono face and
             * a rule about where the label sits, and re-deriving any of those here
             * would be a second answer in one package.
             */
            <div
              data-slot="spec-table-01-summary"
              className="border-border bg-muted/40 mt-6 grid gap-6 rounded-xl border px-6 py-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {summary.map((entry) => (
                <Metric key={entry.label} value={entry.value} label={entry.label} />
              ))}
            </div>
          )}
        </>
      )}
    </Section>
  )
}

/**
 * Whether one limit carries the value a column draws.
 *
 * A separate step so the column check reads as a sentence rather than as a chain of
 * optional fields, and so a fifth cell added later is one line here rather than four
 * edits across the checks above.
 */
function carries(row: SpecTable01Row, id: Exclude<SpecTableCell, 'label'>): boolean {
  switch (id) {
    case 'value':
      return row.value !== undefined && row.value !== null
    case 'unit':
      return row.unit !== undefined
    case 'note':
      return row.note !== undefined
  }
}

/**
 * The cell one column draws for one limit.
 *
 * A switch rather than a map of render functions, for the reason `FieldMap01`
 * gives: a map keyed by cell id would be a second recipe of the kind this package
 * keeps off the public surface, and a switch over four cases is the same table with
 * the strings in the same file as the drawing that uses them.
 */
function cellOf(id: SpecTableCell, row: SpecTable01Row): ReactNode {
  switch (id) {
    case 'label':
      return row.label
    case 'value':
      return row.value
    case 'unit':
      return row.unit ?? null
    case 'note':
      return row.note ?? null
  }
}

export default SpecTable01
