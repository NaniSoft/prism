'use client'

import { useState } from 'react'

import { Combobox, type ComboboxItem } from '@nanisoft/prism-ui/components/combobox'
import { Label } from '@nanisoft/prism-ui/components/label'

const regions: ComboboxItem[] = [
  { value: 'pt', label: 'Portugal', hint: 'Lisbon', keywords: ['lisboa'] },
  { value: 'br', label: 'Brazil', hint: 'Brasilia', keywords: ['brasil'] },
  { value: 'de', label: 'Germany', hint: 'Berlin' },
  { value: 'se', label: 'Sweden', hint: 'Stockholm' },
  { value: 'gb', label: 'United Kingdom', hint: 'London', keywords: ['uk', 'britain'] },
  { value: 'zw', label: 'Zimbabwe', hint: 'Harare', disabled: true },
]

/**
 * A combobox with a filled and an empty field side by side, so the claim that
 * typing never discards a choice can be seen rather than read about.
 */
export default function ComboboxDemo() {
  const [region, setRegion] = useState<string | null>('br')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="combobox-region-filled" required>
          Data region
        </Label>
        <Combobox
          id="combobox-region-filled"
          label="Data region"
          placeholder="Start typing"
          name="region"
          items={regions}
          value={region}
          onValueChange={setRegion}
          empty={{
            message: (query) => `No region matches ${query}`,
            hint: 'Try the country or its capital.',
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="combobox-region-empty">Mirror region</Label>
        <Combobox
          id="combobox-region-empty"
          label="Mirror region"
          placeholder="Nothing chosen yet"
          items={regions}
          empty={{ message: (query) => `No region matches ${query}` }}
        />
      </div>

      <p className="text-muted-foreground text-sm">
        The first field holds <span className="text-foreground">{region ?? 'nothing'}</span>. Type
        into it and the list narrows; the answer does not change until you choose
        one.
      </p>
    </div>
  )
}
