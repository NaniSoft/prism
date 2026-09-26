---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 10, 11
---

# The llms corpus contract

## Question

`@nanisoft/prism-llms` is already published and already good: it emits
`llms.txt`, `llms-full.txt`, a per-item Markdown mirror tree and a
`PrismDocsStore` projection, with a drift gate. The decision on this map is to
port it rather than rebuild it. This ticket decides what it emits in the new
architecture, which is not the same as what it emitted before.

Settle:

1. **The three lanes.** The old package served npm, the site and the MCP
   server from one `dist/`. Confirm that shape and state which lane each
   consumer reads. The MCP server takes a build-time-bundled `data.json` and
   does no runtime I/O, which is a property worth keeping deliberately rather
   than by accident.
2. **The sources of truth.** The old authority order was MDX prose, the
   component package's emitted type declarations read by a structural scanner,
   verbatim demo source, and four theme atoms from the token package. The
   extractor was deliberately compiler-API-free because TypeScript 7 dropped
   the JavaScript API. Re-derive the authority order for this architecture and
   say which sources are new, particularly the motion and typography tokens
   once they are bound to CSS.
3. **The output file set.** `llms.txt`, `llms-full.txt`, the per-item mirror
   tree, an index manifest, and whether an agent skill file is emitted. The old
   file is called `prism-skill.md` and is served at the site root; decide
   whether this repository emits one and what it says. Note that the old
   package's README omitted a directory its build actually emitted, so the
   documented output list and the real one must be reconciled here rather than
   inherited.
4. **The per-item spec format.** Whether item documentation is hand-written
   Markdown with a required section structure, and what that structure is. The
   old agent-facing layer used RFC 2119 language and a props definition list
   rather than a table, because a regular expression keyed on the literal
   `## Props` heading is how the MCP server extracts props. If that coupling
   survives, the format is load-bearing and must be specified exactly, not
   approximated.
5. **The mirror tree and the URL rewrite.** Whether the site serves a `.md`
   version of each page. This is now half-answered and the half that is answered
   changes the design. **Generation is native and headless**: `llms()` from
   `fumadocs-core/source/llms`, fed by the `remarkLLMs` remark plugin and
   `getText('processed')`, enabled with `postprocess:
   { includeProcessedMarkdown: true }`, with `output: 'function'` mode able to
   render components for richer Markdown than string mode. **Serving is the
   gap**: the official fumadocs recipe puts the route at
   `/llms.mdx/docs/<slug>/content.md` and only produces the pretty
   `/docs/<slug>.md` URL through a `rewrites()` entry, which Next 16 forbids
   under static export. The `Accept`-header negotiation variant is
   `proxy.ts`-based and is equally forbidden. So decide whether the Worker
   prefix rule stays the serving mechanism, and if so treat it as load-bearing
   rather than incidental, carrying forward the recorded lesson that
   `run_worker_first` needs glob patterns and that a route-style `:slug*.md`
   pattern silently never matches. Also decide how much of the old package's
   own Markdown generation survives now that the framework can derive Markdown
   from the same MDX the site renders, since duplicating it is how plasma
   developed the duplicated-guidelines drift the old repository set out to
   avoid.
6. **The drift gate.** The old `check` script enforced seven invariants. Decide
   the set for this repository, which of them fail the build, and whether the
   build-twice byte comparison is kept. Determinism is what makes the
   artifacts safe to diff in review, so say explicitly if it is dropped.
7. **The store contract.** `PrismDocsStore` is the type the MCP server
   validates at runtime, and the old package had a recorded problem where a
   JSON import widened `kind` to `string` and forced the guard to do literal
   validation in more than one place. Decide where the type canonically lives
   and how the runtime guard is shaped, so the widening bug cannot recur.
8. **Build determinism and the dist policy.** The old rule was build-fresh with
   `dist` never committed. Confirm or overturn it, and state what a consumer
   gets from npm and what the site gets from a local build, given they share
   one directory.

Read the old `packages/llms/` in full: `src/build.ts` or its equivalent,
`src/llms-txt.ts`, `src/llms-full-txt.ts`, `src/skill.md`, one complete
component spec, and `scripts/check.mjs`. Consult `domain-modeling` before
naming a new artifact.

