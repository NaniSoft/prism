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
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1
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
`3xl` 1.875/1.2, `4xl` 2.25/1.111, `5xl` 3/1, `6xl` 3.75/1, and `mono`
0.625/1. Leading is authored as
`none`, `tight`, `snug`, `normal`, `relaxed` and `loose`. Tracking is authored as
`tighter`, `tight`, `normal`, `wide`, `wider` and `widest`. Weight is authored as
`normal` 400, `medium` 500, `semibold` 600 and `bold` 700.

Every step is a whole multiple of 0.125rem, and the two widest gaps in the group
are the two at the top. `xl` to `2xl` is a fifth more, `2xl` to `3xl` a quarter
more and `3xl` to `4xl` a fifth more again: those three order adjacent roles and
they are all the scale needed while its ceiling was `4xl`. `5xl` is `4xl` times
four thirds and `6xl` is `5xl` times five fourths, and those two are the display
role. They are authored as a pair rather than as one step because every rung of
the heading ladder is a pair, a base step and one step up at `sm`, so a single
step above `4xl` would have made Display the one heading in the system that does
not grow at a width.

### Hierarchy

A heading's size follows its level. The level is already on every Block as
`headingLevel` and `childLevel()` already carries it down a level, so the size is
derived from the level rather than chosen beside it, and there is no prop that
sets it.

- **Display** (600, 3rem / 1, -0.025em): the page's own claim, which is the `h1`
  on every page and on any Block composed as one. It steps up to 3.75rem at `sm`
  and carries `text-balance`. Nothing in the system goes above `6xl`, and no
  heading level steps above Display: the `h1` is the ceiling because a page has
  one top-level claim, and a ceiling nothing reaches is not a ceiling.
- **Title** (600, 2.25rem / 1.111, -0.025em): the `h2`, which is therefore what
  almost every Block renders, at 3rem above `sm`. Also stat values and plan
  prices. A card title uses `font-semibold` at the inherited size.
- **Step** (600, 1.875rem / 1.2, -0.025em): the `h3`, at 2.25rem above `sm`, which
  is where a Block embedded inside a catalogue card or a panel lands.
- **Floor** (600, 1.125rem / 1.556, -0.025em): `h6`, at 1.25rem above `sm`, and
  this is where the scale stops. `lg` is the deepest authored step that is not
  smaller than Body, so a heading that stepped one further would render smaller
  than the copy it introduces. The `h5` sits one rung above it at `xl`. The
  table has six rows and there are exactly six authored steps at or above Body,
  so the ladder lands on the floor with a step of its own at every level, and
  `h6` is the only place it stops rather than a place three levels share. A
  heading at the floor is still a heading: weight, tracking and `text-balance`
  carry it, not size alone.
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

**`Prose` walks this ladder from one rung down, and the reason is the measure
rather than a second decision.** A run of prose is held to `--container-measure`,
42rem. Display is 3rem, and a 42rem column is fourteen of those, so a document
title set at Display is a title broken into fragments rather than a title. Its
child treatments therefore set `h1` at `4xl` and descend one authored step per
level to `lg` at `h5` and `h6`: the same scale, the same floor and the same rule
about a heading never rendering smaller than the copy it introduces, entered at
the rung that fits the column.

**So a prose heading sits below a Block heading at the same level, by design, and
the number is 1.6.** A Block-composed `h2` is 2.25rem, and 3rem above `sm`. A prose
`h2` is 1.875rem and does not grow, because a reading column is already at its
measure and a heading that grows with the viewport is a heading that is a
different size on a different screen. The two are therefore 1.2 apart at the base
width and 1.6 apart above `sm`, where they were 1.25 apart before Display moved. A
page that sets a `Prose` section beside a Block section shows two tiers rather than
one, and nothing in the tree tells a consumer which is which or which to reach for.
Reach for `Prose` for a run of body copy and for the headings inside that copy, and
for `SectionHeading` for a band of the page. Closing the gap would mean lifting
`Prose` a rung, which puts Title into the reading column, and the reading column is
the one place on a page where a heading cannot be broken across lines.

**The measure is narrower still where `DocsShell` runs it, so the argument is
stronger there and not weaker.** `DocsShell` passes `Prose fullWidth`, so the frame
decides the width rather than the Component: 72rem of page column, less 4rem of
gutter, a 15rem rail, a 13rem contents rail and two 2.5rem gaps leaves a 35rem
article track, and a narrower one below 1216px. Display at 3rem is 11.7 of those,
and a prose `h1` at 2.25rem is 15.6, which is why the article `h2` under a page `h1`
on a docs page sits well below the `h1` above it and is meant to.

**The heading level is what every page-level heading asks, and `Heading`'s `size`
prop is not a second route to Display.** `Heading` is a free-size Component: the
size is chosen beside the tag, for a heading the surrounding document has already
placed and wants attuned, and its largest arm is a step of the scale rather than
a rung of the ladder. So `page-header-01`, `docs-shell`, `blog-post-page`,
`not-found-page` and `error-page` ask `headingSizeClass` for their page `h1`
rather than naming a step, and a page title cannot end up one rung below the
section titles under it.

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

### The job-identity test, and the name it implies

**The test is one question, asked before anything is named: could one Item draw
both screens, taking different content, without gaining a region, a decision or
an arrangement that the other does not have?** Where it could, the two screens
are one job with one name, and the second is the first called with different
data. Where it could not, they are two jobs, and the second gets a name that
says what it does. Issue 150 settled which of widening an Item or authoring
beside it answers a need; this is the question that settles which of those two
needs is in front of you, and it is answerable from the two screens alone, with
no catalogue entry written and nothing built.

**Three signals say one job, and the first is the one most often mistaken for
the whole test.** The **record is the same thing** the reader is looking at in
both, under whatever name the product calls it, and the interaction over it is
the same shape: an index, a detail, a write, a stream. On its own it decides
nothing, because an index and a detail are two archetypes over one record and two
Items, so the signal that carries the weight is the second. The **difference is
content rather than structure**: if what separates the two screens is which
columns, which keys, which grouped sections and which labels a field carries,
they are one Item under two specifications, because issue 148 already settled
that Prism owns the shape of typed content and the consumer owns the values.
And the **reader's decision is the same one** in both, so the same arrangement
answers both: a person scanning a list and acting on a row is doing one job
whether the row is a shopper who bought a shirt or a payer with an outstanding
balance.

**Two signals say two jobs, and each names something the first Item cannot draw
at all.** An **arrangement** the screen uses instead of the plain one: a list
that has become a board, a calendar of what falls due, a set grouped under a
parent, a grid edited in place, a detail pane beside the list. Each of those is
a shape with its own archetype name and, once authored, its own Item, and a
screen that adopts one has not found a second flavour of the record index, it
has found the board or the date view. Or an **aggregate about the population**,
which the index never states: the total owed across every account, the count by
state, the rate of change. A figure about the population is a metric summary,
composed beside the index rather than inside it, and a screen that wants one
wants two Items composed rather than one wider Item.

**The line between a field and an aggregate is the whole of one half of this,
and it is the line the payments customer screen sits on.** A balance on one row,
sorted or not, is a field of the index and the sort key is a prop. A total owed
across the population is an aggregate, it is what the screen would be opened for,
and an index cannot state it. So the question to ask of any screen that feels
like a second one is which of the two the difference is, and the answer decides
the name without a survey, a build or a vote.

**A `-02` is a second arrangement of one job, and never a second use of a
name.** That is the same law the slug rule above states for a Component, read at
the archetype layer: `hero-01` and `hero-02` are two arrangements a consumer
picks between on purpose, while two jobs that arrived at one candidate name have
found a name each.

**A collision is a symptom, and it is worth more than the name it produces.**
Two screens arriving at one candidate name is not two screens wanting one Item.
It is one screen that has been named twice because the decision it needed was
not made, and the two questions a reader can ask when it happens are which
archetype each screen belongs to and what that archetype's Item takes as
content. So the first move is not to pick a name but to find the missing
decision. **A naming answer that resolves a collision by inventing a third name
has resolved nothing**, because the third name is somewhere to put a decision
nobody took, and the next screen that needs the same one collides with it too.
The survey is where this shows: it proposes a candidate name per screen row, and
a row is one screen in one product's navigation rather than a job, so two rows
in different sections are one job as often as two.

**Scope is not a claim on a name.** A screen excluded by a recorded decision
constrains nothing, a name included. Excluded means no Item is authored for it,
and a name belongs to an Item, so an excluded screen cannot reserve a name,
cannot take a `-02` away from the in-scope screen that wants it, and does not
become a `-02` when its own surface is later scoped. The name an in-scope screen
takes is settled by the in-scope screens alone, and an excluded claimant comes
back as a fresh candidate measured against the Item as it stands by then, not
against the name left vacant for it now.

**`customer-list-01` is one name, and this reverses what issue 150 expected of
it.** The ecommerce screen is to see every customer and act on any of them; the
payments screen is the same list as a sortable one, where a balance decides who
is chased first. The survey assigns both rows to the record index, gives both the
same nearest Item in `DataTable01`, and gives the payments section's other
customer screen a different archetype and a different candidate name in
`customer-directory-01`, because a browsable set carrying a summary is not a
working list. So the collision is between two rows of one archetype whose
difference is a field and a sort key, and the answer is one name on a wider Item:
`customer-list-01` taking its columns as typed content, a money column among
them. It is also the case where the survey's own Kind column is not evidence,
because it reads Block on one row and Page on the other, and under the
whole-screen test below both are a record index inside a frame, so the payments
screen is that Block composed under `AppShell01` and `PageHeader01`. Had the
payments screen stated the population's total exposure above the list, the
answer would have been a metric summary beside the index and not a wider index,
which is the distinction the previous paragraph is for.

**`api-key-01` belongs to the developer console screen alone, and the excluded
screen does not constrain it.** The in-scope screen is a credential the product
issues, and its job is the whole of it: create it, see it once, revoke it later.
The excluded screen is a credential somebody else issued, stored so the product
can reach a third party, and on its own words the two are not the same job,
because a lifecycle over credentials Prism minted has a reveal-once and a
revocation and a stored third-party key has neither. But the name is free
regardless, for the reason above, so that difference is not what this section
had to settle. **What it does have to name is the decision the collision was
pointing at, and the section below on a credential and secret lifecycle settles
it**: Prism ships no surface whose whole job is holding a secret. The shape of
the in-scope screen is therefore wider than a field specification, since it is a
list, a write and a one-time reveal, and all three are answered by a settled
Item, a settled Item and a `CodeBlock` carrying the caller's own control. No Item
is authored for it and no second name is minted for it.

**What happens to the excluded screen when the agent surface is scoped is
ordinary and is not a resumption of this one.** It returns as a fresh candidate
and is measured by this test against the Item as it stands then, so both answers
are open and either is correct: if by then it is still one job, the Item widens
once and the screen takes the name it already shares, and if it is the stored
third-party credential described above, it is a different job, earns its own
name, and is weighed first against `SettingsIntegrations01`, whose four states
including needs-attention already describe a connected system that wants
something from a reader. What does not happen is a `-02` reserved today for an
Item nobody has authored against a question nobody has answered.

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
- **A value a reader reads is the caller's to write, and a value a machine reads
  is a separate prop for the same fact.** A Page that renders a date, a version or
  a count has two audiences for it and one string cannot serve both: the words a
  reader sees are formatted by whoever owns the fact, because formatting is a
  locale decision, and the machine value rides in an attribute, because a formatted
  string is not what a feed reader or a search engine orders by. Guessing in either
  direction is wrong in a way the reader cannot see, which is the whole argument:
  a wrong date in a `datetime` attribute is a wrong date in someone else's index,
  and a raw `2026-09-26` in the reader's place is a machine value wearing a
  sentence's clothes.
  So the Page renders the caller's words verbatim, and **it refuses the call that
  collapses the two into one**. That is a refusal rather than a note because a
  JSDoc block is read by whoever is integrating the library while a `throw` runs in
  the consumer's own build, and because the failure is invisible to every reviewer
  who does not open the page: all four NaniSoft sites passed one raw ISO string to
  both props, because a prop called `date` that takes a string is not obviously
  wrong. `StackGrid01` refuses its own missing `ownLabel` for the same reason and
  by the same mechanism, and a rule that is only written down is a rule four
  repositories will each read and none of them will be caught by. The refusal is
  on the pair and not on the shape of either value, so a site that writes dates as
  `2026-09-26` is free to: what it may not do is hand the Page no formatting at all,
  and a machine value is already on the element for every machine that wants it.
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

### The whole-screen test, and the Kind each archetype is

**The test is one question: is the archetype the whole screen, or a part of one.**
An **archetype** is a recurring screen shape named by its interaction rather than
by its subject matter. An archetype is not a catalogue Item, and it is not a
Kind. Fifteen archetypes survive the current survey, and each one is assigned
exactly one of Block or Page, or both.

**An archetype is a Page when it is a whole screen and nothing frames it.** A
Page of this kind needs no shell, no breadcrumb and no page claim around it,
because there is nothing for it to sit beside or under.

**An archetype is a Block when the frame and the claim belong to something else.**
The shape can then be placed inside `AppShell01`, beside a sibling region, or in
a drawer, and it is the same shape in each of those places. The test does not ask
how large the shape is, and it does not ask how many screens want it, because a
shape thirty five screens want is still a region of each of them.

**An archetype yields both when its screen form is not its region form inside a
frame.** That is rarer than it looks. It means the archetype is a centred
composition of its own parts, where the parts compose the screen and the screen
composes the parts, and there is no frame to add because there is nothing around
it. One of the fifteen earns it.

**The screen form of a Block archetype is a composition, never an Item.** It is
`AppShell01` for the frame, `PageHeader01` for the claim, and the Block for the
content, and a consumer writes those three lines. Prism does not publish a Page
per archetype in order to save a consumer three lines, because a Page that only
re-lays-out one Block is a second answer to a question the composition already
answers, and two answers that agree are the catalogue growing a second list.

**No archetype is `live`, and that is a decision rather than an omission.** A
`live` surface changes over time without a navigation event, and none of the
fifteen does. The conversation archetype is the one that looks like the
exception, and it is not: its six in-scope screens are queues a reader arrives at
and reads, which is a record index over threads. A thread that grows while the
reader watches is `live`, and those screens are out of scope.

| Archetype | In-scope screens | Kind |
| --- | --- | --- |
| Record index | 35 | Block |
| Metric summary | 23 | Block |
| Record detail | 20 | Block |
| Record write form | 16 | Block |
| Task view | 11 | Block |
| Settings panel | 8 | Block |
| Conversation | 6 | Block |
| Error and status | 5 | Page |
| Identity | 3 | Block and Page |
| Board | 3 | Block |
| Date view | 2 | Block |
| Dated history | 2 | Block |
| Log and event stream | 2 | Block |
| Rehearsal surface | 2 | Block |
| Directory index | 1 | Block |

The counts are the survey's dated figures and they are held in
`docs/admin-screen-survey.md`. The assignment holds whatever they turn out to be,
which is the point of writing a test rather than writing a ranking.

**Record index and record detail are two Blocks, and the split that puts them
side by side is a third.** This does not reopen the split, which is already
decided as a composition Block holding no selection state. Each half is a Block
for the ordinary reason: it renders inside the split, and the split renders
inside `AppShell01`, so the frame and the claim are somebody else's. **Neither
half warrants a Page, and the reason is that a Page would have to own the
selection to be one.** A record detail Page has to know which record it is
showing, which is selection state, which the split gives to the consumer, and a
Page owns no URL. So a record detail Page either holds selection, which is
refused, or renders a shell and waits, which is `AppShell01` and `PageHeader01`
composed and shipped.

**A narrow screen does not promote either half into a Page.** Where the split
drops a pane, the surviving pane is the same Block at full width. The shape did
not change because the breakpoint did, and a rule that changed the Kind with the
viewport would make the Kind a property of a media query.

**Identity is already both, and yields no new Item.** A login, a registration and
a password recovery are one centred credential form, and the form is a Block
while the centred screen around it is a Page. The catalogue already ships both
halves, plus the per-screen field shapes each one needs, so the honest answer
for this archetype is that nothing is missing rather than that something is
planned.

**Error and status is a Page and has no Block half.** A refusal, a loss and a
planned outage each state one thing and offer one route out, and none of them
takes a frame, a sibling region or a claim from anybody. Three of the five are
already shipped as Pages; the maintenance case is the residual, and it is the
same shape with a different stated cause, so it widens the existing Page rather
than becoming a second one.

### What a record write form Block takes as content

**A record write form is a Block that takes a field specification: a typed, ordered description of the fields a reader fills in, from which Prism renders the whole form.** This is the typed-data ruling applied to the archetype, and it inherits it rather than restating it. Prism owns the shape and the vocabulary, the consumer owns the values and the fetch, and a Block fetches nothing.

**`FieldSpec` is the type, and it is one shared type rather than one per Block.** It lives in a module of its own under `packages/ui/src/lib/`, beside `figure.ts` and `rank.ts` and for the reason `rank.ts` gives: two Blocks that each declared their own field type would answer one question twice and disagree about the case nobody thought about, and the first version of a shared type living inside the Block that happened to need it first makes a leaf depend on a composite. It has three parts. `FieldSpec` is one field. `FieldSpecGroup` is an ordered group of fields with a heading and an optional description. `FieldKind` is the closed union naming the input Components this package ships. Every Block that renders a field specification takes these three, so the vocabulary a consumer learns on a record write form is the vocabulary on a settings panel and on a wizard.

**Three things are required on every field, and two of them are required for reasons that reach past this Block.** `key` is the value's own key and never the words of the label, because it is what the consumer's values, its errors and the form's own `FormData` are all keyed by, and a key built out of a label's words breaks the moment the label is translated. `label` is required because a control with no name is announced as a text field, and every field on the page shares that one name. `kind` is required and is drawn from Prism's own input vocabulary rather than from an HTML input type, because `type="email"` is what the platform offers and `Input`, `NumberField`, `MoneyField`, `PasswordField` and `Dropzone` are what this package offers, and a specification naming the HTML type would render a different control from the one the consumer asked for.

**Optional, and each one optional for a stated reason.** `help` is text the reader must have, drawn under the control and referred to it by `aria-describedby`. `hint` is text they might want, drawn in a tooltip, and it is forbidden from carrying anything essential. `placeholder` is drawn in the control and disappears on the first keystroke, so it carries no information `help` does not. `disabled` marks a field the reader cannot fill today rather than one that does not apply. `defaultValue` is the field's starting value, and a controlled field takes its value from the consumer's own state instead. A field whose kind needs more, such as the options on a choice or the rows on a textarea, carries them under that kind.

**Order is the array's order, and the Block never reorders, hides or drops a field.** Every surveyed system with an opinion about order says the order is chosen and has to be defended, and a Block that sorted or filtered its own fields would be defending it on behalf of every consumer that installs it. A field whose value is absent renders empty rather than absent, because a form that changes shape while the reader is halfway through it is a form the reader has to read twice.

**A field always belongs to a group, and a form with no headings is one group with no label.** A group is a heading and an optional description, in that order, because all three of the surveyed systems that have grouping treat the group's heading as a real document-level object rather than a bold row, and because one shape that covers both cases costs a consumer one line and saves the catalogue a second Block.

