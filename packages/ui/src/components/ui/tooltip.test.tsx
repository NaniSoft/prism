import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

function Example() {
  return (
    <Tooltip>
      <TooltipTrigger delay={0}>Hover me</TooltipTrigger>
      <TooltipContent>Helpful hint</TooltipContent>
    </Tooltip>
  )
}

describe('Tooltip', () => {
  it('shows its text on hover of the trigger', async () => {
    render(<Example />)
    await userEvent.hover(screen.getByRole('button', { name: 'Hover me' }))
    expect(await screen.findByText('Helpful hint')).toBeInTheDocument()
  })
})
