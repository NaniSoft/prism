import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Calendar, type CalendarProps } from '../src/components/ui/calendar'

/**
 * A month grid for picking one date.
 *
 * Base UI at 1.8.0 ships no calendar, so this Component is built rather than
 * composed, and the tests assert the claims a screenshot cannot: that the grid is
 * six rows whatever the month needs, that exactly one cell is in the tab order and
 * it is the one the reader cares about, that paging a month from the 31st lands on
 * the 30th rather than in the month before, and that a disabled date is drawn and
 * refuses to be chosen instead of quietly not existing.
 */
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

/** March 2026 starts on a Sunday and has 31 days, so it needs five rows. */
const march = new Date(2026, 2, 1)

const monthName = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date)

type Props = Partial<Parameters<typeof Calendar>[0]>

const renderCalendar = (props: Props = {}) =>
  render(
    <Calendar
      label="Delivery date"
      monthLabel="March 2026"
      weekdayLabels={[...weekdays]}
      previousLabel="Previous month"
      nextLabel="Next month"
      month={march}
      onMonthChange={() => {}}
      {...props}
    />,
  )

/** The controlled calendar, so a move of month is visible rather than merely called. */
function Harness({ initial = march, ...props }: Props & { initial?: Date }) {
  const [month, setMonth] = useState(initial)
  return (
    <Calendar
      label="Delivery date"
      monthLabel={monthName(month)}
      weekdayLabels={[...weekdays]}
      previousLabel="Previous month"
      nextLabel="Next month"
      {...props}
      month={month}
      onMonthChange={setMonth}
    />
  )
}

const cells = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-slot="calendar-day"]')]

const cell = (container: HTMLElement, iso: string) =>
  container.querySelector<HTMLElement>(`[data-date="${iso}"]`)

const tabbable = (container: HTMLElement) =>
  cells(container).filter((node) => node.getAttribute('tabindex') === '0')

