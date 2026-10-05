# @nanisoft/prism-tokens

## 0.16.0

### Minor Changes

- 1a0ba35: A page `h1` is now visibly larger than the `h2` sections under it
  
  A page `h1` rendered at 1.875rem and every section heading under it at 1.5rem, so
  the two were one fifth apart and the page had no top to its hierarchy. The fix is
  in the type scale rather than in the Component, because the scale stopped at `4xl`
  and there was no step for a page's own claim to take.
  
  **Two steps are authored, and they are the two widest gaps in the group.**
  `5xl` is 3rem and `6xl` is 3.75rem, both at a line-height of 1. Every other step
  in the `text` group is a whole multiple of 0.125rem and these two are too;
  `4xl` to `5xl` is four thirds, the first gap in the group wider than any gap it
  already had, and `5xl` to `6xl` is five fourths. They are authored as a pair
  rather than as one step because every rung of the heading ladder is a pair, a base
  step and one step up at `sm`, so a single step above `4xl` would have made the
  page heading the one heading in the system that does not grow at a width.
  
  Both steps reach CSS and the published pack contract the way every other authored
  step does, so `text-5xl` and `text-6xl` are utilities a consumer can compose, and
  neither is a value a consumer has to write.
  
  **The heading ladder now descends from the new ceiling, one authored step per
  level, and every level holds a step of its own.** There are exactly six authored
  steps at or above Body, so the table lands on the floor with a distinct step at
  every rung, where before `h4` through `h6` shared one. `h1` is at `5xl`, rising to
  `6xl` at `sm`; `h2` is at `4xl`, rising to `5xl`; and the table descends to `lg` at
  `h6`, which is the step Body is set at. **What a consumer sees is every section
  title moving up one step and every page heading moving up two**: a section title
  goes from 1.5rem to 2.25rem and from 1.875rem to 3rem at `sm`, and a page `h1` goes
  from 1.875rem to 3rem and from 2.25rem to 3.75rem at `sm`. No call site changes,
  because the level a Block was already passing is still what decides its size.
  
  **Five surfaces that render a page's own `h1` now ask the same table for its size
  rather than naming a step.** `page-header-01`, `docs-shell`, `blog-post-page`,
  `not-found-page` and `error-page` each wrote a fixed step into a heading that was
  meant to be a page's top-level claim, so with the ceiling lifted they would have
  rendered a page heading a rung or two below the section titles under it. They ask
  `headingSizeClass`, which is what `SectionHeading` and `Cta01` already asked, and
  `Cta01` still carries no literal.
  
  **Four more surfaces that resolved their own heading size, found the same way.**
  A Block that takes a `headingLevel` and writes the size beside it forwards the level
  and changes nothing a reader can see, which is the defect above at the scale of one
  Block. `data-table-01` said `text-lg`, `run-console-01` said `text-base`, and both
  moved the outline without moving the size. `run-stream-01` renders a literal `h2`
  at `text-lg`, which was the floor of the old scale, so a live region's `h2` came
  out below the `h3` introducing the section holding it. `/foundation/themes` said
  `text-3xl`, which had been Display and is now the `h3` step, so that page's `h1`
  rendered a rung below the section titles under it. All four ask `headingSizeClass`
  now, and the three Blocks carry `text-balance` with the size they gained: the ladder
  states weight, tracking and balance as one package and `SectionHeading` carries all
  three at every rung, so a title lifted from 16 or 18 pixels to 24 or 36 is worse
  unwrapped than the one it replaced.
  
  **The Item page's appendix heading is on the article's ladder, and asking the Block
  ladder for it was the wrong correction.** It said `text-xl`, which put an `h2` at 20
  pixels under the prose `h2` at 30 and below the prose `h3` at 24 above it. Asking
  `headingSizeClass` removed the third tier and created a worse one: "API reference"
  is a section of an article exactly as "Overview" is, so it takes the article's
  ladder, and the Block ladder is a step and a half above it at `sm`. The Item page
  then carried three sections at 30 pixels and an appendix at 48, and the appendix was
  the second largest thing on the page. It is now a bare `<h2>` inside the same
  `.prose` wrapper as the Item's own MDX body, so the article's rules size it at 30
  pixels and it carries no class of its own: every section heading in that article is
  a bare tag the article styles, and a heading naming its own step would be the second
  answer to a question the article has already answered. The table stays outside
  `.prose`, whose descendant rules would put its cells at the body step in the muted
  colour, and the gap above it is the article's own 16 pixels rather than a second
  region's 32.
  
  **The five theme names are card titles, and they compose `CardTitle` to say so.**
  They carried `font-medium` and no size, so they rendered at 16 pixels and 500 under
  a 60 pixel `h1`. Asking the ladder for the size would have been wrong: five themes at
  the `h2` step is five 48 pixel headings over five cards on a page whose own claim is
  the `h1` above them. `CardTitle` already holds the answer the library needs: a card
  title sits at body size, and the element and the visual step are separate questions.
  So the size stands, the tag stands at `h2` because the grid draws no section heading
  of its own, and the weight now comes from the one Component that owns it rather than
  from a literal. What a consumer sees is five theme names one step heavier.
  
  **The two Foundation readers took opposite answers, and the reason is worth more
  than either change.** Both render inside an MDX body, which the site wraps in
  `.prose`, and both used to carry literals, which a utility layer lets win over the
  article's own component-layer rule: `/foundation/colors` published an `h2` at 18
  pixels and an `h3` at 14, below the `h3` above them.
  
  `ColorTokens`' four headings are sections. Two divisions of an article and a
  partition under one of them is a structure, not a list of labels, so they name no
  step and the article decides, which is the one copy of the ladder there is.
  
  `TokenBrowser`'s are not sections, and dropping its literals let the wrong authority
  decide them: every group name came out at the prose `h2`, 30 pixels, which is more
  than twice the 14 pixels the navigation rail's own section titles are set at, on the
  page whose whole job is being navigated. Each of those 184 names is a table's name
  and nothing else, so they are captions: `h3` at `text-sm`, in the mono face because a
  token key is machine notation, at the same 14 pixels and 500 as the column heads of
  the table underneath. That is the caption `ApiTable` already renders for a compound
  export's part names on every Item page, so this is the repository's own treatment
  rather than a third one. One heading on the page, "Semantic contract", is a division
  of the article rather than a label, and it keeps naming no step.
  
  **`Prose` walks the same ladder from one rung down, and a prose heading therefore
  sits below a Block heading at the same level.** Its child treatments now set `h1`
  at `4xl` and descend one authored step per level to `lg` at `h5` and `h6`,
  which is the same scale and the same floor entered at the rung that fits the
  reading measure: Display is 3rem, and a 42rem column is fourteen of those. The new
  `h5` and `h6` treatments are new, so a document that reached past `h4` before now
  has an answer rather than inheriting nothing. **The consequence is stated rather
  than left to be found.** A Block-composed `h2` is 2.25rem and 3rem above `sm`; a
  prose `h2` is 1.875rem and does not grow. They are 1.2 apart at the base width and
  1.6 apart above `sm`, where they were 1.25 apart before this change, so a consumer
  who sets a `Prose` section beside a Block section sees two tiers rather than one.
  `DESIGN.md` under Typography, Hierarchy now says so, and says which to reach for.
  `DocsShell` runs `Prose` at `fullWidth`, so the frame decides the width: 35rem of
  article track at a viewport of 1216px or wider, and less below that, which makes
  the case for entering one rung down stronger there rather than weaker.
  
  **`Heading`'s free `size` prop is unchanged, and this is stated rather than
  implied.** `size` is a choice made beside the tag, for a heading the surrounding
  document has already placed and wants attuned, and its largest arm is a step of
  the scale rather than a rung of the ladder. Its two largest arms were not removed
  and no new ones were added, so no consumer's call site changes and there is still
  no second route to a page `h1` from inside the library. `search-page` and
  `status-page` are the two surfaces that take a heading's *tag* from
  `childLevel(headingLevel)` and its size from this prop, and they are left as they
  are: those are labels over a list of results and over a list of incidents, and a
  caption is not a rung.
  
  **`scripts/check-heading-scale.mjs` now holds three things it described but did not
  check.** Its rule 4 claimed a table that jumps is a finding and only tested for a
  table that rises, so a table that skipped a rung passed it: descending, reaching
  the ceiling and flooring at or above Body, and rendering the page `h1` one gap
  above its own `h2`, which is the defect these steps exist to remove. And the
  literal Display step it refused on `Cta01` was written out as `text-3xl` and
  `sm:text-4xl`, which stopped being Display the moment the ceiling moved. Both are
  now read from the authored scale and the shipped table rather than restated, and
  both have a staged fixture in `scripts/__tests__/heading-scale.test.mjs`. The third
  is the Item rule below, which is new rather than a restatement.
  
  **The Item document's own table was the retired ladder, and it now states this
  one.** `apps/site/items/component/layout/section/section.mdx` is the page a reader
  is on when they ask what `as` resolves to, and it listed `h1` at `text-3xl` and
  `h4` through `h6` all at `text-lg`: the table as it was before this change. It now
  states the ladder the Component renders, and the sentence under it about where the
  scale stops has been corrected with it, because a corrected table beside a stale
  paragraph is the same disagreement one row down.
  
  **The gate also reads the Item document now, and that is the third copy of the
  table.** `apps/site/items/component/layout/section/section.mdx` states the ladder
  in its prose, and neither the declaration build nor the corpus reaches it, so when
  the ceiling moved it kept publishing the retired table. The new rule compares it to
  the same `HEADING_SIZE` the JSDoc is compared to, by the same cell-for-cell shape,
  so it names no step of its own; it reads the whole Item rather than a slice, so a
  second table in that prose is a finding; and it fails an Item that states no table
  at all, because a comparison with no rows finds nothing to disagree with. Three
  staged fixtures cover the three cases.
  
  **What the gate still does not hold is written down rather than left to be
  discovered.** `Cta01` is named as a root because it is the one Block whose heading
  cannot be composed from `SectionHeading` at all, so a literal step on it has no
  table to fall back to. Beyond that file the gate cannot go, and the reason is
  stated rather than left to be found: whether a heading a Block renders is a rung of
  the ladder or a caption inside that Block is not decidable from source.
  Forty-eight headings across `packages/ui/src` and `apps/site/src` name a step of
  their own, the eleven rungs among them now ask the table, and the thirty-seven that
  remain are captions. Two surfaces bind a caption to `headingLevel` rather than to
  `childLevel`, so a rule reading the tag cannot sort them, and a root list holding
  the rungs would be a list somebody maintains. That is how the `Cta01`-only rule
  came to hold the one Block already fixed and pass over the four that were not, and
  the count is written into `docs/quality-gates.md` so the next reader starts from it.
  `TokenBrowser` adds one more to that population, which is the point of naming a
  caption's step rather than inheriting it: the scan can see it, and it is below the
  floor by arithmetic.
  
  **The limit of the scan that took that count is now written down too, and it is the
  more useful half of it.** The count came from looking for a literal size utility
  beside a heading tag, and a heading whose size it inherits names nothing: the five
  theme names above carried no size at all, and two scans of exactly that shape passed
  them at 16 pixels and 500. A size that is inherited is a size nobody chose, and "no
  literal" is invisible to a scan that looks for literals, so that count has never
  been a count of every heading that names a step, and the number nobody chose is the
  half of it that reached a reader. What the count is good for is the arithmetic: a
  heading it reports is a rung if the step it names is at or above the step Body is set
  at, and a caption if it is below, so the two sort without anybody deciding which is
  which. The remedy for what the scan cannot see is on the surfaces rather than in the
  gate, and it is the one the token inventory now uses: a caption names its own step,
  so it is visible to the scan and it is below the floor by definition.
  
  The bump is a minor in both packages rather than a patch because a new authored
  step is a new public contract: `--text-5xl` and `--text-6xl` with their
  `--line-height` companions enter the emitted CSS and the published pack contract,
  and every heading on every page composed from a Block moves.

