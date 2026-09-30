import {
  Capacity01,
  type CapacityRow,
  type CapacityState,
} from '@nanisoft/prism-ui/blocks/capacity-01'

/**
 * The words this product uses for the four positions a resource can be in.
 *
 * Four positions and eight words across four products, which is the argument for
 * `stateLabel` in one line: the tones are the semantic contract's and Prism maps
 * them, and not one of these sentences is Prism's.
 */
const STATE_LABEL: Record<CapacityState, string> = {
  healthy: 'Room to grow',
  tight: 'Nearly at the limit',
  exhausted: 'At the limit',
  unknown: 'The collector has not reported',
}

const number = (value: number) => new Intl.NumberFormat('en-GB').format(value)

/**
 * Seven rows, and between them they carry every case the Block has to hold: a
 * row with all three figures, a row with a state and no figures, a row whose
 * collector never reported, and a row with only a committed figure and no stated
 * ceiling. A fixture of four healthy rows would show none of it.
 */
const ROWS: CapacityRow[] = [
  {
    id: 'collectors',
    resource: 'Market collector nodes',
    kind: 'Node pool',
    committed: 18,
    limit: 24,
    remaining: 6,
    unit: 'nodes',
    unitLabel: (unit, value) => `${value} ${unit}`,
    state: 'tight',
    stateLabel: STATE_LABEL.tight,
    href: '/estate/nodes',
    hrefLabel: 'Open the node pool',
  },
  {
    id: 'storage',
    resource: 'Lakehouse storage',
    kind: 'Bucket',
    committed: 41_200,
    limit: 60_000,
    remaining: 18_800,
    unit: 'GB',
    unitLabel: (unit, value) => `${number(value)} ${unit}`,
    state: 'healthy',
    stateLabel: STATE_LABEL.healthy,
  },
  {
    id: 'runners',
    resource: 'Agent runner concurrency',
    kind: 'Quota',
    committed: 8,
    limit: 8,
    remaining: 0,
    unit: 'runners',
    unitLabel: (unit, value) => `${value} ${unit}`,
    state: 'exhausted',
    stateLabel: STATE_LABEL.exhausted,
  },
  {
    id: 'connectors',
    resource: 'Exchange connectors',
    kind: 'Per-seat quota',
    committed: 11,
    unit: 'connectors',
    unitLabel: (unit, value) => `${value} ${unit}`,
    // No limit and no remaining figure. That is a real state: nobody has bounded
    // this one, and an empty cell beside "Limit" says so where a zero would claim
    // the estate is out of them.
  },
  {
    id: 'events',
    resource: 'Event ingest',
    kind: 'Metered quota',
    unit: 'events per second',
    state: 'unknown',
    stateLabel: STATE_LABEL.unknown,
    // No figures at all, which is what `unknown` is for. A Block that drew a zero
    // here would be claiming the estate cannot ingest anything. The `unitLabel`
    // is still there because the Block requires it alongside any unit, and the
    // honest reading for a row with no figure is a label nothing will ever use.
    unitLabel: (unit, value) => `${value} ${unit}`,
  },
  {
    id: 'webhooks',
    resource: 'Outbound webhooks',
    kind: 'Queue',
    committed: 4,
    limit: 4,
    remaining: 0,
    unit: 'endpoints',
    unitLabel: (unit, value) => `${value} ${unit}`,
    state: 'exhausted',
    stateLabel: STATE_LABEL.exhausted,
  },
  {
    id: 'seats',
    resource: 'Editorial seats',
    kind: 'Per-seat quota',
    committed: 27,
    limit: 40,
    remaining: 13,
    unit: 'seats',
    unitLabel: (unit, value) => `${value} ${unit}`,
    state: 'healthy',
    stateLabel: STATE_LABEL.healthy,
  },
]

/**
 * An estate with nothing on it, which is a real state rather than a gap: nothing
 * is provisioned, and only the product knows whether that is a new estate or a
 * collector that has not reported.
 */
const EMPTY: CapacityRow[] = []

export default function Capacity01Demo() {
  return (
    <div className="flex flex-col gap-10">
      <Capacity01
        headingLevel="h3"
        eyebrow="Nexus"
        title="What this estate has left"
        description="Three figures a row, and the relationship between them is this product's. Nothing on this table was subtracted by the Block."
        columns={[
          { id: 'resource', header: 'Resource' },
          { id: 'kind', header: 'Kind' },
          { id: 'committed', header: 'Committed' },
          { id: 'limit', header: 'Limit' },
          { id: 'remaining', header: 'Remaining' },
          { id: 'state', header: 'Standing' },
          { id: 'href', header: 'More' },
        ]}
        rows={ROWS}
        summary={[
          { label: 'Resources at their limit', value: '2', delta: 1 },
          { label: 'Nodes committed', value: '18', delta: -2 },
          {
            label: 'Storage committed',
            value: '41.2 TB',
            delta: 18_800,
            deltaFormat: (value) => `${number(value)} TB of headroom since last week`,
          },
          { label: 'Resources with no reading', value: '1' },
        ]}
        empty="Nothing is on this estate yet."
      />

      <Capacity01
        headingLevel="h3"
        eyebrow="Nexus"
        title="An estate with nothing on it"
        columns={[
          { id: 'resource', header: 'Resource' },
          { id: 'committed', header: 'Committed' },
          { id: 'limit', header: 'Limit' },
          { id: 'remaining', header: 'Remaining' },
        ]}
        rows={EMPTY}
        empty="Nothing is provisioned here yet. Provision a node and it will appear on this table."
      />
    </div>
  )
}
