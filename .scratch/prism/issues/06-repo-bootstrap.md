---
Type: task
Status: claimed
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

<!-- what was done + resulting facts (URLs, locations, secret names) -->
