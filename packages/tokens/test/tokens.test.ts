import { describe, expect, it } from 'vitest';
import {
  createPrismTheme,
  defineBrandPack,
  getPrismTheme,
  prismBrandPacks,
  prismCssVarKey,
  resolvePrimitives,
  resolveSemantics,
  toDtcg,
} from '../src/index.js';
import { mixHex } from '../src/semantics.js';
import type { BrandPackInput, PrismAntdMapKey, PrismDtcgDocument, PrismMode, PrismPackId } from '../src/types.js';

const COMBOS: Array<[PrismPackId, PrismMode]> = [
  ['blue', 'light'],
  ['blue', 'dark'],
  ['green', 'light'],
  ['green', 'dark'],
  ['lavender', 'light'],
  ['lavender', 'dark'],
  ['rose', 'light'],
  ['rose', 'dark'],
  ['peach', 'light'],
  ['peach', 'dark'],
];

// antd's dark algorithm lifts colorBgBase by 8% into colorBgContainer. These
// are the rendered dark containers the tag recipe actually mixes into; keeping
// the small contract table local preserves prism-tokens' zero-antd dependency.
const DARK_CONTAINERS: Record<PrismPackId, string> = {
  blue: '#0E2358',
  green: '#133A26',
  lavender: '#1D1545',
  rose: '#361A3C',
  peach: '#402613',
};

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const fgLuminance = luminance(fg);
  const bgLuminance = luminance(bg);
  return (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
}

// The closed map-token allowlist, mirrored for runtime assertions. The
// exhaustiveness checks below fail compilation if the union grows without
// this list being updated (ADR-0002 §2c: the allowlist is closed).
const ANTD_MAP_KEYS = [
  'borderRadiusSM',
  'borderRadiusLG',
  'motionDurationSlow',
  'colorBgLayout',
  'colorBgMask',
  'colorBorder',
  'colorBorderSecondary',
  'colorSplit',
  'colorPrimaryBorder',
  'colorSuccessText',
  'colorWarningText',
  'colorErrorText',
  'colorInfoText',
  'controlItemBgActive',
  'controlItemBgActiveHover',
  'colorBgTextActive',
  'colorPrimaryTextActive',
  'controlOutline',
  'colorTextPlaceholder',
  'boxShadow',
  'boxShadowSecondary',
  'boxShadowTertiary',
] as const satisfies readonly PrismAntdMapKey[];
type _MissingKeys = Exclude<PrismAntdMapKey, (typeof ANTD_MAP_KEYS)[number]>;
declare const _exhaustive: _MissingKeys extends never ? true : 'allowlist union grew — update ANTD_MAP_KEYS';

function deepFreezeCheck(value: unknown): void {
  expect(Object.isFrozen(value)).toBe(true);
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) deepFreezeCheck(child);
  }
}

/** Sorted leaf paths of a DTCG tree. */
function leafPaths(tree: unknown, prefix = ''): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
    const p = prefix ? `${prefix}/${key}` : key;
    if (value && typeof value === 'object' && '$type' in (value as object)) out.push(p);
    else out.push(...leafPaths(value, p));
  }
  return out.sort();
}

// ──────────────────────────────────────────────────────────────────────────────
// Brand packs — pinned inks, validation, freezing
// ──────────────────────────────────────────────────────────────────────────────

