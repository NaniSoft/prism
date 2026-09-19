/**
 * The theme factory (ADR-0002 §1). Pure — zero dependencies, no antd at
 * runtime. Returns a frozen `PrismTheme` whose `antd` lane carries seeds, the
 * closed map-token allowlist, and the shadow-zeroing `components` config.
 *
 * The antd `algorithm` is deliberately absent (this package has no antd
 * dependency): prism-ui attaches `theme.defaultAlgorithm` / `theme.darkAlgorithm`
 * from `PrismTheme.mode` when it composes ConfigProvider's theme.
 */

import { resolvePrimitives } from './primitives.js';
import { resolveSemantics } from './semantics.js';
import type {
  PrismAntdMapTokens,
  PrismAntdThemeConfig,
  PrismMode,
  PrismPackId,
  PrismSemanticTokens,
  PrismTheme,
  PrismThemeOptions,
} from './types.js';

/** Single source of truth for the cssVar key scheme, shared with the site's inline script (§1c). */
export function prismCssVarKey(pack: PrismPackId, mode: PrismMode): string {
  return `prism-${pack}-${mode}`;
}

/**
 * The antd lane: seeds + the map-token allowlist + shadow-zeroing components.
 * Takes the (possibly overridden) semantics so `overrides.semantics` re-points
 * the antd lane too — an overridden meaning must reach the rendered output.
 */
function buildAntdConfig(mode: PrismMode, semantics: PrismSemanticTokens, modeKey: string): PrismAntdThemeConfig {
  const map: PrismAntdMapTokens = {
    // Radius family 2/4/6/4: genRadius(4) yields SM 4 / LG 4 — not seed-derivable.
    // Numeric per antd's AliasToken; the semantics stay authoritative (overrides flow).
    borderRadiusSM: Number(semantics.shapeRadiusSm),
    borderRadiusLG: Number(semantics.shapeRadiusLg),
    // motionUnit 0.08 → genCommonMapToken yields 240ms slow — the locked 280ms is not seed-derivable.
    motionDurationSlow: semantics.motionDurationSlow,
    // Scrim is set in both modes — dark re-uses the allowlist with dark values (§3).
    colorBgMask: semantics.surfaceScrim,
    // Hairlines.
    colorBorder: semantics.hairlineStrong,
    colorBorderSecondary: semantics.hairlineFaint,
    colorSplit: semantics.hairlineFaint,
    // Accent flood (selection/active/pressed) — the tinted wash, never solid ink.
    controlItemBgActive: semantics.accentLive,
    controlItemBgActiveHover: semantics.accentLive,
    colorBgTextActive: semantics.accentLive,
    colorPrimaryTextActive: semantics.inkPrimary,
    // Focus ring — controlOutline only: antd v6's focusOutline is a boolean
    // seed, so the string ring color has exactly one destination (§2c errata).
    controlOutline: semantics.focusRing,
    // Elevation: the one shadow, or none.
    boxShadow: semantics.elevationFloating,
    boxShadowSecondary: semantics.elevationNone,
    boxShadowTertiary: semantics.elevationNone,
  };
  if (mode === 'light') {
    // Light is the asymmetric case: the tinted page ground cannot come from the
    // seed (the light generator puts layout 4% darker than base). Dark mode
    // adds no ground overrides — it stays pure seed (§3).
    map.colorBgLayout = semantics.surfaceGround;
  }

  return deepFreeze({
    token: deepFreeze({
      // Seeds — antd's algorithms derive everything else (§2c lane 1).
      colorPrimary: semantics.inkPrimary,
      colorLink: semantics.inkPrimary,
      colorSuccess: semantics.stateSuccess,
      colorWarning: semantics.stateWarning,
      colorError: semantics.stateError,
      colorInfo: semantics.stateInfo,
      colorBgBase: semantics.surfaceContainer,
      colorTextBase: semantics.textPrimary,
      borderRadius: 4,
      lineWidth: 1,
      sizeUnit: 4,
      sizeStep: 4,
      motionUnit: 0.08,
      motionBase: 0,
      motionEaseOut: semantics.motionCurveStandard,
      motionEaseInOut: semantics.motionCurveStandard,
      motionEaseOutQuint: semantics.motionCurveStandard,
      motionEaseOutCirc: semantics.motionCurveStandard,
      fontFamily: semantics.typeFamily,
      fontFamilyCode: semantics.typeFamilyCode,
      fontSize: 14,
      fontWeightStrong: 600,
      // Map-token allowlist (§2c lane 2).
      ...map,
    }),
    components: deepFreeze({
      // Beam-crisp: flat buttons/inputs, hairline focus rings — shadow-zeroing
      // only, always with algorithm: true so antd re-derives the rest (§2c lane 3).
      Button: { primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none', algorithm: true },
      Input: { activeShadow: 'none', errorActiveShadow: 'none', warningActiveShadow: 'none', algorithm: true },
    }),
    cssVar: { key: modeKey, prefix: 'prism' },
    hashed: false,
  }) as PrismAntdThemeConfig;
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

function buildTheme(pack: PrismPackId, mode: PrismMode, overrides?: PrismThemeOptions['overrides']): PrismTheme {
  const primitives = resolvePrimitives(pack, mode);
  const base = resolveSemantics(primitives, mode);
  const semantics = overrides?.semantics
    ? deepFreeze({ ...base, ...overrides.semantics })
    : base;

  return deepFreeze({
    pack,
    mode,
    cssVarKey: prismCssVarKey(pack, mode),
    antd: buildAntdConfig(mode, semantics, prismCssVarKey(pack, mode)),
    primitives,
    semantics,
  });
}

const memo = new Map<string, PrismTheme>();

/** Convenience for the common no-override case — memoised across the 2 packs × 2 modes. */
export function getPrismTheme(pack: PrismPackId, mode: PrismMode): PrismTheme {
  const key = `${pack}-${mode}`;
  const cached = memo.get(key);
  if (cached) return cached;
  const theme = buildTheme(pack, mode);
  memo.set(key, theme);
  return theme;
}

/** The full factory — `overrides` allocates a fresh (still frozen) theme. */
export function createPrismTheme(options: PrismThemeOptions): PrismTheme {
  if (!options.overrides) return getPrismTheme(options.pack, options.mode);
  return buildTheme(options.pack, options.mode, options.overrides);
}

export type { PrismAntdThemeConfig };
