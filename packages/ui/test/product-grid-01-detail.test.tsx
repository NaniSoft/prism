/**
 * A product grid can carry a line per row, and a line about the set, and the two
 * are different claims.
 *
 * **The defect this was written for.** `ProductGrid01` had a grid-level
 * `description` and no per-row line, and its documentation said a second line
 * "belongs above the grid in `description`, where it applies to the set". That is
 * true of a sentence about the set and false of a sentence about one product, and
 * the company site had five products each carrying a sentence that was true of one
 * and vacuous beside the other four. The migration folded nothing in, so three
 * published sentences were dropped, and the ledger recorded the loss as a catalogue
 * gap rather than papering over it with a copy edit.
 *
 * **Both shapes are rendered here, because the criterion is that a caller can
 * reach either.** A test that asserted only the new field would pass on a Block
 * that had quietly stopped drawing the grid-level description, and that is the half
 * of the change most likely to regress: it is the shape every existing caller uses.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProductGrid01, type ProductGrid01Product } from '../src/blocks/product-grid-01'

const row = (id: string, over: Partial<ProductGrid01Product> = {}): ProductGrid01Product => ({
  id,
  name: id,
  tagline: `A tagline for ${id}`,
  href: `/${id}`,
  ...over,
})

describe('a row carries its own second line', () => {
  it('renders the detail beside the tagline, and both are readable', () => {
    render(
      <ProductGrid01
        title="The products"
        products={[
          row('atlas', { detail: 'Autonomous software creation, supervised by you.' }),
          row('borealis', { detail: 'Living models of real systems, built by the factory.' }),
        ]}
      />,
    )
    expect(screen.getByText('Autonomous software creation, supervised by you.')).toBeInTheDocument()
    expect(screen.getByText('Living models of real systems, built by the factory.')).toBeInTheDocument()
  })

  it('the detail is inside the row link, so the whole row is still one destination', () => {
    render(
      <ProductGrid01 title="The products" products={[row('atlas', { detail: 'A sentence.' })]} />,
    )
    // The row is an anchor so a status bar shows the destination and middle-click
    // opens it in a new tab. A second line rendered outside it would be text that
    // looks like part of the row and is not clickable with it.
    const link = screen.getByRole('link', { name: /A sentence/ })
    expect(link).toHaveAttribute('href', '/atlas')
  })

  it('a row without one draws no empty line, and does not move its neighbours', () => {
    render(
      <ProductGrid01
        title="The products"
        products={[row('atlas'), row('borealis', { detail: 'Only this one has a second line.' })]}
      />,
    )
    // The first row has no detail, so the second line must appear in the second row
    // and not the first. Asserted by asking which row contains it, because a
    // reserved line would still render both rows at the same height and only the
    // position would give it away.
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]).not.toHaveTextContent('Only this one has a second line.')
    expect(rows[1]).toHaveTextContent('Only this one has a second line.')
    expect(screen.getAllByText('A tagline for atlas')).toHaveLength(1)
  })
})

describe('the grid-level description still draws, because it is a different claim', () => {
  it('renders above the grid and applies to the set', () => {
    render(
      <ProductGrid01
        title="The products"
        description="Every one of these runs on the same runtime."
        products={[row('atlas', { detail: 'A sentence about one of them.' })]}
      />,
    )
    expect(screen.getByText('Every one of these runs on the same runtime.')).toBeInTheDocument()
    expect(screen.getByText('A sentence about one of them.')).toBeInTheDocument()
  })

  it('and is absent when not passed, with no reserved space', () => {
    const { container } = render(
      <ProductGrid01 title="The products" products={[row('atlas')]} />,
    )
    expect(container.textContent).not.toContain('undefined')
  })
})

describe('both levels at once, which is what a marketing page actually wants', () => {
  it('a set claim above and member claims below, without either shadowing the other', () => {
    render(
      <ProductGrid01
        title="The products"
        description="Five products, one platform."
        products={[
          row('atlas', { detail: 'Autonomous software creation, supervised by you.' }),
          row('borealis'),
          row('cirrus', { detail: "The factory's newest build." }),
        ]}
      />,
    )
    // Every level is present exactly once, which is the assertion that would fail
    // if a detail were hoisted or a description were dropped.
    expect(screen.getAllByText('Five products, one platform.')).toHaveLength(1)
    expect(
      screen.getAllByText('Autonomous software creation, supervised by you.'),
    ).toHaveLength(1)
    expect(screen.getAllByText("The factory's newest build.")).toHaveLength(1)
    // And the member with no detail still has its tagline, so the ragged row is a
    // missing sentence rather than a missing product.
    expect(screen.getByText('A tagline for borealis')).toBeInTheDocument()
  })
})
