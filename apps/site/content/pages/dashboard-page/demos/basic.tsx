'use client';

import { useState } from 'react';
import { DataTable } from '@nanisoft/prism-ui/blocks/data-table';
import { DashboardPage } from '@nanisoft/prism-ui/pages/dashboard-page';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Empty } from '@nanisoft/prism-ui/components/empty';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Heading, Text } from '@nanisoft/prism-ui/components/typography';

const NAV = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview', icon: <PrismIcon name="panel-left" /> },
      { label: 'Releases', href: '#releases', icon: <PrismIcon name="command" /> },
      { label: 'Settings', href: '#settings', icon: <PrismIcon name="more-horizontal" /> },
    ],
  },
];

const ROWS = [
  { id: 'catalog', workstream: 'Component catalog', owner: 'UI systems', state: 'Ready for review', updated: 'Today' },
  { id: 'blocks', workstream: 'Block recipes', owner: 'UI systems', state: 'In progress', updated: 'Today' },
  { id: 'site', workstream: 'Product window wall', owner: 'Website', state: 'In progress', updated: 'Yesterday' },
  { id: 'corpus', workstream: 'Agent corpus', owner: 'Developer tools', state: 'Ready for review', updated: 'Yesterday' },
  { id: 'themes', workstream: 'Theme expressions', owner: 'Design systems', state: 'Ready for review', updated: 'Sep 22' },
];

export default function DashboardPageDemo() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();
  const rows = ROWS.filter((row) => `${row.workstream} ${row.owner} ${row.state}`.toLowerCase().includes(normalizedQuery));

  return (
    <div aria-label="Synthetic NaniSoft Prism catalog release dashboard" style={{ height: 620, border: '1px solid var(--prism-border)', borderRadius: 4, overflow: 'auto' }}>
      <DashboardPage
        landmark="region"
        title="Catalog release"
        description="A synthetic NaniSoft workspace for coordinating the checked Prism catalog. Values, owners, and states are demonstration data."
        nav={NAV}
        activeUrl="#overview"
        metrics={[
          { label: 'Checked catalog', value: '43', detail: '29 components, 9 blocks, and 5 pages' },
          { label: 'Current release stage', value: <Badge variant="info">Content review</Badge>, detail: 'Synthetic workflow state' },
        ]}
        headerActions={<Button variant="primary" href="#release-queue">Review release</Button>}
        activity={(
          <div style={{ display: 'grid', gap: 8 }}>
            <Badge variant="info">Synthetic demonstration data</Badge>
            <Heading level={3} size="sm">Agent corpus ready for review</Heading>
            <Text variant="secondary">The preview shows an application-owned handoff without publishing package or corpus changes.</Text>
          </div>
        )}
      >
        <DataTable
          data={rows}
          getRowKey={(row) => row.id}
          page={page}
          pageSize={4}
          onPageChange={setPage}
          columns={[
            { key: 'workstream', header: 'Workstream' },
            { key: 'owner', header: 'Owner' },
            {
              key: 'state',
              header: 'State',
              accessor: (row) => <Badge variant={row.state === 'Ready for review' ? 'success' : 'info'}>{row.state}</Badge>,
            },
            { key: 'updated', header: 'Updated', meta: { align: 'end' } },
          ]}
          toolbar={(
            <div style={{ display: 'flex', width: 'min(100%, 360px)', gap: 8 }}>
              <Input
                aria-label="Filter synthetic release workstreams"
                placeholder="Filter workstreams…"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                startAdornment={<PrismIcon name="search" />}
              />
              {query ? <Button type="button" variant="ghost" onClick={() => { setQuery(''); setPage(1); }}>Clear</Button> : null}
            </div>
          )}
          empty={(
            <Empty
              icon="search"
              title="No matching workstreams"
              description="Clear the synthetic filter to return to the release queue."
              action={<Button type="button" variant="secondary" onClick={() => { setQuery(''); setPage(1); }}>Clear filter</Button>}
            />
          )}
        />
      </DashboardPage>
    </div>
  );
}
