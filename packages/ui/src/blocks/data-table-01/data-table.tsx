'use client'

import { ChevronDown, ListFilter, MoreHorizontal, Search } from 'lucide-react'
import { Fragment, useState, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Input } from '../../components/ui/input'
import { Pagination, PaginationContent, PaginationItem } from '../../components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

/** One row of data. Identity comes from `getRowId`, not from the shape. */
export type DataTableRow = Record<string, unknown>

export type DataTableColumn = {
  /** Stable identifier, used for keys and the visibility menu. */
  id: string
  /** The column heading. */
  header: ReactNode
  /** Renders the cell for one row. */
  cell: (row: DataTableRow) => ReactNode
  /** A plain-text name for the visibility menu. Falls back to `id`. */
  label?: string
  /** Layout classes, for alignment or a fixed width. */
  className?: string
}

export type DataTableFilterOption = { label: string; value: string }

export type DataTableFilter = {
  id: string
  label: string
  options: DataTableFilterOption[]
}

export type DataTableRowAction = {
  label: string
  variant?: 'default' | 'destructive'
  onSelect?: () => void
}

/**
 * Every string the block renders. Required because the block ships no copy of
 * its own: a control hint, a selection summary and an empty-state line are the
 * consumer's to write.
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
  selectAll: string
  selectRow: string
  rowActions: string
  previous: string
  next: string
  /** Accessible name for one page control. */
  page: (page: number) => string
  /** The selection summary. */
  selectedCount: (count: number) => string
  /** Shown in the body when `rows` is empty and `emptyMessage` is not set. */
  empty: string
}

export type DataTable01Props = {
  title?: ReactNode
  description?: ReactNode
  columns: DataTableColumn[]
  /** The rows for the current page. The block renders them; it never fetches. */
  rows: DataTableRow[]
  /** Returns a stable identity for a row. */
  getRowId: (row: DataTableRow) => string
  /** Names the table for assistive technology when no heading does. */
  caption?: ReactNode
  /** Adds the selection column and the selection summary. */
  selectable?: boolean
  selectedIds?: string[]
  defaultSelectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
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
  /** The per-row action menu. Return an empty array to omit the menu. */
  rowActions?: (row: DataTableRow) => DataTableRowAction[]
  /** Controls rendered at the end of the toolbar, e.g. a create Button. */
  toolbarActions?: ReactNode
  /** Replaces the fallback empty line. */
  emptyMessage?: ReactNode
  labels: DataTable01Labels
}

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

function RowMenu({ actions, label }: { actions: DataTableRowAction[]; label: string }) {
  if (!actions.length) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={label} className="size-8 p-0">
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          // Positional: an action label is display content and two may repeat.
          <DropdownMenuItem
            key={index}
            variant={action.variant}
            onClick={action.onSelect}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * A table section with a toolbar, filters, row selection and pagination.
 *
 * The block renders exactly the rows it is given for the current page and
 * reports every interaction through a callback. It performs no filtering,
 * sorting or fetching of its own: the page, the search text, the filter values
 * and the selection are the consumer's state, so a server-rendered page and a
 * client data layer can each drive it. Every label is a prop.
 */
export function DataTable01({
  title,
  description,
  columns,
  rows,
  getRowId,
  caption,
  selectable = false,
  selectedIds,
  defaultSelectedIds,
  onSelectedIdsChange,
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  page: pageProp,
  defaultPage = 1,
  pageCount,
  onPageChange,
  rowActions,
  toolbarActions,
  emptyMessage,
  labels,
}: DataTable01Props) {
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelectedIds ?? [])
  const [internalPage, setInternalPage] = useState(defaultPage)
  const [internalSearch, setInternalSearch] = useState('')
  const [internalFilters, setInternalFilters] = useState<Record<string, string | undefined>>({})
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])

  const selected = selectedIds ?? internalSelected
  const page = pageProp ?? internalPage
  const search = searchValue ?? internalSearch
  const activeFilters = filterValues ?? internalFilters
  const clampPage = (value: number) => Math.min(Math.max(1, value), Math.max(1, pageCount))
  const currentPage = clampPage(page)

  const visibleColumns = columns.filter((column) => !hiddenColumns.includes(column.id))
  const hasRowActions = Boolean(rowActions)
  const columnCount =
    (selectable ? 1 : 0) + visibleColumns.length + (hasRowActions ? 1 : 0)

  const rowIds = rows.map(getRowId)
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id))
  const someSelected = rowIds.some((id) => selected.includes(id))

  function changeSelection(ids: string[]) {
    if (selectedIds === undefined) setInternalSelected(ids)
    onSelectedIdsChange?.(ids)
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

  function toggleColumn(id: string, visible: boolean) {
    setHiddenColumns((previous) =>
      visible ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  return (
    <div className="flex flex-col gap-4">
      {title || description ? (
        <div className="flex flex-col gap-1">
          {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : null}
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
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
                  key={column.id}
                  checked={!hiddenColumns.includes(column.id)}
                  closeOnClick={false}
                  onCheckedChange={(checked) => toggleColumn(column.id, checked)}
                >
                  {column.label ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-border overflow-hidden rounded-xl border">
        <Table>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onCheckedChange={toggleAll}
                    aria-label={labels.selectAll}
                  />
                </TableHead>
              ) : null}
              {visibleColumns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {hasRowActions ? (
                <TableHead className="w-10">
                  <span className="sr-only">{labels.rowActions}</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => {
                const id = getRowId(row)
                const isSelected = selected.includes(id)
                const actions = rowActions?.(row) ?? []
                return (
                  <TableRow key={id} data-state={isSelected ? 'selected' : undefined}>
                    {selectable ? (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleRow(id, checked)}
                          aria-label={labels.selectRow}
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.map((column) => (
                      <TableCell key={column.id} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                    {hasRowActions ? (
                      <TableCell className="text-right">
                        <RowMenu actions={actions} label={labels.rowActions} />
                      </TableCell>
                    ) : null}
                  </TableRow>
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
        {selectable ? (
          <span className="text-muted-foreground text-sm">
            {labels.selectedCount(selected.length)}
          </span>
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
