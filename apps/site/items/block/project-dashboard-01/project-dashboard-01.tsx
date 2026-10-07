import { Chart } from '@nanisoft/prism-ui/components/chart'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { ListPanel } from '@nanisoft/prism-ui/components/list-panel'
import { Tag } from '@nanisoft/prism-ui/components/tag-group'
import { ProjectDashboard01 } from '@nanisoft/prism-ui/blocks/project-dashboard-01'

/** The seven days the chart below is drawn for, named by the caller. */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Two runs a day, one series, which is all this fixture needs to show. */
const RUNS = [
  { name: 'Rows rewritten', tone: 'chart-1' as const, values: [18, 24, 31, 29, 44, 12, 8] },
]

/** The queue, as the caller's own rows. The Block draws a slot, not a queue. */
const QUEUE = [
  { id: 'q1', name: 'backfill-orders-2024', state: 'Running' },
  { id: 'q2', name: 'backfill-events-2024', state: 'Queued' },
  { id: 'q3', name: 'verify-then-retire', state: 'Waiting on a credential' },
]

/**
 * One project, four panels and two figures.
 *
 * The fixture is shaped to make the argument the Block exists for. The run queue
 * takes half a row and the approvals take half, which is what a pipeline wants; the
 * chart takes the whole row because it is the one a reader came for; and the
 * people panel takes a third because it is the one a reader checks last. Every one
 * of those spans is the caller's decision, and this Demo is the proof: a different
 * product would put them the other way round and nothing in the Block would care.
 * The chart is a `Chart` and the queue is a `ListPanel`, both composed by the
 * caller, which is the whole arrangement.
 */
export default function ProjectDashboard01Demo() {
  return (
    <ProjectDashboard01
      headingLevel="h3"
      eyebrow="Warehouse migration, phase two"
      name="What is left"
      summary="Everything on this page is a fact about this project, and the order of the panels is yours."
      state="blocked"
      stateLabel="Blocked on a credential"
      figures={[
        {
          key: 'tables',
          label: 'Tables moved',
          value: '31 of 48',
          delta: 12,
          deltaFormat: '12 more than last week',
          hint: 'vs last week',
        },
        {
          key: 'rows',
          label: 'Rows rewritten',
          value: '418,204',
          delta: 8,
          deltaFormat: '8 more than last week',
          series: [18, 24, 31, 29, 44, 12],
          seriesLabel: 'Rows rewritten, the last six days',
        },
        {
          key: 'blockers',
          label: 'Open blockers',
          value: '1',
          delta: -1,
          deltaFormat: '1 fewer than last week',
          href: '/projects/what-is-left/blockers',
          hrefLabel: 'Open the blockers',
        },
        { key: 'days', label: 'Days left', value: '17' },
      ]}
      panels={[
        {
          id: 'queue',
          title: 'Run queue',
          span: 'half',
          toolbar: <CtaLink href="/runs" size="sm" variant="ghost">All runs</CtaLink>,
          children: (
            <ListPanel
              scroll={false}
              label="Run queue"
              title="Three jobs"
              footer={<span className="text-muted-foreground text-xs">One is waiting on a credential</span>}
            >
              <ul className="flex flex-col">
                {QUEUE.map((job) => (
                  <li
                    key={job.id}
                    className="border-border flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                  >
                    <span className="min-w-0 truncate font-mono text-xs">{job.name}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">{job.state}</span>
                  </li>
                ))}
              </ul>
            </ListPanel>
          ),
        },
        {
          id: 'approvals',
          title: 'Approvals',
          span: 'half',
          children: (
            <ul className="flex flex-col gap-3">
              <li className="flex items-center justify-between gap-4">
                <span className="text-sm">Schema sign-off</span>
                <Tag label="Done" tone="success" />
              </li>
              <li className="flex items-center justify-between gap-4">
                <span className="text-sm">Dual write window</span>
                <Tag label="Waiting" tone="warning" />
              </li>
              <li className="flex items-center justify-between gap-4">
                <span className="text-sm">Retirement notice</span>
                <Tag label="Not started" />
              </li>
            </ul>
          ),
        },
        {
          id: 'chart',
          title: 'Rows rewritten per day',
          span: 'full',
          children: <Chart series={RUNS} variant="bar" labels={DAYS} label="Rows rewritten per day" />,
        },
        {
          id: 'people',
          title: 'On this project',
          span: 'third',
          children: (
            <ul className="flex flex-col gap-2">
              <li className="text-sm">Ravi Menon, owner</li>
              <li className="text-sm">Ada Okafor, reviewer</li>
              <li className="text-sm">Lior Benali, reporter</li>
            </ul>
          ),
        },
      ]}
    />
  )
}
