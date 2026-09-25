import type { ReactNode } from 'react';

import { ApplicationShell, type ApplicationNavGroup } from '../../blocks/application-shell/index.js';
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
  className?: string;
}

export function SettingsPage({ title = 'Settings', description = 'Manage this workspace and its preferences.', nav, sections, activeUrl, initialSectionId, onSave, dirty, children, className }: SettingsPageProps) {
  return (
    <ApplicationShell nav={nav} activeUrl={activeUrl} sidebarHeader={<div className="prism-settings-page__brand">NaniSoft</div>}>
      <div className={cx('prism-settings-page', className)} data-prism="settings-page">
        <PageHeader title={title} description={description} level={1} />
        {children}
        <SettingsPanel sections={sections} initialSectionId={initialSectionId} onSave={onSave} dirty={dirty} />
      </div>
    </ApplicationShell>
  );
}
