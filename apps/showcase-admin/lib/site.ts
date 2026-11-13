import { PACKS, themeAttributes, type Mode, type PackId } from '@nanisoft/prism-ui/theming'

import site from './site.json'

const PACK_IDS: readonly string[] = PACKS

function pack(value: string): PackId {
  if (!PACK_IDS.includes(value)) {
    throw new Error(`site.json: "${value}" is not a published pack`)
  }
  return value as PackId
}

export const GROUND_PACK: PackId = pack(site.ground)
export const DEFAULT_MODE = site.defaultMode as Mode
export const THEME_ATTRIBUTES = themeAttributes({ pack: GROUND_PACK, mode: DEFAULT_MODE })

/**
 * Where this export is hosted. A base path prefixes the addresses a reader uses
 * and not the routes an application names, so the application keeps its own
 * vocabulary and derives the public address in this one place: a Block renders
 * a plain anchor, and Next prefixes its own assets and never that anchor.
 */
export const BASE_PATH = '/showcase/admin'

/** The public address of one of this application's own routes. */
export function publicPath(route: string): string {
  return route === '/' ? BASE_PATH : `${BASE_PATH}${route}`
}
