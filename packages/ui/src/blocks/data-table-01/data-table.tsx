'use client'

import { ChevronDown, ListFilter, Search, XIcon } from 'lucide-react'
import { Fragment, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react'

import { Avatar } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Checklist } from '../../components/ui/checklist'
import { CodeBlock } from '../../components/ui/code-block'
import { Diff } from '../../components/ui/diff'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Input } from '../../components/ui/input'
import { Kbd } from '../../components/ui/kbd'
import { LiveRegion } from '../../components/ui/live-region'
import { Mark } from '../../components/ui/mark'
import { Pagination, PaginationContent, PaginationItem } from '../../components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Price } from '../../components/ui/price'
import { RelativeTime } from '../../components/ui/relative-time'
import { headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import { Status } from '../../components/ui/status'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { TableSort, type TableSortDirection } from '../../components/ui/table-sort'
import { TagGroup } from '../../components/ui/tag-group'
import { Text } from '../../components/ui/typography'
import type { ColumnKind, ColumnSpec } from '../../lib/spec'
import { cn } from '../../lib/utils'

/** One row of data. Identity comes from `getRowId`, not from the shape. */
export type DataTableRow = Record<string, unknown>

export type DataTableFilterOption = { label: string; value: string }

export type DataTableFilter = {
  id: string
  label: string
  options: DataTableFilterOption[]
}

/**
 * The one column the block orders its rows by, or `null` for the caller's own order.
 *
 * One column and one direction, because two headers each reporting an order is a
 * table claiming to be sorted two ways at once. The value is reported through
 * `onSortChange` and never derived: the block does not sort, because it cannot know
 * whether a column is a number, a date or a name, and it never reorders the rows it
 * was handed.
 */
export type DataTableSort = {
  /** The `key` of the column that is ordered. */
  column: string
  /** Which way it is ordered. */
  direction: TableSortDirection
}

/**
 * Every string the block renders. Required because the block ships no copy of
 * its own: a control hint, a selection summary, a per row name and an
 * empty-state line are the consumer's to write.
 */
export type DataTable01Labels = {
  /** Search field placeholder and accessible name. */
  search: string
  /** The filters trigger. */
  filters: string
  /** Clears every active filter. */
  reset: string
  /** Headings for the column chooser. */
  columns: string
  viewColumns: string
  /** The header's selection control, naming the page it covers. */
  selectAll: string
  /**
   * The name of one row's selection control, in the caller's words.
   *
   * A function of the row rather than a string, because a checkbox announced as
   * "Select row" on all forty rows is a checkbox no reader can tell from the one
   * below it. The name must name the record this checkbox ticks.
   */
  selectRow: (row: DataTableRow) => string
  /** The trailing cell's accessible name, when per-row actions are supplied. */
  rowActions: string
  /** The words read for what pressing a sortable header will do. */
  sort: (column: string, direction: TableSortDirection) => string
  /**
   * The selection summary and the announced number for the page scope.
   *
   * It should say the page, in the caller's words, because "24 selected" over a
   * table of twenty four rows is true and says nothing about whether there are
   * more: the page is the one population this Block can count for itself.
   */
  selectedCount: (count: number) => string
  /**
   * The selection summary and the announced number for the filter scope.
   *
   * Used when the caller reports that the whole matching population is selected
   * through `selectionScope`, and it takes the caller's own `count` rather than
   * the number of rows on screen. It should announce the scope in words, because
   * the population is one this Block never fetched: a summary reading "12
   * selected" over a table of twelve rows and four thousand matching is a number
   * that is false, and neither a sighted reader nor a screen reader can detect it.
   */
  selectedAllMatching: (count: number) => string
  /**
   * The sentence spoken when the selection empties.
   *
   * Not a count of zero: "0 selected" is a number the reader already heard and says
   * nothing about why the batch bar has gone. The emptying is its own sentence.
   */
  clearedSelection: string
  /** The accessible name of the batch bar's dismiss control. */
  dismissSelection: string
  previous: string
  next: string
  /** Accessible name for one page control. */
  page: (page: number) => string
  /** Shown in the body when `rows` is empty and `emptyMessage` is not set. */
  empty: string
}

/**
 * Grouping, expressed as a key on a row rather than as a second arrangement.
 *
 * A body is flat unless the caller asks otherwise, and the caller asks in one
 * line: `groupBy` takes a row and returns the key it belongs to, and the block
 * draws a heading in the same body above each run of rows that shares a key. It
 * never reorders the rows it was handed, so contiguous rows with one key are one
 * group and the caller's order is the only order. A row whose key is `undefined`
 * is ungrouped and draws no heading.
 *
 * `groupLabel` is required wherever `groupBy` is set, because a heading with no
 * words is a blank row; it is the one thing the block cannot compose, in the same
 * way a per-row checkbox name is.
 *
 * **A heading is not a record, and the two facts follow from that.** A heading is
 * a row in the same body as any other, so it is content rather than a second
 * region, and it is never in the selection set, never in the count and never what
 * the header's page scope counts: a body of forty headings over four hundred rows
 * selects four hundred records and says so. The header's control is built from
 * `rows` and `getRowId` alone, so it reaches a heading in no arrangement.
 */
type DataTable01GroupingProps =
  | {
      /** Absent for an index that draws a flat body. */
      groupBy?: undefined
      /** Absent for an index that draws a flat body. */
      groupLabel?: never
    }
  | {
      /**
       * The key a row belongs to, or `undefined` for a row with no group.
       *
       * It is a key rather than a heading so that the block stays out of the
       * caller's copy and out of its ordering, and so that a heading and the rows
       * under it can never disagree about which group a record is in.
       */
      groupBy: (row: DataTableRow) => string | undefined
      /** The heading for one group key, drawn in a full-width row above the group. */
      groupLabel: (key: string) => ReactNode
    }

/**
 * Which population the current selection covers, because the two are announced
 * differently.
 *
 * A selection of everything on the page is one the block can count, so the page
 * arm needs nothing beyond the selection set and the block announces
 * `labels.selectedCount`. A selection of everything matching the current filter
 * is a population the block never fetched, so the filter arm carries the number
 * from the caller and the block announces `labels.selectedAllMatching` instead of
 * printing the page as if it were the total. The filter arm's `count` is
 * required, because the one thing the summary must never do is derive a total
 * from the rows on screen.
 *
 * It is a fact about the selection rather than a rule the block evaluates: the
 * caller selects the population in its own store, reports it here and passes the
 * number it already holds.
 */
export type DataTable01SelectionScope =
  | { scope: 'page' }
  | {
      scope: 'filter'
      /**
       * How many records match the current filter, in the caller's own count.
       *
       * Required, and never derived from the rows: the block holds one page and a
       * count over that page says nothing about the population the reader asked
       * for.
       */
      count: number
    }

/** The props every arm of the block shares, selection aside. */
type DataTable01SharedProps = {
  title?: ReactNode
  description?: ReactNode
  /**
   * The columns, as typed data from the shared column specification.
   *
   * `key`, `header` and `kind` are required on each one, and the whole list is
   * drawn in the order it is written. The block never reorders, hides or drops a
   * column the caller did not hide through the column chooser.
   */
  columns: readonly ColumnSpec[]
  /** The rows for the current page. The block renders them; it never fetches. */
  rows: readonly DataTableRow[]
  /**
   * Returns a stable identity for a row.
   *
   * Required rather than optional, because sorting, filtering, paging and deleting
   * all move a row's index, so an index-keyed selection silently changes which
   * records a batch action acts on.
   */
  getRowId: (row: DataTableRow) => string
  /** Names the table for assistive technology when no heading does. */
  caption?: ReactNode
  /** Heading level for the table's own heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /** The column and direction the caller wants ordered, or `null` for no order. */
  sort?: DataTableSort | null
  /** Called with the next order when a sortable header is pressed. */
  onSortChange?: (sort: DataTableSort | null) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: DataTableFilter[]
  filterValues?: Record<string, string | undefined>
  onFilterChange?: (id: string, value: string | undefined) => void
  /** The current page, 1-based. */
  page?: number
  defaultPage?: number
  /** How many pages exist. At least 1. */
  pageCount: number
  onPageChange?: (page: number) => void
  /**
   * The caller's own node for one row's trailing cell.
   *
   * A node per row rather than a declared action list, because a block ships no
   * behaviour and a row that looks like a command but carries none is a control a
   * reader can focus and cannot act on. The caller composes `OverflowActions`,
   * `DropdownMenu` or `CtaLink`, and the block draws the cell and nothing inside it.
   */
  renderRowActions?: (row: DataTableRow) => ReactNode
  /** Controls rendered at the end of the toolbar, e.g. a create Button. */
  toolbarActions?: ReactNode
  /** Replaces the fallback empty line. */
  emptyMessage?: ReactNode
  labels: DataTable01Labels
} & DataTable01GroupingProps

/**
 * The record index, which owns a set of row keys and reports every change.
 *
 * The two arms make the contract the type's: a selectable index must be handed the
 * callback that reports a change and the node the batch bar holds, and a plain table
 * may be handed neither, because a tick with nowhere to report is a checkbox that
 * changes nothing a caller can hear.
 */
export type DataTable01Props =
  | (DataTable01SharedProps & {
      selectable?: false
      selectedIds?: never
      defaultSelectedIds?: never
      onSelectedIdsChange?: never
      batchActions?: never
      selectionScope?: never
    })
  | (DataTable01SharedProps & {
      selectable: true
      /** The selected keys, controlled. Omit it and the block holds the set. */
      selectedIds?: readonly string[]
      /** The selected keys the in-heart set starts from. */
      defaultSelectedIds?: readonly string[]
      /**
       * Called with the whole set after every change, whether or not the caller is
       * listening, so mirroring it costs one line and ignoring it costs zero.
       */
      onSelectedIdsChange: (ids: string[]) => void
      /**
       * The caller's own controls for the batch bar, mounted only while a selection
       * exists. The block draws the frame, the count and the dismiss and places this
       * node; it never draws a command of its own.
       */
      batchActions: ReactNode
      /**
       * Which population the selection covers. Absent means the page.
       *
       * The caller reports it when its own selection is the whole matching
       * population rather than the rows on screen, and passes that population's
       * count on the filter arm. The block owns no control that selects it: it
       * holds one page and cannot reach the rest, so the caller selects in its own
       * store and tells the block what it selected.
       */
      selectionScope?: DataTable01SelectionScope
    })

/** The page numbers to show, with `ellipsis` where a run is held back. */
function pageWindow(page: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }
  const pages: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) pages.push('ellipsis')
  for (let value = start; value <= end; value += 1) pages.push(value)
  if (end < pageCount - 1) pages.push('ellipsis')
  pages.push(pageCount)
  return pages
}

