import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { FlatNav } from '@/lib/nav'

/** Previous and next links, taken from the flattened page tree. */
export function Pager({ flat, currentUrl }: { flat: FlatNav[]; currentUrl: string }) {
  const index = flat.findIndex((entry) => entry.url === currentUrl)
  if (index === -1) return null
  const previous = flat[index - 1]
  const next = flat[index + 1]

  return (
    <nav aria-label="Pagination" className="border-border mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
      {previous ? (
        <Link
          href={previous.url}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>
            <span className="block text-[10px] uppercase">Previous</span>
            <span className="text-foreground font-medium">{previous.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.url}
          className="text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-2 text-right text-sm transition-colors"
        >
          <span>
            <span className="block text-[10px] uppercase">Next</span>
            <span className="text-foreground font-medium">{next.title}</span>
          </span>
          <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </nav>
  )
}
