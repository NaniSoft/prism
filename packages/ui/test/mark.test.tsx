import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { Mark } from '../src/components/ui/mark'

/**
 * A run of text with its matches visibly marked.
 *
 * The claims under test are three and the third is the one that matters most. The
 * first is that the marked characters are the ones the caller named and the
 * unmarked ones are text, so a result row reads as a sentence with part of it
 * emphasised rather than as a set of fragments. The second is that the ranges are
 * handled rather than refused, because a search backend reports overlapping and
 * unordered ranges as a matter of course. The third is that the mark carries no
 * semantics: a result list that announced "highlighted" between every character
 * would be less readable, and the failure is invisible to review because nothing
 * looks different on screen.
 */
describe('the match treatment', () => {
  const marks = (container: HTMLElement) => [...container.querySelectorAll('mark')]

  it('marks the run the caller named and leaves the rest as text', () => {
    const { container } = render(<Mark text="prism component" ranges={[{ start: 6, end: 15 }]} />)

    expect(container.textContent).toBe('prism component')
    expect(marks(container).map((m) => m.textContent)).toEqual(['component'])
  })

  it('marks several runs and keeps the order the caller passed them in', () => {
    const { container } = render(
      <Mark
        text="data tables and data cards"
        ranges={[
          { start: 21, end: 26 },
          { start: 0, end: 4 },
        ]}
      />,
    )

    // The second range starts first, so the rendering has to sort them or the
    // output is fragments in the wrong order, which is a real result list a reader
    // would notice.
    expect(marks(container).map((m) => m.textContent)).toEqual(['data', 'cards'])
    expect(container.textContent).toBe('data tables and data cards')
  })

  it('merges overlapping ranges rather than nesting two marks', () => {
    const { container } = render(
      <Mark
        text="abracadabra"
        ranges={[
          { start: 0, end: 4 },
          { start: 2, end: 6 },
        ]}
      />,
    )

    // Two matches that share a character are two marks that overlap, and an
    // overlapping pair of `mark` elements is a thing a screen reader reads twice.
    // `abra` and `raca` share two characters, so the merged run is `abraca`.
    expect(marks(container).map((m) => m.textContent)).toEqual(['abraca'])
  })

  it('renders bare text when there is nothing to mark, rather than a mark that marks nothing', () => {
    const { container } = render(<Mark text="no hits here" ranges={[]} />)
    expect(marks(container)).toEqual([])
    expect(container.textContent).toBe('no hits here')
  })

  it('drops a range that runs past the end of the string', () => {
    const { container } = render(<Mark text="short" ranges={[{ start: 0, end: 99 }]} />)
    // A backend indexing a normalised form reports an end this string does not
    // have, and a Component that threw there would be one a consumer wraps in a
    // try, which is a worse failure than a highlight that stops at the last
    // character.
    expect(marks(container).map((m) => m.textContent)).toEqual(['short'])
  })

  it('ignores a range that is empty or inverted', () => {
    const { container } = render(
      <Mark
        text="alpha beta"
        ranges={[
          { start: 3, end: 3 },
          { start: 8, end: 2 },
        ]}
      />,
    )
    expect(marks(container)).toEqual([])
    expect(container.textContent).toBe('alpha beta')
  })

  it('adds no role and no accessible name, because a search hit is not an announcement', () => {
    const { container } = render(<Mark text="result row" ranges={[{ start: 0, end: 6 }]} />)
    const mark = marks(container)[0]

    // The invisible failure. A `mark` that acquired a role, or an `aria-label` on
    // it, would make every search result read differently and no visual regression
    // would ever show it, which is why the assertion is on the attributes rather
    // than on how it looks.
    expect(mark.getAttribute('role')).toBeNull()
    expect(mark.getAttribute('aria-label')).toBeNull()
    expect(mark.getAttribute('aria-live')).toBeNull()
    // And the element itself is the semantic one: `mark` already means "text the
    // user marked or that matched", so a role on top of it would be redundant at
    // best and contradictory at worst.
    expect(mark.tagName).toBe('MARK')
  })

  it('resolves the treatment to a token pair rather than a literal colour', () => {
    const { container } = render(<Mark text="tokenised" ranges={[{ start: 0, end: 4 }]} />)
    const className = marks(container)[0].getAttribute('class') ?? ''

    // The treatment is a surface and a foreground, because a mark sits behind the
    // text it marks. Both are the existing warning pair, which the token contrast
    // gate already measures in every pack and both modes, so a new role is not
    // introduced for a meaning it would lose.
    expect(className).toContain('bg-warning')
    expect(className).toContain('text-warning-foreground')
    expect(className).not.toMatch(/#[0-9a-f]{3,6}/i)
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(<Mark text="component library" ranges={[{ start: 0, end: 9 }]} />)
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
