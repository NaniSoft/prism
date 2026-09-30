import { Metric } from '@nanisoft/prism-ui/components/metric'

/**
 * Five readings and the three states a delta is in, which is the whole of what
 * this Item decides for you.
 *
 * The flat one is the interesting row. It shows a number and no mark, because a
 * direction mark on a figure that did not move is a claim the data does not make,
 * and a reader who believes the mark is looking at movement that is not there.
 *
 * The churn row is the second one worth reading twice. Its number fell and that
 * is good news, and the mark beside it is a fall in the same muted ink as every
 * other delta here, because a sign is a direction and whether a direction is good
 * is a judgement about the caller's domain that this Component does not get to
 * make.
 *
 * The last row passes a value Prism did not format, because a Metric takes a node
 * rather than a number. That is the cost of the prop and it is the point of it: a
 * consumer's own figure reads the way their product reads it.
 */
export default function MetricDemo() {
  return (
    <div className="grid max-w-measure gap-8 sm:grid-cols-2">
      <Metric value="1,284" label="Active workspaces" hint="Across every pack" />

      <Metric
        value="184"
        unit="ms"
        label="p95 latency"
        delta={12.4}
        deltaFormat={(change) => `${change.toFixed(1)}%`}
        hint="Against the same hour yesterday"
      />

      <Metric
        value="2.1"
        unit="%"
        label="Weekly churn"
        delta={-0.4}
        deltaFormat={(change) => `${Math.abs(change).toFixed(1)}%`}
        hint="Fewer accounts closed than last week"
      />

      <Metric
        value="3.9"
        unit="GB"
        label="Median bundle size"
        delta={0}
        deltaFormat={(change) => `${change}`}
        hint="Unchanged since the last release, so no mark is drawn"
      />

      <Metric
        value={
          <>
            12<span className="text-base text-muted-foreground"> / 16</span>
          </>
        }
        label="Seats in use"
        hint="A composed figure, set in the interface face"
      />
    </div>
  )
}
