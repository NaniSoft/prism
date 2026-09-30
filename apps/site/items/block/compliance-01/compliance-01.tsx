import { Compliance01 } from '@nanisoft/prism-ui/blocks/compliance-01'

/**
 * Four rows, one per interesting state, with the words invented.
 *
 * **Nothing here is a real standard, and that is deliberate.** A compliance demo
 * that names a real certification, attached to a real claim, at a real scope, is
 * a representation this repository cannot make and every reader of the
 * documentation site would believe it. The standards are the shapes a standard
 * has, spelled as placeholders, so the arrangement is visible and the claim is
 * nobody's.
 *
 * The four rows are chosen to show the set: one `held` with a standard and an
 * evidence link, one `in-progress` with no standard behind it yet, one
 * `not-applicable` which says a scope does not reach it, and one row with no
 * state at all, which is what a claim nobody has labelled looks like and which
 * renders an empty cell on purpose.
 */
export default function Compliance01Demo() {
  return (
    <Compliance01
      headingLevel="h3"
      eyebrow="Governance"
      title="What this site claims"
      description="The states are the tone set Status owns. The words in every cell belong to the publisher."
      columns={{
        claim: 'Claim',
        standard: 'Standard',
        scope: 'Scope',
        reviewedAt: 'Last reviewed',
        state: 'State',
        evidence: 'Evidence',
      }}
      rows={[
        {
          id: 'access-control',
          claim: 'Single sign-on across every administrative surface',
          standard: 'OIDC',
          scope: 'Production estate',
          reviewedAt: '2026-06',
          state: 'held',
          stateLabel: 'Held',
          evidenceHref: 'https://evidence.example/access-control',
          evidenceLabel: 'Access control standard',
        },
        {
          id: 'residency',
          claim: 'Market data held inside the region a customer nominates',
          scope: 'Named regions only',
          reviewedAt: '2026-04',
          state: 'in-progress',
          stateLabel: 'In build',
        },
        {
          id: 'paper-trail',
          claim: 'Signed settlement records retained for seven years',
          standard: 'ISO 20022',
          scope: 'Clearing accounts',
          reviewedAt: '2026-01',
          state: 'held',
          stateLabel: 'Held',
          evidenceHref: 'https://evidence.example/settlement',
          evidenceLabel: 'Record retention note',
        },
        {
          id: 'hardware-keys',
          claim: 'Hardware backed keys for the operations account',
          scope: 'Not offered in this release',
          state: 'not-applicable',
          stateLabel: 'Out of scope',
        },
      ]}
    />
  )
}