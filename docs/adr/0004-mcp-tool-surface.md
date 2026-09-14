---
Status: accepted
---

# The MCP tool surface: eight read-only tools over prism-llms output

`@nanisoft/prism-mcp-server` exposes **eight read-only, stateless tools** over one build-time-bundled corpus: `list_items`, `get_item_doc`, `get_item_props`, `get_item_source`, `get_theme_doc`, `list_pages`, `get_page`, `search_docs`. Tool logic is written once in the pure `createPrismMcpServer(docs)` factory (ticket 05); the site Worker serves it over Streamable HTTP at `https://prism.nanisoft.com/mcp` via `createMcpHandler(factory)`, and stdio-only clients bridge with `npx mcp-remote` — no second implementation. The surface is optimized for the primary client, a Claude Code session building a NaniSoft app: one search entry point over the whole corpus, three narrowing tools per catalog item so the loop pulls prose, API, or code as needed, markdown-in/markdown-out, and error text that puts the agent back on rails in one round trip. Everything Prism does not own — inherited antd props, antd demos, antd tokens, antd migration notes, fumadocs' runtime page machinery — is deliberately absent and delegated (§4). Auth v1 = none per ticket 05, with the Cloudflare Access escalation pre-written (§6). The corpus contract every tool reads is `PrismDocsStore`, specified here (§5) as the interface **ticket 16 must satisfy**; its generator side is still open and nothing in this ADR assumes an answer from it.

Ticket: `.scratch/prism/issues/13-mcp-tool-surface.md`. Transport and packaging decided upstream in `.scratch/prism/issues/05-remote-mcp-on-workers.md`; docs source decided in `.scratch/prism/issues/03-fumadocs-on-workers.md`.

## 1. The v1 tool set

| Tool | Input | Returns | Why it earns its place |
| --- | --- | --- | --- |
| `list_items` | `kind?: 'component'\|'block'\|'page'` | Grouped catalog: name, kind, one-liner, antd base; header line carries the Prism version and build date | Cold-start discovery. The one tool an agent calls before it knows Prism's vocabulary |
| `get_item_doc` | `name`, `kind?` | Full per-item Markdown: description, RFC-2119 usage rules, Prism-added props with `> Extends:` note, one example | The core call. Prism's opinion — not antd's — is the product here |
| `get_item_props` | `name` | Only the props section, as Markdown | The loop queries an API many times and reads the prose once; keeps tokens down. Mirrors plasma's `get_component_props` and antd's `antd_info` |
| `get_item_source` | `name`, `example?` | The documented example source, verbatim TSX in one fenced block | The ticket's "get block/page source". Agents consume code far more often than prose; `get_item_doc` is the once-per-item call, this is the repeat call. Returns *documented usage*, never prism-ui implementation files |
| `get_theme_doc` | `pack?: 'blue'\|'green'`, `mode?: 'light'\|'dark'` | Theme/token Markdown for that pack + mode, including the `createPrismTheme()` snippet | Theming is Prism's differentiator and antd's `antd_token` cannot answer it. A thin pass-through over prism-llms theme MD, so it does not hard-code the token tiers ticket 09 is still deciding. A *structured* `get_tokens` waits for v2 |
| `list_pages` | — | Docs/blog page index (title, url, one-liner) — the site's `llms.txt` body | The ticket-03 obligation: docs-MCP tools mirror the static `llms.txt` artefacts. Trivial (a slice of the bundled corpus) and mirrors fumadocs so agents transfer |
| `get_page` | `url` | One docs/blog page as Markdown | The ticket-03 read path. Mirrors fumadocs' `get_page(url)` contract exactly, so an agent that learned fumadocs' shape needs no re-teaching |
| `search_docs` | `query`, `kind?: 'component'\|'block'\|'page'\|'doc'`, `limit?` (default 5, max 10) | Ranked hits with kind + snippet + the suggested follow-up call | One entry point for the whole corpus. Splitting search per kind would make the agent guess which to call; the taxonomy distinction is a `kind` filter, not a tool choice |

