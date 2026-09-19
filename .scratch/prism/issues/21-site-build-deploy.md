---
Type: task
Status: claimed
Labels: wayfinder:task
Blocked by: 19, 20
---

## Question

Build `apps/site` for real and deploy it: the IA + template spec (ticket 12's Answer), the Specimen landing page as a real prism-ui page (ticket 11), the flash-free dark-mode pre-bake (ticket 02), wrangler config + custom-domain attach (tickets 03/05/07), and the prism-llms artifact copy + `.md` prefix rewrite (ticket 16). Output: prism.nanisoft.com live.

## Inherited requirements

Deferred here by resolved tickets — execute with these in hand:

- **IA**: flat taxonomy URLs (`/docs`, `/components`, `/blocks`, `/pages`, `/blog`); four doc loaders + blog; sidebars = Prism group + antd's six categories; shell-level pack × mode switcher defaulting beam-dark blue; frontmatter = fumadocs defaults only.
- **Codegen emission** (from [Docs IA and demo format](12-docs-ia-and-demo-format.md)): the site's generate task emits thin stub MDX + `meta.json` from the category table; a component missing from the table fails CI. Full template for wrapped/blocks/pages: header → `Extends` pointer → when-to-use (only prose) → ComponentDemo sequence → generated API tables (via prism-llms' extractor) → prev/next + TOC.
- **ComponentDemo wire**: app-level `Demo` component reads co-located `demos/*.tsx` (self-contained contract); live preview + copy/expand bar.
- **Landing page**: rebuild `/` as a real prism-ui page in the **Specimen direction** — dark-first, antd-loud specimen hero; taxonomy as spatial progression bands; light mode as the "docs in daylight" peek. Variant A stand-in is live on `/`; the full set is preserved on branch `prototype/landing-variants` — raid it.
- **Dark mode**: ticket 02's recipe — explicit `cssVar.key` per theme (`hashed: false`), pre-baked variable sets via `@ant-design/static-style-extract`, inline class-swap.
- **Wrangler** (from [Fumadocs on Workers](03-fumadocs-on-workers.md) + [Remote MCP on Workers](05-remote-mcp-on-workers.md)): static assets dir, `not_found_handling`, `run_worker_first` for the five `.md` sections + `/mcp` + `/mcp/*`; the `.md` rewrite is ticket 16's one prefix rule (`/<section>/<slug>.md` → `/md/<section>/<slug>.md`); fumadocs' own `llms()`/`/api/mcp` stay un-generated; Custom Domain auto-creates DNS on attach.
