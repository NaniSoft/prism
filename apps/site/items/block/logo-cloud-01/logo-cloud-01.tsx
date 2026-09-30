import { LogoCloud01 } from '@nanisoft/prism-ui/blocks/logo-cloud-01'

/**
 * A cloud of invented marks, and the two arms of the link question.
 *
 * **The organisations here are made up, and that is the point.** A logo cloud is
 * a claim about who uses a product, and this site's own demo used to name real
 * companies in exactly this position, which is the defect the Block's own JSDoc
 * names. A demo that ships a customer's mark as sample data makes every reader
 * of the documentation site, including a competitor, believe a relationship
 * exists. So the marks are drawn here rather than hosted, and the names are
 * invented, and the first two cells are linked while the rest are inert so both
 * arms of the `href` question are visible in one render.
 */
export default function LogoCloud01Demo() {
  return (
    <LogoCloud01
      label="Organisations in this study"
      columns={4}
      eyebrow="Market study"
      title="Who runs the same market"
      description="Marks are the caller's own. Four cells carry a destination and four do not, and a mark with no href is inert by design."
      logos={[
        { id: 'ardent', name: 'Ardent Clearing', href: 'https://ardent.example', mark: <Wordmark label="Ardent" /> },
        { id: 'pelham', name: 'Pelham Registry', href: 'https://pelham.example', mark: <Wordmark label="Pelham" /> },
        { id: 'quarry', name: 'Quarry Lane Bank', mark: <Wordmark label="Quarry Lane" /> },
        { id: 'saltmarsh', name: 'Saltmarsh Capital', mark: <Wordmark label="Saltmarsh" /> },
        { id: 'thornfield', name: 'Thornfield Trust', mark: <Wordmark label="Thornfield" /> },
        { id: 'westbourne', name: 'Westbourne Exchange', mark: <Wordmark label="Westbourne" /> },
      ]}
    />
  )
}

/**
 * A monochrome wordmark standing in for a third party's mark.
 *
 * Passed through `mark` rather than `src` so the demo ships no image request and
 * no invented logo file, and so the muted ink the Block puts on the cell is
 * visible on the mark itself, which is the arrangement the Block asks a caller
 * for.
 */
function Wordmark({ label }: { label: string }) {
  return (
    <span className="text-foreground text-base font-semibold tracking-tight">
      {label}
    </span>
  )
}