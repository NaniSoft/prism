import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The five steps of the intensity scale, from an empty cell to a full one.
 *
 * A five-step scale and not a continuous ramp, for the reason `ContributionGraph`
 * gives for its calendar: a reader has to compare two cells at a glance, and a
 * continuous scale is smooth and unreadable. The difference between one cell and
 * the cell beside it is a few percent of opacity, which is nothing to see, while
 * the difference between step two and step three is a band the eye can sort without
 * being told what the bands mean.
 *
 * The type is a closed five rather than a number because the shade is what the
 * reading is graded against, and a step is a grade. It is also the one thing in
 * this Component that is not arithmetic over the caller's values.
 */
export type IntensityLevel = 0 | 1 | 2 | 3 | 4

/**
 * One cell: which row, which column, and the value its shade is drawn from.
 *
 * A triple and not a nested array because the caller's store is already keyed this
 * way. A matrix is a table, a table is keyed on two columns plus the measure, and
 * asking a caller to transpose their rows into a two-dimensional array to draw one
 * is a conversion this Component would then have to get wrong in one direction.
 * The keys name a row and a column rather than carrying indices, so a caller can
 * pass the cells in any order and the drawing cannot move.
 */
export type IntensityGridCell = {
  /** The `key` of the row this cell belongs to. */
  rowKey: string
  /** The `key` of the column this cell belongs to. */
  columnKey: string
  /**
   * The measured value, in the caller's own units.
   *
   * Raw magnitudes rather than a share of a maximum, for the reason
   * `ContributionGraph` states and `Chart` states again: a caller that
   * pre-normalises has two chances to get the scale wrong, and a mislabelled scale
   * is a lie with a typeface on it. The largest value drawn sets the top of the
   * scale here and the caller divides nothing.
   */
  value: number
}

/**
 * One row of the matrix, and the name a reader sees for it.
 *
 * The `key` is separate from the `label` because a label is a node and a cell
 * refers to its row by a string. That is also what lets the caller compose a cell's
 * spoken form from both axes: `cellLabel` receives the row and the column as they
 * were passed, so the words in a cell's name are the words on the two headers.
 */
export type IntensityGridRow = {
  /** How a cell refers to this row. Stable, and not shown. */
  key: string
  /** The row's name, in the caller's words. */
  label: ReactNode
}

/**
 * One column of the matrix, and the name a reader sees for it.
 *
 * The mirror of `IntensityGridRow`, and for the same reason: a cell refers to its
 * column by a string and the header is a node.
 */
export type IntensityGridColumn = {
  /** How a cell refers to this column. Stable, and not shown. */
  key: string
  /** The column's name, in the caller's words. */
  label: ReactNode
}

/**
 * One band of the caller's scale, and the step a cell inside it is filled at.
 *
 * **The band is a range on the caller's scale and `from` is a share of the largest
 * value drawn**, so a caller states its scale in the same percentages the reader
 * will think in, and four bands from 0 to 100 in quarters is the ordinary case. The
 * range is inclusive at both ends and the first band that contains a cell's share
 * is the band that applies, so a caller with an overlapping scale says which band
 * wins by saying it first.
 *
 * Step zero is the empty cell's own fill, which is how a caller says "this band is
 * genuinely nothing" as distinct from "there is no cell here". The two draw the
 * same on purpose, because there is no third drawing available, and the difference
 * survives in the markup rather than in the picture: a pair with no cell carries
 * `data-state="absent"` and a cell in a zero band does not.
 */
export type IntensityGridBand = {
  /** The lowest share of the largest value drawn that falls in this band, as a percentage. */
  from: number
  /** The highest share that falls in this band, as a percentage. */
  to: number
  /** The step every cell in this band is filled at. */
  level: IntensityLevel
}

