import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteFooter } from '../src/blocks/site-footer'

/**
 * The claims under test are the ones a footer gets wrong: it is a scannable
 * region and not a place for a paragraph, each column is its own landmark so a
 * reader can reach "Documentation" rather than one anonymous list, and the block
 * ships no copyright, no year and no default column.
 */
const PRODUCT = { id: 'nexus', name: 'Nexus', pack: 'lavender' as const }
const COLUMNS = [
  { title: 'Site', links: [{ label: 'Docs', href: '/docs' }] },
  { title: 'Elsewhere', links: [{ label: 'GitHub', href: 'https://github.com/NaniSoft/nexus' }] },
]

describe('the footer of a product site', () => {
  it('draws the brand lockup with ProductMark at the larger size', () => {
    const { container } = render(<SiteFooter product={PRODUCT} />)
    expect(container.querySelector('[data-slot="product-mark"]')).toHaveAttribute(
      'data-pack',
      'lavender',
    )
    expect(screen.getByText('Nexus')).toBeTruthy()
  })

  it('gives every column its own landmark, named by its own title', () => {
    render(<SiteFooter product={PRODUCT} columns={COLUMNS} />)

    expect(screen.getByRole('navigation', { name: 'Site' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Elsewhere' })).toBeTruthy()
  })

  it('opens a link that leaves the site in a new tab by default, and lets a link opt out', () => {
    const { rerender } = render(
      <SiteFooter
        product={PRODUCT}
        social={[{ label: 'GitHub', href: 'https://github.com/NaniSoft/nexus' }]}
      />,
    )

    const leaving = screen.getByRole('link', { name: 'GitHub' })
    expect(leaving).toHaveAttribute('target', '_blank')
    expect(leaving).toHaveAttribute('rel', 'noopener noreferrer')

    rerender(
      <SiteFooter
        product={PRODUCT}
        social={[{ label: 'GitHub', href: 'https://github.com/NaniSoft/nexus', newTab: false }]}
      />,
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).not.toHaveAttribute('target')
  })

  it('hides a social icon so the label is announced once', () => {
    const { container } = render(
      <SiteFooter
        product={PRODUCT}
        social={[
          { label: 'GitHub', href: 'https://github.com/NaniSoft/nexus', icon: <svg /> },
        ]}
      />,
    )

    const icon = container.querySelector('li span[aria-hidden]')
    expect(icon).toBeTruthy()
    expect(icon?.querySelector('svg')).toBeTruthy()
    expect(screen.getAllByText('GitHub')).toHaveLength(1)
  })

  it('ships no copyright, no year and no default column', () => {
    const { container } = render(<SiteFooter product={PRODUCT} />)
    expect(container.textContent).toBe('Nexus')
    expect(container.textContent).not.toMatch(/\d{4}|©|All rights reserved/)
  })
})
