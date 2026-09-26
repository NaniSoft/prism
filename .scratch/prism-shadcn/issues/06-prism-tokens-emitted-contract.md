---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 05
---

# What prism-tokens emits, and what reaches CSS

## Question

The token package is the foundation everything else stands on, and it has a
known defect recorded in this repository's own `DESIGN.md`: typography,
spacing, duration and easing tokens are authored in the DTCG source and reach
the JSON and JS outputs, but **none of them reaches CSS**, because those
formats filter to root-level tokens and the Tailwind theme format emits only
colours and radius. Twenty spacing steps are gated against Tailwind's scale so
the coincidence cannot drift, and the other four groups have no equivalent
check.

The user's requirement is that every style and every animation is driven from
this repository. That makes the unbound groups a defect rather than a footnote.
Settle:

1. **The emitted format list.** What files `prism-tokens` produces, and which
   of them are load-bearing for a consumer. The current set is `light.css`,
   `dark.css`, `theme.css`, `tokens.light.json`, `tokens.dark.json`,
   `tokens.foundation.json`, `index.js`, `themes.json`, `themes/index.js`, and a
   per-theme `themes/<id>/{light,dark,root}.css` plus token JSON. Decide what
   ships in the published package and what is build-time only.
2. **Which token groups reach CSS, and under what names.** The colour contract
   is settled and load-bearing: semantic names are emitted verbatim as
   `--<path-joined-by-hyphen>` to stay byte-identical to shadcn's, and renaming
   one is a breaking change for every consumer. Motion, typography and spacing
   are not settled. For each, decide the custom property name, whether it is
   emitted at all, and what consumes it.
3. **The motion scale.** The standing preference is 80, 160 and 280
   milliseconds, strongly decelerating, zero overshoot. Decide the exact token
   names, the easing curves as real values rather than names, and how a
   component consumes them so that a consumer cannot hardcode a duration. The
   Tailwind theme format currently emits no `--duration-*` or `--ease-*`, so
   either those are added to `theme.css` or every component reads the raw
   custom property, and that choice has consequences for the component package.
4. **Typography and spacing.** Whether these reach CSS as custom properties, as
   Tailwind theme entries, or stay authored-but-unbound. If they reach CSS,
   the twenty-step spacing gate becomes redundant and should be replaced by a
   real binding rather than kept as a coincidence check. If they stay unbound,
   say plainly that Tailwind remains authoritative for those properties and
   that the token source documents rather than controls them.
5. **Theme scoping.** How a theme is expressed in the emitted CSS. Currently
   every selector is root-scoped, `:root[data-theme="<id>"]` and
   `.dark[data-theme="<id>"]`, which `DESIGN.md` records as a real gap: an
   attribute on a descendant does not re-point custom properties for its
   subtree, so the per-card theme previews on the themes page and the swatch
   dots in the theme disclosure both render in the page's active theme. Decide
   the selector shape, and say whether the descendant-scoping technique is
   supported or forbidden. This constrains the docs site and the component
   package equally, so it may need its own prototype; if so, say so and stop
   rather than guessing.
6. **The DTCG and Figma output.** The old repository shipped a `toDtcg()`
   projection consumed by a one-way Figma Variables sync. Decide whether this
   package emits a DTCG-shaped artifact for that purpose, and if so in what
   shape. Figma itself is fog on the map; the output shape is not, because it
   is a property of this package.
7. **Contrast gate scope.** The gate currently asserts 28 required pairs per
   theme across two modes, with borders and inputs advisory. Decide whether
   that list grows to cover the newly bound motion and typography tokens, and
   whether any pair is currently asserted that the new pack set should drop.
8. **The five packs.** Blush, Mint, Lavender, Sky and Peach are settled as the
   pack set. Confirm the descriptor, radius and OKLCH ramp generation approach
   stands, and decide whether pack identity is a data file, a generated file, or
   both, given the old repository's record that two of its own pack
   descriptors disagreed with the values they described.

Read `packages/tokens/build/build.mjs`, `packages/tokens/build/themes.mjs`,
`packages/tokens/scripts/gen-pastel.mjs`,
`packages/tokens/scripts/check-contrast.mjs`, and everything under
`packages/tokens/src`, before answering. Consult `domain-modeling`: the
vocabulary for pack, mode and theme is contested between the two
repositories and gets settled here or in the governance ticket.

## Answer

### Grounding: where the defect is, and three facts the code fixes

- `isSemantic` is `token.path.length === 1` (build.mjs:65) and `ds/tailwind-theme`
  emits only `--color-*` plus the radius `calc()` scale (build.mjs:133-157). Every
  nested foundation token (`fontFamily`, `fontWeight`, `dimension.spacing`,
  `duration`, `cubicBezier`, and the type primitives that do not exist yet) is
  therefore JSON-only. The ticket's premise is confirmed in code.
