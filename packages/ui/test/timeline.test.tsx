import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { Timeline, type TimelineEntry } from '../src/components/ui/timeline'

/**
 * A run's events in order, with the time each one took drawn to scale.
 *
 * The claims under test are the ones that make this a Timeline rather than a list
 * with a rule down the side. The bars share a left edge and are scaled against the
 * longest step in the run, so "which step was slow" is answerable by looking. A
 * step with no duration draws no bar, because a zero-width bar says "this was
 * instant" rather than "this has no duration". The order is in the accessibility
 * tree as an ordered list, so a reader hears the sequence and the count.
 *
 * The two silent failures are a duration of zero and a run where no step reports a
 * duration at all. Both divide by `longest`, and both are invisible in a
 * screenshot because a missing bar looks the same as a deliberate one.
 */
const RUN: TimelineEntry[] = [
  { id: 'plan', title: 'Plan', duration: 900 },
  { id: 'read', title: 'Read feed', duration: 4200 },
  { id: 'edit', title: 'Edit source', duration: 1200, children: 'Two files changed' },
  { id: 'done', title: 'Ready' },
]

describe('the Timeline', () => {
  const entries = (container: HTMLElement) => [
    ...container.querySelectorAll('[data-slot="timeline-entry"]'),
  ]
  const bars = (container: HTMLElement) => [
    ...container.querySelectorAll<HTMLElement>('[data-slot="timeline-bar"]'),
  ]

  it('is a named ordered list, so the order and the count are in the accessibility tree', () => {
    render(<Timeline entries={RUN} label="Run steps" />)
    // An ordered list rather than a set of divs: the sequence is the information,
    // and a reader is told it without reading the visual order.
    const list = screen.getByRole('list', { name: 'Run steps' })
    expect(list.tagName).toBe('OL')
    expect(entries(list).every((entry) => entry.tagName === 'LI')).toBe(true)
  })

  it('scales every bar against the longest step in the run, from a shared left edge', () => {
    const { container } = render(<Timeline entries={RUN} label="Run steps" />)
    const drawn = bars(container)
    // Four entries, one of which reports no duration, so three bars. The longest
    // is the 4200ms read, which is the full width, and the 900ms plan is a fifth
    // of it. A reader sees the shape of where the time went without reading a
    // number.
    expect(drawn).toHaveLength(3)
    expect(drawn[1].style.width).toBe('100%')
    expect(Number.parseFloat(drawn[0].style.width)).toBeCloseTo(21.43, 1)
  })

  it('draws no bar for a step with no duration, rather than a bar that reads as instant', () => {
    const { container } = render(<Timeline entries={RUN} label="Run steps" />)
    const steps = entries(container)
    // The run's opening event has no length, and a zero-width bar beside it would
    // claim the step was instant rather than that its duration is meaningless.
    expect(steps).toHaveLength(4)
    expect(bars(container)).toHaveLength(3)
    expect(steps[3].querySelector('[data-slot="timeline-bar"]')).toBeNull()
  })

  it('writes the duration the caller formatted, and tabular so a column lines up', () => {
    const { container } = render(<Timeline entries={RUN} label="Run steps" />)
    const read = [...container.querySelectorAll('[data-slot="timeline-duration"]')].map(
      (node) => node.textContent,
    )
    expect(read).toEqual(['900ms', '4.2s', '1.2s'])
    // Proportional digits make the decimal points drift sideways between rows, and
    // a column of durations is read as a column.
    expect(
      container.querySelector('[data-slot="timeline-duration"]')?.className,
    ).toContain('tabular-nums')
  })

  it('uses the caller own formatter when it has one', () => {
    const { container } = render(
      <Timeline
        entries={RUN}
        label="Run steps"
        format={(ms) => `${(ms / 1000).toFixed(0)} seconds`}
      />,
    )
    const read = [...container.querySelectorAll('[data-slot="timeline-duration"]')].map(
      (node) => node.textContent,
    )
    expect(read).toEqual(['1 seconds', '4 seconds', '1 seconds'])
  })

  it('draws no bars at all when no step reports a duration, rather than dividing by nothing', () => {
    const { container } = render(
      <Timeline
        entries={[
          { id: 'a', title: 'Queued' },
          { id: 'b', title: 'Started' },
        ]}
        label="Run steps"
      />,
    )
    // The scale is the longest duration and there is none, so there is no scale.
    // Every bar is omitted rather than drawn at an arbitrary width, which is the
    // same failure a NaN width would produce and just as invisible.
    expect(bars(container)).toEqual([])
    expect(entries(container)).toHaveLength(2)
  })

  it('ignores a zero duration rather than treating it as the longest step', () => {
    const { container } = render(
      <Timeline
        entries={[
          { id: 'a', title: 'Instant', duration: 0 },
          { id: 'b', title: 'Slow', duration: 500 },
        ]}
        label="Run steps"
      />,
    )
    // A zero would win the longest-step comparison and scale everything else to
    // nothing, which is a run whose only visible bar is the step that took no time.
    expect(bars(container)).toHaveLength(1)
    expect(bars(container)[0].style.width).toBe('100%')
  })

  it('stops the spine at the last entry instead of trailing past the end of the run', () => {
    const { container } = render(<Timeline entries={RUN} label="Run steps" />)
    // A rule that continues below the final mark is read as a step that has not
    // arrived yet, which is a claim about the run rather than a border.
    const spines = [...container.querySelectorAll('[data-slot="timeline-spine"]')]
    expect(spines).toHaveLength(RUN.length - 1)
  })

  it('hides the marks from assistive technology, because the entry own words carry the state', () => {
    const { container } = render(
      <Timeline
        entries={[{ id: 'a', title: 'Failed to fetch', state: 'failed' }]}
        label="Run steps"
      />,
    )
    // Never colour alone. A reader who cannot separate the marks still reads
    // "Failed to fetch" on the entry itself.
    //
    // The attribute is on the rail rather than on the mark, because the rail holds
    // the mark and the spine and one attribute on the parent hides both. Asserting
    // it on the mark would be asserting on the child and would pass even if the
    // spine were left exposed.
    expect(
      container.querySelector('[data-slot="timeline-rail"]')?.getAttribute('aria-hidden'),
    ).toBe('true')
  })

  it('records the state on the entry so a caller can target it, and does not stop there', () => {
    const { container } = render(
      <Timeline
        entries={[
          { id: 'a', title: 'Running', state: 'running' },
          { id: 'b', title: 'Failed', state: 'failed' },
        ]}
        label="Run steps"
      />,
    )
    const [running, failed] = entries(container)
    expect(running.getAttribute('data-state')).toBe('running')
    expect(failed.getAttribute('data-state')).toBe('failed')
    // And the state is legible without the attribute, in the words.
    expect(screen.getByText('Failed')).toBeTruthy()
  })

  it('authors the empty run rather than rendering a list with nothing in it', () => {
    const { container } = render(
      <Timeline entries={[]} label="Run steps" empty="Waiting for the first event" />,
    )
    expect(container.querySelector('[role="list"]')).toBeNull()
    expect(screen.getByText('Waiting for the first event')).toBeTruthy()
  })

  it('renders the detail a caller passed under a step', () => {
    render(<Timeline entries={RUN} label="Run steps" />)
    expect(screen.getByText('Two files changed')).toBeTruthy()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <Timeline
        entries={RUN.map((entry) => ({ ...entry, state: 'done' as const }))}
        label="Run steps"
      />,
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
