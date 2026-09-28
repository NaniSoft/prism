/**
 * The Prism theming vocabulary: pack and mode are two independent axes.
 *
 * `data-pack` selects the palette and `.dark` selects the mode; neither implies
 * the other (ticket 07). `default` is the selectable neutral pack id, and its
 * markup is the absence of the attribute. Everything here is pure and
 * isomorphic so a Server Component can render the declarative form without a
 * client runtime. There is no theme factory and no override object: the pack
 * and mode are the whole API.
 */

export const PACKS = ['default', 'blush', 'mint', 'lavender', 'sky', 'peach'] as const
export type PackId = (typeof PACKS)[number]

export const MODES = ['light', 'dark'] as const
export type Mode = (typeof MODES)[number]

export const PACK_ATTRIBUTE = 'data-pack'
export const DEFAULT_STORAGE_KEY = 'prism-theme'

/**
 * The root attribute that records where the active pack and mode came from.
 *
 * This is a contract, not markup. The boot script is its only writer, and the
 * provider never touches it, because two writers would make the recorded origin
 * a race rather than a record. The value is always one of `THEME_ORIGINS` and is
 * written on every path the script reaches, including a stored value that could
 * not be parsed: an absent attribute cannot be told from an unread one, and a
 * theme that fell through to the default is exactly the case a reader needs to
 * see named.
 *
 * It is not `data-theme`, which `MIGRATION.md` retires. It carries the
 * provenance of a resolution, never a pack.
 */
export const THEME_ORIGIN_ATTRIBUTE = 'data-theme-origin'

/**
 * The closed set the boot script may write to `THEME_ORIGIN_ATTRIBUTE`.
 *
 *   - `stored`   a valid `{ pack, mode }` pair was in the key this line writes.
 *   - `legacy`   the key was empty and a key this line no longer writes held a
 *                recoverable mode, so that decision was taken and carried over.
 *   - `unparsed` the key held a value that is not a pair. The theme fell
 *                through whole, and the value was left in place, because it is
 *                the only record that this reader ever chose anything.
 *   - `document` the key was empty and the root element's own attributes
 *                supplied the theme.
 *   - `default`  neither did, so the consumer's own defaults apply.
 *
 * `legacy` and `unparsed` are why the set is five and not three: a
 * three-value set records that the theme came from somewhere but cannot
 * distinguish "never chose" from "chose, and the value no longer parses", which
 * is the one distinction a storage migration has to be retired against.
 */
export const THEME_ORIGINS = ['stored', 'legacy', 'document', 'default', 'unparsed'] as const
export type ThemeOrigin = (typeof THEME_ORIGINS)[number]

/**
 * Keys earlier lines of this package wrote and this line does not.
 *
 * `prism-theme-mode` was the shared chrome key: the mode setter wrote it, and
 * only the mode setter, as a bare `'light'` or `'dark'` string, because the pack
 * was fixed per site and the mode was the one choice that travelled across
 * sites. The value is not a `{ pack, mode }` pair and can never collide with one
 * this line writes, so reading it costs nothing and recovers a real decision.
 *
 * The list is the migration's own expiry. Every key in it is a clause the boot
 * script carries and prices, and the migration is retired by deleting the last
 * entry: the clause's live population is then empty, the gate reports it, and
 * the byte ceiling's generation allowance falls to zero with it. Nothing here
 * is bounded by a date or a version number.
 */
export const LEGACY_MODE_STORAGE_KEYS = ['prism-theme-mode'] as const

function isPack(value: unknown): value is PackId {
  return typeof value === 'string' && (PACKS as readonly string[]).includes(value)
}

function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value)
}

/**
 * Reads a persisted `{ pack, mode }` object.
 *
 * Returns `null` for anything that is not a valid pair, so a corrupt or
 * superseded stored value falls back to the defaults rather than to a pack that
 * does not exist. Parsing is deliberately strict: the store is owned by
 * `PrismProvider`, which always writes this exact shape.
 */
export function parseStoredTheme(raw: string | null): { pack: PackId; mode: Mode } | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) return null

  const { pack, mode } = parsed as { pack?: unknown; mode?: unknown }
  if (!isPack(pack) || !isMode(mode)) return null

  return { pack, mode }
}

/**
 * What `resolveTheme` was given, and nothing else.
 *
 * The three readers are all the same question asked of different state: what
 * does this reader believe, what has the server rendered, and what is the
 * consumer's own default. `stored` and `legacy` are raw strings exactly as the
 * store holds them, so a corrupt value is visible to the rule rather than
 * normalised away by a caller.
 */