/**
 * The fill each step is drawn in, from the contract's roles and no other.
 *
 * The same five entries `ContributionGraph` draws from, spelled here because that
 * module keeps its maps to itself, and the honest cost is the one it states: a
 * change to the intensity scale is two edits rather than one. What keeps the
 * restatement from drifting is the annotation, because both maps are typed
 * `Record<IntensityLevel, string>`, so a sixth step would be a type error at the
 * map rather than a cell that silently falls through to no ink.
 *
 * Step zero is the `muted` surface rather than a pale primary, so "nothing here" is
 * visibly a different thing from "a little here". The other four are the same
 * `primary` role at four alpha steps, which is one token at four strengths: a ramp
 * of five authored colours would have been a second set of colour tokens for a
 * scale the alpha modifier already expresses, and it would not have moved with a
 * scoped pack boundary the way an alpha step on one semantic role does.
 */
const LEVEL_FILL: Record<IntensityLevel, string> = {
  0: 'bg-muted',
  1: 'bg-primary/25',
  2: 'bg-primary/50',
  3: 'bg-primary/75',
  4: 'bg-primary',
}

/**
 * A cell's share of the largest value drawn, as a percentage of it.
 *
 * A non-finite value is zero rather than `NaN`, because a value that went missing
 * is data that is wrong and not a value that is small, and letting it into the
 * maximum would stretch the scale around every other cell in the grid. It is drawn
 * as the empty cell and named like any other, so a bad reading looks like nothing
 * rather than like everything, which is the one way this Component can be wrong
 * without saying so.
 */
function shareOf(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  if (max <= 0) return 0
  return (value / max) * 100
}

