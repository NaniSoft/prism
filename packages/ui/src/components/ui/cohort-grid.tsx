import type { ComponentProps, ReactNode } from 'react'

import type { IntensityLevel } from './intensity-grid'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { cn } from '../../lib/utils'

/**
 * One column of the matrix, which is an offset from a row's own start.
 *
 * The key is a handle for the markup and the label is what a reader reads, and the
 * split is the same one `IntensityGrid` uses for both of its axes. The words are
 * the caller's because an offset is written in the product's own terms: "Week 1",
 * "Month 3", "Day 30", "the first renewal", and a Component that composed one of
 * those would be a Component shipping an English calendar into every consumer's
 * product.
 */
export type CohortGridColumn = {
  /** A stable handle for this offset, read by no one. */
  key: string
  /** The offset's own name, printed as the column header. */
  label: ReactNode
}

/**
 * One cohort, and the share still present at each offset.
 *
 * **A `null` is an offset the cohort has not reached, and it is not a zero.** This
 * is the whole data model of a retention matrix: the youngest cohort has one
 * reading and the oldest has twelve, so the matrix is ragged and its top corner is
 * empty by arithmetic rather than by measurement. A zero means every member of the
 * cohort had gone by that offset; a `null` means the cohort had not got there. They
 * draw differently here, a zero prints `0%` and a `null` prints nothing, and they
 * sound different because one of them is read and the other is blank.
 *
 * Every row must have exactly as many entries as there are columns, a `null` for
 * each offset the cohort has not reached. That is stricter than it needs to be and
 * the strictness is the point: a short row and a row of nulls draw the same, and
 * only the second one says what it means.
 */
export type CohortGridRow = {
  /**
   * A stable handle for this cohort, read by no one.
   *
   * A string is required rather than made optional because it is the only identity
   * a row has once its label is a node, and it is what lets a caller reorder rows
   * without the matrix changing anything else.
   */
  key: string
  /** The cohort's own name, printed as its row header. */
  label: ReactNode
  /** The share still present at each offset, in the order the columns are given. */
  shares: readonly (number | null)[]
}

/**
 * The fill each step is drawn in, from the contract's roles and no other.
 *
 * The five entries `IntensityGrid` and `ContributionGraph` both draw from, spelled
 * here because each of those modules keeps its own map to itself, and the honest
 * cost is the one they state between them: a change to the intensity scale is now
 * three edits rather than one. What keeps the three in step is the type, which is
 * imported from `IntensityGrid` rather than redeclared, so a sixth step is a type
 * error at all three maps at once instead of a cell that silently falls through to
 * no ink in whichever file nobody remembered.
 *
 * Step zero is the `muted` surface rather than a pale primary, so a cohort that has
 * nothing left is visibly a different thing from a cohort with a little left. The
 * other four are the same `primary` role at four alpha steps, which is one token at
 * four strengths: five authored colours would be a second set of colour tokens for a
 * scale the alpha modifier already expresses, and they would not move with a scoped
 * pack boundary.
 */
const LEVEL_FILL: Record<IntensityLevel, string> = {
  0: 'bg-muted',
  1: 'bg-primary/25',
  2: 'bg-primary/50',
  3: 'bg-primary/75',
  4: 'bg-primary',
}

/**
 * The ink a cell's number is printed in, from the same step.
 *
 * The inverse on the top step only, and it is `primary-foreground` on `primary`
 * because that is the contract's own pairing for a filled control and the contrast
 * gate already measures it at 4.5:1 in every pack and both modes. The other four
 * keep `foreground`, which clears the page and the muted surface under a quarter
 * and a half of a primary. Inverting anything earlier would have meant light ink on
 * a light shade, which is a legibility failure dressed as a consistency.
 */
const LEVEL_INK: Record<IntensityLevel, string> = {
  0: 'text-foreground',
  1: 'text-foreground',
  2: 'text-foreground',
  3: 'text-foreground',
  4: 'text-primary-foreground',
}

