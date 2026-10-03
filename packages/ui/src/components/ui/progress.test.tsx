import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Progress } from './progress'

/**
 * The fill is a transform, and the three channels have to agree.
 *
 * A bar can report one number and draw another, and nothing about the rendered
 * output would say so: `aria-valuenow` is written by `ProgressRoot` and the fill is
 * written by this package, from the same `value`, `min` and `max`. Every assertion
 * below therefore reads the transform out of the DOM and checks it against the
 * attribute, rather than against a second copy of the arithmetic, so a change on
 * either side that the other does not follow fails here.
 */
const indicatorOf = (container: HTMLElement): HTMLElement =>
  container.querySelector('[data-slot="progress-indicator"]')!

describe('Progress', () => {
  it('reports its position through ARIA', () => {
    render(<Progress value={40} aria-label="Upload" />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute('aria-valuenow', '40')
  })

  it('omits a value when the task length is unknown', () => {
    render(<Progress value={null} aria-label="Upload" />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).not.toHaveAttribute('aria-valuenow')
  })

  it('expresses the value as a transform rather than as a width', () => {
    const { container } = render(<Progress value={40} />)
    const indicator = indicatorOf(container)
    // The property, not the number. A width here is a layout animation, which is the
    // defect this asserts the absence of, and a percentage rather than a factor is
    // the width mechanism under another name.
    expect(indicator.style.transform).toBe('scaleX(0.4)')
    expect(indicator.style.width).toBe('100%')
    // Base UI writes the percentage width itself, as an inline declaration, so the
    // transition has to have moved off the property or this class is dead weight.
    expect(indicator.className).toContain('transition-transform')
    expect(indicator.className).not.toContain('transition-[width]')
  })

  it('takes the width back from the inline style the indicator arrives with', () => {
    // Base UI's own inline style is the reason `w-full` alone is not enough, and an
    // inline declaration beats every class, so this is the assertion that the
    // override is the inline one.
    const { container } = render(<Progress value={40} />)
    const indicator = indicatorOf(container)
    expect(indicator.className).toContain('w-full')
    expect(indicator.style.width).toBe('100%')
  })

  it('holds the transform and the announced value together across a range', () => {
    // The bounds are not 0 and 100, and the announced value is the clamped `value`
    // rather than the percentage, so the two are only the same number once the
    // mapping has been applied. Every row is a known answer, not a restatement.
    const rows = [
      { min: 0, max: 100, value: 0, factor: 0, now: '0' },
      { min: 0, max: 100, value: 25, factor: 0.25, now: '25' },
      { min: 0, max: 100, value: 100, factor: 1, now: '100' },
      { min: 0, max: 200, value: 50, factor: 0.25, now: '50' },
      { min: 20, max: 80, value: 50, factor: 0.5, now: '50' },
      { min: 20, max: 80, value: 20, factor: 0, now: '20' },
      { min: 20, max: 80, value: 80, factor: 1, now: '80' },
      // Outside the bounds, the bar is clamped at a bound and the announced value is
      // the clamped one, so the two describe the same position rather than one
      // running off the end of the track.
      { min: 0, max: 100, value: 140, factor: 1, now: '100' },
      { min: 0, max: 100, value: -20, factor: 0, now: '0' },
    ]

    for (const row of rows) {
      const { container, unmount } = render(
        <Progress value={row.value} min={row.min} max={row.max} aria-label="Upload" />,
      )
      const label = ['Upload', row.min, row.max, row.value, row.factor].join('/')
      expect(
        [label, indicatorOf(container).style.transform],
        'the fill is the announced position as a fraction of the track',
      ).toEqual([label, `scaleX(${row.factor})`])
      expect(
        [label, screen.getByRole('progressbar', { name: 'Upload' }).getAttribute('aria-valuenow')],
        'the announced value is in step with the fill',
      ).toEqual([label, row.now])
      unmount()
    }
  })

  it('empties the bar at zero and fills it at the maximum', () => {
    // Both ends, because `scaleX(0)` and `scaleX(1)` are the two values a fill is
    // most likely to get wrong and the two a test that only checks a middle value
    // never reaches.
    const { container: empty, unmount: dropEmpty } = render(<Progress value={0} />)
    expect(indicatorOf(empty).style.transform).toBe('scaleX(0)')
    dropEmpty()

    const { container: full } = render(<Progress value={100} />)
    expect(indicatorOf(full).style.transform).toBe('scaleX(1)')
  })

  it('reads the zero fill as a box that is the width of the track and a factor of nothing', () => {
    // What jsdom can and cannot answer, stated once. There is no layout here, so no
    // test can assert that `scaleX(0)` paints nothing: what it CAN assert is the
    // two facts that decide it, which are that the box is the full track (so the
    // factor is a fraction of the right length) and that the track clips
    // (`overflow-hidden`, read out of the real class list rather than asserted
    // here). Whether a zero-area box rasterises to nothing is a compositing
    // question, and `apps/site/e2e/display.spec.ts` is the lane that can answer it.
    const { container } = render(<Progress value={0} />)
    expect(indicatorOf(container).style.width).toBe('100%')
    expect(container.querySelector('[data-slot="progress-track"]')!.className).toContain(
      'overflow-hidden',
    )
  })

  it('renders the indeterminate state with no transform to animate', () => {
    const { container } = render(<Progress value={null} aria-label="Upload" />)
    const indicator = indicatorOf(container)
    // No transform at all, rather than `scaleX(0)`, so an unknown length is drawn as
    // the resting state it has always been and there is no zero to animate away from
    // when the length becomes known.
    expect(indicator.style.transform).toBe('')
    expect(indicator.className).toContain('transition-transform')
    // The attribute Base UI derives from the same condition survives on the element,
    // because a consumer styling the indeterminate bar is styling this attribute.
    expect(indicator).toHaveAttribute('data-indeterminate')
    expect(indicator.style.width).toBe('')
    // The indeterminate announcement is a sentence rather than a number, and it is
    // Base UI's own default. There is no `aria-valuenow` to fall back on here, so
    // this is the entire value a reader gets.
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuetext',
      'indeterminate progress',
    )
  })

  it('scales the fill from the inline start edge, and names both directions', () => {
    // The direction half of this cannot be asserted in jsdom and is not pretended
    // at here. jsdom resolves no `transform-origin` and no `rtl:` variant, so a test
    // that read the origin back out of a class string would be asserting the string
    // and calling it geometry. What is asserted is the contract the string encodes:
    // the bare origin is the left and the right-to-left variant overrides it to the
    // right, which is what makes the fill grow from the inline start in both
    // directions rather than from the left in both.
    // `packages/ui/test/progress-origin.test.tsx` reads the two rules out of the built
    // stylesheet and checks which one wins, and a browser is still the lane that
    // settles which end a reader sees.
    const { container } = render(<Progress value={40} />)
    const classes = indicatorOf(container).className.split(/\s+/)
    expect(classes).toContain('origin-left')
    expect(classes).toContain('rtl:origin-right')
  })
})

