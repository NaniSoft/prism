/**
 * Names and states that are in the markup rather than in a handler.
 *
 * **A `toolbar` and a `radiogroup` announce their bare role name when nothing names
 * them**, and both are roles ARIA puts a MUST on. `SelectionToolbar` drew its name
 * in the leading label and pointed at nothing; `ToggleGroup` declared `aria-label`
 * optional while its own JSDoc said the prop was required, so TypeScript enforced
 * nothing and a group shipped unnamed. `TextFormatToolbar` draws the same
 * `toolbar` role and passes a required `label`, which is the shape both now match.
 *
 * **A tree item that cannot collapse must not say it can.** `Tree` set
 * `aria-expanded="true"` on every group with children, which promises a second
 * press that does nothing, and it promised a roving tab stop its JSDoc described and
 * no `tabIndex` in the file implemented, so the tree was N Tab stops. Both are held
 * here: no node carries the attribute, and exactly one node is tabbable.
 *
 * **What jsdom cannot hold.** There is no accessibility tree here, so
 * `getByRole('toolbar', { name })` proves the role and the label are in the document
 * and not what a reader hears first. A treeitem with a hard-coded `aria-expanded`
 * passes every assertion about roles in this file. The attribute assertions are the
 * part that can be held without a tree, and they are the part that was wrong.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { SelectionToolbar } from '../src/components/ui/selection-toolbar'
import { TextFormatToolbar } from '../src/components/ui/text-format-toolbar'
import { ToggleGroup, ToggleGroupItem } from '../src/components/ui/toggle-group'
import { Tree, type TreeNode } from '../src/components/ui/tree'

describe('the Selection toolbar', () => {
  it('is a named toolbar, named by the label a reader can already see', () => {
    render(
      <SelectionToolbar
        label="3 selected"
        dismissLabel="Clear selection"
        onDismiss={() => undefined}
        commands={[
          { id: 'archive', label: 'Archive', onRun: () => undefined },
          { id: 'delete', label: 'Delete', onRun: () => undefined },
        ]}
      />,
    )

    // Before the fix the row drew the words "3 selected" and pointed at nothing, so
    // a reader tabbing onto it heard "toolbar" and no more.
    const toolbar = screen.getByRole('toolbar', { name: '3 selected' })
    expect(within(toolbar).getAllByRole('button')).toHaveLength(3)
  })

  it('names the toolbar from a label that is not a plain string', () => {
    render(
      <SelectionToolbar
        label={
          <>
            <strong>7</strong> rows selected
          </>
        }
        dismissLabel="Clear selection"
        onDismiss={() => undefined}
        commands={[{ id: 'archive', label: 'Archive', onRun: () => undefined }]}
      />,
    )

    // The name is a reference rather than an `aria-label`, because `label` is a
    // node and there is no string here to put in one. So the rendered text is the
    // name, which is the property a duplicated attribute would not have.
    expect(screen.getByRole('toolbar').getAttribute('aria-labelledby')).not.toBeNull()
  })
})

describe('the ToggleGroup', () => {
  it('is a named radiogroup in single mode and a named toolbar in multiple', () => {
    const { unmount } = render(
      <ToggleGroup aria-label="Date range">
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Date range' })).toBeTruthy()
    unmount()

    render(
      <ToggleGroup aria-label="Alignment" selectionMode="multiple">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByRole('toolbar', { name: 'Alignment' })).toBeTruthy()
  })

  it('matches the shape TextFormatToolbar already ships for the same role', () => {
    render(
      <TextFormatToolbar
        getEditor={() => null}
        label="Text formatting"
        commands={[{ id: 'bold', label: 'Bold', isEnabled: true, onApply: () => undefined }]}
      />,
    )
    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeTruthy()
  })
})

const NODES: TreeNode[] = [
  {
    type: 'group',
    title: 'Foundation',
    items: [
      { type: 'page', title: 'Colors', href: '/foundation/colors' },
      { type: 'page', title: 'Radii', href: '/foundation/radii' },
    ],
  },
  { type: 'divider', title: '' },
  { type: 'page', title: 'Overview', href: '/overview' },
  {
    type: 'group',
    title: 'Components',
    href: '/components',
    items: [{ type: 'page', title: 'Button', href: '/components/button' }],
  },
  {
    type: 'group',
    title: 'Unindexed label',
    items: [{ type: 'page', title: 'Nested', href: '/nested' }],
  },
]

describe('the Tree', () => {
  it('claims no expansion state, because there is nothing to collapse', () => {
    const { container } = render(<Tree nodes={NODES} label="Documentation" />)

    // Every group with children carried `aria-expanded="true"`, which promises a
    // press that folds nothing away. A node that cannot expand omits the attribute.
    expect(container.querySelectorAll('[aria-expanded]')).toHaveLength(0)
  })

  it('is one tab stop, on the current address rather than on the first node', () => {
    render(<Tree nodes={NODES} label="Documentation" currentHref="/components/button" />)

    const tabbable = document.querySelectorAll('[data-slot="tree"] a[tabindex="0"]')
    expect(tabbable).toHaveLength(1)
    // The stop is the answer, not the top of the list, which is the same rule
    // `ToggleGroup` applies to a pressed member.
    expect(tabbable[0]?.getAttribute('href')).toBe('/components/button')
  })

  it('falls back to the first destination when the reader is nowhere in particular', () => {
    render(<Tree nodes={NODES} label="Documentation" />)

    const tabbable = document.querySelectorAll('[data-slot="tree"] a[tabindex="0"]')
    expect(tabbable).toHaveLength(1)
    // The first group has no index, so it is a label and not a stop; the first
    // destination in the order a reader meets them is the page under it.
    expect(tabbable[0]?.getAttribute('href')).toBe('/foundation/colors')
  })

  it('moves the stop with the arrow keys, so Tab leaves from where the reader was', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={NODES} label="Documentation" currentHref="/components/button" />)

    const button = screen.getByRole('treeitem', { name: 'Button' })
    button.focus()
    await user.keyboard('{ArrowDown}')

    const nested = screen.getByRole('treeitem', { name: 'Nested' })
    expect(document.activeElement).toBe(nested)
    // And the stop followed the reader rather than staying on the address, which is
    // what makes Tab return them to where they were.
    expect(document.querySelectorAll('[data-slot="tree"] a[tabindex="0"]')).toHaveLength(1)
    expect(nested.getAttribute('tabindex')).toBe('0')
  })
})
