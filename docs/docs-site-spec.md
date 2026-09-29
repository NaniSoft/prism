# Documentation site structure

The specification the wayfinding map
[Prism docs: Plasma-shaped information architecture and content structure](https://github.com/NaniSoft/prism/issues/6)
was finding its way to. Every decision below was settled on a closed ticket; the
ticket holds the reasoning and the evidence, this document holds the result.

This is a specification. It describes the target and the order of the work. It is
not a report of work done.

**The specification of record is
[issue #17](https://github.com/NaniSoft/prism/issues/17)**, which carries the same
decisions in an implementable form with the user stories and the testing
decisions. This document is its design companion and holds the reasoning. Where
the two differ, the issue wins.

## What is being changed

The documentation site is reorganised to match the shape of
[Plasma](https://plasma.coveo.com/), the reference the team asked for. Plasma's
inspiration is organisational: how the content is divided, named, ordered and
addressed. It is not visual. The design system does not move.

Four things change.

1. The site gains an Overview section, a Foundation section that absorbs the
   themes reader, and a Changelogs section.
2. The top navigation nests Components under the seven role categories that
   `DESIGN.md` already defines and the sidebar does not currently use.
3. The content tree on disk becomes Plasma-shaped: one folder per item holding
   that item's documentation and its demo, category-nested for Components.
4. The section list stops being stated in four places and starts being read from
   one.

## What is deliberately not changing

- **The design system.** shadcn, the unprefixed token contract, the five pastel
  packs, Inter, the one stylesheet, the type scale, the radius scale, the
  component library, the token pipeline.
- **The shell's construction.** fumadocs stays headless. `fumadocs-ui` is not
  adopted, the sidebar is not replaced, and every visible control remains built
  from Prism Components and Blocks, per "One stylesheet" and "No override path"
  in `AGENTS.md`.
- **The landing page at `/` composes the library's own Blocks.** It opens with
  `Hero01` in its split form, beside an `InstrumentPanel01` holding a
  `PulseGraph` of the token pipeline, and it closes its measured numbers with
  `Stats01`. The four rules band and the pack band are site apparatus composing
  `Section` and `SectionHeading`, because the two jobs a Block could not do were
  a hairline list of four claims rather than four tiles, and six swatches drawn
  in each pack's own compiled values. `Cta01` and `FeatureGrid01` are no longer
  composed there: both rendered the same shape the page had four of at once, and
  a landing page that repeats one arrangement five times is the arrangement
  rather than the system. The blocks themselves are unchanged and still ship.
- **The forty-two catalogue routes.** Component, Block and Page slugs are
  unchanged.
- **JSDoc as the API source.** The corpus extractor keeps reading
  `packages/ui/dist/**/*.d.ts` and never reads documentation prose.
- **The client-JS budget.** 89.7 KB all-client gzip against a 90 KB ceiling. The
  nested sidebar is server-rendered precisely so this does not move.
- **The four sibling sites.** `landing-page`, `nexus`, `atlas` and `alphalens`
  stay frozen on the deprecated `prism-ui@0.4.0` line per `CONSISTENCY.md`.
  Migrating them is a redesign of the whole family and a separate effort.

## The information architecture

Seven sections, in this order. The order is a reading order: start here, then the
raw materials, then the rules for writing, then the parts, then the history.
Plasma's spine, extended by the one tier Prism has and Plasma does not, because a
Page composes Blocks and a Block composes Components.

| Order | Section | Route | Holds |
| --- | --- | --- | --- |
| 1 | Overview | `/overview` | index, quickstart, architecture, composition, theming, using-llms, brand |
| 2 | Foundation | `/foundation` | index, colors, iconography, radii, shadows, spacings, typography, motion, variables, themes |
| 3 | Content | `/content` | index, about-content, audience, voice, writing-mechanics, product-vocabulary, glossary |
| 4 | Components | `/components` | category overview, then 28 Components in seven categories |
| 5 | Blocks | `/blocks` | 10 Blocks, flat |
| 6 | Pages | `/pages` | 4 Pages, flat |
| 7 | Changelogs | `/changelogs` | index, then one route per published package |

**Singular for prose, plural for the catalogue.** `/overview`, `/foundation` and
`/content` are one body of knowledge each. `/components`, `/blocks`, `/pages` and
`/changelogs` are collections of many items. This matches Plasma's directory
names and fixes a live inconsistency, since `/foundations` is currently plural
beside a singular `/content`.

**The landing page keeps no navigation entry.** `TOP_NAV` currently labels `/` as
"Overview", which collides with the new section. The header already renders the
wordmark as a link to `/`, so the entry is dropped rather than relabelled: a
"Home" item would duplicate a control already on screen. This is also what Plasma
does.

**`/themes` becomes `/foundation/themes`.** It is a live reader over
`dist/themes.json`, not prose, and it was the only non-MDX route in the
navigation. Themes are Foundation made live, and a specific static segment takes
precedence over the `[...slug]` catch-all, so this needs no new route machinery.

**A live reader is a page of its Section, not a control in the header row.** It is
listed in the Foundation Section's own navigation beside the token pages, and the
Foundation index links it, which is what a reader needs on a narrow viewport where
the sidebar is hidden and the mobile menu carries Sections only. The header row
shows the shape of the whole documentation, so it holds the seven Sections and
nothing else. The routing tree cannot hold the reader, because a folder cannot list
a page it has no file for, so the Section manifest declares it and the navigation
projection places it. That is the one exemption from "every published route is a
document", so the site's content-join gate asserts four things about it: a specific
page file serves the route rather than the catch-all, no content file is filed at
the same address, the published navigation links it, and the Section's index links
it.

**`agent-workflow` becomes `using-llms`.** It already documents the corpus, the
skill and the MCP tools. The rename aligns it with Plasma and costs no new
writing.

**Components nest, Blocks and Pages do not.** `DESIGN.md` and `CONTEXT.md` both
already state that a Block or a Page has no category, so this is not a new
decision. It is recorded here because an asymmetric tree reads as an oversight
unless the asymmetry is stated as intent. `DESIGN.md`'s sentence moves up into
the composition-layers section so a reader meets it before the tree.

## The content tree

The root stays `content/`. Plasma puts its documentation under `src/`; moving
Prism's would buy a cosmetic resemblance and cost a collection change, a corpus
change and a Tailwind `@source` change. The shape below the root is where the
Plasma resemblance is delivered.

```
content/
  meta.json                     the tree title
  overview/                     index, quickstart, architecture, composition,
                                theming, using-llms, brand
  foundation/                   index, colors, iconography, radii, shadows,
                                spacings, typography, motion, variables
  content/                      index, about-content, audience, voice,
                                writing-mechanics, product-vocabulary, glossary
  components/
    index.mdx                   the category overview
    <category>/<slug>/<slug>.mdx
    <category>/<slug>/<slug>.demo.tsx        28 items
  blocks/
    index.mdx
    <slug>/<slug>.mdx
    <slug>/<slug>.demo.tsx                  10 items, flat
  pages/
    index.mdx
    <slug>/<slug>.mdx
    <slug>/<slug>.demo.tsx                   4 items, flat
  changelogs/
    index.mdx                   authored: the index and the upgrade notes
    <package>.md                generated: the four published CHANGELOG.md files
```

**Slugs stay kebab-case.** Plasma uses PascalCase folders. Matching that casing
would churn forty-two routes to resemble one repository, so the tree mirrors
Plasma's shape and not its casing.

**The demo is `<slug>.demo.tsx`, beside its `<slug>.mdx`.** Not `.stories.tsx`:
that name exists because Storybook requires it, Storybook is out of scope, and the
name would carry a false promise.

**The tree holds prose and demos. It holds no metadata.** `kind` and `category`
live in the catalogue, which `DESIGN.md` calls "the only list" and says
navigation, generated item documentation, the corpus and the agent surface all
consume. A per-item `category` in frontmatter would be a second list that drifts
silently, which `AGENTS.md` prohibits. The tree is validated against the
catalogue in both directions and never the reverse.

**The `prose` collection collapses.** Today `site` is routed from `content/` and
`prose` holds item bodies from `items/`, looked up by slug at render time because
catalogue routes come from `buildCatalog()` rather than from files. With a
document and a demo in one folder that split has no reason to exist: one
collection reads the whole tree, each item page carries `slug` frontmatter, and
`/_prose` is retired. This is the payoff of the colocation and is worth more than
the colocation itself.

## Navigation

`meta.json` is the mechanism. The research established that it is build time, safe
under `output: 'export'`, and reachable headlessly, because `Folder` and `Item`
are plain data exported from `fumadocs-core/page-tree`.

- The `site` collection becomes `defineDocs` with `docs.files` and `meta.files`.
  `defineCollections({ type: 'doc' })` has no meta side, so `meta.json` is inert
  until this changes. One line per collection; nothing else moves, because
  `site.toFumadocsSource()` exists on both shapes and nothing reads
  `site.entries`.
- `content/overview/meta.json`, `content/foundation/meta.json` and
  `content/content/meta.json` carry the order that `GUIDE_ORDER`,
  `FOUNDATION_ORDER` and `CONTENT_ORDER` hold today. **Those three arrays are
  deleted in the same commit**, so no state exists in which both are true.
- Catalogue order is **generated** from `buildCatalog()` into
  `catalogueSource.files` as `{ type: 'meta', path, data }` entries. Catalogue
  pages are virtual, so there is no file to add a `meta.json` to.
- `GUIDE_ORDER` and friends go. So does the literal `NAV` array in
  `site-nav.tsx`, which is the same navigation a third time.
- `SectionNav` becomes recursive and **server-rendered**, so category nesting
  costs no client JavaScript. One rule, written down so it is not re-decided: a
  group heading links to `folder.index?.url` when one exists and is a plain label
  when it does not. There is no route for a group and none is invented.
- `category-nav.tsx` stays. It filters the index on `?category=` and is a
  different thing from nesting.

Three things the research established that the implementation must respect:

- **`buildNav` must copy before sorting.** `getPageTree()` is memoized and
  returned by identity, and `buildNav()` runs per render. Sorting in place
  corrupts later renders in the same process.
- **A `pages` array is a whitelist, not a reorder.** Anything it omits and does
  not cover with `...` leaves the primary tree, lands in `root.fallback`, and
  keeps its exported route. The failure is a page reachable by URL and invisible
  in the sidebar, with a green build. `...name` on a page is a silent no-op.
  This is why the catalogue order is generated rather than hand-written, and why
  **a page in `root.fallback` must fail the build.**
- **Path collisions resolve by write order, silently.** `source.ts` lists `site`
  before `catalogue`, so a catalogue virtual page beats a hand-written page at
  the same path with no warning. Worth a gate while the tree is in motion.

Do not set `pageTree.noRef`, or `getNodeMeta` stops working. Do not set `root`,
which suppresses a folder's automatic `index.mdx` lookup. `meta.json` does not
change search; the local index is `zbsearch`, and breadcrumbs would be a separate
ticket with its own budget check.

## The changelog

Plasma does not hand-write its changelog prose. Each of its pages is a thin
wrapper that inlines the package's changesets-generated `CHANGELOG.md` and
renders it whole. The transferable part is the pattern, not the wrapper.

- A task of its own, `@nanisoft/site#copy-changelogs`, copies each published
  package's `CHANGELOG.md` into `content/changelogs/<package>.md`. The corpus
  build depends on that task in the task graph, because the corpus reads what it
  writes and the corpus package is built by the task runner on its own rather
  than only through the site's lifecycle. One route per published package.
- The published packages are **discovered from the workspace, not hand-listed**,
  and a published package with a non-empty `CHANGELOG.md` and no route **fails
  the build**. This is the gate Plasma lacks: deleting all five of its pages
  leaves its CI green.
- Hand-authored `changelogs/*.mdx` is rejected. It makes the changelog a third
  place to remember on top of the changeset and the JSDoc, with no gate, and lets
  the site's text drift from the bytes in the npm tarball.
- Plasma's `changelog.cjs` is not adopted. Prism uses the stock generator and
  permits Markdown lists in changeset bodies, which Plasma's heading re-levelling
  rules were built around; adopting it means adopting its fourteen validator
  rules too.
- Authored and generated never mix. `changelogs/index.mdx` is authored and holds
  the index plus the "before you upgrade" prose per major, which is where
  Plasma's migration notes should have lived. The per-package files are
  generated and never edited.
- `0.4.x` does not appear. `MIGRATION.md` marks the new line a clean break and the
  sibling sites are frozen on the old one, so the 0.5.0 entry points at
  `MIGRATION.md` rather than reconstructing a history that is not this system's.

**The changelog joins the agent surface.** `PAGE_SECTIONS` gains `changelogs`, so
`llms.txt` and `llms-full.txt` gain a Changelogs section, and one read-only MCP
tool `get_changelog(package, version?)` joins the existing eight. Plasma published
a pure-ESM break at 60.0.0 that no Plasma agent can discover, because
`LlmsData` has no changelog field and no tool could return one. For a design
system the breaking changes are exactly what a consuming agent needs.

## One reader of the tree

The section list currently exists in four hand-maintained places: the three order
arrays in `nav.ts`, the literal `NAV` in `site-nav.tsx`, `SECTIONS` in
`catalogue.ts`, and `PAGE_SECTIONS` in `packages/llms/scripts/build.mjs`. All four
become consumers of the one tree.

The catalogue remains the only list of what exists, with `kind` and `category`.
The content tree holds prose and demos and is validated against it. The three
consumers, one manifest:

| Consumer | Reads | For |
| --- | --- | --- |
| `generate-demos.mjs` | the manifest | the doc and demo join, and the `client` measurement per demo |
| `packages/llms` | the manifest plus the declarations | `llms.txt`, `llms-full.txt`, `data.json`, the `/md/**` mirror |
| `packages/mcp-server` | the store it already reads | the eight tools, plus `get_changelog` |

The eight tools keep their names. A section split is a parameter, not a rename.

## Invariants an implementation must not break

These are the failure modes that a green build does not catch. Each is a
content surface that fails by omission rather than by error.

1. **The corpus builder must recurse.** `packages/llms/scripts/build.mjs` walks
   `PAGE_SECTIONS` with a non-recursive `readdir`. A page at
   `components/call-to-action/button/button.mdx` is one level too deep, so it
   vanishes from `llms.txt` and every tool with a green build.
2. **A missing section must fail, not skip.** `if (!existsSync(dir)) continue;`
   would make renaming `content/docs` to `content/overview` silently delete the
   whole overview section from every agent surface.
3. **Tailwind must be told.** `globals.css` sets `@source` for `../app`,
   `../components` and `../lib`. Demos move out of `src/demos`, so `@source` gains
   `../../content`, or the demos render unstyled because Tailwind never scanned
   their classes.
4. **The Worker's redirect map is generated**, not hand-kept, and
   `wrangler.jsonc`'s `run_worker_first` list loses the old `/docs/*.md` and
   `/foundations/*.md` entries and gains a prefix for every Section, the
   Changelogs included. A stale entry is a 404 on a machine-readable surface, and
   so is a missing one, which is why the site gate compares that list against the
   manifest as a set.
5. **A page in `root.fallback` fails the build.**
6. **A catalogue item with no folder, and a folder with no catalogue item, both
   fail the build.** That is the gate that keeps the tree from becoming the second
   list.
7. **The client-JS budget holds at 89.7 KB against 90 KB.** The nested sidebar is
   server-rendered for this reason; a client island would spend the headroom on a
   sidebar.

## The route migration

Sixteen prose routes move and one live reader joins a Section. Forty-two
catalogue routes do not move. Seventeen permanent redirects, all `301`, all served
by the Cloudflare Worker:

| From | To | Count |
| --- | --- | --- |
| `/docs` | `/overview` | 1 |
| `/docs/<page>` | `/overview/<page>` | 6 |
| `/foundations` | `/foundation` | 1 |
| `/foundations/<page>` | `/foundation/<page>` | 8 |
| `/themes` | `/foundation/themes` | 1 |

Within the `/docs` group, `agent-workflow` redirects to `/overview/using-llms`
rather than to `/overview/agent-workflow`, so the old link lands on the page
rather than on a 404 at the end of a correct-looking prefix rule.

**The count is seventeen, not the nineteen an earlier draft of this table gave.**
The two Section index pages were counted twice, once as the directory and once as
a page inside it: `/docs` is `content/docs/index.mdx` and is therefore the same
route as one of the seven pages that Section held, and the same for
`/foundations`. The table above counts each route once, and the site's
content-join gate asserts the same set the table states, by comparing the
redirect table against a record of the routes the site published before the move.

The table is generated from the Section manifest rather than written out, and the
gate compares it to that record in both directions: every route that moved is
redirected, every redirect is for a route that moved, and every redirect lands on
a route the routing tree produces.

No pointer pages and no 404s. The corpus is regenerated at build and points at
the new URLs, and every old URL redirects, so an agent holding a cached
`llms.txt` from before the change still resolves. That is the whole contract:
**no agent should ever see a dead link, and no agent needs to know this happened.**

## The work, in order

The order is the map's blocking order, and it is not arbitrary. The corpus
recursion has to land before the tree moves, or content disappears silently.

1. **Teach the corpus builder to recurse, and make a missing section fail.**
   Independent of everything else, and it must precede step 5.
2. **Switch `site` to `defineDocs`** and add the three `meta.json` files, deleting
   the three order arrays in the same commit.
3. **Emit generated catalogue meta entries** from `buildCatalog()`, and add the
   `root.fallback` gate.
4. **Make `SectionNav` recursive and server-rendered**, and delete the literal
   `NAV` from `site-nav.tsx`. Copy before sorting.
5. **Move the content tree**, collapsing `items/**` and `src/demos/**`. Add
   `@source ../../content`.
6. **Collapse the `prose` collection** and retire `/_prose`.
7. **Add the changelog pipeline**: the `prebuild` copy, the workspace discovery,
   and the gate that fails a published package with no route.
8. **Add `changelogs` to the agent surface**: `PAGE_SECTIONS`, `llms.txt`,
   `llms-full.txt`, and `get_changelog`.
9. **Move the routes** and generate the nineteen redirects.
10. **Re-cut the visual baselines**, in their own commit, reviewed route by route.
    The `visual` job stays report-only; promoting it to blocking is not part of
    this work.

## Visual baselines

Roughly forty committed screenshots across six routes, three widths, two modes
and a coarse-pointer variant. Re-cut inside this effort rather than in a follow-up
sweep, because baselines captured as a side effect of a route move record
whatever the last run produced, which is what `docs/quality-gates.md` exists to
prevent.

The route set changes: `/foundations` becomes `/foundation`, `/themes` becomes
`/foundation/themes`, `/changelogs` is added, nothing is dropped, and item-page
baselines do not move because the slugs do not. The coarse-pointer variant is
kept, because a nested collapsible sidebar is reached differently by coarse
pointer and that is exactly what the variant is for.

Re-cutting deliberately means reading the diff. `/`, `/components` and an item
page should change least; a foundation or changelog page changing a great deal is
a finding.

## Two things this effort noticed and did not fix

- **`Stats01` on the landing page** counts 42 catalogue items and labels them
  "42". With Components nested by category, that number becomes three numbers
  across three sections, and a reader can no longer place it. The landing page is
  out of scope here, so the fix belongs to the effort that touches it.
- **`MIGRATION.md` is still marked Draft**, and the changelog section now points
  0.5.0 readers at it. That is a live inconsistency this change makes more
  visible, and closing it belongs to the release effort.

## Where the evidence lives

Two research findings, both on throwaway branches, neither merged:

- `research/plasma-changelogs`, `docs/research/plasma-changelogs.md`. How Plasma
  produces its changelog pages, and why its answer to "is it machine-readable" is
  a hard no.
- `research/fumadocs-meta-json`, `docs/research/fumadocs-meta-json.md`. The
  `meta.json` schema, what `getPageTree()` returns, why the blocker is the
  collection type rather than the export mode, and the `pages`-whitelist trap.

The reasoning behind each decision lives on its closed ticket, linked from the
wayfinding map.
