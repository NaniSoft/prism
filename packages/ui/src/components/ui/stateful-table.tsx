'use client'

import { useId, useState, type ReactNode } from 'react'

import { Button } from './button'
import { Checkbox } from './checkbox'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { TableSort, type TableSortDirection } from './table-sort'
import { cn } from '../../lib/utils'

/**
 * Which way a column is ordered, and how to leave that order.
 *
 * `TableSort`'s own union, taken rather than restated, because two Components that
 * each declared a direction would be two lists to keep in step and the sort
 * header's whole reason for existing is that it agrees with whatever reorders the
 * rows.
 */
export type StatefulTableDirection = TableSortDirection

/**
 * One column of a StatefulTable that cannot be ordered.
 *
 * A separate arm rather than an optional `accessor` beside an optional `sortable`,
 * and the split is the argument. A sortable column needs a value to sort *by*, and
 * the value is not always the cell's text: a status column orders `critical,
 * degraded, healthy` rather than alphabetically, and a column of charts orders on
 * the number the chart reports. So the accessor is required in the sortable arm and
 * the `sortable` boolean is absent from this one, and two optionals would be a
 * combination that type-checks and then cannot sort anything.
 */
export type StatefulTableColumn<TRow> = {
  /** The column's stable key, and what a sort names. */
  id: string
  /** The column's visible name. */
  header: ReactNode
  /** The cell's content for one row. */
  cell: (row: TRow) => ReactNode
  /** Whether this column can be ordered. */
  sortable?: false
}

/** One column of a StatefulTable that can be ordered, and by what. */
export type StatefulTableSortableColumn<TRow> = {
  /** The column's stable key, and what a sort names. */
  id: string
  /** The column's visible name. */
  header: ReactNode
  /** The cell's content for one row. */
  cell: (row: TRow) => ReactNode
  /** This column can be ordered, and the value it orders on. */
  sortable: true
  /**
   * The value this column orders on, for one row.
   *
   * Required, and it is the whole of this Component's authority over the caller's
   * data: the value sorted on is the caller's and never the cell's text, because a
   * Component that inferred an accessor from a rendered cell would be deciding the
   * order of records it cannot read.
   */
  accessor: (row: TRow) => string | number
}

/** One column, sortable or not. */
export type StatefulTableColumnUnion<TRow> =
  | StatefulTableColumn<TRow>
  | StatefulTableSortableColumn<TRow>

/**
 * Which column is ordered, and which way.
 *
 * A single value rather than a per-column record, and the reason is the one
 * `table-sort` gives for putting `aria-sort` on exactly one header: two columns
 * both reporting an order is a table claiming to be sorted two ways at once, and a
 * reader comparing the two hears a contradiction. One column, one direction.
 */
export type StatefulTableSort = {
  /** The id of the column that is ordered. */
  column: string
  /** The way it is ordered. */
  direction: StatefulTableDirection
}

/**
 * The state a StatefulTable owns and the caller reads.
 *
 * One value rather than four props, and the reason is that these four are not
 * independent. Which page is showing is a function of the order and the set in every
 * implementation anyone writes, and four props let a caller hold a page number that
 * contradicts the sort they have just set, which is a table showing rows that are
 * not in the order its own header claims. One value is also one place to put, so a
 * caller can hold it in a reducer, in a store, or in an address query and this
 * Component does not care which.
 */
export type StatefulTableState = {
  /**
   * Which column is ordered and which way, or `null` for the caller's own order.
   *
   * `null` is the order of the array as it was handed over, and it is reachable from
   * the control rather than only at mount, because a reader who sorted a column to
   * find the extreme and no longer cares has to be able to get the original back
   * from the header they already know. That is `table-sort`'s three-state cycle and
   * this is where the third state is spent.
   */
  sort: StatefulTableSort | null
  /** The keys of the rows the reader has selected. */
  selection: readonly string[]
  /**
   * The ids of the columns the reader has hidden.
   *
   * Kept beside `selection` rather than folded into the column list for the reason
   * the sort is a value and not a column field: a column marked hidden in the list
   * would be undone by every fetch that rebuilds the list, and a caller's columns
   * say which columns exist rather than which are on screen right now.
   */
  hiddenColumns: readonly string[]
  /**
   * The page being shown, counting from zero.
   *
   * Clamped on the way out rather than refused on the way in, for the reason `Steps`
   * clamps `current`: an out-of-range page after the caller narrows the set is an
   * ordinary event, and the reader should land on the last page that has rows on it
   * rather than on an empty table with an error beside it.
   */
  page: number
}

