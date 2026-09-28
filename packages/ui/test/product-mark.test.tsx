import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProductMark } from '../src/components/ui/product-mark'
import { PACKS } from '../src/theming'

/**
 * A product's mark is the one place two Products, a row and a switcher, all
 * need the same two colours, and it used to be two hand-written copies.
 *
 * The claim being held here is that the two colours are both tokens and that
 * they are the two DESIGN.md names, not the two that look right: `primary` for
 * the core, because a pastel brand value is a fill and never text, and
 * `brand-ink` for the ring and for the name, because `foreground` has almost no
 * chroma by design and `primary-foreground` measures near 1:1 on a dark page.
 * A hand-written copy gets one of those wrong and nothing in the rendered
 * result says which, so the test reads the classes rather than the pixels, and
 * reads them against the emitted contract so a token rename is a change in the
 * token package and not a change in this file.
 */

const REPO = path.resolve(import.meta.dirname, '..', '..', '..')
const UI = path.join(REPO, 'packages', 'ui')

function contract(): Set<string> {
  const names = new Set<string>()
  for (const mode of ['light', 'dark']) {
    const css = readFileSync(path.join(REPO, 'packages', 'tokens', 'dist', `${mode}.css`), 'utf8')
    for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):/gm)) names.add(match[1].slice(2))
  }
  return names
}

/** One custom property as one pack's emitted block declares it, in one mode. */
function emitted(pack: string, mode: string, property: string): string | null {
  const css = readFileSync(
    path.join(REPO, 'packages', 'tokens', 'dist', 'themes', pack, `${mode}.css`),
    'utf8',
  )
  return new RegExp(`^\\s*${property}:\\s*([^;]+);`, 'm').exec(css)?.[1].trim() ?? null
}

const disc = (container: HTMLElement) => container.querySelector('[data-slot="product-mark-disc"]')!
const root = (container: HTMLElement) => container.querySelector('[data-slot="product-mark"]')!

