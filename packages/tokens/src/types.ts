// Prism token contracts. The package stays pure data: no React, no component
// runtime, and no styling-engine vocabulary.

/** Registered brand packs. Ids are stable public API. */
export type PrismPackId = 'blue' | 'green' | 'lavender' | 'rose' | 'peach';
export type PrismMode = 'light' | 'dark';

/** CSS custom properties emitted for one resolved theme. */
export type PrismCssVariables = Readonly<Record<`--prism-${string}`, string>>;

export interface PrismThemeOptions {
  pack: PrismPackId;
  mode: PrismMode;
  /** Re-point meaning for a consuming product without replacing the token system. */
  overrides?: PrismThemeOverrides;
}

export interface PrismTheme {
  readonly pack: PrismPackId;
  readonly mode: PrismMode;
  /** Stable class name used by the pre-paint theme script: prism-<pack>-<mode>. */
  readonly cssVarKey: string;
  /** Resolved CSS custom properties consumed by Prism's shipped stylesheet. */
  readonly cssVariables: PrismCssVariables;
  /** Tier 0, resolved for `mode`. Frozen, plain data. */
  readonly primitives: PrismPrimitiveTokens;
  /** Tier 1, resolved for `mode`. The semantic vocabulary components consume. */
  readonly semantics: PrismSemanticTokens;
}

export interface PrismThemeOverrides {
  semantics?: Partial<PrismSemanticTokens>;
}

/** Tier 0 — raw, mode-resolved values. */
export interface PrismPrimitiveTokens {
  colorInk: string;
  colorGround: string;
  colorContainer: string;
  colorText: string;
  colorHairline: string;
  colorSuccess: string;
  colorInfo: string;
  colorWarning: string;
  colorError: string;
  spaceUnit: number;
  spaceStep: number;
  shapeRadiusSm: number;
  shapeRadiusBase: number;
  shapeRadiusLg: number;
  shapeRadiusOuter: number;
  typeFamilyUi: string;
  typeFamilyMono: string;
  typeSizeUi: number;
  typeWeightStrong: number;
  motionDurationFast: string;
  motionDurationMid: string;
  motionDurationSlow: string;
  motionCurveStandard: string;
  motionCurveOpacity: string;
  elevationFloating: string;
}

/** Tier 1 — named meaning consumed by Prism components, blocks, and pages. */
export interface PrismSemanticTokens {
  surfaceGround: string;
  surfaceContainer: string;
  surfaceElevated: string;
  surfacePopover: string;
  surfaceScrim: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textFaint: string;
  textOnInk: string;
  inkPrimary: string;
  hairlineStrong: string;
  hairlineFaint: string;
  accentLive: string;
  focusRing: string;
  stateSuccess: string;
  stateWarning: string;
  stateError: string;
  stateInfo: string;
  stateSuccessText: string;
  stateWarningText: string;
  stateErrorText: string;
  stateInfoText: string;
  shapeRadiusSm: string;
  shapeRadiusBase: string;
  shapeRadiusLg: string;
  shapeRadiusOuter: string;
  typeFamily: string;
  typeFamilyCode: string;
  typeSize: string;
  typeWeight: string;
  spaceUnit: string;
  spaceStep: string;
  motionDurationFast: string;
  motionDurationMid: string;
  motionDurationSlow: string;
  motionCurveStandard: string;
  motionCurveOpacity: string;
  elevationFloating: string;
  elevationNone: string;
}

/** Brand pack definition. */
export interface BrandPackInput {
  pack: PrismPackId;
  ink: { light: string; dark: string };
  ground: { light: string; dark: string };
  surface: { light: string; dark: string };
  text: { light: string; dark: string };
  hairline: { light: string; dark: string };
  state: {
    success: string;
    info: string;
    warning: string;
    error: string;
  };
  type?: {
    familyUi?: string;
    familyMono?: string;
    sizeUi?: number;
    weightStrong?: number;
  };
  motion?: {
    durationFast?: string;
    durationMid?: string;
    durationSlow?: string;
    curveStandard?: string;
    curveOpacity?: string;
  };
  elevation?: {
    floatingLight?: string;
    floatingDark?: string;
  };
}

/** Validated, frozen brand pack. */
export interface BrandPack {
  readonly pack: PrismPackId;
  readonly ink: { readonly light: string; readonly dark: string };
  readonly ground: { readonly light: string; readonly dark: string };
  readonly surface: { readonly light: string; readonly dark: string };
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

/** DTCG document for one pack × mode. */
export interface PrismDtcgDocument {
  primitive: Record<string, unknown>;
  semantic: Record<string, unknown>;
}
