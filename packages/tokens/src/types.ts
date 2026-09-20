// TypeScript types for Prism's token architecture (ADR-0002).

/**
 * The five registered brand packs (ADR-0005): the two founding hues re-expressed
 * in pastel voice (blue → sky, green → mint) plus lavender, rose, and peach.
 * Pack ids are stable API — they key cssVar classes, storage, DTCG output, and
 * MCP slugs — so the reforged founders keep their ids.
 */
export type PrismPackId = 'blue' | 'green' | 'lavender' | 'rose' | 'peach';
export type PrismMode = 'light' | 'dark';

export interface PrismThemeOptions {
  pack: PrismPackId;
  mode: PrismMode;
  /** Semantic-only re-pointing (ADR-0002 §5). Apps may override meaning, never antd mechanics. */
  overrides?: PrismThemeOverrides;
}

export interface PrismTheme {
  readonly pack: PrismPackId;
  readonly mode: PrismMode;
  /** Stable antd `cssVar.key`, also the class that carries the baked variables. */
  readonly cssVarKey: string;
  /** ConfigProvider-ready token/components/cssVar lanes. The antd `algorithm` is attached by prism-ui (this package stays antd-free). */
  readonly antd: PrismAntdThemeConfig;
  /** Tier 0, resolved for `mode`. Frozen, plain data. */
  readonly primitives: PrismPrimitiveTokens;
  /** Tier 1, resolved for `mode`. The only tier components and apps consume. */
  readonly semantics: PrismSemanticTokens;
}

export interface PrismThemeOverrides {
  /** Semantic-only re-pointing — apps may override meaning, never antd mechanics. Overrides flow into the antd lane too. */
  semantics?: Partial<PrismSemanticTokens>;
}

/**
 * Antd seed tokens Prism sets directly — antd's algorithms derive the rest.
 * Numeric seeds stay numeric: antd derives by arithmetic (genRadius, genCommonMapToken),
 * so a stringified seed would poison the derivation.
 */
export interface PrismAntdSeedTokens {
  colorPrimary: string; // ink.primary
  colorLink: string; // ink.primary (explicitly, not the colorInfo fallback)
  colorSuccess: string; // state.success
  colorWarning: string; // state.warning
  colorError: string; // state.error
  colorInfo: string; // state.info
  colorBgBase: string; // surface.container (seed)
  colorTextBase: string; // text.primary (seed)
  borderRadius: number; // shape.radius.base (seed — genRadius derives the family)
  lineWidth: number; // hairline width — the hairline COLOR is a map token, the width is 1
  sizeUnit: number; // space.unit
  sizeStep: number; // space.step
  motionUnit: number; // motion duration quantum, seconds (0.08 → 80ms)
  motionBase: number; // motion duration base, seconds (0)
  motionEaseOut: string; // motion.curve.standard
  motionEaseInOut: string; // motion.curve.standard
  motionEaseOutQuint: string; // motion.curve.standard
  motionEaseOutCirc: string; // motion.curve.standard
  fontFamily: string; // type.family.ui
  fontFamilyCode: string; // type.family.mono
  fontSize: number; // type.size.ui
  fontWeightStrong: number; // type.weight.strong
}

/**
 * The closed map-token allowlist (ADR-0002 §2c). Hand-setting map tokens is
 * forbidden except where antd's derivation provably cannot express the value;
 * the emitted keys are a subset of this union (asserted by test).
 */
export type PrismAntdMapKey =
  | 'borderRadiusSM' // genRadius(4) → SM 4, not 2
  | 'borderRadiusLG' // genRadius(4) → LG 4, not 6
  | 'motionDurationSlow' // motionBase + motionUnit×3 → 240ms, not the locked 280ms
  | 'colorBgLayout' // light-mode page ground (dark stays pure seed)
  | 'colorBgMask' // surface.scrim
  | 'colorBorder' // hairline.strong
  | 'colorBorderSecondary' // hairline.faint
  | 'colorSplit' // hairline.faint
  | 'controlItemBgActive' // accent.live flood
  | 'controlItemBgActiveHover' // accent.live flood
  | 'colorBgTextActive' // accent.live flood
  | 'colorPrimaryTextActive' // accent.live flood
  | 'controlOutline' // focus.ring — antd v6's `focusOutline` is a boolean seed, not a string map token, so the ring color lives here alone (ADR-0002 §2c errata)
  | 'colorTextPlaceholder' // placeholder text — antd's 25% derivation fails AA on tinted grounds; the pack's textTertiary tint carries the hue (ADR-0005 errata)
  | 'boxShadow' // elevation.floating — the one permitted shadow
  | 'boxShadowSecondary' // elevation.none — in-plane surfaces never shadow
  | 'boxShadowTertiary'; // elevation.none