- The authored easing violates the doctrine: `cubicBezier.emphasized` is
  `[0.2, 0, 0, 1.05]` (base.tokens.json:77), a control point with `y = 1.05`, which
  is overshoot. It is deleted, not retuned.
- Namespace facts verified by compiling against the installed `tailwindcss@4.3.3`:
  `--font-*`, `--font-weight-*`, `--text-*` (plus `--text-*--line-height`),
  `--leading-*`, `--tracking-*`, `--spacing`, `--ease-*` are theme namespaces.
  **Duration is not `--duration-*`**: the `duration-*` utility reads
  `--transition-duration-*`. A `--duration-fast` variable alone generates no
  `duration-fast` utility.
- `@theme` tree-shakes unused variables, and `@theme inline` emits only variables
  reachable from a generated utility. Only `@theme static` emits every declared
  variable. Because "the motion tokens reach CSS" is a requirement, the
  mode-independent block uses `@theme static`, not `@theme`/`@theme inline`.

### Working definitions (hand these to ticket 14)

- **pack** = palette: the authored descriptor `packages/tokens/src/themes/<id>.json`
  and the OKLCH ramps generated from it. `blush`, `mint`, `lavender`, `sky`, `peach`.
- **mode** = `light | dark`.
- **theme** = pack x mode: the fully resolved token set for one pack in one mode
  (Blush dark).
- Consequence: today's attribute `data-theme="blush"` names a **pack**, not a
  theme, while `.dark` carries the mode. Canonical vocabulary therefore renames the
  runtime attribute to `data-pack` and keeps `.dark` for mode. Ticket 08 owns
  whether its selector does that; it may not rename the axes. Ticket 14 records the
  three terms, an avoid-list (`colourway`, `beam-dark`, `variant`), and the
  `data-pack` rename.

### 1. The emitted format list

**Published** (`files: ["dist"]`):

| Artifact | Load-bearing for |
| --- | --- |
| `dist/light.css` (`:root`, colour + radius) | consumers, site |
| `dist/dark.css` (`.dark`, colour) | consumers, site |
| `dist/theme.css` (`@theme inline` colour + radius; `@theme static` motion + typography + spacing) | the Tailwind build of `prism-ui` and the site |
| `dist/tokens.light.json`, `dist/tokens.dark.json` | site token browser, contrast gate, JS consumers |
| `dist/tokens.foundation.json` | gate, JS consumers |
| `dist/index.js` (`semantic`, `foundation`) | site, JS consumers |
| `dist/themes.json` (id, name, description, radius) | contrast gate, site |
| `dist/themes/index.js` (`themeTokens`, `themeTokensDark`) | site (theme page, swatch dots) |
| `dist/themes/<id>/{light,dark,root}.css` + `tokens.{light,dark}.json` | site, single-pack consumers, gate |
| `dist/dtcg/foundation.tokens.json` (new) | one-way Figma sync, codegen |
| `dist/dtcg/semantic.{light,dark}.tokens.json` (new) | Figma sync |
| `dist/dtcg/themes/<id>/{light,dark}.tokens.json` (new) | Figma sync |
| `dist/dtcg/manifest.json` (new) | Figma sync |

**Build-time only:** `packages/tokens/.generated/**` (staging, gitignored, not in
`files`). It stays the internal staging area of `stageThemes()`; no consumer and the
site read it.

Everything the site reads today is in the published set: `light/dark/theme.css`,
the ten per-pack CSS files, and `themes/index.js`. No load-bearing artifact is
build-only. The one new published tree is `dist/dtcg/`, JSON-only and never imported
by the site, so it costs no bundle bytes. The declared-output list and prune set in
`build.mjs` grow to include `dist/dtcg/**`, and the `: undefined` read-back guard
covers them.

The exports map stays ticket 05's (`.` -> `./dist/index.js`; `./css/*` ->
`./dist/*.css`; `./dist/*`; `./package.json`), with `sideEffects: ["*.css"]` so a
bundler cannot drop the stylesheet import.

### 2. Which token groups reach CSS, and under what names

The principle that replaces "root-level only": **the authored DTCG group key is the
CSS name minus `--`, so a token's path joined by `-` is exactly the custom property
and the Tailwind theme key it binds.** Colour is the sole exception and stays
byte-identical to shadcn's contract.

