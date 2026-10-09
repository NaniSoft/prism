'use client'

import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@nanisoft/prism-ui/components/dropdown-menu'
import type { StatusTone } from '@nanisoft/prism-ui/components/status'
import {
  DataTable01,
  type DataTable01Labels,
  type DataTable01SelectionScope,
  type DataTableRow,
} from '@nanisoft/prism-ui/blocks/data-table-01'
import type { ColumnSpec, EventSpec } from '@nanisoft/prism-ui/spec'

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

const LABELS: DataTable01Labels = {
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
}

/**
 * A record index wired to local state: search, filters, grouping, a per-row
 * overflow menu written as render elements, selection and paging.
 */
function AccountsIndex() {
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
      headingLevel="h3"
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
      labels={LABELS}
    />
  )
}

/**
 * One delivery in the log: the shared `EventSpec` plus the two columns a log adds.
 *
 * The row type is the event the activity trail takes, and the columns are drawn
 * from it: the sending process, the event type and the endpoint are the event's
 * `actor`, `action` and `target`. The payload and the response are not members of
 * the event specification, and that is the decision the log rests on: the
 * specification names no kind and no severity, so a caller needing a response
 * composes a `Status` into the cell rather than growing the shared type for one
 * screen. That is the whole of a `DataTable01` log: the row is the shared
 * specification, and the columns a log adds are keys the caller puts on its own row.
 */
type DeliveryRow = EventSpec & {
  payload: { code: string; language: string; label: string }
  response: { tone: StatusTone; label: string }
}

const DELIVERIES: DeliveryRow[] = [
  {
    key: 'd-1004',
    at: '09:41:02',
    actor: 'dispatch',
    action: 'posted',
    target: 'POST /v1/webhooks/orders',
    payload: {
      language: 'json',
      label: 'Request body',
      code: '{\n  "order": "ORD-4821",\n  "event": "order.created"\n}',
    },
    response: { tone: 'success', label: '202 Accepted' },
    href: '/deliveries/d-1004',
    hrefLabel: 'Inspect the delivery',
  },
  {
    key: 'd-1003',
    at: '09:40:57',
    actor: 'dispatch',
    action: 'retried',
    target: 'POST /v1/webhooks/orders',
    payload: {
      language: 'json',
      label: 'Request body',
      code: '{\n  "order": "ORD-4821",\n  "event": "order.created"\n}',
    },
    response: { tone: 'warning', label: '503, attempt 2 of 5' },
    href: '/deliveries/d-1003',
    hrefLabel: 'Inspect the delivery',
  },
  {
    key: 'd-1002',
    at: '09:40:51',
    actor: 'dispatch',
    action: 'posted',
    target: 'POST /v1/webhooks/orders',
    payload: {
      language: 'json',
      label: 'Request body',
      code: '{\n  "order": "ORD-4820",\n  "event": "order.created"\n}',
    },
    response: { tone: 'destructive', label: '500, attempt 1 of 5' },
    href: '/deliveries/d-1002',
    hrefLabel: 'Inspect the delivery',
  },
  {
    key: 'd-1001',
    at: '09:38:14',
    actor: 'ingest',
    action: 'signed',
    target: 'PUT /v1/documents/inv-1042',
    payload: {
      language: 'json',
      label: 'Request body',
      code: '{\n  "digest": "sha256:6f2c...",\n  "signer": "kms/eu-west-2"\n}',
    },
    response: { tone: 'success', label: '200 OK' },
    href: '/deliveries/d-1001',
    hrefLabel: 'Inspect the delivery',
  },
]

const LOG_COLUMNS: readonly ColumnSpec[] = [
  { key: 'at', header: 'Time', kind: 'Typography', width: 'w-24' },
  { key: 'actor', header: 'Process', kind: 'Typography' },
  { key: 'action', header: 'Event', kind: 'Typography' },
  { key: 'target', header: 'Endpoint', kind: 'Typography' },
  { key: 'payload', header: 'Payload', kind: 'CodeBlock' },
  { key: 'response', header: 'Response', kind: 'Status' },
]

const LOG_LABELS: DataTable01Labels = {
  search: 'Search deliveries',
  filters: 'Filters',
  reset: 'Reset filters',
  columns: 'Columns',
  viewColumns: 'View',
  selectAll: 'Select every delivery on this page',
  selectRow: (row) => `Select delivery ${String(row.key)}`,
  rowActions: 'Delivery actions',
  sort: (column, direction) => `Sort by ${column}, ${direction}`,
  selectedCount: (count) => `${count} selected on this page`,
  selectedAllMatching: (count) => `All ${count} matching deliveries selected`,
  clearedSelection: 'No deliveries selected',
  dismissSelection: 'Clear selection',
  previous: 'Previous',
  next: 'Next',
  page: (value) => `Go to page ${value}`,
  empty: 'No deliveries match the current search and response filter.',
}

/**
 * A delivery log drawn from the shared event specification.
 *
 * The row type is `EventSpec`, so a delivery record and an audit entry are one
 * declaration rather than two, and the columns a log adds over the trail are drawn
 * from it: the sending process is `actor`, the event type is `action`, the endpoint
 * is `target`, the payload is a `CodeBlock` cell the caller composed, and the
 * response is a `Status` cell the caller composed rather than a member on the event.
 * The inspect route is a destination the caller named, with its required words, and
 * the Block composes no disclosure anywhere.
 */
function DeliveryLog() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const filtered = DELIVERIES.filter((row) => {
    const matchesQuery = [row.actor, row.action, row.target]
      .map(String)
      .some((field) => field.toLowerCase().includes(query.toLowerCase()))
    const matchesResponse = !response || row.response.label.includes(response)
    return matchesQuery && matchesResponse
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DataTable01
      title="Delivery log"
      description="Every webhook delivery for the last fifteen minutes."
      headingLevel="h3"
      columns={LOG_COLUMNS}
      rows={pageRows}
      getRowId={(row) => String(row.key)}
      groupBy={(row) => String(row.target)}
      groupLabel={(endpoint) => endpoint}
      renderRowActions={(row) =>
        row.href === undefined ? null : (
          <CtaLink href={String(row.href)} variant="ghost" size="sm">
            {String(row.hrefLabel)}
          </CtaLink>
        )
      }
      searchValue={query}
      onSearchChange={(value) => {
        setQuery(value)
        setPage(1)
      }}
      filters={[
        {
          id: 'response',
          label: 'Response',
          options: [
            { label: 'Accepted', value: 'Accepted' },
            { label: 'Retried', value: 'attempt' },
            { label: 'Failed', value: '500' },
          ],
        },
      ]}
      filterValues={{ response }}
      onFilterChange={(_, value) => {
        setResponse(value)
        setPage(1)
      }}
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
      labels={LOG_LABELS}
    />
  )
}

/**
 * The record index in its two shapes: an accounts index a reader scans and acts on,
 * and the same Block drawing a delivery log from the shared event specification.
 */
export default function DataTable01Demo() {
  return (
    <div className="flex flex-col gap-16">
      <AccountsIndex />
      <DeliveryLog />
    </div>
  )
}