/**
 * The announced value text, which is what a reader actually hears.
 *
 * **The defect this is for shipped, in a Component nothing flagged.** `Progress`
 * passed `aria-valuetext={valueText}` to the Base UI root, and `valueText` is
 * `undefined` on every bar a consumer did not give a sentence to. Base UI's prop
 * merge assigns every key the caller passes, an explicit `undefined` included, and
 * the root merges its own defaults before the caller's props, so the key was
 * overwritten with nothing on every determinate bar and every indeterminate one.
 * `ProgressRoot` computes a default `aria-valuetext` for exactly those cases, so
 * the sentence was in the package and was not in the tree: a screen reader was
 * handed `aria-valuenow` and nothing else. The same overwrite discarded
 * `getAriaValueText`'s return value, which is why `format` and `locale` had no
 * observable effect either: both exist only to shape the announced text.
 *
 * Every assertion below reads the attribute out of the DOM, and the expected
 * strings are the platform's own answers rather than a second copy of the mapping,
 * so a change to how Base UI formats is a change this test follows rather than a
 * change it forbids. What no assertion here can prove is what any particular
 * reader says: jsdom has no accessibility tree, so these hold the attribute, and
 * `apps/site/e2e/display.spec.ts` with a real screen reader is the lane that
 * settles the sentence.
 */
