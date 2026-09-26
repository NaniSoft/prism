'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useDocsSearch } from 'fumadocs-core/search/client'
import { staticClient } from 'fumadocs-core/search/client/orama-static'
import { Search, X } from 'lucide-react'

/**
 * Static search, computed in the browser.
 *
 * `staticClient` downloads the whole index from `/api/search` on the first
 * search and keeps it in memory. No `fumadocs-ui`, no Radix and no second
 * stylesheet are involved: this is the headless client and our own dialog.
 */
const client = staticClient({ from: '/api/search' })

function stripMarks(value: string): string {
  return value.replace(/<\/?mark>/g, '')
}

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { search, setSearch, query } = useDocsSearch({ client, delayMs: 120 })

  useEffect(() => {
    inputRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const results = Array.isArray(query.data) ? query.data : []
  const status =
    search.trim().length === 0
      ? 'Type to search the guides, foundations, content and every catalogue item.'
      : query.isLoading
        ? 'Searching...'
        : results.length === 0
          ? 'No matches.'
          : null

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-4 pt-24"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        onClick={(event) => event.stopPropagation()}
        className="border-border bg-popover flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border shadow-lg"
      >
        <div className="border-border flex items-center gap-2 border-b px-3">
          <Search aria-hidden className="text-muted-foreground size-4 shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search documentation"
            className="h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {status ? <p className="text-muted-foreground px-3 py-6 text-sm">{status}</p> : null}
          <ul className="flex flex-col">
            {results.map((result) => (
              <li key={`${result.id}-${result.url}`}>
                <Link
                  href={result.url}
                  onClick={onClose}
                  className="hover:bg-accent flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="text-foreground text-sm font-medium">
                    {stripMarks(String(result.content))}
                  </span>
                  {result.breadcrumbs?.length ? (
                    <span className="text-muted-foreground text-xs">
                      {result.breadcrumbs.map((crumb) => stripMarks(String(crumb))).join(' / ')}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
