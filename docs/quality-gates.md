# Quality gates

This document records what the gate set asserts, which gates fail and which only
report, and what a green build does not prove. It is the honest companion to
`pnpm check`; the executable truth is the scripts themselves.

## Fail or report

One rule decides every split below: a check fails when its failure would let a
consumer-facing claim be false or a consumer's install break. A number whose
threshold is a judgement, or a measurement that informs a human decision,
reports and is published.

| Package | Fails the build | Reports only |
| --- | --- | --- |
| `prism-tokens` | contrast gate, emitted-contract, the `: undefined` read-back, the per-theme key-set guard, motion, elevation and layout, build-twice determinism | the two advisory contrast pairs (border and input) |
| `prism-ui` | surface scan, registry validator (registry and published file list), the component suites, the axe suite, the JSDoc and catalogue checks, the two source grep gates | per-item client-JavaScript measurement, the demo `client` flag |
| `prism-llms` | corpus drift, build-twice determinism, per-item mirror and store coverage, the store type round-trip, the declared output list | corpus freshness stamp |
| `prism-mcp-server` | the protocol round-trip suite, tool registry equals the corpus, the bundled `data.json` hash | corpus freshness |
| `@nanisoft/site` (private) | dash gate, content joins (including the redirect coverage and the Worker's first-run prefixes), utility cascade, search gzip budget, registry artifacts absent from `out/` | visual regression, the computed display assertions, per-item client measurement |

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

## The utility cascade

The site is the one consumer here, and it is the one place two Tailwind builds meet. The site's own build scans `src`, `items` and `content`; the library's is prebuilt into `@nanisoft/prism-ui/styles.css` and imported once. Each emits its own `@layer utilities`, and the bundler concatenates them, so the reader receives one `utilities` layer holding both builds' rules in import order.

Inside one layer the only thing left deciding a tie is position, and a `@media` block adds no specificity. Tailwind guarantees that a variant's rule is emitted after the bare rule it overrides; two builds concatenated into one layer do not have that guarantee and nothing else in the cascade restores it. Layer rank cannot, because both builds share the layer, and specificity cannot, because a media query adds none.

It failed silently, and for a long time. The header's navigation row, both documentation sidebars, both header labels, the demo frame padding and the footer were all `display: none`, `padding: 1rem` or `gap: 1.5rem` at every width in both Modes, and the committed visual baselines recorded it as the expected look.

`apps/site/scripts/check-utility-cascade.mjs` is the gate, and the first one here that reads CSS. It reads the built stylesheet under `out/`, which is the only place the two builds are together, and the site's own class lists, which is where a colliding pair is written down. It asserts three things:

1. `@layer site-variants` exists in the built stylesheet, ranks above `utilities`, holds at least one rule, and holds only media-scoped rules. A layer that lost its rank, that a minifier dropped, that is empty, or that acquired a bare rule stops being the thing it is for.
2. At each of the three widths the site is held to, on every class list the site writes down, a property that some media-scoped rule also declares is decided by a media-scoped rule. Where it is not, the finding names the width, the bare rule that took the win and the variant that lost, because that is the line the layer needs.
3. `globals.css` still declares the layer, checked against the artifact so a stale `out/` cannot make a stylesheet the site no longer ships look correct.

The layer exists because raising the whole of the site's utility layer above the library's, which is the other obvious answer, is wrong here. The library generates class names at runtime from its own source, so a Button rendered by a Demo carries `h-9` and `pointer-coarse:h-11` without either string appearing in anything this site's build scans. Handing the base the win there drops the control from 44px to 36px, under the coarse-pointer floor.

**The limit, stated plainly.** The gate reads declarations, at three widths, and only over class lists written in the site's own source. An element whose classes the library composes at runtime is not in that set, because nothing in the site's source states its class list. So the computed outcome is asserted in the browser lane as well: `apps/site/e2e/display.spec.ts` reads `getComputedStyle` for the header navigation, the mobile menu, both header labels, both documentation sidebars, the demo frame and the footer, at each project's own width in both Modes, and `visual.spec.ts` keeps the 44px coarse-pointer check. The browser lane is the only place a used value exists, so it also settles what a blockified flex item computes to and whether a width between two of the three is wrong. Neither lane sees what the other cannot.

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

**The 768 project is exercised and has no committed baseline.** The header row
computes to 1013 pixels at a 768 pixel viewport, because the horizontal
navigation is on screen from `md` up and now carries seven Section links, so
`scrollWidth` is 1013 against a `clientWidth` of 768 and the document scrolls
sideways with the mode toggle off screen. Before the cascade layers landed the
navigation was `display: none` at every width and the row was never asked to fit,
so every 768 shot was 768 pixels wide; the branch base renders all forty-two of
them pixel-exact. The overflow is what became visible when the header started
rendering, and it belongs with the header. A baseline there would make the next
run pass and remove the evidence, so the shots are left uncut and the job reports
them. `apps/site/e2e/README.md` carries the detail.

`apps/site/e2e/display.spec.ts` is in the same job and is not report-only. It
asserts computed display, padding and gap for the elements the cascade gate cannot
reach into, at each project's own width in both Modes and at the coarse pointer.
It is the reason a cascade regression is a red line rather than a pixel diff in a
report nobody reads, and it runs inside a report-only job, which is a deliberate
mismatch worth naming: until the promotion rule below is met, a display failure
does not fail CI. `pnpm --filter @nanisoft/site run visual` fails locally, and the
gate in `scripts/` fails the build for the half the gate can see.

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
  the browser lane, and the browser lane evaluates the same three widths. Neither
  is a proof at every width.
- "Zero client JavaScript" means "no statically detectable client boundary".
  The analysis is lexical: it can over-approximate, and it cannot see a computed
  `import()` or a `require` assembled at runtime.
- The motion and semantic-utility gates are textual. A duration computed in
  JavaScript or a custom property assembled at runtime can slip past a grep.
- The dash gate covers em and en dashes and the `???` pattern only, in the
  listed files.
- The registry validator proves internal consistency, not installability. The
  tarball verifier proves contents, not runtime compatibility.
- No byte budget is enforced for `styles.css`. The client analyzer measures
  source, not the compiled bytes a consumer downloads; a `styles.css` gzip
  budget is the strongest candidate for a future fail gate and is not adopted.
- There is no cross-browser or cross-engine testing. jsdom is not a browser, and
  the visual job is Chromium only.
- A passing suite proves the assertions passed, not that they were the right
  assertions. The suite is new.
