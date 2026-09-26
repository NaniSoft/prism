import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog'

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Open settings</DialogTrigger>
      <DialogContent>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>Change your preferences.</DialogDescription>
        <DialogClose>Cancel</DialogClose>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('opens named, moves focus into the panel, and closes on Escape', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Open settings' })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Settings' })
    expect(dialog.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