describe('brand packs', () => {
  it('registers the five pastel packs, deeply frozen', () => {
    expect(Object.keys(prismBrandPacks)).toEqual(['blue', 'green', 'lavender', 'rose', 'peach']);
    deepFreezeCheck(prismBrandPacks);
  });

  it('pins the brand-ink hexes (ADR-0002 open question 7, reforged per ADR-0005)', () => {
    expect(prismBrandPacks.blue.ink).toEqual({ light: '#2563EB', dark: '#4C8DF6' });
    expect(prismBrandPacks.green.ink).toEqual({ light: '#117A3B', dark: '#22C55E' });
    expect(prismBrandPacks.lavender.ink).toEqual({ light: '#6A58CE', dark: '#9D8DF4' });
    expect(prismBrandPacks.rose.ink).toEqual({ light: '#BC3A6C', dark: '#F08CB4' });
    expect(prismBrandPacks.peach.ink).toEqual({ light: '#B04A17', dark: '#F2A05C' });
  });

  it('carves the state bands per ADR-0001 §8 (success joins the green pack)', () => {
    expect(prismBrandPacks.blue.state.success).toBe('#15803D');
    expect(prismBrandPacks.blue.state.warning).toBe('#B45309');
    expect(prismBrandPacks.blue.state.info).toBe(prismBrandPacks.blue.ink.light);
    for (const pack of ['green', 'lavender', 'rose', 'peach'] as const) {
      expect(prismBrandPacks[pack].state.info).toBe('#2563EB');
    }
  });

  it('carries the shared cool shadow with an explicit 0 spread', () => {
    for (const pack of Object.keys(prismBrandPacks) as PrismPackId[]) {
      expect(prismBrandPacks[pack].elevation.floatingLight).toBe('0 4px 16px 0 rgba(11, 18, 32, 0.16)');
      expect(prismBrandPacks[pack].elevation.floatingDark).toBe('0 4px 16px 0 rgba(11, 18, 32, 0.24)');
    }
  });

  it('tints hairlines per pack (variant-tinted neutrals, ADR-0001)', () => {
    expect(prismBrandPacks.blue.hairline.dark).toBe('rgba(158, 191, 255, 0.18)');
    expect(prismBrandPacks.green.hairline.dark).toBe('rgba(134, 239, 172, 0.16)');
    expect(prismBrandPacks.lavender.hairline.dark).toBe('rgba(157, 141, 244, 0.17)');
    expect(prismBrandPacks.rose.hairline.dark).toBe('rgba(240, 140, 180, 0.17)');
    expect(prismBrandPacks.peach.hairline.dark).toBe('rgba(242, 160, 92, 0.17)');
    for (const [a, b] of [
      ['blue', 'green'],
      ['blue', 'lavender'],
      ['rose', 'peach'],
    ] as const) {
      expect(prismBrandPacks[a].hairline.light).not.toBe(prismBrandPacks[b].hairline.light);
    }
  });
});

