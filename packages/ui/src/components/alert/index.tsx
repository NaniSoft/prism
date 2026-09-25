import type { HTMLAttributes, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';
import { PrismIcon, type PrismIconName } from '../icon/index.js';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

const icons: Record<AlertVariant, PrismIconName> = {
  info: 'info',
  success: 'circle-check',
  warning: 'alert-triangle',
  error: 'circle-alert',
};

export function Alert({ variant = 'info', title, description, action, className, children, ...props }: AlertProps) {
  return (
    <div
      {...props}
      className={cx('prism-alert', `prism-alert--${variant}`, className)}
      role={variant === 'error' ? 'alert' : 'status'}
      data-prism="alert"
    >
      <PrismIcon name={icons[variant]} className="prism-alert__icon" />
      <div className="prism-alert__content">
        <div className="prism-alert__title">{title}</div>
        {description ? <div className="prism-alert__description">{description}</div> : null}
        {children}
      </div>
      {action ? <div className="prism-alert__action">{action}</div> : null}
    </div>
  );
}
