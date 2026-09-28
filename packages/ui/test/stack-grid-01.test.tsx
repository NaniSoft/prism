import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StackGrid01 } from '../src/blocks/stack-grid-01'

/**
 * The claim under test is that the two groups are two props and not one prop with
 * a flag. The difference between an assembled part and one a product built is a
 * claim about provenance, and a claim is not a property of a row: put it in the
 * row and the two groups become indistinguishable in the data as well as on
 * screen, which is the moment a "built in-house" tile becomes a thing you cannot
 * filter for.
 */
const PARTS = [
  { name: 'Postgres', role: 'Storage' },
  { name: 'NATS', role: 'Queue' },
]

const OWN = [
  { name: 'The orchestrator', blurb: 'Decides what runs next.' },
  { name: 'The config loader', blurb: 'Reads a project, once.' },
]

describe('a survey of what a product is built from', () => {
  it('draws the composed parts and the in-house work as two separate grids', () => {
    const { container } = render(
      <StackGrid01 parts={PARTS} own={OWN} ownLabel="built in-house" title="How it is built" />,
    )

    expect(container.querySelectorAll('[data-slot="stack-grid"] > ul')).toHaveLength(2)
    expect(container.querySelectorAll('[data-slot="stack-grid-own"] li')).toHaveLength(2)
    expect(screen.getAllByText('built in-house')).toHaveLength(2)
  })

  it('draws the in-house tiles lifted, because that group is the claim', () => {
    const { container } = render(<StackGrid01 parts={PARTS} own={OWN} ownLabel="ours" />)

    const own = container.querySelector('[data-slot="stack-grid-own"]')!
    // The one element in this system that means *lifted* is the one with a border
    // in the pack's primary hue, paired with the md shadow step.
    expect(own.innerHTML).toContain('border-primary')
    expect(own.innerHTML).toContain('shadow-md')
  })

  it('refuses an in-house group with no words for the claim', () => {
    // The group is a claim and the words are the caller's: three of the four sites
    // write three different ones, and the block does not choose.
    expect(() => render(<StackGrid01 parts={PARTS} own={OWN} />)).toThrow(/ownLabel/)
  })

  it('omits the group entirely when there is none', () => {
    const { container } = render(<StackGrid01 parts={PARTS} />)
    expect(container.querySelector('[data-slot="stack-grid-own"]')).toBeNull()
    expect(container.querySelectorAll('[data-slot="stack-grid"] > ul')).toHaveLength(1)
  })
})