## 0.15.0

### Minor Changes

- 6dc7bb8: There is one container namespace, and `max-w-6xl` no longer resolves
  
  **If you wrote `max-w-6xl`, `max-w-2xl`, `max-w-xl`, `max-w-lg`, `max-w-md`,
  `max-w-sm` or `max-w-5xl` against this package, that class now produces no rule at
  all.** Nothing errors and nothing warns: the element simply loses its cap and lays
  out at whatever its parent gives it. Grep your own repository for `max-w-` before
  you upgrade. The replacements are in the list below and every one of them resolves.
  
  The reason is the defect this release ends. `@nanisoft/prism-tokens` authors three
  container widths and Tailwind ships thirteen of its own, and until now both shipped
  in the same stylesheet. Three of Tailwind's were numerically identical to three of
  ours: its largest at 72rem beside `--container-page`, its fifth at 42rem beside
  `--container-measure`, its fourth at 36rem beside `--container-measure-narrow`.
  Nothing rendered differently, so nothing failed and every gate was green. What it
  cost was that one width had two names, and the first retune of an authored token
  would have moved every surface reaching it by one spelling and left every surface
  reaching it by the other exactly where it was. `Section`, `SiteHeader`,
  `SiteFooter`, `ChartCard01`, `DocsShell` and `QuickView01` all used the Tailwind
  spelling of the page column; `Cta01` and `SectionHeading` used the Tailwind
  spellings of the two measures.
  
  The token build now closes the whole namespace, with
  `--container-*: initial` ahead of the authored entries rather than a list of the
  seven steps that happened to be emitted. A wildcard is the load-bearing word: the
  thirteen names it retires are `3xs 2xs xs sm md lg xl 2xl 3xl 4xl 5xl 6xl 7xl`,
  and a list would have been a second list to keep in step with a dependency's
  default theme, which is the event the line exists to survive. Order matters and is
  asserted: Tailwind resolves a theme in source order, and the same declaration
  written after the authored entries clears all eight of ours and ships no container
  at all.
  
  **What to write instead**
  
  | You wrote | Write | Value |
  | --- | --- | --- |
  | `max-w-6xl` | `max-w-page` | 72rem |
  | `max-w-2xl` | `max-w-measure` | 42rem |
  | `max-w-xl` | `max-w-measure-narrow` | 36rem |
  | `max-w-md` on a dialog or an alert | `max-w-overlay-dialog` | 28rem |
  | `max-w-lg` on a form dialog | `max-w-overlay-form` | 32rem |
  | `max-w-xl` on a command palette or a search | `max-w-overlay-palette` | 36rem |
  | `max-w-sm` on a side sheet or a drawer | `max-w-overlay-panel` | 24rem |
  | `max-w-5xl` on a lightbox | `max-w-overlay-media` | 64rem |
  
  **An overlay's width is a property of the kind of surface it is, not of the page
  grid underneath it**, and that is why the five overlay widths are authored rather
  than carried on a Tailwind name. A retune of the reading measure must not move a
  dialog and a retune of the page column must not move either, so the two families
  are named apart inside the one container group. They share a group because
  Tailwind 4's `max-w-*` resolves `--spacing-*` and `--container-*` and nothing
  else, so a maximum width that is to be a token has to live in one of those two
  namespaces or it is a value written in a Component. `overlay-palette` and
  `measure-narrow` are both 36rem; that is two measurements that happen to agree and
  not one measurement with two names, and the token source says so and the emitted
  contract holds it to saying so.
  
  **Nothing is supposed to change where you can see it.** Every migration above
  preserves the exact rendered width, so a page that only consumed this stylesheet
  looks the same before and after. What changes is the next retune: it now moves one
  surface rather than half of them.
  
  **A width that was arithmetic on the spacing base is left alone, deliberately.**
  `max-w-96`, `max-w-72`, `max-w-64`, `max-w-32` and `max-w-20` resolve to
  `calc(var(--spacing) * N)` and never touched the container namespace at all. They
  are how a chart's axis band, a token table's column and a documentation frame are
  sized, where nobody took a decision and naming one would invent it. They stay.
  
  **Two gates now hold this down, because the question has two sides.**
  `scripts/check-elevation-layout.mjs` reads every `w-*` and `max-w-*` name out of
  the class strings and holds it to the container group read out of the token source,
  so a width nobody authored is a finding with a file and a line; it reads
  `apps/site/items` as well as `apps/site/src` and `packages/ui/src`, because that is
  where the documentation Demos live and where the site's own build scans.
  `packages/ui/scripts/check-container-namespace.mjs` reads the built stylesheet and
  holds the artefact: that the theme block declares exactly the authored containers,
  that none of Tailwind's thirteen steps is declared or read, that the close is
  written ahead of the entries rather than after them, and that every container width
  this package writes is emitted as a utility reading its own variable. It reads the
  step list out of the installed `tailwindcss/theme.css` rather than restating it, so
  a dependency that adds a step is covered without an edit. Tailwind's extractor
  reads this package's comments as well as its code, so a retired class name written
  down in a JSDoc block used to emit a utility; there is now a rule about that too.
  
  **The bump is `minor` rather than `major`, and the argument is the version line
  rather than the severity.** A class a consumer wrote stops producing a rule with no
  error, which is breaking by any ordinary reading, and this entry says so plainly.
  `major` in this repository publishes `1.0.0`, and every release to date has been
  `minor` on a `0.y.z` line where the `y` is already the breaking-equivalent slot.
  Publishing 1.0.0 with this change in it would assert an API stability guarantee
  this library has not earned, and it would be the first release in the project's
  history to use the bump at all. The break is real and is the subject of this
  entry; the number it lands on is the line's decision and the line is pre-1.0.
  
  **One collateral repair on the documentation site, recorded here because it is
  why `globals.css` moved.** The site's own build and this package's meet in one
  `utilities` layer, and this package emits a bare `.grid-cols-6` as the base of the
  `lg:` variant four of its Blocks use. That bare rule landed after the site's
  `sm:grid-cols-11`, so every colour ramp on the Foundations page was drawing six
  columns at every width above 640 against a comment beside the class saying
  eleven. Whether `check-utility-cascade.mjs` saw it depended on which order two
  content-hashed CSS chunks sorted in, which this change perturbed and which nothing
  about the tree controls. Neither side is wrong, so the site's variant is restated
  in the `site-variants` layer that already exists for six other collisions. The
  repaired behaviour is on the documentation site only; nothing in this package
  changes.
