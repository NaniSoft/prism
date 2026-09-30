'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

/**
 * One page in a search index.
 *
 * The four fields a result is drawn from, and nothing else. A consumer's index is
 * a JSON array of these served from a static route, so the shape is a contract
 * between a build step Prism does not own and a dialog it does, and it is
 * declared here rather than inferred: an index that grew a field this Component
 * ignored would be a field no reader could be shown and no build would report.
 *
 * `description` and `content` are both optional because the two halves of a site
 * differ. A landing page has a standfirst and a body; a section index has a title
 * and a route and nothing else, and an index entry that had to invent an empty
 * string to satisfy a required field would be an index carrying a fact nobody
 * wrote.
 */
export type SearchIndexEntry = {
  /** A stable key for the entry. The route is the usual choice and needs no coordination. */
  id: string
  /** The result's own name, which is what the dialog puts on the first line. */
  title: string
  /** Where the result goes. */
  url: string
  /** One line of context, shown under the title when the index carries it. */
  description?: string
  /** The body text the query is matched against. */
  content?: string
  /** Where the result sits in the site's own hierarchy, shown as a trail. */
  breadcrumbs?: string[]
}

/**
 * Every sentence the dialog can say, as props.
 *
 * A Component ships no copy and no accessible name it did not receive, because a
 * hardcoded string here is a claim every consumer of the package inherits and the
 * corpus publishes as the design system's own voice. It is a prop per string
 * rather than one `messages` object with defaults, so that overriding any of them
 * is a decision a consumer makes visibly rather than a partial merge of a shipped
 * object.
 *
 * The two result labels are a pair rather than one label with a number appended,
 * and the reason is that this is the only place a count is spoken. English puts
 * the number first and inflects the noun; most other written languages inflect the
 * noun and put the number where their own grammar puts it. A Component that chose
 * between "1 result" and "3 results" for a consumer would be choosing a language's
 * word order on their behalf, and the two strings are the seam where that choice
 * belongs to the site.
 */
export type SearchDialogMessages = {
  /** The accessible name of the control that dismisses the dialog. */
  close: string
  /** What is shown while the index is being fetched. */
  loading: string
  /** What is shown when the index could not be fetched. */
  failed: string
  /** What is shown when the query matched nothing. */
  empty: string
  /** The count announced when exactly one result matched. */
  one: string
  /** The count announced when any other number of results matched. */
  other: string
}

/**
 * The props SearchDialog takes.
 *
 * `indexUrl` is where the index is fetched from and it is required, because a
 * dialog with nothing to search is a text field. It is a URL rather than an
 * index object for the reason the whole search design turns on: the index is
 * large, it is the same bytes on every page of a site, and a prop would serialize
 * it into the document of every route. Fetched on the first keystroke instead, it
 * is on the wire once and only for the reader who searched.
 */
