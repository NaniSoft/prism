---
name: Prism
description: A token-driven React design system over the shadcn CSS variable contract, one precompiled stylesheet, and a checked catalogue of Components, Blocks and Pages.
colors:
  base-background: "#ffffff"
  base-foreground: "#171717"
  base-primary: "#171717"
  base-primary-foreground: "#ffffff"
  base-muted: "#f5f5f5"
  base-muted-foreground: "#525252"
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
machine-readable agent surface. This document describes the system as built and
the visual and structural rules the rest of the repository is accountable to. It
is written for this repository, not adapted from the old one.

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
  prop. A Component owns some words and not others: a variant name, a state
  name and a landmark name are machine values, and the **accessible name a
  control ships is the consumer's word**, so it is a prop whose default is the
  word Prism would have used. A caller that localises the visible text of a
  control localises the announced name with it, because a control that looks
  localised and announces English is the state this rule exists to end.
- The site is built with the system it documents.

**Register of this document.** It states the design system's rules, not the v1
roster. The roster is settled and lives in the checked catalogue; this document
does not restate it. Where a rule is still deferred, this document says so under
Known Open Items rather than guessing.

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
only in the pastels. `muted-foreground` is pinned to neutral 600 rather than
neutral 500: helper text sits on the tinted `muted` surface as well as on the
page ground, and neutral 500 cleared 4.5:1 on white but fell to 4.34:1 on
`muted`.

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

**The Brand Ink Rule.** `foreground` is not a brand ink, and neither is a
foreground paired with a fill. Both are the two answers a tired implementer
reaches for, and both are arithmetically defensible, so they are named here with
the measurement that rules them out rather than left to judgement.

`foreground` is the tinted-neutral step and the tint is deliberately tiny: across
the five pastels its OKLCH chroma measures 0.0051 to 0.0089, between 9.8 and 15.6
times less than the `brand-ink` published beside it, and in the base pack it is
`#171717` with no chroma at all. A wordmark, a brand-coloured heading, or a link
that must read as the brand reads `brand-ink`, which is gated at 4.5:1 against the
page, a card and the accent surface in both modes of all six sources, worst
measured 5.57:1.

`primary-foreground` is the pack's brand-950 step. It clears the one ground it is
gated against by 7.39:1 to 11.06:1, then measures 1.00:1 to 1.82:1 on the dark
page, the dark card and the dark accent surface. In light mode the same value
reads 15.05:1 to 18.05:1 on the page, so it looks right in half the modes and
vanishes in the other half, and no row could see the difference because every row
that named it also named `primary`. `ring` is the other wrong answer: it measures
2.66:1 (Mint light, on its own accent) to 4.35:1 (base light) on the accent
surface in all six light-mode sources, while clearing its own 3:1 row on the page
in all twelve.

`brand-ink` is not a rename of either. It differs from `primary` in all twelve
pack and mode combinations. The near miss is on the record because it is the
constraint: had dark been brand 300, `brand-ink` would have been byte-identical to
`primary` in all five dark modes, and that step is the only one the accent ground
allows above 400. That is why dark is brand 200.

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
the contract; the catalogue is the one list of the items that ship.

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
- **A Page renders a consumer's shape and never imposes one.** When a Page takes
  a structure, that structure is data, and the Page holds no opinion about how many
  of it there are, how deep it nests, or what its parts are called. It renders a
  tree of one entry and a tree of a hundred and twenty-seven the same way, and the
  frame is sized by what the consumer passed rather than by a fixed arrangement. A
  Page that imposed a count would make itself a component for the tree its author
  happened to have, which is the one thing a Page exists to stop being.
- **A structural affordance is a claim about the reader's freedom, and a Page
  makes no claim it cannot keep.** A label that collapses, counts, sorts or
  carries a status tells a reader that the things it names are independent topics
  they may reach in any order. Where a consumer's own information architecture says
  otherwise, that affordance is a misreading, so the Page carries none of them and
  the structure is read from the data. A status written into a title stays in the
  title as words: a Page does not parse a consumer's copy.
