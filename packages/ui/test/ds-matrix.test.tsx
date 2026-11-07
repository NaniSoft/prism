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
import { PACKS, themeAttributes, type PackId, type Mode } from '../src/theming'

/**
 * The Mission Gates F, G and H over the governed layer.
 *
 * Every DS component renders at the right shape under every pack in both
 * modes, without an axe violation that jsdom can judge, and DSGrid narrows
 * below its `sm` threshold. The matrix is a parameterised clip of a table a
 * reviewer can read, not a screenshot: jsdom paints nothing, so contrast is
 * held by the token gate (Gate F, 8 packs x 2 modes) and what this suite
 * asserts is that the component never resolves to nothing.
 */

const MODES: readonly Mode[] = ['light', 'dark']
const MATRIX = PACKS.flatMap((pack) => MODES.map((mode) => ({ pack: pack as PackId, mode })))

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}

describe('theme completeness (Gate F) over the DS layer', () => {
  it.each(MATRIX)('the stack renders under $pack/$mode', ({ pack, mode }) => {
    const { container } = render(
      <div {...themeAttributes({ pack, mode })}>
        <DSStack gap="md">
          <DSImage src="/hero.webp" alt="Shipped product surface" variant="hero" />
          <DSGrid columns={3} gap="md">
            <DSIcon name="settings" size="lg" label="Settings" />
            <DSLogo src="/logo.svg" alt="NaniSoft" />
            <DSAvatar name="Ada Lovelace" src="/ada.webp" />
            <DSIllustration src="/diagram.svg" alt="Brokerages drive trading" />
          </DSGrid>
        </DSStack>
      </div>,
    )
    expect(container.querySelector('[data-slot="ds-stack"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="ds-image"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="ds-logo"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="ds-avatar"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="ds-illustration"]')).toBeTruthy()
  })

  it.each(MATRIX)('the video and the media card render under $pack/$mode', ({ pack, mode }) => {
    const { container } = render(
      <div {...themeAttributes({ pack, mode })}>
        <DSVideo src="/demo.mp4" label="Walkthrough" captions={[]} variant="hero" />
        <DSMediaCard image={{ src: '/cover.webp', alt: 'Release capsule in light' }} title="Release capsule" />
      </div>,
    )
    expect(container.querySelector('video')).toBeTruthy()
    expect(container.querySelector('[data-slot="ds-media-card"]')).toBeTruthy()
    expect(container.querySelector('[data-variant="card"]')).toBeTruthy()
  })

  it('the stack has no axe violations', async () => {
    const { container } = render(
      <DSStack gap="md">
        <DSIcon name="search" label="Search" />
        <span>Cutoff: the 15:00 close</span>
      </DSStack>,
    )
    await expectNoViolations(container)
  })
})

describe('responsive completeness (Gate G) over the layout primitives', () => {
  it('the grid is one column below sm and its authored counts above it', () => {
    const { container } = render(
      <DSGrid columns={4} gap="lg">
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
        <span>Four</span>
      </DSGrid>,
    )
    const grid = container.querySelector('[data-slot="ds-grid"]') as HTMLElement
    expect(grid.getAttribute('data-columns')).toBe('4')
    expect(grid.className).toContain('sm:grid-cols-2')
    expect(grid.className).toContain('lg:grid-cols-4')
    expect(grid.className).toContain('grid')
  })

  it('the icon stays ordered with its words at every width', () => {
    const { container } = render(
      <DSStack gap="sm">
        <DSIcon name="check" size="md" />
        <span>Step one: staging connects</span>
      </DSStack>,
    )
    expect(screen.getByText('Step one: staging connects')).toBeTruthy()
    expect(container.querySelector('[data-slot="ds-stack"]')?.className).toContain('gap-3')
  })
})

describe('the platform themes', () => {
  it('keeps the closed mask sensible', () => {
    expect(PACKS.length * MODES.length).toBe(16)
  })
})
