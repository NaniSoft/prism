import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { useState } from 'react'

import {
  SelectableTree,
  type SelectableTreeNode,
} from '../src/components/ui/selectable-tree'

/**
 * A hierarchy of records, with the four shapes a caller meets: a group that is a
 * chapter and cannot be picked, a record under it, a record that holds records of
 * its own, and a flat list beside all of it.
 *
 * The claims under test are the ones that make this a selection rather than a set
 * of buttons: one Tab stop and arrows inside it, selection by press and by Enter
 * or Space and not by the arrows, `aria-selected` as the state rather than a fill,
 * a group label that is placed in the hierarchy but cannot be picked, and an
 * authored empty case.
 */
const NODES: SelectableTreeNode[] = [
  {
    type: 'group',
    title: 'Standard',
    meta: 'default',
    items: [
      {
        type: 'item',
        id: 'plan',
        title: 'Plan the change',
        description: 'no skills',
        leading: '1',
      },
      { type: 'item', id: 'patch', title: 'Write the patch', leading: '2' },
    ],
  },
  {
    type: 'group',
    title: 'Delivery',
    items: [
      {
        type: 'item',
        id: 'review',
        title: 'Review',
        items: [{ type: 'item', id: 'checks', title: 'Run the checks' }],
      },
    ],
  },
]

/** The tree with the value held where a caller holds it, between two outside stops. */
function Harness({ initial = null }: { initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial)
  return (
    <>
      <button type="button">before</button>
      <SelectableTree
        nodes={NODES}
        value={value}
        onValueChange={setValue}
        label="Pipelines"
      />
      <button type="button">after</button>
    </>
  )
}

const item = (name: RegExp) => screen.getByRole('treeitem', { name })

describe('the SelectableTree', () => {
  it('is a named tree, so a page with two of them tells them apart', () => {
    render(<Harness />)
    expect(screen.getByRole('tree', { name: 'Pipelines' })).toBeTruthy()
  })

  it('renders a record as a treeitem with its level, so a reader is placed in the hierarchy', () => {
    render(<Harness />)
    expect(item(/Plan the change/).getAttribute('aria-level')).toBe('2')
    expect(item(/Run the checks/).getAttribute('aria-level')).toBe('3')
  })

  it('renders a group as a label that carries its level and cannot be picked or focused', () => {
    render(<Harness />)
    const label = screen.getByRole('treeitem', { name: /Standard/ })

    expect(label.tagName).toBe('DIV')
    // No selection state and no tab stop: a chapter over the records is not one
    // of the records, and inventing a pick for it would put a value on a level
    // the reader never chose.
    expect(label.hasAttribute('aria-selected')).toBe(false)
    expect(label.hasAttribute('tabindex')).toBe(false)
    expect(label.getAttribute('aria-level')).toBe('1')
  })

  it('marks the picked record in the attribute and not only in the fill', () => {
    render(<Harness initial="patch" />)
    expect(item(/Write the patch/).getAttribute('aria-selected')).toBe('true')
    expect(item(/Plan the change/).getAttribute('aria-selected')).toBe('false')
    // The fill is the reminder; the attribute is the fact. A selected row that
    // differed from its neighbours by colour alone would be invisible to a
    // reader who cannot separate the two inks.
    expect(item(/Write the patch/).getAttribute('data-selected')).toBe('true')
  })

  it('reports a press, and only a press, to the caller', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(item(/Plan the change/))
    expect(item(/Plan the change/).getAttribute('aria-selected')).toBe('true')
    expect(item(/Write the patch/).getAttribute('aria-selected')).toBe('false')
  })

  it('moves the tab stop with the arrows and selects with Enter, because browsing is not choosing', async () => {
    const user = userEvent.setup()
    render(<Harness initial="plan" />)

    const plan = item(/Plan the change/)
    plan.focus()
    expect(document.activeElement).toBe(plan)

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(item(/Write the patch/))
    // The arrow moved the reader and not the pick. A tree that committed on
    // focus would rewrite the pane beside it once per key press.
    expect(item(/Plan the change/).getAttribute('aria-selected')).toBe('true')
    expect(item(/Write the patch/).getAttribute('aria-selected')).toBe('false')

    await user.keyboard('{Enter}')
    expect(item(/Write the patch/).getAttribute('aria-selected')).toBe('true')
    expect(item(/Plan the change/).getAttribute('aria-selected')).toBe('false')
  })

  it('takes the tab stop to the ends with Home and End and stops there', async () => {
    const user = userEvent.setup()
    render(<Harness initial="patch" />)

    item(/Write the patch/).focus()
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(item(/Run the checks/))

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(item(/Run the checks/))

    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(item(/Plan the change/))

    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(item(/Plan the change/))
  })

  it('is one Tab stop, landing on the current record and leaving from it', async () => {
    const user = userEvent.setup()
    render(<Harness initial="patch" />)

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'before' }))

    await user.tab()
    expect(document.activeElement).toBe(item(/Write the patch/))

    // Tab leaves the tree rather than walking forty records, which is the whole
    // point of the roving stop.
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }))
  })

  it('renders a flat list as a tree of one level without the caller nesting anything', () => {
    const { container } = render(
      <SelectableTree
        nodes={[
          { type: 'item', id: 'one', title: 'First' },
          { type: 'item', id: 'two', title: 'Second' },
        ]}
        value={null}
        onValueChange={() => undefined}
        label="Outline"
      />,
    )
    expect(container.querySelectorAll('[data-slot="selectable-tree-list"]')).toHaveLength(1)
    expect(container.querySelector('[data-depth="0"]')).toBeTruthy()
    expect(container.querySelector('[data-depth="1"]')).toBeNull()
  })

  it('authors the empty case rather than rendering a control with nothing in it', () => {
    const { container } = render(
      <SelectableTree
        nodes={[]}
        value={null}
        onValueChange={() => undefined}
        label="Pipelines"
        empty={{ message: 'No pipelines yet' }}
      />,
    )
    expect(container.querySelector('[role="tree"]')).toBeNull()
    expect(screen.getByText('No pipelines yet')).toBeTruthy()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(<Harness initial="patch" />)
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