**A field whose control this package does not ship is a `slot` arm of the union, not a catch-all property.** The caller's own control goes where the control would be, and the Block still draws the label, the help and the error around it, so a field has the same shell whether Prism drew the control or the caller did. This is the direct answer to the sharpest defect the survey found in the one surveyed system that ships a declared field set: its repeatable group renders through render props, and its own documentation says `label` and `error` "can not have best place" there. A slot that keeps the field's shell in Prism's hands does not have that hole, and the union keeps the hole closed rather than relying on this document to be read.

**Validation is the consumer's, entirely, and the specification carries no rule.** No validator function, no constraint object, no schema and no regular
expression. Prism renders the error state the consumer passes and decides nothing about whether a value is one. Requiredness is not validation and stays on the field: `required` is a rendering fact and an HTML fact, so Prism draws the mark and sets `required` and `aria-required` on the control, and it never checks the value against any of them. This is the sharpest line in this section, because a Block ships no behaviour, and evaluating a rule is behaviour. A `validate` function in a Block's props would also make the specification unserialisable, which would take it out of the corpus and out of the store an agent reads, and it would make every Block carrying one a client Component for the sake of a feature the Block was never going to own.

**The error state arrives as an issue list keyed by field, and it is the shape this package already publishes twice.** An entry is a `field` naming a key and a `message` in the product's own words, which is what `FormDialog` and `FormWizard` already take, so the record write form publishes no third spelling of one idea. A message about the submission rather than about a control is separate and names no field, and it marks at most one field, which is the arrangement `AuthForm01` already argues for: telling a reader that two correctly filled fields are wrong is how they learn to stop trusting the rest of the form. What Prism does not offer is free client-side validation, uniqueness checks, cross-field rules or scroll-to-first-error. A consumer who wants them brings a library and passes the results in, and that cost is the price of this ruling rather than an omission in it.

**The caution the survey recorded against declared field sets is answered, and it does not transfer.** One of the six systems surveyed ships a `fields` prop, and its own API page marks it "Not recommended for non-strong demand". That is the only field-set-as-data mechanism in the survey, so it is the closest prior art to this ruling, and it is recorded here as a caution rather than as a contradiction. What the survey found is that the mechanism is documented against because it is coupled to a store: the prop is described as "Control of form fields through state management (such as redux)", and every one of the three defects recorded against it follows from that coupling rather than from the declaration. Validation leaks into the change event, and the FAQ for the change callback firing three times says so. A declared field set cannot carry a label or an error, because the repeatable group renders through render props. There is no group, section or fieldset object in that form API at all. Prism's specification is coupled to no store. The same `FieldSpec` renders an uncontrolled form read out at submit, a controlled form bound to the consumer's state, and a read-only review of a record, and none of those is a second store wearing a declaration's clothes. So the caution lands on the store and not on the declaration, and the part of it that does land is the rule above: the union is closed, which is the answer to a consumer choosing how to declare fields, because the choice Prism grants is which member of a closed vocabulary to use and not what a field may be. The survey is at `docs/research/entity-form-and-master-detail.md`, and the caution is in the record of issue 148 on this map.

**The save control is `type="submit"` inside a `<form>` the Block renders, and the Block never wires a save to a handler of its own.** This is the second arm `scripts/check-block-controls.mjs` already tolerates, and it is the right one for a form, because the activation is the browser's: a form that posts to a URL needs no client module at all, and a form that hands its values to a caller needs one for exactly one reason, which is that a function is state.

**Where the submission goes is a union with three arms, and at least one arm is required.** `action` posts the form to a URL the caller names. `onSubmit` hands the form's values to a function and makes the Block a client Component. `submit` is a slot holding the caller's own control, placed unstyled in the footer, for a caller holding a state machine Prism does not and should not. Each arm forbids the other two, in the shape `HeroLinkAction` and `HeroSlotAction` already establish, so a caller cannot reach a save that activates to nothing and cannot pass a handler beside a form that posts to a URL, and the compiler is what holds that rather than a JSDoc block in another Block. The Block renders no save of its own without one of the three, and it reads the values out of the form at submit rather than holding them, which is `Newsletter01`'s arrangement and the reason a Block that fetches nothing has nothing to keep in step.

**Every other control in a form's footer is either a `CtaLink` with a required `href` or a slot, and never a `Button` the Block wires.** That is the same rule `check-block-controls.mjs` holds over the whole tree, read here at the place where a form has more than one control in it and the temptation is greatest.

**Layout is derived, and the only thing a consumer declares is how many columns the fields sit in.** `columns` is `1 | 2` at the form level and there is no other layout prop. It reads `1` at every width by default, because a form whose field order is a reading order is one column, and because the measure that governs a form is the measure a paragraph wants rather than the width a dashboard wants. Two is the only other value, because two is the only multi-column form layout in which a label can stay above its control, and because a label beside its control wants a column wide enough to hold both and most form columns are not. At the narrow breakpoint it is one column again, which is the Layout section's rule and not this Block's own.

**There is no per-field layout prop and no slot per region.** The survey found a real disagreement here rather than a consensus: three systems keep layout off the field and one puts an orientation on the field itself, and the one place it found a warning against the per-field override is the form guidance of the one surveyed system that ships a declared field set, which says a label's grid props should not be set at all. So layout stays at the form, where the systems that separate content from layout put it. A slot per region is refused for a different reason: it hands the arrangement back to the consumer, and a Block whose regions are the consumer's is a bag of parts with a heading on it. The one slot this Block takes is the submit control, which is a control and not a region.

**A two-column form fills across rows.** The first two fields share a row rather than the first field taking the left column, because column-wise filling breaks the reading order that a screen reader and a keyboard both follow.

**Every record write form in the survey is one Block with a different specification, and none of them is a decision.** The rule is that a screen whose fields do the same job takes this Block, and a screen whose fields do a job the union cannot express takes the `slot` arm or widens `FieldKind` once, for every screen at once. So a create screen and its edit screen are one Block, and the difference between them is whether values arrive, which is a prop rather than a second Item. A screen needing a control this package does not ship passes a slot rather than growing a new Block. A screen needing a control shape nobody else needs adds one member to `FieldKind` and every screen that wanted it gets it. A screen needing a second step is the multi-step question and does not fork this Block to get there. A screen whose form is one of two regions of a screen places this Block beside its sibling rather than growing a two-region Block, which is the composition Block the master and detail split already is. The Block ships no sentence, so no screen needs a copy of it: a screen wanting a claim, an aside or a note passes nodes for them, and there is no per-screen wording for Prism to be right or wrong about. A screen that cannot be drawn from the union and the slots is a screen whose job is not this one, which is the widening test rather than an excuse for a new Item. The number of screens in scope is the survey's dated figure and it is held in `docs/admin-screen-survey.md` rather than restated here.

### What a multi-step record write form is, and who holds the step

**Multi-step is a second arrangement of the record write form archetype, and it is authored beside the plain form rather than taken as a prop on it.** The job-identity test decides this, and the signal that decides it is the arrangement one: a wizard is the write form's version of a board or a split, and the three named arrangements in the naming section are the ones that earned their own archetype name and their own Item. The record is the same record and the fields are the same `FieldSpec` fields, so the two one-job signals are not what settles it. What settles it is that a wizard draws one group of fields at a time, puts a rail above them, and asks a decision the plain form never asks, which is whether this step may be left forwards. One Item could not draw both without gaining the rail, the partition and that decision, so they are two Items.

**The Item is `RecordWizard01`, and the archetype and its count are unchanged.** It is a Block for the whole-screen test's ordinary reason: the frame and the claim belong to `AppShell01` and `PageHeader01`, and the screen form is those two lines plus this Block. It is not a `-02`, and the reason is the one the naming section gives: a `-02` is a second arrangement of one job that a consumer picks between on purpose, while a wizard is not one of two renderings of a write but a property of how many fields the record has, so the second Item's name says what it does rather than carrying an ordinal that predicts nothing. The plain form's own name is not settled by the section above and this one does not settle it. The survey's own open question, which was whether a wizard is a Block that takes a step list as data or a thing the consumer owns whole, is answered on the first half and not the second: it is a Block taking a step list, and the list is not the consumer's whole.

**The step is the consumer's, and this is the same line a Block draws about fetch, about selection and about validation.** `FormWizard` already holds it that way: `current` is required and controlled, `onStepChange` is required, and the rail reads the same number the navigation moves, so a caller is already handing this package the step index as data. A step is a position in an application-owned process rather than a fact about the record, and it is all three things the Block contract names at once. It moves without a navigation event when a consumer keeps it in state. It is gone on a refresh the consumer has not persisted, which is the reason one surveyed system puts the step in the address and the other two are silent about what a refresh costs. And it is wrong on a deep link the consumer's own route produced, where the three causes share one index and want three different sentences. **Neither 148 nor 152 is reopened by this, and neither is what decides it.** 148 draws the line between the shape of typed content and the consumer's values and fetch, and a step index is neither a shape nor a value. 152 leaves every rule to the consumer for the reason that a Block ships no behaviour, and a step is not a rule but the state a rule is asked about. What decides it is the Block contract itself, on the three grounds it already gives for refusing fetch, selection and a second pane.

**A Block renders step N without knowing whether N is reachable, and the answer is that it draws no reachability at all.** Reachability is branching, and branching is the consumer's: one surveyed system names branching and loops as what a per-page pattern buys, and another names a linear relationship between sections, so both arrangements are legitimate and neither is a fact a Block can read off a `FieldSpec`. So the Block draws the step it was handed and the rail that reads one number, and it draws nothing about a step it is not showing: no completed mark beyond the one `Steps` already derives from the index, no disabled step, no skipped step, and no count of what has been answered. The one claim the rail may make is where the reader is, and that is the only claim it makes.

**An index the specification does not contain is bounded, and the bound is Prism's while the meaning is not.** The Block takes the index it was handed, bounds it to the steps it was given the way `FormWizard` already bounds `current`, and draws a real step. Rendering nothing would be a region with no route out, and drawing the nearest step is the one answer that is not a claim about a cause. What Prism will not publish is a state for it, for the argument the empty-pane section makes about a selection Prism cannot render: a step that does not exist, a stale link and a step this reader may not see are one index and three sentences, and a Block that could see only *no step here* would publish one claim about all three. Recovery is the consumer's route, and the route out is the same `CtaLink` with a required `href` a caller composes for any other screen.

**Entered values do not survive a step change inside this package, and the reason is that a Block holds no values.** Only the current step's fields are in the document, so a step that unmounts takes every uncontrolled value in it with it, and there is no draft to restore from because a Block that held the draft would be holding application state. Every field on the stepped arm is therefore a controlled field carrying the consumer's value and the consumer's change handler, which is the arrangement the section above already records for a field whose value arrives from the caller's state rather than from `defaultValue`. The cost is one state object per screen instead of one form, and it is named rather than hidden. A caller who would rather submit per step holds the values itself and posts on the step it chooses to; either way the values are the consumer's from the first keystroke.

**The specification is per-step, and a step is a group, so nothing new is declared in order to hold the steps.** The section above settled that a field always belongs to a `FieldSpecGroup`, that a group is a heading and an optional description, and that a form with no headings is one group with no label. A wizard step is exactly that plus a stable `id`, and the `id` is required for the reason `key` is required on a field: the caller's per-step state is keyed by it, and a sequence whose entries have no identity is a sequence whose saved answers have nowhere to live. One thing is worth taking from what already ships rather than re-deciding: `FormWizardStep.label` is a `string` and not a node, because the rail draws the same word at the width a step gets in a six-step row, so a step's rail label and its own heading are one string by construction rather than two words kept in step by a caller. **One specification sliced by a caller-supplied grouping is refused**, and the reason is that it is the second list: the specification already carries the groups and a step list would carry which groups sit on which step, so the two would be free to disagree about a step's contents and the order rule above would be defending one order in two places.

**Back, the forward control and the rail are `FormWizard`'s, and this Block renders none of them.** Back and the two forward directions are `FormWizard`'s controls and their whole body is a call on `onStepChange`, which is the caller's function, so each reaches a handler without this Block wiring anything. That is the arrangement `DataTable01`'s dismiss uses for the same reason, a control whose body is a call on state the caller already holds, and the reason this one does not draw them again. The rail is `Steps`, an ordered indicator with no opinion about whether a reader may move, so it reaches no handler and needs none; a caller who wants a navigable rail writes `CtaLink`s carrying their own `href`s beside this Block rather than asking this one to become a control that acts. `scripts/check-block-controls.mjs` has nothing to catch here for the reason the section above states for a form's footer: a Block that cannot make a control work should not render one, and this one renders none of the three.

**The stepped arm declares no submission arm of its own, and that is what already ships deciding it.** On the last step the forward control is the form's submit and it reports the last index with the direction `forward`, so the finish signal is a callback the caller is already required to pass and no second prop is needed to name it. `action` is therefore not offered here: that form refuses the browser's own submission because its submit *is* the forward control, so an `action` arm would be an arm that cannot be honoured. The caller's answer for a URL post is the per-step form it composes beside this Block.

**Validation across steps changes nothing in the ruling above, and the reason is that the ruling already covers it.** 152 put every rule with the consumer, left the error state as an issue list keyed by field, and drew one line for a message about the submission rather than about a control: it names no field and it marks at most one. A cross-step rule is a message about the submission, so it is that arm and not a new one, and a consumer who wants a rule about terms not accepted three steps back passes it to the sequence's own `validate` in its own words. What the Block does with an issue naming a key that is not on the step being drawn is nothing, and that is the whole of the cross-step ruling: there is no control on this step for the message to sit under, so it is not drawn, and the Block does not move the reader to the step that owns it, because moving the reader is a call on `onStepChange` and the caller already holds that function. **This is 152 applied and not 152 reopened**, and the sentence that settles it is the one about a message that names no field.

**What it does not own, as a list, for the reason the other archetype sections state theirs as a list.** It holds no step, and therefore no branch, no loop, no skip and no completed set. It owns no progress figure beyond the count of steps it was handed and derives no fraction complete, because a fraction over a sequence whose steps are gated by rules it cannot see is false the moment a consumer skips one. It fetches nothing, so it neither saves a draft between visits nor resumes one. It does not intercept the browser's Back, so what a reader loses by leaving is the consumer's fact and the consumer's warning. It owns no time: no expiry, no autosave, no timeout. It owns no aggregate about the sequence and no arithmetic on a review step's answers. It renders no frame and no claim. And it ships no sentence, because `FormWizard` already requires the back, next, finish, refusal and rail names from the caller for the reason every Block in this package takes them.

**No word is added to `CONTEXT.md`, and the reason is a collision as well as the usual test.** "Step" is already a heading level in this document, at `h3`, so a glossary entry giving it a second meaning under Composition would make a word the ladder depends on ambiguous in the one file that defines both. "Wizard" is already the name of a shipped Component. A step specification is a type name beside `FieldSpec`, and the section above refuses that shape of entry on the grounds it refuses it for a column, a relation and a metric. The archetype is the record write form and it is already named.

### What a record index Block owns, and what it announces

**A record index Block owns row selection, and this is the one piece of state a Block in this repository holds.** The house rule is that a Block ships no behaviour, and the rule is right about what it was written for: a Block fetches nothing, imports no router, and decides nothing about application state. Row selection is none of those three things. It is a set of keys the caller handed the Block for the page the Block is about to draw, the Block holds it, a reader toggles one key, and the Block redraws the tick, the header's three-state checkbox, the count and the announcement from that set alone. Nothing in the announcement reaches past the keys the caller passed. So the Block may hold a value it was given and render a control that toggles that value, and it may not fetch, may not derive from application state, and may not decide. `DataTable01` already declares `'use client'` and already holds this state on its uncontrolled arm, so the ruling extends what is shipped rather than inventing a precedent for it.

**The reason it is the index and not the consumer is that the announcement is a rendering fact, and a rendering fact conditional on a caller having opted in is a rendering fact thirty five screens get wrong.** A controlled-only index is the alternative, and it was weighed: it keeps the Block stateless, and it makes every one of those screens write a store, a select-all derivation, a three-state header calculation and a count before a reader can hear a number, which is the outcome this architecture exists to prevent. Worse, the announcement would then exist only where a consumer had already built the thing that makes it possible, so the one screen with a store would be the one screen that is accessible. The consumer still owns the value: it passes the set, and every change comes back through the same callback whether or not the caller is listening, so a consumer that wants the set mirrored has one line and a consumer that wants nothing has zero.

**What the index owns is the set and the announcement. The action is not, and `scripts/check-block-controls.mjs` is the reason rather than a coincidence.** A batch bar renders `CtaLink` with a required `href` or a slot holding the caller's own control, and never a `Button` Prism wires, because a Block that cannot make a control work should not render a control. So there is no archive button, no send button and no delete button anywhere in this package's selection surface, and the strongest action in the bar is the caller's. The bar displaces the filter controls rather than sitting beside them, which is the one layout decision every surveyed system that has a batch bar converges on, and it is here because a reader who has just asked for forty rows selected does not also want a filter panel competing for the same row.

**Identity is the caller's stable key, never a row's position.** `getRowId` is how a row is named in the set, and it is required rather than optional for the reason one surveyed system states as guidance and another ships as the defect: sorting, filtering, paginating and deleting all move a row's index, so an index-keyed selection silently changes which records a batch action acts on. A reader who ticked four records and then sorted should still have four records ticked.

**What is announced is the count, through one polite live region, and the count is not a list of labels.** The region is `LiveRegion` at its default politeness, which is `polite`, and it is never `assertive`: a selection change is not an emergency, and it fires once per keypress while a reader is arrowing down a column, so an assertive region would interrupt that reader mid-sentence to tell them something they just did. The region is mounted while a selection exists and unmounted when it does not, which is `LiveRegion`'s own empty-case rule doing the work, and its appearance is therefore the first announcement rather than a silent mutation of an always-present node.

**The count rather than the labels, and the row checkbox's own name is the other half.** Every row checkbox carries a name naming its record, in the caller's words, because a checkbox announced as "Select row" on all forty rows is the defect two of the most widely copied systems ship side by side. That name already reaches the reader: ticking a box speaks the record and the new state. What nothing else in the surface says is how many are now ticked, which is the number the batch action is about and the number the visible count in the toolbar is drawing. A list of forty labels spoken into a live region would be a wall of speech the reader cannot act on, so the count is the announcement and the per-record identity stays on the control that carries it. The noun is data rather than a fragment of Prism's copy, in the shape the existing selection summary already takes: one caller-supplied string over the count, so a consumer whose records are invoices says invoices.

**The region is safe without a trick to force a repeat, and the reason is that the count is a function of the selection.** A live region speaks when its text changes, so a reader who ticks a row, unticks it and ticks it again gets "1 selected" spoken twice. The sequence where this would go wrong would be two different selections producing the same text, and two selections producing the same count with the same scope are the same selection for everything the reader can do with it. Nothing has to be cleared and re-set, and no key is needed to make the region speak twice.

**Page scope and filter scope are two different selections and are announced differently, because the accessibility practice for a selectable grid does not distinguish them.** The ARIA Authoring Practices document for a grid specifies `aria-selected` and a key set and says nothing about a count, so a reader following it hears a tick and nothing else, on either scope. Ticking every box on the page selects the page: the region announces the page's count and says the page, because "24 selected" over a table of twenty four rows is true and says nothing about whether there are more. Ticking the control that selects everything matching the current filter selects a population the Block cannot see: the Block holds one page of rows, so it can only announce the scope in words, "all rows matching the current filter selected", and it takes the number from the caller, because the one thing it must never do is print the loaded count as the total. A toolbar reading "12 selected" over a table of twelve rows and four thousand matching is a number that is false, and neither a sighted reader nor a screen reader can detect it. The count is therefore a prop on the filter-scoped arm and is not derived from the rows.

