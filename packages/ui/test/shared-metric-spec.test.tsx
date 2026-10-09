import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChartCard01 } from '../src/blocks/chart-card-01'
import { ProjectDashboard01 } from '../src/blocks/project-dashboard-01'
import { Stats01 } from '../src/blocks/stats-01'
import { Trend01 } from '../src/blocks/trend-01'
import type { MetricSpec } from '../src/lib/spec'

/**
 * The four figure owners that moved onto the shared metric specification, and the
 * rule the move is held to.
 *
 * Each of these Blocks declared its own reading type before this wave, one of five
 * spellings of the same shape that disagreed about whether a delta is a number or a
 * percentage, about a formatter, and about whether a series and a destination are
 * part of a figure at all. The assertion each one earns is three-part: the shared
 * field renders, the optional field renders nothing when it is absent, and the Item
 * did not change shape to take it. The published names this Block contributes are
 * pinned by the annotation here, so the shapes are checked by the compiler at the
 * call sites below: a `MetricSpec` missing its `key`, `label` or `value` would not
 * typecheck, and the two pairs (`series` with `seriesLabel`, `href` with `hrefLabel`)
 * are held by the type.
 */

/** A reading with every field set, so the optional halves are visible at once. */
const FULL: MetricSpec = {
  key: 'queued',
  label: 'Runs queued',
  value: '12',
  delta: -3,
  deltaFormat: '3 fewer than yesterday',
  hint: 'vs yesterday',
  series: [4, 6, 5, 9, 8, 12, 11],
  seriesLabel: 'Runs queued over the last week',
  href: '/runs?state=queued',
  hrefLabel: 'Open the queue',
}

/** A reading with only the three required members, so the optional halves are absent. */
const BARE: MetricSpec = { key: 'bare', label: 'Bare reading', value: '7' }

describe('the shared metric specification across the figure owners', () => {
  it('ChartCard01 renders the shared reading, its formatter, its hint, its series and its link', () => {
    const { container } = render(
      <ChartCard01 title="Requests" figure={<p>One figure.</p>} reading={[FULL]} />,
    )

    expect(screen.getByText('Runs queued')).toBeTruthy()
    expect(container.querySelector('[data-slot="metric-value"]')?.textContent).toBe('12')
    expect(screen.getByText('3 fewer than yesterday')).toBeTruthy()
    expect(screen.getByText('vs yesterday')).toBeTruthy()
    // The series renders as its named shape, and the destination as a real link.
    expect(screen.getByLabelText('Runs queued over the last week')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open the queue' }).getAttribute('href')).toBe(
      '/runs?state=queued',
    )
    // The Item keeps its own shape: the figure slot is untouched.
    expect(screen.getByText('One figure.')).toBeTruthy()
  })

  it('ChartCard01 draws nothing under a reading when the optional members are absent', () => {
    const { container } = render(
      <ChartCard01 title="Requests" figure={<p>One figure.</p>} reading={[BARE]} />,
    )

    expect(container.querySelector('[data-slot="metric-delta"]')).toBeNull()
    expect(container.querySelector('[data-slot="metric-hint"]')).toBeNull()
    expect(container.querySelector('[data-slot="sparkline"]')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })

  it('Trend01 takes a reading with a series and a destination it could not carry before', () => {
    render(
      <Trend01
        title="What is moving"
        items={[FULL]}
      />,
    )

    expect(screen.getByText('Runs queued')).toBeTruthy()
    expect(screen.getByText('3 fewer than yesterday')).toBeTruthy()
    expect(screen.getByLabelText('Runs queued over the last week')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open the queue' })).toBeTruthy()
    // The Item keeps its own shape: the rank is still drawn from the position.
    expect(screen.getByText('01')).toBeTruthy()
  })

  it('Trend01 prints the number the caller passed for a delta with no formatter', () => {
    const { container } = render(
      <Trend01 title="What is moving" items={[{ ...BARE, delta: 12.4 }]} />,
    )

    const delta = container.querySelector('[data-slot="metric-delta"]')
    // The number prints as passed, and no unit is appended to it.
    expect(delta?.textContent).toContain('12.4')
    expect(delta?.textContent).not.toContain('%')
  })

  it('Stats01 prints the caller own words for a delta and appends no unit', () => {
    render(
      <Stats01
        stats={[
          { key: 'on-track', label: 'On track', value: '47.2%', delta: -3, deltaFormat: '3 points lower', hint: 'vs last month' },
        ]}
      />,
    )

    expect(screen.getByText('On track')).toBeTruthy()
    expect(screen.getByText('3 points lower')).toBeTruthy()
    // The old declaration appended a percent sign; this migration removes it.
    expect(screen.queryByText('-3%')).toBeNull()
    expect(screen.queryByText('3%')).toBeNull()
  })

  it('Stats01 draws nothing under a statistic when the optional members are absent', () => {
    const { container } = render(<Stats01 stats={[BARE]} />)

    expect(container.querySelector('[data-slot="metric-delta"]')).toBeNull()
    expect(container.querySelector('[data-slot="sparkline"]')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })

  it('ProjectDashboard01 renders a figure with its formatter, series and hint, and keeps its panels', () => {
    render(
      <ProjectDashboard01
        name="What is left"
        figures={[FULL]}
        panels={[{ id: 'queue', title: 'Run queue', span: 'half', children: 'One thing.' }]}
      />,
    )

    expect(screen.getByText('Runs queued')).toBeTruthy()
    expect(screen.getByText('3 fewer than yesterday')).toBeTruthy()
    expect(screen.getByText('vs yesterday')).toBeTruthy()
    expect(screen.getByLabelText('Runs queued over the last week')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open the queue' })).toBeTruthy()
    // The Item keeps its own shape: the panels and their titles still render.
    expect(screen.getByRole('heading', { name: 'Run queue' })).toBeTruthy()
  })

  it('keeps each Item its own shape: only the figure shape moved', () => {
    render(
      <Stats01 title="Delivery" stats={[FULL]} />,
    )

    expect(screen.getByRole('heading', { name: 'Delivery' })).toBeTruthy()
    expect(screen.getByText('Runs queued')).toBeTruthy()
  })
})