| DTCG group (re-authored) | `$type` | Emitted custom property | Tailwind binding |
| --- | --- | --- | --- |
| root semantic (`background`, `primary-foreground`, ...) | `color` | `--<path>` (unchanged) | `@theme inline --color-*` (unchanged) |
| `radius` | dimension | `--radius` (unchanged) | `--radius-sm…4xl` calc scale (unchanged) |
| `font.sans`, `font.mono` | fontFamily | `--font-sans`, `--font-mono` | same name |
| `font-weight.*` | fontWeight | `--font-weight-*` | same name |
| `text.*` | dimension | `--text-*` + `--text-*--line-height` | same name |
| `leading.*` | number | `--leading-*` | same name |
| `tracking.*` | dimension | `--tracking-*` | same name |
| `spacing.*` | dimension | `--spacing`, `--spacing-*` | same name |
| `duration.*` | duration | `--duration-*` | `--transition-duration-*: var(--duration-*)` |
| `ease.*` | cubicBezier | `--ease-*` | same name |

Colour and radius are mode-scoped and stay in `light.css` / `dark.css` / the
`@theme inline` block. The three new groups are mode-independent and go into one
`@theme static` block in `theme.css`, which is what guarantees they are emitted
whether or not a utility happens to reference them. `ds/tailwind-theme` therefore
emits two blocks, and the `isSemantic` filter applies only to the colour/radius CSS
files.

### 3. The motion scale

Authored, replacing `duration.instant/fast/normal/slow` and
`cubicBezier.linear/standard/emphasized/exit`:

```
duration.fast  { value: 80,  unit: ms }  -> --duration-fast
duration.base  { value: 160, unit: ms }  -> --duration-base
duration.slow  { value: 280, unit: ms }  -> --duration-slow
ease.out       [0.16, 1, 0.3, 1]         -> --ease-out      cubic-bezier(0.16, 1, 0.3, 1)
ease.in-out    [0.65, 0, 0.35, 1]        -> --ease-in-out   cubic-bezier(0.65, 0, 0.35, 1)
```

Neither curve has a control-point `y > 1`, so neither can overshoot; that is why
`emphasized` is deleted. All three are state feedback: `fast` for hover/active
colour and opacity, `base` for focus ring and box-shadow and as the default, `slow`
for transform/layout state such as a disclosure. Spatial transitions keep
`motion-safe:`.

`theme.css` gains, inside `@theme static`:

```
--transition-duration-fast: var(--duration-fast);
--transition-duration-base: var(--duration-base);
--transition-duration-slow: var(--duration-slow);
--default-transition-duration: var(--duration-base);
--default-transition-timing-function: var(--ease-out);
```

The `--transition-duration-*` mirror is required: Tailwind's `duration-*` utility
reads that namespace, not `--duration-*`. `--default-transition-duration` is the
override that makes every bare `transition-*` token-driven at 160ms; the docs app's
reduced-motion block changes its literal `80ms` to `var(--duration-fast)`.

**Gate.** New `scripts/check-motion.mjs`, run from `pnpm check`. Outside
`packages/tokens/{src,build,scripts}` it fails on `cubic-bezier(`, `duration-\[`,
`duration-[0-9]`, `ease-\[`, `transition-duration:` with a non-`var()` value, and a
bare `\d+m?s` in component source. `var(--duration-*)`, `var(--ease-*)`,
`duration-fast|base|slow`, `ease-out|ease-in-out`, `motion-safe:` and
`motion-reduce:` are allowed. A component can therefore only name a token, never
hardcode one.

### 4. Typography and spacing

Typography is authored for real; the source has no `fontSize`, `lineHeight` or
`letterSpacing` group today. Emitted values:

- `text` (rem / line-height): `xs .75/1.333`, `sm .875/1.429`, `base 1/1.5`,
  `lg 1.125/1.556`, `xl 1.25/1.4`, `2xl 1.5/1.333`, `3xl 1.875/1.2`,
  `4xl 2.25/1.111`, `mono .625/1`.
- `leading`: `none 1`, `tight 1.25`, `snug 1.375`, `normal 1.5`, `relaxed 1.625`,
  `loose 2`.
- `tracking`: `tighter -.05em`, `tight -.025em`, `normal 0em`, `wide .025em`,
  `wider .05em`, `widest .1em`.
- `font-weight`: `normal 400`, `medium 500`, `semibold 600`, `bold 700`
  (`regular` is renamed `normal` so the utility name matches the token name).

Spacing moves to a top-level group and emits `--spacing` (the multiplier, taken from
step `1` = 0.25rem) plus `--spacing-<key>` for all twenty authored steps. Fractional
keys are emitted with the dot escaped (`--spacing-0\.5`), which is a valid
`<dashed-ident>` and is exactly what Tailwind itself emits; verified against
`tailwindcss@4.3.3`. Keeping `--spacing` means arbitrary multipliers still resolve.

**Gate change.** Delete the block at build.mjs:439-488 that reads Tailwind's own
`theme.css` and compares against `--spacing`. Replace it with a Vitest test
`packages/tokens/test/emitted-contract.test.mjs` that works from the DTCG source and
the emitted files alone and asserts:

1. every bound-group token produces its declared custom property in
   `light.css`/`dark.css`/`theme.css` (completeness: the fix for the recorded
   defect, and the replacement for "checked by coincidence");
2. each emitted value equals the authored value;
3. the authored twenty-step spacing table equals `--spacing x key`, and
   `spacing.1 === --spacing`;
4. no extra `--text-*`/`--spacing-*`/`--duration-*`/`--ease-*`/`--font-*`
   declaration exists that the source did not author.

No test reads Tailwind's literals. The token source is the only authority.

### 5. Theme scoping

Not decided here. The current root-scoped default stays (`:root[data-theme="<id>"]`,
`.dark[data-theme="<id>"]`, and the per-pack plain-`:root` `root.css`), and the
selector shape belongs to **ticket 08**, which already exists as the prototype. No
new prototype ticket is created.

The constraint this ticket fixes: whatever 08 chooses must be expressible as a
**token-package output switch** — a single `themeSelector` option (or equivalent) in
`build/themes.mjs`, with today's root-scoped template as its default — so 08 can
change emitted selectors without forking the build or hand-editing `dist`. Nothing in
the build may encode root-scoping as an invariant. Descendant scoping is neither
supported nor forbidden here; 08 decides it from measurements, and the result comes
back as a value of that switch, including the `data-pack` rename if it chooses it.

### 6. The DTCG and Figma output

Yes. Emit a DTCG-shaped projection, one-way, under `dist/dtcg/`:

- `foundation.tokens.json`: the merged foundation tree, `$type`/`$value`/
  `$description` preserved;
- `semantic.{light,dark}.tokens.json`: the semantic sets with aliases preserved as
  DTCG references (`{color.neutral.900}`), `$type: color`, plus `radius`;
- `themes/<id>/{light,dark}.tokens.json`: the per-pack resolved sets;
- `manifest.json`: `[{ id, name, mode, file }]`.

It is a projection of the same source, JSON-only, never imported by the site. Two-way
Figma-to-code sync stays out of scope. The sync's owner and its drift check are not
properties of this package and move to the new ticket below.

### 7. Contrast gate scope

The pair list does not grow and no pair is dropped. Motion, typography and spacing
are not colour pairs and are not contrast-checkable; adding them would be a category
error. The sixteen entries stay 14 required / 2 advisory, so the "28 required
assertions per theme across two modes" figure stays true. Borders and inputs stay
advisory (the WCAG 1.4.11 reasoning is unchanged) and focus rings stay required. Two
rules tighten it:

- a new root-level `$type: color` token whose name ends in `-foreground` must be the
  first element of a pair, or the build fails, so a new semantic colour cannot ship
  unchecked;
- `chart-1` through `chart-5` stay unpaired (no text sits on them), and a new pack
  cannot miss a pair because every pack shares the token set.

### 8. The five packs

- The authored descriptor `packages/tokens/src/themes/<id>.json` is the single source
  of truth for pack identity, and it grows the ramp parameters currently hardcoded in
  `gen-pastel.mjs`'s `THEMES` table: `hue`, `neutralC`, `brandC`, joining `name`,
  `$description` and `radius`. `gen-pastel.mjs` iterates the descriptors instead of
  keeping its own table.
- `src/foundation/pastel.tokens.json` is **generated** from those parameters;
  `themes.json` is **derived** from the descriptors. Neither is authored.
- Add a build guard: for each descriptor the emitted `--radius` in
  `dist/themes/<id>/tokens.light.json` must equal the descriptor's `radius`
  value+unit, and every descriptor must have a complete generated ramp pair
  (`<id>-neutral`, `<id>-brand`). This is the check for the two descriptors that
  disagreed with their own values. The `$description` prose (blush/peach both claiming
  the roundest corners) is content and is corrected in tickets 14/11, not gateable.
- The OKLCH generation approach stands: same `STEPS` lightness table, same hue and
  chroma method, ramps regenerated only when a descriptor changes.

### Handed to other tickets

- **07**: consume `duration-fast|base|slow`, `ease-out|ease-in-out` and the bound
  typography utilities; no raw millisecond or curve literals.
- **08**: selector shape via the `themeSelector` output switch; decide `data-theme`
  vs `data-pack`; keep `.dark` for mode.
- **14**: record pack/mode/theme, the `data-pack` rename, and regenerate `DESIGN.md`'s
  "Token Contract", "What is authored but not emitted to CSS" and "Known Open Items"
  (the unbound-groups item is closed; the descriptor-disagreement item becomes a
  gate).
- **15**: the emitted-contract test, the motion grep gate, DTCG projection
  determinism, and the new-colour pair rule.