**Emptying the selection is announced, and it is not the absence of an announcement.** When the set falls to zero the region goes with it, and a region that is simply gone tells a reader nothing about why the batch bar disappeared. So the emptying is spoken, at the same politeness, as its own sentence rather than as a count of zero: "0 selected" is a number the reader has already heard at the start of the session and is the least informative thing that can be said at the moment the thing they were about to do has just gone away. The batch bar vanishing is the visible half of that change and the announcement is the half nothing else makes.

**Completion of a batch action is the consumer's, and Prism does not invent a toast for it.** This system already ships `Toast` and already defers to it, so an action that resolves is announced by the caller placing their own confirmation, in their own words, with their own politeness. What Prism owns is the half it can see: when the action completes and the caller clears the selection by changing the selection, the emptying rule fires from the same mechanism and the reader hears the count go to zero without the caller writing a second sentence. When an action fails the caller leaves the set alone, so nothing is announced and the reader is still holding the records they can retry with. Both halves were already documented in the one surveyed system that documents them, and they are recorded here as consequences of the mechanism rather than as guidance copied from it, because the reason they agree is that clearing on success and preserving on failure is what makes the announcement this section defines meaningful at all.

**Row selection and the detail pane's record selection are two different selections, and the law that keeps them apart is that they are counted differently, owned differently and end differently.** The split's selection is one record, and the consumer holds it, expresses it in the address, and the split itself holds none: that is the settled ruling and this section does not touch it. This selection is a set of records, the index holds it, the address does not carry it, and it ends when the bar is dismissed. Conflating them produces a defect in both directions: a split that ticked a row to show which record is open would make a tick a navigation and a batch action a routing decision, and an index that opened a record as a side effect of ticking would make bulk selection impossible, because choosing forty records is not opening forty records one after another.

**The detail pane reacts through the consumer, in one line, and the split holds no bridge.** The index reports every selection change through the same callback whether or not a consumer is listening, so reacting to the selection is a caller's own read of that callback and a pass of the record it wants into the detail pane. Nothing in Prism connects the two panes, and the composition Block is the last place a bridge could be built, which is exactly why it is refused: a bridge that let one pane read the other's selection is the split owning selection state under another name, and issue 149's ruling survives it only if nothing in the tree can reintroduce it. It costs the consumer one line and it costs the split nothing, because a Block that renders an index pane beside a detail pane is still a Block that renders what it was handed.

**The row tick is not inside the row's own control, and `scripts/check-nested-controls.mjs` is the reason.** A row that navigates and a row that is ticked are two targets a reader aims at separately, so the tick is a checkbox in its own leading cell beside the row's own control and never nested inside it. Nesting them would be invalid markup and two tab stops for one apparent action, and the arrangement this section describes is the only one that leaves both reachable.

### What a record index Block takes as content, and what it does not own

**The record index archetype is one Item, and it is the Item that already ships: `DataTable01` widens, and no new Item appears beside it.** The job-identity test above gives one sentence for that, and the sentence is the whole of the answer. Every one of the thirty five in-scope screens is one job, a person scanning rows and acting on them, and what separates one screen from another is which columns, which keys, which filters and which sort key it carries, which is issue 148's typed-data ruling read at the archetype layer rather than a decision taken here. So this is a widening, it is not a second Item, and no `-02` is earned by it, because nothing in these thirty five is a second arrangement of one job that a reader chooses between on purpose.

**The arrangement that would have forced a second Item is the split, and it already has one.** Issue 149 gave the split to a composition Block that holds no selection, the section above records that the index pane inside it is this same Item at a narrower width, and issue 167 settled that the split does not collapse at a narrow viewport and that which pane survives is the caller's composition. A Block that draws an index pane beside a detail pane and knows nothing about either is the arrangement, and it is already authored as one, so it does not fork the index. This is worth stating plainly because it is the question a reader arrives with: the split is where a second Item was expected and the answer is that the second Item already exists and holds no state.

**Three of the thirty five name an arrangement rather than this job, and each is measured against its own archetype's Item rather than folded in here.** A catalogue compared as pictures rather than as rows, a set of renewals laid out as a calendar, and a grid whose cells are edited in place are three of the arrangements the naming section names as saying two jobs: a browsable set, a date view, and an edit surface. A grid edited in place is a write, and this Block's whole contract is that it draws the rows it was handed and reports what a reader asked for, so a screen that wants to type into a cell has not found a record index with one more prop. Each of the three returns as a fresh candidate when its own archetype is authored, and none of them widens this Item. The dated figure stays where the survey holds it; this section is about the Item's interface and not about the count.

**`columns` is a typed specification and it is the same shape of thing as `FieldSpec`, which is why it is one shared type rather than a callback.** A caller declaring a table by passing a render function per column is a caller describing the table in code, and every consumer then reinvents the same six answers about alignment, about truncation, about which side a number belongs on and about what a screen reader is told when a column is sorted. So the columns arrive as data, `ColumnSpec[]`, and the type lives in a module of its own under `packages/ui/src/lib/` beside the field specification for the reason that module states: two Blocks that each declared their own column type would answer one question twice and disagree about the case nobody thought about, and the first version of a shared type living inside the Block that happened to need it first makes a leaf depend on a composite.

**`ColumnKind` is a different union from `FieldKind`, and sharing one would be a defect rather than a saving.** The rule is the same and the two types are still separate, because a field names a control a reader fills and a column names a value a reader reads, and a union carrying both would let a caller ask for a money field as a table cell and receive a control inside a table. What the column union carries is the cell Components this package ships, and one `slot` arm for a cell it does not, on the same reasoning as the field's: the caller's own node goes where the cell would be and the Block still draws the header, the alignment and the sort affordance around it, so a column has the same shell whether Prism drew the cell or the caller did.

**Three things are required on every column, for the reasons the field specification gives and no new ones.** `key` is required and is never the words of the header, because it is what the caller's rows, its errors and a future selection are keyed by. `header` is required because a column a screen reader reaches without a name is a column every row announces as untitled. `kind` is required and is drawn from Prism's own cell vocabulary rather than from an HTML attribute, because `type="number"` is what the platform offers and `Text`, `NumberField`, `MoneyField`, `RelativeTime`, `Status` and `Badge` are what this package offers. Optional and each optional for a stated reason: `help` is text the reader must have and is referred to the cell by `aria-describedby`; `align` is where a number belongs and defaults to the start because Prism does not know the number; `width` is layout and takes a `className` for the same reason `className` is for layout everywhere else; `sortable` says the column can be ordered and draws `TableSort`, whose announcement names the direction it will go next rather than the direction it is in.

**The batch action bar is the Item's job as a region and the caller's job as a set of controls, and that split is the whole of this paragraph.** The region is the Item's because the only thing that decides whether the bar exists is the selection set, which the Item holds and reports, so a caller that owned the bar would be holding a second copy of a fact the Item already holds in order to learn whether to mount something. The controls are the caller's because a Block ships no behaviour, and `scripts/check-block-controls.mjs` is the reason rather than a coincidence: there is no archive button, no send button and no delete button anywhere in this package's selection surface, and the strongest action in the bar is the caller's.

**The shape is one required `ReactNode` the Block places, and there is deliberately no `href` arm and no declared action union.** An `href` arm covers the minority whose batch action is a destination, and a caller whose action is a destination can put a `CtaLink` or a router link inside the slot themselves, so an arm for it would be a second way to say one thing. A declared action union, the shape `SelectionToolbar` already takes at the Component layer, would make this Block own a command list, an order for it, a disabled state for it and a dialog to confirm the dangerous one, and would put Prism's copy in the primary position of all thirty five screens. So the Block draws `SelectionToolbar` and fills the count and the dismiss, and everything inside the frame is a node the caller wrote. The one place Prism does draw a control is the dismiss, and the argument for it is in the next paragraph.

**An empty selection draws no bar at all, and that is a default rather than a prop.** `SelectionToolbar` already states the rule and the reason: it renders nothing when its label is null, because a toolbar for no selection is a row of controls that do nothing, and because a permanently mounted one pays for itself on every page that never selects anything. The Item applies the same rule from the other side, drawing the bar only while the set is non-empty, and it can decide that alone precisely because it holds the set. Nothing is hidden and nothing is disabled: a reader who selects four rows and unticks them gets the announcement the selection section already defined, and the toolbar they were using is the one they get back.

**The dismiss is the one control this Block owns, and it is safe because its whole body is a call it makes on the state it already holds.** A reader who has just asked for forty rows selected has to have one way out that is not untying forty boxes, which is why every surveyed system that has a batch bar puts a clear control at its end. The handler is `onSelectedIdsChange` with an empty set, so it is the same report every tick already makes and the caller's controlled arm clears on it and its uncontrolled arm has nothing to do. That is the whole of the difference between this control and the four Blocks that once rendered a primary `Button` wired to nothing: this one's action is a fact about the Item's own state rather than a claim about what the reader wanted done.

**Per-row actions are the caller's, supplied as a `ReactNode` per row, and the Block draws the trailing cell and nothing inside it.** The shipped shape is the reason, and it is a defect of the kind the block-controls gate exists for one level down: `rowActions` today takes a list of action objects whose `onSelect` is optional, and the Block renders each as a menu row, so a caller who passes a label and no handler gets a focusable, announced control that activates to nothing. That gate read only `Button` and `CtaLink` when this decision was taken, so nothing in the tree reported it, which is exactly the class of defect that survives a full green run; it now classifies `DropdownMenuItem` and `Switch` beside them, so a menu row a Block renders with no handler, no destination and no `render` element is a finding. What the gate reads is the attribute text, so the `onSelect` behind the handler attribute is still not something it can resolve, and the row action list stays a declared optional rather than a required one here. So the declared list goes, and what replaces it is a node per row: the caller composes `OverflowActions` when the row has too many actions for its width, `DropdownMenu` when it has a fixed few, and a `CtaLink` when the action is a destination.

**A row action that navigates is written as a `render` element, which is what `DropdownMenuItem` takes it for.** A menu item that navigates has to be the anchor rather than a button with a link inside it, because a focusable item wrapping a link is two tab stops for one row and a middle click on a row that only looks like a link does nothing. `DropdownMenuItem`'s `render` prop exists for that and `scripts/check-nested-controls.mjs` holds the shape, so a caller writing a navigating row action writes `render={<a href=... />}` and the gate is green because there is no control inside a control. Prism owns none of the menu's behaviour in that arrangement: not the open state, not the typeahead, not the arrow keys, not the Escape handling, all of which are `DropdownMenu`'s and already ship.

**Nothing about the row's own primary control is the Item's either.** A row that navigates is a caller-supplied cell, the same way a per-row action is, and the tick sits in its own leading cell beside it for the reason `check-nested-controls.mjs` gives above. So a row is a set of cells the caller wrote and a selection checkbox the Item drew, and there is no arrangement in which Prism wraps a caller's link in a control of its own.

**What the caller must supply is short, and every item on it is a fact Prism cannot supply for itself.** `rows`, the page of records as typed data, and `getRowId`, the stable key a selection is held by. `columns`, as the specification above. `labels`, every string including the selection summary and the per-row checkbox names, because a name a screen reader reads is the product's word. `onSelectedIdsChange`, required, because a caller that cannot hear about a change cannot pass a record to a pane beside the index. `batchActions`, a `ReactNode`, required whenever the index is selectable. And the page, the sort, the search text and the filter values as the caller's state, with a callback for each: the Item draws the page it was handed and reports what a reader asked for, and `pageCount` is required rather than optional because a paginator that cannot say where it is in the collection is a control that cannot be acted on with any confidence.

**Grouping is a key on a row rather than a second arrangement, and one decision follows from it.** `groupBy` takes a row and returns a group key or nothing, so a caller whose index is grouped by category says so in one line rather than assembling group headers as rows and hoping the Block infers them. A group heading is a row in the same body as any other, which is why this is content rather than a region, and the decision it forces is that a heading is not a record: it is never in the selection set, never in the count, and never what the header's page scope counts, so a body of forty headings over four hundred rows selects four hundred records and says so.

**What the index does not own is stated as a list, because a boundary left implicit is a boundary four repositories will each read differently.** It fetches nothing, sorts nothing, filters nothing and slices nothing: it draws the rows it was handed for the page it was told about, and every control in the toolbar and the footer is a report. It owns no action, batch or per row, and therefore no confirmation dialog, no toast, no retry and no undo. It owns no aggregate about the population, because a total owed across every account is a metric summary beside the index rather than a row in it. It owns no navigation and no address, so it cannot be opened, deep linked or shared. And it owns no second pane.

**Where the split begins is at the edge of the index's own region, and the boundary is the index's props rather than the split's.** The Item takes no detail slot, no selected record and no open handler, and it does not know that it is in a split: the same Block renders full width under `AppShell01` and at half width inside the split, and the two are the same drawing. A caller who wants the pairing composes the split and hands it an index pane and a detail Block, and the selection the index reports and the record the caller put in the address are two facts that meet in the caller's code, which is the one line the selection section above already describes and the reason no bridge is built anywhere in this package.

**No word is added to `CONTEXT.md` for this, and the reason is the test the glossary sets for itself.** A term earns an entry when the library will use the word repeatedly across Kinds and surfaces, and the candidates here fail it. "Batch action" names a thing a caller does and a Block deliberately does not own, so the word would enter the vocabulary as a thing Prism declines rather than a thing it provides. "Record index" is already named as an archetype, and an archetype is survey scaffolding and not an Item name. And "column specification" is a type name in a package rather than a word in a document, beside `FieldSpec` rather than beside `Field specification`, because the glossary entry earns its place by the words readers of the design system use and not by the words a consumer's editor autocompletes.

### What a saved task view is, and what it does not own

**A saved task view is a data instance of the record index, no Item is authored for it, and the archetype it was counted as has nothing left to name.** Applying the job-identity test above to the eleven in-scope screens: could one Item draw both screens, taking different content, without gaining a region, a decision or an arrangement the other lacks? It could, and the Item is `DataTable01`, which already takes everything a saved view needs. The screen form is the three lines the whole-screen test gives for a Block archetype composed as a screen: `AppShell01` for the frame, `PageHeader01` for the claim, and the Block for the rows. The survey's Kind column reading Page on all eleven rows is the customer list case the naming section already settled rather than evidence, and its candidate names `today-page`, `task-view-page`, `task-project-page` and `trash-page` are all answered by that one answer.

**The three signals, and only the second carries the weight.** The record is the same thing on every one of the eleven, a task, and on its own that decides nothing. The difference is content rather than structure: which columns, which keys, which filter values and which sort key, which is issue 148 read at the archetype layer and inherited rather than restated. The reader's decision is the same one in all eleven, which of these do I act on, so the same arrangement answers all eleven. **What would have said two jobs is an arrangement, and none of the eleven names one.** Work projects is grouping, and grouping is a key on a row, settled in the record index section as content rather than an arrangement. A week of tasks laid out as days would be the date view's Item and tasks as cards ranked inside a state would be the board's, and neither is among the eleven. The eleventh row is Section E's `tasks`, which asks for the work other people have been asked to do, so the group key is the person holding it and `groupBy` answers it; the survey's nearest Item there is `MemberList01`, which is a set of people rather than the work they hold.

**The rule is a set of filter values the consumer holds, and so are the words for it.** There is no rule language in Prism: no `savedViews` prop, no view specification, no member for `today` or `upcoming` or `important`, and no grammar in which to write one. The reason is the one `EventSpec` gives for itself: an enumeration of what a product calls a narrowing is that product's vocabulary, and a member on a Prism type would be promising that every consumer's rules are these. What the index takes is what it already takes, `filters`, `filterValues` and `onFilterChange`, plus the caller's `labels`, and the name of a view is a `labels` string and usually the `PageHeader01` claim above it. **The index evaluates nothing.** It draws the page of rows it was handed and reports what a reader asked for, so a rule is applied before the fetch, in the consumer's own store or query, and the rows that arrive are already its result.

**Persisting the view is the consumer's, and the answer is refused rather than merely absent.** A Block never fetches and a Page never imports a router or a data client, and a saved view would add a second thing for Prism to own, which is storage. So there is no `localStorage`, no cookie and no view record, and a consumer whose views survive a reload holds them in its own store and hands the index the values on every render. The word saved describes the consumer's store and not this Block, which is why the interface below is described as a narrowing rather than as a saved anything.

**The index holds no clock, so a `today` view left open is the caller's fetch and not a Block that has gone stale.** Whether a row belongs to a set is a fact about the rows, and the rows are the caller's; a view opened before midnight and still open after it shows the membership it was handed until the caller hands another page. The alternative is a timer that redraws rows Prism never fetched, and a Block that decides when its own content is out of date is a Block deciding. `RelativeTime` draws a moment in the reader's own locale and says nothing whatever about whether that moment belongs in the set, which is the split the composition layers section draws between the words a reader sees and the value a machine reads.

**The number that matches the rule is the caller's, and issue 166's filter scope ruling earns its keep here.** The page scope is the one count the index can make, because it holds the page. How many tasks match `today` is an aggregate over a population Prism never fetched, so it arrives as a caller supplied number and is announced as it was passed rather than counted from the rows on screen.

**Trash is not a rule, and it is the one of the eleven that differs in kind rather than in content.** A filter hides rows out of a set that is still there, and clearing it brings them back. A deleted record is not hidden: it is gone from the live set and recoverable only by being restored, so the trash screen is not a narrowing of that set but a different collection the caller chose to fetch, and it differs by what clearing means rather than by what is drawn. **Nothing about the Item changes.** The same rows, the same columns, the same selection and the same batch bar serve both, because the difference lives entirely on the caller's side of the fetch. Restore is a per row node and a batch action in the caller's own controls, for the reason the record index section gives for every command.

**The trash difference does need a fourth empty state, and it is a fourth reason on `EmptyState01` rather than a fourth Block beside `NothingChosen01`.** Ten of the eleven are already answered by `no-match`: things exist and the reader's own narrowing removed all of them, which is exactly what a view that matches nothing says.
Trash fits none of the other three. Not `first-run`, because records have existed in that region and the reader's own 
earlier action moved them out of it, and because that reason's action is to make the first one, so a create control 
beside the bin a reader has just emptied is a control that invents work the reader does not need. Not `no-match`, 
because nothing was filtered: the records are not on this side to be filtered, so the sentence would be false. Not 
`not-permitted`, which says nothing here is wrong. **It belongs on the same Block rather than beside `NothingChosen01` 
because it is a statement about a collection, which is what every reason on that Block is**, so the frame they 
share stays honest: there is nothing here to read, and the frame carries no claim about why. The contrast with the empty detail pane is the whole of the difference between the two answers. Nothing chosen is a statement about a reader's pointer at a record while a readable index sits beside it, so its shared frame would have had to become a lie beside a full table and it needed a Block of its own. A bin the reader emptied has no readable neighbour and no frame problem. Ink stays absent for the reason `EmptyState01` gives: nothing here is broken, nothing is missing and nobody is blocked.

