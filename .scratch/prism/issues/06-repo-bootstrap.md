---
Type: task
Status: resolved
Labels: wayfinder:task, ready-for-agent
---

## Question

Nothing to decide — work that unblocks every build ticket: stand up the Prism monorepo skeleton and toolchain.

Do:
- `git init` in this repo; create `github.com/NaniSoft/prism`; push.
- pnpm workspace + Turborepo: `packages/tokens`, `packages/ui`, `packages/llms`, `packages/mcp-server`, `apps/site` — each a buildable hello-world.
- TypeScript strict, ESM-only build setup; oxlint + stylelint; Vitest + RTL scaffold with one trivial passing test.
- Changesets + GitHub Actions: PR checks; on main → changeset version PR (publish step wired but dry-run until the npm org exists).
- `.gitignore`, editor config, `AGENTS.md` stub pointing at the map.

## Answer

Monorepo stood up and pushed: **github.com/NaniSoft/prism** — created **private** (conservative default; flipping public later is trivial, the reverse isn't).

- **Workspace**: pnpm 11 + Turborepo 2. `packages/tokens`, `packages/ui`, `packages/llms`, `packages/mcp-server`, `apps/site` — all buildable hello-worlds, placeholders pointing at their map tickets. TS strict on **TypeScript 7** (native compiler); packages are ESM-only, no bundler, `exports` with `types` + `import` only (plasma recipe); `publint` as `prepublishOnly` in the three publishable packages. `apps/site` is Next ^16.3.5 static export (`out/`) that already imports from `prism-ui` — the one rule is exercised from day one.
- **Verification**: `pnpm lint` (oxlint per package via turbo + stylelint), `pnpm test` (Vitest 5, RTL + jsdom in prism-ui), `pnpm build` — all green locally; the initial-push **CI run succeeded on GitHub's runner**. Turbo tasks: `build` (depends `^build`), `test`, `lint`.
- **Changesets**: independent versioning, `access: public`, `updateInternalDependencies: patch`. Bootstrap changeset pending for all four packages (minor → 0.2.0). `pnpm run release:dry` (changeset status + publish `--dry-run` + publint) verified green. **Version Packages PR open**: https://github.com/NaniSoft/prism/pull/1. `cd.yml` is manual-only dry-run; go-live instructions (NPM_TOKEN + `changeset publish`) are written in its header, gated on ticket 07.
- **Known wrinkle**: the Changesets workflow couldn't open the version PR itself — new repos disallow Actions-created PRs by default, and neither REST nor GraphQL can set it (Settings UI only). Checkbox added to ticket 07; PR #1 was created manually to restore the intended state.
- **Beyond the ticket list**: `.gitattributes` (LF everywhere), `.npmrc` pinning a **project-local store** (two incidents: a corrupted global store — fixed by purge+refetch — and Next's nested pnpm spawn resolving a different store-dir and breaking the build; a repo-pinned store kills the whole class), `@types/node|react|react-dom` in the site, README stub.
- **Surfaced for the map**: packages carry `license: UNLICENSED` pending a license decision — npm refuses a real publish without one (now in map fog).
- Credentials/npm org/Cloudflare/DNS/Figma all still pending ticket 07 (human checklist).
