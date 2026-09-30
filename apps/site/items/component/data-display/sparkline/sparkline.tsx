import { Sparkline } from '@nanisoft/prism-ui/components/sparkline'

/**
 * Four sparklines in the place they are for: a column of rows, each with its
 * number beside its shape.
 *
 * The third is the narrow-range one, and it is here because it is the case worth
 * arguing about. Those readings move by well under a percent and the line looks
 * like a cliff, because a line is scaled to its own range and not floored at zero.
 * The floor is right for a bar and wrong for a line, and this is what the trade
 * looks like when it is visible: the shape is legible and the exaggeration is
 * real. The numbers are the answer, and they are in the table either way.
 */
const ROWS: {
  id: string
  label: string
  reading: string
  values: readonly number[]
  tone: 'chart-1' | 'chart-2' | 'chart-5'
  emphasizeLast?: boolean
}[] = [
  {
    id: 'requests',
    label: 'Requests per hour',
    reading: '1,284',
    values: [12, 18, 14, 22, 19, 31],
    tone: 'chart-1',
  },
  {
    id: 'latency',
    label: 'p95 latency, milliseconds',
    reading: '184',
    values: [140, 168, 151, 210, 176, 184],
    tone: 'chart-2',
    emphasizeLast: true,
  },
  {
    id: 'errors',
    label: 'Error rate, percent',
    reading: '0.31',
    values: [0.28, 0.34, 0.3, 0.41, 0.29, 0.31],
    tone: 'chart-5',
  },
  {
    id: 'queue',
    label: 'Queue depth',
    reading: '58',
    values: [4, 9, 6, 13, 8, 11],
    tone: 'chart-1',
  },
]

/** Every reading above is also in that sparkline's own table, in the document. */
export default function SparklineDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-6">
      <ul className="divide-y">
        {ROWS.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-4 py-2">
            <div className="flex min-w-0 flex-col">
              <span className="text-sm">{row.label}</span>
              <span className="text-muted-foreground text-xs">
                {row.values.length} readings
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-sm tabular-nums">{row.reading}</span>
              <Sparkline
                label={row.label}
                values={row.values}
                tone={row.tone}
                emphasizeLast={row.emphasizeLast}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        Each row&apos;s numbers are also in a table the drawing cannot drift from,
        in a visually hidden wrapper. A screen reader reaches every reading, a
        reader&apos;s own table navigation can walk the column, and a crawler
        indexing this page finds the figures rather than a picture.
      </p>
    </div>
  )
}
