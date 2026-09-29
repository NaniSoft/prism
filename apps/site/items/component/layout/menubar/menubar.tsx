'use client'

import { useState } from 'react'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarLinkItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@nanisoft/prism-ui/components/menubar'

/**
 * An application bar, with the last menu disabled so the disabled state is
 * visible rather than described.
 *
 * The demo is a plain function apart from the two pieces of state it reports, so
 * a reader can open every menu and see what each one holds.
 */
export default function MenubarDemo() {
  const [last, setLast] = useState<string | null>(null)
  const [wrap, setWrap] = useState(true)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Tab once to reach the bar, then use the left and right arrows to move
        along it and the down arrow to open a menu. Tab again to leave.
      </p>

      <Menubar label="Notion">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarLabel>New</MenubarLabel>
              <MenubarItem onClick={() => setLast('New document')}>Document</MenubarItem>
              <MenubarItem onClick={() => setLast('New spreadsheet')}>
                Spreadsheet
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Open recent</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarLinkItem href="/runs/41">Nightly reconciliation</MenubarLinkItem>
                <MenubarLinkItem href="/runs/42">Invoice export</MenubarLinkItem>
                <MenubarLinkItem href="/runs/43">Backfill attempt</MenubarLinkItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem variant="destructive" onClick={() => setLast('Closed workspace')}>
              Close workspace
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setLast('Cut')}>Cut</MenubarItem>
            <MenubarItem onClick={() => setLast('Copy')}>Copy</MenubarItem>
            <MenubarItem onClick={() => setLast('Paste')}>Paste</MenubarItem>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={wrap}
              onCheckedChange={(on) => {
                setWrap(on)
                setLast(on ? 'Soft wrap on' : 'Soft wrap off')
              }}
            >
              Soft wrap
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setLast('Zoom in')}>Zoom in</MenubarItem>
            <MenubarItem onClick={() => setLast('Zoom out')}>Zoom out</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu disabled>
          <MenubarTrigger>Help</MenubarTrigger>
        </MenubarMenu>
      </Menubar>

      <p className="text-muted-foreground text-sm">
        {last === null ? 'Nothing chosen yet.' : `Last command: ${last}`}
      </p>
      <p className="text-muted-foreground text-xs">
        The three rows under Open recent are anchors, so they can be opened in a
        new tab. Help is disabled, and stays shut.
      </p>
    </div>
  )
}
