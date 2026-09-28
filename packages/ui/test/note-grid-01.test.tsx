import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NoteGrid01 } from '../src/blocks/note-grid-01'

/**
 * The claim under test is the element: a `dl`, so each title is announced with
 * its own body. Six bold words and then six paragraphs, read in order, leaves a
 * screen reader user to pair them up, and a grid of `div`s says nothing at all
 * about which body belongs to which title.
 *
 * The second claim is the absence: no tile, no icon, no badge. A note with an
 * icon in front of it reads as a feature, and a section of twelve features is a
 * page that argues rather than explains.
 */
const NOTES = [
  { title: 'One capture, one minute', body: 'The whole surface, every market minute.' },
  { title: 'One canonical timestamp', body: 'Every row carries the same clock.' },
  { title: 'One pinned column list', body: 'Held by test, not by convention.' },
]

describe('a grid of titled points', () => {
  it('is a definition list, so each title is announced with its own body', () => {
    const { container } = render(<NoteGrid01 notes={NOTES} title="What it captures" />)

    const grid = container.querySelector('[data-slot="note-grid"]')!
    expect(grid.tagName).toBe('DL')
    expect(container.querySelectorAll('dt')).toHaveLength(3)
    expect(container.querySelectorAll('dd')).toHaveLength(3)
    expect(screen.getByText('One capture, one minute').tagName).toBe('DT')
  })

  it('carries no tile, no icon and no badge', () => {
    const { container } = render(<NoteGrid01 notes={NOTES} />)
    const notes = [...container.querySelectorAll('[data-slot="note-grid-note"]')]

    for (const note of notes) {
      expect(note.querySelector('svg')).toBeNull()
      expect(note.className).not.toMatch(/shadow-|rounded-|bg-/)
    }
  })

  it('draws a hairline above each point rather than a card around it', () => {
    const { container } = render(<NoteGrid01 notes={NOTES} />)
    expect(
      container.querySelector('[data-slot="note-grid-note"]')?.className,
    ).toContain('border-border')
  })
})
