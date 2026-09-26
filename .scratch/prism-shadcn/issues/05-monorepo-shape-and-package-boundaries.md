---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
---

# Monorepo shape and package boundaries

## Question

What does the repository look like, and what does each package own?

The answer fixes the file layout every later ticket writes into, so it goes
first. It has to settle:

1. **The workspace layout.** Whether `apps/*` stays in the glob alongside
   `packages/*`, or whether the site moves to `packages/site` as plasma does.
   plasma is flat `packages/*` with no `apps/`; the old Prism used
   `apps/site`; this repository uses `apps/docs`. Pick one and say why.
2. **The package set.** Four published names are settled:
   `@nanisoft/prism-tokens`, `-ui`, `-llms`, `-mcp-server`. Decide what the
   fifth member of the workspace is, if any, and where `packages/registry`
   goes. The strong candidate is that it dissolves into the component package
   and its scripts survive as internal gates, but that has never been stated.
3. **Boundaries.** For each package: what it owns, what it must not know about,
   and which direction dependencies point. In particular, whether the component
   package may depend on the token package (the old one did) and whether the
   agent-surface packages may depend on the component package or must be fed by
   build artifacts only.
4. **Public versus private.** Which packages publish, which do not, and the
   `private` flag on each. The site is private in every candidate arrangement.
5. **The `exports` map per package.** Subpath layout for the component package
   in particular: the old one exposed `.`, `./provider`, `./components`,
   `./components/*`, `./blocks`, `./blocks/*`, `./pages`, `./pages/*`,
   `./products`, `./theming`, `./catalog` and `./styles.css`. Decide the new
   one against the components to blocks to pages taxonomy, and say what a
   consumer is allowed to import and what is internal.
6. **Build tooling.** What each package's build produces, whether a bundler is
   involved or it is `tsc` plus asset copying, what `files` ships, and what
   `sideEffects` is set to. The old packages were ESM-only with no bundler;
   this repository has no library build at all today.
7. **Shared configuration.** Whether a `tsconfig.base.json` is introduced, what
   moves into it, and what stays per-package. Whether the current `pnpm -r` and
   `pnpm --filter` scripts in the root `package.json` become turbo tasks, and
   what the task graph is.
8. **Repository files that must exist.** `LICENSE`, `THIRD-PARTY-NOTICES.md`,
   `CODEOWNERS`, `CONTRIBUTING.md`, `AGENTS.md`, `README.md`, and the pull
   request template, at which paths, and which of them are decided in the
   governance ticket rather than here. Note that `CODEOWNERS` and
   `CONTRIBUTING.md` exist in neither the old repository nor this one, so for
   those two there is no prior art to adapt and plasma is the only reference.

Read the current root `package.json`, `pnpm-workspace.yaml`, both package
`tsconfig.json` files, `apps/docs/tsconfig.json` and `next.config.ts` before
answering. Consult `codebase-design` for the boundary question.

Context: coveo/plasma is the structural reference. Its mechanics worth copying
are a flat `packages/*` glob, a shared tsconfig base, independently versioned
packages, per-package README and CHANGELOG, and a `prepublishOnly` gate. Its
`llms` and `mcp-server` package pattern is inherited. Its Storybook site is
not.

## Answer

### 1. Layout: `apps/*` and `packages/*` both stay

plasma is flat because its docs site is a private package among peers. This
site is an application with a different lifecycle: static export, a Worker
deploy, no `files`, no `exports`, never published. Co-locating apps and
libraries under one glob is what makes "which of these publish?" a question
answered by hand every time. Publication status stays legible from the
directory.

Cost: one extra line in `pnpm-workspace.yaml`, and plasma parity lost on a
single axis. Accepted.

### 2. `packages/registry` becomes `packages/ui`. This is a rename, not a restructure

The package already **is** the component package under a placeholder name: its
`src` holds the components, its `exports` point at them, and its scripts
(`sync-registry.mjs`, `validate-registry.mjs`) are about those components. Only
its name and its public distribution model change.

Rejected: keeping it as a fifth private package whose interface is a JSON file.
By the deletion test that is a shallow module: delete the package and no
complexity reappears across callers, it moves one directory down, and the
repository inherits a second `exports` map to keep in sync with the first.
Also rejected: stripping it to registry artifacts only, which would separate a
package's implementation from its own integrity checks and put those checks
somewhere they will be forgotten.

The shadcn registry survives as an **internal artifact inside the component
package**: `registry.json`, `components.json`, `sync-registry.mjs`,
`validate-registry.mjs`. Never a public lane. `components.json` moves with it
and its `"style": "base-nova"` value is unverified; confirm what that
identifier means to the shadcn CLI before relying on it, and treat it as a
check rather than an assumption.

`@ds/registry` becomes `@nanisoft/prism-ui`. `apps/docs` becomes `apps/site`
and `@ds/docs` becomes `@nanisoft/site`, private.

### 3. Seams and dependency direction

```
site ──▶ ui ──▶ tokens
  ├──▶ llms
  └──▶ mcp-server
```

`llms` and `mcp-server` are leaves with no internal runtime dependency. Nothing
depends on `site`. `tokens` depends on nothing and knows no React, no Tailwind
and no component.

