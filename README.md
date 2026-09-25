# Prism

**One design language, many expressions.**

Prism is NaniSoft's agent-ready React design system. `@nanisoft/prism-ui`
ships an owned catalog of accessible components, pre-composed blocks, and
complete pages, styled by Prism's Spectral Refraction tokens. The same source
powers the human documentation, generated `llms.txt`, Markdown mirrors, and the
read-only Prism MCP at [prism.nanisoft.com](https://prism.nanisoft.com).

Base UI is an internal accessibility dependency of `prism-ui`. Consumers do
not install or import it.

## Install

```sh
pnpm add @nanisoft/prism-ui react react-dom
```

Import the stylesheet once, then wrap the app in a Prism provider:

```tsx
import '@nanisoft/prism-ui/styles.css';
import { PrismProvider, createPrismTheme } from '@nanisoft/prism-ui';

const theme = createPrismTheme({ pack: 'blue', mode: 'dark' });

export function App({ children }: { children: React.ReactNode }) {
  return <PrismProvider prismTheme={theme}>{children}</PrismProvider>;
}
```

The public catalog is organized as **components → blocks → pages**. The first
release contains 29 components, 9 blocks, and 5 pages. Apps assemble these
exports from npm; they do not copy Prism source or adopt another UI runtime.

## Themes

Five registered packs — **blue, green, lavender, rose, peach** — each ship in
light and beam-dark mode. A `PrismTheme` is frozen data containing resolved
primitives, semantic tokens, and CSS custom properties. The stylesheet and the
blocking site bootstrap keep mode changes flash-free.

```tsx
import { createPrismTheme, PrismProvider } from '@nanisoft/prism-ui';

const theme = createPrismTheme({ pack: 'lavender', mode: 'light' });

<PrismProvider prismTheme={theme}>
  <App />
</PrismProvider>;
```

## Agent surface

Prism treats agents as first-class consumers:

- [`llms.txt`](https://prism.nanisoft.com/llms.txt) is the compact catalog and
  guide index.
- Per-component, block, page, theme, and guide Markdown is served under
  [`/md/`](https://prism.nanisoft.com/md/).
- The public read-only MCP is available at
  `https://prism.nanisoft.com/mcp`; configure an HTTP MCP client with:

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

  Its eight tools cover catalog discovery, item docs, public props, copyable
  source, themes, guide pages, and corpus search. Generated code always imports
  from `@nanisoft/prism-ui`.

## Repository map

- `packages/tokens` — pure brand data, semantics, and CSS-variable themes
- `packages/ui` — owned components, blocks, pages, provider, and CSS
- `packages/llms` — deterministic corpus generation and drift checks
- `packages/mcp-server` — transport-free MCP tool logic
- `apps/site` — static docs, themes, demos, and Worker assets

Read [`AGENTS.md`](./AGENTS.md) before contributing. The active migration plan
is [`.scratch/prism-base-ui/map.md`](./.scratch/prism-base-ui/map.md); older
Ant Design research and ADRs remain as historical records, not current
implementation truth.
