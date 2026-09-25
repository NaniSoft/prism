// Tier 1 — semantic derivation. Every neutral is tinted from the selected pack,
// so each expression is a complete atmosphere rather than a recolored accent.

import type { PrismMode, PrismPrimitiveTokens, PrismSemanticTokens } from './types.js';

/** '#RRGGBB' + alpha → rgba(). */
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
    return Math.round(aChannel * t + bChannel * (1 - t))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

export function resolveSemantics(primitives: PrismPrimitiveTokens, mode: PrismMode): PrismSemanticTokens {
  const light = mode === 'light';
  const ink = primitives.colorInk;
  const text = primitives.colorText;
  const surface = primitives.colorContainer;
  const elevated = light ? surface : mixHex('#FFFFFF', primitives.colorGround, 0.12);
  const popover = light ? surface : mixHex('#FFFFFF', primitives.colorGround, 0.16);

  return {
    surfaceGround: primitives.colorGround,
    surfaceContainer: surface,
    surfaceElevated: elevated,
    surfacePopover: popover,
    surfaceScrim: light ? 'rgba(15, 23, 42, 0.32)' : 'rgba(4, 10, 20, 0.72)',

    textPrimary: text,
    textSecondary: tintRgba(text, 0.76),
    textTertiary: tintRgba(text, 0.68),
    textFaint: tintRgba(text, 0.45),
    textOnInk: light ? '#FFFFFF' : '#0A0F1C',

    inkPrimary: ink,
    hairlineStrong: primitives.colorHairline,
    hairlineFaint: tintRgba(ink, light ? 0.07 : 0.12),
    accentLive: tintRgba(ink, light ? 0.1 : 0.2),
    focusRing: tintRgba(ink, light ? 0.35 : 0.55),

    stateSuccess: primitives.colorSuccess,
    stateWarning: primitives.colorWarning,
    stateError: primitives.colorError,
    stateInfo: primitives.colorInfo,
    stateSuccessText: mixHex(primitives.colorSuccess, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),
    stateWarningText: mixHex(primitives.colorWarning, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),
    stateErrorText: mixHex(primitives.colorError, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),
    stateInfoText: mixHex(primitives.colorInfo, light ? '#000000' : '#FFFFFF', light ? 0.95 : 0.5),

    shapeRadiusSm: `${primitives.shapeRadiusSm}px`,
    shapeRadiusBase: `${primitives.shapeRadiusBase}px`,
    shapeRadiusLg: `${primitives.shapeRadiusLg}px`,
    shapeRadiusOuter: `${primitives.shapeRadiusOuter}px`,

    typeFamily: primitives.typeFamilyUi,
    typeFamilyCode: primitives.typeFamilyMono,
    typeSize: `${primitives.typeSizeUi}px`,
    typeWeight: String(primitives.typeWeightStrong),
    spaceUnit: `${primitives.spaceUnit}px`,
    spaceStep: `${primitives.spaceStep}px`,

    motionDurationFast: primitives.motionDurationFast,
    motionDurationMid: primitives.motionDurationMid,
    motionDurationSlow: primitives.motionDurationSlow,
    motionCurveStandard: primitives.motionCurveStandard,
    motionCurveOpacity: primitives.motionCurveOpacity,

    elevationFloating: primitives.elevationFloating,
    elevationNone: 'none',
  };
}
