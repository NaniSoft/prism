/**
 * An action that names a destination is an anchor, and one that does not is a
 * button. Both arms are asserted by element, and the arrow is asserted against the
 * element rather than the position.
 *
 * **The defect this was written for.** `HeroAction` declared `href?: string` and
 * the Block discarded it for a while, so a hero's primary action rendered as a
 * `<button>` that went nowhere: it read as a link, announced as a button, and
 * navigated nowhere. Ticket 91 fixed that for the CTA path with `CtaLink`; the
 * Block that predated it kept the old shape. The rendering half is fixed, so what
 * is asserted here is the half that was not: that the two arms are told apart in
 * the **type**, and that a first action which is a button does not wear the arrow
 * that says "goes forward".
 *
 * The arrow was keyed to `index === 0` rather than to the element, so an inert
 * button was the one control in the row wearing the mark that says it can be
 * followed. That is the assertion a test asserting only "is it a link" would miss.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero01, type HeroAction } from '../src/blocks/hero-01'

const link = (label: string): HeroAction => ({ label, href: '/start' })
const inert = (label: string): HeroAction => ({ label })

describe('Hero01 actions are the element the caller asked for', () => {
  it('an action with a destination renders an anchor that carries it', () => {
    render(<Hero01 title="Ship it" actions={[link('Start free')]} />)
    const action = screen.getByRole('link', { name: /Start free/ })
    expect(action).toHaveAttribute('href', '/start')
  })

  it('an action without one renders a button, and no anchor at all', () => {
    render(<Hero01 title="Ship it" actions={[inert('Not yet')]} />)
    expect(screen.getByRole('button', { name: /Not yet/ })).toBeInTheDocument()
    // The negative matters: "no anchor" is the half that would pass if the test
    // only counted the control it expected.
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('a row can hold both, and each renders as itself', () => {
    render(<Hero01 title="Ship it" actions={[link('Start free'), inert('Read the docs')]} />)
    expect(screen.getByRole('link', { name: /Start free/ })).toHaveAttribute('href', '/start')
    expect(screen.getByRole('button', { name: /Read the docs/ })).toBeInTheDocument()
  })

  it('honours newTab on the link arm, with the matching rel', () => {
    render(
      <Hero01 title="Ship it" actions={[{ label: 'Docs', href: '/docs', newTab: true }]} />,
    )
    expect(screen.getByRole('link', { name: /Docs/ })).toHaveAttribute('target', '_blank')
  })
})

describe('the arrow follows the element, not the position', () => {
  /**
   * The arrow is an inline SVG with no accessible name, so it is found by the
   * control it sits inside rather than by a role of its own. Counting them is the
   * assertion; the glyph has no text to match on.
   */
  const arrowsIn = (role: 'link' | 'button', name: RegExp) => {
    const control = screen.getByRole(role, { name })
    return control.querySelectorAll('svg').length
  }

  it('the first action gets the arrow when it is a link', () => {
    render(<Hero01 title="Ship it" actions={[link('Start free'), link('Read the docs')]} />)
    // The first control carries the glyph that says it goes somewhere.
    expect(arrowsIn('link', /^Start free/)).toBeGreaterThan(0)
  })

  it('and does not when it is a button, which is the defect the position caused', () => {
    render(<Hero01 title="Ship it" actions={[inert('Not yet'), link('Read the docs')]} />)
    // An inert button wearing a forward arrow is the control that says it can be
    // followed and cannot be. This is the assertion that fails on `index === 0`.
    expect(arrowsIn('button', /^Not yet/)).toBe(0)
  })

  it('a second action gets no arrow even when it is a link', () => {
    render(<Hero01 title="Ship it" actions={[link('Start free'), link('Read the docs')]} />)
    // The arrow marks the row's one primary destination, so only the first action
    // carries it. A second arrow would claim there are two primary destinations.
    expect(arrowsIn('link', /^Read the docs/)).toBe(0)
  })
})

describe('the positional default variant still follows position', () => {
  it('the first action is the filled one and the rest are outlined', () => {
    // The variant is a *visual* default and stays positional, which is a
    // different question from the arrow: what looks primary is about the row's
    // shape, while "this navigates" is about the element. Asserting they do not
    // move together is the point, because the arrow used to.
    const { container } = render(
      <Hero01 title="Ship it" actions={[inert('Not yet'), inert('Also not')]} />,
    )
    const buttons = container.querySelectorAll('button')
    expect(buttons[0]?.className).toContain('bg-primary')
    expect(buttons[1]?.className).not.toContain('bg-primary')
  })
})
