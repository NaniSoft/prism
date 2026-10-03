import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'

/**
 * A page header with a breadcrumb trail and two actions.
 *
 * Both actions name a destination, so both render as anchors rather than as buttons
 * that go nowhere. `actionsSlot` is gone: a caller control is the `slot` arm of
 * `actions` now, so it can say which position it fills rather than always landing
 * first.
 */
export default function PageHeader01Demo() {
  return (
    <PageHeader01
      headingLevel="h3"
      breadcrumbs={[
        { label: 'Workspaces', href: '#workspaces' },
        { label: 'Northwind', href: '#northwind' },
        { label: 'Overview' },
      ]}
      title="Overview"
      description="Deployments, usage and the people on this workspace."
      actions={[
        { label: 'New deployment', href: '#new-deployment' },
        { label: 'Share', href: '#share', variant: 'outline' },
      ]}
    />
  )
}
