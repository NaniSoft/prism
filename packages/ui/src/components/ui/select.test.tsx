import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

function Example() {
  return (
    <Select defaultValue="apple" items={{ apple: 'Apple', banana: 'Banana' }}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('Select', () => {
  it('shows the selected value in the trigger', () => {
    render(<Example />)
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Apple')
  })

  it('opens its options and chooses one', async () => {
    render(<Example />)
    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    await userEvent.click(trigger)
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }))
    await waitFor(() => expect(trigger).toHaveTextContent('Banana'))
  })
})
