import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { Command } from '../src/components/ui/command'

/**
 * One command, as a row in a list of commands.
 *
 * The claims under test are the ones that would still look right in a screenshot.
 * A row that renders the label it was given, that carries its highlight in the
 * accessible state as well as in a class, and that emphasizes the matched run by
 * weight rather than by a second colour. The emphasis assertion reads the
 * `<strong>` for a background or an ink of its own, because the defect it guards
 * is invisible: a `<strong>` with `text-foreground` inside a row that is
 * `bg-accent text-accent-foreground` when highlighted is the wrong colour in
 * exactly the state a reader sees after they press Down.
 */
const inAListbox = (children: React.ReactNode) => (
  <div role="listbox" aria-label="Commands">
    {children}
  </div>
)

describe('Command', () => {
  it('renders the label and the hint it was given and nothing else', () => {
    render(
      inAListbox(
        <Command label="Open settings" hint="Ctrl comma" keywords={['preferences']} />,
      ),
    )
    expect(screen.getByRole('option', { name: 'Open settings Ctrl comma' })).toBeTruthy()
    // The words on the row are the caller's. A row that rendered its own label
    // would ship English into every consumer's product.
    expect(screen.getByText('Open settings')).toBeTruthy()
    expect(screen.getByText('Ctrl comma')).toBeTruthy()
  })

  it('renders an empty row rather than nothing when it is handed no words', () => {
    // An empty label is the state a reader is in the moment a field is cleared. A
    // Component that threw or that rendered a placeholder of its own would be
    // shipping a word the caller never wrote.
    const { container } = render(inAListbox(<Command label="" />))
    const row = container.querySelector('[data-slot="command"]')
    expect(row).toBeTruthy()
    expect(row?.textContent).toBe('')
  })

  it('carries the highlight in the accessible state, not only in a class', () => {
    const { rerender } = render(inAListbox(<Command label="New run" active />))
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent('New run')

    rerender(inAListbox(<Command label="New run" />))
    // The absence matters as much as the presence: a row that stayed
    // aria-selected after the highlight moved is a listbox that tells a screen
    // reader two rows are chosen.
    expect(screen.getByRole('option', { selected: false })).toHaveTextContent('New run')
    expect(screen.queryByRole('option', { selected: true })).toBeNull()
  })

  it('emphasises the matched run by weight and inherits the row ink', () => {
    const { container } = render(
      inAListbox(<Command label="Open settings" matchRange={[5, 13]} active />),
    )
    const strong = container.querySelector('[data-slot="command"] strong')
    // "settings" starts at index 5 of "Open settings" and runs 8 characters.
    // Reading the range off by eye is the commonest way to write a fixture that
    // fails for a reason that is not the Component.
    expect(strong?.textContent).toBe('settings')
    expect(strong?.className).toMatch(/font-semibold/)
    // No fill and no ink of its own. The row owns both, and the row's ink changes
    // with its highlight state, so an ink on the emphasis would be correct in one
    // of the two states and wrong in the other.
    expect(strong?.className).not.toMatch(/bg-/)
    expect(strong?.className).not.toMatch(/text-/)
    expect(container.querySelector('[data-slot="command"]')?.textContent).toBe('Open settings')
  })

  it('renders the label whole when no range is given', () => {
    const { container } = render(inAListbox(<Command label="New run" />))
    expect(container.querySelector('[data-slot="command"] strong')).toBeNull()
    expect(container.querySelector('[data-slot="command"]')?.textContent).toBe('New run')
  })

  it('runs onSelect on a click and reports the pointer on hover', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onHover = vi.fn()
    render(inAListbox(<Command label="New run" onSelect={onSelect} onHover={onHover} />))

    const row = screen.getByRole('option')
    await user.hover(row)
    expect(onHover).toHaveBeenCalledTimes(1)

    await user.click(row)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('is not in the tab order, because the field above it keeps the caret', () => {
    render(inAListbox(<Command label="New run" tabIndex={-1} />))
    // A palette row that Tab reaches steals focus from the field and the reader
    // starts typing into nothing. Asserting the absence of a tab stop is the only
    // way to hold that, because the visible result of getting it wrong is a list
    // that scrolls.
    expect(screen.getByRole('option')).toHaveAttribute('tabindex', '-1')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      inAListbox(
        <>
          <Command label="Toggle theme" hint="Ctrl K" active />
          <Command label="Reset workspace" />
          <Command label="Open settings" matchRange={[5, 13]} />
        </>,
      ),
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
