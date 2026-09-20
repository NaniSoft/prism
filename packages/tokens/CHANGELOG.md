# @nanisoft/prism-tokens

## 0.3.0

### Minor Changes

- f6d5b5a: The pastel pack spectrum (ADR-0005): `PrismPackId` widens from two packs to five — blue and green are re-expressed in pastel voice (new atmospheres, softened inks; ids and all shared system shape unchanged), joined by new lavender, rose, and peach packs. `getPrismTheme()`/`createPrismTheme()` accept all five; theme atoms double to ten; `get_theme_doc`'s pack enum widens to match. Additive — no id was removed or renamed.

## 0.2.0

### Minor Changes

- 44a699d: Bootstrap the Prism monorepo: buildable placeholder packages (`prism-tokens`, `prism-ui`, `prism-llms`, `prism-mcp-server`), the static-export site app, and the changesets release pipeline.
