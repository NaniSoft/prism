import {
  IntensityGrid,
  type IntensityGridBand,
  type IntensityGridCell,
  type IntensityGridColumn,
  type IntensityGridRow,
} from '@nanisoft/prism-ui/components/intensity-grid'

/**
 * The row axis: the estates the estate is observed across.
 *
 * The `key` is the name in this Demo, which is a convenience and not a requirement:
 * a caller whose labels are nodes keeps a lookup of its own and names a row by a
 * slug. It is done this way so the composed sentence in `cellLabel` can use the two
 * keys it is handed rather than a second structure this file would have to keep in
 * step with the axes.
 */
const ESTATES = ['Kiln Wharf', 'Harrow Reach', 'Ashford Yard', 'Low Drayton', 'Penner Mill']

/** The column axis: the months being compared, oldest first. */
const MONTHS = ['March', 'April', 'May', 'June', 'July']

const ROWS: IntensityGridRow[] = ESTATES.map((name) => ({ key: name, label: name }))

const COLUMNS: IntensityGridColumn[] = MONTHS.map((name) => ({ key: name, label: name }))

/**
 * Findings raised per estate per month, generated rather than hand written.
 *
 * The shape is deliberate and all three parts of it are visible on the page: one
 * month is an outlier at four times the next largest, which is what quartiles of a
 * maximum do to real data; two pairs are missing, which is an absent cell rather
 * than a measurement of zero; and the rest sit across the middle of the range.
 */
function findingsAt(estate: number, month: number): number {
  if (estate === 4 && month < 2) return 0
  if (estate === 0 && month === 4) return 0
  if (estate === 3 && month === 4) return 148
  const seed = (estate * 7 + month * 13) % 9
  return [3, 8, 14, 19, 26, 34, 41, 52, 96][seed]
}

const CELLS: IntensityGridCell[] = ROWS.flatMap((row, estate) =>
  COLUMNS.map((column, month) => ({
    rowKey: row.key,
    columnKey: column.key,
    value: findingsAt(estate, month),
  })).filter((cell) => cell.value > 0),
)

/**
 * The caller's own sentence for one cell, which Prism will not compose.
 *
 * This is the redundancy over the shade and the reason the prop is required: a
 * shade is not something a screen reader can use, so the number behind it has to be
 * spoken in the caller's words. The count is not printed in the cell, so this is the
 * only place the figure is legible as a number.
 */
const cellLabel = ({
  cell,
  row,
  column,
}: {
  cell: IntensityGridCell
  row: IntensityGridRow
  column: IntensityGridColumn
}) => `${cell.value} findings raised on ${row.key} in ${column.key}`

/**
 * Four equal bands of the derived scale, which is the ordinary case.
 *
 * The bands are the caller's claim about what each quarter of the scale means, and
 * they are data rather than a callback precisely so a caller who wants a key can
 * draw one from the same array the cells were graded with.
 */
const QUARTERS: IntensityGridBand[] = [
  { from: 0, to: 25, level: 1 },
  { from: 25, to: 50, level: 2 },
  { from: 50, to: 75, level: 3 },
  { from: 75, to: 100, level: 4 },
]

/**
 * A finer scale with a floor, and the two pairs with no cell in them.
 *
 * Five bands rather than four, with the lowest at step zero, which is how a caller
 * says this band is genuinely nothing. The two gaps are pairs nobody reported: they
 * draw as the empty cell and are not named, because an absence is not a zero and has
 * no number to speak.
 */
const SIXTHS: IntensityGridBand[] = [
  { from: 0, to: 12, level: 0 },
  { from: 12, to: 25, level: 1 },
  { from: 25, to: 40, level: 2 },
  { from: 40, to: 60, level: 3 },
  { from: 60, to: 80, level: 4 },
]

/**
 * A scale that stops short of its own data.
 *
 * The fifth band ends at eighty, and the cells above it are drawn as the empty cell
 * and counted on the element as `data-state="ungraded"`. Prism cannot check that a
 * caller's bands are sequential or that they cover the grid, so the honest reading
 * of an under-specified scale is to say so in the markup rather than to substitute a
 * step that means something else.
 */
const NARROW: IntensityGridBand[] = [
  { from: 0, to: 15, level: 1 },
  { from: 15, to: 30, level: 2 },
  { from: 30, to: 45, level: 3 },
  { from: 45, to: 60, level: 4 },
]

export default function IntensityGridDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Findings raised, by estate and month</span>
        <IntensityGrid
          label="Findings raised, by estate and month, from March to July"
          rows={ROWS}
          columns={COLUMNS}
          cells={CELLS}
          cellLabel={cellLabel}
          bands={QUARTERS}
        />
        <span className="text-muted-foreground text-xs">
          Four equal bands of the largest value in the grid, which Prism derives. July at Low
          Drayton is four times the next largest cell, so it sets the top of the scale and
          flattens the rest of the grid toward the first band, which is what quartiles of an
          outlier are. No cell carries a printed number: the value is in the caller own
          sentence for that cell, which is the only place a reader who cannot rank five
          shades can reach it.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">
          The same matrix on a finer scale, with a band that means nothing
        </span>
        <IntensityGrid
          label="Findings raised, by estate and month, on a six-band scale"
          rows={ROWS}
          columns={COLUMNS}
          cells={CELLS}
          cellLabel={cellLabel}
          bands={SIXTHS}
        />
        <span className="text-muted-foreground text-xs">
          The caller own bands decide the scale, and this one has a floor: step zero is the
          empty cell, so anything below twelve percent reads as nothing at all. The empty
          cells at Kiln Wharf in July and at Penner Mill in March are pairs nobody reported
          rather than measurements of zero. The busiest cell, a hundred percent of the
          largest, falls outside the five bands and is drawn as the empty cell, because
          Prism cannot check that a scale covers the data it is drawn against.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">A scale that does not reach the top of its data</span>
        <IntensityGrid
          label="Findings raised, by estate and month, on a scale that stops at sixty"
          rows={ROWS}
          columns={COLUMNS}
          cells={CELLS}
          cellLabel={cellLabel}
          bands={NARROW}
        />
        <span className="text-muted-foreground text-xs">
          The same data on a scale that stops at sixty. Three cells fall outside it and are
          drawn as the empty cell, counted on the element as
          {' '}<code>data-state=&quot;ungraded&quot;</code>. A caller who draws a key does it
          from the same array the cells were graded with, because there is no legend on this
          Component: it cannot tell whether a scale is sequential, so asserting one would be
          a claim it cannot check.
        </span>
      </div>
    </div>
  )
}