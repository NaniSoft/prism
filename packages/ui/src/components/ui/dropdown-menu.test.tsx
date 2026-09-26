import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Row actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('opens its items from the trigger and closes on Escape', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menuitem')).not.toBeInTheDocument())
  })

  it('moves between items with the arrow keys', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await screen.findByRole('menuitem', { name: 'Edit' })
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus())
  })
})
