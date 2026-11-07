# Reference consumer

The zero-CSS proof: one import of `@nanisoft/prism-ui/styles.css`, approved
Blocks, Pages and DS components, packs and modes, and no stylesheet of its
own. This is the application future releases are certified against.

## Run

```sh
pnpm install
pnpm dev
pnpm build
pnpm check      # prism-gates against out/
```

Routes: `/` (marketing composition), `/dashboard` (enterprise DashboardPage),
`/assets` (every presentation under every pack).
