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
it is green, it is believed, and it is not checking anything.

| Package | Script | Fails the build | Reports only |
| --- | --- | --- | --- |
| `prism-tokens` | `scripts/check-contrast.mjs`, `scripts/check-emitted-contract.mjs`, `scripts/check-determinism.mjs` | the contrast gate's role walk, its exemption list, the mode rule and the chart-series distinctness assertion, the emitted contract (completeness, value equality, spacing arithmetic, no extras, and the mode-independent groups including the closed duration, easing, shadow, breakpoint and container sets), build-twice determinism | the three advisory contrast pairs (`border`, `input` and `sidebar-border`) |
| `prism-ui` | `scripts/validate-registry.mjs`, `scripts/check-surface.mjs`, `scripts/check-client-budget.mjs` | surface scan, registry validator (registry and published file list), the component and axe suites | per-item client-JavaScript measurement |
| `prism-llms` | `scripts/check.mjs` | corpus drift, per-item mirror and store coverage, the store type round-trip, the declared output list | none |
| `prism-mcp-server` | `src/registration.test.ts` and the bundled-data hash | the protocol round-trip suite, the registered tool list equals the package's declared `TOOL_ORDER` with every tool served from the bundled corpus, the bundled `data.json` hash | corpus freshness stamp (`scripts/stamp-built.mjs`) |
| repository root | `scripts/check-dashes.mjs`, `scripts/check-elevation-layout.mjs`, `scripts/validate-changesets.mjs` | the dash gate, the elevation and layout gate, the changeset validator | none |
| `@nanisoft/site` (private) | `scripts/check-utility-cascade.mjs`, `scripts/check-content-joins.mjs`, `scripts/check-search-budget.mjs` | content joins (including the redirect coverage and the Worker's first-run prefixes), utility cascade, search gzip budget | visual regression and the computed display assertions, both inside the report-only `visual` job |

Two entries this list used to make, and what they really are:

- **JSDoc and catalogue coverage is not a `prism-ui` gate.** It is asserted by
  `packages/llms/scripts/check.mjs` against the emitted declarations, so it is
  attributed to `prism-llms`.
- **The dash and elevation gates are repository-root scripts, not `prism-ui`
  tasks.** The dash gate lists the site's and the packages' trees among its
  roots, which is not the same as the site's `check` running it. They run first
  in the root `check` chain.
- **The demo `client` flag and the per-item site client measurement are not in
  any gate lane.** The flag is produced by the manual `catalog:analyze` task and
  CI never runs it; the per-item measurement is `prism-ui`'s
  `check-client-budget.mjs` and is listed above.
- **No gate asserts that the shadcn registry artifacts are absent from `out/`.**
  `AGENTS.md` states the rule and nothing checks it, so it is recorded here as an
  unenforced instruction rather than as a gate.

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
90 KB gzip ceiling and fails.

At the time of writing the measured all-client bundle is **89.7 KB**, within the
ceiling, and the same bundle with the shared runtime included is 105.6 KB. Every
per-item figure exceeds its budget because `@base-ui/react@1.8.0` and
`tailwind-merge` are larger than the budgets assume; those are reported and do
not fail. The gate prints both figures so the number is auditable.

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
- There is no cross-browser or cross-engine testing. jsdom is not a browser, and
  the visual job is Chromium only.
- A passing suite proves the assertions passed, not that they were the right
  assertions. The suite is new.
