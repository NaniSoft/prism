import {
  Leaderboard01,
  type Leaderboard01Entry,
} from '@nanisoft/prism-ui/blocks/leaderboard-01'

/** The initials a monogram is drawn from, so a Demo does not need image assets. */
function monogram(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Six entries, ranked by the caller's own query, with a series on three of them.
 *
 * The fixture is shaped to show the three things a leaderboard has to get right.
 * The figures are in the hundreds so the visible column is not a run of bare
 * five-figure numerals, and the `valueLabel` on each one is the figure at a period
 * rather than the figure and the noun again. The series is on three entries and not
 * on the other three, which is the honest shape of a set where some people run
 * every day and some ran once. And the reader is on the list, which is what
 * `emphasis` is for.
 */
const ENTRIES: Leaderboard01Entry[] = [
  {
    id: 'ada',
    name: 'Ada Okafor',
    value: 986,
    valueLabel: ({ value }) => `${value} this week`,
    mark: (
      <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-xs font-medium">
        {monogram('Ada Okafor')}
      </span>
    ),
    series: [12, 18, 22, 31, 28, 40, 46, 52, 61, 58, 72, 80],
    seriesLabel: 'runs per day over the last twelve days',
    href: '/people/ada',
    hrefLabel: 'Open Ada',
  },
  {
    id: 'ravi',
    name: 'Ravi Menon',
    value: 742,
    valueLabel: ({ value }) => `${value} this week`,
    series: [30, 28, 26, 24, 22, 20, 18, 16, 14, 13, 12, 11],
    seriesLabel: 'runs per day over the last twelve days',
    href: '/people/ravi',
    hrefLabel: 'Open Ravi',
  },
  {
    id: 'lior',
    name: 'Lior Benali',
    value: 611,
    valueLabel: ({ value }) => `${value} this week`,
    mark: (
      <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-xs font-medium">
        {monogram('Lior Benali')}
      </span>
    ),
    series: [4, 9, 6, 12, 15, 11, 19, 24, 21, 28, 30, 34],
    seriesLabel: 'runs per day over the last twelve days',
  },
  {
    id: 'sana',
    name: 'Sana Qureshi',
    value: 508,
    valueLabel: ({ value }) => `${value} this week`,
    href: '/people/sana',
    hrefLabel: 'Open Sana',
  },
  {
    id: 'tom',
    name: 'Tom Baxter',
    value: 447,
    valueLabel: ({ value }) => `${value} this week`,
  },
  {
    id: 'ines',
    name: 'Ines Duarte',
    value: 311,
    valueLabel: ({ value }) => `${value} this week`,
  },
]

/**
 * The same Block with the positions off, and the same set of entries.
 *
 * The second fixture is the peers arrangement, and it exists because the decision
 * about the positions is a real one rather than a default: six peers with the first
 * three positions marked is a page that says something about the product rather
 * than about the entries, and a reader who is last would be told about it four
 * times. The empty state is shown by a third list of nothing, which is the only
 * honest way to preview one.
 */
export default function Leaderboard01Demo() {
  return (
    <>
      <Leaderboard01
        headingLevel="h3"
        eyebrow="Last 30 days"
        title="Who ran the most"
        description="Ranked by your own query. This Block does not sort, and it has no sort prop, because a leaderboard ranked by a metric it cannot see is a list whose order you have to fix."
        unit="runs"
        entries={ENTRIES}
        emphasis={['ada']}
        empty="No runs in the last thirty days. The first one usually takes an afternoon."
      />

      <Leaderboard01
        headingLevel="h3"
        eyebrow="Last 30 days"
        title="The same six, read as peers"
        description="With the positions off. The figure is drawn as it arrives, so it carries no grouping, and the reading beside it is the sentence you wrote."
        unit="runs"
        entries={ENTRIES}
        rank={false}
        empty="No runs in the last thirty days."
      />
    </>
  )
}
