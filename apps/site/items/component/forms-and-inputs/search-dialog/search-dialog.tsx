'use client'

import { useState } from 'react'

import { SearchDialog } from '@nanisoft/prism-ui/components/search-dialog'

/**
 * The dialog, behind the trigger a site actually renders.
 *
 * A Demo that mounted the dialog open and passed a no-op `onClose` would have to be
 * a client Component to pass a function across the boundary at all, and it would
 * show a panel the reader cannot dismiss. This is the arrangement a site ships: one
 * button, and the dialog exists only once it has been pressed.
 *
 * The index it reads is this site's own, served as a static file, so the results are
 * the same bytes a reader searching this site gets.
 */
export default function SearchDialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring h-9 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
      >
        Search documentation
      </button>

      {open ? (
        <SearchDialog
          indexUrl="/api/search"
          label="Search documentation"
          hint="Type to search every Section and every Item."
          messages={{
            close: 'Close search',
            loading: 'Loading the search index.',
            failed: 'The search index could not be loaded.',
            empty: 'No matches.',
            one: 'result.',
            other: 'results.',
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
