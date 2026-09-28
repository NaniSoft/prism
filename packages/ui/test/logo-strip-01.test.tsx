import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LogoStrip01 } from '../src/blocks/logo-strip-01'

/**
 * The claim under test is the one the four sites each answered differently: the
 * strip is a list. A strip whose items are spans in a `div` is announced as one
 * run of text with no count, and a reader deciding whether to keep listening has
 * nothing to weigh.
 *
 * The second claim is that the strip does not move. Motion in this system is
 * state feedback only, so the test reads the source rather than the pixels: a
 * keyframe or a transition on the strip would be a rule no gate catches today.
 */
const SOURCE = readFileSync(
  path.join(import.meta.dirname, '..', 'src', 'blocks', 'logo-strip-01', 'logo-strip.tsx'),
  'utf8',
)

describe('a line of short items', () => {
  it('is a list, so a reader is told how many items there are', () => {
    const { container } = render(
      <LogoStrip01 items={['Fyers v3', 'yfinance', 'nselib']} label="Data sources" />,
    )

    const strip = container.querySelector('[data-slot="logo-strip"]')!
    expect(strip.tagName).toBe('UL')
    expect(strip).toHaveAttribute('aria-label', 'Data sources')
    expect(container.querySelectorAll('[data-slot="logo-strip-item"]')).toHaveLength(3)
    expect(screen.getByRole('list', { name: 'Data sources' })).toBeTruthy()
  })

  it('renders nothing for an empty set rather than an empty band', () => {
    const { container } = render(<LogoStrip01 items={[]} label="Data sources" />)
    expect(container.firstChild).toBeNull()
  })

  it('has no keyframe and no entrance animation, because motion is state feedback', () => {
    // A sliding ticker is the thing every one of the four sites wanted and none
    // of them should have: this system has no entrance or scroll animation.
    expect(SOURCE).not.toMatch(/@keyframes|animate-|duration-\[|translate-x-/)
    expect(SOURCE).not.toMatch(/transition-transform/)
  })

  it('ships no item of its own', () => {
    expect(SOURCE).not.toMatch(/Fyers|React|Postgres|Next\.js/)
  })
})