**The corpus extractor reads `prism-ui`'s emitted `.d.ts`, never its source.**
That keeps the seam at the interface: the corpus learns what the component
package promises, not how it is built. It is also why the old extractor had to
be compiler-API-free, and that constraint still holds. `prism-llms` keeps
`@nanisoft/prism-ui` and `@nanisoft/prism-mcp-server` as **devDependencies
only**, which is where the old package had them, with the store type declared
type-only so validation compiles without a runtime edge.

### 4. Build: `tsc` plus asset copying, no bundler

Today nothing emits: all three tsconfigs are `noEmit: true` and
`packages/tokens` has no tsconfig at all. That is the largest gap in this
ticket.

A consumer is a bundler already. Adding one here buys a single-file stylesheet,
which a build script concatenates more cheaply than a bundler is configured. The
old repository proved `tsc` plus asset copying works for this shape.

- `tsconfig.base.json` at the **repo root**, not under `packages/`, because the
  site extends it too. plasma places it in `packages/` precisely because it has
  no app.
- Shared options: `target ES2022`, `lib [dom, dom.iterable, esnext]`,
  `module esnext`, `moduleResolution bundler`, `strict`, `esModuleInterop`,
  `resolveJsonModule`, `isolatedModules`, `jsx react-jsx`, `skipLibCheck`.
  Each package extends it and adds only `include`, `outDir`, `declaration` and
  `declarationMap`.
- Drop `noEmit` from `ui` and `tokens`; add `declaration` and `declarationMap`.
  Keep `noEmit` in the site, since Next owns emit there.
- `packages/tokens` gets a tsconfig, which it currently lacks.
- Turbo tasks: `build` with `dependsOn: ["^build"]` and outputs `dist/**`;
  `check` depending on `build`, carrying the contrast gate, registry validation
  and corpus drift; plus `test`, `lint`, `typecheck`. That is the old
  repository's five-task set and it is the right size.
- **TypeScript stays on 5.7 stable.** The old repository ran `^7.0.2`, the
  native preview. Local tooling is written against 5.x and the corpus extractor
  is a structural scanner either way, so there is no forcing reason to move
  before 7 is stable. Revisit then, and record it when it happens.

**Two concrete defects this exposes, to fix as part of the move:**

The registry is currently consumed **two ways at once**: `transpilePackages:
['@ds/registry']` pointing the package `exports` at raw `.tsx`, and four `paths`
aliases in `apps/docs/tsconfig.json` reaching into
`../../packages/registry/src/...`. One source, two mechanisms. The site consumes
**the package interface only**; the `paths` aliases are deleted.

And `sideEffects` is set to `["*.css"]`, not `false`. A package that ships a
stylesheet must not advertise that its CSS is side-effect-free, or a bundler is
entitled to drop the import the consumer was told to make.

### 5. Root file set

Ticket 05 places these; ticket 14 writes them.

Present at the root: `LICENSE`, `THIRD-PARTY-NOTICES.md`, `CODEOWNERS`,
`CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `CONTEXT.md`,
`PRODUCT.md`, `DESIGN.md`, `turbo.json`, `tsconfig.base.json`, `.changeset/`,
`.github/`, `docs/`, `pnpm-workspace.yaml`, `package.json`, `.gitignore`,
`.npmrc`, `.editorconfig`.

All of those are missing today except `package.json`, `pnpm-workspace.yaml` and
`.gitignore`. `.editorconfig` is added, which the old repository had.
`CODEOWNERS` and `CONTRIBUTING.md` exist in neither repository, so for those two
plasma is the only reference.

The root `package.json` scripts collapse from the current `pnpm --filter` chains
into turbo passthroughs, one line per task. The `allowBuilds` map in
`pnpm-workspace.yaml` carries over unchanged and grows an entry only if a new
dependency needs a build script.

### 6. The exports map, decided here so ticket 07 does not decide it twice

`@nanisoft/prism-ui`, thirteen keys, the old shape minus the dead layer:

```
.                      the curated barrel
./provider             the provider and theme entry
./components           every component
./components/*         one component
./blocks               every block
./blocks/*             one block
./pages                every page
./pages/*              one page
./theming              createPrismTheme and the pack model
./catalog              the checked catalogue, for tooling and docs
./styles.css           the one stylesheet a consumer imports
./package.json
```

`./products` is **dropped**: it is a layer the components-to-blocks-to-pages
taxonomy does not have. Wildcards stay, because they let a consumer import one
item without pulling the barrel.

`./catalog` stays in `exports` because the site, the corpus and the MCP server
all read it, and a package cannot import through an interface it does not
expose. That it is documented as tooling-only rather than forbidden is a soft
rule, which is a real tension with the no-escape-hatch posture. **The semantic
question, not the structural one, belongs to ticket 07**: what a consumer may
do with what they import, whether any override path exists, and how the
prohibition is made checkable rather than aspirational.

The other three packages are simpler and are left to their own tickets:
`prism-tokens` exports `.`, `./css/*`, `./dist/*` and `./package.json`;
`prism-llms` and `prism-mcp-server` each export `.` plus the type or data entry
their consumers need.

### Handed to other tickets, deliberately

- Whether a consumer may supply theme overrides, and how "no escape hatches"
  is enforced rather than documented: **ticket 07**.
- The emitted format list and which token groups reach CSS: **ticket 06**.
- The catalogue's contents, the `kind` vocabulary and URL shape: **ticket 09**.
- Per-package test floors and whether the registry validator survives: **ticket
  15**, which now also carries the unverified `base-nova` check.
