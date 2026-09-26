# Migrating to Prism

> **Draft.** This note was drafted before the new major was published. Version
> numbers, install commands, deprecation lists and live URLs are provisional
> until the new packages are on npm and `prism.nanisoft.com` serves the new
> site. Nothing in it is installable yet. It lives in the repository root; at
> cutover the same document is published on the site.

## The short version

Prism was rebuilt from a fresh repository on a clean break. The four npm package
names are unchanged. What changed is the API, how styles reach an app, how a
pack and a mode are selected, and how components are consumed: as an npm library
you compose, not as source you copy.

Old lane (copy component source into your app):

```sh
npx shadcn add ...
```

New lane (install the library, import one stylesheet):

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
        <PrismProvider defaultPack="blush" defaultMode="dark">
          {children}
        </PrismProvider>
      </body>
    </html>
  )
}
```

```tsx
import { Button } from '@nanisoft/prism-ui/components/button'
```

A consumer with no client runtime can omit `PrismProvider` and `PrismThemeScript`
and keep only the `data-pack` attribute and the `dark` class on `<html>`.

## Packages

| Package | Role | Versioning |
| --- | --- | --- |
| `@nanisoft/prism-tokens` | foundation and semantic tokens, the CSS variable contract | linked with `prism-ui`: the two share a version |
| `@nanisoft/prism-ui` | Components, Blocks, Pages, the provider and the one `styles.css` | linked with `prism-tokens` |
| `@nanisoft/prism-llms` | generated `llms.txt`, the per-item Markdown mirror and the docs store | independent |
| `@nanisoft/prism-mcp-server` | the read-only MCP tool logic served from the site Worker at `/mcp` | independent |

The names are the same names the old Prism published. The placeholder `@ds/*`
names used inside this repository during the rebuild were never published and
never reached a consumer; they are now renamed to `@nanisoft/*`.

Last versions on npm before the rebuild (the versions that will be **deprecated,
not unpublished**, when the new major ships):

| Package | Last version before the rebuild |
| --- | --- |
| `@nanisoft/prism-tokens` | `0.3.0` |
| `@nanisoft/prism-ui` | `0.4.0` |
| `@nanisoft/prism-llms` | `0.4.0` |
| `@nanisoft/prism-mcp-server` | `0.3.0` |

The exact new version number is produced by the version pull request at publish
time. The policy is a major bump on the published lines, so the first installable
version of the new line is expected to be `1.0.0`. **Confirm the number at
publish.**

## There was a 1.0.0 that never shipped

The old repository's `main` carried four unconsumed changesets, one of them a
`major` for all four packages. Merged, they would have taken all four to
`1.0.0`. They were never consumed, the version was never bumped, and no `1.0.0`
was ever published. If the old repository's changelog or its unconsumed
changesets mention `1.0.0`, it does not exist on npm. The new major is the first
stable line that actually ships.

## API changes

| Old | New | Notes |
| --- | --- | --- |
| `createPrismTheme({ pack, mode })` returning a frozen theme object | removed | there is no theme factory |
| consumer-last per-key merge / overrides | removed | there is no override path; request a change upstream |
| `data-theme="<pack>"` on `<html>` | `data-pack="<pack>"` on `<html>` | the neutral base is the absence of `data-pack` |
| mode `beam-dark` | `class="dark"` | modes are `light` and `dark`; pack and mode are two independent axes |
| `@nanisoft/prism-ui/products` subpath | removed | the taxonomy is Component, Block, Page |
| `@nanisoft/prism-ui/provider` | kept, changed | now `PrismProvider`, `usePrismTheme`, `PrismThemeScript` |
| `@nanisoft/prism-ui/theming` | kept, changed | `PACKS`, `PackId`, `MODES`, `Mode`, `parseStoredTheme`, `themeAttributes`; no theme factory |
| `./components/*`, `./blocks/*`, `./pages/*`, `./catalog`, `./styles.css` | kept | compound parts stay inside their parent module, so there is no `card-header` subpath |
| internal registry copy (`shadcn add`, `components.json`, `public/r/**`) | not a public lane | the registry is an internal integrity artifact |

Other names that are retired as vocabulary: `primitive` (as a unit noun),
`colourway`, `variant` (as a unit noun), `pass-through`, `wrapper`, `agent door`.
A component that re-exports an internal dependency is still called a Component.

**Unknown:** this repository's rebuild map records only the subpaths above. The
full old exports map (for example, whether the old package exposed variant
recipes such as `buttonVariants`) is not recorded here. Confirm against the old
published package before relying on a mapping.

## Packs (the old theme identifiers)

Old pack identifiers: `blue`, `green`, `lavender`, `rose`, `peach`.

New pack identifiers: `default`, `blush`, `mint`, `lavender`, `sky`, `peach`.

`lavender` and `peach` survive by name. `default` is new as an explicit id: it is
the neutral base and is expressed by omitting `data-pack`. The mapping of the
remaining ids is **unconfirmed**: the new palette descriptions are "soft rose"
(Blush), "soft green" (Mint) and "soft blue" (Sky), which suggests `rose` ->
`blush`, `green` -> `mint` and `blue` -> `sky`, but no rebuild document records
that mapping, so choose from the new set rather than assuming a correspondence.

Old theme deep links (`#<old-pack>`) and old `data-theme` values are not
preserved.

## Copy-out versus the library

Under the old model you copied component source into your repository with the
shadcn CLI. Under the new model:

- Install `@nanisoft/prism-ui` (with its linked `@nanisoft/prism-tokens`) from
  npm.
- Import `@nanisoft/prism-ui/styles.css` once, in your app root layout.
- Import and compose Components, Blocks and Pages from their subpaths.
- Pass documented props, content and data, including the documented content and
  navigation slots.
- Choose a pack and a mode, declaratively on `<html>` or programmatically through
  `PrismProvider` and `usePrismTheme`.
- Use `className` for layout only, and write your own unrelated application CSS.

You may not copy, fork or wrap Prism source, override a Prism style, install or
configure Tailwind or PostCSS to reproduce Prism's utilities or tokens, import
Base UI from Prism (it is not exported), or import internal paths. A product that
needs Prism to change something requests the change upstream or contributes a
pull request.

## URLs

Preserved, because the path already matches the new shape: `/docs`,
`/components`, `/blocks`, `/pages`, `/themes`. These serve the new section index
at the same path.

Removed with no redirect:

- every old per-item URL (`/components/<old-slug>`, `/blocks/<old-slug>`,
  `/pages/<old-slug>`, `/docs/<old-guide-slug>`);
- every old per-theme deep link;
- `/blog` and `/rss.xml` (the blog never had a post).

The old per-item pages were machine-generated stubs with no prose, so there is
no per-item prose that was carried across.

## The agent surface

`llms.txt`, `llms-full.txt`, `prism-skill.md`, the per-item Markdown mirror at
`/<section>/<slug>.md`, and the MCP endpoint at `/mcp` are ported. The eight MCP
tools keep their names (`list_items`, `get_item_doc`, `get_item_props`,
`get_item_source`, `get_theme_doc`, `list_pages`, `get_page`, `search_docs`), but
their answers describe the new system. Two changes to be aware of:
`get_item_source` no longer takes an `example` argument, and `search_docs`
returns ranked references with matched fields rather than whole documents.

## What is not preserved

- Spectral Refraction, Archivo Variable with JetBrains Mono, and the `beam-dark`
  name.
- Ant Design re-exports (Ant Design is out of scope).
- The copy-out lane and the public shadcn registry.
- Old per-item URLs, `/blog`, `/rss.xml` and per-theme deep links.
- The old per-item documentation, which was machine-generated.

## Still to be confirmed at publish

Every item below is unknown in this draft and is filled in by the cutover:

- the exact version the version pull request produces;
- the confirmed old-to-new pack mapping;
- the exact deprecation list (which versions are deprecated) and its date;
- the live URL where this document is published on the site;
- whether any old published version exists beyond the four listed above.

## Confidence

This draft is written from the repository's rebuild map and its resolved tickets,
not from the live old repository or the registry. Facts about the old repository
(the four package names, the last published versions, the four unconsumed
changesets including the major for all four packages, the old pack identifiers,
the old subpaths) come from that research. Anything the map did not record is
marked unknown above rather than guessed.
