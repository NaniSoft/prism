// DTCG export over Prism's two token tiers. Figma receives the design language,
// not a component-library token compiler: semantic aliases point into the
// primitive collection and carry their CSS-variable destination as provenance.

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
  return {
    $type: type,
    $value: value,
    ...(description ? { $description: description } : {}),
    ...(extensions ? { $extensions: extensions } : {}),
  };
}

function alias(target: string, type: string, description?: string, extensions?: Record<string, unknown>): DtcgToken {
  return token(`{${target}}`, type, description, extensions);
}

function css(variable: string): Record<string, unknown> {
  return { 'prism.css': { variable } };
}

function shadowComposite(cssValue: string): Record<string, unknown> {
  const match = /^(\d+)(px)? (\d+)(px)? (\d+)(px)? (\d+)(px)? rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)$/.exec(cssValue);
  if (!match) throw new Error(`elevation floating: invalid single-shadow CSS value: "${cssValue}"`);
  const [, x, xu, y, yu, blur, bu, spread, su, r, g, b, a] = match as unknown as [string, ...string[]];
  const hex = (value: string): string => Number(value).toString(16).padStart(2, '0').toUpperCase();
  return {
    $type: 'shadow',
    color: `#${hex(r ?? '0')}${hex(g ?? '0')}${hex(b ?? '0')}${hex(String(Math.round(Number(a) * 255)))}`,
    offsetX: xu ? `${x}px` : '0px',
    offsetY: `${y}${yu ?? ''}`,
    blur: `${blur}${bu ?? ''}`,
    spread: spread && Number(spread) !== 0 ? `${spread}${su ?? ''}` : '0px',
    inset: false,
  };
}

const SHADOW_NOTE = 'The single permitted shadow. Apply per field in Figma; the string preserves CSS and Dev Mode parity.';

function shadowToken(value: string, variable: string): DtcgToken {
  return token(value, 'string', SHADOW_NOTE, {
    ...css(variable),
    'prism.shadow': shadowComposite(value),
  });
}

