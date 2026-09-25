import { ApplicationShell, ApplicationShellTitle } from '@nanisoft/prism-ui/blocks/application-shell';
import { DataTable } from '@nanisoft/prism-ui/blocks/data-table';
import { PageHeader } from '@nanisoft/prism-ui/blocks/page-header';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';

const NAV = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview', icon: <PrismIcon name="panel-left" /> },
      { label: 'Releases', href: '#releases', icon: <PrismIcon name="command" /> },
      { label: 'Environments', href: '#environments', icon: <PrismIcon name="check" /> },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Access', href: '#access', icon: <PrismIcon name="info" /> },
      { label: 'Settings', href: '#settings', icon: <PrismIcon name="more-horizontal" /> },
    ],
  },
];

const ROWS = [
  { id: 'catalog', workstream: 'Component catalog', owner: 'UI systems', state: 'Ready for review' },
  { id: 'blocks', workstream: 'Block recipes', owner: 'UI systems', state: 'In progress' },
  { id: 'corpus', workstream: 'Agent corpus', owner: 'Developer tools', state: 'Ready for review' },
];

export default function ApplicationShellDemo() {
  return (
    <div aria-label="Synthetic NaniSoft catalog release workspace" style={{ height: 560, border: '1px solid var(--prism-border)', borderRadius: 4, overflow: 'auto' }}>
      <ApplicationShell
        landmark="region"
        nav={NAV}
        activeUrl="#releases"
        sidebarHeader={<ApplicationShellTitle title="NaniSoft" description="Catalog release" />}
        header={<ApplicationShellTitle title="Catalog release" description="Application block preview" />}
      >
        <PageHeader
          title="Release queue"
          description="Synthetic NaniSoft workstreams for the Prism catalog. All names and states in this preview are demonstration data."
          level={1}
          actions={<Badge variant="info">Synthetic data</Badge>}
        />
        <DataTable
          data={ROWS}
          getRowKey={(row) => row.id}
          columns={[
            { key: 'workstream', header: 'Workstream' },
            { key: 'owner', header: 'Owner' },
            {
              key: 'state',
              header: 'State',
              accessor: (row) => <Badge variant={row.state === 'Ready for review' ? 'success' : 'info'}>{row.state}</Badge>,
            },
          ]}
          toolbar={<Badge variant="neutral">3 synthetic workstreams</Badge>}
          empty="No synthetic workstreams match this view."
        />
      </ApplicationShell>
    </div>
  );
}
