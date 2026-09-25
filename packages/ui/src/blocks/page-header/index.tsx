import type { ReactNode } from 'react';

import { Heading, Text } from '../../components/typography/index.js';
import { cx } from '../../internal/cx.js';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, level = 2, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cx('prism-page-header', className)} data-prism="page-header">
      {breadcrumb ? <nav className="prism-page-header__breadcrumb" aria-label="Breadcrumb">{breadcrumb}</nav> : null}
      <div className="prism-page-header__row">
        <div className="prism-page-header__copy">
          <Heading level={level} size="lg" className="prism-page-header__title">{title}</Heading>
          {description ? <Text className="prism-page-header__description">{description}</Text> : null}
        </div>
        {actions ? <div className="prism-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