export function toDtcg(pack: PrismPackId, mode: PrismMode): PrismDtcgDocument {
  const brand = prismBrandPacks[pack];
  const primitives = resolvePrimitives(pack, mode);
  const semantics = resolveSemantics(primitives, mode);
  const m = mode;

  const primitive = {
    color: {
      ink: {
        light: token(brand.ink.light, 'color', 'Brand ink, light.'),
        dark: token(brand.ink.dark, 'color', 'Brand ink, beam-dark.'),
      },
      ground: {
        light: token(brand.ground.light, 'color', 'Pastel page ground, light.'),
        dark: token(brand.ground.dark, 'color', 'Dusk-tinted page ground, beam-dark.'),
      },
      surface: {
        light: token(brand.surface.light, 'color', 'Crisp container surface, light.'),
        dark: token(brand.surface.dark, 'color', 'Lifted container surface, beam-dark.'),
      },
      text: {
        light: token(brand.text.light, 'color', 'Body text base, light.'),
        dark: token(brand.text.dark, 'color', 'Body text base, beam-dark.'),
      },
      hairline: {
        light: token(brand.hairline.light, 'color', 'Pack-tinted hairline, light.'),
        dark: token(brand.hairline.dark, 'color', 'Pack-tinted hairline, beam-dark.'),
      },
      success: token(brand.state.success, 'color', 'Shared success hue.'),
      info: token(brand.state.info, 'color', 'Shared information hue.'),
      warning: token(brand.state.warning, 'color', 'Shared warning hue.'),
      error: token(brand.state.error, 'color', 'Shared error hue.'),
    },
    space: {
      unit: token('4px', 'dimension', 'Base spacing unit.'),
      step: token('4px', 'dimension', 'Base layout step.'),
    },
    shape: {
      radius: {
        sm: token('2px', 'dimension', 'Small beam-crisp radius.'),
        base: token('4px', 'dimension', 'Base radius.'),
        lg: token('6px', 'dimension', 'Large radius.'),
        outer: token('4px', 'dimension', 'Outer radius.'),
      },
    },
    type: {
      family: {
        ui: token(brand.type.familyUi, 'fontFamily', 'Prism UI typeface.'),
        mono: token(brand.type.familyMono, 'fontFamily', 'Prism code and annotation typeface.'),
      },
      size: { ui: token('14px', 'dimension', 'UI body size.') },
      weight: { strong: token(brand.type.weightStrong, 'fontWeight', 'Strong UI weight.') },
    },
    motion: {
      duration: {
        fast: token(brand.motion.durationFast, 'duration', 'Fast state change.'),
        mid: token(brand.motion.durationMid, 'duration', 'Standard state change.'),
        slow: token(brand.motion.durationSlow, 'duration', 'Slow, deliberate transition.'),
      },
      curve: {
        standard: token(brand.motion.curveStandard, 'cubicBezier', 'Strongly decelerating standard curve.'),
        opacity: token(brand.motion.curveOpacity, 'cubicBezier', 'Linear opacity curve.'),
      },
    },
    elevation: {
      floating: {
        light: shadowToken(brand.elevation.floatingLight, '--prism-shadow'),
        dark: shadowToken(brand.elevation.floatingDark, '--prism-shadow'),
      },
    },
  };

  const semantic = {
    surface: {
      ground: alias(`color.ground.${m}`, 'color', 'Page ground.', css('--prism-background')),
      container: alias(`color.surface.${m}`, 'color', 'Container surface.', css('--prism-surface')),
      elevated: token(semantics.surfaceElevated, 'color', 'Raised in-plane surface.', css('--prism-surface-elevated')),
      popover: token(semantics.surfacePopover, 'color', 'Floating popover surface.', css('--prism-surface-popover')),
      scrim: token(semantics.surfaceScrim, 'color', 'Modal scrim.', css('--prism-scrim')),
    },
    text: {
      primary: alias(`color.text.${m}`, 'color', 'Primary text.', css('--prism-foreground')),
      secondary: token(semantics.textSecondary, 'color', 'Secondary text.', css('--prism-text-secondary')),
      tertiary: token(semantics.textTertiary, 'color', 'Tertiary text and placeholders.', css('--prism-text-tertiary')),
      faint: token(semantics.textFaint, 'color', 'Faint non-essential text.', css('--prism-text-faint')),
      onInk: token(semantics.textOnInk, 'color', 'Text on solid brand ink.', css('--prism-primary-foreground')),
    },
    ink: {
      primary: alias(`color.ink.${m}`, 'color', 'Brand accent.', css('--prism-primary')),
    },
    hairline: {
      strong: alias(`color.hairline.${m}`, 'color', 'Strong hairline.', css('--prism-border')),
      faint: token(semantics.hairlineFaint, 'color', 'Faint hairline.', css('--prism-border-subtle')),
    },
    accent: {
      live: token(semantics.accentLive, 'color', 'Selection, active, and pressed wash.', css('--prism-accent')),
    },
    focus: {
      ring: token(semantics.focusRing, 'color', 'Visible focus ring.', css('--prism-ring')),
    },
    state: {
      success: alias('color.success', 'color', 'Success hue.', css('--prism-success')),
      successText: token(semantics.stateSuccessText, 'color', 'Accessible success text.', css('--prism-success-foreground')),
      warning: alias('color.warning', 'color', 'Warning hue.', css('--prism-warning')),
      warningText: token(semantics.stateWarningText, 'color', 'Accessible warning text.', css('--prism-warning-foreground')),
      error: alias('color.error', 'color', 'Error hue.', css('--prism-destructive')),
      errorText: token(semantics.stateErrorText, 'color', 'Accessible error text.', css('--prism-destructive-foreground')),
      info: alias('color.info', 'color', 'Information hue.', css('--prism-info')),
      infoText: token(semantics.stateInfoText, 'color', 'Accessible information text.', css('--prism-info-foreground')),
    },
    radius: {
      sm: alias('shape.radius.sm', 'dimension', undefined, css('--prism-radius-sm')),
      base: alias('shape.radius.base', 'dimension', undefined, css('--prism-radius')),
      lg: alias('shape.radius.lg', 'dimension', undefined, css('--prism-radius-lg')),
      outer: alias('shape.radius.outer', 'dimension', undefined, css('--prism-radius-xl')),
    },
    typography: {
      family: {
        ui: alias('type.family.ui', 'fontFamily', undefined, css('--prism-font-sans')),
        code: alias('type.family.mono', 'fontFamily', undefined, css('--prism-font-mono')),
      },
      size: alias('type.size.ui', 'dimension', undefined, css('--prism-font-size')),
      weight: { strong: alias('type.weight.strong', 'fontWeight', undefined, css('--prism-font-weight')) },
    },
    spacing: {
      unit: alias('space.unit', 'dimension', undefined, css('--prism-space-unit')),
      step: alias('space.step', 'dimension', undefined, css('--prism-space-step')),
    },
    motion: {
      timing: {
        fast: alias('motion.duration.fast', 'duration', undefined, css('--prism-duration-fast')),
        mid: alias('motion.duration.mid', 'duration', undefined, css('--prism-duration')),
        slow: alias('motion.duration.slow', 'duration', undefined, css('--prism-duration-slow')),
      },
      easing: {
        standard: alias('motion.curve.standard', 'cubicBezier', undefined, css('--prism-ease-standard')),
        opacity: alias('motion.curve.opacity', 'cubicBezier', undefined, css('--prism-ease-opacity')),
      },
    },
    elevation: {
      floating: alias(`elevation.floating.${m}`, 'string', SHADOW_NOTE, css('--prism-shadow')),
      none: token(semantics.elevationNone, 'string', 'In-plane surfaces do not cast a shadow.', css('--prism-shadow-none')),
    },
  };

  return { primitive, semantic };
}

export { resolvePrimitives, resolveSemantics, prismCssVarKey };
