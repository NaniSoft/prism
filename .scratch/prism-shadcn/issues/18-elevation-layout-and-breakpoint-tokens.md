---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 06, 07
---

# Elevation, layout and breakpoint tokens

## Question

Ticket 06 binds colour, radius, motion, typography and spacing to the token
source, but three groups still come from Tailwind's own theme rather than from
this repository: **shadows / elevation**, **breakpoints**, and the **container
width and measure**. The standing preference is that every style is driven from
this repository, so these are either the last unbound groups or an explicit
exception, and the difference has to be stated rather than discovered.

Ticket 16's resolution of the registry's "three-step shadow" doctrine and
ticket 07's component authoring contract both touch this, so it graduates here
as its own decision rather than being smuggled into the component API.

Settle:

1. **Elevation.** The registry uses exactly three shadow steps (`shadow-xs` on
   filled controls, `shadow-sm` on cards, `shadow-md` on the lifted item), all
   unmodified Tailwind values. Decide whether elevation becomes an authored
   token group emitted to CSS and Tailwind (`--shadow-*`), or whether Tailwind
   is declared authoritative for shadows. If authored, name the steps, give
   their values, and state which component role each belongs to. Reconcile with
   the docs app's `shadow-lg` floating panels, which do not ship.
2. **Breakpoints.** `sm` 40rem, `md` 48rem, `lg` 64rem are in use; `xl` 80rem is
   unused. Decide whether breakpoints are authored tokens, whether they are
   overridable by a consumer, and whether an unused `xl` is dropped. State the
   consequence for a consumer that also runs Tailwind.
3. **Container and measure.** `max-w-6xl` (72rem) with `px-6`/`lg:px-8`, and
   `max-w-2xl` (42rem) / `max-w-xl` (36rem) for prose. Decide whether these
   become named tokens (`--container-*`, a measure token) or stay utility
   literals, and where the single source of the container lives given the
   registry currently re-declares it in `Section`, the header and the footer.
4. **What remains Tailwind-authoritative.** After the answer, name every
   visual property that is still Tailwind's rather than this repository's, so
   the "every style is driven from here" claim is either true or precisely
   qualified.
5. **The gate.** Decide whether the emitted-contract test from ticket 06 grows
   to cover these groups, and whether a grep gate forbids raw `shadow-*`,
   `max-w-*` and breakpoint literals outside the token source and the section
   primitive.

Read `packages/tokens/src/foundation/base.tokens.json`, `packages/tokens/build/build.mjs`,
`packages/tokens/build/themes.mjs`, `packages/registry/src/components/ui/card.tsx`,
`packages/registry/src/components/ds/blocks/section.tsx` and the shadow and
Layout sections of `DESIGN.md` before answering. This ticket runs after 07 so
the component authoring contract is fixed; consult its answer rather than
deciding the shadow roles twice.

## Answer

All five groups become authored and emitted. After this ticket every property
that carries a design **value** on a scale or a palette comes from
`packages/tokens/src`; Tailwind remains authoritative only for **composition**
and for properties with no token-shaped value, which Q4 enumerates. The standing
preference is therefore true as written for every value, and precisely qualified
rather than overstated for everything else.

The three new groups are mode-independent, so they join ticket 06's single
`@theme static` block in `dist/theme.css` (not `light.css`/`dark.css`, and not
the `@theme inline` colour/radius block). Their DTCG group key is the CSS name
minus `--`, per ticket 06's principle, so each is bound to Tailwind by the same
name and needs no alias.

### 1. Elevation: authored as `--shadow-*`

New `packages/tokens/src/foundation/shadow.tokens.json`, top-level `shadow`
group, `$type: shadow`. Shadows are mode-independent: the values are identical
in light and dark today, they are black-alpha, and they read acceptably on both
surfaces, so they do not enter the mode-scoped files.

