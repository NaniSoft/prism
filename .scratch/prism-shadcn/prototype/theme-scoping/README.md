# Theme scoping and runtime switching — prototype (ticket 08)

Throwaway artefacts for ticket 08. They are generated from the **current** token
values in `packages/tokens/dist` (single source of truth) with only the selector
line rewritten, so the byte deltas measured are selector cost, not token cost.

Nothing here ships; the decision and its expression as `themeSelector` are in
`issues/08-theme-scoping-and-runtime-switching.md`.

## Method

- `measure.mjs` reads the five packs' `dist/themes/<id>/{light,dark}.css` plus the
  base `dist/{light,dark}.css`, rewrites the selector for each candidate, and
  reports raw and gzip (zlib level 9) sizes. `results.json` holds the numbers and
  the bundles are written to `candidates/`.
- `verify-cascade.mjs` parses the generated CSS and resolves the custom-property
  cascade for representative root and subtree elements. It is a targeted matcher
  for the selector shapes the candidates emit, not a general CSS engine, but it is
  exact for these selectors. It does **not** model inheritance: a subtree that no
  rule matches is reported as `(none)`, which in a browser means it keeps the
  ancestor's value — that is the descendant-scoping test.
- `make-first-paint.mjs` writes three static pages that differ only in how a stored
  preference (`peach` + `dark`) reaches the document, each sampling the resolved
  background on every animation frame.
- `index.html` is a hand-openable demo: all five packs rendered as descendants of
  one page, with an in-page self-check that compares computed `--primary` to the
  known values for every pack and mode.

**No browser was reachable from this session** (`browser.tabs.open` returned
`[browser.disconnected]`), so the visual confirmation was not run here. The
numbers are analytic; the cascade facts are verified by `verify-cascade.mjs`; the
two HTML pages carry their own in-page assertions so a reviewer with a browser can
confirm in one click from this directory (`python -m http.server`, then open
`index.html`, `first-paint-*.html`).

Run:

```
node measure.mjs          # sizes -> results.json, candidates/*.css
node make-first-paint.mjs # first-paint-*.html
node verify-cascade.mjs   # analytic cascade check
```

## Candidate costs

`5pk` = the five selectable packs, light + dark, concatenated under one banner.
`all` = the base pack (`:root` / `.dark`) plus the five packs.

| Candidate | Selector (light / dark) | Blocks | 5pk raw | 5pk gzip | all raw | all gzip | Descendant scoping |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| (a) root attribute | `:root[data-pack="id"]` / `.dark[data-pack="id"]` | 12 | 10 269 | 1 611 | 12 263 | 1 852 | **No** for light subtrees |
| (b) root class | `.prism-pack-id` / `.dark.prism-pack-id` | 12 | 10 224 | 1 601 | 12 218 | 1 841 | Yes |
| (c) attribute-agnostic | `[data-pack="id"]` / `[data-pack="id"].dark` | 12 | 10 244 | **1 598** | 12 238 | **1 842** | Yes |
| (d) inline values on `style` | — (JS value table, `themes/index.js`) | 0 | — | — | 20 223 B raw | 1 756 B gzip | Yes, but see below |

Reading the numbers:

- **(c) is the cheapest gzipped 5-pack set** and is 10–13 bytes smaller gzipped
  than today's root-attribute shape. Attribute-agnostic selectors are *shorter*
  than `:root[data-pack=…]` (no `:root` prefix) and the dark companion is the same
  length as `.dark[data-pack=…]`, so descendant scoping costs nothing; it is
  slightly negative.
- **(b) is 20 raw / 3 gzip bytes smaller still**, but it changes the consumer
  markup contract from a namespaced attribute to class names
  (`class="prism-pack-mint"`). The saving is noise (0.2 %) and it puts pack
  identity in the same `class` list the consumer already owns, next to `.dark`,
  making it easier to collide or mistype. Not worth it.
- **(d) is not competitive**: the value table alone is 1 756 B gzipped (larger
  than the entire 12-block attribute-agnostic stylesheet), before React and before
  the per-subtree DOM duplication of every token. It also binds values with inline
  styles — the exact mechanism the standing preference forbids consumers to use,
  and the mechanism that produced the theme-switcher swatch-dot bug (inline styles
  have no cascade to fall back on). Rejected.

## Cascade / specificity behaviour (verified)

Source order is base light (`:root`), base dark (`.dark`), then each pack light
(`[data-pack="id"]`), pack dark (`[data-pack="id"].dark`).

Specificities: `:root`, `.dark`, `[data-pack="id"]` are all **(0,1,0)**;
`[data-pack="id"].dark` is **(0,2,0)**. So:

- The dark companion always beats its own light rule by specificity, independent
  of order — no ordering surprise when the stylesheet is split, concatenated or
  imported in a different order by a bundler.
- Base `:root` vs a pack light rule are both (0,1,0), so **per-pack light must be
  emitted after base light**; the emitted order guarantees it.
- An explicit `data-pack` on a descendant matches that descendant, re-pointing the
  custom properties for its whole subtree.

`verify-cascade.mjs` output:

```
=== root-attribute ===      2 subtree cases fail (light subtrees get no rule)
=== root-class ===          all cases pass
=== attribute-agnostic ===  all cases pass
```

The root-attribute failures are exactly the defect in `DESIGN.md`: a descendant
attribute does not re-point anything in light mode (the dark companion does
happen to match a descendant, which is why the old bug looked partial).

## Decision

**Adopt (c):** `[data-pack="<id>"]` for light and `[data-pack="<id>"].dark` for
dark, with the base pack on the plain root default (`:root` light, `.dark` dark,
i.e. the absence of `data-pack`). It is the strongest option because it is the
only one that makes descendant scoping work while also being the cheapest
gzipped set, uses a namespaced attribute rather than the consumer's class list,
and keeps the emitted CSS a pure selector-template change.

Expressed as ticket 06's single output switch in `theme-selector.mjs`:

```js
// light
`[data-pack="${id}"]`
// dark
`[data-pack="${id}"].dark`
```

`THEME_SELECTOR_STYLE` defaults to `'root-attribute'` (ticket 06's default); the
build config sets it to `'attribute-agnostic'`. The switch also carries
`'root-class'` so the comparison stays reproducible. The attribute name is
`data-pack` in every value — ticket 07 fixed the rename, so this switch never
emits `data-theme`.

### The subtree rule (Q2)

Pack and mode stay **two separate axes**. A themed subtree states **both**: put
`data-pack="<id>"` (or omit it for `default`) and add `class="dark"` for dark.
That is all — markup and props, no CSS.

- Custom properties inherit, so a descendant that changes nothing keeps its
  ancestor's pack and mode.
- A descendant that sets only `data-pack` gets that pack's **light** values, even
  inside a dark page, because `[data-pack="mint"]` has no knowledge of an ancestor
  `.dark`.
- A descendant that sets only `class="dark"` gets the **default** pack's dark
  values, because `.dark` overrides the inherited pack values.

`themeAttributes({ pack, mode })` (ticket 07) returns both attributes, so a
consumer writing a themed subtree never has to think about this. The rejected
alternative — emitting `.dark [data-pack="<id>"]` as well, so mode inherits into a
subtree — makes it **impossible to show a light subtree inside a dark page**,
which is exactly the docs case (all five packs at once). It is also more
selectors. Therefore the explicit companion is chosen.

The demo `index.html` renders all five packs simultaneously as descendant
`<div data-pack>` elements with a subtree mode switch, and asserts each computed
`--primary` against the known per-pack value.

## First paint (Q3)

The site is a **static export**. There is no runtime server and no middleware
(`proxy.ts` is forbidden under `output: 'export'`, ticket 03), which fixes the
options:

| Mechanism | Behaviour under static export | Flash |
| --- | --- | --- |
| Blocking inline `<head>` script | Runs parser-blocking, before first paint and before React; reads `localStorage`; sets `data-pack` / `dark` on `<html>`. `suppressHydrationWarning` on the root. | **None.** First paint is already correct. Cost ~300 B inline per document. |
| Server-set attribute | Under static export it is a **build-time** attribute: the same for every visitor. Correct only for the visitor whose stored preference equals the build default. | Flashes for everyone else until a deferred correction runs. |
| Cookie-backed default | A cookie is only readable by a server or by JS. With no server it is read by the same JS path as `localStorage`, adds a request header on every same-origin request, and buys nothing. | Same as the JS path; strictly worse. |

**Decision:** keep the blocking inline script as the static-export first-paint
mechanism. It is the only mechanism that can honour a per-user preference before
first paint without a server. The build/server-rendered attribute is the
**fallback**: the script applies a valid stored value, and otherwise leaves the
document exactly as rendered (never clobbers an attribute it did not set), so the
no-JS baseline and the provider's `stored -> attribute -> default` resolution
(ticket 07) agree.

`first-paint-*.html` implements the three pages; the deferred page demonstrates
the failure mode (first frame at the base light `#ffffff`, later frames at peach
dark `#1b1715`), while the blocking and server pages settle on the first frame.
Open them and read the `#result` pre.

## Files

| File | What |
| --- | --- |
| `measure.mjs` | generates the candidate CSS and the size table; writes `results.json` |
| `candidates/*.css` | generated bundles for `root-attribute`, `root-class`, `attribute-agnostic` |
| `verify-cascade.mjs` | analytic cascade/specificity check for all three candidates |
| `theme-selector.mjs` | proposed `themeSelector` output switch for `build/themes.mjs` |
| `index.html` | all-five-packs descendant demo + self-check (hand-openable) |
| `make-first-paint.mjs`, `first-paint-*.html` | blocking vs deferred vs build-time-attribute first paint |
| `results.json` | the measured numbers |

## Caveats

- The token build has not been re-run; the current `dist` still emits
  `data-theme`. The probe rewrites the selector only, which is the correct
  comparison since the decision is a selector-template decision.
- Sizes are for one concatenated bundle with one banner. Shipping the ten
  per-pack files as-is adds banners and repeated braces on the order of 10 × ~60
  B; identical across candidates.
- The measurements exclude the base `@theme` utilities in `theme.css` (unchanged
  by this decision) and any `@layer`/preflight rules in `styles.css`.
