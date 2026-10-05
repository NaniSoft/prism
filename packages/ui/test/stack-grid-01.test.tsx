import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StackGrid01 } from '../src/blocks/stack-grid-01'

import { fontSizePx, lengthPx } from './sheet-reader'

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

/**
 * The gap this pair of tests exists to end. A site that publishes a stack under
 * codenames has two names for one part, `Bedrock` over `Nessie`, and `StackPart`
 * carried one of them, so the migration had to record the second as removed. The
 * value is a part's own data, so the assertion is on the part's own tile and in
 * the order a reader reads it: the codename, the product it wraps, the role.
 */
const CODENAMED = [
  { name: 'Bedrock', realName: 'Nessie, Iceberg', role: 'The data lake' },
  { name: 'Postgres', role: 'Storage' },
]

describe('a part with a real product behind its name', () => {
  it('prints the second name inside the tile that owns it, between the name and the role', () => {
    const { container } = render(<StackGrid01 parts={CODENAMED} />)

    const tiles = container.querySelectorAll('[data-slot="stack-grid"] > ul > li')
    expect(tiles[0].textContent).toBe('BedrockNessie, IcebergThe data lake')
    expect(screen.getByText('Nessie, Iceberg')).toBeInTheDocument()
  })

  it('renders nothing at all for a part that passes no second name', () => {
    // The half of the field that is easy to get wrong in the other direction. A
    // reserved line is a layout shift on the first thing a reader scrolls to, and
    // the tile has to render exactly what it rendered before the field existed:
    // the name, the role, and no element standing in for a value nobody passed.
    const { container } = render(<StackGrid01 parts={CODENAMED} />)

    const tiles = container.querySelectorAll('[data-slot="stack-grid"] > ul > li')
    expect(tiles[1].textContent).toBe('PostgresStorage')
    expect(tiles[1].querySelectorAll('span')).toHaveLength(0)
  })
})

/**
 * The type floor of a tile, measured.
 *
 * **Two floors and both are read.** `text-lg` is the step `DESIGN.md` gives Body
 * and `text-sm` is the step it gives supporting copy, and both are read out of the
 * root declarations in the shipped stylesheet rather than written here as pixels,
 * so a retune of the scale moves the claim rather than leaving it pinned to a
 * number the token source no longer publishes. The first floor is the one the
 * ladder stops to avoid: `lg` is the deepest authored step that is not smaller than
 * Body, precisely so that a heading never renders smaller than the copy it
 * introduces.
 *
 * **Both arms are asserted, and their agreement is asserted as a fact rather than
 * as a comparison.** The two groups differ in weight and in ink and not in type: a
 * second group set quieter than the first would be a grid claiming the in-house
 * work matters less than the assembled parts, which is the opposite of what the
 * group is for.
 */
const BODY_STEP_PX = lengthPx('var(--text-lg)') as number
const SUPPORTING_STEP_PX = lengthPx('var(--text-sm)') as number

if (BODY_STEP_PX <= 0 || SUPPORTING_STEP_PX <= 0) {
  throw new Error(
    'the shipped stylesheet declares no `--text-lg` or no `--text-sm`, so a tile has no floor to be ' +
      'measured against.',
  )
}

/** Every tile name and every line of copy in one arm, as rendered pixels. */
function armType(container: HTMLElement, own: boolean) {
  const grid = own
    ? container.querySelector('[data-slot="stack-grid-own"]')!
    : container.querySelector('[data-slot="stack-grid"] > ul')!
  return {
    names: [...grid.querySelectorAll('h3')].map((heading) => fontSizePx(heading, 1440)),
    copy: [...grid.querySelectorAll('p')].map((line) => fontSizePx(line, 1440)),
  }
}

describe('the type a tile sets, in both arms of the grid', () => {
  it('sets a tile name at Body or above, in the in-house arm as well as the composed one', () => {
    const { container } = render(
      <StackGrid01 parts={PARTS} own={OWN} ownLabel="built in-house" title="How it is built" />,
    )

    for (const own of [false, true]) {
      const arm = armType(container, own)
      expect(arm.names, own ? 'own' : 'parts').toHaveLength(2)
      for (const size of arm.names) expect(size, `${own ? 'own' : 'parts'} name`).toBeGreaterThanOrEqual(BODY_STEP_PX)
    }
  })

  it('sets the line under a name at the supporting-copy floor or above, in both arms', () => {
    const { container } = render(
      <StackGrid01 parts={PARTS} own={OWN} ownLabel="built in-house" title="How it is built" />,
    )

    for (const own of [false, true]) {
      const arm = armType(container, own)
      expect(arm.copy, own ? 'own' : 'parts').toHaveLength(2)
      for (const size of arm.copy) {
        expect(size, `${own ? 'own' : 'parts'} copy`).toBeGreaterThanOrEqual(SUPPORTING_STEP_PX)
      }
    }
  })

  it('sets the two arms at the same steps, because the difference is a claim and not a volume', () => {
    const { container } = render(
      <StackGrid01 parts={PARTS} own={OWN} ownLabel="built in-house" title="How it is built" />,
    )

    expect(armType(container, true).names).toEqual(armType(container, false).names)
    expect(armType(container, true).copy).toEqual(armType(container, false).copy)
  })

  it('holds the same numbers at 390, because none of the three floors is a width', () => {
    const { container } = render(
      <StackGrid01 parts={PARTS} own={OWN} ownLabel="built in-house" title="How it is built" />,
    )

    for (const heading of container.querySelectorAll('h3')) {
      expect(fontSizePx(heading, 390)).toBe(fontSizePx(heading, 1440))
    }
    for (const line of container.querySelectorAll('p')) {
      expect(fontSizePx(line, 390)).toBe(fontSizePx(line, 1440))
    }
  })
})
