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
      description="One or two sentences under the heading, saying how this record is grouped and what the kinds mean."
      kinds={[
        { id: 'added', label: 'Added', state: 'on' },
        { id: 'changed', label: 'Changed', state: 'on' },
        { id: 'fixed', label: 'Fixed', state: 'on' },
        { id: 'removed', label: 'Removed', state: 'off' },
        { id: 'security', label: 'Security', state: 'on' },
      ]}
      filters={
        <p className="text-muted-foreground text-sm">The caller&apos;s own filter control goes here.</p>
      }
      releases={[
        {
          id: '2-4-0',
          version: '2.4.0',
          at: '2026-09-28',
          summary: 'One line about the release as a whole, for a reader deciding whether to read on.',
          entries: [
            {
              id: 'e1',
              kind: 'added',
              title: 'First record',
              body: 'The sentence under the line: why it changed, what it affects, what to do about it.',
            },
            {
              id: 'e2',
              kind: 'changed',
              title: 'Second record',
              href: '/changelog/2-4-0/changed',
              hrefLabel: 'Read the migration note',
            },
            { id: 'e3', kind: 'removed', title: 'Third record, complete on its own line' },
          ],
        },
        {
          id: '2-3-1',
          version: '2.3.1',
          at: '2026-09-04',
          entries: [
            {
              id: 'e1',
              kind: 'security',
              title: 'A record that is a security fix',
              body: 'The sentence under the line, so the kind mark and the record are both on screen.',
            },
            { id: 'e2', kind: 'fixed', title: 'A record that is a fix' },
          ],
        },
      ]}
      older={
        <div className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">
            The caller&apos;s own way of reaching the releases that are not on this page.
          </p>
        </div>
      }
      subscribe={{
        title: 'Get told when this changes',
        description: 'One or two sentences, then the control the caller composes.',
        cta: <div data-slot="demo-subscribe-control" />,
      }}
      empty="Nothing has been published on this page yet."
    />
  )
}
