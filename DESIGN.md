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
    fontFamily: "Inter, 'Inter Fallback', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
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
- Motion has two laws, not one. Feedback is state feedback, on the 80/160/280
  millisecond scale, and there is no decorative or entrance animation anywhere.
  A figure that shows a *system running* is the second law: it is ambient, it
  runs on its own cycle scale, and it is bounded by rules that are structural
  rather than a matter of taste.
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

**The Stated Ink Rule.** A variant that sets its own fill sets its own ink. An
ink left to be inherited is not the page's, it is whatever surface the element
happens to sit on, and a variant whose colour depends on where it is placed is
the same control in one arrangement and a different control in another. The token
gate cannot see this: it measures token pairs, and `foreground` on `background`
is a pair it already holds at 4.5:1 in every pack and mode, so the defect was
never in a value. It was `outline` carrying `bg-background` and no `text-`, which
was invisible on the page ground and on a card because the ink there already is
`foreground`, and unreadable inside any Block that draws a filled surface. In
`Cta01` it shipped a `--background` button behind `--primary-foreground` in seven
of twelve pack and mode combinations, worst case 1.00:1 in the base pack's light
mode where the two are the same white. `packages/ui/scripts/check-variant-ink.mjs`
is the gate, and it reads the source rather than the emitted sheet because
Tailwind only emits a variant that something uses.

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
enforced by the grep gates and by `scripts/check-motion.mjs`, described under
Token Contract.

## Typography

Inter is the only interface face. The platform monospace stack annotates
machine-readable values. Both are authored tokens (`font.sans`, `font.mono`) and
both reach CSS, so the type system is no longer Tailwind's to change.

**The component package ships the face, and the reference site reads it.**
`font.sans` is `Inter`, then `Inter Fallback`, then the platform stack. The four
`@font-face` rules and the four binaries that back the first two entries are in
the component package's stylesheet and beside it in `dist/fonts`, under the SIL
Open Font License with the licence text shipped alongside the binaries. Nothing
downstream loads Inter. That is a law and it is one line: a consumer installs
`@nanisoft/prism-ui`, imports one stylesheet, and has the face, so a site cannot
reach a second answer to what `font.sans` names. The documentation site shipped
its own copy through `next/font/local` until this was written, and the cost was
not only 723 KiB of unsubsetted variable font preloaded twice per document: the
copy was applied to `<body>` as a directly set `--font-sans`, which outranks the
inherited token, so the library's three faces were never fetched on the site that
documents them. A reference site that cannot fail on the thing it documents is
not evidence for it, and the same copy also carried an optical-sizing axis the
shipped static faces do not, so the site and its consumers were reading one family
name and two different typefaces.

**`Inter Fallback` is a local Arial with Inter's metrics, and that is the point.**
`size-adjust`, `ascent-override`, `descent-override` and `line-gap-override` on a
plain `@font-face` are the whole of the technique: during the swap window the
fallback occupies Inter's own line box, so the text does not move when Inter
arrives. The numbers are measured off the shipped face rather than chosen, and
they are tuned to the reading weight, because the fallback is only on screen
while a face is loading. It is declared in the library for the same reason the
face is: a consumer has no way to know it exists, and four sites each deriving it
is four sites each getting it wrong.

**The shipped faces are three static Latin subsets plus one italic, and nothing
else.** 400, 500 and 600 upright and 400 italic. The authored weight axis emits
four and the shipped source renders three, so 700 is absent: a 23 KB file that no
page renders is 23 KB every consumer downloads forever, for a token nothing uses.
The weight axis is the files' only axis; the design system retired the width axis,
and optical sizing is the browser's business, which for a static face means it
does not happen. The italic is there because `Prose` sets `blockquote` in italic
and the surface therefore had been asking for a style no shipped face provided;
one real face covers every weight a browser asks for, because the font matcher
takes the closest available weight rather than synthesising once a face exists.

### The scale

Text sizes are authored as size and line-height pairs: `xs` 0.75/1.333, `sm`
0.875/1.429, `base` 1/1.5, `lg` 1.125/1.556, `xl` 1.25/1.4, `2xl` 1.5/1.333,
`3xl` 1.875/1.2, `4xl` 2.25/1.111, and `mono` 0.625/1. Leading is authored as
`none`, `tight`, `snug`, `normal`, `relaxed` and `loose`. Tracking is authored as
`tighter`, `tight`, `normal`, `wide`, `wider` and `widest`. Weight is authored as
`normal` 400, `medium` 500, `semibold` 600 and `bold` 700.

### Hierarchy

A heading's size follows its level. The level is already on every Block as
`headingLevel` and `childLevel()` already carries it down a level, so the size is
derived from the level rather than chosen beside it, and there is no prop that
sets it.

- **Display** (600, 1.875rem / 1.2, -0.025em): every page `h1`, and a Block
  composed as one. It steps up to 2.25rem at `sm` and carries `text-balance`.
  Nothing in the system goes above `4xl`, and no heading level steps above
  Display: the `h1` is the ceiling because a page has one top-level claim.
- **Title** (600, 1.5rem / 1.333, -0.025em): the section title, which is the
  `h2` and therefore what almost every Block renders, at 1.875rem above `sm`. Also
  stat values and plan prices. A card title uses `font-semibold` at the
  inherited size.
- **Step** (600, 1.25rem / 1.4, -0.025em): the `h3`, at 1.5rem above `sm`, which
  is where a Block embedded inside a catalogue card or a panel lands.
- **Floor** (600, 1.125rem / 1.556, -0.025em): `h4`, `h5` and `h6`, at 1.25rem
  above `sm`, and this is where the scale stops. `lg` is the deepest authored step
  that is not smaller than Body, so a heading that stepped one further would
  render smaller than the copy it introduces. The three levels share one step and
  do not wrap, which is the same trade `childLevel()` makes when it clamps at
  `h6`. A heading at the floor is still a heading: weight, tracking and
  `text-balance` carry it, not size alone.
- **Body** (400, 1.125rem / 1.556): section and page descriptions, with
  `text-pretty`. Supporting copy drops to 0.875rem.
- **Label** (500, 0.875rem / 1.429): buttons, nav links, option rows, and card
  descriptions.
- **Eyebrow** (500, 0.875rem, 0.025em, uppercase): the optional eyebrow in muted
  text, opt-in only.
- **Mono** (400, 0.625rem, line-height 1): token values, install commands,
  category tags and machine annotations.

The one heading outside this table is the CTA banner, which is not a section
title: `Cta01` draws a centred title on a filled panel with nothing under it, so
it resolves its own tag and asks this table for its size rather than keeping a
second answer to the same question.

**`Prose` walks the same ladder**, and it did before `SectionHeading` did. Its
child treatments set `h1` at `3xl`, `h2` at `2xl`, `h3` at `xl` and `h4` at `lg`,
which is this table step for step and stops where this table stops. A document
rendered through `Prose` and a page composed from Blocks now read as one
hierarchy. `SectionHeading` was the second answer, and it was the one every
catalogue Item used, so the two agreed about prose and disagreed about
everything else.

### Named rules

**The No-Default-Eyebrow Rule.** The `eyebrow` prop has no default and renders
nothing when absent. A block that hardcodes a status pill makes every consumer
who installs it inherit a claim about their own product. Pass an eyebrow only
when you mean it.

**The Heading-Owns-It Rule.** A section heading defaults to `as="h2"`, because a
block is composed rather than a page, so the surrounding document already owns
the `h1`. The site's landing page is the one place that opts up. A document with
no `h1` gives screen readers and search engines no top-level entry point.

