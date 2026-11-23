import { LegalPage } from '@nanisoft/prism-ui/pages/legal-page'

/**
 * The legal screen, with the selected document marked three ways.
 *
 * The body is plain authored elements rather than a string, because that is the
 * point of the page: the caller owns the document and Prism owns the measure. The
 * second document in the list carries a summary so the two treatments can be
 * compared, and the first is selected so the current mark can be judged against an
 * unselected row. It renders at `h3` because the documentation page already owns
 * an `h1`.
 *
 * No row carries an `href`, and that is deliberate. The document table is a
 * `<nav>`, and the published-navigation join requires every link inside one to
 * resolve against the routing tree, which is a law about this site and not about
 * the caller's product. Inventing `/legal/privacy` to satisfy it would put a
 * route Prism does not publish in a documentation sample, and pointing the row
 * at a real route here would make a privacy notice point at a changelog. A legal
 * screen is the one screen whose destinations belong wholly to whoever ships it,
 * so the demo shows the table as the selected-and-summary case and leaves the
 * `href` to the corpus sample, where it is code a reader copies rather than a
 * link they follow.
 */
export default function LegalPageDemo() {
  return (
    <LegalPage
      headingLevel="h3"
      title="Legal"
      updatedLabel="Last changed"
      updatedAt="12 August 2026"
      documentsLabel="Legal documents"
      documents={[
        {
          id: 'terms',
          title: 'Terms of service',
          summary: 'What the service is and what you agree to.',
          selected: true,
        },
        { id: 'privacy', title: 'Privacy notice', summary: 'What is collected and how long it is kept.' },
        { id: 'cookies', title: 'Cookie notice' },
      ]}
      bodyLabel="Terms of service"
      body={
        <>
          <h2>1. The agreement</h2>
          <p>
            These terms govern your access to the Nexus collector service and its associated ledger
            endpoints. By provisioning a workspace or running a collector key against an estate, you
            agree to be bound by this agreement on behalf of your organisation.
          </p>
          <h2>2. What the service does</h2>
          <p>
            Nexus ingests read-only operational telemetry from the targets you configure, writes it to
            partitioned columnar storage, and exposes it to authorised operators and read-only tools.
          </p>
          <ul>
            <li>You retain all right, title and interest in the telemetry your estate emits.</li>
            <li>We process and store that telemetry solely to provide, secure and replay your workspace.</li>
          </ul>
          <h2>3. Changes</h2>
          <p>
            We may revise these terms when we ship a new storage region or collector capability. Material
            updates are announced thirty days in advance in the{' '}
            <a href="#changes">revision history at the foot of this document</a>.
          </p>
        </>
      }
      footer={
        <p className="text-muted-foreground text-sm">
          Questions about subprocessors, data residency or custom retention schedules can be sent to legal@nexus.example.
        </p>
      }
    />
  )
}
