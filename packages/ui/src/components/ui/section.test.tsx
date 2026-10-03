import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Section, SectionHeading, headingSizeClass, type HeadingLevel } from './section'

describe('Section', () => {
  it('renders a section with its heading at the composed level', () => {
    render(
      <Section>
        <SectionHeading title="Features" description="What ships in v1." />
      </Section>,
    )
    expect(screen.getByRole('heading', { name: 'Features', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('What ships in v1.')).toBeInTheDocument()
  })

  it('renders the heading at the level the document asks for', () => {
    render(<SectionHeading as="h3" title="Nested" />)
    expect(screen.getByRole('heading', { name: 'Nested', level: 3 })).toBeInTheDocument()
  })
})

/**
 * The step each heading level renders at, written out rather than read from
 * `headingSizeClass`.
 *
 * Duplicated on purpose, and the reason is the shape of the assertion. Every case
 * below compares what a Component rendered against this table, so a change to
 * `HEADING_SIZE` that was not also a deliberate change to this table fails here,
 * which is the drift this file exists to catch. Reading the table out of the
 * implementation and asserting it against itself would pass for any value at all,
 * including the single size every level used to share.
 *
 * The values are the authored ones, off `packages/tokens/src/foundation/base.tokens.json`.
 */
const STEP: Record<HeadingLevel, string> = {
  h1: 'text-3xl sm:text-4xl',
  h2: 'text-2xl sm:text-3xl',
  h3: 'text-xl sm:text-2xl',
  h4: 'text-lg sm:text-xl',
  h5: 'text-lg sm:text-xl',
  h6: 'text-lg sm:text-xl',
}

const LEVELS: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/**
 * The heading `SectionHeading` rendered, by its level.
 *
 * A heading is queried by role and level rather than by class so a case cannot
 * pass on the wrong element: the question is what the heading itself declares.
 */
function headingAt(level: HeadingLevel): HTMLElement {
  render(<SectionHeading as={level} title="Sized" />)
  return screen.getByRole('heading', { level: Number(level.slice(1)) })
}

/**
 * What a class-string assertion proves here, stated so it is not read as more
 * than it is.
 *
 * jsdom applies no stylesheet, so nothing in this file measures a pixel and
 * nothing in it can see that 1.875rem looks larger than 1.5rem. What it proves is
 * that the Component *declares* a different authored step per level, which is the
 * half that drifted: before the fix every level rendered one string, so the
 * declaration itself was identical and no amount of browser would have separated
 * an `h1` from an `h2`. The pixels are the tokens' business and
 * `packages/tokens` owns them.
 */
describe('a heading is sized by its level', () => {
  it('does not render an h1 and an h2 at one size', () => {
    // The defect this file was written for, as a case rather than as prose: before
    // the fix both assertions below saw `text-3xl font-semibold tracking-tight
    // text-balance sm:text-4xl`, so the page's thesis and the section under it
    // were byte-identical in the markup a consumer composes.
    expect(headingAt('h1').className).not.toBe(headingAt('h2').className)
  })

  for (const level of LEVELS) {
    it(`renders ${level} at the step the scale gives it`, () => {
      const heading = headingAt(level)
      expect(heading.className).toContain(STEP[level])
      // And at nothing else in the table, so a level that kept another level's
      // step while gaining one of its own cannot pass.
      for (const other of LEVELS) {
        if (other === level) continue
        if (STEP[other] === STEP[level]) continue
        expect(heading.className).not.toContain(STEP[other])
      }
    })
  }

  it('steps down once per level until it floors, and floors at h4', () => {
    // `text-lg` is the deepest authored step that is not smaller than Body, so
    // three levels share it. Asserted as the shape of the table rather than as a
    // count, because the count is the thing that would be re-derived by hand.
    expect(new Set(LEVELS.map((level) => STEP[level])).size).toBe(4)
    expect(STEP.h1).not.toBe(STEP.h2)
    expect(STEP.h2).not.toBe(STEP.h3)
    expect(STEP.h3).not.toBe(STEP.h4)
    expect(STEP.h4).toBe(STEP.h5)
    expect(STEP.h5).toBe(STEP.h6)
  })

  it('puts nothing above the h1 step, so nothing goes above 4xl', () => {
    // The ceiling is a law in DESIGN.md and this is the case that holds it from
    // the other side: the answer for a page h1 is a step the authored scale
    // already has, so adding a level can never ask for one above it.
    expect(STEP.h1).toContain('text-3xl')
    expect(STEP.h1).toContain('sm:text-4xl')
  })

  for (const level of LEVELS) {
    it(`keeps the weight, the tracking and the balance at ${level}`, () => {
      // These three are on the heading rather than in the step, so a step that
      // grew a size must not have grown them away.
      const className = headingAt(level).className
      expect(className).toContain('font-semibold')
      expect(className).toContain('tracking-tight')
      expect(className).toContain('text-balance')
    })
  }

  for (const level of LEVELS) {
    it(`keeps the centred alignment at ${level}`, () => {
      // `align` lives on the wrapper and the step on the heading, so a case
      // asserting only the heading's class would pass a centred heading that
      // centred nothing. Read as the pair, for the reason
      // `test/section-heading-align.test.tsx` gives.
      const { container } = render(<SectionHeading as={level} align="center" title="Centred" />)
      const wrapper = screen.getByRole('heading', { name: 'Centred' }).parentElement!
      expect(wrapper.className).toContain('items-center')
      expect(wrapper.className).toContain('text-center')
      expect(container).toBeTruthy()
    })
  }

  it('keeps the left alignment at every level too', () => {
    for (const level of LEVELS) {
      const { unmount } = render(<SectionHeading as={level} align="left" title="Left" />)
      const wrapper = screen.getByRole('heading', { name: 'Left' }).parentElement!
      expect(wrapper.className).toContain('items-start')
      expect(wrapper.className).toContain('text-left')
      unmount()
    }
  })
})

describe('headingSizeClass', () => {
  it('is the table SectionHeading renders, for every level', () => {
    // The exported door onto the private map. A case that compared the function
    // against itself would prove nothing, so it compares it against the same
    // table the rendered cases above used.
    for (const level of LEVELS) {
      expect(headingSizeClass(level)).toBe(STEP[level])
    }
  })

  it('carries no weight, tracking or balance, so a caller composes its own', () => {
    // `Cta01` renders its heading on a filled primary panel and asks this for the
    // size only. If the answer grew a weight the panel's own decisions would be
    // unreachable from the outside.
    expect(headingSizeClass('h1')).not.toContain('font-')
    expect(headingSizeClass('h1')).not.toContain('tracking-')
    expect(headingSizeClass('h1')).not.toContain('text-balance')
  })
})