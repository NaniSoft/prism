# Console showcase

The admin half of the Meridian showcase: a fictional store operations
product's back office, composed entirely from `@nanisoft/prism-ui` with one
stylesheet import, no stylesheet of its own and no JavaScript of its own.
Hosted at `prism.nanisoft.com/showcase/admin`, beside the
[landing showcase](../showcase-landing) that sells the same fictional product.

## Run

```sh
pnpm install
pnpm dev            # http://localhost:3000/showcase/admin
pnpm build
pnpm check          # prism-gates against out/
```

Routes: `/` (the morning page: figures, two charts, recent orders), `/orders`
(the ledger), `/products` (the shelf), `/customers` (the book), `/settings`
(three regions over the field specification).

The export is mounted under `/showcase/admin`, so `next.config.ts` sets the
base path and `prism-gates.json` declares the same base path once per
route-derived gate. The site build copies `out/` into the documentation site's
export; see `apps/site/scripts/copy-showcase.mjs`.