- 6dc7bb8: Ship the interface face and its metric-adjusted fallback, and stop the site loading its own
  
  `@nanisoft/prism-ui` shipped three Inter weights and no fallback face, so a reader
  waiting on the web font saw the platform's UI face jump into place when Inter
  arrived. The stylesheet now also ships a local Arial carrying Inter's metrics
  through `size-adjust`, `ascent-override`, `descent-override` and
  `line-gap-override`, and `--font-sans` names it immediately after Inter, so the
  swap window occupies Inter's own line box. The four numbers are measured off the
  shipped face rather than chosen, and they are the ones `next/font` measured for the
  same typeface, so the line box is unchanged from what the documentation site had.
  
  A fourth face ships beside them: Inter italic at weight 400, the Latin subset of
  the same release, covering the same 230 codepoints as its upright siblings.
  `Prose` sets `blockquote` in italic and the surface had been asking for a style no
  shipped file provided, so every consumer has been reading a synthesized oblique.
  One real face covers every weight a browser asks for, because the font matcher
  takes the closest available weight rather than synthesizing once a face exists.
  The whole set is 93.5 KB, up 22.8 KB, and no consumer has to do anything.
  
  **The documentation site no longer loads a face of its own.** It shipped a 723 KiB
  unsubsetted variable Inter and its italic through `next/font/local`, preloaded both
  in all 581 exported documents, and applied the result to `<body>` as a directly set
  `--font-sans`. A directly applied custom property outranks an inherited one, so the
  library's faces were never fetched on the site that documents them: a missing or
  corrupt shipped font rendered perfectly there with every gate green. The site now
  resolves the same stack you do, which is the only way it can be evidence for the
  package. If you were relying on the site to look right while your own copy of Inter
  was broken, that is now a failure you can see.

