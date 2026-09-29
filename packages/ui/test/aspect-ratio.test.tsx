import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { AspectRatio } from '../src/components/ui/aspect-ratio'
import { Diagram, type DiagramNode } from '../src/components/ui/diagram'

/**
 * A box whose height follows its width at a stated ratio.
 *
 * The claims under test are the ones that would be invisible in a screenshot. A
 * ratio that cannot be drawn must not collapse the box, because `aspect-ratio: 0`
 * and a failed image look identical to a reader and mean opposite things. The
 * ratio must be applied as a value rather than as a class name, because Prism's
 * stylesheet scans Prism's own source and a caller's arbitrary utility is a
 * silently missing rule. And it must not be a second Diagram: the two hold
 * different content and answer different questions, which is worth asserting
 * rather than asserting in prose only.
 */
const NODES: DiagramNode[] = [{ id: 'a', name: 'The only node', x: 0, y: 0 }]

describe('the AspectRatio', () => {
  const box = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-slot="aspect-ratio"]')

  it('applies the ratio it was given, as a value rather than as a class', () => {
    const { container } = render(<AspectRatio ratio={4 / 3} />)
    const el = box(container)
    // A `ratio` prop rather than a `className`, because Tailwind is this
    // package's internal build dependency and not the consumer's: a utility typed
    // by a consumer appears in no Prism source file, so it is in no emitted
    // stylesheet and the box silently gets whatever ratio its content has.
    expect(el?.style.aspectRatio).toBe('1.3333333333333333')
    expect(el?.className).not.toMatch(/aspect-/)
  })

  it('holds a wide ratio by default, because that is the common case and a guess is a default', () => {
    const { container } = render(<AspectRatio />)
    // 16/9, the shape a screenshot, a video and a map all arrive in. The value is
    // stated rather than left to a class, so a consumer that did not think about
    // the ratio still gets one that holds.
    expect(box(container)?.style.aspectRatio).toBe(`${16 / 9}`)
  })

  it('draws the default ratio for a ratio that is not a number', () => {
    const { container } = render(<AspectRatio ratio={Number.NaN} />)
    // `aspect-ratio: NaN` is not a ratio, it is a division that has not happened.
    // Collapsing the box to nothing would read as a broken image rather than as a
    // missing number, so the default is drawn and the value that was refused is
    // carried on the element for a caller to find.
    expect(box(container)?.style.aspectRatio).toBe(`${16 / 9}`)
    expect(box(container)?.getAttribute('data-ratio')).toBe('NaN')
  })

  it('draws the default ratio for a zero or negative ratio', () => {
    const zero = render(<AspectRatio ratio={0} />)
    expect(box(zero.container)?.style.aspectRatio).toBe(`${16 / 9}`)
    const negative = render(<AspectRatio ratio={-1} />)
    expect(box(negative.container)?.style.aspectRatio).toBe(`${16 / 9}`)
  })

  it('reports the ratio it actually drew, so a substituted one is legible in the DOM', () => {
    const { container } = render(<AspectRatio ratio={2} />)
    // The claim is not the drawing, which a screenshot cannot check, but that the
    // DOM says which of the two numbers is in force.
    expect(box(container)?.getAttribute('data-ratio')).toBe('2')
  })

  it('clips its content, because a box that fixes its height and then overflows has failed', () => {
    const { container } = render(<AspectRatio ratio={1} />)
    // The content is free to be any size, so the box has to be the thing that
    // holds. A caller whose content should escape passes overflow through
    // className, which is a decision about their content rather than about the
    // ratio.
    expect(box(container)?.className).toContain('overflow-hidden')
  })

  it('fills its width, so the height follows the column it is in', () => {
    const { container } = render(<AspectRatio ratio={1} />)
    expect(box(container)?.className).toContain('w-full')
  })

  it('keeps its content in the accessibility tree, which the Diagram does not', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <button type="button">Play</button>
      </AspectRatio>,
    )
    // This is the sharpest difference from the Diagram and the reason the two are
    // not one Component. A Diagram is `role="img"`, so everything inside it is
    // presentational and a caller's sentence is what a screen reader gets. A ratio
    // box holds arbitrary content and keeps it: a video player, a chart with its
    // own controls, a map with a legend.
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })

  it('is not a second Diagram, whose canvas has its own fixed ratio and a whole subtree hidden', () => {
    const { container } = render(
      <>
        <AspectRatio ratio={4 / 3} />
        <Diagram nodes={NODES} relations={[]} label="One node" />
      </>,
    )
    const ratio = box(container)
    const diagram = container.querySelector('[data-slot="diagram"]')
    // A Diagram's ratio is a consequence of the 640 by 400 canvas it draws into
    // and is not the caller's to choose; this one is nothing but the caller's
    // number. Asserting both in one document is the cheapest way to show they are
    // two Components rather than one Component with a prop.
    expect(ratio?.style.aspectRatio).toBe('1.3333333333333333')
    expect(diagram?.getAttribute('viewBox')).toBe('0 0 640 400')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img src="/chart.png" alt="Spend by month, January to June" />
      </AspectRatio>,
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