**The Level-Carries-The-Size Rule.** The heading level decides the size as well
as the tag, and no prop decides either. The alternative was a `size` prop on
`SectionHeading` and on every Block that renders one, which widens the public
surface across ten Blocks for a decision the surrounding document has already
made by choosing a level. A consumer composing a hero and six Blocks gets the
hierarchy by passing the levels it was already passing, and a Block moved from an
`h2` section into an `h3` one carries its size with it, which is what
`headingLevel` was introduced to do.

## Layout

One container family, one vertical rhythm, three breakpoints. All three are now
authored tokens rather than Tailwind's.

### Container and measure

**One namespace, and it is this repository's.** The group is closed: the token
build emits `--container-*: initial` into the `@theme static` block ahead of the
authored entries, so Tailwind's own thirteen `--container-*` steps resolve to
nothing and a `max-w-6xl` compiles to no rule at all. That line is not tidiness.
Three of those steps were numerically identical to three authored widths (its
largest at 72rem beside `page`, its fifth at 42rem beside `measure`, its fourth at
36rem beside `measure-narrow`), so nothing rendered differently, nothing failed,
and the cost was a retune of `--container-page` that would have moved every
surface reaching the page column by one spelling and left every surface reaching it
by the other exactly where it was.

The page family:

- `--container-page` (72rem) for the page container.
- `--container-measure` (42rem) for prose.
- `--container-measure-narrow` (36rem) for narrower copy.

The overlay family, and the reason it is a family rather than three more steps:

- `--container-overlay-panel` (24rem) a side panel or a narrow summary.
- `--container-overlay-dialog` (28rem) a decision or a short task.
- `--container-overlay-form` (32rem) a form.
- `--container-overlay-palette` (36rem) a searchable list of full sentences.
- `--container-overlay-media` (64rem) a picture.

**An overlay's width is a property of the kind of surface it is, not of the page
grid underneath it.** That is the whole reason the two families share a group
rather than running together as one scale: a retune of the reading measure must not
move a dialog, and a retune of the page column must not move either. They share a
group because Tailwind 4's `max-w-*` resolves `--spacing-*` and `--container-*` and
nothing else, so a maximum width that is to be a token has to live in one of those
two namespaces or it is a value in a Component. `overlay-palette` and
`measure-narrow` are both 36rem; that is two measurements that happen to agree and
not one measurement with two names, and the authored group says so and
`check-emitted-contract.mjs` holds it to saying so.

A gutter is a spacing token (`--spacing-6` at 1.5rem, `--spacing-8` at 2rem), so
the container contract is max-width (token), plus gutter (spacing token), plus
`mx-auto w-full` (composition). `Section` consumes the container, and nothing
re-declares the literal.

A box that is not held to a decision is arithmetic on the base unit and says so:
`max-w-96` is `calc(var(--spacing) * 96)`, and it is how a chart's axis band, a
token table's column and a documentation Demo's frame are sized. Naming those
would invent a decision nobody took, and an arbitrary `max-w-[...]` is refused by
`scripts/check-elevation-layout.mjs`.

### Breakpoints

`sm` at 40rem, `md` at 48rem and `lg` at 64rem, matching the values Tailwind
compiled before so no media query moved. The set is closed: `xl` and `2xl` are
dropped, so an `xl:` utility cannot resolve to a value this repository never
authored. Breakpoints are not consumer-overridable. A breakpoint exists only as
the threshold Tailwind compiles into a media query inside `styles.css`; the
consumer does not run Tailwind, and the contract forbids re-declaring the
namespace.

**Closing a screen closes the class as well as the value, and the class is the
half that was unchecked.** `packages/ui/scripts/check-breakpoint-variants.mjs`
reads every responsive variant out of the class strings in `packages/ui/src` and
`apps/site/src` and compares it to the screens `layout.tokens.json` authors minus
the ones `build.mjs` closes, so a class written against a screen the emitted
theme does not have is a finding rather than a media query nobody compiles. It
exists because `DocsShell`'s frame carried an `xl:` grid template while its
contents rail sat in an implicit `auto` track: two columns from 1024 pixels up,
with the document squeezed to about 340 pixels, and every other gate green
because each of them holds the value and not the class.

**The container namespace was closed for the same reason, and it took two gates
because the question has two sides.** `scripts/check-elevation-layout.mjs` reads
every `w-*` and `max-w-*` name out of the class strings in `apps/site/src`,
`apps/site/items`, `packages/ui/src` and `scripts`, and holds it to the container
group in `layout.tokens.json`, so a width nobody authored is a finding with a file
and a line. It judges the NAME, and a name is all a source scan can see.
`packages/ui/scripts/check-container-namespace.mjs` reads
`packages/ui/dist/styles.css` and judges the ARTEFACT: that the `@layer theme`
block declares exactly the authored containers, that none of Tailwind's thirteen
steps is declared or read, that the close is declared ahead of the authored
entries rather than after them, and that every container width this package writes
is emitted as a utility reading its own variable. The step list is read out of the
installed `tailwindcss/theme.css` rather than restated, because the thing being
defended against is that list.

Neither gate would have caught the other half. A source scan cannot see that a
framework resolved nothing; an artefact scan cannot see a Component that named a
width nobody authored, because by then the class is not in the sheet at all.
`packages/ui/test/container-namespace.test.tsx` states the same artefact facts
through the CSS reader the other built-sheet tests use, so the fact sits next to
`reduced-motion.test.tsx` rather than only inside a release lane.

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

In one sentence: Tailwind remains authoritative for layout composition, state
multipliers, utility property lists and media-feature variants; it is no longer
authoritative for any token value, and the one shadow exception this list used to
name is gone because the site turned out to be using it.

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

### There is no docs-only exception, and there was one

This section used to carry a subsection called the docs-only exception, and it
said `shadow-lg` is deliberately un-authored because the theme disclosure and the
mobile nav panels are site apparatus, that it is the one named residual shadow
literal, and that a consumer never receives it and no shipped component uses it.
**Every factual claim in that paragraph was wrong, and nothing could have caught
it**, which is the reason the exception is gone rather than corrected.

`SearchDialog` shipped `shadow-lg` on its panel, as an override on top of the
`shadow-md` its own `DialogContent` already draws, and the site's skip link
shipped `focus:shadow-lg`. Neither is what the paragraph described. And the reason
is the part worth keeping: `shadow-lg` is not an authored step, so it resolved
against **Tailwind's stock theme** in both places, which means the elevation a
reader saw was a value the token source did not own and a retune of the shadow
scale would not have moved. "Site apparatus rather than installable surface" is
not a defence of that, because the site's own Tailwind build is a second consumer
of the same token package, so a site class resolving a shadow out of Tailwind is
the second source of truth this whole section exists to prevent, wearing the word
apparatus.

`scripts/check-elevation-layout.mjs` now refuses any `shadow-*` step the token
source did not author, in every root it reads, site included, and reads the
authored set from `shadow.tokens.json` rather than from a list beside the gate.
`shadow-none` is allowed, because the absence of a shadow is not one more step of
the scale; `shadow-inner` is not, because it is a shadow nobody authored and a
Component that wants an inset edge asks upstream for one.

### Named rules

**The Three-Step Rule.** The installable surface uses exactly three shadows:
`xs` on filled controls, `sm` on cards, `md` on the lifted element. `md` is the
ceiling rather than a floor: the floating panels a fourth step was reserved for
are drawn at `md`, so there is nothing in this system a fourth step is for.

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

### A name is a description of the job, never a position in a series

