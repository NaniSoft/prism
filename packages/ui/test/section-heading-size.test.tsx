/**
 * A Block's section title is sized by the level its `headingLevel` names.
 *
 * **Why this file exists next to `section-heading-align.test.tsx` and not inside
 * it.** That file asks one question about every Block that opens with a heading,
 * and the answer must be the same in all of them, so the list *is* the assertion.
 * This one asks a different question of the same Blocks, and the answer is allowed
 * to differ per Block, so a list would be the wrong shape: what has to hold is
 * that each Block passes its level through and gets that Block's step back. The
 * two files share the roster by construction rather than by hand, which is the
 * arrangement that keeps a fourth question from needing a fourth copy of it.
 *
 * **The defect it was written for, and where it was visible.** `SectionHeading`
 * wrote one class string for all six levels, so a page `h1` and an `h2` came out
 * byte-identical and a landing page of a hero plus six Blocks showed one `h1` and
 * six section titles at 36 pixels. Nothing here could see it: the outline was
 * right at every level, the alignment was left where it had to be left, every
 * Block forwarded its `headingLevel` correctly, and the size was a constant in a
 * Component none of these files read. A Block that forwarded its level perfectly
 * was indistinguishable from one that ignored it, because forwarding it changed
 * nothing a test could observe.
 *
 * **What a class-string assertion proves, and what it does not.** jsdom applies no
 * stylesheet, so nothing in this file measures a pixel and nothing in it can see
 * that 3rem is larger than 2.25rem. What it proves is that each Block declares
 * the step its level resolves to, which is the half that drifted: before the fix
 * every level resolved to the same string, so the declaration was identical at
 * `h1` and at `h6` and no browser could have told them apart either. The values
 * themselves are the token package's, and `scripts/check-heading-scale.mjs` holds
 * the table against the token source.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { headingSizeClass, type HeadingLevel } from '../src/components/ui/section'
import { About01 } from '../src/blocks/about-01'
import { Cta01 } from '../src/blocks/cta-01'
import { FeatureGrid01 } from '../src/blocks/feature-grid-01'
import { Faq01 } from '../src/blocks/faq-01'
import { Hero01 } from '../src/blocks/hero-01'

/** The heading every fixture shares, so one query finds one heading in each render. */
const TITLE = 'Section heading'

/** The step a level resolves to, read from the Component under test's own table. */
const step = (level: HeadingLevel) => headingSizeClass(level)

/**
 * The rendered heading, by its accessible level and its name rather than by class.
 *
 * The name is part of the query because several of these Blocks draw a heading per
 * item as well as the section's own, and `Faq01` puts its questions at the same
 * level the fixture asked for. A query by level alone would then return three
 * elements and fail for a reason that has nothing to do with the size.
 */
function rendered(level: number): HTMLElement {
  return screen.getByRole('heading', { level, name: TITLE })
}

describe('a Block forwards its heading level to the size', () => {
  it('About01 at h1 and at h2 do not come out at one size', () => {
    const { unmount } = render(
      <About01
        headingLevel="h1"
        title={TITLE}
        statement="One sentence."
        principles={[{ id: 'first', title: 'First principle', body: 'A sentence about it.' }]}
      />,
    )
    const asH1 = rendered(1).className
    unmount()

    render(
      <About01
        headingLevel="h2"
        title={TITLE}
        statement="One sentence."
        principles={[{ id: 'first', title: 'First principle', body: 'A sentence about it.' }]}
      />,
    )
    const asH2 = rendered(2).className

    expect(asH1).toContain(step('h1'))
    expect(asH2).toContain(step('h2'))
    expect(asH1).not.toBe(asH2)
  })

  it('a Block rendered at the default h2 takes the h2 step, which is not the h1 step', () => {
    // The case a consumer hits without passing anything, and the whole of the
    // change they see: every Block in the catalogue that renders a section title
    // moves off Display by exactly this much.
    render(
      <FeatureGrid01
        title={TITLE}
        variant="bare"
        features={[{ title: 'First item', body: 'A sentence about it.' }]}
      />,
    )
    const className = rendered(2).className
    expect(className).toContain(step('h2'))
    expect(className).not.toContain(step('h1'))
  })

  it('Hero01 keeps Display at h1 and steps down when the document names it h2', () => {
    // The landing page's own band, and the exact arrangement the issue reports:
    // a hero `h1` beside six section `h2`s, one step apart.
    const { unmount } = render(<Hero01 headingLevel="h1" title={TITLE} />)
    const asH1 = rendered(1).className
    unmount()

    render(<Hero01 headingLevel="h2" title={TITLE} />)
    const asH2 = rendered(2).className

    expect(asH1).toContain('text-5xl')
    expect(asH1).toContain('sm:text-6xl')
    expect(asH2).toContain(step('h2'))
  })

  it('Faq01 rendered one level deeper reads one level deeper', () => {
    // The nesting case `childLevel()` exists for: the same Block, placed inside a
    // region the document already named, and the size moves with the placement
    // rather than staying where it was written.
    const { unmount } = render(
      <Faq01
        headingLevel="h3"
        title={TITLE}
        questions={[{ id: 'first', question: 'First question?', answer: 'An answer.' }]}
      />,
    )
    const deep = rendered(3).className
    unmount()

    render(
      <Faq01
        headingLevel="h4"
        title={TITLE}
        questions={[{ id: 'first', question: 'First question?', answer: 'An answer.' }]}
      />,
    )
    const deeper = rendered(4).className

    expect(deep).toContain(step('h3'))
    expect(deeper).toContain(step('h4'))
    expect(deep).not.toBe(deeper)
  })
})

describe('Cta01', () => {
  it('asks the same table for its headline size rather than keeping its own', () => {
    // The one heading outside `SectionHeading`, because the panel owns its own
    // centred stack. It used to carry the same hardcoded size the Component had,
    // so fixing one and not the other would have left a closing banner one step
    // above every section title on the page and level with the page's own `h1`.
    const { unmount } = render(
      <Cta01 headingLevel="h1" title={TITLE} action={{ label: 'Choose', href: '/go' }} />,
    )
    const asH1 = rendered(1).className
    unmount()

    render(<Cta01 headingLevel="h2" title={TITLE} action={{ label: 'Choose', href: '/go' }} />)
    const asH2 = rendered(2).className

    expect(asH1).toContain(step('h1'))
    expect(asH2).toContain(step('h2'))
    expect(asH1).not.toBe(asH2)
  })

  it('keeps the panel its own weight, tracking and balance', () => {
    // The size is borrowed; the rest of the heading is the panel's. Asserted so a
    // change that made `headingSizeClass` return the whole class string would be
    // caught here rather than shipping a second answer to the same question.
    render(<Cta01 title={TITLE} action={{ label: 'Choose', href: '/go' }} />)
    const className = rendered(2).className
    expect(className).toContain('font-semibold')
    expect(className).toContain('tracking-tight')
    expect(className).toContain('text-balance')
  })
})