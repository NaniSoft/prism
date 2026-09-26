/**
 * Theme expansion.
 *
 * A theme is a small descriptor (src/themes/<id>.json) plus a fixed mapping from
 * intent to ramp steps. Every theme therefore emits the complete shadcn token
 * contract — a new theme cannot silently ship a missing token, which is the same
 * class of drift the registry validator guards against on the component side.
 *
 * Contrast: pastels are fills, not text. Light surfaces use brand-400 as a fill
 * with brand-950 text (~6.5:1); dark surfaces use brand-300 with brand-950
 * (~8.5:1). Muted foreground is pinned to neutral-700 / neutral-300 rather than a
 * softer step, because muted text still has to clear 4.5:1.
 */

/**
 * The runtime attribute that names a pack. Ticket 06 renamed the vocabulary
 * (`data-theme` named a pack all along); ticket 08 fixed the selector shape.
 */
export const PACK_ATTR = 'data-pack'

/**
 * The selector shape is an output switch, so changing it never means forking the
 * build or hand-editing `dist`. Ticket 06's default stays root-scoped; the token
 * build ships `attribute-agnostic` (ticket 08's decision), which matches the root
 * or any descendant and so makes a themed subtree expressible in markup alone.
 */
const THEME_SELECTOR_STYLES = {
  'root-attribute': {
    light: (id) => `:root[${PACK_ATTR}="${id}"]`,
    dark: (id) => `.dark[${PACK_ATTR}="${id}"]`,
  },
  'root-class': {
    light: (id) => `.prism-pack-${id}`,
    dark: (id) => `.dark.prism-pack-${id}`,
  },
  'attribute-agnostic': {
    light: (id) => `[${PACK_ATTR}="${id}"]`,
    dark: (id) => `[${PACK_ATTR}="${id}"].dark`,
  },
}

/** Today's root-scoped template, kept as the switch default (ticket 06). */
export const DEFAULT_THEME_SELECTOR_STYLE = 'root-attribute'

/** The value the token build calls the switch with (ticket 08). */
export const THEME_SELECTOR_STYLE = 'attribute-agnostic'

/**
 * The single output switch: `<id>` is a pack id, `mode` is 'light' | 'dark'.
 * The base pack is the absence of an attribute, so it keeps `:root` / `.dark`
 * and is not emitted per id.
 */
export function themeSelector(id, mode, style = DEFAULT_THEME_SELECTOR_STYLE) {
  const selected = THEME_SELECTOR_STYLES[style] ?? THEME_SELECTOR_STYLES[DEFAULT_THEME_SELECTOR_STYLE]
  return mode === 'dark' ? selected.dark(id) : selected.light(id)
}

/** @param {string} id theme id, e.g. 'blush' */
export function expandTheme(id) {
  const N = `color.${id}-neutral`
  const B = `color.${id}-brand`

  return {
    light: {
      background: { $value: `{${N}.0}` },
      foreground: { $value: `{${N}.900}` },
      card: { $value: `{${N}.0}` },
      'card-foreground': { $value: `{${N}.900}` },
      popover: { $value: `{${N}.0}` },
      'popover-foreground': { $value: `{${N}.900}` },
      primary: { $value: `{${B}.400}` },
      'primary-foreground': { $value: `{${B}.950}` },
      secondary: { $value: `{${N}.100}` },
      'secondary-foreground': { $value: `{${N}.900}` },
      muted: { $value: `{${N}.100}` },
      'muted-foreground': { $value: `{${N}.700}` },
      accent: { $value: `{${B}.100}` },
      'accent-foreground': { $value: `{${B}.950}` },
      destructive: { $value: '{color.red.600}' },
      'destructive-foreground': { $value: `{${N}.0}` },
      success: { $value: '{color.green.700}' },
      'success-foreground': { $value: `{${N}.0}` },
      warning: { $value: '{color.amber.500}' },
      'warning-foreground': { $value: `{${N}.950}` },
      border: { $value: `{${N}.200}` },
      input: { $value: `{${N}.200}` },
      ring: { $value: `{${B}.500}` },
      'chart-1': { $value: `{${B}.500}` },
      'chart-2': { $value: '{color.teal.500}' },
      'chart-3': { $value: '{color.amber.500}' },
      'chart-4': { $value: `{${N}.500}` },
      'chart-5': { $value: '{color.red.500}' },
      sidebar: { $value: `{${N}.50}` },
      'sidebar-foreground': { $value: `{${N}.900}` },
      'sidebar-primary': { $value: `{${B}.400}` },
      'sidebar-primary-foreground': { $value: `{${B}.950}` },
      'sidebar-accent': { $value: `{${B}.100}` },
      'sidebar-accent-foreground': { $value: `{${B}.950}` },
      'sidebar-border': { $value: `{${N}.200}` },
      'sidebar-ring': { $value: `{${B}.500}` },
    },

    dark: {
      background: { $value: `{${N}.950}` },
      foreground: { $value: `{${N}.100}` },
      card: { $value: `{${N}.900}` },
      'card-foreground': { $value: `{${N}.100}` },
      popover: { $value: `{${N}.900}` },
      'popover-foreground': { $value: `{${N}.100}` },
      primary: { $value: `{${B}.300}` },
      'primary-foreground': { $value: `{${B}.950}` },
      secondary: { $value: `{${N}.800}` },
      'secondary-foreground': { $value: `{${N}.100}` },
      muted: { $value: `{${N}.800}` },
      'muted-foreground': { $value: `{${N}.300}` },
      accent: { $value: `{${B}.800}` },
      'accent-foreground': { $value: `{${B}.100}` },
      destructive: { $value: '{color.red.400}' },
      'destructive-foreground': { $value: `{${N}.950}` },
      success: { $value: '{color.green.400}' },
      'success-foreground': { $value: `{${N}.950}` },
      warning: { $value: '{color.amber.300}' },
      'warning-foreground': { $value: `{${N}.950}` },
      border: { $value: `{${N}.800}` },
      input: { $value: `{${N}.800}` },
      ring: { $value: `{${B}.300}` },
      'chart-1': { $value: `{${B}.400}` },
      'chart-2': { $value: '{color.teal.400}' },
      'chart-3': { $value: '{color.amber.400}' },
      'chart-4': { $value: `{${N}.400}` },
      'chart-5': { $value: '{color.red.400}' },
      sidebar: { $value: `{${N}.900}` },
      'sidebar-foreground': { $value: `{${N}.100}` },
      'sidebar-primary': { $value: `{${B}.300}` },
      'sidebar-primary-foreground': { $value: `{${B}.950}` },
      'sidebar-accent': { $value: `{${B}.800}` },
      'sidebar-accent-foreground': { $value: `{${B}.100}` },
      'sidebar-border': { $value: `{${N}.800}` },
      'sidebar-ring': { $value: `{${B}.300}` },
    },
  }
}
