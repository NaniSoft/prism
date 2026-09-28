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
 *
 * The `attribute-agnostic` dark selector is a comma-separated selector LIST, and
 * both halves are load-bearing:
 *
 *   - `[data-pack="<id>"].dark` is the compound form: a boundary that holds a
 *     fixed mode, on either the document or a subtree. This is the form a
 *     client can apply, and it is retained deliberately - removing it would
 *     delete a published capability.
 *   - `.dark [data-pack="<id>"]` is the descendant form, and it exists because a
 *     server cannot know the reader's mode. A subtree that carries a pack and no
 *     mode class has to resolve that pack's values for the DOCUMENT's mode, which
 *     only the ancestor form can express. With only the compound half, a
 *     server-rendered boundary renders the pack's light values on a dark page.
 *
 * The two halves live in ONE rule, so an element matching both resolves to the
 * same declarations either way and there is no specificity contest to lose. A
 * zero-specificity wrapper was considered and rejected: it loses to an unlayered
 * consumer rule on import order, and the no-override-path law decides that.
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
    dark: (id) => `[${PACK_ATTR}="${id}"].dark, .dark [${PACK_ATTR}="${id}"]`,
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
      // The one brand hue in the contract that is read as text rather than used
      // as a fill. The accent ground decides the step, and it is brand 700 here:
      // brand 600 measures 3.82:1 to 4.21:1 on the five packs' own accent surface
      // and brand 700 is the first step that clears 4.5:1 in all five. Going
      // deeper would only trade chroma for contrast the text does not need.
      'brand-ink': { $value: `{${B}.700}` },
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
      // The sidebar is a step off the page ground in every mode: in light it is
      // neutral 50 rather than neutral 0, so a ring on it has slightly less room,
      // and brand 500 measured 2.86:1 in Mint and 2.97:1 in Sky. Brand 600 is the
      // first step that clears 3:1 on all five. In dark the sidebar is neutral
      // 900, lighter than the page ground, and brand 300 already holds 8.06:1 or
      // better, so the dark arm keeps its step.
      'sidebar-ring': { $value: `{${B}.600}` },
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
      // The dark accent surface is brand 800, so the ink has to be a light brand
      // step: brand 400 measures 4.34:1 to 4.37:1 on that surface and misses, and
      // brand 300 is the first step that clears. Brand 200 rather than brand 300
      // because brand 300 is `primary` in this mode, and a brand ink that is the
      // brand fill is the confusion this role exists to end.
      'brand-ink': { $value: `{${B}.200}` },
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
