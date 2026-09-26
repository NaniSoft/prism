/**
 * The Prism provider entry.
 *
 * `PrismProvider` and `usePrismTheme` are the optional programmatic path;
 * `PrismThemeScript` is the optional pre-hydration script. The declarative
 * `data-pack` and `.dark` attributes are the default and need none of this.
 */
export { PrismProvider, usePrismTheme } from './provider'
export type { PrismProviderProps, PrismTheme } from './provider'
export { PrismThemeScript } from './theme-script'
export type { PrismThemeScriptProps } from './theme-script'
