import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProductSwitcher } from '../src/components/ui/product-switcher'

/**
 * A switcher is the one Component whose whole job is state a reader can perceive
 * without seeing colour, so the claims under test are: the current member is
 * marked `aria-current` rather than styled, the marks come from `ProductMark` so
 * the two-part identity is the same two colours here as everywhere else, and the
 * set is a navigation region with a name a caller can replace.
 */
const SET = [
  { id: 'nexus', name: 'Nexus', pack: 'lavender' as const, href: 'https://nexus.nanisoft.com' },
  { id: 'atlas', name: 'Atlas', pack: 'mint' as const, href: 'https://atlas.nanisoft.com' },
  { id: 'www', name: 'NaniSoft', href: 'https://nanisoft.com' },
]

describe('a switch between products', () => {
  it('marks the current member with aria-current, not with a colour', () => {
    const { container } = render(<ProductSwitcher products={SET} currentId="atlas" />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).not.toHaveAttribute('aria-current')
    expect(links[1]).toHaveAttribute('aria-current', 'page')
    expect(links[1]).toHaveAttribute('data-current', 'true')

    // The marking is the attribute, and there is no class on any member that says
    // "current": the only difference between members is the attribute and the
    // mark's own hue.
    const classes = [...container.querySelectorAll('a')].map((node) => node.className)
    expect(new Set(classes).size).toBe(1)
  })

  it('is a navigation region with a name the caller can replace', () => {
    const { rerender } = render(<ProductSwitcher products={SET} />)
    expect(screen.getByRole('navigation', { name: 'Products' })).toBeTruthy()

    rerender(<ProductSwitcher products={SET} label="Data tools" />)
    expect(screen.getByRole('navigation', { name: 'Data tools' })).toBeTruthy()
  })

  it('draws every member with ProductMark, so the mark is one implementation', () => {
    const { container } = render(<ProductSwitcher products={SET} />)

    const marks = container.querySelectorAll('[data-slot="product-mark"]')
    expect(marks).toHaveLength(3)
    // The one member with no pack wears the spectrum rather than a colourless
    // mark, which is ProductMark's own rule and not a switcher one.
    const discs = [...container.querySelectorAll('[data-slot="product-mark-disc"]')]
    expect(discs[0]?.className).toContain('bg-primary')
    expect(discs[2]?.className).toContain('conic-gradient')
    expect(screen.getByText('NaniSoft')).toBeTruthy()
  })

  it('renders nothing when the set is empty, rather than an empty region', () => {
    const { container } = render(<ProductSwitcher products={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
