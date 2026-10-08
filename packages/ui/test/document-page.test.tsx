/**
 * The document and research workspace: one document read in full, with its regions.
 *
 * **What is being tested is the composition and the outline.** The Page is not a new
 * document model: it is the arrangement that places the document and one or more
 * regions drawn by settled Blocks, so the things worth asserting are that every
 * region renders the caller's own content, that the document owns exactly one `h1`,
 * and that every region is a section one level under it. A test that asserted a
 * document, version, comment or source type would be testing a type the Page
 * deliberately does not mint.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { DataTable01Labels } from '../src/blocks/data-table-01'
import { DocumentPage, type DocumentPageRegion } from '../src/pages/document-page'
import type { ColumnSpec, EventSpec } from '../src/lib/spec'

const EVENTS: EventSpec[] = [
  { key: 'v2', at: '2026-10-08', actor: 'Margret', action: 'published version 2' },
  { key: 'v1', at: '2026-10-06', actor: 'Priya', action: 'started the document' },
]

const COLUMNS: readonly ColumnSpec[] = [
  { key: 'title', header: 'Source', kind: 'Typography' },
]

const ROWS = [{ id: 's1', title: 'Northbound arrival logs' }]

const LABELS: DataTable01Labels = {
  search: 'Search sources',
  filters: 'Filters',
  reset: 'Reset filters',
  columns: 'Columns',
  viewColumns: 'View',
  selectAll: 'Select every source on this page',
  selectRow: (row) => `Select ${String(row.title)}`,
  rowActions: 'Source actions',
  sort: (column, direction) => `Sort by ${column}, ${direction}`,
  selectedCount: (count) => `${count} selected on this page`,
  selectedAllMatching: (count) => `All ${count} matching sources selected`,
  clearedSelection: 'No sources selected',
  dismissSelection: 'Clear selection',
  previous: 'Previous',
  next: 'Next',
  page: (value) => `Go to page ${value}`,
  empty: 'No source matches.',
}

const REGIONS: readonly DocumentPageRegion[] = [
  {
    key: 'evidence',
    block: 'comparison',
    props: {
      title: 'Evidence',
      labels: ['Method', 'Sample'],
      left: { name: 'Study A', points: [{ value: 'Logs' }, { value: '4 weeks' }] },
      right: { name: 'Study B', points: [{ value: 'Interviews' }, { value: '6 people' }] },
    },
  },
  {
    key: 'sources',
    block: 'table',
    props: {
      title: 'Sources',
      columns: COLUMNS,
      rows: ROWS,
      getRowId: (row) => String(row.id),
      pageCount: 1,
      labels: LABELS,
    },
  },
  {
    key: 'versions',
    block: 'activity',
    props: { title: 'Versions', events: EVENTS, empty: 'No version yet.' },
  },
  {
    key: 'comments',
    block: 'members',
    props: {
      label: 'People on this document',
      title: 'Comment thread',
      members: [{ id: 'mh', name: 'Margret Haldorsdottir', role: 'Lead author' }],
      empty: 'Nobody has commented yet.',
    },
  },
]

/** The Page, with the four region kinds and a body. */
function renderPage(regions: readonly DocumentPageRegion[] = REGIONS) {
  return render(
    <DocumentPage
      document={{
        eyebrow: 'DOC-4821',
        title: 'Northbound timetable review',
        description: 'Where the service loses four minutes.',
        fields: [{ id: 'status', label: 'Status', value: 'In review' }],
        body: <p>The body, in the caller&apos;s own words.</p>,
      }}
      regions={regions}
    />,
  )
}

describe('the composition', () => {
  it('renders the document read in full with the caller’s content', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Northbound timetable review' })).toBeTruthy()
    expect(screen.getByText('DOC-4821')).toBeTruthy()
    expect(screen.getByText('Where the service loses four minutes.')).toBeTruthy()
    expect(screen.getByText('In review')).toBeTruthy()
    expect(screen.getByText("The body, in the caller's own words.")).toBeTruthy()
  })

  it('renders every region with the caller’s own content', () => {
    renderPage()

    // Each region draws its own Block, and the caller's words are in each.
    expect(screen.getByText('Study A')).toBeTruthy()
    expect(screen.getByText('Interviews')).toBeTruthy()
    expect(screen.getByText('Northbound arrival logs')).toBeTruthy()
    expect(screen.getByText('published version 2')).toBeTruthy()
    expect(screen.getByText('Margret Haldorsdottir')).toBeTruthy()
  })

  it('renders no region when none is passed, and the body still stands', () => {
    const { container } = renderPage([])

    expect(container.querySelectorAll('[data-slot="document-page-regions"]')).toHaveLength(0)
    expect(screen.getByText("The body, in the caller's own words.")).toBeTruthy()
  })
})

describe('the outline', () => {
  it('owns exactly one h1, and it is the document’s title', () => {
    const { container } = renderPage()

    const ones = container.querySelectorAll('h1')
    expect(ones).toHaveLength(1)
    expect(ones[0]?.textContent).toBe('Northbound timetable review')
  })

  it('places every region one level under the document, at h2', () => {
    const { container } = renderPage()

    const twos = [...container.querySelectorAll('h2')].map((heading) => heading.textContent)
    // The four regions, each named by the title the caller passed.
    expect(twos).toEqual(['Evidence', 'Sources', 'Versions', 'Comment thread'])
  })

  it('names each region by its own heading, so a reader navigating by heading reaches it', () => {
    const { container } = renderPage()

    for (const name of ['Evidence', 'Sources', 'Versions', 'Comment thread']) {
      // The region the heading introduces holds content, so it is a named section
      // rather than a heading over nothing.
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy()
    }
    expect(container.textContent).toContain('Northbound arrival logs')
    expect(container.textContent).toContain('published version 2')
  })

  it('keeps the body inside the record detail’s own content slot', () => {
    const { container } = renderPage()

    const content = container.querySelector('[data-slot="record-detail-01-content"]')
    expect(content?.querySelector('[data-slot="prose"]')).toBeTruthy()
    expect(content?.textContent).toContain("The body, in the caller's own words.")
  })
})