/** Where a value belongs in a cell, defaulting to the start. */
function alignClass(column: ColumnSpec): string {
  if (column.align === 'center') return 'text-center'
  if (column.align === 'end') return 'text-end'
  return 'text-start'
}

/**
 * One cell, drawn from the column's kind and the row's value at its key.
 *
 * The value at `column.key` is the cell's own content. A kind that names a
 * single-node cell (`Typography`, `Badge`, `Avatar`, `Kbd`) draws the value as that
 * Component's child; a kind that names a structured cell (`Price`, `RelativeTime`,
 * `Status`, `TagGroup`, `Checklist`, `Diff`, `Mark`, `CodeBlock`) takes the value as
 * that Component's props; and `slot` draws the value as the caller's own node.
 *
 * The map is keyed by the kind's lowercase name and every member of `ColumnKind`
 * has one entry, so a kind added to the union fails the compiler here until it is
 * drawn. The lowercase keys are machine values rather than copy, which is the same
 * reason a variant name is written in lowercase everywhere else in this package.
 */
const CELL: Record<Lowercase<ColumnKind>, (value: unknown) => ReactNode> = {
  typography: (value) => <Text as="span">{value as ReactNode}</Text>,
  price: (value) => <Price {...(value as ComponentProps<typeof Price>)} />,
  relativetime: (value) => <RelativeTime {...(value as ComponentProps<typeof RelativeTime>)} />,
  status: (value) => <Status {...(value as ComponentProps<typeof Status>)} />,
  badge: (value) => <Badge>{value as ReactNode}</Badge>,
  avatar: (value) => <Avatar>{value as ReactNode}</Avatar>,
  taggroup: (value) => <TagGroup {...(value as ComponentProps<typeof TagGroup>)} />,
  checklist: (value) => <Checklist {...(value as ComponentProps<typeof Checklist>)} />,
  diff: (value) => <Diff {...(value as ComponentProps<typeof Diff>)} />,
  mark: (value) => <Mark {...(value as ComponentProps<typeof Mark>)} />,
  kbd: (value) => <Kbd>{value as ReactNode}</Kbd>,
  codeblock: (value) => <CodeBlock {...(value as ComponentProps<typeof CodeBlock>)} />,
  slot: (value) => value as ReactNode,
}

