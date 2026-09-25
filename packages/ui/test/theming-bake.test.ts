// The bake helper (ADR-0006 §4): library-owned flash-free recipe. It extracts
// antd's theme variables for a prism theme and keeps only the rulesets scoped
// to the theme's cssVar class — the two pre-baked rulesets a site ships and
// the boot script swaps.

import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getPrismTheme, prismBrandPacks, prismCssVarKey } from '@nanisoft/prism-tokens';

import { bakePrismThemeCss, bakePrismThemeRules, keepThemeVariableRules } from '../src/theming/index.js';

const PACKS = Object.keys(prismBrandPacks) as Array<keyof typeof prismBrandPacks>;
const MODES = ['light', 'dark'] as const;

beforeAll(() => {
  // antd's dev-only warnings would pollute extraction otherwise (the site's
  // bake script sets the same thing before importing).
  vi.stubEnv('NODE_ENV', 'production');
});

describe('keepThemeVariableRules', () => {
  const css = [
    '.prism-lavender-dark{--prism-color-primary:#9D8DF4}',
    '.prism-lavender-dark.ant-btn-css-var{--prism-color-primary:#9D8DF4}',
    '.ant-btn{color:var(--prism-color-primary)}',
    '@media (prefers-reduced-motion: reduce){.ant-btn{transition:none}.prism-lavender-dark{--prism-motion-duration-mid:160ms}}',
    '@media (min-width: 100px){.ant-layout{display:flex}}',
  ].join('');

  it('keeps the bare token ruleset and the component-level variable rulesets', () => {
    const kept = keepThemeVariableRules(css, 'prism-lavender-dark');
    expect(kept).toContain('.prism-lavender-dark{--prism-color-primary');
    expect(kept).toContain('.prism-lavender-dark.ant-btn-css-var{');
  });

  it('drops theme-agnostic component styles and at-rules that empty out', () => {
    const kept = keepThemeVariableRules(css, 'prism-lavender-dark');
    expect(kept).not.toContain('.ant-btn{color:');
    expect(kept).not.toContain('min-width');
  });

  it('keeps an at-rule that contains kept rules', () => {
    const kept = keepThemeVariableRules(css, 'prism-lavender-dark');
    expect(kept).toContain('prefers-reduced-motion');
    expect(kept).toContain('--prism-motion-duration-mid');
  });

  it('keeps nothing when the key never appears', () => {
    expect(keepThemeVariableRules(css, 'prism-rose-light')).toBe('');
  });
});

describe('bakePrismThemeRules', () => {
  it('extracts the variables for one pack × mode under its cssVar class', () => {
    const rules = bakePrismThemeRules({ theme: getPrismTheme('lavender', 'dark') });
    expect(rules).toContain(`.${prismCssVarKey('lavender', 'dark')}{`);
    expect(rules).toContain('--prism-color-primary');
  });

  it('carries only that theme’s class — no foreign keys', () => {
    const rules = bakePrismThemeRules({ theme: getPrismTheme('rose', 'light') });
    expect(rules).toContain('.prism-rose-light');
    expect(rules).not.toContain('.prism-rose-dark');
    expect(rules).not.toContain('.prism-blue-');
  });

  it('throws when extraction yields nothing (the site script’s guard, moved into the library)', () => {
    // A theme whose cssVarKey can never match its own extraction — simulated
    // by a foreign key on an otherwise real theme.
    const theme = { ...getPrismTheme('blue', 'light'), cssVarKey: 'prism-nowhere' };
    expect(() => bakePrismThemeRules({ theme })).toThrow(/no theme variables extracted/);
  });
});

describe('bakePrismThemeCss', () => {
  it('produces the site’s two pre-baked rulesets, labelled per mode', () => {
    const css = bakePrismThemeCss({ pack: 'green' });
    expect(css).toContain('prism-green-light');
    expect(css).toContain('prism-green-dark');
    expect(css).toContain('--prism-color-primary');
  });
});

// Banned-value gates over the real generated output — the half the AA gate does
// not cover (ADR-0002 erratum 3/4). These fail loudly if a token change
// reintroduces a documented anti-pattern.
describe('baked output invariants', () => {
  it('never emits an overshoot easing curve (no cubic-bezier control point outside [0,1])', () => {
    for (const pack of PACKS) {
      const css = bakePrismThemeCss({ pack });
      for (const match of css.matchAll(/cubic-bezier\(([^)]*)\)/g)) {
        for (const point of match[1].split(',').map((value) => Number(value.trim()))) {
          expect(point).toBeGreaterThanOrEqual(0);
          expect(point).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('keeps the pack’s tinted hairlines in component scopes — no stock grey fallback', () => {
    for (const pack of PACKS) {
      for (const mode of MODES) {
        const theme = getPrismTheme(pack, mode);
        const rules = bakePrismThemeRules({ theme });
        // The component algorithm used to re-derive these to antd's default
        // greys (#d9d9d9) — see erratum 3. The bare/derived tinted value must
        // win for the button's default border.
        expect(rules).toContain(`--prism-button-default-border-color:${theme.semantics.hairlineStrong}`);
        expect(rules).not.toContain('--prism-color-border:#d9d9d9');
        expect(rules).not.toContain('--prism-button-default-border-color:#d9d9d9');
      }
    }
  });
});
