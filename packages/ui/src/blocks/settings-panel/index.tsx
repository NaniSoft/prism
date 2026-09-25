'use client';

import { useId, useState, type ReactNode } from 'react';

import { Button } from '../../components/button/index.js';
import { Empty } from '../../components/empty/index.js';
import { Separator } from '../../components/separator/index.js';
import { Heading, Text } from '../../components/typography/index.js';
import { cx } from '../../internal/cx.js';

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}

export interface SettingsPanelProps {
  sections: readonly SettingsSection[];
  initialSectionId?: string;
  onSectionChange?: (id: string) => void;
  onSave?: () => void;
  saveLabel?: string;
  dirty?: boolean;
  className?: string;
}

export function SettingsPanel({ sections, initialSectionId, onSectionChange, onSave, saveLabel = 'Save changes', dirty = false, className }: SettingsPanelProps) {
  const instanceId = useId();
  const [selectedId, setSelectedId] = useState(initialSectionId ?? sections[0]?.id ?? '');
  const active = sections.find((section) => section.id === selectedId) ?? sections[0];

  if (!active) {
    return (
      <div className={cx('prism-settings-panel', className)} data-prism="settings-panel" data-state="empty">
        <Empty icon="panel-left" title="No settings sections" description="There are no workspace preferences to display." />
      </div>
    );
  }

  const contentId = `${instanceId}-${active.id}`;
  const headingId = `${contentId}-title`;

  const select = (id: string) => {
    setSelectedId(id);
    onSectionChange?.(id);
  };

  return (
    <div className={cx('prism-settings-panel', className)} data-prism="settings-panel" data-state="ready">
      <nav className="prism-settings-panel__nav" aria-label="Settings sections">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className="prism-settings-panel__nav-item"
            aria-current={section.id === active.id ? 'page' : undefined}
            aria-controls={contentId}
            onClick={() => select(section.id)}
          >
            {section.title}
          </button>
        ))}
      </nav>
      <section id={contentId} className="prism-settings-panel__content" aria-labelledby={headingId}>
        <div className="prism-settings-panel__heading">
          <div>
            <Heading level={2} size="md" id={headingId}>{active.title}</Heading>
            {active.description ? <Text variant="secondary">{active.description}</Text> : null}
            <Text variant="tertiary" role="status" aria-live="polite" className="prism-settings-panel__save-state">
              {dirty ? 'Unsaved changes' : 'All changes saved'}
            </Text>
          </div>
          <Button type="button" variant="primary" onClick={onSave} disabled={!dirty}>{saveLabel}</Button>
        </div>
        <Separator />
        <div className="prism-settings-panel__body">{active.content}</div>
      </section>
    </div>
  );
}
