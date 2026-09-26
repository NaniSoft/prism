import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

function Example() {
  return (
    <Tabs defaultValue="one">
      <TabsList aria-label="Sections">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('marks the active tab and shows its panel', () => {
    render(<Example />)
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('First panel')).toBeInTheDocument()
  })

  it('switches panels when another tab is chosen', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Second panel')).toBeInTheDocument()
  })

  it('moves focus between tabs with the arrow keys', async () => {
    render(<Example />)
    const first = screen.getByRole('tab', { name: 'One' })
    first.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus()
  })
})
