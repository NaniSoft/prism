/**
 * The query the preview document reads, in one place.
 *
 * **Three parameters, one per thing a reader can change about a preview.** `pack`
 * and `mode` are the two attributes `themeAttributes()` writes, and `w` is the width
 * a reader chose for a Block or a Page. A fourth parameter would be a fourth way
 * to say something the toolbar already says, and a query the document and the
 * toolbar disagreed about is a preview showing one thing and its toolbar claiming
 * another.
 *
 * They are parsed and validated in one function because all three arrive from an
 * address a reader can edit and a crawler can find. `readParams` is total: an
 * absent, malformed or unknown value resolves to the site's own defaults rather
 * than throwing, so a hand-typed URL renders a preview instead of a 404.
 *
 * **The defaults are the site's defaults, read from `lib/bar`, and not from the
 * token package.** The pack is Prism's own `default` because this site publishes
 * no hue of its own, and the mode is light because the site's first paint is
 * light. A preview that opened in a different pair than the page around it would
 * be a second answer to a question the site answers once in `layout.tsx`.
 */
import { PACKS } from '@nanisoft/prism-ui/theming'

import { DEFAULT_MODE, DEFAULT_PACK } from './bar'

/** A resolution the reader may hold a Block or a Page at, in CSS pixels. */
export type PreviewWidth = 'auto' | '390' | '834' | '1280'

/**
 * The four widths the toolbar offers, in the order a reader meets them.
 *
 * `auto` first because it is the state the reader is already in when the page
 * loads: the frame's own width. The three device classes follow, narrowest first,
 * because a reader who reaches for a resolution control is usually answering "what
 * does this do on a phone", and the phone is the question with the most wrong
 * answers in a component library.
 *
 * **834 rather than 768, and 1280 rather than 1440.** A tablet sitting exactly on
 * a Tailwind breakpoint makes the resolution read as a breakpoint switch, and a
 * desktop at 1440 does not fit the documentation column without scaling far enough
 * to make the text hard to read. These are device classes, so they are device
 * widths, and a reader comparing them is comparing hardware rather than reading a
 * scale.
 */
export const PREVIEW_WIDTHS: readonly PreviewWidth[] = ['auto', '390', '834', '1280']

/** The one cast that turns the declared list into a checked set. */
const WIDTH_SET = new Set<string>(PREVIEW_WIDTHS)

/** What the preview document renders in, once a query has been read. */
export type PreviewParams = {
  /** The pack id, narrowed against the published `PACKS` set. */
  pack: string
  /** The mode, one of Prism's two. */
  mode: 'light' | 'dark'
  /** The width a reader chose, `auto` for the frame's own. */
  width: PreviewWidth
}

/**
 * Reads the three parameters out of a search string.
 *
 * A `URLSearchParams` over a string rather than a `URL`, because the caller has
 * one in hand and no base to resolve against: the preview document reads
 * `location.search`, and the toolbar holds the pair it is about to put in an
 * address.
 *
 * Every branch falls back rather than throwing. The `pack` branch is the one worth
 * reading twice: the value is checked against the published `PACKS` set, so a
 * retired pack id in an old bookmark renders the base pack instead of an element
 * carrying an attribute no emitted rule matches. That is the same whole fall-through
 * `resolveTheme` performs, and for the same reason.
 */
export function readParams(search: string): PreviewParams {
  const query = new URLSearchParams(search)

  const pack = query.get('pack')
  const mode = query.get('mode')
  const width = query.get('w')

  return {
    pack: pack !== null && (PACKS as readonly string[]).includes(pack) ? pack : DEFAULT_PACK,
    mode: mode === 'dark' ? 'dark' : DEFAULT_MODE,
    width: width !== null && WIDTH_SET.has(width) ? (width as PreviewWidth) : 'auto',
  }
}

/**
 * The address a preview document is loaded at.
 *
 * Built here rather than at each `iframe` call site because the toolbar and the
 * share link have to produce one string, and two templates for one address is the
 * shape that drifts. The pack is encoded because the value comes from a set of six
 * literals today and the moment a consumer adds a pack whose id carries a
 * character the address has to carry too, the failure would be a silently wrong
 * document rather than an exception.
 */
export function previewHref(slug: string, params: PreviewParams): string {
  return `/preview/${encodeURIComponent(slug)}?pack=${encodeURIComponent(params.pack)}&mode=${params.mode}&w=${params.width}`
}