'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@nanisoft/prism-ui/components/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@nanisoft/prism-ui/components/dialog'

/**
 * The same gesture on both surfaces, so the difference is visible rather than
 * described.
 *
 * Click the backdrop on either. The Dialog closes and the alert dialog does not,
 * because a reader who clicks away from a rename has said "not now" and a reader
 * who clicks away from a delete has answered a question they never read.
 */
export default function AlertDialogDemo() {
  const [deleted, setDeleted] = useState(false)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">An alert dialog</h3>
        <p className="text-muted-foreground text-sm">
          Open it, then click the backdrop or press Escape. The backdrop does
          nothing. Escape closes and returns focus to the trigger.
        </p>
        <div>
          <AlertDialog>
            <AlertDialogTrigger>Delete project</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  Twelve runs and every log are removed with it. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction onClick={() => setDeleted(true)}>
                  Delete it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-muted-foreground text-sm">
          {deleted ? 'The project is gone.' : 'Nothing has been deleted yet.'}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">A dialog, for contrast</h3>
        <p className="text-muted-foreground text-sm">
          The same backdrop press closes this one, because a rename is a task and
          "not now" is a safe answer to a task.
        </p>
        <div>
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
                <Button variant="outline">Cancel</Button>
                <Button>Rename</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  )
}
