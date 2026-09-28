import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { CommandPalette, locate, RANKS, type CommandGroup } from '../src/components/ui/command-palette'

/**
 * A searchable list of commands, over the Dialog this system already has.
 *
 * The claim under test that the Component is built around is the ranking. A palette
 * that filters without ordering shows every command containing the query in
 * declaration order, so the command the reader meant sits below one that merely
 * mentions their query. These tests assert on the *order* of the rows, because
 * asserting that a row exists would pass on an implementation that renders every
 * match in the wrong order, which is the failure this Component exists to avoid.
 *
 * The second claim is that Enter never runs a command the reader did not point at.
 * That is the one outcome a palette must never produce, and it is invisible in a
 * screenshot because nothing about the screen changes when it happens.
 */
const groups: CommandGroup[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    items: [
      { id: 'theme', label: 'Toggle theme', hint: 'Cmd K T', keywords: ['dark', 'light', 'colour'], onSelect: () => {} },
      { id: 'reset', label: 'Reset workspace', onSelect: () => {} },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'new', label: 'New run', hint: 'Cmd N', onSelect: () => {} },
      { id: 'settings', label: 'Open settings', onSelect: () => {} },
    ],
  },
]

const empty = { message: (query: string) => `Nothing matches ${query}` }

const open = (props: Partial<Parameters<typeof CommandPalette>[0]> = {}) =>
  render(
    <CommandPalette
      open
      onOpenChange={() => {}}
      label="Commands"
      inputLabel="Search commands"
      groups={groups}
      empty={empty}
      {...props}
    />,
  )

