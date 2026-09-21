// The chrome's mode mechanics (ADR-0006 §4): one shared storage key, one
// mode-only boot script. The script is the exact string a site inlines into
// <head> — these tests execute it, so the boot and the toggle can never
// disagree about the class or the key.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { prismCssVarKey } from '@nanisoft/prism-tokens';

import {
  PRISM_THEME_MODE_STORAGE_KEY,
  parsePrismThemeMode,
  prismThemeBootScript,
} from '../src/theming/index.js';

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

function boot(pack: string, defaultMode: 'light' | 'dark' | undefined, storage: Record<string, string>): string[] {
  const classList = stubBrowser(storage);
  // Run the exact string the layout inlines — no reimplementation.
  new Function(prismThemeBootScript({ pack: pack as never, defaultMode }))();
  return Array.from(classList);
}

describe('mode storage', () => {
  it('the storage key is the one shared constant — toggle and boot read the same slot', () => {
    expect(PRISM_THEME_MODE_STORAGE_KEY).toBe('prism-theme-mode');
  });

  it('parses stored modes and rejects everything else', () => {
    expect(parsePrismThemeMode('light')).toBe('light');
    expect(parsePrismThemeMode('dark')).toBe('dark');
    expect(parsePrismThemeMode('blue-dark')).toBeUndefined();
    expect(parsePrismThemeMode('bogus')).toBeUndefined();
    expect(parsePrismThemeMode(null)).toBeUndefined();
    expect(parsePrismThemeMode(undefined)).toBeUndefined();
  });
});

describe('prismThemeBootScript', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('applies the pack’s beam-dark class when nothing is stored', () => {
    expect(boot('lavender', 'dark', {})).toEqual(['other-class', 'prism-lavender-dark']);
  });

  it('a stored mode wins over the default', () => {
    expect(boot('green', 'dark', { [PRISM_THEME_MODE_STORAGE_KEY]: 'light' })).toEqual([
      'other-class',
      'prism-green-light',
    ]);
  });

  it('the applied class is antd’s cssVar key — boot and bake pinned together', () => {
    expect(boot('rose', 'light', {})).toEqual(['other-class', prismCssVarKey('rose', 'light')]);
  });

  it('ignores garbage in storage and falls back to the default', () => {
    expect(boot('lavender', 'dark', { [PRISM_THEME_MODE_STORAGE_KEY]: 'lavender-light' })).toEqual([
      'other-class',
      'prism-lavender-dark',
    ]);
  });

  it('replaces a previous prism class and keeps foreign classes', () => {
    const classList = stubBrowser({ [PRISM_THEME_MODE_STORAGE_KEY]: 'dark' });
    classList.add('prism-green-light');
    new Function(prismThemeBootScript({ pack: 'green', defaultMode: 'light' }))();
    expect(Array.from(classList).sort()).toEqual(['other-class', 'prism-green-dark']);
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
    expect(() => new Function(prismThemeBootScript({ pack: 'blue', defaultMode: 'dark' }))()).not.toThrow();
    expect(Array.from(classList)).toEqual(['prism-blue-dark']);
  });

  it('is inline-safe — never contains a script-closing sequence', () => {
    expect(prismThemeBootScript({ pack: 'blue', defaultMode: 'dark' })).not.toContain('</');
  });

  it('defaults to beam-dark when defaultMode is omitted (the standing site default)', () => {
    expect(boot('blue', undefined, {})).toEqual(['other-class', 'prism-blue-dark']);
  });
});
