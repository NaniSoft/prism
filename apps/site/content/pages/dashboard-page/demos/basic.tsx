import { DashboardPage } from '@nanisoft/prism-ui/pages/dashboard-page';

const NAV = [{ label: 'Workspace', items: [{ label: 'Overview', href: '#overview' }, { label: 'Activity', href: '#activity' }] }];

export default function DashboardPageDemo() {
  return (
    <div style={{ height: 560, border: '1px solid var(--prism-border)', borderRadius: 4, overflow: 'auto' }}>
      <DashboardPage
        title="Overview"
        description="Synthetic demonstration data."
        nav={NAV}
        activeUrl="#overview"
        metrics={[
          { label: 'Published items', value: '43', change: '+4', trend: 'up' },
          { label: 'Agent requests', value: '12.8k', change: '+18%', trend: 'up' },
          { label: 'Open issues', value: '7', trend: 'neutral' },
          { label: 'Build health', value: '99.4%', trend: 'up' },
        ]}
        activity={<p style={{ color: 'var(--prism-text-secondary)' }}>The latest published component is Button.</p>}
      />
    </div>
  );
}
