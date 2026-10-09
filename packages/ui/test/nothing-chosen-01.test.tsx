import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { NothingChosen01 } from '../src/blocks/nothing-chosen-01/nothing-chosen'

/**
 * The resting detail pane.
 *
 * The claims under test are the absences, because this Block's content is four
 * absences and a screenshot can only show the fifth thing. There is no copy here
 * for the copy gate to read, so what can be quietly wrong is that the Block grew
 * a control, a reason, a fallback sentence, a frame or a height floor: each is
 * one a reader would meet first and each is one this state is specifically shaped
 * to refuse.
 */
describe('the Nothing chosen Block', () => {
  it('renders the words it was given and nothing else', () => {
    const { container } = render(
      <NothingChosen01
        title="Select an invoice"
        body="Choose one from the list to see its lines."
      />,
    )

    // No sentence of its own is the claim. A fallback here would be a claim about
    // a product this Block cannot see, and it would be rendered beside the words
    // the caller did write, so the reader would see both.
    expect(container.textContent).toBe('Select an invoiceChoose one from the list to see its lines.')
  })

  it('ships no reason value, so the catalogue is where the fourth state is read', () => {
    const { container } = render(<NothingChosen01 title="Select an invoice" />)

    // `EmptyState01` carries `data-reason` because three callers pass three
    // different values and a consumer can target the states. There is one cause
    // here, so a machine value on the root would encode a fact rather than
    // describe a decision.
    const root = container.querySelector('[data-slot="nothing-chosen"]')
    expect(root?.hasAttribute('data-reason')).toBe(false)
  })

  it('renders no control of any kind, because the next step is in the other pane', () => {
    const { container } = render(
      <NothingChosen01 title="Select an invoice" body="Choose one from the list." />,
    )

    // The absence is the whole claim, and it is what `scripts/check-block-controls.mjs`
    // has nothing to catch in this source for. A button here would be either one
    // this Block cannot wire or a second copy of the affordance the index beside
    // it already draws for the same reader.
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(container.querySelector('button, a[href], input, select, textarea')).toBeNull()
  })

  it('declares no height floor of its own, because the pane is as tall as its neighbour', () => {
    const { container } = render(<NothingChosen01 title="Select an invoice" />)

    // A `min-h` authored here is a second answer to a question the split's tracks
    // have already answered: a pane in a grid is already as tall as the index
    // beside it. What the Block does instead is take the height it is given.
    const className = container.querySelector('[data-slot="nothing-chosen"]')?.className ?? ''
    expect(className).not.toMatch(/\bmin-h-/)
    expect(className).not.toMatch(/\bh-\d/)
    expect(className).not.toMatch(/\bmax-h-/)
    expect(className).toContain('h-full')
  })

  it('draws no frame, because there is something to read beside it', () => {
    const { container } = render(<NothingChosen01 title="Select an invoice" />)

    // The dashed frame `EmptyState01` shares across its three reasons asserts
    // there is nothing here to read, and a full index sits a few centimetres away.
    const className = container.querySelector('[data-slot="nothing-chosen"]')?.className ?? ''
    expect(className).not.toMatch(/border-dashed/)
    expect(className).not.toMatch(/\bborder\b/)
    expect(className).not.toMatch(/bg-card/)
    expect(className).not.toMatch(/rounded/)
  })

  it('keeps its words out of the document outline, because the pane outlives them', () => {
    const { container } = render(<NothingChosen01 title="Select an invoice" />)

    // What is in the pane is replaced by a record the moment the reader chooses,
    // so a heading here is an outline entry that disappears on the first click and
    // a reader navigating by heading follows it to where it no longer exists. The
    // pane's own claim belongs to the shell's heading above the split.
    expect(screen.queryByRole('heading')).toBeNull()
    expect(container.querySelector('h1,h2,h3,h4,h5,h6')).toBeNull()
  })

  it('hides the mark from assistive technology, because the words already say the state', () => {
    const { container } = render(
      <NothingChosen01 title="Select an invoice" icon={<svg />} />,
    )

    // It is a slot for the same reason `EmptyState01` takes one: the shape that
    // means "choose something" is a claim about the caller's records. It is hidden
    // because a screen reader that reads both the mark and the words is the same
    // sentence twice.
    const icon = container.querySelector('[data-slot="nothing-chosen-icon"]')
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
  })

  it('draws the optional parts only when they were passed', () => {
    const bare = render(<NothingChosen01 title="Select an invoice" />)
    expect(bare.container.querySelector('[data-slot="nothing-chosen-body"]')).toBeNull()
    expect(bare.container.querySelector('[data-slot="nothing-chosen-icon"]')).toBeNull()
    bare.unmount()

    // Omitting the body is the ordinary case for a pane a reader lands in, so the
    // sentence is absent rather than a default that says nothing.
    render(
      <NothingChosen01 title="Select an invoice" body="Choose one from the list." icon={<svg />} />,
    )
    expect(screen.getByText('Choose one from the list.')).toBeInTheDocument()
  })

  it('lets a consumer lay it out without letting them restyle it', () => {
    const { container } = render(
      <NothingChosen01 title="Select an invoice" className="min-h-0" />,
    )

    // Layout only, exactly as on every Component and Block. `min-h-0` is the
    // caller's own floor on the composition, which is where a floor belongs, and
    // it arrives from here rather than being authored by the Block.
    expect(container.querySelector('[data-slot="nothing-chosen"]')?.className).toContain('min-h-0')
  })

  it('has no accessibility violations when it is in a pane beside a list', async () => {
    const { container } = render(
      <div>
        <h2>Invoices</h2>
        <div>
          <p>Northwind Traders</p>
          <p>Contoso Ltd</p>
        </div>
        <NothingChosen01 title="Select an invoice" body="Choose one from the list." />
      </div>,
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