# Authoring a roster item

The operational recipe for adding an Item to Prism. It is a recipe and not a
constitution: the laws live in `DESIGN.md`, the vocabulary in `CONTEXT.md`, the
commands in `AGENTS.md`, and the gate that holds each law is in
`packages/ui/scripts/`. Read those, not this file, when they disagree.

`docs/history/roster-expansion.md` holds which Items this effort adds and which
upstream categories it refuses, with the reason for each.

## Read before editing

1. `DESIGN.md`, the authoring contract and the Motion section.
2. `CONTEXT.md`, for the vocabulary and the retired words.
3. `AGENTS.md`, the conventions and the gotchas.
4. The closest existing item. `packages/ui/src/blocks/hero-01/hero.tsx` is the
   reference for a Block, `packages/ui/src/components/ui/field.tsx` for a
   Component, `packages/ui/src/live/run-stream-01/run-stream.tsx` for a live
   surface, and `packages/ui/src/pages/not-found-page/` for a Page.
5. `packages/ui/scripts/check-block-copy.mjs`, the gate that decides what a
   literal is. It is the rule a Block's props are shaped around.

## The files one Item is

### A Component, slug `<slug>`

- `packages/ui/src/components/ui/<slug>.tsx`
- `apps/site/items/component/<category-slug>/<slug>/<slug>.mdx`
- `apps/site/items/component/<category-slug>/<slug>/<slug>.tsx`

`<category-slug>` is one of `call-to-action`, `data-display`, `feedback`,
`forms-and-inputs`, `layout`, `typography`, `miscellaneous`.

### A Block, slug `<slug>`

- `packages/ui/src/blocks/<slug>/<slug>.tsx`
- `packages/ui/src/blocks/<slug>/index.tsx`
- `packages/ui/src/blocks/<slug>/block.json`
- `apps/site/items/block/<slug>/<slug>.mdx`
- `apps/site/items/block/<slug>/<slug>.tsx`

### A Page, slug `<slug>`

- `packages/ui/src/pages/<slug>/<slug>.tsx`
- `packages/ui/src/pages/<slug>/index.tsx`
- `packages/ui/src/pages/<slug>/block.json`
- `apps/site/items/page/<slug>/<slug>.mdx`
- `apps/site/items/page/<slug>/<slug>.tsx`

### A live surface, slug `<slug>`

- `packages/ui/src/live/<slug>/<slug>.ts`
- `packages/ui/src/live/<slug>/index.tsx`
- `packages/ui/src/live/<slug>/item.json`
- `apps/site/items/live/<slug>/<slug>.mdx`
- `apps/site/items/live/<slug>/<slug>.tsx`

## The shared files the maintainer edits, never a parallel author

Editing one of these from two subagents at once loses a line, so the per-Item
author leaves them alone and reports what belongs in them.

- `packages/ui/src/catalog.ts`, the one catalogue
- `packages/ui/src/index.ts`, `src/components/index.ts`,
  `src/blocks/index.ts`, `src/pages/index.ts`, `src/live/index.ts`
- `packages/ui/scripts/check-client-budget.mjs`, the `BUDGETS` table
- `packages/ui/scripts/check-vector-ink.mjs`, the `SCANNED` file list

Report, per Item: `name`, `slug`, `kind`, `category`, one-sentence
`description`, `source` path, the full `exports` list, whether the module needs
`'use client'`, whether it draws, and its approximate gzip size if you can get
one.

## The authoring contract, in the order it bites

1. **A JSDoc block on every exported function, immediately before it.**
   `check-item-docs` measures the nearest non-whitespace character before the
   declaration and requires it to be `*/`. A comment three functions up does not
   count, and the block is what the corpus reads for the Item's interface, so
   write the reasoning, not a summary. The existing items are the standard: they
   state why a decision was made and what the alternative would have cost.
2. **Semantic utilities only.** `bg-background`, `text-muted-foreground`,
   `border-primary`, `bg-card`, `text-card-foreground`. Never a ramp step such as
   `slate-200`, never a raw hex, never `bg-[#fff]`.
3. **Motion by token.** `duration-fast`, `duration-base`, `duration-slow`, and
   `ease-out` or `ease-in-out`. Never a millisecond value, never
   `cubic-bezier(...)`, never a keyframe, never an arbitrary duration or easing
   utility. A figure that runs on a cycle names one of the six
   `prism-ambient-*` classes the stylesheet publishes, and nothing else. No
   entrance animation, no scroll effect, no marquee.
4. **Elevation by token.** `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`,
   `shadow-xl` and no others. Never a raw `box-shadow`, never an arbitrary shadow
   utility.
5. **Layout by token.** No arbitrary container width (`max-w-[1200px]`), no
   breakpoint literal, no raw padding that a spacing token names. `Section`
   owns the container and the vertical rhythm, so a Block composes it rather
   than re-deriving either.
