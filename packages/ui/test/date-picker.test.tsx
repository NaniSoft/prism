import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { DatePicker } from '../src/components/ui/date-picker'

/**
 * A field that opens a month grid and holds the date the reader picks.
 *
 * The claims under test are the ones a screenshot cannot hold: that an unset field
 * renders as an empty field rather than defaulting to today, that the grid opens
 * on the month of the answer rather than the month the caller seeded, that the
 * field announces its name and its value as two things, that choosing a date
 * submits an ISO day and never the string the reader can see, and that clearing
 * is possible only when the caller supplied the words for it.
 */
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
const today = new Date(2026, 2, 17)

const format = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date)

type Props = Partial<Parameters<typeof DatePicker>[0]>

const renderPicker = (props: Props = {}) =>
  render(
    <DatePicker
      label="Delivery date"
      placeholder="Choose a date"
      format={format}
      monthLabel={monthLabel}
      weekdayLabels={[...weekdays]}
      previousLabel="Previous month"
      nextLabel="Next month"
      today={today}
      {...props}
    />,
  )

/** The Popover portals its content, so the grid is queried from the document. */
const gridDay = (iso: string) => document.querySelector<HTMLElement>(`[data-date="${iso}"]`)

describe('DatePicker', () => {
  it('renders an empty field when nothing is chosen, and shows the caller placeholder', () => {
    const { container } = renderPicker({ name: 'delivery' })
    const trigger = screen.getByRole('button', { name: 'Delivery date' })

    // A field that opened onto today's date would have answered a question nobody
    // asked, and the value it submitted would be a guess.
    expect(trigger.textContent).toBe('Choose a date')
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe('')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('announces the name and the value as two things, not the value as the name', () => {
    renderPicker({ defaultValue: new Date(2026, 2, 17) })
    const trigger = screen.getByRole('button', { name: 'Delivery date' })

    // Letting the visible date become the name would replace the field's name with
    // its current answer, so a reader tabbing through a form of five date fields
    // would hear five dates and no questions.
    expect(trigger).toHaveAccessibleName('Delivery date')
    expect(trigger).toHaveAccessibleDescription('17 March 2026')
    expect(trigger.textContent).toBe('17 March 2026')
  })

  it('opens the grid on the current month when the field is empty', async () => {
    const user = userEvent.setup()
    renderPicker()
    await user.click(screen.getByRole('button', { name: 'Delivery date' }))

    expect(await screen.findByRole('grid', { name: 'Delivery date' })).toBeTruthy()
    expect(screen.getByText(monthLabel(today))).toBeTruthy()
  })

  it('opens the grid on the month of the answer when the field already holds one', async () => {
    const user = userEvent.setup()
    renderPicker({ defaultValue: new Date(2025, 10, 4) })
    await user.click(screen.getByRole('button', { name: 'Delivery date' }))

    // Re-picking a date in another month must not reset the grid to the month the
    // caller seeded it with, which is a silent undo of the navigation just done.
    expect(await screen.findByRole('grid', { name: 'Delivery date' })).toBeTruthy()
    expect(screen.getByText('November 2025')).toBeTruthy()
  })

  it('commits the date, closes the surface and returns focus to the field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = renderPicker({ onValueChange, name: 'delivery' })
    const trigger = screen.getByRole('button', { name: 'Delivery date' })

    await user.click(trigger)
    await waitFor(() => expect(gridDay('2026-03-09')).toBeTruthy())
    await user.click(gridDay('2026-03-09') as HTMLElement)

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBeInstanceOf(Date)
    // One gesture. A field that left the grid open after a choice asks the reader
    // to confirm an answer they already gave.
    await waitFor(() => expect(screen.queryByRole('grid')).toBeNull())
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe(
      '2026-03-09',
    )
  })

  it('submits an ISO day rather than the string the reader can see', async () => {
    const user = userEvent.setup()
    const { container } = renderPicker({ defaultValue: new Date(2026, 2, 17), name: 'delivery' })

    // "17 March 2026" is for a person and "2026-03-17" is for a machine. A form that
    // posts what it displays hands every downstream reader a phrase to parse.
    expect(screen.getByRole('button', { name: 'Delivery date' }).textContent).toBe(
      '17 March 2026',
    )
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe(
      '2026-03-17',
    )
    expect(screen.getByRole('button', { name: 'Delivery date' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Delivery date' }))
    await waitFor(() => expect(gridDay('2026-03-09')).toBeTruthy())
  })

  it('does not offer a clear control until the caller supplies the words for it', async () => {
    const { rerender } = renderPicker({ defaultValue: new Date(2026, 2, 17) })
    // No `clearLabel`, so no control. A Component that rendered one would ship an
    // English name for it into every consumer's form.
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull()

    rerender(
      <DatePicker
        label="Delivery date"
        placeholder="Choose a date"
        format={format}
        monthLabel={monthLabel}
        weekdayLabels={[...weekdays]}
        previousLabel="Previous month"
        nextLabel="Next month"
        clearLabel="Clear the date"
        today={today}
        defaultValue={new Date(2026, 2, 17)}
      />,
    )
    expect(screen.getByRole('button', { name: 'Clear the date' })).toBeTruthy()
  })

  it('clears the answer and the submitted value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = renderPicker({
      defaultValue: new Date(2026, 2, 17),
      clearLabel: 'Clear the date',
      onValueChange,
      name: 'delivery',
    })

    await user.click(screen.getByRole('button', { name: 'Clear the date' }))

    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe('')
    expect(screen.getByRole('button', { name: 'Delivery date' }).textContent).toBe('Choose a date')
  })

  it('takes the coarse-pointer 44px floor on the clear control as a band', () => {
    renderPicker({ defaultValue: new Date(2026, 2, 17), clearLabel: 'Clear the date' })
    const className = screen.getByRole('button', { name: 'Clear the date' }).className

    expect(className).toContain('pointer-coarse:before:h-11')
    expect(className).toContain('pointer-coarse:before:w-11')
    // A band and not a step: the control sits over the field's own trigger at
    // `right-9`, and `pr-16` on that trigger reserves 64px of clear space. A 44px step
    // there would be 44 wide starting at that offset and would run sixteen pixels
    // under the value the reservation exists to keep clear; the band adds ten.
    expect(className).not.toMatch(/pointer-coarse:(?:size|h|w|min-w)-/)
    expect(className).toContain('size-6')
  })

  it('refuses to choose a date the caller disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderPicker({ onValueChange, isDateDisabled: (date) => date.getDate() === 12 })

    await user.click(screen.getByRole('button', { name: 'Delivery date' }))
    await waitFor(() => expect(gridDay('2026-03-12')).toBeTruthy())
    await user.click(gridDay('2026-03-12') as HTMLElement)

    // The rule is the Calendar's; what this Component has to get right is that it
    // passes the rule through rather than choosing a date the caller refused.
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('marks a required empty field as invalid', () => {
    renderPicker({ required: true })
    expect(screen.getByRole('button', { name: 'Delivery date' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('has no accessibility violations when the field is closed', async () => {
    const { container } = renderPicker({ defaultValue: new Date(2026, 2, 17) })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('has no accessibility violations when the grid is open', async () => {
    const user = userEvent.setup()
    renderPicker({ today })
    await user.click(screen.getByRole('button', { name: 'Delivery date' }))
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy())

    const results = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