/** The cell for one column and one row. */
function renderCell(column: ColumnSpec, row: DataTableRow): ReactNode {
  return CELL[column.kind.toLowerCase() as Lowercase<ColumnKind>](row[column.key])
}

/**
 * The record index: a table of rows a reader scans and acts on.
 *
 * It draws the page of rows it was handed for the page it was told about, and it
 * fetches nothing, sorts nothing, filters nothing and slices nothing. `columns` is
 * the shared `ColumnSpec` typed data rather than a render function per column, so
 * alignment, width, the header and the sort affordance are drawn once for every
 * consumer. `getRowId` is required, because a row's position moves under sorting,
 * filtering and paging and an index-keyed selection would act on the wrong records.
 *
 * **It holds the selection set it was given, and reports every change.** This is the
 * one piece of state a block in this repository keeps, and it is scoped by what the
 * state is: a set of keys the caller passed for the page about to be drawn. Nothing
 * in the block fetches, derives from application state or decides. A consumer that
 * wants the set mirrored passes `selectedIds` and writes one line in
 * `onSelectedIdsChange`; a consumer that wants nothing passes neither and the block
 * still draws the tick, the header's three-state control, the count, the batch bar
 * and the announcement.
 *
 * **The count is announced once, politely.** One `LiveRegion` at `polite` carries the
 * count and is never assertive, and it is mounted while there is an announcement
 * rather than always, so its appearance is the first thing spoken rather than a
 * silent mutation of a node that was always there. It announces the count and never
 * a list of labels, because each row's own checkbox already names its record. When
 * the set empties, the region speaks its own sentence rather than a count of zero.
 * The visible summary in the footer and the announced count are the same string.
 *
 * **The batch bar is the block's region and the caller's controls.** It mounts only
 * while the set is non-empty, displaces the filter controls rather than sitting
 * beside them, and holds one required `batchActions` node the caller wrote plus the
 * block's own dismiss. The dismiss is the only control the block draws, and its whole
 * body is the same report every tick makes with an empty set.
 *
 * **Per-row actions are a node per row.** The block draws the trailing cell and
 * places `renderRowActions(row)` inside it, so a row that navigates and a row that is
 * ticked are two separately reachable targets and the block owns no command.
 *
 * **Grouping is a key on a row, not a second arrangement.** `groupBy` returns the key
 * a row belongs to and the block draws `groupLabel(key)` in a full-width row above
 * each run of rows that shares one, in the caller's own order. A heading is a row in
 * the same body as any other and it is not a record: it is never in the selection
 * set, never in the count and never what the header's page scope counts.
 *
 * **The two selection scopes are announced differently.** A page-wide selection is
 * one the block can count, so it speaks `labels.selectedCount`. A filter-wide
 * selection is a population the block never fetched, so the caller reports it
 * through `selectionScope` and the block speaks `labels.selectedAllMatching` with the
 * caller's own number rather than printing the page as if it were the total.
 */
