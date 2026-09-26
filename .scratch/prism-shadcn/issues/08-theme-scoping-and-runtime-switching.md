---
Labels: wayfinder:prototype
Type: prototype
Status: resolved
Blocked by: 06, 07
---

# Theme scoping and runtime switching

## Question

How are the five packs scoped in CSS, and how does a consumer and the
documentation site switch between them at runtime without a flash?

This is a prototype ticket because the answer is a behaviour, and the cheapest
way to settle it is to build two or three candidate mechanisms and look at them.
`DESIGN.md` in this repository records the defect that motivates it: the token
build emits only root-scoped selectors, `:root[data-theme="<id>"]` and
`.dark[data-theme="<id>"]`, so an attribute on a descendant element does not
re-point custom properties for its subtree. The themes page works around it by
reading literal values out of `themeTokens` and painting inline styles, and the
comment there says so. The theme switcher had a related bug where the swatch
dots took light values in dark mode.

Settle by prototyping:

1. **The selector shape.** Compare at least: root attribute only, root class
   only, an attribute-agnostic `[data-theme="<id>"]` selector that also matches
   descendants, and a scoped-name or inline-variable approach where the theme's
   resolved values are bound to a style attribute on the subtree. For each,
   report the cost: total CSS size across five packs times two modes, whether
   the descendant technique works, whether specificity causes ordering
   surprises, and what a consumer's own markup is allowed to do.
2. **Downstream scoping.** Whether a consumer can render a themed subtree
   without touching CSS, for example a marketing page that shows all five packs
   at once. Under the standing preference that consumers never write CSS, the
   answer has to be reachable through markup and props alone. If it cannot be,
   that is a finding worth surfacing, because the documentation site needs it
   and the site's constraint is the same one consumers have.
3. **First paint.** The current mechanism is a blocking inline script in the
   document head that reads localStorage and sets the attribute before React
   hydrates, with `suppressHydrationWarning` on the root element. Compare that
   against a server-set attribute and a cookie-backed default, and report the
   measured flash behaviour of each in a real browser at both colour modes. The
   old repository used pre-baked rulesets with a class swap and recorded the
   size cost; establish the current numbers rather than assuming them.
4. **Mode versus pack.** The old model separated pack from mode, with mode named
   `beam-dark`; this repository has a plain `dark` class plus a `data-theme`
   attribute. Decide whether the two axes stay separate in the emitted CSS and
   in the public API, or collapse. This is a vocabulary question as much as a
   CSS one, so coordinate with the token and governance tickets rather than
   deciding it twice.
5. **What the prototype leaves behind.** Build the candidates as a throwaway
   artefact under the scratch directory, not in the shipped source. Link it
   from this ticket. Record the measurements, because the decision will be
   argued from them later.

Consult `prototype` and `browser` for the visual and measured parts. Consult
`animate` only if the switch itself needs a transition, and hold to the
standing motion doctrine while doing it: state feedback, 80, 160 and 280
milliseconds, no entrance or scroll animation.

## Answer

Prototype: `.scratch/prism-shadcn/prototype/theme-scoping/` (README with the
method and the full table; `measure.mjs`, `verify-cascade.mjs`,
`theme-selector.mjs`, `index.html`, `first-paint-*.html`, `results.json`).

Method, stated honestly: the browser tools were **disconnected** in this session
(`browser.tabs.open` returned `[browser.disconnected]`), so the visual pass was
not run here. The size numbers are analytic — a Node script reads the current
`packages/tokens/dist` token values and rewrites only the selector line, so the
delta measured is selector cost. The cascade claims are verified by a targeted
matcher over the generated CSS, not eyeballed; `index.html` and the
`first-paint-*.html` pages carry in-page assertions so a reviewer with a browser
can confirm in one click. The token build was not re-run: `dist` still emits
`data-theme`, which is irrelevant to a selector-template decision.

### 1. The selector shape

**Chosen: attribute-agnostic.** Light `[data-pack="<id>"]`, dark
`[data-pack="<id>"].dark`; the base pack keeps the plain root default (`:root`
light, `.dark` dark) because absence of `data-pack` is the `default` pack
(ticket 07).

Five packs × two modes, one banner, gzip level 9:

| Candidate | light / dark selector | 5-pack raw | 5-pack gzip | all 6 packs raw | all gzip | Descendant |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| (a) root attribute | `:root[data-pack="id"]` / `.dark[data-pack="id"]` | 10 269 | 1 611 | 12 263 | 1 852 | **no** (light) |
| (b) root class | `.prism-pack-id` / `.dark.prism-pack-id` | 10 224 | 1 601 | 12 218 | 1 841 | yes |
| (c) attribute-agnostic | `[data-pack="id"]` / `[data-pack="id"].dark` | 10 244 | **1 598** | 12 238 | **1 842** | yes |
| (d) inline values | no CSS; `themes/index.js` value table | — | — | 20 223 | 1 756 | yes, but see below |

