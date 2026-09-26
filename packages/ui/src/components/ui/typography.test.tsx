import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Heading, Text } from './typography'

describe('Typography', () => {
  it('renders a heading at the requested level', () => {
    render(<Heading as="h1">Page title</Heading>)
    expect(screen.getByRole('heading', { name: 'Page title', level: 1 })).toBeInTheDocument()
  })

  it('renders body text as a paragraph by default', () => {
    render(<Text>Supporting copy</Text>)
    expect(screen.getByText('Supporting copy').tagName).toBe('P')
  })

  it('renders an inline run when asked', () => {
    render(<Text as="span">Inline copy</Text>)
    expect(screen.getByText('Inline copy').tagName).toBe('SPAN')
  })
})