- **The documentation tree is uneven, and the unevenness is this taxonomy read
  as folders.** A Component's documentation is filed in a folder named for its
  Category, and a Block's and a Page's is filed in a folder of its own with
  nothing above it, because the Categories section below gives them none to
  name. So a Component sits one level deeper than a Block or a Page, its
  documentation and its demo travel together in that folder, and a reader meets
  it inside a Category group where a Block or a Page is met in a flat list. The
  depth is a consequence, not a stage: a Block or a Page is not waiting for a
  Category, and giving it one to level the tree would invent the role group the
  Categories section holds closed. An uneven tree here is the taxonomy showing
  through, and it is not an oversight to be tidied later.

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

The **catalogue** is the hand-listed module in the component package, and
`buildCatalog()` is a sort over it and nothing more: it is not a validator, and it
does not throw. Navigation, generated item documentation, the corpus and the agent
surface all consume it.

The **registry** is the internal shadcn artifact inside the component package. It
is generated by reading the source tree, never by reading the catalogue, because a
registry derived from the list it mirrors would delete the disagreement the check
below exists to see. It is never a public install lane or a documentation surface.

So there are three lists, and the count alone ties none of them: the source tree,
the hand-listed catalogue, and the generated registry. `check-catalogue.mjs`
compares all three in both directions, name for name, and prints one line per
offending item. A length assertion cannot report which item is wrong, so there is
none. The one-way hole was real: a module on disk with no catalogue entry left
every count correct, so a component could ship, be installable, and be absent from
the corpus, the site and every agent-facing tool, fully green.

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
- **Don't** add an em dash or an en dash to reader-facing copy. The dash gate
  covers this file and the other root documents.

## Token Contract

Beyond the eight sections above, the following invariants are load-bearing and
are recorded here because they are not visual and a generated screen can break
them.

**Semantic names are the contract.** Every semantic token is emitted as
`--<path-joined-by-hyphen>`, computed by the build rather than through a name
transform, so no dependency upgrade can alter it. The colour contract is every
role in `src/semantic/{light,dark}.tokens.json` plus `--radius`; the size of that
contract is not restated here, because a count in prose goes stale silently and a
stale count is worse than no count. `check-contrast.mjs` prints the number on
every run, with the roles it measured, the rows that measured them and the
exemptions that did not.

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

**The contrast gate.** The gate walks the semantic colour roles, not the pair
table, so a new role cannot be silent by default. Every role read from the token
source must be named by a row, in either position, or carry a stated reason in
the exemption list; an exemption buys a role freedom from a *ground*, never from
a *mode*, so a role that resolves in light and not in dark fails. The gate
refuses four shapes of its own drift: a row naming a role the source does not
author, an exemption for a role a row already measures, an exemption for a role
the source does not author, and an exemption with no reason. Every exemption
reason is printed on every run, because a rule that fires on nothing is
indistinguishable from a rule that found nothing to say.

Today: 37 colour roles, 22 rows, 19 required and 3 advisory, measured across
6 packs and 2 modes for 228 required assertions. The advisory set is `border` and
`input` on the page ground, plus `sidebar-border` on `sidebar`; those three are
aesthetics, and WCAG 1.4.11 only binds where a boundary is the sole means of
identifying a control. `chart-1` through `chart-5` are exempted because a series
is a graphic object rather than text, and what binds a five-way set is
distinctness, which the gate asserts instead by requiring no two series to resolve
to the same value in any pack or mode, and by printing the tightest pair it found.

Motion, typography and spacing are not colour pairs and are not
contrast-checkable. One more pair earns its row on its own evidence:
`muted-foreground` is checked on `muted` as well as on `background`, because the
pill, avatar fallback, kbd and tab-list pattern sits on the tinted surface rather
than the page ground.

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

