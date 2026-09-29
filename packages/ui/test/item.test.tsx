import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { Item, type ItemEntry } from '../src/components/ui/item'

/**
 * A row in a list: media, a text block, a value and trailing controls.
 *
 * The claims under test are the ones that make this a row rather than four
 * `div`s. The parts are in one order, because the order is the row. The primary
 * line is a real destination when the row has one, because a row whose only way
 * out is a kebab menu is unreadable to a screen reader. The selected row is
 * marked with an attribute and not only tinted, because a tint is invisible to a
 * reader who cannot separate the two inks. And every optional part disappears
 * completely rather than leaving an empty box, because a reserved gap is a gap
 * the reader looks for something in.
 */
const ROW: ItemEntry = {
  id: 'prism-tokens',
  media: <span>PT</span>,
  title: 'Prism Tokens',
  description: 'Foundation and semantic tokens',
  meta: '0.9.0',
  href: '/packages/tokens',
  actions: <button type="button">Open</button>,
  selected: true,
}

describe('the Item', () => {
  const root = (container: HTMLElement) => container.querySelector('[data-slot="item"]')

  it('is a row and not a list, so the same row works inside a ul, a dl or a grid', () => {
    render(<Item entry={ROW} />)
    const row = root(document.body)
    // A list here would be a second answer to "what is the enclosing element",
    // and the same row appears in four different ones. A role of listitem would
    // be worse: it requires a list ancestor to mean anything, and silently stops
    // meaning anything in a grid of divs.
    expect(row?.tagName).toBe('DIV')
    expect(row?.getAttribute('role')).toBeNull()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('puts the parts in one order: media, then the text block, then the value, then the controls', () => {
    const { container } = render(<Item entry={ROW} />)
    const slots = [...container.querySelectorAll('[data-slot]')].map(
      (node) => node.getAttribute('data-slot'),
    )
    // Media leads because it is what the eye finds first. The value comes after
    // the text block because a value that led would be read as the row's name.
    // The controls come last so the reading order of the row is the order a
    // reader reads it in, which is not the order it is operated in.
    expect(slots).toEqual([
      'item',
      'item-media',
      'item-content',
      'item-title',
      'item-link',
      'item-description',
      'item-meta',
      'item-actions',
    ])
  })

  it('reaches the row through a real anchor rather than through its trailing controls', () => {
    render(<Item entry={ROW} />)
    // A native anchor, so the address is visible before it is taken, it can be
    // opened in a new context, and it is in the document for a screen reader to
    // reach. A row whose only destination is behind a menu is a list whose
    // contents are not in the document until the menu opens.
    const link = screen.getByRole('link', { name: 'Prism Tokens' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/packages/tokens')
    // And the controls are still there, as controls in their own right.
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy()
  })

  it('draws no link for a row that goes nowhere, rather than an anchor with no address', () => {
    render(<Item entry={{ id: 'a', title: 'Queued', description: 'Waiting for a worker' }} />)
    // An anchor with an empty href publishes an address that resolves to nothing,
    // which is the defect the Tree's group labels are written to avoid.
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Queued')).toBeTruthy()
    expect(screen.getByText('Waiting for a worker')).toBeTruthy()
  })

  it('marks the selected row with an attribute, so the state is not the tint alone', () => {
    const { container } = render(<Item entry={ROW} />)
    const row = root(container)
    expect(row?.getAttribute('aria-current')).toBe('true')
    expect(row?.getAttribute('data-selected')).toBe('true')
  })

  it('marks an unselected row with nothing at all rather than with a false', () => {
    const { container } = render(<Item entry={{ id: 'a', title: 'Queued' }} />)
    // `aria-current="false"` is a different claim from no attribute at all: the
    // first says this row is explicitly not the current one, which is a statement
    // about every other row on the page that a reader then has to reason about.
    const row = root(container)
    expect(row?.hasAttribute('aria-current')).toBe(false)
    expect(row?.hasAttribute('data-selected')).toBe(false)
  })

  it('drops every optional part rather than reserving an empty box for it', () => {
    const { container } = render(<Item entry={{ id: 'a', title: 'Queued' }} />)
    // A reserved gap is a gap the reader looks for something in, and a column of
    // rows where some have a value and some have a gap is a column to measure.
    expect(container.querySelector('[data-slot="item-media"]')).toBeNull()
    expect(container.querySelector('[data-slot="item-description"]')).toBeNull()
    expect(container.querySelector('[data-slot="item-meta"]')).toBeNull()
    expect(container.querySelector('[data-slot="item-actions"]')).toBeNull()
  })

  it('drops the parts a caller passed as nothing, which is the state a conditional produces', () => {
    const { container } = render(
      <Item
        entry={{
          id: 'a',
          title: 'Queued',
          description: HAS_WORKER ? 'Running' : null,
          actions: HAS_ACTIONS ? <button type="button">Open</button> : null,
        }}
      />,
    )
    // A caller writing `actions={canEdit && <Button/>}` produces null, not
    // undefined, and a Component that only checks for undefined leaves an empty
    // flex box in the row for every row where the answer was no.
    expect(container.querySelector('[data-slot="item-description"]')).toBeNull()
    expect(container.querySelector('[data-slot="item-actions"]')).toBeNull()
  })

  it('tints the row on hover only when the row goes somewhere', () => {
    const { container: linked } = render(<Item entry={ROW} />)
    const { container: plain } = render(<Item entry={{ id: 'b', title: 'Queued' }} />)
    // A hover tint on a row that does nothing is a promise the row does not keep,
    // and a reader learns to ignore the tint on every row in the list.
    expect(root(linked)?.className).toContain('hover:bg-muted')
    expect(root(plain)?.className).not.toContain('hover:bg-muted')
  })

  it('carries the entry id on the row, so two rows in one document are addressable', () => {
    const { container } = render(<Item entry={ROW} />)
    expect(root(container)?.getAttribute('data-item')).toBe('prism-tokens')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <ul aria-label="Packages">
        <li>
          <Item entry={ROW} />
        </li>
        <li>
          <Item entry={{ id: 'prism-ui', title: 'Prism UI', meta: '0.9.0' }} />
        </li>
      </ul>,
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

/* The false halves of two caller's conditionals, held as names so the test reads
 * as the caller rather than as a null literal. */
const HAS_WORKER = false
const HAS_ACTIONS = false
