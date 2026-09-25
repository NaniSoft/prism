// @nanisoft/prism-ui — one import boundary for components, blocks, and pages.

export {
  createPrismTheme,
  getPrismTheme,
  prismBrandPacks,
  prismCssVarKey,
  type PrismMode,
  type PrismPackId,
  type PrismTheme,
} from '@nanisoft/prism-tokens';
export * from './provider/index.js';
export * from './components/index.js';
export * from './blocks/index.js';
export * from './pages/index.js';
export { buildCatalog, catalogEntry, componentCategories, type CatalogCategory, type CatalogEntry, type CatalogLayer, type CatalogPrimitive } from './catalog.js';
export { ProductDot } from './products/ProductDot.js';
export { prismProducts, getPrismProduct, productDotBackground, type PrismProduct, type PrismProductId } from './products/index.js';
export { PRISM_THEME_MODE_STORAGE_KEY, parsePrismThemeMode } from './theming/storage.js';
export { prismThemeBootScript, type PrismThemeBootScriptOptions } from './theming/bootScript.js';