**A Component slug says what the Component does, and the only number a slug may
carry is a variant ordinal on a name that is already true.** `hero-01` and
`hero-02` are both heroes, so the number carries no information a reader could
have predicted from the name. `in-place-zoom` and `whole-screen-zoom` each say
something, and the difference between them is the difference between two things a
consumer chooses between on purpose. This is the law that keeps the catalogue
navigable at any size, and it is worth stating as a law rather than a convention
because the failure is invisible at a hundred Items and expensive at two
thousand: a numbered series is a list nobody can search, because the number is the
only thing that distinguishes the entries and the number is not a property of the
thing.

**The test for a new Component is whether its name survives being wrong about the
implementation.** If a name is `button-47`, it is only wrong if the button changes.
If a name is `split-button`, it is wrong the moment the split moves, which is
never, because the split is what it is. The cost of the descriptive name is that
it is a longer slug and that renaming one later is a breaking change to a
published name, which is the same cost DESIGN.md already accepts for `site-footer`
and `docs-shell`. The benefit is that a consumer who has never seen the catalogue
can guess the name, and a guess that works is worth more than forty characters.

**A variant that is only a prop combination is not a Component.** If a member of a
family differs from its siblings only by a prop every one of them already takes,
it is a call site, and publishing it would make the catalogue a second list of
call sites. The nine Components added in the 2026-09 sweep are the boundary drawn
in practice: `pill` ships beside `tag-group` because a capsule is a different
shape with a different radius under a pack boundary, while a tag with a tone set
is a `tag-group` with one prop changed. **The cost of this rule is that some things
upstream treats as separate items will not exist here as separate items**, and the
reason each one is refused is recorded rather than left to be rediscovered.

Five were refused in the sweep, each for a stated reason and none of them quietly:

| Refused | Prism's answer | The reason |
| --- | --- | --- |
| A promotional band | `announcement`, or a Block | A notice that carries a status is an `announcement`, and a band that carries a promotion is a section, and a section is a Block by the definition above. A Component for it would be a Block wearing a Component's name. |
| A second way to stack avatars | `avatar-group` | Stacking and grouping are the same arrangement read at two widths. Two Items for one arrangement is a second list. |
| A short code sample | `code-block` | A snippet is a code block with less of it, and `code-block` already takes the caller's own text. |
| A scrolling strip of tab labels | `tabs` | One upstream entry against a hundred and six for the thing it is a sub-case of. The strip has no behaviour `tabs` does not already have. |
| A plain list | `list-panel`, `item` | A titled panel with a toolbar and a body, a row, and a definition list already exist and cover the three shapes a plain list turns out to be. |

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
  A figure that runs on a cycle names an `ambient-*` token and the
  `prism-ambient-*` class that resolves it, which is the same law with a
  different scale; see Motion, below, for why the two are separate.
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
  and leave reduced motion to the one rule that already decides it.

### Don't

- **Don't** rename a semantic token. The names are shadcn's variable contract,
  and renaming breaks unmodified shadcn blocks, third-party themes and existing
  consumers.
- **Don't** load your own copy of the interface face, by any mechanism. The
  component package ships it and the stylesheet backs `font.sans`, so a second
  copy is a second answer to a token the library already resolves, and the site
  shipped one for months without anyone noticing that it had stopped rendering
  the face the library publishes.
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
- **Don't** add a keyframe animation or an entrance or scroll effect. Reduced
  motion is one unlayered rule in the component package's stylesheet, and a
  Component never re-decides it with a `motion-safe:` or `motion-reduce:` variant.
- **Don't** author an ambient cycle outside the six classes the stylesheet
  publishes, and never give a keyframe a duration of its own.
- **Don't** add an em dash or an en dash to reader-facing copy. The dash gate
  covers this file and the other root documents.

### The coarse-pointer floor

The Do list above says what every control owes a finger. This says how it is
paid, because the two answers in this repository are not interchangeable and
choosing wrongly is a defect rather than a taste.

**A step, and it is the default.** `pointer-coarse:size-11` on the element, in
`@layer utilities`, inside `@media (pointer: coarse)`. The desktop utility is
untouched, so a mouse and a trackpad get the metrics that were designed and a
finger gets 44px. `Button` has always been written this way and it is the right
first answer.

**A band, where a step would draw something the design does not have.** A
`::before` pseudo-element, 44 by 44, centred on the control and transparent. It
gives the same target with the control exactly as drawn, which is the only way
to pay the floor on a shape whose drawn size is the point: a slider thumb, a
switch pill, an icon control in a corner of a panel. Three conditions decide it,
and all three have to hold.

1. **Nothing the band reaches is a target the reader was aiming at.** A band adds
   fourteen pixels in every direction. Beside a checkbox in a list whose rows are
   stacked against a shared border, that fourteen pixels is the next row's own
   checkbox, so a checkbox takes a step. A switch in a settings row has empty
   space above and below it, so a switch takes a band.
2. **Growing the control would move the drawing rather than the target.** A
   `size-11` thumb is a 44px ball on a six pixel rail. Worse, Base UI reads the
   press offset from the thumb's own box and the value from the control's own box,
   so a resized thumb leaves the drawing and the arithmetic disagreeing. A band is
   a pseudo-element and contributes to neither.
3. **The control is absolutely positioned with less than 44px of inset.** A band
   anchored at a 16px inset hangs off the panel it sits in, and on a phone the
   panel is the viewport minus its own gutter, so the overhang is clipped by the
   screen. A step is the answer there, at the cost of overhanging the panel's
   padding into the empty end of its header row.

**Two neighbours can still compete, and the package says so rather than hiding
it.** Two 44px bands on two 18px rows overlap by more than half of each, so a
`NumberField` turns its steppers side by side on a coarse pointer and stays 44
tall. Two 44px bands on two slider thumbs overlap once the bounds are closer
together than the band is wide, and the answer is a `minGap` a finger can pinch
apart. A band is a real target, and real targets have real neighbours.

**A band is 44 by 44, not 44 by the control's length, and that is what keeps
it local.** On a control that is short on one axis and long on the other, the
band takes 44 on both. The long axis is free, because the control already spans
it, so the whole of the band's cost lands on the short axis: a `Resizable`
divider is one pixel wide and the full height of the group, so its band reaches
21 pixels into each pane over a 44 pixel stretch of the line rather than down the
whole of both panes. A band sized to the control's length would claim the entire
side of both panes.

**The floor is a claim about targets, so an element that is not a target takes
nothing.** Two controls in this package are drawn at 28 to 36 pixels and are
deliberately left there: `Steps`' marker, which is a `span` with no role, no tab
stop and no handler, and `Pagination`'s ellipsis, which is `aria-hidden`. Neither
is focusable, neither is announced, and a press on either falls through to the
content behind it. Growing them would pay the floor on a decoration and push the
surrounding copy down the page. The test for whether a control owes the floor is
whether a reader is asked to hit it, not how small it is drawn.

**The floor is held by tests rather than by a gate, and that is worth saying
before anyone looks for one.** Nothing in `pnpm check` measures a target size, in
this package or any other, so each primitive asserts the class its own floor is
written as, which is the shape `button.test.tsx` uses. A primitive that loses its
floor fails its own suite. That is a weaker mechanism than a gate and it is the
honest one available: a gate here would need a browser, and Known Open Items
already records that this repository's real-browser checks are Chromium only.

**A `min-w-11` belongs beside the height whenever the width is content.** A
one-digit page link at 44 tall is 20 wide, an icon-only `Toggle` is `size-4` plus
`px-2.5`, and a floor paid on one axis is not a floor. This is the arrangement
`Button` states for its own sizes and the reason it states it, and it is why
`PaginationLink`, `Toggle` and `ToggleGroupItem` all carry both halves.

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
layout state such as a disclosure. A spatial transition does not carry a
`motion-safe:` variant any more, and the reason is stated under Reduced motion
below rather than here: the whole scale is decided in one place, so there is no
call site left to guard.

