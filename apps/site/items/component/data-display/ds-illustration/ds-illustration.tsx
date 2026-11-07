import { DSIllustration } from '@nanisoft/prism-ui/components/ds-illustration'

const src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='%23E5E7EB'/><circle cx='150' cy='100' r='44' fill='%2394a3b8'/></svg>"

/** The figure keeps its own width-to-height. */
export default function DsIllustrationDemo() {
  return <DSIllustration src={src} alt="Diagram illustration" />
}