**Selectors are attribute-agnostic.** The build emits `[data-pack="<id>"]` for
light and the two-member list `[data-pack="<id>"].dark, .dark [data-pack="<id>"]`
for dark, rather than the old root-scoped `:root[data-pack]` form. This is the
cheapest shape by measurement and it makes descendant scoping work: any element
may carry `data-pack` to become a theme boundary for itself and its subtree. That
closes the previous defect where a per-card theme preview rendered in the page's
active pack, and it is what lets the site show every pack at once. Selection
crosses no CSS the consumer writes. One pre-existing hazard is unchanged: an
unrelated consumer `.dark` class triggers the default pack's dark values, because
`.dark` is a global class.

**A boundary carries the pack attribute alone, and wears its ancestor's mode.**
`data-pack` names the pack; it says nothing about light or dark. The mode a
boundary resolves is the mode of the element carrying `.dark`, wherever that
element is, and a boundary with no mode class of its own resolves its pack in the
document's mode. This is the only form a server can render, because a server
cannot know the reader's mode: a boundary forced to name a mode would have to
guess one and would be wrong for half of them.

**A boundary moves the corner radius beneath it.** Radius is the only non-colour
member of a pack block, and the token build emits it the same way it emits
colour, so the consequence is the same: `--radius` resolves from the nearest
ancestor carrying `data-pack`, and the whole scale from `--radius-sm` through
`--radius-4xl` is derived from it by multiplication. The five packs range from
0.5rem to 1rem, so a row of elements each carrying its own pack shows a spread of
corner radii, and a small pill becomes a different pill five times over. The law
used to state the colour half and be silent on the shape half, so an implementer
following it exactly produced mismatched corners and called it correct.

**Where a boundary may sit, in one sentence.** A boundary belongs on a
fully-rounded element, on an element carrying no radius utility, or on a shape with
no radius concept, and on nothing else.

One previously stated reason for the shape restriction was wrong and is corrected
rather than inherited: a scalable vector rectangle's corner attribute is a CSS
property and does follow the boundary. What blocks it is that no utility exists
for it.

**A boundary carries the mode class only when it must hold a fixed mode.**
`[data-pack="<id>"].dark` is the compound form and it is published, not
deprecated: it is what a dark surface on a light page is, and what a client that
has already resolved the reader's mode applies. The descendant form was added
beside it rather than replacing it, and the two are one rule with one declaration
block, so an element matching both resolves the same way either way. A
zero-specificity wrapper was considered and rejected: it loses to an unlayered
consumer rule on import order, and the no-override-path law decides that.

**Selection is declarative by default.** Put `data-pack="<id>"` on an element and
add `class="dark"` only to one that must hold a fixed mode. It is SSR-safe and
flash-free with no JavaScript. `default` is expressed by omitting `data-pack`, and
a boundary that inherits its mode omits both.

**The provider is optional.** A programmatic consumer mounts the provider and
uses the theme hook to read and write the same two attributes and persist the
choice. The provider is the only programmatic path and carries no override
parameter, no token object and no merge.

**A stored theme is written only on a decision.** The provider resolves a stored
value, then the server-rendered attributes, then its own defaults, and it writes
to storage only when a caller changes the pack, the mode or the toggle. Resolving
to a default is not a decision and is never stored, which is the whole point: a
site that changes its default reaches every reader who has not chosen, instead of
being outranked forever by a value written on their first visit. A visitor who
has chosen keeps that choice across a reload, because the value they chose is
still the one in the key.

**One resolution rule, held together by a gate.** The boot script and the
provider read the same stored value and must agree on every one of them,
including the half-right ones. They do not share a function, and cannot: the build
minifies, a renamed identifier would throw inside the script's own guard, and the
`catch` would swallow it, so the theme would silently stop applying on every page.
The honest arrangement is one implementation, `resolveTheme`, plus
`check-theme-resolution.mjs`, which runs the EMITTED script and the shared rule
over one table of twenty-seven cases across three consumer configurations and
fails if they disagree, if any fall-through is half-applied, or if a branch of the
rule never ran. A stored value that names a retired pack falls through whole to
the default rather than applying its mode alone, and is never cleared: a
present-but-unparseable value is the only record that the reader ever chose
anything.

