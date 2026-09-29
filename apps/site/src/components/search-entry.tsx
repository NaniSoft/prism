'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'

/**
 * The search entry in the header.
 *
 * The dialog is imported lazily, on the first activation, so the whole search
 * client and its index are never part of the initial bundle or the first paint.
 */
const SearchDialog = dynamic(() => import('./search/search-dialog'), { ssr: false })

/**
 * The search trigger, and it is icon-only at every width.
 *
 * **It used to carry the word "Search" from `sm` up, and that word is what pushed
 * the row past the viewport.** The row carries nine Section links, a wordmark and
 * three controls, and `e2e/header-fit.spec.ts` measures it: at the `lg`
 * threshold of 1024 the row's minimum content width was 1081 pixels with the
 * label and 1034 without it, and the word is 47 of those pixels plus the 8
 * between it and the icon. The wordmark folds to two lines rather than help,
 * because a folded wordmark is still 49 pixels wide and the overflow is on the
 * labels beside it.
 *
 * So the label goes, and what replaces it is nothing visible: an icon, a
 * `aria-label` that says what it does, and a square pill the same shape and size
 * as the two controls beside it. The three header controls now read as one row of
 * three round buttons, which is the reason a row of them looks like a set rather
 * than like two labelled fields with a button after them.
 *
 * **The other way to buy the same 55 pixels was `text-xs` on the Section links.**
 * That was rejected because it costs every reader at every width above 1024 to
 * fix a problem only the narrow end of one band has, and 12px navigation is below
 * the size this type scale uses for navigation anywhere else. A control that is
 * not a destination losing its word is a smaller cost than nine destinations
 * losing a point of size.
 */
export function SearchEntry() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

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
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
        className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
      >
        <Search aria-hidden className="size-4" />
      </button>

      {open ? <SearchDialog onClose={close} /> : null}
    </>
  )
}
