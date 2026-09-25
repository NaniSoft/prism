import { describe, expect, it } from 'vitest';
import {
  createPrismTheme,
  defineBrandPack,
  getPrismTheme,
  mixHex,
  prismBrandPacks,
  prismCssVarKey,
  resolvePrimitives,
  resolveSemantics,
  toDtcg,
} from '../src/index.js';
import type { BrandPackInput, PrismDtcgDocument, PrismMode, PrismPackId } from '../src/types.js';

const COMBOS: Array<[PrismPackId, PrismMode]> = [
  ['blue', 'light'], ['blue', 'dark'],
  ['green', 'light'], ['green', 'dark'],
  ['lavender', 'light'], ['lavender', 'dark'],
  ['rose', 'light'], ['rose', 'dark'],
  ['peach', 'light'], ['peach', 'dark'],
];

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function compositeRgba(rgba: string, background: string): string {
  const match = /^rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)$/.exec(rgba);
  if (!match) return rgba;
  const alpha = Number(match[4]);
  const channel = (offset: number, index: number): string =>
    Math.round(Number(match[index]) * alpha + Number.parseInt(background.slice(offset, offset + 2), 16) * (1 - alpha))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${channel(1, 1)}${channel(3, 2)}${channel(5, 3)}`;
}

function deepFrozen(value: unknown): void {
  expect(Object.isFrozen(value)).toBe(true);
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) deepFrozen(child);
  }
}

function leafPaths(tree: unknown, prefix = ''): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
    const path = prefix ? `${prefix}/${key}` : key;
    if (value && typeof value === 'object' && '$type' in (value as object)) out.push(path);
    else out.push(...leafPaths(value, path));
  }
  return out.sort();
}

describe('brand packs', () => {
  it('registers the five pastel packs, deeply frozen', () => {
    expect(Object.keys(prismBrandPacks)).toEqual(['blue', 'green', 'lavender', 'rose', 'peach']);
    deepFrozen(prismBrandPacks);
  });

  it('pins the public brand inks', () => {
    expect(prismBrandPacks.blue.ink).toEqual({ light: '#2563EB', dark: '#4C8DF6' });
    expect(prismBrandPacks.green.ink).toEqual({ light: '#117A3B', dark: '#22C55E' });
    expect(prismBrandPacks.lavender.ink).toEqual({ light: '#6A58CE', dark: '#9D8DF4' });
    expect(prismBrandPacks.rose.ink).toEqual({ light: '#BC3A6C', dark: '#F08CB4' });
    expect(prismBrandPacks.peach.ink).toEqual({ light: '#B04A17', dark: '#F2A05C' });
  });

  it('gives every pack distinct light and dark container surfaces', () => {
    const light = new Set(Object.values(prismBrandPacks).map((pack) => pack.surface.light));
    const dark = new Set(Object.values(prismBrandPacks).map((pack) => pack.surface.dark));
    expect(light.size).toBe(1);
    expect(dark.size).toBe(5);
    for (const pack of Object.values(prismBrandPacks)) {
      expect(pack.surface.light).toBe('#FFFFFF');
      expect(pack.surface.dark).not.toBe(pack.ground.dark);
    }
  });
});

describe('brand validation', () => {
  const validInput = (overrides: Partial<BrandPackInput> = {}): BrandPackInput => ({
    pack: 'blue',
    ink: { light: '#2563EB', dark: '#3B82F6' },
    ground: { light: '#F7F9FC', dark: '#0B1220' },
    surface: { light: '#FFFFFF', dark: '#11213F' },
    text: { light: '#1A2A4A', dark: '#E8EEF9' },
    hairline: { light: 'rgba(15, 23, 42, 0.08)', dark: 'rgba(147, 178, 255, 0.16)' },
    state: { success: '#15803D', info: '#2563EB', warning: '#B45309', error: '#DC2626' },
    ...overrides,
  });

  it('accepts all registered pack ids', () => {
    for (const pack of Object.keys(prismBrandPacks) as PrismPackId[]) {
      expect(() => defineBrandPack(validInput({ pack }))).not.toThrow();
    }
  });

  it('rejects low-contrast ink, text, and state values', () => {
    expect(() => defineBrandPack(validInput({ ink: { light: '#93C5FD', dark: '#3B82F6' } }))).toThrow(/ink\.light/);
    expect(() => defineBrandPack(validInput({ text: { light: '#1A2A4A', dark: '#1A2A4A' } }))).toThrow(/text\.dark/);
    expect(() => defineBrandPack(validInput({ state: { success: '#16A34A', info: '#2563EB', warning: '#B45309', error: '#DC2626' } }))).toThrow(/state\.success/);
  });

  it('rejects pure black and pure white grounds', () => {
    expect(() => defineBrandPack(validInput({ ground: { light: '#FFFFFF', dark: '#0B1220' } }))).toThrow(/pure white or black/);
  });
});

describe('resolved token tiers', () => {
  it('resolves mode-specific primitives and freezes them', () => {
    const light = resolvePrimitives('blue', 'light');
    const dark = resolvePrimitives('blue', 'dark');
    expect(light.colorInk).toBe('#2563EB');
    expect(dark.colorInk).toBe('#4C8DF6');
    expect(light.colorContainer).toBe('#FFFFFF');
    expect(dark.colorContainer).toBe('#0E2358');
    expect([light.shapeRadiusSm, light.shapeRadiusBase, light.shapeRadiusLg, light.shapeRadiusOuter]).toEqual([2, 4, 6, 4]);
    deepFrozen(light);
  });

  it('derives every neutral from the selected pack', () => {
    const green = resolveSemantics(resolvePrimitives('green', 'light'), 'light');
    const blue = resolveSemantics(resolvePrimitives('blue', 'light'), 'light');
    expect(green.textSecondary).not.toBe(blue.textSecondary);
    expect(green.hairlineFaint).not.toBe(blue.hairlineFaint);
    expect(green.accentLive).toMatch(/^rgba\(/);
    expect(green.accentLive).not.toBe(green.inkPrimary);
  });

  it('lifts dark surfaces as elevation increases', () => {
    for (const [pack, mode] of COMBOS.filter(([, selectedMode]) => selectedMode === 'dark')) {
      const theme = getPrismTheme(pack, mode);
      expect(theme.semantics.surfaceContainer).not.toBe(theme.semantics.surfaceGround);
      expect(theme.semantics.surfaceElevated).not.toBe(theme.semantics.surfaceContainer);
      expect(theme.semantics.surfacePopover).not.toBe(theme.semantics.surfaceElevated);
    }
  });

  it('keeps secondary and placeholder text above AA on every ground and container', () => {
    for (const [pack, mode] of COMBOS) {
      const theme = getPrismTheme(pack, mode);
      for (const background of [theme.semantics.surfaceGround, theme.semantics.surfaceContainer]) {
        const secondary = compositeRgba(theme.semantics.textSecondary, background);
        const tertiary = compositeRgba(theme.semantics.textTertiary, background);
        expect(contrastRatio(secondary, background), `${pack}/${mode} secondary`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(tertiary, background), `${pack}/${mode} tertiary`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps state labels above AA on their tinted surfaces', () => {
    const states = [
      ['success', 'stateSuccess', 'stateSuccessText'],
      ['warning', 'stateWarning', 'stateWarningText'],
      ['error', 'stateError', 'stateErrorText'],
      ['info', 'stateInfo', 'stateInfoText'],
    ] as const;
    for (const [pack, mode] of COMBOS) {
      const theme = getPrismTheme(pack, mode);
      for (const [name, hueKey, textKey] of states) {
        const surface = mixHex(theme.semantics[hueKey], theme.semantics.surfaceContainer, mode === 'light' ? 0.1 : 0.2);
        expect(contrastRatio(theme.semantics[textKey], surface), `${pack}/${mode} ${name}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe('PrismTheme CSS contract', () => {
  it('is deterministic, memoised, and deeply frozen', () => {
    for (const [pack, mode] of COMBOS) {
      const theme = createPrismTheme({ pack, mode });
      expect(theme).toBe(getPrismTheme(pack, mode));
      expect(JSON.stringify(theme)).toBe(JSON.stringify(getPrismTheme(pack, mode)));
      deepFrozen(theme);
    }
  });

  it('emits only Prism-owned custom properties', () => {
    const variables = getPrismTheme('rose', 'dark').cssVariables;
    expect(variables['--prism-primary']).toBe('#F08CB4');
    expect(variables['--prism-surface']).toBe('#361A3C');
    expect(variables['--prism-radius']).toBe('4px');
    expect(variables['--prism-duration-slow']).toBe('280ms');
    expect(Object.keys(variables).every((key) => key.startsWith('--prism-'))).toBe(true);
    expect(Object.keys(variables).some((key) => key.includes('antd'))).toBe(false);
  });

  it('flows semantic overrides into semantics and CSS variables', () => {
    const theme = createPrismTheme({
      pack: 'blue',
      mode: 'light',
      overrides: { semantics: { inkPrimary: '#123456', accentLive: 'rgba(18, 52, 86, 0.12)' } },
    });
    expect(theme.semantics.inkPrimary).toBe('#123456');
    expect(theme.cssVariables['--prism-primary']).toBe('#123456');
    expect(theme.cssVariables['--prism-accent']).toBe('rgba(18, 52, 86, 0.12)');
  });

  it('uses the stable class scheme', () => {
    for (const [pack, mode] of COMBOS) {
      expect(prismCssVarKey(pack, mode)).toBe(`prism-${pack}-${mode}`);
      expect(createPrismTheme({ pack, mode }).cssVarKey).toBe(`prism-${pack}-${mode}`);
    }
  });
});

