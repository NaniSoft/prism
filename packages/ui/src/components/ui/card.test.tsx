import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

describe('Card', () => {
  it('renders the composed header, content and footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>This month</CardDescription>
        </CardHeader>
        <CardContent>1,204 requests</CardContent>
        <CardFooter>Updated hourly</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Usage')).toBeInTheDocument()
    expect(screen.getByText('This month')).toBeInTheDocument()
    expect(screen.getByText('1,204 requests')).toBeInTheDocument()
    expect(screen.getByText('Updated hourly')).toBeInTheDocument()
  })
})
