import type { ReactNode } from 'react';

import { ApplicationShell, type ApplicationNavGroup } from '../../blocks/application-shell/index.js';
import { PageHeader } from '../../blocks/page-header/index.js';
import { StatCard, type StatCardProps } from '../../blocks/stat-card/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card/index.js';
import { cx } from '../../internal/cx.js';

export interface DashboardPageProps {
  title: string;
  description?: string;
  nav: readonly ApplicationNavGroup[];
  activeUrl?: string;
  metrics: readonly StatCardProps[];
  activityTitle?: string;
  activity?: ReactNode;
  children?: ReactNode;
  headerActions?: ReactNode;
  className?: string;
}

export function DashboardPage({ title, description, nav, activeUrl, metrics, activityTitle = 'Recent activity', activity, children, headerActions, className }: DashboardPageProps) {
  return (
    <ApplicationShell nav={nav} activeUrl={activeUrl} sidebarHeader={<div className="prism-dashboard-page__brand">NaniSoft</div>} header={<div className="prism-dashboard-page__header-title">{title}</div>}>
      <div className={cx('prism-dashboard-page', className)} data-prism="dashboard-page">
        <PageHeader title={title} description={description} level={1} actions={headerActions} />
        <section className="prism-dashboard-page__metrics" aria-label="Key metrics">{metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}</section>
        <div className="prism-dashboard-page__grid">
          {children}
          <Card><CardHeader><CardTitle level={2}>{activityTitle}</CardTitle></CardHeader><CardContent>{activity}</CardContent></Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
