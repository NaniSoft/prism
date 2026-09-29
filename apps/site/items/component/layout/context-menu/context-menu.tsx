'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuLinkItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@nanisoft/prism-ui/components/context-menu'

/**
 * A row with a secondary gesture on it, and the same commands on a button beside
 * it.
 *
 * The duplicate menu is the point rather than an accident of the fixture: nothing
 * in a context menu may be the only route to a command, and a demo that showed
 * the menu alone would be teaching the opposite.
 */
export default function ContextMenuDemo() {
  const [last, setLast] = useState<string | null>(null)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Right-click the row below, or long-press it on a touch screen. Every
        command here is also on the button beside it.
      </p>

      <div className="flex items-center gap-3">
        <ContextMenu>
          <ContextMenuTrigger className="border-border flex-1 cursor-default rounded-md border px-3 py-6 text-center text-sm">
            Three runs selected
          </ContextMenuTrigger>
          <ContextMenuContent label="Run actions">
            <ContextMenuGroup>
              <ContextMenuLabel>Selection</ContextMenuLabel>
              <ContextMenuItem onClick={() => setLast('Re-ran three runs')}>
                Re-run these
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setLast('Pinned three runs')}>
                Pin these
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuLinkItem href="/share/selection">
                  Copy link to selection
                </ContextMenuLinkItem>
                <ContextMenuLinkItem href="/share/selection?raw=1">
                  Open raw view
                </ContextMenuLinkItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              onClick={() => setLast('Deleted three runs')}
            >
              Delete runs
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <Button variant="outline" onClick={() => setLast('Opened the run actions')}>
          Run actions
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        {last === null ? 'Nothing chosen yet.' : `Last choice: ${last}`}
      </p>
      <p className="text-muted-foreground text-xs">
        The two Share rows are anchors, so they can be opened in a new tab and
        copied by address. Re-run these is a command, and it is a div.
      </p>
    </div>
  )
}