**Where the theme came from is a contract.** The root element carries
`data-theme-origin`, written by the boot script as the only writer, because two
writers would make the origin a race rather than a record. Its closed set is
`stored`, `legacy`, `document`, `default` and `unparsed`, and the fifth member is
the load-bearing one: a three-value set cannot tell "never chose" from "chose,
and the value no longer parses", and that is exactly the distinction a storage
migration has to be retired against.

**First paint.** Under static export there is no server and no middleware, so the
blocking inline script in `<head>` is the only mechanism that honours a per-user
preference before first paint. It applies a valid stored value and otherwise
leaves the document exactly as rendered, so the no-JS baseline and the provider's
resolution order agree. The root element carries `suppressHydrationWarning`.

**The boot path is priced in its own unit.** The inline string runs before paint
on every page and is not a bundle, so it is measured in raw bytes by
`check-boot-budget.mjs` rather than in the client table, where it would corrupt
the unit that table exists to measure. The ceiling is derived by addition: the
measured emission's non-migration part, pinned, plus one migration generation
priced at the live clause. The non-migration term is pinned rather than recomputed
because `measured + one generation` recomputed every run cannot fail for any
input, which is a gate reporting success because it ran. The gate prints the drift
against the pin rather than asserting the pin is current, because a run with
drift is still a correct run.

**A retired key is recovered, and the clause expires by its own effect.** The old
line wrote a bare mode into `prism-theme-mode`, and only inside its mode setter.
The script reads that key, and if it holds a usable mode it writes the recovered
pair into the key this line owns and removes the key it read. So the clause fires
at most once per reader, because its own write is what makes the next load find
nothing, and its reachable population shrinks to nothing when the last entry of
`LEGACY_MODE_STORAGE_KEYS` is deleted. There is no date and no version constant,
and the gate prints how many clauses are still live on every run, so the number
that retires it is visible rather than remembered.

**Adding a pack.** Add a pack descriptor (name, description, radius and ramp
parameters) and rebuild. The descriptor is the single source for pack identity;
the ramp file and the manifest are generated from it, never authored by hand.

## Known Open Items

Recorded as facts. None of these is fixed in this document.

- **The cutover is partly executed.** `@nanisoft/prism-tokens` and
  `@nanisoft/prism-ui` are published at 0.6.0, `@nanisoft/prism-llms` at 0.5.0 and
  `@nanisoft/prism-mcp-server` at 0.4.0, and the four consumer sites can install
  them. The publish came from a maintainer machine rather than the release lane,
  because the npm trusted publisher is not configured; see `CONTRIBUTING.md` for
  that and for what it costs, which is a missing provenance attestation. Still
  open: deprecating the retired pre-rebuild line, and moving
  `prism.nanisoft.com` to the new site. `MIGRATION.md` is the draft that goes
  live at cutover.
- **`CODEOWNERS` carries a placeholder owner line.** The project has one
  maintainer and no confirmed team handle yet; the cutover confirms it.
