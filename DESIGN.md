---
name: Prism
description: A token-driven React design system over the shadcn CSS variable contract, one precompiled stylesheet, and a checked catalogue of Components, Blocks and Pages.
colors:
  base-background: "#ffffff"
  base-foreground: "#171717"
  base-primary: "#171717"
  base-primary-foreground: "#ffffff"
  base-muted: "#f5f5f5"
  base-muted-foreground: "#737373"
  base-border: "#e5e5e5"
  base-ring: "#737373"
  base-destructive: "#dc2626"
  base-success: "#15803d"
  base-warning: "#f59e0b"
  blush-primary: "#ec88a0"
  blush-primary-foreground: "#330313"
  blush-foreground: "#322c2d"
  lavender-primary: "#bc97e7"
  lavender-primary-foreground: "#210c33"
  lavender-foreground: "#2f2d31"
  mint-primary: "#73bf88"
  mint-primary-foreground: "#001f0a"
  mint-foreground: "#2b2f2c"
  peach-primary: "#e4965e"
  peach-primary-foreground: "#2a1000"
  peach-foreground: "#312d2a"
  sky-primary: "#6cb2eb"
  sky-primary-foreground: "#001a2f"
  sky-foreground: "#2b2e32"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  body:
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.556
    letterSpacing: "normal"
  label:
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.429
    letterSpacing: "normal"
  eyebrow:
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.429
    letterSpacing: "0.025em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
  "2xl": "0.9rem"
  "3xl": "1.1rem"
  "4xl": "1.3rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  "2xl": "1.5rem"
  "3xl": "2rem"
  "4xl": "2.5rem"
  "5xl": "3rem"
  "6xl": "4rem"
  "7xl": "5rem"
  "8xl": "6rem"
  container: "72rem"
  measure: "42rem"
components:
  button-default:
    backgroundColor: "{colors.base-primary}"
    textColor: "{colors.base-primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.base-background}"
    textColor: "{colors.base-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-secondary:
    backgroundColor: "{colors.base-muted}"
    textColor: "{colors.base-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-ghost:
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-link:
    textColor: "{colors.base-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-destructive:
    backgroundColor: "{colors.base-destructive}"
    textColor: "{colors.base-primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  badge-default:
    backgroundColor: "{colors.base-primary}"
    textColor: "{colors.base-primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.125rem 0.5rem"
  badge-outline:
    textColor: "{colors.base-foreground}"
    rounded: "{rounded.md}"
    padding: "0.125rem 0.5rem"
  card:
    backgroundColor: "{colors.base-background}"
    textColor: "{colors.base-foreground}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  section:
    rounded: "0"
    padding: "4rem 1.5rem"
    width: "{spacing.container}"
  section-heading:
    typography: "{typography.display}"
    rounded: "0"
---

# Design System: Prism

## Overview

Prism is NaniSoft's design system. It is one design language expressed through a
token pipeline, a React component library, a documentation site, and a
machine-readable agent surface. This document describes the system the rebuild
map has settled, and the visual and structural rules the rest of the repository
is accountable to. It is written for this repository, not adapted from the old
one.

**The constraint.** Semantic token names are emitted verbatim as CSS custom
properties, byte for byte identical to shadcn's variable contract. This is the
single most consequential decision, and it is a compatibility decision rather
than an aesthetic one. Because the names match shadcn's (`--background`,
`--primary`, `--primary-foreground`, `--muted-foreground`, `--ring`, the
`sidebar-*` family, `chart-1` through `chart-5`), the compiled output is a
drop-in replacement for a hand-written `globals.css`, and any unmodified shadcn
block, third-party shadcn theme, or existing consumer project works against it
with no rename, no alias layer and no codemod. Renaming a semantic token is a
breaking change for every consumer.

**The token tiers.** Foundation holds raw ramps that carry no meaning. Semantic
holds intent, expressed as aliases into the foundation tier. The emitted CSS is
the contract: the semantic names verbatim, plus the other authored groups. A
component consumes semantic utilities only.

**The system.** Base UI supplies accessible interaction primitives inside the
component package, and Tailwind 4 is the internal build tool that compiles the
package's single stylesheet. A consumer installs neither, imports one
stylesheet, composes Components, Blocks and Pages, and chooses a pack and a
mode. A neutral base pack and five pastel packs ship, each with a generated
OKLCH ramp family and its own radius, in light and dark. Inter is the one
interface face.

