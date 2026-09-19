---
Type: grilling
Status: resolved
Labels: wayfinder:grilling, ready-for-human
Blocked by: 12, 13
---

## Question

What does `@nanisoft/prism-llms` contain, and how is it generated so it can't drift?

- Contents: `llms.txt`, per-component MD, blocks/pages catalog MD, theme/token MD.
- Generation source: prism-ui types/source vs docs MDX — which is authoritative for what.
- Build integration: turbo task graph; when regenerated; is there a CI gate on drift?
- Consumption: served at the site root, backing store for the MCP server, `npx`-fetchable?

Output: a written spec the package is built against.

## Inherited requirements

Deferred here by resolved tickets — the spec must satisfy these (2026-09-14 audit):

- **Emit `examples[].code` and the `antdBase` flag** (from [MCP tool surface](13-mcp-tool-surface.md) / ADR-0004) — only the generator can know these; `get_item_source` and the antd-MCP delegation routing both depend on them.
- **Project into `PrismDocsStore`** — the interface fixed in ADR-0004 §5 is the binding contract; this ticket picks file layout/index shape/drift gate freely.
- **Per-item MD format gets `## Blocks` / `## Pages` sections** plus the pass-through pointer ("N antd components re-exported unchanged — see antd's `llms.txt`, but import from `@nanisoft/prism-ui`") (from [prism-ui API conventions](10-prism-ui-api-conventions.md)).
- Generate from Fumadocs MDX, not hand-maintained copies — plasma's duplicated-guidelines drift bug is the one to avoid (from [Plasma conventions](01-plasma-conventions.md)).

## Answer

Resolved 2026-09-15 (grilling). The two real forks were put to the human and ratified individually — **mirror-tree `dist/` layout with the blog split**, and **build-fresh + invariant gate** (dist never committed). The remaining branches were auto-applied as confident recommendations under the standing "pick confident options" directive — each individually vetoable; the veto list is at the end. **This Answer is the spec `@nanisoft/prism-llms` is built against.**

### 1. Contents — one build, three lanes, one `dist/`

```
dist/
├── data.json          # MCP lane — the PrismDocsStore projection
├── llms.txt           # llms.txt-spec index → absolute /md/… links
├── llms-full.txt      # full reference corpus, concatenated
└── md/                # mirror tree — mirrors site URLs
    ├── docs/<slug>.md
    ├── components/<item>.md
    ├── blocks/<item>.md
    ├── pages/<item>.md
    ├── blog/<slug>.md           # lane only — see split below
    └── theme/<pack>-<mode>.md
```

