'use client';

import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '@nanisoft/prism-ui/components/field';
import { SelectItem, SelectList, SelectPopup, SelectPortal, SelectPositioner, SelectRoot, SelectTrigger, SelectValue } from '@nanisoft/prism-ui/components/select';
import { Text } from '@nanisoft/prism-ui/components/typography';

const ITEMS = [
  { value: 'preview', label: 'Preview' },
  { value: 'candidate', label: 'Release candidate' },
  { value: 'stable', label: 'Stable' },
];

export default function SelectDemo() {
  const [value, setValue] = useState('candidate');

  return (
    <div role="group" aria-label="Synthetic release channel" style={{ display: 'grid', width: 'min(100%, 360px)', gap: 12 }}>
      <Text variant="tertiary">Synthetic release configuration</Text>
      <Field>
        <FieldLabel>Release channel</FieldLabel>
        <SelectRoot items={ITEMS} value={value} onValueChange={(next) => next && setValue(next)}>
          <SelectTrigger aria-label="Release channel"><SelectValue /></SelectTrigger>
          <SelectPortal>
            <SelectPositioner>
              <SelectPopup>
                <SelectList>{ITEMS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectList>
              </SelectPopup>
            </SelectPositioner>
          </SelectPortal>
        </SelectRoot>
        <FieldDescription>Controls where this synthetic release is staged.</FieldDescription>
      </Field>
    </div>
  );
}