**Key characteristics:**

- One source of truth. Every token, style and animation is authored in this
  repository and reaches the consumer through the packages.
- Semantic aliases only. No raw hex outside the foundation tier and no raw ramp
  utility in a component.
- The token contract is shadcn's, unchanged. Semantic names are emitted
  verbatim.
- Contrast is a build gate, not a review step.
- Motion is state feedback only, and its tokens reach CSS. There are no
  decorative keyframes and no entrance or scroll animation.
- Blocks ship no copy and no sample data; every string and every number is a
  prop.
- The site is built with the system it documents.

**Register of this document.** It states the design system's rules, not the v1
roster. The Component, Block and Page roster is a separate open question, listed
under Known Open Items. Where the map has not decided something, this document
says so rather than guessing.

## Colors

The palette is two families: a neutral ramp that supplies surfaces and text, and
one brand hue per pastel pack that supplies fills. Semantic values are aliases,
never literals.

### The base pack

`default` is the neutral base pack, and it is also the absence of a pack id at
runtime. In it, `primary` is a near-black (`{colors.base-primary}`) and reads as
ink, not colour. `background`, `card` and `popover` all resolve to the same
value, so a surface is separated from the page by a border and a shadow rather
than by a fill change. `secondary`, `muted` and `accent` also resolve to one
value, so those three roles are visually identical in the base pack and diverge
only in the pastels.

### The five pastels

Each pastel is a light fill, never text. Light surfaces take the pack's brand
400 step with its brand 950 text; the pastel set is the atmosphere, and mid-tone
ink carries meaning. Every pack also owns a tinted neutral ramp whose chroma is
deliberately tiny, so the tint registers as cohesion rather than as colour.

- **Blush, soft rose** (`{colors.blush-primary}`, 0.875rem radius): the softest
  of the five, with a generously rounded radius.
- **Mint, soft green** (`{colors.mint-primary}`, 0.625rem radius): the calmest
  hue, for wellness and internal tools.
- **Lavender, soft violet** (`{colors.lavender-primary}`, 0.75rem radius): the
  most saturated brand ramp in the set.
- **Sky, soft blue** (`{colors.sky-primary}`, 0.5rem radius): the crispest hue,
  the smallest radius, and the most structure. Its radius matches the base.
- **Peach, soft orange** (`{colors.peach-primary}`, 1rem radius): the warmest
  hue and the roundest corners.

### Status

Status hues do not drift with the pack. `destructive` is red 600 in light and
red 500 in dark, `success` is green 700 and green 500, and `warning` is amber
500 and amber 400, in every pack. The `chart-1` through `chart-5` ramp starts at
the pack's brand hue so the first series always reads as the pack.

### Named rules

**The Contract Rule.** Semantic token names are the shadcn variable contract and
stay byte-identical to it. Interoperability is the reason: because the names
match, unmodified shadcn blocks, third-party shadcn themes and existing consumer
projects work against these packs with no changes. Renaming a token breaks all of
them.

**The Alias-Only Rule.** A semantic value is a reference into the foundation
ramps, never raw hex. This is what makes a new pack a matter of re-pointing
references rather than re-picking colours.

**The Fill, Not the Ink Rule.** A pastel brand value is a fill and never text.
Light surfaces take brand 400 with brand 950 text; dark surfaces take brand 300
with brand 950. The one exception is `link`, which uses `foreground`, because a
pastel `primary` fails 4.5:1 against the page background as text; the underline
carries the affordance instead.

**The Semantic-Utility Rule.** A component references semantic utilities only
(`bg-background`, `text-muted-foreground`, `border-primary`), never a ramp step
and never a raw value, so theming is automatic, including at runtime. This is
enforced by the grep and motion gates described under Token Contract.

## Typography

Inter is the only interface face. The platform monospace stack annotates
machine-readable values. Both are authored tokens (`font.sans`, `font.mono`) and
both reach CSS, so the type system is no longer Tailwind's to change.

### The scale

