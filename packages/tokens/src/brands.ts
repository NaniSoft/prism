/**
 * Brand pack definitions and validation (ADR-0002 §4).
 * Packs are data, validated at definition time, deep-frozen on registration.
 */

import type { BrandPack, BrandPackInput, PrismPackId } from './types.js';

// ──────────────────────────────────────────────────────────────────────────────
// Brand hexes — the pastel spectrum (ADR-0005). Five packs, one voice: pastel-
// tinted grounds, hairlines, and washes carry the colour; each ink stays a
// mid-tone of its hue so the AA gate holds (ink doubles as body-link color in
// light mode, 4.5:1). Dark-mode inks are lightened one step for the beam ground.
// The founding hues keep their ids (blue, green) — only their atmosphere is
// reforged — so the published PrismPackId API stays additive.
// ──────────────────────────────────────────────────────────────────────────────

const BLUE_INK_LIGHT = '#2563EB'; // azure — 4.64:1 on the pastel sky ground
const BLUE_INK_DARK = '#4C8DF6'; // lightened azure for the dusk-blue beam ground

const GREEN_INK_LIGHT = '#117A3B'; // spring green — 4.88:1 on the pastel mint ground
const GREEN_INK_DARK = '#22C55E'; // lightened spring for the deep-spruce beam ground

const LAVENDER_INK_LIGHT = '#6A58CE'; // violet — 4.81:1 on the pale lilac ground
const LAVENDER_INK_DARK = '#9D8DF4'; // lightened violet for the ultraviolet beam ground

const ROSE_INK_LIGHT = '#BC3A6C'; // magenta-rose — 4.80:1 on the pale blush ground
const ROSE_INK_DARK = '#F08CB4'; // lightened rose for the wine-plum beam ground

const PEACH_INK_LIGHT = '#B04A17'; // coral terracotta — 4.98:1 on the peach-cream ground
const PEACH_INK_DARK = '#F2A05C'; // lightened apricot for the amber-dusk beam ground

// ──────────────────────────────────────────────────────────────────────────────
// Shared tier-0 constants — the system shape a pack cannot change (ADR-0002 §4).
// The floating shadow is the single cool-tinted shadow (ADR-0001 §3); the CSS
// string carries an explicit `0` spread and is byte-identical across the antd
// boxShadow map token, prism-ui CSS, and the DTCG STRING export.
// ──────────────────────────────────────────────────────────────────────────────

