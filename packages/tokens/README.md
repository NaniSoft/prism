# @nanisoft/prism-tokens

Prism's design tokens, authored in DTCG and compiled to shadcn-compatible CSS
custom properties and a Tailwind 4 `@theme` block.

The package is the foundation tier of the system. It knows no React and no
component, and nothing else in the repository is a runtime dependency of it.

## Install

```sh
pnpm add @nanisoft/prism-tokens
```

## What it ships

`pnpm --filter @nanisoft/prism-tokens build` emits into `dist/`:

```text
light.css                  :root { --background: ... } semantic tokens
dark.css                   .dark { --background: ... } semantic tokens
theme.css                  the @theme inline and @theme static blocks
index.js                   { semantic, foundation } as a JavaScript module
tokens.light.json          the resolved light semantic set
tokens.dark.json           the resolved dark semantic set
tokens.foundation.json     every foundation ramp and scale
themes.json                the pack manifest
themes/<id>/               per-pack light, dark, root CSS and resolved JSON
dtcg/**                    the one-way DTCG projection
```

Semantic token names are emitted verbatim, which is what makes the output a
drop-in replacement for a hand-written shadcn `globals.css`. The base theme is
`:root` and `.dark`; each pack is an attribute-agnostic
`[data-pack="<id>"]` / `[data-pack="<id>"].dark` selector so a subtree can
re-point the variables.

## Commands

```sh
pnpm --filter @nanisoft/prism-tokens build   # compile the tokens and run the gates
pnpm --filter @nanisoft/prism-tokens check   # contrast and emitted-contract gates
pnpm --filter @nanisoft/prism-tokens watch   # rebuild on change
```

## The source

`src/foundation/` holds the ramps and scales, `src/semantic/` the semantic sets,
and `src/themes/` the pack descriptors. The descriptors are the source of truth;
`.generated/` is staging for the expanded per-pack token files and is never
committed.

## License

MIT. See the repository [`LICENSE`](../../LICENSE). Third-party works are
attributed in [`THIRD-PARTY-NOTICES.md`](../../THIRD-PARTY-NOTICES.md).
