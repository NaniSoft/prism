// Theme composition (ADR-0003): mergePrismTheme(prismTheme, consumerTheme).
//
// prism-tokens cannot carry the antd algorithm (it has no antd dependency), so
// this module attaches `theme.defaultAlgorithm` / `theme.darkAlgorithm` from
// the PrismTheme's mode when converting to a ConfigProvider theme — one
// algorithm per theme, never an array (ADR-0002 §3).

import { theme as antdTheme, type ThemeConfig } from 'antd';
import type { PrismTheme } from '@nanisoft/prism-tokens';

export function isPrismTheme(value: unknown): value is PrismTheme {
  return (
    typeof value === 'object' &&
    value !== null &&
    'antd' in value &&
    'cssVarKey' in value &&
    'semantics' in value &&
    'primitives' in value
  );
}

/** PrismTheme → ConfigProvider-ready ThemeConfig: the antd lane plus the mode's algorithm. */
export function toAntdTheme(prismTheme: PrismTheme): ThemeConfig {
  return {
    ...prismTheme.antd,
    algorithm: prismTheme.mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };
}

function isMergeable(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof value !== 'function' &&
    !(value instanceof Date) &&
    !(value instanceof RegExp)
  );
}

/** Deep-merge per key — consumer wins; `token` and `components[X]` merge per component, never replaced by reference. */
function deepMerge(base: Record<string, unknown>, consumer: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, consumerValue] of Object.entries(consumer)) {
    const baseValue = result[key];
    result[key] =
      isMergeable(baseValue) && isMergeable(consumerValue) ? deepMerge(baseValue, consumerValue) : consumerValue;
  }
  return result;
}

/**
 * Compose a ConfigProvider theme from a PrismTheme (or a raw ThemeConfig, for
 * full control) plus optional consumer overrides — consumer last, per key.
 * Exported so apps can compose themes without the provider.
 */
export function mergePrismTheme(prismTheme: PrismTheme | ThemeConfig, consumer?: ThemeConfig): ThemeConfig {
  const base = isPrismTheme(prismTheme) ? toAntdTheme(prismTheme) : prismTheme;
  if (!consumer) return base;
  return deepMerge(base as Record<string, unknown>, consumer as Record<string, unknown>) as ThemeConfig;
}