/**
 * The map-token values, typed per antd v6's own AliasToken (the antd lane must
 * typecheck against ThemeConfig with no cast — §1a). Keys are the closed
 * `PrismAntdMapKey` union; `colorBgLayout` is optional because dark mode adds
 * no ground overrides (§3).
 */
export interface PrismAntdMapTokens {
  borderRadiusSM: number; // genRadius(4) → SM 4, not 2
  borderRadiusLG: number; // genRadius(4) → LG 4, not 6
  motionDurationSlow: string; // motionBase + motionUnit×3 → 240ms, not the locked 280ms
  colorBgLayout?: string; // light-mode page ground only (dark stays pure seed)
  colorBgMask: string; // surface.scrim
  colorBorder: string; // hairline.strong
  colorBorderSecondary: string; // hairline.faint
  colorSplit: string; // hairline.faint
  controlItemBgActive: string; // accent.live flood
  controlItemBgActiveHover: string;
  colorBgTextActive: string;
  colorPrimaryTextActive: string;
  controlOutline: string; // focus.ring (antd v6's focusOutline is a boolean seed — §2c errata)
  colorTextPlaceholder: string; // placeholder text — the pack's textTertiary tint (ADR-0005 errata)
  boxShadow: string; // elevation.floating — the one permitted shadow
  boxShadowSecondary: string; // elevation.none
  boxShadowTertiary: string; // elevation.none
}

/** Antd component overrides — shadow-zeroing only, always with `algorithm: true`. */
export interface PrismAntdComponentsOverrides {
  Button: {
    primaryShadow: string;
    defaultShadow: string;
    dangerShadow: string;
    algorithm: true;
  };
  Input: {
    activeShadow: string;
    errorActiveShadow: string;
    warningActiveShadow: string;
    algorithm: true;
  };
}

/**
 * The antd theme lanes prism-tokens emits. Prism does NOT emit the algorithm
 * (the tokens package has no antd dependency — prism-ui attaches
 * `theme.defaultAlgorithm` / `theme.darkAlgorithm` from `PrismTheme.mode`), and
 * `hashed: false` is a top-level ThemeConfig key, not a cssVar key.
 */
export interface PrismAntdThemeConfig {
  token: PrismAntdSeedTokens & PrismAntdMapTokens;
  components: PrismAntdComponentsOverrides;
  cssVar: {
    key: string;
    prefix: string;
  };
  hashed: false;
}

/** Tier 0 — primitives, RESOLVED for a mode (ADR-0002 §1b/§2a). Raw values, no meaning. */
export interface PrismPrimitiveTokens {
  colorInk: string; // brand ink for this mode
  colorGround: string; // page ground for this mode
  /** Light mode only — the container surface (ADR-0002 §3: dark needs neither). */
  colorSurface?: string;
  colorText: string; // colorTextBase for this mode
  colorHairline: string; // hairline.strong for this mode
  colorSuccess: string;
  colorInfo: string;
  colorWarning: string;
  colorError: string;
  spaceUnit: number; // 4
  spaceStep: number; // 4
  shapeRadiusSm: number; // 2
  shapeRadiusBase: number; // 4
  shapeRadiusLg: number; // 6
  shapeRadiusOuter: number; // 4
  typeFamilyUi: string;
  typeFamilyMono: string;
  typeSizeUi: number; // 14
  typeWeightStrong: number; // 600
  motionDurationFast: string; // '80ms'
  motionDurationMid: string; // '160ms'
  motionDurationSlow: string; // '280ms'
  motionCurveStandard: string; // cubic-bezier(0.25, 1, 0.5, 1)
  motionCurveOpacity: string; // linear
  elevationFloating: string; // the one permitted shadow, resolved for this mode
}

