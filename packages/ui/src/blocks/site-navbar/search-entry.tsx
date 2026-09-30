'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { Search } from 'lucide-react'

import type { SearchDialogProps } from '../../components/ui/search-dialog'

/**
 * The dialog, loaded on the first activation.
 *
 * Declared at module scope so the import is shared by every search entry on a page
 * rather than re-issued per call, which is what makes a second search on the same
 * page instant. `lazy` is React's own rather than a framework's, because this
 * package imports no framework and has to stay installable in a bundler that is
 * not the one its own site uses.
 */
const SearchDialog = lazy(() =>
  import('../../components/ui/search-dialog').then((module) => ({ default: module.SearchDialog })),
)

/** The props the search entry takes. It is the dialog's props without its close. */
export type SearchEntryProps = Omit<SearchDialogProps, 'onClose'>

/**
 * The search trigger, and the dialog it opens.
 *
 * **The dialog is loaded on the first activation, so neither the dialog nor the
 * index is part of any page's first paint.** The index is the largest single asset
 * on a documentation site, and a statically imported dialog is in the module graph
 * of every page whether or not the reader ever searches. The trigger is a plain
 * button and the cost of reaching it is one click.
 *
 * **The shortcut is Command-K on Apple platforms and Control-K everywhere else,
 * and it matches rather than replaces.** The listener calls `preventDefault` so the
 * browser's own find behaviour does not also fire, and it toggles so pressing it
 * twice leaves the reader where they started. It is registered on the document
 * rather than on the button, because a shortcut scoped to a control only works once
 * that control has focus, and the point of a shortcut is to save the reader from
 * having to find the control first.
 *
 * **It is icon-only at every width.** The control is not a destination, so its word
 * is the first thing that goes when the bar runs out of room, and the row it sits in
 * is measured rather than assumed: a labelled search control is 55 pixels wider than
 * an icon in the same slot, and on a site whose navigation is nine Sections that is
 * the difference between fitting at the authored breakpoint and folding the brand
 * onto two lines. The accessible name is what replaces the word.
 */
export function SearchEntry(props: SearchEntryProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        data-slot="site-navbar-search-trigger"
        onClick={() => setOpen(true)}
        aria-label={props.label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
      >
        <Search aria-hidden className="size-4" />
      </button>

      {/*
        `Suspense` is given no fallback on purpose. The panel is opened by a click,
        the module is in the cache after the first open, and an empty frame for a
        frame or two reads as a control that did nothing.
      */}
      {open ? (
        <Suspense fallback={null}>
          <SearchDialog {...props} onClose={() => setOpen(false)} />
        </Suspense>
      ) : null}
    </>
  )
}
