import { CreditCard, Home, User } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import {
  Sidebar,
  SidebarFooter,
  SidebarItem,
  SidebarNav,
  SidebarToggle,
} from '../src/components/ui/sidebar'

/**
 * A navigation rail with its own ink, its own focus ring, and a collapsed state.
 *
 * The claim under test is the one the ticket turns on: **the collapsed state is
 * the same rail at a smaller width, not a worse version of it.** An icon-only rail
 * that dropped the hover surface, the focus ring or the current marking would be a
 * smaller thing that is also a harder one to use, and it is the failure every
 * icon rail in every product ships. So these tests assert the three states of an
 * item side by side rather than asserting that a collapsed rail has icons.
 *
 * The second claim is the accessible name. A rail collapses to icons, and an icon
 * is not a name: a screen reader announces "link" once for each of them. The words
 * therefore stay in the document, moved to `sr-only` rather than unmounted, and the
 * name a reader hears is the same string in both states.
 *
 * The third is the ring, and it is measured rather than asserted. `sidebar-ring`
 * measures 4.11:1 against the Mint light rail where the page `ring` measures
 * 2.86:1, so this surface is the one place in the package where inheriting the
 * page ring would ship a focus indicator below 3:1. The tests also pin the thing
 * that makes that honest: the Component does not suppress the browser's own
 * outline, so the ring here is a second indicator rather than a replacement the
 * repository cannot verify, because `check-focus-indicators.mjs` reads exactly one
 * ring role in the pattern it takes a full-strength ring from.
 */

/** A rail with the parts a product rail has, so nothing is asserted in the abstract. */
const RAIL = (props: Partial<Parameters<typeof Sidebar>[0]> = {}) => (
  <Sidebar {...props}>
    <div data-slot="product">NaniSoft</div>
    <SidebarNav label="Sections">
      <SidebarItem label="Overview" href="/overview" icon={<Home />} current />
      <SidebarItem label="Billing" href="/billing" icon={<CreditCard />}>
        3
      </SidebarItem>
    </SidebarNav>
    <SidebarFooter>
      <SidebarToggle collapseLabel="Collapse sidebar" expandLabel="Expand sidebar" />
    </SidebarFooter>
  </Sidebar>
)

const rail = (container: HTMLElement) =>
  container.querySelector('[data-slot="sidebar"]') as HTMLElement
const items = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('[data-slot="sidebar-item"]'),
]
const toggle = () => screen.getByRole('button', { name: /sidebar/i })

/** The classes that have to be identical whatever the rail's width. */
const STATEFUL = [
  'hover:bg-sidebar-accent',
  'hover:text-sidebar-accent-foreground',
  'focus-visible:ring-sidebar-ring',
  'focus-visible:ring-[3px]',
]

