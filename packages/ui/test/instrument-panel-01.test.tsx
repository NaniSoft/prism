import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { InstrumentPanel01 } from '../src/blocks/instrument-panel-01'

/**
 * The claim under test is the one about state: a dot is a shape, and a reader who
 * cannot see `success` has learned nothing from it. All three NaniSoft sites that
 * draw a state dot write the state in words next to it, so the block requires the
 * words and throws without them rather than shipping a state a reader can only
 * see.
 *
 * The second claim is the one about the content: the frame is the block and the
 * instrument is the caller's, because an instrument is a view of the consumer's
 * data and every consumer's data is a different drawing.
 */
describe('a panel around an instrument', () => {
  it('owns the frame and none of the instrument', () => {
    render(
      <InstrumentPanel01 label="The estate, as one graph" state="live" stateLabel="live view">
        <div data-testid="instrument">the consumer's own drawing</div>
      </InstrumentPanel01>,
    )

    expect(screen.getByTestId('instrument').textContent).toBe("the consumer's own drawing")
    expect(screen.getByText('The estate, as one graph')).toBeTruthy()
    expect(screen.getByText('live view')).toBeTruthy()
  })

  it('hides the state dot and keeps the words, so the state is never colour alone', () => {
    const { container } = render(
      <InstrumentPanel01 label="The loop" state="live" stateLabel="live">
        <span />
      </InstrumentPanel01>,
    )

    const dot = container.querySelector('[data-slot="instrument-panel-bar"] [data-state]')!
    expect(dot).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('[data-slot="instrument-panel"]')).toHaveAttribute(
      'data-state',
      'live',
    )
  })

  it('refuses a state with no words rather than shipping a state a reader can only see', () => {
    expect(() =>
      render(
        <InstrumentPanel01 label="The loop" state="paused">
          <span />
        </InstrumentPanel01>,
      ),
    ).toThrow(/stateLabel/)
  })

  it('admits three states and needs no label for the quiet one', () => {
    const { container, rerender } = render(
      <InstrumentPanel01 label="The loop">
        <span />
      </InstrumentPanel01>,
    )
    expect(container.querySelector('[data-slot="instrument-panel"]')).toHaveAttribute(
      'data-state',
      'neutral',
    )

    rerender(
      <InstrumentPanel01 label="The loop" state="paused" stateLabel="snapshot">
        <span />
      </InstrumentPanel01>,
    )
    expect(container.querySelector('[data-slot="instrument-panel"]')).toHaveAttribute(
      'data-state',
      'paused',
    )
  })

  it('carries the footnote as a figure caption, so it is the panel description', () => {
    const { container } = render(
      <InstrumentPanel01 label="The chain" caption="Live capture" footnote="Every market minute.">
        <span />
      </InstrumentPanel01>,
    )

    expect(container.querySelector('figcaption')?.textContent).toBe('Every market minute.')
    expect(container.querySelector('figure')).toHaveAttribute('aria-label', 'Live capture')
  })
})

/**
 * The bar's two truncating spans, and the reason this file asserts what they
 * carry rather than what a row would do with them.
 *
 * **The bar cannot overflow horizontally, and the reason is a spec rule rather
 * than a class.** A flex item's automatic minimum size is its content-based
 * minimum size, which is where the folklore that a `truncate` needs `min-w-0`
 * comes from. CSS Flexbox 1 §4.5 carves out the exception that settles it: the
 * automatic minimum size is zero "for scroll containers", and `overflow: hidden`
 * is what makes a box a scroll container. Tailwind's `truncate` sets
 * `overflow: hidden`, so both spans already have an automatic minimum size of
 * zero, both shrink, and the bar stays the width of the figure whether the label
 * is two words or thirty. Adding `min-w-0` here would change nothing that is
 * painted, and a class written to prevent an overflow that cannot happen is a
 * false record in the source.
 *
 * **So what this asserts is the invariant the whole thing rests on.** If a later
 * edit replaced `truncate` on either span with `whitespace-nowrap`, or with a
 * line clamp that does not set `overflow`, the automatic minimum size would go
 * back to the text's own width and the row would start pushing the figure wider
 * than the panel it is in. That is the regression worth a test, and it is a
 * regression guard rather than a proof of a fix, because nothing here was broken
 * and nothing here was changed.
 *
 * The other twelve `truncate` sites in the tree that carry no `min-w-0` are the
 * same case and are not listed here: a `truncate` inside a flex COLUMN is sized
 * by `align-items: stretch` rather than by flex shrinking, and a `truncate` whose
 * flex parent already carries `min-w-0` inherits the behaviour from it.
 */
describe('the bar a panel titles itself with', () => {
  it('truncates both of its text spans, which is what lets them shrink at all', () => {
    const { container } = render(
      <InstrumentPanel01 label="The estate, as one graph" state="live" stateLabel="live view">
        <span />
      </InstrumentPanel01>,
    )

    const bar = container.querySelector('[data-slot="instrument-panel-bar"]')!
    const truncating = [...bar.querySelectorAll('span')].filter((span) =>
      span.className.split(' ').includes('truncate'),
    )
    expect(truncating.map((span) => span.textContent)).toEqual(['The estate, as one graph', 'live view'])
  })

  it('keeps the dot and the actions slot out of the shrinking', () => {
    const { container } = render(
      <InstrumentPanel01
        label="The loop"
        state="live"
        stateLabel="live"
        actions={<button type="button">pause</button>}
      >
        <span />
      </InstrumentPanel01>,
    )

    const bar = container.querySelector('[data-slot="instrument-panel-bar"]')!
    // The dot is eight pixels and the actions slot is application content whose
    // width the caller owns, so both are held at their own size and the two text
    // spans are what yield. A row of four where nothing could shrink would be a
    // row that pushes the panel wider than the figure; a row where the dot and
    // the actions can be squeezed is a row that hides the controls.
    expect(bar.querySelector('[data-state]')?.className).toContain('shrink-0')
    expect(bar.querySelector('button')?.parentElement?.className).toContain('shrink-0')
  })
})
