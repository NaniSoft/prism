import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'

/** Three columns above `sm`, one below it. */
export default function DsGridDemo() {
  return (
    <DSGrid columns={3} gap="md">
      <span>One</span>
      <span>Two</span>
      <span>Three</span>
    </DSGrid>
  )
}