/** Tier 1 — semantics, RESOLVED for a mode (ADR-0002 §2b). The only tier apps read. */
export interface PrismSemanticTokens {
  surfaceGround: string; // → colorBgLayout (map, light only)
  surfaceContainer: string; // → colorBgBase (seed)
  surfaceScrim: string; // → colorBgMask (map)
  textPrimary: string; // → colorTextBase (seed)
  textSecondary: string; // → derived (no override)
  textTertiary: string; // → derived (no override)
  textFaint: string; // → derived (no override)
  textOnInk: string; // → colorTextLightSolid (derived)
  inkPrimary: string; // → colorPrimary + colorLink (seed)
  hairlineStrong: string; // → colorBorder (map)
  hairlineFaint: string; // → colorBorderSecondary + colorSplit (map)
  accentLive: string; // → controlItemBgActive et al. (map) — one accent owns live states
  focusRing: string; // → controlOutline + focusOutline (map)
  stateSuccess: string; // → colorSuccess (seed)
  stateWarning: string; // → colorWarning (seed)
  stateError: string; // → colorError (seed)
  stateInfo: string; // → colorInfo (seed)
  shapeRadiusSm: string; // → borderRadiusSM (map; borderRadius is the seed)
  shapeRadiusBase: string; // → borderRadius (seed)
  shapeRadiusLg: string; // → borderRadiusLG (map)
  shapeRadiusOuter: string; // → borderRadius (seed)
  typeFamily: string; // → fontFamily (seed)
  typeFamilyCode: string; // → fontFamilyCode (seed)
  typeSize: string; // → fontSize (seed)
  typeWeight: string; // → fontWeightStrong (seed)
  spaceUnit: string; // → sizeUnit (seed)
  spaceStep: string; // → sizeStep (seed)
  motionDurationFast: string; // → motionUnit + motionBase (seed)
  motionDurationMid: string; // → derived
  motionDurationSlow: string; // → motionDurationSlow (map — 280ms is not seed-derivable)
  motionCurveStandard: string; // → motionEase* (seed)
  motionCurveOpacity: string; // → none (prism-ui CSS only)
  elevationFloating: string; // → boxShadow (map)
  elevationNone: string; // → boxShadowSecondary + boxShadowTertiary (map)
}

/** Brand pack input — tier-0 values per mode plus the pack's semantic choices (ADR-0002 §4). */
export interface BrandPackInput {
  pack: PrismPackId;
  /** Brand ink per mode — the saturated primary hue. */
  ink: { light: string; dark: string };
  /** Page ground per mode. */
  ground: { light: string; dark: string };
  /** Light-mode container surface (dark mode needs none). */
  surface: { light: string };
  /** Body text base per mode. */
  text: { light: string; dark: string };
  /** Hairline.strong per mode — cool/variant-tinted per ADR-0001 §3. */
  hairline: { light: string; dark: string };
  /** State hues — which hue owns success/info is a pack choice (ADR-0001 §8). */
  state: {
    success: string;
    info: string;
    warning: string;
    error: string;
  };
  /** Type families — a pack that swaps them owns its own @font-face delivery. */
  type?: {
    familyUi?: string;
    familyMono?: string;
    sizeUi?: number;
    weightStrong?: number;
  };
  /** Motion — fixed system shape; a pack may change values, never the key set. */
  motion?: {
    durationFast?: string;
    durationMid?: string;
    durationSlow?: string;
    curveStandard?: string;
    curveOpacity?: string;
  };
  /** Elevation — the one shadow's geometry, within hairline-elevation rules. */
  elevation?: {
    floatingLight?: string;
    floatingDark?: string;
  };
}

/** Registered, validated, frozen brand pack. */
export interface BrandPack {
  readonly pack: PrismPackId;
  readonly ink: { readonly light: string; readonly dark: string };
  readonly ground: { readonly light: string; readonly dark: string };
  readonly surface: { readonly light: string };
  readonly text: { readonly light: string; readonly dark: string };
  readonly hairline: { readonly light: string; readonly dark: string };
  readonly state: {
    readonly success: string;
    readonly info: string;
    readonly warning: string;
    readonly error: string;
  };
  readonly type: {
    readonly familyUi: string;
    readonly familyMono: string;
    readonly sizeUi: number;
    readonly weightStrong: number;
  };
  readonly motion: {
    readonly durationFast: string;
    readonly durationMid: string;
    readonly durationSlow: string;
    readonly curveStandard: string;
    readonly curveOpacity: string;
  };
  readonly elevation: {
    readonly floatingLight: string;
    readonly floatingDark: string;
  };
}

/**
 * DTCG document for one pack × mode (ADR-0002 §2d): tier 0 as resolved values,
 * tier 1 as DTCG alias strings into the primitive paths. Stable 2023-07 subset
 * only — `$value`, `$type`, `$description`, `$extensions`.
 */
export interface PrismDtcgDocument {
  primitive: Record<string, unknown>;
  semantic: Record<string, unknown>;
}
