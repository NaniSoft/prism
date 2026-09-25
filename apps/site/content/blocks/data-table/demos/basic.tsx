'use client';

import { useState } from 'react';
import { DataTable } from '@nanisoft/prism-ui/blocks/data-table';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Empty } from '@nanisoft/prism-ui/components/empty';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Text } from '@nanisoft/prism-ui/components/typography';

const ROWS = [
  { id: 'catalog', workstream: 'Component catalog', owner: 'UI systems', state: 'Ready for review', updated: 'Today' },
  { id: 'blocks', workstream: 'Block recipes', owner: 'UI systems', state: 'In progress', updated: 'Today' },
  { id: 'site', workstream: 'Product window wall', owner: 'Website', state: 'In progress', updated: 'Yesterday' },
  { id: 'corpus', workstream: 'Agent corpus', owner: 'Developer tools', state: 'Ready for review', updated: 'Yesterday' },
  { id: 'themes', workstream: 'Theme expressions', owner: 'Design systems', state: 'Ready for review', updated: 'Sep 22' },
  { id: 'release', workstream: 'Release notes', owner: 'Developer tools', state: 'Not started', updated: 'Sep 22' },
];

export default function DataTableDemo() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();
  const rows = ROWS.filter((row) => `${row.workstream} ${row.owner} ${row.state}`.toLowerCase().includes(normalizedQuery));

  return (
    <div role="group" aria-label="Synthetic NaniSoft catalog release table" style={{ display: 'grid', gap: 12 }}>
      <Text variant="tertiary">Synthetic NaniSoft catalog release plan</Text>
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
            accessor: (row) => <Badge variant={row.state === 'Ready for review' ? 'success' : row.state === 'Not started' ? 'neutral' : 'info'}>{row.state}</Badge>,
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
        bulkActions={<Button type="button" variant="secondary" size="sm">Archive</Button>}
        empty={(
          <Empty
            icon="search"
            title="No matching workstreams"
            description="Clear the synthetic filter to return to the complete release plan."
            action={<Button type="button" variant="secondary" onClick={() => { setQuery(''); setPage(1); }}>Clear filter</Button>}
          />
        )}
      />
    </div>
  );
}