| DTCG token | custom property | Tailwind utility | value | component role |
| --- | --- | --- | --- | --- |
| `shadow.xs` | `--shadow-xs` | `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | resting filled controls: the `default`, `destructive`, `outline` and `secondary` button variants |
| `shadow.sm` | `--shadow-sm` | `shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | resting surface: `Card` |
| `shadow.md` | `--shadow-md` | `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | lifted surface: the featured plan, paired with `border-primary` |

The three values are exactly Tailwind's stock `xs`/`sm`/`md`, so no rendered
shadow changes; the difference is that the number now originates in the token
source. The authored set is **exactly** `{xs, sm, md}`: the Three-Step Rule is
now a property of the token source, not an observation about the registry grep.
`shadow-2xs`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `inset-shadow-*` and
`drop-shadow-*` are not authored. `toCss` in `build.mjs` gains a `shadow` branch
(one DTCG shadow object, or an array of them for a multi-layer value), joined
with `, `, so the layered `sm` and `md` values survive both the emitted CSS and
the DTCG projection; the emitted string is the package's own serialisation and
is semantically identical to Tailwind's.

**Docs-only floating panel.** `shadow-lg` is deliberately **not** authored. The
theme disclosure panel, the mobile nav panel and the skip link in `apps/docs`
keep Tailwind's built-in `--shadow-lg` (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`), because both are site apparatus rather than
installable surface. This is the one named residual shadow literal; it is not
emitted by the token package, so a consumer never receives it, and no registry
component uses it. Authoring a fourth step would widen the shipped Three-Step
Rule for a value no shipped surface consumes; naming the exception here and in
DESIGN.md is the honest resolution.

**Unlit Shadow Rule.** Untinted and hard-offset-free by construction: every
authored layer is `rgb(0 0 0 / .05)` or `/ .1` with a real vertical offset and a
soft blur. Because the authored values are the only values, the rule is
structural rather than a review claim.

### 2. Breakpoints: authored, closed at `sm`/`md`/`lg`, not consumer-overridable

New `packages/tokens/src/foundation/layout.tokens.json` (shared with Q3),
top-level `breakpoint` group, `$type: dimension`.

- `--breakpoint-sm: 40rem`, `--breakpoint-md: 48rem`, `--breakpoint-lg: 64rem`,
  matching Tailwind's current values so no compiled media query moves.
- `xl` (80rem) and `2xl` (96rem) are **dropped**, not left as Tailwind defaults.
  The `@theme static` block emits `--breakpoint-xl: initial` and
  `--breakpoint-2xl: initial`, which makes Tailwind delete those theme entries.
  The authored set is therefore exhaustive: an `xl:` or `2xl:` utility cannot
  silently resolve to a value this repository never authored, and adding a
  breakpoint later means authoring a token rather than reaching for a Tailwind
  default. `grep` confirms no `xl:` or `2xl:` variant is used anywhere today, so
  the closure is free.
- **Not consumer-overridable, and why.** A breakpoint exists only as the
  threshold Tailwind compiles into a media query inside `styles.css`. The
  consumer does not run Tailwind (ticket 07 §2), so there is no consumer-side
  `--breakpoint-*` to set; and a consumer who runs their own Tailwind may not
  point it at Prism's package or re-declare the namespace (ticket 07 §9). Their
  own breakpoints govern their own utilities only. Prism's compiled rules can be
  changed only by editing CSS, which the contract forbids.

### 3. Container and measure: authored once, `Section` consumes it

Same `layout.tokens.json`, top-level `container` group, `$type: dimension`.

| DTCG token | custom property | Tailwind utility | value | replaces |
| --- | --- | --- | --- | --- |
| `container.page` | `--container-page` | `max-w-page` | 72rem | `max-w-6xl` |
| `container.measure` | `--container-measure` | `max-w-measure` | 42rem | `max-w-2xl` |
| `container.measure-narrow` | `--container-measure-narrow` | `max-w-measure-narrow` | 36rem | `max-w-xl` |

