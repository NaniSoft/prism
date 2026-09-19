// The flash-free boot (ticket 02's class-swap recipe): the inline script must
// apply the stored-or-default `prism-<pack>-<mode>` class before paint, and the
// class must be antd's cssVar key — the two halves of the recipe pinned
// together.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { prismCssVarKey } from '@nanisoft/prism-tokens';

import {
  DEFAULT_MODE,
  DEFAULT_PACK,
  DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
  THEME_BOOTSTRAP_SCRIPT,
  parseThemeId,
  themeClass,
  themeId,
} from '../lib/theme.js';

interface FakeClassList extends Iterable<string> {
  add: (c: string) => void;
  remove: (c: string) => void;
}

function stubBrowser(storage: Record<string, string>): Set<string> {
  const store = { ...storage };
  const classList = new Set<string>(['other-class']);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  });
  vi.stubGlobal('document', {
    documentElement: {
      classList: {
        add: (c: string) => classList.add(c),
        remove: (c: string) => classList.delete(c),
        [Symbol.iterator]: classList[Symbol.iterator].bind(classList),
      } satisfies FakeClassList,
    },
  });
  return classList;
}

function boot(storage: Record<string, string>): string {
  const classList = stubBrowser(storage);
  // Run the exact string the layout inlines — no reimplementation.
  new Function(THEME_BOOTSTRAP_SCRIPT)();
  return Array.from(classList).join(' ');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('theme ids', () => {
  it('defaults to beam-dark blue (ticket 12)', () => {
    expect([DEFAULT_PACK, DEFAULT_MODE, DEFAULT_THEME_ID]).toEqual(['blue', 'dark', 'blue-dark']);
  });

  it('the applied class is antd\'s cssVar key', () => {
    expect(themeClass('green', 'dark')).toBe(prismCssVarKey('green', 'dark'));
    expect(themeClass('blue', 'dark')).toBe('prism-blue-dark');
  });

  it('parses stored ids and rejects unknown values', () => {
    expect(parseThemeId('green-light')).toEqual({ pack: 'green', mode: 'light' });
    expect(parseThemeId('purple-dark')).toBeUndefined();
    expect(parseThemeId(null)).toBeUndefined();
    expect(themeId('blue', 'dark')).toBe('blue-dark');
  });
});

describe('THEME_BOOTSTRAP_SCRIPT', () => {
  it('applies the default class when nothing is stored', () => {
    expect(boot({})).toBe('other-class prism-blue-dark');
  });

  it('restores a stored theme and replaces the previous prism class', () => {
    expect(boot({ [THEME_STORAGE_KEY]: 'green-light' })).toBe('other-class prism-green-light');
  });

  it('ignores garbage in storage', () => {
    expect(boot({ [THEME_STORAGE_KEY]: 'bogus' })).toBe('other-class prism-blue-dark');
  });

  it('survives a throwing localStorage and still sets the default', () => {
    const classList = new Set<string>();
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
    });
    vi.stubGlobal('document', {
      documentElement: {
        classList: {
          add: (c: string) => classList.add(c),
          remove: (c: string) => classList.delete(c),
          [Symbol.iterator]: classList[Symbol.iterator].bind(classList),
        } satisfies FakeClassList,
      },
    });
    expect(() => new Function(THEME_BOOTSTRAP_SCRIPT)()).not.toThrow();
    expect(Array.from(classList)).toEqual(['prism-blue-dark']);
  });
});