- **Blog split (ratified)**: blog pages get per-page `.md` artifacts (ticket 12's `.md` lane covers five sections) but are **excluded from `data.json`, `llms.txt`, `llms-full.txt`** — and therefore from `search_docs`. The agent-facing reference corpus is guides + catalog + themes. One generator, one split rule.
- **`llms.txt`** follows the llms.txt convention: H1 + blockquote one-paragraph summary + sections (Guides / Components / Blocks / Pages / Theming); each bullet = the frontmatter one-liner; every link is absolute (`https://prism.nanisoft.com/md/…`) so an agent is one fetch from raw text.
- **`data.json`** is the full `PrismDocsStore` (`prismVersion`, `baseUrl`, `items[]`, `pages[]`, `themes[]`) — see §3 for validation.

### 2. Generation source — file-is-truth, one extractor

The generator is `packages/llms`' own build script (repo-internal; the package publishes data only). Authority per artifact:

- **Prose** (descriptions, when-to-use, RFC-2119 rules) — docs MDX. Emitted to `.md` by stripping frontmatter and **replacing each `ComponentDemo` JSX element with that example's fenced TSX** (from `demos/*.tsx` — the self-contained contract from ticket 12 makes the substitution lossless).
- **Props/API** — prism-ui's built type surface (`dist` `.d.ts` with TSDoc preserved), read by **the extractor that lives in prism-llms** and is exported for the site's API tables. One extractor, two consumers (ticket 12's handoff, resolved). Runs after `^build`, so no TS re-parse of source.
- **Example code** — `demos/*.tsx` verbatim; slug = filename (`examples[].code` for the store, fenced TSX for the `.md` lane — same file).
- **`antdBase`** — looked up from prism-ui's generated `wrapped-registry` (pass-through → antd name; wrapper → absent). Never authored.
- **Catalog** — the codegen category table + frontmatter.
- **Themes** — prism-tokens build output: **4 atoms** (`blue|green` × `light|dark`), each embedding the `createPrismTheme()` snippet, the tier tables, and the antd map-token result. `get_theme_doc(pack, mode)` is a lookup.
- **`prismVersion`** = the resolved prism-ui version (what an agent compares against its installed package). **`baseUrl`** = `https://prism.nanisoft.com`, interpolated at build.
- **Per-item MD** = ticket 12's page skeleton in markdown, plus `## Blocks` / `## Pages` cross-refs **derived by scanning demo imports** across block/page demos (the self-contained contract makes the graph mechanical — no hand-maintained cross-reference).
- The mirror tree means the Worker rewrite is **one prefix rule**: `/<section>/<slug>.md` → `/md/<section>/<slug>.md`.

### 3. Build integration — turbo graph + the drift gate

- `prism-llms#build`: turbo inputs = site content (`apps/site/content/**`), prism-ui `dist` (+ codegen outputs: registry, category table), prism-tokens `dist`; `dependsOn: ["^build"]`. Emit is **deterministic and byte-stable** (sorted keys, stable order).
- `apps/site#build` depends on `prism-llms#build` and copies `llms.txt`, `llms-full.txt`, `md/**` into `out/`. `data.json` is not copied to assets — the Worker bundles it from the package at build (ticket 05: deploy is invalidation).
- `prism-mcp-server` stays a leaf: `apps/site` imports `createPrismMcpServer` from it and `data.json` from prism-llms. `PrismDocsStore`'s canonical type home is **prism-mcp-server** (the consumer); prism-llms devDeps it type-only and asserts the emitted `data.json` against it at build. No cycle — mcp-server imports nothing from llms.
- **`prism-llms#check` (CI, PR workflow) is the drift gate** — build-fresh model, `dist/` never committed. Invariants:
  1. every category-table/registry item has doc MDX (stub or full);
  2. every demo passes the self-contained contract (imports only `@nanisoft/prism-ui/*` + `react`, no relative imports) — this task is the contract's enforcement point;
  3. cross-refs resolve (`## Blocks` / `## Pages` / import graph point at real items);
  4. every item doc carries a frontmatter description (it becomes the llms.txt bullet);
  5. `data.json` type-validates against `PrismDocsStore`;
  6. every `llms.txt` link target exists as an artifact; the `md/` mirror is complete (every item, guide, theme atom);
  7. determinism tripwire: build twice, byte-compare.
- **When regenerated**: every turbo build — CI per PR, deploy per release, turbo-cached locally. Changeset convention: a prism-ui change that alters the corpus ships a prism-llms changeset in the same PR so the npm data tracks the code.

### 4. Consumption

- **Site**: `/llms.txt`, `/llms-full.txt`, and `/<section>/<slug>.md` via the Worker prefix rewrite into `md/`.
- **MCP**: `data.json` bundled into the site Worker at build time; stateless lookups only.
- **npm**: `@nanisoft/prism-llms` publishes data-only (`files: ["dist"]`) — fetchable from npm/unpkg/jsdelivr; the public `/llms.txt` is the zero-install lane. **No `npx` CLI in v1** (declined — unpkg + the site cover it; a CLI can graduate from fog if a consumer appears).

### Auto-applied this session (veto list)

Extractor lives in prism-llms · `prismVersion` = prism-ui's resolved version · 4 theme atoms · import-scanned `## Blocks`/`## Pages` · data-only npm, no CLI · deterministic emit · `llms.txt` links absolute `/md/…` URLs · `PrismDocsStore` type canonically in prism-mcp-server, validated via type-only devDep · props read `dist` `.d.ts` post-build · blog-out ratified from ticket 12's handoff · determinism tripwire as check #7.

## Comments
