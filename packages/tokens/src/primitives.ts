// Tier 0 — primitive resolution for one pack and mode.

import { prismBrandPacks } from './brands.js';
import type { PrismMode, PrismPackId, PrismPrimitiveTokens } from './types.js';

export function resolvePrimitives(pack: PrismPackId, mode: PrismMode): PrismPrimitiveTokens {
  const brand = prismBrandPacks[pack];
  const light = mode === 'light';

  return Object.freeze({
    colorInk: light ? brand.ink.light : brand.ink.dark,
    colorGround: light ? brand.ground.light : brand.ground.dark,
    colorContainer: light ? brand.surface.light : brand.surface.dark,
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
  });
}