**The sentence above was contradicted by six call sites and has now been applied
to five of them.** `AccordionContent`, `CollapsibleContent` and `Sidebar` animated
a height or a width at `duration-base`, which is the case the sentence names `slow`
for, and both chevrons rotated at `base` beside a panel that now takes 280ms. A
chevron and the panel it opens are one motion, so a 160ms icon against a 280ms
panel is two events where the reader is watching one. All five are `duration-slow`
now.

**One call site stays at `base`, and it is named rather than left as a gap.**
`Progress`'s indicator is a `transition-transform`, which the same sentence puts in
`slow`, and it is deliberately not there. A disclosure is a spatial transition that
happens once, on a reader's click, and 280ms is what makes it read as opening. A
progress fill is a value that changes on **every tick of a running job**, often many
times a second, and the reader did not cause it: at 280ms the bar lags the work it is
reporting and is behind the moment the job moved on. That is the same distinction
the two laws of motion below draw, applied inside the feedback scale: a
disclosure is an answer and wants the long end of the band, and a continuously
advancing indicator is a reading and wants the middle of it. It is the one exception
this scale has, `Progress`'s own source says why, and the reason is a mechanism rather
than a preference.

**One surface animates a layout property and is not moving.** `Sidebar`'s rail is
`transition-[width]`, where `Progress` and `RangeField` are `scaleX` about the inline
start, and the difference is that a bar and a band are shapes while a rail is not. A
`scaleX` on the rail scales its icons into ovals, condenses its labels, and squashes
the counts beside them, and a transform cannot reflow text, which is the entire reason
a rail animates: the labels have to be laid out for 4rem by the time the rail is 4rem,
and only `width` does that. The rail is therefore the one named layout animation in
the package, its cost is one main-thread layout pass over one small subtree per
reader's click rather than per frame of a running job, and `sidebar.tsx` says so where
the class is.

## Motion

The system has two laws of motion, and they are different laws rather than one
law with an exception carved out of it. Everything above this heading is the
first. This heading is the second, and the second exists because the first alone
left a hole that four products fell into.

### The hole, stated as a measurement

Before this section, the repository authored one motion scale, one easing pair,
and zero keyframes, and the rule was that motion is state feedback only. Every
part of that rule was right, and it held completely: there was no decorative
animation anywhere in the shipped surface, no entrance effect, and no scroll
effect, and all four consumer sites inherited that.

What it also produced was four product sites whose heroes said what the product
was in a sentence and showed nothing about what it did. Each had previously
drawn the mechanism, on a canvas, with a `requestAnimationFrame` loop, reading
its colours out of the DOM at mount. The migration removed the canvas. It also
removed the claim, because the canvas was the only thing on those pages that
said a pipeline ran, a market was captured, an estate was observed. A hero that
names a factory and shows a paragraph is a brochure.

So the fix was not to permit decoration. Decoration is the thing the first law
was written to exclude, and permitting it would have undone a correct decision
to make an incorrect one. The fix was to name the second kind of motion for what
it is, and then to bound it with rules that can be checked.

### The two laws

**Feedback is a response.** Something happened because the reader did it: a
control was hovered, focused, pressed, opened, closed. The reader is waiting for
an answer, so the answer is fast (80/160/280ms), decelerating, and never
overshoots. This law is unchanged by this section.

**A cycle is a demonstration.** Something runs because the system does: a marker
crosses a rail, a reticle crosses a series, a wavefront crosses a field, a point
drifts. The reader did not cause it and is not waiting for it. Nothing is being
answered. The figure is making a claim about a mechanism, and the motion is how
the claim is made visible rather than merely asserted.

The distinction is not a rationalisation for ornament, and the test for which
one a motion is is falsifiable: **stop the animation. Is the figure still true
and still legible?** If yes, the motion is emphasis and it belongs here. If the
figure collapses into nothing, it was a video with extra steps, and the
component it was built with is the wrong one. `SignalField` is atmosphere and
says so in its own name; `PulseGraph` and `PulseSeries` carry claims and are
required to name themselves to a screen reader.

### The ambient scale, and why it is not folded into `duration`

The cycle lengths are a separate group with a separate namespace, and the reason
is that folding them in would have made one name mean two things by a factor of
twenty-five. `duration` measures a response in hundreds of milliseconds and is
capped at 280ms because anything longer stops being feedback. `ambient` measures
one turn of a running figure and is in seconds, because a cycle measured in
hundreds of milliseconds is a flicker rather than a cycle.

| Token | Cycle | What it drives |
| --- | --- | --- |
| `--ambient-travel` | 7200ms | a marker crossing a rail |
| `--ambient-sweep` | 9000ms | a wavefront crossing a field |
| `--ambient-drift` | 18000ms | a point on its own long cycle |
| `--ambient-scan` | 6000ms | a reticle crossing a series |
| `--ambient-pulse` | 2400ms | a node breathing while a marker passes |
| `--ambient-shimmer` | 3200ms | a figure's own load shimmer |

The easings are separate for the same reason, and `ease` and `ambient-ease` are
both closed to two or three members with no control point y above 1:
`ambient-ease-linear` is for anything carrying a thing from one place to
another, because a marker that accelerates out of one node and decelerates into
the next reads as being served rather than as travelling; `in-out` and `drift`
are for cycles where the shape of the turn matters more than the transit.

**The floor is one second, and it is a gate rather than a convention.** The
emitted-contract test measures every `ambient` member and fails below 1000ms,
with the reason stated in the failure: a cycle faster than once a second is
unreadable before it is understood, and no duration in the 80 to 280ms band
could ever have caught that, because a flicker was not a value this repository
could previously express. The test is written as a measurement rather than a
list, so a cycle added later is measured against the reason the group exists.

### Why the keyframes are in the stylesheet and the durations are in the tokens

A duration is a value, and values live in the token source and reach CSS as a
custom property. A keyframe is a mechanism: it names a set of properties and a
trajectory, and there is no DTCG type for one, so a keyframe emitted from the
token build would be a mechanism smuggled into the value tier.

They meet at exactly one place, and the meeting is what makes both halves
checkable: an `animation: prism-travel var(--ambient-travel)
var(--ambient-ease-linear) infinite` in the component package's stylesheet is a
duration *naming* a duration. So a keyframe cannot invent a timing and a token
cannot invent a trajectory, and every cycle in the system is priced by the token
that names it. A component never writes a keyframe name into a shorthand with a
length attached, and the six `prism-ambient-*` classes exist precisely so it
never has to.

### The four rules that make this safe

**Nothing is hidden.** No rule in the ambient layer sets `opacity: 0`, and
nothing waits for a script, an intersection, a scroll position or a timer. Every
figure renders its complete, correct, fully legible form at first paint, and the
animation only ever moves something already visible. A reader with scripting
off, a slow connection, a print stylesheet, a crawler, or a browser that never
runs the animation at all sees the whole drawing. This is why a consumer needs
no exception to enable the `hidden-state` gate: the state does not exist.

**Reduced motion removes the movement, not the figure.** The
`prefers-reduced-motion` block at the foot of `packages/ui/src/styles.css` is one
rule setting `animation: none` and `transition: none` on the universal selector,
and it is the reason this is safe to ship: because every element's resting state is
its full form, that reader gets the same figure, still. Not a slower one, not a
faded one, not a summary of one.