export type ThemeResolutionInput = {
  /** Raw contents of the key this line writes, or `null` when it is absent. */
  stored: string | null
  /** Raw contents of one key this line no longer writes, or `null`. */
  legacy: string | null
  /** `data-pack` on the root element as rendered, valid or not. */
  documentPack: string | null
  /** Whether the root element carries `.dark` as rendered. */
  documentDark: boolean
  defaultPack: PackId
  defaultMode: Mode
}

export type ThemeResolution = {
  pack: PackId
  mode: Mode
  /** Which source named the pair, for `THEME_ORIGIN_ATTRIBUTE`. */
  origin: ThemeOrigin
}

/**
 * The one resolution rule. `PrismProvider` calls it, and the boot script
 * implements it as a string, and the equivalence gate runs both over one table
 * because the string cannot import it.
 *
 * A serialised function is not a way to share it. The build minifies, a renamed
 * identifier inside the script's own `try` would throw there and the catch
 * would fail open, leaving a silent no-op on every page; so the honest shape is
 * one implementation plus a gate that can fail, not two copies that look
 * aligned.
 *
 * The order, and why each step is where it is:
 *
 *   1. A valid pair in the key this line writes wins outright. A decision
 *      recorded as a pair is a decision, and it is the only source that names
 *      both axes at once.
 *   2. A value that is present but is not a pair falls through WHOLE. It is not
 *      repaired field by field, because a half-applied pair is a theme neither
 *      the reader nor the server chose, and because repairing it would make the
 *      two readers disagree about what "a valid mode" means. The value is also
 *      not cleared: it is the only record that this reader ever chose, and the
 *      origin is `unparsed` so a reader can see that it is there and unusable.
 *   3. Only an absent key reaches the keys this line no longer writes. A present
 *      but unusable value is a record of an intent and outranks an older one.
 *   4. The root element's own attributes, which is what a server rendered and
 *      what must survive hydration rather than flash to the default.
 *   5. The consumer's defaults, which is the site's decision, not the reader's.
 *
 * Every step names its own source, so the pack and the mode always come from
 * the same one. That is the whole-vs-half property, and it is structural rather
 * than a check.
 */
export function resolveTheme({
  stored,
  legacy,
  documentPack,
  documentDark,
  defaultPack,
  defaultMode,
}: ThemeResolutionInput): ThemeResolution {
  const pair = parseStoredTheme(stored)
  if (pair) return { pack: pair.pack, mode: pair.mode, origin: 'stored' }

  const renderedPack = isPack(documentPack) ? documentPack : null
  const renderedMode = documentDark ? 'dark' : null
  const fromDocument = (): ThemeResolution => ({
    pack: renderedPack ?? defaultPack,
    mode: renderedMode ?? defaultMode,
    origin: 'document',
  })

  // A value the store holds with content, and `parseStoredTheme` did not accept.
  const held = stored !== null && stored !== ''

  if (held) return { ...fromDocument(), origin: 'unparsed' }
  if (isMode(legacy)) return { pack: defaultPack, mode: legacy, origin: 'legacy' }
  if (renderedPack !== null || renderedMode !== null) return fromDocument()

  return { pack: defaultPack, mode: defaultMode, origin: 'default' }
}

/**
 * The first key in `LEGACY_MODE_STORAGE_KEYS` that holds a recoverable mode.
 *
 * Returned with the key that held it, because the recovery has to retire that
 * key and no other. Order is the list's order, and the list is short enough
 * that the loop is not worth a comment about its cost.
 */
export function readLegacyMode(
  read: (key: string) => string | null,
): { key: string; mode: Mode } | null {
  for (const key of LEGACY_MODE_STORAGE_KEYS) {
    const value = read(key)
    if (isMode(value)) return { key, mode: value }
  }
  return null
}

/**
 * Turns a pack and a mode into the markup attributes that express them.
 *
 * Returns attributes, never CSS values: a Server Component spreads the result
 * onto `<html>` and gets the declarative form with no client runtime. `default`
 * is expressed by omitting `data-pack`; light is expressed by omitting `dark`.
 *
 * `mode` is optional because a server cannot know the reader's mode, and a
 * required one is that impossibility written into the type: the only way to ask
 * for a boundary with no mode class of its own would be to pass `'light'` as a
 * guess, and the guess is wrong for half of them. Omitting it is the honest
 * spelling of "wear the mode of the element carrying `.dark`", which is what the
 * token build's descendant selector implements. `pack` stays required, because an
 * element carrying neither axis is not a theme boundary.
 */
export function themeAttributes({
  pack,
  mode,
}: {
  pack: PackId
  mode?: Mode
}): { 'data-pack'?: string; className?: string } {
  const attributes: { 'data-pack'?: string; className?: string } = {}
  if (pack !== 'default') attributes[PACK_ATTRIBUTE] = pack
  if (mode === 'dark') attributes.className = 'dark'
  return attributes
}
