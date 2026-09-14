# Research 05 — Remote MCP server on Cloudflare Workers

Resolves [`.scratch/prism/issues/05-remote-mcp-on-workers.md`](../issues/05-remote-mcp-on-workers.md).
Researched 2026-09-14 against primary sources (developers.cloudflare.com, github.com/cloudflare,
modelcontextprotocol.io, npm registry, github.com/coveo/plasma).

---

## TL;DR — recommended architecture

One Worker (`apps/site`) serves **both** the static docs site (Workers Static Assets) and a
**stateless Streamable-HTTP MCP endpoint at `/mcp`**, using Cloudflare's current
`createMcpHandler()` from `agents/mcp/server` over `@modelcontextprotocol/server@2.0.0`.
`McpAgent` — the class every 2025 tutorial uses — is **deprecated and feature-frozen**; do not
start there. Tool logic lives in a pure, transport-agnostic `createPrismMcpServer(docs)` factory
shared by the HTTP Worker and an optional stdio twin (`npx @nanisoft/prism-mcp-server`, plasma
parity). Docs data is **bundled at build time** from `@nanisoft/prism-llms` output (plasma's
approach): no runtime I/O, nothing to cache, no drift surface. **Auth v1 = none** — the corpus is
public read-only docs — with Cloudflare Access for SaaS documented as the ready-to-flip org-only
upgrade.

```
                       ┌─ prism-llms (generated) ─┐
turbo build graph ────▶│  llms.txt · per-component MD · tokens MD │
                       └───────────────┬─────────────────────────┘
                                       │  bundled at build time → src/data (JSON)
                                       ▼
              ┌──────────────────────── apps/site Worker ───────────────────────┐
   GET /*     │  assets.directory (dist/client)  ── served directly, no Worker  │
   POST /mcp ─▶  run_worker_first:["/mcp"] → createMcpHandler(factory)           │
              │                              └─ factory() → McpServer + tools   │
              └──────────────────────────────────────────────────────────────────┘
        stdio twin: @nanisoft/prism-mcp-server → StdioServerTransport (same factory)
```

---

## 1. The ground truth as of 2026-09-14 (this changed recently)

Cloudflare's MCP guidance was rewritten for the **MCP TypeScript SDK v2** split packages. This
invalidates most 2025 blog posts, YouTube walkthroughs, and Cloudflare's own older templates.

| Thing | Status 2026-09-14 |
| --- | --- |
| `agents` (npm) | **0.23.0** latest. Agents SDK v0.20.0 is where the MCP SDK v2 migration landed. |
| `@modelcontextprotocol/server` | **2.0.0** (published 2026-07-27). Implements the **MCP 2026-07-28** draft revision. Pin exact. |
| `@modelcontextprotocol/client` | **2.0.0** |
| `@modelcontextprotocol/sdk` | **1.30.0** — legacy monolith, **temporary bridge only**. |
| `@modelcontextprotocol/{node,express,fastify,hono}` | Optional v2 middleware adapters. |
| `@modelcontextprotocol/core` | New shared dependency of the v2 server package. |
| `McpAgent` (`agents/mcp`) | **Deprecated + feature-frozen**, no removal date. Migrate away. |
| `createMcpHandler` (`agents/mcp/server`) | **Current recommendation** for new servers. |
| `createLegacyMcpHandler` (`agents/mcp`) | Temporary lane for sessionful legacy clients (`WorkerTransport`). |
| `workers-mcp` | Not archived, but its own README says *"start here instead — and build a remote MCP server."* Superseded. |
| Remote transport | **Streamable HTTP** only. SSE / HTTP+SSE deprecated. |
| Spec revisions | `2025-03-26` introduced Streamable HTTP; `2025-06-18` is the current transports spec; Cloudflare documents the draft **`2026-07-28`** revision, which additionally deprecates **Roots, Sampling, Logging, HTTP+SSE transport, and Dynamic Client Registration**. |

### The v2 model in one paragraph

v2 abandons the session. There is **no `initialize` handshake** (a `server/discover` is optional),
**no `Mcp-Session-Id`**, and the handler takes a **server *factory*, not an instance** — a fresh
`McpServer` is built per request. Anything you used to stash on a session now belongs behind an
authenticated handle in a DO / D1 / KV / R2, or travels in integrity-protected `requestState`.
Server-initiated requests are replaced by `input_required` + client retry; standalone GET streams
are replaced by a `subscriptions/listen` POST that returns an SSE body.

