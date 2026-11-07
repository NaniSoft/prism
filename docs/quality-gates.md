# Quality gates A–L: which program holds which law

Every Mission §10 gate is a program under `packages/ui/scripts/` or
`packages/tokens/scripts/`, run by `pnpm check` and proved by a test with a
positive and a negative case. The map below names the program; the laws
themselves are its failure messages.

| Gate | Program | What it holds |
| --- | --- | --- |
| A. Token compliance | `check-token-compliance` (+ `check-contrast`, `check-emitted-contract`, `check-elevation-layout`, `check-container-namespace`, `check-vector-ink`, `check-variant-ink`, `check-motion`) | No hex, no rgb()/hsl(), no arbitrary `bg-[#...]` outside the foundation tier; semantic names byte-identical to the shadcn contract; every semantic role covered by a contrast row (37 roles: 32 measured, 5 chart/radius exempt by recorded reason); the container/`--breakpoint-*` namespace closed by wildcard before authored entries |
| B. Component compliance | `check-token-compliance` + `check-variant-ink` + `check-focus-indicators` | Component styling uses semantic utilities (`bg-background`, `text-muted-foreground`); a variant that sets its own fill sets its own ink (39 variants); every focus indicator full-strength |
| C. Asset metadata | `check-asset-metadata` | Every manifest entry names a file that exists, fits its category budget, and carries the measured dimensions (PNG IHDR, SVG viewBox, font bytes) |
| D. Asset resolution | `check-asset-resolution` | Every raster source clears `maxRendered × DPR` on both axes (3 judged, 10 vector/font exempt) |
| E. SVG security | `check-svg-security` | No `<script>`, no `on*`, no external `href`, no `<style>`, `viewBox` present, painted hex only under a manifest exemption |
| F. Theme completeness | `check-theme-resolution` + `check-pack-boundary` + `check-contrast` (8 packs × light/dark) + `ds-matrix.test` (16/16 render) | Every DS component renders under all 16 pack×mode combinations; the boot script and `resolveTheme` agree on 32 rows including the `system` default |
| G. Responsive completeness | `check-breakpoint-variants` + `check-container-namespace` + `ds-matrix` (grid narrows below `sm`) + Playwright `visual.spec` at 390/768/1440 (768 committed) | Every responsive variant names a screen the tokens emit (`sm/md/lg/xl`, `2xl` closed); every asset-variant `sizes` pairing exists; grid/staging grids asserted at phone width |
| H. Accessibility | `check-focus-indicators` + `check-nested-controls` + `check-block-controls` + `a11y.test` (axe, 30+ cases) + `ds-assets.test` + `ds-matrix.test` (axe per component) + Playwright axe on the home page | Automated axe (no `color-contrast` in jsdom: that rule runs in the real browser), keyboard/arrow models, focus rings, screen-reader names, reduced motion |
| I. Visual regression | Playwright `toHaveScreenshot` (7 routes × 3 viewports, report-only in CI) + `display.spec`/`header-fit.spec` | Report-only until two consecutive green weeks; the docs site Dememos are the reference (no Storybook is needed because the docs site is the showcase the catalogue drives) |
| J. Distribution isolation | `test-clean-consumer` (CI `verify`) + `verify-tarballs` | Real tarball installs in Vite CSR and Next.js static-export apps, built with only `@nanisoft/prism-ui/styles.css` |
| K. Performance | `check-client-budget` (all-client 357.1 KB gzip ≤ 384 KB ceiling; `ds-avatar 4.9/5`, `ds-image 0.7/6`) + `check-boot-budget` (1179 B ≤ 1408 B) + `check-stylesheet-budget` (139.7 KB ≤ 160 KB) + `check-typeface` (fonts + licence) | JS bundle, pre-paint script, stylesheet, fonts |
| L. Asset integrity | `check-asset-integrity` (+ Gate C) | Every shipped font listed, present, non-empty, and named by the CSS; `dist/assets/manifest.json` ships and is required by `verify-tarballs` |

## Where the tests are

- `packages/ui/test/asset-gates.test.tsx` — Gates C/D/E positive and negative fixtures
- `packages/ui/test/compliance-gates.test.tsx` — Token-compliance, stylesheet-budget and asset-integrity failures proved, plus clean passes over the real tree
- `packages/ui/test/ds-assets.test.tsx` — DS behaviours (ratios, registry, sizes, video captions, matrix arithmetic)
- `packages/ui/test/ds-matrix.test.tsx` — Gates F/G/H over the DS layer (16 combinations, grid narrowing, axe)
- `packages/ui/test/a11y.test.tsx`, `interaction.test.tsx`, `provider.test.tsx`, `theme-resolution-gate.test.tsx` — axe, keyboard, theme truth
- `scripts/__tests__/check-*.test.mjs` — tokens gates (motion, elevation, heading, block-controls), gate-kit and contrast/determinism proofs

## What is not gated yet

- No CSS selector coverage for the forthcoming `DSMediaCard` container variants and no `DS*` per-item budget until its measured row lands (placeholder `ds-image 6`, `ds-avatar 5` until the first measurement, then the real figure).

A new reusable visual requirement arrives as a token, a component, a gate row in one of these tables, and a change to this file in one changeset.
