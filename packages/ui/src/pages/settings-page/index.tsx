import type { ReactNode } from 'react';

import { ApplicationShell, ApplicationShellTitle, type ApplicationNavGroup } from '../../blocks/application-shell/index.js';
import { PageHeader } from '../../blocks/page-header/index.js';
import { SettingsPanel, type SettingsSection } from '../../blocks/settings-panel/index.js';
import { cx } from '../../internal/cx.js';

export interface SettingsPageProps {
  title?: string;
  description?: string;
  nav: readonly ApplicationNavGroup[];
  sections: readonly SettingsSection[];
  activeUrl?: string;
  initialSectionId?: string;
  onSave?: () => void;
  dirty?: boolean;
  children?: ReactNode;
  landmark?: 'main' | 'region';
  className?: string;
}

export function SettingsPage({ title = 'Settings', description = 'Manage this workspace and its preferences.', nav, sections, activeUrl, initialSectionId, onSave, dirty, children, landmark = 'main', className }: SettingsPageProps) {
  return (
    <ApplicationShell
      nav={nav}
      activeUrl={activeUrl}
      landmark={landmark}
      sidebarHeader={<ApplicationShellTitle title="NaniSoft" description="Workspace" />}
      header={<ApplicationShellTitle title={title} />}
    >
      <div className={cx('prism-settings-page', className)} data-prism="settings-page" data-state={sections.length > 0 ? 'ready' : 'empty'}>
        <PageHeader title={title} description={description} level={1} />
        {children}
        <SettingsPanel sections={sections} initialSectionId={initialSectionId} onSave={onSave} dirty={dirty} />
      </div>
    </ApplicationShell>
  );
}
