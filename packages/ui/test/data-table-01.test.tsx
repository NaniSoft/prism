import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DataTable01, type DataTable01Labels } from '../src/blocks/data-table-01/data-table'

/**
 * The per-row action menu, and the target it is reached with.
 *
 * The Block itself is covered elsewhere; what is asserted here is the one claim a
 * screenshot cannot hold about a control the Block draws rather than composes. A
 * table cell is 40px tall whatever this is, so a 32px trigger leaves a target under
 * both WCAG 2.5.8's 24px and this package's own 44px standard, and a 44px trigger
 * grows the cell with it. `className` on a composed control is layout, and layout is
 * the only thing it is for.
 */

const LABELS: DataTable01Labels = {
  search: 'Search rows',
  filters: 'Filters',
  reset: 'Clear filters',
  columns: 'Columns',
  viewColumns: 'Choose columns',
  selectAll: 'Select every row',
  selectRow: 'Select the row',
  rowActions: 'Row actions',
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  selectedCount: (count) => `${count} selected`,
  empty: 'No rows.',
}

const ROWS = [{ id: 'a', name: 'Ada' }]

const table = (props: Partial<Parameters<typeof DataTable01>[0]> = {}) =>
  render(
    <DataTable01
      title="People"
      columns={[{ id: 'name', header: 'Name', cell: (row) => row.name as string }]}
      rows={ROWS}
      getRowId={(row) => row.id as string}
      pageCount={1}
      labels={LABELS}
      rowActions={() => [{ label: 'Archive' }]}
      {...props}
    />,
  )

describe('the DataTable01 row menu', () => {
  it('is named by the caller and opens the actions it was given', async () => {
    const user = userEvent.setup()
    table()

    await user.click(screen.getByRole('button', { name: LABELS.rowActions }))

    expect(await screen.findByRole('menuitem', { name: 'Archive' })).toBeTruthy()
  })

  it('takes the coarse-pointer 44px floor as a step and keeps the 32px cell on a mouse', () => {
    table()
    const className = screen.getByRole('button', { name: LABELS.rowActions }).className

    expect(className).toContain('pointer-coarse:size-11')
    expect(className).toContain('size-8')
  })

  it('runs the action the caller returned when one is chosen', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    table({ rowActions: () => [{ label: 'Archive', onSelect }] })

    await user.click(screen.getByRole('button', { name: LABELS.rowActions }))
    await user.click(await screen.findByRole('menuitem', { name: 'Archive' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})