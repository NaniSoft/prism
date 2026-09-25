/**
 * DTCG export over tiers 0 and 1 (ADR-0002 §2d), shaped for the Figma pipeline
 * verified in `.scratch/prism/research/14-figma-shadow-plugin-verification.md`:
 *
 * - Tier 0 ships resolved values (the modeless `prism.primitive` collection).
 * - Tier 1 ships DTCG alias strings (`$value: "{color.ink.light}"`) — the
 *   Microsoft Variables Import plugin resolves aliases by NAME across
 *   collections, so tier-1 Figma names are disambiguated from tier-0 paths
 *   (radius/typography/spacing; motion uses timing/easing) while alias targets
 *   stay the canonical primitive paths.
 * - The floating shadow is a `$type: "string"` token whose `$value` is the CSS
 *   `box-shadow` string (byte-identical to the antd boxShadow allowlist value),
 *   with the true composite preserved in `$extensions["prism.shadow"]` — no
 *   importer keeps a `$type: "shadow"` composite, and a Figma STRING variable
 *   can never bind to an effect.
 * - Stable 2023-07 subset only: `$value`, `$type`, `$description`, `$extensions`.
 */

import { prismBrandPacks } from './brands.js';
import { resolvePrimitives } from './primitives.js';
import { resolveSemantics } from './semantics.js';
import { prismCssVarKey } from './theme.js';
import type { PrismDtcgDocument, PrismMode, PrismPackId } from './types.js';

