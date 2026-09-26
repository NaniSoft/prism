---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 12
---

# MCP tool surface and transport

## Question

`@nanisoft/prism-mcp-server` is published and live, serving eight read-only
tools over HTTP at `prism.nanisoft.com/mcp` from the same Cloudflare Worker that
serves the site. The decision on this map is to port it. What changes is the
catalogue underneath it and the transport story, so this ticket re-derives the
surface rather than copying it.

Settle:

1. **The tool list.** The old eight were `list_items`, `get_item_doc`,
   `get_item_props`, `get_item_source`, `get_theme_doc`, `list_pages`,
   `get_page` and `search_docs`. Decide the new set against the new catalogue,
   which is components to blocks to pages with a smaller v1 roster. A tool that
   exists because an item kind exists, and a tool that exists because a
   retrieval pattern exists, are different reasons; say which is which.
2. **What "props" means for a library consumer.** The old server returned a
   props table extracted from the hand-written agent spec. For a library whose
   components have real TypeScript types, decide whether props come from the
   spec, from the emitted declarations, or from both, and what an agent is told
   when a component has no own props because it wraps an upstream primitive.
   That case is common here and the old repository had a documented seam line
   for it.
3. **Source retrieval.** Whether an agent can get copyable source for a
   component, a block and a page, and at what fidelity. This is the tool that
   most directly serves the user's stated purpose, since a downstream product
   composes by picking components.
4. **Theme and token queries.** Whether an agent can ask for a pack's resolved
   values, the semantic token contract, or the motion scale. Under "every style
   and animation is driven from here", an agent that cannot read the token
   contract will invent one.
5. **Search.** The old implementation was naive substring scoring over name,
   description and content, returning whole documents despite the description
   promising excerpts. Decide whether that is kept, and if it is, fix the
   description to match the behaviour rather than leaving the gap.
6. **Transport.** The old arrangement was one Worker serving both the site and
   the MCP, with a stateless handler and no authentication in version one, plus
   an optional stdio shim through `mcp-remote`. **The Worker half is now settled
   rather than inherited:** fumadocs' own MCP helpers "register tools only" and
   the docs state the transport "requires a server at runtime", and static
   export permits only `GET` where streamable HTTP needs `POST` and `DELETE`. So
   the MCP cannot be a static asset and the Worker route stays. State the auth
   posture explicitly: the old one was public read-only with a Cloudflare Access
   escalation pre-written, and that is a decision to make again rather than
   inherit by silence. One thing worth deciding on the evidence: fumadocs
   exports `registerSourceTools` and `registerSearchTool` from
   `fumadocs-core/mcp`, which take any `McpServer` and are transport-agnostic,
   so a `list_pages`, `get_page` and `search` layer could be reused against the
   same `source` the static site already builds rather than reimplemented.
7. **The stdio question.** plasma ships a stdio binary. The old Prism did not
   ship one, only a documented `mcp-remote` route. Decide whether a bin is
   published, given a package with a `bin` has a different consumption shape
   and a different failure surface.
8. **Versioning and the built timestamp.** The old build stamped a build date
   from the corpus's own modification time via a committed generator, and the
   map records a controller ruling that kept the corpus package untouched
   rather than adding a `built` field to the store. Decide where that field
   lives now, since a consumer needs to know how fresh the corpus is.
9. **Tests.** The old server had forty passing tests including real protocol
   round-trips over both an in-memory transport and the Worker. Decide the test
   floor for this package and what a test asserts, given this repository has no
   tests at all today.

Read the old `packages/mcp-server/` in full and the old `apps/site` Worker
source. Consult `cloudflare` and `workers-best-practices` for the transport
and `agents` or the current MCP SDK documentation for the handler shape, since
the old map records that `McpAgent` is deprecated and that most 2025 tutorials
are wrong.

## Answer

