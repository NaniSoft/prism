import type { HTMLAttributes } from 'react';

import { cx } from '../../internal/cx.js';

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <kbd {...props} className={cx('prism-kbd', className)} />;
}
