// prism-ui root barrel: provider + components + blocks + pages.
// ./icons is deliberately excluded (800+ names — ADR-0003); import it
// from '@nanisoft/prism-ui/icons'.
// PROTOTYPE stand-in: the landing prototype is reachable via the ./prototype
// subpath only, and leaves with the site-build pass (ticket 21).

export { PrismProvider, type PrismProviderProps } from './provider/index.js';
export { mergePrismTheme, toAntdTheme, isPrismTheme } from './provider/index.js';
export { usePrismLink, PrismLinkContextProvider, type PrismLinkContextValue } from './provider/index.js';
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
