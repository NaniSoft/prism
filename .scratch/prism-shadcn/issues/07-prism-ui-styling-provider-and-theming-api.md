---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 05, 06
---

# How prism-ui delivers styling, its provider, and its theming API

## Question

The user's requirement is that downstream products never touch CSS, never
change a style, and never override one. That is a hard constraint on this
package's public surface, and it is the opposite of what a component library
usually offers. It also absorbs the adoption contract, because how a downstream
product wires itself in and what it is permitted to do are the same question.

Settle:

1. **How styling reaches the consumer.** One stylesheet imported once, or
   per-component stylesheets, or neither because the components carry their own
   CSS modules. The old package shipped a single `./styles.css` export and
   documented that consumers install no CSS tooling at all. Decide, and say
   what a consumer's `app/layout.tsx` looks like as a result.
2. **Tailwind's role.** The component package is built on Tailwind 4 and the
   token package emits an `@theme inline` block. Decide whether a consumer must
   install Tailwind, whether the compiled component CSS is self-sufficient
   without it, and what happens if a consumer's own Tailwind build is present
   and configured differently. A consumer that never writes CSS still has a
   `globals.css` with an import in it, and the answer has to be exact about
   what may appear there.
3. **The provider.** Whether there is a `PrismProvider`, what it does beyond
   context, and whether it is required. The old provider selected a theme and
   performed a consumer-last per-key merge. Decide whether a consumer can
   supply overrides at all: the standing preference says no escape hatches, and
   an override parameter is an escape hatch. If there is no override path, say
   what a downstream product does when the system lacks something, or record
   that as unanswered and leave it to the contribution path in the fog.
4. **The theming API.** How a consumer selects a pack and a mode, given the
   token package's emitted selectors. The old API was
   `createPrismTheme({ pack, mode })` returning a frozen theme object, with
   flash-free switching via pre-baked rulesets and a blocking boot script. The
   new one has `data-theme` on the document element and localStorage
   persistence. Decide the consumer-facing shape and whether theme selection is
   programmatic, declarative, or both.
5. **The public export surface.** What a consumer may import, under which
   subpaths, and what is internal. The components to blocks to pages taxonomy
   implies a layering. Decide whether compound parts such as a dialog's or a
   select's sub-components are reachable, and the old glossary's rule was that
   they stay inside their parent module rather than forming a second vocabulary.
6. **The no-escape-hatch rule, made concrete.** The old repository put "exposing
   Base UI, raw tokens, or CSS recipes as consumer escape hatches" out of
   scope. Restate that rule for this architecture and make it checkable. If
   Base UI is an internal dependency, state how that is enforced: the old
   package made it physical through pnpm isolation, and this one has it as a
   direct dependency. If a consumer can import Base UI themselves, the rule is
   documentation rather than architecture, and that should be said plainly.
7. **The component authoring contract.** How a component is written: file
   naming, whether styles are CSS modules or utility classes, whether a
   component may reference a raw ramp step, the rule that components consume
   semantic utilities only, and where a component's own documentation lives.
   This repository already has a strong version of this in its `DESIGN.md` and
   a grep-enforceable rule about raw hex and ramp utilities; decide what
   survives.
8. **Blocks and pages.** They are in scope, rebuilt fresh as composition demos
   per the map. Decide what a block's contract is (the old rule: blocks accept
   data and content slots but never fetch application data; pages receive
   application-owned navigation, content and data) and whether a page is a
   component at all or a documented composition recipe.
9. **What a downstream product may do.** Name it explicitly, because the user's
   requirement is a prohibition and prohibitions that are not enumerated are
   not enforceable. Compose, pass content and data, choose a pack and a mode.
   What else, if anything.

Read `packages/registry/src/components/ui/button.tsx`, `badge.tsx`,
`card.tsx`, the `ds/blocks` directory, `packages/registry/components.json`,
`packages/registry/registry.json`, `apps/docs/src/app/globals.css`,
`apps/docs/src/components/theme-switcher.tsx` and `apps/docs/src/app/layout.tsx`
before answering. Consult `codebase-design` for the surface question.

## Answer

This ticket is the adoption contract: how a downstream product wires itself in
and what it is permitted to do. It instantiates ticket 05's exports map, consumes
ticket 06's token contract and emitted selectors, and hands selector scoping and
first paint to ticket 08. Where it departs from the recommended answer it says so
and why. `codebase-design` is applied at the end of this section: the public
surface is the seam, `PrismProvider` is the one deep module, and nothing leaks
past it.

### 1. Styling reaches the consumer as one precompiled stylesheet