const SHARED = {
  typeFamilyUi:
    '"Archivo Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  typeFamilyMono:
    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  typeSizeUi: 14,
  typeWeightStrong: 600,
  motionDurationFast: '80ms',
  motionDurationMid: '160ms',
  motionDurationSlow: '280ms',
  motionCurveStandard: 'cubic-bezier(0.25, 1, 0.5, 1)',
  motionCurveOpacity: 'linear',
  elevationFloatingLight: '0 4px 16px 0 rgba(11, 18, 32, 0.16)',
  elevationFloatingDark: '0 4px 16px 0 rgba(11, 18, 32, 0.24)',
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Brand pack inputs. Hairlines are variant-tinted (ADR-0001: each pack generates
// its own neutral atmosphere) — every pack tints its hairlines from its own hue
// at the same alphas, so a pack is a full re-expression, not a repainted primary.
// Surfaces stay white: components float as crisp islands on the pastel ground.
// State hues are shared (success green, warning amber, error red, info blue)
// so meaning stays constant across the spectrum (ADR-0001 §8).
// ──────────────────────────────────────────────────────────────────────────────

const bluePackInput: BrandPackInput = {
  pack: 'blue',
  ink: { light: BLUE_INK_LIGHT, dark: BLUE_INK_DARK },
  ground: { light: '#EEF3FC', dark: '#0D1730' },
  surface: { light: '#FFFFFF' },
  text: { light: '#1A2A4A', dark: '#E8EEF9' },
  hairline: { light: 'rgba(30, 64, 158, 0.10)', dark: 'rgba(158, 191, 255, 0.18)' },
  state: { success: '#16A34A', info: BLUE_INK_LIGHT, warning: '#D97706', error: '#DC2626' },
};

const greenPackInput: BrandPackInput = {
  pack: 'green',
  ink: { light: GREEN_INK_LIGHT, dark: GREEN_INK_DARK },
  ground: { light: '#E9F6EF', dark: '#0C1812' },
  surface: { light: '#FFFFFF' },
  text: { light: '#162A1A', dark: '#E8EEF9' },
  hairline: { light: 'rgba(17, 90, 47, 0.10)', dark: 'rgba(134, 239, 172, 0.16)' },
  state: { success: '#16A34A', info: '#2563EB', warning: '#D97706', error: '#DC2626' },
};

const lavenderPackInput: BrandPackInput = {
  pack: 'lavender',
  ink: { light: LAVENDER_INK_LIGHT, dark: LAVENDER_INK_DARK },
  ground: { light: '#F2F1FB', dark: '#131022' },
  surface: { light: '#FFFFFF' },
  text: { light: '#262044', dark: '#ECE9FA' },
  hairline: { light: 'rgba(84, 70, 176, 0.10)', dark: 'rgba(157, 141, 244, 0.17)' },
  state: { success: '#16A34A', info: '#2563EB', warning: '#D97706', error: '#DC2626' },
};

const rosePackInput: BrandPackInput = {
  pack: 'rose',
  ink: { light: ROSE_INK_LIGHT, dark: ROSE_INK_DARK },
  ground: { light: '#FBF1F5', dark: '#1A111C' },
  surface: { light: '#FFFFFF' },
  text: { light: '#331B29', dark: '#F9EAF1' },
  hairline: { light: 'rgba(150, 48, 92, 0.10)', dark: 'rgba(240, 140, 180, 0.17)' },
  state: { success: '#16A34A', info: '#2563EB', warning: '#D97706', error: '#DC2626' },
};

const peachPackInput: BrandPackInput = {
  pack: 'peach',
  ink: { light: PEACH_INK_LIGHT, dark: PEACH_INK_DARK },
  ground: { light: '#FBF3EA', dark: '#1D140D' },
  surface: { light: '#FFFFFF' },
  text: { light: '#3A241A', dark: '#FAF0E4' },
  hairline: { light: 'rgba(146, 62, 24, 0.10)', dark: 'rgba(242, 160, 92, 0.17)' },
  state: { success: '#16A34A', info: '#2563EB', warning: '#D97706', error: '#DC2626' },
};

// ──────────────────────────────────────────────────────────────────────────────
// Validation — runs at defineBrandPack() time, fails the build on violation.
// ──────────────────────────────────────────────────────────────────────────────

function luminance(hex: string): number {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number): number => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function validateBrandPack(input: BrandPackInput): void {
  const { pack, ink, ground, surface, text } = input;

  // 1. Text-on-surface contrast (ADR-0002 §4: 4.5:1 body).
  const pairs: Array<[string, string, number]> = [
    ['text.light', 'ground.light', contrastRatio(text.light, ground.light)],
    ['text.light', 'surface.light', contrastRatio(text.light, surface.light)],
    ['text.dark', 'ground.dark', contrastRatio(text.dark, ground.dark)],
  ];
  for (const [fgName, bgName, ratio] of pairs) {
    if (ratio < 4.5) {
      throw new Error(`Brand pack "${pack}": ${fgName} on ${bgName} contrast ${ratio.toFixed(2)}:1 fails WCAG AA (4.5:1)`);
    }
  }

  // 2. Ink-as-UI-color contrast against its grounds (3:1 large/UI);
  //    light mode is held to 4.5:1 because the ink doubles as body-link color.
  const inkLight = contrastRatio(ink.light, ground.light);
  if (inkLight < 4.5) {
    throw new Error(`Brand pack "${pack}": ink.light vs ground.light contrast ${inkLight.toFixed(2)}:1 fails WCAG AA (4.5:1)`);
  }
  const inkDark = contrastRatio(ink.dark, ground.dark);
  if (inkDark < 3) {
    throw new Error(`Brand pack "${pack}": ink.dark vs ground.dark contrast ${inkDark.toFixed(2)}:1 fails WCAG AA large (3:1)`);
  }

  // 3. No ground is pure black or pure white (beam rule).
  for (const mode of ['light', 'dark'] as const) {
    const g = ground[mode].toUpperCase();
    if (g === '#FFFFFF' || g === '#000000') {
      throw new Error(`Brand pack "${pack}": ground.${mode} must not be pure white or black`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Build BrandPack from validated input — merge shared constants, deep-freeze.
// ──────────────────────────────────────────────────────────────────────────────

function buildBrandPack(input: BrandPackInput): BrandPack {
  validateBrandPack(input);

  const pack: BrandPack = {
    pack: input.pack,
    ink: { light: input.ink.light, dark: input.ink.dark },
    ground: { light: input.ground.light, dark: input.ground.dark },
    surface: { light: input.surface.light },
    text: { light: input.text.light, dark: input.text.dark },
    hairline: { light: input.hairline.light, dark: input.hairline.dark },
    state: { success: input.state.success, info: input.state.info, warning: input.state.warning, error: input.state.error },
    type: {
      familyUi: input.type?.familyUi ?? SHARED.typeFamilyUi,
      familyMono: input.type?.familyMono ?? SHARED.typeFamilyMono,
      sizeUi: input.type?.sizeUi ?? SHARED.typeSizeUi,
      weightStrong: input.type?.weightStrong ?? SHARED.typeWeightStrong,
    },
    motion: {
      durationFast: input.motion?.durationFast ?? SHARED.motionDurationFast,
      durationMid: input.motion?.durationMid ?? SHARED.motionDurationMid,
      durationSlow: input.motion?.durationSlow ?? SHARED.motionDurationSlow,
      curveStandard: input.motion?.curveStandard ?? SHARED.motionCurveStandard,
      curveOpacity: input.motion?.curveOpacity ?? SHARED.motionCurveOpacity,
    },
    elevation: {
      floatingLight: input.elevation?.floatingLight ?? SHARED.elevationFloatingLight,
      floatingDark: input.elevation?.floatingDark ?? SHARED.elevationFloatingDark,
    },
  };

  // Deep freeze for runtime immutability (ADR-0002 §4: frozen on registration).
  for (const value of Object.values(pack)) {
    if (typeof value === 'object' && value !== null) Object.freeze(value);
  }
  return Object.freeze(pack);
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Validates, freezes, and returns a brand pack. Call once per pack at module
 * load; throws on validation failure.
 */
export function defineBrandPack(input: BrandPackInput): BrandPack {
  return buildBrandPack(input);
}

/** The five registered, validated, frozen brand packs (ADR-0005). */
export const prismBrandPacks: Readonly<Record<PrismPackId, BrandPack>> = Object.freeze({
  blue: defineBrandPack(bluePackInput),
  green: defineBrandPack(greenPackInput),
  lavender: defineBrandPack(lavenderPackInput),
  rose: defineBrandPack(rosePackInput),
  peach: defineBrandPack(peachPackInput),
});

export {
  bluePackInput,
  greenPackInput,
  lavenderPackInput,
  rosePackInput,
  peachPackInput,
};
