'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { DashboardPage } from '@nanisoft/prism-ui/pages/dashboard-page'
import type { ColumnSpec } from '@nanisoft/prism-ui/spec'

const LINKS = [
  { href: '#dashboard', label: 'Dashboard', current: true },
  { href: '#projects', label: 'Projects', current: false },
  { href: '#team', label: 'Team', current: false },
]

const ACCOUNTS = [
  { id: 'northwind', name: 'Northwind', plan: 'Team', status: 'Active', seats: '24' },
  { id: 'contoso', name: 'Contoso', plan: 'Business', status: 'Active', seats: '86' },
  { id: 'fabrikam', name: 'Fabrikam', plan: 'Team', status: 'Paused', seats: '12' },
  { id: 'adventure', name: 'Adventure Works', plan: 'Starter', status: 'Active', seats: '4' },
  { id: 'litware', name: 'Litware', plan: 'Business', status: 'Active', seats: '140' },
  { id: 'proseware', name: 'Proseware', plan: 'Starter', status: 'Paused', seats: '7' },
]

const PAGE_SIZE = 3

/** The dashboard page, with the shell, a header, a KPI row and a driven table. */
export default function DashboardPageDemo() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string | undefined>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const filtered = ACCOUNTS.filter((row) => {
    const matchesQuery = row.name.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = !filters.status || row.status === filters.status
    return matchesQuery && matchesStatus
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DashboardPage
      shell={{
        navigationLabel: 'Primary',
        brand: <span className="text-sm font-semibold">Northwind</span>,
        breadcrumbs: [{ label: 'Dashboard', href: '#dashboard' }, { label: 'Overview' }],
        actions: (
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
            AR
          </span>
        ),
        navigation: (
          <ul className="flex flex-col gap-1 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={
                    link.current
                      ? 'bg-accent text-accent-foreground block rounded-md px-3 py-2 font-medium'
                      : 'text-muted-foreground hover:text-foreground block rounded-md px-3 py-2'
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ),
      }}
      header={{
        breadcrumbs: [{ label: 'Dashboard', href: '#dashboard' }, { label: 'Overview' }],
        title: 'Overview',
        description: 'Accounts, usage and the people on this workspace.',
        actions: [{ label: 'New account', href: '#new-account' }],
      }}
      stats={{
        eyebrow: 'This month',
        title: 'Delivery',
        headingLevel: 'h2',
        stats: [
          { label: 'Active accounts', value: '1,284', delta: 12, hint: 'vs last month' },
          { label: 'On track', value: '47.2%', delta: -3, hint: 'vs last month' },
          { label: 'Open issues', value: '138' },
        ],
      }}
      table={{
        title: 'Accounts',
        description: 'Every workspace you can manage.',
        columns: [
          { key: 'name', header: 'Account', kind: 'Typography' },
          { key: 'plan', header: 'Plan', kind: 'Badge' },
          { key: 'status', header: 'Status', kind: 'Badge' },
          { key: 'seats', header: 'Seats', kind: 'Typography', align: 'end' },
        ] satisfies readonly ColumnSpec[],
        rows: pageRows,
        getRowId: (row) => String(row.id),
        selectable: true,
        selectedIds: selected,
        onSelectedIdsChange: setSelected,
        batchActions: (
          <Button size="sm" onClick={() => setSelected([])}>
            Archive selected
          </Button>
        ),
        renderRowActions: (row) => (
          <CtaLink href={`#account-${String(row.id)}`} size="sm" variant="ghost">
            View
          </CtaLink>
        ),
        searchValue: query,
        onSearchChange: (value) => {
          setQuery(value)
          setPage(1)
        },
        filters: [
          {
            id: 'status',
            label: 'Status',
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Paused', value: 'Paused' },
            ],
          },
        ],
        filterValues: filters,
        onFilterChange: (id, value) => {
          setFilters((previous) => ({ ...previous, [id]: value }))
          setPage(1)
        },
        page,
        pageCount,
        onPageChange: setPage,
        labels: {
          search: 'Search accounts',
          filters: 'Filters',
          reset: 'Reset filters',
          columns: 'Columns',
          viewColumns: 'View',
          selectAll: 'Select every account on this page',
          selectRow: (row) => `Select ${String(row.name)}`,
          rowActions: 'Account actions',
          sort: (column, direction) => `Sort by ${column}, ${direction}`,
          selectedCount: (count) => `${count} selected`,
          selectedAllMatching: (count) => `All ${count} matching accounts selected`,
          clearedSelection: 'No accounts selected',
          dismissSelection: 'Clear selection',
          previous: 'Previous',
          next: 'Next',
          page: (value) => `Go to page ${value}`,
          empty: 'No accounts match the current search and filters.',
        },
      }}
    />
  )
}
