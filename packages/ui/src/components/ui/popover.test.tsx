import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Popover, PopoverContent, PopoverTrigger } from './popover'

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Filters</PopoverTrigger>
      <PopoverContent>
        <p>Filter body</p>
      </PopoverContent>
    </Popover>
  )
}

describe('Popover', () => {
  it('opens from its trigger and closes on Escape, returning focus', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Filters' })
    await userEvent.click(trigger)
    expect(await screen.findByText('Filter body')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('Filter body')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
