'use client'

import { ArchiveIcon, DownloadIcon, MailIcon, Share2Icon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import {
  OverflowActions,
  type OverflowAction,
} from '@nanisoft/prism-ui/components/overflow-actions'

const ACTIONS: readonly OverflowAction[] = [
  { id: 'open', label: 'Open' },
  { id: 'share', label: 'Share', icon: <Share2Icon aria-hidden="true" /> },
  { id: 'download', label: 'Download', icon: <DownloadIcon aria-hidden="true" /> },
  { id: 'mail', label: 'Email the owner', icon: <MailIcon aria-hidden="true" /> },
  { id: 'archive', label: 'Archive', icon: <ArchiveIcon aria-hidden="true" /> },
  { id: 'trash', label: 'Delete', icon: <Trash2Icon aria-hidden="true" />, tone: 'danger' },
]

/**
 * The same six actions at three widths, so the collapse is visible rather than
 * described.
 *
 * The box around each row is what does the work here: the Component reads the
 * width of the row it is given, so a demo that let the row size itself to its
 * content would never collapse anything, which is the stated cost of a row with no
 * room to run out of.
 */
export default function OverflowActionsDemo() {
  const [report, setReport] = useState<string | null>(null)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-foreground text-sm leading-none font-medium">A row with room</span>
        <div className="border-border w-full rounded-md border p-2">
          <OverflowActions actions={ACTIONS} overflowLabel="More actions for this row" />
        </div>
        <span className="text-muted-foreground text-sm">
          Every action fits, so no cap is drawn and nothing is reported as having moved.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-foreground text-sm leading-none font-medium">A narrower row</span>
        <div className="border-border w-full max-w-72 rounded-md border p-2">
          <OverflowActions
            actions={ACTIONS}
            overflowLabel="More actions for this row"
            onOverflowChange={(ids) => setReport(ids.length === 0 ? null : ids.join(', '))}
          />
        </div>
        <span className="text-muted-foreground text-sm">
          Trailing actions have moved into the menu. The leading ones stay, because they are
          the ones a wide row already fit.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-foreground text-sm leading-none font-medium">A row with almost none</span>
        <div className="border-border w-full max-w-40 rounded-md border p-2">
          <OverflowActions actions={ACTIONS} overflowLabel="More actions for this row" />
        </div>
        <span className="text-muted-foreground text-sm">
          Too narrow for any action beside the cap, so the cap is the whole row and the first
          paint a reader without scripting sees is the full set of six.
        </span>
      </div>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        {report === null
          ? 'No row has reported a change yet, because the callback fires on a change and not on the first render.'
          : `Inside the menu: ${report}.`}
      </p>
    </div>
  )
}