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
 * Turns a pack and mode into the two markup attributes that express them.
 *
 * Returns attributes, never CSS values: a Server Component spreads the result
 * onto `<html>` and gets the declarative form with no client runtime. `default`
 * is expressed by omitting `data-pack`; light is expressed by omitting `dark`.
 */
export function themeAttributes({
  pack,
  mode,
}: {
  pack: PackId
  mode: Mode
}): { 'data-pack'?: string; className?: string } {
  const attributes: { 'data-pack'?: string; className?: string } = {}
  if (pack !== 'default') attributes[PACK_ATTRIBUTE] = pack
  if (mode === 'dark') attributes.className = 'dark'
  return attributes
}
