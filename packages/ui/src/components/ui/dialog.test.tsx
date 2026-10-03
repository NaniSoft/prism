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

  it('keeps the coarse-pointer 44px target on the trigger in the class contract', () => {
    render(<Example />)
    const className = screen.getByRole('button', { name: 'Open settings' }).className
    // The trigger's class string is `Button`'s `default` size string, so it takes the
    // same step. What is asserted is that the copy kept the floor, not that the copy
    // exists.
    expect(className).toContain('pointer-coarse:h-11')
    expect(className).toContain('pointer-coarse:min-w-11')
    expect(className).toContain('h-9')
  })

  it('keeps the coarse-pointer 44px target on the built-in close control', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('button', { name: 'Open settings' }))
    const close = await screen.findByRole('button', { name: 'Close' })

    // A step and not a band, because the button is absolutely positioned in the
    // panel's top-right corner and any 44px band at a 16px inset hangs off the panel.
    expect(close.className).toContain('pointer-coarse:size-11')
    // Centred rather than top-left aligned inside the grown box, which is why the
    // class string gained flex and two alignment utilities: on a coarse pointer the
    // control moves inside itself and the icon has to stay in the middle of it.
    expect(close.className).toContain('items-center')
    expect(close.className).toContain('justify-center')
  })
})
