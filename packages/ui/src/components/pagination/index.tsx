import type { HTMLAttributes } from 'react';

import { cx } from '../../internal/cx.js';
import { PrismIcon } from '../icon/index.js';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  label?: string;
}

function pageWindow(page: number, total: number, siblingCount: number): Array<number | 'ellipsis'> {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total, page]);
  for (let offset = 1; offset <= siblingCount; offset += 1) {
    if (page - offset > 1) pages.add(page - offset);
    if (page + offset < total) pages.add(page + offset);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | 'ellipsis'> = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) out.push('ellipsis');
    out.push(value);
    previous = value;
  }
  return out;
}

export function Pagination({ page, total, onPageChange, siblingCount = 1, label = 'Pagination', className, ...props }: PaginationProps) {
  return (
    <nav {...props} className={cx('prism-pagination', className)} aria-label={label}>
      <button type="button" className="prism-pagination__arrow" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Previous page">
        <PrismIcon name="chevron-down" size={15} />
      </button>
      <div className="prism-pagination__pages">
        {pageWindow(page, total, siblingCount).map((entry, index) => entry === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="prism-pagination__ellipsis" aria-hidden>…</span>
        ) : (
          <button key={entry} type="button" className="prism-pagination__page" aria-current={entry === page ? 'page' : undefined} onClick={() => onPageChange(entry)}>{entry}</button>
        ))}
      </div>
      <button type="button" className="prism-pagination__arrow prism-pagination__arrow--next" onClick={() => onPageChange(Math.min(total, page + 1))} disabled={page >= total} aria-label="Next page">
        <PrismIcon name="chevron-down" size={15} />
      </button>
    </nav>
  );
}