Text sizes are authored as size and line-height pairs: `xs` 0.75/1.333, `sm`
0.875/1.429, `base` 1/1.5, `lg` 1.125/1.556, `xl` 1.25/1.4, `2xl` 1.5/1.333,
`3xl` 1.875/1.2, `4xl` 2.25/1.111, and `mono` 0.625/1. Leading is authored as
`none`, `tight`, `snug`, `normal`, `relaxed` and `loose`. Tracking is authored as
`tighter`, `tight`, `normal`, `wide`, `wider` and `widest`. Weight is authored as
`normal` 400, `medium` 500, `semibold` 600 and `bold` 700.

### Hierarchy

- **Display** (600, 1.875rem / 1.2, -0.025em): section titles, the CTA banner
  heading, and every page `h1`. It steps up to 2.25rem at `sm` and carries
  `text-balance`. Nothing in the system goes above `4xl`.
- **Title** (600, 1.5rem / 1.333, -0.025em): a block detail `h1`, stat values
  and plan prices. A card title uses `font-semibold` at the inherited size.
- **Body** (400, 1.125rem / 1.556): section and page descriptions, with
  `text-pretty`. Supporting copy drops to 0.875rem.
- **Label** (500, 0.875rem / 1.429): buttons, nav links, option rows, and card
  descriptions.
- **Eyebrow** (500, 0.875rem, 0.025em, uppercase): the optional eyebrow in muted
  text, opt-in only.
- **Mono** (400, 0.625rem, line-height 1): token values, install commands,
  category tags and machine annotations.

### Named rules

**The No-Default-Eyebrow Rule.** The `eyebrow` prop has no default and renders
nothing when absent. A block that hardcodes a status pill makes every consumer
who installs it inherit a claim about their own product. Pass an eyebrow only
when you mean it.

**The Heading-Owns-It Rule.** A section heading defaults to `as="h2"`, because a
block is composed rather than a page, so the surrounding document already owns
the `h1`. The site's landing page is the one place that opts up. A document with
no `h1` gives screen readers and search engines no top-level entry point.

## Layout

One container family, one vertical rhythm, three breakpoints. All three are now
authored tokens rather than Tailwind's.

### Container and measure

- `--container-page` (72rem) for the page container.
- `--container-measure` (42rem) for prose.
- `--container-measure-narrow` (36rem) for narrower copy.

A gutter is a spacing token (`--spacing-6` at 1.5rem, `--spacing-8` at 2rem), so
the container contract is max-width (token), plus gutter (spacing token), plus
`mx-auto w-full` (composition). `Section` consumes the container, and nothing
re-declares the literal.

### Breakpoints

`sm` at 40rem, `md` at 48rem and `lg` at 64rem, matching the values Tailwind
compiled before so no media query moved. The set is closed: `xl` and `2xl` are
dropped, so an `xl:` utility cannot resolve to a value this repository never
authored. Breakpoints are not consumer-overridable. A breakpoint exists only as
the threshold Tailwind compiles into a media query inside `styles.css`; the
consumer does not run Tailwind, and the contract forbids re-declaring the
namespace.

### Vertical rhythm

`Section` is the single source. It owns the container width and the section
padding (`py-16 sm:py-24`, 4rem rising to 6rem from 40rem up) so a composition
keeps one rhythm. Blocks compose `Section` and a section heading rather than
re-deriving padding.

### What remains Tailwind-authoritative

Every property that carries a design value on a scale or a palette now comes
from the token source. Tailwind remains authoritative for composition and for
properties that have no token-shaped value:

- **Layout composition.** Display and flex or grid, grid tracks, alignment,
  positioning, and the decision of which breakpoint a rule attaches to. The
  threshold is a token; the decision to change at it is composition.
- **Sizing magnitudes.** `size-*`, `w-*`, `h-*` and `min-w-11` are arithmetic on
  the authored `--spacing` multiplier. There is no per-size token group.
- **Stacking.** `z-30`, `z-50`, `-z-10`.
- **Opacity and alpha modifiers.** `opacity-50`, `bg-primary/90`, `ring-ring/50`.
  The colour is a token; the multiplier is Tailwind's.
- **Transition property lists.** `transition-colors`, `transition-transform`,
  `transition-[color,box-shadow,background-color]`. The duration and easing are
  tokens; the property list is not.
- **Border and ring widths.** `border`, `border-b`, `divide-y` and `ring-[3px]`.
- **Text presentation.** `text-balance`, `text-pretty`, `whitespace-nowrap`,
  `uppercase`, `tabular-nums`.
