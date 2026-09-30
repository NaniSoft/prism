import { ContentGrid01, type ContentGrid01Entry } from '@nanisoft/prism-ui/blocks/content-grid-01'

/**
 * A figure for the `media` slot, drawn here rather than fetched, so the Demo is
 * self contained.
 *
 * A Demo is the documentation site's own content and a remote image would put a
 * third party in the middle of it, so the figure is a plate of the set's own
 * numbers. The fills are the image's own pixels rather than a component's ink, which
 * is the one place a value in this repository is not also a token.
 */
function plate(rows: string[]) {
  const body = rows
    .map(
      (row, index) =>
        `<text x="40" y="${150 + index * 44}" font-family="ui-monospace, monospace" font-size="26" fill="#1e293b">${row}</text>`,
    )
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">` +
    `<rect width="640" height="400" fill="#f8fafc"/>` +
    `<rect width="640" height="96" fill="#e2e8f0"/>` +
    `<text x="40" y="62" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="600" fill="#0f172a">Adoption</text>` +
    body +
    `</svg>`
  return <img src={`data:image/svg+xml,${encodeURIComponent(svg)}`} alt="" className="w-full" />
}

/**
 * Four entries, and the set carries every state the Block has: one entry with all
 * four annotations, one with a reading and a link, one with nothing but a name and
 * a summary, and one with a figure in the `media` slot.
 */
const ENTRIES: ContentGrid01Entry[] = [
  {
    id: 'idempotence',
    title: 'Every run is a pure function of its input',
    summary: 'What a rebuild is allowed to reuse, and what it has to earn again from the source it was given.',
    at: '2026-08-14',
    category: 'Design',
    readingTime: '9 min',
    href: '/notes/idempotence',
    hrefLabel: 'Read the note',
  },
  {
    id: 'retention',
    title: 'What a capture keeps, and for how long',
    summary: 'Three retention tiers, and the one that is deliberately short.',
    at: '2026-06-02',
    category: 'Policy',
    readingTime: '5 min',
  },
  {
    id: 'traces',
    title: 'Traces outlive the run that wrote them',
    summary: 'A run is a few minutes. The evidence for it is a year.',
    at: '2026-04-19',
    href: '/notes/traces',
    hrefLabel: 'Open the note on traces',
  },
  {
    id: 'adoption',
    title: 'How a plant decides to stop running on paper',
    summary: 'The order the migration runs in, and the two things that have to be true before the first step.',
    at: '2026-02-11',
    category: 'Field',
    media: plate(['line 1 ... 61%  ... 09 wks', 'line 2 ... 12%  ... 31 wks', 'line 3 ... 04%  ... 02 wks']),
  },
]

/** The three arrangements, on one set of entries, so the states are comparable. */
export default function ContentGrid01Demo() {
  return (
    <>
      <ContentGrid01
        headingLevel="h3"
        eyebrow="Preview"
        title="Notes from the floor"
        description="Four of them. One carries every annotation, one carries a reading and a link, one carries nothing but a name and a summary, and one carries a figure."
        columns={2}
        entries={ENTRIES}
      />

      <ContentGrid01
        headingLevel="h3"
        title="As full-width rows"
        variant="rows"
        entries={ENTRIES.slice(0, 2)}
      />

      <ContentGrid01
        headingLevel="h3"
        title="As a compact index"
        variant="compact"
        entries={ENTRIES}
      />
    </>
  )
}
