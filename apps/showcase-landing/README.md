# Landing showcase

The marketing half of the Meridian showcase: a fictional store operations
product whose entire site is composed from `@nanisoft/prism-ui` with one
stylesheet import, no stylesheet of its own and no JavaScript of its own.
Hosted at `prism.nanisoft.com/showcase/landing`, beside the
[console showcase](../showcase-admin) that runs the same fictional product's
back office.

## Run

```sh
pnpm install
pnpm dev            # http://localhost:3000/showcase/landing
pnpm build
pnpm check          # prism-gates against out/
```

Routes: `/` (hero, shops, features, figures, quotes, CTA), `/pricing` (plans,
comparison, questions), `/about` (statement, principles, team), `/contact`
(the ways in).

The export is mounted under `/showcase/landing`, so `next.config.ts` sets the
base path and `prism-gates.json` declares the same base path once per
route-derived gate. The site build copies `out/` into the documentation site's
export; see `apps/site/scripts/copy-showcase.mjs`.
