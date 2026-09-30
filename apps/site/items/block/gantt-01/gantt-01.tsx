import { Gantt01, type GanttScale } from '@nanisoft/prism-ui/blocks/gantt-01'

/**
 * A six-week plan with a task that starts before every other one, a task that
 * finishes after all of them, today marked, and a second copy with no range at
 * all so the derived range can be seen working.
 *
 * The `scaleLabel` is the interesting part of this Demo. It is handed the unit and
 * the tick's index, which means the caller formats the tick rather than the Block
 * printing a date: this package has no locale to format a date in, and the
 * Components that do format dates are the ones that were given a `locale` prop to
 * do it with.
 *
 * The two copies differ in one way each. The first passes a `range`, so the field
 * shows empty time at either end and today sits inside it. The second passes none,
 * so the field is drawn from the earliest start and the latest end of the tasks,
 * and the task that starts first is inside the field rather than hanging off the
 * left of its own chart.
 */
const FROM = '2026-09-21T00:00:00Z'
const DAY = 86_400_000

/**
 * The words for one tick of the scale, given the unit and the tick's index.
 *
 * The caller already holds the range and the scale, so it can work out which
 * instant a tick sits on without asking the Block for it. That is the arrangement
 * the prop's JSDoc argues: `unit` is a parameter rather than a closure over
 * `scale`, so a caller who changes the scale in one place and forgets the
 * formatter in the other gets caught rather than a fortnight of dates labelled as
 * weeks.
 */
function tickLabel(unit: GanttScale, index: number): string {
  const step = unit === 'day' ? DAY : unit === 'week' ? 7 * DAY : 30 * DAY
  const at = new Date(new Date(FROM).getTime() + index * step)
  if (unit === 'month') {
    return at.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }
  return at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** The plan, with a bar that starts first and a bar that finishes last. */
const TASKS = [
  {
    id: 'mapping',
    name: 'Fix the Okta group mapping',
    start: '2026-09-14T00:00:00Z',
    end: '2026-09-25T00:00:00Z',
    progress: 0.8,
    progressLabel: (value: number) => `${Math.round(value * 100)} percent done`,
    state: 'active' as const,
    stateLabel: 'Being worked',
    href: '/issues/NEX-412',
    hrefLabel: 'Open NEX-412',
  },
  {
    id: 'run',
    name: 'Tell somebody when a run rejects rows',
    start: '2026-09-21T00:00:00Z',
    end: '2026-09-28T00:00:00Z',
    progress: 0.35,
    progressLabel: (value: number) => `${Math.round(value * 100)} percent done`,
    state: 'active' as const,
    stateLabel: 'Being worked',
  },
  {
    id: 'export',
    name: 'Warehouse export with stable identifiers',
    start: '2026-09-28T00:00:00Z',
    end: '2026-10-16T00:00:00Z',
  },
  {
    id: 'access',
    name: 'Access review for the warehouse',
    start: '2026-10-05T00:00:00Z',
    end: '2026-10-09T00:00:00Z',
    state: 'blocked' as const,
    stateLabel: 'Waiting on the data owner',
  },
  {
    id: 'invoice',
    name: 'Reconcile the September invoice run',
    start: '2026-09-14T00:00:00Z',
    end: '2026-09-18T00:00:00Z',
    state: 'done' as const,
    stateLabel: 'Done last week',
  },
]

export default function Gantt01Demo() {
  return (
    <>
      <Gantt01
        headingLevel="h3"
        eyebrow="Nexus"
        title="Six weeks of work, with the empty time at either end"
        description="The field is the range you pass. The bar positions are arithmetic over that range and nothing else, and the numbers behind the picture are in the document whether or not anybody can see them."
        label="Six weeks of work from 21 September to 2 November 2026"
        tasks={TASKS}
        range={{ from: FROM, to: '2026-11-02T00:00:00Z' }}
        scale="week"
        today="2026-09-29T12:00:00Z"
        todayLabel="Today"
        scaleLabel={tickLabel}
        empty="Nothing is planned. That is a claim about your plan, so the sentence is yours."
      />

      <Gantt01
        headingLevel="h3"
        eyebrow="Nexus"
        title="And the same plan with the range derived from the tasks"
        description="No range, so the field runs from the earliest start to the latest end. The task that starts on the 14th is what sets the left edge, which is why it is inside the chart rather than clipped by it."
        label="The same plan, drawn from the earliest start to the latest end"
        tasks={TASKS}
        scale="week"
        scaleLabel={tickLabel}
        empty="Nothing is planned."
      />
    </>
  )
}
