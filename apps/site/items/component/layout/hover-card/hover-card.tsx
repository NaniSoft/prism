'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@nanisoft/prism-ui/components/hover-card'

const PEOPLE = [
  {
    name: 'Ada Okonkwo',
    role: 'Type and systems',
    line: 'Wrote the two rules about measure and rhythm that the rest is built on.',
  },
  {
    name: 'Ruth Matsumoto',
    role: 'Accessibility',
    line: 'Argued that a preview nobody can reach is a preview half the readers do not have.',
  },
  {
    name: 'Ivan Petrov',
    role: 'Motion',
    line: 'Insisted that motion reports a state change and never decorates one.',
  },
]

/**
 * Three links, three previews, and a toggle for the delay.
 *
 * The delay control is there so a reader can feel what the Component is arguing:
 * at zero the cards flash as the pointer crosses them, which is the failure a
 * default delay exists to prevent.
 */
export default function HoverCardDemo() {
  const [instant, setInstant] = useState(false)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        The principles of good typography are older than the screen, and three
        people wrote most of them. Each name is a link, and each carries the same
        lines at the page it points to.
      </p>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {PEOPLE.map((person) => (
          <HoverCard key={person.name}>
            <HoverCardTrigger
              href={`/people/${person.name.toLowerCase().replace(' ', '-')}`}
              {...(instant ? { delay: 0 } : null)}
            >
              {person.name}
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-sm font-medium">{person.name}</p>
              <p className="text-muted-foreground text-xs">{person.role}</p>
              <p className="mt-2 text-sm">{person.line}</p>
            </HoverCardContent>
          </HoverCard>
        ))}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setInstant((on) => !on)}>
          {instant ? 'Use the default delay' : 'Remove the delay'}
        </Button>
        <span className="text-muted-foreground text-sm">
          {instant
            ? 'No delay: the cards flash as the pointer crosses them.'
            : 'Default delay: a rest counts as intent.'}
        </span>
      </div>
    </div>
  )
}
