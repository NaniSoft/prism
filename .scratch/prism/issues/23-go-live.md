---
Type: task
Status: resolved
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
9. **Config-hygiene sweep** (graduated from the tickets-21/22 whole-branch review, all comment/one-line sized): delete the dead `toCatalogGroups` + duplicate `CatalogGroup` in `apps/site/lib/to-prism-tree.ts`; add `app/antd-vars.css` + `lib/generated/**` to root `build.outputs` in `turbo.json` (only `worker/generated/**` is listed); document where the base `minimumReleaseAge` value comes from (`pnpm-workspace.yaml` has excludes but no base policy); comment the one-segment assumption on the `.md` globs in `apps/site/wrangler.jsonc` (router handles nested, globs don't cross `/`).

## Answer

**Destination reached 2026-09-20.** All nine items executed and verified; commits `d23e039` (go-live sweep) and `6a9cac2` (release-lane fix), plus Version Packages PR #1 merged (`e9cc4e9`) bumping all four packages to 0.2.0.

**Published and live:**

- **First npm publish**: `@nanisoft/prism-tokens@0.2.0`, `prism-ui@0.2.0`, `prism-llms@0.2.0`, `prism-mcp-server@0.2.0` — all four verified on the registry (HTTP 200, `license=MIT`, `repository.directory` correct, tarballs served). Release tags pushed.
- **License mechanicals**: root + four package `LICENSE`s (MIT, © 2026 NaniSoft), `"license": "MIT"` everywhere, author/homepage/repository per package, `THIRD-PARTY-NOTICES.md` covering all runtime deps (all MIT) and the two fonts.
- **OFL fonts**: `Archivo-OFL.txt` / `JetBrainsMono-OFL.txt` ship beside the `.woff2` files in `apps/site/public/fonts/` so the licence text accompanies distribution (verified served: 200).
- **Brand policy**: `/docs/brand` live (200), footer "Brand policy" link live; also mirrored at `/docs/brand.md` by prism-llms (the corpus's 7 invariants pass with 1 guide).
- **`.mcp.json` prism entry**: `{ "type": "http", "url": "https://prism.nanisoft.com/mcp" }` wired; `AGENTS.md` + `CLAUDE.md` MCP sections rewritten to the three-wired reality (antd, figma, prism) — they had also gone stale on figma, which was already in the file.
- **Site redeployed** (Worker `prism-site`, version `9a6a58be`): brand page, footer, OFL texts, `llms.txt` all verified live; `/mcp` still answering (405 on GET = POST-only, correct).
- **Hygiene sweep**: all four one-liners landed as specced.

**Live-learned gotchas (for the record):**

1. **The two workflow files carry swapped names**: `release-pr.yml` is *Changesets* (the version-PR lane, push-to-main) and `cd.yml` is the dry-run lane. The first swap attempt overwrote the version-PR workflow by filename and silenced the Changesets run on push — restored byte-for-byte, and the real publish landed in `cd.yml` where the dry-run lived.
2. **npm publish failure modes, diagnosed in order**: CI 404 on PUT = the secret token's account isn't a publish-capable member of the `nanisoft` org (npm hides scopes you can't publish to as 404, not 403); local 403 after `npm login` = npm's 2FA-on-publish rule; both fixed by one granular access token (packages read+write, 2FA bypass) from the org-owner account — used locally, and set as the org secret.
3. The token initially didn't take locally because the `.npmrc` key had a typo (`registry.npmjs.og`) — npm silently kept using the old session token.

**One open follow-up (user-side, org settings):** the CI publish lane ran green only as a *no-op* — its log still shows `No NPM_TOKEN or OIDC available`, so the org secret **still isn't injected into this private repo** (org secrets scoped "Public repositories" don't reach private repos). Fix: org Settings → Secrets and variables → Actions → `NPM_TOKEN` → visibility "All repositories" (or Selected including `prism`), or set it as a repo secret: `gh secret set NPM_TOKEN -R NaniSoft/prism`. Until then, releases publish manually (`pnpm build && pnpm release` locally); the first real CI release will be the true verification.

Ticket 14 (Figma execution) remains human-claimed and blocks nothing on the build route.