describe('AA contrast gate at defineBrandPack()', () => {
  const validInput = (over: Partial<BrandPackInput>): BrandPackInput => ({
    pack: 'blue',
    ink: { light: '#2563EB', dark: '#3B82F6' },
    ground: { light: '#F7F9FC', dark: '#0B1220' },
    surface: { light: '#FFFFFF' },
    text: { light: '#1A2A4A', dark: '#E8EEF9' },
    hairline: { light: 'rgba(15, 23, 42, 0.08)', dark: 'rgba(147, 178, 255, 0.16)' },
    state: { success: '#15803D', info: '#2563EB', warning: '#B45309', error: '#DC2626' },
    ...over,
  });

  it('accepts all five registered packs', () => {
    for (const pack of Object.keys(prismBrandPacks) as PrismPackId[]) {
      expect(() => defineBrandPack(validInput({ pack }))).not.toThrow();
    }
  });

  it('rejects ink that fails AA on the light ground', () => {
    expect(() => defineBrandPack(validInput({ ink: { light: '#93C5FD', dark: '#3B82F6' } }))).toThrow(/fails WCAG AA/);
  });

  it('rejects ink that fails AA on the beam-dark ground', () => {
    expect(() => defineBrandPack(validInput({ ink: { light: '#2563EB', dark: '#1D4ED8' } }))).toThrow(/fails WCAG AA/);
  });

  it('rejects text that fails AA on its surface (the gate is text-on-surface, not just ink)', () => {
    expect(() => defineBrandPack(validInput({ text: { light: '#93B2FF', dark: '#E8EEF9' } }))).toThrow(/fails WCAG AA/);
    expect(() => defineBrandPack(validInput({ text: { light: '#1A2A4A', dark: '#1A2A4A' } }))).toThrow(/fails WCAG AA/);
  });

  it('rejects state hues that fail AA as text on the surface', () => {
    expect(() =>
      defineBrandPack(validInput({ state: { success: '#16A34A', info: '#2563EB', warning: '#B45309', error: '#DC2626' } })),
    ).toThrow(/state\.success on surface\.light .* fails WCAG AA/);
  });

  it('rejects state hues that fall below the UI floor on the beam ground', () => {
    expect(() =>
      defineBrandPack(validInput({ state: { success: '#166534', info: '#2563EB', warning: '#B45309', error: '#DC2626' } })),
    ).toThrow(/state\.success on ground\.dark .* fails WCAG AA large/);
  });

  it('rejects pure black or white grounds (beam rule)', () => {
    expect(() => defineBrandPack(validInput({ ground: { light: '#FFFFFF', dark: '#0B1220' } }))).toThrow(/pure white or black/);
  });

  it('freezes the registered output', () => {
    deepFreezeCheck(defineBrandPack(validInput({ pack: 'blue' })));
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Tier 0 — mode-resolved primitives
// ──────────────────────────────────────────────────────────────────────────────

describe('resolvePrimitives(pack, mode)', () => {
  it('resolves primitives FOR a mode (ADR-0002 §1b)', () => {
    const light = resolvePrimitives('blue', 'light');
    const dark = resolvePrimitives('blue', 'dark');
    expect(light.colorInk).toBe('#2563EB');
    expect(dark.colorInk).toBe('#4C8DF6');
    expect(light.colorGround).toBe('#EEF3FC');
    expect(dark.colorGround).toBe('#0D1730');
    expect(light.colorHairline).toBe('rgba(30, 64, 158, 0.10)');
    expect(dark.colorHairline).toBe('rgba(158, 191, 255, 0.18)');
    expect(light.elevationFloating).toContain('0.16');
    expect(dark.elevationFloating).toContain('0.24');
  });

  it('carries the container primitive in light mode only (ADR-0002 §3)', () => {
    expect(resolvePrimitives('blue', 'light').colorSurface).toBe('#FFFFFF');
    expect(resolvePrimitives('blue', 'dark').colorSurface).toBeUndefined();
  });

  it('resolves the radius family and grid numerically', () => {
    const p = resolvePrimitives('green', 'light');
    expect([p.shapeRadiusSm, p.shapeRadiusBase, p.shapeRadiusLg, p.shapeRadiusOuter]).toEqual([2, 4, 6, 4]);
    expect(p.spaceUnit).toBe(4);
    expect(p.typeSizeUi).toBe(14);
  });

  it('returns frozen plain data', () => {
    deepFreezeCheck(resolvePrimitives('green', 'dark'));
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Tier 1 — pack-aware semantics
// ──────────────────────────────────────────────────────────────────────────────

describe('resolveSemantics(primitives, mode)', () => {
  it('mixes state text toward the requested endpoint with 8-bit hex rounding', () => {
    expect(mixHex('#15803D', '#000000', 0.95)).toBe('#147A3A');
    expect(mixHex('#15803D', '#FFFFFF', 0.5)).toBe('#8AC09E');
  });

  it('derives text tints from the pack’s own text base — not a hardcoded hue', () => {
    const green = resolveSemantics(resolvePrimitives('green', 'light'), 'light');
    const blue = resolveSemantics(resolvePrimitives('blue', 'light'), 'light');
    // Green text #162A1A at 0.68 — proves the derivation tracks the pack.
    expect(green.textSecondary).toBe('rgba(22, 42, 26, 0.68)');
    expect(blue.textSecondary).toBe('rgba(26, 42, 74, 0.68)');
    expect(green.textTertiary).toBe('rgba(22, 42, 26, 0.45)');
    expect(green.textFaint).toBe('rgba(22, 42, 26, 0.3)');
  });

  it('derives the focus ring from the pack’s own ink', () => {
    expect(resolveSemantics(resolvePrimitives('blue', 'light'), 'light').focusRing).toBe('rgba(37, 99, 235, 0.35)');
    expect(resolveSemantics(resolvePrimitives('blue', 'dark'), 'dark').focusRing).toBe('rgba(76, 141, 246, 0.55)');
    expect(resolveSemantics(resolvePrimitives('green', 'light'), 'light').focusRing).toBe('rgba(17, 122, 59, 0.35)');
    expect(resolveSemantics(resolvePrimitives('lavender', 'light'), 'light').focusRing).toBe('rgba(106, 88, 206, 0.35)');
  });

  it('keeps the accent flood a TINT of the ink — never solid ink', () => {
    for (const [pack, mode] of COMBOS) {
      const s = resolveSemantics(resolvePrimitives(pack, mode), mode);
      expect(s.accentLive).not.toBe(s.inkPrimary);
      expect(s.accentLive).toMatch(/rgba\(/);
    }
    expect(resolveSemantics(resolvePrimitives('blue', 'light'), 'light').accentLive).toBe('rgba(37, 99, 235, 0.1)');
  });

  it('resolves surfaces per mode (dark container = ground, ADR-0002 §3)', () => {
    const dark = resolveSemantics(resolvePrimitives('blue', 'dark'), 'dark');
    expect(dark.surfaceContainer).toBe(dark.surfaceGround);
    expect(dark.surfaceGround).toBe('#0D1730');
  });

  it('keeps every mode-aware state-tag label at WCAG AA on its washed surface', () => {
    const states = [
      ['success', 'stateSuccess', 'stateSuccessText'],
      ['warning', 'stateWarning', 'stateWarningText'],
      ['error', 'stateError', 'stateErrorText'],
      ['info', 'stateInfo', 'stateInfoText'],
    ] as const;

    for (const [pack, mode] of COMBOS) {
      const theme = createPrismTheme({ pack, mode });
      const container = mode === 'light' ? theme.semantics.surfaceContainer : DARK_CONTAINERS[pack];
      const wash = mode === 'light' ? 0.1 : 0.22;

      for (const [state, hueKey, textKey] of states) {
        const surface = mixHex(theme.semantics[hueKey], container, wash);
        const ratio = contrastRatio(theme.semantics[textKey], surface);
        expect(ratio, `${pack}/${mode} ${state} state tag`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// The antd lane
// ──────────────────────────────────────────────────────────────────────────────

describe('createPrismTheme — antd lane', () => {
  it('keeps numeric seeds numeric — strings would poison antd’s derivation', () => {
    for (const [pack, mode] of COMBOS) {
      const token = createPrismTheme({ pack, mode }).antd.token;
      expect(token.borderRadius).toBe(4);
      expect(token.lineWidth).toBe(1);
      expect(token.sizeUnit).toBe(4);
      expect(token.sizeStep).toBe(4);
      expect(token.motionUnit).toBe(0.08);
      expect(token.motionBase).toBe(0);
      expect(token.fontSize).toBe(14);
      expect(token.fontWeightStrong).toBe(600);
    }
  });

  it('emits only allowlisted map keys, and always the two math-backed ones', () => {
    expect(ANTD_MAP_KEYS).toHaveLength(22);
    for (const [pack, mode] of COMBOS) {
      const token = createPrismTheme({ pack, mode }).antd.token as Record<string, unknown>;
      const emitted = Object.keys(token).filter((k): k is PrismAntdMapKey => ANTD_MAP_KEYS.includes(k as PrismAntdMapKey));
      for (const key of emitted) expect(ANTD_MAP_KEYS).toContain(key);
      expect(token.borderRadiusSM).toBe(2);
      expect(token.borderRadiusLG).toBe(6);
      expect(token.motionDurationSlow).toBe('280ms');
    }
  });

  it('sets colorBgLayout in light mode only — dark stays pure seed (ADR-0002 §3)', () => {
    const light = createPrismTheme({ pack: 'blue', mode: 'light' }).antd.token;
    const dark = createPrismTheme({ pack: 'blue', mode: 'dark' }).antd.token as Record<string, unknown>;
    expect(light.colorBgLayout).toBe('#EEF3FC');
    expect('colorBgLayout' in dark).toBe(false);
  });

  it('bases light mode on the container and dark on the ground (ADR-0002 §3)', () => {
    expect(createPrismTheme({ pack: 'blue', mode: 'light' }).antd.token.colorBgBase).toBe('#FFFFFF');
    expect(createPrismTheme({ pack: 'blue', mode: 'dark' }).antd.token.colorBgBase).toBe('#0D1730');
  });

  it('routes every state-tag text map token to its mode-aware semantic', () => {
    for (const [pack, mode] of COMBOS) {
      const theme = createPrismTheme({ pack, mode });
      expect(theme.antd.token.colorSuccessText).toBe(theme.semantics.stateSuccessText);
      expect(theme.antd.token.colorWarningText).toBe(theme.semantics.stateWarningText);
      expect(theme.antd.token.colorErrorText).toBe(theme.semantics.stateErrorText);
      expect(theme.antd.token.colorInfoText).toBe(theme.semantics.stateInfoText);
    }
  });

  it('caps the accent flood and shadow per mode', () => {
    const light = createPrismTheme({ pack: 'green', mode: 'light' }).antd.token;
    expect(light.controlItemBgActive).toBe('rgba(17, 122, 59, 0.1)');
    expect(light.boxShadow).toBe('0 4px 16px 0 rgba(11, 18, 32, 0.16)');
    expect(light.boxShadowSecondary).toBe('none');
  });

  it('hashes nothing and names the cssVar key (ADR-0002 §1c)', () => {
    const antd = createPrismTheme({ pack: 'green', mode: 'dark' }).antd;
    expect(antd.hashed).toBe(false);
    expect(antd.cssVar).toEqual({ key: 'prism-green-dark', prefix: 'prism' });
  });

  it('zeroes component shadows without algorithm: true (ADR-0002 §2c erratum 3)', () => {
    const theme = createPrismTheme({ pack: 'blue', mode: 'light' });
    const components = theme.antd.components;
    expect(components.Button).toEqual({
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
      primaryColor: theme.semantics.textOnInk,
    });
    expect(components.Input).toEqual({ activeShadow: 'none', errorActiveShadow: 'none', warningActiveShadow: 'none' });
    // The algorithm flag is what discards the pack's map-token hairlines — a flat
    // patch is required for component scopes to inherit the tinted border values.
    expect('algorithm' in components.Button).toBe(false);
    expect('algorithm' in components.Input).toBe(false);
  });

  it('routes the solid-button label to textOnInk (white in light, dark ink in beam-dark)', () => {
    // antd's default is colorTextLightSolid (#fff), which fails AA on every
    // lightened beam-dark ink (blue 4.18:1, peach 3.62:1).
    for (const [pack, mode] of COMBOS) {
      const theme = createPrismTheme({ pack, mode });
      expect(theme.antd.components.Button.primaryColor).toBe(theme.semantics.textOnInk);
      expect(theme.semantics.textOnInk).toBe(mode === 'light' ? '#FFFFFF' : '#0A0F1C');
    }
  });

  it('routes antd’s hardcoded focus outline through the ink, not its mid-tint border (erratum 6)', () => {
    for (const [pack, mode] of COMBOS) {
      const token = createPrismTheme({ pack, mode }).antd.token;
      expect(token.colorPrimaryBorder).toBe(createPrismTheme({ pack, mode }).semantics.inkPrimary);
    }
  });

  it('pins antd’s overshoot easing presets to the single brand curve (bounce is banned)', () => {
    for (const [pack, mode] of COMBOS) {
      const token = createPrismTheme({ pack, mode }).antd.token;
      expect(token.motionEaseOutBack).toBe('cubic-bezier(0.25, 1, 0.5, 1)');
      expect(token.motionEaseInBack).toBe('cubic-bezier(0.25, 1, 0.5, 1)');
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PrismTheme contracts
// ──────────────────────────────────────────────────────────────────────────────

describe('PrismTheme contracts', () => {
  it('deep-freezes the whole theme — primitives, semantics, and antd', () => {
    for (const [pack, mode] of COMBOS) deepFreezeCheck(createPrismTheme({ pack, mode }));
  });

  it('is deterministic: same inputs → deep-equal output', () => {
    for (const [pack, mode] of COMBOS) {
      expect(JSON.stringify(createPrismTheme({ pack, mode }))).toBe(JSON.stringify(createPrismTheme({ pack, mode })));
    }
  });

  it('memoises the no-override case (getPrismTheme returns the cached instance)', () => {
    expect(getPrismTheme('blue', 'dark')).toBe(getPrismTheme('blue', 'dark'));
    expect(getPrismTheme('blue', 'dark')).not.toBe(getPrismTheme('green', 'dark'));
  });

  it('flows semantic overrides into the antd lane, not just tier 1', () => {
    const theme = createPrismTheme({
      pack: 'blue',
      mode: 'light',
      overrides: { semantics: { accentLive: 'rgba(220, 38, 38, 0.1)' } },
    });
    expect(theme.semantics.accentLive).toBe('rgba(220, 38, 38, 0.1)');
    expect(theme.antd.token.controlItemBgActive).toBe('rgba(220, 38, 38, 0.1)');
  });

  it('names the cssVar key after pack and mode (ADR-0002 §1c)', () => {
    for (const [pack, mode] of COMBOS) {
      expect(prismCssVarKey(pack, mode)).toBe(`prism-${pack}-${mode}`);
      expect(createPrismTheme({ pack, mode }).cssVarKey).toBe(`prism-${pack}-${mode}`);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// DTCG export (ADR-0002 §2d + ticket-14 research)
// ──────────────────────────────────────────────────────────────────────────────

describe('toDtcg', () => {
  it('ships tier 0 as resolved values with unit-ful strings', () => {
    const doc = toDtcg('blue', 'light');
    const ink = (doc.primitive as any).color.ink;
    expect(ink.light).toMatchObject({ $type: 'color', $value: '#2563EB' });
    expect((doc.primitive as any).space.unit.$value).toBe('4px');
    expect((doc.primitive as any).shape.radius.sm.$value).toBe('2px');
    expect((doc.primitive as any).motion.duration.slow.$value).toBe('280ms');
    expect((doc.primitive as any).type.size.ui.$value).toBe('14px');
  });

  it('ships tier 1 as DTCG alias strings into the primitive paths', () => {
    const doc = toDtcg('blue', 'dark');
    const semantic = doc.semantic as any;
    expect(semantic.surface.ground.$value).toBe('{color.ground.dark}');
    expect(semantic.ink.primary.$value).toBe('{color.ink.dark}');
    expect(semantic.text.primary.$value).toBe('{color.text.dark}');
    expect(semantic.state.success.$value).toBe('{color.success}');
    expect(semantic.state.successText.$value).toBe('#8AC09E');
    expect(semantic.state.successText.$extensions['prism.antd']).toEqual({ map: 'colorSuccessText' });
    expect(semantic.state.warningText.$value).toMatch(/^#[0-9A-F]{6}$/);
    expect(semantic.state.errorText.$value).toMatch(/^#[0-9A-F]{6}$/);
    expect(semantic.state.infoText.$value).toMatch(/^#[0-9A-F]{6}$/);
    expect(semantic.radius.base.$value).toBe('{shape.radius.base}');
    expect(semantic.typography.family.ui.$value).toBe('{type.family.ui}');
    expect(semantic.spacing.unit.$value).toBe('{space.unit}');
    expect(semantic.motion.timing.slow.$value).toBe('{motion.duration.slow}');
    // Derived tokens have no primitive target — they ship resolved values.
    expect(semantic.surface.scrim.$value).toMatch(/^rgba\(/);
    expect(semantic.text.secondary.$value).toMatch(/^rgba\(/);
    expect(semantic.focus.ring.$value).toMatch(/^rgba\(/);
    expect(semantic.elevation.none.$value).toBe('none');
  });

  it('disambiguates tier-1 names from tier-0 paths (name-based alias lookup)', () => {
    for (const [pack] of COMBOS) {
      const light = toDtcg(pack, 'light');
      const primitive = new Set(leafPaths(light.primitive));
      const collisions = leafPaths(light.semantic).filter((p) => primitive.has(p));
      expect(collisions).toEqual([]);
    }
  });

  it('holds per-mode key parity across the tier-1 trees', () => {
    for (const pack of Object.keys(prismBrandPacks) as PrismPackId[]) {
      expect(leafPaths(toDtcg(pack, 'light').semantic)).toEqual(leafPaths(toDtcg(pack, 'dark').semantic));
    }
  });

  it('emits the floating shadow as a STRING token with the composite in $extensions["prism.shadow"]', () => {
    const floating = (toDtcg('blue', 'light').primitive as any).elevation.floating.light;
    expect(floating.$type).toBe('string');
    expect(floating.$value).toBe('0 4px 16px 0 rgba(11, 18, 32, 0.16)');
    expect(floating.$extensions['prism.shadow']).toEqual({
      $type: 'shadow',
      color: '#0B122029',
      offsetX: '0px',
      offsetY: '4px',
      blur: '16px',
      spread: '0px',
      inset: false,
    });
    expect(floating.$extensions['prism.antd']).toEqual({ map: 'boxShadow' });
    // The semantic alias rides along for Dev Mode parity.
    const semanticFloating = (toDtcg('blue', 'dark').semantic as any).elevation.floating;
    expect(semanticFloating.$type).toBe('string');
    expect(semanticFloating.$value).toBe('{elevation.floating.dark}');
  });

  it('stays within the stable 2023-07 subset', () => {
    const ALLOWED = new Set(['$type', '$value', '$description', '$extensions']);
    const walk = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (key.startsWith('$')) expect(ALLOWED.has(key)).toBe(true);
        walk(value);
      }
    };
    for (const [pack, mode] of COMBOS) walk(toDtcg(pack, mode) satisfies PrismDtcgDocument);
  });

  it('is deterministic: same pack/mode → byte-identical output', () => {
    for (const [pack, mode] of COMBOS) {
      expect(JSON.stringify(toDtcg(pack, mode))).toBe(JSON.stringify(toDtcg(pack, mode)));
    }
  });
});
