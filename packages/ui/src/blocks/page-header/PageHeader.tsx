// prism-ui PageHeader block (ADR-0003 prop contract: title, subtitle?,
// breadcrumb?, actions?) — data-in for the canonical slots, composition-in at
// the edges.

import { Divider, Typography } from 'antd';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Heading level for the title. Defaults to 2 for headers embedded inside a
   * page (an `h1` already owns the top of the outline). A page that has no
   * other `h1` — the section index pages — passes `level={1}` (WCAG 1.3.1).
   */
  level?: 1 | 2 | 3 | 4 | 5;
  breadcrumb?: ReactNode;
  /** Right-aligned actions (buttons, links). */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, level = 2, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={['prism-page-header', className].filter(Boolean).join(' ')} data-prism="page-header">
      {breadcrumb && <nav className="prism-page-header__breadcrumb">{breadcrumb}</nav>}
      <div className="prism-page-header__row">
        <Typography.Title level={level}>{title}</Typography.Title>
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