describe('a product mark is two parts, both from a token', () => {
  it('rings the core in the brand ink and fills the core with the pack', () => {
    const { container } = render(<ProductMark id="nexus" name="Nexus" pack="lavender" />)

    const classes = disc(container).className
    expect(classes).toContain('border-brand-ink')
    expect(classes).toContain('bg-primary')
  })

  it('sets the name in the brand ink, not in foreground and not in primary', () => {
    // The Brand Ink Rule, with the two wrong answers named so a regression to
    // either of them is a failing line rather than a comment.
    const { container } = render(<ProductMark id="nexus" name="Nexus" pack="lavender" />)

    const name = container.querySelector('[data-slot="product-mark-name"]')!
    expect(name.className).toContain('text-brand-ink')
    expect(name.className).not.toMatch(/(?:^|\s)text-foreground(?:\s|$)/)
    expect(name.className).not.toMatch(/(?:^|\s)text-primary(?:\s|$)/)
  })

  it('names a published contract role for every paint class it applies', () => {
    const published = contract()
    expect(published.size).toBeGreaterThan(0)

    // The two things a paint prefix can carry that are not a colour, and both are
    // declared with a reason in the gate's EXCLUSIONS list rather than waved
    // through here. Spelling them again in the test would be a second list to
    // drift; the gate's list is the one that is argued with.
    const NOT_A_COLOUR = new Set(['none', 'xs', 'sm', 'base'])

    const { container } = render(<ProductMark id="nexus" name="Nexus" pack="lavender" />)
    const paints = [root(container), disc(container), ...container.querySelectorAll('span')].flatMap(
      (element) =>
        [...element.classList].filter((name) =>
          /^(?:fill|stroke|bg|text|border|ring)-/.test(name),
        ),
    )
    expect(paints.length).toBeGreaterThan(0)

    for (const name of paints) {
      const role = name.replace(/^[a-z]+-/, '')
      expect(
        NOT_A_COLOUR.has(role) || published.has(role),
        `"${name}" names no published token`,
      ).toBe(true)
    }
  })

  it('holds no colour of its own anywhere in the module', () => {
    const source = readFileSync(
      path.join(UI, 'src', 'components', 'ui', 'product-mark.tsx'),
      'utf8',
    )
    const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')

    expect(code).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(code).not.toMatch(/\b(?:rgba?|hsla?|hwb|oklch|oklab)\s*\(/)
    for (const match of code.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
      expect(contract().has(match[1].slice(2)), `var(${match[1]}) is not published`).toBe(true)
    }
  })
})

describe('a product with no pack wears the full spectrum', () => {
  it('draws a gradient of the five published series rather than a colourless mark', () => {
    // A colourless dot reads as a product with no identity, which is the one
    // thing this entry is not. The stops are `chart-1` through `chart-5` because
    // they are the only five-way colour set the contract publishes, and
    // `chart-1` starts at the page's own pack hue.
    const { container } = render(<ProductMark id="www" name="NaniSoft" />)

    const classes = disc(container).className
    expect(classes).not.toContain('bg-primary')
    for (const stop of ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']) {
      expect(classes).toContain(`var(--${stop})`)
    }
    // Closed back onto the first stop so the wheel has no seam at 0 degrees.
    expect(classes.match(/var\(--chart-1\)/g)).toHaveLength(2)
  })

  it('treats an explicit null as the same case, and a base pack as a real one', () => {
    // `default` is a pack a product can wear, and it is the absence of a
    // `data-pack` attribute, so it is NOT the spectrum case.
    const { container: none } = render(<ProductMark id="a" name="A" pack={null} />)
    expect(disc(none).className).toContain('conic-gradient')

    const { container: base } = render(<ProductMark id="b" name="B" pack="default" />)
    expect(disc(base).className).toContain('bg-primary')
    expect(root(base)).not.toHaveAttribute('data-pack')
  })
})

describe('a product mark carries its own pack boundary', () => {
  it.each(PACKS.filter((pack) => pack !== 'default'))(
    'scopes itself to %s, so the hue follows the pack passed rather than the page',
    (pack) => {
      const { container } = render(<ProductMark id={pack} name={pack} pack={pack} />)
      expect(root(container)).toHaveAttribute('data-pack', pack)
    },
  )

  it('omits the attribute entirely when there is no pack at all', () => {
    const { container } = render(<ProductMark id="www" name="NaniSoft" />)
    expect(root(container)).not.toHaveAttribute('data-pack')
  })

  it('sits where the pack-boundary law allows: no radius utility on the boundary', () => {
    // The half of the law a consumer implementing only the colour half gets
    // wrong. A boundary re-points `--radius` as well as the palette, and a scale
    // step is computed from it, so the mark's root carries no radius utility and
    // the disc itself is fully rounded.
    const { container } = render(<ProductMark id="nexus" name="Nexus" pack="lavender" />)

    const boundary = root(container)
    for (const name of boundary.classList) {
      expect(name).not.toMatch(/^rounded-(?!full$|none$)/)
    }
    expect(disc(container).className).toContain('rounded-full')
  })
})

describe('a product mark is accessible without a hook, a mode or a provider', () => {
  it('hides the disc and reads the name, so it adds a shape and not a second reading', () => {
    // The disc is decoration beside a word that already says what the product
    // is. It is queried by its slot rather than by `aria-hidden`, because
    // `aria-hidden` is a claim about the accessibility tree and a test that
    // cannot see the tree should not assert on it.
    const { container } = render(<ProductMark id="nexus" name="Nexus" pack="lavender" />)

    expect(disc(container).getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByText('Nexus')).toBeInTheDocument()
  })

  it('addresses one mark by its own product id, so two in a document are separate', () => {
    const { container } = render(
      <>
        <ProductMark id="nexus" name="Nexus" pack="lavender" />
        <ProductMark id="atlas" name="Atlas" pack="mint" />
      </>,
    )

    expect(container.querySelector('[data-product="nexus"]')).not.toBeNull()
    expect(container.querySelector('[data-product="atlas"]')).not.toBeNull()
  })

  it('gives two products two different pairs of colours, which is what makes them unique', () => {
    // The mechanism is the boundary, not the class string, and this is the test
    // that says so. Two packs share the class list exactly, because the class is
    // `bg-primary` and `primary` is a name; what differs is the value that name
    // resolves to under each product's own `data-pack`. jsdom resolves no
    // custom properties, so uniqueness is asserted where it is actually decided:
    // the boundary differs, and the emitted token output says the two resolve to
    // different values in both modes.
    const { container } = render(
      <>
        <ProductMark id="nexus" name="Nexus" pack="lavender" />
        <ProductMark id="atlas" name="Atlas" pack="mint" />
        <ProductMark id="www" name="NaniSoft" />
      </>,
    )

    const marks = [...container.querySelectorAll('[data-slot="product-mark"]')]
    expect(marks.map((mark) => mark.getAttribute('data-pack'))).toEqual([
      'lavender',
      'mint',
      null,
    ])

    for (const mode of ['light', 'dark']) {
      const values = new Set(['lavender', 'mint'].map((pack) => emitted(pack, mode, '--primary')))
      expect(values.size, `lavender and mint resolve to one --primary in ${mode}`).toBe(2)
    }

    // And the third is not the empty case: the spectrum is its own ink, and a
    // colourless disc would be a fourth pair equal to nothing.
    const discs = [...container.querySelectorAll('[data-slot="product-mark-disc"]')]
    expect(discs[2].className).toContain('conic-gradient')
  })

  it('ships no client code, so a consumer renders it from a server file', () => {
    const emitted = readFileSync(
      path.join(UI, 'dist', 'components', 'ui', 'product-mark.js'),
      'utf8',
    )
    expect(/^['"]use client['"]/m.test(emitted)).toBe(false)
  })

  it('draws all three sizes, and a size changes the mark and the name together', () => {
    for (const [size, mark, name] of [
      ['sm', 'size-4', 'text-xs'],
      ['md', 'size-5', 'text-sm'],
      ['lg', 'size-6', 'text-base'],
    ] as const) {
      const { container, unmount } = render(
        <ProductMark id="nexus" name="Nexus" pack="lavender" size={size} />,
      )
      expect(disc(container).className).toContain(mark)
      expect(container.querySelector('[data-slot="product-mark-name"]')!.className).toContain(name)
      unmount()
    }
  })
})