---

## 2. Approach comparison

### A. Agents SDK stateless handler — `createMcpHandler` ✅ recommended

```ts
import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

function createServer() {
  const server = new McpServer({ name: "prism-mcp-server", version: "1.0.0" });
  server.registerTool("get_component_doc", {
    description: "Full Prism documentation for one component.",
    inputSchema: { component: z.string().describe("e.g. 'Button'") },
  }, async ({ component }) => ({
    content: [{ type: "text", text: docs.components[component] ?? notFound(component) }],
  }));
  return server;
}

export default {
  async fetch(request, env, ctx) {
    return createMcpHandler(createServer, {
      route: "/mcp",
      allowedHostnames: ["prism.nanisoft.com"],
      corsOptions: false,
    })(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
```

Reference implementation: [`cloudflare/agents/examples/mcp-worker`](https://github.com/cloudflare/agents/tree/main/examples/mcp-worker)
(no Durable Objects, each request independent).

Options that matter: `route` (default `/mcp`), `corsOptions` (wildcard by default — **`false` to
disable**), `allowedHostnames` (default is **localhost + `*.workers.dev` only** — you must add
`prism.nanisoft.com` for a custom domain), `allowedOriginHostnames`, `responseMode`
(`"auto" | "json" | "sse"`), `legacy: "stateless" | "reject"`.

**Pros:** supported path; no DO cost or DO lifecycle; horizontally trivial; built-in Origin
validation, CORS, host allowlisting, protocol-version handling; free on Workers (no DO requests).
**Cons:** no sessions, no server→client pushed requests (sampling/roots/elicitation push), no SSE
resumability/replay, and per-request server construction.

**Why the cons don't apply to Prism:** a docs MCP server is a pure read of an immutable in-isolate
blob. Every tool call is independent and idempotent; there is nothing to carry across requests.
This is the cheapest possible shape.

### B. `McpAgent` (Agents SDK + Durable Objects) — ❌ deprecated

The 2025 canonical answer: a Durable Object per session, `MyMCP.serve("/mcp")`, SSE + Streamable
HTTP, WebSocket hibernation, `props`-based auth. Still runs, still supports the sessionful
features (transport state, event replay, pushed elicitation/sampling/roots, HTTP DELETE session
deletion) — but Cloudflare's words are *"deprecated and feature-frozen … migrate ASAP"* with no
removal date. It also forces you into a DO (billed, stateful, harder to reason about) for zero
benefit on a read-only server. **Not recommended for new work.** If you inherit one, the
`isLegacyRequest()` router in §3 lets it coexist with a new stateless route while sessions drain.

### C. `workers-mcp` — ❌ superseded

`npm i workers-mcp` + `npx workers-mcp setup`. You extend `WorkerEntrypoint` and ordinary
TypeScript methods become tools; a **local Node proxy** speaks stdio and calls your *deployed*
Worker. Not archived, but its own README now redirects you to build a remote MCP server. Extra
strikes: it requires a deployed Worker to function (no true offline local loop), the
method-signature → tool-schema inference loses the rich `description()` metadata MCP wants, and
it's stdio-proxy-shaped, so it doesn't give you a genuine remote endpoint. **Skip.**

### D. Hand-rolled Streamable HTTP — ⚠️ possible, not worth it

The wire format is simple (§6): one endpoint, POST for messages, optional GET for a server→client
SSE stream, optional `Mcp-Session-Id`, `MCP-Protocol-Version` header, `Accept` negotiation of
`application/json` + `text/event-stream`, `202` for notifications/responses, `405` when no
server-initiated stream is offered. You *can* write this on a bare Worker. But you'd be re-owning
Origin validation (a spec MUST — DNS-rebinding protection), content negotiation, JSON-vs-SSE
response selection, protocol-version fallback to `2025-03-26`, and CORS. `createMcpHandler` does
all of it. Only reach for this if you refuse the `agents` dependency.

### E. Side note — the RPC transport

Cloudflare also documents an **RPC transport**: JSON-RPC over Service/RPC bindings, for
agent-to-server calls *inside* Cloudflare (even same-Worker). Fastest, no HTTP endpoints, no
auth support. Irrelevant to Prism's public docs server, but useful later if a NaniSoft Worker wants
to call the Prism MCP server directly without a network hop.

---

## 3. Dual transport from one implementation

This is the part with a clean answer, and it's why the *factory* shape matters.

**The `McpServer` is transport-agnostic.** v2 exports `StdioServerTransport` from
`@modelcontextprotocol/server/stdio`; you `await server.connect(transport)` with either a stdio or
a Streamable HTTP transport. So the tool surface is written exactly once:

```ts
// packages/prism-mcp-server/src/core.ts — pure, no I/O, transport-agnostic
export function createPrismMcpServer(docs: PrismDocsData): McpServer {
  const server = new McpServer({ name: "prism-mcp-server", version: PKG_VERSION });
  // ...registerTool(...) against `docs` only
  return server;
}

// src/http.ts — the Worker lane
export default {
  async fetch(req, env, ctx) {
    return createMcpHandler(() => createPrismMcpServer(loadDocs(env)), {
      route: "/mcp",
      allowedHostnames: ["prism.nanisoft.com"],
    })(req, env, ctx);
  },
} satisfies ExportedHandler<Env>;

// src/stdio.ts — the local twin, `bin` entry
const server = createPrismMcpServer(loadBundledDocs());
await server.connect(new StdioServerTransport());
```

Three consequences:

1. **Do not fork tool logic.** The only per-transport code is ~15 lines of wiring.
2. **The stdio twin is optional, and arguably you shouldn't build it first.** `wrangler dev` gives
   you `http://localhost:8788/mcp`, the Inspector connects to it, and stdio-only clients get
   bridged with `npx mcp-remote <url>` — the pattern Cloudflare's own guide documents for Claude
   Desktop. So v1 can be HTTP-only with `mcp-remote` as the stdio shim.
3. **Still ship the stdio twin**, because plasma does and it's the only fully-offline option (a
   NaniSoft dev on a plane, or an agent that must not depend on the deployed site). It's cheap
   once `core.ts` is pure. Plasma's is stdio-only; Prism's is dual-lane from the same source.