- **Transforms and fragments.** `scale-*`, `origin-*`, `-translate-*`, and
  arbitrary values.
- **Clipping and overflow.** `overflow-hidden`, `truncate`, `sr-only`.
- **Backdrop blur.** `backdrop-blur`; its radius is not pinned in this
  repository.
- **Gradients.** The geometry. The colour stops are semantic.
- **Media-feature variants.** `pointer-coarse:` and container variants.
- **One docs-only shadow value**, named under Elevation and Depth.

In one sentence: Tailwind remains authoritative for layout composition, state
multipliers, utility property lists and media-feature variants, and for exactly
one named docs-only shadow value; it is no longer authoritative for any shipped
token value.

## Elevation & Depth

Elevation is authored, not borrowed. There are exactly three shadow steps, all
mode-independent, all black-alpha with a real vertical offset and a soft blur.

- **`--shadow-xs`**, the resting filled control: the `default`, `destructive`,
  `outline` and `secondary` button variants.
- **`--shadow-sm`**, the resting surface: a card.
- **`--shadow-md`**, the lifted surface: the one element that means lifted,
  paired with a border in the pack's primary colour.

No shadow is tinted, zero-offset or hard-offset, and the authored set is
exhaustive, so the rule is structural rather than a review claim.

### The docs-only exception

`shadow-lg` is deliberately not authored. The theme disclosure and mobile nav
panels in the site keep Tailwind's built-in value, because they are site
apparatus rather than installable surface. It is the one named residual shadow
literal; a consumer never receives it and no shipped component uses it.

### Named rules

**The Three-Step Rule.** The installable surface uses exactly three shadows:
`xs` on filled controls, `sm` on cards, `md` on the lifted element. Anything
higher is reserved for floating panels, which do not ship.

**The Unlit Shadow Rule.** No shadow is tinted or hard-offset. Every authored
layer is a black alpha with real vertical offset and soft blur.

## Shapes

**One base radius drives everything.** A single `--radius` token is the source,
and the whole scale is derived from it as `calc()` multipliers: `sm` at 0.6,
`md` at 0.8, `lg` at 1, `xl` at 1.4, `2xl` at 1.8, `3xl` at 2.2 and `4xl` at
2.6. Changing one value rescales every component. The base is 0.5rem, and each
pack overrides it: Sky 0.5rem, Mint 0.625rem, Lavender 0.75rem, Blush 0.875rem,
Peach 1rem. Sky matching the base is deliberate.

**Borders** are one pixel. The site applies a quiet global border colour in its
own base layer; that rule is a site choice and does not move into the library.
Prism's base layer is its own.

**Clipping and layering** use `overflow-hidden` and normal stacking, with a
wash layer sitting behind content rather than beside it.

**Gradients** carry no brand hue of their own. A wash is a semantic colour fading
to transparent, is always `aria-hidden`, and is never applied to text.

## Components

The taxonomy is Component, Block and Page, and nothing else. This section states
the contract; the v1 roster is not settled here.

### The composition layers

- **A Component** is a focused, accessible, product-agnostic export with one
  job. Compound parts, such as the pieces of a dialog or a select, stay inside
  their parent module and do not form a second vocabulary. A module is the unit
  a subpath imports, not one export.
- **A Block** is a pre-composed, product-agnostic section. It accepts data and
  content as props, including documented `ReactNode` slots, and it never fetches
  application data. It ships no string, number or sample data of its own; every
  one is a prop.
- **A Page** is a shipped component, not a documented recipe. It is a complete
  screen composed of Blocks and Components, and it receives application-owned
  navigation, content and data through documented slots and props. Like a Block
  it never fetches and never imports a router or a data client.

### Categories

A Component is assigned one of seven role categories: **Call to action, Forms
and inputs, Feedback, Layout, Data display, Typography, Miscellaneous.** The set
is closed. Assignment is by the item's primary role, never by data type, file
path or visual form. An eighth category is added only when at least three
components share a role no existing category names, and a category that falls
below two components is merged back. Miscellaneous is the single fallback and is
not a role. Blocks and Pages are grouped by kind and have no category.

### The authoring contract

- **Styles are utility classes, never CSS modules**, and consume semantic
  utilities only.
