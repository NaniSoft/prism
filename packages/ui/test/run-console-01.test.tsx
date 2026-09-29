import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { RunConsole01, type RunConsole01Copy } from '../src/blocks/run-console-01/run-console'
import type { TimelineEntry } from '../src/components/ui/timeline'

/**
 * A run, as a heading, a budget and the steps that got there.
 *
 * This is a Block, so the claim under test is not that any one part works but that
 * the parts are composed correctly and that the Block adds the two things that
 * belong to neither of them.
 *
 * The first is that a run with no budget gets no budget. A Block that drew an
 * empty Meter for a local run would be showing a measurement of nothing, which is
 * the exact thing the Meter exists to avoid, and it would be invisible because an
 * empty meter looks like a meter.
 *
 * The second is that streaming marks the region busy and wraps the steps in a
 * live region, and that the live region wraps the steps and *not* the budget.
 * Wrapping both would re-read the spending on every append, and a region that
 * announces more than what changed is a region whose announcements stop being read.
 */
const COPY: RunConsole01Copy = {
  budgetLabel: 'Budget spent',
  budgetValue: (value, max) => `${value} of ${max}`,
  stepsLabel: 'Run steps',
  title: 'Run',
  waiting: 'Waiting for the first step',
}

const STEPS: TimelineEntry[] = [
  { id: 'plan', title: 'Plan', duration: 900, state: 'done' },
  { id: 'read', title: 'Read the feed', duration: 4200, state: 'done' },
  { id: 'edit', title: 'Edit source', duration: 1200, state: 'running' },
]

const render_ = (props: Partial<Parameters<typeof RunConsole01>[0]> = {}) =>
  render(<RunConsole01 title="Nightly reconcile" copy={COPY} steps={STEPS} {...props} />)

describe('the Run console', () => {
  it('names the run and gives it a real heading, so a reader can find and skip it', () => {
    render_()
    // A console is a region of a page, and navigating by heading has to work on
    // it. A div styled like a heading is findable by nobody and skippable by
    // nobody.
    const heading = screen.getByRole('heading', { level: 2, name: 'Nightly reconcile' })
    expect(heading.tagName).toBe('H2')
  })

  it('puts the budget above the steps, because the budget is the first question', () => {
    const { container } = render_({ budget: { value: 60, max: 100 } })
    // A reader's first question about a run is whether it will finish, and the
    // answer is the budget. Two columns would put them at the same height and make
    // the reader choose, which is the choice this Block removes.
    //
    // Compared by their position among the Block's own slots rather than by
    // `compareDocumentPosition`, which needs a non-null argument on both sides and
    // so reads as a chain of optional chains that would silently pass if either
    // element were ever missing.
    const slots = [...container.querySelectorAll('[data-slot]')].map((node) =>
      node.getAttribute('data-slot'),
    )
    const budget = slots.indexOf('run-console-01-budget')
    const steps = slots.indexOf('timeline')
    expect(budget).toBeGreaterThan(-1)
    expect(steps).toBeGreaterThan(-1)
    expect(budget).toBeLessThan(steps)
  })

  it('draws no budget at all for a run that has none', () => {
    const { container } = render_()
    // A local run, a test, a command. An empty Meter would be a measurement of
    // nothing, and it would be invisible because an empty meter looks like a meter.
    expect(container.querySelector('[data-slot="meter"]')).toBeNull()
  })

  it('draws the budget the caller gave it, with the limits they named', () => {
    render_({
      budget: {
        value: 92,
        max: 100,
        thresholds: [
          { at: 80, tone: 'warning' },
          { at: 95, tone: 'destructive' },
        ],
      },
    })
    const meter = screen.getByRole('meter', { name: 'Budget spent' })
    expect(meter.getAttribute('aria-valuenow')).toBe('92')
    expect(screen.getByText('92 of 100')).toBeTruthy()
  })

  it('wraps the steps in a live region and not the budget', () => {
    const { container } = render_({ budget: { value: 60, max: 100 }, streaming: true })
    const live = container.querySelector('[aria-live]')
    expect(live).not.toBeNull()
    // The live region holds the steps and nothing else. Wrapping the budget too
    // would re-read the spending on every append, which is the same mistake as a
    // permanently present live region: a region that announces more than what
    // changed is one whose announcements stop being read.
    expect(live?.querySelector('[data-slot="timeline"]')).not.toBeNull()
    expect(live?.querySelector('[data-slot="meter"]')).toBeNull()
  })

  it('takes the region away when the run stops arriving, rather than leaving it un-busy', () => {
    const { container, rerender } = render_({ streaming: true })
    const live = () => container.querySelector('[aria-live]')
    expect(live()?.getAttribute('aria-busy')).toBe('true')

    // The region is removed rather than left in place with the flag cleared.
    // Either would stop the announcements, but leaving a live region on the page
    // for a run that has ended means the next unrelated re-render of the steps is
    // announced, and a caller who leaves a busy flag up has also told assistive
    // technology a stream never ends.
    rerender(<RunConsole01 title="Nightly reconcile" copy={COPY} steps={STEPS} />)
    expect(live()).toBeNull()
    // And the steps are still there. Removing the region is not removing the run.
    expect(container.querySelector('[data-slot="timeline"]')).not.toBeNull()
  })

  it('does not announce a finished run at all', () => {
    const { container } = render_()
    // A run that has ended should say nothing. The Block cannot know which kind of
    // run it is looking at, so the decision is the caller's and defaults to the
    // quiet one.
    expect(container.querySelector('[aria-live]')).toBeNull()
  })

  it('authors the first moments of a run rather than showing a blank frame', () => {
    render_({ steps: [] })
    // A console with nothing in it is what a reader sees for the first second of
    // every run, and a blank frame there reads as a broken surface rather than as
    // a run that has not started.
    expect(screen.getByText('Waiting for the first step')).toBeTruthy()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('composes the three parts and reimplements none of them', () => {
    const { container } = render_({ budget: { value: 60, max: 100 } })
    // The Block's contribution is the arrangement. The measurement and the
    // sequence are the Components' own, brought here rather than rewritten, which
    // is what keeps one answer to "how does a budget read" in the repository.
    expect(container.querySelector('[data-slot="meter-track"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="timeline-bar"]')).not.toBeNull()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render_({
      budget: { value: 92, max: 100, thresholds: [{ at: 80, tone: 'warning' }] },
      detail: 'Started from the schedule',
    })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