### Running old and new clients side by side (only if needed)

```ts
import { isLegacyRequest } from "@modelcontextprotocol/server";
const stateless = createMcpHandler(createStatelessServer, { route: "/mcp", legacy: "reject" });
const legacy = MyLegacyMcpAgent.serve("/mcp");        // deprecated
export default { fetch: (req, env, ctx) =>
  isLegacyRequest(req) ? legacy.fetch(req, env, ctx) : stateless(req, env, ctx) };
```

`legacy: "reject"` is required — otherwise the stateless handler's built-in legacy-compatibility
lane consumes legacy requests first. Prism doesn't need this.

---

## 4. Serving docs content to tools

Two viable sources, both derived from `@nanisoft/prism-llms` output.

### (a) Build-time bundle — ✅ recommended for v1

Plasma's approach, and it's the right one: at build time, read `@nanisoft/prism-llms/dist/` and
emit a `data.json` that ships inside the Worker bundle. Per plasma's README: *"no runtime network
calls or file I/O required"* — the server loads it at startup and everything is served from
memory.

- **No cache to invalidate** — deploy *is* invalidation. Data is consistent with the deployed
  docs because both artifacts come from the same commit.
- **No subrequests, no cold-start I/O.** A tool call is a map lookup on an in-isolate object.
- **Size is a non-issue.** Workers' limit is now **64 MiB uncompressed**, and *"there is no
  compressed size limit"* — only the uncompressed bundle counts. Prism's per-component markdown
  will land in the tens-to-hundreds of KB.
- **The one real watch-item is the 1 s startup limit** (global scope must parse + execute within
  1 s, else error `10021`). Mitigate: keep the JSON lean, and build the component/prop/guideline
  lookup maps **lazily on first tool call** rather than at module scope (plasma builds its maps in
  the factory, which is fine — the factory runs per request, not at isolate boot).

### (b) Read static assets at request time

`assets.binding: "ASSETS"` exposes the site's own files to the Worker:

