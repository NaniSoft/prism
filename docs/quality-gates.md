# Quality gates

This document records what the gate set asserts, which gates fail and which only
report, and what a green build does not prove. It is the honest companion to
`pnpm check`; the executable truth is the scripts themselves.

## Fail or report

One rule decides every split below: a check fails when its failure would let a
consumer-facing claim be false or a consumer's install break. A number whose
threshold is a judgement, or a measurement that informs a human decision,
reports and is published.

The script column is the gate. A row that named an aspiration rather than a
script has been corrected, because a gate list that names a gate which does not
exist is the same defect class as a catalogue whose registry and list disagree:
it is green, it is believed, and it is not checking anything. **The table used to
hold the opposite defect, and it was worse.** Seven scripts were added to chains
this effort and the table was never updated, so the half that actually happened is
a gate running and not being listed, and five of the seven are explained in prose
further down this same file, which is what made it a record rather than an
oversight. `scripts/check-gate-table.mjs` now reads the chains out of each
manifest and compares them with this table in both directions, so the table is
held by a gate rather than maintained by a human. It is a gate about the gate set
and it is the only row below whose subject is this document.

| Package | Script | Fails the build | Reports only |
| --- | --- | --- | --- |
| `prism-tokens` | `scripts/check-contrast.mjs`, `scripts/check-emitted-contract.mjs`, `scripts/check-determinism.mjs` | the contrast gate's role walk, its exemption list, the mode rule and the chart-series distinctness assertion, the emitted contract (completeness, value equality, spacing arithmetic, no extras, and the mode-independent groups including the closed duration, easing and shadow sets, the closed breakpoint set, and the container group: its closed set, its two families, the single authored value coincidence, and the order of the whole-namespace close relative to the authored entries), build-twice determinism | the three advisory contrast pairs (`border`, `input` and `sidebar-border`) |
| `prism-ui` | `scripts/validate-registry.mjs`, `scripts/check-catalogue.mjs`, `scripts/check-surface.mjs`, `scripts/check-focus-indicators.mjs`, `scripts/check-breakpoint-variants.mjs`, `scripts/check-container-namespace.mjs`, `scripts/check-pack-boundary.mjs`, `scripts/check-vector-ink.mjs`, `scripts/check-client-budget.mjs`, `scripts/check-theme-resolution.mjs`, `scripts/check-boot-budget.mjs`, `scripts/check-item-docs.mjs`, `scripts/check-block-copy.mjs`, `scripts/check-item-category.mjs`, `scripts/check-block-imports.mjs`, `scripts/check-gate-kit.mjs`, `scripts/check-typeface.mjs`, `scripts/check-variant-ink.mjs` | surface scan, registry validator (registry and published file list), the three-way catalogue comparison, the focus-indicator class-string scan across every shipped source file, the breakpoint-variant rule, the container-namespace rule over the built stylesheet, the pack-boundary law, the vector-ink contract, the theme-resolution equivalence table, the boot-path byte ceiling, a JSDoc block on every catalogue Item, a Block and a Page shipping no copy or an accessible name, the closed set of seven Categories and the absence of one on a Block or a Page, the modules a Block and a Page may not import, the face a token names against the `@font-face` rules and binaries the package ships, the metric-adjusted fallback and the licence beside it, the consumer gate kit's registry and published surface, the component and axe suites, and a variant that sets its own fill setting its own ink | per-item client-JavaScript measurement |
| `prism-llms` | `scripts/check.mjs` | corpus drift, per-item mirror and store coverage, the store type round-trip, the declared output list | none |
| `prism-mcp-server` | `test/registration.test.ts` and the bundled-data hash | the protocol round-trip suite, the registered tool list equals the package's declared `TOOL_ORDER` with every tool served from the bundled corpus, the bundled `data.json` hash | corpus freshness stamp (`scripts/stamp-built.mjs`) |
| repository root | `scripts/check-dashes.mjs`, `scripts/check-elevation-layout.mjs`, `scripts/check-heading-scale.mjs`, `scripts/check-motion.mjs`, `scripts/check-nested-controls.mjs`, `scripts/check-block-controls.mjs`, `scripts/check-encoding.mjs`, `scripts/check-no-legacy-line.mjs`, `scripts/check-gate-table.mjs`, `scripts/validate-changesets.mjs` | the dash gate, the elevation and layout gate, the heading-scale gate, the motion gate, the nested-control rule, the block-control rule, the encoding gate, the retired-line gate, the gate-table gate, the changeset validator | none |
| `@nanisoft/site` (private) | `scripts/check-utility-cascade.mjs`, `scripts/check-content-joins.mjs`, `scripts/check-pattern-composition.mjs`, `scripts/check-search-budget.mjs` | content joins (including the redirect coverage and the Worker's first-run prefixes), utility cascade, a Pattern naming an Item that does not exist plus its Section's `meta.json` in both directions, search gzip budget | visual regression and the computed display assertions, both inside the report-only `visual` job |

**Two of the rows above are not `check` tasks, and the table says which.** `prism-mcp-server`
declares no `check` script; its column is its test lane and the bundled-data hash its build
asserts. `check-search-budget.mjs` runs in the site's `postbuild` rather than in its
`check`, because it reads the built export and `next build` is what produces it.
`scripts/check-gate-table.mjs` reads `check` tasks only, so a gate wired into another
task is out of its scope by construction and both of these are correct rather than
omissions. The residual it does not cover is a gate wired into no task at all, which
nothing here can see.

Two entries this list used to make, and what they really are:

- **JSDoc and catalogue coverage is not a `prism-ui` gate.** It is asserted by
  `packages/llms/scripts/check.mjs` against the emitted declarations, so it is
  attributed to `prism-llms`.
- **The dash, elevation and motion gates are repository-root scripts, not
  `prism-ui` tasks.** The dash gate lists the site's and the packages' trees among
  its roots, and the motion gate lists the three component-source trees
  `check-pack-boundary.mjs` reads plus the two published source trees an agent
  reads, which is not the same as the site's `check` running either of them. They
  run first in the root `check` chain.
- **The demo `client` flag and the per-item site client measurement are not in
  any gate lane.** The flag is produced by the manual `catalog:analyze` task and
  CI never runs it; the per-item measurement is `prism-ui`'s
  `check-client-budget.mjs` and is listed above.
- **No gate asserts that the shadcn registry artifacts are absent from `out/`.**
  `AGENTS.md` states the rule and nothing checks it, so it is recorded here as an
  unenforced instruction rather than as a gate.
- **A consumer's gates are not run by this repository's CI.** The kit is tested
  here against fixtures and driven by hand against all four consumers, but
  `pnpm check` in this workspace cannot tell whether a consumer's own half of the
  contract is true, because a consumer is a different repository with a different
  tree. What this repository can assert, and `check-gate-kit.mjs` does, is that
  the kit's own registry, its files and its published surface are one list.
- **The kit is not published.** The trusted publisher is not configured on npm for
  these packages and the release lane cannot publish; every version since 0.6.0
  shipped from a maintainer's machine, which `CONTRIBUTING.md` records in full. So
  the four consumers pin a version that predates `gates/`, their `prism-gates`
  run fails to resolve the subpath, and the remedy is a release and a `pnpm install`
  in each of them. That is a real residual and it is stated rather than worked
  around: a gate that could not read what it needed must fail rather than report
  clean, and a fallback that ran a consumer's own copy of a law would be the defect
  this work exists to remove.

## Coverage is asserted, not assumed

A gate that can read nothing must fail. Every gate above resolves its roots from
its own location via `import.meta.url`, so running it from any working directory
reads the same files; a root that does not resolve fails the run and the message
names both causes a reader cannot tell apart, a wrong working directory and a root
that is genuinely gone; and a run that reads zero files fails rather than
reporting zero violations. Each gate's final line states how many files it read,
across how many roots, and how many roots were unresolved, and every excluded path
is printed on every run, because a rule that fires on nothing is indistinguishable
from a rule that found nothing to say.

The shared implementation is `scripts/lib/walk.mjs`, and its unit and integration
tests are `scripts/__tests__/`, run by `pnpm test:scripts`. Those tests spawn the
real gate files from a working directory that is not the repository root, which is
the only way to keep the property honest: a test that imports the helper proves the
helper, not the gate.


## The content joins

`apps/site/scripts/check-content-joins.mjs` is the site's `check` task, and it
is the only gate that looks at the joins between the four things that have to
agree about the content: the Catalogue (read through `buildCatalog()`), the
content tree on disk, the Corpus (the `PrismDocsStore` the MCP server reads) and
the routes the site publishes. It asserts, in both directions where both
directions exist:

- every Catalogue Item has a documentation file, and every documentation file is
  a Catalogue Item's;
- every Item's document states the route the Corpus advertises for it, because an
  Item is filed under its Kind and its Category while it is published at its
  Section, so the document has to say which one it is;
- every declared Section is a directory under `content/`, and every directory
  under `content/` is a declared Section;
- every Item's Demo is found from beside its documentation, and every Demo is
  claimed by exactly one Item;
- the Corpus and the content tree hold the same pages, and each page's mirror is
  its own route plus `.md`;
- every internal link in the authored prose resolves to a route;
- every href the published navigation renders resolves to a route, and every
  content route the site publishes is one the navigation links;
- every live route the Section manifest declares is served by a specific App
  Router page rather than the catch-all, is not also a content file's route, is
  linked by the published navigation, and is linked from its Section's index;
- every route the site published before the Sections moved is redirected, every
  redirect is for a route that moved and lands on a route that exists, and no
  redirect takes two hops;
- `wrangler.jsonc`'s `run_worker_first` is exactly the set of prefixes the Section
  manifest requires, in both directions.

The assertions are in `apps/site/scripts/content-joins.mjs`, which touches no
filesystem, and the test lane runs them against a flat tree and a nested tree,
because the content tree is flat today and nested later in this effort. The
navigation is read from the built export in `out/`, so it is the navigation a
reader receives rather than a list the gate keeps beside it, and the same
staleness cannot make the check pass. The Corpus is consumed, never re-derived,
and the Catalogue is read, never inferred from a directory scan.

**The route-move comparison is a set comparison over a record, not a spot check.**
`apps/site/scripts/published-routes-before.json` holds the routes the site
published before the Sections moved. It is a snapshot of one moment rather than a
list anybody maintains, and it exists because "a route that moved" has no other
definition: every other surface the gate reads says what exists now, so a route
that quietly stopped being published is absent from all of them rather than wrong
in any. The redirect table is then `redirectFor()` from the Section manifest
applied to that record, and the gate compares the two against the routes the tree
publishes in both directions. `apps/site/test/routes.test.ts` runs the same
comparison in the test lane and additionally drives every entry through the
Worker's real entry point, so a table that is correct and never wired into the
fetch handler cannot pass either.

The known limit: a link to a published file that is not a page, which today
means `llms.txt`, `llms-full.txt` and `prism-skill.md`, is reported as
unresolved, because the route set is the set of routes.

**The live routes are the one exemption from "every published route is a
document", and the exemption is gated rather than asserted.** A live reader is a
component that reads generated token output at build time, so it has no content
file, no mirror and no Corpus entry, and the Section manifest is what puts it in
the navigation. The four joins above are what make that safe: a specific page file
serves the address, no content file is filed at it, the published navigation links
it, and the Section's index links it too, because the sidebar is hidden below `lg`
and the mobile menu carries Sections only. A Section with no authored index is
skipped by the last join, and that is the whole exemption: a catalogue Section's
index is generated by the Catalogue, so there is no file there to link from. The
limit is the inverse direction. A live route the manifest does not declare, reached
by a hand-written link in a component, passes the navigation join, because the App
Router does produce the address; the manifest is what the navigation is projected
from, so a link that bypasses it is a link in a component.

**The reachability direction has a second line, and the second one comes
first.** A `pages` array in a `meta.json` is a whitelist, not a reorder, so a
page it omits and does not cover with an ellipsis leaves the primary page tree,
lands in the fallback collection and keeps its exported route. The page
template refuses to project a tree that holds one, so `pnpm build` fails and
names the file. The gate's direction is the same rule seen from the reader's
side, over two surfaces it already reads, which is what lets it hold at any
depth and lets the test lane run it against a flat and a nested fixture: the
routing tree itself cannot be built outside the bundler that compiled the macro,
so the gate never instantiates it. Neither replaces the other. The build
enforcement sees the fallback and nothing else, and only when a page render
runs; the gate sees reachability and would also catch a navigation that dropped a
page for any other reason.

**The route an Item states has the same shape, and both halves are enforced.** The
content tree is read by one collection, an Item's page is its documentation, and
each document carries a `slug` in its frontmatter because the route cannot be read
out of the folder. `apps/site/src/lib/content-tree.ts` refuses a document whose
stated route is not the Catalogue's, so `pnpm build` fails and names the file and
both routes. The gate reads the same two surfaces from the other side, so
`pnpm check` fails on it too, and the test lane proves both refusals on a flat and
a nested fixture. Neither replaces the other: the build is where the route is
produced, and the gate is where the address an agent would resolve is read.

**The changelog join has three doors, and its order is declared rather than
remembered.** A published package that ships a changelog owes the site a route.
The copy step refuses a route it cannot write, the corpus builder throws a
missing one when it is built, and this gate compares the workspace against the
tree in both directions and the tree against the Corpus. None of the three is
the order, and the order is what failed on `main`: the copy ran after the corpus
had been built, so the corpus asserted the existence of files that did not exist
yet. It is now the task `@nanisoft/site#copy-changelogs`, and
`@nanisoft/prism-llms#build` depends on it in the task graph, because the corpus
package is also built on its own rather than only through the site's lifecycle
scripts. The copy reads checked-in files and needs no package build, which is
what lets it sit upstream of everything the corpus reads. The same task declares
the corpus build's inputs: the site's content tree, the Item documentation tree,
the two site script modules the builder imports, the workspace globs, the
published manifests and the changelogs. Without that list a build reading another
package's tree was hashed over one package's sources, so a warm cache replayed a
corpus emitted before the tree changed and reported nothing, and only a cold
machine saw the build fail. The assertion itself is unchanged and is still what
catches a changelog the site does not publish, which is how a path the Corpus
advertised while the site returned 404 for it was found. Its message now says
which of the two causes it is, because from the builder a step that never ran and
a file somebody deleted are the same absence, and only one of them is answered by
running the step again.

## The utility cascade

The site is the one consumer here, and it is the one place two Tailwind builds meet. The site's own build scans `src`, `items` and `content`; the library's is prebuilt into `@nanisoft/prism-ui/styles.css` and imported once. Each emits its own `@layer utilities`, and the bundler concatenates them, so the reader receives one `utilities` layer holding both builds' rules in import order.

Inside one layer the only thing left deciding a tie is position, and a `@media` block adds no specificity. Tailwind guarantees that a variant's rule is emitted after the bare rule it overrides; two builds concatenated into one layer do not have that guarantee and nothing else in the cascade restores it. Layer rank cannot, because both builds share the layer, and specificity cannot, because a media query adds none.

It failed silently, and for a long time. The header's navigation row, both documentation sidebars, both header labels, the demo frame padding and the footer were all `display: none`, `padding: 1rem` or `gap: 1.5rem` at every width in both Modes, and the committed visual baselines recorded it as the expected look.

`apps/site/scripts/check-utility-cascade.mjs` is the gate, and the first one here that reads CSS. It reads the built stylesheet under `out/`, which is the only place the two builds are together, and the site's own class lists, which is where a colliding pair is written down. It asserts three things:

1. `@layer site-variants` exists in the built stylesheet, ranks above `utilities`, holds at least one rule, and holds only media-scoped rules. A layer that lost its rank, that a minifier dropped, that is empty, or that acquired a bare rule stops being the thing it is for.
2. At each of the three widths the site is held to, on every class list the site writes down, a property that some media-scoped rule also declares is decided by a media-scoped rule. Where it is not, the finding names the width, the bare rule that took the win and the variant that lost, because that is the line the layer needs.
3. `globals.css` still declares the layer, checked against the artifact so a stale `out/` cannot make a stylesheet the site no longer ships look correct.

The layer exists because raising the whole of the site's utility layer above the library's, which is the other obvious answer, is wrong here. The library generates class names at runtime from its own source, so a Button rendered by a Demo carries `h-9` and `pointer-coarse:h-11` without either string appearing in anything this site's build scans. Handing the base the win there drops the control from 44px to 36px, under the coarse-pointer floor.

**A seventh restatement exists because this gate was green over a collision whose
visibility depended on a content hash.** The library's Blocks carry
`lg:grid-cols-6`, and Tailwind emits the BARE `.grid-cols-6` alongside the variant,
so the library's copy of that one rule landed after this build's
`sm:grid-cols-11` in the one shared `utilities` layer. A media query adds no
specificity to either, so the bare rule won: every colour ramp on the Foundations
page rendered six columns at every width above 640, against a comment beside the
class saying eleven tracks from `sm` and six below. Neither side is wrong and
neither can be changed: the library's bare rule is the base of a variant four of
its Blocks use, and the site's variant means what its class says, so the loser is
restated in `site-variants`, which is what the layer is for.

Whether the gate SAW it was a coin flip. The two builds meet in content-hashed
chunk files under `out/_next/static`, the gate concatenates them in `localeCompare`
order, and the library's chunk hashed to a name that sorted after the site's.
Nothing about the tree changed when that flipped, so the same tree passed or
failed on a hash. The restatement is what makes the answer independent of it, and
the general shape is worth more than the instance: a cross-build collision whose
visibility depends on file ordering is worse than one that is simply present,
because it is intermittent and it will not reproduce on the machine that has the
other hash.

**The limit, stated plainly.** The gate reads declarations, at three widths, and
only over class lists written in the site's own source. An element whose classes
the library composes at runtime is not in that set, because nothing in the site's
source states its class list. So the computed outcome is asserted in the browser
lane as well: `apps/site/e2e/display.spec.ts` reads `getComputedStyle` for the
header navigation, the mobile menu, both header labels, both documentation
sidebars, the demo frame and the footer, at each project's own width in both
Modes, and `visual.spec.ts` keeps the 44px coarse-pointer check. The browser lane
is the only place a used value exists, so it also settles what a blockified flex
item computes to and whether a width between two of the three is wrong. Neither
lane sees what the other cannot. A third lane, `header-fit.spec.ts`, reads the
measured widths rather than the computed values, because a rule can compute to
exactly the value it should and still render 245 pixels wider than the viewport;
see the visual regression section for what that cost.

**`--font-sans` is declared twice in the composed export, and it is harmless, and
the answer is worth writing down because "harmless" and "cannot drift" are
different claims.** The site's build imports `@nanisoft/prism-tokens/dist/theme.css`
from `apps/site/src/app/globals.css` and the library's build imports the same file
from `packages/ui/src/styles.css`, so each Tailwind build inlines the `@theme static`
block and the reader's document carries `--font-sans` twice: once in the site's
chunk and once in the library's. Both are `@layer theme { :root, :host { ... } }`,
both carry the same value because both were produced from the same file in the same
build, and the second therefore resolves to the same string as the first. Measured
in `out/`: two chunks, one declaration each, both loaded on the same page, both
identical.

It cannot drift, and the reason is not that the values agree today. It is that
there is nothing to disagree about: a plain CSS `@import` of one file into two
Tailwind builds produces two copies of whatever that file says, at the same build,
so a divergence would require the token package to change between the two reads,
which is not a thing a single `next build` can do. The drift that *is* possible is
the other direction and it is the one worth naming: if one build stopped importing
`theme.css`, that build would emit no `--font-sans` at all and every `font-sans`
class it generated would resolve against Tailwind's default, which is the same
silent loss the gate above was written for. That is a deletion, not a conflict, and
`check-emitted-contract.mjs` holds the token side of it.

So the duplication is bytes and nothing else, the alternative is worse, and the
answer is recorded here rather than left as a thing somebody re-derives from a
stylesheet.

## The breakpoint variants

`packages/ui/scripts/check-breakpoint-variants.mjs` reads every responsive
variant out of the class strings in `packages/ui/src` and `apps/site/src` and
compares it to the screens the token package actually emits. It is the other half
of a question every other gate held one side of: the token side is asserted
(`check-emitted-contract.mjs` fails unless the emitted set is exactly
`{sm, md, lg}` with `xl` and `2xl` closed to `initial`, and the elevation gate
fails on a `--breakpoint-` property declared outside the token package), and the
class side was not, so the authored `breakpoint` group's own description claimed a
protection nobody was checking.

It was written for a defect that shipped. `DocsShell`'s frame read
`xl:grid-cols-[15rem_minmax(0,1fr)_13rem]` as its third track, and because the
theme closes `xl` the class compiled to nothing: the contents rail's
`lg:col-start-3` landed in an implicit `auto` track, the frame was two columns at
every width from 1024 pixels, and the article column was about 340 pixels wide at
1024 on the site and in all four consumers. Every other gate was green.

**The screens are read from the token source and never from `dist/`.** The
authored set is `packages/tokens/src/foundation/layout.tokens.json`, read from
source because a gate whose subject is the authored scale cannot be answered by a
build output a warm cache may have left behind. The closed set is
`packages/tokens/build/build.mjs`, read because a screen that is authored *and*
closed with `initial` is still closed, so reading the JSON alone would pass an
`xl:` class on the day somebody added `xl` without removing the line that closes
it. The usable set is authored minus closed, and both halves print on every run.

**What counts as a class is narrow in two directions, each to avoid a finding
that is not there.** The scan reads string literals rather than source lines,
because a variant name is a class only inside a class and the `size` variant map
of `Heading` holds a key `xl` that is a step on a type scale. It skips comments,
for the reason the retired-line gate states: a JSDoc block explaining that `xl` is
closed is a record, not a class. Strings are read wherever they are rather than
only at a `className=`, so a class in a `cva` map or a module constant is judged
too; the cost is that prose in a thrown `Error` is read as well, and that is why
a segment counts as a screen only when it is one of Tailwind's names
(`sm`, `md`, `lg`, `xl`, `2xl`, plus the container steps `3xl` and `4xl`, which are
a breakpoint in nobody's) or a `min-`/`max-` ranged form of one.

**The rule it does not hold, stated.** A screen name written in a third shape, an
invented bare word such as `wide:`, is not judged. Treating every bare lowercase
segment as a screen would report the `md` in an error message as a dead variant,
and a gate with a finding rate set by English prose is a gate nobody runs. A
screen this repository wants belongs in `layout.tokens.json` with the other four,
where the build emits it and this gate then holds the class to it.

## The heading scale

`scripts/check-heading-scale.mjs` reads the table `SectionHeading` sizes its
heading by, judges every step in it against the `text` group in
`packages/tokens/src/foundation/base.tokens.json`, and holds the table against the
markdown table the Component's own JSDoc states.

It was written for a defect that shipped and that no other gate could see.
`DESIGN.md` under Typography, Hierarchy gave Display two roles at once: "section
titles, the CTA banner heading, and every page `h1`". `SectionHeading` wrote one
class string for all six levels, so an `h1` and an `h2` came out byte-identical
and a landing page of a hero plus six Blocks showed one `h1` and six section
titles at 36 pixels. Every other gate was green and correctly so: the outline was
right at every level, the alignment was left where the shared rule says it must be,
every Block forwarded its `headingLevel` faithfully, and
`test/card-title-headings.test.tsx` held the outline. The size was a constant
inside a Component, and a Block that forwarded its level perfectly was
indistinguishable from one that ignored it, because forwarding it changed nothing
a test could observe.

**The rules.** Every level in the outline has an entry. Every step named is a step
the token source authors. The top two levels do not share a step. The steps
descend one authored step at a time until they stop. The largest step anywhere in
the table is the largest step the token source authors, which is how "nothing in
the system goes above `4xl`" is held from the component side. The floor is at or
above the step `DESIGN.md` gives Body. `font-semibold`, `tracking-tight` and
`text-balance` are on the heading and not in the per-level strings. The JSDoc table
is the code table, cell for cell. And `DESIGN.md`'s Hierarchy gives Display one
role, and it is not the section title.

**Why the top-two rule is its own rule.** Every level at one step is flat, and
flat is not descending, so a rule that only asked whether the sequence falls would
have printed a clean line over the exact defect that shipped. The staged fixture in
`scripts/__tests__/heading-scale.test.mjs` is that table, and the gate is asserted
to fail on it.

**Two copies of one table in one file, and why that is not the second copy this
repository refuses.** The map is private and read through `headingSizeClass`; the
markdown table is in the JSDoc, which the declaration build preserves and the
corpus reads. Reading only the map would pass a Component whose documentation
promises a size it does not render, which is the half of the defect that reached a
consumer.

**What it does not hold, stated.** The step `DESIGN.md` gives Body is named in the
gate rather than read, because "Body is 400 at `lg`" is a sentence in a document
and not a field in the token source; its value is read from the source and printed
on every run, so a retune of `lg` shows in the output even though the rule does not
follow it. The rule about `DESIGN.md` reads one bullet and refuses two words in it,
so a rewrite of the surrounding prose does not turn the gate red. And the whole
gate reads one file, so a second surface that resolves its own heading tag is out
of its reach unless it is named as a root; `Cta01` is the one that is, because it
is the one that drew its own heading element, and a second literal step on it is a
finding.

## The nested-control rule

`scripts/check-nested-controls.mjs` reads the JSX in `packages/ui/src`,
`apps/site/src` and `apps/site/items`, and fails on a control inside a control. The
HTML content model puts a hard boundary around the interactive content of an anchor
and around the content of a button, and both halves of that are defects a reader
meets rather than a validator's opinion: a keyboard reader reaches two tab stops for
one action and hears two things, and a pointer reader's press has to be resolved
between two elements whose activation rules disagree.

**The one occurrence shipped, on the 404 route.** `apps/site/src/app/(site)/not-found.tsx`
wrapped a `Button` in a `next/link`, so the page a reader reaches by following a
dead address emitted `<a href><button>…</button></a>`. It type-checked, because both
Components accept the props they were given, and it passed every other gate,
including the focus gate and the rendered-output claim, because each of those asks
whether something is right and none of them asks whether two elements may sit inside
each other. The repository had already answered the question twice in writing, in
`dropdown-menu.tsx` and at the `render={<a/>}` call site in
`blocks/site-navbar/sites-menu.tsx`: a control that navigates has to BE the link.
`Button` carries no `render` or `asChild` seam, so a caller cannot express that and
nesting one inside the other is the only way left to get an anchor in a button's
clothes. The gate is what stops the nesting from being how anyone finds out.

**What counts as a control, and what is declared not to.** A native `button`,
`input`, `select`, `textarea` and `summary`, and an `a` carrying an `href`. The
Prism Components whose element is one of those, plus `Link` and `NavLink`, because a
router link renders an anchor: the defect was a `Button` inside a `Link`, and a
table that only knew the lowercase tags would have read it as a Component inside an
unknown element and found nothing.

**`label` is the exception, and the first run proved it was needed.** A label
wrapping the control it names is the pattern the specification recommends, and this
repository ships four of them. A rule that counted every label as interactive
reported four findings on correct markup, which is the failure a gate nobody has
watched fail cannot be told apart from. So a `label` counts as a parent only for a
descendant that is not a labelable control, and `label` prints on every run with the
number of times it was read as one: four in this tree, rejecting nothing.

**An anchor counts as a parent only when it carries an `href`.** The transparent
content model applies when it does not, so `<a><button/></a>` is a placeholder and is
legal while `<a href="…"><button/></a>` is not. The rule is applied to parents as
well as to children, because a gate that is exact in one direction and approximate
in the other is a gate whose answer depends on which way the markup was written.

**The rule it does not hold, stated.** It reads source, not rendered output. A
control chosen at runtime, one composed inside a fragment the scan does not track,
and one assembled in a string are all invisible to it, and an anchor is a control
here on the word `href` being present rather than on its value. What it holds is the
shape a later edit changes, which is the same claim the narrow-viewport suite makes
for the same reason. Test files are excluded, because a spec that renders
`<a><button/></a>` to prove a page no longer does is writing the defect down on
purpose.

**The proof is `scripts/__tests__/nested-controls.test.mjs`, not a run.** Four
cases must fire and five must stay green, each named for the rule whose removal
would redden it, and every case runs the gate as a process against a staged tree so
no test has to dirty the repository to see the gate react. The shipped tree has no
genuine finding.

## The container-namespace gates

The container namespace needed two gates for the reason the breakpoint namespace
needed two directions, and the split is the same one each time: the value is one
question and the class is another, and this repository has twice found that a
gate holding one half was green over a tree that failed on the other.

`scripts/check-elevation-layout.mjs` holds the NAME. It reads every `w-*` and
`max-w-*` out of the class strings in `apps/site/src`, `apps/site/items`,
`packages/ui/src` and `scripts`, and holds each to the `container` group read out
of `layout.tokens.json`, so adding a container to the token source widens the rule
without editing the gate. It judges the shape rather than the spelling: a bare
number or a fraction is arithmetic on `--spacing` and is left alone, a word is a
name and has to be one this repository authors, an arbitrary value is refused by
the older rule beside it, and the keyword widths are declared rather than inferred
because they name the reader's own box rather than a value out of a scale. Comments
are blanked before it reads, because a JSDoc block that explains that the
namespace is closed is a record rather than a class.

`packages/ui/scripts/check-container-namespace.mjs` holds the ARTEFACT, and it is
the half a source scan cannot reach. The defect it was written for shipped and
every other gate was green: Tailwind's own thirteen `--container-*` steps survived
into the shipped stylesheet beside the three this package authors, and three of
them were numerically identical to authored widths (its largest at 72rem beside
`page`, its fifth at 42rem beside `measure`, its fourth at 36rem beside
`measure-narrow`), so a retune of `--container-page` would have moved every
surface reaching the page column by one spelling and left every surface reaching it
by the other exactly where it was. It reads `dist/styles.css` and fails when the
`@layer theme` block declares anything but the authored containers, when one of
Tailwind's steps is declared or read, when the close is written after the entries
it was meant to precede, when a width this package writes is not emitted as a
utility reading its own variable, and when an authored container no surface
reaches. Tailwind's step list is read out of the installed `tailwindcss/theme.css`
rather than restated, so a dependency that adds a step is covered without an edit
and a framework that will not resolve fails the run rather than checking an empty
set.

`packages/ui/test/container-namespace.test.tsx` states the same artefact facts
through `packages/ui/test/sheet-reader.ts`, beside `reduced-motion.test.tsx` and
`progress-origin.test.tsx`, so the built-sheet facts a reader comes looking for are
in one place. `packages/tokens/scripts/check-emitted-contract.mjs` holds the third
thing, which is the order: the close has to be written ahead of the authored
entries, because Tailwind resolves a theme in source order and the same declaration
written after them clears all eight and ships no container at all.

## The motion gate

`scripts/check-motion.mjs` is the newest gate here and it exists because two
documents described it and nothing implemented it. `AGENTS.md` lists `motion` in
the `pnpm check` line and `DESIGN.md` states the law as "enforced by the grep and
motion gates", and there was no motion gate: a Component could have written
`duration-[400ms]` or `cubic-bezier(0.4,0,0.2,1)` and all twenty-eight gates would
have been green. That is the defect class this document's own header names, so it
is worth being exact about the order of events: the law was written, described as
enforced, and left unenforced until a reader went looking for the file.

It reads component source, which is the five authored trees whose source reaches a
reader's screen or an agent's answer: `packages/ui/src`, `packages/llms/src`,
`packages/mcp-server/src`, `apps/site/src` and `apps/site/items`. It is a
repository-root script for the reason the elevation gate is one: the population
spans two packages, so no package's own `check` can own it.

**Four rules, and four narrow readings that keep them off the wrong thing.**

1. A `cubic-bezier(` literal, matched **with its argument list**. The word alone is
   allowed, and had to be: the rule string `packages/mcp-server/src/rules.ts` serves
   to an agent reads "never by a millisecond or a `cubic-bezier` literal", with no
   parentheses, and it must keep reading correctly.
2. An arbitrary duration, easing or animation utility: `duration-[...]`,
   `ease-[...]`, `animate-[...]`. `animate-[...]` is not in the sentence
   `DESIGN.md` uses and is here anyway, because `backdrop-01` records the rejected
   shape as `animate-[prism-travel_7.2s_linear_infinite]`, which is a duration and
   an easing in one bracket form. A rule that banned only the other two would be
   passed through by rewriting the same defect in a third utility.
3. A time value beside a motion property, where the property is a **closed table**
   printed on every run.
4. A **per-call-site reduced-motion guard**: a `motion-safe:` or `motion-reduce:`
   variant on `transition-*`, `duration-*` or `ease-*`. Those three bases are the
   ones `packages/ui/src/styles.css` decides for every element, and a guard beside
   them is either inert or a second place to retune the policy. The variant has to
   be immediately before the utility, because a compound of two variants is two
   variants and only the last one applies.

**And a fifth thing, which is not a pattern.** The gate reads `.css` files, and
`packages/ui/src/styles.css` is read twice over: once as component source and once
as the file the reduced-motion policy lives in. `reduced-motion-block` is a check
over that one file rather than a pattern over five roots, and it fires when the
file is in the population and stays quiet in a staged tree with no stylesheet in
it. It asserts four things, and each is a shape this policy has actually been
wrong in: one `@media (prefers-reduced-motion: reduce)` block rather than two, a
selector that names no class, both `animation: none` and `transition: none`
declared, and a block that is not inside an `@layer`. That last one is the rank
the rule has: a declaration outside any layer outranks a declaration in one
whatever its specificity, and a rule at `*` inside `@layer utilities` would be
outranked by `.duration-slow` and ship a policy that does nothing.

`packages/ui/test/reduced-motion.test.tsx` holds the same four claims against the
**emitted** sheet, with the cascade comparator `progress-origin.test.tsx` brought
out of that file and shared, because a test that reads what the build wrote is
stronger than a gate that reads what a Component meant. The gate is not redundant
with it: the test cannot run before a build, and a gate that needs a build is not
a gate.

**Comments are blanked before anything is read.** Seven of the `\d+ms` occurrences
in `packages/ui/src` today are inside JSDoc blocks that quote the value while
explaining why it is banned: `drawer.tsx` on 280ms, `toast.tsx` on `0.01ms`,
`backdrop-01` on the rejected `animate-[...]`. A line-based rule would have failed
the build on day one over seven records.

**A string is not a comment.** `check-breakpoint-variants.mjs` already settled
where that line falls for classes: a variant name is a class whenever it is inside
a string, because a class held in a `cva` map or a module constant is as much a
class as one written inline. So a `duration-[400ms]` in a module constant is a
finding, and moving that same sentence into a comment makes it a record. The gate
reads a regex literal rather than opening a string inside one, on the standard
preceding-token heuristic, which is an approximation and is stated as one.

**What it does not read, and that is a scope decision rather than an omission.**
`packages/tokens/**` is the foundation tier and owns the values: the literal curve
is in `packages/tokens/src/foundation/base.tokens.json` and the writer is
`packages/tokens/build/serialize.mjs`. `packages/ui/gates/**`, `scripts/**` and
every package's `scripts/**` are a gate's rule table and the consumer gate kit,
which exist to restate laws as failure messages in a consumer's own repository;
reading them would mean either a permanent exclusion list or a gate that reports
its own table. `apps/site/src/generated/**` is written at `pretest` from the Demos
in `apps/site/items`, which are read directly. Every exclusion prints on every run.

**Coverage is asserted and so is the rule's reach.** Roots resolve from the script's
own location and a missing root fails naming both causes; a run that read no file
fails; and a run that read files and found no `duration-fast`, `duration-base`,
`duration-slow`, `ease-out` or `ease-in-out` in any of them fails as well, because
a tree carrying no motion is a tree the rule cannot see. `scripts/__tests__/motion.test.mjs`
stages seventeen failing and twelve passing cases against the real gate, because a
clean repository cannot tell a rule from a pattern that never matches anything.

## The search index

`apps/site/scripts/check-search-budget.mjs` runs in the site's `postbuild` and
fails the build when the static index a reader's browser downloads on the first
keystroke is over **300 KiB gzipped**. The threshold is the number the reader
pays, not a number that tracks the content: a ceiling that moved with the pages
would be a report of history.

**It does not carry every page the site publishes, and the second assertion is
what says so.** The Section manifest marks the Changelogs Section as not
searched, `buildSearchIndexes()` asks `isSearchedRoute()` for every page, and the
gate then compares the set of routes the built index holds against the set the
content tree, the Item documentation and the Section manifest say it should hold,
in both directions. Three failures are therefore impossible to ship: a published
page the index does not hold, a route the manifest excludes that the index holds
anyway, and a Section widened to not searched without a failing build. The
expected set is read from disk rather than from the module that built the index,
because a gate that agrees with the code it checks cannot fail. The gate prints
both counts on every build, so a reader of the log can see the page count and the
ceiling together.

**Why the Changelogs Section is the exclusion, and why the ceiling did not
move instead.** The index exists to answer one question, which is how do I use
this, and a changelog cannot answer it: it is a dated record of what changed, so
its value is in its dates and its wording is the package maintainer's rather than
a reader's. A reader who searches a changelog wants the version a change landed
in, which the routes, the navigation, the Corpus and the tools answer better and
already did. It is also the one page class here that grows without bound, because
the text arrives from the changesets generator on every release and is never
shortened, so any budget an index containing it is held to is a budget the next
routine release breaks. That is a fault in what is indexed rather than bad luck,
and trimming the threshold to fit what a release happened to produce would turn
a ceiling into a description of history. The exclusion removes the unbounded
class; it does not make the number smaller to look tidy.

**The exclusion is about the client's index and nothing else.** The Section
landing page stays in the index, because it is authored prose that says what the
Section is and links every package in it, so a reader who searches for a
changelog still lands somewhere that answers. The four per-package routes keep
their pages, their navigation entries, the authored index that links them, the
Corpus entry, the Markdown mirror and the `get_changelog` tool. The content-join
gate already asserted most of that; what it could not see is the index, and that
is the half this gate owns.

At the time of writing the measured index is **1344.2 KiB raw, 286.8 KiB
gzipped** over **69 pages**, against 1424.9 KiB and 302.6 KiB over 73 pages
before the exclusion. The four pages that left are the four published packages'
changelogs, which is the whole difference.

## The client-JavaScript budget

`packages/ui/scripts/check-client-budget.mjs` bundles each emitted
`dist/components/ui/<name>.js` and its Base UI subtree tree-shaken, minified and
gzipped. React, React DOM, the shared floating engine and the shared class-merge
utility are the runtime every client component already pays for and are excluded
from the measured figure. Per-item sizes are compared to the `BUDGETS` table in
that script and reported. The deduplicated all-client bundle is compared to the
116 KB gzip ceiling and fails.

The measured all-client bundle is **108.0 KB**, within the ceiling, and every
per-item figure exceeds its budget because `@base-ui/react@1.8.0` and
`tailwind-merge` are larger than the budgets assume; those are reported and do not
fail. The gate prints both figures so the number is auditable.

The ceiling has moved twice and the script records why each time. It was 90 KB
when the roster read one directory and missed the provider, so that figure was
never a statement about all of the client JavaScript; completing the roster put
the truth over it and it was re-pinned to 92 KB. It is 116 KB now because the
roster was widened to the whole emitted tree, which found 53 modules the
two-directory version had never read and put the honest figure at 108.0 KB. The
16 KB of new headroom is not new weight. It is weight that was always shipping.

**A ceiling with a fraction of a kilobyte of headroom is not a policy, it is a
pin.** At 92 KB against a 90 KB bundle the gate had 0.3 KB of slack, so it failed
on an unrelated dependency bump and the fastest available answer was to rerun it
with a bigger number. The current figure leaves about 7 percent.

## Accessibility coverage

Two automated checks run. `packages/ui/test/a11y.test.tsx` runs axe-core over
every rendered component in jsdom and fails on violations. The report-only
Playwright job runs `@axe-core/playwright` in a real browser, which is the only
place the `color-contrast` rule can evaluate.

axe catches roughly **one third** of real accessibility defects. It reliably
catches missing accessible names, invalid ARIA, broken roles, duplicate ids and
missing form labels. It does not catch tab order, keyboard traps, focus-visible
visibility, screen-reader announcement quality, reduced-motion handling, the
semantics of a composite widget in operation, or contrast of composited, alpha,
backdrop or gradient layers. The keyboard and focus assertions in the component
suites and the token contrast gate cover parts of that list; the rest is named
below. The site's accessibility claim is therefore gated by axe plus the
keyboard and focus suite plus the token contrast gate, and is still not a proof
of accessibility.

## Visual regression

`apps/site/e2e/visual.spec.ts` runs Playwright's `toHaveScreenshot()` over the
built site at 390, 768 and 1440 pixels, light and dark, on `/`, `/components`,
one component item, one block item, `/foundation`, `/foundation/themes` and
`/changelogs`, with committed baselines and `maxDiffPixelRatio: 0.01`. The job is
report-only (`continue-on-error: true`) and uploads the report as an artifact
and one pull request comment.

**The 768 project is exercised and committed.** The header row used to compute to
1013 pixels at a 768 pixel viewport, because the horizontal navigation was on
screen from `md` up and carries seven Section links, so `scrollWidth` was 1013
against a `clientWidth` of 768, the document scrolled sideways and the mode toggle
sat off screen. The row now switches at `lg` with the documentation sidebar, and
the mobile menu carries the Sections below it, so the 768 baselines are cut and
committed with the rest. The residual is stated rather than hidden: from 1024 to
1085 the row is up to 61 pixels short of its natural width and the wordmark, the
only elastic element in it, takes two lines. Those widths rendered that way before
the fix and render that way now, because the row was already on screen at `md`
there. `apps/site/e2e/README.md` carries the detail.

`apps/site/e2e/display.spec.ts` is in the same job and is not report-only. It
asserts computed display, padding and gap for the elements the cascade gate cannot
reach into, at each project's own width in both Modes and at the coarse pointer.
It is the reason a cascade regression is a red line rather than a pixel diff in a
report nobody reads, and it runs inside a report-only job, which is a deliberate
mismatch worth naming: until the promotion rule below is met, a display failure
does not fail CI. `pnpm --filter @nanisoft/site run visual` fails locally, and the
gate in `scripts/` fails the build for the half the gate can see.

**And it is not sufficient on its own, which the 768 episode proved.** A computed
`display` is what the cascade decides, not what the element measures, so
`display.spec.ts` asserted `flex` at 768 for as long as the row was 1013 pixels
wide and passing. `apps/site/e2e/header-fit.spec.ts` is the lane that reads the
measurements: it sweeps 390, 640, 768, 1024 and 1440 in both Modes on the landing
page and on a documentation route, and asserts that the document does not scroll
sideways, that every control in the header is inside the viewport, and that the
affordance on screen is the one that width is designed for. It also opens the
disclosure at 640 and 768 and asserts it carries all seven Sections, so a
navigation that moved cannot quietly cost a route. The widths are the union of the
authored thresholds and the visual viewports rather than the gate's three, because
the defect lived in a width between two of them.

Promotion rule: once the baseline has been stable for two consecutive weeks with
no unexplained diff (target: ten consecutive merges), remove
`continue-on-error` and make the job required. Any unexplained diff resets the
clock.

## The consumer gate kit, and what it is not in this table

`packages/ui/gates/` is a gate set that runs in a *consumer's* repository rather
than in this one, so it has no row above: it is the row every other repository's
row now points at. `scripts/check-gate-kit.mjs` is in the table because it is the
only part of the kit that runs here.

The distinction is worth stating, because a list of gates that quietly omits the
one that coordinates four other repositories is the same defect class as a
catalogue whose registry and list disagree. So:

- **The laws live there, once.** `packages/ui/gates/laws.mjs` is the single
  definition of every cross-repository law's title, its failure message, and the
  failure each one prevents. `check-gate-kit.mjs` asserts that every law has a
  gate and every gate names only laws that exist, in both directions and by name.
- **The programs are there too**, so a consumer's repository holds only data: its
  roots, its stylesheets, its pack map, its region resolver, its coverage floors,
  the destinations its own corpus gets wrong, and the custom properties its own
  build supplies. A consumer that keeps its own copy of a gate keeps a second law.
- **It is not in the tarball's `dist/`, and must not be.** It is a build-time
  program for another repository; putting it in `dist/` would put it in a
  consumer's module graph and its bundle.
- **Its own tests drive every gate to red on a fixture**, because a gate that has
  never been red is not evidence of anything. That is `packages/ui/gates/__tests__/`,
  run by `pnpm test:scripts`.
- **Its limits are the ones this document already keeps making.** It reads text
  rather than resolving a cascade, it reads the emitted export rather than a
  browser, and it cannot see an attribute a runtime sets after paint. Each gate
  prints its own limit on every run, because a gate that appeared to resolve
  cascades and did not would be worse than no gate: it would retire the question.

`docs/consumer-gates.md` records where the line was drawn between a law and a
site's data, and what was deliberately not moved.

## What a green build does not prove

The gates are new, so a green build proves the gates ran, not that the system is
free of these defects.

- It does not prove the design looks right. Visual regression is report-only;
  even when it fails, the build does not.
- It does not prove accessibility. Automated checks cover about a third of real
  defects, as above.
- It does not prove real rendered contrast. The token gate checks listed pairs
  at resolved values; it does not composite alpha, `color-mix`, `/50` modifiers,
  gradients or overlay contexts. The recorded focus-ring episode (the gate said
  4.5:1, half-alpha composited to 1.96:1) is the proof that the gate and a
  browser can disagree.
- It does not prove a consumer's integration. The utility cascade is gated for
  this site at three widths and over site-authored class lists, and nothing else:
  a consumer's own `@source`, their bundler, SSR and hydration in their app, and
  prerender or RSC boundaries are outside every gate here.
- The cascade gate reasons about declarations at 390, 768 and 1440 pixels. A
  collision that only resolves wrong between two of those is outside it and inside
  the browser lane. `header-fit.spec.ts` sweeps 390, 640, 768, 1024 and 1440, so
  the widths it covers are the union rather than the gate's three, and neither is
  a proof at every width.
- A passing fit lane proves the header did not overflow at the widths it swept and
  that one of two affordances was on screen. It does not prove the row looks
  right at a width it does not sweep, and it cannot: from 1024 to 1085 the row is
  up to 61 pixels short of its natural width and the wordmark takes two lines,
  which the lane has no assertion against because the row is on screen and nothing
  overflows there.
- "Zero client JavaScript" means "no statically detectable client boundary".
  The analysis is lexical: it can over-approximate, and it cannot see a computed
  `import()` or a `require` assembled at runtime.
- The motion and semantic-utility gates are textual. A duration computed in
  JavaScript or a custom property assembled at runtime can slip past a grep.
- The breakpoint-variant gate judges Tailwind's screen names and the `min-`/`max-`
  forms of them, and it reads the class strings a source file writes. A screen
  named in a third shape, and a class string assembled at runtime, are both
  outside it.
- The focus-indicator gate reads class strings in `packages/ui/src` and no
  consumer stylesheet, and it reads the five roots the package ships
  (`components`, `blocks`, `pages`, `live`, `provider`) and not `apps/site`,
  which is another package with its own `check` chain. It cannot prove which
  declaration wins a cascade, and a control that answers focus with a fill rather
  than a ring is an exclusion rather than a finding, so the three declared
  exclusions in `EXCLUSIONS` are the whole of what it will not report.
- No gate measures a target size. The 44px coarse-pointer floor is asserted by
  the test beside each primitive, naming the class its own floor is written as,
  which is a weaker mechanism than a scan and the only one available without a
  browser.
- The dash gate covers em and en dashes and the `???` pattern only, in the
  listed files.
- The registry validator proves internal consistency, not installability. The
  tarball verifier proves contents, not runtime compatibility.
- The search budget gate bounds the bytes and asserts the page set, and the page
  set it asserts is "every published content page except the Sections the
  manifest marks as not searched". It does not judge whether that exclusion is
  the right one; a Section marked as not searched for a good reason and one marked
  for a bad reason look identical to it, and the argument for the exclusion lives
  in the manifest and in this document rather than in a threshold.
- No byte budget is enforced for `styles.css`. The client analyzer measures
  source, not the compiled bytes a consumer downloads; a `styles.css` gzip
  budget is the strongest candidate for a future fail gate and is not adopted.
- The typeface gate reads the emitted stylesheet and the binaries beside it, so it
  proves that every family `--font-sans` names resolves to something this package
  publishes and that the licence ships with the file. It does not prove a browser
  fetched it. Nothing in the gate set preloads the face, and nothing can: a
  preloaded URL is content-hashed at build time, so the only lane that could emit
  one is the one that used to, `next/font`, and the site no longer uses it. The
  metric-adjusted fallback is what stands in for the lost preload, because it
  removes the layout shift rather than the round trip, and the round trip is a
  cost a reader on a fast connection will not notice and a reader on a slow one
  will.
- There is no cross-browser or cross-engine testing. jsdom is not a browser, and
  the visual job is Chromium only.
- A passing suite proves the assertions passed, not that they were the right
  assertions. The suite is new.
