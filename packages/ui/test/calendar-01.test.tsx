import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  Calendar01,
  type CalendarBlock01Props,
  type CalendarItem,
} from '../src/blocks/calendar-01/calendar'

/**
 * The date view: the per-item move control it places and does not own, and the
 * item selection it already reports.
 *
 * The Block owns no drag, no drop and no move, so a reschedule is the caller's own
 * control written into an item's `handle`. These are the two claims a screenshot
 * cannot hold: that the caller's node is drawn per item where it was given and
 * nowhere it was not, and that the moving is the caller's handler rather than
 * anything the Block wires.
 */

const ITEMS: CalendarItem[] = [
  {
    id: 'a',
    date: '2026-10-02',
    label: 'Access review',
    handle: <button type="button">Move Access review</button>,
  },
  { id: 'b', date: '2026-10-05', label: 'Ship the fix' },
]

type Overrides = Partial<CalendarBlock01Props>

function renderCalendar(props: Overrides = {}) {
  return render(
    <Calendar01
      title="October"
      headingLevel="h3"
      month={new Date(2026, 9, 1)}
      onMonthChange={() => {}}
      previousLabel="The month before"
      nextLabel="The month after"
      label="Scheduled work, by month"
      items={ITEMS}
      overflowLabel={(count: number) => `${count} more on this day`}
      {...props}
    />,
  )
}

describe('the date view places the caller move control', () => {
  it('draws a handle for an item that has one and none for an item that does not', () => {
    const { container } = renderCalendar()
    const handles = container.querySelectorAll('[data-slot="calendar-01-handle"]')
    expect(handles).toHaveLength(1)
    expect(
      within(handles[0] as HTMLElement).getByRole('button', { name: 'Move Access review' }),
    ).toBeTruthy()
  })

  it('lets the caller handle act, because the Block owns no move of its own', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderCalendar({
      items: [
        {
          id: 'a',
          date: '2026-10-02',
          label: 'Access review',
          handle: (
            <button type="button" onClick={onMove}>
              Move Access review
            </button>
          ),
        },
      ],
    })

    await user.click(screen.getByRole('button', { name: 'Move Access review' }))
    expect(onMove).toHaveBeenCalledTimes(1)
  })

  it('still reports a chosen item through onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderCalendar({ onSelect })

    await user.click(screen.getByRole('button', { name: 'Ship the fix' }))
    expect(onSelect).toHaveBeenCalledWith('b')
  })
})
