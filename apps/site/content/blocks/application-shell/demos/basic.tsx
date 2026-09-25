import { ApplicationShell } from '@nanisoft/prism-ui/blocks/application-shell';
import { Heading } from '@nanisoft/prism-ui/components/typography';

const NAV = [
  { label: 'Workspace', items: [
    { label: 'Overview', href: '#overview' },
    { label: 'Projects', href: '#projects' },
    { label: 'Settings', href: '#settings' },
  ] },
];

export default function ApplicationShellDemo() {
  return (
    <div style={{ height: 420, border: '1px solid var(--prism-border)', borderRadius: 4, overflow: 'hidden' }}>
      <ApplicationShell nav={NAV} activeUrl="#overview" sidebarHeader={<strong>Northstar</strong>} header={<strong>Overview</strong>}>
        <Heading level={2}>Build queue</Heading>
        <p style={{ color: 'var(--prism-text-secondary)' }}>The application frame stays out of the way until the work needs it.</p>
      </ApplicationShell>
    </div>
  );
}