Deferred, and why: a **structured `get_tokens`** (filter by tier/prefix, DTCG passthrough) hangs on ticket 09's token tiers and ticket 16's token MD shape; **faceted/locale/tag search** is unjustified at corpus size; **version-diff or migration tools** need two bundled corpora for a question the antd MCP's `antd_changelog` already answers; **render/preview tools** need a browser lane Prism does not have; **any write-back or telemetry tool** is the auth trigger in §6, not a v1 feature.

## 2. Schemas

Registration is `registerTool(name, { description, inputSchema }, handler)` against `McpServer` from `@modelcontextprotocol/server`, exactly as ticket 05's factory sketch shows. Names are **unprefixed** — MCP clients namespace by server (`mcp__prism-mcp-server__get_item_doc`), and the unprefixed `list_*` / `get_*_doc` / `get_*_props` / `search_docs` grammar is what lets an agent trained on plasma or Mantine transfer without re-reading (research 01, recommendation 9).

```ts
import { z } from 'zod';

const Kind = z.enum(['component', 'block', 'page']);
const SearchKind = z.enum(['component', 'block', 'page', 'doc']); // 'doc' = docs/blog page

list_items:    { kind?: Kind }
get_item_doc:  { name: z.string(), kind?: Kind }
get_item_props:{ name: z.string(), kind?: Kind }
get_item_source:{ name: z.string(), example?: z.string() }        // omit → first example
get_theme_doc: { pack?: z.enum(['blue', 'green']), mode?: z.enum(['light', 'dark']) }
list_pages:    {}                                                  // no arguments
get_page:      { url: z.string() }                                 // site pathname, e.g. '/docs/theming'
search_docs:   { query: z.string(), kind?: SearchKind, limit?: z.number().int().min(1).max(10) }
```

Output rules, all eight tools:

- Return `{ content: [{ type: 'text', text }] }` where `text` is **Markdown**. The corpus is Markdown; JSON envelopes would only add tokens and quoting.
- `name` / `url` lookups are **case-insensitive**; on a miss return `isError: true` with the closest matches (`did you mean: SettingsPage, SettingsForm?`) plus a pointer to `list_items` — never throw.
- `list_items`' first line is `Prism <version> — N components, M blocks, K pages (built <date>)`, so an agent can detect a corpus/installed-version mismatch before trusting the answer.
- Pass-through re-exports say so inline: `Button — antd Button, unchanged. Props: use the antd MCP (antd_info). Import from '@nanisoft/prism-ui'.` Routing is steered from data, not hope.
- Every tool is self-contained and idempotent; no tool returns a handle another tool must consume. Values (a `url` from `list_pages`, a `name` from `search_docs`) are fine; server-side "current item" state is impossible anyway on the stateless v2 handler.

Descriptions are the only steering surface most clients show, so each one carries the scope and the delegation rule:

```ts
registerTool('get_item_doc', {
  description:
    "Full Prism documentation for one component, block, or page: usage rules (RFC-2119), " +
    "Prism-added props, and an example. Covers Prism's own surface only — for inherited antd " +
    "props on pass-through re-exports use the antd MCP. Always import from '@nanisoft/prism-ui'.",
  inputSchema: { name: z.string().describe("e.g. 'Button', 'PageHeader', 'SettingsPage'"), kind: Kind.optional() },
}, handler);
```

## 3. Worked example — the loop this is built for

"Build a settings page with a table and a form, green pack, dark mode."

```http
POST https://prism.nanisoft.com/mcp
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_docs",
 "arguments":{"query":"settings page table form","limit":3}}}
```

