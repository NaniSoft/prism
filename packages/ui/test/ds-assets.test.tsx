import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { DSImage } from '../src/components/ui/ds-image'
import { DSIcon } from '../src/components/ui/ds-icon'
import { DSLogo } from '../src/components/ui/ds-logo'
import { DSAvatar } from '../src/components/ui/ds-avatar'
import { DSIllustration } from '../src/components/ui/ds-illustration'
import { DSVideo } from '../src/components/ui/ds-video'
import { DSMediaCard } from '../src/components/ui/ds-media-card'
import { DSStack } from '../src/components/ui/ds-stack'
import { DSGrid } from '../src/components/ui/ds-grid'
import { minimumSourcePx, validateRasterSize } from '../src/assets'

/**
 * The governed media layer the Mission asks for: presentations, registry and
 * layout primitives that keep a consumer from writing a stylesheet.
 *
 * The claims under test are the ones a screenshot cannot check: a ratio that
 * resolves to a token class the build actually emits, a name that refuses an
 * unknown glyph rather than rendering nothing, an initial that survives a
 * missing picture, and a video that keeps the platform controls. Axe runs
 * without color-contrast (jsdom paints nothing), which is the same half the
 * shared a11y suite states.
 */

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}

describe('the DSImage', () => {
  it('presents a hero at the hero ratio with cover', () => {
    const { container } = render(<DSImage src="/hero.webp" alt="Shipped product surface" variant="hero" />)
    const frame = container.querySelector('[data-slot="ds-image"]')
    expect(frame?.getAttribute('data-variant')).toBe('hero')
    expect(frame?.className).toContain('aspect-hero')
    const img = container.querySelector('[data-slot="ds-image-element"]')
    expect(img?.className).toContain('object-cover')
    expect(img?.getAttribute('alt')).toBe('Shipped product surface')
    expect(img?.getAttribute('loading')).toBe('lazy')
  })

  it('pairs a srcSet with the variant sizes', () => {
    const { container } = render(
      <DSImage src="/card.webp" alt="Card" srcSet="/card.webp 1x, /card@2x.webp 2x" variant="card" />,
    )
    expect(container.querySelector('[data-slot="ds-image-element"]')?.getAttribute('sizes')).toContain('800px')
  })

  it('has no axe violations', async () => {
    const { container } = render(<DSImage src="/card.webp" alt="Release capsule in light" variant="card" />)
    await expectNoViolations(container)
  })
})

