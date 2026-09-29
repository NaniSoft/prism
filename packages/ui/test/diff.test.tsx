import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { Diff, type DiffLine } from '../src/components/ui/diff'

/**
 * A change, as lines with the numbers they had and the numbers they have.
 *
 * The claim under test that matters most is the one this Component is built
 * around: the bar's width is the fraction of the line that actually changed, not
 * a marker saying the line changed at all. That is a measurement, and a
 * measurement is the kind of claim that is easy to write and easy to get quietly
 * wrong, so the tests check the arithmetic rather than the presence of a bar.
 *
 * The three failure modes worth naming are all invisible in a screenshot. Two
 * overlapping ranges would report more than the whole line changed and push the
 * bar past the end of its own gutter. A range past the end of the content would
 * slice a string that is not there. And a line with no changed ranges must draw
 * no bar at all rather than a minimum-width one, because a zero-width mark beside
 * an unchanged line reads as a line that changed a little.
 */
const LABELS = { added: 'Added', removed: 'Removed', context: 'Unchanged' }

const CHANGE: DiffLine[] = [
  { kind: 'context', oldNumber: 1, newNumber: 1, content: 'export function run() {' },
  {
    kind: 'removed',
    oldNumber: 2,
    content: '  const limit = 100',
    changed: [
      [8, 13],
    ],
  },
  {
    kind: 'added',
    newNumber: 2,
    content: '  const limit = 250',
    changed: [
      [16, 19],
    ],
  },
  { kind: 'context', oldNumber: 3, newNumber: 3, content: '}' },
]

