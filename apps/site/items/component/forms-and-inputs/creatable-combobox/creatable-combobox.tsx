'use client'

import { useState } from 'react'

import { CreatableCombobox } from '@nanisoft/prism-ui/components/creatable-combobox'
import { Label } from '@nanisoft/prism-ui/components/label'
import type { ComboboxItem } from '@nanisoft/prism-ui/components/combobox'

const regions: ComboboxItem[] = [
  { value: 'pt', label: 'Portugal', hint: 'Lisbon' },
  { value: 'br', label: 'Brazil', hint: 'Brasilia' },
  { value: 'de', label: 'Germany', hint: 'Berlin' },
  { value: 'se', label: 'Sweden', hint: 'Stockholm' },
]

/**
 * Two fields side by side, one of them with a rule about what may be created.
 *
 * The first is the plain case: type something the list does not have, press Tab out
 * of the search field to land in the create field inside the popover, and press Enter
 * to commit it. The second adds a validator, so a draft that is too short draws the
 * message and the create control disappears until it passes.
 *
 * The important thing to try in both is the Tab move. Tab out of the search field
 * enters the create field and the list stays open, and Arrow Up goes back into the
 * list with the highlight on the first row.
 */
export default function CreatableComboboxDemo() {
  const [region, setRegion] = useState<string | null>('pt')
  const [created, setCreated] = useState<string[]>([])

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="creatable-combobox-region" required>
          Data region, existing or new
        </Label>
        <CreatableCombobox
          id="creatable-combobox-region"
          label="Data region"
          draftLabel="New region name"
          createLabel="Create region"
          placeholder="Search or type a new region"
          name="region"
          items={regions}
          value={region}
          onValueChange={setRegion}
          onCreate={(draft) => {
            setCreated((all) => [...all, draft])
            setRegion(draft)
          }}
          empty={{
            message: (query) => `No region is called ${query}`,
            hint: 'Press Tab to name a new one.',
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="creatable-combobox-validated">Data region, three letters or more</Label>
        <CreatableCombobox
          id="creatable-combobox-validated"
          label="Data region with a length rule"
          draftLabel="New region name"
          createLabel="Create region"
          placeholder="Search or type a new region"
          items={regions}
          onValueChange={setRegion}
          onCreate={(draft) => {
            setCreated((all) => [...all, draft])
            setRegion(draft)
          }}
          validate={(draft) =>
            draft.length < 3 ? 'A region name needs at least three letters.' : null
          }
          empty={{ message: (query) => `No region is called ${query}` }}
        />
      </div>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        The field currently holds <span className="text-foreground">{region ?? 'nothing'}</span>,
        and this page has created{' '}
        <span className="text-foreground">{created.length === 0 ? 'nothing yet' : created.join(', ')}</span>.
        A created value is the caller&apos;s to accept, so only{' '}
        <code className="text-foreground font-mono">onCreate</code> hears about it.
      </p>
    </div>
  )
}
