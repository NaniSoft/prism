// prism-ui PageHeader block (ADR-0003 prop contract: title, subtitle?,
// breadcrumb?, actions?) — data-in for the canonical slots, composition-in at
// the edges.

import { Divider, Typography } from 'antd';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: ReactNode;
  /** Right-aligned actions (buttons, links). */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={['prism-page-header', className].filter(Boolean).join(' ')} data-prism="page-header">
      {breadcrumb && <nav className="prism-page-header__breadcrumb">{breadcrumb}</nav>}
      <div className="prism-page-header__row">
        <Typography.Title level={2}>{title}</Typography.Title>
        {actions && <div className="prism-page-header__actions">{actions}</div>}
      </div>
      {subtitle && (
        <Typography.Text type="secondary" className="prism-page-header__subtitle">
          {subtitle}
        </Typography.Text>
      )}
      <Divider />
    </header>
  );
}