`--container-*` is precisely the namespace Tailwind 4's named `max-w-*` scale
reads, which is why `max-w-6xl` already resolves to 72rem through Tailwind's
`--container-6xl`. Authoring `--container-page` and the two measures generates
`max-w-page`, `max-w-measure` and `max-w-measure-narrow` in every build that
compiles the token CSS.

**Gutters are not a new token.** `px-6` and `lg:px-8` are `--spacing-6` (1.5rem)
and `--spacing-8` (2rem), already emitted by ticket 06. The container contract is
max-width (token) plus gutter (spacing token) plus `mx-auto w-full`
(composition).

**Single source.** `Section` swaps `max-w-6xl` for `max-w-page` and
`SectionHeading` swaps `max-w-2xl` for `max-w-measure`; the registry's `cta-01`
swaps `max-w-2xl`/`max-w-xl` for `max-w-measure`/`max-w-measure-narrow`. Nothing
re-declares a literal.

**Docs app duplication.** The app cannot import `Section` (its stated reason is
that `Section` is installable surface) and does not need to: `globals.css`
already `@import`s `@ds/tokens/dist/theme.css`, so the `@theme static` block
reaches the site's own Tailwind build. Swapping the app's literals
(`layout.tsx` header and footer band, `page.tsx`, `blocks/page.tsx`,
`blocks/[slug]/page.tsx`, `themes/page.tsx`, `tokens/page.tsx`, `site-nav.tsx`)
to `max-w-page`/`max-w-measure`/`max-w-measure-narrow` makes every use read the
same `var(--container-*)` from one token. The duplication collapses to one
source consumed through two builds (registry and site) that compile the same
token CSS.

### 4. What remains Tailwind-authoritative (the precise qualification)

After this answer every **token value** is authored: colour, radius, motion
duration and easing, typography (family, size/line-height, leading, tracking,
weight), spacing, elevation, breakpoint thresholds, container widths and
measure. What is still Tailwind's is composition and properties that have no
token-shaped value:

- **Layout composition.** Display and flex/grid, grid template tracks
  (`grid-cols-2/3/4`, `auto-rows-min`), alignment (`items-*`, `justify-*`,
  `mx-auto`, `w-full`), positioning (`inset-*`, `top-*`, `right-*`), and which
  breakpoint a rule attaches to (`sm:`/`md:`/`lg:`). The threshold is a token;
  the decision to change at it is composition.
- **Sizing magnitudes.** `size-*`, `w-*`, `h-*`, `min-w-11`. These are
  arithmetic on the authored `--spacing` multiplier, not per-size tokens; there
  is no `size.*` group.
- **Stacking.** `z-30`, `z-50`, `-z-10`.
- **Opacity and alpha modifiers.** `opacity-50`, `opacity-90`,
  `disabled:opacity-50`, and colour-mix alpha (`bg-primary/90`,
  `bg-background/80`, `ring-ring/50`, `border-destructive/20`). The colour is a
  token; the multiplier is Tailwind's.
- **Transition property lists.** `transition-[color,box-shadow,background-color]`,
  `transition-colors`, `transition-transform`, `transition-opacity`. Durations
  and easing are token-driven; the property list is not.
- **Border and ring widths.** `border`/`border-b`/`divide-y` (1px) and
  `ring-[3px]`.
- **Text presentation.** `text-balance`, `text-pretty`, `whitespace-nowrap`,
  `uppercase`, and font-feature/variant numerics such as `tabular-nums`
  (`font-variant-numeric`).
- **Transforms and fragments.** `scale-[0.7]`, `sm:scale-[0.8]`,
  `origin-top-right`, `-translate-*`, arbitrary values generally.
- **Clipping and overflow.** `overflow-hidden`, `truncate`, `sr-only`.
- **Backdrop blur.** `backdrop-blur`; DESIGN.md already records that its radius
  is not pinned in this repository.
- **Gradients.** The geometry (`from-primary/5`, `to-transparent`, direction,
  stops); the colour is semantic.
- **Media-feature variants.** `pointer-coarse:` (`@media (pointer: coarse)`)
  and `@container/card-header` with its unused `@sm:` container variants.
