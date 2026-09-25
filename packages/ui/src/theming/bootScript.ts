// The flash-free boot (ADR-0006 §4): `prismThemeBootScript({ pack, defaultMode })`
// returns the inline script string a site drops into its root layout's <head>.
// It applies the stored-or-default `prism-<pack>-<mode>` class to <html>
// before first paint — the exact class that carries the pre-baked variable
// rulesets (the bake helper) and the stable theme scope class. Dependency-free by
// construction: it must never wait on the bundle.

import type { PrismMode, PrismPackId } from '@nanisoft/prism-tokens';

import { PRISM_THEME_MODE_STORAGE_KEY } from './storage.js';

export interface PrismThemeBootScriptOptions {
  /** The site's fixed pack — the chrome flips mode only, never pack. */
  pack: PrismPackId;
  /** The mode when nothing (valid) is stored. Defaults to beam-dark — the standing site default. */
  defaultMode?: PrismMode;
}

export function prismThemeBootScript({ pack, defaultMode = 'dark' }: PrismThemeBootScriptOptions): string {
  // The mode-class prefix is prismCssVarKey(pack, mode) minus the mode; the
  // theming test pins the emitted class to prismCssVarKey itself.
  const classPrefix = JSON.stringify(`prism-${pack}-`);
  return [
    '(()=>{',
    `let m=${JSON.stringify(defaultMode)};`,
    'try{',
    `const s=localStorage.getItem(${JSON.stringify(PRISM_THEME_MODE_STORAGE_KEY)});`,
    'if(s==="light"||s==="dark")m=s;',
    '}catch(e){}',
    'try{',
    'const el=document.documentElement;',
    'for(const c of Array.from(el.classList))if(c.indexOf("prism-")===0)el.classList.remove(c);',
    `el.classList.add(${classPrefix}+m);`,
    '}catch(e){}',
    '})();',
  ].join('');
}
