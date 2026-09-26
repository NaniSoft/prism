import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'

/** A page header with a breadcrumb trail and two actions. */
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
        { label: 'Share' },
        { label: 'New deployment', variant: 'outline' },
      ]}
    />
  )
}
