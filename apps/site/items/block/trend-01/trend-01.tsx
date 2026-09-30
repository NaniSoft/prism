import { Trend01, type Trend01Item } from '@nanisoft/prism-ui/blocks/trend-01'

/**
 * Five rows, and the shapes of row rather than five ideal rows.
 *
 * The first carries everything: a reading, a change, a series and a link. The
 * second carries a reading and a change with no series, which is a real row and
 * not a thinner one. The third carries a series with no change, because a thing
 * that has not moved is exactly the thing a reader wants to see held still. The
 * fourth is a row with nothing but a reading, which is the shape most of a real
 * list is. The fifth is a falling reading, so the direction mark is the other
 * one.
 */
const ITEMS: Trend01Item[] = [
  {
    id: 'throughput',
    label: 'Rows loaded per hour',
    value: '18.4k',
    delta: 12.4,
    deltaLabel: (change) => `up ${change.toFixed(1)} percent on last week`,
    series: [14.1, 15.2, 15.0, 16.8, 17.4, 18.4],
    seriesLabel: 'Rows loaded per hour, the last six readings',
    href: '/estate/throughput',
    hrefLabel: 'Read the series',
  },
  {
    id: 'coverage',
    label: 'Sites under observation',
    value: '11',
    delta: 3,
    deltaLabel: (change) => `${change} more than last week`,
    series: [6, 6, 8, 8, 9, 11],
    seriesLabel: 'Sites under observation, by month',
  },
  {
    id: 'backlog',
    label: 'Findings closed by an agent',
    value: '412',
    series: [180, 240, 260, 320, 380, 412],
    seriesLabel: 'Findings closed by an agent, by month',
  },
  {
    id: 'coverage-target',
    label: 'Estate coverage against the floor',
    value: '1.08x',
  },
  {
    id: 'rebuild-time',
    label: 'Median estate rebuild',
    value: '26m',
    delta: -4.5,
    deltaLabel: (change) => `${Math.abs(change)} minutes faster than last week`,
    series: [34, 32, 33, 29, 28, 26],
    seriesLabel: 'Median estate rebuild in minutes, the last six readings',
  },
]

/** The full list, then the same list capped at three, so the cap is visible. */
export default function Trend01Demo() {
  return (
    <>
      <Trend01
        headingLevel="h3"
        eyebrow="Preview"
        title="What is moving this week"
        description="Ranked by the change against last week. The order, the readings and the words beside them are all the caller’s."
        items={ITEMS}
      />
      <Trend01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same list, capped at three"
        description="A cap shortens the list rather than dividing it, so it is still one ordered list."
        limit={3}
        items={ITEMS}
      />
      <Trend01
        headingLevel="h3"
        eyebrow="Preview"
        title="A list with nothing in it"
        description="The empty state is the caller’s sentence, because nothing is rising is a claim."
        items={[]}
        empty="No series moved in the last seven days. The collection line is still running."
      />
    </>
  )
}
