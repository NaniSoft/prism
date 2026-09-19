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
    textOnInk: light ? '#FFFFFF' : '#0B1220',

    // The accent that owns live states is the ink itself (ADR-0001 §7).
    inkPrimary: ink,

    // Hairlines — strong is a primitive; faint is a lighter tint of the ink's hue.
    hairlineStrong: primitives.colorHairline,
    hairlineFaint: tintRgba(ink, light ? 0.06 : 0.1),

    // Live-state flood: a tinted wash of the accent, never solid ink —
    // selected/active surfaces must keep their text legible.
    accentLive: tintRgba(ink, light ? 0.1 : 0.2),
    focusRing: tintRgba(ink, light ? 0.35 : 0.55),

    // States
    stateSuccess: primitives.colorSuccess,
    stateWarning: primitives.colorWarning,
    stateError: primitives.colorError,
    stateInfo: primitives.colorInfo,

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