## Answer

All eight are decided. The port keeps the old package's shape (one `src/`, one
`scripts/build.mjs`, one `scripts/check.mjs`, a per-item spec, a store) and
changes four things the new architecture forces: the authored input (real MDX
instead of generated stubs), the demo and token inputs, the section set, and the
retirement of the per-theme mirror tree. Two points go beyond the recommendation
and are justified in place: the index manifest is the store itself, not a second
file (Q3), and the corpus reads raw MDX, not fumadocs' processed Markdown (Q5).
The answer is consistent with ticket 09's closed `kind`, ticket 10's Worker and
copy script, and ticket 11's single-register model and generated-artifact table.

### 1. The three lanes: one `dist/`, read three ways

Confirmed. `packages/llms` builds **one** `dist/` directory and every consumer
reads that same directory through a different lane. Nothing is generated twice.

| Lane | Consumer | What it reads | Mechanism |
| --- | --- | --- | --- |
| npm | a downstream product or tool | the published `dist/` inside the tarball (`files: ["dist"]`) | `@nanisoft/prism-llms` on npm; `exports` maps `.` to the store and `./data.json` to the raw store |
| site | `@nanisoft/site` | the **local** build of `dist/` | `apps/site/scripts/copy-agent-surface.mjs` copies `llms.txt`, `llms-full.txt` and `prism-skill.md` into `out/`, and `dist/md/**` into `out/md/**` (ticket 10 §9). `data.json` is deliberately not copied |
| MCP | `@nanisoft/prism-mcp-server` | the **local** `dist/data.json`, **bundled at build time** | the Worker's `worker/index.ts` imports the store module; `parsePrismDocsStore` runs in memory. No `fetch`, no `fs`, no KV, no runtime I/O |

**The MCP lane's no-runtime-I/O property is kept deliberately.** The Worker
bundles `data.json` into its own bundle (an ordinary ESM import, resolved by the
Worker bundler from `packages/llms/dist/data.json`), so the corpus never enters
the public asset surface and a request to `/mcp` cannot depend on a sibling
asset having been copied correctly. This is the old repository's rule
(`copy-llms.mjs` did not copy `data.json`), stated as a decision rather than a
leftover. Ticket 13 Q8 decides where the corpus build stamp lives; this ticket
only fixes that the corpus itself gains no `built` field for it.

### 2. The sources of truth: five inputs, MDX first, extractor compiler-free

The authority order for a per-item spec, most authoritative first:

1. **The hand-written MDX page** — `apps/site/items/<section>/<slug>.mdx`,
   `section ∈ {components, blocks, pages}` (ticket 10 §2's `prose` collection;
   ticket 11 §5's single register). It owns the H1, Overview and Guidelines.
2. **The emitted declarations** — `packages/ui/dist/**/*.d.ts`, read by
   `packages/llms/src/extractor.ts`, the compiler-API-free structural scanner.
   It owns the `## Props` definition list.
3. **Verbatim demo source** — `apps/site/src/demos/<slug>.tsx` (ticket 10 §5;
   the site owns demos because demos are documentation, not catalogue items).
4. **Catalogue metadata** — `packages/ui/src/catalog.ts`, through the
   `@nanisoft/prism-ui/catalog` entry (ticket 09 §3): `name`, `slug`, `kind`,
   `category`, `description`, `source`, `exports`, `status`.
5. **Token atoms** — the emitted `@nanisoft/prism-tokens` artifacts.

The order is unchanged in principle; the inputs are not.

**What is new versus the old order.**

- **MDX is authored, not generated.** The old per-item input was a 452-byte
  generated stub with zero `##` headings (research 01 §3.1). The new input is a
  real page at a new path, and `packages/llms/scripts/generate-content.mjs` (the
  stub generator) is **dropped** (ticket 11 §2). The corpus's coverage invariant
  in Q6 now asserts a real page, not a marker-bearing stub.
- **The demo source moved.** The old demos were co-located at
  `apps/site/content/<section>/<item>/demos/*.tsx`; the new ones are
  `apps/site/src/demos/<slug>.tsx` (ticket 10 §5). The demo contract
  (`packages/llms/src/demo-graph.ts`'s `validateDemoSource` and
  `scanPrismImports`) keeps its rules but reads the new path, and the corpus
  cannot read the site's generated `demos.ts` registry because `prebuild` runs
  the corpus build **before** `next build` (ticket 10 §9): it walks the `.tsx`
  files directly.
- **The token surface widened from four theme atoms to the bound groups.** The
  old `renderThemeDoc` read four theme atoms and resolved pack-by-mode token
  sets. Tickets 06 and 18 now bind motion (`--duration-*`, `--ease-*`, plus the
  `--transition-duration-*` mirror), typography (`--font-*`,
  `--font-weight-*`, `--text-*` and `--text-*--line-height`, `--leading-*`,
  `--tracking-*`), spacing (`--spacing`, `--spacing-*`), shadows
  (`--shadow-*`), breakpoints (`--breakpoint-*`) and container/measure
  (`--container-*`) to CSS. The corpus derives token content from
  `dist/tokens.foundation.json`, `dist/tokens.{light,dark}.json`,
  `dist/themes.json`, `dist/themes/index.js` and the new `dist/dtcg/**`, and
  Motion becomes a first-class Foundations page (ticket 09 §6). The old
  `md/theme/<pack>-<mode>.md` tree is retired (Q3).
- **Guides, Foundations and Content are documentation pages, not catalogue
  items** (ticket 09 §6). The old corpus projected only catalogue items, guides
  and themes; the new corpus must also project the eight Foundations pages and
  the six Content pages, because they are pages with canonical URLs and therefore
  with mirrors (Q5).

**Why the extractor stays compiler-API-free.** Ticket 05 §3 fixes the seam at
`prism-ui`'s emitted `.d.ts`, and ticket 05 §4 pins TypeScript at 5.7 stable
precisely so the corpus need not move with a compiler. The old extractor avoided
the compiler API because TypeScript 7's native compiler dropped the JavaScript
API; the new order makes the choice stronger, not weaker, for three reasons:
(a) it reads emitted declarations, a fixed textual interface, never source;
(b) ticket 07's surface gate bans Base UI types and variant recipes from emitted
declarations, so the declaration shape the scanner sees is stable and small; and
(c) a compiler bump can never break the corpus. `extractor.ts` remains a regex
structural scanner returning `ExtractedInterface[]`, unchanged in kind.

### 3. The output file set: one truth, and the README reconciled

**The old README's documented output list omitted a directory its build
emitted.** The old `scripts/build.mjs` emitted `dist/md/theme/**` (the ten
resolved pack-by-mode specs produced by `renderThemeDoc`, the second-largest
block of `llms-full.txt`) and an empty `dist/md/blog/**`; the package README
listed the corpus lanes without the theme tree. The documented list and the real
list therefore disagreed, and the new list must be stated rather than inherited.

**The new single truth for `packages/llms/dist/`:**

| Artifact | Content | Consumed by |
| --- | --- | --- |
| `dist/llms.txt` | the ordered index: sections `Guides · Foundations · Content · Components · Blocks · Pages`, one bullet per page with title, description and the canonical mirror link | npm, site (copied to `out/`) |
| `dist/llms-full.txt` | every bullet above expanded to its full per-item spec (Q4), concatenated in the same order | npm, site (copied) |
| `dist/md/<section>/<slug>.md` | the per-item Markdown mirror, `section ∈ {docs, components, blocks, pages, foundations, content}` | site (copied to `out/md/**`, served by the Worker rewrite), npm |
| `dist/data.json` | the `PrismDocsStore` (Q7), which **is** the index manifest: catalogue items, guides, foundations, content, and a `tokens` projection | MCP (bundled), npm via `./data.json` |
| `dist/prism-skill.md` | the agent fast path (below) | site (copied to `out/`), npm |

**No separate index manifest is emitted.** A second JSON file listing items
would be a second list, which the catalogue-as-single-source rule forbids
(ticket 09 §3). `PrismDocsStore` already carries the list-level fields the MCP
server's `list_items` needs (`id`, `kind`, `name`, `slug`, `description`, `url`,
`mirror`), so it is the index manifest; the omission is a decision, not a gap.