`@nanisoft/prism-ui/styles.css` (`exports["./styles.css"] -> "./dist/styles.css"`,
`sideEffects: ["*.css"]`), built once inside `packages/ui` and imported once in
the consumer's app root layout. It is the only way a Prism style reaches an app.

- The `packages/ui` build compiles Tailwind 4 over `packages/ui/src` plus
  `@nanisoft/prism-tokens`'s emitted CSS (`theme.css` in particular), then `tsc`
  emits declarations and the asset is copied to `dist/styles.css`. This is
  ticket 05's `tsc` plus asset-copying build; the CSS compiler is Tailwind, not a
  JS bundler, so "no bundler" still holds.
- Rejected: per-component stylesheets (a consumer would have to know which to
  import, and a missing one fails silently) and CSS modules (the consumer's
  bundler would compile them, which is a second build of our styles). Neither is
  compatible with "import one file, install no tooling".
- `styles.css` is self-sufficient: it carries the token custom properties, the
  `@theme` bindings, the compiled utilities used by every Prism component, and a
  base/preflight layer. A consumer needs no Tailwind, no `@source`, and no token
  import.

A consumer's `app/layout.tsx`, canonical:

```tsx
import '@nanisoft/prism-ui/styles.css'
import { PrismProvider, PrismThemeScript } from '@nanisoft/prism-ui/provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-pack="blush"        // server-rendered: the provider is optional
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <PrismThemeScript />
      </head>
      <body>
        <PrismProvider defaultPack="blush" defaultMode="dark">
          {children}
        </PrismProvider>
      </body>
    </html>
  )
}
```

A consumer who wants no client runtime omits `PrismProvider` and
`PrismThemeScript` and keeps the two attributes on `<html>`; everything still
works. If the consumer keeps a `globals.css`, the only Prism line in it is
`@import '@nanisoft/prism-ui/styles.css';` and nothing else design-system
related. Do not do both the JS import and the CSS import; the JS import in
`layout.tsx` is canonical because Next allows global CSS there and it cannot be
reordered by a later `@import`.

### 2. Tailwind's role: an internal build dependency, never the consumer's

Tailwind 4 is a dependency of `packages/ui` (and the site) only. The consumer
does not install it, configure it, or run it, and `styles.css` is complete
without it. The consequence of a consumer's own Tailwind build:

- **It must not regenerate Prism's utilities.** No `@source` pointing at
  `node_modules/@nanisoft/prism-ui` or `prism-tokens`, no import of Prism's
  `@theme`/token CSS, no re-declaration of `--color-*`, `--duration-*`,
  `--ease-*`, `--spacing-*`, `--text-*` or `--font-*`.
- **The failure if they do.** Their build emits the same utility names and the
  same custom properties a second time. Since `styles.css` and their build both
  emit into `@layer utilities` (or, if unlayered, win outright), their copy can
  override Prism's, and the system now has two sources of truth for a token.
  This is not preventable by Prism: it is the consumer writing CSS, which the
  contract prohibits but no build gate can see. It is documentary, exactly as
  question 6's Base UI case is.
- **Collision requires intent.** A Tailwind build scans only the files it is
  told to; if a consumer points it at their own source and does not write Prism's
  class names on their own markup, it emits nothing that touches Prism's
  elements. The guard is "scan your source only".
- **What Prism guarantees.** `styles.css` is byte-stable per version; the class
  names Prism's components use are a public compatibility contract (as with
  shadcn); every token value is emitted by Prism's build alone; and changing a
  token requires rebuilding Prism and re-installing, never editing a variable.

### 3. The provider: `PrismProvider`, optional, no override path

`PrismProvider` is **optional**. Without it, the `:root` defaults in
`styles.css` apply and the declarative markup in §4 works; the provider exists
only for programmatic switching, persistence and flash-free hydration. It carries
pack and mode through context and writes the same two markup attributes a
declarative consumer would write.

`@nanisoft/prism-ui/provider`:

```ts
import { PrismProvider, usePrismTheme, PrismThemeScript } from '@nanisoft/prism-ui/provider'
```

| `PrismProvider` prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `defaultPack` | `PackId` | `'default'` | pack used when nothing is stored and no attribute is present |
| `defaultMode` | `Mode` | `'light'` | mode used in the same fallback |
| `storageKey` | `string` | `'prism-theme'` | `localStorage` key for the { pack, mode } object |
| `children` | `ReactNode` | - | the app subtree |