/**
 * One state change, and which of the four facts it moved.
 *
 * `changed` is there so a caller can persist one thing rather than four: a table in
 * an address wants the sort and the page and not the selection, and a change report
 * with no field for that makes every caller diff the object themselves. It is called
 * `visibility` rather than `hiddenColumns` because it names the fact that changed
 * rather than the field that holds it, and a caller reading a persisted event log is
 * better served by the former.
 */
export type StatefulTableChange = {
  /** The state to move to. */
  state: StatefulTableState
  /** Which of the four facts changed. */
  changed: 'sort' | 'selection' | 'visibility' | 'page'
}

/**
 * The props a StatefulTable accepts.
 *
 * A declared interface rather than one extended from `Table`'s, and the reason is
 * this Component: `Table` is presentational and forwards every native table prop, so
 * extending it would hand this Component a `children` that is a body, a `className`
 * that is a table's, and no place at all for the four state props that are the
 * reason it exists.
 */
export interface StatefulTableProps<TRow> {
  /**
   * The rows, in the order the caller wants them before this Component has reordered
   * anything.
   *
   * Required, and the caller's order is what `sort: null` means. A caller with a
   * server-side order hands over rows already in that order and a reader who sorts
   * and then unsorts gets the caller's order back rather than an arbitrary one.
   */
  rows: readonly TRow[]
  /**
   * The caller's key for a row.
   *
   * Required, because selection is a set of keys and reordering maps positions to
   * rows, and a Component that read identity off a position would select the wrong
   * row the instant the order changed.
   */
  getRowId: (row: TRow) => string
  /** The columns, in the order they are shown. */
  columns: readonly StatefulTableColumnUnion<TRow>[]
  /**
   * The state, controlled.
   *
   * Required and never defaulted, because a table that kept its own sort and
   * selection could not be read back by the caller, and a caller who cannot read the
   * sort cannot put it in an address, cannot restore it, and cannot tell a server
   * which page to send. Controlled is the decision; an uncontrolled sibling would be
   * a second way to say the same four facts and the two would disagree within a
   * release.
   */
  state: StatefulTableState
  /** Called when any of the four facts changes. */
  onChange: (change: StatefulTableChange) => void
  /**
   * The table's caption, drawn by `TableCaption` where a caption belongs.
   *
   * Optional rather than required because `label` already names the table, and a
   * caption that repeats the accessible name is a sentence read twice. Pass one
   * where it says something the name does not: what the set is a slice of, or what
   * a row means.
   */
  caption?: ReactNode
  /**
   * The table's accessible name.
   *
   * Required, and a `string` because it goes into `aria-label` and an accessible
   * name is a string. A table with no name is announced as "table" and a page with
   * two of them is a page where a reader cannot tell which is which.
   */
  label: string
  /**
   * The words read for what pressing a sortable header will do.
   *
   * Required, and a function of the *next* direction for the reason `table-sort`
   * gives at length: a header that announces "sorted ascending" when it is already
   * ascending tells a reader nothing about the press they are about to make.
   */
  announceSort: (column: string, direction: StatefulTableDirection) => string
  /**
   * The label of the control that selects every row on the page.
   *
   * Required, and a `string` because it is written into `aria-label` and an
   * accessible name is a string. It is expected to carry the count, because a
   * control labelled "Select all" beside twenty rows a reader has not seen is a
   * claim about the whole set when it means the page.
   */
  selectAllLabel: string
  /** The accessible name of one row's selection control, given the row's key. */
  selectRowLabel: (rowKey: string) => string
  /**
   * The label of the control that shows and hides columns.
   *
   * Required, and it opens a disclosure rather than sitting as a row of checkboxes
   * because which columns exist is a fact about the caller's data and the screen it
   * is on, and a control that is a row of boxes beside the header on a phone has
   * taken the table's whole width to describe itself.
   */
  columnsLabel: ReactNode
  /**
   * The words shown when the set has no rows.
   *
   * Required, and required because an empty `<tbody>` is a table with a shape and
   * nothing in it, which reads as a rendering failure. A sentence is the caller's,
   * because a set that is empty because it is loading and a set that is empty
   * because there is nothing are two different sentences and only the caller knows
   * which one applies.
   */
  emptyLabel: ReactNode
  /**
   * The words on the control that goes to the previous page.
   *
   * Required, and required as a pair with `nextPageLabel` because the two are the
   * same control in two positions: a caller who localises one and not the other has
   * a control that looks localised and is half of it, which is the state
   * `PaginationPrevious` exists to prevent.
   */
  previousPageLabel: string
  /** The words on the control that goes to the next page. */
  nextPageLabel: string
  /**
   * The words for where the reader is in the set, given the page and how many there
   * are.
   *
   * Required, and a function because "Page 2 of 9" is false in a language that puts
   * the total first, and a pager that assembled the sentence would have assembled it
   * in one of them. It is also the accessible name of the pager, so a reader who
   * arrives at that row is told where they are before they touch either control.
   */
  pageLabel: (page: number, pages: number) => string
  /**
   * How many rows a page holds.
   *
   * A number and not a class, because the bound is data: the same table is forty rows
   * in a sidebar and eight on a full page, and a caller who could only say
   * `max-h-80` would be picking one of those for the other. It has no effect on a
   * set smaller than it.
   *
   * @defaultValue 10
   */
  pageSize?: number
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * A row set that owns its sort, its selection, its column visibility and its page,
 * and hands all four to the caller as one value.
 *
 * **Prism's `table` is presentational and `table-sort` is a header cell, and this
 * is the thing neither of them is.** `Table` forwards every native table prop and
 * holds nothing; `TableSort` reports a direction and leaves the reordering to the
 * caller. Between them is the half every consumer writes again: the row order, which
 * rows are selected, which columns are on screen and which page is showing, and the
 * four have to agree with each other after every change. That agreement is the
 * Component. A caller holding them as four independent props gets a page number that
 * does not match the sort they have just set, which is a table whose rows are not in
 * the order its own header claims.
 *
 * **One state value rather than four props, for the same reason.** The four are not
 * independent: which page is showing is a function of the order and the set in every
 * implementation anyone writes, and four props let a caller hold a contradiction. One
 * value is also one place to hold it, so a caller can put it in a reducer, in their
 * store, or in an address query and this Component does not care which. The cost is
 * that a caller changing one fact spreads the rest, which is one line and is the
 * price of the four being unable to disagree.
 *
 * **It owns the order, and the accessor is how.** This is the one place a Component
 * in this package decides something about the caller's data, and the refusal to do
 * it any other way is the design. A column is sortable only when it carries an
 * `accessor`, so the value sorted on is the caller's and never the cell's text: a
 * status column that orders `critical, degraded, healthy` and a column of charts that
 * orders on the number the chart reports are both expressible here, and neither is
 * guessable from a cell. That is why the column type is a union of a sortable arm and
 * a plain one rather than two optionals: an optional accessor beside a `sortable`
 * boolean is a combination that type-checks and then cannot sort anything.
 *
 * **Numbers compare as numbers and everything else goes through the platform's own
 * collator.** The `Intl.Collator` half is not a nicety: a name column ordered with
 * `<` puts every uppercase name before every lowercase one in half the languages a
 * product is sold in, and the comparator that fixes that belongs to the platform
 * rather than to this package. The locale is the runtime's own, which is right on a
 * server and wrong on a multilingual page, so it is stated here rather than guessed.
 * `numeric` is on so a column of identifiers orders 2 before 10, which is the one
 * case a reader always notices.
 *
 * **A server-ordered set is the original order, and that is what `sort: null` means.**
 * A caller with a server-side order hands over rows already in it, and a reader who
 * sorts and then unsorts gets the caller's order back. The three-state cycle on the
 * header is `table-sort`'s and it is spent here, in the third state: one route back
 * to the original, and it is the header they already know.
 *
 * **Selection is a set of the caller's keys, and the header's control covers the
 * page rather than the set.** The two differ whenever the caller pages, and
 * conflating them is the defect this Component exists to prevent: a "select all"
 * that selected every row on the server when twenty are on screen acted on four
 * hundred rows a reader never saw. So the header's checkbox covers the rows on the
 * current page, it is `indeterminate` when some of them are selected, and the words
 * are the caller's.
 *
 * **Column visibility is the reader's preference and lives beside the columns rather
 * than inside them.** A column marked hidden in the caller's array would be undone by
 * every fetch that rebuilds the array, and a caller's columns say which columns exist
 * rather than which are on screen right now. Nothing is hidden on width alone: a
 * table with eleven columns on a phone is a hard problem, and pruning columns by
 * guessing at a width takes away a column the reader needed without telling them,
 * which is a worse failure than a scroll.
 *
 * **The header is a real `<tr>` of `<th scope="col">` cells and the sortable ones are
 * `TableSort`, composed.** Neither is this Component's decision: a header row of
 * `div`s is a grid with no column names in it, and a screen reader moving across a
 * table announces a column rather than a button. `TableSort` carries the direction,
 * the mark and the announcement, and the caller's `announceSort` is passed straight
 * through to it, so the sentence a reader hears about a press is the caller's.
 *
 * **The pager is drawn only when there is more than one page**, because a pager on a
 * set of four rows is a row of controls describing a choice the reader does not have.
 * Its controls are `aria-disabled` rather than natively disabled on the end pages,
 * for the reason `FormWizard` gives on its back control: a control that leaves the
 * tab order answers a press with silence.
 *
 * **It is a client Component**, because every one of the four changes happens after
 * the reader acts, and because `state`, `onChange` and the row and column accessors
 * are functions the caller hands it, which is a client-to-client boundary wherever it
 * is written. What that costs is the price of every client control: a server
 * Component may render one page of rows once with the state already in place, and
 * what it may not do is let the reader change any of the four facts.
 */
function StatefulTable({
  rows,
  getRowId,
  columns,
  state,
  onChange,
  caption,
  label,
  announceSort,
  selectAllLabel,
  selectRowLabel,
  columnsLabel,
  emptyLabel,
  previousPageLabel,
  nextPageLabel,
  pageLabel,
  pageSize = 10,
  className,
}: StatefulTableProps<any>) {
  const generated = useId()
  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsId = `${generated}-columns`

  const shown = columns.filter((column: any) => !state.hiddenColumns.includes(column.id))
  const ordered = state.sort === null ? [...rows] : [...rows].sort(comparator(state.sort, columns))
  const pages = Math.max(1, Math.ceil(ordered.length / Math.max(1, pageSize)))
  const page = Math.min(Math.max(Math.trunc(state.page), 0), pages - 1)
  const visible = ordered.slice(page * pageSize, page * pageSize + pageSize)
  const selected = new Set(state.selection)
  const pageKeys = visible.map(getRowId)
  const everyOnPage = pageKeys.length > 0 && pageKeys.every((key) => selected.has(key))
  const someOnPage = pageKeys.some((key) => selected.has(key))

  const move = (next: Partial<StatefulTableState>, changed: StatefulTableChange['changed']) =>
    onChange({ state: { ...state, ...next }, changed })

  return (
    <div data-slot="stateful-table" className={cn('flex w-full flex-col gap-3', className)}>
      {/*
       * The column disclosure, and it is a disclosure rather than a row of checkboxes
       * for the reason the JSDoc gives: which columns exist is a fact about the
       * caller's data and the screen it is on, and a row of boxes beside the header
       * on a phone has taken the table's whole width to describe itself. The panel
       * is `hidden` rather than unmounted, because a reader who closes it and opens
       * it again has to find their choices where they left them and a checkbox that
       * resets is a control that forgets.
       */}
      <div data-slot="stateful-table-toolbar" className="flex items-center justify-end">
        <Button
          data-slot="stateful-table-columns-toggle"
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={columnsOpen}
          aria-controls={columnsId}
          onClick={() => setColumnsOpen((open) => !open)}
        >
          {columnsLabel}
        </Button>

        <div
          id={columnsId}
          data-slot="stateful-table-columns"
          hidden={!columnsOpen}
          className="border-border bg-popover text-popover-foreground absolute end-4 mt-9 flex flex-col gap-2 rounded-md border p-3 shadow-md"
        >
          {columns.map((column: any) => (
            <label
              key={column.id}
              data-slot="stateful-table-column-toggle"
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                checked={!state.hiddenColumns.includes(column.id)}
                onCheckedChange={(next) =>
                  move(
                    {
                      hiddenColumns: next
                        ? state.hiddenColumns.filter((id: string) => id !== column.id)
                        : [...state.hiddenColumns, column.id],
                    },
                    'visibility',
                  )
                }
              />
              {column.header}
            </label>
          ))}
        </div>
      </div>

      <Table data-slot="stateful-table-frame" aria-label={label} className="w-full">
        {caption === undefined ? null : <TableCaption>{caption}</TableCaption>}

        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                data-slot="stateful-table-select-all"
                checked={everyOnPage}
                indeterminate={someOnPage && !everyOnPage}
                aria-label={selectAllLabel}
                onCheckedChange={(next) =>
                  move(
                    {
                      // The page's rows and not the set's. A control that selected
                      // every row on the server when twenty are on screen acted on
                      // four hundred rows the reader never saw, and that is the defect
                      // this Component exists to prevent rather than to ship.
                      selection: next
                        ? [...new Set([...state.selection, ...pageKeys])]
                        : state.selection.filter((key) => !pageKeys.includes(key)),
                    },
                    'selection',
                  )
                }
              />
            </TableHead>

            {shown.map((column: any) => (
              <TableHead key={column.id}>
                {column.sortable === true ? (
                  <TableSort
                    column={column.id}
                    direction={
                      state.sort !== null && state.sort.column === column.id
                        ? state.sort.direction
                        : 'none'
                    }
                    onDirectionChange={(direction) =>
                      move(
                        {
                          sort: direction === 'none' ? null : { column: column.id, direction },
                          // Back to the first page, because a page number chosen for
                          // one order means nothing in another and the reader who
                          // changed the order is on a page that may have nothing on
                          // it.
                          page: 0,
                        },
                        'sort',
                      )
                    }
                    announce={(direction) => announceSort(column.id, direction)}
                  >
                    {column.header}
                  </TableSort>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {/*
           * The empty case, drawn as a real row spanning every column so the table
           * keeps its shape. A sentence and not a blank body, because a table with a
           * header and nothing under it reads as a rendering failure rather than as
           * an answer.
           */}
          {visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={shown.length + 1} data-slot="stateful-table-empty">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            visible.map((row: any) => {
              const key = getRowId(row)
              const isSelected = selected.has(key)

              return (
                <TableRow
                  key={key}
                  data-slot="stateful-table-row"
                  data-selected={isSelected ? 'true' : undefined}
                  data-state={isSelected ? 'selected' : undefined}
                  className={isSelected ? 'bg-muted' : undefined}
                >
                  <TableCell className="w-10">
                    <Checkbox
                      data-slot="stateful-table-select-row"
                      checked={isSelected}
                      aria-label={selectRowLabel(key)}
                      onCheckedChange={(next) =>
                        move(
                          {
                            selection: next
                              ? [...state.selection, key]
                              : state.selection.filter((held) => held !== key),
                          },
                          'selection',
                        )
                      }
                    />
                  </TableCell>

                  {shown.map((column: any) => (
                    <TableCell key={column.id} data-slot="stateful-table-cell">
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/*
       * The pager, drawn only when there is more than one page. `aria-disabled`
       * rather than the native attribute on the end pages, for the reason `FormWizard`
       * gives on its back control: a control that leaves the tab order answers a
       * press with silence, and a reader paging a table is pressing at the ends to
       * find out whether there is more.
       */}
      {pages <= 1 ? null : (
        <nav
          data-slot="stateful-table-pager"
          aria-label={pageLabel(page, pages)}
          className="flex items-center justify-end gap-2"
        >
          <Button
            data-slot="stateful-table-previous"
            type="button"
            variant="outline"
            size="sm"
            aria-disabled={page === 0 || undefined}
            onClick={() => {
              if (page === 0) return
              move({ page: page - 1 }, 'page')
            }}
          >
            {previousPageLabel}
          </Button>

          <span
            data-slot="stateful-table-page"
            aria-hidden="true"
            className="text-muted-foreground text-sm tabular-nums"
          >
            {pageLabel(page, pages)}
          </span>

          <Button
            data-slot="stateful-table-next"
            type="button"
            variant="outline"
            size="sm"
            aria-disabled={page === pages - 1 || undefined}
            onClick={() => {
              if (page === pages - 1) return
              move({ page: page + 1 }, 'page')
            }}
          >
            {nextPageLabel}
          </Button>
        </nav>
      )}
    </div>
  )
}

/**
 * The comparator a sort uses, read off the caller's own accessor.
 *
 * A column with no accessor returns a comparator that preserves the order, and it is
 * unreachable rather than defensive: `TableSort` is rendered only in the arm of the
 * column union that carries one, so the type has already said the accessor is there.
 * The guard is here because a caller can cast their columns into the union, and a
 * silently unsorted column is the one failure this Component cannot afford.
 */
function comparator(
  { column, direction }: StatefulTableSort,
  columns: readonly StatefulTableColumnUnion<any>[],
): (a: any, b: any) => number {
  const found = columns.find((candidate) => candidate.id === column)
  const accessor = (found as StatefulTableSortableColumn<any> | undefined)?.accessor
  if (accessor === undefined) return () => 0

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
  const sign = direction === 'descending' ? -1 : 1

  return (a, b) => {
    const left = accessor(a)
    const right = accessor(b)
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sign
    return collator.compare(String(left), String(right)) * sign
  }
}

export { StatefulTable }
