import type { AnchorHTMLAttributes, HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';
import { PrismIcon } from '../icon/index.js';

export function Breadcrumb({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav {...props} className={cx('prism-breadcrumb', className)} aria-label="Breadcrumb" />;
}

export function BreadcrumbList({ className, ...props }: HTMLAttributes<HTMLOListElement>) {
  return <ol {...props} className={cx('prism-breadcrumb__list', className)} />;
}

export function BreadcrumbItem({ className, ...props }: LiHTMLAttributes<HTMLLIElement>) {
  return <li {...props} className={cx('prism-breadcrumb__item', className)} />;
}

export function BreadcrumbLink({ className, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return <a {...props} className={cx('prism-breadcrumb__link', className)}>{children}</a>;
}

export function BreadcrumbCurrent({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cx('prism-breadcrumb__current', className)} aria-current="page" />;
}

export function BreadcrumbSeparator({ children, className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li {...props} className={cx('prism-breadcrumb__separator', className)} aria-hidden="true">
      {children ?? <PrismIcon name="chevron-down" size={14} />}
    </li>
  );
}
