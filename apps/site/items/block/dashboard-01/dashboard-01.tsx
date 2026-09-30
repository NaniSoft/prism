import { ListPanel } from '@nanisoft/prism-ui/components/list-panel'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Dashboard01 } from '@nanisoft/prism-ui/blocks/dashboard-01'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'

/**
 * The four figures and the three panels a pipeline overview happens to have.
 *
 * The two things worth showing are here rather than a resting state. The first
 * figure carries a sparkline and a link, so the two optional halves of a metric are
 * visible at once; the third figure carries a delta of zero, so the case where a
 * figure genuinely held and no direction mark is drawn is a case a reader can see
 * rather than something the documentation only asserts. The panels declare three
 * different widths, so the grid's own rule is visible: full above, two halves below
 * it.
 */
const METRICS = [
  {
    label: 'Runs queued',
    value: '12',
    delta: -3,
    deltaFormat: (value: number) => String(Math.abs(value)),
    hint: 'vs yesterday',
    sparkline: [4, 6, 5, 9, 8, 12, 11],
    sparklineLabel: 'Runs queued over the last week',
    href: '/overview',
    hrefLabel: 'Open the queue',
  },
  {
    label: 'Succeeded',
    value: '1,284',
    delta: 41,
    deltaFormat: (value: number) => String(Math.abs(value)),
  },
  { label: 'Held steady', value: '7', delta: 0, hint: 'vs yesterday' },
  { label: 'Median duration', value: '42s', hint: 'last hour' },
]

/** A short run queue, drawn with the panel a bounded list actually wants. */
function Queue() {
  return (
    <ListPanel
      scroll={false}
      label="Run queue"
      title="Waiting"
      actions={<span className="text-muted-foreground text-xs tabular-nums">12</span>}
      footer="Twelve runs waiting, the oldest for nine minutes."
    >
      <ul className="flex flex-col text-sm">
        {['Ingest nightly', 'Rebuild ledger', 'Nightly capture'].map((name) => (
          <li key={name} className="border-border flex justify-between border-b py-2 last:border-b-0">
            <span>{name}</span>
            <span className="text-muted-foreground font-mono text-xs">queued</span>
          </li>
        ))}
      </ul>
    </ListPanel>
  )
}

export default function Dashboard01Demo() {
  return (
    <Dashboard01
      headingLevel="h3"
      eyebrow="Preview"
      title="Section heading"
      description="A figure row, a full width panel above two halves, and a rail."
      header={
        <PageHeader01
          headingLevel="h4"
          breadcrumbs={[{ label: 'Nexus', href: '/overview' }, { label: 'Overview' }]}
          title="Overview"
          description="Two words, and a rule."
        />
      }
      metrics={METRICS}
      panels={[
        { id: 'queue', span: 'full', title: 'Run queue', children: <Queue /> },
        {
          id: 'activity',
          span: 'half',
          title: 'Recent activity',
          toolbar: <Button size="sm" variant="ghost">All activity</Button>,
          children: (
            <ul className="text-muted-foreground flex flex-col text-sm">
              <li>One line about what happened.</li>
              <li>Another line, shorter.</li>
            </ul>
          ),
        },
        {
          id: 'errors',
          span: 'half',
          title: 'Errors',
          children: (
            <p className="text-muted-foreground text-sm">
              Nothing in the last hour.
            </p>
          ),
        },
      ]}
      rail={
        <div className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
          <span className="text-sm font-medium">Watchlist</span>
          <span className="text-muted-foreground text-sm">The rail is a slot, so this is whatever the product keeps within reach.</span>
        </div>
      }
    />
  )
}
