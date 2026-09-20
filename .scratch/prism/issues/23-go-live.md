---
Type: task
Status: open
Labels: wayfinder:task
Blocked by: 18, 19, 20, 21, 22
---

## Question

The destination's last mile — flip every gate from rehearsal to real: license mechanicals, release pipeline, first npm publish, site live at prism.nanisoft.com. Nothing to decide; a checklist the map's destination resolves against.

## Inherited requirements

Deferred here by resolved tickets — execute in this order:

1. **License mechanicals** (from [Public packages license](17-public-packages-license.md)): five LICENSE files (four packages + root), `"license": "MIT"` in every `package.json` (currently `UNLICENSED`), `THIRD-PARTY-NOTICES.md` for third-party attribution, author/repository/homepage per package. Lands **before** the release swap.
2. **Swap `release-pr.yml`** from dry-run to real changeset publish.
3. **Merge the Version Packages PR** (open since the bootstrap).
4. **First npm publish** — the first release run also verifies the org-level GitHub secrets (`NPM_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), which are invisible to non-admin `gh secret list`.
5. **Site deploy live** at prism.nanisoft.com (ticket 21's Worker + custom domain already attached; deploy is the last manual run if CI doesn't follow the merge).
6. **Brand-policy page + site footer line** (ticket 17: brand protection lives in policy, never license clauses).
7. **OFL font licenses** (graduated from ticket 21's review): `public/fonts/*.woff2` redistribute Archivo/JetBrains Mono — OFL requires the licence text to accompany distribution; fold into `THIRD-PARTY-NOTICES.md` (item 1's pass).
8. **`.mcp.json` prism entry** (graduated from ticket 22): prism-mcp-server is real and live — add the HTTP entry (`type: "http"` + `url: https://prism.nanisoft.com/mcp`) per ticket 15's verified shape, and update `AGENTS.md`/`CLAUDE.md` MCP sections so both agree. Optional clean-up while there: a `built` field on prism-llms' store as the proper home for the MCP build-date stamp (currently mtime-stamped via `apps/site/scripts/stamp-mcp-data.mjs`).
