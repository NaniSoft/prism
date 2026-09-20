# @nanisoft/prism-ui

## 0.2.0

### Minor Changes

- 44a699d: Bootstrap the Prism monorepo: buildable placeholder packages (`prism-tokens`, `prism-ui`, `prism-llms`, `prism-mcp-server`), the static-export site app, and the changesets release pipeline.
- f31fb25: prism-llms: the real generator — one `dist/` with the `PrismDocsStore` projection (`data.json`), `llms.txt`/`llms-full.txt`, and the `md/` mirror tree; the props extractor (`./extractor`) and Markdown lane exported for the site; `prism-llms#check` drift gate enforcing the seven corpus invariants in CI. prism-ui: codegen now emits the pass-through list (`./generated/pass-throughs`) and `./wrapped-registry` is an export subpath, so the catalog is built in exactly one place. prism-mcp-server: `PrismDocsStore` + `parsePrismDocsStore` exported from the contract's canonical home.

### Patch Changes

- 454b4c9: prism-ui: `PrismProvider` now carries the `'use client'` directive. A server component rendering the provider handed antd's `ConfigProvider` a `theme` whose `algorithm` serialized to `undefined` across the RSC boundary — silent light-token derivation for dark themes. `prismTheme` is plain frozen data, so the props serialize and the algorithm attach happens client-side; consumers need no changes.
- 721b5f4: prism-ui: the `./styles.css` export actually ships now — the build copies `src/styles.css` into `dist/` (tsc never emitted it, so the export dangled until the site became the first consumer).
- Updated dependencies [44a699d]
  - @nanisoft/prism-tokens@0.2.0
