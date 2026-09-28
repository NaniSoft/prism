'use client'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@nanisoft/prism-ui/components/dialog'

/** A centered modal and a side-anchored sheet, the old drawer re-expressed. */
export default function DialogDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger>Rename workspace</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename workspace</DialogTitle>
            <DialogDescription>
              The new name appears in every menu, link and email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md border px-4 text-sm font-medium">
              Cancel
            </DialogClose>
            <Button>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger>Open filters</DialogTrigger>
        <DialogContent side="right">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription>Narrow the table to the rows you need.</DialogDescription>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Filters open from the edge on a narrow screen, where a centered
            dialog would hide the table.
          </p>
          <DialogFooter>
            <DialogClose className="bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md border px-4 text-sm font-medium">
              Done
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
