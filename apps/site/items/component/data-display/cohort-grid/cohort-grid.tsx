import { CohortGrid, type CohortGridColumn, type CohortGridRow } from '@nanisoft/prism-ui/components/cohort-grid'

/** The offsets, which are ordinal and are the same number on every row. */
const MONTHS: CohortGridColumn[] = [
  { key: 'start', label: 'Signed up' },
  { key: 'm1', label: 'Month 1' },
  { key: 'm2', label: 'Month 2' },
  { key: 'm3', label: 'Month 3' },
  { key: 'm4', label: 'Month 4' },
  { key: 'm5', label: 'Month 5' },
]

/**
 * Six monthly cohorts, newest first, with the offsets each one has reached.
 *
 * Every row has one entry per column and a `null` for each offset the cohort has not
 * got to. That is the whole model: the youngest account here is a week old and has
 * been measured once, and the grid says so by having nothing in the five cells to its
 * right rather than by drawing five zeroes. A row of zeroes would claim every
 * account in that cohort had gone by month one.
 */
const MONTHLY: CohortGridRow[] = [
  {
    key: '2026-09',
    label: 'September 2026',
    shares: [100, null, null, null, null, null],
  },
  {
    key: '2026-08',
    label: 'August 2026',
    shares: [100, 74, null, null, null, null],
  },
  {
    key: '2026-07',
    label: 'July 2026',
    shares: [100, 79, 61, null, null, null],
  },
  {
    key: '2026-06',
    label: 'June 2026',
    shares: [100, 82, 66, 51, null, null],
  },
  {
    key: '2026-05',
    label: 'May 2026',
    shares: [100, 85, 70, 56, 43, null],
  },
  {
    key: '2026-04',
    label: 'April 2026',
    shares: [100, 84, 69, 54, 41, 32],
  },
]

/**
 * The same months on a weekly cadence, generated rather than written out.
 *
 * It is here for one reason: the Component has no idea a cadence exists. The offsets
 * are whatever the caller calls them, and the same table with eight columns of a week
 * apart is the same table, which is the whole argument for an ordinal axis over a
 * continuous one.
 */
const WEEKLY: CohortGridRow[] = ['w36', 'w35', 'w34', 'w33', 'w32'].map((key, row) => ({
  key,
  label: `Week ${36 - row}`,
  shares: Array.from({ length: 8 }, (_, offset) =>
    offset > row ? null : Math.round(100 * Math.exp(-0.42 * offset) * 100) / 100,
  ),
}))

const WEEKS: CohortGridColumn[] = Array.from({ length: 8 }, (_, offset) => ({
  key: `w${offset}`,
  label: offset === 0 ? 'Week 0' : `+${offset}`,
}))

export default function CohortGridDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Monthly cohorts of new accounts</span>
        <CohortGrid
          label="Share of each monthly cohort still sending readings"
          rowHeading="Cohort"
          rows={MONTHLY}
          columns={MONTHS}
          caption="Of the accounts that were sending readings in the month they signed up, the share still sending at each later month"
        />
        <span className="text-muted-foreground text-xs">
          The youngest cohort has one measurement and the oldest has six, so the top
          right of the grid is empty by arithmetic rather than by measurement. An
          empty cell is an offset the cohort has not reached; a cell reading zero is
          every account in it having gone, and the two never draw the same way.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">The same matrix with the scale floor raised</span>
        <CohortGrid
          label="Share of each monthly cohort still sending readings, on a scale that starts at twenty"
          rowHeading="Cohort"
          rows={MONTHLY}
          columns={MONTHS}
          min={20}
          caption="The shading starts at twenty percent, so the late columns of the older cohorts separate from each other"
        />
        <span className="text-muted-foreground text-xs">
          This is the cost of a caller narrowing the scale, and it is deliberate: once every
          cohort has fallen past a quarter, a scale from zero draws them all in the same pale
          step and the reader cannot tell a month from a year. Raising the floor separates the
          cells that differ. The numbers do not move.
        </span>
        <span className="text-muted-foreground text-xs">
          The knob is <code>min</code> and not <code>max</code>, and the reason is the first
          column rather than a preference. Every row begins at a hundred percent by definition,
          so a scale that stopped below a hundred would be a scale this grid refuses to draw
          against rather than one it honours, and it throws instead of clamping because a
          clamped cell is a cell claiming its share is the ceiling. A caller who wants the
          first column out of the comparison leaves it out of the columns and says in the
          caption what the offsets now begin at.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">The same measure on a weekly cadence</span>
        <CohortGrid
          label="Share of each weekly cohort still sending readings"
          rowHeading="Week signed up"
          rows={WEEKLY}
          columns={WEEKS}
          precision={1}
          caption="Of the accounts that were sending readings in the week they signed up, the share still sending at each later week"
        />
        <span className="text-muted-foreground text-xs">
          A second cadence with the same Component. The columns are offsets and not a
          continuous axis, so month three on the March row and month three on the
          September row are two different months in the calendar and nothing may be
          read as being half way between two cells.
        </span>
      </div>
    </div>
  )
}