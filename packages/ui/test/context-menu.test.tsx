import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuLinkItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../src/components/ui/context-menu'

/**
 * A menu of commands opened by the secondary pointer gesture over a region.
 *
 * The claim under test is that the Component knows which of its rows is a
 * command and which is a destination, because that is the decision a consumer
 * gets wrong and it is invisible until a reader middle-clicks a row and nothing
 * happens. A command is a `div` with `role="menuitem"`; a link is a real
 * `<a href>`, so the browser can open it in a new tab and copy its address.
 * Asserting the tag name is asserting the affordance, not the styling.
 *
 * The second claim is that the region is not a control. The gesture is
 * secondary, so a trigger that looked like a button and announced itself as one
 * would teach a keyboard reader a gesture with no keyboard equivalent.
 */
const ROWS = (
  <ContextMenu>
    <ContextMenuTrigger data-testid="region" className="rounded-md border p-4">
      Three runs selected
    </ContextMenuTrigger>
    <ContextMenuContent label="Run actions">
      <ContextMenuGroup>
        <ContextMenuLabel>Selection</ContextMenuLabel>
        <ContextMenuItem>Re-run these</ContextMenuItem>
        <ContextMenuItem variant="destructive">Delete runs</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuLinkItem href="/share/one">Copy link to selection</ContextMenuLinkItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuLinkItem href="/runs/42">Open run 42 in a new tab</ContextMenuLinkItem>
    </ContextMenuContent>
  </ContextMenu>
)

/** Opens the menu the way a reader does, with the secondary pointer button. */
async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('region') })
  return screen.getByRole('menu')
}

describe('the Context menu', () => {
  // Queried from the document, because the menu is portalled to the body and a
  // container-scoped query would find an empty tree.
  const scope = (): HTMLElement => document.body

  it('renders no menu until the secondary gesture is made', () => {
    render(ROWS)
    expect(screen.queryByRole('menu')).toBeNull()
    // And no command is in the document, so a reader with no pointer and a
    // crawler both see a region and nothing more.
    expect(screen.queryByText('Delete runs')).toBeNull()
  })

  it('opens on the secondary press over the region', async () => {
    const user = userEvent.setup()
    render(ROWS)
    await openMenu(user)
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('takes the accessible name the caller gave it, because nothing else names it', async () => {
    const user = userEvent.setup()
    render(ROWS)
    await openMenu(user)

    // A context menu is opened by a gesture on a region rather than by a control
    // the reader chose, so nothing on the page has already named it. Three menus
    // in one table, each announced as "menu", is a page where a screen reader
    // user cannot tell which surface they are in.
    const menu = screen.getByRole('menu', { name: 'Run actions' })
    expect(menu.getAttribute('aria-label')).toBe('Run actions')
  })

  it('renders a command as a menu item and a destination as a native anchor', async () => {
    const user = userEvent.setup()
    render(ROWS)
    const menu = await openMenu(user)

    const command = screen.getByRole('menuitem', { name: 'Re-run these' })
    const destination = screen.getByRole('menuitem', { name: 'Open run 42 in a new tab' })

    // The claim. A command is a div with a role; a destination is an anchor with
    // an address, so the browser can open it in a new tab, copy it, and a crawler
    // can follow it. Both carry `role="menuitem"`, so the role alone cannot tell
    // the two apart, and the tag name is what does.
    expect(command.tagName).toBe('DIV')
    expect(command.hasAttribute('href')).toBe(false)

    expect(destination.tagName).toBe('A')
    expect(destination.getAttribute('href')).toBe('/runs/42')

    // And both really are inside the one menu, so this is a distinction and not
    // an accident of querying.
    expect(menu.contains(command)).toBe(true)
    expect(menu.contains(destination)).toBe(true)
  })

  it('marks a destructive row by attribute and by ink, not by colour alone', async () => {
    const user = userEvent.setup()
    render(ROWS)
    await openMenu(user)

    const destructive = screen.getByRole('menuitem', { name: 'Delete runs' })
    // The marking is a data attribute as well as a colour, so a consumer themes
    // it and a reader who cannot distinguish the colour still gets a state.
    expect(destructive.getAttribute('data-variant')).toBe('destructive')
    expect(destructive.className).toContain('text-destructive')
  })

  it('renders the region as a region, not as a control', () => {
    render(ROWS)
    const region = screen.getByTestId('region')

    // The gesture is unreachable by a keyboard, so an element that announces
    // itself as a button teaches a reader a gesture that then does nothing, and
    // adds a Tab stop for it. Asserted as the absence of a role and of a tab
    // index, which is the risk of adding one.
    expect(region.getAttribute('role')).toBeNull()
    expect(region.getAttribute('tabindex')).toBeNull()
    expect(region.tagName).toBe('DIV')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(ROWS)
    await openMenu(user)
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  it('closes on an outside press, because a menu is a transient surface', async () => {
    const user = userEvent.setup()
    render(ROWS)
    await openMenu(user)
    await user.click(document.body)
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  it('opens a submenu and reaches its link', async () => {
    const user = userEvent.setup()
    render(ROWS)
    await openMenu(user)

    const sub = screen.getByRole('menuitem', { name: 'Share' })
    // Opened with the keyboard rather than the pointer, because the arrows are
    // the model a reader without a secondary button depends on.
    sub.focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Copy link to selection' })).toBeTruthy()
    })
    const link = screen.getByRole('menuitem', { name: 'Copy link to selection' })
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/share/one')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const user = userEvent.setup()
    render(ROWS)
    await openMenu(user)

    const results = await axe.run(scope(), {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