- **No raw hex outside the foundation tier**, and no ramp utility in a component.
- **Motion is by token only.** A component names `duration-fast`, `duration-base`
  or `duration-slow` and `ease-out` or `ease-in-out`; it never writes a
  millisecond value or a `cubic-bezier(...)` literal, and it adds no keyframes.
- **Documentation lives in a JSDoc comment on the exported component.** The
  declaration build preserves it into the emitted `.d.ts`, which is what the
  corpus reads. A component with no JSDoc block has no corpus entry.
- **`data-slot` is internal markup metadata** for tests and debugging, not a
  documented styling API.
- **`className` is for layout only** (grid placement, width). Changing a
  Prism-owned visual property is prohibited; the one place the rule is not
  machine-checkable, it is stated rather than hidden.

### The catalogue and the registry

The **catalogue** is one checked module in the component package. `buildCatalog()`
takes the authored declarations, validates them and throws on any gap: a missing
field, a kind outside the closed union, a category outside the seven, a
duplicate slug or name, an unresolved source, or an export that is not in the
public runtime surface. It is the only list. Navigation, generated item
documentation, the corpus and the agent surface all consume it, and none keeps a
second list.

The **registry** is the internal shadcn artifact inside the component package.
It is derived from or validated against the catalogue, never the reverse, and it
is never a public install lane or a documentation surface.

### The export surface

The component package publishes a fixed set of subpaths, and only these:

| Subpath | Exports |
| --- | --- |
| `.` | the curated barrel of the most-used Components, Blocks and types. No styles and no runtime side effects. |
| `./provider` | the provider, the theme hook and the first-paint script. |
| `./components` | every Component. |
| `./components/*` | one Component module. |
| `./blocks` | every Block. |
| `./blocks/*` | one Block. |
| `./pages` | every Page. |
| `./pages/*` | one Page. |
| `./theming` | the pack, mode and attribute vocabulary and pure helpers. |
| `./catalog` | the checked catalogue. Tooling only. |
| `./styles.css` | the one stylesheet. |
| `./package.json` | the manifest. |

There is no variant recipe on the surface. A component takes `variant` and
`size` props; a raw variant map is a CSS recipe and is internal. `./catalog` is
tooling, not a consumer runtime API. The token package publishes its compiled
CSS, its JSON and its JavaScript; the corpus and MCP packages publish their own
entry points.

## Do's and Don'ts

### Do

- **Do** consume semantic utilities (`bg-background`, `text-muted-foreground`,
  `border-primary`) and never a ramp step. This is the whole mechanism behind
  runtime theming.
- **Do** run the token build after touching a token file. It is also the
  contrast gate, so it is the cheapest possible review of a palette change.
- **Do** compose with `Section` and a section heading rather than re-deriving
  padding or container width.
- **Do** pass content into a Block as props, including the eyebrow, the numbers
  and the price. A Block ships no copy and no sample data.
- **Do** set the heading level explicitly when a Block is the page's primary
  heading, and leave it at `h2` when the Block is composed under one.
- **Do** treat a pastel brand hue as a fill and take text from the pack's own 950
  step.
- **Do** mark the current page with `aria-current`, not colour alone.
- **Do** give a coarse-pointer control a 44px floor, and keep the desktop
  metrics for mouse and trackpad.
- **Do** name a motion token (`duration-fast`, `ease-out`) rather than a value,
  and guard spatial movement with `motion-safe:`.

### Don't

- **Don't** rename a semantic token. The names are shadcn's variable contract,
  and renaming breaks unmodified shadcn blocks, third-party themes and existing
  consumers.
- **Don't** write a raw hex outside the foundation tier, and do not add a raw
  ramp utility to a component.
- **Don't** hardcode a duration, an easing curve or a token value in a
  component.
- **Don't** add an override path. There is no per-key merge, no wrapper theme and
  no copy-out lane; a missing item is requested upstream.
- **Don't** serve the shadcn registry or document it as an install lane. It is an
  internal integrity artifact.
- **Don't** keep a second catalogue or hand-edit the derived registry. Both are
  single-source artifacts.
- **Don't** hardcode copy, a price or a metric inside a Block.
- **Don't** wipe the token dist before a build. Write over the top and prune
  afterwards; see Token Contract.
- **Don't** add a keyframe animation or an entrance or scroll effect. The motion
  doctrine is state feedback, shortened rather than removed under reduced motion.