export function DataTable01(props: DataTable01Props) {
  const {
    title,
    description,
    columns,
    rows,
    getRowId,
    caption,
    headingLevel = 'h2',
    sort: sortProp,
    onSortChange,
    searchValue,
    onSearchChange,
    filters,
    filterValues,
    onFilterChange,
    page: pageProp,
    defaultPage = 1,
    pageCount,
    onPageChange,
    renderRowActions,
    toolbarActions,
    emptyMessage,
    labels,
    groupBy,
    groupLabel,
  } = props

  const Heading = headingLevel
  // The handle the table names itself from; see the note on the table.
  const headingId = useId()
  // The prefix the per-cell help ids are built from.
  const helpPrefix = useId()
  const isSelectable = props.selectable === true
  const [internalSelected, setInternalSelected] = useState<string[]>(() => [
    ...(props.defaultSelectedIds ?? []),
  ])
  const [internalPage, setInternalPage] = useState(defaultPage)
  const [internalSearch, setInternalSearch] = useState('')
  const [internalFilters, setInternalFilters] = useState<Record<string, string | undefined>>({})
  const [internalSort, setInternalSort] = useState<DataTableSort | null>(null)
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])

  const selected = isSelectable
    ? props.selectedIds === undefined
      ? internalSelected
      : [...props.selectedIds]
    : []
  const page = pageProp ?? internalPage
  const search = searchValue ?? internalSearch
  const activeFilters = filterValues ?? internalFilters
  const sortState = sortProp !== undefined ? sortProp : internalSort
  const clampPage = (value: number) => Math.min(Math.max(1, value), Math.max(1, pageCount))
  const currentPage = clampPage(page)

  const visibleColumns = columns.filter((column) => !hiddenColumns.includes(column.key))
  const hasRowActions = renderRowActions !== undefined
  const columnCount = (isSelectable ? 1 : 0) + visibleColumns.length + (hasRowActions ? 1 : 0)

  // The scope the caller reports. Absent means the page, which is the one
  // population the block can count for itself.
  const scope = isSelectable ? props.selectionScope : undefined
  const filterScope = scope?.scope === 'filter' ? scope : undefined
  // A filter-wide selection is a selection even though its keys are not on screen,
  // so the bar mounts and the region speaks from the scope rather than from the
  // page's keys. The number is the caller's and is never the rows on screen.
  const selectionActive = isSelectable && (filterScope !== undefined || selected.length > 0)
  const selectionSummary =
    filterScope !== undefined
      ? labels.selectedAllMatching(filterScope.count)
      : labels.selectedCount(selected.length)

  const rowIds = rows.map(getRowId)
  // A filter-wide selection covers the page whether or not the page's keys were
  // passed, so the header reads as fully selected on that arm. A heading is not in
  // `rowIds`, so grouping never changes what these two say.
  const allSelected =
    filterScope !== undefined || (rowIds.length > 0 && rowIds.every((id) => selected.includes(id)))
  const someSelected = filterScope !== undefined || rowIds.some((id) => selected.includes(id))

  // The emptying sentence. A live region speaks when its text changes, and the
  // sequence where the selection falls to nothing is the one the reader has to be told
  // about because the batch bar they were about to use disappears with it. The
  // previous presence is ref-held, so the render that reaches nothing still knows
  // there was a selection and can speak the sentence rather than the absence of one.
  const previousActive = useRef(selectionActive)
  useEffect(() => {
    previousActive.current = selectionActive
  }, [selectionActive])
  const announcement = selectionActive
    ? selectionSummary
    : previousActive.current
      ? labels.clearedSelection
      : null

  function changeSelection(ids: string[]) {
    if (isSelectable === false) return
    if (props.selectedIds === undefined) setInternalSelected(ids)
    props.onSelectedIdsChange?.(ids)
  }

  function clearSelection() {
    changeSelection([])
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      changeSelection([...new Set([...selected, ...rowIds])])
    } else {
      changeSelection(selected.filter((id) => !rowIds.includes(id)))
    }
  }

  function toggleRow(id: string, checked: boolean) {
    changeSelection(checked ? [...selected, id] : selected.filter((item) => item !== id))
  }

  function changeSearch(value: string) {
    if (searchValue === undefined) setInternalSearch(value)
    onSearchChange?.(value)
  }

  function changeFilter(id: string, value: string | undefined) {
    if (filterValues === undefined) {
      setInternalFilters((previous) => ({ ...previous, [id]: value }))
    }
    onFilterChange?.(id, value)
  }

  function resetFilters() {
    if (filterValues === undefined) setInternalFilters({})
    for (const filter of filters ?? []) onFilterChange?.(filter.id, undefined)
  }

  function changePage(next: number) {
    const clamped = clampPage(next)
    if (pageProp === undefined) setInternalPage(clamped)
    onPageChange?.(clamped)
  }

  function changeSort(column: string, direction: TableSortDirection) {
    const next = direction === 'none' ? null : { column, direction }
    if (sortProp === undefined) setInternalSort(next)
    onSortChange?.(next)
  }

  function toggleColumn(key: string, visible: boolean) {
    setHiddenColumns((previous) =>
      visible ? previous.filter((item) => item !== key) : [...previous, key],
    )
  }

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length
  // The key of the row before this one, so a heading belongs to a run of rows and
  // not to a row. It resets every render and is read by the body below.
  let previousGroupKey: string | undefined

  return (
    <div className="flex flex-col gap-4">
      {title || description ? (
        <div className="flex flex-col gap-1">
          {title ? (
            <Heading
              id={headingId}
              className={`font-semibold tracking-tight text-balance ${headingSizeClass(headingLevel)}`}
            >
              {title}
            </Heading>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/*
         * The batch bar displaces the filter controls rather than sitting beside
         * them, because a reader who has just selected forty rows does not also want a
         * filter panel competing for the same row. Its frame, its count and its
         * dismiss are the block's; everything inside it is the caller's node.
         */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {selectionActive ? (
            <div
              data-slot="data-table-01-batch-bar"
              role="toolbar"
              aria-label={selectionSummary}
              className="bg-card flex w-full items-center gap-1 rounded-md border p-1"
            >
              <span className="text-muted-foreground px-2 text-sm font-medium">
                {selectionSummary}
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {props.selectable === true ? props.batchActions : null}
              </div>
              <Button
                data-slot="data-table-01-dismiss"
                type="button"
                variant="ghost"
                size="sm"
                aria-label={labels.dismissSelection}
                onClick={clearSelection}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(event) => changeSearch(event.target.value)}
                  placeholder={labels.search}
                  aria-label={labels.search}
                  className="h-9 w-56 pl-8"
                />
              </div>

              {filters?.length ? (
                <Popover>
                  <PopoverTrigger>
                    <ListFilter className="size-4" />
                    {labels.filters}
                    {activeFilterCount > 0 ? (
                      <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </PopoverTrigger>
                  <PopoverContent align="start" className="flex w-64 flex-col gap-4">
                    {filters.map((filter) => (
                      <div key={filter.id} className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">{filter.label}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {filter.options.map((option) => {
                            const active = activeFilters[filter.id] === option.value
                            return (
                              <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={active ? 'default' : 'outline'}
                                onClick={() =>
                                  changeFilter(filter.id, active ? undefined : option.value)
                                }
                              >
                                {option.label}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={activeFilterCount === 0}
                      onClick={resetFilters}
                    >
                      {labels.reset}
                    </Button>
                  </PopoverContent>
                </Popover>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {toolbarActions}
          <DropdownMenu>
            <DropdownMenuTrigger>
              {labels.viewColumns}
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{labels.columns}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={!hiddenColumns.includes(column.key)}
                  closeOnClick={false}
                  onCheckedChange={(checked) => toggleColumn(column.key, checked)}
                >
                  {typeof column.header === 'string' ? column.header : column.key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/*
       * One polite live region, never assertive: a selection change fires once per
       * keypress while a reader is arrowing down a column and the count is not an
       * emergency. It carries the count rather than a list of labels, and the empty
       * case is its own sentence. `LiveRegion` draws nothing for an empty child, so a
       * table with nothing selected has no region on the page at all.
       */}
      <LiveRegion data-slot="data-table-01-announcement" politeness="polite" className="sr-only">
        {announcement}
      </LiveRegion>

      <div className="border-border overflow-hidden rounded-xl border">
        {/*
         * The table takes its name from the heading above it, and from caption when
         * the caller gave one. A <table> is named by a caption, an aria-label or an
         * aria-labelledby, and none of the three is inferred from a heading that
         * happens to be nearby, so a reader listing the tables on a page found this one
         * anonymous while every other element around it was named. The reference is
         * written only while the heading is drawn, because this block's title is
         * optional and a reference to an element that is not there is a defect. And it
         * is written only while the caller brought no caption, because a reference
         * outranks a <caption> in the accessible name algorithm.
         */}
        <Table aria-labelledby={caption === undefined && title ? headingId : undefined}>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              {isSelectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onCheckedChange={toggleAll}
                    aria-label={labels.selectAll}
                  />
                </TableHead>
              ) : null}
              {visibleColumns.map((column) =>
                column.sortable ? (
                  <TableSort
                    key={column.key}
                    column={column.key}
                    direction={sortState?.column === column.key ? sortState.direction : 'none'}
                    onDirectionChange={(direction) => changeSort(column.key, direction)}
                    announce={(direction) => labels.sort(column.key, direction)}
                    className={cn(column.width)}
                  >
                    {column.header}
                  </TableSort>
                ) : (
                  <TableHead key={column.key} className={cn(column.width, alignClass(column))}>
                    {column.header}
                  </TableHead>
                ),
              )}
              {hasRowActions ? (
                <TableHead className="w-10">
                  <span className="sr-only">{labels.rowActions}</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row, rowIndex) => {
                const id = getRowId(row)
                const isSelected = selected.includes(id)
                // A heading is drawn once per run of rows with one key, in the
                // caller's own order. A row with no key starts no heading and is not
                // a record that a group owns; it is simply ungrouped.
                const rowGroupKey = groupBy?.(row)
                const startsGroup =
                  groupBy !== undefined &&
                  rowGroupKey !== undefined &&
                  rowGroupKey !== previousGroupKey
                previousGroupKey = rowGroupKey
                return (
                  <Fragment key={id}>
                    {/*
                     * A heading is a row in the same body as any other, so it is
                     * content rather than a region, and it is never in the selection
                     * set, in the count or in what the header's page scope counts:
                     * the header is built from `rowIds` alone and never sees it.
                     */}
                    {startsGroup ? (
                      <TableRow data-slot="data-table-01-group">
                        <TableCell
                          colSpan={columnCount}
                          className="text-muted-foreground bg-muted text-sm font-medium"
                        >
                          {groupLabel?.(rowGroupKey as string)}
                        </TableCell>
                      </TableRow>
                    ) : null}
                    <TableRow data-state={isSelected ? 'selected' : undefined}>
                      {isSelectable ? (
                        <TableCell className="w-10">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => toggleRow(id, checked)}
                            aria-label={labels.selectRow(row)}
                          />
                        </TableCell>
                      ) : null}
                      {visibleColumns.map((column, columnIndex) => {
                        const helpId =
                          column.help === undefined
                            ? undefined
                            : `${helpPrefix}-help-${columnIndex}-${rowIndex}`
                        return (
                          <TableCell
                            key={column.key}
                            className={cn(column.width, alignClass(column))}
                            aria-describedby={helpId}
                          >
                            {renderCell(column, row)}
                            {helpId === undefined ? null : (
                              <span id={helpId} className="sr-only">
                                {column.help}
                              </span>
                            )}
                          </TableCell>
                        )
                      })}
                      {hasRowActions ? (
                        <TableCell className="text-right">
                          {renderRowActions?.(row)}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  </Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-muted-foreground h-24 text-center">
                  {emptyMessage ?? labels.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {selectionActive ? (
          <span className="text-muted-foreground text-sm">{selectionSummary}</span>
        ) : (
          <span />
        )}

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage <= 1}
                aria-label={labels.previous}
                onClick={() => changePage(currentPage - 1)}
              >
                {labels.previous}
              </Button>
            </PaginationItem>
            {pageWindow(currentPage, Math.max(1, pageCount)).map((item, index) =>
              item === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <span aria-hidden="true" className="text-muted-foreground px-2">
                    ...
                  </span>
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <Button
                    type="button"
                    variant={item === currentPage ? 'outline' : 'ghost'}
                    size="icon"
                    aria-label={labels.page(item)}
                    aria-current={item === currentPage ? 'page' : undefined}
                    onClick={() => changePage(item)}
                  >
                    {item}
                  </Button>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage >= Math.max(1, pageCount)}
                aria-label={labels.next}
                onClick={() => changePage(currentPage + 1)}
              >
                {labels.next}
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

export default DataTable01
