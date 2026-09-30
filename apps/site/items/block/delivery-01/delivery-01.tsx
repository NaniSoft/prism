import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Delivery01,
  type DeliveryStage,
  type DeliveryState,
} from '@nanisoft/prism-ui/blocks/delivery-01'

/** A moment in the year this run runs, as the platform will read it. */
const SIGNED_OFF = Date.parse('2026-09-24T00:00:00Z')
const SCHEMA_LIVE = Date.parse('2026-09-27T00:00:00Z')
const EXPECTED = Date.parse('2026-10-02T09:00:00Z')

/**
 * The relative reading for a moment, given the moment.
 *
 * `expectedLabel` takes `number | string` because that is what the Block hands
 * back, and a caller holding a string has to parse it once here rather than
 * arithmetic it directly. This is the shape a real product writes: one normaliser
 * at the top, then every sentence on the page is a word order rather than a date
 * calculation.
 */
function hoursFromNow(value: number | string): string {
  const at = new Date(value).getTime()
  return new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' }).format(
    Math.round((at - Date.now()) / 3600000),
    'hour',
  )
}

/**
 * The words this product uses for the five positions a delivery can be in.
 *
 * Eleven words across four products for five positions is the reason `stateLabel`
 * is a required function, and the Demo is where that is visible: the Block knows
 * the five positions and the tones they draw in, and it knows none of these.
 */
const STATE_LABEL: Record<DeliveryState, string> = {
  queued: 'Waiting for a runner',
  'in-transit': 'Rolling out to 18 of 24 nodes',
  held: 'Held on a missing credential',
  delivered: 'Live on every node',
  failed: 'Rolled back on 3 nodes',
}

/**
 * Five stages, three of which carry a moment and two of which do not, which is
 * the honest shape of a run halfway through.
 *
 * The last two are the ones worth looking at. `dual-write` is current and has no
 * date, because it started this morning and a stage that is running does not need
 * a date to say where it is. `retire` is upcoming and does carry one, and the JSDoc
 * on the Block says what that date is: an expected reading, drawn in the muted ink
 * beside a state label the caller wrote, and nothing else. A stage that has not
 * happened carries a name, a date and nothing else.
 */
const STAGES: DeliveryStage[] = [
  {
    id: 'shape',
    name: 'Shape',
    state: 'done',
    stateLabel: 'Signed off',
    at: SIGNED_OFF,
    dateLabel: () => 'Signed',
  },
  {
    id: 'schema',
    name: 'Schema',
    state: 'done',
    stateLabel: 'Live',
    at: SCHEMA_LIVE,
    dateLabel: () => 'Live since',
  },
  {
    id: 'backfill',
    name: 'Backfill',
    state: 'done',
    stateLabel: 'Finished on Tuesday',
    detail: '418,204 rows rewritten across four runs, none of which failed.',
  },
  {
    id: 'dual-write',
    name: 'Dual write',
    state: 'current',
    stateLabel: 'Running since 06:00',
    detail: '18 of 24 nodes are writing to both tables. The rest follow in batches.',
  },
  {
    id: 'retire',
    name: 'Retire the old tables',
    state: 'upcoming',
    stateLabel: 'Waiting on the backfill',
    at: EXPECTED,
    dateLabel: () => 'Expected',
  },
]

/**
 * A delivery that has stopped, and the state a reader most needs to see clearly:
 * a hold. It is the state this Block maps to `warning` rather than
 * `destructive`, because a held run is a thing to attend to rather than a
 * breakage, and a list of forty runs with four of them in red sends a reader
 * looking for four incidents.
 */
const HELD: DeliveryStage[] = [
  {
    id: 'queued',
    name: 'Queue',
    state: 'done',
    stateLabel: 'Accepted',
    at: Date.parse('2026-09-30T11:20:00Z'),
    dateLabel: () => 'Accepted',
  },
  {
    id: 'apply',
    name: 'Apply the policy',
    state: 'current',
    stateLabel: 'Held on a missing credential',
    detail: 'The estate has no read credential for the source bucket.',
  },
  {
    id: 'verify',
    name: 'Verify',
    state: 'upcoming',
    stateLabel: 'Waiting on the policy',
  },
]

/**
 * A delivery with no state at all, which is a real state rather than a gap: the
 * product has not read this one's status yet, and a Block that guessed would be
 * making the most confident claim on the page about the thing it knows least about.
 */
const UNREAD: DeliveryStage[] = [
  { id: 'queued', name: 'Queue', state: 'current', stateLabel: 'Reported a moment ago' },
  { id: 'apply', name: 'Apply the policy', state: 'upcoming', stateLabel: 'Not started' },
]

export default function Delivery01Demo() {
  return (
    <div className="flex flex-col gap-10">
      <Delivery01
        headingLevel="h3"
        eyebrow="Nexus"
        title="Warehouse migration, phase two"
        item={{
          name: 'The dual-write cutover',
          detail: 'Nexus production estate, 24 nodes, eu-west-2.',
          href: '/runs/cutover-2291',
          hrefLabel: 'Open the run record',
        }}
        state="in-transit"
        stateLabel={(state) => STATE_LABEL[state]}
        expectedAt={EXPECTED}
        expectedLabel={hoursFromNow}
        progress={72}
        progressLabel={(value) => `${value} per cent of the estate is writing to the new tables`}
        stages={STAGES}
        actions={
          <>
            <Button variant="outline">Pause the rollout</Button>
            <Button variant="ghost">View the log</Button>
          </>
        }
      />

      <Delivery01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A run that has stopped"
        description="Held, with no expected arrival: this product does not promise one, and a Block that invented a moment would be making a promise about somebody's schedule."
        item={{ name: 'The retention policy push', detail: 'Nexus staging estate, 4 nodes.' }}
        state="held"
        stateLabel={(state) => STATE_LABEL[state]}
        stages={HELD}
        actions={<Button>Add the credential</Button>}
      />

      <Delivery01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A run whose status has not been read"
        description="No state and no fill, so no mark and no bar. Both absences are decisions rather than gaps."
        item={{ name: 'The policy push from Tuesday' }}
        stages={UNREAD}
      />
    </div>
  )
}
