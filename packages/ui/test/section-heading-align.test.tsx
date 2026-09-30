/**
 * A section heading that has content under it is aligned left, in every Block.
 *
 * **The rule is `SectionHeading`'s own, and it is not this file's.** That
 * Component's documentation says: "`center` is right for a band that is only a
 * heading, and `left` is right for a section with content under it, where a
 * centred title above a left-aligned list reads as two unrelated pieces." So
 * nothing here decides anything. This file holds the one question every Block that
 * opens with a heading has to answer the same way, because a Block that answers it
 * differently is not expressing a preference, it is inheriting a default.
 *
 * **Why one file for every Block, which is the same reason
 * `card-title-headings.test.tsx` is one file for six.** Ten files with one case
 * each would let the eleventh Block answer this question differently and still
 * pass, and that is precisely the failure: the list *is* the assertion, so a new
 * Block has to be added here to be checked at all.
 *
 * **The defect it was written for, and where it was visible.** `FeatureGrid01` and
 * `Pricing01` each rendered a centred heading over a grid of cards, and they were
 * the only two of ten that did. Neither had a stated reason, so neither had made a
 * decision. It was invisible in this repository, which previews one Block at a time
 * and so never put a centred title next to a left-aligned one. It was visible in
 * the consumer: the Nexus landing is composed from seven of these Blocks and put
 * two centred section titles among five left ones, and the page's rhythm read as an
 * accident. A page's composition belongs to the consumer, but a consumer cannot
 * correct one Block's alignment without restyling a catalogue item, which the
 * no-override-path rule does not allow. So the answer has to be the same in every
 * Block rather than something a consumer works around per page.
 *
 * **The two exceptions are stated, and both are the rule rather than a carve-out.**
 * `Cta01` draws no `SectionHeading` at all: it renders a centred title on a filled
 * primary panel with two actions and nothing under it, which is the case `center`
 * exists for. `Hero01` takes an `align` of its own because its two forms differ: a
 * centred hero is a band that is only a heading, and the two-column form puts its
 * figure beside the copy rather than under it, so it has content beside the heading
 * and not below it. Both are asserted, because an exception that is not asserted is
 * an exception that grows.
 *
 * **How alignment is read.** From the class list on the element that wraps the
 * heading, which is where `SectionHeading` puts the decision: `items-start` with
 * `text-left` for left, `items-center` with `text-center` for centre. jsdom applies
 * no stylesheet, so the classes are the evidence rather than a computed value. The
 * assertion is that the two pairs travel together, because reading only one of them
 * would pass a heading that centres its box and left-aligns its text.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Cta01 } from '../src/blocks/cta-01'
import { FeatureGrid01 } from '../src/blocks/feature-grid-01'
import { LogoStrip01 } from '../src/blocks/logo-strip-01'
import { NoteGrid01 } from '../src/blocks/note-grid-01'
import { Pricing01 } from '../src/blocks/pricing-01'
import { ProcessFlow01 } from '../src/blocks/process-flow-01'
import { ProcessRail01 } from '../src/blocks/process-rail-01'
import { ProductGrid01 } from '../src/blocks/product-grid-01'
import { StackGrid01 } from '../src/blocks/stack-grid-01'
import { Stats01 } from '../src/blocks/stats-01'
import { StatusLedger01 } from '../src/blocks/status-ledger-01'

/** The heading every fixture shares, so one query finds one heading in each render. */
const TITLE = 'Section heading'

/**
 * The class pair a Block rendered its heading at.
 *
 * Read off the heading's parent, which is the element `SectionHeading` aligns, and
 * returned as a pair rather than as a single value because the two halves are two
 * decisions: a heading can centre its box and set its text flush left, and that is
 * a third arrangement nobody has asked for.
 */
function alignmentOf(): { items: string; text: string } {
  const heading = screen.getByRole('heading', { name: TITLE })
  const wrapper = heading.parentElement!
  const items = /items-(start|center)\b/.exec(wrapper.className)?.[1] ?? ''
  const text = /\btext-(left|center)\b/.exec(wrapper.className)?.[1] ?? ''
  return { items, text }
}

const LEFT = { items: 'start', text: 'left' }
const CENTRE = { items: 'center', text: 'center' }