describe('DTCG export', () => {
  it('emits resolved primitives and semantic aliases', () => {
    const light = toDtcg('blue', 'light');
    expect((light.primitive as any).color.ink.light.$value).toBe('#2563EB');
    expect((light.primitive as any).space.unit.$value).toBe('4px');
    expect((light.semantic as any).surface.ground.$value).toBe('{color.ground.light}');
    expect((light.semantic as any).ink.primary.$value).toBe('{color.ink.light}');
    expect((light.semantic as any).text.primary.$extensions['prism.css']).toEqual({ variable: '--prism-foreground' });
  });

  it('keeps semantic key parity across modes and avoids primitive-name collisions', () => {
    for (const pack of Object.keys(prismBrandPacks) as PrismPackId[]) {
      const light = toDtcg(pack, 'light');
      const dark = toDtcg(pack, 'dark');
      expect(leafPaths(light.semantic)).toEqual(leafPaths(dark.semantic));
      const primitive = new Set(leafPaths(light.primitive));
      expect(leafPaths(light.semantic).filter((path) => primitive.has(path))).toEqual([]);
    }
  });

  it('preserves the floating shadow and its CSS provenance', () => {
    const floating = (toDtcg('blue', 'light').primitive as any).elevation.floating.light;
    expect(floating.$value).toBe('0 4px 16px 0 rgba(11, 18, 32, 0.16)');
    expect(floating.$extensions['prism.css']).toEqual({ variable: '--prism-shadow' });
    expect(floating.$extensions['prism.shadow']).toMatchObject({ offsetY: '4px', blur: '16px', spread: '0px' });
  });

  it('stays in the stable DTCG subset and is deterministic', () => {
    const allowed = new Set(['$type', '$value', '$description', '$extensions']);
    const walk = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (key.startsWith('$')) expect(allowed.has(key)).toBe(true);
        walk(value);
      }
    };
    for (const [pack, mode] of COMBOS) {
      const output = toDtcg(pack, mode) satisfies PrismDtcgDocument;
      walk(output);
      expect(JSON.stringify(output)).toBe(JSON.stringify(toDtcg(pack, mode)));
    }
  });
});