**And it is one rule for the whole package, which is a change of position and
not a change of wording.** This file used to say that motion is shortened rather
than removed under reduced motion, with a cycle shortened to zero, and the
stylesheet implemented neither half. There was no mechanism in a stylesheet that
could: a shortened transition is a duration, and a duration cannot tell three
things apart that the rule has to tell apart. It cannot tell a property that
changed colour from one that moved. It cannot tell a property that transitions
because a Component said so from one that transitions because nothing said it
should, and `transition-property` starts at `all` while `transition-duration`
starts at `0s`, so one rule that shortened them would give a duration to every
element in a consumer's document that had never animated anything at all. And it
cannot be written at a call site, because Tailwind's `motion-safe:` variant ADDS
a rule inside `prefers-reduced-motion: no-preference` and never removes one: the
three guards this package shipped were the property without its duration, the
duration with its property, and a transition of `left`, `right` and `width` that
the guard beside it did nothing about.

So the position is now that reduced motion is a stop rather than a shortening, for
every animation and every transition, written once. What a reader keeps is
everything that is not movement: a hover still changes colour, a focus ring still
appears, a dialog still opens and closes, a disclosure still opens, and none of
them takes time to do it. The system's first law of motion says a reader who
hovered something is owed an answer, and it is still answered; it is just not
answered over 80ms.

**What made one global stop safe, and it was one Component.** `transition: none`
starts nothing, so `transitionend` never fires for a transition it removed, and
an exit waiting on that event strands whatever it was hiding. `Toast` was the one
such exit, and it hands over by asking the browser what is actually running on its
root rather than waiting for an event; the overlays are Base UI's, and Base UI
settles every popup on `getAnimations()`, which resolves at once when the list is
empty. So no state in this system has an exit that depends on an animation or a
transition running to completion, which is what one rule needs and what a hundred
per-call-site guards never established. `packages/ui/test/reduced-motion.test.tsx`
reads the emitted block out of `dist/styles.css` and holds it to four claims, and
`scripts/check-motion.mjs` holds the source to the same four.

**What it costs, named rather than argued away.** `Spinner`'s ring stops turning
and `Timeline`'s running mark stops breathing, and each of them is `aria-hidden`
beside a label or an entry's own words, so the announcement is unchanged and only
the movement is gone. A caller who drew a spinner with nothing beside it has lost
the only signal there was, and `Spinner` requires a label for that reason. A
disclosure now opens at once rather than growing, which costs a reader nothing,
because a panel's resting state when open is its full height. And a caller who
wants a shortened hover rather than an instant one cannot have it from this
package without overriding the stylesheet, which is the no-override-path rule
applied to motion: a preference the reader set is not a preference a Component
negotiates.

**The pause is a first-class state.** `prism-ambient-paused` is a published
utility rather than something each consumer invents, because the alternative is
every consumer writing its own stop mechanism and at least one of them getting
it wrong in a way that restarts the cycle when the figure returns to view. A
loop computing for a figure nobody is looking at is a battery cost with no
reader attached.

**Compositor properties only.** Every keyframe animates `transform` or
`opacity` and nothing else. There is no animated `width`, `top` or `box-shadow`
in the layer, because those are layout and paint properties that run on the main
thread, and a figure built from them stutters on a mid-range machine. This is
also why the three-dimensional transforms in `prism-drift` and the `scaleY` in
`prism-rise` are written the way they are rather than as a width change that
would read the same.

### What this section does not author

No entrance animation, no scroll-reveal, no parallax, no carousels, no
attention loop, and no motion on text. The first law's prohibitions are
untouched by this section, and the reason they were right is the reason they
stand: a reader who did not ask for a thing moving is owed a page that is still.
What was missing was a way to say that a system is running, and this is it.

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

**The grep gates.** `scripts/check-motion.mjs` fails on a `cubic-bezier(...)`
literal, an arbitrary duration, easing or animation utility, a time value beside a
motion property in component source outside the token package, a per-call-site
reduced-motion guard on a motion utility, and a `prefers-reduced-motion` block in
the library's stylesheet that is not one unconditional unlayered rule declaring
both `animation: none` and `transition: none`. It blanks comments before it reads,
because a JSDoc block that quotes a banned value while explaining why it is banned
is a record and not a violation; it judges a millisecond only beside a closed table
of motion property names, because a caller stating a reading in their own register
is content and not a style; and it reads the five authored source trees rather than
the gates and the scripts, which spell out the patterns they ban as a matter of
course. A surface gate scans the emitted
declarations for a Base UI module specifier or type and for a re-exported variant
recipe. An elevation and layout gate fails on a raw `box-shadow`, an arbitrary
shadow or container utility, a re-declared shadow, breakpoint or container property
outside the token package, a `w-*` or `max-w-*` naming a container this
repository does not author, and a `shadow-*` naming an elevation step the token
source does not author. That last rule is new and the two ends of it do not
overlap: the token package's emitted-contract gate reads the emitted theme and
refuses a `--shadow-lg`, and this one reads the source and refuses a `shadow-lg`
in any root it reads, so the value can be authored in neither place and neither
gate has to know about the other. A breakpoint-variant gate
fails on a class that names a screen the token package does not emit, which is the
other direction from the elevation gate's rule about a re-declared `--breakpoint-`
property. A
container-namespace gate reads the built stylesheet and fails when the theme block
carries anything but the authored containers, when one of Tailwind's own steps
survives in it or is read by a rule, when the close is written after the entries it
was meant to precede, and when a width this package writes is not emitted as a
utility reading its own variable. Allowed everywhere are the authored names and
their `var(--...)` reads, a bare number or a fraction as arithmetic on `--spacing`,
and the keyword widths (`full`, `fit`, `max`, `min`, `none`, `auto`, `screen`,
`prose`, `px`), which name the reader's own box rather than a value out of a scale.

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

**There is no light-forced form, and the reason is the mode axis rather than the
selector language.** An element cannot ask for the opposite of its ancestor's
mode, because the mode is that ancestor's class and CSS has no way to say "this
element, whatever is above it". A selector that resolves a pack boundary as light
inside a dark document is writable and would win:
`.dark [data-pack="<id>"]:not(.dark [data-pack="<id>"] *)` is (0,4,0) against the
descendant form's (0,2,0), because `*` contributes nothing inside `:not()` and the
argument carries the whole descendant selector. The obvious form,
`[data-pack="<id>"]:not(.dark, .dark *)`, does not work and is worth knowing why:
its argument `.dark *` matches every element of a dark document including the
boundary itself, so the `:not()` is false exactly where it is needed, and where it
is true it ties the descendant form at (0,2,0) and loses on order.

The working selector is therefore not a light-forced boundary at all. It matches
EVERY top-level pack boundary on a dark page, because "top level" is the only
thing distinguishing it from the rest, so publishing it would put a light patch on
every boundary a dark document draws. Picking one element out of that set needs a
per-element signal, and there is no attribute for one: the boundary surface today
is a pack attribute and a mode class, and a third would be a third axis rather than
a second form of the second.

**The consequence, stated so it is not rediscovered in a screenshot.** A consumer
cannot render a light-mode swatch or preview of a pack inside a dark document. The
boundary resolves dark there, so a mark showing both modes shows the dark value
twice and reads as one colour where the reader expected two. The site's own pack
mark is that mark, and it is correct in a light document.

**This is a decision and not a gap, and it is the maintainer's.** Closing it means
moving the mode off the ancestor and onto the element, which changes the two-axis
model this section states and touches the provider, the boot script, every emitted
selector and the no-override-path law. `CONTRIBUTING.md` sends that upstream, and
until it is decided the boundary surface stays at two forms per pack and the
limitation stands where it is written rather than in each consumer's code.

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

