import { render, screen } from '@testing-library/react'
import { Check } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { SectionHeading } from '../src/components/ui/section'
import { Cta01 } from '../src/blocks/cta-01'
import { FeatureGrid01, type IconFeature } from '../src/blocks/feature-grid-01'
import { Hero01 } from '../src/blocks/hero-01'

/**
 * The five additive fields, and the rule that put each of them on the roster.
 *
 * A field on a shipped item earns its place when three of the four consumers pass
 * a value the item cannot take today, counted per consumer with a file and a
 * line. The counts are in the changeset and in the ticket; what is asserted here
 * is the part a count cannot: that the field renders, that it renders nothing when
 * it is absent, and that the item did not have to change shape to take it.
 *
 * The names are on the list because a published name is final, so a test that
 * pinned them here is a test that fails if one of them is renamed rather than a
 * test that follows a rename.
 */
describe('the five additive fields', () => {
  it('SectionHeading.index renders a mono ordinal above the title, and nothing when absent', () => {
    const { container, rerender } = render(<SectionHeading index="01" title="The loop" />)

    const index = container.querySelector('.font-mono')
    expect(index?.textContent).toBe('01')
    // The ordinal is machine notation, so it is not the eyebrow and it does not
    // take the eyebrow's uppercase label treatment.
    expect(index?.className).not.toContain('uppercase')

    rerender(<SectionHeading title="The loop" />)
    expect(container.querySelector('.font-mono')).toBeNull()
  })

  it('SectionHeading.index is independent of the eyebrow, so the two can both be there', () => {
    render(<SectionHeading index="02" eyebrow="Approved" title="The feed" />)
    expect(screen.getByText('02')).toBeTruthy()
    expect(screen.getByText('Approved')).toBeTruthy()
  })

  it('Cta01 renders a second action at outline weight beside the closing ask', () => {
    render(
      <Cta01
        title="Ready?"
        action={{ label: 'Get started', href: '/start' }}
        secondaryAction={{ label: 'Read the docs', href: '/docs' }}
      />,
    )

    const closing = screen.getByRole('link', { name: /Get started/ })
    const second = screen.getByRole('link', { name: 'Read the docs' })
    expect(second).toHaveAttribute('href', '/docs')
    // The two are not the same weight: two equal-weight actions are a menu where
    // the page wanted a decision.
    expect(second.className).toContain('border')
    expect(closing.className).not.toBe(second.className)
  })

  it('Cta01 renders a second action only when given one', () => {
    render(<Cta01 title="Ready?" action={{ label: 'Get started', href: '/start' }} />)
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('Cta01 renders the note under the actions, and nothing without one', () => {
    const { container, rerender } = render(
      <Cta01 title="Ready?" note="In active development." action={{ label: 'Watch', href: '/w' }} />,
    )
    expect(container.textContent).toContain('In active development.')

    rerender(<Cta01 title="Ready?" action={{ label: 'Watch', href: '/w' }} />)
    expect(container.textContent).not.toContain('In active development.')
  })

  it('FeatureGrid01 numbers the cards from their position when asked, and only then', () => {
    const features: IconFeature[] = [
      { title: 'One', body: 'A.', icon: Check },
      { title: 'Two', body: 'B.', icon: Check },
    ]

    const { container, rerender } = render(<FeatureGrid01 features={features} numbered />)
    const ordinals = [...container.querySelectorAll('.font-mono')].map((n) => n.textContent)
    expect(ordinals).toEqual(['01', '02'])

    rerender(<FeatureGrid01 features={features} />)
    expect(container.querySelector('.font-mono')).toBeNull()
  })

  it('Hero01 takes an alignment of its own, and centers by default', () => {
    const { container, rerender } = render(<Hero01 title="Ship faster" />)
    expect(container.querySelector('[data-slot="hero-01-copy"]')?.className).toContain('items-center')

    rerender(<Hero01 title="Ship faster" align="left" />)
    const copy = container.querySelector('[data-slot="hero-01-copy"]')
    expect(copy?.className).toContain('items-start')
    expect(copy?.className).toContain('text-left')
  })

  it('Hero01 passes its alignment down to its own heading rather than restating it', () => {
    const { container } = render(<Hero01 title="Ship faster" align="left" />)
    // One alignment, set once: the heading reads the hero's decision instead of
    // keeping a second copy of it.
    expect(container.querySelector('[data-slot="hero-01-copy"]')?.className).not.toContain(
      'text-center',
    )
  })
})
