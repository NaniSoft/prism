import { Status, type StatusTone } from '@nanisoft/prism-ui/components/status'

/**
 * All five tones at both sizes, in a row of the kind they are for.
 *
 * Every word here is a different product's word for the same tone, which is the
 * point: the tone is a colour a reader learns once and the label is the sentence
 * they actually read. Two of these are states you will not have, and one of them
 * is a state you will reach for far more often than the colour suggests.
 */
const STATES: { tone: StatusTone; word: string; note: string }[] = [
  { tone: 'neutral', word: 'Archived', note: 'No alarm, and drawn quiet on purpose' },
  { tone: 'info', word: 'Migrating', note: 'In flight, and nobody is waiting on it' },
  { tone: 'success', word: 'Healthy', note: 'The state most rows are in' },
  { tone: 'warning', word: 'Degraded', note: 'One of two products says "partially unavailable"' },
  { tone: 'destructive', word: 'Unreachable', note: 'The only tone that is never routine' },
]

/** The same five at the small step, which is what a dense table row wants. */
export default function StatusDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-8">
      <ul className="flex flex-col divide-y">
        {STATES.map((state) => (
          <li
            key={state.tone}
            className="flex items-center justify-between gap-4 py-2 text-sm"
          >
            <Status tone={state.tone} label={state.word} />
            <span className="text-muted-foreground text-xs">{state.note}</span>
          </li>
        ))}
      </ul>

      <div className="border-border flex flex-wrap items-center gap-4 border-t pt-4">
        <Status tone="success" size="sm" label="3 of 3 healthy" />
        <Status tone="warning" size="sm" label="2 of 3 lagging" />
        <Status tone="destructive" size="sm" label="1 of 3 down" />
        <Status tone="info" size="sm" label="Rolling restart" />
      </div>
    </div>
  )
}