**The retired tree, and the sections that replace it.** `dist/md/theme/**` is
not emitted. The pack-by-mode resolved values move into `data.json`'s `tokens`
projection (so ticket 13 Q4 can answer a token query without a second artifact),
and the human-readable token surface is the Foundations lane
(`/foundations/colors` through `/foundations/variables`, including Motion). This
follows ticket 09 Q6 (`/themes` is a showcase, not a token family) and ticket 09
Q8 (per-theme deep links are dropped). The new `llms.txt` therefore has **six**
sections where the old had five; the old `Theming` section is folded into
`Foundations`.

**Yes, an agent skill file is emitted: `dist/prism-skill.md`.** It is generated,
not hand-copied, from the catalogue and the guides, so it cannot drift. It
contains, in order, and nothing else:

1. the one-screen fast path — `import '@nanisoft/prism-ui/styles.css'`, the
   optional `PrismProvider`/`PrismThemeScript` (ticket 11 §9 says these appear
   once here and in Quickstart, not per item);
2. the import contract — `@nanisoft/prism-ui/components/<slug>`,
   `./blocks/<slug>`, `./pages/<slug>` (ticket 07 §5);
3. the MCP endpoint `/mcp` and its tool list (ticket 13 owns the list; this file
   references it);
4. the truth rules — one source of truth, no override path, request changes
   upstream (ticket 14's constitution).
5. pointers to `/llms.txt` and `/llms-full.txt`.

Written for agents per `writing-for-agents`: short, imperative, one source per
fact, no restatement of the per-item specs it points at.

**Invariant 8 makes the reconciliation mechanical.** Ticket 15 names
`documented output list equals emitted set` as a `prism-llms` build failure. That
check reads the README's declared output list and the actual `dist/` tree and
fails on any difference, so the old omission cannot recur.

### 4. The per-item spec format: generated to one fixed shape

The spec is **generated**, per ticket 11 §5's single-register model, from the
four item inputs and never hand-approximated. It is the same generator that
produces both the mirror file and the corresponding `llms-full.txt` block.

**Section order (fixed):**

1. `# {name}` — a literal H1, from the catalogue `name`.
2. `{description}` — the catalogue `description`, one line, the lede.
3. the import fence, a ` ```tsx ` block holding ticket 11 §9's import line.
4. the **prose body** — the MDX with its H1 and MDX mechanics stripped, carrying
   the hand-written Overview and Guidelines (the `##`/`###` headings the author
   wrote).
5. the **demo**, only where a demo exists — a `**{title}**` line followed by a
   ` ```tsx ` fence of the demo's verbatim source.
6. `## Props` — the generated definition list (below).
7. `## Composition` — only for a Block or a Page, a generated definition list of
   `exports`, files and dependencies, in place of `## Props` (a Block and a Page
   have no own props; ticket 10 §4 slot 5).
8. `## Blocks` / `## Pages` — only for a composed item, the cross-references
   derived from its demo imports.

**`## Props` is a literal H2 and its body is a definition list, one entry per
line, with no blank lines between entries.** The exact line shape:

```
**`variant`** `ButtonVariant` · optional · default: `primary` — the visual emphasis of the control
```

