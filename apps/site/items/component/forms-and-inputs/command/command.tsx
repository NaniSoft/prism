'use client'

import { useState } from 'react'

import { Command } from '@nanisoft/prism-ui/components/command'

const commands = [
  { label: 'Toggle theme', hint: 'Ctrl K T', keywords: ['dark', 'light'] },
  { label: 'Reset workspace', hint: 'Ctrl K R', keywords: ['start over'] },
  { label: 'New run', hint: 'Ctrl N' },
  { label: 'Open settings', hint: 'Ctrl comma' },
  { label: 'Copy the run link' },
]

/**
 * A list of command rows, with the highlight moved by the pointer and by the
 * arrow keys. The listbox belongs to the caller, so it is written here rather than
 * assumed.
 */
export default function CommandDemo() {
  const [active, setActive] = useState(0)
  const [chosen, setChosen] = useState('Nothing yet')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <div
        role="listbox"
        aria-label="Workspace commands"
        className="bg-popover text-popover-foreground w-80 rounded-md border p-1"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) =>
              event.key === 'ArrowDown'
                ? (index + 1) % commands.length
                : (index - 1 + commands.length) % commands.length,
            )
          }
        }}
      >
        {commands.map((command, index) => (
          <Command
            key={command.label}
            label={command.label}
            hint={command.hint}
            keywords={command.keywords}
            active={index === active}
            onHover={() => setActive(index)}
            onSelect={() => setChosen(command.label)}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-sm">
        Last chosen: <span className="text-foreground">{chosen}</span>
      </p>
    </div>
  )
}
