import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { Meter } from '../src/components/ui/meter'

/**
 * A bounded measure, drawn as a scale with its limits on it.
 *
 * The claims under test are the ones a Meter makes that a Progress does not, plus
 * the two that are easy to get wrong and invisible when they are.
 *
 * The distinctive claim is the thresholds: the fill takes the tone of the last
 * threshold the value has passed, in any order the caller passed them, and a
 * value below every threshold is the neutral default rather than a tone the
 * Component picked. The second is the role, which is `meter` and not
 * `progressbar`, because the two are distinguished by exactly the distinction this
 * Component exists for and assistive technology reports them differently.
 *
 * The two silent failures are the clamp and the degenerate scale. A value past
 * the maximum draws outside the track, and a scale whose minimum equals its
 * maximum divides by zero and reaches the DOM as a `NaN` width. Neither shows up
 * in a screenshot.
 */
describe('the Meter', () => {
  const track = (container: HTMLElement) =>
    container.querySelector('[data-slot="meter-track"]') as HTMLElement
  const fill = (container: HTMLElement) =>
    container.querySelector('[data-slot="meter-fill"]') as HTMLElement
  const notches = (container: HTMLElement) => [
    ...container.querySelectorAll('[data-slot="meter-threshold"]'),
  ]

  it('is a meter and not a progress bar, because the two are different measurements', () => {
    render(<Meter value={40} label="Storage used" />)
    const element = screen.getByRole('meter', { name: 'Storage used' })
    // The ARIA distinction is the whole reason this is not a Progress wearing a
    // new name, and a reader is told which kind of thing they are looking at.
    expect(element.getAttribute('role')).toBe('meter')
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('exposes the reading and the bounds it is read against', () => {
    const { container } = render(<Meter value={72} label="Tokens used" />)
    const element = track(container)
    expect(element.getAttribute('aria-valuenow')).toBe('72')
    expect(element.getAttribute('aria-valuemin')).toBe('0')
    expect(element.getAttribute('aria-valuemax')).toBe('100')
  })

  it('measures against a bound the caller gives it, so a quota is not a percentage', () => {
    const { container } = render(<Meter value={512} max={1024} label="Storage" />)
    const element = track(container)
    expect(element.getAttribute('aria-valuenow')).toBe('512')
    expect(element.getAttribute('aria-valuemax')).toBe('1024')
    // Half the scale, and the fill is half the track rather than 512 percent of it.
    expect(fill(container).style.width).toBe('50%')
  })

  it('announces the words for the value when the caller supplies them', () => {
    render(<Meter value={72} label="Storage used" valueText="72 gigabytes of 100" />)
    // A bare number tells a reader nothing about what is measured or in what
    // unit, which is the whole reason the prop exists.
    expect(screen.getByRole('meter', { name: 'Storage used' }).getAttribute('aria-valuetext')).toBe(
      '72 gigabytes of 100',
    )
  })

  it('carries no value text when the caller supplies none, rather than the number twice', () => {
    const { container } = render(<Meter value={72} label="Storage used" />)
    expect(track(container).hasAttribute('aria-valuetext')).toBe(false)
  })

  it('stays neutral below every threshold, because the Component has no opinion about the caller product', () => {
    const { container } = render(
      <Meter
        value={40}
        label="Storage used"
        thresholds={[
          { at: 80, tone: 'warning' },
          { at: 95, tone: 'destructive' },
        ]}
      />,
    )
    // 40 percent of a latency budget is routine and 40 percent of a disk is
    // nothing, so a Component that coloured itself would be making a claim about
    // the caller's product on the caller's behalf.
    expect(fill(container).className).toContain('bg-foreground')
  })

  it('takes the tone of the last threshold the value has passed', () => {
    const thresholds = [
      { at: 80, tone: 'warning' as const },
      { at: 95, tone: 'destructive' as const },
    ]
    const { container: warn } = render(<Meter value={85} label="Disk" thresholds={thresholds} />)
    expect(fill(warn).className).toContain('bg-warning')

    const { container: bad } = render(<Meter value={97} label="Disk" thresholds={thresholds} />)
    expect(fill(bad).className).toContain('bg-destructive')
  })

  it('reads thresholds in order whatever order they arrive in', () => {
    // A caller that lists its limits highest-first is not wrong, and a Component
    // that assumed ascending order would show the wrong tone for every value
    // between the two.
    const { container } = render(
      <Meter
        value={85}
        label="Disk"
        thresholds={[
          { at: 95, tone: 'destructive' },
          { at: 80, tone: 'warning' },
        ]}
      />,
    )
    expect(fill(container).className).toContain('bg-warning')
  })

  it('draws a notch on the track for every threshold, at its place on the scale', () => {
    const { container } = render(
      <Meter
        value={10}
        label="Disk"
        thresholds={[
          { at: 80, tone: 'warning' },
          { at: 95, tone: 'destructive' },
        ]}
      />,
    )
    const drawn = notches(container)
    expect(drawn).toHaveLength(2)
    // The notch is at 80 and 95 on a 0 to 100 scale, which is the information the
    // fill alone cannot carry: not just how much, but where the limit is.
    expect(drawn[0].style.left).toBe('80%')
    expect(drawn[1].style.left).toBe('95%')
  })

  it('hides the notches from assistive technology, because a tick is not a second reading', () => {
    const { container } = render(
      <Meter value={10} label="Disk" thresholds={[{ at: 80, tone: 'warning' }]} />,
    )
    expect(notches(container)[0].getAttribute('aria-hidden')).toBe('true')
  })

  it('clamps a value past the maximum rather than drawing outside the track', () => {
    const { container } = render(<Meter value={140} label="Disk" />)
    // A backend that reports 140 percent, or a caller who rounds up, must not
    // push the fill off the end of its own track.
    expect(fill(container).style.width).toBe('100%')
    expect(track(container).getAttribute('aria-valuenow')).toBe('100')
  })

  it('draws an empty track on a scale with no width rather than a NaN', () => {
    const { container } = render(<Meter value={5} min={5} max={5} label="Degenerate" />)
    // Dividing by a zero-width span yields NaN, which reaches the DOM as a width
    // the browser discards, so the meter would silently lose its fill.
    expect(fill(container).style.width).toBe('0%')
    // And it still measures, because a Component that renders nothing is worse
    // than one that renders an empty track.
    expect(track(container).getAttribute('aria-valuenow')).toBe('5')
  })

  it('is not a live region, because the change that moved it is what should be announced', () => {
    const { container } = render(<Meter value={40} label="Disk" />)
    // A consumer that wants the reading announced wraps it in a LiveRegion. This
    // is the same split every other Component makes between the thing that
    // changed and the thing that reports it.
    expect(container.querySelector('[aria-live]')).toBeNull()
  })

  it('renders the caption it was given and no caption element when given none', () => {
    const { container: withText } = render(
      <Meter value={40} label="Disk">
        <span>40 of 100 GB</span>
      </Meter>,
    )
    expect(withText.querySelector('[data-slot="meter-caption"]')?.textContent).toBe('40 of 100 GB')

    const { container: without } = render(<Meter value={40} label="Queue" />)
    expect(without.querySelector('[data-slot="meter-caption"]')).toBeNull()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <Meter
        value={97}
        label="Storage used"
        valueText="97 gigabytes of 100"
        thresholds={[
          { at: 80, tone: 'warning' },
          { at: 95, tone: 'destructive' },
        ]}
      >
        <span>97 of 100 GB</span>
      </Meter>,
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
