# The house rules, for anyone building an Item in this repository

Read this before writing a line. It is the whole of what the gates enforce, and
every rule here has already caught a real defect, so none of it is stylistic
preference.

You are adding **Components** and **Blocks** to Prism, a DTCG token design system.
The rules are not negotiable and the gates will fail the build without them.

## The four files you own, and the ones you must not touch

You create **exactly these four files per Item** and nothing else:

1. `packages/ui/src/components/ui/<kebab-name>.tsx` - the implementation
2. `packages/ui/test/<kebab-name>.test.tsx` - the behavioural tests
3. `apps/site/items/component/<category>/<slug>/<slug>.mdx` - the documentation
4. `apps/site/items/component/<category>/<slug>/<slug>.tsx` - the Demo

**You must NOT edit any of these**, because several agents are working in this
tree at once and a shared file edited twice is a merge conflict:

- `packages/ui/src/catalog.ts` - the catalogue. One entry per Item, added centrally.
- `packages/ui/src/components/index.ts` and `packages/ui/src/index.ts` - the barrels.
- `packages/ui/scripts/**` - every gate.
- `packages/ui/registry.json` or `packages/ui/public/**` - generated, not hand-edited.
- `.changeset/**` - added centrally.
- Any file belonging to another Item. Do not refactor shared code.
- `DESIGN.md`, `docs/**`, `CONTEXT.md`, `PRODUCT.md` - the constitution.

If you believe a shared file must change, write the reason into your final report
instead of editing it.

## The category vocabulary is CLOSED

A Component's directory is one of exactly seven, and the gate fails anything else:

`call-to-action` `data-display` `feedback` `forms-and-inputs` `layout`
`typography` `miscellaneous`

A **Block** is uncategorised. If you build one, it goes in
`packages/ui/src/blocks/<kebab-name>-01/` with a `block.json` and an `index.tsx`,
and it does not get a category directory.

The category is a claim about the Item's role, so pick the one it actually is. A
control a reader operates is `forms-and-inputs`; something that reports a state is
`feedback`; something that arranges other things is `layout`; something that shows
data is `data-display`.

## Colour: semantic utilities only, never a value

A Component may only use semantic utilities. Never a ramp step, never a hex, never
an `rgb()`.

Good: `bg-background` `text-muted-foreground` `border-border` `bg-accent`
`text-accent-foreground` `bg-destructive` `text-destructive-foreground`
`bg-primary` `text-primary-foreground` `bg-muted` `bg-card` `bg-popover`
`text-brand-ink` `ring-ring` `bg-success` `text-warning-foreground`

The available foreground roles are exactly: `foreground`, `primary-foreground`,
`secondary-foreground`, `accent-foreground`, `muted-foreground`,
`destructive-foreground`, `success-foreground`, `warning-foreground`,
`popover-foreground`, `card-foreground`, `sidebar-foreground`.

**A variant that sets its own `bg-` must set its own `text-`.** The
`check-variant-ink` gate fails a variant map whose values set a background and no
ink, because an inherited ink is the same control on the page ground and a
different one inside a Block. That gate caught a real 1.01:1 contrast failure. The
`bg-` utilities exempt from this are the state ones: `hover:`, `focus:`,
`focus-visible:`, `active:`, `data-*`, `group-`, `peer-`, `aria-*`, `disabled:`,
`has-*`.

Note: the gate only reads a variant map whose values contain a **space**. A
single-utility value like `'bg-primary'` is not read as a variant at all. Prefer
real class strings, and give every multi-class variant an explicit ink anyway.

## Motion: tokens only

`duration-fast` `duration-base` `duration-slow` and `ease-out` `ease-in-out`.

Never a millisecond number, never `cubic-bezier(...)`, never a `@keyframes`.

**There is no decorative and no entrance animation in this system at all.** Motion
is state feedback: something happened, and the reader should see that it did. A
pulsing element that is genuinely working is state feedback. An element that fades
in on mount is not, and it is refused.

## Copy: a Component ships no words

The `check-block-copy` gate fails a word-shaped string literal in a Component, a
Block or a Page. That means a literal with a capital letter, or a space, in a
position that could reach a reader.

So every reader-facing string is a **prop**. Including:

- labels, placeholders, hints, empty states
- `aria-label` values, and anything a screen reader would read
- the words that name a state, a kind or a tier

A machine value is fine: a variant name, a token name, a `data-slot`, a
`KeyboardEvent.key` value from the closed DOM set, a class string, a module path.

**A default of a destructured prop is exempt** and is the right way to give a prop
a default:

