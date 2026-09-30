import { Bento01 } from '@nanisoft/prism-ui/blocks/bento-01'

/**
 * Two compositions of the same six cells.
 *
 * The point of the preview is the comparison: the block holds no opinion about which
 * cell is the big one, so the same six facts compose into a page whose argument is on
 * the left and a page whose argument is in the middle.
 */
const CELLS = [
  {
    id: 'run',
    span: 'md' as const,
    title: 'Runs',
    body: 'A job that walks the estate and writes down what changed.',
  },
  {
    id: 'walk',
    span: 'md' as const,
    title: 'Walks',
    body: 'The cycle itself, with the state of the last pass and the one after it.',
  },
  {
    id: 'record',
    span: 'sm' as const,
    title: 'Records',
    body: 'Every difference kept, in the caller\'s own store.',
  },
  {
    id: 'diff',
    span: 'sm' as const,
    title: 'Diffs',
    body: 'What changed between two walks, and nothing else.',
  },
  {
    id: 'alert',
    span: 'sm' as const,
    title: 'Alerts',
    body: 'The one change worth interrupting somebody for.',
  },
  {
    id: 'export',
    span: 'lg' as const,
    title: 'Exports',
    body: 'The whole record, in whatever format the caller asks for.',
  },
]

/** The argument on the left, in two halves, with three small cells and a full width one. */
function ArgumentOnTheLeft() {
  return (
    <Bento01
      headingLevel="h3"
      eyebrow="Preview"
      title="The argument is the cell in the top left"
      description="Two halves, three small cells and a full width row. The spans add up to six tracks in every row."
      cells={[
        { ...CELLS[0], span: 'md', tone: 'primary' },
        { ...CELLS[1], span: 'md' },
        ...CELLS.slice(2),
      ]}
    />
  )
}

/** The same six cells composed again, with the full width row at the top. */
function ArgumentInTheMiddle() {
  return (
    <Bento01
      headingLevel="h3"
      eyebrow="Preview"
      title="The same six cells, composed the other way round"
      description="Nothing about the block changed. The caller moved one span and the hierarchy moved with it."
      cells={[
        { ...CELLS[5], span: 'lg' },
        { ...CELLS[0], span: 'md' },
        { ...CELLS[1], span: 'md', tone: 'muted' },
        ...CELLS.slice(2, 5),
      ]}
    />
  )
}

export default function Bento01Demo() {
  return (
    <div className="flex flex-col">
      <ArgumentOnTheLeft />
      <ArgumentInTheMiddle />
    </div>
  )
}