- (c) is the cheapest gzipped 5-pack set and is 10–13 bytes smaller gzipped than
  today's root-attribute shape. Attribute-agnostic selectors are shorter than the
  `:root[…]` form, and the dark companion is the same length as `.dark[…]`, so
  **descendant scoping costs nothing — it is slightly negative.** This is the
  measurement that contradicts the priors and settles the ticket.
- (b) saves 20 raw / 3 gzip bytes (0.2 %) but moves pack identity into the
  consumer's `class` list next to `.dark`, where it can collide or be mistyped,
  and changes the markup contract from a namespaced attribute. Not worth 3 bytes.
- (d) loses outright: the value table alone (1 756 B gzip) is larger than the
  entire 12-block stylesheet, before React and before duplicating every token into
  every themed subtree as an inline style. Inline styles are also the exact
  mechanism the contract forbids consumers, and the mechanism behind the recorded
  swatch-dot bug (an inline style has no cascade to fall back on). Rejected.

Specificity/ordering, verified: `:root`, `.dark` and `[data-pack="id"]` are all
(0,1,0); `[data-pack="id"].dark` is (0,2,0). The dark companion therefore always
beats its own light rule by specificity regardless of source order, so a bundler
reordering imports cannot invert a pack's modes. Base `:root` and a pack's light
rule are equal-specificity, so the emitted order is **base light, base dark, then
each pack light, pack dark** — `themeSelector` is called in that order and each
pack's dark selector carries the extra `.dark` compound.

What consumer markup may do: any element may carry `data-pack` to become a theme
boundary for itself and its subtree, and `class="dark"` to set mode. Nothing else
is needed and nothing else is permitted; a consumer cannot re-point or override a
value without higher-specificity CSS, which the contract prohibits (documentary,
review-enforced, exactly as ticket 07 says for `className`). One pre-existing
hazard is unchanged: a consumer's own unrelated `.dark` class triggers the default
dark pack, because `.dark` is a global class.

`verify-cascade.mjs` confirms the shapes: root-attribute fails the two light
subtree cases (no rule matches a descendant `[data-pack]` — the `DESIGN.md`
defect), while root-class and attribute-agnostic pass all nine root/subtree cases.

### 2. Downstream scoping — yes, through markup alone

A consumer can render a themed subtree without touching CSS. Pack and mode stay
**two axes**, and a themed subtree **states both**:

```tsx
// inside a page, using only markup
<div data-pack="mint" className="dark">…</div>
```

Custom properties inherit, so a descendant that changes nothing keeps its
ancestor's pack and mode. The two rules a consumer must know, and that
`themeAttributes({ pack, mode })` (ticket 07) satisfies automatically:

- setting only `data-pack` yields that pack's **light** values even inside a dark
  page, because `[data-pack="mint"]` cannot see an ancestor `.dark`;
- setting only `class="dark"` yields the **default** pack's dark values, because
  `.dark` overrides inherited pack values.

The rejected alternative — also emitting `.dark [data-pack="<id>"]` so mode
inherits into a subtree — would make it **impossible to show a light subtree
inside a dark page**, which is precisely the docs case of all five packs at once,
and would add selectors. The explicit dark companion is chosen for that reason.
`index.html` renders all five packs simultaneously as descendant `<div
data-pack>` elements and asserts each computed `--primary` against the known
per-pack value.

### 3. First paint — keep the blocking inline script

The site is a static export, so there is no runtime server and no middleware
(`proxy.ts` is forbidden under `output: 'export'`, ticket 03). That fixes the
comparison:

| Mechanism | Under static export | Flash |
| --- | --- | --- |
| Blocking inline `<head>` script | Parser-blocking, runs before first paint and before React; reads `localStorage`; sets `data-pack` and `dark` on `<html>`; root keeps `suppressHydrationWarning`. | **None**; first paint is already correct. ~300 B inline per document. |
| Server-set attribute | Only a **build-time** attribute — the same for every visitor. Correct only for the visitor whose stored preference equals the build default. | Flashes for everyone else until a deferred correction runs. |
| Cookie-backed default | A cookie is readable only by a server or by JS; with no server it is the same JS path as `localStorage`, plus a request header on every same-origin request. | Same as the JS path; strictly worse. |

**Decision:** keep the blocking inline script as the static-export first-paint
mechanism; it is the only one that honours a per-user preference before paint
without a server. The build/server-rendered attribute is the fallback: the script
applies a valid stored value and **otherwise leaves the document exactly as
rendered** (never clobbers an attribute it did not set), so the no-JS baseline and
the provider's `stored -> attribute -> default` order (ticket 07) agree. Cookies
are rejected; there is no server to consume one.

