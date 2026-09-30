'use client'

import { useState } from 'react'

import { Tag, TagGroup, type TagGroupTag } from '@nanisoft/prism-ui/components/tag-group'

const CHOSEN: TagGroupTag[] = [
  { id: 'overdue', label: 'Overdue', tone: 'destructive' },
  { id: 'unassigned', label: 'Unassigned', tone: 'warning' },
  { id: 'my-accounts', label: 'My accounts', tone: 'info' },
  { id: 'disputed', label: 'Disputed', tone: 'neutral' },
]

/** What the workspace applied for the reader rather than letting them choose. */
const APPLIED: TagGroupTag[] = [
  { id: 'plan-annual', label: 'Annual plan', tone: 'success' },
  { id: 'region-emea', label: 'EMEA', tone: 'neutral' },
  { id: 'seats-40', label: '40 seats', tone: 'neutral' },
]

/**
 * A set the reader chose and can undo, a set the workspace applied, and one chip
 * standing on its own where there is no set to speak of.
 */
export default function TagGroupDemo() {
  const [chosen, setChosen] = useState<TagGroupTag[]>(CHOSEN)
  const [pinned, setPinned] = useState(true)

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <div className="flex flex-col gap-2">
        <TagGroup
          label="Filters"
          tags={chosen}
          onRemove={(id) => setChosen((current) => current.filter((tag) => tag.id !== id))}
          removeLabel={(label) => `Remove the ${String(label)} filter`}
          empty="No filters applied. Choose one from the list above."
        />
        <p className="text-muted-foreground text-sm">
          Removing the last tag leaves the empty line rather than a placeholder
          chip, because a chip where the tags go is a chip a reader tries to
          remove.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <TagGroup label="Applied by your workspace" tags={APPLIED} />
        <p className="text-muted-foreground text-sm">
          No `onRemove`, so no remove control. Tags applied for the reader are a
          real state, and a remove control on them would promise a freedom the
          field does not have.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">
          One chip, no set. A `Tag` on its own does not draw a group label or a
          group role, because a group of one is a chip with a caption.
        </p>
        {pinned ? (
          <Tag
            label="Q3 close"
            tone="info"
            onRemove={() => setPinned(false)}
            removeLabel="Unpin the Q3 close view"
          />
        ) : (
          <p className="text-sm">Nothing is pinned.</p>
        )}
      </div>
    </div>
  )
}
