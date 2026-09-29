import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { Spinner } from '../src/components/ui/spinner'

/**
 * A mark that says work is happening and nothing about how much of it is left.
 *
 * The claims under test are the ones that separate it from its two neighbours,
 * because a screenshot cannot tell them apart. A Progress carries a value and a
 * maximum; a Skeleton has the shape of the content it stands in for. So the
 * assertions are about the *absence* of both: a spinner that exposed a value
 * would be a progress bar that had thrown away its information, and a spinner
 * with a value-shaped frame would be a skeleton pretending not to be one.
 *
 * The second claim is the name. An unnamed busy indicator is an animation and
 * nothing else, so the label is a required prop and the ring is `aria-hidden`,
 * which together mean a screen reader is told what is busy exactly once, in
 * the consumer's own words.
 */
describe('the Spinner', () => {
  it('is a status that says what is busy, in the caller own words', () => {
    render(<Spinner label="Loading invoices" />)

    // The role is load-bearing rather than decorative: it is what makes the
    // accessible name legal, because a `span` with no role has none and
    // `aria-label` on one is prohibited rather than merely ignored.
    expect(screen.getByRole('status', { name: 'Loading invoices' })).toBeTruthy()
  })

  it('is not a progress bar, because it has no value to report', () => {
    const { container } = render(<Spinner label="Loading invoices" />)

    // The absence is the claim. A spinner that carried `aria-valuenow` would be
    // a Progress with the information removed, and a screen reader would
    // announce a position that does not exist.
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(container.querySelector('[aria-valuenow]')).toBeNull()
    expect(container.querySelector('[aria-valuetext]')).toBeNull()
  })

  it('is not a skeleton, because it does not reserve the shape of the content', () => {
    const { container } = render(<Spinner label="Loading invoices" />)

    // A Skeleton is a muted filled block whose size a caller sets to the shape
    // of what is arriving. A spinner is a ring, and the point of the difference
    // is that the ring is the wrong size for almost anything.
    expect(container.querySelector('[data-slot="skeleton"]')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('hides the ring and keeps the words, so a reader is told once', () => {
    const { container } = render(<Spinner label="Loading invoices" />)

    const ring = container.querySelector('[data-slot="spinner-ring"]')
    expect(ring?.getAttribute('aria-hidden')).toBe('true')
    // And the words are the name rather than visible text beside it: two copies
    // of one sentence is one too many, and the caller decides where the words
    // go if it wants them on screen.
    expect(container.textContent).toBe('')
  })

  it('is not a busy region, because which regions are busy is the caller knowledge', () => {
    const { container } = render(<Spinner label="Loading invoices" />)

    // `aria-busy` describes a region that is still readable, not a mark inside
    // it, and a caller that sets it permanently has told assistive technology a
    // stream never ends. That flag belongs on the `LiveRegion` around the
    // content, which is the Component that owns it.
    expect(container.querySelector('[aria-busy]')).toBeNull()
  })

  it('takes no focus, because a reader is waiting rather than being asked to act', () => {
    const { container } = render(<Spinner label="Loading invoices" />)

    // Asserted as absence because the risk is adding one: a status that is
    // focusable is a control, and a control that appears without being asked for
    // takes a keyboard reader's place away from wherever they were.
    expect(container.querySelector('[tabindex]')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('[data-slot="spinner"]')?.getAttribute('role')).toBe('status')
  })

  it('draws three authored sizes rather than a size a caller may set', () => {
    const size = (props: { size?: 'sm' | 'default' | 'lg' }) => {
      const { container } = render(<Spinner label="Loading" {...props} />)
      return container.querySelector('[data-slot="spinner-ring"]')?.className
    }

    // Three steps is what a spinner is drawn at, and a caller that could set an
    // arbitrary one could set one that is invisible.
    const sizes = [size({ size: 'sm' }), size({}), size({ size: 'lg' })]
    expect(new Set(sizes).size).toBe(3)
    expect(sizes[1]).toBe(sizes[0]?.replace('size-4', 'size-5'))
    expect(sizes[0]).toContain('size-4')
    expect(sizes[2]).toContain('size-8')
  })

  it('moves, and the movement is the one thing that says it is working', () => {
    const { container } = render(<Spinner label="Loading" />)

    // The single rotation in the package, and the reason it exists: a spinner
    // cannot be built from a transition between two states, so it needs a loop,
    // and `animate-spin` is the utility that carries one. Asserted as a class
    // because jsdom runs no animation and computes none.
    expect(container.querySelector('[data-slot="spinner-ring"]')?.className).toContain(
      'animate-spin',
    )
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <>
        <button type="button">Save</button>
        <Spinner label="Loading invoices" />
      </>,
    )
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