describe('the Diff', () => {
  const rows = (container: HTMLElement) => [...container.querySelectorAll('tr')]
  const bar = (row: Element) => row.querySelector<HTMLElement>('[data-slot="diff-bar"]')

  it('is a table, so the numbers and the text are navigable rather than a grid of divs', () => {
    render(<Diff lines={CHANGE} label="Changes to run" labels={LABELS} file="src/run.ts" />)
    // A diff is two columns of numbers beside a column of text, and row and column
    // navigation come from the semantics rather than from a layout.
    const table = screen.getByRole('table', { name: 'Changes to run' })
    expect(table.tagName).toBe('TABLE')
    expect(rows(table)).toHaveLength(4)
  })

  it('carries the side in the numbers rather than in the colour', () => {
    const { container } = render(<Diff lines={CHANGE} label="Changes" labels={LABELS} />)
    const [, removed, added] = rows(container)
    // A removed line has an old number and no new one. That absence is the whole
    // side indicator, and it is structural: nothing about it depends on telling
    // red from green.
    expect(removed.querySelector('[data-slot="diff-old-number"]')?.textContent).toBe('2')
    expect(removed.querySelector('[data-slot="diff-new-number"]')?.textContent).toBe('')
    expect(added.querySelector('[data-slot="diff-old-number"]')?.textContent).toBe('')
    expect(added.querySelector('[data-slot="diff-new-number"]')?.textContent).toBe('2')
  })

  it('measures the bar as the fraction of the line that changed, not as a side marker', () => {
    const { container } = render(
      <Diff
        lines={[
          {
            kind: 'added',
            newNumber: 1,
            content: '0123456789',
            changed: [
              [0, 5],
            ],
          },
        ]}
        label="Changes"
        labels={LABELS}
      />,
    )
    // Half the line changed, so half the bar. A wash would be 100 percent here and
    // on a line where one character moved, which is exactly the distinction this
    // Component exists to draw.
    expect(bar(rows(container)[0])?.style.width).toBe('50%')
  })

  it('scales a one-character change in a long line down to almost nothing', () => {
    const { container } = render(
      <Diff
        lines={[
          {
            kind: 'added',
            newNumber: 1,
            content: 'x'.repeat(200),
            changed: [
              [100, 101],
            ],
          },
        ]}
        label="Changes"
        labels={LABELS}
      />,
    )
    // The reader's eye is fast at finding marks and slow at comparing them. A
    // one-character change in a long line is the least interesting change in a
    // file and it should be the smallest mark in it. Measured honestly rather than
    // floored: a minimum width on a real measurement would have the bar claim
    // twelve percent when the data says half a percent, and a measurement is not
    // allowed to overstate what it measured.
    expect(Number.parseFloat(bar(rows(container)[0])?.style.width ?? '0')).toBeCloseTo(0.5, 1)
  })

  it('clamps overlapping ranges to the line rather than reporting more than the whole line', () => {
    const { container } = render(
      <Diff
        lines={[
          {
            kind: 'added',
            newNumber: 1,
            content: '0123456789',
            changed: [
              [0, 8],
              [2, 9],
            ],
          },
        ]}
        label="Changes"
        labels={LABELS}
      />,
    )
    // Two ranges covering 16 characters of a 10-character line. Unclamped that is
    // 160 percent, and a bar past the end of its own gutter says nothing.
    expect(bar(rows(container)[0])?.style.width).toBe('100%')
  })

  it('clamps a range that runs past the end of the content', () => {
    const { container } = render(
      <Diff
        lines={[
          {
            kind: 'removed',
            oldNumber: 1,
            content: 'short',
            changed: [
              [0, 99],
            ],
          },
        ]}
        label="Changes"
        labels={LABELS}
      />,
    )
    expect(bar(rows(container)[0])?.style.width).toBe('100%')
    // And the emphasised text is the content, not a slice of nothing.
    expect(rows(container)[0].querySelector('[data-slot="diff-content"]')?.textContent).toBe('short')
  })

  it('draws no bar on a context line rather than a zero-width one', () => {
    const { container } = render(<Diff lines={CHANGE} label="Changes" labels={LABELS} />)
    // A zero-width mark beside an unchanged line reads as a line that changed a
    // little, which is a claim the diff is in the middle of contradicting.
    expect(bar(rows(container)[0])).toBeNull()
    expect(bar(rows(container)[1])).not.toBeNull()
  })

  it('draws a minimum bar for a changed line with no ranges, so the line is not invisible', () => {
    const { container } = render(
      <Diff
        lines={[{ kind: 'added', newNumber: 1, content: 'a whole new line' }]}
        label="Changes"
        labels={LABELS}
      />,
    )
    // A backend that reports a line change without ranges is normal, and a bar at
    // zero percent would make the only added line in the file look like a context
    // line. The floor is what keeps the line findable; the number column is what
    // says what happened to it.
    const width = Number.parseFloat(bar(rows(container)[0])?.style.width ?? '0')
    expect(width).toBeGreaterThan(0)
  })

  it('emphasises the changed words by weight rather than by tinting them', () => {
    const { container } = render(<Diff lines={CHANGE} label="Changes" labels={LABELS} />)
    const content = rows(container)[2].querySelector('[data-slot="diff-content"]')
    const strong = content?.querySelector('strong')
    // Weight survives greyscale. A diff that tinted its changed words green and
    // red would spend the two hues a reader is most likely to be unable to tell
    // apart, and would also fight the line's own state colour.
    expect(strong?.textContent).toBe('250')
    expect(strong?.className).toContain('font-semibold')
    expect(strong?.className).not.toMatch(/text-(?:success|destructive)/)
  })

  it('names the state of each line in the caller own words, so nothing is colour alone', () => {
    const { container } = render(
      <Diff lines={CHANGE} label="Changes" labels={{ added: 'Ajoute', removed: 'Supprime', context: 'Inchange' }} />,
    )
    const [, removed, added] = rows(container)
    expect(removed.querySelector('[data-slot="diff-content"]')?.getAttribute('aria-label')).toBe(
      'Supprime',
    )
    expect(added.querySelector('[data-slot="diff-content"]')?.getAttribute('aria-label')).toBe(
      'Ajoute',
    )
  })

  it('counts the lines on the header for a caller to style, and ships no sentence', () => {
    const { container } = render(
      <Diff lines={CHANGE} label="Changes" labels={LABELS} file="src/run.ts" />,
    )
    const summary = container.querySelector('[data-slot="diff-summary"]')
    // The words are the caller's because a sentence is not this package's to ship,
    // and the counts are exposed as data because a diff of a rename has no
    // additions at all and a computed sentence would get that wrong.
    expect(summary?.getAttribute('data-added')).toBe('1')
    expect(summary?.getAttribute('data-removed')).toBe('1')
    expect(summary?.textContent).toBe('')
  })

  it('shows the summary the caller passed in place of its own', () => {
    render(
      <Diff lines={CHANGE} label="Changes" labels={LABELS} summary="1 addition, 1 deletion" />,
    )
    expect(screen.getByText('1 addition, 1 deletion')).toBeTruthy()
  })

  it('authors the empty change rather than rendering an empty table', () => {
    const { container } = render(
      <Diff lines={[]} label="Changes" labels={LABELS} empty="No changes" />,
    )
    expect(container.querySelector('table')).toBeNull()
    expect(screen.getByText('No changes')).toBeTruthy()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <Diff lines={CHANGE} label="Changes to run" labels={LABELS} file="src/run.ts" />,
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
