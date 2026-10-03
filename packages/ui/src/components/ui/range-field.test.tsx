import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RangeField } from './range-field'

/**
 * Two thumbs on one track, editing the two ends of an interval.
 *
 * The claims under test are the two the Component's own JSDoc makes and a screenshot
 * cannot hold. The first is the announcement: each thumb is named by the caller's
 * `boundLabel` and reports the bound it is, and the span between them is said once
 * from a hidden sentence, because two announced numbers are not an interval. The
 * second is the geometry: the coarse-pointer floor on both thumbs is a band rather
 * than a step, and the band has to leave the box the value is computed from alone.
 */

/** The track the thumbs move along and the box the lower thumb sits in. */
const TRACK = { left: 0, right: 200, width: 200, top: 0, bottom: 6, height: 6 }
const THUMB = { left: 32, right: 48, width: 16, top: -5, bottom: 11, height: 16 }

const rect = (box: typeof TRACK) =>
  ({ ...box, x: box.left, y: box.top, toJSON: () => box }) as DOMRect

/** The lower thumb, with the geometry the value is computed from stubbed onto both. */
function lowerThumb(container: HTMLElement) {
  const root = container.querySelector<HTMLElement>('[data-slot="range-field-slider"]')
  const control = root?.firstElementChild as HTMLElement | undefined
  const thumb = root?.querySelector<HTMLElement>('[data-index="0"]') ?? undefined
  if (!control || !thumb) throw new Error('the field did not draw a control and two thumbs')
  control.getBoundingClientRect = () => rect(TRACK)
  thumb.getBoundingClientRect = () => rect(THUMB)
  return thumb
}

/** The band between the bounds. */
function indicatorOf(container: HTMLElement): HTMLElement {
  const element = container.querySelector<HTMLElement>('[data-slot="range-field-indicator"]')
  if (!element) throw new Error('the field did not draw a band between the bounds')
  return element
}

const props = (over: Partial<Parameters<typeof RangeField>[0]> = {}) => ({
  label: 'Retention window',
  defaultValue: [20, 80] as const,
  boundLabel: (bound: string, formatted: string) =>
    bound === 'start' ? `From ${formatted}` : `To ${formatted}`,
  spanLabel: (span: number, formatted: string) => `${formatted} days apart`,
  ...over,
})