- **Don't** assume the dash gate covers this file. It gates an explicit list, and
  root documentation is not yet on it. See Known Open Items.

## Token Contract

Beyond the eight sections above, the following invariants are load-bearing and
are recorded here because they are not visual and a generated screen can break
them.

**Semantic names are the contract.** Every semantic token is emitted as
`--<path-joined-by-hyphen>`, computed by the build rather than through a name
transform, so no dependency upgrade can alter it. The colour contract is 36
custom properties plus `--radius`.

**The authored groups reach CSS.** The previous system authored typography,
spacing and motion and emitted none of it. Now each authored group is bound to a
Tailwind theme name and a custom property, and the authored DTCG group key is the
CSS name minus `--`:

| DTCG group | Emitted custom property | Tailwind binding |
| --- | --- | --- |
| root semantic colour | `--<path>` (unchanged) | `@theme inline --color-*` |
| `radius` | `--radius` (unchanged) | `--radius-sm` through `--radius-4xl`, a `calc()` scale |
| `font` | `--font-sans`, `--font-mono` | same name |
| `font-weight` | `--font-weight-*` | same name |
| `text` | `--text-*` plus `--text-*--line-height` | same name |
| `leading` | `--leading-*` | same name |
| `tracking` | `--tracking-*` | same name |
| `spacing` | `--spacing` plus `--spacing-*` | same name |
| `duration` | `--duration-*` | `--transition-duration-*: var(--duration-*)` |
| `ease` | `--ease-*` | same name |
| `shadow` | `--shadow-*` | same name |
| `breakpoint` | `--breakpoint-*` | same name |
| `container` | `--container-*` | same name |

Colour and radius are mode-scoped and live in `light.css`, `dark.css` and an
`@theme inline` block. The mode-independent groups (typography, spacing, motion,
elevation, breakpoints and containers) live in one `@theme static` block, which
is what guarantees they are emitted whether or not a utility happens to
reference them. Duration is the one namespace that needs a mirror: Tailwind's
`duration-*` utility reads `--transition-duration-*`, not `--duration-*`.

**The motion scale** is `fast` 80ms, `base` 160ms and `slow` 280ms, with
`ease-out` `cubic-bezier(0.16, 1, 0.3, 1)` and `ease-in-out`
`cubic-bezier(0.65, 0, 0.35, 1)`. Neither curve has a control point above 1, so
neither can overshoot. `fast` is hover and active feedback, `base` is the
default and carries focus rings and shadow state, and `slow` is transform or
layout state such as a disclosure. Spatial transitions keep `motion-safe:`.

**The emitted format list.** The token package publishes `light.css`,
`dark.css`, `theme.css`, the resolved token JSON, `index.js`, `themes.json`, the
per-pack JavaScript and CSS, and a DTCG projection under `dist/dtcg/`. The
staging directory used during a build is build-time only and is not published.

**Two build guards.** After writing, the build reads back every declared output
and throws if any file contains `: undefined`. It then compares each pack's token
key set against the base and throws on a missing key. A third guard asserts that
each pack descriptor's radius matches the value it emits and that every pack has
a complete generated ramp pair.

**The dist is written in place, not wiped.** The build deliberately does not
`rm -rf dist/` up front, because a running dev server holds a module graph and an
`rm -rf` leaves a window in which the target does not exist, which poisons the
bundler's resolver for the session. The build writes over the top and prunes
afterwards, and the prune runs only after every check passes, so a failed run
leaves the last good output in place. Do not turn this into a clean step.

**The emitted-contract test.** A Vitest test works from the DTCG source and the
emitted files alone and asserts that every bound-group token produces its
declared custom property, that each emitted value equals the authored value, and
that no extra declaration exists in a bound namespace. It replaces the old
spacing check that compared this repository against Tailwind's own scale,
because the token source is now the only authority.

**The DTCG projection.** The build emits a one-way, JSON-only DTCG projection
under `dist/dtcg/` for a future Figma Variables sync. The site never imports it.
Two-way Figma sync is out of scope. A one-way sync and its plugin ownership are
not built in this effort.

**The contrast gate.** The gate evaluates a fixed pair table per theme: 14
required pairs at 4.5:1 or 3:1, and 2 advisory pairs (`border` and `input` on the
background, reported and never failed). That is 28 required assertions per theme
across the two modes. Motion, typography and spacing are not colour pairs and are
not contrast-checkable. One rule tightens the gate: a new root-level colour token
whose name ends in `-foreground` must be the first element of a pair, so a new
semantic colour cannot ship unchecked.

