# 06 — System, site, and app composition revamp

Type: task
Status: resolved
Blocked by: 04

## Question

Revamp the Prism design system, website, and composed app examples so the product feels as resolved and persuasive as the leading component catalogs while preserving Spectral Refraction and the public Prism API.

## Confirmed direction

- Keep and sharpen the established Spectral Refraction world rather than replacing it.
- Preserve existing public component, block, page, and provider APIs; prefer recipe and composition changes over breaking exports.
- Make the landing first viewport prove a real finished page assembled from Prism, not a diagram of ingredients.
- Search and present the checked 43-item components → blocks → pages catalog truthfully.
- Carry the approved composition language through tokens, UI recipes, site chrome, blocks, pages, and demos.
- Consolidate theme selection and make the complete pack/mode system reachable on desktop and mobile.

## Acceptance

- The landing has one obvious primary action and one coherent secondary action.
- The first viewport renders a real exported page composition with truthful, synthetic demonstration content clearly labeled.
- The catalog proof covers all checked items and suggested queries return expected results.
- Existing public exports remain compatible; any required additions are additive and documented.
- Blocks and pages feel materially more composed rather than behaving as disconnected control showcases.
- Theme selection remains flash-free, reachable on desktop and mobile, and valid across all ten expressions.
- Light and beam-dark captures pass bounded desktop/mobile review with no horizontal overflow.
- UI, tokens, docs content, generated projections, tests, builds, and changesets are updated where public behavior or corpus output changes.

## Answer

Shipped the code-led Product Window Wall revamp across the owned UI recipes, site, and composed examples while preserving Spectral Refraction and the existing public exports. The landing now leads with a real `DashboardPage` composition, one primary and one secondary action, clearly labeled synthetic workstream data, and a searchable proof of the full 29-component / 9-block / 5-page catalog. The grouped five-pack × two-mode control is reachable from the desktop header and mobile drawer, remains flash-free, and exposes all ten expressions.

Lifted the system through application shells, tables, settings, auth, docs, editorial, and site chrome with additive composition props (`landmark` and `modeSwitch={false}`) where needed. Added substantive authored demos for every block and page, regenerated the docs/LLM projections, added the release changeset, and kept the demos explicitly synthetic rather than presenting adoption or customer claims. `DESIGN.md` and `.impeccable/design.json` were refreshed and spot-checked against the shipped recipes, tokens, all ten theme grounds, motion, elevation, typography, and Spectral Refraction rules; no visual-world replacement was needed.

Final review was **ship**. Bounded desktop/mobile light and beam-dark captures are recorded under `.impeccable/review/revamp-final/` and `.impeccable/review/revamp-rose-light/`; the targeted detector run over the shipped landing TSX returned no findings. `pnpm build`, `pnpm test`, `pnpm check`, `pnpm lint`, `git diff --check`, and a fresh site dev startup with an HTTP 200 landing response pass.
