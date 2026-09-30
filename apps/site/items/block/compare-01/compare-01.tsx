import { Badge } from '@nanisoft/prism-ui'
import { Compare01 } from '@nanisoft/prism-ui/blocks/compare-01'

/** The rows, named once for both arms because the two have the same shape. */
const LABELS = [
  'Time to first capture',
  'Sources per workspace',
  'Retries on a failed capture',
  'Audit ledger',
  'Concurrent agent runs',
]

/** The two arms. Neither is marked, because the Block has no verdict to apply. */
const LEFT = {
  name: 'Polling',
  summary: 'A scheduled sweep, and a row for every minute it covered.',
  points: [
    { value: 'Within one capture cycle' },
    { value: 'Two' },
    { value: 'Three, then a held item' },
    { value: <Badge variant="outline">Ninety days</Badge> },
    { value: 'One' },
  ],
}

const RIGHT = {
  name: 'Streaming',
  summary: 'A standing connection, and a row the moment the tick lands.',
  points: [
    { value: 'As the tick lands' },
    { value: 'One' },
    { value: 'One, and the tick is retried' },
    { value: <Badge variant="outline">Two years</Badge> },
    { value: 'Eight' },
  ],
}

/** The table form, which is the default and which scrolls sideways when narrow. */
export default function Compare01Demo() {
  return (
    <Compare01
      headingLevel="h3"
      eyebrow="Capture"
      title="How the two capture modes differ"
      description="Five rows a reader actually decides on. Neither column is marked, because Prism has no opinion about which one a reader should pick."
      labels={LABELS}
      left={LEFT}
      right={RIGHT}
    />
  )
}
