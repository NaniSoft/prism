'use client'

import { Code2, Eye } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { CopyButton } from './copy-button'
import { ShowcaseToolbar } from './showcase-toolbar'
import { previewHref, readParams, type PreviewParams, type PreviewWidth } from '@/lib/preview'
import {
  AUTO_HEIGHT_CEILING,
  AUTO_HEIGHT_FLOOR,
  SHOWCASE_HEIGHTS,
  takesResolution,
} from '@/lib/showcase'
import type { CatalogKind } from '@nanisoft/prism-ui/catalog'
import type { ReactNode } from 'react'

type View = 'preview' | 'code'

/**
 * An Item's showcase: a live preview of its Demo in any pack, in either mode, at a
 * chosen screen width, and the source that produced it.
 *
 * **The preview is a document in an `<iframe>` and not a subtree of this page,
 * because two of the four things a reader asks of a preview cannot be answered
 * without one.** A `data-pack` boundary wears its ancestor's mode, so a preview
 * scoped to a subtree can be forced dark on a light page and can never be forced
 * light on a dark one; and a 390-wide box inside a 1440-wide viewport still resolves
 * every `min-width` media query against 1440, so the mobile layout a reader selects
 * would be a layout that does not exist. Giving the preview its own document solves
 * both, and it uses the arrangement the token build already publishes: that document
 * carries `data-pack` and `.dark` on its own `<html>`, the same two attributes this
 * site sets on itself.
 *
 * **So the preview loads a different document when the pack, the mode or the width
 * changes, and that is a navigation inside the frame rather than a re-render of
 * it.** The address is built by `previewHref` from the same `readParams` the
 * preview document parses, so the URL a reader could copy out of the frame
 * describes exactly what is inside it.
 *
 * **The pack, the mode and the width are held here and stored nowhere.** A reader
 * who holds one preview in Mint and opens the next Item gets that Item in Base,
 * because the pack was a question about this Item rather than a preference about
 * the site, and a preview that repainted the reader's whole session on the way past
 * would be a different tool. The one thing remembered is which view was last open,
 * for the session only: a reader comparing six Items' source is in the code view,
 * and arriving in the preview view every time taxes the one comparison they came
 * to make.
 */
