# @nanisoft/prism-ui

## 0.8.0

### Minor Changes

- 86cbc20: The accessible name a control announces is now a prop, so a consumer can localise it
  
  `Pagination`, `Dialog` and `Breadcrumb` each shipped an `aria-label` that a
  consumer could not change, and `ProductSwitcher` shipped a `label` default that
  put the word "Products" into every consumer's navigation. A consumer could
  localise the visible text of a pagination step and not the name a screen reader
  announced for it, which left a control that looked localised and was half of it.
  
  What changed:
  
  - `Pagination` takes `label` for the region name, and each of `PaginationPrevious`
    and `PaginationNext` takes `label` beside its existing `text`, so the visible
    word and the announced name move together.
  - `Dialog` takes `closeLabel` for the built-in close control, so a localised
    dialog no longer announces "Close" in a product that never uses that word.
  - `Breadcrumb` takes `label` for its region name.
  - `ProductSwitcher` no longer defaults `label`. A switcher with no `label`
    renders a navigation with no accessible name, which is a real state the caller
    resolves, rather than one that is quietly wrong.
  
  Every new prop keeps the word Prism would have used as its default, so nothing
  changes for a consumer that never set one. The one behaviour that does change is
  `ProductSwitcher`'s, and it is the point: the default was a claim about a
  consumer's product that the prop existed so they would not have to make.
