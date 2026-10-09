import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  CardIndex01,
  type CardIndex01Labels,
  type CardIndex01SelectionScope,
} from '../src/blocks/card-index-01/card-index'

/**
 * The record index as pictures: the selection set it holds, the count it
 * announces, the batch bar it mounts and the two selection scopes, which are the
 * contract the index family shares.
 */

const LABELS: CardIndex01Labels = {
  selectAll: 'Select every card on this page',
  selectCard: (row) => `Select ${String(row.name)}`,
  cardActions: 'Card actions',
  selectedCount: (count) => `${count} selected on this page`,
  selectedAllMatching: (count) => `All ${count} matching cards selected`,
  clearedSelection: 'Selection cleared',
  dismissSelection: 'Clear selection',
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  empty: 'No cards.',
}

const ROWS = [
  { id: 'a', name: 'Ada' },
  { id: 'b', name: 'Grace' },
]

type CardOverrides = {
  defaultSelectedIds?: readonly string[]
  selectionScope?: CardIndex01SelectionScope
}

function grid(props: CardOverrides = {}) {
  const onSelectedIdsChange = vi.fn()
  render(
    <CardIndex01
      title="Catalogue"
      rows={ROWS}
      getRowId={(row) => String(row.id)}
      renderCard={(row) => <span>{String(row.name)}</span>}
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

describe('the card index selection set', () => {
  it('names each card control after its own record', () => {
    grid()
    expect(screen.getByRole('checkbox', { name: 'Select Ada' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Select Grace' })).toBeTruthy()
  })

  it('reports a tick, an untick and the header control through one callback', async () => {
    const user = userEvent.setup()
    const { onSelectedIdsChange } = grid()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a'])

    await user.click(screen.getByRole('checkbox', { name: 'Select every card on this page' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a', 'b'])

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['b'])
  })

  it('reports the dismissal as an empty set', async () => {
    const user = userEvent.setup()
    const { onSelectedIdsChange } = grid({ defaultSelectedIds: ['a'] })

    await user.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith([])
  })

  it('holds the set on its uncontrolled arm and redraws the count from it', async () => {
    const user = userEvent.setup()
    grid()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    expect(screen.getAllByText('1 selected on this page')).toHaveLength(3)
  })
})

describe('the card index announcement', () => {
  it('mounts one polite region only while a selection exists', async () => {
    const user = userEvent.setup()
    grid()

    expect(screen.queryByRole('status')).toBeNull()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    const region = screen.getByRole('status')
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(region.textContent).toBe('1 selected on this page')
  })

  it('speaks the emptying as its own sentence rather than a count of zero', async () => {
    const user = userEvent.setup()
    grid()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))

    expect(screen.getByRole('status').textContent).toBe('Selection cleared')
  })
})

describe('the card index batch bar', () => {
  it('holds the caller node and the block dismiss, and no command of its own', async () => {
    const user = userEvent.setup()
    grid()

    expect(screen.queryByRole('toolbar')).toBeNull()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))

    const bar = screen.getByRole('toolbar')
    expect(within(bar).getByRole('button', { name: 'Archive' })).toBeTruthy()
    expect(within(bar).getByRole('button', { name: 'Clear selection' })).toBeTruthy()
  })
})

describe('the card index selection scope', () => {
  it('announces the page count on the page scope', async () => {
    const user = userEvent.setup()
    grid()

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada' }))
    expect(screen.getByRole('status').textContent).toBe('1 selected on this page')
  })

  it('announces the scope in words and takes the number from the caller on the filter scope', () => {
    grid({ selectionScope: { scope: 'filter', count: 4000 } })

    expect(screen.getByRole('status').textContent).toBe('All 4000 matching cards selected')
    expect(screen.getByRole('status').textContent).not.toContain('2')
  })
})

describe('the card index renders the caller composition', () => {
  it('draws each card from renderCard and its actions from the caller node', () => {
    render(
      <CardIndex01
        title="Catalogue"
        rows={ROWS}
        getRowId={(row) => String(row.id)}
        renderCard={(row) => <span>{String(row.name)}</span>}
        renderCardActions={() => <button type="button">Open</button>}
        pageCount={1}
        labels={LABELS}
      />,
    )
    expect(screen.getByText('Ada')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Open' })).toHaveLength(2)
    expect(screen.getAllByRole('group', { name: 'Card actions' })).toHaveLength(2)
  })
})