describe('Calendar', () => {
  it('shows the caption and the weekday headings the caller gave it', () => {
    renderCalendar()
    expect(screen.getByRole('grid', { name: 'Delivery date' })).toBeTruthy()
    expect(screen.getByText('March 2026')).toBeTruthy()
    // Every weekday heading is the caller's, in the caller's order. A Component
    // that carried a table of month and weekday names would ship English and a
    // Western week into every consumer's product.
    const headings = [...document.querySelectorAll('[data-slot="calendar-weekday"]')].map(
      (node) => node.textContent,
    )
    expect(headings).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'])
  })

  it('is always six weeks tall, and hides the cells that belong to another month', () => {
    const { container } = renderCalendar()
    const rows = [...container.querySelectorAll('[data-slot="calendar-grid"] tbody tr')]
    // March 2026 needs five rows. A grid that resized with the month would move the
    // dates under the pointer and under the highlight as the reader pages through,
    // and a reader aiming at the 24th after reading a five-row month would click
    // the 31st in a six-row one.
    expect(rows).toHaveLength(6)

    const all = [...container.querySelectorAll('[data-slot="calendar-grid"] tbody td')]
    expect(all).toHaveLength(42)
    // Thirty-one cells for March, and the eleven that would be April and late
    // February are padding. They are hidden rather than filled with the
    // neighbouring month's dates, because a date from another month drawn here is
    // a date the reader did not come for.
    expect(cells(container)).toHaveLength(31)
    const padding = all.filter((node) => node.getAttribute('aria-hidden') === 'true')
    expect(padding).toHaveLength(11)
    expect(padding.every((node) => node.getAttribute('tabindex') === null)).toBe(true)
  })

  it('sets the tab stop on the chosen date', () => {
    const { container } = renderCalendar({ value: new Date(2026, 2, 17) })
    const stops = tabbable(container)
    // One Tab into the grid has to land on the date the reader already answered,
    // not on the 1st, which is where a naive roving tabindex always lands.
    expect(stops).toHaveLength(1)
    expect(stops[0].getAttribute('data-date')).toBe('2026-03-17')
    expect(stops[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('sets the tab stop on today when there is no chosen date', () => {
    const { container } = renderCalendar({ today: new Date(2026, 2, 12) })
    expect(tabbable(container)[0].getAttribute('data-date')).toBe('2026-03-12')
    expect(cell(container, '2026-03-12')).toHaveAttribute('aria-current', 'date')
  })

  it('sets the tab stop on the first of the month when there is neither', () => {
    const { container } = renderCalendar()
    expect(tabbable(container)[0].getAttribute('data-date')).toBe('2026-03-01')
  })

  it('marks a chosen date as selected and nothing else', () => {
    const { container } = renderCalendar({ value: new Date(2026, 2, 17) })
    const selected = cells(container).filter((node) => node.getAttribute('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    // An unset field has nothing selected, rather than selecting the first date so
    // that something is always highlighted.
    const { container: empty } = renderCalendar()
    expect(
      cells(empty).filter((node) => node.getAttribute('aria-selected') === 'true'),
    ).toHaveLength(0)
  })

  it('moves the tab stop a day and a week with the arrows', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    cell(container, '2026-03-01')?.focus()

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(cell(container, '2026-03-02'))
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(cell(container, '2026-03-09'))
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.activeElement).toBe(cell(container, '2026-03-07'))
  })

  it('moves the month on show when an arrow crosses into it, and takes focus with it', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    const lastMarch = cell(container, '2026-03-31') ?? cell(container, '2026-03-30')
    lastMarch?.focus()

    await user.keyboard('{ArrowRight}')

    expect(screen.getByText('April 2026')).toBeTruthy()
    // Focus has to land in the newly drawn month. A grid that moved the month and
    // left the highlight behind is a grid the reader cannot continue from.
    expect(document.activeElement).toBe(cell(container, '2026-04-01'))
  })

  it('pages a month with PageDown and clamps the day to the length of the target month', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness initial={new Date(2026, 0, 1)} value={new Date(2026, 0, 31)} />)
    cell(container, '2026-01-31')?.focus()

    await user.keyboard('{PageDown}')

    // February 2026 has 28 days. Rolling would put the reader in January, which is
    // the month they came from, with nothing on screen to say the date moved.
    expect(screen.getByText('February 2026')).toBeTruthy()
    expect(document.activeElement).toBe(cell(container, '2026-02-28'))
  })

  it('pages a year with Shift and PageDown', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    cell(container, '2026-03-01')?.focus()

    await user.keyboard('{Shift>}{PageUp}{/Shift}')
    expect(screen.getByText('March 2025')).toBeTruthy()
  })

  it('goes to the ends of the week with Home and End', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    // The 11th of March 2026 is a Wednesday: its week runs from the 8th to the
    // 14th, and reading that off the fixture is the difference between a test of
    // the Component and a test of the fixture.
    cell(container, '2026-03-11')?.focus()

    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(cell(container, '2026-03-08'))
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(cell(container, '2026-03-14'))
  })

  it('draws a disabled date, keeps it reachable, and refuses to choose it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(
      <Harness
        onValueChange={onValueChange}
        isDateDisabled={(date) => date.getDate() === 20}
      />,
    )
    const twentieth = cell(container, '2026-03-20')
    expect(twentieth).toBeTruthy()
    expect(twentieth).toHaveAttribute('aria-disabled', 'true')
    // It is in the grid, not absent: a date that is simply missing is
    // indistinguishable from a grid that failed to draw that week.
    expect(twentieth?.textContent).toBe('20')

    twentieth?.focus()
    await user.keyboard('{Enter}')
    await user.click(twentieth as HTMLElement)
    expect(onValueChange).not.toHaveBeenCalled()

    // And it does not trap the arrows: a reader on a date that cannot be chosen
    // can still leave it.
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(cell(container, '2026-03-21'))
  })

  it('chooses the focused date on Enter and on a click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(<Harness onValueChange={onValueChange} />)

    cell(container, '2026-03-09')?.focus()
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBeInstanceOf(Date)
    expect(onValueChange.mock.calls[0]?.[0].getDate()).toBe(9)

    await user.click(cell(container, '2026-03-14') as HTMLElement)
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 14))
  })

  it('names each day from the caller when a day label is given', () => {
    const { container } = renderCalendar({
      dayLabel: (date) => `${date.getDate()} March 2026`,
    })
    // A full date is a phrase in the reader's language, so it is the caller's. The
    // grid's own name is the grid's; the day is the day's.
    expect(cell(container, '2026-03-09')).toHaveAttribute('aria-label', '9 March 2026')
  })

  it('announces a change of month from the caption, which is a live region', () => {
    renderCalendar()
    const caption = screen.getByText('March 2026')
    // Paging a month is the one navigation here with no other visible consequence
    // for a reader sitting on the grid.
    expect(caption.getAttribute('aria-live')).toBe('polite')
  })

  it('steps a month with the previous and next controls', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('April 2026')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText('March 2026')).toBeTruthy()
  })

  it('submits the chosen date as a plain ISO day, and nothing when none is chosen', () => {
    const { container: chosen } = renderCalendar({ name: 'delivery', value: new Date(2026, 2, 17) })
    const { container: empty } = renderCalendar({ name: 'delivery' })

    expect(chosen.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe('2026-03-17')
    // An unset field submits nothing rather than the first date in the month, which
    // would answer a question the reader was never asked.
    expect(empty.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe('')
  })

  it('sets dates in tabular figures, because a grid of dates read as a column is a column', () => {
    const { container } = renderCalendar()
    // Proportional figures put 11 in a different width from 1, and a grid of dates
    // whose columns do not line up cannot be read down a column at all.
    expect(container.querySelector('[data-slot="calendar-grid"]')?.className).toMatch(
      /tabular-nums/,
    )
    expect(cell(container, '2026-03-11')?.className).toMatch(/tabular-nums/)
  })

  it('is inert when it is disabled', () => {
    const { container } = renderCalendar({ disabled: true })
    expect(cell(container, '2026-03-10')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = renderCalendar({
      value: new Date(2026, 2, 17),
      today: new Date(2026, 2, 1),
      isDateDisabled: (date) => date.getDate() === 20,
      dayLabel: (date) => `${date.getDate()} March 2026`,
    })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})

// The props type is imported so a change to the Component's surface fails this
// file rather than silently leaving a caller behind.
export type { CalendarProps }
