import { fireEvent, render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { EmptyState01, EMPTY_REASONS } from '../src/blocks/empty-state-01/empty-state'

/**
 * The state a region shows when it has nothing in it.
 *
 * The claims under test are the ones a screenshot cannot hold and a gate cannot
 * see. There is no copy in this Block, so the copy gate has nothing to read here;
 * what can be quietly wrong is the `reason` prop: a permission boundary offering a
 * create action, a first run claiming nothing was found, a headline that enters
 * the document outline and then vanishes when the data arrives, and a button that
 * reads as available and does nothing.
 *
 * The throw is tested the way `instrument-panel-01` tests its own, by asserting
 * the message is the diagnostic rather than a reader-facing string, because a
 * throw that reaches a console is the one place this Block is allowed words.
 */
describe('the Empty state Block', () => {
  it('carries the reason on the root, so a consumer can target the four states', () => {
    for (const reason of EMPTY_REASONS) {
      const { container, unmount } = render(
        <EmptyState01 reason={reason} title="No invoices" />,
      )
      // The reason is a machine value and never reader-facing text: two products
      // call the same state "Nothing here yet" and "Your account is new", and
      // neither sentence is Prism's to publish.
      expect(container.querySelector('[data-slot="empty-state"]')?.getAttribute('data-reason')).toBe(
        reason,
      )
      unmount()
    }
  })

  it('closes the reason set at four, because each one wants a different action', () => {
    // The failure this prevents is a fifth reason such as `error` or `loading`,
    // which are states the surrounding surface already owns. A region that is
    // erroring has an Alert and a region that is loading has a Spinner, and a
    // Block that drew them would give a consumer two places for one fact.
    //
    // The order is the taxonomy's own: what happened to the collection, with the
    // two the reader did themselves next to each other and the one that is not
    // their fault last.
    expect([...EMPTY_REASONS]).toEqual([
      'first-run',
      'no-match',
      'emptied-by-reader',
      'not-permitted',
    ])
  })

  it('keeps a reader-empty bin on no ink, because nothing there is broken', () => {
    const { container } = render(
      <EmptyState01 reason="emptied-by-reader" title="The bin is empty" />,
    )

    // The fourth reason is a statement about a collection like the other three, so
    // it takes the same frame. The one ink in this Block belongs to
    // `not-permitted`, because a permission boundary is a fact about the reader
    // rather than about the set. A reader who emptied a bin did it themselves and
    // nothing is wrong, so a warning colour here would teach the reader to read
    // the frame as a fault.
    const className =
      container.querySelector('[data-slot="empty-state"]')?.getAttribute('class') ?? ''
    expect(className).toContain('border-dashed')
    expect(className).not.toContain('text-muted-foreground')
  })

  it('renders no control for a bin the reader emptied, because the next step is elsewhere', () => {
    const { container } = render(
      <EmptyState01
        reason="emptied-by-reader"
        title="Nothing left to restore"
        body="Deleted records come back from a view you can switch to."
      />,
    )

    // The absence is the claim. A reader who has deleted nothing has nothing to
    // restore inside this region, and the records a restore would bring back are
    // the caller's own nodes in the index around this one. A control here would be
    // either a button this Block cannot wire or a second copy of the affordance
    // the surrounding index already draws.
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('[data-slot="empty-state-action"]')).toBeNull()
  })

  it('keeps its headline out of the document outline, because it is replaced by content', () => {
    const { container } = render(
      <EmptyState01 reason="first-run" title="No invoices yet" />,
    )

    // The load-bearing assertion is the absence. An empty state is the absence of
    // a section, and it is replaced by content that will be a sibling of whatever
    // introduced it. A heading here puts an entry in the outline that vanishes
    // the moment data arrives, and a reader navigating by heading selects
    // "No invoices yet" and lands where the entry no longer exists.
    expect(screen.queryByRole('heading')).toBeNull()
    expect(container.querySelector('h1,h2,h3,h4,h5,h6')).toBeNull()

    // And it is not announced as a region either, for the same reason: there is
    // nothing here to navigate to.
    expect(screen.queryByRole('region')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders the words it was given and nothing else', () => {
    const { container } = render(
      <EmptyState01
        reason="no-match"
        title="No invoices match"
        body="Three filters are active. Clearing them brings back everything you can see."
      />,
    )

    // The `not-permitted` case matters most here: a region a reader cannot see
    // through is not an error, so it must not have picked up `role="alert"` or a
    // destructive tone on its own.
    expect(container.textContent).toBe(
      'No invoices matchThree filters are active. Clearing them brings back everything you can see.',
    )
    expect(container.querySelector('[data-slot="empty-state"]')?.className).not.toMatch(
      /bg-destructive|text-destructive/,
    )
  })

  it('hides the mark from assistive technology, because the words already say the reason', () => {
    const { container } = render(
      <EmptyState01 reason="first-run" title="No invoices yet" icon={<svg />} />,
    )

    // The mark is a slot because the shape that means "nothing here yet" and the
    // shape that means "you cannot see this" are different shapes. It is hidden
    // because a screen reader that reads both the icon and the words is the same
    // sentence twice, which is the defect the Spinner's ring also avoids.
    const icon = container.querySelector('[data-slot="empty-state-icon"]')
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders no action at all when there is no next step, rather than a dead button', () => {
    const { container } = render(
      <EmptyState01
        reason="not-permitted"
        title="Billing is not on your plan"
        body="Ask an owner of this workspace to enable it."
      />,
    )

    // The absence is the claim. A region a reader cannot act on has no next step,
    // and inventing one is how an empty state ends up offering a control that
    // cannot help them.
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('[data-slot="empty-state-action"]')).toBeNull()
  })

  it('offers the one action with the caller words, and calls the handler', () => {
    const onAction = vi.fn()
    render(
      <EmptyState01
        reason="first-run"
        title="No invoices yet"
        actionLabel="Create your first invoice"
        onAction={onAction}
      />,
    )

    const button = screen.getByRole('button', { name: 'Create your first invoice' })
    fireEvent.click(button)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('offers no second action, because a form inside an empty region has nothing to submit', () => {
    render(
      <EmptyState01
        reason="no-match"
        title="No invoices match"
        actionLabel="Clear the filters"
        onAction={() => {}}
      />,
    )

    // One action is the next step. Everything else belongs in the surrounding
    // surface, where the reader can see it without this region competing.
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('refuses a label with no handler, rather than shipping a button that lies', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<EmptyState01 reason="first-run" title="None yet" actionLabel="Create" />))
      .toThrow(/no onAction/)

    quiet.mockRestore()
  })

  it('keeps the region roughly as tall as content, so nothing below it jumps', () => {
    const { container, unmount } = render(
      <EmptyState01 reason="first-run" title="No invoices yet" body="One sentence." />,
    )

    // The floor is what stops the layout shift, and it is asserted as a class
    // because jsdom computes no layout and the token is the whole claim.
    const className = container.querySelector('[data-slot="empty-state"]')?.className ?? ''
    expect(className).toContain('min-h-64')
    expect(className).toContain('border-dashed')
    unmount()

    // And the floor does not depend on a reason: a permission boundary and a
    // first run are both "nothing here", and a region that changed height
    // depending on which one it was would be a second layout shift.
    const other = render(<EmptyState01 reason="not-permitted" title="Not on your plan" />)
    expect(other.container.querySelector('[data-slot="empty-state"]')?.className).toContain(
      'min-h-64',
    )
  })

  it('lets a consumer lay it out without letting them restyle it', () => {
    const { container } = render(
      <EmptyState01 reason="first-run" title="No invoices yet" className="mt-8" />,
    )

    // Layout only, exactly as on every Component and Block. A consumer who could
    // reach a Prism-owned visual property from here would fork the design by
    // passing a class, and the next consumer would inherit the fork.
    expect(container.querySelector('[data-slot="empty-state"]')?.className).toContain('mt-8')
    expect(container.querySelector('[data-slot="empty-state"]')?.className).toContain('border-dashed')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <>
        <h2>Invoices</h2>
        <EmptyState01
          reason="first-run"
          title="No invoices yet"
          body="An invoice is what you send when you need to be paid."
          actionLabel="Create your first invoice"
          onAction={() => {}}
        />
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
