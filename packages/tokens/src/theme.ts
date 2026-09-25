// Theme factory. One pack and mode resolve to primitives, semantics, and the
// plain CSS custom properties consumed by @nanisoft/prism-ui/styles.css.

import { resolvePrimitives } from './primitives.js';
import { resolveSemantics } from './semantics.js';
import type {
  PrismCssVariables,
  PrismMode,
  PrismPackId,
  PrismSemanticTokens,
  PrismTheme,
  PrismThemeOptions,
} from './types.js';

/** Stable class scheme shared by the generated stylesheet and pre-paint script. */
export function prismCssVarKey(pack: PrismPackId, mode: PrismMode): string {
  return `prism-${pack}-${mode}`;
}

function buildCssVariables(semantics: PrismSemanticTokens): PrismCssVariables {
  return {
    '--prism-background': semantics.surfaceGround,
    '--prism-foreground': semantics.textPrimary,
    '--prism-surface': semantics.surfaceContainer,
    '--prism-surface-ground': semantics.surfaceGround,
    '--prism-surface-elevated': semantics.surfaceElevated,
    '--prism-surface-popover': semantics.surfacePopover,
    '--prism-scrim': semantics.surfaceScrim,

    '--prism-primary': semantics.inkPrimary,
    '--prism-primary-foreground': semantics.textOnInk,
    '--prism-secondary': semantics.surfaceGround,
    '--prism-secondary-foreground': semantics.textSecondary,
    '--prism-muted': semantics.surfaceGround,
    '--prism-muted-foreground': semantics.textTertiary,
    '--prism-accent': semantics.accentLive,
    '--prism-accent-foreground': semantics.textPrimary,

    '--prism-success': semantics.stateSuccess,
    '--prism-success-foreground': semantics.stateSuccessText,
    '--prism-warning': semantics.stateWarning,
    '--prism-warning-foreground': semantics.stateWarningText,
    '--prism-destructive': semantics.stateError,
    '--prism-destructive-foreground': semantics.stateErrorText,
    '--prism-info': semantics.stateInfo,
    '--prism-info-foreground': semantics.stateInfoText,

    '--prism-text': semantics.textPrimary,
    '--prism-text-secondary': semantics.textSecondary,
    '--prism-text-tertiary': semantics.textTertiary,
    '--prism-text-faint': semantics.textFaint,
    '--prism-text-on-ink': semantics.textOnInk,
    '--prism-border': semantics.hairlineStrong,
    '--prism-border-subtle': semantics.hairlineFaint,
    '--prism-input': semantics.hairlineStrong,
    '--prism-ring': semantics.focusRing,

    '--prism-radius-sm': semantics.shapeRadiusSm,
    '--prism-radius': semantics.shapeRadiusBase,
    '--prism-radius-lg': semantics.shapeRadiusLg,
    '--prism-radius-xl': semantics.shapeRadiusOuter,
    '--prism-font-sans': semantics.typeFamily,
    '--prism-font-mono': semantics.typeFamilyCode,
    '--prism-font-size': semantics.typeSize,
    '--prism-font-weight': semantics.typeWeight,
    '--prism-leading-body': '1.65',
    '--prism-leading-prose': '1.72',
    '--prism-space-unit': semantics.spaceUnit,
    '--prism-space-step': semantics.spaceStep,

    '--prism-duration-fast': semantics.motionDurationFast,
    '--prism-duration': semantics.motionDurationMid,
    '--prism-duration-slow': semantics.motionDurationSlow,
    '--prism-ease-standard': semantics.motionCurveStandard,
    '--prism-ease-opacity': semantics.motionCurveOpacity,
    '--prism-shadow': semantics.elevationFloating,
    '--prism-shadow-none': semantics.elevationNone,

    '--prism-control-height-sm': '28px',
    '--prism-control-height': '32px',
    '--prism-control-height-lg': '40px',
    '--prism-content-width': '1180px',
    '--prism-dither-color': semantics.inkPrimary,
  };
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
  const semantics = deepFreeze(
    overrides?.semantics ? { ...base, ...overrides.semantics } : base,
  ) as PrismSemanticTokens;

  return deepFreeze({
    pack,
    mode,
    cssVarKey: prismCssVarKey(pack, mode),
    cssVariables: buildCssVariables(semantics),
    primitives,
    semantics,
  });
}

const memo = new Map<string, PrismTheme>();

/** Memoised registered theme. */
export function getPrismTheme(pack: PrismPackId, mode: PrismMode): PrismTheme {
  const key = `${pack}-${mode}`;
  const cached = memo.get(key);
  if (cached) return cached;
  const theme = buildTheme(pack, mode);
  memo.set(key, theme);
  return theme;
}

/** Build a theme, applying semantic-only product overrides when present. */
export function createPrismTheme(options: PrismThemeOptions): PrismTheme {
  if (!options.overrides) return getPrismTheme(options.pack, options.mode);
  return buildTheme(options.pack, options.mode, options.overrides);
}