- **The cutover is executed and one step of it is still open.** All four packages
  are on npm and the four consumer sites install them. The publish came from a
  maintainer machine rather than the release lane, because the npm trusted
  publisher is still not configured; see `CONTRIBUTING.md` for that, for the
  provenance attestation it costs, and for the environment check it bypasses.
  Still open: deprecating the retired pre-rebuild line. `MIGRATION.md` is the
  draft that goes live at cutover, and its own banner still says the cutover has
  not happened, which is now the one place in this repository that says so.
- **`prism.nanisoft.com` serves the new site, and the move is not an open item.**
  The Worker is `prism-site` and `apps/site/wrangler.jsonc` claims
  `prism.nanisoft.com` as a custom domain. The `deploy-site` job in
  `.github/workflows/ci.yml` runs on every push to `main` after `verify` passes,
  and it is not tied to a release: documentation and content ship faster than
  versions. Every merge to `main` therefore replaces what a reader receives, and
  `gh run view <run> --job <deploy-site>` ends with `Deployed prism-site triggers`
  and the line `prism.nanisoft.com (custom domain)`.
- **`CODEOWNERS` carries a placeholder owner line.** The project has one
  maintainer and no confirmed team handle yet; the cutover confirms it.
- **The v1.1 roster tail is no longer deferred. It shipped.** (Specified on
  2026-09-28 when the count was 28 Components, 10 Blocks and 4 Pages, and
  discharged in 2026-09 by the roster expansion recorded in
  `docs/history/roster-expansion.md`, which took the catalogue from 106 Items to
  236 and has grown further since; `docs/history/` holds the record as it was
  written and is deliberately not edited to match today.) Every name the table
  below deferred is now in the tree, with one resolution and one withdrawal, so
  v1.1 has no roster work left. **The count itself is not stated in this
  document**, and the two figures this entry used to carry were both wrong the
  moment they were written here: a count in prose goes stale silently, and a
  stale count is worse than no count. `check-catalogue.mjs` is the only count
  there is; run `pnpm --filter @nanisoft/prism-ui check:catalogue` and it prints
  the roster by kind alongside the three-way comparison that holds it.

  | Kind | Was deferred to v1.1 | Shipped as |
  | --- | --- | --- |
  | Components | the shadcn baseline tail: `collapsible`, `spinner`, `toast`, `alert-dialog`, `sheet`, `command`, `combobox`, `calendar`, `date-picker`, `scroll-area`, `aspect-ratio`, `hover-card`, `context-menu`, `menubar`, `navigation-menu`, `toggle`, `toggle-group`, `input-otp`, `item`, `button-group`, `input-group`, `carousel`, `chart`, `sidebar`, `form` (the react-hook-form binding), `number-field`, `meter`, `resizable`, `native-select`, and a standalone `label` | all of them, and `input-otp` resolved to `one-time-code` |
  | Blocks | `faq-01`, `logo-cloud-01`, `testimonial-01`, `newsletter-01` | all four, and `logo-cloud-01` now sits beside the `logo-strip-01` already published |
  | Pages | `onboarding-page`, `pricing-page`, `error-page` | all three |

  **`input-otp` is withdrawn as a name and `one-time-code` takes its place.** The
  deferred name said what the thing is used for and the shipped name says what it
  is. A code field is composed by `two-factor-01` and by nothing else, and a
  component named for its use invites a second use; the shipped name is also the
  one the `two-factor-01` Block was written against, so the two agree. Nothing
  imports `input-otp`, because nothing imported the deferred name, which is the
  only reason a rename is free here.

  `footer-01` is not on this list because it is no longer deferred: the footer
  shipped as `site-footer` in the fourteen-item release, as a Block, because all
  four consumer sites already import `SiteHeader` and `SiteFooter` from
  `@nanisoft/prism-ui/blocks` and a header or a footer composes a mark, a switcher
  and a navigation rather than holding one job. The name follows the four import
  lines rather than the shape of this table, because a published name cannot be
  cheaply changed and there is no redirect lane for item routes. `logo-cloud-01`
  above was the deferred spelling of the logo strip, which had already shipped as
  `logo-strip-01`; both names are now in the tree, because the cloud is a
  trademark strip with a claim to make and the strip is a set of marks with none,
  and a design system that has both is more useful than one that made the reader
  choose. Neither is imported by a consumer yet.

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
- **Visual regression is report-only, and it has never once been green.** The
  promotion rule is written down in `apps/site/playwright.config.ts` (two
  consecutive weeks with no unexplained diff, target ten consecutive merges,
  `continue-on-error` comes off), and `docs/quality-gates.md` restates it. It
  has not fired and is nowhere near firing, because the rule's precondition has
  never held. **Every run of the job on `main` since it was added on 2026-09-26
  has failed, and the green tick on the job is not evidence otherwise.** The job
  carries `continue-on-error: true`, so GitHub reports the job and the step
  inside it as `success` whatever Playwright exits with; the failure count is in
  the log and nowhere else. `gh run view <run> --job <visual>` ends with a line
  like `78 failed` beside `36 passed`, and every failure is one of three kinds:
  `visual.spec.ts` screenshot mismatches, `display.spec.ts` computed-style
  assertions, and `header-fit.spec.ts` overflow assertions. So the written
  promotion rule describes a lane that has never had a stable week, and the
  honest reading of the open item is that this is not a promotion waiting on a
  clock but a lane reporting red into a report nobody reads.
  **The consequence worth naming is that the same mask hides the two lanes that
  are not visual.** `display.spec.ts` and `header-fit.spec.ts` assert cascade
  and overflow outcomes rather than pixels, and `docs/quality-gates.md` calls the
  display lane "the reason a cascade regression is a red line rather than a pixel
  diff in a report nobody reads", while also recording that it runs inside this
  report-only job and therefore does not fail CI. Those two statements are both
  true and together they mean the red line is not red. The remedy is the one the
  promotion rule already names, applied to the non-visual lanes first rather than
  last.
- **The client-JavaScript budget reports per item and fails only in total.** The
  per-item thresholds live in the `BUDGETS` table in
  `packages/ui/scripts/check-client-budget.mjs`; a component over its figure is
  reported, and the deduplicated all-client bundle is held to the gate's
  `CEILING` and fails. **Neither the ceiling nor the measured figure is stated
  here on purpose**, and this entry used to state both, which is the failure this
  paragraph is now corrected for. Run `pnpm --filter @nanisoft/prism-ui
  check:client-budget`; it prints the measured bundle, the ceiling, the entry
  point count and the headroom on every run, and it prints the ceiling derived
  from the constant rather than restated, precisely so a second copy of the
  number cannot drift from the first. What belongs here and nowhere else is the
  part no run prints: the ceiling has been moved by hand on every occasion a
  batch of Items landed, and the gate's own header comment argues from its own
  history that this makes it a counter rather than a budget, that a counter
  measures the catalogue rather than the JavaScript, and that the honest
  alternative, a fixed number somebody decides once on the evidence of what four
  downstream repositories can load, is a product judgement rather than a
  measurement and is therefore deliberately not made there. That comment is the
  record; read it rather than this paragraph for the current figure.

  The reasoning this entry adds is why a derived ceiling was considered and
  rejected, because it is the argument the gate makes and a reader here will not
  otherwise get it: a ceiling that scales with the catalogue lets the bundle grow
  to whatever the catalogue happens to be, which is the same as having none. The
  first moves corrected a ceiling measuring the wrong set of files, which is why
  their history is stated as truth about the past; later ones were forecasts about
  weight that had not landed; the most recent are reports, weight measured and
  present. Three kinds of number, and the gate names which is which.

  A ceiling with a fraction of a kilobyte of headroom is not a policy but a pin,
  because it fails on an unrelated dependency bump and teaches everyone to answer
  by rerunning it with a bigger number.
  **Pages carry no per-item budget and that is deliberate.** A Page is a
  composition of Blocks already in the table, so a budget for the Page would
  count the same bytes a second time and let one screen look like it costs what a
  screen costs when it costs what its parts cost.
