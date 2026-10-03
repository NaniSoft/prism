import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Slider } from './slider'

/**
 * The track the thumb moves along and the box the thumb sits in.
 *
 * jsdom gives every element a zero rect, so a slider cannot compute a position from
 * one and the two drags below would be arithmetic on nothing. These are the numbers a
 * real page has: a 200px track and a 16px thumb at the 40% mark, which is where a
 * value of 20 out of 0 to 100 puts it.
 */
const TRACK = { left: 0, right: 200, width: 200, top: 0, bottom: 6, height: 6 }
const THUMB = { left: 32, right: 48, width: 16, top: -5, bottom: 11, height: 16 }

const rect = (box: typeof TRACK) =>
  ({ ...box, x: box.left, y: box.top, toJSON: () => box }) as DOMRect

/**
 * The thumb, and with it the geometry the value is computed from.
 *
 * The two boxes are overridden on the elements themselves rather than on the
 * prototype, so nothing else in the file measures anything and a stub cannot leak
 * into another test.
 */
function theThumb(container: HTMLElement) {
  const root = container.querySelector<HTMLElement>('[data-slot="slider"]')
  const control = root?.firstElementChild as HTMLElement | undefined
  const thumb = root?.querySelector<HTMLElement>('[data-index]') ?? undefined
  if (!control || !thumb) throw new Error('the slider did not draw a control and a thumb')
  control.getBoundingClientRect = () => rect(TRACK)
  thumb.getBoundingClientRect = () => rect(THUMB)
  return thumb
}

describe('Slider', () => {
  it('exposes its value through ARIA', () => {
    render(<Slider defaultValue={20} aria-label="Volume" />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '20')
  })

  it('changes its value with the arrow keys', async () => {
    render(<Slider defaultValue={20} aria-label="Volume" />)
    const thumb = screen.getByRole('slider', { name: 'Volume' })
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(thumb).toHaveAttribute('aria-valuenow', '21')
  })

  it('takes the coarse-pointer 44px floor as a band and does not resize the thumb', () => {
    const { container } = render(<Slider defaultValue={20} aria-label="Volume" />)
    const className = theThumb(container).className

    expect(className).toContain('pointer-coarse:before:h-11')
    expect(className).toContain('pointer-coarse:before:w-11')
    expect(className).toContain('pointer-coarse:before:-translate-x-1/2')
    expect(className).toContain('pointer-coarse:before:-translate-y-1/2')

    // The load-bearing half. A band is a pseudo-element, so it contributes to
    // neither `getBoundingClientRect()`, and Base UI reads the press offset from the
    // thumb's own box and the value from the control's own box. The drawn 16px has to
    // stay the box the maths reads, which is what a `size-11` here would break: a 44px
    // ball on a six pixel rail, and a read that no longer matched the drawing.
    expect(className).not.toMatch(/pointer-coarse:(?:size|h|w|min-w)-/)
    expect(className).toContain('size-4')
  })

  it('moves the value to where the pointer is while the thumb is dragged', () => {
    const { container } = render(<Slider defaultValue={20} aria-label="Volume" />)
    const thumb = theThumb(container)

    // Press on the thumb's centre, which is the 40% mark, so the grab offset is zero
    // and the value under the finger is the value the reader can see.
    fireEvent.pointerDown(thumb, { clientX: 40, clientY: 3, button: 0, bubbles: true })
    // And drag to the middle of the track, which is 50 out of 0 to 100.
    fireEvent.pointerMove(document, { clientX: 100, clientY: 3, buttons: 1, bubbles: true })

    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '50')
  })

  it('keeps the grab offset, so the value stays under the finger rather than jumping to it', () => {
    const { container } = render(<Slider defaultValue={20} aria-label="Volume" />)
    const thumb = theThumb(container)

    // Press eight pixels right of the thumb's centre and drag sixty pixels. With the
    // offset kept, the value under the finger is 100px along the track and the field
    // reads 50; with it dropped, the same gesture lands at 108px and reads 54, which
    // is the jump a thumb drag must not make and the reason a coarse-pointer thumb
    // has to be grabbable at all.
    fireEvent.pointerDown(thumb, { clientX: 48, clientY: 3, button: 0, bubbles: true })
    fireEvent.pointerMove(document, { clientX: 108, clientY: 3, buttons: 1, bubbles: true })

    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '50')
  })
})