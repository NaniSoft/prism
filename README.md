# Prism

**One source of truth for NaniSoft products.** Prism is a design system: a DTCG
token pipeline, a React component library that downstream products compose
without writing or overriding a single style, and a machine-readable agent
surface. Install `@nanisoft/prism-ui`, import one stylesheet, and build with
Components, Blocks and Pages. Every token, style and animation is authored here
and reaches you through the packages.

## Install

```sh
pnpm add @nanisoft/prism-ui react react-dom
```

Import the one stylesheet in your app root and, if you want runtime switching,
mount the provider:

```tsx
import '@nanisoft/prism-ui/styles.css'
import { PrismProvider, PrismThemeScript } from '@nanisoft/prism-ui/provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-pack="blush"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <PrismThemeScript />
      </head>
      <body>
        <PrismProvider defaultPack="blush" defaultMode="dark">
          {children}
        </PrismProvider>
      </body>
    </html>
  )
}
```

You install no Tailwind, no PostCSS and no token plugin. `styles.css` is
self-sufficient: it carries the custom properties, the theme bindings, the
compiled utilities every component uses, and the base layer.

## The provider

The provider is optional. Without it, the two attributes on `<html>` apply and
everything works with no client runtime. With it, you get programmatic switching
and persistence:

```tsx
import { PrismProvider, usePrismTheme } from '@nanisoft/prism-ui/provider'

function ThemeControls() {
  const { pack, mode, setPack, toggleMode } = usePrismTheme()
  return (
    <button onClick={toggleMode}>
      {pack} {mode}
    </button>
  )
}
```

`PrismProvider` writes the same two attributes a declarative consumer writes and
carries pack and mode through context. It has no `overrides`, `tokens` or
`style` prop: there is no override path, because the system has exactly one
source of truth. When Prism lacks a component, token or variant, request it
upstream rather than merging one in locally.

## Theming

Theming is two independent axes, `data-pack` and `.dark`, plus the vocabulary
and pure helpers exported from `./theming`:

```tsx
import { PACKS, MODES, themeAttributes } from '@nanisoft/prism-ui/theming'

// Declarative: put the attributes on any element, and its subtree follows.
<div data-pack="mint" className="dark">{children}</div>

// Or let a server component render them.
themeAttributes({ pack: 'mint', mode: 'dark' })
```

The base pack is the absence of `data-pack`. A themed subtree states both axes,
and descendant scoping is supported, so a marketing page can show every pack at
once without writing CSS. `default` is expressed by omitting `data-pack`.

## Components, Blocks and Pages

The public surface is three layers, and every layer is an npm export:

- **Components** are focused, accessible, product-agnostic controls.
- **Blocks** are pre-composed sections that take their content as props and
  fetch nothing.
- **Pages** are complete screen models that receive application-owned navigation,
  content and data.

```tsx
import { Button } from '@nanisoft/prism-ui/components/button'
import { Card, CardHeader, CardTitle, CardContent } from '@nanisoft/prism-ui/components/card'
// Blocks and Pages import the same way, from ./blocks/* and ./pages/*.
```

The v1 roster is 28 Components, 10 Blocks and 4 Pages, 42 catalogue items. The
checked catalogue is the one list; this README states the contract, not the
list.

## The agent surface

Prism treats agents as first-class consumers, and the same checked catalogue
feeds the human site and the agent surface:

- `/llms.txt` is the compact catalogue and guide index.
- A `.md` mirror of every item page is served from the docs origin.
- A read-only MCP server answers catalogue, props, source, theme and search
  queries at `https://prism.nanisoft.com/mcp`:

  ```json
  {
    "mcpServers": {
      "prism": {
        "type": "http",
        "url": "https://prism.nanisoft.com/mcp"
      }
    }
  }
  ```

  The server exposes eight read-only tools: `list_items`, `get_item_doc`,
  `get_item_props`, `get_item_source`, `get_theme_doc`, `list_pages`, `get_page`
  and `search_docs`. A stdio-only client bridges with
  `npx mcp-remote https://prism.nanisoft.com/mcp`.

Generated code always imports from `@nanisoft/prism-ui`.

## Repository map

| Path | Package | Role |
| --- | --- | --- |
| `packages/tokens` | `@nanisoft/prism-tokens` | foundation and semantic tokens, packs, the CSS variable contract |
| `packages/ui` | `@nanisoft/prism-ui` | Components, Blocks, Pages, provider, and the one stylesheet |
| `packages/llms` | `@nanisoft/prism-llms` | generated corpus: `llms.txt`, Markdown mirrors, store |
| `packages/mcp-server` | `@nanisoft/prism-mcp-server` | read-only MCP tool logic |
| `apps/site` | `@nanisoft/site` | static docs site, landing page, themes, Worker |
| `scripts` | - | repository gates and release scripts |

The constitution lives at the root: `PRODUCT.md`, `CONTEXT.md`, `DESIGN.md`,
`AGENTS.md` and `CONTRIBUTING.md`.

## Status

The system is built. The four packages exist under their final names, the
component library ships the 42-item v1 catalogue, the docs site builds and
exports statically, and the quality-gate set runs in CI. The rebuild map at
`.scratch/prism-shadcn/map.md` is closed. `DESIGN.md` records the open items,
which are the cutover steps and the v1.1 roster tail rather than missing work.
The previous public system is archived at `github.com/NaniSoft/prism` and is not
the source of this system.

## Contributing

Prism is MIT-licensed. Read `CONTRIBUTING.md` before opening a pull request; it
states the contribution path, the acceptance criteria and the changeset
conventions. The vocabulary is in `CONTEXT.md`.
