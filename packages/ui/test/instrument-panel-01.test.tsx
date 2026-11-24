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
 * The bar's one truncating span, and the reason this file asserts what the spans
 * carry rather than what a row would do with them.
 *
 * **The bar cannot overflow horizontally, and the reason is a spec rule rather
 * than a class.** A flex item's automatic minimum size is its content-based
 * minimum size, which is where the folklore that a `truncate` needs `min-w-0`
 * comes from. CSS Flexbox 1 §4.5 carves out the exception that settles it: the
 * automatic minimum size is zero "for scroll containers", and `overflow: hidden`
 * is what makes a box a scroll container. Tailwind's `truncate` sets
 * `overflow: hidden`, so the label span already has an automatic minimum size of
 * zero, it shrinks, and the bar stays the width of the figure whether the label
 * is two words or thirty. Adding `min-w-0` here would change nothing that is
 * painted, and a class written to prevent an overflow that cannot happen is a
 * false record in the source.
 *
 * **The label is the only span that yields, and the state's words are the one
 * span that may not.** The word-first rule is why `stateLabel` is required
 * whenever the state is not `neutral`: the words are what a reader is told and
 * the dot is only what a reader sees, and a state word cut to an ellipsis is that
 * same failure one size smaller. On a phone bar, where a long label and a short
 * state word share one row, truncation was the usual outcome before the change.
 * So the state span carries `shrink-0` and no `truncate`: it holds its own width,
 * the label truncates first and alone, and the bar still holds at any width
 * because the label is the flexible one.
 *
 * **So what this asserts is the invariant the whole thing rests on.** If a later
 * edit replaced `truncate` on the label with `whitespace-nowrap`, or with a line
 * clamp that does not set `overflow`, the automatic minimum size would go back to
 * the text's own width and the row would start pushing the figure wider than the
 * panel it is in. And if a later edit gave the state span `truncate` or dropped
 * its `shrink-0`, the state word would yield to the label exactly where a reader
 * has the least room to spare. Those are the regressions worth a test.
 *
 * The other twelve `truncate` sites in the tree that carry no `min-w-0` are the
 * same case and are not listed here: a `truncate` inside a flex COLUMN is sized
 * by `align-items: stretch` rather than by flex shrinking, and a `truncate` whose
 * flex parent already carries `min-w-0` inherits the behaviour from it.
 */
describe('the bar a panel titles itself with', () => {
  it('truncates the label and the label alone, which is what lets it shrink at all', () => {
    const { container } = render(
      <InstrumentPanel01 label="The estate, as one graph" state="live" stateLabel="live view">
        <span />
      </InstrumentPanel01>,
    )

    const bar = container.querySelector('[data-slot="instrument-panel-bar"]')!
    const truncating = [...bar.querySelectorAll('span')].filter((span) =>
      span.className.split(' ').includes('truncate'),
    )
    // One truncating span, and it is the label. The state's words are never in
    // this list, at any width, because a state a reader has to squint at is a dot
    // with extra steps.
    expect(truncating.map((span) => span.textContent)).toEqual(['The estate, as one graph'])
  })

  it('keeps the dot, the state words and the actions slot out of the shrinking', () => {
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
    // width the caller owns, so both are held at their own size and the label is
    // what yields. A row where nothing could shrink would be a row that pushes
    // the panel wider than the figure; a row where the dot and the actions can be
    // squeezed is a row that hides the controls.
    expect(bar.querySelector('[data-state]')?.className).toContain('shrink-0')
    expect(bar.querySelector('button')?.parentElement?.className).toContain('shrink-0')
    // And the state's words hold their own width too: `shrink-0` and no
    // `truncate`, so the state arrives whole at any width and the label is the
    // span that yields.
    const stateWords = [...bar.querySelectorAll('span')].find((span) => span.textContent === 'live')
    expect(stateWords?.className).toContain('shrink-0')
    expect(stateWords?.className).not.toContain('truncate')
  })
})
