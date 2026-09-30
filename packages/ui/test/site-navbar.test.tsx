import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SiteNavbar } from '../src/blocks/site-navbar'

/**
 * The bar all five NaniSoft sites now share.
 *
 * The claims under test are the ones a consumer inherits and cannot see from the
 * source: that the lockup and the navigation ship no JavaScript of their own, that
 * every control carries a name the caller supplied rather than a word the Block
 * chose, that the two sets of destinations are two landmarks rather than one region
 * with two lists in it, and that a bar given no controls at all renders as a server
 * Component with nothing interactive in it.
 */
const PRODUCT = { id: 'nexus', name: 'Nexus', pack: 'lavender' as const }
const SET = [
  { id: 'www', name: 'NaniSoft', pack: 'sky' as const, href: 'https://www.nanisoft.com' },
  { id: 'nexus', name: 'Nexus', pack: 'lavender' as const, href: 'https://nexus.nanisoft.com' },
]
const COPY = {
  nav: 'Site',
  sites: 'The family',
  search: 'Search documentation',
  close: 'Close search',
  loading: 'Loading the search index.',
  failed: 'The search index could not be loaded.',
  empty: 'No matches.',
  one: 'result.',
  other: 'results.',
  theme: 'Colour theme',
  toDark: 'Switch to dark mode',
  toLight: 'Switch to light mode',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
}

/**
 * The theme is two attributes on the document element and the store, and both
 * outlive a test.
 *
 * `PrismProvider` resolves the mode from the document before it resolves it from
 * the store, because that is what stops a server-rendered mode flashing. So a
 * `dark` class left on `<html>` by one test is read as the starting mode by the
 * next, and a test that asserts the control's initial label fails for a reason
 * that has nothing to do with the control. Resetting here is the assertion that
 * each test starts from a page a reader has never chosen anything on.
 */
function resetDocument(): void {
  document.documentElement.removeAttribute('data-pack')
  document.documentElement.removeAttribute('data-theme-origin')
  document.documentElement.classList.remove('dark')
  localStorage.clear()
}

beforeEach(resetDocument)
afterEach(resetDocument)

function withEveryControl() {
  return (
    <SiteNavbar
      product={PRODUCT}
      defaultPack="lavender"
      defaultMode="light"
      navLabel={COPY.nav}
      mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
      nav={[
        { label: 'Docs', href: '/docs' },
        { label: 'About', href: '/about' },
      ]}
      sitesLabel={COPY.sites}
      currentSiteId="nexus"
      sites={SET}
      search={{ indexUrl: '/api/search', label: COPY.search, messages: COPY }}
      theme={{ label: COPY.theme }}
      mode={{ lightLabel: COPY.toDark, darkLabel: COPY.toLight }}
    />
  )
}