There is **no** `overrides`, `tokens`, `theme`, `cssVars`, `merge`, `className`,
or `style` prop, and no per-key merge. The provider's only outputs are the two
document-element attributes and context. On mount it resolves in the order
stored value -> server-rendered attribute -> `defaultPack`/`defaultMode`, so a
server-rendered pack survives hydration instead of flashing to the default.

`usePrismTheme()` returns `{ pack, mode, setPack, setMode, toggleMode }`, with
`pack` and `mode` independent. It reads the provider's context and throws a named
error outside a `PrismProvider`; since the provider is optional, a consumer who
does not mount it does not call the hook.

`PrismThemeScript` is the optional blocking pre-hydration script a consumer
places in `<head>` to apply the stored pack and mode before React hydrates. Its
mechanism, and the server-cookie alternative, are ticket 08's; this ticket only
puts it on the provider entry.

**No escape hatch.** The system has exactly one source of truth, so there is no
consumer-side override seam. When Prism lacks a component, token or variant, the
consumer requests it upstream; there is no local merge, wrapper-theme or
value-injection path. The contribution path itself stays fog on the map
("The contribution path") and is the one governance gap this answer does not
close; see the report.

### 4. The theming API: declarative default, programmatic opt-in, two axes

Both, with the declarative form as the default and the programmatic form as
strictly additive.

- **Declarative.** Put `data-pack="<id>"` and, for dark, `class="dark"` on
  `<html>`. This is SSR-safe, needs no JavaScript, and is inherently
  flash-free. `default` is expressed by omitting `data-pack`, exactly as the
  current site deletes `data-theme` for its Default option.
- **Programmatic.** `PrismProvider` plus `usePrismTheme()`, which writes the same
  two attributes and persists the choice. No other programmatic path exists.
- **No `createPrismTheme`.** There is no factory producing a frozen theme object
  and no override object to pass. The old per-key merge is the escape hatch the
  standing preference forbids, so it is removed rather than re-shaped.
- **Pack and mode are two axes.** `data-pack` selects the palette, `.dark`
  selects the mode; neither implies the other and neither is a "theme" in the
  API. This is ticket 06's vocabulary (`pack` x `mode`), and the neutral base is
  the pack id `'default'`, whose markup is the absence of `data-pack`.
- **The attribute name is fixed here, scoping is ticket 08's.** Ticket 06 renamed
  the runtime axis to `data-pack` and kept `.dark`; this ticket therefore deviates
  from the recommended `data-theme` and commits to `data-pack` + `.dark` as the
  public contract. Ticket 08 owns the CSS selector *shape* (root vs descendant)
  and may not rename the axes. Because the provider writes the attributes, a
  future rename stays internal and non-breaking.
- **Flash-free switching is not re-decided.** It is coordinated with ticket 08's
  measured first-paint mechanism (blocking script vs server cookie) and ticket
  06's emitted selectors. `PrismThemeScript` is the placeholder for whatever 08
  chooses.

`@nanisoft/prism-ui/theming` exports the vocabulary and pure helpers, not a theme
factory. This adjusts ticket 05's illustrative label ("createPrismTheme and the
pack model"), which ticket 05 explicitly delegated to this ticket:

```ts
export const PACKS = ['default', 'blush', 'mint', 'lavender', 'sky', 'peach'] as const
export type PackId = (typeof PACKS)[number]
export const MODES = ['light', 'dark'] as const
export type Mode = (typeof MODES)[number]
export function parseStoredTheme(raw: string | null): { pack: PackId; mode: Mode } | null
export function themeAttributes(input: { pack: PackId; mode: Mode }):
  { 'data-pack'?: string; className?: string }
```

`themeAttributes` returns markup attributes, never CSS values; it is the
isomorphic helper server components use to render §4's declarative form. Ticket
14 records whether `default` is called a pack or the base palette; this ticket
fixes it as the selectable neutral id.

### 5. The public export surface: ticket 05's map, instantiated

Exactly the keys ticket 05 writes out. (Ticket 05 says "thirteen"; its own block
lists twelve. The twelve below are the contract, and the off-by-one is retired
here so no one re-opens the map.)

| Key | Exports |
| --- | --- |
| `.` | the curated barrel of the most-used components, blocks and types. No styles, no runtime side effects. |
| `./provider` | `PrismProvider`, `usePrismTheme`, `PrismThemeScript`. |
| `./components` | every component. |
| `./components/*` | **one component module**, e.g. `./components/card`. |
| `./blocks` | every block. |
| `./blocks/*` | one block. |
| `./pages` | every page. |
| `./pages/*` | one page. |
| `./theming` | `PACKS`, `PackId`, `MODES`, `Mode`, `parseStoredTheme`, `themeAttributes`. |
| `./catalog` | the checked catalogue (ticket 09). Tooling only. |
| `./styles.css` | the one stylesheet. |
| `./package.json` | the manifest. |