## 0.10.0

### Minor Changes

- 75434f8: Add a running figure to the system, and the ambient cycle scale that prices it
  
  The system had one law of motion: motion is state feedback, on an 80/160/280
  millisecond scale, and there are no keyframes anywhere. That law was right and
  it held. It also meant a product page could say what its product does and show
  nothing about it, which is what happened to four sites at once.
  
  This adds the second law, and it is a separate law rather than an exception to
  the first. Feedback is a response to something the reader did. A cycle is a
  demonstration of something the system does, and no reader is waiting for it.
  The test for which one a motion is does not require taste: stop the animation
  and ask whether the figure is still true and still legible.
  
  **New Components**
  
  - `PulseGraph` draws a running system: named nodes, the relations between them, a
    marker travelling a rail, and a breathing focus. A node's `lane` says it is a
    stage in a sequence, which draws the rail; a node with no lane is a field.
    `carries` on a relation says the line is carrying something, and draws a head
    at its end so the claim survives motion being off.
  - `PulseSeries` draws a live instrument: columns rising out of a caller-named
    baseline, with a reticle crossing them once per cycle. The values are the
    caller's own and the tallest sets the scale.
  - `SignalField` is a field of marks: the atmosphere a figure is drawn over.
    Decorative by default, still unless asked to drift, and honestly named as the
    one component in the system that is texture.
  
  **`Hero01` gains the band it was missing**
  
  All four sites hand-wrote the same two-column grid, each with its own gap and its
  own breakpoint. It is now the `instrument` slot, and an action naming an `href`
  renders as a real link rather than a button that goes nowhere. The centred form
  is unchanged, so this is additive.
  
  **New tokens**
  
  `ambient` and `ambient-ease` are two closed groups measured in seconds, separate
  from `duration` because folding them in would have made one name mean both 280ms
  and 7.2s. The emitted contract asserts the closed set and fails any cycle under
  one second, because a sub-second cycle is a flicker and no value in the 80 to
  280ms band could ever have caught that.
  
  **What this does not change**
  
  Nothing is hidden. No ambient rule sets `opacity: 0` and nothing waits for a
  script, an intersection or a timer, so every figure is complete at first paint
  and a consumer needs no exception to enable the `hidden-state` gate. Reduced
  motion is one `animation: none`, and because every resting state is the full
  form, that reader gets the same figure, still. All three are server Components,
  so this adds zero bytes of client JavaScript.