describe('the bar of a product site', () => {
  it('draws the brand lockup with ProductMark rather than taking a slot', () => {
    const { container } = render(withEveryControl())
    const mark = container.querySelector('[data-slot="product-mark"]')!
    expect(mark).toHaveAttribute('data-pack', 'lavender')
    expect(screen.getByRole('link', { name: /Nexus/ })).toHaveAttribute('href', '/')
  })

  it('is one header, and the two sets of destinations are two landmarks', () => {
    const { container } = render(withEveryControl())
    expect(container.querySelectorAll('header')).toHaveLength(1)
    // A reader who navigates by landmark reaches this site's own pages and the
    // family's sites separately. One region with two lists in it is one landmark.
    expect(screen.getByRole('navigation', { name: COPY.nav })).toBeTruthy()
  })

  it('names every control with a word the caller passed', () => {
    render(withEveryControl())
    for (const name of [COPY.search, COPY.sites, COPY.toDark, COPY.menuOpen]) {
      expect(screen.getByRole('button', { name }), `no control named "${name}"`).toBeTruthy()
    }
  })

  it('marks the current link from the current flag, and from a path when there is no flag', () => {
    const { unmount } = render(
      <SiteNavbar
        product={PRODUCT}
        defaultPack="lavender"
        defaultMode="light"
        navLabel={COPY.nav}
        mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
        nav={[
          { label: 'Docs', href: '/docs' },
          { label: 'About', href: '/about', current: true },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Docs' })).not.toHaveAttribute('aria-current')
    unmount()

    // The root-layout case: a bar rendered once and handed no route, so the caller
    // passes the route instead and the mark is resolved in the browser.
    render(
      <SiteNavbar
        product={PRODUCT}
        defaultPack="lavender"
        defaultMode="light"
        navLabel={COPY.nav}
        currentPath="/docs"
        mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
        nav={[
          { label: 'Docs', href: '/docs' },
          { label: 'About', href: '/about' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('renders as a server Component with no interactive control when given none', () => {
    const { container } = render(
      <SiteNavbar
        product={PRODUCT}
        defaultPack="lavender"
        defaultMode="light"
        navLabel={COPY.nav}
        mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
      />,
    )
    // No search, no sites, no theme, no mode, no actions and no navigation is a
    // valid bar: a lockup and nothing else. It is also the case that ships no client
    // JavaScript at all, because the whole control cluster is one client boundary
    // and there is nothing in it. That is what makes the five optional props
    // optional rather than a list a consumer has to satisfy.
    expect(container.querySelectorAll('button')).toHaveLength(0)
    expect(container.textContent).toBe('Nexus')
  })

  it('renders the sites menu as links, with the current one marked', async () => {
    const user = userEvent.setup()
    render(withEveryControl())

    await user.click(screen.getByRole('button', { name: COPY.sites }))

    const menu = await screen.findByRole('menu')
    // Every member is a real destination: an anchor, so middle-click opens it in a
    // new tab rather than doing nothing at all.
    const links = [...menu.querySelectorAll('a')]
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://www.nanisoft.com',
      'https://nexus.nanisoft.com',
    ])
    expect(links.every((link) => link.getAttribute('target') === '_blank')).toBe(true)
    expect(links[1]).toHaveAttribute('aria-current', 'page')
  })

  it('offers every published pack as a radio choice, and the swatches are boundaries', async () => {
    const user = userEvent.setup()
    const { container } = render(withEveryControl())

    await user.click(screen.getByRole('button', { name: `${COPY.theme}: Lavender` }))

    const menu = await screen.findByRole('menu')
    // One pack active at a time out of a known set, so a radio group and not a list
    // of commands: a reader who opens the chooser is told which pack is in use,
    // which a row of six commands would not tell them.
    const choices = within(menu).getAllByRole('menuitemradio')
    expect(choices.length).toBe(6)
    expect(within(menu).getByRole('menuitemradio', { checked: true })).toHaveTextContent('Lavender')

    // The swatch is a pack boundary carrying `bg-primary`, not a literal read from
    // the token build, so it resolves through the cascade in both modes.
    const swatches = [...container.querySelectorAll('[data-slot="site-navbar-theme-trigger"] [data-pack]')]
    expect(swatches.length).toBeGreaterThan(0)
    for (const swatch of swatches) {
      expect(swatch.className).toContain('bg-primary')
      // A pack repoints its own corner radius too, so the boundary is only safe on
      // a fully rounded shape. This is the assertion that holds that line.
      expect(swatch.className).toContain('rounded-full')
    }
  })

  it('toggles the mode by writing the one class the cascade reads', async () => {
    const user = userEvent.setup()
    render(withEveryControl())

    const toggle = screen.getByRole('button', { name: COPY.toDark })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
    // The name states the destination and the pressed state states the current
    // mode, so the two never contradict each other.
    expect(await screen.findByRole('button', { name: COPY.toLight })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(screen.getByRole('button', { name: COPY.toLight }))
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })
})

describe('the search in the bar', () => {
  const INDEX = [
    { id: '/docs', title: 'The data platform', url: '/docs', content: 'every market minute' },
    { id: '/blog', title: 'A note on feeds', url: '/blog', content: 'the option chain' },
  ]

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => INDEX })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens on the shortcut, fetches the index once, and closes on Escape', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.mocked(fetch)
    render(withEveryControl())

    // The index is the largest asset on a documentation site, so nothing about a
    // page that nobody searched may carry it.
    expect(fetchMock, 'the index is not fetched on load').not.toHaveBeenCalled()

    await user.keyboard('{Control>}k{/Control}')
    const field = await screen.findByRole('textbox', { name: COPY.search })
    await waitFor(() => {
      expect(fetchMock, 'the index is fetched when the dialog opens').toHaveBeenCalledTimes(1)
    })

    await user.type(field, 'option')
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /A note on feeds/ })).toBeTruthy()
    })
    // Typing does not refetch. The index is the same bytes for every keystroke and
    // the ranking runs over the copy already in memory.
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('narrows on every token rather than widening on any of them', async () => {
    const user = userEvent.setup()
    render(withEveryControl())

    await user.click(screen.getByRole('button', { name: COPY.search }))
    const field = await screen.findByRole('textbox', { name: COPY.search })

    // One token finds the page it is in.
    await user.type(field, 'market')
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /The data platform/ })).toBeTruthy()
    })

    // Two tokens, one in each entry, find neither. With OR this would list both
    // pages, and on a documentation site a query matching either of two common
    // words matches most of it, so the list stops being a ranking and becomes a
    // filter the reader has to work through themselves.
    await user.clear(field)
    await user.type(field, 'market option')
    await waitFor(() => {
      expect(screen.getByText(COPY.empty)).toBeTruthy()
    })
    expect(screen.queryByRole('link', { name: /The data platform/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /A note on feeds/ })).toBeNull()
  })

  it('ranks a title above a body, because a page name is the claim it makes', async () => {
    const user = userEvent.setup()
    render(withEveryControl())

    await user.click(screen.getByRole('button', { name: COPY.search }))
    const field = await screen.findByRole('textbox', { name: COPY.search })
    await user.type(field, 'data')

    await waitFor(() => {
      // "data" is in one title and in neither body, so it is first for the reason
      // the weights say it is first rather than for the order the index was built.
      const titles = [...document.querySelectorAll('[role="dialog"] li span:first-child')].map(
        (node) => node.textContent,
      )
      expect(titles[0]).toContain('The data platform')
    })
  })

  it('says so when the index cannot be loaded, and stays dismissable', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    render(withEveryControl())

    await user.click(screen.getByRole('button', { name: COPY.search }))
    const field = await screen.findByRole('textbox', { name: COPY.search })
    await user.type(field, 'anything')

    expect(await screen.findByText(COPY.failed)).toBeTruthy()
    // The close control is the reader's way out, and it survives a failed fetch.
    expect(screen.getByRole('button', { name: COPY.close })).toBeTruthy()
  })
})
