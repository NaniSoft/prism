# @nanisoft/prism-llms

## Next release — owned-catalog corpus

### Breaking changes

- Regenerate `llms.txt`, Markdown mirrors, and `PrismDocsStore` for the
  Prism-owned 29-component / 9-block / 5-page catalog.
- Corpus items now carry internal `primitive` metadata; the previous upstream
  base/routing field is gone. Consumers should use the public Prism props and
  import contract.

## 0.4.0

### Minor Changes

- f122c34: Corpus grows by the cross-site chrome: `SiteHeader` and `SiteFooter` catalog items, stub docs, and llms.txt entries.

## 0.3.0

### Minor Changes

- f6d5b5a: The pastel pack spectrum (ADR-0005): `PrismPackId` widens from two packs to five — blue and green are re-expressed in pastel voice (new atmospheres, softened inks; ids and all shared system shape unchanged), joined by new lavender, rose, and peach packs. `getPrismTheme()`/`createPrismTheme()` accept all five; theme atoms double to ten; `get_theme_doc`'s pack enum widens to match. Additive — no id was removed or renamed.

## 0.2.0

### Minor Changes

- 44a699d: Bootstrap the Prism monorepo: buildable placeholder packages (`prism-tokens`, `prism-ui`, `prism-llms`, `prism-mcp-server`), the static-export site app, and the changesets release pipeline.
- f31fb25: prism-llms: the real generator — one `dist/` with the `PrismDocsStore` projection (`data.json`), `llms.txt`/`llms-full.txt`, and the `md/` mirror tree; the props extractor (`./extractor`) and Markdown lane exported for the site; `prism-llms#check` drift gate enforcing the seven corpus invariants in CI. prism-ui: codegen now emits the pass-through list (`./generated/pass-throughs`) and `./wrapped-registry` is an export subpath, so the catalog is built in exactly one place. prism-mcp-server: `PrismDocsStore` + `parsePrismDocsStore` exported from the contract's canonical home.
