import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { STATUS_TIERS, StatusLedger01, type StatusTier } from '../src/blocks/status-ledger-01'

/**
 * The contested shape this Block ships is the tier set, and the claim is that four
 * is the number of states rather than the number of words.
 *
 * Between them the four NaniSoft sites use eight words for those four states, so
 * the test that matters is the one that proves the words are the caller's and the
 * colour is Prism's: a row whose `statusLabel` is a sentence still renders, and
 * the dot is still `aria-hidden`, so nothing about the row depends on a reader
 * being able to see it.
 */
const ROWS = [
  { name: 'Access traversal', status: 'live' as const, statusLabel: 'Flagship - available today' },
  { name: 'Containment rehearsal', status: 'designed' as const, statusLabel: 'Specified, not built' },
  { name: 'Privilege hygiene', status: 'planned' as const, statusLabel: 'Planned' },
  { name: 'Strategy backtesting', status: 'direction' as const, statusLabel: 'Research direction' },
]

describe('a ledger of things and their state', () => {
  it('admits four tiers and refuses a fifth in the type', () => {
    expect(STATUS_TIERS).toEqual(['live', 'designed', 'planned', 'direction'])
    expect(STATUS_TIERS).toHaveLength(4)

    // The line below does not compile. If a fifth tier were ever added to the
    // closed set the directive would become unused and this test would fail.
    // @ts-expect-error a fifth tier is a compile error, by design
    const fifth: StatusTier = 'deprecated'
    expect(fifth).toBeTruthy()
  })

  it('gives every tier a distinct mark, so two tiers never look alike', () => {
    const { container } = render(<StatusLedger01 rows={ROWS} />)

    const marks = new Set(
      [...container.querySelectorAll('[data-slot="status-ledger-row"] [data-tier]')].map(
        (dot) => dot.className,
      ),
    )
    expect(marks.size).toBe(STATUS_TIERS.length)
  })

  it('hides the dot and keeps the words, so the state is never colour alone', () => {
    const { container } = render(<StatusLedger01 rows={ROWS} title="Use cases" />)

    const dots = container.querySelectorAll('[data-slot="status-ledger-row"] [data-tier]')
    expect(dots).toHaveLength(4)
    for (const dot of dots) expect(dot.getAttribute('aria-hidden')).toBe('true')

    // The product's own sentence survives verbatim, which is the whole point of
    // splitting the tier from the label.
    expect(screen.getByText('Flagship - available today')).toBeTruthy()
    expect(screen.getByText('Research direction')).toBeTruthy()
  })

  it('is a list in the document outline rather than a grid of divs', () => {
    const { container } = render(<StatusLedger01 rows={ROWS} />)
    const ledger = container.querySelector('[data-slot="status-ledger"]')!
    expect(ledger.tagName).toBe('OL')
    expect(ledger.children).toHaveLength(4)
  })

  it('renders a row with only a name and a state, and adds a detail or bullets when given them', () => {
    const { container } = render(
      <StatusLedger01
        rows={[
          { name: 'Bare', status: 'live', statusLabel: 'Live' },
          { name: 'Detailed', status: 'live', statusLabel: 'Live', detail: 'One sentence.' },
          { name: 'Bulleted', status: 'live', statusLabel: 'Live', bullets: ['One', 'Two'] },
        ]}
      />,
    )

    const rows = [...container.querySelectorAll('[data-slot="status-ledger-row"]')]
    expect(rows[0]?.textContent).toBe('BareLive')
    expect(rows[1]?.textContent).toContain('One sentence.')
    expect(rows[2]?.querySelectorAll('li')).toHaveLength(2)
  })
})
