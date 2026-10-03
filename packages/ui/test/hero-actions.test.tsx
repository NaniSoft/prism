/**
 * A hero's action row renders only what can be acted on.
 *
 * **The defect this was written for, and it was a type rather than a render.**
 * `HeroAction` accepted `{ label }` with no destination, and the Block rendered
 * that as a bare `<Button`. Every one of those is a focusable control, announced
 * as a button, that activates to nothing, in the position a reader looks first: a
 * marketing hero's primary call to action, in three published Blocks, so every
 * consumer of any of them shipped a dead button where the most important action
 * should be. The Block's own JSDoc called the button "inert by design" and
 * defended that as a Block shipping no behaviour, which is true and is not an
 * answer: a Block shipping no behaviour cannot render a control that does
 * something, so it should not render a control at all.
 *
 * The type now has two arms and no third. `href` is required on the link arm, and
 * the arm that is not a link carries the caller's own node rather than a `Button`.
 * `hero-action.types.ts` holds the half a render cannot see, which is that the
 * mistake no longer compiles.
 *
 * **Why this file covers all three heroes rather than one.** The three Blocks
 * spell the union again instead of sharing it, and each says why: a shared type
 * would make `blocks/hero-01` a dependency of `blocks/hero-02`. Spelled three
 * times it can drift three times, so all three are asserted here.
 *
 * **What jsdom cannot answer, said once.** There is no CSS engine and no
 * accessibility tree in this lane, so the class-string assertions below hold that
 * a weight was applied rather than that a reader can see it. The role and name
 * queries are the part of the accessibility claim jsdom can hold, and
 * `apps/site/e2e/display.spec.ts` over a real browser is where the rest is
 * checked.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero01, type HeroAction } from '../src/blocks/hero-01'
import { Hero02, type Hero02Action } from '../src/blocks/hero-02'
import { Hero03, type Hero03Action } from '../src/blocks/hero-03'

/**
 * The three render surfaces, named so one assertion body can hold all of them.
 *
 * A factory rather than a shared fixture because the three take different required
 * props, and a fixture carrying three optional ones would read as though the three
 * Blocks took the same shape.
 */
const heroes = [
  {
    name: 'Hero01',
    action: (action: HeroAction) => <Hero01 title="Ship it" actions={[action]} />,
  },
  {
    name: 'Hero02',
    action: (action: Hero02Action) => (
      <Hero02 title="Ship it" figure={<p>the figure</p>} figureLabel="The queue, live" actions={[action]} />
    ),
  },
  {
    name: 'Hero03',
    action: (action: Hero03Action) => (
      <Hero03
        title="Ship it"
        points={[{ title: 'One point', body: 'A sentence about it.' }]}
        proof={[{ label: 'One figure', value: '1' }]}
        actions={[action]}
      />
    ),
  },
] as const

const link = { label: 'Start free', href: '/start' }

describe.each(heroes)('$name actions are the element the caller asked for', ({ action }) => {
  it('an action with a destination renders an anchor that carries it', () => {
    render(action(link))
    expect(screen.getByRole('link', { name: /Start free/ })).toHaveAttribute('href', '/start')
  })

  it('renders no button of its own, because a Block cannot wire one to anything', () => {
    render(action(link))
    // The negative half, and it is the half that matters: a test asserting only
    // the control it expected would pass on the defect this file is about.
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('a caller control renders as itself, announced as itself', () => {
    render(action({ slot: <button type="button">Resume the run</button> }))
    // The Block places the node and adds nothing to it, so what the caller passed
    // is what a reader reaches, named and enabled by the caller's own words.
    expect(screen.getByRole('button', { name: 'Resume the run' })).toBeEnabled()
  })

  it('adds no class to a caller control, because this package has no override path', () => {
    const { container } = render(action({ slot: <button type="button">Resume</button> }))
    const control = screen.getByRole('button', { name: 'Resume' })
    // A class the Block adds to a node it does not render is a style the caller
    // cannot see and cannot remove. The class list is empty because the Block
    // added nothing, and the control still lands in the Block's own column, which
    // is where the row is drawn.
    expect(control.className).toBe('')
    expect(control.closest('[data-slot$="-copy"]')).not.toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })

  it('honours newTab on the link arm, with the matching rel', () => {
    render(action({ label: 'Docs', href: '/docs', newTab: true }))
    const cta = screen.getByRole('link', { name: /Docs/ })
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('Hero01 rows', () => {
  it('holds a link and a caller control in one row, each as itself', () => {
    render(
      <Hero01
        title="Ship it"
        actions={[{ label: 'Start free', href: '/start' }, { slot: <button type="button">Resume</button> }]}
      />,
    )
    expect(screen.getByRole('link', { name: /Start free/ })).toHaveAttribute('href', '/start')
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
  })

  /**
   * The arrow is an inline SVG with no accessible name, so it is found by the
   * control it sits inside rather than by a role of its own. Counting them is the
   * assertion; the glyph has no text to match on.
   */
  const arrowsIn = (name: RegExp) => {
    const control = screen.getByRole('link', { name })
    return control.querySelectorAll('svg').length
  }

  it('gives the first action the arrow when the row is all links', () => {
    render(<Hero01 title="Ship it" actions={[link, { label: 'Read the docs', href: '/docs' }]} />)
    expect(arrowsIn(/^Start free/)).toBeGreaterThan(0)
  })

  it('and gives a second action no arrow even when it is a link', () => {
    render(<Hero01 title="Ship it" actions={[link, { label: 'Read the docs', href: '/docs' }]} />)
    // The arrow marks the row's one primary destination, so only the first action
    // carries it. A second arrow would claim there are two primary destinations.
    expect(arrowsIn(/^Read the docs/)).toBe(0)
  })

  it('and wears none at all when the first action is a caller control', () => {
    render(
      <Hero01
        title="Ship it"
        actions={[{ slot: <button type="button">Resume</button> }, { label: 'Read the docs', href: '/docs' }]}
      />,
    )
    // The control the caller drew owns its own marks, so the row does not put a
    // "goes forward" arrow on the first link after it and call it the primary
    // destination of a row whose first position the caller already filled.
    expect(arrowsIn(/^Read the docs/)).toBe(0)
  })

  it('keeps the default weight positional, including behind a caller control', () => {
    // The variant is a *visual* default and stays positional, which is a different
    // question from the arrow: what looks primary is about the row's shape, while
    // whether the caller drew the control is about the element.
    const { container } = render(
      <Hero01
        title="Ship it"
        actions={[{ slot: <button type="button">Resume</button> }, link]}
      />,
    )
    const cta = container.querySelector('a')
    expect(cta?.className).not.toContain('bg-primary')
    expect(cta?.className).toContain('border')
  })

  it('draws the first action filled and the rest outlined', () => {
    const { container } = render(
      <Hero01
        title="Ship it"
        actions={[{ label: 'Start free', href: '/start' }, { label: 'Read the docs', href: '/docs' }]}
      />,
    )
    const ctas = container.querySelectorAll('a')
    expect(ctas[0]?.className).toContain('bg-primary')
    expect(ctas[1]?.className).not.toContain('bg-primary')
  })

  it('renders no arrow, and no row, when no action is passed at all', () => {
    const { container } = render(<Hero01 title="Ship it" />)
    expect(container.querySelector('[data-slot="hero-01-copy"] a')).toBeNull()
  })
})