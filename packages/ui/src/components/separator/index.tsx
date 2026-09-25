import type { HTMLAttributes } from 'react';

import { cx } from '../../internal/cx.js';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export function Separator({ orientation = 'horizontal', decorative = true, className, ...props }: SeparatorProps) {
  return (
    <div
      {...props}
      className={cx('prism-separator', `prism-separator--${orientation}`, className)}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
    />
  );
}
