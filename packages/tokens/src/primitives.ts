/**
 * Tier 0 — primitive resolution per mode (ADR-0002 §2a).
 * Raw values with no meaning attached: the inputs to antd's generators plus the
 * raw values antd cannot derive. `PrismTheme.primitives` is resolved FOR a mode
 * (§1b) — the brand pack carries both modes, this picks one.
 */

import { prismBrandPacks } from './brands.js';
import type { PrismMode, PrismPackId, PrismPrimitiveTokens } from './types.js';

export function resolvePrimitives(pack: PrismPackId, mode: PrismMode): PrismPrimitiveTokens {
  const brand = prismBrandPacks[pack];
  const light = mode === 'light';

  const primitives: PrismPrimitiveTokens = {
    colorInk: light ? brand.ink.light : brand.ink.dark,
    colorGround: light ? brand.ground.light : brand.ground.dark,
    // Dark mode needs no container primitive (ADR-0002 §3).
    ...(light ? { colorSurface: brand.surface.light } : {}),
    colorText: light ? brand.text.light : brand.text.dark,
    colorHairline: light ? brand.hairline.light : brand.hairline.dark,
    colorSuccess: brand.state.success,
    colorInfo: brand.state.info,
    colorWarning: brand.state.warning,
    colorError: brand.state.error,
    spaceUnit: 4,
    spaceStep: 4,
    shapeRadiusSm: 2,
    shapeRadiusBase: 4,
    shapeRadiusLg: 6,
    shapeRadiusOuter: 4,
    typeFamilyUi: brand.type.familyUi,
    typeFamilyMono: brand.type.familyMono,
    typeSizeUi: brand.type.sizeUi,
    typeWeightStrong: brand.type.weightStrong,
    motionDurationFast: brand.motion.durationFast,
    motionDurationMid: brand.motion.durationMid,
    motionDurationSlow: brand.motion.durationSlow,
    motionCurveStandard: brand.motion.curveStandard,
    motionCurveOpacity: brand.motion.curveOpacity,
    elevationFloating: light ? brand.elevation.floatingLight : brand.elevation.floatingDark,
  };

  return Object.freeze(primitives);
}
