import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProductGrid01 } from '../src/blocks/product-grid-01'

/**
 * The contested shape this Block ships is the mark: two parts, because a filled
 * dot fails contrast on a light card. The test reads the classes rather than the
 * pixels, and reads them against the two rules that are not obvious - a pastel is
 * a fill and never text, and a name that must read as the brand reads
 * `brand-ink` - so a hand-written mark that gets either wrong is a failing line
 * rather than a comment.
 */
const PRODUCTS = [
  {
    id: 'nexus',
    name: 'Nexus',
    pack: 'lavender' as const,
    tagline: 'The agent factory.',
    href: 'https://nexus.nanisoft.com',
  },
  { id: 'www', name: 'NaniSoft', tagline: 'The company.', href: 'https://nanisoft.com' },
]

describe('a set of products as rows', () => {
  it('draws every product with ProductMark, ring in the brand ink and core in its pack', () => {
    const { container } = render(<ProductGrid01 products={PRODUCTS} title="Built on" />)

    const marks = container.querySelectorAll('[data-slot="product-mark"]')
    expect(marks).toHaveLength(2)

    const disc = container.querySelector('[data-slot="product-mark-disc"]')!
    expect(disc.className).toContain('border-brand-ink')
    expect(disc.className).toContain('bg-primary')
    expect(disc).toHaveAttribute('data-product', 'nexus')
    // The two-part mark is two elements: a shape and a word, so the shape never
    // becomes a second reading of the name.
    expect(disc).toHaveAttribute('aria-hidden', 'true')
  })

  it('carries the pack as a boundary on the mark, so a scoped pack restyles it', () => {
    const { container } = render(<ProductGrid01 products={PRODUCTS} />)
    expect(container.querySelector('[data-slot="product-mark"]')).toHaveAttribute(
      'data-pack',
      'lavender',
    )
  })

  it('makes the whole row a native anchor, so the browser can show the destination', () => {
    render(<ProductGrid01 products={PRODUCTS} />)

    const link = screen.getByRole('link', { name: /Nexus/ })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://nexus.nanisoft.com')
    expect(link).not.toHaveAttribute('target')
  })

  it('opens a new tab only when the caller declares it', () => {
    render(
      <ProductGrid01
        products={[{ ...PRODUCTS[0]!, href: 'https://example.com', newTab: true }]}
      />,
    )

    const link = screen.getByRole('link', { name: /Nexus/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('ships no product, no tagline and no default heading', () => {
    const { container } = render(<ProductGrid01 products={[]} />)
    expect(container.querySelector('[data-slot="product-grid"]')).toBeNull()
  })
})
