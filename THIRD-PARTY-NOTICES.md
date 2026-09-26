# Third-party notices

The Prism packages (`@nanisoft/prism-tokens`, `@nanisoft/prism-ui`,
`@nanisoft/prism-llms`, `@nanisoft/prism-mcp-server`) are MIT-licensed. See
[`LICENSE`](./LICENSE). This file covers the third-party works the packages and
the site depend on or redistribute. It is attribution, not a grant: each work
remains under its own license.

## Runtime dependencies

The direct runtime dependencies below are MIT-licensed unless noted. License
texts ship with their packages and are available from the corresponding npm
package or repository.

| Package | Used by | License |
| --- | --- | --- |
| `@base-ui/react` | `@nanisoft/prism-ui` (internal accessibility behaviour) | MIT, copyright the MUI Team and contributors |
| `@modelcontextprotocol/sdk` | `@nanisoft/prism-mcp-server` | MIT, copyright Anthropic, PBC and contributors |
| `zod` | `@nanisoft/prism-mcp-server` | MIT, copyright Colin McDonnell |
| `react`, `react-dom` | `@nanisoft/prism-ui` (peer), the site | MIT, copyright Meta Platforms, Inc. and affiliates |
| `next` | the site | MIT, copyright Vercel, Inc. |
| `fumadocs-core`, `fumadocs-mdx` | the site | MIT, copyright Fuma Nama |
| `agents` | the site (MCP transport) | MIT, copyright Cloudflare, Inc. |
| `class-variance-authority` | `@nanisoft/prism-ui` (internal variant recipes, not re-exported) | Apache-2.0 |
| `clsx` | `@nanisoft/prism-ui` (internal class composition) | MIT, copyright Luke Edwards |
| `tailwind-merge` | `@nanisoft/prism-ui` (internal class composition) | MIT |
| `lucide-react` | `@nanisoft/prism-ui` and the site (icons) | ISC, copyright the Lucide contributors, with portions copyright Cole Bemis 2013 to 2023 as part of Feather (MIT) |
| `tailwindcss` | `@nanisoft/prism-ui` and the site (internal build dependency) | MIT, copyright Tailwind Labs, Inc. |

Tailwind 4 is not a consumer dependency. It runs only in Prism's build, and its
compiled output is part of the component package's precompiled `styles.css`.

## Fonts

The documentation site self-hosts Inter under `apps/site/src/fonts/`, under the
**SIL Open Font License, Version 1.1**. The license text accompanies the
distributed font files. Inter is copyright The Inter Project Authors
(rsms.me/inter).

## Build and development toolchain

TypeScript, Vitest, Turbo, pnpm, changesets, oxlint, Style Dictionary, publint
and Wrangler are development and build dependencies. They are not redistributed
with Prism artifacts and carry their own package licenses. Style Dictionary is
Apache-2.0; the rest ship their own license text with their packages.
