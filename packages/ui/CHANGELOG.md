# @nanisoft/prism-ui

## Next release — Prism-owned Base UI runtime

### Breaking changes

- Replace the retired generated component layer with the curated Prism-owned
  components → blocks → pages catalog. Base UI remains an internal accessibility
  dependency; no Base UI symbols are re-exported in public declarations.
- `PrismProvider`, theme objects, and the plain-CSS variable surface are the
  supported theming API. Migrate consumers from the previous runtime and theme
  lane before upgrading.

## 0.4.0

### Minor Changes

- f122c34: Cross-site chrome (ADR-0006): the shared site shell as npm-delivered blocks. `SiteHeader` (product switcher, theme-mode toggle, mobile drawer built in; identity via the `site` registry prop), `SiteFooter` (registry-driven product grid — the platform story rendered — plus site-declared columns, social links, and a `legal` override), the five-entry `prismProducts` registry with pack-dot colours, `PrismThemeModeProvider`/`usePrismThemeMode` (mode is the chrome's one context), and the flash-free mode mechanics: `prismThemeBootScript()`, the shared `PRISM_THEME_MODE_STORAGE_KEY`, and the build-time bake helpers on the new `./theming` subpath.

## 0.3.0

### Minor Changes

- f6d5b5a: The pastel pack spectrum (ADR-0005): `PrismPackId` widens from two packs to five — blue and green are re-expressed in pastel voice (new atmospheres, softened inks; ids and all shared system shape unchanged), joined by new lavender, rose, and peach packs. `getPrismTheme()`/`createPrismTheme()` accept all five; theme atoms double to ten; `get_theme_doc`'s pack enum widens to match. Additive — no id was removed or renamed.

### Patch Changes

- Updated dependencies [f6d5b5a]
  - @nanisoft/prism-tokens@0.3.0

## 0.2.0

### Minor Changes

- 44a699d: Bootstrap the Prism monorepo: buildable placeholder packages (`prism-tokens`, `prism-ui`, `prism-llms`, `prism-mcp-server`), the static-export site app, and the changesets release pipeline.
- f31fb25: prism-llms: the real generator — one `dist/` with the `PrismDocsStore` projection (`data.json`), `llms.txt`/`llms-full.txt`, and the `md/` mirror tree; the props extractor (`./extractor`) and Markdown lane exported for the site; `prism-llms#check` drift gate enforcing the seven corpus invariants in CI. prism-ui: codegen now emits the pass-through list (`./generated/pass-throughs`) and `./wrapped-registry` is an export subpath, so the catalog is built in exactly one place. prism-mcp-server: `PrismDocsStore` + `parsePrismDocsStore` exported from the contract's canonical home.

### Patch Changes

- 454b4c9: prism-ui: `PrismProvider` now carries the `'use client'` directive. A server component rendering the provider handed antd's `ConfigProvider` a `theme` whose `algorithm` serialized to `undefined` across the RSC boundary — silent light-token derivation for dark themes. `prismTheme` is plain frozen data, so the props serialize and the algorithm attach happens client-side; consumers need no changes.
- 721b5f4: prism-ui: the `./styles.css` export actually ships now — the build copies `src/styles.css` into `dist/` (tsc never emitted it, so the export dangled until the site became the first consumer).
- Updated dependencies [44a699d]
  - @nanisoft/prism-tokens@0.2.0