**The member names the cause rather than the collection, and authoring it is a separate ticket.** A 
reason is a machine value and never reader facing text, so the decided name is `emptied-by-reader`: the reader's own 
action is what this region is empty of, which is a fact about how the set came to be here rather than a claim about 
what may be seen. It takes the caller's `title`, an optional `body` and no action, because a reader who has deleted 
nothing has nothing to restore and the next step is in another region. Adding it to `EMPTY_REASONS` changes a 
published union, so it is authoring work this document does not do; what is settled here is that it is a fourth reason 
and not a fourth Block. **It has since been authored, under the name this paragraph settles and to the shape it 
settles, and the two paragraphs under the authoring disposition below are its record.**

**`Todo01` is measured against this Item rather than merged into it, and the direction of the test is the reason.** Could `DataTable01` draw both a saved view and the plain run of tasks `Todo01` draws? Yes, as one page of four columns with nothing selected. Could `Todo01` draw a saved view? No, and the reasons are regions and decisions rather than looks: the screen has a filter region, a sort key, a page boundary and a batch bar that the plain list draws none of, and its row shape is fixed inside the Block where a saved view chooses its columns per view. So the Item for the archetype is the index, and `Todo01` keeps its Item as the second arrangement over the same records. It is not folded in because its `Progress` bar is an aggregate about the population, which composes as a `MetricSpec` beside the index rather than inside it, and because a consumer with twenty tasks and nothing to page through has a screen the index draws worse.

**The survey's nearest Item column is not evidence across the eleven, and the reason is the collision the naming section describes.** `Todo01` is the right Item for `all tasks` and, for the other ten, one name has been carried down eleven rows of a single archetype, which is a symptom of a decision not taken rather than ten screens wanting one Item. What is settled here is the disposition and not the deprecation: nothing is authored beside `DataTable01` on the strength of a product calling its records tasks, and whether `Todo01` is retired is an authoring ticket's work under the catalogue discipline.

**The archetype table keeps its row and no count is edited.** `Task view | 11 | Block` stays, for the same reason the log and event stream row stayed when that archetype moved onto the record index: the table holds the figures `docs/admin-screen-survey.md` holds, and a disposition is recorded in prose rather than by moving a number between two rows. The record index is not restated as a larger number for the same reason, so the eleven are counted where the survey counted them.

**What a saved view does not own is the record index's list with two entries added and none removed.** No data, because it fetches nothing and evaluates nothing. No rule, and no name for one. No persistence, so a view is not something this package can reopen, and reopen is the test that would have made it real: a view Prism stored would be a view Prism had to migrate, and a migration is a promise to four repositories that nothing here makes. No address, so a saved view cannot be linked, shared or bookmarked, and the words a reader would put in the address are the consumer's. And no clock, no restore, no aggregate and no second pane, for the reasons the paragraphs above give.

**No word is added to `CONTEXT.md`, and the reason is the one the record index and log sections give.** "Saved view" names a thing the consumer holds and Prism declines to own, in the shape of "batch action" and "retention" and "archive". "Task view" is a survey archetype name, and an archetype is survey scaffolding rather than an Item name, so the phrase retires with the archetype it named. And "view rule", "rule" and "filter expression" would enter as a query language belonging to a consumer's data layer, which is the one thing Prism states it never evaluates.

**Where the authoring work lands: no catalogue entry, no new Item, no new prop and no new Kind.** A consumer with any of the eleven writes `AppShell01`, `PageHeader01` and `DataTable01` with the columns, the labels and the filter values for that view, and `catalog.ts` is untouched. The only authoring consequence is the fourth member on `EMPTY_REASONS`.

**The fourth member is authored, and the union is the artefact.** `EMPTY_REASONS` is `['first-run', 'no-match', 'emptied-by-reader', 'not-permitted']` and `EmptyReason` is its member type, both published through `@nanisoft/prism-ui/blocks/empty-state-01` alongside the Block. The member carries no ink, for the reason the paragraph above settles, and it adds no render branch at all: the Block already renders no control without an `actionLabel`, so a caller naming this reason and passing no label draws exactly the same frame the other three share. `REASON_INK` is unchanged and `scripts/check-block-controls.mjs` is green on the source for the reason that has been true since the Block shipped: the only control in it is the `Button` behind `actionLabel`, and the fourth reason reaches no new one.

**This is a value on an existing exported union and not a catalogue row, and the seam says which.** `check-catalogue.mjs` resolves its roots from `src/blocks`, `src/catalog.ts`, `registry.json` and `package.json`, and an Item is a Component, Block, Page or live entry with a slug, a page, a Demo and a corpus entry. A member of `EMPTY_REASONS` has none of those and cannot grow any, so `catalog.ts` holds the same number of rows it held before, and the four reasons are published as a type rather than as an Item. `check-spec-unions.mjs` does not reach it either, and that is a real limit rather than a reassurance: that gate reads `dist/lib/spec.d.ts` and `dist/catalog.js` because its subject is the specification module's closed unions, and `EmptyReason` is not one of the three it holds. It would be a defect to move the reason there to be covered, because a reason naming a cause is Prism's own vocabulary rather than a Component this package ships, which is what those three unions are made of, and `RelationKind` is where a collection arrangement that is not a Prism Block belongs. The reason is held by its own tests and by this document instead.

### What the empty detail pane is

**The pane renders at every selection state, and what it holds before anything is
selected is content the caller passes, so Prism's contribution to this state is a
Block and not a branch.** The split holds no selection state, which means it
cannot know whether it is in this state, and a Block that cannot know a thing
cannot default it. So the resting pane is one of two things: the `ReactNode` the
caller placed in the detail slot, or nothing at all, because the caller chose an
arrangement that has no resting pane. There is no third case, and in particular
the split ships no fallback sentence, no frame of its own and no loading mark.

**This is a fourth named empty state, and it is a new Block beside `EmptyState01`
rather than a reason on it.** The four reasons `EmptyState01` takes are
answers to one question: what happened to the collection this region would have
drawn? Nothing has ever existed in it, the reader's own narrowing emptied it, the
reader's own earlier action moved every record out of it, or this reader may not
see it. Each is a statement about a set, and the frame the
Block shares across all four is the assertion that follows from them together:
the dashed edge and the floor under it are there because all four mean *there is
nothing here to read*. Nothing chosen is not that. No collection has been
emptied, narrowed or hidden; the records are right there in the index beside it,
and what is missing is the reader's pointer at one of them. A reason here would
have to keep that frame honest by claiming this region has nothing to read while
a readable region sits next to it.

**The split holds because the neighbourhood holds, and `emptied-by-reader` is what
shows it most sharply.** The fourth reason on the other Block has the same frame
and the opposite neighbour: a bin the reader emptied has nothing readable beside
it, so *there is nothing here to read* is true of it and the reason belongs beside
the other three. This pane has a full index a few centimetres to its left, so the
same frame is a claim the reader can watch fail. The difference between the two
answers is therefore not which is truer and not which is older; it is what each
one is a statement about.

**A union with one member the caller must still name is a constant with a type,
and that is the shortest statement of the whole difference.** The `reason` prop
exists so a caller chooses between causes that want different words and different
actions. Here there is one cause, it is not a choice, and every caller would pass
the same member, so the arm would encode a fact rather than describe a decision.

**The Block is `NothingChosen01`, and what it does not draw is half of what it
is.** It takes the caller's own `title`, an optional `body` under it and an
optional `icon` slot beside it, drawn `aria-hidden` for the reason `EmptyState01`
draws one. It takes no action, and `scripts/check-block-controls.mjs` is the
reason rather than a coincidence: the next step in this state is in the other
pane, so a control here is either a `Button` Prism wires or a second copy of an
affordance the index already draws. It takes no height floor either, and that one
is the composition's business rather than the Block's, because a pane in a grid
is already as tall as its neighbour and a `min-h` authored for a page region
would be a second answer to a question the split's tracks have answered.

**Emphasis belongs in the pane's content and not in the index's width, and the
reason is about the hand rather than about the design.** The instinct when a
detail pane is empty is to widen the index and let the pane go, which is a layout
decision, and it is refused: a split whose tracks change ratio when a row is
clicked moves the list out from under the hand that clicked it, and the first
click is the one a reader is most sure about. So the tracks hold their ratio at
every selection state. What changes is content, and content does not need the
help: forty rows beside one sentence is not a competition, and a caller who wants
the index louder makes the index denser, which is the index's own decision to
take rather than one the split takes away.

**Neither escape is available to Prism, both are available to the caller, and the
distance between those two sentences is the whole of this section.** One
surveyed system removes the pane from the resting state by making it an overlay
that does not exist until it is asked for, and states in its own guidance that
its items carry no selected state at all. Another navigates to a separate details
page, where a page has a record in it or is not rendered. Prism cannot take either
as a default. An overlay's only state is whether it is open, and whether it is
open is which record is open, so an overlay is selection state under another name
and issue 149's ruling survives only if nothing in the tree can reintroduce it. A
details page needs a route, the route carries the record, and the route is the
consumer's. What is left after both is a state Prism cannot default away and
cannot hand back, so it has to be named, and this is the naming.

**The one escape inside Prism's reach is selecting the first record
automatically, and it is refused for one reason stated three ways.** It makes
the split choose, which is the selection issue 149 gave to the consumer. It puts
a record in a pane the reader never asked for, so their first click is a no-op in
a surface where it looked meaningful. And it makes the address wrong the moment
anything else moves the set, because the record came from a row's position rather
than from the reader. A reader who has opened a screen in order to decide has not
decided yet, and a system that decides for them has taken the one thing the
arrangement was for.

**A narrow viewport does not raise a new question here, and the reason is that the
split is not the arrangement a narrow viewport wants.** The whole-screen test
above already holds that a narrow screen does not promote either half into a Page
and that a surviving pane is the same Block at full width, so the Kind is
settled. Which pane survives is not, and the answer is not the split's to give:
a Block that dropped a pane by media query would have to decide which one to
keep, and the decision is which pane has something in it, which is selection
state read by a Block that holds none. So the split does not collapse. It renders
two panes at the width it is given, and the narrow arrangement is a composition
the caller writes: the index alone under `AppShell01`, and the record as its own
screen, which is the routing escape above used at the width where it is right. In
that composition there is no resting detail pane, because there is no detail
region to rest in, and that is the cheapest resolution of this state available
anywhere: a screen with no detail pane has no detail pane to be empty.

**A selection that points at a record Prism cannot render is the consumer's, and
Prism draws no state for it in the pane.** Three causes share one address and
want three different sentences: the record is gone, the record exists and this
reader may not see it, and the fetch failed. They differ in words, in tone and in
whether there is a route out, and a Block that could see only *no record here*
would publish one claim about a cause it cannot distinguish.

**It is not an empty state, and the reason is that every reason would be false
except the one that is a caller's answer already.** Nothing chosen says the reader
has chosen nothing, and they have. First run and no match say a collection is
empty, and this one is not. Not permitted is the one that can be true, and where
it is, `EmptyState01` at that reason is the right Block, drawn by the caller in
the caller's words, which is the arrangement every other state in this section
already takes.

**It is not error and status either, and the reason is the whole-screen test
rather than a preference.** Error and status is a Page because a refusal, a loss
and an outage take no frame, no sibling region and no claim from anybody. A
record that cannot be rendered inside a split has all three, and it is one pane
of a screen that has thirty other records to show beside it. Promoting it to a
Page would either lose the index or make the Page know which record it failed on,
which is the selection state again, and the Page that would have to know it is the
one Page this repository has already refused to author.

**So the detail slot is a required `ReactNode` and it is the caller's answer in
every case, including these.** An `Alert`, a `CtaLink` back to the index, or the
error Page composed into the split are all compositions rather than defaults, and
the split renders none of them by default because a default is a claim Prism
cannot support, and a region drawn with nothing in it is the defect this section
exists to prevent.

**The one Prism state a caller places in that slot by name is `NothingChosen01`,
and it is authored rather than left to prose.** A caller who wants the resting pane
to say so rather than render nothing composes this Block into the detail slot, so
the content of the resting pane is a composition the caller makes and the Block it
composes is named in the catalogue beside `EmptyState01` rather than in this
paragraph alone. Its interface is the three sentences above taken literally: a
required `title`, an optional `body`, an optional `icon` slot drawn `aria-hidden`
for the reason `EmptyState01` draws one, and nothing else. There is no `reason`,
because the paragraphs on the union already settled that one cause is not a
choice; no action, because `scripts/check-block-controls.mjs` has nothing to catch
in a source that contains no control and an auditor checks for the absence; no
frame and no height floor, because a pane in a grid is as tall as its neighbour and
a dashed edge beside a full index is the claim this section exists to refuse. So a
green run of that gate on this Block is not evidence of anything, which is the
honest reading of a Block whose whole shape is four absences.

**No word is added to `CONTEXT.md` for it, and the reason is the test the glossary
sets for itself.** "Nothing chosen" names a state rather than a thing the library
draws, and the word a reader of a screen says about it is that product's: "pick a
project", "choose a customer", "select an invoice". The concept is already in the
vocabulary as the split's resting pane, and adding a second entry for the Block
that draws it would put a catalogue entry into a glossary of words.

### What a record detail Block takes, and what it does not own

**A record detail is a Block, and the reason the whole-screen test gives for the
archetype as a whole is also the reason it holds for the detail specifically: the
frame and the claim belong to somebody else.** A detail screen is `AppShell01` for
the frame, `PageHeader01` for the claim, and this Block for the record, so the
shape is the same Block at full width under the shell, in a drawer, and in the
detail pane of the split beside the index it belongs with. What makes the answer
stronger here than elsewhere is the one the survey did not see: a detail is the
half of an archetype whose identity is *which record*, so **a record detail Page
would have to own the selection to be one.** A Page owns no URL and imports no
router, so a Page that knows which record it is showing has to be told, and being
told which record it is showing is selection state, which issue 149 gave to the
consumer and which the split itself holds none of. So the two answers are the same
answer: the detail Block is handed a record, the consumer put that record in the
address, and nothing in this package can reopen the question. **It is not both,
and the test that decides that is the same one every other Block passes.** The
detail earns nothing by being centred in a viewport, because a centred screen
would still take its shell and its breadcrumb from a caller, and a composition
that takes both of those from a caller is not a Page. The narrow viewport raises
nothing, for the reason the whole-screen test already records: the surviving pane
is this Block at full width, and the Kind is not a property of a media query.

**`Summary01` and `QuickView01` are two different jobs, and a record detail is a
third, so the archetype's Item is authored beside both rather than by widening
either.** The job-identity test asks whether one Item could draw both screens
taking different content, and it cannot, on two counts that are visible in the two
Items' own JSDoc rather than in this section's reading of them. `Summary01` is a
set of priced lines and their total: it exists to add up, it closes on a required
total, and its three line states are positions a line can hold relative to a set of
entitlements. A record detail never adds up; a total about a record's related
lines is a figure the record does not own, and where a screen wants one it composes
`Summary01` inside the detail rather than becoming it. `QuickView01` is a panel
inside a `Dialog` the caller opens and closes: its whole surface is a transient
overlay with a close control and a law of its own, that nothing it shows may live
only inside it. A record detail is the opposite of transient, it has no close
control, and everything it shows is allowed to live only there because there is
nowhere else it lives. So neither neighbour is a widened record detail, and
neither is a narrowed one: this is the case the naming section means when it says a
collision is a symptom, because the collision here is real and the missing
decision was the archetype's own content, which the paragraphs below state.

**The Item this archetype produces is `RecordDetail01`, and it is one Block
covering every screen in the archetype.** The name says what the thing does, in the
same way `DataTable01` says what the record index does and `EmptyState01` says
what an empty region says, and it is not a subject matter: an order, an invoice, a
project, a customer and a subscription are five products' words for one job, and a
name that carried any of them would be a name twenty screens have to lie about.
The archetype names in `docs/admin-screen-survey.md` are survey scaffolding and
`CONTEXT.md` says so, so nothing here renames the survey's archetype into the
catalogue; what this section settles is the shape, and the authoring ticket adds
the entry. **`IssueDetail01` is measured against this Item rather than merged into
it, and the honest reason is its name.** It is the same job, the survey's one
COVERED row says so, and it already draws most of what a record detail draws: a
key in the mono face, a state as a tone beside the caller's own words, declared
fields, a body and a thread in the caller's order. But `issue-detail-01` is wrong
the moment the record is an invoice, and the naming law says a name that has to be
wrong about nine tenths of its uses is a name that fails the test that its name
survives being wrong. So the disposition is a deprecation rather than a second
Block, because two Items that both draw one record in full is a second list, and
the deprecation is the authoring ticket's work rather than this one's. What is
settled here is that nothing is authored beside `RecordDetail01` on the strength of
a product calling its records issues.

**Relationships are a declared section with a typed specification, and the
specification is a shared type in the same module as the other two.** Prism owns
the shape and the vocabulary and the consumer owns the values and the fetch, which
is issue 148 read at the archetype layer and inherited rather than restated. The
type is `RelationSpec`, it lives in `packages/ui/src/lib/` beside `FieldSpec` and
`ColumnSpec` for the reason those two give, and `RelationKind` is the closed union
naming the collection arrangements this package can already draw: a set of rows, a
set of rows in a panel, a run of events, a set of people. **It is not a slot per
region, and the survey's answer is why.** Every surveyed screen that wanted one
relationship per card turned the detail into a grid of equal panels, each with its
own heading, its own frame and its own way of asking to be read, and the result is
a page of cards that happen to share a parent rather than one record with things
attached to it. That is the failure this ruling exists to prevent, and it is
prevented by the declaration rather than by restraint: a relation is an entry in
one ordered list on one frame, drawn with one heading level, one rule and one
bounded region, so a record with four relationships and a record with one read the
same way. `FieldSpec` is not reusable for it, and the reason is the same one that
keeps `ColumnSpec` a separate union from `FieldSpec`: a field names a control a
reader fills, a column names a value a reader reads, and a relation names a
collection of other records, so a union carrying two of the three would let a
caller ask for a field where a relation belongs and receive a labelled input
inside a record. What a relation carries is a stable `key`, the caller's `label`
for the collection, the `kind` from the closed union, an optional `href` on the
heading for the caller who wants a destination from the section rather than a
scroll, and an optional count that is the caller's own string rather than a number
the Block derived, for the reason the index section gives: a count the Block
computed over the members it happens to have been handed is a number that is false
the moment the collection is larger than the page.

**Nesting depth is one, and the bound is in the type rather than in a convention.**
A relation holds members, and a member is a row, a person, an event or a node in
the caller's own typed data, never another relation. That is what keeps a detail
from recursing into a page, and the reason a record's own relationships cannot be
reached by descending is that a descendant is reached by a link rather than by
depth: the member carries a `CtaLink` with its required `href` when the caller
wants to open it, and the destination is the caller's route. A record whose
related records have their own related records is therefore a graph the consumer
walks and this Block draws one ring of, which is the difference between a detail
and a browser, and it is the same boundary the split draws when it renders two
panes rather than following every record the first one points at. **Every relation
is drawn open, in the order the caller declared, and a relation a reader should
have to ask for is a `slot` member rather than a collapsed one.** The Block
composes `Collapsible` nowhere, because a disclosure is a control and a control in
a Block is the finding `scripts/check-block-controls.mjs` exists to catch, and
because a relation that is behind a disclosure is a record the reader has to
choose to find, which is a claim about the reader's freedom that the architecture
above holds a Page out of making.