The four fields, in order, separated by a middle dot: the prop name in bold
backticks, its type in backticks, `required` or `optional`, and
`default: `X`` or `default: —` when the declaration carries no JSDoc
`@defaultValue` (ticket 11 §3's controls rule: the component's default, never the
demo's value), then an em-dash-free prose description when the declaration has
JSDoc. **It is not a Markdown table.** The old mirror emitted a table
(`| Prop | Type | Default | Description |`, research 01 §6.2); the new format
replaces it with the definition list because the MCP server's regular expression
keys on the literal `## Props` heading and the line-oriented list is what it
parses. This is the one place the old *mirror* shape is overturned, and it is
overturned toward the old *agent spec* shape.

**Fixed shape, round-trip tested.** `packages/llms/test/extractor.test.ts` and
`packages/llms/test/markdown.test.ts` assert the extraction from a fixture
`.d.ts` into the exact line shape and back, and the drift gate's props round-trip
(ticket 11 §8, ticket 15 Q3) fails the build if the shape moves. The site's API
reference table (ticket 10 §4) is a second *presenter* over the same single
extraction, an HTML table; there is one extractor, two renderers, and no second
extraction.

### 5. The mirror tree and the URL rewrite: corpus owns generation, Worker serves

**The corpus package owns per-item Markdown generation. It is one generator.**
`packages/llms` emits `dist/md/**` itself from the four inputs in Q2.

**Do not adopt fumadocs' `llms()` to produce a second mirror.** `llms()` from
`fumadocs-core/source/llms`, `remarkLLMs` and `getText('processed')` can project
only the MDX the site renders; they cannot produce the `## Props` definition list
from the emitted declarations, the verbatim demo source or the catalogue
metadata. Using them **in addition** to the corpus generator would emit two
mirrors from two code paths and recreate exactly plasma's duplicated-guidelines
drift (the thing ticket 11 §5 exists to prevent). If `remarkLLMs`/`getText`
is used at all, it replaces only the old `markdown.ts` `stripMdxMechanics` step
inside the one generator; it never replaces the props/demo assembly and never
emits a file of its own. The official `/llms.mdx/docs/<slug>/content.md` route
and the `Accept`-header variant are **not adopted** (both need `rewrites()` or
`proxy.ts`, forbidden under export, ticket 10 §10).

**In practice the corpus reads raw MDX, not processed Markdown.** `prebuild`
builds `prism-llms` before `next build` (ticket 10 §9), so fumadocs' processed
Markdown does not exist yet when the corpus runs. The generator reads
`apps/site/items/<section>/<slug>.mdx` directly and strips mechanics itself; the
existing `stripMdxMechanics` in `src/markdown.ts` is kept, not replaced.

> **This overturns one stated reason in ticket 10 §2.** Ticket 10 enabled
> `postprocess: { includeProcessedMarkdown: true }` "needed for the Markdown
> mirror, ticket 12". Under this answer the corpus does not consume processed
> Markdown, so that reason no longer holds. The config-API shape ticket 10 chose
> stands for other reasons; `postprocess` is kept only if something else needs
> it, and if nothing does it is dropped. No edit is made to ticket 10.

**Serving is the Worker prefix rewrite, and it is load-bearing.**
`rewrites()` and `proxy.ts` are forbidden under static export, so the pretty
`/<section>/<slug>.md` URL is produced only by the Worker: `run_worker_first`
catches `/<section>/*.md`, `worker/router.ts`'s `rewriteMdPathname` maps it to
`/md/<section>/<slug>.md`, and `env.ASSETS.fetch` serves it (ticket 10 §10). The
mirror is a **copied tree**, not a route handler (ticket 10 §10, finding 4). The
recorded lesson is carried forward verbatim: **`run_worker_first` needs glob
patterns; a route-style `:slug*.md` pattern silently never matches**, so the
Worker is never invoked and the mirror 404s as a plain asset. The section set
stays ticket 10's `MD_SECTIONS = ['docs', 'components', 'blocks', 'pages',
'foundations', 'content']`; no `theme` entry is added, because the theme mirror
is retired (Q3). Ticket 15's `check-worker-globs.mjs` keeps the `run_worker_first`
set and `MD_SECTIONS` equal by a failing check.

**The mirror address is the canonical URL plus `.md`** (ticket 09 §4):
`/components/button` → `/components/button.md`. `/` and `/themes` are site-owned
and have no mirror.

### 6. The drift gate: seven invariants kept, all failing, determinism explicit

Ticket 11 §8 fixes the set; this ticket owns its implementation in
`packages/llms/scripts/check.mjs`. **All seven fail the build** (ticket 11 §8's
recommendation, which ticket 15 Q1 adopts: a stale doc is a lie). The build-twice
byte comparison is **kept explicitly**, not dropped (ticket 15 Q9 answers yes).

1. **Coverage** — every catalogue item has a `prose` page at
   `apps/site/items/<section>/<slug>.mdx` and a mirror
   `dist/md/<section>/<slug>.md`; every guide, Foundation and Content page has a
   mirror. A missing page or mirror fails.
2. **Demo self-contained contract** — `validateDemoSource` over every
   `apps/site/src/demos/*.tsx`: imports only `@nanisoft/prism-ui/*` or `react`,
   no relative import, a default export. Fails.
3. **Cross-references resolve** — every demo import is a public `prism-ui`
   runtime export (catalogue gap 7, ticket 09 §3); every `<ComponentDemo slug>`
   resolves to a generated registry key. Fails.
4. **Descriptions** — every catalogue item has a non-empty `description` and
   every page a non-empty `title`; the frontmatter comes from the catalogue, not
   a hand-copied duplicate. Fails.
5. **Store type** — `dist/data.json` parses through `parsePrismDocsStore` and
   assigns to `PrismDocsStore` in a throwaway `tsc` project under
   `.turbo/check/store-validate/` (`strict`, `nodenext`, `resolveJsonModule`).
   Fails.
6. **Link and mirror completeness** — every `llms.txt` link resolves; every
   item, guide, Foundation and Content page has a mirror file. Fails.
7. **Determinism** — `emit()` into two temporary directories, walk both trees,
   byte-compare every file; any difference fails. **Kept.** It is the only check
   that catches a generator whose output changes shape between runs, and it is
   what makes the corpus safe to diff in review.

**An eighth check is added**, ticket 15 Q1's `documented output list equals
emitted set`: the README's declared output list and the actual `dist/` tree must
match, or the build fails. It turns Q3's reconciliation into a gate.

Script names: `packages/llms/scripts/build.mjs` (`emit(outDir)`) and
`packages/llms/scripts/check.mjs`, wired into the root `pnpm check` task through
turbo. `packages/llms/scripts/generate-content.mjs` is deleted. The Vitest floor
is `packages/llms/test/{extractor,markdown,demo-graph,store}.test.ts`, ten tests
(ticket 15 Q3). The content-voice checks (`check-content-rules.mjs`) and the
dash-gate extension live on the site side (ticket 11 §12, ticket 15 §7), not
here.

### 7. The store contract: canonical in `prism-llms`, one guard, no widening

**Canonical home.** `PrismDocsStore` is declared in `packages/llms/src/store.ts`
and exported from the package root (`.`). It is the one declaration; the MCP
server imports the type and the guard from `@nanisoft/prism-llms` and does not
redeclare either.

**`kind` is ticket 09's closed union.**

```ts
// packages/ui/src/catalog.ts (ticket 09)
export const CATALOG_KINDS = ['component', 'block', 'page'] as const
export type CatalogKind = (typeof CATALOG_KINDS)[number]
```

`PrismDocsStore` references it **type-only** (ticket 05 §3: `prism-ui` is a
`prism-llms` devDependency, so validation compiles without a runtime edge):

```ts
import type { CatalogKind } from '@nanisoft/prism-ui/catalog'

export interface PrismDocsStoreEntry {
  id: string
  slug: string
  kind: CatalogKind
  name: string
  description: string
  url: string
  mirror: string
  // ... props, prose, demo, cross-refs, per the spec in Q4
}

export interface PrismDocsStore {
  version: string
  items: PrismDocsStoreEntry[]
  pages: PrismDocsPage[]        // guides, foundations, content
  tokens: PrismTokensProjection // the Q3 token lane for ticket 13 Q4
}
```

**Where the runtime guard lives and its shape.** `packages/llms/src/store.ts`
exports `parsePrismDocsStore(raw: unknown): PrismDocsStore`. It narrows
structurally (`typeof`, `Array.isArray`, per-field checks) and validates `kind`
through a local type predicate:

```ts
// The runtime list is a projection of the catalogue's type, tied to it at
// compile time so the two cannot drift.
const STORE_KINDS = ['component', 'block', 'page'] as const satisfies
  readonly CatalogKind[]
type _KindsMatch = CatalogKind extends (typeof STORE_KINDS)[number]
  ? (typeof STORE_KINDS)[number] extends CatalogKind ? true : never
  : never
const _kindsAssert: _KindsMatch = true

function isCatalogKind(value: unknown): value is CatalogKind {
  return typeof value === 'string' &&
    (STORE_KINDS as readonly string[]).includes(value)
}
```

The parsed JSON arrives as `unknown`; the return of the guard is the only place
`PrismDocsStore` is produced. **`kind` is never widened to `string` and never
assigned with `as`**, so the old widening bug cannot recur. A value outside the
three throws with the offending path (for example
`prism-llms: data.json items[12].kind = "widget" is not a CatalogKind`). The
local list is the minimal duplication that a runtime leaf package needs; the
`satisfies` plus type-equality assertion makes a fourth kind fail
`prism-llms`'s typecheck, so there is still one authored source. Ticket 13's MCP
guard **inherits this one guard** rather than re-implementing a literal check
(ticket 09 Q5's "one answer instead of two").

**How it is tested.** `packages/llms/test/store.test.ts` (in the ten-test
floor) asserts: (a) `parsePrismDocsStore` accepts the real `dist/data.json`;
(b) it throws on an unknown `kind` (`'widget'`), a non-string `kind` (`42`), and
a missing `kind`, checking the thrown path; (c) a structurally valid document
with `kind: string` is rejected. Invariant 5's throwaway `tsc` project is the
compile-time half: `const store: PrismDocsStore = parsePrismDocsStore(raw)`
typechecks, and a widened fixture does not.

### 8. Build determinism and the dist policy: confirmed

**Confirmed as written: build-fresh, `dist` never committed.** A consumer gets
`dist/` from npm (the tarball, `files: ["dist"]`); the site reads a local build
of the same directory; the MCP bundles `data.json` from the same local build.
One directory, three readers, all from the same source.

Consequences, stated:

- `packages/llms/dist/` is gitignored and never committed. `build` writes it
  from scratch (staging, then prune-and-move, mirroring the tokens package's
  write-in-place rule rather than an `rm -rf` during a running dev server).
  `check` emits twice into **temporary** directories and byte-compares; it never
  writes `dist`.
- **A reviewable diff is the source diff, not an artifact diff.** Because `dist`
  is not committed, a corpus change shows in review as a change to the MDX, the
  declarations, the demo, the catalogue or the generator. The generated
  artifacts are diffable only when a CI job uploads them as an artifact, and the
  build-twice comparison is what guarantees that uploaded tree is reproducible.
  Artifact drift therefore appears as a failing check, not as an untracked file
  someone forgets to commit.
- At release time the published tarball and the site's local build come from the
  same source, so the npm lane and the site lane cannot serve different corpora.
  A consumer on an older released version may differ from the live site, which is
  the normal npm-versus-docs lag and is visible through the token/package
  versions, not hidden.
- The corpus and the MCP bundle are tied together at build time:
  `packages/mcp-server` bundles `packages/llms/dist/data.json` in the same
  turbo build, so a stale MCP corpus means the build was not run, which is
  exactly what invariant 5 and ticket 15's bundled-hash check catch.

### Consistency and hand-offs

- **Ticket 09:** the store's `kind` is the closed union, validated literally; the
  mirror address is canonical URL plus `.md`; `/content` and `/foundations` are
  sections with mirrors, not catalogue kinds; per-theme deep links stay dropped.
- **Ticket 10:** the site copies `llms.txt`, `llms-full.txt`, `prism-skill.md`
  and `md/**` and never `data.json`; `MD_SECTIONS` is unchanged; the Worker
  rewrite and the glob lesson are load-bearing; the corpus owns generation, so
  ticket 10 §2's `postprocess` reason is overtaken (recorded, not edited).
- **Ticket 11:** the MDX page is the single authored register; the four
  derivation inputs are implemented here; the `## Props` definition list and the
  seven-plus-one invariants are this ticket's implementation of §5 and §8.
- **Ticket 13:** this ticket hands it the store type, the one runtime guard, the
  `tokens` projection and the no-runtime-I/O lane; it owns the tool list and the
  build stamp (Q8).
- **Ticket 15:** the floor is ten `prism-llms` tests; the added gate is
  `documented output list equals emitted set`; all checks fail the build.

### Domain note

No new domain noun is introduced. The "index manifest" is the existing
`PrismDocsStore`, not a new artifact; `prism-skill.md` keeps its old name; the
`#`/`##` headings are format, not vocabulary. The only naming clarification is
that the item prose folder follows the plural route segment
(`apps/site/items/<section>/<slug>.mdx` with `section ∈ {components, blocks,
pages}`) so the prose path, the mirror path and the canonical URL agree.