- **The v1.1 roster tail is deferred, not dropped.** (Roster composition as
  specified on 2026-09-28, when the count was 28 Components, 10 Blocks and 4
  Pages; the live roster is whatever `check-catalogue.mjs` reports and this table
  is a specification of what is still to come, not a count of what is there.)
  Every deferred item is additive
  and non-breaking, because Base UI already ships each primitive it needs, so
  v1.1 introduces no new upstream engine:

  | Kind | Deferred to v1.1 |
  | --- | --- |
  | Components | the shadcn baseline tail: `collapsible`, `spinner`, `toast`, `alert-dialog`, `sheet`, `command`, `combobox`, `calendar`, `date-picker`, `scroll-area`, `aspect-ratio`, `hover-card`, `context-menu`, `menubar`, `navigation-menu`, `toggle`, `toggle-group`, `input-otp`, `item`, `button-group`, `input-group`, `carousel`, `chart`, `sidebar`, `form` (the react-hook-form binding), `number-field`, `meter`, `resizable`, `native-select`, and a standalone `label`. `empty` is not on this list: it is resolved to `empty-state-01`, a Block, and the resolution is recorded below |
  | Blocks | `faq-01`, `logo-cloud-01`, `testimonial-01`, `newsletter-01` |
  | Pages | `onboarding-page`, `pricing-page`, `error-page` |

  `footer-01` is not on this list because it is no longer deferred: the footer
  shipped as `site-footer` in the fourteen-item release, as a Block, because all
  four consumer sites already import `SiteHeader` and `SiteFooter` from
  `@nanisoft/prism-ui/blocks` and a header or a footer composes a mark, a switcher
  and a navigation rather than holding one job. The name follows the four import
  lines rather than the shape of this table, because a published name cannot be
  cheaply changed and there is no redirect lane for item routes. `logo-cloud-01`
  above is the deferred spelling of the logo strip, which also shipped as
  `logo-strip-01`; that name keeps the `-01` suffix its entry was given and no
  consumer imports it yet.

  **The old "the docs shell never ships" line is withdrawn, and the reason it
  was written no longer holds.** It said the documentation frame is site chrome
  rather than catalogue surface, and that was a reading of the retired line's
  `DocsShell`, which was an empty `div` carrying a class name that every site then
  had to style from its own stylesheet. A frame with no styles is not a surface,
  and publishing it as one would have handed four repositories an unstyled box.
  What shipped is not that: a documentation screen that takes the tree as data,
  so the frame is the same on all three sites and the styling is Prism's. The
  name is unchanged at `docs-shell` and the kind is now `page` rather than a
  Block, because the screen is a whole one: it owns the document's `h1`, it is
  what a route renders for a documentation page, and the rail alone is not
  separable from it. The three consumer sites already import that exact name,
  `import { DocsShell, type DocsNavEntry } from '@nanisoft/prism-ui/pages'`, which
  is the same evidence that named `site-footer` and the same reason a published
  name cannot be cheaply changed.

  Two rules the Page states, because each is a misreading a structural affordance
  would otherwise cause. **A section is a label and not a control**: it carries no
  status, no badge, no count, no collapse and no sort, because one consumer site
  files its documentation as a pipeline where a section is a stage of the work
  rather than a topic a reader may visit in any order, and every one of those
  affordances says the opposite. **A group with no index is a label and not a
  route**: the group route is optional in the type, so its absence renders a
  `span` rather than an anchor with no `href`, and the two stylesheet rules that
  restyled that anchor back into a label become deletable. The pager is derived
  from the navigation and the current address rather than passed, which removes
  one derivation from each of the three sites and makes a neighbour that is not in
  the tree impossible to express.

  Three more items are settled rather than deferred, so v1.1 does not
  re-express them blindly. The old `stat-card` Block folds into `stats-01` and is
  not a separate item. The old `icon` item and `blog-layout` never
  ship: a custom icon package is out of scope because Lucide is the icon lane,
  and the blog does not exist. The old `empty` Component returns as
  `empty-state-01`, a
  Block, because the old item was already a composition of icon, title, body
  and action, which is a Block's shape.
- **Visual regression is report-only.** The Playwright job is committed with a
  written promotion rule (two stable weeks, target ten merges); until the rule
  fires, a visual diff is reported and does not fail the build.
- **The client-JavaScript budget reports per item and fails only in total.** The
  per-item thresholds live in the `BUDGETS` table in
  `packages/ui/scripts/check-client-budget.mjs`; a component over its figure is
  reported, and the deduplicated all-client bundle is held to the 90 KB gzip
  ceiling and fails.
- **`styles.css` has no byte budget.** The client analyzer measures source, not
  the compiled bytes a consumer downloads; a gzip budget is the strongest
  candidate for a future fail gate and is not adopted.
- **No cross-browser or cross-engine testing.** jsdom is not a browser, and the
  visual and real-browser axe checks are Chromium only.
- **The registry validator proves internal consistency, not installability.**
  The tarball verifier proves contents, not runtime compatibility.
