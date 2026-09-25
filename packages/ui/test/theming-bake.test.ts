import { describe, expect, it } from 'vitest';
import { getPrismTheme, prismBrandPacks } from '@nanisoft/prism-tokens';

import { bakePrismThemeCss, bakePrismThemeRules } from '../src/theming/index.js';

const packs = Object.keys(prismBrandPacks) as Array<keyof typeof prismBrandPacks>;

describe('plain CSS theme baking', () => {
  it('emits one complete, stable variable scope per theme', () => {
    const theme = getPrismTheme('lavender', 'dark');
    const rules = bakePrismThemeRules({ theme });
    expect(rules.startsWith('.prism-lavender-dark {')).toBe(true);
    expect(rules).toContain('--prism-primary: #9D8DF4;');
    expect(rules).toContain('--prism-surface: #1D1545;');
    expect(rules).toContain('--prism-radius: 4px;');
  });

  it('bakes both modes for a pack without foreign theme classes', () => {
    const css = bakePrismThemeCss({ pack: 'green' });
    expect(css).toContain('.prism-green-light {');
    expect(css).toContain('.prism-green-dark {');
    expect(css).not.toContain('.prism-rose-');
  });

  it('rejects malformed theme class contracts', () => {
    expect(() => bakePrismThemeRules({ theme: { ...getPrismTheme('blue', 'light'), cssVarKey: 'wrong' } })).toThrow(/invalid Prism theme class/);
  });

  it('ships all ten expressions with no overshoot curves or in-plane shadows', () => {
    const css = packs.flatMap((pack) => ['light', 'dark'].map((mode) => bakePrismThemeRules({ theme: getPrismTheme(pack, mode as 'light' | 'dark') }))).join('\n');
    expect(css.match(/\.prism-[a-z]+-(?:light|dark) \{/g)).toHaveLength(10);
    for (const match of css.matchAll(/cubic-bezier\(([^)]*)\)/g)) {
      for (const point of match[1].split(',').map((value) => Number(value.trim()))) {
        expect(point).toBeGreaterThanOrEqual(0);
        expect(point).toBeLessThanOrEqual(1);
      }
    }
    expect(css).toContain('--prism-shadow-none: none;');
  });
});
