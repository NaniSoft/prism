import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  NavigationMenu,
  NavigationMenuBackdrop,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '../src/components/ui/navigation-menu'

/**
 * A list of links with groups that expand and collapse.
 *
 * The claim under test is that the Component knows it holds links, because that
 * is the decision a consumer gets wrong and nothing on screen shows it. A link
 * can be opened in a new tab, copied by address, middle-clicked and crawled; a
 * command cannot do any of those. So the only interactive leaf here is a native
 * anchor, there is no command part to reach for by mistake, and `active` is
 * required because a navigation menu that does not say where the reader is has
 * made them guess.
 *
 * The second claim is that a closed group shows nothing at all, which is what a
 * reader with JavaScript off and a crawler see. That is a real cost, so
 * `NavigationMenuContent` takes `keepMounted` and both states are tested.
 */
const MENU = (props: Partial<Parameters<typeof NavigationMenu>[0]> = {}) => (
  <NavigationMenu label="Primary" {...props}>
    <NavigationMenuList>
      <NavigationMenuItem value="products">
        <NavigationMenuTrigger>Products</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink href="/products/alpha" active>
            Alpha
          </NavigationMenuLink>
          <NavigationMenuLink href="/products/beta">Beta</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="docs">
        <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink href="/docs/foundation">Foundation</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
    <NavigationMenuPortal>
      <NavigationMenuBackdrop />
      <NavigationMenuPositioner>
        <NavigationMenuPopup>
          <NavigationMenuViewport />
        </NavigationMenuPopup>
      </NavigationMenuPositioner>
    </NavigationMenuPortal>
  </NavigationMenu>
)

describe('the Navigation menu', () => {
  // Queried from the document, because an open group is portalled to the body.
  const scope = (): HTMLElement => document.body

  it('is a named nav landmark, so a header and a footer tell themselves apart', () => {
    render(MENU())
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    // The root renders a `<nav>`, and a `<nav>` with no name is a landmark a
    // screen reader announces only as "navigation". A site header's links and a
    // footer's link list are both `<nav>`, and the name is the only thing that
    // tells a reader which is which.
    expect(nav.tagName).toBe('NAV')
    expect(nav.getAttribute('aria-label')).toBe('Primary')
  })

  it('shows triggers and nothing else while every group is closed', () => {
    render(MENU())
    expect(screen.getByRole('button', { name: 'Products' })).toBeTruthy()
    // The claim: a closed group holds no links at all, so a reader with no
    // JavaScript and a crawler see the same set of addresses the sighted reader
    // sees before opening anything, and not a wall of hidden links.
    expect(screen.queryByRole('link', { name: 'Alpha' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Foundation' })).toBeNull()
  })

  it('reports every group as collapsed before it is opened', () => {
    render(MENU())
    const products = screen.getByRole('button', { name: 'Products' })
    // Asserted as the state a reader is told rather than as a class, because a
    // chevron that turns without the state changing is the defect.
    expect(products.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens a group on a click and shows its links as native anchors', async () => {
    const user = userEvent.setup()
    render(MENU())
    const trigger = screen.getByRole('button', { name: 'Products' })

    await user.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // The claim. A command rendered where a reader expected a destination gives
    // them a middle-click that does nothing, and an address that cannot be
    // copied. The role is `link`, so the tag name is what proves the affordance.
    const alpha = screen.getByRole('link', { name: 'Alpha' })
    expect(alpha.tagName).toBe('A')
    expect(alpha.getAttribute('href')).toBe('/products/alpha')
  })

  it('says which page the reader is on, by attribute rather than by colour', async () => {
    const user = userEvent.setup()
    render(MENU())
    await user.click(screen.getByRole('button', { name: 'Products' }))

    const alpha = screen.getByRole('link', { name: 'Alpha' })
    const beta = screen.getByRole('link', { name: 'Beta' })

    // The marking is the attribute, so a reader who cannot distinguish the
    // active colour still knows where they are, and so the marking survives a
    // theme change.
    expect(alpha.getAttribute('aria-current')).toBe('page')
    // And the risk being guarded is adding one where there should be none.
    expect(beta.getAttribute('aria-current')).toBeNull()
  })

  it('opens a group from the keyboard, because the trigger is a Tab stop', async () => {
    const user = userEvent.setup()
    render(MENU())
    const trigger = screen.getByRole('button', { name: 'Products' })

    trigger.focus()
    expect(document.activeElement).toBe(trigger)
    await user.keyboard('{ArrowDown}')

    // A reader with no pointer is a reader, and the only route to these links
    // for them is the keyboard.
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Alpha' })).toBeTruthy()
    })
  })

  it('closes the open group on Escape and leaves no links behind', async () => {
    const user = userEvent.setup()
    render(MENU())
    const trigger = screen.getByRole('button', { name: 'Products' })

    await user.click(trigger)
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeTruthy()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Alpha' })).toBeNull()
    })
    // A closed group that left its links in the document would put destinations
    // in the Tab order that a reader cannot see, which is the one failure a
    // closed group must not have.
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps a closed group in the document only when the caller asks, with it hidden', async () => {
    const user = userEvent.setup()
    render(
      <NavigationMenu label="Primary">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent keepMounted>
              <NavigationMenuLink href="/products/alpha">Alpha</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuPortal>
          <NavigationMenuPositioner>
            <NavigationMenuPopup>
              <NavigationMenuViewport />
            </NavigationMenuPopup>
          </NavigationMenuPositioner>
        </NavigationMenuPortal>
      </NavigationMenu>,
    )

    const link = screen.getByRole('link', { name: 'Alpha', hidden: true })
    expect(link.closest('[data-slot="navigation-menu-content"]')?.hasAttribute('hidden')).toBe(true)

    // And it is out of the Tab order, which is the whole reason it is hidden
    // rather than merely invisible.
    const user2 = userEvent.setup()
    await user2.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Products' }))

    await user.click(screen.getByRole('button', { name: 'Products' }))
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Alpha' })).toBeTruthy()
    })
  })

  it('never has two groups open at once, because two panels over one header is a header nobody can read', async () => {
    const user = userEvent.setup()
    render(MENU())

    await user.click(screen.getByRole('button', { name: 'Products' }))
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Docs' }))
    // Measured rather than described, because the exact result is a library
    // behaviour and the test should fail if it ever becomes two open panels. The
    // press on a sibling trigger is taken as leaving the first group, so the
    // first closes; what matters is that it closes and nothing overlaps.
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Alpha' })).toBeNull()
    })
    const visible = [
      screen.queryByRole('link', { name: 'Alpha' }),
      screen.queryByRole('link', { name: 'Beta' }),
      screen.queryByRole('link', { name: 'Foundation' }),
    ].filter((node) => node !== null)
    expect(visible).toHaveLength(0)

    // And the bar is still operable afterwards, which is the half that matters:
    // a header whose first press after a group closes is dead would be a
    // worse failure than two overlapping panels.
    await user.click(screen.getByRole('button', { name: 'Docs' }))
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Foundation' })).toBeTruthy()
    })
    expect(screen.queryByRole('link', { name: 'Alpha' })).toBeNull()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const user = userEvent.setup()
    render(MENU())
    await user.click(screen.getByRole('button', { name: 'Products' }))
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Alpha' })).toBeTruthy()
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
