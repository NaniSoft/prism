import { StatusLedger01 } from '@nanisoft/prism-ui/blocks/status-ledger-01'

/** Four rows, one per tier, with the caller's own words for each state. */
export default function StatusLedger01Demo() {
  return (
    <StatusLedger01
      headingLevel="h3"
      eyebrow="Preview"
      title="What it captures"
      description="The tiers are the colour; the words beside them are the information."
      caption="A research direction is named as one. It is not a shipped capability."
      rows={[
        {
          name: 'Access traversal',
          status: 'live',
          statusLabel: 'Flagship - available today',
          detail: 'Every path between a person and a sensitive product.',
        },
        {
          name: 'Containment rehearsal',
          status: 'designed',
          statusLabel: 'Specified, not built',
          bullets: ['Rehearse before you need it.', 'Against the graph you have.'],
        },
        { name: 'Privilege hygiene', status: 'planned', statusLabel: 'Planned' },
        { name: 'Strategy backtesting', status: 'direction', statusLabel: 'Research direction' },
      ]}
    />
  )
}