**The grep gates.** A motion gate fails on a `cubic-bezier(...)` literal, an
arbitrary duration or easing utility, or a bare millisecond value in component
source, outside the token package. A surface gate scans the emitted declarations
for a Base UI module specifier or type and for a re-exported variant recipe. An
elevation and layout gate fails on a raw `box-shadow`, an arbitrary or out-of-set
shadow utility, a re-declared shadow, breakpoint or container property outside
the token package, an arbitrary container width, and the old container literals.
Allowed everywhere are the authored names and their `var(--...)` reads.

## Theme Switching

**Two axes.** `data-pack` selects the pack and `.dark` selects the mode. Neither
implies the other, and neither is called a theme in the API. The base pack is the
absence of `data-pack`, expressed as the plain root default.

**Selectors are attribute-agnostic.** The build emits `[data-pack="<id>"]` and
`[data-pack="<id>"].dark` rather than the old root-scoped `:root[data-pack]`
form. This is the cheapest shape by measurement and it makes descendant scoping
work: any element may carry `data-pack` and `class="dark"` to become a theme
boundary for itself and its subtree. That closes the previous defect where a
per-card theme preview rendered in the page's active pack, and it is what lets
the site show every pack at once. Selection crosses no CSS the consumer writes.
One pre-existing hazard is unchanged: an unrelated consumer `.dark` class
triggers the default pack's dark values, because `.dark` is a global class.

**Selection is declarative by default.** Put `data-pack="<id>"` and, for dark,
`class="dark"` on an element, and it is SSR-safe and flash-free with no
JavaScript. `default` is expressed by omitting `data-pack`.

**The provider is optional.** A programmatic consumer mounts the provider and
uses the theme hook to read and write the same two attributes and persist the
choice. The provider is the only programmatic path and carries no override
parameter, no token object and no merge. On mount it resolves a stored value,
then the server-rendered attribute, then its defaults, so a server-rendered pack
survives hydration instead of flashing.

**First paint.** Under static export there is no server and no middleware, so the
blocking inline script in `<head>` is the only mechanism that honours a per-user
preference before first paint. It applies a valid stored value and otherwise
leaves the document exactly as rendered, so the no-JS baseline and the provider's
resolution order agree. The root element carries `suppressHydrationWarning`.

**Adding a pack.** Add a pack descriptor (name, description, radius and ramp
parameters) and rebuild. The descriptor is the single source for pack identity;
the ramp file and the manifest are generated from it, never authored by hand.

## Known Open Items

Recorded as facts. None of these is fixed in this document.

- **The rebuild is not executed.** The four published packages do not exist under
  their final names yet, `packages/ui` has not become `packages/ui`,
  `apps/site` has not become `apps/site`, and the site and the agent surface are
  not rebuilt. This document describes the settled target; the map is the list of
  work.
- **The v1 roster is not settled.** The seven categories, the composition layers
  and the authoring contract are settled; the explicit list of Components, Blocks
  and Pages is not.
- **The newly authored token groups are not emitted yet.** Motion, typography,
  spacing, elevation, breakpoints and containers are settled, but the token build
  does not emit them all today, and the emitted-contract test and the motion,
  surface and elevation and layout gates are not written yet.
- **The dash gate does not cover root documentation, including this file.** This
  document and every root document are written without em or en dashes
  deliberately. Making that a checked result means adding the root documents to
  both `ROOTS` and `GATED` in `scripts/check-dashes.mjs`; adding them to `ROOTS`
  alone would report without gating. Until that happens, dash-freedom here is a
  property of how it was written, not a checked result.
- **The shadcn `components.json` style identifier is unverified.** The value
  `"base-nova"` must be established before any gate depends on it.
- **`CODEOWNERS` carries a placeholder owner line.** The project has one
  maintainer and no confirmed team handle yet; the repository cutover confirms
  it.
- **The design summary at `.impeccable/design.json` is stale.** It was generated
  from the previous `DESIGN.md` and should be regenerated after the token
  rebuild.
- **Visual regression is not adopted in this effort** unless a later quality-gate
  decision adopts it.
