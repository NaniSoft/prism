# Third-party notices

The Prism packages (`@nanisoft/prism-tokens`, `@nanisoft/prism-ui`,
`@nanisoft/prism-llms`, `@nanisoft/prism-mcp-server`) are MIT-licensed — see
[`LICENSE`](./LICENSE). This file covers third-party works the packages and
site depend on or redistribute. It is attribution, not a grant: each work
remains under its own license.

## Npm dependencies

The direct runtime dependencies below are MIT-licensed unless noted. License
texts ship with their packages and are available from the corresponding npm
package or repository.

| Package | Used by | License |
| --- | --- | --- |
| `@base-ui/react` | `@nanisoft/prism-ui` (internal accessibility behavior) | MIT — © MUI Team and contributors |
| `@modelcontextprotocol/server` | `@nanisoft/prism-mcp-server` | MIT — © Anthropic, PBC and contributors |
| `zod` | `@nanisoft/prism-mcp-server`, site | MIT — © Colinhacks |
| `react`, `react-dom` | `@nanisoft/prism-ui` (peer), site | MIT — © Meta Platforms, Inc. and affiliates |
| `next` | site | MIT — © Vercel, Inc. |
| `fumadocs-core`, `fumadocs-mdx` | site | MIT — © Fuma Nama |
| `agents` | site (MCP transport) | MIT — © Cloudflare, Inc. |
| `feed` | site (RSS) | MIT — © Xavier Damman / feed maintainers |

Development toolchain (TypeScript, Vitest, Turborepo, pnpm, changesets,
oxlint, stylelint, publint, and wrangler) is not redistributed with Prism
artifacts and carries its own package licenses.

## Fonts

`@nanisoft/prism-ui` self-hosts two font binaries under
`packages/ui/assets/fonts/`, both under the **SIL Open Font License, Version
1.1**. The license text accompanies the distributed files:

| Font | Files | License text |
| --- | --- | --- |
| Archivo (variable) | `packages/ui/assets/fonts/archivo-variable.woff2` | `packages/ui/assets/fonts/Archivo-OFL.txt` — © The Archivo Project Authors (Omnibus-Type) |
| JetBrains Mono (variable) | `packages/ui/assets/fonts/jbmono-var.woff2` | `packages/ui/assets/fonts/JetBrainsMono-OFL.txt` — © The JetBrains Mono Project Authors (JetBrains) |

The site imports these assets through Prism's shipped stylesheet; it does not
introduce a second font pipeline.
