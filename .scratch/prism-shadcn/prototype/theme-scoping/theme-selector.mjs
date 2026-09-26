/**
 * PROPOSED `themeSelector` output switch for packages/tokens/build/themes.mjs
 * (ticket 06 handed ticket 08 the selector shape as a value of this switch;
 * ticket 07 fixed the axis names). This file is a prototype of that switch, not
 * the shipped build.
 *
 * The chosen value is `attribute-agnostic`:
 *
 *   light:   [data-pack="<id>"]          -> matches the root OR any descendant
 *   dark:    [data-pack="<id>"].dark     -> (0,2,0) so it beats the light rule (0,1,0)
 *
 * The base pack ("default") has no id; its markup is the *absence* of data-pack,
 * so it keeps the plain root default. Consumers may still write the literal
 * data-pack="default" if they want symmetry; emit it as an alias if desired.
 *
 * Everything else in build.mjs is unchanged: one `ds/css-vars` format call per
 * mode per pack, with `options.selector = themeSelector(id, mode)`.
 */

export const PACK_ATTR = 'data-pack'

/** Today's root-scoped shape, kept as the default of the switch (ticket 06). */
const ROOT_ATTRIBUTE = {
  id: 'root-attribute',
  selector: (id, mode) =>
    mode === 'dark' ? `.dark[${PACK_ATTR}="${id}"]` : `:root[${PACK_ATTR}="${id}"]`,
}

const ROOT_CLASS = {
  id: 'root-class',
  selector: (id, mode) =>
    mode === 'dark' ? `.dark.prism-pack-${id}` : `.prism-pack-${id}`,
}

/** CHOSEN. Attribute on an element matches that element and every descendant. */
const ATTRIBUTE_AGNOSTIC = {
  id: 'attribute-agnostic',
  selector: (id, mode) =>
    mode === 'dark' ? `[${PACK_ATTR}="${id}"].dark` : `[${PACK_ATTR}="${id}"]`,
}

export const THEME_SELECTOR_STYLES = [ROOT_ATTRIBUTE, ROOT_CLASS, ATTRIBUTE_AGNOSTIC]

/**
 * Ticket 08's decision: set this to `'attribute-agnostic'` in the build config.
 * Until it is set, the switch default (ticket 06) still emits root-scoped CSS.
 */
export const THEME_SELECTOR_STYLE = 'attribute-agnostic'

/** The single output switch: `<id>` is a pack id, `mode` is 'light' | 'dark'. */
export function themeSelector(id, mode) {
  const style =
    THEME_SELECTOR_STYLES.find((s) => s.id === THEME_SELECTOR_STYLE) ?? ROOT_ATTRIBUTE
  return style.selector(id, mode)
}

/**
 * The base pack is the absence of data-pack. It keeps the root default and is
 * not emitted per id. If `default` is ever emitted as an explicit id, use the
 * same selector as every other pack.
 */
export function basePackSelector(mode) {
  return mode === 'dark' ? '.dark' : ':root'
}