export function SiteShowcase({
  slug,
  name,
  source,
  kind,
  codePanel,
}: {
  /** The Item's slug, which is the preview document's address. */
  slug: string
  /** The Item's name, used as the frame's accessible name. */
  name: string
  /** The Demo's file, verbatim. What the copy control puts on the clipboard. */
  source: string
  /** The Item's Kind, which decides whether a resolution control is offered. */
  kind: CatalogKind
  /** The code panel, rendered on the server and handed in whole. */
  codePanel: ReactNode
}) {
  /*
   * The stored theme, read in an effect and applied before the first paint.
   *
   * It cannot be read during render, because the attributes were written by a
   * blocking script before React existed and the server rendered this page without
   * them. Setting state from an effect is what the lint rule here objects to, and
   * the objection is right for a state that cascades a render; this one is read once
   * on mount, corrects a value the server could not know, and is the same division
   * of labour the site itself uses between its rendered baseline and its boot
   * script. The alternative, reading it in a layout effect and rendering nothing
   * until it is known, would leave a reader with no preview for a frame.
   */
  const [params, setParams] = useState<PreviewParams>(() => readParams(''))
  const [measured, setMeasured] = useState<number | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    const stored = readParams(
      `?pack=${root.getAttribute('data-pack') ?? ''}&mode=${
        root.classList.contains('dark') ? 'dark' : ''
      }`,
    )
    /*
     * Guarded, which is what keeps it out of the lint rule's reach, and the guard
     * is the point rather than a way around the rule: the reader's stored pair is
     * almost always the default pair, and a setState that fires on every mount to
     * say what the first render already said is the cascading render the rule warns
     * about. Only a genuine disagreement is worth a render, and the layout effect
     * runs before the browser paints, so the correction lands in the frame the
     * reader first sees rather than one later.
     */
    if (stored.pack !== params.pack || stored.mode !== params.mode) setParams(stored)
    // Once, because the read is of the document element rather than of anything
    // this component owns, and the document is the site rather than the preview.
  }, [])

  /*
   * The view is read as an external store rather than copied into state.
   *
   * `sessionStorage` is not React's and the value in it outlives this component, so
   * the honest shape is `useSyncExternalStore`: it names the server's answer
   * explicitly instead of letting a mount-time effect imply one, which is what keeps
   * a reader who was last in the code view from hydrating into the preview view and
   * then being corrected a render later.
   */
  const view = useSyncExternalStore(subscribeView, readView, serverView)
  const choose = useCallback((next: View) => {
    try {
      sessionStorage.setItem(VIEW_KEY, next)
    } catch {
      /* The tab still switches; only the memory of it is lost. */
    }
    window.dispatchEvent(new Event(VIEW_EVENT))
  }, [])

  const setPack = useCallback((pack: string) => setParams((current) => ({ ...current, pack })), [])
  const setMode = useCallback(
    (mode: 'light' | 'dark') => setParams((current) => ({ ...current, mode })),
    [],
  )
  const setWidth = useCallback(
    (width: PreviewWidth) => setParams((current) => ({ ...current, width })),
    [],
  )

  const href = previewHref(slug, params)
  const declared = SHOWCASE_HEIGHTS[params.width]

  /*
   * The box around the frame, and the one number that keeps the two axes honest.
   *
   * `Auto` is the frame's own width, so `deviceWidth` is the column the reader is
   * in and the scale is 1: a Block held at the width of the column it is being
   * read in is the arrangement a consumer would get, so nothing is scaled and the
   * document resolves its media queries against the column, which is correct.
   *
   * A named width is a device, and a device is wider than this column at 1280 and
   * about the same width at 390. `scale` is the column divided by the device, never
   * above 1, because scaling a phone up to fill a 580-pixel column would report a
   * 390-wide layout at a size no phone has and would make the type unreadable.
   *
   * The column is measured rather than assumed because it is not a token: it is
   * the article's width after the sidebar and the table of contents have taken
   * theirs, and it changes at `lg` and again on a phone.
   */
  const [column, setColumn] = useState(0)
  const deviceWidth = declared === null ? column || undefined : Number(params.width)
  const scale =
    declared === null || deviceWidth === undefined || column === 0
      ? 1
      : Math.min(1, column / deviceWidth)
  const deviceHeight = declared === null ? measured ?? AUTO_HEIGHT_FLOOR : declared

  /*
   * The frame's own height, and the reason only `auto` is measured.
   *
   * A device width has a device height, declared in `showcase.ts`, and the iframe
   * is told it. `auto` has no height of its own so it takes the preview's: the
   * frame is same-origin, so it reads the loaded document's scroll height and grows
   * to fit, capped so a Page taller than the ceiling scrolls inside the frame
   * rather than pushing the rest of the article off the screen.
   */
  const onLoad = useCallback(() => {
    const inner = frame.current?.contentDocument
    if (!frame.current || !inner || declared !== null) return
    const content = Math.max(
      inner.documentElement.scrollHeight,
      inner.body?.scrollHeight ?? 0,
    )
    setMeasured(Math.min(Math.max(content, AUTO_HEIGHT_FLOOR), AUTO_HEIGHT_CEILING))
  }, [declared])

  /*
   * Two observers, and each earns its place.
   *
   * The column's own width is read from the frame's parent, because a
   * `transform: scale()` does not change an element's own box: reading the scaled
   * element's width would feed the scale back into itself and the preview would
   * shrink on every navigation.
   *
   * The loaded document is observed separately because a Demo whose content
   * reflows inside a document this component does not render raises no event here,
   * so a height read once at load would go stale the moment a reader opened a
   * disclosure inside it. The observer is torn down on every navigation of the
   * frame, which is what stops it outliving the document it was watching.
   */
  useEffect(() => {
    const element = frame.current?.parentElement
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setColumn(Math.round(element.clientWidth)))
    observer.observe(element)
    setColumn(Math.round(element.clientWidth))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (declared !== null) return
    const root = frame.current?.contentDocument?.documentElement
    if (!root || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(onLoad)
    observer.observe(root)
    return () => observer.disconnect()
  }, [href, declared, onLoad])

