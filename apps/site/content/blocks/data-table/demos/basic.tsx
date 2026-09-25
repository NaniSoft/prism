import { DataTable } from '@nanisoft/prism-ui/blocks/data-table';
import { Input } from '@nanisoft/prism-ui/components/input';

const ROWS = [
  { id: 'button', name: 'Button', layer: 'Component', status: 'Stable' },
  { id: 'data-table', name: 'DataTable', layer: 'Block', status: 'Stable' },
  { id: 'dashboard-page', name: 'DashboardPage', layer: 'Page', status: 'Stable' },
];

export default function DataTableDemo() {
  return (
    <DataTable
      data={ROWS}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'layer', header: 'Layer' },
        { key: 'status', header: 'Status' },
      ]}
      toolbar={<Input aria-label="Filter records" placeholder="Filter records…" />}
    />
  );
}
