---
Type: grilling
Status: resolved
Labels: wayfinder:grilling, ready-for-human
Blocked by: 01, 05
---

## Question

What tools does `@nanisoft/prism-mcp-server` expose, and for whom?

- Tool set: search components/blocks/pages, get component API/usage, get theme tokens, get block/page source, search docs — which earn their place in v1, which wait.
- Primary client: Claude Code sessions building NaniSoft apps — optimize for that loop; remote access secondary.
- Schemas + naming; the relationship to (and deduplication with) the antd MCP and fumadocs' built-in MCP tools.
- Auth stance, using ticket 05's recommendation (org-only?).
- Docs data source: prism-llms output as the single backing store.

Output: tool spec (ADR) the MCP Worker is implemented against.

## Draft proposal

Drafted as `docs/adr/0004-mcp-tool-surface.md` (Status: **proposed** — flips to accepted on your call). Facts grounded in tickets 01/03/05, research 01/03/05, the `@ant-design/cli` MCP surface (7 `antd_*` tools + 2 prompts), and fumadocs-core's `registerSourceTools`/`registerSearchTool` contracts.

- **Eight read-only tools in v1**: `list_items(kind?)`, `get_item_doc(name)`, `get_item_props(name)`, `get_item_source(name, example?)`, `get_theme_doc(pack?, mode?)`, `list_pages()`, `get_page(url)`, `search_docs(query, kind?, limit?)`. All markdown-out, all stateless, all errors as `isError: true` + did-you-mean. "Get theme tokens" lands as a `get_theme_doc` **pass-through** over prism-llms theme MD (no structured token query — that hangs on ticket 09).
- **Deferred to v2**: structured `get_tokens`, faceted/tag/locale search, version-diff/migration tools, render/preview tools, MCP resources and prompts, and any write-back (write-back is the auth trigger, not a feature).
- **Dedup boundary is explicit and load-bearing**: antd's entire upstream surface (inherited props, demos, antd tokens, semantic DOM, changelog) delegates to the antd MCP — the per-item `> Extends: antd X` / `_No additional props beyond the antd base component._` line *is* the routing instruction. Fumadocs' three tool contracts are adopted (`list_pages`/`get_page`/search) but its machinery (loader, MDX, React, runtime search server) is not — and the static export must keep fumadocs' own `/api/mcp` un-generated so this stays the one endpoint.
- **Docs store = `PrismDocsStore`**, specified in the ADR as the contract ticket 16 must satisfy (it's downstream of this ticket, blocked by 12+13). One interface, each field consumed by exactly one tool; ticket 16 stays free to pick file layout/index shape/drift gate and project into it. Flagged in the ADR as pending 16.
- **Auth per ticket 05**: v1 none, `allowedHostnames: ['prism.nanisoft.com']`, `corsOptions: false`, `responseMode: 'json'`; Cloudflare Access-for-SaaS escalation pre-written (secrets list, wrapper-around-`createMcpHandler`, service tokens for CI); `workers-oauth-provider` explicitly not adopted.
- **Naming**: unprefixed plasma/Mantine-grammar names (`list_*` / `get_*_doc` / `get_*_props` / `search_docs`), on the grounds that MCP clients namespace by server and grammar transfer is worth more than a prefix.

### Decision points for the human

1. **Tool naming** — unprefixed grammar-transfer set (my recommendation) vs `prism_` prefix (antd chose `antd_*`; a prefix is unambiguous even in clients that flatten namespaces, at the cost of breaking the plasma/Mantine transfer grammar). *Recommend unprefixed.*
2. **`get_item_props` + `list_pages` in v1?** — the two cheapest-to-cut tools. `get_item_props` duplicates a section of `get_item_doc` (kept because the loop re-queries APIs and mirrors both plasma and antd); `list_pages` is only a slice of `llms.txt` (kept to mirror fumadocs). *Recommend keep both; cut both if you want a six-tool floor — nothing else depends on them.*
3. **`get_item_source` scope** — documented example TSX only (my recommendation, and it's the ticket's "get block/page source") vs also exposing prism-ui implementation internals. *Recommend examples only; internals leak and bloat context.*
4. **Theme tool shape** — `get_theme_doc` markdown pass-through now + structured `get_tokens` in v2 (my recommendation) vs structured tokens in v1. *Recommend pass-through; ticket 09 hasn't fixed the tiers, and a v1 structured tool would guess.*
5. **Search engine** — dependency-free term-frequency over the bundled corpus, capped at 5 (my recommendation, plasma's recipe) vs bundling a ZBSearch/orama index for ranking. *Recommend term-frequency; revisit when the corpus outgrows it.*
6. **MCP resources/prompts in v1** — tools only (my recommendation) vs a `prism://` resource per item and a `prism-expert` prompt. *Recommend tools only; uneven client support, and the static artefacts already serve that role.*
7. **Blessing `PrismDocsStore`** — the ADR fixes the interface ticket 16 must project into. If you'd rather 16 own the store shape and 13 consume whatever it emits, the ADR's §5 needs rewriting to a consumer's wish-list. *Recommend fixing the interface here, since 16 is blocked by 13.*

Suggested follow-ups (for those tickets, not this one): ticket 15 should ship the `.mcp.json` prism entry **plus** the pairing rule ("Prism for Prism behaviour, antd MCP for inherited props, always import from `@nanisoft/prism-ui`"); ticket 16 must emit `examples[].code` and the `antdBase` flag, which only the generator can know; ticket 12's `ComponentDemo` format must yield self-contained TSX per example or `get_item_source` has nothing honest to return.

## Answer

Resolved 2026-09-14 — human ratified the draft in full ("all four as recommended"). ADR-0004 status → **accepted**.

Adopted, per the draft's recommendations: the eight read-only v1 tools (`list_items`, `get_item_doc`, `get_item_props`, `get_item_source`, `get_theme_doc`, `list_pages`, `get_page`, `search_docs`) — `get_item_props` and `list_pages` stay; unprefixed tool names; `get_theme_doc` as markdown pass-through (structured `get_tokens` deferred to v2, pending ticket 09's tiers — now resolved); term-frequency search capped at 5; tools only, no resources/prompts in v1; `get_item_source` returns documented example TSX only; `PrismDocsStore` fixed here as the binding contract ticket 16 projects into; auth none in v1 per ticket 05 with the Cloudflare Access escalation pre-written.

Follow-ups owned by other tickets: ticket 16 must emit `examples[].code` and the `antdBase` flag; ticket 12's `ComponentDemo` format must yield self-contained TSX per example; the pairing rule + `.mcp.json` mechanics landed early via ticket 15 (done).

## Comments

### Re-ratification — 2026-09-14

The original resolution was a batch-level approval ("all four as recommended"); the audit pass put every decision point to the human individually. **All 7 confirmed, none reopened**: unprefixed tool names · `get_item_props` + `list_pages` stay (8-tool v1) · `get_item_source` returns documented example TSX only · `get_theme_doc` markdown pass-through — structured `get_tokens` stays v2 even though ticket 09's tiers now make it specifiable · term-frequency search capped at 5 · tools only, no resources/prompts · `PrismDocsStore` fixed in ADR-0004 §5.