```json
{"jsonrpc":"2.0","id":1,"result":{"isError":false,"content":[{"type":"text","text":
"# Search results for \"settings page table form\"\n\nFound 3 result(s):\n\n## SettingsPage (block)\nFull-page settings composition: header, sectioned form, action table.\n→ `get_item_source { \"name\": \"SettingsPage\" }` for the copyable source.\n\n---\n\n## Theming (doc)\nBrand packs and modes; `createPrismTheme({ pack: 'green', mode: 'dark' })`.\n→ `get_page { \"url\": \"/docs/theming\" }`.\n\n---\n\n## DataTable (component)\nantd Table, Prism-styled. Props: use the antd MCP (`antd_info Table`).\n"}]}}
```

The agent then follows the pointers the result printed: `get_item_source {"name":"SettingsPage"}` for code, `get_item_doc {"name":"SettingsPage"}` for the rules, `get_theme_doc {"pack":"green","mode":"dark"}` for the theme object, and only leaves the Prism server for `antd_info Table` when it needs an inherited prop. Three to four calls, no exploration, no prose it didn't ask for. (Item names are illustrative until tickets 10–12 fill the catalog.)

## 4. What Prism must NOT duplicate

**antd MCP** (`@ant-design/cli mcp` — `antd_list`, `antd_info`, `antd_doc`, `antd_demo`, `antd_token`, `antd_semantic`, `antd_changelog`, plus the `antd-expert`/`antd-page-generator` prompts; wired into this repo's agent tooling by ticket 15). Prism delegates the entire upstream surface: raw prop tables for unchanged re-exports, antd demos, antd design/semantic tokens, semantic DOM classes, changelog and migration notes. The seam is the per-item doc's `> Extends: antd X` note plus the `_No additional props beyond the antd base component._` line (plasma's rule) — that line *is* the instruction to switch servers. Prism's own props tool returns only the Prism-added delta. Without this, Prism ships a stale fork of antd's API surface and answers drift the moment antd releases.

**Fumadocs MCP** (`fumadocs-core/mcp`: `list_pages`, `get_page`, `search` via `registerSourceTools`/`registerSearchTool`). Prism **adopts the tool contracts** (so agents transfer) and **rejects the machinery**: no fumadocs `loader()`, no MDX compilation, no React, no runtime search server in the Worker — the corpus is prerendered Markdown from prism-llms, and `get_page` is a map lookup. The site's static export must keep fumadocs' own `/api/mcp` un-generated (ticket 03: it cannot live there), so there is exactly one MCP endpoint for prism.nanisoft.com, and it is this one. What Prism does not mirror is fumadocs' generality: tools are scoped to Prism's docs, not a generic page-tree reader.

**Also out**: generic web/library docs lookup (context7's job), an `llms.txt` *parser* (prism-llms is the generator, not a format the MCP interprets), and any duplication of the static artefacts — `llms.txt` / `llms-full.txt` / per-page `.md` stay the non-MCP lane, emitted by the same generator from the same commit, so the two lanes cannot diverge in content.

## 5. Docs data source — `PrismDocsStore` (pending ticket 16)

Single backing store: `@nanisoft/prism-llms` build output, bundled into the Worker at build time (ticket 05's decision — no runtime I/O, no cache, deploy *is* invalidation; lookup maps built in the factory, not at isolate boot, to stay inside the 1 s startup limit). The tools make exactly one assumption about that output, and this is the contract ticket 16 must satisfy — its generator, file layout, and drift gate are still open:

```ts
interface PrismDocsStore {
  readonly prismVersion: string;   // echoed by list_items
  readonly baseUrl: string;        // 'https://prism.nanisoft.com', interpolated at build
  readonly items: ReadonlyArray<{
    readonly name: string;         // 'Button' | 'PageHeader' | 'SettingsPage'
    readonly kind: 'component' | 'block' | 'page';
    readonly description: string;  // the one-liner that becomes the llms.txt bullet
    readonly doc: string;          // full per-item Markdown (usage rules + props + example)
    readonly props?: string;       // the extracted props section
    readonly examples?: ReadonlyArray<{ readonly slug: string; readonly title?: string; readonly code: string }>;
    readonly antdBase?: string;    // 'Button' when a pass-through re-export; absent for wrappers
  }>;
  readonly pages: ReadonlyArray<{  // docs + blog, prerendered as Markdown
    readonly url: string; readonly title: string; readonly description?: string; readonly markdown: string;
  }>;
  readonly themes: ReadonlyArray<{ readonly slug: string; readonly markdown: string }>; // shape per ticket 09
}
```

Every field above is consumed by exactly one tool; nothing else about the store's shape (file layout, `index.json` vs single `data.json`, BOM-free artefacts, CI drift gate) is assumed here. If ticket 16 reshapes the generator, the fix is a projection from its output into `PrismDocsStore`, not tool changes. Note 16 is downstream of this ticket (blocked by 12, 13), so this interface is an input to it, not a dependency of it.

## 6. Auth — v1 none, Access pre-written

Per ticket 05: **v1 ships unauthenticated**, because the corpus is public read-only (npm is public too), the primary client is NaniSoft Claude Code sessions that want zero-friction auth, and the tools are pure reads over an immutable blob. Guards are hygiene, not auth: `allowedHostnames: ['prism.nanisoft.com']` (the default is localhost + `*.workers.dev` only), `corsOptions: false`, `responseMode: 'json'`.

**Pre-written escalation — flip when a tool gains anything non-public** (org-internal examples, telemetry, write-back, per-user quota): put Cloudflare Access for SaaS in front as the OIDC IdP, redirect URI `<worker>/callback`, secrets `ACCESS_CLIENT_ID`, `ACCESS_CLIENT_SECRET`, `ACCESS_TOKEN_URL`, `ACCESS_AUTHORIZATION_URL`, `ACCESS_JWKS_URL`, `COOKIE_ENCRYPTION_KEY`, and validate the Access-issued token in a wrapper *around* `createMcpHandler` — the factory and all eight tools are pure functions of the corpus and change not at all. CI/automation lanes use Access service tokens (`CF-Access-Client-Id`/`-Secret`). Deliberately **not** adopted: `@cloudflare/workers-oauth-provider` (consent UI + KV + CSRF surface) — that waits for third-party developers authorizing their own resources, which is not a Prism scenario.

## 7. Primary client — rules the surface follows

- **Claude Code first.** Tools work in one stateless round trip each; the client mounts via ticket 15's `.mcp.json` entry and namespaces names, which is why unprefixed tool names are safe.
- **Token frugality over completeness.** Doc / props / source are three tools, not one fat response; search caps at 5 hits with snippets, not full documents.
- **Steering lives in data and descriptions.** Result text prints the next call to make; descriptions carry the import invariant and the antd delegation rule.
- **Offline/other-client parity.** Same factory over stdio for fully-offline sessions (`npx mcp-remote`, or the `bin` stdio twin when it ships); `llms.txt` remains the lane for agents that speak no MCP.

## Considered options

- **Plasma's verbatim 6-tool set** (`list_components`, `get_component_doc`, …): declined as names — "component" is false for blocks and pages, which are Prism's differentiator — while keeping its mechanics wholesale: bundled corpus, term-frequency search capped at 5, `{content, isError}` errors, case-insensitive maps, `list_*`/`get_*_doc`/`get_*_props`/`search_docs` grammar.
- **Per-kind tool triples** (`list_blocks`, `get_block_doc`, …): declined — 3× the tool count for zero loop gain; `kind` is a parameter, not a namespace.
- **Structured token query in v1**: declined — hangs on ticket 09's tiers; `get_theme_doc` pass-through instead, `get_tokens` later.
- **ZBSearch/orama index bundled into the Worker**: declined for v1 — corpus is small and term-frequency is dependency-free; revisit when the corpus outgrows it.
- **Cloudflare Access from day one**: declined — nothing here is non-public yet; escalation pre-written in §6 instead.
- **MCP resources/prompts** (`prism://` item resources, a `prism-expert` prompt): declined for v1 — resources are unevenly supported across clients and the static artefacts already fill that role; tools are the lowest common denominator. Cheap to add later without breaking the eight.

## Consequences

- `@nanisoft/prism-mcp-server` implements eight tools and exports `createPrismMcpServer(docs)` with `PrismDocsStore` as its parameter type; the placeholder's `tools: []` and its test both change when this lands.
- `@nanisoft/prism-llms` (ticket 16) must emit a projection into `PrismDocsStore` — including `examples[].code` and the `antdBase` flag, which only the generator can know.
- Ticket 09 must keep theme/token documentation expressible as Markdown per pack × mode, or `get_theme_doc` grows a structured sibling.
- Ticket 12's `ComponentDemo` format must yield self-contained, copy-pasteable TSX per example, or `get_item_source` has nothing honest to return.
- Ticket 15 wires `.mcp.json` with the prism entry alongside the antd MCP, and the pairing rule ("query Prism for Prism behaviour, antd MCP for inherited props, always import from `@nanisoft/prism-ui`").
- The Worker's handler options are pinned by §6, and the site's static export must never generate fumadocs' `/api/mcp`.
