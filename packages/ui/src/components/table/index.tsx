import type { HTMLAttributes, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

export interface TableColumn<Row> {
  key: string;
  header: ReactNode;
  accessor?: (row: Row) => ReactNode;
  align?: 'start' | 'center' | 'end';
  width?: string;
}

export interface TableProps<Row> extends Omit<HTMLAttributes<HTMLTableElement>, 'children'> {
  data: readonly Row[];
  columns: readonly TableColumn<Row>[];
  getRowKey: (row: Row, index: number) => string;
  caption?: ReactNode;
  empty?: ReactNode;
}

export function Table<Row>({ data, columns, getRowKey, caption, empty = 'No rows', className, ...props }: TableProps<Row>) {
  return (
    <div className="prism-table__scroll" tabIndex={0}>
      <table {...props} className={cx('prism-table', className)} data-prism="table">
        {caption ? <caption className="prism-table__caption">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" style={{ width: column.width, textAlign: column.align ?? 'start' }}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="prism-table__empty" colSpan={columns.length}>{empty}</td>
            </tr>
          ) : data.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)}>
              {columns.map((column) => (
                <td key={column.key} style={{ textAlign: column.align ?? 'start' }}>
                  {column.accessor ? column.accessor(row) : String(row[column.key as keyof Row] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
