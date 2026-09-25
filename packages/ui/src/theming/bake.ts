// Build-time plain-CSS theme baking. There is no runtime style extractor: a
// theme is serializable data, so its complete variable set is deterministic.

import { getPrismTheme, type PrismMode, type PrismPackId, type PrismTheme } from '@nanisoft/prism-tokens';

function declarations(theme: PrismTheme): string {
  return Object.entries(theme.cssVariables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
}

/** One complete theme scope: `.prism-<pack>-<mode> { --prism-*: … }`. */
export function bakePrismThemeRules({ theme }: { theme: PrismTheme }): string {
  if (!theme.cssVarKey.startsWith('prism-')) {
    throw new Error(`bakePrismThemeRules: invalid Prism theme class "${theme.cssVarKey}"`);
  }
  if (Object.keys(theme.cssVariables).length === 0) {
    throw new Error(`bakePrismThemeRules: no CSS variables for ${theme.pack}/${theme.mode}`);
  }
  return `.${theme.cssVarKey} {\n${declarations(theme)}\n}`;
}

export interface BakePrismThemeCssOptions {
  pack: PrismPackId;
  modes?: readonly PrismMode[];
}

/** Both modes for one pack unless a caller intentionally bakes one. */
export function bakePrismThemeCss({ pack, modes = ['light', 'dark'] }: BakePrismThemeCssOptions): string {
  return modes
    .map((mode) => {
      const theme = getPrismTheme(pack, mode);
      return `/* ${theme.pack} · ${theme.mode} */\n${bakePrismThemeRules({ theme })}`;
    })
    .join('\n\n');
}
