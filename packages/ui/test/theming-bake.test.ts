// The bake helper (ADR-0006 §4): library-owned flash-free recipe. It extracts
// antd's theme variables for a prism theme and keeps only the rulesets scoped
// to the theme's cssVar class — the two pre-baked rulesets a site ships and
// the boot script swaps.

import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getPrismTheme, prismCssVarKey } from '@nanisoft/prism-tokens';

import { bakePrismThemeCss, bakePrismThemeRules, keepThemeVariableRules } from '../src/theming/index.js';

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
