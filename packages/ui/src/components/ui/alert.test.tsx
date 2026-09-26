import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert, AlertDescription, AlertTitle } from './alert'

describe('Alert', () => {
  it('announces itself as an alert with a title and description', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Your session expires soon.</AlertDescription>
      </Alert>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Heads up')).toBeInTheDocument()
    expect(screen.getByText('Your session expires soon.')).toBeInTheDocument()
  })
})
