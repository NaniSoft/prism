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
  const availableKeys = new Set(data.map(getRowKey));
  const selection = new Set([...internalSelection].filter((key) => availableKeys.has(key)));
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const visiblePage = Math.min(Math.max(page, 1), totalPages);
  const visible = data.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);
  const visibleKeys = visible.map(getRowKey);
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selection.has(key));

  const toggle = (key: string, checked: boolean) => {
    const next = new Set(selection);
    if (checked) next.add(key); else next.delete(key);
    setInternalSelection(next);
  };

  const selectionColumn: TableColumn<Row> = {
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
        label={<span className="prism-visually-hidden">Select row {getRowKey(row)}</span>}
        checked={selection.has(getRowKey(row))}
        onCheckedChange={(checked) => toggle(getRowKey(row), checked)}
      />
    ),
  };

  const alignedColumns: TableColumn<Row>[] = columns.map((column) => ({ ...column, align: column.align ?? column.meta?.align }));
  const tableColumns = visibleKeys.length > 0 ? [selectionColumn, ...alignedColumns] : alignedColumns;

  return (
    <section className={cx('prism-data-table', className)} data-prism="data-table" data-state={visible.length > 0 ? 'ready' : 'empty'}>
      {toolbar || selection.size > 0 ? (
        <div className="prism-data-table__toolbar">
          <div>{toolbar}</div>
          {selection.size > 0 ? (
            <div className="prism-data-table__bulk" role="status" aria-live="polite">
              <span>{selection.size} {selection.size === 1 ? 'row' : 'rows'} selected</span>
              {bulkActions}
            </div>
          ) : null}
        </div>
      ) : null}
      <Table data={visible} columns={tableColumns} getRowKey={getRowKey} empty={empty} />
      {totalPages > 1 ? <Pagination page={visiblePage} total={totalPages} onPageChange={onPageChange ?? (() => undefined)} label="Table pages" className="prism-data-table__pagination" /> : null}
    </section>
  );
}

export function DataTableEmptyAction({ children }: { children: ReactNode }) {
  return <Button type="button" variant="secondary">{children}</Button>;
}
