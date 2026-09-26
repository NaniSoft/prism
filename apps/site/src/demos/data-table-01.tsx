'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { DataTable01, type DataTableRow } from '@nanisoft/prism-ui/blocks/data-table-01'

const ACCOUNTS: DataTableRow[] = [
  { id: 'northwind', name: 'Northwind', plan: 'Team', status: 'Active', seats: '24' },
  { id: 'contoso', name: 'Contoso', plan: 'Business', status: 'Active', seats: '86' },
  { id: 'fabrikam', name: 'Fabrikam', plan: 'Team', status: 'Paused', seats: '12' },
  { id: 'adventure', name: 'Adventure Works', plan: 'Starter', status: 'Active', seats: '4' },
  { id: 'litware', name: 'Litware', plan: 'Business', status: 'Active', seats: '140' },
  { id: 'proseware', name: 'Proseware', plan: 'Starter', status: 'Paused', seats: '7' },
]

const PAGE_SIZE = 3

/** A data table wired to local state: search, filters, selection and paging. */
export default function DataTable01Demo() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string | undefined>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const filtered = ACCOUNTS.filter((row) => {
    const matchesQuery = String(row.name).toLowerCase().includes(query.toLowerCase())
    const matchesStatus = !filters.status || row.status === filters.status
    return matchesQuery && matchesStatus
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DataTable01
      title="Accounts"
      description="Every workspace you can manage."
      columns={[
        { id: 'name', header: 'Account', label: 'Account', cell: (row) => String(row.name) },
        { id: 'plan', header: 'Plan', label: 'Plan', cell: (row) => String(row.plan) },
        { id: 'status', header: 'Status', label: 'Status', cell: (row) => String(row.status) },
        {
          id: 'seats',
          header: 'Seats',
          label: 'Seats',
          className: 'text-right',
          cell: (row) => String(row.seats),
        },
      ]}
      rows={pageRows}
      getRowId={(row) => String(row.id)}
      selectable
      selectedIds={selected}
      onSelectedIdsChange={setSelected}
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
      rowActions={() => [
        { label: 'View details' },
        { label: 'Rename' },
        { label: 'Delete', variant: 'destructive' },
      ]}
      toolbarActions={<Button size="sm">New account</Button>}
      labels={{
        search: 'Search accounts',
        filters: 'Filters',
        reset: 'Reset filters',
        columns: 'Columns',
        viewColumns: 'View',
        selectAll: 'Select every account on this page',
        selectRow: 'Select this account',
        rowActions: 'Account actions',
        previous: 'Previous',
        next: 'Next',
        page: (value) => `Go to page ${value}`,
        selectedCount: (count) => `${count} selected`,
        empty: 'No accounts match the current search and filters.',
      }}
    />
  )
}