- **The docs-only `shadow-lg` floating-panel value** (Q1): the single residual
  shadow literal, scoped to `apps/docs` and not shipped.

In one sentence: Tailwind remains authoritative for layout composition, state
multipliers, utility property lists and media-feature variants, and for exactly
one named docs-only shadow value; it is no longer authoritative for any shipped
token value.

### 5. The gates

**(a) Emitted-contract test.** Extend `packages/tokens/test/emitted-contract.test.mjs`
(ticket 06's test, owned by ticket 15) so it covers the three groups from the
DTCG source and the emitted files alone:

1. for every authored `shadow.*`, `breakpoint.*` and `container.*` token, assert
   the matching `--shadow-*`/`--breakpoint-*`/`--container-*` declaration exists
   in `dist/theme.css`'s `@theme static` block and equals the authored value
   serialised by the same `toCss` (`shadow` layers joined with `, `);
2. assert the shadow set is exactly `{xs, sm, md}` and that the token package
   emits no `--shadow-2xs`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`,
   `--inset-shadow-*` or `--drop-shadow-*`;
3. assert the breakpoint set is exactly `{sm, md, lg}` and that
   `--breakpoint-xl: initial` and `--breakpoint-2xl: initial` are present (the
   closure that makes the set exhaustive);
4. assert the container set is exactly `{page, measure, measure-narrow}`;
5. keep ticket 06's rule 4: no declaration in these namespaces that the DTCG
   source did not author.

**(b) Grep gate.** New `scripts/check-elevation-layout.mjs`, a sibling of ticket
06's `scripts/check-motion.mjs` and ticket 07's `scripts/check-surface.mjs`, and
wired into the root `pnpm check` task (task ownership: ticket 15). Scanning
`packages/*/src`, `apps/docs/src` and `scripts`, it fails on:

- `box-shadow:` (the raw property) outside `packages/tokens/src`;
- arbitrary shadow utilities `shadow-[...]` and `drop-shadow-[...]`;
- `shadow-2xs|shadow-lg|shadow-xl|shadow-2xl|shadow-inner|drop-shadow-` inside
  `packages/registry/src` (the Three-Step Rule; the docs app's `shadow-lg` is
  the named exception and is allowed only under `apps/docs`);
- `--shadow-`, `--breakpoint-` or `--container-` custom-property declarations
  outside `packages/tokens` (a second source of truth);
- arbitrary `max-w-[...]` anywhere outside `packages/tokens`;
- the duplicated container literals `max-w-6xl`, `max-w-2xl`, `max-w-xl`
  anywhere outside `packages/tokens` (forcing `max-w-page`,
  `max-w-measure`, `max-w-measure-narrow`);
- a raw breakpoint length in a `@media (min-width: ...)` or `(max-width: ...)`
  rule outside `packages/tokens` (the `sm:`/`md:`/`lg:` variant form is the one
  allowed).

Allowed everywhere: `shadow-xs|shadow-sm|shadow-md`,
`max-w-page|max-w-measure|max-w-measure-narrow`, the `sm:`/`md:`/`lg:` variants,
and `var(--shadow-*)`/`var(--container-*)` reads.

### Hand-offs (outside this ticket's write scope)

- **14:** regenerate DESIGN.md's "Layout", "Elevation & Depth" and "Known Open
  Items" to state the authored groups, the closed breakpoint set, the residual
  Tailwind-authoritative inventory from Q4 and the docs-only `shadow-lg`; close
  the shadow/breakpoint/container clause of the "authored but unbound" item.
- **15:** the emitted-contract additions, `scripts/check-elevation-layout.mjs`
  and its root `pnpm check` wiring.
- **Implementation (no new decision ticket):** `build.mjs` (`toCss` shadow
  branch, the static-block groups, the breakpoint closure),
  `shadow.tokens.json`/`layout.tokens.json`, and the `Section`,
  `SectionHeading`, `cta-01` and docs-app swaps described in Q3.
