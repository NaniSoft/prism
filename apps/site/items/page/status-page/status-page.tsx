import { StatusPage } from '@nanisoft/prism-ui/pages/status-page'

/** How long ago each incident opened, in the caller's own words. */
const since = (minutes: number): string => {
  const at = new Date(Date.UTC(2026, 8, 30, 9, 0, 0) + minutes * 60_000)
  return at.toISOString()
}

/**
 * The status screen twice: once for an estate that is degrading, and once for an
 * estate with nothing to report.
 *
 * Both renders are the same Page with different props, which is the point worth
 * seeing: the overall state, every state word and the all-clear line are the
 * caller's, and the two screens below differ in nothing but their data.
 */
export default function StatusPageDemo() {
  return (
    <div className="flex flex-col gap-16">
      <StatusPage
        headingLevel="h3"
        eyebrow="Nexus"
        title="Nexus Estate"
        description="Capture, inference and the ledger that records both."
        overall={{
          state: 'degraded',
          label: 'Degraded performance',
          note: 'Live capture is still running. Inference requests are queued and the queue is about eleven minutes deep.',
        }}
        services={[
          {
            id: 'capture',
            name: 'Live capture',
            state: 'running',
            stateLabel: 'Running, behind',
            detail: 'Sampling at the configured rate, eleven minutes behind the market.',
            href: '#capture',
            hrefLabel: 'Open its dashboard',
          },
          {
            id: 'inference',
            name: 'Inference',
            state: 'degraded',
            stateLabel: 'Degraded',
            detail: 'Queuing, and refusing new batch submissions until the queue drains.',
          },
          {
            id: 'ledger',
            name: 'The ledger',
            state: 'ok',
            stateLabel: 'Writing normally',
          },
        ]}
        incidentsLabel="Recent incidents"
        incidents={[
          {
            id: 'nx-418',
            title: 'Inference requests queueing behind the capture job',
            state: 'monitoring',
            stateLabel: 'Monitoring',
            at: since(96),
            dateLabel: (value) => new Date(value).toUTCString(),
            body: 'The capture job was holding the connection pool that inference draws from. The pool is now sized for both, and the queue is draining.',
            updates: [
              {
                id: 'nx-418-1',
                at: since(96),
                body: 'Raised by the queue depth alarm on the inference estate.',
              },
              {
                id: 'nx-418-2',
                at: since(74),
                body: 'Cause identified: one pool serving two workloads. The pool is being split.',
              },
              {
                id: 'nx-418-3',
                at: since(38),
                body: 'The split is in place and the queue is down to eleven minutes. Watching it before we call it.',
              },
            ],
            href: '#nx-418',
            hrefLabel: 'Read the full report',
          },
          {
            id: 'nx-409',
            title: 'A schema change rejected a batch of quotes',
            state: 'resolved',
            stateLabel: 'Resolved',
            at: since(2_880),
            dateLabel: (value) => new Date(value).toUTCString(),
            body: 'A field was added to the quote schema while a batch was in flight. The batch was replayed and every quote is in the ledger.',
            updates: [
              {
                id: 'nx-409-1',
                at: since(2_880),
                body: 'The batch failed on write. No quote was lost.',
              },
              {
                id: 'nx-409-2',
                at: since(2_760),
                body: 'The schema change is now additive, and the replay finished.',
              },
            ],
          },
        ]}
        updates={
          <p className="text-muted-foreground text-sm">
            Every incident is kept for ninety days, and the full archive is in the estate handbook.
          </p>
        }
        subscribe={
          <div className="border-border flex flex-wrap items-center gap-3 rounded-lg border p-4">
            <p className="text-sm">Get a message when an incident opens or resolves.</p>
            <a
              href="#subscribe"
              className="text-foreground rounded-sm text-sm underline underline-offset-4"
            >
              Subscribe by email
            </a>
          </div>
        }
        empty="No incident has been opened on this estate in the last ninety days."
      />

      <StatusPage
        headingLevel="h3"
        eyebrow="Nexus"
        title="Nexus Estate"
        description="The same screen with nothing to report, which is the state a reader visits most often."
        overall={{
          state: 'maintenance',
          label: 'Planned maintenance',
          note: 'The ledger is read only until 06:00 on Sunday. Capture and inference are unaffected.',
        }}
        services={[
          {
            id: 'capture',
            name: 'Live capture',
            state: 'ok',
            stateLabel: 'Running normally',
          },
          {
            id: 'inference',
            name: 'Inference',
            state: 'ok',
            stateLabel: 'Running normally',
          },
          {
            id: 'ledger',
            name: 'The ledger',
            state: 'maintenance',
            stateLabel: 'Read only until Sunday',
          },
        ]}
        incidentsLabel="Recent incidents"
        empty="Nothing has happened on this estate since the last maintenance window."
      />
    </div>
  )
}
