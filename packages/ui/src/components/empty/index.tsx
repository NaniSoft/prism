import type { HTMLAttributes, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';
import { PrismIcon, type PrismIconName } from '../icon/index.js';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  icon?: PrismIconName;
  title: string;
  description: ReactNode;
  action?: ReactNode;
}

export function Empty({ icon, title, description, action, className, ...props }: EmptyProps) {
  return (
    <div {...props} className={cx('prism-empty', className)} data-prism="empty">
      {icon ? <span className="prism-empty__icon"><PrismIcon name={icon} size={20} /></span> : null}
      <div className="prism-empty__copy">
        <h3 className="prism-empty__title">{title}</h3>
        <div className="prism-empty__description">{description}</div>
      </div>
      {action ? <div className="prism-empty__action">{action}</div> : null}
    </div>
  );
}