describe('Progress announced value text', () => {
  /** What the platform formats 40 percent as, which is the default Base UI asks for. */
  const fortyPercent = new Intl.NumberFormat(undefined, { style: 'percent' }).format(0.4)

  it('announces a percentage on a bar the consumer gave no sentence to', () => {
    render(<Progress value={40} aria-label="Upload" />)
    const bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar).toHaveAttribute('aria-valuetext', fortyPercent)
    // Two different channels carrying two different readings. `aria-valuenow` is
    // the position on the scale and the value text is the position as a share of
    // it, so a bar announcing only the first was announcing a number with no
    // indication of what range it was a number in.
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuetext')).not.toBe(bar.getAttribute('aria-valuenow'))
  })

  it('announces the clamped share rather than a value off the end of the track', () => {
    // Out of bounds on both sides, and the announcement has to describe the same
    // position the fill draws rather than a number the bar is not at.
    const { unmount } = render(<Progress value={140} aria-label="Upload" />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuetext',
      new Intl.NumberFormat(undefined, { style: 'percent' }).format(1),
    )
    unmount()
    render(<Progress value={-20} aria-label="Upload" />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuetext',
      new Intl.NumberFormat(undefined, { style: 'percent' }).format(0),
    )
  })

  it('announces a sentence the consumer resolved, in place of the percentage', () => {
    render(<Progress value={42} valueText="42 of 300 files" aria-label="Upload" />)
    const bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar).toHaveAttribute('aria-valuetext', '42 of 300 files')
    // The position is still on the element. A sentence replaces the reading of the
    // number, not the number itself, and a consumer styling or measuring the bar
    // still finds what it found before.
    expect(bar).toHaveAttribute('aria-valuenow', '42')
  })

  it('lets a value text written on the Component win over the default', () => {
    // The precedence the spread has to keep: `{...props}` lands after both of this
    // Component's own answers, so a consumer who writes the attribute directly is
    // choosing the same slot and is not overruled by the default underneath.
    render(<Progress value={42} aria-label="Upload" aria-valuetext="step 3 of 7" />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuetext',
      'step 3 of 7',
    )
  })

  it('hands getAriaValueText the formatted value and announces what it returns', () => {
    // The callback is the other half of the same dead attribute: it was called on
    // every render and its answer was overwritten a step later, so a consumer who
    // wrote one was paying for it and hearing nothing.
    const calls: [string, number | null][] = []
    render(
      <Progress
        value={40}
        aria-label="Upload"
        getAriaValueText={(formatted, value) => {
          calls.push([formatted, value])
          return `${value} of 100 uploaded`
        }}
      />,
    )
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuetext',
      '40 of 100 uploaded',
    )
    // The formatted share first and the raw value second, in that order, because
    // the two answer different questions and a callback that wants one of them
    // should not have to re-derive it.
    expect(calls).toEqual([[fortyPercent, 40]])
  })

  it('shapes the announced sentence with format and locale', () => {
    // Both props exist only to change this string, so before the fix neither had
    // any effect a consumer could observe. `40.5` at zero fraction digits is `41`,
    // which is the platform's answer and not a restatement of the arithmetic.
    const { unmount } = render(
      <Progress value={40.5} format={{ maximumFractionDigits: 0 }} aria-label="Upload" />,
    )
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuetext',
      '41',
    )
unmount()
    // A comma rather than a point, which is the whole of what `locale` is for and
    // is the platform's answer rather than this repository's.
    render(
      <Progress
        value={40.5}
        locale="de-DE"
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        aria-label="Upload"
      />,
    )
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuetext',
      '40,50',
    )
    // **And the trap worth knowing about, recorded because it cost this test a
    // run.** `format` is applied to the raw value on the scale, not to the share
    // of it, so `style: 'percent'` on a zero-to-hundred range is `4050 %` and not
    // `41 %`. The unformatted default asks for a percentage OF THE FRACTION and is
    // the only path that reads as a share; a `format` that names a unit multiplies
    // the value again. Both numbers are on the element already, as `aria-valuemin`,
    // `aria-valuemax` and `aria-valuenow`, so a consumer who needs a sentence can
    // build it rather than restate the scale.
  })

  it('refuses a bar given both a value text and a callback', () => {
    // The guard is one of this Component's own props disagreeing with another, so
    // it is decided above the return and no merge runs. React logs the throw
    // through console.error on its way out, and that noise is not the finding.
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(<Progress value={40} valueText="42 of 300" getAriaValueText={() => 'x'} />),
    ).toThrow(/both valueText and getAriaValueText/)
    quiet.mockRestore()
  })
})