6. **No copy.** A word-shaped string literal, a hardcoded `aria-label`, and JSX
   text are all findings. Every string, every number standing in for data, and
   every accessible name is a prop. A machine value such as a variant name, a
   state, a tier or a `data-slot` is fine.
7. **No fetching, no router, no data client, no `node:` import.** A Block and a
   Page take their data as props.
8. **`data-slot` on the root** of each part, for tests and debugging.
9. **`className` is layout only**, merged with `cn()`. Changing a Prism-owned
   visual property from `className` is prohibited.
10. **`align="left"` on `SectionHeading`** for any section with content under
    it. `Hero01` is the deliberate exception and keeps its own `align`. Card and
    tile titles take `childLevel(headingLevel)`, never a hardcoded `h3`.
11. **A union, not an optional prop, when a prop is required in one shape and
    forbidden in another.** `HeroAction` is the reference: the link arm requires
    `href` and the button arm declares `href?: never`.
12. **No raw English in reader-facing copy anywhere**, including the MDX and the
    JSDoc prose. The dash gate covers `docs/**` and the package sources, so no
    em dash and no en dash in any file you write, and never `???`.

## The MDX shape

```mdx
---
slug: blocks/<slug>
title: <ExportName>
---

## Overview

<What it is, in three short paragraphs, and the one decision that shapes it.>

## Usage

```tsx
import { <ExportName> } from '@nanisoft/prism-ui/blocks/<slug>'
```

<One runnable-looking example.>

<ComponentDemo slug="<slug>" />

## Guidelines

### When to use

### When not to use

### Best practices

### Content guidelines
```

Omit `### Content guidelines` on an Item that ships no copy. The
`<ComponentDemo />` line sits between the Usage block and `## Guidelines`,
which is where every existing Item in the tree puts it, not on the last line.

## The Demo shape

`apps/site/items/<kind>/<slug>/<slug>.tsx` default-exports one component. The
Demo is where the preview copy lives, because a Demo is the documentation
site's own content and not a Block's. Pass `headingLevel="h3"` when the item
takes a heading level, and show the item's real states rather than one ideal
state.

## What Wave A added, and what a later wave composes

The 2026-09 expansion built its foundation Components first, so a Block in a
later wave composes them rather than re-deriving them.

| Item | Role |
| --- | --- |
| `metric` | a headline figure with a label and a derived delta |
| `status` | a dot in one of five tones beside the caller's words |
| `price` | an `Intl`-formatted amount with an optional period |
| `relative-time` | a localised absolute reading, relative words handed back |
| `sparkline` | a tiny series described by a generated table |
| `contribution-graph` | a calendar heat grid over a caller's day keys |
| `chart` | bar, line, area and donut, with the table always in the document |
| `code-block` | a snippet with a header and a gutter, and no highlighter |
| `lightbox` | one image at full size, with its own caption |
| `steps` | an ordered rail whose states derive from `current` |
| `search-field` | a controlled search input with a clear control |
| `password-field` | a password input with a reveal toggle |
| `tag-group` | a wrapping row of removable tags, and a lone `Tag` |
| `dropzone` | a real button that also accepts a drop |
| `file-upload` | the chosen files with a byte count and a remove control |
| `mini-calendar` | a six-week month grid for a panel |
| `list-panel` | a titled, bounded, scrollable region with slots |
| `data-toolbar` | the row above a table or a list |
| `filter-panel` | a titled column of filter controls owning neither apply nor clear |
| `avatar-group` | overlapping avatars with a count past the cap |
| `pack-swatch` | a preview of one pack, carrying its own boundary |
| `announcement` | a page-level message bar in one of five tones |
| `mode-toggle` | the light and dark control, and the one Component that needs the provider |

A Block that needs a heading, a container or vertical rhythm composes
`Section` and `SectionHeading`. One that shows a figure composes
`InstrumentPanel01` or `ChartFrame`. One that shows a series in a panel
composes the new `chart` rather than hand-rolling SVG axes.


## What to verify before reporting

From the repository root:

```sh
pnpm --filter @nanisoft/prism-ui exec tsc --noEmit
node packages/ui/scripts/check-block-copy.mjs
node packages/ui/scripts/check-item-docs.mjs
node packages/ui/scripts/check-item-category.mjs
node packages/ui/scripts/check-block-imports.mjs
node packages/ui/scripts/check-vector-ink.mjs
node packages/ui/scripts/check-focus-indicators.mjs
node scripts/check-elevation-layout.mjs
node scripts/check-dashes.mjs
```

Every one of these must exit zero. Do not run `pnpm build`, `pnpm sync` or
`check-client-budget`: those read the emitted tree and are the maintainer's to
run once per wave.
