// The build-time bake helper (ADR-0006 §4): library-owned flash-free recipe.
// With `cssVar: { key: 'prism-<pack>-<mode>' }` + `hashed: false`, a theme's
// identity collapses into one ruleset per key — the bare token ruleset plus
// the component-level `.{key}.ant-*-css-var` variable rulesets. Component
// *styles* are theme-agnostic (they reference `var(--prism-*)`), so those
// variable rulesets are all a site needs pre-baked: the boot script swaps the
// class on <html> and the whole page re-themes without a flash.
//
// Node/build-time only: it pulls the SSR extractor. The package ships it on
// the ./theming subpath, never the root barrel.

import { extractStyle } from '@ant-design/static-style-extract';
import React from 'react';
import { getPrismTheme, type PrismMode, type PrismPackId, type PrismTheme } from '@nanisoft/prism-tokens';

import { PrismProvider } from '../provider/PrismProvider.js';

/**
 * Keep only the rules scoped to `key`'s variable class — the bare token
 * ruleset and the component-level `.{key}.ant-*-css-var` rulesets. The
 * theme-agnostic component styles that make up the rest of the extraction are
 * baked into every page by AntdRegistry at prerender; duplicating them here
 * would multiply the payload for nothing. At-rules are recursed and kept only
 * when something inside survives.
 */
export function keepThemeVariableRules(css: string, key: string): string {
  const keep = (selector: string): boolean => selector === `.${key}` || selector.startsWith(`.${key}.`);
  const walk = (text: string): string => {
    const out: string[] = [];
    let i = 0;
    while (i < text.length) {
      const brace = text.indexOf('{', i);
      if (brace === -1) break;
      const selector = text.slice(i, brace).trim();
      let depth = 1;
      let j = brace + 1;
      while (j < text.length && depth > 0) {
        const ch = text[j];
        if (ch === '{') depth += 1;
        else if (ch === '}') depth -= 1;
        j += 1;
      }
      const body = text.slice(brace + 1, j - 1);
      if (selector.startsWith('@') && depth === 0) {
        const inner = walk(body);
        if (inner) out.push(`${selector}{${inner}}`);
      } else if (keep(selector)) {
        out.push(`${selector}{${body}}`);
      }
      i = j;
    }
    return out.join('');
  };
  return walk(css);
}

export interface BakePrismThemeRulesOptions {
  /** The theme to bake — pass `getPrismTheme(pack, mode)` or a `createPrismTheme()` result (overrides bake too). */
  theme: PrismTheme;
}

/** Extract and filter one theme's variable ruleset. Throws when extraction yields nothing. */
export function bakePrismThemeRules({ theme }: BakePrismThemeRulesOptions): string {
  const full = extractStyle({
    customTheme: (node) => React.createElement(PrismProvider, { prismTheme: theme }, node),
  });
  const rules = keepThemeVariableRules(full, theme.cssVarKey);
  if (!rules.includes('--prism-color-primary')) {
    throw new Error(`bakePrismThemeRules: no theme variables extracted for ${theme.pack}/${theme.mode}`);
  }
  return rules;
}

export interface BakePrismThemeCssOptions {
  pack: PrismPackId;
  /** Defaults to both — a site ships exactly two pre-baked rulesets. */
  modes?: readonly PrismMode[];
}

/** The standard bake: one labelled variable ruleset per mode, ready for a site's build to write out. */
export function bakePrismThemeCss({ pack, modes = ['light', 'dark'] }: BakePrismThemeCssOptions): string {
  const chunks: string[] = [];
  for (const mode of modes) {
    const theme = getPrismTheme(pack, mode);
    chunks.push(`/* ${theme.pack} · ${theme.mode} (${theme.cssVarKey}) */\n${bakePrismThemeRules({ theme })}\n`);
  }
  return chunks.join('\n');
}
