'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '../../components/button/index.js';
import { Checkbox } from '../../components/checkbox/index.js';
import { Pagination } from '../../components/pagination/index.js';
import { Table, type TableColumn } from '../../components/table/index.js';
import { cx } from '../../internal/cx.js';

export interface DataTableColumn<Row> extends TableColumn<Row> {
  meta?: { align?: 'start' | 'center' | 'end' };
}

export interface DataTableProps<Row> {
  data: readonly Row[];
  columns: readonly DataTableColumn<Row>[];
  getRowKey: (row: Row) => string;
  toolbar?: ReactNode;
  bulkActions?: ReactNode;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  empty?: ReactNode;
  className?: string;
}

export function DataTable<Row>({
  data,
  columns,
  getRowKey,
  toolbar,
  bulkActions,
  page = 1,
  pageSize = 10,
  onPageChange,
  empty = 'No records found.',
  className,
}: DataTableProps<Row>) {
  const [internalSelection, setInternalSelection] = useState<Set<string>>(() => new Set());
  const selection = internalSelection;
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const visible = data.slice((page - 1) * pageSize, page * pageSize);
  const visibleKeys = visible.map(getRowKey);
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selection.has(key));

  const toggle = (key: string, checked: boolean) => {
    const next = new Set(selection);
    if (checked) next.add(key); else next.delete(key);
    setInternalSelection(next);
  };

  const tableColumns: TableColumn<Row>[] = [
    {
      key: '__select',
      header: (
        <Checkbox
          label={<span className="prism-visually-hidden">{allSelected ? 'Deselect visible rows' : 'Select visible rows'}</span>}
          checked={allSelected}
          indeterminate={!allSelected && visibleKeys.some((key) => selection.has(key))}
          onCheckedChange={(checked) => setInternalSelection(checked ? new Set([...selection, ...visibleKeys]) : new Set([...selection].filter((key) => !visibleKeys.includes(key))))}
        />
      ),
      width: '44px',
      accessor: (row) => (
        <Checkbox
          label={<span className="prism-visually-hidden">Select {String(getRowKey(row))}</span>}
          checked={selection.has(getRowKey(row))}
          onCheckedChange={(checked) => toggle(getRowKey(row), checked)}
        />
      ),
    },
    ...columns.map((column) => ({ ...column, align: column.align ?? column.meta?.align })),
  ];

  return (
    <section className={cx('prism-data-table', className)} data-prism="data-table">
      <div className="prism-data-table__toolbar">
        <div>{toolbar}</div>
        {selection.size > 0 ? <div className="prism-data-table__bulk" role="status">{selection.size} selected {bulkActions}</div> : null}
      </div>
      <Table data={visible} columns={tableColumns} getRowKey={(row) => getRowKey(row)} empty={empty} />
      {totalPages > 1 ? <Pagination page={page} total={totalPages} onPageChange={onPageChange ?? (() => undefined)} className="prism-data-table__pagination" /> : null}
    </section>
  );
}

export function DataTableEmptyAction({ children }: { children: ReactNode }) {
  return <Button variant="secondary">{children}</Button>;
}
