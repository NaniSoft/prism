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
