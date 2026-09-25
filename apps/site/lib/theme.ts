// Site theme state: one shell-level pack × mode selection.
//
// The switcher defaults to beam-dark blue, persists to localStorage, and uses
// Prism's pre-baked `prism-<pack>-<mode>` classes. THEME_BOOTSTRAP_SCRIPT swaps
// that class on <html> before first paint; React follows the same selection.

import { prismBrandPacks, prismCssVarKey, type PrismMode, type PrismPackId } from '@nanisoft/prism-tokens';

export const THEME_STORAGE_KEY = 'prism-theme';

export const DEFAULT_PACK: PrismPackId = 'blue';
export const DEFAULT_MODE: PrismMode = 'dark';

/** Derived from prism-tokens' registered packs (ADR-0005) — a new pack needs no edit here. */
export const PACKS: readonly PrismPackId[] = Object.keys(prismBrandPacks) as PrismPackId[];
export const MODES: readonly PrismMode[] = ['light', 'dark'];

export const PACK_LABELS: Record<PrismPackId, string> = {
  blue: 'Blue',
  green: 'Green',
  lavender: 'Lavender',
  rose: 'Rose',
  peach: 'Peach',
};
export const MODE_LABELS: Record<PrismMode, string> = { light: 'Light', dark: 'Beam-dark' };

/** The pack's ink for a mode — the swatch dot in the switcher and gallery. */
export function packSwatch(pack: PrismPackId, mode: PrismMode = 'light'): string {
  return prismBrandPacks[pack].ink[mode];
}

/** `<pack>-<mode>` — the localStorage value; the applied class is `prism-<id>`. */
export function themeId(pack: PrismPackId, mode: PrismMode): string {
  return `${pack}-${mode}`;
}

export interface PrismThemeSelection {
  pack: PrismPackId;
  mode: PrismMode;
}

/** Parse a stored theme id, falling back to undefined when unknown. */
export function parseThemeId(value: string | null | undefined): PrismThemeSelection | undefined {
  if (!value) return undefined;
  for (const pack of PACKS) {
    for (const mode of MODES) {
      if (themeId(pack, mode) === value) return { pack, mode };
    }
  }
  return undefined;
}

/** The class that carries a theme's pre-baked CSS variables. */
export function themeClass(pack: PrismPackId, mode: PrismMode): string {
  return prismCssVarKey(pack, mode);
}

export const DEFAULT_THEME_ID = themeId(DEFAULT_PACK, DEFAULT_MODE);

const THEME_IDS = PACKS.flatMap((pack) => MODES.map((mode) => themeId(pack, mode)));

/**
 * Blocking boot script inlined into <head>: applies the stored theme (or the
 * beam-dark-blue default) as the <html> class before first paint. It stays
 * dependency-free and shares the key scheme with prism-tokens.
 */
export const THEME_BOOTSTRAP_SCRIPT = [
  '(()=>{',
  `let id=${JSON.stringify(DEFAULT_THEME_ID)};`,
  'try{',
  `const stored=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});`,
  `if([${THEME_IDS.map((value) => JSON.stringify(value)).join(',')}].includes(stored))id=stored;`,
  '}catch(e){}',
  'try{',
  'const el=document.documentElement;',
  'for(const c of Array.from(el.classList))if(c.indexOf("prism-")===0)el.classList.remove(c);',
  'el.classList.add("prism-"+id);',
  '}catch(e){}',
  '})();',
].join('');
