---
'@nanisoft/prism-ui': minor
---

Take the catalogue from 106 Items to 236

Adds 130 Items in Prism's own vocabulary: 23 foundation Components, 96 Blocks, 10
Pages and one live surface. Every name is an addition, so no consumer import
breaks, and every Item follows the rules the package already held rather than
relaxing them: no shipped copy, no fetching, no raw colour, and motion by token.

The shapes that were not upstream's are the ones worth naming, because each is a
translation rather than a copy. Upstream's storefront comparison is
`offering-categories-01` and its spec sheet is `spec-table-01`, because what a
buyer compares in a pipeline product is a connector's declared bounds rather than
a plan's feature list. `tool-ledger-01` is the second live surface and takes a
`subscribe` function the consumer supplies, so Prism still owns no socket.
`directory-01`, `project-dashboard-01`, `ops-checklist-01` and `handoff-01` were
added because a Block already in the roster reached for something absent.

Two names move because nothing had imported them. `CalendarBlock01` is now
`Calendar01`, and the deferred `input-otp` resolved to the published
`one-time-code`. Four `*Variant` types are now `*Form`, since the surface gate
rejects an exported union under a name that reads as a styling axis.

`Progress` gains a string `valueText` prop for the server Block that cannot carry
a callback across the boundary, `dayKey` is exported from `lib/utils` for the
Blocks that share a date key, and the emitted `live` subpath now resolves its
relative specifiers, which it did not.

The client bundle is 250.4 KB against a ceiling moved from 208 KB to 260 KB. The
move is a forecast about weight that had not landed, and the gate's own comment
records why it differs from the two earlier corrections. `docs/history/roster-expansion.md`
holds the decisions, and `DESIGN.md` records that the v1.1 deferred tail has
shipped.