'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '../../components/button/index.js';
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
  const [activeId, setActiveId] = useState(initialSectionId ?? sections[0]?.id ?? '');
  const active = sections.find((section) => section.id === activeId) ?? sections[0];
  if (!active) return null;

  const select = (id: string) => {
    setActiveId(id);
    onSectionChange?.(id);
  };

  return (
    <div className={cx('prism-settings-panel', className)} data-prism="settings-panel">
      <nav className="prism-settings-panel__nav" aria-label="Settings sections">
        {sections.map((section) => (
          <button key={section.id} type="button" className="prism-settings-panel__nav-item" aria-current={section.id === active.id ? 'page' : undefined} onClick={() => select(section.id)}>{section.title}</button>
        ))}
      </nav>
      <section className="prism-settings-panel__content" aria-labelledby={`prism-settings-${active.id}`}>
        <div className="prism-settings-panel__heading">
          <div><Heading level={2} size="md" id={`prism-settings-${active.id}`}>{active.title}</Heading>{active.description ? <Text variant="secondary">{active.description}</Text> : null}</div>
          <Button variant="primary" onClick={onSave} disabled={!dirty}>{saveLabel}</Button>
        </div>
        <Separator />
        <div className="prism-settings-panel__body">{active.content}</div>
      </section>
    </div>
  );
}