```ts
const res = await env.ASSETS.fetch(`https://assets.internal/docs/${component}.md`);
```

Only the **pathname** is used for matching (any hostname works), and it works even inside RPC
methods where no incoming request exists. Cloudflare caches assets globally with **tiered
caching** — the first request pulls from storage, afterwards the nearest colo serves it, and a
colo without the asset pulls from a nearby cache rather than origin. So it's cheap, but it's still
an extra hop per tool call, it couples MCP availability to the asset deployment, and it applies
`html_handling` / `not_found_handling` to the response (a missing file can come back as your HTML
404 page — check `res.status`).

**Recommendation: do (a) for the tool corpus, and *also* publish `llms.txt` /
`llms-full.txt` / per-component MD as static assets** at the site root for non-MCP agents
(ticket 16's "npx-fetchable / served at site root" consumption). Both are generated by
`prism-llms`, which is the single generator, so they can't diverge in *content* — they only
differ in packaging. This also gives you a free degradation path: an agent that can't speak MCP
can still `GET prism.nanisoft.com/llms.txt`.

**Anti-pattern to avoid:** fetching docs over the network from inside a tool (e.g. calling the
live site). That burns subrequests (50/request on Free), adds latency and failure modes, and
re-introduces drift.

---

## 5. Auth — options and a v1 stance

| Option | What it is | Org-only? | Cost | Verdict |
| --- | --- | --- | --- | --- |
| **No auth (public read-only)** | Serve docs to anyone; rely on host allowlist + CORS off | No | Zero | ✅ **v1** |
| **Cloudflare Access for SaaS (OIDC)** | Access is the MCP server's OIDC IdP; the Worker runs the auth-code flow against Access and receives an `access_token`; users must pass your Access policies | **Yes** | Zero Trust org + config | ✅ documented escalation |
| **`@cloudflare/workers-oauth-provider`** | Full OAuth 2.1 provider in the Worker: `/authorize`, `/token`, `/register`, consent UI, CSRF tokens, `__Host-` cookies, HMAC-approved-client registry, KV-backed state | Only as strict as your IdP | Real work + KV + a consent surface to secure | ⚠️ later, if third-party devs appear |
| **Access service tokens** | `CF-Access-Client-Id` / `CF-Access-Client-Secret` headers, machine-to-machine | Yes | Trivial | Good for CI/automation lanes |
| **MCP Portals** | Cloudflare-hosted gateway aggregating up to 80 MCP servers behind one Access-authenticated endpoint | Via portal policies | Config | Not needed for one server |

### Recommendation: v1 = unauthenticated, read-only, tightly scoped

1. **The content is already public.** The map states npm distribution is *"public under the
   `nanisoft` scope (org-internal in intent, public in availability)"*, and the docs site is
   public. An org-only wall on the MCP server protects nothing and only breaks the primary client
   (ticket 13: *"Claude Code sessions building NaniSoft apps"*), which wants zero-friction auth.
2. **The attack surface is nil.** Tools are pure reads over an immutable bundled blob. No writes,
   no user data, no quota worth abusing beyond ordinary Worker traffic.
3. **The handler gives you the free guards:** `allowedHostnames: ["prism.nanisoft.com"]`,
   `allowedOriginHostnames`, and `corsOptions: false`. Remember Cloudflare's own line —
   *"CORS response headers are not authentication"* — but for a public read-only corpus you aren't
   relying on them for auth, only for hygiene.
4. **Pre-write the escalation.** Ticket 13 should record: *when a Prism tool gains anything
   sensitive (org-internal examples, telemetry, write-back, per-user quota), put Cloudflare Access
   for SaaS in front as an OIDC IdP* using the documented path — create a SaaS app (OIDC) in
   Zero Trust, redirect URI `<worker>/callback`, then set `ACCESS_CLIENT_ID`, `ACCESS_CLIENT_SECRET`,
   `ACCESS_TOKEN_URL`, `ACCESS_AUTHORIZATION_URL`, `ACCESS_JWKS_URL`, `COOKIE_ENCRYPTION_KEY` as
   Worker secrets. Template: `cloudflare/ai/demos/remote-mcp-cf-access`. Downstream calls forward
   `Cf-Access-Jwt-Assertion` as `Cf-Access-Token`. Cloudflare's caveat: use the Access-issued
   credentials, *"do not use the OAuth values from your third-party identity provider."*
5. **Do not adopt `workers-oauth-provider` in v1.** It drags in a consent dialog, KV namespace,
   CSRF state, `__Host-` cookie handling and an HMAC registry — a genuine security surface — for
   zero benefit on a public read-only server. It's the right tool when third-party developers need
   to authorize against *their own* resources.

---

## 6. One Worker or two? → **One**

Cloudflare supports this directly and it's the cheaper, simpler answer.

- **Only one asset collection is allowed per Worker**, and an asset-matching request is served
  **without invoking Worker code at all** — so the site keeps its current cost/latency profile and
  the MCP route costs nothing extra.
- **Use the array form of `run_worker_first`** so *only* the MCP route invokes the Worker:

  ```jsonc
  "run_worker_first": ["/mcp", "/mcp/*"]
  ```

  Don't rely on `run_worker_first: false` + "unmatched paths fall through to the Worker" for
  `/mcp` — that's fragile (a stray file named `mcp` silently shadows your endpoint) and it makes
  the Worker the 404 handler for the whole site.
- `not_found_handling: "404-page"` for a Fumadocs static export (real paths per doc page — this is
  not an SPA; don't use `"single-page-application"`).
- Only one asset collection per Worker, and `serve_directly` is no longer documented as a config
  key in the current Wrangler configuration reference — don't set it.
- `run_worker_first: true` interacts with **Smart Placement** (all requests hit the Worker first,
  potentially higher asset latency). Scoping it to `/mcp` avoids that entirely.

**When two Workers would be right:** independent deploy cadence or blast radius; the MCP server
needing bindings the site must not hold (KV/DO for OAuth state); different custom domains. None
apply yet. **Mitigate the coupling in code:** put the MCP lane in its own module
(`apps/site/src/worker/mcp.ts`) with the tool logic in `@nanisoft/prism-mcp-server`, so splitting
into `mcp.nanisoft.com` later is a `main` change plus a `wrangler.jsonc` edit — not a redesign.

---

## 7. Wrangler config sketch

```jsonc
// apps/site/wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "prism-site",
  "main": "src/worker/index.ts",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],   // for the stdio twin's Node deps in the same toolchain

  // ── static site ────────────────────────────────────────────────────────────
  "assets": {
    "directory": "./dist/client",
    "binding": "ASSETS",                      // lets the Worker read generated MD if it wants
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page",
    "run_worker_first": ["/mcp", "/mcp/*"]    // ONLY the MCP route invokes the Worker
  },

  // ── routing ────────────────────────────────────────────────────────────────
  "routes": [{ "pattern": "prism.nanisoft.com", "custom_domain": true }],
  "preview_urls": false,

  // ── operations ─────────────────────────────────────────────────────────────
  "observability": { "enabled": true },
  "vars": { "MCP_ROUTE": "/mcp", "MCP_SERVER_NAME": "prism-mcp-server" }

  // v1: no kv_namespaces, no durable_objects, no secrets.
  // Add "kv_namespaces":[{"binding":"OAUTH_KV","id":"..."}] + the ACCESS_* secrets
  // only when the Access-for-SaaS lane is switched on (see §5).
}
```

```ts
// apps/site/src/worker/index.ts
import { createMcpHandler } from "agents/mcp/server";
import { createPrismMcpServer } from "@nanisoft/prism-mcp-server/http";