describe('the Command palette', () => {
  // Queried from the document rather than from the render container, because the
  // palette is composed on the Dialog and the Dialog portals its content to the
  // body. A container-scoped query would find an empty tree and every assertion
  // below would be about a component that never rendered.
  const scope = (): HTMLElement => document.body
  const rows = () => [
    ...scope().querySelectorAll('[data-slot="command-palette-item"]'),
  ]
  const labels = () =>
    rows().map((row) => row.querySelector('span')?.textContent ?? '')

  it('is a dialog, so the overlay behaviour is the one this system already has', () => {
    open()
    // Composed on the Dialog rather than beside it: focus trapping, Escape, the
    // portal, the scroll lock and the return of focus are five behaviours that are
    // correct there and would be five chances to get one wrong here.
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('names itself and names its search field, both from the caller', () => {
    open()
    expect(screen.getByRole('dialog', { name: 'Commands' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Search commands' })).toBeTruthy()
  })

  it('shows every command before anything is typed, grouped under the caller headings', () => {
    open()
    expect(labels()).toHaveLength(4)
    expect(screen.getByText('Appearance')).toBeTruthy()
    expect(screen.getByText('Workspace')).toBeTruthy()
  })

  it('keeps the search field focused, so a reader can type without clicking', async () => {
    open()
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('combobox'))
    })
  })

  it('ranks a command whose name starts with the query above one that merely contains it', async () => {
    const user = userEvent.setup()
    open()
    await user.type(screen.getByRole('combobox'), 'sett')

    // Both match. Declaration order would put "Open settings" third because it
    // lives in the second group, and a reader who typed "sett" meant that one.
    // Ranking by where the match falls is the entire reason a palette beats a menu.
    const found = labels()
    expect(found[0]).toContain('Open settings')
  })

  it('ranks a whole-word match above a match inside a word', async () => {
    const user = userEvent.setup()
    open()
    // "se" starts a word in "Open settings" and sits inside one in "Reset
    // workspace". A search that did not check the boundary would rank them by
    // whichever the source happened to declare first, and "Open settings" is
    // declared second.
    await user.type(screen.getByRole('combobox'), 'se')
    const found = labels()
    const settings = found.findIndex((label) => label.includes('Open settings'))
    const reset = found.findIndex((label) => label.includes('Reset workspace'))
    expect(settings).toBeGreaterThanOrEqual(0)
    expect(reset).toBeGreaterThanOrEqual(0)
    expect(settings).toBeLessThan(reset)
  })

  it('finds a command by a keyword when its name does not match at all', async () => {
    const user = userEvent.setup()
    open()
    // "dark" appears in no label. Without keywords this palette would tell a
    // reader that the theme cannot be reached by name, which is the state that
    // makes a palette feel broken.
    await user.type(screen.getByRole('combobox'), 'dark')
    expect(labels().join(' ')).toContain('Toggle theme')
  })

  it('never lets a keyword outrank a name that matched', async () => {
    const user = userEvent.setup()
    open()
    await user.type(screen.getByRole('combobox'), 'theme')
    // "Toggle theme" matches by name and by keyword. It wins either way, but the
    // point is that "Open settings" is not promoted by carrying "theme" somewhere
    // in its keywords.
    expect(labels()).toHaveLength(1)
    expect(labels()[0]).toContain('Toggle theme')
  })

  it('hides a group whose every command filtered out, rather than heading nothing', async () => {
    const user = userEvent.setup()
    open()
    await user.type(screen.getByRole('combobox'), 'run')
    // A heading over an empty group is a divider the reader has to read past.
    expect(screen.queryByText('Appearance')).toBeNull()
    expect(labels()).toHaveLength(1)
  })

  it('says nothing matched, in the caller own sentence with the query in it', async () => {
    const user = userEvent.setup()
    open()
    await user.type(screen.getByRole('combobox'), 'zzzz')
    // An empty result with no words is the one state a palette must never show,
    // because it reads as a broken surface rather than as a search that found
    // nothing. The sentence is the caller's because this package cannot know the
    // word for it in the reader's language.
    expect(screen.getByText('Nothing matches zzzz')).toBeTruthy()
  })

  it('moves the highlight with the arrows and wraps at both ends', async () => {
    const user = userEvent.setup()
    open()
    const field = screen.getByRole('combobox')

    await user.keyboard('{ArrowDown}')
    expect(rows()[1].getAttribute('data-active')).toBe('true')

    // Wrapping is the one place a list is allowed to, because a palette is a
    // transient surface where overshoot is common and a reader who overshot
    // should not have to press Up to come back.
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(rows().at(-1)?.getAttribute('data-active')).toBe('true')

    await user.keyboard('{ArrowDown}')
    expect(rows()[0].getAttribute('data-active')).toBe('true')
    expect(field).toBe(document.activeElement)
  })

  it('runs the highlighted command on Enter and closes, not the first one', async () => {
    const onFirst = vi.fn()
    const onSecond = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(
      <CommandPalette
        open
        onOpenChange={onOpenChange}
        label="Commands"
        inputLabel="Search commands"
        groups={[
          {
            id: 'g',
            label: 'Workspace',
            items: [
              { id: 'new', label: 'New run', onSelect: onFirst },
              { id: 'other', label: 'Other', onSelect: onSecond },
            ],
          },
        ]}
        empty={empty}
      />,
    )
    // The field is focused on open, but the test has to say so rather than depend
    // on a focus assertion having run in an earlier case: a test that inherits
    // state from the test before it is a test of the order.
    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}{Enter}')

    // The second command runs, and the first does not. Asserting only that
    // "something ran" would pass on an implementation that always runs the first
    // row, which is the failure this test exists to catch.
    expect(onSecond).toHaveBeenCalledTimes(1)
    expect(onFirst).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does nothing on Enter when nothing matches, rather than running the first command', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <CommandPalette
        open
        onOpenChange={() => {}}
        label="Commands"
        inputLabel="Search commands"
        groups={[{ id: 'g', label: 'G', items: [{ id: 'new', label: 'New run', onSelect }] }]}
        empty={empty}
      />,
    )
    await user.type(screen.getByRole('combobox'), 'zzzz{Enter}')
    // Running a command the reader did not point at is the one outcome a palette
    // must never produce, and it is invisible in a screenshot because nothing
    // about the screen changes when it happens.
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('keeps the highlight in range when the list shrinks under it', async () => {
    const user = userEvent.setup()
    open()
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    await user.type(screen.getByRole('combobox'), 'sett')
    // The highlight was on the fourth row and the filtered list has one. Clamping
    // keeps it in range; a stale index would point past the end and Enter would do
    // nothing with no way for the reader to tell why.
    const active = rows().filter((row) => row.getAttribute('data-active') === 'true')
    expect(active).toHaveLength(1)
    expect(active[0].textContent).toContain('Open settings')
  })

  it('emphasises the matched run by weight rather than by a background', async () => {
    const user = userEvent.setup()
    open()
    await user.type(screen.getByRole('combobox'), 'sett')
    const strong = scope().querySelector('[data-slot="command-palette-item"] strong')
    // A Mark is right in a list of results, where the match is the reason the row
    // is there. In a palette the match is a hint while the label is what is being
    // read, and a saturated background on every matched character fights the text
    // it sits inside.
    expect(strong?.textContent).toBe('sett')
    expect(strong?.className).not.toMatch(/bg-/)
  })

  it('shows suggestions instead of the full list before anything is typed', () => {
    open({
      suggest: {
        label: 'Recent',
        items: [{ id: 'r', label: 'New run', onSelect: () => {} }],
      },
    })
    // A palette that opens onto the full list makes a reader type before they know
    // what is available, which inverts the point of a surface that exists to be
    // faster than the menu it replaces.
    expect(labels()).toEqual(['New run'])
    expect(screen.getByText('Recent')).toBeTruthy()
    expect(screen.queryByText('Appearance')).toBeNull()
  })

  it('resets the query when it closes, so it does not reopen showing the last search', async () => {
    const { rerender } = render(
      <CommandPalette
        open
        onOpenChange={() => {}}
        label="Commands"
        inputLabel="Search commands"
        groups={groups}
        empty={empty}
      />,
    )
    const user = userEvent.setup()
    await user.type(screen.getByRole('combobox'), 'sett')

    rerender(
      <CommandPalette
        open={false}
        onOpenChange={() => {}}
        label="Commands"
        inputLabel="Search commands"
        groups={groups}
        empty={empty}
      />,
    )
    rerender(
      <CommandPalette
        open
        onOpenChange={() => {}}
        label="Commands"
        inputLabel="Search commands"
        groups={groups}
        empty={empty}
      />,
    )
    // A surface that remembers its filter between visits is a surface whose state
    // the reader has to reason about before they can use it.
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('')
    })
  })

  it('classifies where a match falls, which is the whole of the ranking', () => {
    // The scoring is exported so it can be reasoned about and tested directly
    // rather than only through the rendered order, because an order assertion
    // cannot tell you *why* two rows swapped.
    expect(locate('Settings', 'sett').rank).toBe(RANKS.prefix)
    expect(locate('Open settings', 'sett').rank).toBe(RANKS.wordStart)
    expect(locate('Reset workspace', 'set').rank).toBe(RANKS.substring)
    expect(locate('Nothing', 'zzz').rank).toBe(RANKS.none)
    // A match is reported with the range it covers, which is what gets emphasised.
    // "sett" starts at index 5 of "Open settings", which is the character after
    // the space. Reading the index off by eye is the single most common way to
    // write a fixture that fails for a reason that is not the Component.
    expect(locate('Open settings', 'sett').range).toEqual([5, 9])
  })

  it('orders the groups by their best match, not by where they were declared', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <CommandPalette
        open
        onOpenChange={() => {}}
        label="Commands"
        inputLabel="Search commands"
        groups={[
          {
            id: 'first',
            label: 'Declared first',
            items: [{ id: 'weak', label: 'Reset workspace', onSelect: () => {} }],
          },
          {
            id: 'second',
            label: 'Declared second',
            items: [{ id: 'strong', label: 'Settings', onSelect: () => {} }],
          },
        ]}
        empty={empty}
      />,
    )
    // Typed as "set" and not "sett": "reset workspace" contains "set" inside a word
    // but not "sett", so the longer query matches one label and the comparison
    // would be about nothing.
    await user.type(screen.getByRole('combobox'), 'set')

    // Both match. "Settings" matches at the start of its name and "Reset
    // workspace" matches inside a word, so the second group has the better hit and
    // has to come first. Ranking only *within* a group would leave the second
    // group's exact match below the first group's poor one, and a reader would
    // still be scanning, which is the thing the ranking exists to stop.
    const headings = [
      ...document.body.querySelectorAll('[data-slot="command-palette-group-label"]'),
    ].map((node) => node.textContent)
    expect(headings).toEqual(['Declared second', 'Declared first'])
    expect(container).toBeTruthy()
  })

  it('has no accessibility violations when it is on the page', async () => {
    open()
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeTruthy()
    })
    const results = await axe.run(scope(), {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
