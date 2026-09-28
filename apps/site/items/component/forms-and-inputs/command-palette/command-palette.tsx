'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { CommandPalette, type CommandGroup } from '@nanisoft/prism-ui/components/command-palette'

/**
 * A palette with commands a real product would have, so the ranking is visible
 * rather than described.
 *
 * The fixture is built to make the three orderings distinguishable: "Toggle theme"
 * is findable by a keyword alone, "Open settings" matches inside its own second
 * word, and "Settings" matches at the start of its name. Type "se" and the three
 * appear in that order, which is the difference between ranking and filtering.
 */
const GROUPS: CommandGroup[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    items: [
      {
        id: 'theme',
        label: 'Toggle theme',
        hint: 'Cmd K T',
        keywords: ['dark', 'light', 'colour', 'contrast'],
        onSelect: () => {},
      },
      { id: 'density', label: 'Compact density', onSelect: () => {} },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'new', label: 'New run', hint: 'Cmd N', onSelect: () => {} },
      { id: 'settings', label: 'Open settings', hint: 'Cmd ,', onSelect: () => {} },
    ],
  },
  {
    id: 'settings',
    label: 'Settings pages',
    items: [
      { id: 'account', label: 'Account', onSelect: () => {} },
      { id: 'keys', label: 'Signing keys', onSelect: () => {} },
    ],
  },
]

const SUGGEST = {
  label: 'Recent',
  items: [
    { id: 'new', label: 'New run', hint: 'Cmd N', onSelect: () => {} },
    { id: 'settings', label: 'Open settings', hint: 'Cmd ,', onSelect: () => {} },
  ],
}

/** The palette, opened by a button, with the last command reported underneath. */
export default function CommandPaletteDemo() {
  const [open, setOpen] = useState(false)
  const [ran, setRan] = useState<string | null>(null)

  const groups: CommandGroup[] = GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      onSelect: () => setRan(item.label),
    })),
  }))

  return (
    <div className="flex max-w-measure-narrow flex-col items-start gap-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the palette
      </Button>
      <p className="text-muted-foreground text-sm">
        {ran === null ? 'No command has run yet.' : `Last command: ${ran}`}
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        label="Commands"
        inputLabel="Search commands"
        placeholder="Search commands"
        groups={groups}
        suggest={SUGGEST}
        empty={{
          message: (query) => `No command matches ${query}`,
          hint: 'Try a shorter query',
        }}
      />
    </div>
  )
}