export type SearchDialogProps = {
  /**
   * Where the JSON index is served from. Fetched once, when the dialog opens.
   *
   * Opening rather than the first keystroke, because a reader who has opened a
   * search box is already searching and the round trip is the difference between
   * results on the first character and results a moment after it. The dialog is
   * itself only mounted after a deliberate act, so "when the dialog opens" is
   * still well after the page has painted and never on a page nobody searched.
   */
  indexUrl: string
  /** The accessible name of the dialog, and the placeholder in its field. */
  label: string
  /** Every sentence the dialog can say. */
  messages: SearchDialogMessages
  /** The text shown before the reader has typed anything. */
  hint?: string
  /** Called when the reader dismisses the dialog, by Escape or by the backdrop. */
  onClose: () => void
  /** The most results to draw. Further matches are dropped rather than paged. */
  limit?: number
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * A search dialog over a static index, computed in the browser.
 *
 * It is a Component and not a Block because it is a control that appears in a
 * region rather than a region of a page, and because it is the one place in the
 * search design that touches the network: the index is fetched here rather than
 * passed in, so a site ships one index file and every page of that site reads it
 * from the same bytes. `SiteNavbar` composes it behind a trigger, and a consumer
 * that wants a different ranking can render this directly or pass its own control
 * through the navbar's `actions` slot.
 *
 * **The ranking is a scorer, not a search engine, and the difference is the
 * trade.** There is no stemming, no fuzzy matching and no typo tolerance: a query
 * token matches a document when the token is a substring of one of its fields.
 * That is a real downgrade against the inverted index a documentation site would
 * otherwise use, and it is deliberate, because the alternative is a Component in
 * a package whose entire value is that it depends on a design system and a token
 * pipeline and nothing else. A fuzzy engine is a large dependency whose ranking a
 * consumer cannot restyle, cannot audit against this package's gates and cannot
 * replace without forking the dialog. The scorer is thirty lines, its behaviour
 * is stated above, and a consumer whose content needs typo tolerance passes its
 * own control instead.
 *
 * **Every query token has to match somewhere.** That is AND rather than OR, and
 * it is why a two-word query narrows instead of widening: with OR, a reader
 * searching for "docs search" is shown every page that mentions either word,
 * which on a documentation site is most of them, and the list stops being a
 * ranking and becomes a filter they have to work through themselves.
 *
 * The weights are per field and stated rather than tuned: a match in a title is
 * worth more than one in a body, and a match at the start of a title is worth more
 * than one at its end, because a reader who types the first word of a page's name
 * is usually right about which page they meant. `FIELD_WEIGHTS` is the whole of
 * the ranking and is a named constant so a reader can see the numbers rather than
 * infer them.
 *
 * The field is focused on mount and Escape closes, and the backdrop closes, so
 * every exit is a control rather than a gesture. The list is marked as a list of
 * results and the count is announced through a live region, so a screen reader
 * user learns that a search ran rather than hearing the list change under them.
 */
export function SearchDialog({
  indexUrl,
  label,
  messages,
  hint,
  onClose,
  limit = 12,
  className,
}: SearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<readonly SearchIndexEntry[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  /**
   * The index, fetched once per dialog.
   *
   * The dialog is mounted only after a reader asks for search, so this runs after
   * a deliberate act rather than on every page load, and the result is held for
   * the life of the mount. A second fetch would be a second download of the same
   * bytes for a reader who reopened the dialog, so `entries` is the cache and the
   * `null` is what "not fetched yet" means.
   *
   * A failed fetch is a state rather than a throw. A reader whose network dropped
   * is told the search is unavailable and still has the close control, which is
   * the whole of what can be done here; an unhandled rejection would take the
   * dialog's event handlers with it and leave a panel with no way out.
   */
  useEffect(() => {
    if (entries !== null || failed) return
    let live = true
    fetch(indexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`search index responded ${response.status}`)
        return response.json() as Promise<SearchIndexEntry[]>
      })
      .then((value) => {
        if (live) setEntries(Array.isArray(value) ? value : [])
      })
      .catch(() => {
        if (live) setFailed(true)
      })
    return () => {
      live = false
    }
  }, [indexUrl, entries, failed])

  const results = useMemo(() => rank(entries, query, limit), [entries, query, limit])

  const typed = query.trim().length > 0
  const status = (() => {
    if (!typed) return hint ?? null
    if (failed) return messages.failed
    if (entries === null) return messages.loading
    if (results.length === 0) return messages.empty
    return null
  })()

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="bg-foreground/40 fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        className={
          'border-border bg-popover text-popover-foreground flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border shadow-lg ' +
          (className ?? '')
        }
      >
        <div className="border-border flex items-center gap-2 border-b px-3">
          <Search aria-hidden className="text-muted-foreground size-4 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={label}
            aria-label={label}
            className="text-foreground h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={messages.close}
            className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring rounded-md p-1 transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {/*
            The count is a live region and it is polite rather than assertive,
            because a search is a request the reader made and the answer is not
            urgent. Announcing on every keystroke would interrupt the reader
            mid-word, which is the failure an assertive region causes on exactly
            the interaction that produces the most updates.
          */}
          {/*
            The count is announced, not just the noun. A live region reading only
            "results" tells a screen reader user that something changed and nothing
            about what, and a region reading only a bare number tells them a
            quantity they have no unit for. The number and the noun are two elements
            inside one region so they are announced together rather than as two
            updates.

            The number comes first because that is the word order of the language
            this package's own site is written in, and it is stated here rather than
            left to be discovered: it is the one place the Component fixes an order
            rather than passing a whole sentence. A site whose language puts the
            noun first renders its own dialog rather than inheriting this one, and
            the ranking it would need is this file's `rank`, which is why that is a
            named function rather than a closure over the component.
          */}
          <p aria-live="polite" className="sr-only">
            {typed ? (
              <>
                <span>{results.length}</span>{' '}
                <span>{results.length === 1 ? messages.one : messages.other}</span>
              </>
            ) : null}
          </p>

          {status ? <p className="text-muted-foreground px-3 py-6 text-sm">{status}</p> : null}

          <ul className="flex flex-col">
            {results.map((result) => (
              <li key={result.id}>
                <a
                  href={result.url}
                  onClick={onClose}
                  className="hover:bg-accent focus-visible:border-ring focus-visible:ring-ring flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  <span className="text-foreground text-sm font-medium">{result.title}</span>
                  {result.description ? (
                    <span className="text-muted-foreground line-clamp-2 text-xs">
                      {result.description}
                    </span>
                  ) : null}
                  {result.breadcrumbs?.length ? (
                    <span className="text-muted-foreground text-xs">
                      {result.breadcrumbs.join(' / ')}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * What a match in each field is worth, and the whole of the ranking.
 *
 * A title match outranks a description match, which outranks a body match, because
 * a page's name is the claim it makes about itself and its body is the evidence.
 * The route carries a small weight of its own because a site whose routes are
 * words, which is most of them, is searchable by them.
 */
const FIELD_WEIGHTS = { title: 40, url: 15, description: 10, content: 4 } as const

/** What a match at the very start of a field adds on top of its weight. */
const PREFIX_BONUS = 20

function fold(value: string | undefined): string {
  return (value ?? '').toLowerCase()
}

/**
 * One entry's score for one query, or `null` when a token matched nothing.
 *
 * `null` rather than zero is what makes the conjunction work: a caller summing
 * per-token scores cannot tell "matched with a low score" from "did not match",
 * so the miss is returned as its own value and the entry is dropped there.
 */
function scoreEntry(entry: SearchIndexEntry, tokens: readonly string[]): number | null {
  const fields = {
    title: fold(entry.title),
    url: fold(entry.url),
    description: fold(entry.description),
    content: fold(entry.content),
  }

  let total = 0
  for (const token of tokens) {
    let best = 0
    for (const [field, value] of Object.entries(fields) as [
      keyof typeof FIELD_WEIGHTS,
      string,
    ][]) {
      const at = value.indexOf(token)
      if (at === -1) continue
      const weight = FIELD_WEIGHTS[field]
      best = Math.max(best, at === 0 ? weight + PREFIX_BONUS : weight)
    }
    if (best === 0) return null
    total += best
  }
  return total
}

/**
 * The index, narrowed by the query and cut to `limit`.
 *
 * The sort is by score and then by title, so two entries that match equally are
 * in a stable order rather than in the order the index happened to be written.
 * Without the second key a reordering of the build's page list would silently
 * reorder equal-scoring results, which is the kind of change no test catches and
 * every reader notices.
 */
function rank(
  entries: readonly SearchIndexEntry[] | null,
  query: string,
  limit: number,
): SearchIndexEntry[] {
  const tokens = fold(query).split(/\s+/).filter(Boolean)
  if (entries === null || tokens.length === 0) return []

  const scored: { entry: SearchIndexEntry; score: number }[] = []
  for (const entry of entries) {
    const score = scoreEntry(entry, tokens)
    if (score !== null) scored.push({ entry, score })
  }

  scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
  return scored.slice(0, limit).map((row) => row.entry)
}

export default SearchDialog
