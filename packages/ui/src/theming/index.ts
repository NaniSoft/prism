// prism-ui theming module (ADR-0006 §4): the chrome's mode mechanics. This
// subpath is also the build-time surface — bake pulls the SSR extractor, so
// the root barrel deliberately re-exports only storage + bootScript directly,
// never this index.

export { PRISM_THEME_MODE_STORAGE_KEY, parsePrismThemeMode } from './storage.js';
export { prismThemeBootScript, type PrismThemeBootScriptOptions } from './bootScript.js';
export {
  bakePrismThemeCss,
  bakePrismThemeRules,
  keepThemeVariableRules,
  type BakePrismThemeCssOptions,
  type BakePrismThemeRulesOptions,
} from './bake.js';
