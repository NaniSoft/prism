# Landing showcase

The marketing half of the Meridian showcase: a fictional product site that
composes Blocks, DS components, packs and modes from `@nanisoft/prism-ui` and
owns neither a stylesheet nor a script.

## Stack

- Next 16 static export (`output: 'export'`) under the base path
  `/showcase/landing`, no workspace of its own
- pnpm + TypeScript strict + oxlint + Vitest (jsdom + Testing Library)
- `@nanisoft/prism-ui` installed from the monorepo workspace (`workspace:*`),
  vendored only through the published exports map

## Rules (inherited, not restated)

The laws are the failure messages of the gates in `@nanisoft/prism-ui/gates`,
run by `pnpm check`. This repository's own half is `prism-gates.json`, data
only: it withholds stylesheet-ownership and hidden-state sheets (`[]`, floors 0)
because this app owns none, declares the base path the export is hosted under,
and names the built export as the only outDir. Read a failing law's text in the
failing message rather than looking for a restated rule here.

## Commands

- `pnpm dev`, `pnpm build` (to `out/`), `pnpm lint`, `pnpm typecheck`, `pnpm test`
- `pnpm check` — the consumer gate kit; run after `pnpm build`, because it reads
  the built export
- The site's postbuild copies `out/` into `apps/site/out/showcase/landing/`, and
  the turbo task graph builds this app before the site's build so the copy is
  never stale
