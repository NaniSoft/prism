import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { ChangelogPage } from '@nanisoft/prism-ui/pages/changelog-page'

/**
 * The record screen, with a filter legend, a live filter row and an older slot.
 *
 * Two releases rather than one so the per-release band and the anchor each release
 * carries can be judged, and a security record in the second so the five kinds are
 * not all on screen at once. It renders at `h3` because the documentation page
 * already owns an `h1`.
 */
export default function ChangelogPageDemo() {
  return (
    <ChangelogPage
      headingLevel="h3"
      eyebrow="Changelog"
      title="Everything that has changed"
      description="Every release of the collector daemon and the ledger specification, newest first."
      kinds={[
        { id: 'added', label: 'Added', state: 'on' },
        { id: 'changed', label: 'Changed', state: 'on' },
        { id: 'fixed', label: 'Fixed', state: 'on' },
        { id: 'removed', label: 'Removed', state: 'off' },
        { id: 'security', label: 'Security', state: 'on' },
      ]}
      filters={
        <p className="text-muted-foreground text-sm">
          Showing 4 of 5 change categories. Removed records are hidden in this view.
        </p>
      }
      releases={[
        {
          id: '2-4-0',
          version: '2.4.0',
          at: '28 September 2026',
          summary: 'Split the connection pool between live capture and batch inference, and retired the legacy v1 socket.',
          entries: [
            {
              id: 'e1',
              kind: 'added',
              title: 'Per-workload connection pools on the collector daemon',
              body: 'Live capture and historical replay now draw from isolated pools so a long replay never starves an incoming tick.',
            },
            {
              id: 'e2',
              kind: 'changed',
              title: 'Windowed collectors now flush on the exchange minute boundary',
              href: '/changelog/2-4-0/changed',
              hrefLabel: 'Read the migration note',
            },
            { id: 'e3', kind: 'removed', title: 'Dropped the unauthenticated local status socket' },
          ],
        },
        {
          id: '2-3-1',
          version: '2.3.1',
          at: '4 September 2026',
          entries: [
            {
              id: 'e1',
              kind: 'security',
              title: 'Rotated collector signing keys now reject pre-rotation replay tokens immediately',
              body: 'Previously a token signed within the five-minute clock-skew window remained valid until the window expired.',
            },
            { id: 'e2', kind: 'fixed', title: 'Additive quote-schema fields no longer stall an in-flight batch write' },
          ],
        },
      ]}
      older={
        <div className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">
            Showing releases from September 2026. Older releases from 2.0.0 onward are archived by quarter.
          </p>
        </div>
      }
      subscribe={{
        title: 'Get told when this changes',
        description: 'Receive one plain-text release note whenever a new collector version is tagged.',
        cta: (
          <div data-slot="demo-subscribe-control">
            <CtaLink href="#release-feed" variant="outline" size="sm">
              Subscribe to the release feed
            </CtaLink>
          </div>
        ),
      }}
      empty="Nothing has been published on this page yet."
    />
  )
}
