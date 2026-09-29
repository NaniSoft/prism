import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PulseGraph } from '../src/components/ui/pulse-graph'
import { PulseSeries } from '../src/components/ui/pulse-series'
import { SignalField } from '../src/components/ui/signal-field'

const NODES = [
  { id: 'a', name: 'issue', x: 0, y: 0.5, lane: 0 },
  { id: 'b', name: 'build', x: 0.5, y: 0.5, lane: 1 },
  { id: 'c', name: 'review', x: 1, y: 0.5, lane: 2 },
]

afterEach(cleanup)

describe('PulseGraph', () => {
  it('names the drawing once, and reads nothing inside it', () => {
    render(<PulseGraph nodes={NODES} label="The build loop, as three stages" />)
    const figure = screen.getByRole('img', { name: 'The build loop, as three stages' })
    // Everything inside a role="img" is presentational, so the node names are
    // drawn and not announced. This is the same contract Diagram holds and the
    // reason the surrounding sentence is what a screen reader gets.
    expect(figure.querySelectorAll('text').length).toBe(3)
  })

  it('leaves the accessibility tree entirely when the drawing is decorative', () => {
    const { container } = render(<PulseGraph nodes={NODES} decorative />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.getAttribute('role')).toBeNull()
  })

  it('counts the relations it dropped rather than swallowing them', () => {
    const { container } = render(
      <PulseGraph
        nodes={NODES}
        relations={[
          { from: 'a', to: 'b', carries: true },
          { from: 'b', to: 'nowhere' },
        ]}
        label="Two relations, one of which names a node that is not there"
      />,
    )
    expect(container.querySelector('svg')?.dataset.unresolvedRelations).toBe('1')
  })

  it('draws a rail and a marker only when the nodes are in lanes', () => {
    const { container: staged } = render(<PulseGraph nodes={NODES} label="Staged" />)
    expect(staged.querySelector('[data-slot="pulse-graph-rail"]')).toBeTruthy()
    expect(staged.querySelector('[data-slot="pulse-graph-marker"]')).toBeTruthy()

    const field = NODES.map(({ lane: _lane, ...rest }) => rest)
    const { container } = render(<PulseGraph nodes={field} label="A field" />)
    expect(container.querySelector('[data-slot="pulse-graph-rail"]')).toBeNull()
    expect(container.querySelector('[data-slot="pulse-graph-marker"]')).toBeNull()
  })

  it('gives a carrying edge a head, so the claim survives motion being off', () => {
    const { container } = render(
      <PulseGraph
        nodes={NODES}
        relations={[{ from: 'a', to: 'b', carries: true }, { from: 'b', to: 'c' }]}
        label="One edge carries and one does not"
      />,
    )
    expect(container.querySelectorAll('[data-slot="pulse-graph-flow"]').length).toBe(1)
  })

  it('animates with the ambient utilities and states no timing of its own', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const path = await import('node:path')
    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/components/ui/pulse-graph.tsx'),
      'utf8',
    )
    // The reason this is asserted rather than assumed: a component that writes a
    // duration into a class string is a component that has moved the one
    // decision the token scale exists to own, and it is invisible in review
    // because the number is right there in a class and looks like any other.
    expect(source).not.toMatch(/duration-\[|animation-\[|cubic-bezier\(|\d+ms\b/)
    expect(source).toMatch(/prism-ambient-/)
  })
})

describe('PulseSeries', () => {
  const BARS = [
    { id: 'a', value: 3 },
    { id: 'b', value: 9, label: 'peak', emphasis: true },
    { id: 'c', value: 5 },
  ]

  it('scales the columns against the caller’s tallest, not a maximum it invented', () => {
    const { container } = render(<PulseSeries bars={BARS} label="Three columns" />)
    const heights = [...container.querySelectorAll('[data-slot="pulse-series-column"] rect')].map(
      (rect) => Number(rect.getAttribute('height')),
    )
    const tallest = Math.max(...heights)
    expect(heights[1]).toBe(tallest)
    // 3/9 and 5/9 of the room, so a caller passing its own numbers gets its own
    // shape rather than a pre-normalised one.
    expect(heights[0]).toBeLessThan(tallest)
    expect(heights[2]).toBeLessThan(heights[1])
  })

  it('draws a zero column as a hairline, because a missing reading is not a zero', () => {
    const { container } = render(
      <PulseSeries bars={[{ id: 'a', value: 0 }, { id: 'b', value: 4 }]} label="A zero among values" />,
    )
    const [zero] = [...container.querySelectorAll('[data-slot="pulse-series-column"] rect')]
    expect(Number(zero?.getAttribute('height'))).toBeGreaterThan(0)
  })

  it('takes the baseline name from the caller and names none of its own', () => {
    const { container } = render(<PulseSeries bars={BARS} baseline="open interest" label="Named" />)
    expect(container.querySelector('[data-slot="pulse-series-baseline"] text')?.textContent).toBe(
      'open interest',
    )
  })

  it('scans only when asked', () => {
    const { container: still } = render(<PulseSeries bars={BARS} label="Still" />)
    expect(still.querySelector('[data-slot="pulse-series-scan"]')).toBeNull()

    const { container } = render(<PulseSeries bars={BARS} scan label="Scanning" />)
    expect(container.querySelector('[data-slot="pulse-series-scan"]')).toBeTruthy()
  })
})

describe('SignalField', () => {
  it('is decorative by default, because a field of marks is not information', () => {
    const { container } = render(<SignalField />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('is still unless asked to drift', async () => {
    const { container } = render(<SignalField />)
    expect(container.querySelector('.prism-ambient-drift')).toBeNull()

    const { container: moving } = render(<SignalField drift />)
    expect(moving.querySelector('.prism-ambient-drift')).toBeTruthy()
  })

  it('places the same marks on every render, so hydration cannot disagree with itself', () => {
    const first = render(<SignalField count={12} />)
    const a = [...first.container.querySelectorAll('circle')].map((c) => `${c.getAttribute('cx')},${c.getAttribute('cy')}`)
    first.unmount()
    const second = render(<SignalField count={12} />)
    const b = [...second.container.querySelectorAll('circle')].map((c) => `${c.getAttribute('cx')},${c.getAttribute('cy')}`)
    // A field that reshuffled between renders would be a hydration mismatch, which
    // is a correctness bug that happens to look like variety.
    expect(a).toEqual(b)
  })
})
