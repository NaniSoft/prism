'use client'

import { ArchiveIcon, SendIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import {
  SplitButton,
  type SplitButtonAction,
} from '@nanisoft/prism-ui/components/split-button'

const ACTIONS: readonly SplitButtonAction[] = [
  {
    id: 'draft',
    label: 'Save as a draft',
    icon: <ArchiveIcon aria-hidden="true" />,
  },
  {
    id: 'copy',
    label: 'Send a copy to the team',
    icon: <SendIcon aria-hidden="true" />,
  },
  {
    id: 'discard',
    label: 'Discard the draft',
    icon: <Trash2Icon aria-hidden="true" />,
    tone: 'danger',
  },
]

/**
 * Two split buttons, one of them at each end of what the Component can draw.
 *
 * The first is the default: an outlined dominant action beside the cap, which is
 * the one pair that reads as a single shape because the cap keeps the frame
 * `DropdownMenuTrigger` draws and that frame is outlined. The second is filled, and
 * it is here on purpose: the cap is still outlined, so the group is two-tone. That
 * is the stated cost of not restyling the menu trigger, and a demo that only drew
 * the easy case would be hiding it.
 */
export default function SplitButtonDemo() {
  const [published, setPublished] = useState<string | null>(null)
  const [removed, setRemoved] = useState<string | null>(null)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SplitButton
          label="Publish the summary"
          primaryLabel="Publish"
          menuLabel="Other ways to publish the summary"
          actions={ACTIONS}
          onPrimaryAction={() => setPublished('Publish')}
          onSecondaryAction={(id) => setPublished(id)}
        />
        <span className="text-muted-foreground text-sm">
          {published === null ? 'Nothing chosen yet.' : `The last thing chosen: ${published}.`}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <SplitButton
          variant="destructive"
          label="Delete the environment"
          primaryLabel="Delete"
          menuLabel="Other ways to delete the environment"
          actions={[
            { id: 'schedule', label: 'Schedule the deletion' },
            { id: 'cascade', label: 'Delete with its data' },
          ]}
          onPrimaryAction={() => setRemoved('Delete')}
          onSecondaryAction={(id) => setRemoved(id)}
        />
        <span className="text-muted-foreground text-sm">
          {removed === null
            ? 'A filled dominant action beside an outlined cap. The cap is not restyled, because restyling the menu trigger is the override path this package does not have.'
            : `The last thing chosen: ${removed}.`}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <SplitButton
          disabled
          label="Publish the report"
          primaryLabel="Publish"
          menuLabel="Other ways to publish the report"
          actions={ACTIONS}
          onPrimaryAction={() => undefined}
          onSecondaryAction={() => undefined}
        />
        <span className="text-muted-foreground text-sm">
          Unavailable. The dominant action keeps its place in the tab order and announces
          itself as unavailable; the cap takes the state the menu already had.
        </span>
      </div>
    </div>
  )
}