**Actions are placed against the record, in the record's own band, and they are
the caller's node.** The reason for the placement is that the record's actions and
the screen's actions are different actions, and they are in different places: what
the screen can do to itself is stated by `PageHeader01`, and what can be done to
this record is stated beside the record's identity, so a reader who has been
reading one record for a minute is looking at the actions of that record rather
than at a row of controls at the top of a viewport. The reason the placement is
inside this Block rather than left to the page header is the split: a detail in the
detail pane has no page header above it, so a detail that took its actions from
one would have no actions at all in the arrangement the archetype most often
appears in. **The prop is one optional `ReactNode` the Block places, and the Block
renders no control of its own, which is what `scripts/check-block-controls.mjs`
requires.** A rendered `Button` or `CtaLink` carrying none of a handler, a submit
type or an `href` is a finding, so there is no edit button, no archive button and
no delete button in this Block, and the strongest action beside a record is the
caller's. There is deliberately no declared action union and no `href` arm, for
the reason the batch bar gives: a caller whose action is a destination writes a
`CtaLink` or a router link in the slot, and an arm for it would be a second way to
say one thing, while a union would make this Block own a command list, an order for
it, a disabled state for it and a dialog to confirm the dangerous one, which is
the caller's state machine and the caller's words. The one control a caller needs
and Prism cannot supply, the confirmation for a destructive action, is an
`AlertDialog` composed around the caller's own control inside the same slot, so the
confirmation is as much the caller's as the action it confirms. There is no cap on
how many actions are placed, because a slot cannot be counted, which is the
argument `QuickView01` makes for its own two.

**A relation with nothing in it is `EmptyState01` at a reason the caller names,
and not `NothingChosen01`.** Every one of that Block's four reasons is a
statement about a collection, and a relation with no members is exactly that: a
customer with no invoices, an order with no payments, a project with no people are
all collections that are empty, narrowed, emptied or hidden from this reader, and
all four are the answers `EmptyState01` was drawn for. Nothing chosen is a statement
about the reader's pointer at one of the records in the index beside the pane,
which is a state this Block cannot be in, because a Block holding a record was
given the record and the giving is the selection. So a relation declares its own
empty words and draws them in the relation's own frame, at the size of the
relation, and a detail whose record itself cannot be rendered is the caller's
answer for the reason the empty-pane section states: Prism cannot distinguish a
record that is gone from one this reader may not see from one whose fetch failed,
and publishing one sentence about a cause it cannot see is the defect that
sentence would be.

**What a record detail does not own is stated as a list, for the reason the index
states it as a list: a boundary left implicit is a boundary four repositories will
each read differently.** It holds no selection state, so it cannot know which
record it is showing, cannot default to one, and cannot sort or filter what the
consumer hands it. It fetches nothing, and it reads the record it was given
rather than asking for one by key. It owns no ordering, no paging and no filtering
of its relations, because the order a caller declared is the order it draws. It
owns no aggregate, so no total, no count and no sum over anything it displays, and
a screen that wants one composes `Summary01` or `Stats01` inside the detail rather
than asking this Block to keep a running total. It owns no navigation and no
address, so it cannot be opened, deep linked or shared, and the links out of a
detail are the caller's `href` on the relation heading, on a member and on its
own actions. It owns no edit state, so a record write form is a Block composed
beside or below this one and never a mode of it, and the two never swap. It owns
no confirmation, no toast, no retry and no undo, and it owns no second pane, which
is the split's job and is a composition Block that holds no state to lose.

**No word is added to `CONTEXT.md` for this, and the reason is the same one the
index section gives.** A term earns an entry when this library will use the word
repeatedly across Kinds and surfaces. "Relationship specification" is a type name
in a package, beside `RelationSpec` rather than beside `Field specification`,
because the glossary entry earns its place by the words a reader of the design
system uses and not by the words a consumer's editor autocompletes, and the three
specifications are one idea at three layers. "Record detail" is already named, as
an archetype, and an archetype is survey scaffolding rather than an Item name. And
"record-scoped action" names a thing a caller does and this Block deliberately
does not own, so it would enter the vocabulary as a thing Prism declines, which is
what the index section refused for "batch action" and what this one refuses here.

### What a metric summary Block takes as content, and what it does not own

**The metric summary archetype is covered, and it is covered by the Item that
already ships: `Dashboard01` widens and no new Item appears beside it.** The survey
calls this archetype largely COVERED by existing Items and then says the judgement
has not been tested against the roster, so the test is the one the job-identity
section above states, applied to the twenty three rows rather than to a pair of
them. Every one of those rows is one job: a reader opens the screen to read a small
number of figures about a population, with the comparison the caller made beside
each figure and the supporting detail underneath. What separates an ecommerce
dashboard weighted toward money from one weighted toward stock is which figures
appear, in what order, over what period, and which panels sit below them. Every one
of those is content rather than structure, so one Item draws all twenty three and a
consumer with two of them writes one line. No `-02` is earned, for the reason the
record index section gives: nothing here is a second arrangement of one job that a
reader chooses between on purpose.

**`Dashboard01` is that Item, and the evidence is in its own props rather than in
this section's reading of them.** `metrics` is the row of figures, and each entry
already carries `delta` with the sign as the direction, `deltaFormat` for the
caller's own units, `hint` for the period or the caveat, `series` with a
`seriesLabel` required wherever the series is set, and an `href` with its required
words. That is the archetype's whole description, a small number of figures with
trend and context above supporting detail, declared field by field before this
ticket existed. Below the row, `panels` is a list with a span on each entry, which
is what the supporting detail is, and `rail` is the narrow column a pipeline or an
estate wants beside it. The Block's own JSDoc gives the reason it holds no opinion
about the arrangement, and it is the reason this archetype is cheap: four NaniSoft
products want four arrangements and every one of them is right for its own screen.

**Three other rows of figures are measured against it rather than merged into it,
and the reason is a disagreement a reader would see rather than a difference in
subject matter.** `Trend01` is a ranked list of readings with a shape beside each
one, which is a list rather than a summary, so it stays where it is and a summary
whose figures want their shape beside them composes it into a panel. `Stats01` is
the same job as the `metrics` row with less of it declared: its `delta` is
documented as a percentage change and the Block appends a percent sign to the
number, which is the one guess `Metric` refuses to make for the reason its own
JSDoc gives, and it carries no series, so the trend the archetype names has
nowhere to go. `ProjectDashboard01` declares its figure type separately and says on
purpose that a dashboard figure and a detail header field are different claims,
which is a sound reason, and the same reason the record index section gave for
declaring its own column type; the consequence is what settles it. Its figure type
has no `deltaFormat`, and the Block's own JSDoc admits the result: a figure with a
delta and no formatter prints the number itself, which is honest and usually not
what was wanted. So the same consumer, reading two dashboards built out of this
package, sees a formatted change on one screen and a bare `0.12` on another, and
nothing in the tree reports it. The disposition of those two Items is the
authoring ticket's work, as `IssueDetail01`'s is in the record detail section. What
is settled here is that neither of them is evidence for a third.

**A metric is a figure about a population, which is what makes it a typed value of
its own rather than a field with a different name.** Issue 148 settled that Prism
owns the shape of typed content and the consumer owns the values and the fetch, and
the line between a field and an aggregate is the line this archetype sits on: a
balance on one row is a field, and a total owed across every account is a metric.
So a metric is a reading taken over a population Prism never saw, stated as one
figure with the comparison the caller made beside it. It is not a field, because
nothing in it belongs to one record, and it is not a record, because there is no
record to open and no address to put one in.

**`MetricSpec` is warranted, and the evidence is a count.** Five shapes are declared
today across this package: `Dashboard01Metric`, `ProjectDashboard01Figure`,
`ChartCard01Reading`, `Trend01Item` and `Stat`. Five declarations of one typed value
is the failure each of the three specifications in `packages/ui/src/lib/` was
created to prevent, and it is not hypothetical here, because the five already
disagree about whether a delta is a number or a percentage, about `deltaFormat`,
about `hint`, and about whether a series and its name are part of a figure at all.
The type belongs in that module beside `FieldSpec`, `ColumnSpec` and
`RelationSpec`, for the reason the module gives: the first version of a shared type
living inside the Block that happened to need it first makes a leaf depend on a
composite, and a consumer who learns one shape on a summary is owed the same shape
on a project dashboard. It is a fourth specification and not a fourth union, and
the reason is the one `RelationSpec` gives for itself: a field names a control a
reader fills, a column names a value a reader reads, a relation names a collection
of other records, and a metric names a reading over a population, so a union
carrying two of them would let a caller ask for a field where a metric belongs and
receive a labelled input under a figure.

**The metric summary Block is the first consumer of that type, and the expansion is
recorded here rather than left to the code.** `Dashboard01.metrics` is a
`MetricSpec[]` from `@nanisoft/prism-ui/spec`, so the row a consumer composes on an
overview is the same shape it composes on a project dashboard and a summary panel,
and its own `Dashboard01Metric` is an alias of the shared type rather than a second
declaration of it. This is the expand step of an expand-contract sequence: the other
four figure owners (`ProjectDashboard01Figure`, `ChartCard01Reading`, `Trend01Item`
and `Stat`) are migrated in later batches and their superseded local declarations are
deleted by a contract ticket, so the count of disagreeing shapes falls across releases
rather than in one breaking step. The alias keeps the old name resolvable until then,
and a reader seeing one shape named twice should read the second name as a synonym on
its way out rather than as a vocabulary.

**What it carries, and each field is here for the reason its twin in the other
three specifications is.** `key`, stable and never the words of the label, because
it is what the caller's values and any future change to the row are keyed by, and a
key built out of a label's words breaks the moment the label is translated.
`label`, required, because a figure with nothing saying what it is is a number a
reader has to guess at, which is the one thing a headline figure cannot afford.
`value`, a `ReactNode` and not a number, in the caller's units and the caller's
formatting, for the reason `MetricProps.value` gives: a figure the consumer
composed is one Prism cannot print, so Prism takes the node and formats nothing.
`delta`, a `number` whose sign is the direction, with no `direction` member beside
it, for the reason `MetricDelta` gives in full. `deltaFormat`, optional, for the
reason the Component gives: a delta of `0.12` is twelve percent, twelve cents or
twelve milliseconds. `hint`, optional, for the period, the source and the caveat
that matters this week. `series` with `seriesLabel` required wherever it is set,
for the reason `Sparkline` gives: a shape with no name is not announced and two
shapes in one row of four cannot be told apart. And `href` with `hrefLabel`
required wherever it is, for the reason every Block in this package that draws a
link gives. Order is the array's order, and nothing else is optional that the
archetype cannot do without.

**Trend is the caller's, and the sentence that settles it is that a comparison
needs a period and the period is the consumer's fact.** Prism draws a trend twice
over and compares nothing: `Sparkline` draws the shape and puts the readings behind
it in a table in the document whatever the drawing does, and `Metric` derives the
direction mark from the sign of a number the caller has already subtracted. So the
specification takes the readings and the name of the series and it takes no period
of its own. There is no `period` member with a closed union of week, month and
quarter, because that union is Prism choosing the axis of somebody's business and a
billing screen's month is not a trading screen's week, and there is no derived rate
of change, no growth percentage and no period over period arithmetic over the
series the caller passed, because each of those is a second arithmetic Prism would
be doing over a population it never fetched. The words for the period go where the
caller's words go, in `deltaFormat` and in `hint`, which is the reason `Trend01`
makes `deltaLabel` required rather than guessing which of three sentences about one
number the caller meant.

**The screen form is a composition and it stays one.** `AppShell01` for the frame,
`PageHeader01` for the claim and this Block for the figures and the panels is the
whole-screen test's answer, and `DashboardPage` is that composition already: it
takes a shell, a header, a row of figures and a table, and its own JSDoc says the
page owns the sequence and the spacing only. A consumer whose screen wants its
figures above a table writes those lines, and a consumer whose screen wants them
above six panels writes the same lines with `panels`. No Page is authored for this
archetype, for the reason the whole-screen test states: a Page that only re-lays-out
one Block is a second answer to a question the composition already answers.

**What a metric summary does not own is stated as a list, for the reason the other
two archetype sections state theirs as a list: a boundary left implicit is a
boundary four repositories will each read differently.** It performs no aggregation
of any kind. It does not sum, count, average, bucket, rank or divide, it takes no
mean and no median, and it derives no rate of change, because aggregation is
arithmetic over a population Prism never fetched, and a total computed over the
figures a caller happened to hand is a number that is false the moment the
population is larger than the page. That is the sharpest edge of the line between a
field and an aggregate, and it is why a metric's value is the caller's own
formatted node rather than a number Prism reduces. It owns no period and no unit,
since the unit rides in `value` and the period rides in the caller's own words. It
owns no threshold, no target, no budget and no severity, because what makes a
figure alarming is the product's decision and a Block that coloured one would be
publishing a judgement it was given no grounds for. It owns no freshness, no "as
of" clock and no loading state, because a figure that has not arrived is the
caller's fetch and the caller's loading surface, and a figure that is stale is a
fact about the caller's cache rather than about this Block. It owns no drill-down
beyond the `href` the caller passes, and in particular it owns no period switcher,
no comparison toggle and no export anywhere in this package's figure surface,
because a Block that cannot make a control work does not render a control and
`scripts/check-block-controls.mjs` is the gate that holds it. It owns no ordering
and no choice of which figures appear: the order of a row of figures is a claim
about what matters first, and it is the caller's claim, which is the reason
`Dashboard01` says the same of `panels` and `ChartGroup01` of `cards`. And it owns
no panel arrangement, which is the six-track grid, the three named spans and
nothing else.

**No word is added to `CONTEXT.md` for this, and the reason is the one the two
sections above give.** `Metric` is already a Component in the catalogue, so the
word is already spoken. "Metric specification" is a type name in a package beside
`MetricSpec` rather than beside `Field specification`, for the reason the glossary
entry earns its place by the words readers of the design system use and not by the
words a consumer's editor autocompletes, and the four specifications are one idea
at four layers. "Trend" is already `Trend01`. "Metric summary" is already named, as
an archetype, and an archetype is survey scaffolding rather than an Item name. And
"aggregation" would enter the vocabulary as a thing Prism declines to do, which is
what the record index section refused for "batch action" and the record detail
section for "record-scoped action".

### What an activity record Block takes as content, and what it does not own

**The group this section was asked about is one archetype and not several, and the Item that draws it already ships, so nothing here is a new name.** Applying the job-identity test to the six screens the survey names removes three of them from the group rather than splitting it. A shipment's chain of events, an issue's whole history and a transaction's trail are three record details, and issue 157 settled that a record detail is a Block whose relationships are one declared `RelationSpec` list of which `events` is one kind. So the history on those three screens is a relation inside `RecordDetail01` rather than a surface of its own, and the honest disposition of this section is that it decides what a run of events draws rather than authoring a second way to draw one. **The Item is `ActivityFeed01`, and it widens.** The survey marks the task application's activity screen COVERED by it, and the shape that answers it is the shape that answers the other three.

**The remaining three split two ways, and neither split is a widening.** The task application's activity screen is the archetype itself: a vertical run of dated attributed occurrences that a reader reads down one column, where the reader's decision is "what happened to this and when", which is the same decision on a shipment, on an issue and on a charge. The gantt is a different job on the arrangement signal the naming section names, because it gains a second dimension, a scale, a range and an extent per bar, none of which a vertical run has, and a run has a rail and a per-entry actor that a bar has nowhere to put. Nobody chooses between a trail and a schedule on purpose, so the second is not a `-02` of the first and this section names no name for it. The developer console's events-and-logs screen is a third thing again, and it is issue 159's archetype rather than this one; the survey's own words for it are that it is filterable and inspectable, which is the record index's arrangement and not a trail's.

**So the survey's `Dated history` row paired two jobs, and the pairing is the collision the naming section describes.** It put `issue gantt 1` and `activity` under one archetype and gave both the answer `Block`, which stays true, so the whole-screen test's table above needs no change and the count it holds is the survey's dated figure. What the row got wrong is the composition: one of its two screens is an arrangement this section refuses to fold into the other. The archetype this section names is the one of the two that is a dated attributed run, and the schedule is a fresh candidate for its own name when its own ticket runs.

**An event specification is warranted, and the count is the reason, exactly as the metric summary's is.** Four shapes in this package declare a dated occurrence today and they disagree. `ActivityFeed01Event` and `AuditLog01Entry` both carry a moment, an actor, a verb and an optional node, and they differ on whether a tone carries its label, which one requires and the other omits. `RunEvent` declares an occurrence with a moment, a role and a message and has no actor at all, and its moment is a bare `number` where the other two take `number | string`. `Milestone` declares a dated occurrence with a title and no actor, and adds a `progress` figure that is a claim about a record rather than about an occurrence. Two further shapes show the same disagreement as an omission: `TimelineEntry` drops the moment and keeps a `duration` in milliseconds, and `Changelog01Entry` drops it and moves it to the parent release. Four declarations of one typed value, disagreeing about four fields, is the failure each of the specifications in `packages/ui/src/lib/` was created to prevent, and a fifth local shape on a log Block would make it five.

**`EventSpec` is the type, it lives in the shared module beside the other four, and it is a specification and not a fifth union.** The union argument is the one `RelationSpec` gives for itself: a field names a control a reader fills, a column names a value a reader reads, a relation names a collection of other records, a metric names a reading over a population, and an event names one dated attributed occurrence, so a union carrying two of the five would let a caller ask for a metric where an event belongs and receive a figure on a rail. **What keeps it from being another ad-hoc shape is that it names no vocabulary of what happened.** `FieldKind` and `ColumnKind` are closed unions and that is legitimate, because every member names a Component this package ships and the caller chooses which of Prism's own controls to use. An event's kind would name what somebody's product calls a thing that happened, and no enumeration of those is Prism's to publish, so there is no `kind` member and a caller needing one puts the word in `action` or composes a `Status` into `detail`. That is the same line the field specification draws with its `slot` arm, and it is what makes one type usable by a shipment scan, a sign-in and a permission change without any of them growing the type.

**What it carries, and each field is here for the reason its twin in the other four specifications is.** `key`, stable and never the words of a label, because it is what the caller's values are keyed by and a key built out of a label's words breaks when the label is translated. `at`, a `number` or a `string` printed exactly as passed and never a `Date`, because a Block ships no formatting, and the machine value rides on the element for a reader that orders by it. `actor`, required, in the words the system uses for a person or a process, and required for the reason `AuditLog01Entry` gives: a record of what happened with nobody to attribute it to is not a record of what happened, and the words for a carrier's scan or a nightly job are the consumer's to write. `action`, the product's own verb or clause, in the caller's words, because a sentence about a product is a claim Prism cannot make. `target`, optional, because a sign-in and a logout name no document. `detail`, an optional `ReactNode`, for the diff, the payload, the code block or the composed reading that no four fields can hold. `tone` with `toneLabel` required wherever the tone is set, and this **closes a live disagreement** rather than adding a preference: a tone is a colour and the words are the information, and on a record a reader may be checking a claim against, a colour alone is worse than anywhere else. And `href` with `hrefLabel` required wherever the href is set, for the reason every Block in this package that draws a link gives.

