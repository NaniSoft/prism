/**
 * @nanisoft/prism-tokens — the single source of truth for the Prism design
 * language (ADR-0002). Pure data: no React, no antd, no runtime dependencies.
 */

// The antd-ready theme + cssVar scheme (§1b API).
export { createPrismTheme, getPrismTheme, prismCssVarKey } from './theme.js';
// Tier 0 + 1 as DTCG (§2d) and the tier resolvers (the theme-MD consumer and
// tests read them; prism-ui and apps read only PrismTheme).
export { toDtcg } from './dtcg.js';
export { resolvePrimitives } from './primitives.js';
export { resolveSemantics } from './semantics.js';
// Brand packs (§4).
export { defineBrandPack, prismBrandPacks } from './brands.js';
export type {
  BrandPack,
  BrandPackInput,
  PrismAntdComponentsOverrides,
  PrismAntdMapKey,
  PrismAntdSeedTokens,
  PrismAntdThemeConfig,
  PrismDtcgDocument,
  PrismMode,
  PrismPackId,
  PrismPrimitiveTokens,
  PrismSemanticTokens,
  PrismTheme,
  PrismThemeOptions,
  PrismThemeOverrides,
} from './types.js';
