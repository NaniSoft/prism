'use client';

import { useState } from 'react';
import { SelectItem, SelectList, SelectPopup, SelectPortal, SelectPositioner, SelectRoot, SelectTrigger, SelectValue } from '@nanisoft/prism-ui/components/select';

const ITEMS = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'lavender', label: 'Lavender' },
];

export default function SelectDemo() {
  const [value, setValue] = useState('blue');
  return (
    <SelectRoot items={ITEMS} value={value} onValueChange={(next) => next && setValue(next)}>
      <SelectTrigger aria-label="Brand pack"><SelectValue /></SelectTrigger>
      <SelectPortal><SelectPositioner><SelectPopup><SelectList>{ITEMS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectList></SelectPopup></SelectPositioner></SelectPortal>
    </SelectRoot>
  );
}
