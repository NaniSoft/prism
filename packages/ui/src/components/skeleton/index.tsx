import type { HTMLAttributes, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  loading?: boolean;
  children?: ReactNode;
}

export function Skeleton({ loading = true, className, children, ...props }: SkeletonProps) {
  if (!loading) return <>{children}</>;
  return <span {...props} className={cx('prism-skeleton', className)} aria-hidden="true" />;
}
