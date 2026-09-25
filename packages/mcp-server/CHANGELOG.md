# @nanisoft/prism-mcp-server

## 1.0.0

### Major Changes

- af80270: Replace the retired upstream component layer with Prism-owned source. Prism now
  ships a curated components → blocks → pages catalog backed internally by Base UI
  and plain CSS; themes expose pure primitives, semantics, and CSS variables; and
  consumers install only React plus `@nanisoft/prism-ui`.
  
  This is a clean breaking release. Remove imports of the retired runtime,
  migrate to the curated catalog, and regenerate the docs/corpus after upgrading.
  The Prism MCP now answers the complete owned surface and treats Base UI as
  internal metadata rather than a second consumer API.

## Next release — Prism-only MCP surface

### Breaking changes

- `PrismDocsItem` replaces the retired upstream base field with required
  `primitive: 'base-ui' | 'native'` metadata.
- All eight tools now describe the complete Prism-owned surface and keep the
  single `@nanisoft/prism-ui` import boundary; they no longer route questions
  to another component library.

## 0.3.0

### Minor Changes

- f6d5b5a: The pastel pack spectrum (ADR-0005): `PrismPackId` widens from two packs to five — blue and green are re-expressed in pastel voice (new atmospheres, softened inks; ids and all shared system shape unchanged), joined by new lavender, rose, and peach packs. `getPrismTheme()`/`createPrismTheme()` accept all five; theme atoms double to ten; `get_theme_doc`'s pack enum widens to match. Additive — no id was removed or renamed.

## 0.2.0

### Minor Changes

- 44a699d: Bootstrap the Prism monorepo: buildable placeholder packages (`prism-tokens`, `prism-ui`, `prism-llms`, `prism-mcp-server`), the static-export site app, and the changesets release pipeline.
- f31fb25: prism-llms: the real generator — one `dist/` with the `PrismDocsStore` projection (`data.json`), `llms.txt`/`llms-full.txt`, and the `md/` mirror tree; the props extractor (`./extractor`) and Markdown lane exported for the site; `prism-llms#check` drift gate enforcing the seven corpus invariants in CI. prism-ui: codegen now emits the pass-through list (`./generated/pass-throughs`) and `./wrapped-registry` is an export subpath, so the catalog is built in exactly one place. prism-mcp-server: `PrismDocsStore` + `parsePrismDocsStore` exported from the contract's canonical home.
