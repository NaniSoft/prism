'use client';

import { useState } from 'react';
import { SettingsPage } from '@nanisoft/prism-ui/pages/settings-page';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Field, FieldDescription, FieldLabel } from '@nanisoft/prism-ui/components/field';
import { Input } from '@nanisoft/prism-ui/components/input';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import { Switch } from '@nanisoft/prism-ui/components/switch';
import { Text } from '@nanisoft/prism-ui/components/typography';

const NAV = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview', icon: <PrismIcon name="panel-left" /> },
      { label: 'Release settings', href: '#release-settings', icon: <PrismIcon name="more-horizontal" /> },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Guides', href: '#guides', icon: <PrismIcon name="info" /> },
      { label: 'Source', href: '#source', icon: <PrismIcon name="command" /> },
    ],
  },
];

export default function SettingsPageDemo() {
  const [notifications, setNotifications] = useState(true);
  const [dirty, setDirty] = useState(true);
  const [saved, setSaved] = useState(false);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const sections = [
    {
      id: 'workspace',
      title: 'Workspace identity',
      description: 'Name the synthetic workspace that contains this release handoff.',
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
      id: 'notifications',
      title: 'Review notifications',
      description: 'Choose how this synthetic workspace responds to a release review.',
      content: (
        <Switch
          label="Notify reviewers"
          description="Marks the preview setting as active without sending a notification."
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
    <div role="group" aria-label="Synthetic NaniSoft release settings page" style={{ height: 700, border: '1px solid var(--prism-border)', borderRadius: 4, overflow: 'auto' }}>
      <SettingsPage
        landmark="region"
        title="Release settings"
        description="Manage the synthetic preferences that shape a NaniSoft catalog handoff."
        nav={NAV}
        activeUrl="#release-settings"
        initialSectionId="workspace"
        sections={sections}
        dirty={dirty}
        onSave={() => {
          setDirty(false);
          setSaved(true);
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Badge variant="info">Synthetic workspace settings</Badge>
          <Text role="status" variant="tertiary">{saved ? 'Preview saved locally.' : 'Changes stay in this preview.'}</Text>
        </div>
      </SettingsPage>
    </div>
  );
}
