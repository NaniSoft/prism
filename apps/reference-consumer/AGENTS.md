# Reference consumer

The zero-CSS consumer: proof that one stylesheet, approved DS components and
packs are all a product needs.

## Stack

- Next 16 static export (`output: 'export'`) at the repo root, no workspace
- pnpm + TypeScript strict + oxlint + Vitest (jsdom + Testing Library)
- `@nanisoft/prism-ui` pinned exactly, installed from the monorepo workspace
  (`workspace:*`), vendored only through the published exports map

## Rules (inherited, not restated)

The laws are the failure messages of the gates in `@nanisoft/prism-ui/gates`,
run by `pnpm check`. This repository's own half is `prism-gates.json`, data
only: it withholds stylesheet-ownership and hidden-state sheets (`[]`, floors 0)
because this app owns none, declares the packs on `/assets`, and names the built
export as the only outDir. Read a failing law's text in the failing message
rather than looking for a restated rule here.

## Commands

- `pnpm dev`, `pnpm build` (→ `out/`), `pnpm lint`, `pnpm typecheck`, `pnpm test`
- `pnpm check` — the consumer gate kit; run after `pnpm build`, because it reads the built export
- Release certification: `pnpm --filter @nanisoft/reference-consumer build`
  then the repo-root `pnpm test:clean-consumer` (which packs tarballs and builds
  Vite + Next consumers outside the repo with no site chrome at all)
