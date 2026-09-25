/**
 * Tier 1 — semantic derivation per mode (ADR-0002 §2b).
 * Named for meaning; the only tier components and apps consume.
 *
 * Every derived value is tinted from the pack's OWN primitives, so each pack
 * generates its own variant-tinted neutral atmosphere (ADR-0001) — no value in
 * this module is hardcoded to one pack's hue.
 */

import type { PrismMode, PrismPrimitiveTokens, PrismSemanticTokens } from './types.js';

/** '#RRGGBB' + alpha → `rgba(r, g, b, a)` — the tint of one of the pack's hex primitives. */
export function tintRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Mix two 6-digit hex colors in sRGB; `t` is the weight of `a`. */
export function mixHex(a: string, b: string, t: number): string {
  const channel = (offset: number): string => {
    const aChannel = Number.parseInt(a.slice(offset, offset + 2), 16);
    const bChannel = Number.parseInt(b.slice(offset, offset + 2), 16);
    return Math.round(aChannel * t + bChannel * (1 - t)).toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

export function resolveSemantics(primitives: PrismPrimitiveTokens, mode: PrismMode): PrismSemanticTokens {
  const light = mode === 'light';
  const ink = primitives.colorInk;
  const text = primitives.colorText;

  return {
    // Surfaces — dark stays pure seed for layout (ADR-0002 §3).
    surfaceGround: primitives.colorGround,
    surfaceContainer: primitives.colorSurface ?? primitives.colorGround,
    surfaceScrim: light ? 'rgba(15, 23, 42, 0.32)' : 'rgba(4, 10, 20, 0.72)',

    // Text — derived tints of the pack's own text base (no override).
    textPrimary: text,
    textSecondary: tintRgba(text, 0.68),
    textTertiary: tintRgba(text, 0.45),
    textFaint: tintRgba(text, 0.3),
    textOnInk: light ? '#FFFFFF' : '#0A0F1C',

    // The accent that owns live states is the ink itself (ADR-0001 §7).
    inkPrimary: ink,

    // Hairlines — strong is a primitive; faint is a lighter tint of the ink's hue.
    hairlineStrong: primitives.colorHairline,
    hairlineFaint: tintRgba(ink, light ? 0.06 : 0.1),

    // Live-state flood: a tinted wash of the accent, never solid ink —
    // selected/active surfaces must keep their text legible.
    accentLive: tintRgba(ink, light ? 0.1 : 0.2),
    focusRing: tintRgba(ink, light ? 0.35 : 0.55),

    // States — the hue is the seed; the text color is deliberately mode-aware.
    // antd's preset Tag paints the raw seed on its own derived wash, which is
    // below AA; the Prism tag recipe uses these dedicated text tokens instead
    // (ADR-0002 erratum 7).
    stateSuccess: primitives.colorSuccess,
    stateWarning: primitives.colorWarning,
    stateError: primitives.colorError,
    stateInfo: primitives.colorInfo,
    stateSuccessText: mixHex(primitives.colorSuccess, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),
    stateWarningText: mixHex(primitives.colorWarning, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),
    stateErrorText: mixHex(primitives.colorError, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),
    stateInfoText: mixHex(primitives.colorInfo, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),

    // Shape
    shapeRadiusSm: primitives.shapeRadiusSm.toString(),
    shapeRadiusBase: primitives.shapeRadiusBase.toString(),
    shapeRadiusLg: primitives.shapeRadiusLg.toString(),
    shapeRadiusOuter: primitives.shapeRadiusOuter.toString(),

    // Type
    typeFamily: primitives.typeFamilyUi,
    typeFamilyCode: primitives.typeFamilyMono,
    typeSize: primitives.typeSizeUi.toString(),
    typeWeight: primitives.typeWeightStrong.toString(),

    // Space
    spaceUnit: primitives.spaceUnit.toString(),
    spaceStep: primitives.spaceStep.toString(),

    // Motion
    motionDurationFast: primitives.motionDurationFast,
    motionDurationMid: primitives.motionDurationMid,
    motionDurationSlow: primitives.motionDurationSlow,
    motionCurveStandard: primitives.motionCurveStandard,
    motionCurveOpacity: primitives.motionCurveOpacity,

    // Elevation
    elevationFloating: primitives.elevationFloating,
    elevationNone: 'none',
  };
}