/** The props the IntensityGrid accepts. */
export interface IntensityGridProps extends Omit<ComponentProps<'figure'>, 'children'> {
  /**
   * The rows, in the order they are drawn and read.
   *
   * Every row is drawn, whether or not a cell names it, because a matrix that
   * dropped an empty row would move every row below it up one line and the columns
   * would stop being the columns they were a moment ago.
   */
  rows: readonly IntensityGridRow[]
  /** The columns, in the order they are drawn and read. */
  columns: readonly IntensityGridColumn[]
  /**
   * The cells, in any order. Each one is placed by its own keys.
   *
   * **A pair with no cell is an absence and is drawn as the empty cell**, which is
   * the same decision `ContributionGraph` makes for a day nobody reported and for
   * the same reason: there is no third drawing available. A hole would imply a
   * measurement and a faint band would claim a number.
   *
   * A cell naming a row or a column that was not given throws, because the only
   * other outcome is a cell that is silently dropped and a caller left believing
   * the whole matrix was drawn. A datum nobody can see is worse than a build that
   * stops.
   */
  cells: readonly IntensityGridCell[]
  /**
   * The name of the figure, read before the cells.
   *
   * Required rather than defaulted, for the two reasons `ChartFrame` states and
   * `ContributionGraph` repeats: two matrices on one page are two figures a reader
   * cannot tell apart, and a picture with no name is neither announced nor
   * linkable. A figure named "Grid" is a Component shipping a sentence about a
   * product it knows nothing about.
   */
  label: string
  /**
   * The accessible name of one cell, given the cell and both of its axes.
   *
   * Required, and it is the one prop here that is a function rather than data,
   * because it is the one thing Prism cannot compose. "42 findings on Kiln Wharf in
   * March" is a sentence in a language and a calendar, and a design system that
   * wrote it would put English and a Gregorian month name into every consumer's
   * product. The row and the column are passed whole, so the caller can say as much
   * or as little as its own words need and can reach for a translated month or a
   * relative phrase.
   *
   * **This is the redundancy that makes the shade legal.** A shade is not
   * information a screen reader can use, so the number behind it has to be spoken
   * somewhere, and this is where. A grid that left the naming to a `title`
   * attribute would be a grid whose only readable channel is a tooltip, and a
   * tooltip is a surface that appears under a pointer rather than one a reader can
   * ask for by moving through the document.
   */
  cellLabel: (cell: {
    /** The cell as the caller passed it. */
    cell: IntensityGridCell
    /** The row this cell sits in. */
    row: IntensityGridRow
    /** The column this cell sits under. */
    column: IntensityGridColumn
  }) => string
  /**
   * The bands of the caller's scale, in the order they are read.
   *
   * Required, and the reason is that no Component can see it: the same value is a
   * crisis on one estate and an ordinary Tuesday on another, so a default scale
   * would be a claim about the caller's data made on the caller's behalf. That is
   * the argument `MeterTone` and `StatusTone` make for holding the same judgement
   * at arm's length, and the bands are that judgement written as data.
   *
   * A caller with two bands passes two and a caller with six passes six, so the
   * scale on screen is as wide as the caller's claim about it. A cell that falls in
   * no band is drawn as the empty cell and carries `data-state="ungraded"`, which
   * is the honest reading of a scale that does not cover its own data.
   */
  bands: readonly IntensityGridBand[]
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A matrix of two categorical axes, drawn as cells under one sequential scale.
 *
 * **Neither axis is a scale, and that is the whole difference from `Chart`.** A
 * chart places a mark at a position on a continuous domain and a cell has no
 * position: "Kiln Wharf in March" is not half way between anything, so there is no
 * horizontal scale to draw and no vertical one to read, and `Chart`'s `mark` prop
 * cannot type it because a mark is a way of drawing a position. So this Component
 * draws no axis, ticks nothing, and derives its scale from the values rather than
 * from a range the caller states. Everything below is a consequence of that rather
 * than a preference.
 *
 * **What it is for, and how it differs from `ContributionGraph`.** Both draw a grid
 * of cells filled by intensity, and the resemblance is close enough to be worth
 * being exact about. A ContributionGraph is a calendar: its rows are the seven
 * days, its columns are the weeks, and it works both out from the dates it was
 * given, so a caller passes days and gets a window. This Component is two sets of
 * categories the caller already holds, and it has no calendar, no window, no window
 * arithmetic and no date key. Four differences follow, each from that one:
 *
 *   1. **The axes are named by the caller.** A month and an estate are not seven
 *      days and a week, and there is no rule here that generates them.
 *   2. **A pair with no cell is legal and is the common case.** A calendar has a
 *      cell for every day in its window, so an unreported day is the interesting
 *      state there. A matrix owes no completeness, so an absent pair is ordinary
 *      and draws as the empty cell.
 *   3. **The drawing is symmetric and the reading is not.** A calendar is read by
 *      scanning a column, which is why its caller may choose which day each row
 *      starts on. Here the row is the header and the column is the reading order,
 *      so there is no `weekStartsOn` to pass because there is no week to start.
 *   4. **The bands are the caller's and a calendar's are not.** `ContributionGraph`
 *      grades against the largest count in the window because a count of commits is
 *      a count of commits. Here the measure is unknown to Prism, so the bands are
 *      required, and that is the difference a reader of this file is most likely to
 *      get wrong.
 *
 * **The scale is derived, a band's meaning is not, and the gap between them is the
 * honest cost.** Prism works out the largest value in the grid and reads every
 * cell as a share of it, so the caller passes magnitudes and divides nothing. It
 * cannot do the other half: it cannot see that forty findings on one estate is a
 * crisis and the same forty on another is Tuesday, so `bands` is required and its
 * entries are the caller's judgement about what each band means. **Prism cannot
 * verify that the caller's scale is sequential.** A caller who passes a diverging
 * scale, a categorical one, or values normalised into a range of their own
 * invention gets a grid that reads as intensity and is not one, and nothing in the
 * rendered output says so: there is no key, because a key would assert an ordering
 * this Component has no way to check. The caller who wants one composes it from the
 * same `bands` array the cells were graded with, which is why that array is data
 * and not a callback.
 *
 * **The shade is redundant and never the only channel, and there is no printed
 * number.** Every cell is a picture of a measurement and is named by `cellLabel`, so
 * the value is spoken in the caller's own words. What Prism refuses is the other
 * half of that sentence: a printed value in every cell. A matrix of forty cells
 * with a number in each is a table with shading on it, and the shading is the
 * channel the reader cannot scan, so the numbers would be covering the reason the
 * figure exists. The cost is real, and it is the reason `CohortGrid` is a different
 * Item: a reader who cannot rank five shades has no route to the value here at all,
 * which is the right trade for a matrix scanned at a glance and the wrong one for a
 * retention table read cell by cell.
 *
 * **A value outside the scale is clamped and counted, not thrown.** A cell above
 * the largest value cannot exist, since the largest value sets the top, and a value
 * below zero is a diverging measure rather than an intensity. Both are drawn at the
 * floor or the ceiling of the scale and counted on the element as `data-clamped`,
 * which is the arrangement `Chart` uses for a value past the end of its axis, and
 * the count is what makes an under-specified scale visible to the caller who wrote
 * it. `table` is the Component for a measure whose middle means something.
 *
 * **Four inputs throw, and a drawn lie is worse than a refusal.** No rows, no
 * columns or no cells is a frame carrying no claim, a cell naming an axis that was
 * not given is a measurement with nowhere to go, and two cells in one place is one
 * measurement drawn over another with the earlier one left in the data and out of
 * the picture. Each is a bug in the caller's code rather than a state a reader
 * reaches, and each is reported in a console where the caller will see it. A cell
 * whose value is not a finite number is the exception and is deliberately not one of
 * the four: it draws as the empty cell, because a cell that says nothing and a cell
 * whose number went missing look the same and no gate can tell them apart.
 *
 * **Nothing here moves, and the reason is the shade.** A hover state on a cell has
 * to change something about the cell, and everything available is a change to the
 * value: a wash behind it changes what the fill composites against, which is the
 * measurement, and a border on one cell changes its neighbours' widths by a pixel.
 * So the figure is static by construction rather than by restraint, which is also
 * the cheapest way to satisfy a motion law that permits only state feedback.
 *
 * **It is a server Component, and `cellLabel` does not make it a client one.** A
 * function prop is only a problem when it has to cross a boundary to be called, and
 * this one never does: it is called during the render that received it, on the
 * server, by this Component. That is the arrangement `ContributionGraph` ships and
 * the reason its Demo is a server module too. The one consequence a caller has to
 * know is that the function has to be written where the grid is rendered, so a grid
 * inside an interactive panel must be composed inside that panel's own client tree,
 * which is the price of a matrix that costs no client code at all.
 */
function IntensityGrid({
  className,
  rows,
  columns,
  cells,
  label,
  cellLabel,
  bands,
  ...props
}: IntensityGridProps) {
  if (rows.length === 0 || columns.length === 0 || cells.length === 0) {
    throw new Error(
      'IntensityGrid: one of rows, columns or cells is empty, so the figure is a frame with nothing in ' +
        'it. A matrix needs at least one row, at least one column and one cell, and its axes are the ' +
        "caller own categories rather than anything this Component generates. Pass the measurements you " +
        'have; an axis with nothing in it is a query that did not come back.',
    )
  }

  const placed = cells.map((cell) => {
    const row = rows.find((entry) => entry.key === cell.rowKey)
    const column = columns.find((entry) => entry.key === cell.columnKey)
    if (row === undefined || column === undefined) {
      throw new Error(
        `IntensityGrid: a cell names the row '${cell.rowKey}' and the column '${cell.columnKey}', and ` +
          'one of them is not among the rows and columns you gave. A cell with nowhere to sit is a ' +
          'measurement nobody would ever see, so this stops rather than dropping it and leaving you to ' +
          'believe the whole matrix was drawn.',
      )
    }
    return { cell, row, column }
  })

  /*
   * Nested rather than keyed on a joined string, because a caller's keys are its
   * own and a row key of `Kiln Wharf` beside a column key of `March` collides with
   * a row of `Kiln` beside a column of `Wharf March`. A matrix is a table keyed on
   * two columns, and keying it on one string is a bug waiting for the first caller
   * whose keys contain spaces.
   */
  const byRow = new Map<string, Map<string, (typeof placed)[number]>>()
  for (const entry of placed) {
    const forRow = byRow.get(entry.cell.rowKey)
    if (forRow === undefined) {
      byRow.set(entry.cell.rowKey, new Map([[entry.cell.columnKey, entry]]))
      continue
    }
    if (forRow.has(entry.cell.columnKey)) {
      throw new Error(
        `IntensityGrid: the row '${entry.cell.rowKey}' and the column '${entry.cell.columnKey}' have ` +
          'more than one cell. A matrix has one measurement per pair, and drawing the last of them would ' +
          'leave the earlier one in the data and out of the picture with nothing saying so. Combine them ' +
          'into the one cell that pair should carry.',
      )
    }
    forRow.set(entry.cell.columnKey, entry)
  }

  const max = placed.reduce((tallest, entry) =>
    Number.isFinite(entry.cell.value) && entry.cell.value > tallest ? entry.cell.value : tallest, 0)

  return (
    <figure
      data-slot="intensity-grid"
      data-rows={rows.length}
      data-columns={columns.length}
      aria-label={label}
      className={cn('flex w-full flex-col gap-1.5', className)}
      {...props}
    >
      {/*
        The column header row repeats the row-label gutter from every row rather
        than offsetting itself by a padding value, because a padding that has to
        match a gutter is two facts that can disagree. `Chart` lays out its own
        axis the same way, and for the same reason.
      */}
      <div data-slot="intensity-axis" className="flex items-end gap-2">
        <span data-slot="intensity-gutter" aria-hidden="true" className="w-32 shrink-0" />
        {columns.map((column) => (
          <span
            key={column.key}
            data-slot="intensity-column"
            className="text-muted-foreground min-w-0 flex-1 truncate text-center text-xs"
          >
            {column.label}
          </span>
        ))}
      </div>

      {rows.map((row) => (
        <div key={row.key} data-slot="intensity-row" className="flex items-center gap-2">
          <span data-slot="intensity-row-label" className="w-32 shrink-0 truncate text-xs font-medium">
            {row.label}
          </span>
          {columns.map((column) => {
            const found = byRow.get(row.key)?.get(column.key)
            if (found === undefined) {
              /*
                A pair with no cell. Hidden from assistive technology because there
                is nothing to name: an absence is not a zero and not a row, and the
                same rule `ContributionGraph` applies to a day nobody reported.
              */
              return (
                <span
                  key={column.key}
                  data-slot="intensity-cell"
                  data-row={row.key}
                  data-column={column.key}
                  data-state="absent"
                  aria-hidden="true"
                  className={cn('h-6 min-w-0 flex-1 rounded-sm', LEVEL_FILL[0])}
                />
              )
            }

            const { cell } = found
            const share = shareOf(cell.value, max)
            const held = Math.min(100, Math.max(0, share))
            // Read in the order the bands were given, and the first one containing
            // the share wins, so a caller with an overlapping scale says which band
            // takes precedence by saying it first.
            const band = bands.find((entry) => held >= entry.from && held <= entry.to)
            const level = band?.level ?? 0
            return (
              <span
                key={column.key}
                data-slot="intensity-cell"
                data-row={row.key}
                data-column={column.key}
                data-level={level}
                data-state={band === undefined ? 'ungraded' : undefined}
                data-clamped={held === share ? undefined : 'true'}
                /*
                  A cell is a picture of a measurement rather than text, so it takes
                  the image role and the caller's own sentence for it. That name is
                  the redundant channel over the shade. An ungraded cell keeps its
                  name, so a reader hears the number and sees the absence, which is
                  the honest pair: the caller's scale does not cover this cell and
                  the drawing says so rather than substituting a step that means
                  something else.
                */
                role="img"
                aria-label={cellLabel({ cell, row, column })}
                className={cn('h-6 min-w-0 flex-1 rounded-sm', LEVEL_FILL[level])}
              />
            )
          })}
        </div>
      ))}
    </figure>
  )
}

export { IntensityGrid }