describe('RangeField', () => {
  it('names each thumb by which end it is and says the span once', () => {
    render(<RangeField {...props()} />)

    expect(screen.getByRole('slider', { name: 'From 20' })).toHaveAttribute('aria-valuenow', '20')
    expect(screen.getByRole('slider', { name: 'To 80' })).toHaveAttribute('aria-valuenow', '80')
    // The span is the one figure in the control neither thumb can derive, so it is
    // said once rather than left to subtraction while the reader drives.
    expect(screen.getByText('60 days apart')).toBeTruthy()
  })

  it('moves the lower bound with the arrow keys', async () => {
    const onValueChange = vi.fn()
    render(<RangeField {...props({ onValueChange })} />)

    screen.getByRole('slider', { name: 'From 20' }).focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenLastCalledWith([21, 80])
  })

  it('takes the coarse-pointer 44px floor as a band and does not resize either thumb', () => {
    const { container } = render(<RangeField {...props()} />)
    for (const index of ['0', '1']) {
      const className = container
        .querySelector(`[data-slot="range-field-thumb"][data-index="${index}"]`)
        ?.className
      expect(className).toContain('pointer-coarse:before:h-11')
      expect(className).toContain('pointer-coarse:before:w-11')
      // The load-bearing half. Base UI reads the press offset from the thumb's own
      // box and the value from the control's own box, and a pseudo-element
      // contributes to neither, so the drawn 16px has to stay the box the maths
      // reads. Two `size-11` thumbs on a six pixel rail would be two 44px balls and
      // bands that overlap whenever the bounds are closer together than the band.
      expect(className).not.toMatch(/pointer-coarse:(?:size|h|w|min-w)-/)
      expect(className).toContain('size-4')
    }
  })

  it('moves the lower bound to where the pointer is while it is dragged', () => {
    const onValueChange = vi.fn()
    const { container } = render(<RangeField {...props({ onValueChange })} />)
    const thumb = lowerThumb(container)

    fireEvent.pointerDown(thumb, { clientX: 40, clientY: 3, button: 0, bubbles: true })
    fireEvent.pointerMove(document, { clientX: 100, clientY: 3, buttons: 1, bubbles: true })

    // The upper bound stays where it was, which is the claim a band cannot threaten
    // and a step could: the gesture moved one thumb and one thumb only.
    expect(onValueChange).toHaveBeenLastCalledWith([50, 80])
    // The drawing follows the value rather than the other way round, which is the
    // other half of the same claim: the band is a transform computed from the bounds
    // the gesture produced, so a drag that lands on 50 draws a band 0.3 of the track wide.
    expect(indicatorOf(container).style.transform).toBe('scaleX(0.3)')
  })

  it('takes the width back from the inline style Base UI writes, so the band is a transform', () => {
    const { container } = render(<RangeField {...props()} />)
    const indicator = indicatorOf(container)

    // Base UI positions this element with `inset-inline-start` and `width`, both as
    // inline declarations, so no class can move either of them. The transform is the
    // whole geometry only if the two are taken back, and a percentage rather than a
    // factor is the width mechanism under another name.
    expect(indicator.style.width).toBe('100%')
    // The position is left to Base UI, and it is a logical property: the band's left
    // edge is 20% along the rail under a left-to-right dir and the same distance
    // from the other end under a right-to-left one, so a transform only has to scale.
    expect(indicator.style.insetInlineStart).toBe('20%')
    expect(indicator.style.transform).toBe('scaleX(0.6)')
    expect(indicator.className).toContain('transition-transform')
    // The retired mechanism. `left`, `right` and `width` are layout and paint, and a
    // range is the one control here whose value changes on every pointer move rather
    // than on every commit.
    expect(indicator.className).not.toContain('transition-[left,right,width]')
    // No radius of its own: a `scaleX` scales the shape it is applied to, so a rounded
    // end on a band at 40% draws a cap squashed on one axis, and the ends of a band
    // are the two round thumbs drawn on top of it. The track's own clip supplies them.
    expect(indicator.className).not.toContain('rounded')
  })

  it('holds the transform and the announced bounds together across a range', () => {
    // The factor is read off the DOM and held against what the two thumbs announce,
    // rather than against a second copy of the arithmetic, so a change on either side
    // that the other does not follow fails here. Every row is a known answer: the
    // bounds are not 0 and 100, the span is not the factor, a pair outside the range
    // is announced at the bound it was clamped to, and the last row is the division
    // by zero that is a band at zero rather than a band at `NaN`.
    const rows: {
      min: number
      max: number
      value: [number, number]
      announced: [string, string]
      factor: string
    }[] = [
      { min: 0, max: 100, value: [0, 100], announced: ['0', '100'], factor: 'scaleX(1)' },
      { min: 0, max: 100, value: [20, 80], announced: ['20', '80'], factor: 'scaleX(0.6)' },
      { min: 0, max: 100, value: [0, 0], announced: ['0', '0'], factor: 'scaleX(0)' },
      { min: 20, max: 80, value: [20, 80], announced: ['20', '80'], factor: 'scaleX(1)' },
      {
        min: 20,
        max: 80,
        value: [30, 50],
        announced: ['30', '50'],
        factor: 'scaleX(0.3333333333333333)',
      },
      { min: 0, max: 200, value: [50, 50], announced: ['50', '50'], factor: 'scaleX(0)' },
      { min: 0, max: 100, value: [-40, 140], announced: ['0', '100'], factor: 'scaleX(1)' },
      { min: 10, max: 10, value: [10, 10], announced: ['10', '10'], factor: 'scaleX(0)' },
    ]
    for (const row of rows) {
      const { container, unmount } = render(
        <RangeField {...props({ min: row.min, max: row.max, defaultValue: row.value })} />,
      )
      // The value is announced by the input inside each thumb, which carries the
      // implicit `slider` role rather than an explicit one, so it is found by its
      // position under the thumb rather than by that role.
      const thumbs = container.querySelectorAll('[data-slot="range-field-thumb"] input')
      expect([row.value, thumbs[0].getAttribute('aria-valuenow'), thumbs[1].getAttribute('aria-valuenow')]).toEqual([
        row.value,
        row.announced[0],
        row.announced[1],
      ])
      expect([row.value, indicatorOf(container).style.transform]).toEqual([row.value, row.factor])
      unmount()
    }
  })

  it('scales about the inline start, and the other way for a vertical field', () => {
    const { container, unmount } = render(<RangeField {...props()} />)
    const indicator = indicatorOf(container)
    // CSS has no logical keyword for `transform-origin`, so the direction takes a
    // variant, exactly as it does on `Progress`.
    expect([indicator.className.includes('origin-left'), indicator.className.includes('rtl:origin-right')]).toEqual([
      true,
      true,
    ])
    unmount()

    const vertical = render(<RangeField {...props({ orientation: 'vertical' })} />)
    const bar = indicatorOf(vertical.container)
    expect(bar.style.transform).toBe('scaleY(0.6)')
    expect(bar.style.height).toBe('100%')
    // Vertical is the mirror: Base UI anchors the band with a physical ottom, so the
    // origin is the bottom edge rather than the inline start.
    expect(bar.style.bottom).toBe('20%')
    expect(bar.className).toContain('origin-bottom')
    expect(bar.className).not.toContain('origin-left')
  })
})