- b31e444: Ship the consumer gate kit, so a cross-repository law reaches a consumer in one release
  
  The four repositories that consume this package coordinated through a prose
  contract mirrored in four files. It could not be enforced, because prose cannot
  fail, and it had already drifted: two sites that mattered held three
  implementations of one rule and one of the three rules was false.
  
  The laws are now the failure messages of gates in this package, and a consumer's
  repository holds only its own data.
  
  ```sh
  pnpm exec prism-gates                 # every gate prism-gates.json names
  pnpm exec prism-gates --gate=links    # one gate
  pnpm exec prism-gates --json          # machine-readable, for a test
  ```
  
  Configure it with a `prism-gates.json` at your repository root. A consumer holds
  its stylesheets, its pack map, its coverage floors, the destinations its own
  corpus gets wrong, and the custom properties its own build supplies. It does not
  hold the wording of a rule, because a wording held in four places is four rules
  that will disagree.
  
  The gates are `pin` (the design system is an exact version, and the token package
  is this package's dependency rather than yours), `retired-line`, `stylesheet-ownership`
  with `token-read`, `links`, `pack-boundary`, `hidden-state` and `runtime-token-read`.
  
  **This release adds the `gates` export subtree and a `prism-gates` binary, and
  adds `gates` to `files`.** It also means a consumer no longer needs to declare
  `@nanisoft/prism-tokens`: resolve it through this package, which requires it at an
  exact version, and the pair cannot be mismatched. Removing the token package from
  a consumer's `package.json` and from its `pnpm-workspace.yaml` is part of the
  adoption; the `pin` gate fails on either.
  
  The kit is outside `dist/` on purpose. It is a build-time program for another
  repository and must never enter a consumer's module graph or its bundle.
- 86cbc20: Add `LiveRegion`, a region that announces what just changed in it
  
  Prism had no live region at all, so a result list that filtered as you type, a
  search whose count updated, and any stream that appended to the page all changed
  silently for anyone using a screen reader. The fourth Kind the design rules
  already decide, `live`, is specified to own an event log surface, and an event
  log surface is a live region, so this is the prerequisite rather than a
  convenience.
  
  ```tsx
  <LiveRegion busy={streaming} label="Run output">
    {lines.map((line) => (
      <p key={line.id}>{line.text}</p>
    ))}
  </LiveRegion>
  ```
  
  Three decisions are in the Component rather than left to each consumer to make
  the same way:
  
  - **It renders nothing when it has nothing to say.** A live region that is
    always present announces every unrelated state change of its ancestors, so an
    empty region is not rendered at all rather than rendered as an empty element.
    The test is "renders nothing" rather than a list of the nothing values, because
    an empty string, a null state and a false condition are three routes to it and a
    list of three is a list a fourth route would miss.
  - **The politeness default is the least interruptive value still announced.** A
    run log that announces assertively interrupts a screen reader mid-sentence, and a
    consumer with a genuinely urgent event passes `politeness="assertive"`.
  - **`aria-busy` is about the caller's knowledge, not about an animation.** A busy
    region is still readable, and a caller that sets it permanently has told
    assistive technology the stream never ends.
  
  The component owns the region and not the transport. A consumer owns the socket,
  the retry, the persistence and the order events arrive in, which is the same split
  the documentation Page makes with its navigation, and it is why Prism stays
  transport-agnostic and no consumer inherits a connection it did not ask for.
- 86cbc20: Add `Mark`, so a search result can show which characters matched
  
  A command palette and a search result list both need to show why a result
  matched, and until this existed the only way to do that inside Prism was to drop a
  span with hand-written styling into a consumer's own markup, which the authoring
  contract does not permit.
  
  ```tsx
  <Mark text="component library" ranges={[{ start: 0, end: 9 }]} />
  ```
  
  It takes the string and the ranges rather than pre-split nodes, because a caller
  that assembled the nodes had to compute the ranges and this Component has the
  string. The ranges are handled rather than refused: they are sorted, overlapping
  runs are merged, and a range that runs past the end of the string is clamped. Each
  is a thing a search backend does as a matter of course, and a Component that threw
  on any of them would be one a consumer has to wrap in a try, which is a worse
  failure than a highlight that stops at the last character.
  
  **It adds no semantics, and that is the decision rather than an omission.** A
  consumer marking a hit wants a visual difference, not a screen reader announcing
  "highlighted" between every character of a result. So it styles a `mark` and puts
  nothing else on it, and a consumer who wants the announcement writes it.
  
  The treatment is the existing warning token pair rather than a new role. A mark
  sits behind the text it marks, so it needs a ground and a foreground, and that
  pair is already measured against every surface in every pack and both modes by the
  token contrast gate. A search hit is emphasis and not a caution, and the two are
  kept apart by spending the existing token rather than by adding a role that means
  "highlighted" and will be re-pointed at something else within a year.
- 86cbc20: Add `Tree`, so a file browser, a category tree and an outline have something to build from
  
  Prism had a working tree and could not reach it. The implementation existed as
  two private renderers inside the documentation Page, with its depth rule, its
  current-item marking and its rule that a group with no index renders a label.
  What was missing was that it was unreachable, and that its data type was bound to
  documentation navigation rather than being a tree's own vocabulary, so a file
  tree, a category tree, an outline and a knowledge base all had nothing to build
  from.
  
  ```tsx
  <Tree
    label="Documentation"
    currentHref="/foundation/colors"
    nodes={[
      { type: 'group', title: 'Foundation', items: [
        { type: 'page', title: 'Colors', href: '/foundation/colors' },
      ] },
      { type: 'divider', title: '' },
      { type: 'page', title: 'Overview', href: '/overview' },
    ]}
  />
  ```
  
  **It is navigable by the arrow keys**, which is the part a consumer cannot
  assemble for themselves. A tree is one Tab stop and the arrows move inside it.
  Composing the markup gives the Tab order of the document instead, which is every
  node in the tree and none of the arrows. The flat order is collected from the DOM
  rather than computed from the node data, so there is no second list to fall behind
  the first, and a label is skipped rather than focused and doing nothing.
  
  **A flat list renders a flat tree.** An outline is a tree of depth one, so a caller
  passes leaves and gets leaves. A Component that required nesting to express a flat
  structure would make the common case the awkward one.
  
  **A group with no index is a label, not a link.** This is the rule the
  documentation Page already reasoned at length and it is carried across rather than
  reinvented: a group with an index is a destination and renders an anchor, a group
  without one renders a span that carries no `href`, is not focusable, and cannot be
  reached by Tab. Inventing a route for it would publish an address that resolves to
  nothing. The empty case is authored too, because a tree that renders nothing is a
  control with nothing in it.
  
  The documentation Page keeps its own renderers and does not change. Its two rules
  are specific to a documentation rail, which is one shape a tree takes rather than
  the shape. Whether the Page later composes this Component is a separate decision
  this does not make.

## 0.7.0

### Minor Changes

- 5c43520: Add `DocsShell`, a documentation page that takes a site's navigation as data
  
  `DocsShell` is a documentation screen: a navigation rail, the document, a
  contents rail, and a pager to the neighbouring pages. It replaces the unstyled
  `docs-shell` the retired line published, and it is the Page the three NaniSoft
  product sites already import by that name.
  
  The navigation is data. A tree of one page and a tree of twenty-seven render the
  same way, at any depth, and the frame is sized by what the caller passed rather
  than by a fixed arrangement, so three sites whose documentation sets differ in
  shape share one Page with no per-site fork.
  
  - `nav` and `toc` are closed unions of `page`, `group` and `divider`. Both are
    read in the order given: nothing is sorted or alphabetised, so a site that
    files its rail as a pipeline and its contents as a reference has both in one
    render.
  - The pager is derived from `nav` and `currentHref`. There is no `neighbours`
    prop, so a neighbour that is not in the tree cannot be expressed, and each
    consumer loses one derivation of its own.
  - A group with no `href` renders a `span` rather than an anchor with no
    destination. The three sites spell that case today as an empty string, and two
    of them carry a stylesheet rule that styles the result back into a label; those
    rules are now deletable.
  - A section carries no status, no badge, no count, no collapse and no sort. A
    status written into a title stays in the title as words.
  - Both rails are bounded against the viewport, because one site's tree is half
    again as tall as another's.
  
  The corpus fix that shipped with it: the props extractor read each declaration
  body twice with two depth counters that disagreed, so a Page whose `index.tsx`
  re-exported a value and a type from one sibling published every prop twice and
  swept the members of its navigation union into its own prop list. It now reads
  each body once.

## 0.6.0

### Minor Changes

- 956fc8f: A call to action with a destination renders a link, and an icon is required only where a tile is
  
  Every primary call to action in the Block family declared an `href` its type then
  never rendered. The control was a `<button>` with no handler: the type said the
  component could navigate, the documentation implied it, and the markup could not
  do either. Sixteen of them across the family, five of them to another origin.
  
  **`CtaLink` is a new Component.** It renders a native `<a>` and carries the
  visual weight of a call to action, so assistive technology announces a link and
  the browser's own affordances all work: a status bar showing the destination, a
  context menu to copy it, middle-click to open a new tab. It is a Component in its
  own right rather than an `as` or `href` prop on `Button`, which is the answer
  `BreadcrumbLink` and `PaginationLink` already give twice in this package. It is a
  server component, so the swap costs no client JavaScript.
  
  `href` is required on `CtaLink`: an anchor without one is not a link. `newTab` is
  a declared prop and the only way to open a new browsing context, because `target`
  is not accepted, so the relationship cannot be opted out of by accident. When it
  is set, `rel` defaults to `noopener noreferrer`; a consumer that needs a
  different relationship passes `rel` and it wins. Prism does not parse the
  destination and does not decide what counts as external.
  
  **`Cta01` no longer offers an action that navigates nothing.** `Cta01Action`'s
  `href` is required, there is no optional arm and no dead-button arm, and a new
  `actionSlot` takes a control the Block does not own, such as a client router's
  link. The Block makes no guess about cross-origin. The one rendered change in
  this release is a button becoming the link its type always said it was: the link
  is styled from the same recipe as the button it replaces, at every shared variant
  and size, and a test asserts that class-for-class.
  
  **`FeatureGrid01`'s icon is required only where a tile is rendered.** The
  requirement is a union discriminated on `variant` rather than an optional prop,
  because an optional prop turns a safe-at-render condition into an unsafe one and
  permits an empty accent tile per feature. The `icon` variant is the one an
  omitted `variant` selects, so the default and the required icon live on the same
  arm; the `bare` variant renders no tile and requires no icon, and the type says
  so rather than the renderer finding out. `IconFeature` and `BareFeature` are
  exported, and the union is the type the site's API table is extracted from.
  
  **The version the four downstream site plans pin is `0.6.0`.** It is
  `@nanisoft/prism-ui@0.6.0`, and `@nanisoft/prism-tokens@0.6.0` with it, because the
  two are linked in `.changeset/config.json` and the pending
  `a-server-rendered-pack-boundary-can-be-mode-correct` changeset already declares a
  minor for both from `0.5.1`. This one declares a minor as well and so does not
  raise it.
  
  Migration: a `Cta01` action needs a destination. Where the action was a label
  alone, give it the `href` it was always declared with, or move the control into
  the new `actionSlot`. A `FeatureGrid01` in the `bare` variant can now drop the
  `icon` its type used to demand; the `icon` variant still demands one per feature.
- d001983: A diagram is a Component, and a product's mark is one item rather than two copies
  
  Three of the four product sites draw something in the position where an empty box
  is most visible, and all of it was a canvas. A canvas reads computed style from
  one element while a pack is an attribute on an ancestor, so a scoped `data-pack`
  boundary hands it the pack's light values on a dark page, and no token gate can
  see it: the value the drawing holds is a legal token value, applied to the wrong
  pack. Cutting the canvases without a replacement is the alternative, and it
  leaves three heroes with an empty slot.
  
  `Diagram` draws named things and the labelled relations between them as inline
  vector markup. Every stroke and every fill is a semantic utility, never a
  resolved value, so a boundary restyles the drawing through the cascade exactly as
  it restyles a heading. It is a server Component: no hook, no mode, no context, no
  prop spread, and no client code, so a consumer renders it from a server file
  with no provider mounted. Its node mark is a circle and a relation is a path
  because both are shapes with no radius concept, which is what keeps a boundary
  from moving anything but colour; a `<rect>` was rejected because its corner
  attribute is a CSS property and no utility pins it. Every mark names an explicit
  stroke width, an explicit stroke and an explicit fill, because a shape left to
  its defaults either paints opaque black over its own labels or resolves its edge
  to the surface it sits on. A relation naming a node it does not have is dropped,
  and the count of dropped relations is on the element rather than swallowed.
  
  `ProductMark` promotes the two-part mark the product row and the product switcher
  each hand-wrote into one catalogue item. The ring is `brand-ink` and the core is
  `primary`, which is not a preference: a pastel brand value is a fill and never
  text, so the core may be `primary` and the name may not, and a wordmark reads
  `brand-ink` rather than `foreground` or `primary-foreground`. A hand-written copy
  gets one of those two wrong and nothing in the rendered result says which. The
  mark carries its own `data-pack` boundary, so a product's hue follows from the
  pack the caller passed rather than from whichever pack the page is wearing, and
  the boundary sits on an element with no radius utility, which is the placement
  the pack-boundary law allows. A product with no pack of its own is drawn as the
  full spectrum rather than as a colourless mark, built from the five series tokens
  because they are the only five-way colour set the contract publishes.
  
  `scripts/check-vector-ink.mjs` holds both Components to the emitted contract. It
  fails a literal colour, a gradient whose stops are not contract references, a
  `var(--x)` naming a property the contract does not publish, and a paint utility
  whose suffix is not a contract role, which is the last of the four a colour
  regex cannot see because a Tailwind class is a name and not a value. Its scanned
  set is a declared list of two file names rather than a pattern, a Component that
  is not on disk fails the run rather than emptying it, and every exclusion carries
  a reason and is printed on every run, with an exclusion that resolves to nothing
  a finding rather than a line that quietly stops appearing.
- 4f9ce77: A server-rendered pack boundary can now be mode-correct
  
  The only dark selector for a pack was `[data-pack="<id>"].dark`, which requires
  the mode class on the same element. A server cannot know the reader's mode, so a
  subtree carrying a second pack rendered in that pack's light values on a dark
  page. The token build now emits the two-member list
  
  ```
  [data-pack="<id>"].dark, .dark [data-pack="<id>"]
  ```
  
  as one rule with one declaration block, for all five packs. The compound half is
  retained, because it is what a dark surface on a light page is and it is a
  capability the package already published.
  
  Consumers get a second change alongside it. `themeAttributes` now takes `mode` as
  optional, because a required one is that same impossibility written into the type:
  the only way to ask for a boundary with no mode class of its own was to pass
  `'light'` as a guess, and the guess is wrong for half of readers. Omitting `mode`
  is the honest spelling of "wear the mode of the element carrying `.dark`". The
  change is a widening, so every existing caller still compiles.
  
  The theme-boundary law in `DESIGN.md` is rewritten to match. It previously
  instructed an implementer to put `data-pack` and `class="dark"` on a boundary
  together, which works for a client-applied boundary and cannot work for a
  server-rendered one.
- c126ee3: A stored theme is written when a reader decides, and not before
  
  `PrismProvider` wrote `prism-theme` on every resolved change, including the
  first resolution from the server-rendered attributes or from its own defaults. A
  first-time visitor therefore ended the load with a stored value they never chose,
  and that value outranked the site's default on every later visit, so a site that
  changed its default could not reach anyone who had ever loaded the page.
  
  The write is now gated on a decision. It happens when a caller changes the pack,
  the mode or the toggle, and when the library recovers a decision from
  `prism-theme-mode`, a key earlier lines wrote and this one does not. It does not
  happen on a first resolution from the document or the defaults, so a first visit
  ends with an empty store and a returning visit keeps its choice.
  
  Two readers of one stored value now share one rule. `resolveTheme` in
  `@nanisoft/prism-ui/theming` is the rule, `PrismProvider` calls it, and the boot
  script implements it as a string. The script cannot import the function, because
  the build minifies and a renamed identifier inside its own `try` would throw
  there and fail open, so the two are held together by a build-failing equivalence
  gate that runs the emitted string and the rule over one table of stored values:
  nothing stored, a valid pair, a valid mode with a retired pack, a valid pack with
  a retired mode, garbage, a JSON array, a JSON string, `null`, an empty object, a
  partial, a server-rendered pack and mode, and the retired key. Every fall-through
  is asserted to be whole, which is the divergence this fixes: the old string
  validated the pack and the mode independently, so a stored `{ mode: 'dark' }` with
  no pack half-applied there and fell through whole in the rule.
  
  A value that is present but is not a pair is no longer repaired field by field,
  and it is not cleared. It is the only record that this reader ever chose anything.
  
  The boot script records where the theme came from in `data-theme-origin` on
  `<html>`, and it is the only writer: the provider never touches it, because two
  writers would make the origin a race rather than a record. The value is one of
  
  | Value | Meaning |
  | --- | --- |
  | `stored` | the key held a valid `{ pack, mode }` pair |
  | `legacy` | the key was empty and `prism-theme-mode` held a recoverable mode |
  | `unparsed` | the key held a value that is not a pair, and the theme fell through whole |
  | `document` | the key was empty and the root element's own attributes supplied the theme |
  | `default` | neither did, so the consumer's defaults apply |
  
  It is written on every path the script reaches, so an absent origin is never an
  unread one. It is not `data-theme`, which the migration guide retires; it records
  the provenance of a resolution and never a pack.
  
  The migration clause reads `prism-theme-mode`, puts the recovered decision in
  `prism-theme` and removes the key it read, in one guarded step. That is how it
  expires: it fires only while a retired key still holds a mode, at most once per
  reader, and it is retired for good by deleting the last entry of
  `LEGACY_MODE_STORAGE_KEYS`. There is no date and no version constant in it.
  
  The pre-paint string gets its own ceiling in raw bytes,
  `check-boot-budget.mjs`, because it runs before paint on every page and adding it
  to the per-component client budget would corrupt the unit that table measures. The
  ceiling is derived by addition: the pinned non-migration base, plus the measured
  clause, plus one migration generation.
- 76c8d96: Fourteen items, four catalogue gates, and a Block that publishes its interface
  
  **Fourteen items ship.** Three Components (`Prose`, `FactList`, `ProductSwitcher`),
  nine Blocks (`ProcessRail01`, `StatusLedger01`, `ProductGrid01`, `StackGrid01`,
  `LogoStrip01`, `NoteGrid01`, `InstrumentPanel01`, `SiteHeader`, `SiteFooter`) and two
  Pages (`NotFoundPage`, `BlogPostPage`). Every one of them earns its place by the
  growth rule rather than by taste: a marketing Block when at least three of the four
  sites compose that section today, a Component when it has one job no existing
  Component can express. The evidence is in the ticket and in each item's own
  JSDoc, which names the sites and the line numbers.
  
  **The three contested shapes are settled as specified, and the specifications
  held.** A process rail admits four steps and refuses five, in the type: `steps` is
  a tuple union, so a five-element array is a compile error and not a fifth column. A
  status ledger has four tiers rather than five, and the words for a tier are the
  caller's: the four sites between them use eight words for those four states
  (`live`, `available` and `complete` are one; `approved`, `specified` and `designed`
  are one; then `planned`; then `direction`), and the vocabulary is what `statusLabel`
  is for. A product row's mark is two parts because a filled dot fails contrast on a
  light card, so the mark is `ProductMark`: a hairline ring in `brand-ink` around a
  core in the product's own `primary` fill, with the name in the brand ink beside it.
  
  **Four gates the catalogue's own rules depend on now exist and are wired into
  `check` and, because they read only `src/`, into `build`.** `check-item-docs`
  holds AGENTS.md's claim that a documentation comment is the only path from an Item
  to its published interface. `check-block-copy` holds DESIGN.md's claim that a
  Block ships no copy and no sample data. `check-item-category` holds CONTEXT.md's
  closed set of seven Categories and the sentence that a Block and a Page have none.
  `check-block-imports` holds the claim that a Block fetches nothing and a Page
  imports no router and no data client. Each resolves its roots from its own
  location, fails a root that resolves to nothing, prints its coverage and every
  exclusion on every run, has no report-only mode, and is proved red by a fixture
  before it is proved green.
  
  **Two of those four gates were red on the tree they were written against, and both
  findings were real.** `check-item-docs` found seven exported functions whose
  documentation comment was not attached to the declaration: `CardHeader`,
  `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `SectionHeading` and
  `Hero01`. A comment three functions above a declaration does not reach the emitted
  `.d.ts`, so those seven were absent from the corpus. `check-block-copy` found
  `pricing-01` rendering the word "Popular" on a featured plan that passed no badge:
  a hardcoded claim every consumer of the Block inherited, published by the corpus as
  part of the Block's own documentation. The fallback is gone; a featured plan with
  no badge now renders no badge.
  
  **Five additive fields on four shipped items**, each with three of the four
  consumers passing a value the item could not take, counted per consumer with a
  file and a line and never per string. `SectionHeading.index`, for the mono ordinal
  all four sites render above every section head (www `Landing.tsx:49`, atlas
  `landing.tsx:48`, nexus `Landing.tsx:38`, alphalens `Landing.tsx:66`).
  `Cta01.secondaryAction`, for the pair of actions all four closing bands render
  (www `Landing.tsx:186`, atlas `landing.tsx:243`, nexus `Landing.tsx:221`,
  alphalens `Landing.tsx:285`). `Cta01.note`, for the footnote three of the four
  render under it (atlas `landing.tsx:250`, nexus `Landing.tsx:228`, alphalens
  `Landing.tsx:292`). `FeatureGrid01.numbered`, for the ordinal all four render on
  every card (www `Landing.tsx:166`, atlas `landing.tsx:116`, nexus `Landing.tsx:132`,
  alphalens `Landing.tsx:142`). `Hero01.align`, for the left-aligned hero three of
  the four compose (atlas `landing.tsx:69`, nexus `Landing.tsx:63`, alphalens
  `Landing.tsx:87`). All five are additive: nothing changed shape and nothing was
  removed.
  
  **A Block and a Page publish both an interface section and a composition section.**
  `packages/llms` read the extractor's output for a Block and threw the interface half
  away, so the tool told an agent a Block had no own props. The extractor reads a
  named props type off an emitted declaration whether that declaration belongs to a
  Component or to a Block, so both sections are now built and both are assembled into
  the mirror file, `llms-full.txt` and the Store's `doc`.
  
  The Store now carries both fields for every kind, and `get_item_props` prints
  both when it has both. The sentence "a Block has no own props" is gone from the
  tool as well as from the published document. It was the one place the two
  sections were still exclusive, because that tool branched on `item.props` and
  fell back to the composition section, so a Block was answered with its
  composition and a denial of the interface it publishes. The test asserts the
  sentence's absence, so a refactor that restores it fails even if the composition
  is still printed, and a second test covers the one-present case so the
  both-present branch cannot swallow it.
  
  **Four accessible names became required props** on `SiteHeader`, `LogoStrip01`,
  `NotFoundPage` and `BlogPostPage`, and a Block that ships no copy ships no
  reader-facing copy either. `navLabel`, `productsLabel`, `label`, `linksLabel` and
  `trailLabel` are words a screen reader reads out, and no Block should be choosing
  them for a consumer whose site calls its own landmarks something else. This is the
  one breaking change in the release, and it is on four new Blocks and two new Pages
  plus one new required prop on `SiteHeader`, all of which are new in the same
  release, so no existing call site changes.
  
  **`ProductSwitcher.label` has no default** for the same reason: a consumer whose set
  is not a set of products should pass its own word rather than accept a claim about
  what the set is.

### Patch Changes

- 8d24f32: A pack boundary's effect on corner radius is stated, and gated
  
  A scoped `data-pack` boundary resolves the pack's colour AND the pack's corner
  radius beneath it, because radius is the only non-colour member of a pack block
  and the token build emits it the same way. The radius range across the five packs
  is 0.5rem to 1rem, so a row of elements each carrying its own pack shows a spread
  of corner radii, and a small pill becomes a different pill five times over. The
  governing law stated the colour half and was silent on the shape half, so an
  implementer following it exactly produced mismatched corners and called it
  correct.
  
  The law now states both halves and where a boundary may sit. The agent-facing
  surface no longer says the attribute belongs on the root element, which it did
  while listing the radius among the values it will pick up: a tool that shows the
  value and denies the subtree is worse than a tool that is silent.
  
  `check-pack-boundary.mjs` holds the law. It reads the emitted `--radius-*`
  bindings rather than a list of class names, which is the part that matters: a
  scale step like `rounded-xl` is `calc(var(--radius) * 1.4)`, so an element
  carrying one is pinned to a step and the step is pack-relative. The first version
  of the gate treated "carries a radius utility" as the safe case and passed
  exactly the defect the ticket is about. The gate also reads the colour contract
  from the token source, so a second per-pack axis the token build has not been
  asked about is a finding rather than a property silently counted as a colour.
  
  One live boundary was found and repaired: the themes page scoped five cards, one
  per pack, each with `rounded-xl`, so the page a reader uses to compare packs was
  comparing shape as well as colour. The cards now carry a literal radius and the
  pack's radius is shown in the row's own label, where it is information rather
  than an accident.
- feb1384: The catalogue is a set comparison between three lists, not a count
  
  A module on disk with no catalogue entry left every count correct. It shipped,
  `shadcn add` installed it, and `registry.json` listed it, so it was absent from
  the corpus, the documentation site and every agent-facing tool with a fully
  green gate run. The two lists a reader trusts, the catalogue and the registry,
  were on the wrong side of that hole, and the checks that believed they covered it
  compared lengths or compared a file against something derived from itself.
  `validate-registry.mjs` holds the registry against the disk and the manifest and
  never reads the catalogue. `sync-registry.mjs` reads the disk, so it cannot
  disagree with the disk about what is on it. The site's
  `test/catalogue-order.test.ts` holds the catalogue against the generated
  ordering and the documentation tree, and both are built from the catalogue, so a
  disagreement there is impossible by construction.
  
  `scripts/check-catalogue.mjs` reads the three sets independently and compares
  them in both directions, name for name, with one printed line per offending
  item. A length assertion cannot report which item is wrong, so nothing in the
  run reports a length on its own: the three set sizes print as supplementary
  coverage underneath the findings that carry the detail. All six directions a
  three-set comparison implies are implemented, plus the kind of an item in each
  pair of sets, the three naming rules that reconcile the three conventions, and a
  claim that a canonical key is held by only one entry in each set.
  
  The registry generator deliberately keeps reading the disk. Deriving the
  registry from the catalogue is the obvious way to remove the second list, and it
  would delete the disagreement the check exists to see, because the generator
  would then agree with the catalogue by construction.
  
  The version and the roster are two claims on two labelled lines, so a version
  bump and a roster error cannot produce the same output. The run states its
  coverage every time: roots resolved, files walked, files actually read, and how
  many comparisons passed. Roots resolve from the script's own location and never
  from the working directory, and a root that resolves to nothing fails the run
  naming both causes.
  
  `PRISM_CATALOGUE_ROOT` points a run at another package root. It changes which
  directory is read and nothing else, which is what lets the tests run the real
  command over a fixture tree and read the real output. The gate fails on a
  catalogue it cannot read, including an empty one: a roster that cannot be read
  and a roster with nothing in it are different facts, and only one of them is a
  green run.
- 4744cce: The Slider thumb rings at full strength, and the surface check now reads both ways
  
  Two changes, and only two, in the component package.
  
  **The focus indicator.** The Slider's thumb suppressed the browser outline and
  drew its ring at `ring-ring/50`, so the element a keyboard user lands on carried
  an indicator that composites to between 1.14:1 and 2.74:1 against every surface
  in all six themes. That fails WCAG 1.4.11 on the one indicator a keyboard user
  has, and the Slider's own JSDoc says it is reachable by Tab. Thirteen other
  components already drew that ring at full strength; the Slider was the one that
  was missed. Nothing said so, because the contrast gate measures the `ring`
  TOKEN and the alpha is applied in the component rather than in the token, so it
  reads the Slider's ring as compliant.
  
  `packages/ui/scripts/check-focus-indicators.mjs` is the new gate. It reads the
  class strings on the elements of every shipped Component, derives the set of
  components whose own JSDoc claims keyboard reach or operation, and fails any of
  them that suppresses a focus style without declaring a `ring-ring` colour at
  full alpha alongside a `focus-visible:ring-N` width. The claim is read from the
  JSDoc because `AGENTS.md` names that as this repository's documentation source,
  so a component that stops claiming to be focusable is a documentation change and
  shows up in the table the run prints rather than in a list someone maintains
  beside the code. The unit is a class string on one element, so a Dialog's panel
  or a Tooltip's trigger can suppress the outline legitimately; every such
  exclusion is declared with its reason, printed with the slots it resolved to,
  and fails the run if it stops matching anything. The run fails if the table
  empties, and states how much it read, classified, tabled and excluded.
  
  **The surface check.** `scripts/check-surface.mjs` compared the published
  surface against the source in one direction for two of its three rules. A
  wildcard subpath that resolved to zero declarations used to leave those two
  rules reading no file at all and the run still printed its success line, which is
  how a published surface drifts from its source without a consumer failing first.
  A wildcard target that matches nothing is now a finding naming the target. The
  internal side, which the gate deliberately did not check, is now a declared
  boundary checked in both directions: a new file under `dist/lib` is a finding
  naming it, and a declared internal declaration that is no longer emitted is a
  finding naming it too. The boundary and the per-target match counts are printed
  on every run. The three existing rules and their messages are unchanged.
  
  **The version the four downstream site plans pin is `0.6.0`.** It is
  `@nanisoft/prism-ui@0.6.0`, and `@nanisoft/prism-tokens@0.6.0` with it, because
  the two are linked in `.changeset/config.json` and the pending
  `a-server-rendered-pack-boundary-can-be-mode-correct` changeset declares a minor
  for both from `0.5.1`. The patch declared here does not raise it: changesets
  takes the highest bump in the queue, and a minor is already queued. A site plan
  that pins `0.6.0` therefore resolves every subpath the export map publishes,
  including `./components`, `./blocks`, `./pages`, `./provider`, `./theming`,
  `./catalog` and `./styles.css`.
  
  No public prop, no type and no export changed. The one rendering change is a
  ring alpha on the Slider thumb, in both modes.
- Updated dependencies [4f9ce77]
- Updated dependencies [5dcb347]
  - @nanisoft/prism-tokens@0.6.0

## 0.5.1

### Patch Changes

- 2fc6a0a: Retune `muted-foreground` so muted text clears 4.5:1 on the muted surface
  
  The base pack's `muted-foreground` moves from neutral 500 to neutral 600. It
  cleared 4.5:1 on the page background but fell to 4.34:1 on `muted`, where the
  pill, avatar fallback, kbd and tab-list pattern place it. The contrast gate now
  also checks `muted-foreground` on `muted`. The pastel packs were already pinned
  to their neutral 700 and are unchanged.
- Updated dependencies [2fc6a0a]
  - @nanisoft/prism-tokens@0.5.1

## 0.5.0

Prism was rebuilt from a fresh repository on a clean break. The package is now a
published React library a consumer installs and composes, not component source to
copy. It ships one precompiled `styles.css`, the optional `PrismProvider` and the
`data-pack` plus `dark` theme axes, and the Components, Blocks and Pages
taxonomy. There is no override path.

Changesets are appended above this entry for every published change.
