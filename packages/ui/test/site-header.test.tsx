import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteHeader } from '../src/blocks/site-header'

/**
 * The header is the one region of a product site that is never product-specific,
 * which is why the brand lockup is rendered here rather than taken as a slot.
 * The claims under test are therefore: the mark is the same `ProductMark`
 * everywhere, the switcher appears only when there is a set to switch between,
 * and nothing in the bar is a word the Block chose.
 */
const PRODUCT = { id: 'nexus', name: 'Nexus', pack: 'lavender' as const }
const SET = [
  { id: 'nexus', name: 'Nexus', pack: 'lavender' as const, href: 'https://nexus.nanisoft.com' },
  { id: 'atlas', name: 'Atlas', pack: 'mint' as const, href: 'https://atlas.nanisoft.com' },
]

describe('the header of a product site', () => {
  it('draws the brand lockup with ProductMark rather than taking a slot', () => {
    const { container } = render(<SiteHeader product={PRODUCT} navLabel="Site" />)

    const mark = container.querySelector('[data-slot="product-mark"]')!
    expect(mark).toHaveAttribute('data-pack', 'lavender')
    expect(screen.getByRole('link', { name: /Nexus/ })).toHaveAttribute('href', '/')
  })

  it('is one header with the mark, the navigation and the actions in it', () => {
    const { container } = render(
      <SiteHeader
        product={PRODUCT} navLabel="Site"
        products={SET}
        productsLabel="Products"
        nav={[
          { label: 'Docs', href: '/docs' },
          { label: 'About', href: '/about', current: true },
        ]}
        actions={<button type="button">Sign in</button>}
      />,
    )

    expect(container.querySelectorAll('header')).toHaveLength(1)
    // Two regions, not one region with two lists in it: a reader who navigates by
    // landmark can reach the switcher and the site nav separately.
    expect(screen.getByRole('navigation', { name: 'Products' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Site' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy()
  })

  it('marks the current page with aria-current rather than with a colour', () => {
    render(<SiteHeader product={PRODUCT} navLabel="Site" nav={[{ label: 'About', href: '/about', current: true }]} />)
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
  })

  it('omits the switcher when there is no set to switch between', () => {
    render(<SiteHeader product={PRODUCT} navLabel="Site" />)
    expect(screen.queryByRole('navigation', { name: 'Products' })).toBeNull()
  })

  it('ships no site name, no default navigation and no sign-in', () => {
    const { container } = render(<SiteHeader product={PRODUCT} navLabel="Site" />)
    expect(container.textContent).toBe('Nexus')
  })
})
