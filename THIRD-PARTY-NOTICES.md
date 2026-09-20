# Third-party notices

The Prism packages (`@nanisoft/prism-tokens`, `@nanisoft/prism-ui`,
`@nanisoft/prism-llms`, `@nanisoft/prism-mcp-server`) are MIT-licensed — see
[`LICENSE`](./LICENSE). This file covers the third-party works they and the
site (`apps/site`) depend on or redistribute. It is attribution, not a grant:
each work remains under its own license.

## Npm dependencies

All runtime dependencies below are licensed under the **MIT License**
(copyright their respective authors; license texts ship inside each package
and are viewable on npm):

| Package | Used by | License |
| --- | --- | --- |
| `antd` | `@nanisoft/prism-ui`, site | MIT — © Ant Group / Ant Design authors |
| `@ant-design/icons` | `@nanisoft/prism-ui` | MIT — © Ant Group / Ant Design authors |
| `@ant-design/nextjs-registry` | site | MIT — © Ant Group / Ant Design authors |
| `@ant-design/static-style-extract` | site | MIT — © Ant Group / Ant Design authors |
| `@modelcontextprotocol/server` | `@nanisoft/prism-mcp-server` | MIT — © Anthropic, PBC and contributors |
| `zod` | `@nanisoft/prism-mcp-server`, site | MIT — © Colinhacks |
| `react`, `react-dom` | `@nanisoft/prism-ui` (peer), site | MIT — © Meta Platforms, Inc. and affiliates |
| `next` | site | MIT — © Vercel, Inc. |
| `fumadocs-core`, `fumadocs-mdx` | site | MIT — © Fuma Nama |
| `agents` | site (MCP transport) | MIT — © Cloudflare, Inc. |
| `feed` | site (RSS) | MIT — © Xavier Damman / feed maintainers |

Development toolchain (TypeScript, Vitest, Turborepo, pnpm, changesets,
oxlint, stylelint, publint, wrangler) is MIT/Apache-2.0 per its packages and
is not distributed with any Prism artifact.

## Fonts

The site redistributes two font binaries (`apps/site/public/fonts/`), both
under the **SIL Open Font License, Version 1.1**. Per the OFL, the license
text accompanies the distributed files:

| Font | Files | License text |
| --- | --- | --- |
| Archivo (variable) | `apps/site/public/fonts/archivo-variable.woff2` | [apps/site/public/fonts/Archivo-OFL.txt](apps/site/public/fonts/Archivo-OFL.txt) — © The Archivo Project Authors (Omnibus-Type) |
| JetBrains Mono (variable) | `apps/site/public/fonts/jbmono-var.woff2` | [apps/site/public/fonts/JetBrainsMono-OFL.txt](apps/site/public/fonts/JetBrainsMono-OFL.txt) — © The JetBrains Mono Project Authors (JetBrains) |

Next.js additionally self-hosts latin subsets of the same two families via
`next/font/google` for the site's own text; they carry the same OFL 1.1
license.
