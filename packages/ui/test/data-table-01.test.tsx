import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  DataTable01,
  type DataTable01Labels,
  type DataTable01SelectionScope,
} from '../src/blocks/data-table-01/data-table'

/**
 * The record index: the typed columns it draws, the selection set it holds, the
 * count it announces and the batch bar it mounts around the caller's own controls.
 */

const LABELS: DataTable01Labels = {
  search: 'Search rows',
  filters: 'Filters',
  reset: 'Clear filters',
  columns: 'Columns',
  viewColumns: 'Choose columns',
  selectAll: 'Select every row on this page',
  selectRow: (row) => `Select ${String(row.name)}`,
  rowActions: 'Row actions',
  sort: (column, direction) => `Sort ${column} ${direction}`,
  selectedCount: (count) => `${count} selected on this page`,
  selectedAllMatching: (count) => `All ${count} matching rows selected`,
  clearedSelection: 'Selection cleared',
  dismissSelection: 'Clear selection',
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  empty: 'No rows.',
}

const ROWS = [
  { id: 'a', name: 'Ada' },
  { id: 'b', name: 'Grace' },
]

const COLUMNS = [
  { key: 'name', header: 'Name', kind: 'slot' as const },
]

/**
 * The two optional facts this lane overrides. Kept narrow rather than a `Partial`
 * of the whole selectable props, because spreading a partial of the grouping arm
 * makes `groupBy` an optional function, which fits neither arm of the grouping
 * union; the grouping cases below render their own tree instead.
 */
type TableOverrides = {
  defaultSelectedIds?: readonly string[]
  selectionScope?: DataTable01SelectionScope
}

function table(props: TableOverrides = {}) {
  const onSelectedIdsChange = vi.fn()
  render(
    <DataTable01
      title="People"
      columns={COLUMNS}
      rows={ROWS}
      getRowId={(row) => String(row.id)}
      pageCount={1}
      labels={LABELS}
      selectable
      batchActions={<button type="button">Archive</button>}
      onSelectedIdsChange={onSelectedIdsChange}
      {...props}
    />,
  )
  return { onSelectedIdsChange }
}

describe('the record index selection set', () => {
  it('names each row control after its own record', () => {
    table()
    expect(screen.getByRole('checkbox', { name: 'Select Ada' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Select Grace' })).toBeTruthy()
  })

  it('reports a tick, an untick and the header control through one callback', async () => {
    const user = userEvent.setup()
    const { onSelectedIdsChange } = table()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a'])

    await user.click(screen.getByRole('checkbox', { name: 'Select every row on this page' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a', 'b'])

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['b'])
  })

  it('reports the dismissal as an empty set', async () => {
    const user = userEvent.setup()
    const { onSelectedIdsChange } = table({ defaultSelectedIds: ['a'] })

    await user.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith([])
  })

  it('holds the set on its uncontrolled arm and redraws the count from it', async () => {
    const user = userEvent.setup()
    table()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    // The batch bar's count, the announced count and the footer summary are one string.
    expect(screen.getAllByText('1 selected on this page')).toHaveLength(3)
  })
})

describe('the record index announcement', () => {
  it('mounts one polite region only while a selection exists', async () => {
    const user = userEvent.setup()
    table()

    expect(screen.queryByRole('status')).toBeNull()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    const region = screen.getByRole('status')
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(region.textContent).toBe('1 selected on this page')
  })

  it('speaks the emptying as its own sentence rather than a count of zero', async () => {
    const user = userEvent.setup()
    table()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))

    expect(screen.getByRole('status').textContent).toBe('Selection cleared')
  })
})

describe('the record index batch bar', () => {
  it('holds the caller node and the block dismiss, and no command of its own', async () => {
    const user = userEvent.setup()
    table()

    expect(screen.queryByRole('toolbar')).toBeNull()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))

    const bar = screen.getByRole('toolbar')
    expect(within(bar).getByRole('button', { name: 'Archive' })).toBeTruthy()
    expect(within(bar).getByRole('button', { name: 'Clear selection' })).toBeTruthy()
  })
})

describe('the record index columns', () => {
  it('draws the sort affordance for a sortable column and reports the next direction', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(
      <DataTable01
        title="People"
        columns={[{ key: 'name', header: 'Name', kind: 'slot', sortable: true }]}
        rows={ROWS}
        getRowId={(row) => String(row.id)}
        pageCount={1}
        labels={LABELS}
        onSortChange={onSortChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Name/ }))
    expect(onSortChange).toHaveBeenCalledWith({ column: 'name', direction: 'ascending' })
  })

  it('draws a cell the caller wrote through the slot arm', () => {
    render(
      <DataTable01
        title="People"
        columns={[{ key: 'name', header: 'Name', kind: 'slot' }]}
        rows={ROWS}
        getRowId={(row) => String(row.id)}
        pageCount={1}
        labels={LABELS}
      />,
    )
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeTruthy()
  })
})

describe('the record index grouping', () => {
  const GROUPED = [
    { id: 'a', name: 'Ada', team: 'Core' },
    { id: 'b', name: 'Grace', team: 'Core' },
    { id: 'c', name: 'Alan', team: 'Labs' },
  ]

  function grouped() {
    const onSelectedIdsChange = vi.fn()
    render(
      <DataTable01
        title="People"
        columns={[{ key: 'name', header: 'Name', kind: 'slot' }]}
        rows={GROUPED}
        getRowId={(row) => String(row.id)}
        pageCount={1}
        labels={LABELS}
        selectable
        batchActions={<button type="button">Archive</button>}
        onSelectedIdsChange={onSelectedIdsChange}
        groupBy={(row) => String(row.team)}
        groupLabel={(key) => key}
      />,
    )
    return { onSelectedIdsChange }
  }

  it('draws one heading per run of rows, in the caller order', () => {
    grouped()
    expect(screen.getAllByText('Core')).toHaveLength(1)
    expect(screen.getAllByText('Labs')).toHaveLength(1)
  })

  it('never counts a heading as a record', async () => {
    const user = userEvent.setup()
    const { onSelectedIdsChange } = grouped()

    await user.click(screen.getByRole('checkbox', { name: 'Select every row on this page' }))
    // Three records, and the two headings are not among them.
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a', 'b', 'c'])
  })
})

describe('the record index selection scope', () => {
  it('announces the page count and says the page on the page scope', async () => {
    const user = userEvent.setup()
    table()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    expect(screen.getByRole('status').textContent).toBe('1 selected on this page')
  })

  it('announces the scope in words and takes the number from the caller on the filter scope', () => {
    table({ selectionScope: { scope: 'filter', count: 4000 } })

    // Two rows on screen and the caller's four thousand, never the two.
    expect(screen.getByRole('status').textContent).toBe('All 4000 matching rows selected')
    expect(screen.getByRole('status').textContent).not.toContain('2')
  })
})
