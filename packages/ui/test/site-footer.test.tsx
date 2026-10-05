import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteFooter } from '../src/blocks/site-footer'

import { fontFaceMetrics, fontSizePx, lengthPx, lineBoxPx, ownValue } from './sheet-reader'

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

/**
 * The target-size floor, measured.
 *
 * **The measurement, and why it is this shape.** jsdom resolves no cascade and
 * lays nothing out, so every number below is read out of `dist/styles.css` and the
 * root declarations inside it, the way `diagram.test.tsx` reads the sizes it
 * asserts. Nothing here is a class string: the link is rendered, the floor is
 * resolved off it through the cascade, and the answer is in pixels.
 *
 * **Two shapes a link can have, and the difference is the whole defect.** An
 * inline box has no box. What a pointer aims at on one is the font's content area,
 * which is the resolved size times the face's own ascent and descent, and this
 * package publishes those numbers itself: the `Inter Fallback` face exists so that
 * the fallback occupies Inter's own line box, so its `ascent-override`,
 * `descent-override` and `size-adjust` are this system's own statement of how tall
 * a line of this face is. A block-level anchor is the other shape, and its border
 * box is its height, which is the larger of its own content and its `min-height`.
 *
 * Twenty-four is WCAG 2.2 SC 2.5.8, and it is the one number here that is not read
 * out of the sheet, because it is the criterion rather than a decision this
 * repository took. Everything the Block does about it is read.
 */
const TARGET_MINIMUM_PX = 24

/** The height of the box a pointer aims at on `link`, in pixels, at `widthPx`. */
function targetHeightPx(link: Element, widthPx: number): number {
  const display = ownValue(link, 'display', widthPx) || 'inline'
  if (display === 'inline' || display === 'contents') {
    const face = fontFaceMetrics('Inter Fallback')
    const share = (property: string) => Number(/([\d.]+)%/.exec(face.get(property) ?? '')?.[1]) / 100
    const ascent = share('ascent-override')
    const descent = share('descent-override') + share('line-gap-override')
    const adjust = share('size-adjust')
    expect(ascent, 'the shipped sheet declares no ascent for the fallback face').toBeGreaterThan(0)
    return fontSizePx(link, widthPx) * (ascent + descent) * adjust
  }
  const floor = lengthPx(ownValue(link, 'min-height', widthPx))
  return Math.max(floor ?? 0, lineBoxPx(link, widthPx))
}

describe('every destination the footer offers is a target a reader can hit', () => {
  const linksOf = (container: HTMLElement) => [...container.querySelectorAll('a')]

  it('gives a column link and a social link a box at least the minimum, at both widths', () => {
    const { container } = render(
      <SiteFooter
        product={PRODUCT}
        columns={COLUMNS}
        social={[{ label: 'GitHub', href: 'https://github.com/NaniSoft/nexus' }]}
      />,
    )

    const links = linksOf(container)
    expect(links.length).toBe(3)
    // Every offender in one failure rather than the first of them, because the two
    // shapes fail for different reasons and a reader of the output needs both
    // numbers: an inline anchor offers its font's content area and an atomic inline
    // box offers its line box, and neither is the box a criterion can measure.
    const undersized = links.flatMap((link) =>
      [1440, 390]
        .map((width) => ({ text: link.textContent ?? '', width, height: targetHeightPx(link, width) }))
        .filter((measured) => measured.height < TARGET_MINIMUM_PX)
        .map(
          (measured) =>
            `"${measured.text}" offers ${measured.height.toFixed(2)}px at ${measured.width}`,
        ),
    )
    expect(undersized).toEqual([])
  })

  it('pays the floor on the box rather than on the type, so the link looks the same', () => {
    // The two halves of "without changing the visual weight of the link". The size
    // is still `text-sm` in both places and the weight is still medium, and the
    // thing that grew is the box around them.
    const { container } = render(
      <SiteFooter
        product={PRODUCT}
        columns={COLUMNS}
        social={[{ label: 'GitHub', href: 'https://github.com/NaniSoft/nexus' }]}
      />,
    )

    for (const link of linksOf(container)) {
      expect(fontSizePx(link, 1440)).toBe(lengthPx('var(--text-sm)'))
      const isSocial = link.closest('ul')?.className.includes('flex-wrap') ?? false
      expect(ownValue(link, 'display', 1440)).toBe('flex')
      expect(lengthPx(ownValue(link, 'min-height', 1440))).toBeGreaterThanOrEqual(
        TARGET_MINIMUM_PX,
      )
      if (isSocial) expect(link.className).toContain('font-medium')
    }
  })

  it('spends the floor out of the spacing scale rather than out of a number', () => {
    // The floor is `--spacing-6`, which is arithmetic on the authored spacing
    // multiplier the way every `size-*` and `h-*` in this package is, so a retune
    // of the scale moves it and a component could not have pinned it.
    const { container } = render(<SiteFooter product={PRODUCT} columns={COLUMNS} />)
    const floor = lengthPx(ownValue(container.querySelector('a')!, 'min-height', 1440))
    expect(floor).toBe(lengthPx('var(--spacing-6)'))
  })

  it('changes no row height, because the row was already a full line box', () => {
    // The footer's own vertical rhythm is what four consumer pages are composed
    // against, so the floor is asserted to be free. A column link sat in a line
    // box built from the footer's inherited sixteen-pixel body, so the row was
    // already twenty-four pixels tall and the row is the same twenty-four after.
    const { container } = render(<SiteFooter product={PRODUCT} columns={COLUMNS} />)
    const link = container.querySelector('a')!

    expect(lineBoxPx(link.parentElement!, 1440)).toBeGreaterThanOrEqual(TARGET_MINIMUM_PX)
    expect(targetHeightPx(link, 1440)).toBe(targetHeightPx(link, 390))
  })
})
