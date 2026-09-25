'use client';

import { useState } from 'react';
import { SettingsPanel } from '@nanisoft/prism-ui/blocks/settings-panel';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Field, FieldDescription, FieldLabel } from '@nanisoft/prism-ui/components/field';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Switch } from '@nanisoft/prism-ui/components/switch';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function SettingsPanelDemo() {
  const [notifications, setNotifications] = useState(true);
  const [dirty, setDirty] = useState(true);
  const [saved, setSaved] = useState(false);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const sections = [
    {
      id: 'identity',
      title: 'Release identity',
      description: 'Name the synthetic workspace that owns this handoff.',
      content: (
        <div style={{ display: 'grid', width: 'min(100%, 520px)', gap: 16 }}>
          <Field>
            <FieldLabel>Workspace name</FieldLabel>
            <Input name="workspace-name" defaultValue="NaniSoft catalog release" onChange={markDirty} />
            <FieldDescription>Application-owned label for this documentation preview.</FieldDescription>
          </Field>
        </div>
      ),
    },
    {
      id: 'review',
      title: 'Review notifications',
      description: 'Choose how this synthetic workspace responds to a release review.',
      content: (
        <Switch
          label="Notify reviewers"
          description="Keeps the setting local to this preview and sends no notification."
          checked={notifications}
          onCheckedChange={(checked) => {
            setNotifications(checked);
            markDirty();
          }}
        />
      ),
    },
  ];

  return (
    <div role="group" aria-label="Synthetic NaniSoft settings panel" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant="info">Synthetic settings panel</Badge>
        <Text role="status" variant="tertiary">{saved ? 'Preview saved locally.' : 'Try a section or change a value.'}</Text>
      </div>
      <SettingsPanel
        sections={sections}
        initialSectionId="identity"
        dirty={dirty}
        saveLabel="Save release settings"
        onSave={() => {
          setDirty(false);
          setSaved(true);
        }}
      />
    </div>
  );
}
