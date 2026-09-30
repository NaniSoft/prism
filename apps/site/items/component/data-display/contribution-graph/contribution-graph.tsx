import { ContributionGraph, type ContributionLevel } from '@nanisoft/prism-ui/components/contribution-graph'

/** One reading for the whole demo, so the window does not move under the reader. */
const TODAY = Date.UTC(2026, 2, 22)

/** Days in a week, the unit the window is counted in. */
const DAY = 86_400_000

/**
 * A plausible half year of activity, generated rather than hand written.
 *
 * A weekday pattern is the whole point of the demo. Commits land on weekdays and
 * thin out at the weekend, so the grid has a texture a reader can see at a glance
 * and the empty cells mean something. It is also reproducible, which matters for
 * a figure whose whole claim is its shape: a demo that changed on every render
 * would be a hydration mismatch dressed as variety.
 */
const ALL_DAYS = Array.from({ length: 26 * 7 }, (_, index) => {
  const at = TODAY - (26 * 7 - 1 - index) * DAY
  const weekday = new Date(at).getUTCDay()
  const weekend = weekday === 0 || weekday === 6
  const seed = (index * 37 + 11) % 23
  const count = weekend ? (seed % 9 === 0 ? seed % 3 : 0) : ((seed * 3) % 17) + (seed % 4 === 0 ? 14 : 0)
  return {
    date: new Date(at).toISOString().slice(0, 10),
    count,
  }
})

/**
 * A fortnight nobody reported, dropped from the middle of the series.
 *
 * This is the state the documentation is about. Those days are drawn exactly like
 * a day with a count of zero, because there is no third drawing available, and the
 * difference survives in the table: a reported zero has a row reading zero and an
 * unreported day has no row at all. A grid that drew a gap there would be claiming
 * something happened, and a grid that filled it would be claiming a measurement
 * nobody made.
 */
const DAYS = ALL_DAYS.filter((day) => {
  const daysOut = Math.round((TODAY - Date.parse(`${day.date}T00:00:00Z`)) / DAY)
  return daysOut > 60 || daysOut < 46
})

/** The caller's own sentence for one square, which Prism will not compose. */
const dayLabel = (day: { date: string; count: number }) =>
  `${day.count} ${day.count === 1 ? 'commit' : 'commits'} on ${day.date}`

/**
 * A second bucketing, passed to show what `levelFor` is for.
 *
 * Quartiles put most squares at level one or two once there is an outlier day,
 * which is a real cost of the default and this is the way out of it. A scale built
 * on the square root of the share spreads the quiet days out, so a reader can see
 * the difference between one commit and four.
 */
const byRoot: (count: number, max: number) => ContributionLevel = (count, max) => {
  if (count <= 0) return 0
  if (max <= 0) return 4
  const share = Math.sqrt(count / max)
  if (share <= 0.5) return 1
  if (share <= 0.7) return 2
  if (share <= 0.85) return 3
  return 4
}

export default function ContributionGraphDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Commits per day, last 26 weeks</span>
        <ContributionGraph
          label="Commits per day, last 26 weeks"
          dayLabel={dayLabel}
          days={DAYS}
        />
        <span className="text-muted-foreground text-xs">
          Quartiles of the largest count in the window, which is the default. The
          fortnight in the middle is a gap nobody reported: drawn like a zero,
          with no row in the table.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">The same data, weeks starting on Sunday</span>
        <ContributionGraph
          label="Commits per day, last 26 weeks, weeks starting on Sunday"
          dayLabel={dayLabel}
          days={DAYS}
          weekStartsOn={0}
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">The same data, with the caller&apos;s own bucketing</span>
        <ContributionGraph
          label="Commits per day, last 26 weeks, on a square root scale"
          dayLabel={dayLabel}
          days={DAYS}
          levelFor={byRoot}
        />
        <span className="text-muted-foreground text-xs">
          A square root scale spreads the quiet days out, which is what a
          distribution with one outlier day needs and what quartiles cannot give.
        </span>
      </div>
    </div>
  )
}
