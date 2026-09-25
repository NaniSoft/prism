import type { HTMLAttributes, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'destructive';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span {...props} className={cx('prism-badge', `prism-badge--${variant}`, className)} data-prism="badge">
      {children}
    </span>
  );
}
