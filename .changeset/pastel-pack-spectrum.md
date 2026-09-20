---
'@nanisoft/prism-tokens': minor
'@nanisoft/prism-ui': minor
'@nanisoft/prism-llms': minor
'@nanisoft/prism-mcp-server': minor
---

The pastel pack spectrum (ADR-0005): `PrismPackId` widens from two packs to five — blue and green are re-expressed in pastel voice (new atmospheres, softened inks; ids and all shared system shape unchanged), joined by new lavender, rose, and peach packs. `getPrismTheme()`/`createPrismTheme()` accept all five; theme atoms double to ten; `get_theme_doc`'s pack enum widens to match. Additive — no id was removed or renamed.
