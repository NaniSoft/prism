# @nanisoft/prism-ui

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

### Minor Changes

- 31dbcd5: Accessibility and theming hardening from two design audits.
  
  **Token architecture (prism-tokens)**
  - antd's overshoot `motionEaseOutBack`/`motionEaseInBack` seeds are pinned to the single brand curve (bounce is banned).
  - Component overrides drop `algorithm: true`; antd's component algorithm re-derived the global map tokens from antd defaults, which turned light-mode hairlines into stock greys (`#d9d9d9`) and discarded the pack's tinted `colorBorder`. The allowlist therefore grew by `colorPrimaryBorder`, routed to the ink because antd's `genFocusOutline()` hardcodes that token as the `:focus-visible` outline colour and its derived stop fails WCAG 1.4.11.
  - `Button.primaryColor` now carries `textOnInk` (white in light, `#0A0F1C` in beam-dark). antd defaults it to `colorTextLightSolid` (`#fff`), which failed AA on every lightened beam-dark ink (blue 4.18:1, peach 3.62:1).
  - Shared success/warning hues darken to `#15803D`/`#B45309` and every state hue is gated at ≥4.5:1 on the white surface and ≥3:1 on the beam ground.
  - ADR-0002 errata 3–6 record each change with evidence; the allowlist test asserts the new key.
  
  **Accessibility and components (prism-ui)**
  - `styles.css`: reduced-motion handling, `font-display: swap`, ≥24px/44px touch targets.
  - `PageHeader` gains an optional `level`; `DocsShell` renders separators as non-link labels and labels its asides; `ProductDot`/`productDotBackground` resolve the ambient mode; the throwaway `./prototype` subpath is removed.
  
  **Site (apps/site)**
  - Mobile `DocsShell` now collapses to one column below 900px (the article was ~54px wide at 390px).
  - Pack-switcher labels use a visually-hidden pattern (not `display:none`) so the collapsed radios keep their accessible name.
  - Reduced-motion override moved after the base rule (source order had been defeating it).
  - Landing specimen Switch/Slider/Input given accessible names; shell nav exposes `aria-current="page"` plus a selected state.
  - Small mono annotations and ledes render at full contrast (an ink@0.82 wash composited to ~3.5:1 on the pastel light grounds); the hierarchy comes from mono/size rather than a fade.
  - Coarse-pointer hit areas raised on the shell Segmented controls; theme-gallery strip stacks on phones.
  - Dropped the duplicate `next/font` pipeline; the `v1.0` landing tag follows the pack instead of a hardcoded antd blue; copy confirmation is announced via a live region.
  
  **Known follow-ups (measured, not yet fixed)**
  - antd's *preset* state `Tag` colours fail AA for every possible seed (`#16A34A` 2.47:1, `#15803D` 2.64:1, `#166534` 2.84:1 light) because antd mixes the tag background toward the seed. Fixing them needs a dedicated mode-aware `stateXText` token (a published tier-1 addition that also flows to the DTCG/Figma export) plus a tag recipe. Direction approved (tinted wash + accessible text); implementation is a separate, reviewable change.
  - Body-prose opacity tiering (0.75–0.85 on 14–15px paragraphs) is left as-is pending the same review; the measured failures (mono labels, ledes, island mode) are fixed.
  - The 515 KB single-file theme bake and the ~1.08 MB initial client chunk remain open (splitting per theme would trade away flash-free theming for stored non-default themes).
  
  Minor (0.x) for the component-override changes and the `./prototype` removal.
- 12a6856: Revamp Prism's owned UI recipes and composed app examples around a sharper Spectral Refraction system. Existing component, block, page, and provider APIs remain compatible while typography, hairline depth, application shells, tables, settings, docs, auth, and editorial layouts gain clearer hierarchy and production-ready states.
  
  Expand the high-level docs catalog with credible live demos for every page and block, and rebuild the website around a real Product Window Wall, complete 43-item search, and one grouped theme control available on desktop and mobile. Generated docs and agent corpus projections pick up the same authored demo source.

### Patch Changes

- Updated dependencies [31dbcd5]
- Updated dependencies [af80270]
  - @nanisoft/prism-tokens@1.0.0

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
