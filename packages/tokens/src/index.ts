/**
 * Design tokens for Prism — the single source of truth for the Prism design language.
 *
 * Bootstrap placeholder: the real token architecture (primitives → semantics → antd
 * mapping, `createPrismTheme()`, brand packs) is specified by the token architecture
 * ADR on the Prism map (`.scratch/prism/map.md`, ticket 09) and implemented against it.
 */
export const prismTokensBootstrap = {
  schema: 'placeholder',
  packages: [
    '@nanisoft/prism-tokens',
    '@nanisoft/prism-ui',
    '@nanisoft/prism-llms',
    '@nanisoft/prism-mcp-server',
  ],
} as const;

export type PrismTokensBootstrap = typeof prismTokensBootstrap;