## 0.6.0

### Minor Changes

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
- 5dcb347: Every colour role now has a contrast row or a stated reason, and there is a brand ink
  
  The contrast gate decided what to measure by a naming convention: any root token ending in
  `-foreground` had to be the first element of a pair. Six of the seven roles that were in no row at
  all could not be reported by that rule, because `chart-1` through `chart-5` and `sidebar-border`
  do not end in `-foreground`, and `sidebar-ring` does not either. A new role therefore defaulted to
  silence. The gate now walks the token source instead of the table, so a role nobody has written
  down is a failure rather than an absence, and the role set is read from `src/semantic/` rather than
  from the pair table, or the walk would be checking the table against itself.
  
  `sidebar-ring` is what the walk immediately found. It had no row at all, and its shipped values
  measured 2.42:1 in the base pack's light mode, 1.73:1 in its dark mode, 2.86:1 in Mint and 2.97:1
  in Sky against the sidebar surface: a focus indicator four of twelve pack and mode combinations
  could not be seen against, reported as compliant because it was not measured. The values moved, not
  the row. The base pack goes from neutral 400 and neutral 700 to neutral 500 in both modes, because
  the base pack's ring is one ramp rather than two; the pastels go from brand 500 to brand 600 in
  light, because the sidebar is neutral 50 rather than neutral 0 and brand 500 is one step short of
  3:1 in two packs. The dark pastels keep brand 300 at 8.06:1 or better. `sidebar-border` gains an
  advisory row on the sidebar surface with the same judgement `border` and `input` already carry,
  which is how its 1.18:1 to 1.37:1 became a number on the record rather than an unmeasured value.
  
  `chart-1` through `chart-5` are exempted with a reason rather than measured against a ground. A
  series is a graphic object: shadcn consumes the five as the stroke and fill of a series and reads
  its tooltip and legend text from `foreground` and `muted-foreground`, which are each gated against
  their own ground. What binds a five-way set is that no two series resolve to the same value, so
  that is what the gate asserts instead, in every pack and both modes. The measured tightest pair is
  37/255 in a channel, Peach in dark mode between `chart-1` and `chart-5`. No minimum separation is
  asserted, because a threshold with no standard behind it is a number that gets bent. `radius` is
  exempted as a length rather than a colour, and the exclusion is a declared entry with a reason
  instead of a name filter buried in a loop. Every exemption is printed on every run with the roles
  that share it.
  
  **`brand-ink` is a new semantic role: a brand hue read as text.** Three sites want a brand colour
  they can read on a surface and `primary` cannot serve it, because `primary` is a fill: a pastel
  brand 400 measures 2.20:1 to 2.44:1 on its own pack's page and 1.90:1 to 2.05:1 on the accent
  surface. It is brand 700 in light and brand 200 in dark, in all five packs and the base, and it is
  gated at 4.5:1 against three grounds rather than one: the page, a card, and the accent surface.
  The accent is the ground that decides the step in both directions, because a light ink has to
  survive the pack's own brand 100 and a dark ink has to survive brand 800, and brand 600 and brand
  400 respectively are the steps that fail each. The measured worst case across all six sources, both
  modes and all three grounds is 5.57:1 in Mint's light mode. The dark step is brand 200 rather than
  the brand 300 the accent ground would have permitted, because brand 300 is `primary` in every
  pack's dark mode and a brand ink that is the brand fill is the confusion the role exists to end. A
  test asserts that `brand-ink` never resolves to the same value as `primary`, `primary-foreground`
  or `foreground` in any source or mode.
  
  **The two values that were already in the contract are the two answers this gate rules out, and
  both are written into `DESIGN.md` as prohibitions with a number attached.** `primary-foreground` is
  the pack's brand 950 step, in both modes and all five packs, published under three further names in
  light mode, and it is the value a reader of the contract reaches for when they want the brand colour
  as text. It clears its own row by 7.39:1 to 11.06:1 and it measures 1.00:1 to 1.82:1 on the dark
  page ground, the dark card and the dark accent surface. In light mode it reads 15.05:1 to 18.05:1
  on the page, so half the modes it looks right and half it disappears, and no row in the contract
  could see the difference. `ring` is the other: the pack's brand hue as a non-text boundary, gated
  at 3:1 against the page ground alone, and it measures 2.66:1 to 4.35:1 on the accent surface in all
  six light-mode sources. Neither was wrong arithmetically. Both are invisible on the ground a brand
  ink lands on, and both now have a role that is measured there.
  
  **A role is measured in both modes or the run fails.** Every colour role, exempt ones included, has
  to resolve to an sRGB value in light and in dark in every pack, so an exemption buys a role freedom
  from a ground and never from a mode. This is what a role present in one mode and absent from the
  other looks like, and the build's own key-set guard does not reach it because it compares light
  against light.
  
  The old `-foreground` name test is gone rather than kept beside the walk. It was never a second
  opinion on coverage, which the walk settles, and its only additional content is that a role named
  `*-foreground` must be the foreground of a row rather than the background of one, which is a claim
  about the shadcn naming convention and belongs to the Contract Rule.
  
  No consumer action is required. `brand-ink` is additive: it is a new custom property, the stylesheet
  gains a `text-brand-ink` utility, and no existing token changed except `sidebar-ring`, whose value
  moved in the base pack and in the light mode of every pastel. A consumer that styled its own sidebar
  focus ring from `--sidebar-ring` will see a more visible ring, which is the point.

## 0.5.1

### Patch Changes

- 2fc6a0a: Retune `muted-foreground` so muted text clears 4.5:1 on the muted surface
  
  The base pack's `muted-foreground` moves from neutral 500 to neutral 600. It
  cleared 4.5:1 on the page background but fell to 4.34:1 on `muted`, where the
  pill, avatar fallback, kbd and tab-list pattern place it. The contrast gate now
  also checks `muted-foreground` on `muted`. The pastel packs were already pinned
  to their neutral 700 and are unchanged.

## 0.5.0

Prism was rebuilt from a fresh repository on a clean break. The token pipeline is
DTCG 2025.10 compiled with Style Dictionary, the semantic names keep the shadcn
contract verbatim, and motion, typography, spacing, shadows, breakpoints and
containers all reach CSS through a single `@theme static` block.

Changesets are appended above this entry for every published change.
