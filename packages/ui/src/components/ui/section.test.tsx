import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Section, SectionHeading } from './section'

describe('Section', () => {
  it('renders a section with its heading at the composed level', () => {
    render(
      <Section>
        <SectionHeading title="Features" description="What ships in v1." />
      </Section>,
    )
    expect(screen.getByRole('heading', { name: 'Features', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('What ships in v1.')).toBeInTheDocument()
  })

  it('renders the heading at the level the document asks for', () => {
    render(<SectionHeading as="h3" title="Nested" />)
    expect(screen.getByRole('heading', { name: 'Nested', level: 3 })).toBeInTheDocument()
  })
})
