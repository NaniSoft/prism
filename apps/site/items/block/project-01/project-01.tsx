import { Project01, type Project01Stage, type ProjectState } from '@nanisoft/prism-ui/blocks/project-01'

/** A moment in the year this project runs, as the platform will read it. */
const STARTED = Date.parse('2026-01-12T00:00:00Z')
const DUE = Date.parse('2026-04-30T00:00:00Z')

/** The words this product uses for the five positions a project can be in. */
const STATE_LABEL: Record<ProjectState, string> = {
  planning: 'Planned',
  active: 'Running',
  blocked: 'Blocked on a credential',
  complete: 'Shipped',
  archived: 'Archived',
}

/**
 * The stages, in the order the project runs them.
 *
 * Three of the five carry a moment and two do not, which is the honest shape of a
 * project halfway through: the stages behind it happened on a day and the two
 * ahead do not have one yet. The Demo shows that mixture on purpose, because a
 * fixture where every stage has a date says nothing about what the rail does with
 * the two that have none.
 */
const STAGES: Project01Stage[] = [
  { id: 'shape', name: 'Shape', state: 'done', stateLabel: 'Signed off', at: Date.parse('2026-01-09T00:00:00Z') },
  { id: 'schema', name: 'Schema', state: 'done', stateLabel: 'Live', at: Date.parse('2026-02-02T00:00:00Z') },
  { id: 'backfill', name: 'Backfill', state: 'current', stateLabel: 'Running since Tuesday' },
  { id: 'dual-write', name: 'Dual write', state: 'upcoming', stateLabel: 'Waiting on the backfill' },
  { id: 'retire', name: 'Retire the old tables', state: 'upcoming', stateLabel: 'Not started' },
]

/**
 * One project in full, and the blocked state rather than the healthy one, then the
 * same Block with almost nothing on it.
 *
 * A Demo that showed only a running project would show the arrangement without the
 * case that makes it worth a Block: a project that is genuinely stuck, where the
 * words beside the dot are the whole of what the reader is there for. The second
 * fixture is the shape a project has before it has any measurement on it, which is
 * the shape most projects start in, and the arrangement with the fill and the rail
 * absent is the one that has to hold up.
 */
export default function Project01Demo() {
  return (
    <>
      <Project01
        headingLevel="h3"
        name="Warehouse migration, phase two"
        summary="The second half of the move. The public schema is already live, so everything here is about the tables nothing reads from yet."
        state="blocked"
        stateLabel={(state) => STATE_LABEL[state]}
        owner={{ name: 'Ravi Menon', avatar: { name: 'Ravi Menon' } }}
        startsAt={STARTED}
        endsAt={DUE}
        dateLabel={(value) => (value === STARTED ? 'Opened' : 'Due')}
        progress={62}
        progressLabel={(value, project) => `${value} per cent of ${project}`}
        figures={[
          { label: 'Tables moved', value: '31 of 48', delta: 12 },
          { label: 'Rows rewritten', value: '418,204' },
          { label: 'Open blockers', value: '1', delta: -1 },
          { label: 'Budget used', value: 'GBP 24,100', delta: 0.08 },
        ]}
        stages={STAGES}
      />

      <Project01
        headingLevel="h3"
        name="Pricing review, Q3"
        summary="Not started, and not measured yet, which is the shape most projects begin in."
        state="planning"
        stateLabel={(state) => STATE_LABEL[state]}
        owner={{ name: 'Ada Okafor', avatar: { name: 'Ada Okafor' } }}
        startsAt={Date.parse('2026-07-01T00:00:00Z')}
        dateLabel={() => 'Opens'}
        figures={[{ label: 'Plans affected', value: '3' }]}
        layout="split"
      />
    </>
  )
}
