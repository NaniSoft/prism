/**
 * The parts of the three findings that live in markup rather than in behaviour.
 *
 * **What each test holds.** An empty result is a popup that is still open, so
 * `aria-expanded` answers whether the popup is displayed rather than whether there is
 * anything in it, and `aria-controls` resolves in every state the field can be in,
 * including the one with no listbox on the page. The empty message is a sibling of
 * the listbox rather than a child, because a listbox owns `option` and `group` and
 * nothing else, and a `<p>` inside one is announced as a row that cannot be chosen.
 * The group wrapper is a `group` with a name, so a reader can ask what the rows
 * under a heading belong to.
 *
 * **What none of them holds, and it is the whole of what was wrong.** jsdom has no
 * accessibility tree, so `toHaveAttribute` proves the attribute is in the document
 * and not what a reader announces. A `role="listbox"` holding a `<p>` passes every
 * assertion in this file, because the invalidity is in the tree the browser builds
 * and not in the string. What can be asserted without a tree is the shape of the
 * ownership, and that is what is asserted: the message is a sibling of the listbox
 * and not a descendant of it, and the listbox owns only options and groups.
 *
 * The command palette is a Dialog, so its content is portalled; the queries are
 * written against `document` rather than against the render container, which is why
 * `screen` is the entry point throughout.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CommandPalette, type CommandGroup } from '../src/components/ui/command-palette'
import { Combobox } from '../src/components/ui/combobox'
import { CreatableCombobox } from '../src/components/ui/creatable-combobox'
import { MultiCombobox } from '../src/components/ui/multi-combobox'

const GROUPS: readonly CommandGroup[] = [
  {
    id: 'page',
    label: 'Go to page',
    items: [
      { id: 'tokens', label: 'Tokens', onSelect: vi.fn() },
      { id: 'components', label: 'Components', onSelect: vi.fn() },
    ],
  },
  {
    id: 'action',
    label: 'Actions',
    items: [{ id: 'theme', label: 'Toggle theme', keywords: ['dark'], onSelect: vi.fn() }],
  },
]

const ITEMS = [
  { value: 'eu-west', label: 'Europe, Dublin' },
  { value: 'us-east', label: 'America, New York' },
]

function renderPalette() {
  return render(
    <CommandPalette
      open
      onOpenChange={vi.fn()}
      label="Command palette"
      inputLabel="Search commands"
      groups={GROUPS}
      empty={{ message: (query) => `Nothing matches ${query}`, hint: 'Try a shorter word' }}
    />,
  )
}

describe('the combobox family, on an empty result', () => {
  it('tells the field it is expanded while the panel saying nothing matched is on the page', async () => {
    const user = userEvent.setup()
    renderPalette()

    const field = screen.getByRole('combobox', { name: 'Search commands' })
    await user.type(field, 'zzzz')

    // The popup is displayed: the panel is there, with the caller's sentence in it.
    expect(screen.getByText('Nothing matches zzzz')).toBeTruthy()
    // So the field says expanded. The expression this replaced was
    // `flat.length > 0`, which answered "are there results" and left the field
    // announcing collapsed under a visible popup.
    expect(field.getAttribute('aria-expanded')).toBe('true')
  })

  it('points aria-controls at the surface it opens, which is on the page either way', async () => {
    const user = userEvent.setup()
    renderPalette()

    const field = screen.getByRole('combobox', { name: 'Search commands' })
    await user.type(field, 'zzzz')
    // No listbox is rendered when nothing matched, so the reference cannot be the
    // listbox: it is the palette, which is what the field opened, and ria-controls`n    // is a required attribute on an expanded combobox.
    const controls = field.getAttribute('aria-controls')
    expect(document.getElementById(controls as string)).not.toBeNull()
    expect(document.getElementById(controls as string)?.hasAttribute('data-slot')).toBe(true)
    expect(screen.queryByRole('listbox')).toBeNull()

    // And the same reference while there is a listbox, so it cannot be a stale id.
    await user.clear(field)
    await user.type(field, 'tok')
    expect(field.getAttribute('aria-controls')).toBe(controls)
    expect(document.getElementById(controls as string)).toContainElement(
      screen.getByRole('listbox', { name: 'Command palette' }),
    )
  })

  it('keeps the no-results message out of the listbox, which owns only options and groups', async () => {
    const user = userEvent.setup()
    renderPalette()

    const field = screen.getByRole('combobox', { name: 'Search commands' })
    await user.type(field, 'zzzz')

    expect(screen.queryByRole('listbox')).toBeNull()
    const message = screen.getByRole('status')
    // The message is not inside a listbox, because there is no listbox: it is the
    // popup's whole content.
    expect(message.closest('[role="listbox"]')).toBeNull()
  })

  it('names each group of rows rather than leaving a bare wrapper in the listbox', async () => {
    renderPalette()

    const list = screen.getByRole('listbox', { name: 'Command palette' })
    const groups = within(list).getAllByRole('group')
    // Two groups, and every direct child of the listbox is one of them or an option.
    expect(groups.map((group) => group.getAttribute('aria-labelledby'))).toHaveLength(2)
    for (const child of Array.from(list.children)) {
      expect(['group', 'option']).toContain(child.getAttribute('role'))
    }
    // And the name resolves to the words already drawn above the rows.
    const first = groups[0]
    const labelId = first.getAttribute('aria-labelledby') as string
    expect(document.getElementById(labelId)?.textContent).toBe('Go to page')
  })
})

describe('the Combobox, on a query that matches nothing', () => {
  it('is expanded with the empty panel drawn, and points at no listbox', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        label="Region"
        items={ITEMS}
        defaultOpen
        empty={{ message: (query) => `No region matches ${query}` }}
      />,
    )

    const field = screen.getByRole('combobox', { name: 'Region' })
    await user.type(field, 'zz')

    expect(screen.getByText('No region matches zz')).toBeTruthy()
    expect(field.getAttribute('aria-expanded')).toBe('true')
    expect(screen.queryByRole('listbox')).toBeNull()
    // The reference resolves to the panel carrying the message, because
    // ria-controls is required on an expanded combobox and there is no listbox.
    const controls = field.getAttribute('aria-controls')
    expect(document.getElementById(controls as string)?.textContent).toContain('No region matches zz')
  })
})

describe('the MultiCombobox, on a query that matches nothing', () => {
  it('is expanded with the empty panel drawn, and points at no listbox', async () => {
    const user = userEvent.setup()
    render(
      <MultiCombobox
        label="Regions"
        items={ITEMS}
        defaultOpen
        removeLabel={(label) => `Remove ${label}`}
        empty={{ message: (query) => `No region matches ${query}` }}
      />,
    )

    const field = screen.getByRole('combobox', { name: 'Regions' })
    await user.type(field, 'zz')

    expect(screen.getByText('No region matches zz')).toBeTruthy()
    expect(field.getAttribute('aria-expanded')).toBe('true')
    // The dangling half of this finding: the listbox is not rendered when nothing
    // matched, so the reference cannot be the listbox. It is the popup, which is.
    const controls = field.getAttribute('aria-controls')
    expect(document.getElementById(controls as string)?.textContent).toContain('No region matches zz')
  })
})

describe('the CreatableCombobox, on a query that matches nothing', () => {
  it('keeps its empty message beside the listbox rather than inside it', async () => {
    const user = userEvent.setup()
    render(
      <CreatableCombobox
        label="Region"
        items={ITEMS}
        defaultOpen
        createLabel="Create"
        draftLabel="New region"
        onCreate={vi.fn()}
        empty={{ message: (query) => `No region matches ${query}` }}
      />,
    )

    const field = screen.getByRole('combobox', { name: 'Region' })
    await user.type(field, 'zz')

    const message = screen.getByText('No region matches zz')
    // The message was a `<p role="status">` INSIDE the listbox, which announces it
    // as an option and counts it in the index that names options.
    expect(message.closest('[role="listbox"]')).toBeNull()
    // And the reference resolves without a listbox, which is what
    // ria-controls being required on an expanded combobox asks for.
    const controls = field.getAttribute('aria-controls')
    expect(document.getElementById(controls as string)).toContainElement(message)
  })

  it('points at the listbox again once something matches', async () => {
    const user = userEvent.setup()
    render(
      <CreatableCombobox
        label="Region"
        items={ITEMS}
        defaultOpen
        createLabel="Create"
        draftLabel="New region"
        onCreate={vi.fn()}
        empty={{ message: (query) => `No region matches ${query}` }}
      />,
    )

    const field = screen.getByRole('combobox', { name: 'Region' })
    await user.type(field, 'dub')
    // The same reference as in the empty state, so it is not an id that comes and goes.
    const controls = field.getAttribute('aria-controls')
    expect(document.getElementById(controls as string)).toContainElement(screen.getByRole('listbox'))
  })
})
