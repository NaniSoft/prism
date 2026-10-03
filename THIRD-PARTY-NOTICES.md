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

`@nanisoft/prism-ui` redistributes Inter, because its stylesheet ships the
`@font-face` rules that back the `--font-sans` token. The binaries are the four
static Latin subsets in `dist/fonts`: `inter-latin-400.woff2`,
`inter-latin-500.woff2`, `inter-latin-600.woff2` and
`inter-latin-400-italic.woff2`, together with the licence text as
`dist/fonts/Inter-OFL.txt`. Nothing else in these packages ships a font, and no
downstream site loads its own copy: `next/font` and every other font loader are
absent from the site as well as from the packages, because a site that loads its
own face stops rendering the face the library ships.

The four files are the Latin subset of the official Inter release 4.001 (see the
`name` table's unique identifier, `4.001;RSMS;...`). The three upright files are
the static instances that release publishes; the italic is the same release's
variable italic, instanced at weight 400 and subset to the same 230 codepoints
as its upright siblings, so the four files cover one character set.

Inter is licensed under the **SIL Open Font License, Version 1.1**; the license
text is committed at `packages/ui/public/fonts/Inter-OFL.txt` and ships beside
the binaries. Inter is copyright The Inter Project Authors (rsms.me/inter). The
Open Font License permits redistribution inside a package of this kind, and
requires the license to travel with the files, which is why it is in `dist/fonts`
rather than only in this notice.

## Build and development toolchain

TypeScript, Vitest, Turbo, pnpm, changesets, oxlint, Style Dictionary, publint
and Wrangler are development and build dependencies. They are not redistributed
with Prism artifacts and carry their own package licenses. Style Dictionary is
Apache-2.0; the rest ship their own license text with their packages.
