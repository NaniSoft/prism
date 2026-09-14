/**
 * PROTOTYPE (map ticket 11) — provisional Spectral Refraction theme, hand-rolled
 * to the shape ADR-0002 specifies for `createPrismTheme()`'s antd lane. Throwaway:
 * the real implementation lands in `@nanisoft/prism-tokens` per the map's fog
 * ("Tokens package + brand packs"), with the AA contrast gate and pinned ink hexes.
 *
 * Brand inks are PROVISIONAL — ADR-0001/0002 leave them TBD until the pack pass.
 */
import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

export type Pack = 'blue' | 'green';
export type Mode = 'light' | 'beam-dark';

/** Tier-0 primitives, per ADR-0001 (inks provisional). */
const primitives = {
  blue: {
    light: {
      ink: '#2563EB',
      ground: '#F7F9FC',
      surface: '#FFFFFF',
      hairline: 'rgba(37, 99, 235, 0.16)',
      text: 'rgba(13, 27, 62, 0.88)',
    },
    'beam-dark': {
      ink: '#5B8DEF',
      ground: '#0B1220',
      surface: '#111C33',
      hairline: 'rgba(147, 178, 255, 0.16)',
      text: '#E8EEF9',
    },
  },
  green: {
    light: {
      ink: '#16A34A',
      ground: '#F7FAF8',
      surface: '#FFFFFF',
      hairline: 'rgba(22, 163, 74, 0.16)',
      text: 'rgba(9, 38, 23, 0.88)',
    },
    'beam-dark': {
      ink: '#3DCB7A',
      ground: '#0A1612',
      surface: '#0F211A',
      hairline: 'rgba(147, 255, 196, 0.14)',
      text: '#E4F3EA',
    },
  },
} as const;

/** ADR-0001: exactly one cool-tinted shadow, floating layers only. */
const floatingShadow = '0 4px 16px rgba(11, 18, 32, 0.16)';

const fonts = {
  sans: "var(--font-archivo), 'Archivo', 'Segoe UI', system-ui, sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};

/**
 * The antd lane: seeds + algorithms wherever a seed exists, plus the closed
 * map-token allowlist entries the language needs (ADR-0002). Radius 4 / SM 2 /
 * LG 6 and 280ms slow are not seed-derivable — that's why they're here.
 */
export function spectralAntdTheme(pack: Pack, mode: Mode): ThemeConfig {
  const p = primitives[pack][mode];
  const dark = mode === 'beam-dark';

  return {
    algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      // seeds
      colorPrimary: p.ink,
      colorInfo: pack === 'blue' ? p.ink : '#2563EB',
      colorSuccess: pack === 'blue' ? '#16A34A' : p.ink,
      colorError: '#DC2626',
      colorWarning: '#D97706',
      colorBgBase: dark ? p.ground : p.surface,
      colorTextBase: p.text,
      borderRadius: 4,
      fontFamily: fonts.sans,
      // allowlisted map tokens (not seed-derivable)
      borderRadiusSM: 2,
      borderRadiusLG: 6,
      motionDurationFast: '80ms',
      motionDurationMid: '160ms',
      motionDurationSlow: '280ms',
      motionEaseOut: 'cubic-bezier(0.25, 1, 0.5, 1)',
      colorBgLayout: p.ground,
      colorBorderSecondary: p.hairline,
      colorSplit: p.hairline,
      boxShadow: floatingShadow,
      boxShadowSecondary: floatingShadow,
      wireframe: false,
    },
    // the six shadow-zeroing `components` entries (ADR-0002): flat controls.
    components: {
      Button: { primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none' },
      Input: { activeShadow: 'none' },
    },
  };
}

/** Prism-tier values the prototype's own markup reads (antd never sees these). */
export function spectralPrimitives(pack: Pack, mode: Mode) {
  const p = primitives[pack][mode];
  return { ...p, mono: fonts.mono, floatingShadow };
}