- **Compound parts stay inside their parent module.** `./components/card` exports
  `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`,
  `CardFooter` together; there is no `./components/card-header`. A `*` subpath is
  one **module**, not one **export**, and compound parts do not form a second
  vocabulary (the old glossary's rule, kept).
- **No variant recipes on the surface.** `buttonVariants`, `badgeVariants` and
  `cn` are internal. The component takes `variant`/`size` props; a raw cva map is
  a CSS recipe and is exactly what the old repository put out of scope. To render
  a button as an anchor, use the documented polymorphism slot (the component API
  ticket owns the exact prop), not `buttonVariants({...})` on a `<Link>`.
- **`./catalog` is tooling.** The site, corpus and MCP read it; a consumer's
  runtime UI must not import it. That resolves ticket 05's noted tension: it is
  in `exports` because a package cannot be imported through an interface it does
  not expose, and it is semantically tooling-only rather than a consumer API.
- `./products` stays dropped, per ticket 05.
- **A consumer's layout example for components:**

```tsx
import { Button } from '@nanisoft/prism-ui/components/button'
import { Card, CardHeader, CardTitle, CardContent } from '@nanisoft/prism-ui/components/card'
```

### 6. The no-escape-hatch rule, made checkable

Restated for this architecture, then enforced:

- **Base UI is an internal dependency and is not re-exported.** No public
  declaration references a Base UI type, and no component re-exports an upstream
  props object (`export type { SelectRootProps } from '@base-ui/react'` is
  banned; `ComponentProps<'button'>` is fine because it is React's).
- **No raw tokens or CSS recipes on the surface.** No `cn`, no cva variant maps,
  no token values, no `--var` names as consumer-facing constants.
- **The gate.** A new `scripts/check-surface.mjs`, wired into ticket 05's `check`
  task and owned by ticket 15, scans every emitted `dist/**/*.d.ts` for a
  `@base-ui` module specifier or type, and fails on any exported identifier that
  is a class-variant recipe or a re-export of an upstream dependency. It uses the
  same emitted-declaration seam as the corpus (ticket 05), so it checks what the
  package promises rather than what its source imports.
- **Said plainly.** A consumer can still `pnpm add @base-ui/react` themselves and
  import it. The rule is therefore **architectural for our surface** (we never
  hand it across the seam) and **documentary for theirs** (we cannot stop them
  importing it, and a contract violation is a review matter).
- **`className` and `style`.** Components accept React's standard props, and
  `className` is permitted for **layout only** (grid placement, width). Using
  either to change a Prism-owned visual property is prohibited by §9 and, like
  installing Base UI, is documentary rather than gated. This is the one place the
  rule is not machine-checkable, and it is stated rather than hidden.

### 7. The component authoring contract

- **File shape.** One `.tsx` per component: `packages/ui/src/components/ui/<name>.tsx`;
  blocks at `packages/ui/src/blocks/<slug>/`; pages at `packages/ui/src/pages/<slug>/`.
  Each module has a single entry (for compound items, the barrel within the
  module directory) matching its `./components/*`, `./blocks/*`, `./pages/*`
  subpath.
- **Styles are utility classes, never CSS modules**, and consume semantic
  utilities only (`bg-background`, `text-muted-foreground`, `border-primary`).
  No raw hex outside `packages/tokens/src/foundation`; no ramp utility
  (`bg-neutral-900`, `text-brand-500`).
- **Motion is by token only.** Components use `duration-fast|base|slow` and
  `ease-out|ease-in-out`; no raw millisecond or `cubic-bezier(...)` literal, and
  no keyframes. Ticket 06's `check-motion.mjs` grep gate enforces this.
- **Documentation lives in a JSDoc comment on the exported component** (`/** ... */`).
  The `tsc` declaration build preserves it into the emitted `.d.ts`, which is
  what the corpus reads (ticket 05). A component with no JSDoc block has no
  corpus entry.
- **Compound parts are internal to the parent module** (§5) and are exported from
  it, not from subpaths.
- **`data-slot` is internal markup metadata**, useful for tests and debugging, and
  is not a documented styling API.
- **Which local `DESIGN.md` rules survive.** The **Semantic-Utility Rule**
  (grep-enforced, plus the motion gate), the **Alias-Only Rule** (no raw hex
  outside the foundation), and the **Contract Rule** (semantic names emitted
  verbatim) all survive as written. "Primitive" as a unit noun is retired by
  ticket 09; this ticket uses Component/Block/Page. The two hand-written docs-app
  rules (global `* { @apply border-border }` and `body` styling) are site choices
  and do **not** move into the library; Prism's base layer is its own.
- Handed to ticket 15: `check-surface.mjs`, the JSDoc-present check, and the
  grep/gate list above.

### 8. Blocks and pages

- **A Block** is a pre-composed, product-agnostic section. It accepts **data and
  content as props** (including documented `ReactNode` slots) and **never fetches
  application data** - no `fetch`, no react-query/SWR, no route params, no server
  actions, no reading of a global store. It is a Server Component by default and
  ships no string, number or sample data of its own; every one is a prop. It
  composes `Section`/`SectionHeading` for rhythm.
- **A Page is a shipped component**, not a documented recipe. It lives at
  `packages/ui/src/pages/<slug>/` and is installable as
  `@nanisoft/prism-ui/pages/<slug>`, matching ticket 09's definition of a
  catalogue Page as an "installable composition demo - a product-agnostic screen
  model". A Page is a full screen composed of blocks and components and receives
  **application-owned navigation, content and data** through documented slots and
  props (`navigation`, `children`, data props). Like a Block it never fetches and
  never imports `next/link`, `next/navigation`, a router or a data client; the
  app passes links and nav in as nodes. The site's own landing page is not a Page
  (ticket 09, Q7).

Both layers avoid the `/products` layer dropped by ticket 05; the taxonomy is
Component -> Block -> Page and nothing else.

### 9. What a downstream product may do (exhaustive)

**May:**

1. Install `@nanisoft/prism-ui` (and its linked `@nanisoft/prism-tokens`).
2. Import `@nanisoft/prism-ui/styles.css` once, in the app root layout.
3. Import and compose Prism components, blocks and pages under the subpaths in
   §5.
4. Pass documented props, content and data to them, including `children` and the
   documented content/navigation slots.
5. Choose a pack and a mode, declaratively via the `<html>` attributes or
   programmatically via `PrismProvider` and `usePrismTheme`.
6. Read `@nanisoft/prism-ui/catalog` for tooling, docs or an agent surface - not
   for runtime UI.
7. Use `className` for layout positioning only, and write their own unrelated
   application CSS.

**May not:**

1. Install or configure Tailwind, PostCSS or a token plugin to reproduce Prism's
   utilities or tokens, point `@source`/content scanning at Prism's package, or
   re-declare any Prism `@theme` namespace or custom property.
2. Import Base UI (from us - it is not exported; installing it themselves is a
   contract violation that is documentary, not architectural).
3. Import internal paths: `packages/ui/src/**`, `packages/tokens/dist/**` other
   than `styles.css`, `lib/utils`, `cn`, or any variant recipe.
4. Override a style by any means - `className` beyond layout, `style`,
   `!important`, higher-specificity CSS, targeting Prism's `data-slot`, or
   forking/copying the source. Copy-out is not a distribution lane.
5. Use the shadcn registry as a public install lane (it is an internal integrity
   artifact).
6. Author custom keyframes, transitions or durations, or hardcode a Prism token
   value.

Anything not on the first list is prohibited by the standing preference; the
second list is the exhaustive working set, so a prohibition has a name.

### Consistency and hand-offs

- **Ticket 05:** exports instantiated verbatim (with the twelve-key correction);
  `styles.css` and `sideEffects` unchanged; the `tsc` plus asset-copy build
  unchanged; the corpus-reads-emitted-declarations seam reused by the surface
  gate.
- **Ticket 06:** components consume `duration-fast|base|slow` and
  `ease-out|ease-in-out`, never a literal; typography and spacing utilities are
  semantic and token-bound; `data-pack` + `.dark` are the axes.
- **Ticket 08:** selector scoping and the first-paint mechanism remain 08's;
  `PrismThemeScript` is its seam and `themeAttributes` is its server helper. The
  `data-pack` attribute name is fixed here so 08 does not re-decide it.
- **Fog left deliberately:** the contribution path (what a product does when
  Prism lacks something). It is the one open question this adoption contract
  surfaces rather than answers.
- **`codebase-design` closure:** the public surface (`components`, `blocks`,
  `pages`, `styles.css`, `provider`, `theming`, `catalog`) is the seam. Depth
  lives behind it - the provider hides hydration, persistence and document
  mutation; the components hide Tailwind and the token cascade. The deletion test
  passes: deleting `PrismProvider` while keeping the declarative attributes
  loses only programmatic switching, so the provider earns its keep as the one
  stateful module rather than as a pass-through.
