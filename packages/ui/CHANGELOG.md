# @nanisoft/prism-ui

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
