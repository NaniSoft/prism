import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('exposes an accessible button named by its content', () => {
    render(<Button>Save changes</Button>)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('activates with the Enter key', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save changes</Button>)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates with the Space key', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save changes</Button>)
    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not activate while disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save changes
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('keeps the coarse-pointer 44px target in the class contract', () => {
    render(<Button>Save changes</Button>)
    const className = screen.getByRole('button', { name: 'Save changes' }).className
    expect(className).toContain('pointer-coarse:')
    expect(className).toContain('pointer-coarse:h-11')
    expect(className).toContain('pointer-coarse:min-w-11')
  })
})
