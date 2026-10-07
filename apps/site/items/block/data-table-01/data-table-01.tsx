'use client'

import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@nanisoft/prism-ui/components/dropdown-menu'
import {
  DataTable01,
  type DataTable01SelectionScope,
  type DataTableRow,
} from '@nanisoft/prism-ui/blocks/data-table-01'
import type { ColumnSpec } from '@nanisoft/prism-ui/spec'

const ACCOUNTS: DataTableRow[] = [
  { id: 'northwind', name: 'Northwind', plan: 'Team', status: 'Active', seats: '24' },
  { id: 'contoso', name: 'Contoso', plan: 'Business', status: 'Active', seats: '86' },
  { id: 'fabrikam', name: 'Fabrikam', plan: 'Team', status: 'Paused', seats: '12' },
  { id: 'adventure', name: 'Adventure Works', plan: 'Starter', status: 'Active', seats: '4' },
  { id: 'litware', name: 'Litware', plan: 'Business', status: 'Active', seats: '140' },
  { id: 'proseware', name: 'Proseware', plan: 'Starter', status: 'Paused', seats: '7' },
]

const COLUMNS: readonly ColumnSpec[] = [
  { key: 'name', header: 'Account', kind: 'Typography' },
  { key: 'plan', header: 'Plan', kind: 'Badge' },
  { key: 'status', header: 'Status', kind: 'Badge' },
  { key: 'seats', header: 'Seats', kind: 'Typography', align: 'end' },
]

const PAGE_SIZE = 3

/**
 * A record index wired to local state: search, filters, grouping, a per-row
 * overflow menu written as render elements, selection and paging.
 */
export default function DataTable01Demo() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string | undefined>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [scope, setScope] = useState<DataTable01SelectionScope>({ scope: 'page' })
  const [page, setPage] = useState(1)

  const filtered = ACCOUNTS.filter((row) => {
    const matchesQuery = String(row.name).toLowerCase().includes(query.toLowerCase())
    const matchesStatus = !filters.status || row.status === filters.status
    return matchesQuery && matchesStatus
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Selecting every matching account is the caller's job: the block holds one
  // page and this demo holds the whole filtered set, so it selects them here and
  // tells the block the scope and the population's own count.
  function selectAllMatching() {
    setSelected(filtered.map((row) => String(row.id)))
    setScope({ scope: 'filter', count: filtered.length })
  }

  return (
    <DataTable01
      title="Accounts"
      description="Every workspace you can manage."
      columns={COLUMNS}
      rows={pageRows}
      getRowId={(row) => String(row.id)}
      selectable
      selectedIds={selected}
      onSelectedIdsChange={(ids) => {
        setSelected(ids)
        setScope({ scope: 'page' })
      }}
      selectionScope={scope}
      batchActions={
        <Button size="sm" onClick={() => setSelected([])}>
          Archive selected
        </Button>
      }
      groupBy={(row) => String(row.plan)}
      groupLabel={(key) => key}
      renderRowActions={(row) => (
        <DropdownMenu>
          <DropdownMenuTrigger aria-label={`Actions for ${String(row.name)}`} className="size-8 p-0">
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<a href={`/accounts/${String(row.id)}`} />}>
              View account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      searchValue={query}
      onSearchChange={(value) => {
        setQuery(value)
        setPage(1)
      }}
      filters={[
        {
          id: 'status',
          label: 'Status',
          options: [
            { label: 'Active', value: 'Active' },
            { label: 'Paused', value: 'Paused' },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={(id, value) => {
        setFilters((previous) => ({ ...previous, [id]: value }))
        setPage(1)
      }}
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
      toolbarActions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={selectAllMatching}>
            Select all {filtered.length} matching
          </Button>
          <Button size="sm">New account</Button>
        </div>
      }
      labels={{
        search: 'Search accounts',
        filters: 'Filters',
        reset: 'Reset filters',
        columns: 'Columns',
        viewColumns: 'View',
        selectAll: 'Select every account on this page',
        selectRow: (row) => `Select ${String(row.name)}`,
        rowActions: 'Account actions',
        sort: (column, direction) => `Sort by ${column}, ${direction}`,
        selectedCount: (count) => `${count} selected on this page`,
        selectedAllMatching: (count) => `All ${count} matching accounts selected`,
        clearedSelection: 'No accounts selected',
        dismissSelection: 'Clear selection',
        previous: 'Previous',
        next: 'Next',
        page: (value) => `Go to page ${value}`,
        empty: 'No accounts match the current search and filters.',
      }}
    />
  )
}