- **`styles.css` has no byte budget.** The client analyzer measures source, not
  the compiled bytes a consumer downloads; a gzip budget is the strongest
  candidate for a future fail gate and is not adopted.
- **No cross-browser or cross-engine testing.** jsdom is not a browser, and the
  visual and real-browser axe checks are Chromium only.
- **The prose code fences render monochrome, and the mechanism is understood and
  the fix is not applied.** The shape of the defect is stable and is what this
  entry is for: a large majority of the exported pages carry a
  `<pre class="shiki shiki-themes github-light github-dark">`, each of those
  elements carries inline `--shiki-light` and `--shiki-dark` declarations, and
  **not one stylesheet in the export mentions either property.** Each token
  therefore inherits the surrounding colour, so every fenced block in every MDX
  document is plain text in the page's ink, and two themes' worth of GitHub hex
  ships on every one of those pages doing nothing. **The counts are not stated
  here**, and the ones this entry used to carry were stale: measured again in
  `out/` after a clean build they were off by a factor of four on the
  declarations, because the roster grew under them and nothing counted it. No
  gate prints them and none should, because a number in prose here goes stale
  silently; measure with a count over `out/**/*.html` if the figure matters, and
  treat the qualitative claim above as the record.

  The mechanism is `fumadocs-core`'s `rehypeCode`, which is in `fumadocs-mdx`'s
  default preset because this site declares no `rehypeCodeOptions`. Its defaults
  are `themes: { light: 'github-light', dark: 'github-dark' }` with
  `defaultColor: false`, and `defaultColor: false` is shiki's mode for emitting
  the **pair** as custom properties instead of a resolved `color`. Something has to
  resolve them, and the something is shiki's own stylesheet, which nothing here
  imports. Note the config surface, because it is not the obvious one:
  `fumadocs-mdx` 15.4.5 has no `mdxOptions.highlight` key at all. The lever is
  `mdxOptions.rehypeCodeOptions`.

  There are two repairs and only one of them is this system's.

  - *Ship the two consuming rules.* Smallest diff, and wrong here. It makes Prism's
    prose depend on GitHub's palette, and GitHub's palette has never been measured
    against Prism's grounds in any pack or mode. A design system whose first
    characteristic is that contrast is a build gate would then be shipping unmeasured
    hex on 277 pages.
  - *Point the highlighter at Prism tokens.* `apps/site/src/lib/highlight.ts` already
    holds a shiki theme whose every colour is a Prism custom property, expressed in
    three roles and two emphases precisely so a pack change re-themes the code with
    the page. Reusing it here, with `defaultColor: false`, makes each token emit
    `var(--brand-ink)` or `var(--foreground)` as the value of `--shiki-light`, and
    the consuming rule follows `.dark` because the values are tokens rather than
    hex. This is the right answer and it is the one this entry does not apply.

  **It is not applied because the prerequisite is a contrast measurement nobody has
  made, and it is the wrong session to make one in.** `highlight.ts` states its
  three inks were measured on the Demo panel's `bg-muted` across all twelve
  pack and mode combinations. The prose fence is not on that ground: `.prose pre`
  in `apps/site/src/app/globals.css` paints
  `color-mix(in oklab, var(--muted) 50%, transparent)` over the page, which is a
  different surface with a different effective contrast in every pack. Adopting the
  theme without measuring against that ground would put this repository in the
  position it exists to prevent. The work is: add the two consumer roles to
  `check-contrast.mjs` as a measured pair against the fence ground, then point
  `rehypeCodeOptions` at the existing theme, then add a gate in the shape of
  `scripts/check-vector-ink.mjs` that fails on a literal colour in a prose fence.
  That is one change with a gate and a measurement, not a colour swap.

  `apps/site/src/lib/highlight.ts` is a different thing and is not the defect: it
  themes the Demo panel, and the panel is a Prism surface with a Prism token behind
  every ink in it.
- **The registry validator proves internal consistency, not installability.**
  The tarball verifier proves contents, not runtime compatibility.
- **Supply-chain and dependency automation is deferred, and two things a reader
  might take for it are not.** CodeQL, OSSF Scorecard,
  `actions/dependency-review-action`, Renovate and pnpm `minimumReleaseAge` are
  named as deferred in the header comment of `.github/workflows/ci.yml`, and
  none of the five is adopted: there is no `renovate.json`, no
  `dependabot.yml` and no CodeQL, Scorecard or dependency-review workflow in
  `.github/workflows/`, and `minimumReleaseAge` appears in no manifest, so
  pnpm's age floor is off.

  What *is* enforced, and was named in neither place until now, is this.
  **The dependency graph is read, never grepped.** `scripts/check-no-legacy-line.mjs`
  parses `pnpm-lock.yaml` into a graph and holds every manifest edge and every
  lockfile edge against the retired line, so the assertion is reachability rather
  than a string that happens to spell a forbidden name, and it reads `.github`
  as one of its roots alongside the sources and the scripts. And **install
  scripts are allowlisted**: `pnpm-workspace.yaml` carries an `allowBuilds` map
  in which every entry is a decision, so a transitive dependency that grows a
  postinstall fails the install rather than running it.

  **One thing the `ci.yml` header asserts is not enforced, and it is the line
  directly above the list.** Every third-party action is pinned to a full commit
  SHA, and every one in the three workflows and four composite actions is, so the
  header describes what is true. No gate holds it. `check-no-legacy-line.mjs`
  reads `.github` for the retired line and for nothing else, and a workflow that
  gained an unpinned `uses:` would pass every lane in this repository. That is an
  unenforced instruction rather than a gate, and it is recorded as one here
  rather than left to read as coverage; `docs/quality-gates.md` records its
  equivalents in the same terms.

  **One pnpm feature reads like a policy here and is not one.**
  `pnpm release:verify` is `scripts/verify-tarballs.mjs`, which packs each
  package and asserts its contents; it prints four `ok` lines and a `tarballs:
  all pass` line and nothing else. It does not check a supply-chain policy, and
  the string "Lockfile passes supply-chain policies" that pnpm 11.18 can print
  is pnpm's own reporter for its lockfile-resolution verifier, not this
  repository's output: it appears only when pnpm is configured with
  `minimumReleaseAge` or `trustPolicy`, this repository configures neither, and
  the line does not print on a `pnpm install` or a `pnpm release:verify` here.
- **A one-way Figma Variables sync is not built.** The DTCG projection under
  `dist/dtcg/` exists; the sync and its plugin ownership do not, and two-way
  sync is out of scope.
