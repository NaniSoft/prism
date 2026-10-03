'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

import { Dialog, DialogContent } from './dialog'

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
  /**
   * Called when the reader has finished with the dialog: by Escape, by the
   * backdrop, by the close control, or by choosing a result.
   *
   * **The caller unmounts, and it is called once the dialog has actually left
   * rather than at the moment it was asked to.** Those are different moments and
   * the later one is the one the caller wants, because the dialog owns the
   * reader's focus while it is closing and removing it out from under its own
   * exit is what strands a keyboard reader on `<body>`. Render this Component
   * only when the reader is searching, and unmount it from here.
   */
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
 * **It is `Dialog`, and the composition is the point rather than an
 * implementation detail.** A modal claims four things at once: that the page
 * behind it is inert, that the keyboard cannot leave, that the page under it does
 * not scroll, and that focus comes back to the control that opened it. Hand-rolled,
 * those four are four pieces of code, and the version this Component used to carry
 * declared the first with `aria-modal` while implementing none of the others: the
 * page behind was reachable by Tab, focus fell to `<body>` when the dialog
 * unmounted, and the panel scrolled with the document and could be clipped by an
 * ancestor. `Dialog` already had all four, and this Component now takes the trap,
 * the portal, the scroll lock, the outside-press dismissal and the overlay from it,
 * so the package holds one modal rather than one and a claim. What is left here is
 * the part that is specific to search: the fetch, the scorer, the field, the list
 * and the count.
 *
 * **The field is focused on open, and it says why it asks rather than taking the
 * default.** `Dialog` focuses the panel's first tabbable element, which is the
 * field here, so the default would be right by accident; it is named anyway because
 * the reason it is right is a fact about search and not about dialogs: a reader who
 * opened a search box opened it to type into it, and the field is the only control
 * in the panel that needs a keyboard.
 *
 * **Escape is answered by the modal rather than by a document-level listener.**
 * A listener on `document` answers the key whether or not the dialog is the thing
 * the reader is looking at, which is the same failure `Toast` records about
 * floating surfaces that listen globally.
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
 * The list is marked as a list of results and the count is announced through a
 * live region, so a screen reader user learns that a search ran rather than
 * hearing the list change under them.
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
  // The dialog is mounted only once a reader has asked for search, so it opens on
  // its first render and this is what the modal is controlled by. It is local
  // rather than derived from `onClose` because the caller unmounts and never
  // renders a closed SearchDialog: the state here is what lets the modal run one
  // exit, for every reason the reader left, before the handoff.
  const [open, setOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<readonly SearchIndexEntry[] | null>(null)
  const [failed, setFailed] = useState(false)

  /**
   * The one exit, for every reason the reader leaves.
   *
   * Escape and the backdrop arrive through `Dialog`'s own `onOpenChange`; the
   * close control and a chosen result arrive here. Both write the same state, so
   * there is one leave rather than one per reason, and the caller's unmount is
   * one call at the end of it.
   */
  const dismiss = useCallback(() => setOpen(false), [])

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
    <Dialog
      open={open}
      onOpenChange={setOpen}
      // The handoff is on the way out rather than on the way in, for two reasons
      // that are the same reason. The modal restores focus as it closes, and a
      // caller that unmounted the dialog one frame earlier would take that focus
      // return with it and drop the reader on `<body>`. And the exit is the
      // caller's cue that the dialog is finished, so handing over at the end of
      // it is what makes `onClose` mean "it is gone" rather than "it is going".
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent
        initialFocus={inputRef}
        // The panel draws its own close control, in its own field row, named with
        // `messages.close`. `Dialog`'s is a fixed word in a fixed corner, and two
        // close controls in one modal is one more control than the reader needs.
        showCloseButton={false}
        aria-label={label}
        // No elevation here, and the absence is the point. This Component used to
        // carry `shadow-lg` over the top of `DialogContent`'s own `shadow-md`, and
        // the override was invisible as an improvement and permanent as a second
        // answer: `shadow-lg` is not an authored step, so it resolved against
        // Tailwind's stock theme rather than against the token source, and a
        // retune of the elevation scale would have moved every other lifted
        // surface in this package and left this panel exactly where it was. The
        // panel is the one lifted element over a modal scrim, which is what
        // `--shadow-md` is for, and `DialogContent` already draws it.
        className={
          'border-border bg-popover text-popover-foreground flex max-h-[70vh] w-full max-w-overlay-palette flex-col overflow-hidden rounded-xl p-0 gap-0 ' +
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
            // The ring is at full strength, and it is drawn at all because this is
            // the control focus lands in and `outline-none` is what removed the
            // browser's indicator from it. A search field with no visible focus is
            // a search field a keyboard reader cannot say they are inside.
            //
            // `text-base` then `md:text-sm`, which is the pair every other field in
            // this package carries and the reason is a platform one rather than a
            // visual one: iOS Safari zooms the viewport on a focused input whose
            // computed font size is under 16 pixels, and it does not zoom back out,
            // so a reader who opened the palette on a phone was left looking at a
            // magnified page they could not leave. A rem step also tracks a reader
            // who has raised their browser's default size, which a pixel value does
            // not.
            className="text-foreground h-12 flex-1 bg-transparent text-base outline-none focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px] md:text-sm"
          />
          <button
            type="button"
            onClick={dismiss}
            aria-label={messages.close}
            className={
              // 24px for a mouse and a trackpad, `p-1` around a 16px icon, and the
              // 44px coarse-pointer floor as a step rather than a band. A band here
              // would hang off the top and bottom of the field row and over the result
              // list under it, where a step does not: the row is 48px tall and the
              // button grows to 44 inside it, so nothing moves and no list row is
              // stolen. See `DialogContent`'s own close control, which is in a corner
              // and says the other half of why the two are not the same shape.
              'text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring pointer-coarse:size-11 rounded-md p-1 transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
            }
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
                  onClick={dismiss}
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
      </DialogContent>
    </Dialog>
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