return (
    /*
     * `rounded-xl` and a border, but no `overflow-hidden`, because the pack list
     * is a panel that opens over the preview beneath it and a clipping ancestor
     * would cut it off at the frame's edge. The rounded corners are drawn where
     * they are visible instead: the bar rounds its own top, the stage rounds its
     * own bottom, and each clips its own content. That is two classes rather than
     * one and it is the difference between a working chooser and a chooser that
     * disappears two thirds of the way down.
     */
    <figure
      /*
       * `showcase` is the one class in the site's CSS that reaches into `.prose`
       * to let a child out of the measure. It is named rather than applied
       * conditionally in the component so that the opt-out is visible from the
       * markup of any page that uses it, and so that a future figure with the
       * same need joins a named list rather than a repeated escape.
       */
      className="showcase border-border bg-card rounded-xl border"
    >
      {/*
        One bar, not two. An earlier arrangement put the rendering controls above
        the view pair and the copy control beside it, and the result read as one
        toolbar broken across two lines: a reader could not tell which row
        changed the preview and which row changed what the preview was of. Every
        control here is about the same object, so they share a row and it wraps
        rather than scrolls, because a horizontal scrollbar across the top of a
        preview is a worse answer on a phone than the second row.
      */}
      <div className="border-border bg-card relative flex flex-wrap items-center gap-x-2 gap-y-2 rounded-t-xl border-b px-2 py-1.5">
        <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
          <ViewTab
            id="preview"
            view={view}
            onChoose={choose}
            icon={<Eye aria-hidden className="size-3.5" />}
            label="Preview"
          />
          <ViewTab
            id="code"
            view={view}
            onChoose={choose}
            icon={<Code2 aria-hidden className="size-3.5" />}
            label="Code"
          />
        </div>

        <ShowcaseToolbar
          pack={params.pack}
          onPack={setPack}
          mode={params.mode}
          onMode={setMode}
          width={params.width}
          onWidth={setWidth}
          showResolution={takesResolution(kind)}
        />

        {/*
          The copy control sits above both views rather than inside the code one,
          because "what is in this preview" is asked while looking at the preview.
          The bytes are the Demo's file either way.

          `ms-auto` keeps it at the right edge on a row that fits and lets it fall
          to the end of a wrapped row on a phone, where a right-aligned control in a
          row of its own is a label with a button beside it and nothing else.
        */}
        <span className="ms-auto">
          <CopyButton value={source} label="Copy source" />
        </span>
      </div>

      {/*
        The stage, and the one place the sticky bar and the frame touch.
        `scroll-margin` is set to the bar's height so a reader who jumps to this
        heading lands the toolbar below the bar rather than behind it: the bar is
        `sticky top-0` and the heading scrolls to the very top of the viewport,
        which is exactly where the bar is.
      */}
      {view === 'preview' ? (
        <div
          className="bg-background scroll-mt-20 overflow-hidden rounded-b-xl"
          data-preview-stage
        >
          <iframe
            ref={frame}
            /*
             * The name is the Item's own, because this is a document and a reader
             * arriving by keyboard needs to know which one before entering it. The
             * title is written here rather than derived from the toolbar's labels
             * so the two can never disagree about what is inside.
             */
            title={`${name} preview`}
            src={href}
            /*
             * A device width is a device width, and the column it is shown in is
             * narrower than a 1280-wide desktop. The frame therefore scales rather
             * than overflows: the document still lays out at 1280 and resolves its
             * `min-width` media queries against 1280, which is the whole reason the
             * preview is a document, and the reader sees the result at a size that
             * fits. Scaling is a property of the box, not of its content, so the
             * resolution inside is untouched.
             *
             * The scale is computed from the column's own width rather than from a
             * breakpoint, because the column narrows when the table of contents
             * disappears at `lg` and again on a phone, and a preview that reflowed
             * at those widths while claiming to show a desktop would be reporting a
             * device that changed.
             */
            style={
              scale === 1 ? undefined : { width: `${deviceWidth}px`, transform: `scale(${scale})` }
            }
            height={Math.round(deviceHeight * scale)}
            onLoad={onLoad}
            loading="lazy"
            className="block w-full origin-top-left border-0"
          />
        </div>
      ) : (
        /*
         * One padding step at every width, and the reason is the utility-cascade
         * gate's rather than a preference. This site and the library are two
         * Tailwind builds sharing one `utilities` layer, so the library's
         * unconditional `.p-3` outranks this build's `.sm:p-4` and the step would
         * silently never apply. A panel whose inset grows with the viewport is a
         * nicer idea than one whose inset is a token in both directions.
         */
        <div className="bg-background overflow-hidden rounded-b-xl p-4">{codePanel}</div>
      )}
    </figure>
  )
}

/** Where the last open view is remembered, for this session only. */
const VIEW_KEY = 'prism-showcase-view'

/**
 * The event that says the remembered view changed.
 *
 * A custom event rather than the `storage` event alone, because `storage` fires in
 * other tabs and never in the one that wrote: a reader who chooses Code would move
 * this tab's store and hear nothing back, so the tab that made the choice needs its
 * own signal. Both are listened for, and the `storage` one is kept because a second
 * tab on the same page is a real reader and not a hypothetical one.
 */
const VIEW_EVENT = 'prism-showcase-view-change'

/** The remembered view, or the preview view when the store is blocked or empty. */
function readView(): View {
  try {
    const stored = sessionStorage.getItem(VIEW_KEY)
    return stored === 'code' ? 'code' : 'preview'
  } catch {
    return 'preview'
  }
}

/** What the server renders, and the answer hydration starts from. */
function serverView(): View {
  return 'preview'
}

/**
 * `subscribe` for the view store.
 *
 * Declared at module scope so its identity is stable across renders: a new function
 * each render would tear the subscription down and build it up again on every one.
 */
function subscribeView(onChange: () => void) {
  window.addEventListener(VIEW_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(VIEW_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/**
 * `useLayoutEffect` that does not warn when there is no DOM to lay out.
 *
 * The effect has to run before the first paint, or the reader sees this site's
 * default pack in the frame for a frame before it is corrected. React warns about
 * the hook in a Server Component render, and this component is rendered by one.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * One member of the view pair.
 *
 * A native button with `aria-pressed` rather than a radio, because the pair is a
 * disclosure and not a choice between several values: both views exist in this
 * component and the control says which is showing.
 */
function ViewTab({
  id,
  view,
  onChoose,
  icon,
  label,
}: {
  id: View
  view: View
  onChoose: (view: View) => void
  icon: ReactNode
  label: string
}) {
  const active = view === id
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onChoose(id)}
      className={`flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors ${
        active
          ? 'bg-background text-foreground shadow-xs'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}