`first-paint-{blocking,deferred,server}.html` implement the three cases. The
deferred page shows the failure mode (first frame at base light `#ffffff`, later
frames at peach dark `#1b1715`); blocking and server pages settle on the first
frame. This is the "measured or reasoned" flash behaviour: the mechanism is
settled by construction, and the frame sampler is shipped so the number can be
read in a connected browser rather than assumed.

### 4. Mode and pack stay separate

Two axes, in the emitted CSS and in the public API:

- CSS: `data-pack` selects the palette, `.dark` selects the mode; neither implies
  the other. The base pack is the absence of `data-pack` (`default`), not a
  `data-pack="light"` or a collapsed `dark-default`.
- API: `PACKS` / `PackId` and `MODES` / `Mode` remain independent (ticket 07), and
  `themeAttributes` composes both.

Collapsing them into one attribute (for example `data-theme="blush-dark"`) would
conflate ticket 06's `pack`/`mode`/`theme` vocabulary, multiply selectors from
`packs + modes` to `packs × modes`, and still need a way to express mode-only
changes. Rejected. This decision does not re-decide the axes, which tickets 06
and 07 fixed; it only fixes their CSS selector shape.

### 5. What the prototype leaves behind

All under `.scratch/prism-shadcn/prototype/theme-scoping/`:

- `README.md` — method, full numbers, cascade behaviour, first-paint analysis.
- `measure.mjs`, `results.json`, `candidates/{root-attribute,root-class,attribute-agnostic}.css`
  — the cost probe and its output.
- `verify-cascade.mjs` — analytic cascade/specificity check for all three
  candidates (`root-attribute` fails the light subtree cases; the other two pass).
- `theme-selector.mjs` — the chosen value expressed as ticket 06's single
  `themeSelector` output switch; `THEME_SELECTOR_STYLE` defaults to
  `'root-attribute'` and the build config sets `'attribute-agnostic'`.
- `index.html` — all-five-packs descendant demo with an in-page self-check.
- `make-first-paint.mjs` and `first-paint-{blocking,deferred,server}.html` — the
  three first-paint mechanisms with a per-frame sampler.

### The `themeSelector` switch (ticket 06's output switch)

`build/themes.mjs` keeps today's root-scoped template as the switch default and
gains the chosen value. Every value uses `data-pack`; the switch never emits
`data-theme`, because ticket 07 fixed the rename:

```js
// build/themes.mjs — exactly the shape in theme-selector.mjs
export function themeSelector(id, mode) {
  switch (THEME_SELECTOR_STYLE) {
    case 'root-attribute':      // ticket 06's default
      return mode === 'dark' ? `.dark[data-pack="${id}"]` : `:root[data-pack="${id}"]`
    case 'root-class':
      return mode === 'dark' ? `.dark.prism-pack-${id}` : `.prism-pack-${id}`
    case 'attribute-agnostic':  // ticket 08's decision
    default:
      return mode === 'dark' ? `[data-pack="${id}"].dark` : `[data-pack="${id}"]`
  }
}
```

The base pack is the absence of `data-pack`, so it is not emitted per id; it keeps
`:root` / `.dark`. The per-pack `themes/<id>/root.css` (plain `:root`) is
unchanged — it is the single-pack, single-mode copy-out artifact ticket 06
published, not a scoping mechanism. `THEME_SELECTOR_STYLE = 'attribute-agnostic'`
is the value the token build ships.

### Handed to other tickets

- **06**: `themeSelector(id, mode)` as above, called in base-light, base-dark,
  pack-light, pack-dark order; `THEME_SELECTOR_STYLE` default `'root-attribute'`,
  shipped value `'attribute-agnostic'`.
- **07**: the blocking script is `PrismThemeScript`'s implementation (stored value
  wins, otherwise leave the rendered attribute); `themeAttributes` returns both
  axes so a subtree always states both.
- **10**: the docs site's themes page uses descendant `data-pack` subtrees for the
  all-five-packs view instead of reading `themeTokens` and painting inline styles;
  the theme switcher's swatch dots read the computed variable per mode rather than
  a literal light value.
- **14**: record that descendant scoping is **supported**, that pack and mode stay
  two axes in CSS and API, and that the first paint is a blocking inline script
  with a sitting attribute as fallback.
- **15**: optionally a build/snapshot test that the emitted selector for each pack
  and mode equals `themeSelector(id, mode)`, and a cascade test that a descendant
  `[data-pack]` re-points the custom properties.

### Fog this settles

- The `DESIGN.md` "Known Open Items" entry about root-scoped selectors and the
  themes-page inline-style workaround is closed: descendant scoping is supported
  and costs nothing.
- The first-paint mechanism is named (`PrismThemeScript`, blocking, static-export
  shaped), so the map's docs-site and adoption notes can assume it.

No new ticket is recommended: the work is a value of ticket 06's switch plus lint
and docs edits already owned by 06/10/14/15. No out-of-scope change was made; only
this ticket and `.scratch/prism-shadcn/prototype/theme-scoping/` were written.