All nine are decided. The port keeps the eight-tool grammar, the unprefixed
names, the markdown-in/markdown-out response shape, and the pure
`createPrismMcpServer(store)` factory (ticket 05's transport-agnostic seam). It
re-derives the surface against ticket 09's catalogue, ticket 12's
`PrismDocsStore` and no-runtime-I/O lane, and ticket 19's 42-item roster. Four
points go beyond the recommended shape and are justified in place:

- **No ninth `get_tokens` tool.** The token contract is read through
  `get_theme_doc`'s `group` argument (Q4); a separate tool would duplicate a
  lookup the corpus already holds and split the grammar for no loop gain.
- **`get_item_source` drops the old `example?` argument.** Ticket 12's corpus
  holds exactly one demo per item, so there is nothing to disambiguate (Q3).
- **The build stamp lives in the MCP lane, not the corpus.** Ticket 12's ruling
  is binding: "the corpus itself gains no `built` field". The stamp is generated
  beside the MCP bundle (Q8).
- **fumadocs' `registerSourceTools`/`registerSearchTool` are rejected, not
  adopted.** They need a runtime `source` and a search server, which contradicts
  ticket 12's bundled `data.json` with no runtime I/O (Q5).

One tool exists because a kind exists: `list_items`, the kind-grouped catalogue
index. The other seven exist because a retrieval pattern exists. Every tool is
self-contained, idempotent, stateless, and returns markdown; a lookup miss is
`isError: true` with did-you-mean suggestions and a browse pointer, never a
throw.

### 1. The tool list: eight tools, one kind-driven and seven retrieval-driven

The eight names are kept. The argument shapes are re-derived:

| Tool | Input (zod) | Why it exists |
| --- | --- | --- |
| `list_items` | `{ kind?: Kind; category?: ComponentCategory }` | **Kind-driven.** The kind-grouped catalogue index; `kind` and `category` are filters, not tools. |
| `get_item_doc` | `{ name: string; kind?: Kind }` | Retrieval: the assembled per-item Markdown (prose + props + demo pointers). |
| `get_item_props` | `{ name: string; kind?: Kind }` | Retrieval: the `## Props` subset, for the loop that re-queries an API many times. |
| `get_item_source` | `{ name: string; kind?: Kind }` | Retrieval: the verbatim demo plus the public import line (Q3). |
| `get_theme_doc` | `{ pack?: PackId; mode?: Mode; group?: TokenGroup }` | Retrieval: the token contract and the bound scales (Q4). No kind exists for a token. |
| `list_pages` | `{}` | Retrieval: the non-item page index (guides, foundations, content). |
| `get_page` | `{ url: string }` | Retrieval: one non-item page as Markdown. |
| `search_docs` | `{ query: string; kind?: SearchKind; limit?: number }` | Retrieval: one entry point over the whole corpus. |

Vocabulary, all from resolved tickets:

- `Kind = 'component' | 'block' | 'page'` (ticket 09's closed union).
- `ComponentCategory` is ticket 09's seven categories, closed.
- `SearchKind = Kind | 'doc'`, where `'doc'` means a non-item page (a guide, a
  Foundation, a Content page), not a `page`-kind catalogue item.
- `PackId` is ticket 07's `'default' | 'blush' | 'mint' | 'lavender' | 'sky' |
  'peach'`; `Mode` is `'light' | 'dark'`.
- `TokenGroup` is Q4's set: `'semantic' | 'motion' | 'typography' | 'spacing' |
  'shadow' | 'breakpoint' | 'container'`.

**Nothing is dropped or merged, and two details change:**

- `get_item_props` stays although it is a section of `get_item_doc`, because
  ticket 12 generates the `## Props` definition list as its own lane and the
  primary loop re-queries props without re-reading prose.
- `list_pages`/`get_page` stay separate from `list_items`/`get_item_doc`,
  because the corpus has two lanes. `get_page` serves only the `pages` lane; a
  `/components/<slug>` URL is a miss with a pointer to `get_item_doc`, never a
  silent cross-lane hit.
- `get_item_source`'s old `example?` argument is dropped: ticket 12 emits one
  demo per item (`apps/site/src/demos/<slug>.tsx`), so `{ name, kind? }` is the
  whole input.
- `get_theme_doc` absorbs the deferred structured token query as its `group`
  argument instead of a new tool (Q4).

**The import rule in every description is re-derived.** The old rule ("Always
import from `@nanisoft/prism-ui`, never from antd or Base UI directly") is
replaced by ticket 11 section 9's subpath contract:

> Import from `@nanisoft/prism-ui/components/<slug>`, `./blocks/<slug>` or
> `./pages/<slug>`. Base UI and internal paths are never a consumer import.

The surface rule is kept and re-stated: Prism answers its complete owned
surface; Base UI and native elements are internal implementation details.

`list_items` output: a header `Prism <version> - N components, M blocks, K pages
(built <date>)` built from the store's `version` and the MCP lane's stamp (Q8);
then `## Components` / `## Blocks` / `## Pages` groups; each entry `- **<Name>**
- <description> _(<category>)_`, with the category shown only for components;
a filter note when `kind` or `category` is passed; and a footer pointing at
`get_item_doc`, `get_item_props` and `search_docs`. A `category` passed with
`kind: 'block' | 'page'` is an `isError` naming the mismatch, because a category
is a component-only field (ticket 09). An empty corpus is tolerated: header plus
"No components in this build".

### 2. What "props" means for a library consumer

**Props come from the generated per-item spec (ticket 12), which is itself
generated from the emitted declarations.** The MCP reads the spec's `## Props`
section verbatim and does not re-extract, so there is one extractor, two
renderers (the site's HTML table and the corpus's definition list), and no third
path. `get_item_props` returns that section plus a one-line footer and the
import rule.

**The tool does not expose the raw `.d.ts` shape.** Reasons: the surface gate
(ticket 07 section 6) bans Base UI module specifiers and types from emitted
declarations, so a raw declaration is not a consumer contract; the declaration
is an intermediate artifact, not what a consumer copies; and exposing it would
be the second extraction ticket 12 forbids. The spec is the one public
projection of the declarations.

**The no-own-props case, and the documented seam line.** Ticket 12's `## Props`
section is a definition list, one entry per line. When the emitted declaration
carries no props of its own, the section body is a fixed, generated seam line
instead of an empty list. The upstream primitive is named as internal metadata
only; the agent is never told to import it or to consult a second server,
because ticket 07 section 6 makes Base UI internal and there is no upstream MCP
to delegate to. The exact line shapes:

```
> Extends: the internal Base UI `Select` primitive. Its props are that primitive's,
surfaced through this Prism component. Base UI is internal and is never a consumer import.
```

and, when the primitive's props are the whole surface and Prism adds nothing:

```
_No additional props beyond the internal Base UI `Select` primitive._
```

For a native-backed component the upstream is the element, not Base UI:

```
> Extends: the native `<button>` element. No additional Prism-specific props.
```

`get_item_props` renders the line verbatim and appends: "This is the complete
public Prism API for `<Name>`; internal primitive props are not a consumer
contract." The generator (ticket 12) owns emitting the seam line into the spec;
this ticket fixes its form and its consumer-facing meaning. The old repository's
`> Extends: antd X` / `_No additional props beyond the antd base component._`
pair is the direct ancestor, re-pointed from a second MCP to Prism's own
internal foundation.

### 3. Source retrieval: the demo, verbatim, plus the import line

`get_item_source({ name, kind? })` returns, in one response:

1. a heading `# <Name> - example source`;
2. the **public import line(s)**, composed from the catalogue's `kind`, `slug`
   and `exports` (ticket 09 / ticket 11 section 9): `import { Button } from
   '@nanisoft/prism-ui/components/button'`, or `./blocks/<slug>` / `./pages/<slug>`;
3. the **demo source, verbatim**, in one ` ```tsx ` fence, from
   `apps/site/src/demos/<slug>.tsx`;
4. a footer naming the demo contract (imports only `@nanisoft/prism-ui/*` or
   `react`, one default export) and the import rule.

**Fidelity.** The demo is byte-for-byte the file ticket 10 section 5 generates
the registry from, which is what a consumer copies. The import line is
generated from checked catalogue metadata, not guessed from the demo, so it
cannot disagree with the item's real subpath. A Block or a Page returns its
composition demo at the same fidelity; the corpus does not hold a separate
"implementation" source for either.

**What it cannot return, stated:** the component's implementation source
(`packages/ui/src/**` is never shipped), the emitted `.d.ts`, the MDX prose
(that is `get_item_doc`), internal Base UI source, or a second example (there is
exactly one demo per item). When an item has no demo, the tool returns
`isError: true` and points at `get_item_doc`; it never fabricates source.

### 4. Theme and token queries: `get_theme_doc` is the contract reader

`get_theme_doc` answers all three questions the ticket names: a pack's resolved
values, the semantic token contract, and the bound motion / typography /
spacing / shadow / breakpoint / container scales (tickets 06 and 18). It is the
one tool that lets an agent read the contract instead of inventing a duration,
a curve or a spacing step.

**Arguments:**

| Argument | Type | Default | Meaning |
| --- | --- | --- | --- |
| `pack` | `PackId` | `'default'` | the palette, ticket 07's six ids |
| `mode` | `'light' \| 'dark'` | `'light'` | the mode axis |
| `group` | `TokenGroup` | omitted | one bound scale; `'semantic'` is the pack-by-mode set |

**Output (markdown, definition-list grammar, not tables):**

- `group` omitted or `'semantic'`: the resolved semantic contract for the
  selected `pack` x `mode`, one line per token, `--<name>: <resolved value>`,
  covering the colour and radius sets. The header names the six packs, the two
  modes and the six queryable scales, and states the selection mechanism:
  `data-pack="<id>"` on `<html>`, `.dark` for mode (ticket 07).
- `group: 'motion' | 'typography' | 'spacing' | 'shadow' | 'breakpoint' |
  'container'`: the mode-independent authored scale, one line per token,
  `--<name>: <value>`, plus its Tailwind binding when one exists (for example
  `--duration-fast: 80ms` and its `--transition-duration-fast` mirror, ticket
  06). Breakpoints include the `xl`/`2xl: initial` closure (ticket 18).
- The footer repeats the import rule and the no-invention rule: motion and
  typography are named by token, never by a millisecond or a `cubic-bezier`
  literal (tickets 06 and 07).

An unknown `pack`, `mode` or `group` is `isError: true` listing the valid
values. No ninth `get_tokens` tool is added: the group argument is the
structured query, and it keeps the eight-tool grammar intact.

**Required store projection (hand-off to ticket 12).** For the tool to render
this without a second artifact, `PrismDocsStore.tokens` carries:

```ts
interface PrismTokensProjection {
  packs: readonly PackId[]
  modes: readonly Mode[]
  themes: ReadonlyArray<{
    pack: PackId
    mode: Mode
    semantic: ReadonlyArray<{ token: string; value: string }> // colour + radius
  }>
  scales: Record<'motion' | 'typography' | 'spacing' | 'shadow' | 'breakpoint' | 'container',
    ReadonlyArray<{ token: string; value: string; binding?: string }>>
}
```

`token` is the custom property without the leading `--`; `value` is the resolved
value. This is the token lane ticket 12 section 3 promises ticket 13 Q4, and it
replaces the old `dist/md/theme/**` tree that ticket 12 retired.

### 5. Search: keep the scoring, fix the description, return references

**Keep the dependency-free substring scoring.** It is weighted (name outranks
description outranks body), case-folded, term-split, capped at 5 by default and
10 at most. The corpus is small enough that a bundled index earns nothing, and
the scoring is deterministic and dependency-free.

**Fix the tool description to match the behaviour.** The old description
promised "ranked hits with kind, snippet" while the behaviour returned more than
it described. The new description states exactly what `search_docs` does:

> Substring match over item names, descriptions and page bodies. Returns ranked
> references, each with its kind, the field that matched, and the follow-up call
> to make. It does not return page or item contents; use `get_item_doc` or
> `get_page` for the body.

**Return item references plus matched fields.** Each hit carries `{ title,
kind, url or mirror, matchedFields, score }`, rendered as a markdown list. The
snippet is the item's `description` or the page's one-liner (the same text the
`llms.txt` bullet uses), never a whole document. `kind` filters the candidates
including `'doc'`; an empty result set is guidance, not an error.

**fumadocs' `registerSourceTools`/`registerSearchTool` are not adopted.** They
are transport-agnostic and take any `McpServer`, but they require a runtime
`source` and the site's search server, while ticket 12 fixes the MCP lane as the
build-time-bundled `data.json` with no runtime I/O. Adopting them would (a)
introduce a runtime dependency and a second source beside the corpus, (b) not
work when the corpus is built before `next build` (ticket 12 section 5), and
(c) recreate the two-mirrors drift ticket 12 exists to prevent. Their tool
**contracts** are still mirrored (the `list_pages` / `get_page` / search grammar
transfers), but the machinery is ours over the store.

### 6. Transport: the Worker route stays, public read-only in v1

**The route stays.** Static export permits only `GET` on an asset, where
Streamable HTTP needs `POST` (and `DELETE` for session teardown); fumadocs' own
helpers "register tools only" and need a server at runtime. So `/mcp` is a
Worker route, exactly as ticket 10 section 10 fixes it.

**Handler shape.** The current, non-deprecated pattern: `createMcpHandler` from
`agents/mcp/server` over `@modelcontextprotocol/server@2.0.0`, wired in
`apps/site/worker/mcp.ts`. `McpAgent` is deprecated and feature-frozen, and most
2025 tutorials show the deprecated path; do not use them.

```ts
// apps/site/worker/mcp.ts
const handler = createMcpHandler(
  () => createPrismMcpServer(parsePrismDocsStore(docsData), { built: BUILT }),
  {
    route: '/mcp',
    allowedHostnames: ['prism.nanisoft.com'],
    corsOptions: false,
    responseMode: 'json',
  },
)
```

- **Stateless, bundled, no runtime I/O.** `docsData` is
  `@nanisoft/prism-llms/data.json` imported as an ESM module and bundled by the
  Worker bundler; `parsePrismDocsStore` runs in memory. No `fs`, no `fetch`, no
  KV, no cache, no bindings beyond `ASSETS`. `env` is unused. The lookup maps
  are built per request inside the factory, never at isolate scope (the 1 s
  startup rule).
- **Routing.** `apps/site/worker/router.ts` treats `/mcp` and `/mcp/*` as the
  MCP lane and threads the runtime execution context; everything else falls to
  `rewriteMdPathname` then `env.ASSETS.fetch`. `wrangler.jsonc` keeps `/mcp`
  and `/mcp/*` in `run_worker_first`.
- **Behaviour pinned by the old tests, kept.** `GET` and `DELETE` on `/mcp` are
  stateless `405`s; a host outside `allowedHostnames` is `403`; `/mcp/` is
  `404` because the handler's route match is exact; a `/mcp` request never
  reaches the asset binding.

**Auth posture, stated rather than inherited: public read-only in v1.** The
corpus is public (npm is public too), the tools are pure reads over an immutable
blob, and the primary client wants zero-friction auth. The Cloudflare Access for
SaaS escalation is **pre-written but not enabled**: OIDC IdP, redirect URI
`<worker>/callback`, secrets `ACCESS_CLIENT_ID`, `ACCESS_CLIENT_SECRET`,
`ACCESS_TOKEN_URL`, `ACCESS_AUTHORIZATION_URL`, `ACCESS_JWKS_URL`,
`COOKIE_ENCRYPTION_KEY`, token validation in a wrapper **around**
`createMcpHandler` (the factory and all eight tools are pure and do not change),
and Access service tokens for CI. `@cloudflare/workers-oauth-provider` is not
adopted. The escalation flips when a tool gains anything non-public: org-internal
examples, write-back, telemetry, or per-user quota.

### 7. The stdio question: no bin at launch, document `mcp-remote`

**Do not publish a `bin` at launch.** The package ships the transport-free
factory only, and a stdio-only client bridges with `npx mcp-remote
https://prism.nanisoft.com/mcp`, matching the old Prism and ticket 05. There is
one implementation: the same factory serves both transports, so the bin is not
needed for correctness.

**The trigger for adding a bin later:** a supported consumer that cannot use
`mcp-remote` (an offline or air-gapped environment, a CI runner with no
outbound network, or an MCP client that cannot proxy) and asks for it. The bin
is additive because the factory is transport-agnostic.

**The consumption and failure surface it would add:** a `bin` entry, a shebang,
`files` changes, and a `StdioServerTransport` from
`@modelcontextprotocol/server/stdio`; the package becomes an install-time
executable rather than a library; and the failure surface grows from "the
Worker route answers" to Node version, stdin/stdout framing, process lifecycle
and signal handling on every platform. That is the cost the trigger must
justify.

### 8. Versioning and the built timestamp: in the MCP lane, deterministic

**Where it lives: the MCP lane, not the corpus.** Ticket 12's ruling is explicit
("the corpus itself gains no `built` field"), and the index manifest is the store
itself, so there is no separate manifest to hold it either. The stamp therefore
lives beside the MCP bundle in a generated, gitignored module (for example
`packages/mcp-server/src/generated/built.ts`), emitted by a small
`scripts/stamp-built.mjs` before the MCP/Worker build, and passed to
`createPrismMcpServer(store, { built })`. `list_items` echoes it in its header.

**Versioning.** Two distinct versions, both explicit:

- the **protocol identity** `serverInfo.name` / `version` is the MCP package's
  own version, a literal in `version.ts` kept in sync with `package.json`;
- the **corpus version** is `PrismDocsStore.version`, echoed by `list_items` as
  `Prism <version>`, so an agent can detect a corpus-versus-installed-version
  mismatch before trusting an answer.

**How it avoids breaking build-twice determinism.** The stamp is not in
`dist/`, so ticket 12's corpus `emit()`-twice byte comparison never sees it and
the corpus stays byte-deterministic. The generated stamp module is gitignored
and excluded from every byte comparison. To make the stamp itself reproducible
rather than mtime-dependent, it is derived from the corpus build's **source
commit date** (`git log -1 --format=%cs`) plus the corpus `version`, not from a
file mtime; if git is unavailable the stamp is `undefined` and the header omits
the `(built ...)` clause rather than fabricating a date. Rebuilding the same
commit produces the same stamp; a new corpus commit moves it.

### 9. Tests: a floor of 20, and what each asserts

**Floor: 20, matching ticket 15.** The concrete suite below is 22 to 24; the
number is a floor, not a target. Vitest, `environment: 'node'`, tests in
`packages/mcp-server/test/**` plus the Worker lane in `apps/site/test/**`.

A test asserts one of four things:

1. **Tool argument validation.** The zod schemas reject an over-limit
   `search_docs limit`, a `kind` outside the union, a `category` on a block or
   page, and a missing `name`; every rejection is a protocol `isError: true`,
   never a thrown exception. Parameter descriptions are present so a client
   sees what to pass.
2. **The store guard.** The factory runs `parsePrismDocsStore` at the door: an
   unknown `kind`, a non-string `version`, and a missing field each throw with
   the offending path; the guard is the one ticket 12 declares in
   `prism-llms` and is inherited, not re-implemented (a widened `kind: string`
   is rejected).
3. **Registration and description contract.** Exactly the eight unprefixed
   tools in order; tools only (`resources/list` and `prompts/list` reject);
   `serverInfo.name` is `prism-mcp-server`; every description carries the
   import rule and the surface rule.
4. **Real protocol round-trips, not doubles.** Over
   `InMemoryTransport.createLinkedPair()` with a real `Client`: `initialize`,
   `tools/list`, and `tools/call` for **`list_items`, `get_item_doc` and
   `search_docs`** (ticket 15's three). Plus **one round-trip through the real
   Worker handler** (`handleRequest` -> `createMcpHandler` -> the bundled
   `data.json`): `initialize`, `tools/list`, a `tools/call`, the host-allowlist
   `403`, the `GET`/`DELETE` `405`s, the exact-route `/mcp/` `404`, and the
   assertion that `/mcp` never touches the asset binding.

The round-trip set covers: the protocol handshake and `serverInfo`; the exact
tool registry; a catalogue-wide call (`list_items` header, counts, grouping,
filters); a per-item call (`get_item_doc` verbatim plus its footer, and a
did-you-mean miss); a corpus-wide call (`search_docs` ranking, matched fields,
the cap, and the empty result); and the transport guards (host, method, route).
The per-tool behaviour that is not a round-trip is covered by direct calls over
the same in-memory harness: `get_item_props` (including the no-own-props seam
line), `get_item_source` (verbatim demo plus import line, and the no-demo
error), `get_theme_doc` (default, explicit pack x mode, each group, and a miss),
`list_pages`, `get_page`, case-insensitivity, kind disambiguation, independent
servers over one store, and the empty corpus.

Two checks are corpus-level and fail the build (ticket 15): the tool registry
equals the catalogue and corpus (the eight tools; every catalogue item is
reachable), and the bundled `data.json` hash equals `packages/llms/dist/data.json`.

### Consistency and hand-offs

- **Ticket 09:** `kind` is the closed union; `category` is component-only and
  closed at seven; `get_page`/`list_pages` serve the non-item lanes
  (`/docs`, `/foundations`, `/content`), never a catalogue URL.
- **Ticket 10:** `/mcp` stays a Worker route; `run_worker_first` keeps `/mcp`
  and `/mcp/*`; the handler is stateless and bundled.
- **Ticket 12:** the tool reads the store's `version`, `items` (including the
  generated `## Props` section and the seam line), `pages` and `tokens`; it
  inherits `parsePrismDocsStore`; it does no runtime I/O. Ticket 12 implements
  the `tokens` projection shape in Q4 and the seam line form in Q2.
- **Ticket 15:** the MCP floor is 20, including the three in-memory round-trips
  and the one Worker round-trip; the registry-equals-corpus and bundled-hash
  checks fail the build.
- **Ticket 11:** the Agent workflow guide's tool list is this answer's eight
  names and argument shapes, replacing the old eight-tool list and the antd MCP
  references entirely.
- **Ticket 14:** `CONTEXT.md` gains no new noun; the token group names are
  format, not vocabulary.
