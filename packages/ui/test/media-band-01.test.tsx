import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MediaBand01 } from '../src/blocks/media-band-01'

/**
 * The band's job is composition, so the assertions are about the tree a reader
 * meets rather than about a screenshot: the heading, the media slot with its own
 * accessible name, the one action, and the order the copy and the media take.
 */
describe('an editorial media band', () => {
  const media = <img src="/media/factory.webp" alt="A precision assembly line." width={2400} height={1029} />

  it('renders the title, the media and one native link', () => {
    render(
      <MediaBand01
        title="A person decides. The factory does the rest."
        description="One issue in, one reviewed pull request out."
        media={media}
        action={{ label: 'Read the loop', href: '#loop' }}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'A person decides. The factory does the rest.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'A precision assembly line.' })).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Read the loop' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '#loop')
  })

  it('puts the copy before the media in the document, so a phone meets the title first', () => {
    const { container } = render(<MediaBand01 title="A title" media={media} />)

    const copy = container.querySelector('[data-slot="media-band-01-copy"]')!
    const frame = container.querySelector('[data-slot="media-band-01-media"]')!
    expect(copy.compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('moves the media to the first visual column at lg when the caller asks for it', () => {
    const { container } = render(<MediaBand01 title="A title" media={media} align="media-left" />)

    expect(container.querySelector('[data-slot="media-band-01-media"]')?.className).toContain(
      'lg:order-1',
    )
    expect(container.querySelector('[data-slot="media-band-01-copy"]')?.className).toContain(
      'lg:order-2',
    )
  })

  it('holds the media at the ratio the caller chose', () => {
    const { container } = render(<MediaBand01 title="A title" media={media} ratio="square" />)

    const ratio = container.querySelector('[data-slot="aspect-ratio"]')
    expect(ratio).not.toBeNull()
    expect(Number(ratio?.getAttribute('data-ratio'))).toBe(1)
  })

  it('states its own ink on the muted surface', () => {
    const { container } = render(<MediaBand01 title="A title" media={media} tone="muted" />)

    const section = container.querySelector('section')
    expect(section?.className).toContain('bg-muted')
    expect(section?.className).toContain('text-foreground')
  })

  it('renders no action when the band is a statement rather than an ask', () => {
    render(<MediaBand01 title="A title" media={media} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