/**
 * Where a share sits on the caller's scale, as a step.
 *
 * **Quartiles of the caller's scale, and not of the data.** The scale runs from
 * `min` to `max` and defaults to zero and a hundred, because a share of a cohort is
 * an absolute quantity and two months of the same product must be comparable. A
 * grid that fitted its scale to the rows in front of it would make a cohort whose
 * members all left draw as dark as a cohort that kept everyone, which is the quietest
 * and worst way a retention table can be wrong.
 *
 * The cost is the same argument in reverse and it is real: once a product's cohorts
 * are all below a quarter, the grid goes uniformly pale and the reader gets no
 * contrast in it. The answer is `min`, which raises the floor of the scale on
 * purpose and is documented as a claim the caller has to own, because a scale that
 * starts at twenty and a table that does not are two truths about the same grid.
 *
 * **`max` cannot do that job here, and the reason is the first column.** A
 * retention row's own starting column is a hundred percent by definition, so a
 * scale that stops below a hundred is a scale the data cannot be drawn against,
 * and this Component throws rather than clamp because a clamped cell is a cell
 * claiming its share is the ceiling. Narrowing the scale therefore means raising
 * `min`, and it means the last column of an old cohort and the second column of a
 * new one are the two cells a reader compares. That is a real limit on the knob
 * rather than a default that happened to land well, and a caller who wants the
 * saturation the low `max` was reaching for has to leave the first column out of
 * `columns` and say in the caption what the offsets now begin at.
 */
function levelOf(share: number, min: number, max: number): IntensityLevel {
  const span = max - min
  const position = span <= 0 ? 1 : (share - min) / span
  if (position <= 0) return 0
  if (position <= 0.25) return 1
  if (position <= 0.5) return 2
  if (position <= 0.75) return 3
  return 4
}

