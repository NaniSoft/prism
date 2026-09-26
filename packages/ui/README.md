# @nanisoft/prism-ui

Prism's React component, block and page library. A consumer composes accessible,
themed React components and imports one stylesheet; it never writes, imports or
overrides a line of CSS.

## Install

```sh
pnpm add @nanisoft/prism-ui
```

`@nanisoft/prism-tokens` is a linked dependency and installs with it.

## Use

Import the one stylesheet once, in your app root:

```tsx
// app/layout.tsx
import '@nanisoft/prism-ui/styles.css'
import { PrismProvider, PrismThemeScript } from '@nanisoft/prism-ui/provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-pack="blush" className="dark" suppressHydrationWarning>
      <head>
        <PrismThemeScript />
      </head>
      <body>
        <PrismProvider defaultPack="blush" defaultMode="dark">{children}</PrismProvider>
      </body>
    </html>
  )
}
```

The provider is optional. The declarative axes are `data-pack` on `<html>` and
the `dark` class for mode, and a consumer with no client runtime can omit both
the provider and the first-paint script.

```tsx
import { Button } from '@nanisoft/prism-ui/components/button'
```

## The exports map

| Subpath | What it is |
| --- | --- |
| `.` | the curated barrel |
| `./provider` | `PrismProvider`, `usePrismTheme`, `PrismThemeScript` |
| `./components`, `./components/*` | every Component, or one |
| `./blocks`, `./blocks/*` | every Block, or one |
| `./pages`, `./pages/*` | every Page, or one |
| `./theming` | `PACKS`, `PackId`, `MODES`, `Mode`, `parseStoredTheme`, `themeAttributes` |
| `./catalog` | the checked catalogue, for tooling and docs |
| `./styles.css` | the one stylesheet a consumer imports |

Compound parts stay inside their parent module. Base UI and every internal path
are never a consumer import.

## Commands

```sh
pnpm --filter @nanisoft/prism-ui build       # tsc, the stylesheet, the registry and the gates
pnpm --filter @nanisoft/prism-ui check       # the registry and surface gates
pnpm --filter @nanisoft/prism-ui typecheck
```

## The registry

`registry.json`, `components.json`, `scripts/sync-registry.mjs` and
`scripts/validate-registry.mjs` are an internal integrity artifact, never a
public install lane. `components.json` carries `"style": "base-nova"` to satisfy
the shadcn config schema; the value is inert in this pipeline and no gate reads
it.

## License

MIT. See the repository [`LICENSE`](../../LICENSE). Third-party works are
attributed in [`THIRD-PARTY-NOTICES.md`](../../THIRD-PARTY-NOTICES.md).