**Four things it deliberately does not carry, each refused for a reason rather than left out.** No `progress`, because a figure about how far along a record is belongs to a `MetricSpec` composed beside the trail and not to an occurrence, which is `Milestone`'s disagreement stated as a rule. No `severity`, because what makes an occurrence alarming is the product's decision and a Block that coloured one on its own would be publishing a judgement it was given no grounds for. No `duration`, because a duration is a subtraction over two moments the caller holds and Prism would be doing arithmetic over a range it never fetched. And no `role`, because a role is a slot for a mark and a colour and an announcement, which is what `RunEventRole` already is, and it belongs to the surface that draws a mark for it rather than to a read-mostly run.

**Time as an axis is the caller's business, and the trail therefore owns no scale, no range, no bar and no length.** A vertical arrangement's only spatial claim is order, and order is the caller's, so a trail draws a moment and never a length. A two-dimensional arrangement needs a scale and a range before it can draw anything, and both are facts about a plan rather than about a record: `Gantt01` already takes its scale and its two ends from the caller, and its own documentation records what owning an axis costs in the honest sentence that a month is the average one and a tick can fall a day or two from the first, with the exact dates in the table. That cost is the argument, and it is why the trail refuses rather than defers. Scaling also implies arithmetic Prism cannot see, since a bar's length is a claim about a difference between two caller moments, which is the metric summary's refusal read at the arrangement layer. **So a screen that wants time as an axis composes `Gantt01` or `Calendar01` beside or instead of this Block, and the two never merge into one Item.**

**Append-only is expressed as a rendering fact and as nothing else, because the claim about the store is not Prism's to make.** What Prism renders is the entries it was handed, in the order it was handed, with no control that edits one, removes one, re-orders one or implies that one can be, and that absence is checkable rather than asserted: it is the same absence `scripts/check-block-controls.mjs` holds across this package, and a Block that rendered an edit or a delete would be the finding. **What Prism cannot render is that the record is immutable, tamper-evident, signed, sealed, retained or admissible.** A Block has no authority over the store behind it, and a lock or a badge drawn here would be a claim Prism cannot keep, which is the same defect as a fallback sentence about a cause it cannot distinguish. So there is no `immutable` prop, no seal glyph and no verification mark, and a consumer whose domain requires immutability enforces it in its own store and shows what the store says. **The corollary is that append-only is cheap here**, since nothing edits an entry there is no draft, no optimistic update, no undo and no reconciliation, and a caller that hands a changed entry hands a different array. One thing Prism does state, and it is the one a compliance reader cares about: the moment is printed as the caller wrote it with the machine value on the element, so an exported or scraped reading of the trail carries the same timestamps the store does.

**What an activity record does not own is stated as a list, for the reason the three sections above state theirs as a list: a boundary left implicit is a boundary four repositories will each read differently.** It owns no retention, and this is the sharpest edge of the whole section, because a log outlives the screen that shows it: the window, the archive, the purge, the legal hold and the export are all properties of the store rather than of a drawing, and a Block that drew a retention window would be publishing a policy it cannot keep. It owns no window at all, so there is no last-thirty-days, no default date range and no relative filter; a caller wanting one filters before it draws. It owns no freshness, no "as of" clock and no loading state, because a trail that has not arrived is the consumer's fetch. It owns no ordering: it draws the caller's order and neither sorts nor reverses it. It owns no grouping of its own, and the day grouping `ActivityFeed01` already offers is content rather than structure, a caller-supplied key with a caller-supplied label, which is issue 148 read at the archetype layer. It owns no aggregate, so no count, no rate, no entries per day and no elapsed figure, and a screen wanting one composes `MetricSpec` or `Summary01` beside the trail. It owns no navigation and no address, so the only route out of an entry is the caller's `href`. It holds no selection state, because a trail is read and the index holds the set that a batch action acts on. And it owns no confirmation, no toast, no retry, no undo, no second pane, no frame and no claim, which are `AppShell01` and `PageHeader01` on the screen form.

**Two neighbouring Items are measured against this ruling rather than merged into it, and the disposition of each is an authoring ticket's work exactly as `IssueDetail01`'s is.** `AuditLog01` is a table, and a table is the record index's arrangement: its reader compares across entries by column, which a vertical run cannot do, and its own header shape is `DataTableColumn`'s, which is that Item's argument restated. It is measured against `DataTable01`, which widens with events as its rows, and the two are one idea rather than two. `History01` is a ledger of movements and it is measured against the same Item for the sharper reason that **the survey's own rows name it for two screens it does not answer**: a carrier's scan has no amount, no quantity and no reference a reader can quote, so naming it as the nearest Item for a shipment's events was a match on the word "history" rather than on the job. The one thing Prism states about either is that its disposition is settled to be a widening and not a second Item.

**This constrains issue 159, and the constraint is stated so the two can be reconciled rather than to pre-empt it.** Four things. One, `EventSpec` is the shared declaration for a dated attributed occurrence, so a Block that takes events takes it: whatever 159 concludes about the log and event stream archetype, its row type is this one and it may not mint a webhook-delivery entry or a console event beside it. Two, 159's own rows describe a surface that is filterable and inspectable, which is the record index's arrangement, so its honest disposition may well be `DataTable01` widening with `EventSpec` rows rather than this trail at all, and this section does not say which; what it says is that both dispositions are available and neither needs a sixth shape. Three, `RunEvent` is not touched by this section and should not be pulled into `EventSpec`: a `live` event carries a role this package draws a mark for, the `live` Kind is settled, and a read-mostly run has nowhere to put one. Four, neither surface is offered an immutability prop, a retention statement or a time axis, so the append-only ruling above binds 159's Item as much as this one.

**No word is added to `CONTEXT.md` for this, and the reason is the one the three sections above give.** A term earns an entry when this library will use the word repeatedly across Kinds and surfaces. "Event specification" is a type name in a package beside `EventSpec` rather than beside `Field specification`, because the glossary entry earns its place by the words readers of the design system use and not by the words a consumer's editor autocompletes, and the five specifications are one idea at five layers. "Activity record" is already named as an archetype, and an archetype is survey scaffolding rather than an Item name. "Append-only" would enter the vocabulary as a property of the consumer's store that Prism declines to claim, which is what the index section refused for "batch action", the record detail section for "record-scoped action" and the metric summary section for "aggregation". And "audit record" and "history record" are one shape by the ruling above, so giving either a glossary entry would make two words for one thing.

### What a log and event stream takes as content, and what it does not own

**The log and event stream is a different job from the activity record, and the job
it is already has an Item: it is the record index, and `DataTable01` widens with
`EventSpec` rows.** Applying the job-identity test above to the two in-scope
screens, against the archetype the activity record section settled: could one Item
draw both, taking different content, without gaining a region, a decision or an
arrangement the other does not have? It could not, and the signal that decides it
is the arrangement one rather than the subject matter. A trail draws one column
down a page and its only spatial claim is order, which is that section's ruling and
is relied on here rather than re-decided. A log is opened by a reader holding a
question about one of many entries, so it gains a filter region the feed does not
have, a second axis on which entries are compared, and a page boundary for the
entries that do not fit. Each of those three is a shape with its own archetype name
and, once authored, its own Item, and the Item that answers them already ships.

**Both in-scope screens are that one job, and they are one job on the survey's own
second signal.** A billing webhooks screen asks what was delivered, what failed and
what was retried; a developer console's events and logs screen asks what happened,
in order, with enough detail to act. What separates the two is which columns a row
carries: an endpoint and a response on one, a stream and a level on the other. That
is exactly the difference is content rather than structure signal, and it is issue
148 read at the archetype layer, so one Item draws both and a consumer with either
writes the same line. **The survey's two candidate names `delivery-log-01` and
`event-log-01` are therefore both answered, and both answers are that neither is a
name.**

**The test's first signal does not settle it, and saying so is the honest way to
apply a test whose first signal is the one most often mistaken for the whole.** The
record a reader is looking at is not the same thing on both screens, and the
difference runs against the trail. On a shipment detail the record is the shipment
and its events belong to it, so the reader arrived through a record and is leaving
through one. On a console's event record there is no owning record at all, because
the events belong to a stream and the reader's scope is a filter rather than a
record, so there is no detail to return from. Signal one points two ways here rather
than one, which is the case the test states is normal, since an index and a detail
are two archetypes over one record and two Items.

**The reader's decision is the third signal and it is the one that names the
difference in a sentence.** On the trail the question is what happened to this and
when, which is answered by reading down one column. On the log the question is which
one of these do I need and what is in it, which is answered by narrowing first and
then opening one. Reading down and narrowing are two decisions, so they are two
jobs, and a second arrangement is not a second use of a name.

**No `-02` is earned here, and the reason is stronger than the usual one: the second
arrangement already has its name and its Item.** A `-02` is for a second arrangement
of one job that a consumer picks between on purpose, and `DataTable01` is that
arrangement under the name the naming section already gave it. So
`ActivityFeed01` does not widen again for this, and the reason it does not is worth
stating because it is the one an authoring ticket would otherwise get wrong.
Widening the feed to answer a log would put a toolbar, a comparison axis and a
pagination onto a Block whose whole argument is that its only spatial claim is
order, which is the record index arriving inside the trail, and the trail would
lose the property that made it cheap. **A consumer whose screen wants the events of
one record composes `ActivityFeed01`; a consumer whose screen wants to find one
among many composes `DataTable01`.** The two are composed beside each other in the
webhooks case rather than chosen between, and a screen that wants both writes both
lines.

**What the log adds over `ActivityFeed01` is three things, and every one of them is
already owned by the Item it moves to rather than authored here.** The first is the
reader's scope: the search text, the filter values and the reset that
`DataTable01` already takes as `filters`, `filterValues` and `onFilterChange`, and
which it reports without acting on, so a caller that filters before it fetches
composes nothing new. The second is comparison across entries by column, which is
the record index's own argument for existing and the reason the activity record
section measured `AuditLog01` against it. The third is volume, and it is the
sharpest of the three, because a log is the surface where `ActivityFeed01`'s
`limit` is most dangerous: that Block's own JSDoc says a cap that says nothing about
what it left out is a cap a reader believes is complete, and a reader hunting one
delivery among a thousand is exactly the reader for whom a silent cap is a delivery
they will never see. Pagination is the arrangement for that, and it is the index's
rather than the feed's.

**The phrase that arrives with this archetype, that a log is looked at rather than
read through, is an attention mode rather than a job, and it is worth saying which
because it is the sentence a reader brings with them.** An attention mode does not
by itself decide the test, and the counter is real: a webhooks log read from the top
during an incident is read through, and the trail would have served it. What the
phrase does change is concrete, and both consequences are interface facts rather
than rhetoric. A surface that is looked at cannot ask a reader to move their eye
off one entry, so entries must be comparable across the horizontal, and that is the
second axis the trail has no room for. And a surface that is looked at does not want
the long thing in view, so a payload has to be out of the way until it is asked for,
which is the caller's slot rather than the record detail section's drawn-open
relation. Both land on the index and on a control the consumer owns, and neither is
a new Component.

**Two Items measured against the record index are settled here rather than deferred,
because the activity record section deferred them to the decision this one takes.**
`AuditLog01` and `History01` are both `DataTable01`, which is what that section said
they were measured against and why. The console's events and logs screen is the
sharper of the two, because the survey names `History01` as its nearest Item and
that is a match on the word history rather than on the job: `History01` is a ledger
of movements, and a ledger's reader compares amounts down a column, which is the
index. The billing webhooks screen had no nearest Item at all, and it is this same
widening with a different set of columns. `ToolLedger01` is untouched, because a
live ledger changes without a navigation event, which is the `live` Kind's
definition, and no part of this ruling reaches it.

**The survey's two webhooks rows are not one screen and must not be reconciled.**
The console's webhooks row configures where events are sent, which the survey
already assigns to `SettingsIntegrations01` and which is out of scope here. The
billing webhooks row is the delivery record, and it is in scope. Naming them apart is
the whole of the difference, and a reader who merged them would have merged a
settings panel with a log.

**The row type is `EventSpec` and no sixth shape is minted, which is the first of the
four constraints the activity record section set and which binds here unchanged.**
What the log adds is not fields on an event but columns drawn from one. So a
delivery's endpoint, event type, attempt, response status and request identifier are
the caller's columns over `EventSpec` rows, with each value in the member
`EventSpec` already provides: the sending process in `actor`, the event type in
`action`, the endpoint in `target`, the response body and the payload in `detail`
composed as `CodeBlock`, and the response status as a `Status` drawn in a cell
rather than declared as a member, for the reason `EventSpec` has no `kind` and no
`severity` and a caller needing one composes a `Status` into `detail`. **The two
values a delivery carries that a trail never needs are the argument that the log is
not the trail, and they are not a missing field.** An attempt number and a response
status are not part of a sentence about what happened; they are two entries' worth
of the same axis, which is precisely what a reader reads down.

**Inspect is supplied three ways and Prism renders no disclosure.** The three needs
are seeing one entry in full, expanding a payload in place, and taking an
identifier away, and none of them is a Prism-owned disclosure. Seeing one entry in
full is a destination, and the destination is the caller's `href` with its
`hrefLabel` required, which is the rule every Block in this package that draws a
link already gives. Taking an identifier away is a clipboard write, and a clipboard
write is behaviour, so it is the consumer's own control composed beside a
`CodeBlock` rather than a `Button` this Block renders. Expanding a payload in place
is the caller's own `Collapsible`, composed into a `column.cell` render function or
beside the table, and the reason is the one the record detail section gives for
relations: a disclosure is a control, and a control in a Block is the finding
`scripts/check-block-controls.mjs` exists to catch. **So this Block composes
`Collapsible` nowhere and renders no disclosure trigger, and an entry's long
content is either in a cell the caller wrote or behind a destination the caller
named.**

**Two differences from the record detail section's rule are stated rather than
glossed, because both are real and neither one moves the answer.** A relation is
Prism's own declared list of other records, so `RecordDetail01` can draw every one
of them open, whereas a payload is the consumer's bytes and this Block cannot draw
them even when they are open. And a log's payload is long, so drawn-open would be a
wall where a detail's open relations are four lines each and a reader wants one
entry rather than all of them. The answer is the same in both cases and it is the
escape the record detail section already names: a `ReactNode` the Block places,
which is how a consumer injects a working control without the Block owning any
state.

**What `scripts/check-block-controls.mjs` would catch, and what it would not, since
a ruling that leans on a gate has to say which arm of it it leans on.** The gate
reads `packages/ui/src/blocks` and `packages/ui/src/pages`, reads `.tsx` files
only, and classifies four Components: `Button` and `CtaLink`, and beside them
`DropdownMenuItem` and `Switch`. A widening that added a per-row expand or view
control as a `Button` with no handler is a finding, and it is the shape the gate was
written for after `Hero01`, `PageHeader01` and `Pricing01` each shipped one; a
per-row action as a menu row with no handler, no destination and no `render`
element is a finding for the same reason, which is the row action shape the record
index section removes. The destination is safe for the compiler's reason rather than
the gate's, because `CtaLink` requires an `href` and the gate lists it only so that
its coverage line can say what it read.
**A spread is read as carrying no handler, so the natural implementation of the
caller's own inspect control, a `Button` with the caller's props spread onto it, is
a finding even when the caller did pass an `onClick`.** A handler forwarded from a
declared optional prop reads as present, because resolving whether the caller passed
it is reading a type rather than a file. The escape is a `ReactNode`
slot and not a spread, which is why this section names a slot rather than a
row-action prop, and why the gate's own printed note about spreads is part of the
answer rather than an aside.

**The gate would not catch a Block that held the disclosure itself, and that limit
is why the prohibition above is a design rule rather than an enforcement.** A Block
that rendered `Collapsible` with `defaultOpen` and no `onOpenChange` puts no
`Button`, no `CtaLink`, no `DropdownMenuItem` and no `Switch` in its source, so the
run reads it as clean while the state is still state a Block holds. Widening the
gate to the menu item and the switch did not close this, and it was not meant to: a
disclosure's activation is inside `Collapsible` rather than on an attribute of the
row that opens it, so there is no arm to read, and a rule that guessed at one would
report the four Blocks that compose `Collapsible` correctly. The gate reads Prism's
own action Components, whose dead form is what actually shipped, and that is a
narrower question than whether a Block owns behaviour. So the sentence that this
Block renders no disclosure is held here in `DESIGN.md` and by the authoring of the
widening, and a reader auditing it should look for the absence rather than for a
clean run. The gate prints this limit on every run so that a clean run is not read as
more than it is.

**The adjacent gate is `check-nested-controls.mjs`, and this arrangement invites
it.** A row is a `tr` and a cell is a `td`, so the two controls a cell holds are
siblings and never nested, for the reason `ActivityFeed01`'s own row gives: an
anchor inside a button is invalid markup and two tab stops for one action. So the
destination and the caller's expand control sit beside each other in the cell
rather than one inside the other, which is the same decision the feed already made
about its own link.

**What a log and event stream does not own is the activity record section's list,
restated as applying here rather than decided a second time.** No retention, and
here it is sharper than on the trail rather than softer: the window, the archive,
the purge, the legal hold and the export are properties of the store, and this is
the surface where a retention policy is most tempting to draw and least Prism's to
keep. The billing row exists because silent delivery failure is silent data loss
downstream, so a log that drew a last-thirty-days window would be publishing a
promise about what the store holds, and a log whose own default range hid a
delivery would be the exact failure that screen is opened to prevent.
**A filter is not a window, and that difference is the whole of what may be drawn
here.** Narrowing by endpoint or by status is a caller choosing a slice of what the
store has; a window is a claim about what the store keeps. So this Block draws the
filters the caller passed and states nothing whatever is behind them.

No immutability either, and the append-only ruling binds this Item exactly as it
binds the trail: append-only is a checkable absence, so there is no `immutable`
prop, no seal glyph and no verification mark. A delivery record is where that
costs most, because a webhook delivery is retried and a retry is a new row rather
than an amendment of an old one, so nothing here may suggest that a row was
rewritten and nothing here may offer a control that would rewrite one.

And no time axis: a moment is drawn and never a length. The delivery latency a
consumer most wants on this screen is a subtraction over two moments the caller
holds, which is `EventSpec`'s refused `duration` restated rather than re-decided,
and it is composed as a `MetricSpec` beside the table instead of being computed in
a column.

**The rest is refused for the reasons the sections above give.** No severity
judgement, since `tone` is the caller's and its `toneLabel` is required wherever
the tone is set. No live tail, since a tail changes without a navigation event,
which is the `live` Kind and `RunStream01`, and `RunEvent` stays out of `EventSpec`
as the activity record section ruled. No aggregate, so no failure rate and no count
per endpoint, because both are arithmetic over a population Prism never fetched and
both compose as a `MetricSpec` beside the table. No bulk redelivery and no other
command, because a command against the store is the caller's state machine, and row
selection exists on the index so the caller can drive one rather than so the Block
can. No export anywhere in this package's log surface, because export is a
retention concern as much as a download one. No grouping of the Block's own: a log
filtered by day is a filter the caller passed.

**No word is added to `CONTEXT.md` for this, and the reason is the one the four
sections above give.** "Log and event stream" is an archetype name from the survey,
and an archetype is survey scaffolding rather than an Item name. "Event
specification" was declined by the activity record section and this ticket takes
the same row type, so re-opening it would change a settled ruling to make two
sections agree with each other rather than to name a new thing. "Inspection" is an
interaction rather than a layer Prism owns, since the words are the consumer's, the
arrangement is the consumer's and the control is the consumer's, which is the shape
of a thing this glossary holds as a slot elsewhere. And "retention", "window" and
"archive" would enter as properties of a consumer's store that Prism declines to
name, which is what the record index section refused for "batch action", the record
detail section for "record-scoped action" and the metric summary section for
"aggregation".

