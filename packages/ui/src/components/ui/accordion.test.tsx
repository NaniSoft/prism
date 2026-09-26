import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

function Example() {
  return (
    <Accordion>
      <AccordionItem value="q1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes, the trigger is a real button.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

describe('Accordion', () => {
  it('starts closed and opens its panel on click', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Yes, the trigger is a real button.')).toBeInTheDocument()
  })

  it('opens the focused trigger with the Enter key', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
