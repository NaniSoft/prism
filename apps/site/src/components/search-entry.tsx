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
        className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
      >
        <Search aria-hidden className="size-4" />
        <span className="hidden sm:inline">Search</span>
      </button>

      {open ? <SearchDialog onClose={close} /> : null}
    </>
  )
}
