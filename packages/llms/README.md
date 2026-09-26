# @nanisoft/prism-llms

Prism's agent-facing corpus. One build-fresh `dist/` is read three ways:

| Lane | Consumer | What it reads |
| --- | --- | --- |
| npm | a downstream tool | the published `dist/` |
| site | `@nanisoft/site` | a local build of `dist/` |
| MCP | `@nanisoft/prism-mcp-server` | the bundled `dist/data.json`, at build time only |

The generator is deterministic and `dist/` is never committed. The corpus is a
projection, not a source: it is assembled from the checked catalogue, the
hand-written MDX pages, the emitted `@nanisoft/prism-ui` declarations, the
verbatim demo source and the emitted token cascade. Nothing here is hand-edited.

## Commands

```sh
pnpm --filter @nanisoft/prism-llms build   # compile the library and emit the corpus
pnpm --filter @nanisoft/prism-llms check   # the eight-invariant drift gate
pnpm --filter @nanisoft/prism-llms test    # the Vitest floor
```

`build` writes the library with `tsc` and then the corpus with
`scripts/build.mjs`. `emit(outDir)` is exported so the drift gate can emit twice
into temporary directories and byte-compare. The gate never writes `dist/`.

## Output

The build writes exactly these paths into `dist/`:

```text
data.json
llms.txt
llms-full.txt
prism-skill.md
md/**
demo-graph.d.ts
demo-graph.js
extractor.d.ts
extractor.js
index.d.ts
index.js
markdown.d.ts
markdown.js
store.d.ts
store.js
```

`md/<section>/<slug>.md` is the per-item Markdown mirror for
`section` in `docs`, `foundations`, `content`, `components`, `blocks`, `pages`.
`data.json` is the `PrismDocsStore`; it is never copied into the site export and
is bundled into the Worker instead.

## The store

`PrismDocsStore` is declared in `src/store.ts` and exported from the package
root. `parsePrismDocsStore(raw: unknown)` is the one runtime guard; it narrows
structurally, validates `kind` through a local list tied to the catalogue's
closed union, and throws with the offending path. The MCP server inherits both
the type and the guard.

## The per-item spec

Each mirror is generated to one fixed shape: the H1, the catalogue description,
the import fence, the hand-written prose body, the demo, then a literal
`## Props` heading followed by a one-entry-per-line definition list (or
`## Composition` for a Block or a Page), with cross-references last. The
definition-list format is load-bearing: the MCP server's regular expression keys
on the literal `## Props` heading.

## The drift gate

`scripts/check.mjs` fails the build on any of eight invariants: coverage, the
demo contract, cross-references, descriptions, the store type round-trip, link
and mirror completeness, byte-for-byte determinism, and the README's declared
output list equalling the emitted set.