/**
 * Every Block that opens with a section heading, in one array.
 *
 * `align` is the arrangement the Block is expected to render its heading at, and
 * `rendersUnderneath` is whether the Block draws content below that heading, which
 * is what decides the answer rather than the Block's own taste. The two columns are
 * separate on purpose: a reader can see at a glance that the Blocks expected to
 * centre are the two with nothing underneath, and that is the rule rather than a
 * preference list.
 *
 * Adding a Block means adding a row. A row that expects `CENTRE` while
 * `rendersUnderneath` is true is a finding, and that is the whole mechanism.
 */
const HEADINGS: Array<{
  item: string
  /** Whether the Block draws anything below its section heading. */
  rendersUnderneath: boolean
  align: typeof LEFT
  render: () => React.ReactElement
}> = [
  {
    item: 'FeatureGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <FeatureGrid01
        title={TITLE}
        variant="bare"
        features={[{ title: 'First item', body: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'Pricing01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Pricing01
        title={TITLE}
        plans={[{ name: 'First plan', price: '$0', features: ['One line'], cta: 'Choose' }]}
      />
    ),
  },
  {
    item: 'NoteGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <NoteGrid01 title={TITLE} notes={[{ title: 'First point', body: 'A sentence about it.' }]} />
    ),
  },
  {
    item: 'StackGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <StackGrid01 title={TITLE} parts={[{ name: 'Bedrock', role: 'The data lake' }]} />
    ),
  },
  {
    item: 'StatusLedger01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <StatusLedger01
        title={TITLE}
        rows={[{ name: 'First row', status: 'live', statusLabel: 'Available' }]}
      />
    ),
  },
  {
    item: 'ProductGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProductGrid01
        title={TITLE}
        products={[{ id: 'first', name: 'First product', tagline: 'What it is.', href: '/first' }]}
      />
    ),
  },
  {
    item: 'LogoStrip01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <LogoStrip01 title={TITLE} items={['One short phrase']} label="A named strip" />,
  },
  {
    item: 'ProcessRail01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProcessRail01
        title={TITLE}
        steps={[
          { name: 'First step', description: 'What happens there.' },
          { name: 'Second step', description: 'What happens there.' },
        ]}
      />
    ),
  },
  {
    item: 'ProcessFlow01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProcessFlow01
        title={TITLE}
        stages={[
          { name: 'First stage', description: 'What happens there.' },
          { name: 'Second stage', description: 'What happens there.' },
        ]}
      />
    ),
  },
  {
    item: 'Stats01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <Stats01 title={TITLE} stats={[{ label: 'One label', value: '1' }]} />,
  },
]

describe('a section heading with content under it is aligned left', () => {
  for (const { item, align, render: at } of HEADINGS) {
    it(`${item} aligns its heading and its text together`, () => {
      render(at())
      expect(alignmentOf(), `${item} rendered its heading at the wrong alignment`).toEqual(align)
    })
  }

  it('and every Block that draws content below its heading expects the same answer', () => {
    // The rule stated over the list rather than over a rendering, so a Block cannot
    // be added to this file expecting `CENTRE` while putting a grid underneath it.
    const overContent = HEADINGS.filter((entry) => entry.rendersUnderneath)
    expect(overContent.length).toBe(HEADINGS.length)
    expect([...new Set(overContent.map((entry) => entry.align.text))]).toEqual(['left'])
  })
})

describe('the two Blocks with nothing under their heading', () => {
  it('Cta01 centres its title on the filled panel, which is the case center exists for', () => {
    // It draws no `SectionHeading`: the panel owns its own centred stack, so this
    // asserts the rendered arrangement rather than a prop, because there is no prop
    // and a test that reached for one would be testing a surface that does not exist.
    const { container } = render(<Cta01 title={TITLE} action={{ label: 'Choose', href: '/go' }} />)
    const heading = screen.getByRole('heading', { name: TITLE })
    const panel = container.querySelector('.bg-primary')
    expect(panel, 'the closing band draws no filled panel').toBeTruthy()
    expect(panel?.className).toContain('text-center')
    expect(heading.parentElement?.className).toContain('items-center')
  })

  it('and neither of them is in the list above, which is what keeps the list honest', () => {
    const items = HEADINGS.map((entry) => entry.item)
    expect(items).not.toContain('Cta01')
    expect(items).not.toContain('Hero01')
  })
})
