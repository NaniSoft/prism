/**
 * The closed vocabularies the tool schemas expose.
 *
 * Every list is a projection of a resolved ticket rather than a new list: the
 * item kinds and categories are `prism-llms`' store union (itself the
 * catalogue's closed union), the packs and modes are ticket 07's, and the scale
 * groups are tickets 06 and 18's bound groups. One addition lives here:
 * `SearchKind`, which adds `'doc'` for a non-item page.
 */
import {
  STORE_CATEGORIES,
  STORE_KINDS,
  STORE_MODES,
  STORE_PACKS,
  STORE_SCALE_GROUPS,
} from '@nanisoft/prism-llms'

export const ITEM_KINDS = STORE_KINDS
export const COMPONENT_CATEGORIES = STORE_CATEGORIES
export const PACKS = STORE_PACKS
export const MODES = STORE_MODES
export const SCALE_GROUPS = STORE_SCALE_GROUPS

/** `'doc'` means a non-item page: a guide, a Foundation or a Content page. */
export const SEARCH_KINDS = [...STORE_KINDS, 'doc'] as const

/** The `get_theme_doc` group: the pack-by-mode semantic set or one bound scale. */
export const TOKEN_GROUPS = ['semantic', ...STORE_SCALE_GROUPS] as const

export type ItemKind = (typeof ITEM_KINDS)[number]
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number]
export type SearchKind = (typeof SEARCH_KINDS)[number]
export type TokenGroup = (typeof TOKEN_GROUPS)[number]
