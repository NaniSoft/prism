import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarLinkItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../src/components/ui/menubar'

/**
 * The bar at the top of an application window that owns its commands.
 *
 * The claim under test is the one-Tab-stop model, because that is the whole
 * difference between a menubar and a row of dropdowns and it is invisible in a
 * screenshot. Arrow keys move along the bar; Tab leaves it. A consumer who
 * composes the same set of menus as a row of buttons gets the Tab order of the
 * document instead, which is every button in the bar and none of the arrows.
 *
 * The second claim is that the bar is named. A menubar is a single Tab stop, so
 * nothing announces it until focus lands on it, and two unnamed bars are two
 * things a screen reader calls "menu".
 */
const BAR = (props: Partial<Parameters<typeof Menubar>[0]> = {}) => (
  <Menubar label="Notion" {...props}>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarLabel>New</MenubarLabel>
          <MenubarItem>Document</MenubarItem>
          <MenubarItem>Spreadsheet</MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Export</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarLinkItem href="/export/pdf">PDF</MenubarLinkItem>
            <MenubarLinkItem href="/export/png">PNG</MenubarLinkItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem variant="destructive">Close workspace</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Cut</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Help</MenubarTrigger>
    </MenubarMenu>
  </Menubar>
)

describe('the Menubar', () => {
  // Queried from the document, because a menu is portalled to the body.
  const scope = (): HTMLElement => document.body

  it('is a named menubar, so two of them on a page are told apart', () => {
    render(BAR())
    const bar = screen.getByRole('menubar', { name: 'Notion' })
    // A menubar is a single Tab stop, so nothing on the page announces it until
    // focus lands there. Two unnamed bars are two things a screen reader calls
    // "menu", and the name is the only thing that fixes it.
    expect(bar.getAttribute('aria-label')).toBe('Notion')
    expect(bar.getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('renders no menu until one is opened', () => {
    render(BAR())
    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.queryByText('Close workspace')).toBeNull()
  })

  it('moves between its menus with the arrows rather than with Tab', async () => {
    const user = userEvent.setup()
    render(BAR())

    const file = screen.getByRole('menuitem', { name: 'File' })
    const edit = screen.getByRole('menuitem', { name: 'Edit' })
    const help = screen.getByRole('menuitem', { name: 'Help' })

    file.focus()
    expect(document.activeElement).toBe(file)

    await user.keyboard('{ArrowRight}')
    // The claim. Tab would have left the bar entirely, and a reader would be on
    // the page below with no way back to the second menu but Shift-Tabbing.
    expect(document.activeElement).toBe(edit)

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(help)

    // And the other way, because a bar that only goes forwards is half a bar.
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.activeElement).toBe(file)
  })

  it('wraps at the ends, because a bar that stops is a bar a reader falls off', async () => {
    const user = userEvent.setup()
    render(BAR())

    const file = screen.getByRole('menuitem', { name: 'File' })
    const help = screen.getByRole('menuitem', { name: 'Help' })

    file.focus()
    await user.keyboard('{ArrowLeft}')
    // `loopFocus` is on by default, and the alternative is a reader who reaches
    // the end of a three-item bar and has to press Home to get back.
    expect(document.activeElement).toBe(help)

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(file)
  })

  it('opens a menu with the keyboard and puts focus on its first row', async () => {
    const user = userEvent.setup()
    render(BAR())

    const file = screen.getByRole('menuitem', { name: 'File' })
    file.focus()
    await user.keyboard('{ArrowDown}')

    // The menu is a list of commands a reader is choosing between, so focus
    // belongs on the first one rather than on the menu surface, which is where a
    // reader would then have to press Down again to reach anything.
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy()
    })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Document' }))
  })

  it('closes on Escape and returns focus to the trigger that opened the menu', async () => {
    const user = userEvent.setup()
    render(BAR())

    const file = screen.getByRole('menuitem', { name: 'File' })
    file.focus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy()
    })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull()
    })
    // A reader who opened a menu and changed their mind resumes at the menu they
    // were on, not at the top of the document.
    expect(document.activeElement).toBe(file)
  })

  it('knows which of its rows is a command and which is a destination', async () => {
    const user = userEvent.setup()
    render(BAR())
    screen.getByRole('menuitem', { name: 'File' }).focus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy()
    })

    // The same decision the Context menu makes, and the reason it is a separate
    // part rather than a class: a place can be opened in a new tab and copied by
    // address, and a command cannot.
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    const trigger = screen.getByRole('menuitem', { name: 'Export' })
    trigger.focus()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeTruthy()
    })

    const destination = screen.getByRole('menuitem', { name: 'PDF' })
    expect(destination.tagName).toBe('A')
    expect(destination.getAttribute('href')).toBe('/export/pdf')

    const command = screen.getByRole('menuitem', { name: 'Document' })
    expect(command.tagName).toBe('DIV')
  })

  it('marks a destructive row by attribute and by ink', async () => {
    const user = userEvent.setup()
    render(BAR())
    screen.getByRole('menuitem', { name: 'File' }).focus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy()
    })

    const destructive = screen.getByRole('menuitem', { name: 'Close workspace' })
    expect(destructive.getAttribute('data-variant')).toBe('destructive')
    expect(destructive.className).toContain('text-destructive')
  })

  it('reports the bar as vertical when it is asked to be', () => {
    render(BAR({ orientation: 'vertical' }))
    const bar = screen.getByRole('menubar', { name: 'Notion' })
    // The axis is what tells a reader whether the up and down arrows or the left
    // and right ones are the ones that move along the bar.
    expect(bar.getAttribute('aria-orientation')).toBe('vertical')
    expect(bar.getAttribute('data-orientation')).toBe('vertical')
  })

  it('stops every menu in the bar when the bar is disabled', async () => {
    const user = userEvent.setup()
    render(BAR({ disabled: true }))

    const file = screen.getByRole('menuitem', { name: 'File' })
    file.focus()
    await user.keyboard('{ArrowDown}')

    // A disabled bar that still opens its menus is a control that says it is off
    // and then ignores the reader, which is worse than one that looks off.
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const user = userEvent.setup()
    render(BAR())
    screen.getByRole('menuitem', { name: 'File' }).focus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy()
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
