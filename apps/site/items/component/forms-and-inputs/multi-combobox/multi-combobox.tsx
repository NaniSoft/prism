'use client'

import { useState } from 'react'

import { MultiCombobox } from '@nanisoft/prism-ui/components/multi-combobox'
import { Label } from '@nanisoft/prism-ui/components/label'
import type { ComboboxItem } from '@nanisoft/prism-ui/components/combobox'

const regions: ComboboxItem[] = [
  { value: 'pt', label: 'Portugal', hint: 'Lisbon', keywords: ['lisboa'] },
  { value: 'br', label: 'Brazil', hint: 'Brasilia', keywords: ['brasil'] },
  { value: 'de', label: 'Germany', hint: 'Berlin', keywords: ['deutschland'] },
  { value: 'se', label: 'Sweden', hint: 'Stockholm' },
  { value: 'gb', label: 'United Kingdom', hint: 'London', keywords: ['uk', 'britain'] },
  { value: 'ie', label: 'Ireland', hint: 'Dublin' },
  { value: 'zw', label: 'Zimbabwe', hint: 'Harare', disabled: true },
]

/**
 * The same field with and without a cap, and a read-only set for comparison.
 *
 * The first one is the plain case: type, press Space or Enter on a row, and watch
 * the list stay open, which is the whole difference from `Combobox`. The second
 * carries `max`, so once the cap is reached the remaining rows dim and the
 * select-all control announces itself as unavailable rather than quietly choosing
 * fewer than it says it will. The third has no remove handler a reader can reach
 * from the field itself, so it shows the count beside the chips.
 *
 * Backspace in an empty search field takes the last chip, which is the second way
 * out of a set that has grown past one line.
 */
export default function MultiComboboxDemo() {
  const [regionsAny, setRegionsAny] = useState<readonly string[]>(['pt', 'de'])
  const [regionsThree, setRegionsThree] = useState<readonly string[]>(['se'])

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="multi-combobox-regions">Any number of regions</Label>
        <MultiCombobox
          id="multi-combobox-regions"
          label="Any number of regions"
          placeholder="Search regions"
          name="regions"
          items={regions}
          value={regionsAny}
          onValueChange={setRegionsAny}
          removeLabel={(name) => `Remove ${name}`}
          showCount
          empty={{
            message: (query) => `No region matches ${query}`,
            hint: 'Search by country or by capital.',
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="multi-combobox-capped" required>
          At most three regions
        </Label>
        <MultiCombobox
          id="multi-combobox-capped"
          label="At most three regions"
          placeholder="Search regions"
          items={regions}
          value={regionsThree}
          onValueChange={setRegionsThree}
          removeLabel={(name) => `Remove ${name}`}
          max={3}
          selectAll={(matching) => `Select all ${matching} matches`}
          clearAll={(chosen) => `Clear all ${chosen}`}
          empty={{ message: (query) => `No region matches ${query}` }}
        />
      </div>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        The open field holds <span className="text-foreground">{regionsAny.length}</span> chosen
        values and the capped one holds{' '}
        <span className="text-foreground">{regionsThree.length}</span>. A disabled row stays in
        the list so you can see that it exists, and the arrows step over it.
      </p>
    </div>
  )
}