```tsx
// Allowed: a default the caller may override.
function Dialog({ closeLabel = 'Close' }: DialogContentProps) { ... }
// Not allowed: a name the Component chose, whatever the caller passed.
return <button aria-label="Close" />
```

Two more exempt shapes the gate already knows: a type argument
(`ComponentProps<'div'>`) and a numeric vector coordinate.

**Every exported Item needs a JSDoc block.** The corpus reads it, and
`check-item-docs` fails an Item without one. This is the documentation source, not
a comment. State what it is, what it is for, the decision behind its shape, and
what a caller must know. The reasoning is the value; a block that only restates
the prop names is a failed block.

## Accessibility is checked by axe and by hand

Every test file ends with an axe run. Disable exactly these two rules and no others,
the same way the existing suites do:

```tsx
const results = await axe.run(container, {
  rules: {
    'color-contrast': { enabled: false }, // measured by the token contrast gate
    region: { enabled: false },          // a whole-page rule a fragment cannot satisfy
  },
})
expect(results.violations).toEqual([])
```

`color-contrast` is disabled because the token gate measures the pairs; `region` is
disabled because a fragment is not a page. Disabling anything else hides a real
defect.

Three things that have actually gone wrong in this codebase, so check them:

- **`aria-label` on a plain `<div>` is prohibited, not ignored.** A `div` with no
  role has no accessible name. Give it a role, or move the label onto a real
  element.
- **`aria-level` on a plain `<span>` is prohibited.** Same reason.
- **A test that only asserts attributes passes on a Component that renders
  nothing.** Assert behaviour: what a reader would see, and what is in the DOM.

Name anything interactive. The rule is that a name is a prop and the Component
ships none, so a required `label` prop is the normal shape.

## Client or server, and how to decide

`'use client'` **only** when the Component genuinely needs it: it calls a hook,
holds state, runs an effect, or attaches an event handler.

Most Components in this package are server Components. 16 of 41 are client. A
Component that reads props and renders is a server Component, and a live region
needs no client directive at all because the browser announces it from its own
mutation observer.

If a Component is a client Component, it must have an entry in the `BUDGETS` table
in `packages/ui/scripts/check-client-budget.mjs`. That table is added centrally, so
**list the client Components you built in your final report** and the budget will be
added.

## Testing

Vitest with `@testing-library/react`, `userEvent` and `axe-core`. Run exactly:

```
pnpm --filter @nanisoft/prism-ui exec vitest run test/<your-file>.test.tsx
```

Test the **claims**, not the structure. For every Item ask what could be quietly
wrong and would still look right in a screenshot: a value that runs past its
maximum, an empty list that renders an empty control, a zero that divides by
nothing, a range that is out of order, two ranges that overlap, a state that is
never cleared. Each of those wants a test.

Assert order when order is the claim. Assert the *absence* of a role or an
attribute when the risk is adding one. Use `getByRole` and `getByLabelText` over
`getByTestId`; if you must query the DOM, give the element a `data-slot`.

## The documentation file

Frontmatter is exactly:

```md
---
slug: components/<slug>
title: <Name>
---
```

Then `## Overview`, `## Usage` with a fenced `tsx` block, a
`<ComponentDemo slug="<slug>" />` line, and `## Guidelines` with `### When to use`,
`### When not to use`, `### Best practices`.

Write about the decisions. "Do not use it for a history: a finished run the reader
is looking up rather than watching belongs in a table" is the kind of line that
earns the file. "This component displays text" is not.

## The Demo

`'use client'` if it has state, a plain function if it does not. Import from the
published subpath: `@nanisoft/prism-ui/components/<kebab-name>`. Show the states
that matter, not one lonely instance, and make them switchable so a reader can see
the difference. The Demo may contain words: it is reader-facing copy by
definition, and that is the point of it.

## House style

- Two-space indent, no semicolons, single quotes. Match the file next to yours.
- TypeScript strict. No `any`. Prefer `ComponentProps<'div'>` over an invented
  interface for pass-through props.
- Named exports, kebab-case filenames.
- `data-slot="<kebab-name>"` on the root and on each part, so a consumer and a test
  can both target it.
- JSDoc on every exported symbol, including prop interfaces and their members.
- Comments explain **why**, and name the thing that would be wrong without them.
  Do not narrate the code.

## Before you report back

```
pnpm --filter @nanisoft/prism-ui exec vitest run test/<your-file>.test.tsx
node packages/ui/scripts/check-block-copy.mjs
pnpm --filter @nanisoft/prism-ui typecheck
```

All three must be clean. `check-block-copy` prints a count; you want 0 findings. If
you cannot get one clean, say so plainly in your report and explain why, rather than
loosening a rule.