const handler = createMcpHandler(
  () => createPrismMcpServer(BUNDLED_DOCS),   // factory — a fresh server per request
  {
    route: "/mcp",
    allowedHostnames: ["prism.nanisoft.com"], // default is localhost + workers.dev ONLY
    allowedOriginHostnames: ["prism.nanisoft.com"],
    corsOptions: false,                       // no browser client in v1
    responseMode: "json",                     // docs tools are small; skip SSE framing
    legacy: "reject",
  },
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") return handler(request, env, ctx);
    return env.ASSETS.fetch(request);         // reached only for non-asset paths
  },
} satisfies ExportedHandler<Env>;
```

### Local dev + deploy loop

```bash
pnpm --filter @nanisoft/prism-llms build        # generate llms.txt + per-component MD
pnpm --filter @nanisoft/prism-mcp-server build  # bundle docs → data.json
pnpm --filter site dev                           # wrangler dev → http://localhost:8788/mcp
npx @modelcontextprotocol/inspector@latest       # connect to http://localhost:8788/mcp
npx wrangler deploy                              # assets + Worker in one operation

# stdio-only clients (Claude Desktop etc.) — no separate server needed:
#   { "command": "npx", "args": ["mcp-remote", "http://localhost:8788/mcp"] }
# or the fully-offline twin: npx @nanisoft/prism-mcp-server
```

**Gotcha:** never `export default createMcpHandler(...)` — Wrangler interprets a *function* default
export as a `WorkerEntrypoint` class. Always export an object with a `fetch` method. Also don't
construct the server eagerly and pass the instance; `createMcpHandler` wants the factory itself
(sync or async; it may receive `McpRequestContext` with `era`, `authInfo`, `requestInfo`).

---

## 8. plasma's `plasma-mcp-server` — comparison (feeds ticket 13)

`@coveord/plasma-mcp-server` lives at `packages/mcp-server` in `coveo/plasma` (default branch
`master`).

**Tool surface — 6 tools:**

| Tool | Input | Returns |
| --- | --- | --- |
| `list_components` | — | all documented Plasma component names |
| `get_component_doc` | component | full Markdown: props, sub-components, design guidelines |
| `get_component_props` | component | props table only |
| `search_docs` | free-text query | top matching excerpts across docs + content guidelines |
| `list_content_guidelines` | — | all documented content guidelines |
| `get_content_guideline` | guideline | full Markdown (voice, mechanics, vocabulary, audience) |

**Architecture — the parts worth copying:**

- **Docs bundled at build time** from `@coveord/plasma-llms/dist/` into `dist/data.json`, loaded at
  startup. *"No runtime network calls or file I/O required."* One generator, zero drift.
- **`createServer(data: LlmsData)` is a pure factory** — data injected, lookup maps
  (`componentMap`, `guidelineMap`) built inside it, helper modules (`searchDocs`,
  `getComponentDoc`) operate on in-memory data only. This is exactly the shape that makes dual
  transport trivial.
- **`v.pipe(v.string(), v.description(...))` on every schema field** so the LLM sees parameter
  descriptions. v2 uses **Standard Schema**, so Valibot/Zod v4/ArkType all work
  (`ValibotJsonSchemaAdapter` in plasma's case).
- **Errors return text content with `isError: true`** rather than throwing — the LLM can read the
  failure and self-correct.

**Where Prism should differ:**

| Axis | plasma | Prism |
| --- | --- | --- |
| Transports | stdio only, `npx -y @coveord/plasma-mcp-server` | **Streamable HTTP on Workers + stdio twin**, one `core.ts` |
| Scope | components + content guidelines | components **+ blocks + pages** (Prism's taxonomy) **+ theme tokens** |
| Base-library content | Serves only Plasma-specific content; pairs with `@mantine/mcp-server` for the base | Same discipline: Prism-specific deltas only; **do not re-serve antd's API reference** — the antd MCP / `ant-design` skills already cover that (dedupe is ticket 13's explicit question) |
| Token access | none | `get_theme_tokens` is a genuinely additive tool given Prism's multi-brand `createPrismTheme()` |
| Fallback | `@coveord/plasma-llms` is the documented fallback when MCP is unavailable | `llms.txt` + static MD at the site root, same role |

plasma's positioning line is a useful north star for ticket 13: the MCP server is the
*authoritative on-demand* source; the static LLM docs are the *fallback*. Keep `search_docs` +
`list_*` + `get_*` coarse — Cloudflare's own tool-design guidance agrees: *"build tools that are
optimized for specific user goals"* and *"fewer, well-designed tools often outperform many
granular ones."* Six to eight tools is the right neighbourhood; don't mirror the docs IA one tool
per page.

---

## 9. Risks, gotchas, and things that will bite

1. **Stale tutorials are the main hazard.** Anything from 2025 (blog posts, YouTube, `McpAgent`
   scaffolds) shows the deprecated path. Cloudflare's own remote-MCP guide still offers
   "Deploy to Workers" buttons pointing at `remote-mcp-authless` / `remote-mcp-github-oauth`
   templates that use the deprecated `McpAgent` — the page itself says *"Start with the
   `mcp-worker` example."*
2. **Function default export trap** → Wrangler treats it as a `WorkerEntrypoint` class.
3. **Custom domains need an explicit `allowedHostnames`.** The default allowlist is localhost +
   `workers.dev`; a `prism.nanisoft.com` deployment 403s without it.
4. **Rejected v1 options.** `transport`, `storage`, `sessionIdGenerator`, `eventStore`,
   `enableJsonResponse` throw on the new handler. Use `responseMode: "json"` instead of
   `enableJsonResponse`. Passing an SDK v1 server still works but warns as deprecated.
5. **CORS is wildcard by default.** Set `corsOptions: false` unless a browser client needs it.
6. **`isolate`-local notifications.** If you use `notify.toolsChanged()` or `subscriptions/listen`,
   build the handler once at module scope — a new instance can't reach streams owned by an earlier
   one. Prism v1 doesn't need this.
7. **1 s startup limit.** Don't parse a large docs blob at module top level; build indexes lazily.
8. **50 subrequests/request on Free.** Another reason not to fetch docs over the network per tool
   call.
9. **Ecosystem lag.** Cloudflare notes that Code Mode helpers, `withX402`, and some OpenAI Apps
   examples still emit SDK v1 output — isolate them behind a temporary legacy route if adopted.
10. **Spec drift is real and fast.** The `2026-07-28` draft revision deprecates Roots, Sampling,
    Logging, HTTP+SSE, and Dynamic Client Registration. Pin exact package versions (the docs
    insist: *"use the exact MCP versions required by your installed Agents release"*) and re-check
    at implementation time.

---

## Sources

**Cloudflare Agents / MCP (primary)**
- https://developers.cloudflare.com/agents/model-context-protocol/ — remote vs local, best practices
- https://developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/ — build + deploy guide, deprecation warning, `mcp-remote`
- https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/ — `createMcpHandler` / `createLegacyMcpHandler` reference, options table, versions
- https://developers.cloudflare.com/agents/model-context-protocol/guides/migrate-to-mcp-sdk-v2/ — v2 migration, packages, deprecations, `isLegacyRequest()`
- https://developers.cloudflare.com/agents/model-context-protocol/protocol/transport/ — Streamable HTTP vs SSE vs RPC
- https://developers.cloudflare.com/agents/model-context-protocol/guides/securing-mcp-server/ — OAuth 2.1 proxy, consent hardening checklist
- https://developers.cloudflare.com/agents/llms.txt — section index

**Cloudflare Access (auth)**
- https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/secure-mcp-servers/ — Access for SaaS as MCP IdP, secrets table, API example
- https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/ — MCP Portals, service tokens, org-scoped policies

**Cloudflare Workers (platform)**
- https://developers.cloudflare.com/workers/static-assets/ — assets config, `env.ASSETS.fetch`, routing, tiered caching
- https://developers.cloudflare.com/workers/static-assets/binding/ — ASSETS binding semantics
- https://developers.cloudflare.com/workers/wrangler/configuration/#assets — `run_worker_first` array + negation, `html_handling`, `not_found_handling`
- https://developers.cloudflare.com/workers/platform/limits/ — 64 MiB uncompressed, 1 s startup, 50/10k subrequests, 128 MB

**MCP spec + SDK (primary)**
- https://modelcontextprotocol.io/specification/2025-06-18/basic/transports — Streamable HTTP MUSTs, `Mcp-Session-Id`, `MCP-Protocol-Version`, Origin validation
- https://github.com/cloudflare/agents/tree/main/examples/mcp-worker — reference stateless Worker
- https://github.com/cloudflare/workers-mcp — superseded; README redirects to remote MCP
- https://github.com/modelcontextprotocol/typescript-sdk — v2 packages, `StdioServerTransport` at `@modelcontextprotocol/server/stdio`
- https://registry.npmjs.org/agents — 0.23.0
- https://registry.npmjs.org/@modelcontextprotocol/server — 2.0.0 (2026-07-27)
- https://registry.npmjs.org/@modelcontextprotocol/sdk — 1.30.0

**plasma (comparison)**
- https://github.com/coveo/plasma — repo, `packages/mcp-server`
- https://raw.githubusercontent.com/coveo/plasma/master/packages/mcp-server/README.md — tool list, build-time data bundle
- https://raw.githubusercontent.com/coveo/plasma/master/packages/mcp-server/src/createServer.ts — factory shape, Valibot schemas, error pattern
