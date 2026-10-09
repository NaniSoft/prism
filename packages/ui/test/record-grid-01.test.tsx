import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  RecordGrid01,
  type RecordGrid01Labels,
} from '../src/blocks/record-grid-01/record-grid'
import type { FieldSpec } from '../src/lib/spec'

/**
 * The editable record grid: the controls it draws from the shared field
 * specification, the values it holds, and the change it reports for every edit.
 */

const LABELS: RecordGrid01Labels = { empty: 'No rows.' }

const COLUMNS: readonly FieldSpec[] = [
  { key: 'title', label: 'Issue', kind: 'Input' },
  { key: 'estimate', label: 'Estimate', kind: 'NumberField' },
  {
    key: 'status',
    label: 'Status',
    kind: 'NativeSelect',
    options: [
      { value: 'todo', label: 'To do' },
      { value: 'done', label: 'Done' },
    ],
  },
]

const ROWS = [{ id: 'issue-1', title: 'First', estimate: 3, status: 'todo' }]

function grid(onCellChange: (change: unknown) => void = vi.fn()) {
  render(
    <RecordGrid01
      title="Issues"
      columns={COLUMNS}
      rows={ROWS}
      getRowId={(row) => String(row.id)}
      onCellChange={onCellChange}
      labels={LABELS}
    />,
  )
  return { onCellChange }
}

describe('the record grid draws a control per cell', () => {
  it('draws the control the column kind names', () => {
    grid()
    expect(screen.getByRole('textbox', { name: 'Issue' })).toHaveValue('First')
    expect(screen.getByLabelText('Estimate')).toBeTruthy()
    expect(screen.getByRole('combobox')).toBeTruthy()
  })

  it('names the table by the heading it already draws', () => {
    grid()
    expect(screen.getByRole('table', { name: 'Issues' })).toBeTruthy()
  })

  it('draws the caller empty line when there are no rows', () => {
    render(
      <RecordGrid01
        title="Issues"
        columns={COLUMNS}
        rows={[]}
        getRowId={(row) => String(row.id)}
        onCellChange={vi.fn()}
        labels={LABELS}
      />,
    )
    expect(screen.getByText('No rows.')).toBeTruthy()
  })
})

describe('the record grid reports every edit', () => {
  it('reports the row identity and the column key as the cell is typed', async () => {
    const user = userEvent.setup()
    const { onCellChange } = grid()

    const input = screen.getByRole('textbox', { name: 'Issue' })
    await user.clear(input)
    await user.type(input, 'Renamed')

    expect(onCellChange).toHaveBeenCalled()
    expect(onCellChange).toHaveBeenLastCalledWith({ rowId: 'issue-1', key: 'title', value: 'Renamed' })
  })

  it('redraws the cell from the value the reader typed', async () => {
    const user = userEvent.setup()
    grid()

    const input = screen.getByRole('textbox', { name: 'Issue' })
    await user.clear(input)
    await user.type(input, 'Edited')

    expect(input).toHaveValue('Edited')
  })
})