interface DtcgToken {
  $type: string;
  $value: string | number;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

function token(value: string | number, type: string, description?: string, extensions?: Record<string, unknown>): DtcgToken {
  return { $type: type, $value: value, ...(description ? { $description: description } : {}), ...(extensions ? { $extensions: extensions } : {}) };
}

function alias(target: string, type: string, description?: string, extensions?: Record<string, unknown>): DtcgToken {
  return token(`{${target}}`, type, description, extensions);
}

/** Parse the shared CSS box-shadow string into its 2023-07 composite, color as #RRGGBBAA. */
function shadowComposite(css: string): Record<string, unknown> {
  const m = /^(\d+)(px)? (\d+)(px)? (\d+)(px)? (\d+)(px)? rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)$/.exec(css);
  if (!m) throw new Error(`elevation floating: not a single-shadow CSS box-shadow string: "${css}"`);
  const px = (n: string, unit?: string): string => (unit ? `${n}px` : `${Number(n) === 0 ? 0 : n}px`);
  const [, x, xu, y, yu, blur, bu, spread, su, r, g, b, a] = m as unknown as [string, ...string[]];
  const hex2 = (n: string): string => Number(n).toString(16).padStart(2, '0').toUpperCase();
  const alpha = Math.round(Number(a) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return {
    $type: 'shadow',
    color: `#${hex2(r ?? '0')}${hex2(g ?? '0')}${hex2(b ?? '0')}${alpha}`,
    offsetX: px(x ?? '0', xu),
    offsetY: px(y ?? '0', yu),
    blur: px(blur ?? '0', bu),
    spread: px(spread ?? '0', su),
    inset: false,
  };
}

const SHADOW_NOTE =
  'The single permitted shadow (ADR-0001 §3). CSS box-shadow: offsetX offsetY blur spread color. A Figma STRING variable cannot bind to an effect — Dev Mode parity only; apply per-field (FLOAT offsets/blur/spread + COLOR) if a live shadow is wanted.';

export function toDtcg(pack: PrismPackId, mode: PrismMode): PrismDtcgDocument {
  const brand = prismBrandPacks[pack];
  const primitives = resolvePrimitives(pack, mode);
  const semantics = resolveSemantics(primitives, mode);
  const light = mode === 'light';
  const m = light ? 'light' : 'dark';

  // ── Tier 0 — resolved values, modeless collection (both modes as leaves) ──
  const primitive = {
    color: {
      ink: {
        light: token(brand.ink.light, 'color', `Brand ink, light — the accent that owns live states (ADR-0001 §7). ${pack} pack.`),
        dark: token(brand.ink.dark, 'color', `Brand ink, beam-dark — lightened one step for the dark ground. ${pack} pack.`),
      },
      ground: {
        light: token(brand.ground.light, 'color', 'Page ground, light (ADR-0001 §1).'),
        dark: token(brand.ground.dark, 'color', 'Beam-dark page ground = antd colorBgBase (ADR-0001 §2).'),
      },
      surface: {
        light: token(brand.surface.light, 'color', 'Light-mode container surface (ADR-0002 §3: dark mode needs neither).'),
      },
      text: {
        light: token(brand.text.light, 'color', 'Body text base, light (antd colorTextBase).'),
        dark: token(brand.text.dark, 'color', 'Body text base, beam-dark (ADR-0001 §2).'),
      },
      hairline: {
        light: token(brand.hairline.light, 'color', 'Hairline.strong, light — variant-tinted per pack (ADR-0001 §3).'),
        dark: token(brand.hairline.dark, 'color', 'Hairline.strong, beam-dark — cool variant tint.'),
      },
      success: token(brand.state.success, 'color', 'Success state (ADR-0001 §8: success joins the green pack).'),
      info: token(brand.state.info, 'color', 'Info state (the pack chooses which band owns it).'),
      warning: token(brand.state.warning, 'color', 'Warning state.'),
      error: token(brand.state.error, 'color', 'Error state.'),
    },
    space: {
      unit: token('4px', 'dimension', 'antd 4px grid unit (ADR-0001 defaults).'),
      step: token('4px', 'dimension', 'antd 4px grid step.'),
    },
    shape: {
      radius: {
        sm: token('2px', 'dimension', 'Beam-crisp radius family 2/4/6/4 (ADR-0001 §4).'),
        base: token('4px', 'dimension', 'Base radius.'),
        lg: token('6px', 'dimension', 'Large radius.'),
        outer: token('4px', 'dimension', 'Outer radius.'),
      },
    },
    type: {
      family: {
        ui: token(brand.type.familyUi, 'fontFamily', 'UI typeface — @font-face ships from PrismProvider.'),
        mono: token(brand.type.familyMono, 'fontFamily', 'Code, token names, annotations.'),
      },
      size: {
        ui: token('14px', 'dimension', 'Stock antd body size; voice comes from weight/width.'),
      },
      weight: {
        strong: token(brand.type.weightStrong, 'fontWeight', 'Strong weight.'),
      },
    },
    motion: {
      duration: {
        fast: token(brand.motion.durationFast, 'duration', 'Decelerating motion scale 80/160/280ms (ADR-0001 §6).'),
        mid: token(brand.motion.durationMid, 'duration', 'Mid duration.'),
        slow: token(brand.motion.durationSlow, 'duration', 'Slow duration — the locked 280ms.'),
      },
      curve: {
        standard: token(brand.motion.curveStandard, 'cubicBezier', 'Strongly decelerating standard curve.'),
        opacity: token(brand.motion.curveOpacity, 'cubicBezier', 'Opacity curve — no antd destination; prism-ui CSS only.'),
      },
    },
    elevation: {
      floating: {
        light: shadowToken(brand.elevation.floatingLight),
        dark: shadowToken(brand.elevation.floatingDark),
      },
    },
  };

  // ── Tier 1 — aliases into the primitive paths (per mode), resolved values for
  // the derived tokens that have no primitive target. Group names are
  // disambiguated from tier-0 paths (radius/typography/spacing/timing/easing)
  // for the importer's name-based alias lookup. ──
  const semantic = {
    surface: {
      ground: alias(`color.ground.${m}`, 'color', 'Page ground (→ antd colorBgLayout, light only).', { 'prism.antd': { map: 'colorBgLayout' } }),
      container: alias(light ? 'color.surface.light' : 'color.ground.dark', 'color', 'Container surface (→ antd colorBgBase seed).', { 'prism.antd': { seed: 'colorBgBase' } }),
      scrim: token(semantics.surfaceScrim, 'color', 'Scrim over page content (→ antd colorBgMask).', { 'prism.antd': { map: 'colorBgMask' } }),
    },
    text: {
      primary: alias(`color.text.${m}`, 'color', 'Body text base (→ antd colorTextBase seed).', { 'prism.antd': { seed: 'colorTextBase' } }),
      secondary: token(semantics.textSecondary, 'color', 'Secondary text — derived, no override.'),
      tertiary: token(semantics.textTertiary, 'color', 'Tertiary text — derived, no override.'),
      faint: token(semantics.textFaint, 'color', 'Faint text — derived, no override.'),
      onInk: token(semantics.textOnInk, 'color', 'Text on ink surfaces (→ antd colorTextLightSolid).'),
    },
    ink: {
      primary: alias(`color.ink.${m}`, 'color', 'The accent (→ antd colorPrimary + colorLink seeds).', { 'prism.antd': { seed: ['colorPrimary', 'colorLink'] } }),
    },
    hairline: {
      strong: alias(`color.hairline.${m}`, 'color', 'Hairline.strong (→ antd colorBorder).', { 'prism.antd': { map: 'colorBorder' } }),
      faint: token(semantics.hairlineFaint, 'color', 'Hairline.faint (→ antd colorBorderSecondary + colorSplit).', { 'prism.antd': { map: ['colorBorderSecondary', 'colorSplit'] } }),
    },
    accent: {
      live: alias(`color.ink.${m}`, 'color', 'Live-state flood — selection/active/pressed; one accent owns them (ADR-0001 §7).', { 'prism.antd': { map: ['controlItemBgActive', 'controlItemBgActiveHover', 'colorBgTextActive', 'colorPrimaryTextActive'] } }),
    },
    focus: {
      ring: token(semantics.focusRing, 'color', 'Hairline focus ring (→ antd controlOutline + focusOutline).', { 'prism.antd': { map: ['controlOutline', 'focusOutline'] } }),
    },
    state: {
      success: alias('color.success', 'color', undefined, { 'prism.antd': { seed: 'colorSuccess' } }),
      successText: token(semantics.stateSuccessText, 'color', 'Accessible success-tag text (→ antd colorSuccessText; derived, no primitive alias).', { 'prism.antd': { map: 'colorSuccessText' } }),
      warning: alias('color.warning', 'color', undefined, { 'prism.antd': { seed: 'colorWarning' } }),
      warningText: token(semantics.stateWarningText, 'color', 'Accessible warning-tag text (→ antd colorWarningText; derived, no primitive alias).', { 'prism.antd': { map: 'colorWarningText' } }),
      error: alias('color.error', 'color', undefined, { 'prism.antd': { seed: 'colorError' } }),
      errorText: token(semantics.stateErrorText, 'color', 'Accessible error-tag text (→ antd colorErrorText; derived, no primitive alias).', { 'prism.antd': { map: 'colorErrorText' } }),
      info: alias('color.info', 'color', undefined, { 'prism.antd': { seed: 'colorInfo' } }),
      infoText: token(semantics.stateInfoText, 'color', 'Accessible info-tag text (→ antd colorInfoText; derived, no primitive alias).', { 'prism.antd': { map: 'colorInfoText' } }),
    },
    radius: {
      sm: alias('shape.radius.sm', 'dimension', undefined, { 'prism.antd': { map: 'borderRadiusSM' } }),
      base: alias('shape.radius.base', 'dimension', 'Base radius (→ antd borderRadius seed).', { 'prism.antd': { seed: 'borderRadius' } }),
      lg: alias('shape.radius.lg', 'dimension', undefined, { 'prism.antd': { map: 'borderRadiusLG' } }),
      outer: alias('shape.radius.outer', 'dimension', undefined, { 'prism.antd': { seed: 'borderRadius' } }),
    },
    typography: {
      family: {
        ui: alias('type.family.ui', 'fontFamily', undefined, { 'prism.antd': { seed: 'fontFamily' } }),
        code: alias('type.family.mono', 'fontFamily', undefined, { 'prism.antd': { seed: 'fontFamilyCode' } }),
      },
      size: alias('type.size.ui', 'dimension', undefined, { 'prism.antd': { seed: 'fontSize' } }),
      weight: {
        strong: alias('type.weight.strong', 'fontWeight', undefined, { 'prism.antd': { seed: 'fontWeightStrong' } }),
      },
    },
    spacing: {
      unit: alias('space.unit', 'dimension', undefined, { 'prism.antd': { seed: 'sizeUnit' } }),
      step: alias('space.step', 'dimension', undefined, { 'prism.antd': { seed: 'sizeStep' } }),
    },
    motion: {
      timing: {
        fast: alias('motion.duration.fast', 'duration', undefined, { 'prism.antd': { seed: ['motionUnit', 'motionBase'] } }),
        mid: alias('motion.duration.mid', 'duration', undefined, { 'prism.antd': { seed: ['motionUnit', 'motionBase'] } }),
        slow: alias('motion.duration.slow', 'duration', 'The locked 280ms (→ antd motionDurationSlow map token).', { 'prism.antd': { map: 'motionDurationSlow' } }),
      },
      easing: {
        standard: alias('motion.curve.standard', 'cubicBezier', undefined, { 'prism.antd': { seed: ['motionEaseOut', 'motionEaseInOut', 'motionEaseOutQuint', 'motionEaseOutCirc'] } }),
        opacity: alias('motion.curve.opacity', 'cubicBezier', 'No antd destination — prism-ui CSS only.', { 'prism.antd': { none: true } }),
      },
    },
    elevation: {
      floating: shadowAlias(`elevation.floating.${m}`),
      none: token(semantics.elevationNone, 'string', 'In-plane surfaces never shadow (→ boxShadowSecondary/Tertiary).', { 'prism.antd': { map: ['boxShadowSecondary', 'boxShadowTertiary'] } }),
    },
  };

  return { primitive, semantic };
}

function shadowToken(css: string): DtcgToken {
  return token(css, 'string', SHADOW_NOTE, {
    'prism.antd': { map: 'boxShadow' },
    'prism.shadow': shadowComposite(css),
  });
}

function shadowAlias(target: string): DtcgToken {
  return alias(target, 'string', 'STRING alias — Dev Mode parity only; cannot bind to a Figma effect.', {
    'prism.antd': { map: 'boxShadow' },
  });
}

// Re-exported for the theme-MD consumer (prism-llms builds its 4 theme atoms
// from these tiers) and for tests.
export { resolvePrimitives, resolveSemantics, prismCssVarKey };