### What a rehearsal surface is, and why the archetype has no Item

**The two in-scope screens are two jobs rather than one, and what the survey's row
paired was a history with a plan.** Applying the job-identity test above for real,
rather than in the order the survey proposes it, is the whole of this section. A
failed payment moving through its recovery states is one record read after it
happened; a payment path rehearsed against parameters is a thing that has not
happened yet, drawn before it does. The two share the word run, and they share the
survey's phrase "try a path without committing it", which is true of one of them
and not of the other: nothing about reading a failed payment's recovery states is
an attempt to avoid committing one.

**Signal one points two ways, which the test states is normal, so the other two
carry the decision.** The record is the same thing on the workflow screen and it is
a payment. On the simulator there is no record at all, because the payment being
rehearsed does not exist yet and the screen's subject is the parameters rather
than anything those parameters will describe. So one screen is a record and the
other is a declaration of one, and an index and a detail are two archetypes over
one record, so this signal cannot be the one that settles it.

**Signal two is where they part, and what separates them is not content.** Content
means which columns, keys, filters, groups and labels a surface carries, which is
issue 148 read at the archetype layer and inherited here rather than restated.
Both of these things are describable, so no wider set of columns could carry the
difference. What separates them is that one is a record and the other is a
description of a record that does not exist, and a Block renders what it was
handed rather than what it was told might happen.

**Signal three is the reader's decision and it names the difference in one
sentence.** On the workflow the question is where this payment is and what has been
tried on it, which is answered by reading. On the simulator the question is what
happens if I run it this way, which is answered by entering values and looking at
what comes back, and entering is a decision a reading surface never asks.

**Both outcomes are named before the test is run, because a test whose outcomes are
not stated is a test nobody can check.** One archetype would have produced a Block
with two regions, a state region on the payment's recovery and an input region on
the rehearsal parameters, with a control between them that starts one from the
other, and the deciding argument would have been whether that control could act.
Two archetypes produce two dispositions with no interface between them, and that is
what the rest of this section gives.

**The workflow screen is a record detail, and issues 157 and 165 answer it rather
than this one.** One payment's path through recovery is that payment's history, and
the activity record section settled that a record's own events are a relation
inside its detail rather than a surface of their own, so the screen is
`RecordDetail01` with one declared relation of `EventSpec` values. **The recovery
states are the consumer's words, and `EventSpec` has no `kind` and no `severity`
for exactly this reason**: `failed`, `retrying` and `recovered` are a product's
enumeration, and a tone on an entry carries them with its `toneLabel` required,
which is the arrangement the log section already fixed for a delivery's response
status. Where the screen form differs is that a reader may arrive wanting the run
rather than the record, and then the same entries compose `ActivityFeed01` down
one column, because a trail draws a moment and never a length and a payment's
recovery states are moments. **Neither half is a rehearsal**: the first is read
after the fact and the second is the same read arranged in a column.

**The survey's nearest Item for that row is `ProcessFlow01`, and the match is on
the word workflow, which is the defect the naming section describes one layer
down.** `ProcessFlow01` takes `ProcessStage[]` of a name and a caption and draws
them in order with a continuous ordinal, and that is a **plan**: every stage is
drawn, no stage carries a state, an outcome, a moment or a colour, and the Block
ships no stage of its own. So it cannot draw one payment's progress through
anything, because progress is a fact about a run and a flow holds no run. It is
measured against the record detail and not merged into it, for the reason the
activity record section measured `History01` against the index: the survey named
the nearest Item on a word rather than on the job.

**The workflow row's own words settle it, and they are the survey's.** "I need to
see a failed payment move through its recovery states" names one record and one
record's progression. Had the row said "I need to see every stage a payment can
pass through", it would have named a plan, `ProcessFlow01` would have been the
answer, and the row would read COVERED rather than GAP. **That is the whole
difference between the two halves of this archetype in one sentence**, and it is a
difference in what the reader is looking at rather than in how it is drawn.

**The simulator screen is the plan, and the plan already has an Item that ships.**
What a delivery rehearsal draws is the pipeline it is about to run, in the
caller's own words, with no state on any stage, and `ProcessFlow01` is that
drawing today. So the simulator needs no new Item for its plan, and what is left
over after the form and the flow is the outcome, which is either something that
happened or nothing at all.

**So the sharpest question in this ticket has one answer: a rehearsal surface
renders a plan to be run, and never a run that happened.** The run that happened
is owned twice over, by the record detail's relation and by `ActivityFeed01`, both
settled, so the half with no owner is the plan. It follows that a rehearsal draws
no history of its own: a plan has produced nothing yet, so there is nothing to draw
until the caller hands over results, and the results they hand are `EventSpec` rows
or `MetricSpec` figures the consumer already holds, composed beside and never
declared here.

**One screen is not a vocabulary, so the plan half earns no archetype name and no
Item.** The archetype as counted is two screens, one of them leaves it by the
argument above, and what remains is a single screen whose every part is an Item
this package already ships. **A consumer with a delivery simulator writes
`PageHeader01` for the claim, `ProcessFlow01` for the plan and the write form Block
for the parameters, then places their own control and their own result beside it.**
`catalog.ts` is untouched, no new Kind appears, and no `-02` is earned, because
there is no second arrangement of one job anywhere in this archetype.

**The survey's own question for this gap is answered by that, and answered
differently from how it was put.** It asked whether a sandbox is a product surface
or a developer tool, and offered OUT for all three rows as the honest answer. The
question does not arise once the archetype splits, because neither surviving half
is a sandbox: one is a record detail and one is a form beside a pipeline. What
remains of the developer-tool worry is real and is the never-do paragraph below,
because a rehearsal that runs inside a product and moves nothing is exactly the
surface where the answer would matter most. The audio playground leaves scope with
its section, and by issue 153's scope rule it constrains no name and takes no
`-02` from the two in-scope screens.

**A recurring job needs no Prism concept, and this is the negative result the
charting question was raised to get.** One screen wants a schedule, and one screen
is not a vocabulary. What the screen wants is three things and each is already
answered by a settled ruling rather than by a new type. **When it next runs** is a
moment the caller renders, with `RelativeTime` in the reader's own locale and the
machine value on the element, which is the composition layers rule about a value
two audiences read. **Whether it is healthy** is the consumer's own `Status`
composed into a cell, or an `EventSpec`'s `tone` with its `toneLabel`. **What it
did last time** is `ActivityFeed01` or `DataTable01` over `EventSpec`, both settled
above. So the schedule is not a gap in the vocabulary; it is three consumers writing
three lines they can already write.

**What is refused is refused by name, because a refusal nobody can name is a
boundary four repositories each read differently.** No `Schedule`, no `Cadence`, no
`Recurrence`, no `nextRunAt`, no `lastRunAt`, no `interval` and no `cron` string,
and the reasons are the ones the sections above already give. **A cadence is an
enumeration of what a product calls a repetition**, which is the product's
vocabulary in the same way `FieldKind` is not and `EventSpec`'s missing `kind` is,
and issue 160 refused a rule language for the same reason. **How long until the
next run** is a subtraction over two moments the caller holds, which is
`EventSpec`'s refused `duration` read at the schedule layer, and no gate would
catch a Block doing that arithmetic on strings. **A countdown is a clock**, and
issue 160 held the index to no clock on the grounds that a Block which decides
when its own content is stale is a Block deciding. **A timezone is a locale
decision**, and `DESIGN.md` gives formatting to whoever owns the fact for the same
reason it gives the machine value to the element. **And no run count**, because a
count of runs is an aggregate over a population Prism never fetched and composes
as a `MetricSpec`, which is issue 158's refusal restated rather than re-decided.

**This closes the question the map raised, and closing it is worth recording
rather than leaving open for a second opinion.** The charting gap was a real
observation about one screen and it was correctly not a vocabulary: a schedule is a
fact about a consumer's scheduler, and Prism never schedules, so a Block that
drew one would be publishing a promise about a system this package does not have.
**If a second screen later wants a schedule, it is measured against this ruling and
not against the gap**, exactly as a screen excluded by scope returns as a fresh
candidate.

**A simulator's parameters are `FieldSpec`, reused and not redeclared, and the
simulator's difference from a record write form is not its fields.** It is that
there is no record. The write form section settled the shape, the groups, the
closed `FieldKind` and the `slot` arm; a rehearsal takes the same specification
and the same Prism controls, the consumer owns the values from the first keystroke
for the reason issue 162 states about the stepped arm, and every rule is the
consumer's for the reason 152 states for all of them. **So there is no
`ParameterSpec`, no `InputSpec` and no second field type**, and the submission is
the caller's own function in the union 152 already declared: `onSubmit` on a
simulator is a function that runs a rehearsal rather than one that saves, and
nothing about the interface changes because of which of the two it is. A caller
whose parameters are not a record composes `Form` and `FieldSpec` themselves and
places their own control, and there is nothing in that a Block would have to own.

**A workflow's steps are declared as the caller's words and no specification is
minted for them, which is where this ticket could most easily have become ticket
158's problem.** Three candidates were weighed and each is refused for a reason
already settled. **A `StepSpec` beside the other four specifications** would be a
fifth hand-declared shape, and the argument against it is `EventSpec`'s own: a step
would have to carry a `kind` naming what a step *is*, which is the vocabulary of
whatever application declared it, and a member on a Prism type would be promising
that every consumer's steps are these. **`FieldSpecGroup[]` as the steps** is the
second list issue 162 refused, since a step is a position in a process rather than
a group of fields. **`EventSpec[]` as the steps** is the sharpest refusal and it is
a correctness one rather than a tidiness one: an `EventSpec` is one dated
attributed occurrence that *happened*, and a declared stage has not happened, so
using the trail's row type for a plan would put an `at` and an `actor` on something
that has not occurred. **That is the same defect `Milestone` was refused for
carrying a `progress` figure**, and a rehearsal surface that rendered the plan as
history would be a diagram of a run that never ran.

**What is left is content in the caller's words, drawn by the Block that already
draws it.** `ProcessFlow01` takes `ProcessStage[]` of a `name` and a
`description`, both strings, and ships no stage, no ordinal and no label of its
own. A simulator declares the same stages it would show in its pipeline and gets
the same drawing, so **the step list needs no type because the caller already
writes it and already has the shape for it.** This is the difference between this
archetype and the four the specifications were made for, stated plainly: a field, a
column, a relation, a metric and an event are each a typed value that two Blocks
would otherwise each declare, and a stage is a sentence in a Block's props that
already has one.

**`ProcessStage` is measured here rather than migrated, and the reason is scope
rather than judgement.** It is declared inside the Block that draws it, with its
own stated reason, and it is a local shape of the kind issue 158 and the activity
record section both counted when they found four disagreeing metric shapes and four
disagreeing event shapes. Migrating it is authoring work in `packages/ui/`, which a
decision record does not do, and **the honest disposition recorded here is that the
four shared specifications in `packages/ui/src/lib/` remain the only shared
declarations**, so a later ticket that touches that module measures this one
against it rather than adding a fifth module beside it.

**What a rehearsal surface must never do is stated as three verbs, because each one
is a thing this package does not have.** **Prism never executes.** There is no
`onRun`, no run control, no start, no retry and no `Progress` that advances,
because a Block ships no behaviour and a control that reaches nothing is the
finding `scripts/check-block-controls.mjs` exists to catch. **Prism never
schedules**, which is the negative result above stated as a contract: no cadence, no
clock, no timer and no countdown. **Prism never fetches**, because a Block fetches
no application data, and a rehearsal's outcome is the result of a run on the other
side of the consumer's own server.

**A rehearsal looks like running something, so a simulation that looks live and is
not the worse failure, and here is what a reader is owed instead.** It is owed four
things and each is a rendering fact rather than a promise. **The result is the
caller's words and Prism asserts none of it**: no verdict, no success sentence, no
`Status` of its own, because a Block that claims an outcome is a Block making a
claim about a run it never saw. **Nothing pending is drawn by the Block**, because a
Block holds no clock and awaits nothing, so a rehearsal left open shows the
parameters and the plan it was handed; a result that has not arrived is the caller
composing their own `Skeleton` or `EmptyState01` beside it, and there is no pending
arm on anything here. **A moment is drawn and never a length**, which is the
activity record section's ruling at the arrangement layer, so the next attempt at
`T` is the caller's `RelativeTime` and the caller's own words, and no surface here
prints a countdown, an elapsed figure or a remaining time. **And nothing on the
surface implies that money moved**: that nothing was charged is a domain claim, so
it is a `labels` string or the `PageHeader01` claim above, and Prism's
contribution is that it draws no control of its own that could have moved anything.

**No motion on this surface may imply a system that is running.** A spinner, a
progress bar or an ambient figure on a rehearsal would be a claim about a process
this package does not have, and the ambient scale exists for a figure that shows a
system genuinely running rather than for one that would look like it. A result
that arrives while a reader watches is the `live` Kind and `RunStream01`, which the
log section already settled, and it is not this archetype.

**What the archetype table does is keep its row, and the reason is the one the
saved task view section gives.** `Rehearsal surface | 2 | Block` stays as it is,
because the table holds the figures `docs/admin-screen-survey.md` holds and a
disposition is recorded in prose rather than by moving a number between two rows.
The Kind also stays true by accident rather than by luck: both surviving halves are
Blocks, `RecordDetail01` and `ProcessFlow01`, which is why nothing in that table
changes.

**No word is added to `CONTEXT.md`, and the reason is the one the five sections
above give.** "Rehearsal surface" is a survey archetype name, and an archetype is
survey scaffolding rather than an Item name, so the phrase retires with the
archetype it named. "Schedule" and "recurring job" name facts a consumer's store
holds and Prism declines to own, in the shape of "batch action", "retention" and
"archive". "Simulation", "sandbox" and "rehearsal" are the consumer's words for
their own product, and a glossary entry giving Prism one of them would be a word
for something it draws nothing of. And "step specification" is a type name in a
package, which is the entry shape all five sections refuse.

**Where the authoring work lands: no catalogue entry, no new Item, no new prop, no
new specification and no new Kind.** `catalog.ts` is untouched, the four
specifications in `packages/ui/src/lib/` are the only shared declarations and none
of them widens, and the only thing this ruling changes about the survey is that
its `payment-recovery-01` candidate name is answered rather than pending.

### What a settings region is, and why the archetype earns no Item

**The archetype is answered by a Block that does not exist yet rather than by one
that does, and saying which is the whole result.** Eight screens survive the
Section H ruling and its count is held above, and five of them are one archetype
and three of them are not, so the first act is to say which five. What is left is
the task application's `settings`, the account area's `general`, its
`notifications`, the developer console's `webhooks`, and the task application's
own task-list preferences read as the same thing. The five the AI ruling moved out
of this archetype are the ones whose reader's decision is not about a preference:
`profile` writes a record, `billing` states a figure over a population with
records underneath it, `plans` asks a purchase question, and `connected apps` and
the agent-area `integrations` are a set of things that exist apart from the reader
and each in a state. **Every one of those five is answered by a settled Item
rather than by a new one**, which is the honest way to record a split: a profile is
the record write form section's Block over the reader's own record, a billing
screen is a `MetricSpec` over the record index the invoices are, a plan comparison
is `Pricing01` and `PricingCompare01` as they ship, and a list of connections is
the record index with a caller supplied `Status` column and a caller supplied
per-row node, for the reason the record index section gives for every command.

**A setting is not a third thing, and the sentence that settles it is that Prism
cannot see whether a record exists.** A form creates or edits a record; a setting
changes behaviour and is often no record at all. That difference is real, and it
is a fact about what sits behind the surface rather than about the surface, which
is fields in groups with labels and help. The rehearsal surface section already
answered this for a simulator and this inherits it rather than re-deciding it: its
difference from a record write form was not its fields, it was that there is no
record, so its parameters were the same `FieldSpec` with no second type and no
second Item. **So a settings region is a `FieldSpecGroup`, the Item is the record
write form Block, and the archetype earns no name of its own.** The record write
form section settled that every Block rendering a field specification takes the
same three types and the same `slot` arm, and that rule already reached a settings
panel by its own wording; this section reaches it from the archetype side and says
what it means for the archetype table.

**The one thing that differs is when the value leaves, and that is a caller's
callback rather than a shape Prism can draw.** A setting may apply on change, on
blur or at a save, and each is a different value of a handler the Block already
passes through: `FieldSpec` on a controlled field carries the caller's change
handler, so a field whose handler applies its mutation is a field that applies on
change, and nothing in the surface tells the two apart to a reader. **The
distinction is not a region, a decision or an arrangement**, which is the test's
own three, so it is not a second Item under issue 153. What it does decide is
which arm of the save union a caller reaches for: a settings region that applies
on change passes `submit` with no control of its own, or passes nothing and no
footer is drawn, and a settings region that saves explicitly passes `action` or
`onSubmit` exactly as the write form does.

**A setting that applies on change cannot be validated, and the consequence is
stated rather than papered over with a prop.** Issue 152 put every rule with the
consumer, so there is no value to check and a Block that checked one would be
behaving. The consequence is that an on-change setting has no moment at which the
value is refused, so the caller's only two honest answers are to keep the previous
value and write it back, which is consumer state Prism never sees, or to accept
the change and report the failure somewhere else, which is the consumer's own
`Alert`, `Toast` or `LiveRegion` composed beside the region. **What this rules out
is a revert control in this Block**, for two reasons that are independent: a
Block ships no behaviour and so cannot wire one, and it holds no previous value
and so has nothing to revert to. **And what it does not rule out is validating on
the way in**, because a caller that wants a rule before the mutation runs it
itself and passes the issue list the field specification already declares. The
sharp form of the point is that Prism's answer to an invalid setting is not an
error state on a control that has already changed, it is the caller's decision
about when the change is allowed to land, and that decision is not content.

**The way between regions is the consumer's, and both arrangements already ship
without a Block owning either.** `SettingsPage` is on disk and composes
`AppShell01`, `PageHeader01`, `Tabs` and `SettingsPanel01`, taking an ordered
`tabs` array whose entry is either a saved form or a read-only node, so a tabbed
settings screen is a composition rather than a gap. A rail is the shell's own
rail, or the consumer's own list of `CtaLink`s carrying their own `href`s beside
the regions. **Neither arrangement belongs to the region**, because which regions
exist, what they are called and whether one of them is a destination are the
consumer's information architecture, which is the one rule the composition layers
hold a Page out of making claims about. A Block that drew a tab strip would be
claiming the regions are peer topics, and a Block that drew a rail would be
claiming they are siblings rather than a set with a parent.

**`scripts/check-nested-controls.mjs` has one arrangement to catch here and it is
the navigation row, not the field.** On the run for this decision it read 703 TSX
modules across `packages/ui/src`, `apps/site/src` and `apps/site/items`, classified
484 controls and found none nested. It classifies the native `button`, `input`,
`select`, `textarea` and `summary`, an anchor carrying an `href`, and the
Components whose element is one of those, which on that run were `Button`,
`CtaLink`, `Link`, `Toggle` and `DropdownMenuItem`. A settings region is where a
row both navigates and is changed, so `<a href>` wrapping a `Switch` is the shape
to refuse, and the escape is the log section's: a control that navigates has to be
the link, so the row is a `CtaLink` and the control that changes the setting is a
sibling beside it rather than inside it. **A `label` wrapping a control is
deliberately not a finding**, because the gate counts a label as a parent only for
a descendant that is not labelable, and a settings row that puts its `FieldLabel`
and its `Switch` as siblings is the arrangement `SettingsPanel01` already ships.