- **Supply-chain and dependency automation is deferred.** CodeQL, OSSF
  Scorecard, `dependency-review-action`, Renovate and pnpm `minimumReleaseAge`
  are named as deferred in the header comment of `.github/workflows/ci.yml` and
  are not adopted.
- **A one-way Figma Variables sync is not built.** The DTCG projection under
  `dist/dtcg/` exists; the sync and its plugin ownership do not, and two-way
  sync is out of scope.
- **A fourth Kind is decided and not built.** `live` is a Kind for surface whose
  content changes over time without a navigation event, and it is the home for
  an agent console, an execution flow and a monitoring view. Prism would own the
  event log surface, the tool-call ledger, the status tiers and the run controls;
  the consumer owns the socket, the transport and the persistence, so Prism stays
  transport-agnostic and no permanent client runtime reaches a consumer. It is
  **not** in `CATALOG_KINDS` and `Kind` in `CONTEXT.md` still reads `component`,
  `block`, `page`; the glossary is not edited ahead of the code because a
  vocabulary that names a Kind the catalogue does not have is a second list.

  Adding it is a **breaking change, at 1.0.0**, and the reason is a compile-time
  tie rather than a judgement. `STORE_KINDS` is tied bidirectionally to
  `CatalogKind` by the `_KindsMatch` assertion, and `countKinds` holds a
  `Record<ItemKind, number>`, so a fourth Kind added to one place and not the
  others is a build failure. Two transcriptions remain untied, both named by
  issue 72 and neither fixed: the `KINDS` literal in `apps/site/src/lib/catalogue.ts`
  is a hand-written copy of the catalogue's union, and `kindLabel` in
  `packages/mcp-server/src/render.ts` is a three-branch fallthrough whose final
  branch returns `Page` for any input, so an unrecognised Kind is mislabelled to
  an agent rather than refused. Both are sequenced last, behind the concurrent
  work on the same three files.

  **The decision's own contents are incomplete.** The four things named above are
  the things that change while a run is in flight, and that is what makes them
  `live`. Three more surfaces in the same territory do **not** change in place and
  so are not `live`: a run history, an approval queue, and a cost ledger. They are
  read-mostly records that change as a run completes or as a person decides, which
  makes them Workflows rather than a Kind. They are named here because leaving
  them unnamed is how the fourth Kind quietly becomes the answer to every agent
  problem, and it is not. See `docs/research/taxonomy-survey.md`, which found them
  by reading agent documentation rather than a component catalogue: none of the
  108 commercial categories names a run, a tool call, an approval, a trace or a
  cost, and none names an audit trail, a permission matrix, or a retention
  control either.

  The name is not settled. `live` is the working title; `stream` names an
  implementation and `console` names a use case, and a Kind named `live` beside a
  Mode named `dark` invites the confusion that retiring `beam-dark` removed. The
  map at issue 112 carries the decision and the open question.
- **Patterns, Templates and Workflows are decided and not built.** They are
  documentation, not surface: no npm subpath, no registry item, no corpus entry,
  and `CATALOG_KINDS` unchanged. A Patterns Section is a **prose** Section beside
  Overview, Foundation and Content, because a Pattern is not a catalogue item. A
  Pattern declares the Items it composes and a Template declares the Pages it
  arranges, and both declarations are compared against the catalogue by one gate
  that lives with the other site joins, so a document naming an Item that does not
  exist fails the build. A Template's arrangement is the published `DocsNavEntry`
  union rather than a new vocabulary, which is the shape `DocsShell` already takes
  and the shape a consumer site already adapts its own tree into.

  Two limits are recorded rather than papered over. **Provenance is asserted, not
  verified**: a gate can prove a claim was made, not that it is true, so the
  originality and similarity record is a self-assessment against a stated method,
  kept as one document per effort rather than one per asset, because the claim is
  about how the work was done. And the Pattern and Template declarations are
  checked; the originality claim is not, and does not pretend to be. Issue 112
  carries the reasoning.
