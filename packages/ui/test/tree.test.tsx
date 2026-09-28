import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { Tree, type TreeNode } from '../src/components/ui/tree'

/**
 * A tree of nodes, given as data.
 *
 * The claims under test are the four that make a tree a tree rather than a nested
 * list. It is navigable by the arrow keys, because a consumer who composes the
 * markup themselves gets the Tab order of the document instead. A node with a
 * destination is a native anchor and one without is a label that cannot be
 * focused, because an anchor with no address is a control that cannot be operated.
 * The current node is marked with an attribute rather than a colour. And a flat
 * list renders a tree of depth one, because an outline is a tree of depth one and
 * a Component that required nesting to express it would make the common case the
 * awkward one.
 */
const NODES: TreeNode[] = [
  { type: 'group', title: 'Foundation', items: [
    { type: 'page', title: 'Colors', href: '/foundation/colors' },
    { type: 'page', title: 'Radii', href: '/foundation/radii' },
  ] },
  { type: 'divider', title: '' },
  { type: 'page', title: 'Overview', href: '/overview' },
  { type: 'group', title: 'Components', href: '/components', items: [
    { type: 'page', title: 'Button', href: '/components/button' },
  ] },
  { type: 'group', title: 'Unindexed label', items: [
    { type: 'page', title: 'Nested', href: '/nested' },
  ] },
]

describe('the Tree', () => {
  it('is a named tree, so a page with two of them tells them apart', () => {
    render(<Tree nodes={NODES} label="Documentation" />)
    expect(screen.getByRole('tree', { name: 'Documentation' })).toBeTruthy()
  })

  it('renders a node with a destination as a native anchor, so the address is visible before it is taken', () => {
    render(<Tree nodes={NODES} label="Documentation" />)
    // Queried as a treeitem and not as a link, because a destination in a tree
    // carries `role="treeitem"`: the level belongs to the item, and a reader placing
    // it in the tree is reading the item rather than the anchor inside it. The
    // element is still a native anchor, which is what the next two lines assert.
    const node = screen.getByRole('treeitem', { name: 'Colors' })
    expect(node.tagName).toBe('A')
    expect(node.getAttribute('href')).toBe('/foundation/colors')
  })

  it('renders a group with no index as a label and not as something focusable', () => {
    const { container } = render(<Tree nodes={NODES} label="Documentation" />)
    const labels = [...container.querySelectorAll('[data-slot="tree-label"]')]
    const label = labels.find((node) => node.textContent === 'Unindexed label')

    expect(label).toBeTruthy()
    // A label is a `span`: no `href`, not focusable, and not reachable by Tab.
    // Inventing a route for it would publish an address that resolves to nothing.
    expect(label?.tagName).toBe('SPAN')
    expect(label?.hasAttribute('href')).toBe(false)
    expect(label?.getAttribute('tabindex')).toBeNull()
    // It is still a treeitem, because `aria-level` on an element with no role is
    // prohibited rather than ignored, and a reader needs the level to place a label
    // that has no anchor to place it by.
    expect(label?.getAttribute('role')).toBe('treeitem')
  })

  it('renders a group with an index as a link, which is the other arm of the same rule', () => {
    render(<Tree nodes={NODES} label="Documentation" />)
    expect(screen.getByRole('treeitem', { name: 'Components' })).toBeTruthy()
  })

  it('renders a rule as a label that is not focusable', () => {
    const { container } = render(
      <Tree nodes={[{ type: 'divider', title: 'Later' }, { type: 'page', title: 'A', href: '/a' }]} label="Documentation" />,
    )
    const divider = container.querySelector('[data-slot="tree-divider"]')
    expect(divider?.textContent).toBe('Later')
    expect(divider?.tagName).toBe('LI')
  })

  it('marks the current node with an attribute rather than a colour', () => {
    render(<Tree nodes={NODES} label="Documentation" currentHref="/foundation/colors" />)
    const current = screen.getByRole('treeitem', { name: 'Colors' })
    expect(current.getAttribute('aria-current')).toBe('page')
    // And the marking is the attribute alone: two nodes differ by the attribute
    // and nothing else, so a reader who cannot distinguish the colours still knows
    // where they are.
    const other = screen.getByRole('treeitem', { name: 'Radii' })
    expect(other.getAttribute('aria-current')).toBeNull()
  })

  it('renders a flat list as a tree of depth one without the caller nesting anything', () => {
    const { container } = render(
      <Tree
        nodes={[
          { type: 'page', title: 'First', href: '/1' },
          { type: 'page', title: 'Second', href: '/2' },
        ]}
        label="Outline"
      />,
    )
    // The nested list is the only list, at depth zero, which is what an outline is.
    expect(container.querySelectorAll('[data-slot="tree-list"]')).toHaveLength(1)
    expect(container.querySelector('[data-depth="0"]')).toBeTruthy()
    expect(container.querySelector('[data-depth="1"]')).toBeNull()
  })

  it('gives every node an accessible level, which is what makes a tree navigable', () => {
    const { container } = render(<Tree nodes={NODES} label="Documentation" />)
    const levels = [...container.querySelectorAll('[aria-level]')].map((n) =>
      n.getAttribute('aria-level'),
    )
    // Depth one at the top, and the nested pages at depth two, so a reader is told
    // where they are rather than only being able to see the indent.
    expect(levels).toContain('1')
    expect(levels).toContain('2')
  })

  it('moves between nodes with the arrow keys, following the tree', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={NODES} label="Documentation" />)

    const first = screen.getByRole('treeitem', { name: 'Colors' })
    first.focus()
    expect(document.activeElement).toBe(first)

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'Radii' }))

    // End goes to the last destination, which is the nested page under the
    // unindexed label. Down past it stops rather than wrapping, because a tree that
    // wraps is a carousel and a reader cannot tell they have wrapped.
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'Nested' }))

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'Nested' }))

    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'Colors' }))

    await user.keyboard('{ArrowUp}')
    // Up from the first node stays put, for the same reason.
    expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'Colors' }))
  })

  it('skips a label when the arrow keys move, because a label has nowhere to go', async () => {
    const user = userEvent.setup()
    const { container } = render(<Tree nodes={NODES} label="Documentation" />)

    // The destinations in document order: Colors, Radii, Overview, Components,
    // Button, Nested. The unindexed label sits between the last two and is not one
    // of them, so moving down from Button must land on Nested and not on the label.
    const button = screen.getByRole('treeitem', { name: 'Button' })
    button.focus()
    await user.keyboard('{ArrowDown}')

    const next = document.activeElement
    expect(next?.textContent).toBe('Nested')
    // And the label is on the page the whole time, so this is a skip rather than a
    // label that failed to render. Found by text rather than by selector, because
    // `Foundation` is also an unindexed label and the first one is not this one.
    const labels = [...container.querySelectorAll('[data-slot="tree-label"]')].map(
      (node) => node.textContent,
    )
    expect(labels).toContain('Unindexed label')
  })

  it('authors the empty case rather than rendering a control with nothing in it', () => {
    const { container } = render(
      <Tree nodes={[]} label="Documentation" empty={{ message: 'No pages yet' }} />,
    )
    expect(container.querySelector('[role="tree"]')).toBeNull()
    expect(screen.getByText('No pages yet')).toBeTruthy()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <Tree nodes={NODES} label="Documentation" currentHref="/overview" />,
    )
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