/** The props the CohortGrid accepts. */
export interface CohortGridProps extends Omit<ComponentProps<'figure'>, 'children'> {
  /**
   * The cohorts, in the order they are read.
   *
   * The order is the caller's and nothing here sorts: the ordinary order is newest
   * first, because the youngest cohort is the one being watched, and a Component
   * that ordered by key size or by value would put the reader's question somewhere
   * else.
   */
  rows: readonly CohortGridRow[]
  /** The offsets, in the order they are read. */
  columns: readonly CohortGridColumn[]
  /**
   * The name of the matrix, printed as the table's caption.
   *
   * Required rather than defaulted, for the two reasons `ChartFrame` states and the
   * rest of the package repeats: two retention tables on one page are two tables a
   * reader cannot tell apart, and a table with no name is neither announced nor
   * linkable.
   *
   * **It is the caption and not an `aria-label` on the figure**, which is the one
   * place this package's figures differ. `Chart` puts its name on the figure and
   * keeps its table visually hidden, so the name has to be spoken from the figure.
   * Here the table is the figure and the caption is visible, and a name said on the
   * figure and again by the caption is a name a reader hears twice on the way into
   * the same data.
   */
  label: string
  /**
   * The name of the column holding the cohort names, drawn in the corner.
   *
   * Optional, and a retention table that has one nearly always does: the corner is
   * the only cell that names the row headers, and leaving it empty is honest because
   * every row head already names itself. Omitted, the corner is an empty cell rather
   * than a word Prism chose, which is the whole reason it is not required.
   */
  rowHeading?: ReactNode
  /**
   * The lower end of the scale the shading is drawn against. @defaultValue 0
   *
   * Zero because a share of a cohort is measured from nothing: the cohort at its
   * first offset is the whole of itself. A caller whose measure starts above zero
   * passes it, and the cost is that a cell at the floor and a cell with nothing in
   * it draw the same way, which is what a floor means.
   */
  min?: number
  /**
   * The upper end of the scale the shading is drawn against. @defaultValue 100
   *
   * A hundred because that is the whole cohort, and a scale that tops out below it
   * exaggerates every difference in the grid. Pass a lower number when the useful
   * range is narrow, and treat it as a claim the reader has been told rather than
   * one they have inferred: see the note on the helper above.
   */
  max?: number
  /**
   * How many decimal places each cell is printed to. @defaultValue 0
   *
   * Whole numbers, because a retention grid is a shape rather than a set of
   * measurements, and a column of one-decimal percentages on a mobile screen is
   * wider than the numbers are worth. Pass `1` when the underlying counts are small
   * enough that a point of a percent is a real difference.
   */
  precision?: number
  /**
   * The sentence under the table, which is where the measure belongs.
   *
   * The caller's words, and required in practice though optional in the type,
   * because the cells print bare numbers: this is the sentence that says what the
   * numbers are a share of. "Of the accounts that were active in the month they
   * signed up" is a claim about a product this Component knows nothing about, so it
   * is the caller's to write, and a grid with no sentence under it says only what
   * its numbers say.
   */
  caption?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A retention matrix, read as a table of printed percentages under one scale.
 *
 * **It is a table, and that is the Component rather than an implementation
 * detail.** A retention grid is the one data display whose job is to be read one
 * cell at a time: a reader asks "what share of the March cohort was still sending
 * readings at month three", and the answer is a cell. `Table` is that answer, with
 * row and column headers, a caption and per-cell navigation, all of which the
 * percentages need and a drawing of divs would throw away. So this Component
 * composes `Table` rather than replacing it, and what it adds is the four things a
 * generic table has no opinion about: the shape of the data, the scale the shading
 * is drawn against, the difference between an offset not reached and a share of
 * nothing, and the order in which a cell is printed and shaded.
 *
 * **How it differs from `Table`, precisely.** `Table` holds no domain, no scale and
 * no claim: it gives a caller seven parts and gets out of the way, which is exactly
 * what a caller with arbitrary columns wants and exactly what a retention grid does
 * not, because a retention grid knows that its columns are ordinal offsets from
 * each row's own start and that its cells are shares. So the difference is not the
 * markup, it is the four refusals. There is no way to add a column beside the
 * matrix, because an extra column is not an offset. There is no way to shade a cell
 * by hand, because the shade is the value and a hand-set shade would be a second
 * claim about it. There is no way to pass rows of unequal length, because a short
 * row is a row of nulls that says nothing about which offsets were measured. And
 * there is no way to print anything but a number, because the cell's whole content
 * is the share. A caller who needs any of those is building a table, and `Table` is
 * the Component for it.
 *
 * **There is no horizontal scale, and the columns are ordinal rather than
 * continuous.** Each column is an offset, and the offsets are the same *number* on
 * every row while the *periods* they stand for are not: the March cohort's month
 * three and the September cohort's month three are two different months in the
 * calendar. So there is no axis, no tick spacing and no interpolation, and nothing
 * may be read as "the cell halfway between these two". A measure that varies along
 * a continuous domain is `Chart`; a measure along an ordinal offset is this. That is
 * also why a retention grid cannot be a heat map of categories in the
 * `IntensityGrid` sense even though both shade cells: the columns there are names
 * with no order at all, and here they are ordered offsets that every row reads
 * differently.
 *
 * **Print, then shade, and the order is the design.** Every cell carries its share
 * as a number in the caller's own unit, and the shade is laid over the cell behind
 * it. Neither channel is optional and neither is the fallback: a reader who cannot
 * rank five steps of one hue reads every number in the grid, and a reader who cannot
 * see the pale end of the scale still has the numbers, which is the arrangement
 * `IntensityGrid` refuses on purpose for the opposite reason. The consequence is
 * that shading must never be the only carrier of the number, and this Component
 * makes that structural rather than advisory by printing unconditionally and by
 * refusing a cell it cannot put a number in. It is also why the cells are the
 * figure's own visible content rather than a table generated from a drawing: there
 * is no drawing to generate a table beside.
 *
 * **The scale is absolute by default, and `max` is a claim the caller owns.** See
 * the note on the helper: quartiles of `min` to `max`, defaulting to zero and a
 * hundred, so two months of the same product are comparable. The cost is that a
 * product whose cohorts all collapse below a quarter loses the contrast, and the
 * answer is a narrower `max` which exaggerates on purpose. A retention grid that
 * silently rescaled itself to flatter the rows in front of it would be the exact
 * failure `Chart` names for a pre-normalised caller, and a table of retention
 * percentages is the last place to ship one.
 *
 * **Nothing here moves, and the reason is the same as everywhere else in this
 * family.** A hover state on a cell would have to change the cell's surface, and the
 * surface is what the number is printed on, so a hover would change the reading
 * while the pointer rested on it. A row wash would do the same to every cell in the
 * row at once. So the grid is static by construction, which is also the cheapest
 * reading of a motion law that permits only state feedback on a token duration.
 *
 * **Two inputs throw, and a drawn lie is worse than a refusal.** A row whose
 * `shares` are not one per column is a ragged row that would draw as if the missing
 * offsets had been measured and found empty, which is the one thing this data model
 * exists to prevent. A share outside `min` to `max` is a measurement that cannot be
 * placed on the scale, and the alternative was to clamp it, which is what `Chart`
 * does for a value past the end of its axis and what this Component deliberately
 * does not: a clamped retention cell is a cell that says its share is the ceiling
 * when it is not, in a table whose whole claim is that every number in it was
 * measured.
 *
 * **It is a server Component.** There is no state, no effect and no handler, every
 * cell is arithmetic over props, and a dashboard of cohorts costs no client code.
 */
function CohortGrid({
  className,
  rows,
  columns,
  label,
  rowHeading,
  min = 0,
  max = 100,
  precision = 0,
  caption,
  ...props
}: CohortGridProps) {
  // A nonsense `precision` is floored at zero rather than reaching `toFixed`, which
  // throws on a negative count, because a rounding instruction is a reading
  // instruction rather than a measurement and a typo in one should not take a page
  // down. The cost is that `precision={-1}` reads as `0`, which is the whole number
  // it was asking for anyway.
  const places = Math.min(20, Math.max(0, Math.floor(precision)))

  for (const row of rows) {
    if (row.shares.length !== columns.length) {
      throw new Error(
        `CohortGrid: the cohort '${row.key}' has ${String(row.shares.length)} share(s) for ` +
          `${String(columns.length)} column(s). Every row must have one entry per offset, and an offset ` +
          'the cohort has not reached is a null rather than a missing entry: a short row draws as a row ' +
          'of empties, which claims the cohort had nothing at those offsets instead of claiming it had ' +
          'not got there.',
      )
    }
    for (const share of row.shares) {
      if (share === null) continue
      if (!Number.isFinite(share) || share < min || share > max) {
        throw new Error(
          `CohortGrid: the cohort '${row.key}' carries the share ${String(share)}, which is not between ` +
            `the scale's own ends of ${String(min)} and ${String(max)}. A retention cell that cannot be ` +
            'placed on the scale it is drawn against has been measured against a different one, so this ' +
            'stops rather than clamping it to the ceiling and printing a number the data does not hold.',
        )
      }
    }
  }

  return (
    <figure data-slot="cohort-grid" className={cn('flex w-full flex-col gap-3', className)} {...props}>
      {/*
        `Table` carries its own scroll container, which is what a matrix of fifteen
        offsets needs on a narrow screen: the cohort column is the one a reader
        navigates by, and the offsets are the ones that scroll past it.
      */}
      <Table>
        <TableCaption>{label}</TableCaption>
        <TableHeader>
          <TableRow>
            {rowHeading === undefined ? (
              <TableHead className="w-32" />
            ) : (
              <TableHead className="w-32">{rowHeading}</TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.key} scope="col" className="text-center tabular-nums">
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} data-cohort={row.key}>
              <TableHead scope="row" className="font-medium whitespace-nowrap">
                {row.label}
              </TableHead>
              {columns.map((column, at) => {
                const share = row.shares[at]
                if (share === null) {
                  return (
                    <TableCell
                      key={column.key}
                      data-offset={column.key}
                      data-state="not-reached"
                      className="text-center tabular-nums"
                    />
                  )
                }
                const level = levelOf(share, min, max)
                return (
                  <TableCell
                    key={column.key}
                    data-offset={column.key}
                    data-level={level}
                    className={cn('text-center tabular-nums', LEVEL_FILL[level], LEVEL_INK[level])}
                  >
                    {share.toFixed(places)}
                    {/*
                      The unit is a symbol rather than a word, and it is here because
                      the measure is this Component's own: a cell in a retention
                      matrix is a share of a cohort and a share is a percentage in
                      every product that computes one. The alternative was leaving the
                      number bare and making every caller repeat the unit in the
                      caption, which puts one fact in four places.
                    */}
                    %
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {caption === undefined ? null : (
        <p data-slot="cohort-grid-caption" className="text-muted-foreground text-sm">
          {caption}
        </p>
      )}
    </figure>
  )
}

export { CohortGrid }