- **A fourth Kind is built: `live`.** A `live` surface is one whose content changes
  over time without a navigation event, and it is the home for an agent console, an
  execution flow and a monitoring view. Prism owns the event log surface, the
  tool-call ledger, the status tiers and the run controls; the consumer owns the
  socket, the transport and the persistence, so Prism stays transport-agnostic and
  no permanent client runtime reaches a consumer. `RunStream01` is the first one, and
  it is the first client Component in the package, which is why it is client rather
  than as an accident: a surface that receives events owns the subscription that
  delivers them.

  **It is a breaking change, and it is released as one: `0.11.0`, a minor.** The
  `STORE_KINDS` assertion fired on the first edit, `KIND_LABELS` fired the next, and
  each transcription below was found by a compiler rather than by a reader.
  `CATALOG_KINDS` gained a member, so a consumer switching exhaustively over `kind` is
  broken, and that is a real break rather than an additive one.

  **The decision above said 1.0.0 and it is not what happened, and the reason is
  worth recording rather than quietly correcting.** A minor is the right line for a
  breaking change from a `0.x` version, where anything may change at any time, and
  taking `1.0.0` would *declare the public API stable* rather than describe this
  change. Those are different statements and only the first one is supported by what
  has been built: four Kinds, a client runtime in a package that had none, and a
  Kind whose name the same document records as a naming risk it was argued past. So
  the line is `0.11.0` and the stable release is a later, separate decision that
  should be taken on its own evidence rather than as the landing place for a
  taxonomy change.

  `CONTRIBUTING.md` says a breaking change is a `major` bump, so this is the one
  place the record and the convention disagree, and the disagreement is deliberate
  and dated rather than an oversight.

  Adding it is a **breaking change**, and the reason it is a compile-time
  tie rather than a judgement. `STORE_KINDS` is tied bidirectionally to
  `CatalogKind` by the `_KindsMatch` assertion, and `countKinds` holds a
  `Record<ItemKind, number>`, so a fourth Kind added to one place and not the
  others is a build failure. **Both transcriptions this named are now fixed**, and
  they were the only thing standing between here and the build. The `KINDS` literal
  in `apps/site/src/lib/catalogue.ts` was a hand-written copy of the catalogue's
  union while `CATALOG_KINDS` already existed beside the type derived from it, so a
  fourth Kind would have compiled, built every site, and silently not appeared in
  the site, which omits it with no error anywhere. `kindLabel` in
  `packages/mcp-server/src/render.ts` took a `string` and returned `Page` for any
  input, so a new Kind would have been announced to every agent reading the corpus
  as a Page, and nothing would have failed. It is now a `Record<ItemKind, string>`
  keyed on `ItemKind` rather than a chain ending in a default, so a fourth Kind is a
  compile error instead of a silent mislabel.

  **What is left is a name and a build, and the name is the decision.** The Kind
  itself is no longer blocked. The working title `live` is still not settled, for
  the reason given below, and that is a question for a person rather than for a
  gate.

  **The decision's own contents are incomplete.** The four things named above are
  the things that change while a run is in flight, and that is what makes them
  `live`. Three more surfaces in the same territory do **not** change in place and
  so are not `live`: a run history, an approval queue, and a cost ledger. They are
  read-mostly records that change as a run completes or as a person decides, which
  makes them Workflows rather than a Kind. They are named here because leaving
  them unnamed is how the fourth Kind quietly becomes the answer to every agent
  problem, and it is not. See `docs/history/taxonomy-survey.md`, which found them
  by reading agent documentation rather than a component catalogue: none of the
  commercial categories it catalogued names a run, a tool call, an approval, a
  trace or a cost, and none names an audit trail, a permission matrix, or a
  retention control either. The figure it counted is a property of that survey's
  dated reading of a third-party listing and is left there, in the survey, rather
  than restated here.

  **The name is settled: `live`, and the objection to it does not hold.** The
  working title was `live`, and the recorded worry was that a Kind named `live`
  beside a Mode named `dark` invites the confusion that retiring `beam-dark`
  removed. `stream` was rejected for naming an implementation and `console` for
  naming a use case, which leaves the concern about the adjective.

  It does not hold, and the reason is what `beam-dark` actually was. That was a
  **token** name in which a pack and a Mode compounded, so `beam-dark` read as a
  pack name and a reader could not tell a colour from a mode by looking at it. A
  Kind and a Mode are not in that position: in every surface this repository
  publishes they appear in **labelled fields**, `kind` and `mode`, so a reader is
  told which is which rather than inferring it from a compound word. The confusion
  `beam-dark` caused was caused by compounding two values into one name, and the
  fourth Kind does not compound anything.

  There is also a cost the other way. `live` is the term the products this Kind
  exists to serve already use, so an agent reading the corpus is reading a word it
  has met. A name chosen to avoid a theoretical confusion with a labelled field
  would be a word the reader has to learn, which is the opposite of what a Kind is
  for. Issue 112 carried the question; this is the answer and the reasoning.
- **Patterns and Templates are built. Workflows are decided and not built.**
  They are documentation, not surface: no npm subpath, no registry item, and
  `CATALOG_KINDS` unchanged. A Patterns Section is a **prose** Section beside
  Overview, Foundation and Content, because a Pattern is not a catalogue item. A
  Pattern declares the Items it composes and a Template declares the Pages it
  arranges, and both declarations are compared against the catalogue by one gate,
  `apps/site/scripts/check-pattern-composition.mjs`, so a document naming an Item
  that does not exist fails the build. A Template's arrangement is the published
  `DocsNavEntry` union rather than a new vocabulary, which is the shape
  `DocsShell` already takes and the shape a consumer site already adapts its own
  tree into.

  **The declaration is the law, and the gate found a real mistake on its first live
  run**: a Pattern composed of `Check`, which is an icon from `lucide-react` and not
  an Item anybody can install. That is the whole argument in one fact, because
  nothing about a prose page is type-checked and a recipe naming a renamed Item
  reads perfectly.

  **One clause of the decision above is superseded, and it is worth being explicit
  about which.** The decision said a Pattern gets "no corpus entry". That clause is
  about the *Items* store: a Pattern is not a catalogue Item, so it has no name, no
  kind and no props for `find_item` to return, and it is not in `llms.txt` as a
  component. It is not about the prose corpus.
  `check-content-joins.mjs` says so: a content page "is in the tree but not in the
  Corpus, so no agent can reach it". Leaving Patterns out of the Corpus would have
  made it the only prose Section an agent cannot read, which inverts the point of a
  layer whose readers are builders. So `patterns` is in `STORE_SECTIONS` and in
  `STORE_SECTION_TITLES`, and the reasoning is recorded beside the entry.

  **Two Section rules broke, and one was wrong rather than merely out of date.** The
  rule that a prose Section is singular and a Section holding Items is plural is now
  stated over the Sections that hold Items, because "Pattern" names a kind of thing
  and there is more than one of them, exactly as "Component" does. The cost is that
  `/patterns` no longer tells a reader from the URL whether it holds installable
  Items, which is accepted rather than solved by renaming the Section something
  singular and less recognisable, and the gate is what keeps the distinction honest.
  Every Section also needs an `index.mdx`, which is what a group heading links to.

  **Workflows remain unbuilt**, and the decision above is why that is not a gap in
  the roster: a run history, an approval queue and a cost ledger are read-mostly
  records that change as a run completes or a person decides, which makes them
  Workflows rather than a Kind. The `live` entry above names what would change them.

  Two limits are recorded rather than papered over. **Provenance is asserted, not
  verified**: a gate can prove a claim was made, not that it is true, so the
  originality and similarity record is a self-assessment against a stated method,
  kept as one document per effort rather than one per asset, because the claim is
  about how the work was done. And the Pattern and Template declarations are
  checked; the originality claim is not, and does not pretend to be. Issue 112
  carries the reasoning.

  **The record for this effort is `docs/history/provenance.md`**, and the shape it
  takes is the one the decision above specifies: the provenance record, a
  thirteen-item originality checklist, a four-axis similarity assessment and an
  independent implementation declaration, in one document rather than one per
  asset. `docs/history/` is its home because that is where this repository already
  keeps a finding that outlives the code that produced it, and a per-asset record
  would have been forty copies of one paragraph, which is the drift this repository
  has already had to unpick three times.

  The four axes are chosen so each is checkable by a **different** means, so a
  finding on one is not automatically a finding on the others: source text,
  structure and arrangement, interface, and appearance. Each carries a means of
  checking as well as a finding, because a claim with no way to check it is a claim
  rather than a record.
