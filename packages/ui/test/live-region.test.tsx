import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { LiveRegion } from '../src/components/ui/live-region'

/**
 * A region that announces what just changed in it.
 *
 * The claims under test are the two that a screen reader depends on and that no
 * other gate can see. The first is that the region is announced at all: the
 * politeness is on the element, and it is the default that is least interruptive
 * while still being announced. The second is the empty case, which is the one this
 * component is shaped around: a live region that is always present announces every
 * unrelated state change of its ancestors, so a region with nothing to say must
 * not be on the page at all.
 *
 * `aria-busy` is asserted as a third claim because it is the one a caller most
 * often gets wrong, and getting it wrong in the permanent direction tells
 * assistive technology a stream never ends.
 */
describe('the Live region', () => {
  it('is announced politely by default, because that is the least interruptive value still announced', () => {
    const { container } = render(<LiveRegion>One result</LiveRegion>)
    const region = container.querySelector('[data-slot="live-region"]')
    expect(region?.getAttribute('aria-live')).toBe('polite')
  })

  it('announces assertively when the caller says the change cannot wait', () => {
    const { container } = render(<LiveRegion politeness="assertive">Payment declined</LiveRegion>)
    const region = container.querySelector('[data-slot="live-region"]')
    expect(region?.getAttribute('aria-live')).toBe('assertive')
  })

  it('renders no element at all when it has nothing to say', () => {
    // The empty case is the defect this shape exists to prevent: a permanently
    // present live region announces every unrelated change of its ancestors. So
    // the assertion is on the absence of the element rather than on an attribute,
    // because an empty div carrying aria-live is the failure.
    const { container } = render(<LiveRegion>{null}</LiveRegion>)
    expect(container.querySelector('[data-slot="live-region"]')).toBeNull()
    expect(container.querySelector('[aria-live]')).toBeNull()
    expect(container.firstChild).toBeNull()
  })

  it('renders no live region for an empty string either, rather than an announceable nothing', () => {
    const { container } = render(<LiveRegion>{''}</LiveRegion>)
    // An empty string is falsy content, and a region announcing nothing is still a
    // region that will announce the next change, so this is the same defect.
    expect(container.querySelector('[data-slot="live-region"]')).toBeNull()
  })

  it('marks itself busy only while the caller says more is coming', () => {
    const { container, rerender } = render(<LiveRegion>Streaming</LiveRegion>)
    const region = () => container.querySelector('[data-slot="live-region"]')

    expect(region()?.hasAttribute('aria-busy')).toBe(false)

    rerender(
      <LiveRegion busy>
        Streaming
      </LiveRegion>,
    )
    expect(region()?.getAttribute('aria-busy')).toBe('true')

    rerender(<LiveRegion>Finished</LiveRegion>)
    expect(region()?.hasAttribute('aria-busy')).toBe(false)
  })

  it('names the region only when the caller passes a name, and never renders the string undefined', () => {
    const { container, rerender } = render(<LiveRegion>One result</LiveRegion>)
    const region = () => container.querySelector('[data-slot="live-region"]')

    expect(region()?.hasAttribute('aria-label')).toBe(false)

    rerender(<LiveRegion label="Search results">One result</LiveRegion>)
    expect(region()?.getAttribute('aria-label')).toBe('Search results')
  })

  it('renders the content it was given and nothing else', () => {
    const { container } = render(
      <LiveRegion>
        <p>Three files uploaded</p>
      </LiveRegion>,
    )
    // Read from the container rather than from the document, because the region is
    // the only thing rendered and `screen` searches the whole body, which the other
    // tests in this file have already populated.
    expect(container.textContent).toBe('Three files uploaded')
  })

  it('is a status, so it has a role that can carry an accessible name', () => {
    // A `div` with no role has no accessible name, so `aria-label` on one is
    // prohibited rather than merely ignored. Asserting the role is what makes the
    // label legal, and `status` is the honest one: content that changed and is not
    // waiting for the reader.
    const { container } = render(<LiveRegion label="Run output">Reading the feed</LiveRegion>)
    expect(screen.getByRole('status', { name: 'Run output' })).toBeTruthy()
    expect(container.querySelector('[data-slot="live-region"]')?.getAttribute('role')).toBe('status')
  })

  it('is layout only, so it inherits the caller class rather than painting one', () => {
    const { container } = render(<LiveRegion className="mt-2">One result</LiveRegion>)
    const region = container.querySelector('[data-slot="live-region"]')
    // The one authored token: a live region has no visual of its own, because a
    // region that paints is a box a reader can see and a design system should not
    // add one to announce something invisible.
    expect(region?.getAttribute('class')).toBe('mt-2')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <LiveRegion busy label="Run output">
        <p>Reading the feed</p>
      </LiveRegion>,
    )
    const results = await axe.run(container, {
      rules: {
        // The same two the package's a11y suite disables: contrast is measured by
        // the contrast gate against the surfaces a role can land on, and `region` is
        // a whole-page rule that a fragment cannot satisfy.
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
