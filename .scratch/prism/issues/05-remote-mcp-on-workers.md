---
Type: research
Status: resolved
Labels: wayfinder:research, ready-for-agent
---

## Question

What is the current recommended pattern for a **remote MCP server on Cloudflare Workers** serving Prism docs — with org-appropriate auth and a stdio twin for local agents?

Cover:
- Patterns: Agents SDK (`agents/mcp` remote MCP endpoint) vs workers-mcp vs hand-rolled streamable-HTTP — the current Cloudflare recommendation and trade-offs, as of September 2026.
- Auth options for org-only access (no-auth-in-v1 vs Cloudflare Access vs token) — recommend a v1 stance.
- Serving docs content: tools backed by prism-llms output / fumadocs search; reading static assets from a Worker; caching.
- Dual transport: the same tool logic over stdio (local dev) and HTTP (remote) without forking implementations.
- Deploy + local dev loop with wrangler; how it coexists with the static site (one Worker with assets + MCP routes vs two Workers).
- How plasma's `plasma-mcp-server` toolset compares (feeds ticket 13).

Output: recommended architecture + a wrangler config sketch.

## Answer

Full findings: [`.scratch/prism/research/05-remote-mcp-on-workers.md`](../research/05-remote-mcp-on-workers.md).

- **`McpAgent` is deprecated and feature-frozen** (as of Agents SDK v0.20.0 / MCP TS SDK v2, `2026-07-28` spec revision). The current Cloudflare recommendation is a **stateless Streamable-HTTP handler**: `createMcpHandler(factory)` from `agents/mcp/server` over `@modelcontextprotocol/server@2.0.0`, with `agents@0.23.0`. Reference: `cloudflare/agents/examples/mcp-worker`. `workers-mcp` is superseded (its own README redirects to remote MCP); hand-rolling Streamable HTTP means re-owning Origin validation, content negotiation and protocol-versioning for no gain.
- **One Worker** serves both the site and MCP: `assets.directory` + `run_worker_first: ["/mcp", "/mcp/*"]` so only the MCP route invokes Worker code; everything else is served straight from Static Assets.
- **Docs content**: bundle `@nanisoft/prism-llms` output into the Worker at build time (plasma's approach) — no runtime I/O, no cache to invalidate, deploy *is* invalidation. Worker size limit is now 64 MiB uncompressed, so size is a non-issue; watch the 1 s startup limit and build indexes lazily. Also publish `llms.txt`/per-component MD as static assets for non-MCP agents.
- **Dual transport**: `McpServer` is transport-agnostic. Write tool logic once in a pure `createPrismMcpServer(docs)` factory; the HTTP lane wires it via `createMcpHandler`, the stdio twin via `StdioServerTransport` from `@modelcontextprotocol/server/stdio`. v1 can be HTTP-only with `npx mcp-remote` as the stdio shim.
- **Auth v1 = none** — public read-only docs (npm is public too, and the primary client is NaniSoft Claude Code sessions that want zero-friction auth). Scope it with `allowedHostnames: ["prism.nanisoft.com"]` + `corsOptions: false`. **Cloudflare Access for SaaS (OIDC)** is the documented org-only escalation — pre-write the flip in ticket 13 rather than adopting `@cloudflare/workers-oauth-provider` (consent UI, KV, CSRF surface) now.
- **Gotchas**: don't `export default createMcpHandler(...)` (Wrangler reads a function default export as a `WorkerEntrypoint`); custom domains need an explicit `allowedHostnames`; v1 options like `enableJsonResponse`/`sessionIdGenerator` are rejected. Ignore 2025 tutorials — they all show the deprecated path.