describe('the Sidebar', () => {
  it('is a surface, and the navigation inside it is the named landmark', () => {
    const { container } = render(RAIL())
    // A `div` carries no role, so a name on the rail would be a name nothing
    // reads. The landmark is the navigation, and it is named there.
    expect(rail(container).tagName).toBe('DIV')
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeTruthy()
  })

  it('wears the sidebar own ink, border and surface, not the page one', () => {
    const { container } = render(RAIL())
    // The whole reason this Component exists: the one rail the package had drew
    // its surface and its border from the page roles, so the sidebar tokens were a
    // family in the contract with no consumer.
    const surface = rail(container)
    expect(surface).toHaveClass('bg-sidebar')
    expect(surface).toHaveClass('text-sidebar-foreground')
    expect(surface).toHaveClass('border-sidebar-border')
    expect(surface).not.toHaveClass('bg-background')
    expect(surface).not.toHaveClass('text-foreground')
    // And the divider in its footer is the sidebar's border, not the page's.
    expect(container.querySelector('[data-slot="sidebar-footer"]')).toHaveClass(
      'border-sidebar-border',
    )
  })

  it('states its collapsed state on the element, so a stylesheet and a test can find it', () => {
    const { container } = render(RAIL())
    expect(rail(container).getAttribute('data-collapsed')).toBe('false')
  })

  it('starts collapsed when it is told to, on the first render', () => {
    const { container } = render(RAIL({ defaultCollapsed: true }))
    // Not after an effect. A rail that opened at its full width and then folded is
    // a rail a reader watches collapse on every page load.
    expect(rail(container).getAttribute('data-collapsed')).toBe('true')
    expect(rail(container).className).toContain('w-16')
  })

  it('gives the reader the same list of links, by name, at both widths', () => {
    const { rerender } = render(RAIL())
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Overview' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Billing' })).toBeTruthy()

    rerender(RAIL({ defaultCollapsed: true }))
    // The claim as a positive, in a collapsed rail. An icon is not a name, so the
    // words have to survive the collapse, and the count beside them is
    // `aria-hidden` so it does not become part of the name in one state and not the
    // other.
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Billing' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Overview' })).toBeTruthy()
  })

  it('moves an item words out of sight rather than out of the document', () => {
    const { container } = render(RAIL({ defaultCollapsed: true }))
    const label = items(container)[1].querySelector('[data-slot="sidebar-item-label"]') as HTMLElement
    // `sr-only` rather than a removed element. A rail that unmounted its labels
    // would be a rail whose links a reader hears as unlabelled links, and whose
    // words a browser's find-in-page could not find either.
    expect(label.textContent).toBe('Billing')
    expect(label.className).toBe('sr-only')
  })

  it('drops a trailing count while collapsed, because a 4rem rail has no room for it', () => {
    const { container: open } = render(RAIL())
    expect(open.querySelector('[data-slot="sidebar-item-trailing"]')?.textContent).toBe('3')
    // And it is not announced while it is drawn, so it never becomes part of the
    // item's name.
    expect(open.querySelector('[data-slot="sidebar-item-trailing"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    const { container: closed } = render(RAIL({ defaultCollapsed: true }))
    expect(closed.querySelector('[data-slot="sidebar-item-trailing"]')).toBeNull()
  })

  it('keeps the hover surface, the ring and the current marking while collapsed', () => {
    // Two renders rather than one render and a rerender: React reuses the same
    // element and rewrites its class string, so a node captured before the state
    // change is the very node the assertion is about. Driven from the controlled
    // prop rather than from `defaultCollapsed`, because a default is a mount-time
    // value and a rail that folded when its default changed under it would be a
    // rail whose state follows a prop that is not its state.
    const { container: openBox } = render(RAIL({ collapsed: false }))
    const { container: closedBox } = render(RAIL({ collapsed: true }))
    const open = items(openBox)[0]
    const closed = items(closedBox)[0]

    for (const stateful of STATEFUL) {
      expect(open.className).toContain(stateful)
      expect(closed.className).toContain(stateful)
    }
    // The current marking is a shape as well as an attribute, and it is present in
    // both widths. A rail that lost its "you are here" when it collapsed would be
    // a worse version of the thing rather than a smaller one.
    expect(open.querySelector('[data-slot="sidebar-item-mark"]')).toBeTruthy()
    expect(closed.querySelector('[data-slot="sidebar-item-mark"]')).toBeTruthy()
    // Only the width and the padding change.
    expect(closed.className).toContain('justify-center')
    expect(open.className).toContain('px-3')
    expect(closed.className).toContain('px-0')
  })

  it('draws the ring in the sidebar own role and never in the page one', () => {
    const { container } = render(RAIL())
    // Measured, not asserted. `ring` is pinned to a step that clears 3:1 against
    // the page ground, and the sidebar ground is one step off it, so on Mint in
    // light mode the page ring measures 2.86:1 against the rail where
    // `sidebar-ring` measures 4.11:1. A rail that inherited the page ring was a
    // focus indicator a reader could not see in one pack out of six, and it looked
    // correct in the other five.
    for (const surface of [items(container)[0], toggle()]) {
      expect(surface.className).toContain('focus-visible:ring-sidebar-ring')
      expect(surface.className).not.toMatch(/(?:^|\s)focus-visible:ring-ring(?:\s|$)/)
    }
  })

  it('adds the sidebar ring rather than replacing the browser own outline', () => {
    const { container } = render(RAIL())
    // Every other focusable Component in this package suppresses the outline and
    // draws `ring-ring` in its place. This one does not, because the ring it draws
    // is a different role and `check-focus-indicators.mjs` recognises exactly one
    // ring role in the pattern it reads a full-strength ring from. A Component
    // that claimed to replace the outline here would be claiming a replacement
    // the repository cannot verify, so it keeps both indicators.
    for (const surface of [items(container)[0], toggle()]) {
      expect(surface.className).not.toMatch(/(?:^|\s)outline-none(?:\s|$)/)
      expect(surface.className).toContain('focus-visible:ring-[3px]')
    }
  })

  it('marks the current item with an attribute, and with nothing else', () => {
    const { container } = render(RAIL())
    const [current, other] = items(container)
    // The attribute a reader is told, and the one a browser's find-in-page uses to
    // find the current page.
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.getAttribute('data-current')).toBe('true')
    // The claims, as absences. An `aria-current` on every item marks nothing.
    expect(other.hasAttribute('aria-current')).toBe(false)
    expect(other.hasAttribute('data-current')).toBe(false)
    // The rail down the leading edge is a shape and the weight is a second
    // non-colour channel, so the marking survives a reader who cannot separate
    // two surfaces.
    expect(current.querySelector('[data-slot="sidebar-item-mark"]')).toBeTruthy()
    expect(other.querySelector('[data-slot="sidebar-item-mark"]')).toBeNull()
    expect(current.className).toContain('font-medium')
    expect(other.className).not.toContain('font-medium')
  })

  it('states the ink its own current fill sits on', () => {
    const { container } = render(RAIL())
    // A `bg-sidebar-primary` with the rail's inherited ink is `sidebar-primary`
    // behind `sidebar-foreground`, which is neutral 900 behind neutral 900 in
    // light mode. The token gate measures the pair it was given and cannot see
    // which ink a class string failed to state.
    const [current] = items(container)
    expect(current).toHaveClass('bg-sidebar-primary')
    expect(current).toHaveClass('text-sidebar-primary-foreground')
  })

  it('renders an item that acts rather than navigates as a real button that does something', async () => {
    const user = userEvent.setup()
    const acted = vi.fn()
    render(
      <Sidebar>
        <SidebarNav label="Sections">
          <SidebarItem label="New project" icon={<User />} onClick={acted} />
        </SidebarNav>
      </Sidebar>,
    )
    // An anchor with no `href` is not a link: no role, and not focusable. An item
    // that acts has to be a button or it is an element a keyboard cannot reach.
    const control = screen.getByRole('button', { name: 'New project' })
    expect(screen.queryByRole('link', { name: 'New project' })).toBeNull()
    await user.click(control)
    // And a button a reader can find and press with no result is the same defect
    // as a list that renders an empty item, so the handler is a prop.
    expect(acted).toHaveBeenCalledOnce()
  })

  it('names the toggle for the action it performs, and tells the reader the state', async () => {
    const user = userEvent.setup()
    render(RAIL())
    const control = toggle()
    // Named for what it will do, and carrying the state, so a reader meets either.
    expect(control).toHaveAttribute('aria-label', 'Collapse sidebar')
    expect(control.getAttribute('aria-expanded')).toBe('true')

    await user.click(control)
    // The same control, now named for the other action. A button called "Toggle"
    // is correct in a demo and useless to the reader deciding whether to press it.
    expect(toggle()).toHaveAttribute('aria-label', 'Expand sidebar')
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
  })

  it('points the toggle at the rail the Component actually rendered', () => {
    render(RAIL())
    // From both ends, the way the Collapsible's wiring is read: the control names
    // a region, and the region is the element the rail rendered. A generated name
    // that has drifted from the element is the half of this failure a screenshot
    // cannot show.
    const controls = toggle().getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    expect(document.getElementById(controls ?? '')?.getAttribute('data-slot')).toBe('sidebar')
  })

  it('collapses and expands from the keyboard, because the toggle is a real button', async () => {
    const user = userEvent.setup()
    const { container } = render(RAIL())
    const control = toggle()
    control.focus()
    expect(document.activeElement).toBe(control)

    await user.keyboard('{Enter}')
    expect(rail(container).getAttribute('data-collapsed')).toBe('true')
    await user.keyboard(' ')
    expect(rail(container).getAttribute('data-collapsed')).toBe('false')
  })

  it('reports the state it is moving to, for a rail whose state has to be kept', async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    render(RAIL({ onCollapsedChange }))
    await user.click(toggle())
    // A product that forgets the rail on every page load teaches a reader that
    // collapsing it was a mistake, so the controlled form is the common case.
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
  })

  it('follows a controlled state rather than its own', async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    const { rerender, container } = render(RAIL({ collapsed: false, onCollapsedChange }))
    await user.click(toggle())
    // The parent is the truth, so the rail has not moved yet. A rail that wrote
    // only its own state would show a state its parent had already overridden.
    expect(rail(container).getAttribute('data-collapsed')).toBe('false')
    expect(onCollapsedChange).toHaveBeenCalledWith(true)

    rerender(RAIL({ collapsed: true, onCollapsedChange }))
    expect(rail(container).getAttribute('data-collapsed')).toBe('true')
  })

  it('takes the id a consumer gives it, so a consumer can name the rail', () => {
    render(RAIL({ id: 'product-rail' }))
    // A rail a consumer cannot name from their own stylesheet or their own test is
    // a rail they have to reach into the DOM to find.
    expect(document.getElementById('product-rail')?.getAttribute('data-slot')).toBe('sidebar')
    expect(document.getElementById('product-rail')).toBe(
      document.getElementById(toggle().getAttribute('aria-controls') ?? ''),
    )
  })

  it('draws every item at the same height whatever its own words', () => {
    const { container } = render(RAIL())
    // A rail whose items are taller when the name is longer is a rail whose rows
    // do not line up, which is the same defect the chart frame exists to end.
    for (const item of items(container)) {
      expect(item.className).toContain('h-9')
    }
  })

  it('has no accessibility violations when it is open', async () => {
    const { container } = render(RAIL())
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('has no accessibility violations when it is collapsed', async () => {
    const { container } = render(RAIL({ defaultCollapsed: true }))
    // The collapsed rail is the case that gets missed, because an item whose label
    // moved to `sr-only` loses its name outright if the move was a removal.
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