**What a settings region does not own is stated as a list, for the reason the
sections above state theirs.** It owns no persistence: no `localStorage`, no
cookie, no settings record, no default value Prism chose and no reset to defaults
control, for the reason the saved view section gives, since a setting this package
stored is a setting this package would have to migrate. It owns no validation, no
rule, no coercion and no clamp. It owns no save, so no dirty tracking, no
unsaved-changes guard, no revert, no optimistic update and no reconciliation
between two readers of one setting. It owns no navigation and no address, so a
region cannot be deep linked, shared or bookmarked and the words a reader would
put in the address are the consumer's. It owns no aggregate, so no count of how
many settings are set and no figure over them. It owns no search across regions
and no filter within one, because a filter is the caller's own narrowing and a
Block that filtered its own groups would be defending an order on every consumer's
behalf. It owns no scope, so it does not know whether it is the organisation's,
the project's or the reader's, which is the whole difference between an
organisation's defaults and a personal preference, and the words for that are the
caller's. It owns no plan or entitlement, so it draws nothing about a setting that
is unavailable on the reader's tier beyond the `disabled` flag the field already
declares. It owns no confirmation, no toast, no retry and no undo. And it owns no
frame and no claim, which on the screen form are `AppShell01` and
`PageHeader01`.

**No word is added to `CONTEXT.md`, and the reason is the one the sections above
give.** "Settings panel" is already named as an archetype, and an archetype is
survey scaffolding rather than an Item name, so the phrase retires with the
archetype it named. "Setting" and "preference" are two words for one thing in the
survey and are the consumer's rather than Prism's, which is the entry shape the
glossary holds as a slot elsewhere. "Apply on change" is an interaction rather than
a layer Prism owns, since the arrangement is the consumer's and the handler is the
caller's. "Region" names a place in a screen the consumer's information
architecture owns. And `Field specification` is already in the vocabulary and
already says Prism owns the shape while the consumer owns the values, so this
section adds nothing to it.

**Where the authoring work lands: no catalogue entry, no new Item, no new prop and
no new Kind, and two findings inside `SettingsPanel01` that an authoring ticket
has to fix.** `SettingsPanel01` is measured against the record write form Block
rather than merged into it or kept beside it on its own terms, which is the
disposition `IssueDetail01` and `AuditLog01` are held to above. Two things are
settled about its source as it stands. It declares its own field type,
`SettingsPanelField`, a union of `text`, `textarea`, `switch` and `select` with a
value handler per member, which is the shape issue 152 replaced with `FieldSpec`,
`FieldSpecGroup` and `FieldKind`, and it is the sixth such declaration in this
package beside `AuthFormField`, `ContactField`, `ProvisioningField`, `SignupField`
and `IssueDetail01Field`. Its union has no `slot` arm either, so a control this
package does not ship has nowhere to go in a settings region. And its
`secondaryAction` is declared `{ label: string; onClick?: () => void }` and
rendered as a `Button` with an optional handler, so a caller who passes a label
and no function gets a focusable control, announced as a button, that activates
to nothing. **`scripts/check-block-controls.mjs` does not catch that and the
reason is its own stated limit rather than a gap to be closed here**: it reads
the rendered Component's attributes, `onClick` is one of the three arms it treats
as actionable, and the word is present whether or not the value behind it is
`undefined`. So it is held by this paragraph and by the authoring of the widening,
and a reader auditing it should look for the absence of an optional handler rather
than for a clean run. The archetype table keeps its row and its count, for the
  reason the saved task view and rehearsal sections give.

### What a credential and secret lifecycle is, and why the archetype earns no Item

**Prism ships no surface whose whole job is holding a secret, and the reason is a
direction of travel rather than a level of care.** Every boundary this document
has drawn is a direction: a Block draws what it was handed, a form reads what a
reader typed, an index lists records the caller fetched. A secret travels the
other way. It is minted by the store, it is handed to one reader at one moment,
and the correct behaviour on the consumer's side is that nobody holds it again.
A surface for it would be the one place in this package whose input is a value
its caller is required to destroy, and every mechanism Prism uses to hold a
value across renders is the mechanism that would keep it alive.

**The screen is already where two settled Items are, and the survey's own rows
say so rather than this section finding it.** Part 2 of the survey assigns both
api keys rows to Record write form and names no credential archetype at all,
and Part 3's gap seven is a grouping of GAP rows rather than a row in the
archetype table above. So the lifecycle decomposes before a new Item is ever a
candidate: the create moment is the record write form section's Block over
`FieldSpec`, and the listing moment is the record index, `DataTable01` over
`ColumnSpec`. **The naming section said this screen's shape is wider than a
field specification, and that is right without being a claim that an Item is
missing**: wider than a field specification and wider than a list, since it is a
list, a write and a one-time reveal, and the third of those three is answered by
a Component this package already ships and a node the caller already writes.

**The once-only moment is `CodeBlock`, and the reason is that Component's own
two props are already the answer rather than a near miss.** `code` is a `string`
and that Component's own JSDoc says why, that a `ReactNode` would make the thing
on the page and the thing in the clipboard two different strings, which is the
failure a code surface is the last place to allow. A credential's whole point is
that what the reader copies is the value and nothing else. And `actions` is a
`ReactNode` in the header, taken rather than drawn, for a reason that is a house
law: this package ships no word a consumer cannot localise, and a copy control
is named there as the clearest case of one. **So the value goes in `code` and the
copy control goes in `actions`, and Prism renders neither of them: it draws a
mono surface and a place for a control, which is a Component and not a Block.**

**Reveal is refused as a Prism owned control, and the reason is the strongest one
available, which is that a reveal control is a promise about retrievability.** A
toggle between a masked value and the value tells the reader the value can be
brought back, which on a credential is false, and it is the one claim the
once-only rule exists to prevent. A Block owning that toggle would also hold the
value across both of its states, so the value would outlive the caller's own
unmount of the thing that fetched it, and the surface whose job is to shorten
the value's life would be the surface extending it. **So Prism draws no mask, no
toggle, no disclosure and no truncated prefix, and the reveal moment is a place
the value is written in full, once, into a node the caller composed.** Masking
before a copy is the arrangement a reader has seen somewhere else, and it is
refused here for the reason above rather than for the look of it.

**Neither gate is load bearing here, and saying so is part of the answer,
because a ruling that leans on a gate has to name the arm it leans on.**
`check-block-controls.mjs` reads `packages/ui/src/blocks` and
`packages/ui/src/pages` and classifies four Components, `Button`, `CtaLink`,
`DropdownMenuItem` and `Switch`; the copy control here is a `ReactNode` in a
Component's slot, which
that gate prints as not a finding in as many words, and a Block rendering its
own copy `Button` would be a finding on the arm it reads as actionable.
`check-nested-controls.mjs` classifies `summary` among the native controls, so a
Prism drawn `Collapsible` around the value would put a control inside a control
the moment the caller put the copy control into it, and the escape is the log
section's: the value is the `code` and the control is in the header, so the two
are siblings inside a `figure` and neither contains the other. **The honest limit
is the one the log section already printed**: a Block holding a disclosure itself
puts none of the four classified Components in its source, so a clean run is not
evidence of anything. The rule here is that nothing is drawn at all, which a reader
auditing it checks by looking for the absence.

**What is never rendered is the value after that moment, and it is expressed as a
rule and as a type surface and as no prop at all.** There is no `onceOnly`, no
`masked`, no `redactable` and no member anywhere that takes a secret, and the
reason is the one the activity record section gave for refusing `immutable` and
the log section gave for refusing retention: a Block has no authority over the
store behind it, so a flag asserting that the value is gone is a claim Prism
cannot keep and cannot check, and a prop would assert on the caller's behalf
something only the caller's store knows. **What Prism does instead is narrower
and is checkable: no type in this package has a member a secret would go in.**
`FieldSpec` describes controls a reader fills, `ColumnSpec` describes values a
reader reads, and neither has anywhere for a value that must not be kept, which
is the sharpest fact in this section and the next paragraph is about it.

**A secret is not a `FieldSpec` entry, and the difference is which way the value
moves.** A field's value goes from the reader into the form, out at submit and
into the caller's own state, and from there into a record that is durable and
readable back; that is what a field is for, and it is why the write form Block
reads the values out at submit rather than holding them. A credential's value
goes the other way. It is generated by the store, it exists in one render, and
the correct consumer behaviour is that it is not in state a moment later, so
there is no value for a form to read and nothing for a `FieldKind` to name a
control for. **So the field set on the create screen is the credential's
metadata, its name, its scopes and its expiry, every one of them a field Prism
already draws, and the secret is not a field, not a `defaultValue`, not a `slot`
and not a new member of the union.** It is output, and the one surface in this
package built to render something a reader takes away is a Component.

**On the listing screen the credential is a record about a credential rather than
the credential, so no column carries the value either.** A row holds a name, a
truncated non-secret prefix in the caller's own `Text` cell, a created moment, a
last used moment as `RelativeTime` and a state as a caller supplied `Status` with
its own label, all of it content under the record index's `ColumnSpec` and none of
it a new shape. **When the value was created and when it was last used are
events, so that history is `EventSpec` composed as `ActivityFeed01` beside the
index**, which is the constraint the activity record section set and the log
section honoured, and a screen wanting it writes one line rather than a second
Block.

**Revocation and rotation are lifecycle rather than display, and Prism expresses
neither.** Revocation is a command against the store, and the record index
section already settled where every command goes: a per row node the caller
writes, and a batch bar whose contents are one `ReactNode`, with no revoke
control anywhere in this package's selection surface. Rotation is not a third
command but the first two in sequence, the create screen again, which is the
record write form Block over the same `FieldSpec`, followed by a revoke on a row
the caller drew. **So there is no `rotate` prop, no confirm dialog, no
revocation reason, no overlap window and no expiry clock**, and the consistency
is the reason rather than the coincidence: issues 159 and 165 both refused to own
retention for the same ground, a command, a policy and a deadline are all facts
about a store Prism never fetched. A moment is drawn where one belongs and it
never ticks, which is the saved view section's no clock ruling read at this
archetype, so an expiry column shows when a credential lapses and never how long
is left.

**What this does not own is stated as the list every section above states,
because a boundary left implicit is a boundary four repositories will each read
differently.** It owns no value, so it fetches none, mints none, holds none and
re-renders none. It owns no store, so no hashing, no prefix derivation, no
entropy and no comparison against a stored value. It owns no policy, so no
scopes, no expiry, no revocation, no grace period and no rule about what a
credential may call. It owns no clipboard, so it draws no copy control and
confirms no copy. It owns no address, so the once-only screen cannot be
bookmarked, shared or deep linked, and coming back to it is the consumer's fetch
returning nothing rather than a route Prism published. It owns no count, no
aggregate and no clock, and it holds no selection, no dialog and no focus
management, because a `Dialog` is a Component the caller opens. It renders no
frame and no claim, which on the screen form are `AppShell01` and
`PageHeader01`.

**No word is added to `CONTEXT.md`, and the reason is the one the sections above
give.** "Credential and secret lifecycle" is the survey's gap heading rather
than a row in the archetype table, and survey scaffolding is not vocabulary. A
secret and a credential would enter as properties of a consumer's store that
Prism declines to assert, which is the shape of the entries the record index
section refused for "batch action" and the log section refused for
"retention". "Reveal" is an interaction rather than a thing Prism owns, since the
arrangement is the consumer's and the control is the consumer's. And `Field
specification` is already in the vocabulary and already says Prism owns the
shape while the consumer owns the values, so this section adds a case to an
entry rather than a word beside it.

**Where the authoring work lands: nothing. No catalogue entry, no new Item, no
new Component, no new prop, no new member of any union and no new Kind.** A
consumer with this screen writes `AppShell01`, `PageHeader01` and `DataTable01`
for the listing, the record write form Block for the creation, and a `Dialog`
holding a `CodeBlock` with their own copy control in its header for the
once-only moment, which is the composition the ticket allowed as its outcome and
is the honest one. **`api-key-01` is answered as not a name**, for the reason the
log section gave for `event-log-01` and the saved view section for `today-page`:
the name was a candidate for an Item and there is no Item. The archetype table
above keeps every row it has and no count moves, because this was never a row in
it.

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

### The target-size floor

The section below says what every control owes a finger at 44 pixels. This says
what every target owes a reader at every pointer, and it is a different floor for
a different reason, so the two do not merge.

**Twenty-four by twenty-four is the floor, and it is paid on the box rather than
on the type.** A link drawn as a bare inline anchor has no box: what a pointer aims
at is the font's content area, which for the shipped face at `text-sm` is 16.94
pixels, measured as the resolved size times the face's own ascent and descent and
its size-adjust, all three read out of the `@font-face` this package ships for its
fallback. A row of six to eight of those is the densest target cluster on four
sites. The arrangement is `flex min-h-6 items-center`, so the anchor is a block at
least `--spacing-6` tall with the same fourteen-pixel type inside it, and it is the
arrangement `mobile-nav` already uses for a stacked link at the coarse-pointer
floor, one step lower and at every pointer.

**The floor can be free, and here it was.** A footer column link sat in a line box
built from the footer's inherited sixteen-pixel body, so the row was already
twenty-four pixels tall and paying the floor on the box changed no row height and
no section height anywhere. That is the good case and it is worth looking for: a
target floor paid on the box costs the page nothing, and a target floor paid on the
type costs the page its visual weight, which is why the two are different answers
rather than one answer with two sizes.

**A target that meets the minimum only because its neighbours are far apart is not
a target.** WCAG 2.2 SC 2.5.8 permits an undersized target when a 24 pixel circle
centred on it misses every other target, and in a footer column at the authored
gap that circle clears. The exception is real and this change would have been
defensible without it. It is refused anyway, because a target whose size is a
function of the gap beside it is one edit away from failing and nothing in the
tree would report it, which is the same argument the figure floor makes about a
drawing that fits its container.

**The floor is held by a measurement rather than by a class string.** Nothing in
`pnpm check` measures a target, so `site-footer.test.tsx` resolves the link's
`display`, its `min-height` and its line box out of `dist/styles.css` and the root
declarations in it, and asserts the box that comes back against the 24 the
criterion names. The criterion is the one number in that test which is not read,
because it is the criterion and not a decision this repository took.

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

### The figure floor

The Do list above says what every control owes a finger. This says what a drawing
owes a reader on a phone, and it is a floor in the same sense: a figure that has
shrunk past legibility is not a smaller figure, it is a different one.

**A figure holds a legible width of its own, and the container moves under it.**
A drawing is laid out in its own coordinate space and scales with the box it is
given, so every label in it renders at its own size times the rendered width over
that space. That is the right arrangement and it is not the whole answer, because
it has no floor in it: at the 342 pixels a phone leaves a `Diagram`, its node
names came to 6.95 pixels and its relation words to 5.88, which is a picture of a
shape with nothing written on it. So the drawing is never rendered narrower than
its own coordinate space, one user unit is therefore never less than one pixel,
and the smallest label in it is `text-xs`. A container that cannot give it that
much **scrolls sideways**, which is what `Table` does with seven columns, what
`Gantt01` does with a schedule of names and bars, and what `Compare01`'s `table`
form does on a phone.

**This is a scroll rather than a reflow, and the reason is that a reflow is a
different claim.** A table that restacks has stopped being a table, and a diagram
that stacks its nodes into a column has stopped being a diagram: it no longer
shows which thing connects to which, which is the whole of what it was for. So
the drawing keeps its arrangement and the reader pans it. The cost is stated
rather than argued away: on a phone the reader sees about half the drawing at a
time and has to pan for the rest, which is a worse page than one that fits. It is
a worse page than one that fits at 5.88-pixel type, which is the alternative this
rule rejected, and a diagram nobody can read is not a diagram that got smaller.

**A floor on a figure's own width is not a media query, and the difference is the
whole of why this one is the right mechanism.** The floor holds at every width
and says nothing about the reader's device. A query that switched a drawing
between two arrangements would be claiming something about how a reader reads,
which is a claim a Component has no standing to make and which `Compare01`
already refuses to make for the same reason.

### The ink-avoidance rule

**No stroke in a figure crosses a label, and a label never sits on its own
stroke.** Two things follow from a label being drawn beside a mark rather than
inside it, and both used to be false. A node's name is printed under its mark, so
a relation drawn centre to centre between two marks runs through the name under
whichever node it leaves downward, and on the company site's five-node drawing
five node names were struck through. And a relation's own label is offset from
its line by its own extent measured across that line, because a label's width
runs along a horizontal line and across a vertical one, so one constant offset
clears the first and leaves the second sitting on its own stroke.

**The way to hold it is to trim, not to halo.** A stroke is terminated where the ink
runs out rather than knocked out behind the label with a paint-over. The
alternative, knocking the line out behind the label with a halo, has to be filled
with the colour of the surface the figure happens to sit on, which the Component
is not told, and a halo filled with the wrong ground is worse than the overlap it
was hiding.

**Trim against what the segment would enter, and against nothing else.** This is the
part the first implementation of the rule got wrong, and getting it wrong is
invisible until somebody renders the figure. A stroke is trimmed to whichever comes
first: the mark's own edge plus the clearance, or the far side of any **individual**
label the segment actually runs through. The direction is the whole of it. **A label
in a figure is usually beside or below its mark, so a stroke that does not travel
toward it is not obstructed by it.** A name is printed under its mark and a second
line under that, so a stroke leaving sideways runs along the mark's own centre line
and enters neither, and it must reach its mark. Backing such a stroke off the mark
by the half-width of the widest name at the node anyway pushed every connector on the
company site's six-stage pipeline back by up to fifty units from a six-unit mark: a
row of circles with short line segments floating between them, which draws the shape
and none of the relations. So the whole rail now reaches both of its marks with only
the clearance between, and a stroke that *does* travel toward a label still stops
short of it.

**The stroke is the segment, so the trim reads the whole line between the two
marks.** A name and a note sit below their mark at two different depths, so a stroke
arriving from below runs through the name, out of it, and then back into the note
further along. Stopping where the name ends leaves the stroke sitting on the note, so
the line between the two marks is divided once and the longest unblocked stretch of
it is drawn. Zero label crossings and reaching the marks are therefore one rule and
not two, and neither half is available without the other.

**A Component that cannot measure text can still know a monospaced label's
width.** This is the half that makes the rule reachable from a server Component:
every label in a drawing is set in the monospaced face, a monospaced face has one
advance width for every character, and so a label's width is its character count
rather than a measurement. A label set in a proportional face would have no such
answer, which is a limit of the rule rather than of the Component, and the reason
the labels in a figure are monospaced in the first place.

**The claim is checked as geometry, not as a class name, and it is checked as both
halves of it.** Each figure's suite reconstructs every label's ink box, every
mark's centre and radius and every stroke's two end points from the rendered markup
and asserts three things: that no stroke intersects any label, that no endpoint is
further from its mark than the ink requires, and that no endpoint is *closer* than
the ink requires, which is the half a snapshot and the half an intersection count
alone both pass on, because a detached connector still looks like a drawing. The
sizes are read out of the emitted token source and the shipped stylesheet rather
than restated, so a test cannot rot the moment the canvas or the type step moves.

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
