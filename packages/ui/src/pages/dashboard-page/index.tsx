import type { ReactNode } from 'react';

import { ApplicationShell, ApplicationShellTitle, type ApplicationNavGroup } from '../../blocks/application-shell/index.js';
import { PageHeader } from '../../blocks/page-header/index.js';
import { StatCard, type StatCardProps } from '../../blocks/stat-card/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card/index.js';
import { Empty } from '../../components/empty/index.js';
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
  landmark?: 'main' | 'region';
  className?: string;
}

export function DashboardPage({ title, description, nav, activeUrl, metrics, activityTitle = 'Recent activity', activity, children, headerActions, landmark = 'main', className }: DashboardPageProps) {
  const activityCard = (
    <Card className="prism-dashboard-page__activity">
      <CardHeader><CardTitle level={2}>{activityTitle}</CardTitle></CardHeader>
      <CardContent>
        {activity ?? <Empty icon="info" title="No recent activity" description="New workspace activity will appear here." />}
      </CardContent>
    </Card>
  );

  return (
    <ApplicationShell
      nav={nav}
      activeUrl={activeUrl}
      landmark={landmark}
      sidebarHeader={<ApplicationShellTitle title="NaniSoft" description="Workspace" />}
      header={<ApplicationShellTitle title={title} />}
    >
      <div className={cx('prism-dashboard-page', className)} data-prism="dashboard-page" data-state={metrics.length > 0 ? 'ready' : 'without-metrics'}>
        <PageHeader title={title} description={description} level={1} actions={headerActions} />
        {metrics.length > 0 ? (
          <section className="prism-dashboard-page__metrics" aria-label="Key metrics">
            {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
          </section>
        ) : null}
        {children ? <div className="prism-dashboard-page__grid">{children}{activityCard}</div> : activityCard}
      </div>
    </ApplicationShell>
  );
}