describe('the DSIcon', () => {
  it('draws the named glyph at the named size', () => {
    const { container } = render(<DSIcon name="settings" size="lg" />)
    const svg = container.firstElementChild
    expect(svg?.getAttribute('data-icon')).toBe('settings')
    expect(svg?.getAttribute('class') ?? '').toContain('size-6')
  })

  it('is decorative without a label and named with one', () => {
    const decorative = render(<DSIcon name="search" />)
    expect(decorative.container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    const named = render(<DSIcon name="search" label="Search this site" />)
    expect(named.container.querySelector('svg')?.getAttribute('role')).toBe('img')
    expect(named.container.querySelector('svg')?.getAttribute('aria-label')).toBe('Search this site')
  })

  it('refuses a name outside the registry', () => {
    expect(() => render(<DSIcon name="not-a-glyph" />)).toThrow(/not in the registry/)
  })

  it('has no axe violations', async () => {
    const { container } = render(<DSIcon name="check" label="Done" />)
    await expectNoViolations(container)
  })
})

describe('the DSLogo', () => {
  it('contains the lockup at a governed height', () => {
    const { container } = render(<DSLogo src="/logo.svg" alt="NaniSoft" />)
    const img = container.querySelector('[data-slot="ds-logo"]')
    expect(img?.className).toContain('h-8')
    expect(img?.className).toContain('object-contain')
  })
})

describe('the DSAvatar', () => {
  it('derives initials from the name and holds the governed size', () => {
    const { container } = render(<DSAvatar name="Ada Lovelace" size="lg" />)
    expect(container.querySelector('[data-slot="ds-avatar"]')?.className).toContain('size-16')
    expect(container.querySelector('[data-slot="avatar-fallback"]')?.textContent).toBe('AL')
  })

  it('holds the image alt on the fallback path', () => {
    // Base UI holds the image until it reports loaded, and jsdom loads nothing,
    // so the fallback is what the DOM carries here. The alt is on the same
    // element a browser draws once loaded.
    const { container } = render(<DSAvatar name="Ada Lovelace" src="/ada.webp" />)
    expect(container.querySelector('[data-slot="ds-avatar"]')?.getAttribute('data-avatar-size')).toBe('md')
    expect(container.querySelector('[data-slot="avatar-fallback"]')?.textContent).toBe('AL')
  })

  it('marks an undersized source without failing the render', () => {
    const { container } = render(<DSAvatar name="Ada Lovelace" src="/ada.webp" width={64} height={64} />)
    expect(container.querySelector('[data-slot="ds-avatar"]')?.getAttribute('data-resolution-warning')).toContain('under the avatar target')
  })

  it('has no axe violations', async () => {
    const { container } = render(<DSAvatar name="Ada Lovelace" src="/ada.webp" />)
    await expectNoViolations(container)
  })
})

describe('the DSIllustration', () => {
  it('contains the figure at its own proportions', () => {
    const { container } = render(<DSIllustration src="/diagram.svg" alt="Brokerages drive trading" />)
    expect(container.querySelector('[data-slot="ds-illustration"]')?.className).toContain('object-contain')
  })
})

describe('the DSVideo', () => {
  it('plays with the platform controls and the required captions', () => {
    render(
      <DSVideo
        src="/demo.mp4"
        label="Agent run walkthrough"
        captions={[{ src: '/en.vtt', srcLang: 'en', label: 'English', kind: 'captions' }]}
        variant="hero"
      />,
    )
    expect(screen.getByLabelText('Agent run walkthrough').tagName).toBe('VIDEO')
    expect(document.querySelector('track[label="English"]')).toBeTruthy()
  })

  it('holds the square presentation ratio', () => {
    const { container } = render(
      <DSVideo
        src="/demo.mp4"
        label="Square loop"
        captions={[]}
        variant="square-thumb"
      />,
    )
    expect(container.querySelector('[data-slot="aspect-ratio"]')?.getAttribute('data-ratio')).toBe('1')
  })
})

describe('the DSMediaCard', () => {
  it('composes a governed image with the caller words', async () => {
    const { container } = render(
      <DSMediaCard
        image={{ src: '/cover.webp', alt: 'Release capsule in light' }}
        title="Release capsule"
        description="A product update"
        footer={<button type="button">Read the note</button>}
      />,
    )
    expect(container.querySelector('[data-variant="card"]')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Read the note' })).toBeTruthy()
    await expectNoViolations(container)
  })
})

describe('the layout primitives', () => {
  it('stacks with a governed gap', () => {
    const { container } = render(
      <DSStack gap="lg">
        <span>First</span>
        <span>Second</span>
      </DSStack>,
    )
    expect(container.querySelector('[data-slot="ds-stack"]')?.className).toContain('gap-8')
  })

  it('grids with governed tracks and narrows below sm', () => {
    const { container } = render(
      <DSGrid columns={3}>
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
      </DSGrid>,
    )
    const grid = container.querySelector('[data-slot="ds-grid"]')
    expect(grid?.getAttribute('data-columns')).toBe('3')
    expect(grid?.className).toContain('sm:grid-cols-2')
    expect(grid?.className).toContain('lg:grid-cols-3')
  })
})

describe('the resolution arithmetic', () => {
  it('doubles on both axes', () => {
    expect(minimumSourcePx(400, 225, 2)).toEqual({ widthPx: 800, heightPx: 450 })
  })

  it('refuses a raster under the avatar target', () => {
    expect(validateRasterSize(64, 64, 'avatar')).toContain('under the avatar target')
    expect(validateRasterSize(256, 256, 'avatar')).toBeNull()
    expect(validateRasterSize(null, null, 'avatar')).toContain('unknown')
  })
})
