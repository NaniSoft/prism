import { ComponentDemo } from './component-demo'
import { ColorTokens } from './foundations/color-tokens'
import { IconographyGrid } from './foundations/iconography-grid'
import { TokenBrowser } from './foundations/token-browser'
import { TokenTable } from './foundations/token-table'

/**
 * The MDX component map.
 *
 * MDX prose mounts a live component by name, and this map is the one place the
 * name resolves. Item prose uses `ComponentDemo`; the Foundations pages use the
 * token readers. Lowercase elements keep their default rendering and are styled
 * by the article's prose rules.
 */
export function getMDXComponents() {
  return {
    ComponentDemo,
    ColorTokens,
    IconographyGrid,
    TokenTable,
    TokenBrowser,
  }
}
