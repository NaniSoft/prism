// prism-ui root barrel: provider + components + blocks + pages.
// ./icons is deliberately excluded (800+ names — ADR-0003); import it
// from '@nanisoft/prism-ui/icons'.

export { PrismProvider, type PrismProviderProps } from './provider/index.js';
export { mergePrismTheme, toAntdTheme, isPrismTheme } from './provider/index.js';
export { usePrismLink, PrismLinkContextProvider, type PrismLinkContextValue } from './provider/index.js';
export {
  PrismThemeModeProvider,
  usePrismThemeMode,
  type PrismThemeModeProviderProps,
  type PrismThemeModeValue,
} from './provider/index.js';
export {
  prismProducts,
  getPrismProduct,
  productDotBackground,
  type PrismProduct,
  type PrismProductId,
} from './products/index.js';
export { ProductDot } from './products/ProductDot.js';
// Mode mechanics — the runtime-safe half of ./theming. The bake helper stays on
// the ./theming subpath: it pulls the SSR extractor.
export { PRISM_THEME_MODE_STORAGE_KEY, parsePrismThemeMode } from './theming/storage.js';
export { prismThemeBootScript, type PrismThemeBootScriptOptions } from './theming/bootScript.js';
export * from './components/index.js';
export * from './blocks/index.js';
export * from './pages/index.js';
export { buildCatalog, componentCategories, wrappedComponents, wrappedCount, antdCategories } from './wrapped-registry.js';
export type {
  WrappedComponent,
  WrappedJustification,
  PrismCategory,
  CatalogEntry,
  CatalogLayer,
  PassThroughItem,
} from './wrapped-registry.js';
