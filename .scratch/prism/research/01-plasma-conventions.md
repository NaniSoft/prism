# Research: coveo/plasma mechanical conventions

Resolves ticket `.scratch/prism/issues/01-plasma-conventions.md`.
Researched 2026-09-14 against the live `master` branch of `github.com/coveo/plasma`, its published npm packages, and `plasma.coveo.com`.

**Raw-file URL pattern used throughout:** `https://raw.githubusercontent.com/coveo/plasma/master/<path>` (equivalently `https://github.com/coveo/plasma/blob/master/<path>`). Default branch is **`master`**, not `main`.

**Headline correction to the ticket's framing:** plasma has **no `apps/` directory and no Next.js/Fumadocs docs site**. Its "docs site" (`plasma.coveo.com`) is **`packages/storybook` — Storybook 10 + Chromatic**. Also there is no "always import from plasma-mantine" lint rule: the invariant is enforced **mechanically by codegen** (see §8), not by a linter.

---

## 1. Monorepo layout

Source: https://raw.githubusercontent.com/coveo/plasma/master/pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
allowBuilds:
  aws-sdk: false
  core-js-pure: false
  esbuild: false
  unrs-resolver: false
minimumReleaseAge: 10080 # 7 days in minutes
minimumReleaseAgeExclude:
  - '@mantine/*'
  - turbo@2.9.14      # Renovate security update
  - vite@8.0.16
  - postcss@8.5.23
peerDependencyRules:
  ignoreMissing:
    - react-native
overrides:
  '@babel/traverse': ^7.23.2
  nwsapi: 2.2.24
strictPeerDependencies: false
saveExact: true
autoInstallPeers: false
patchedDependencies:
  '@monaco-editor/react@4.7.0': patches/@monaco-editor__react@4.7.0.patch
```

Seven packages, all flat under `packages/*`, **no `apps/*`**, plus a shared `packages/tsconfig-base.json`:

| Package | Purpose | Published? | Version (2026-09-14) |
| --- | --- | --- | --- |
| `@coveord/plasma-mantine` | main library — Mantine theme + components | yes | `61.2.0` |
| `@coveord/plasma-tokens` | design tokens (TS + SCSS + CSS + raw icon SVGs) | yes | `60.0.0` |
| `@coveord/plasma-react-icons` | icons as React components (generated) | yes | `60.0.0` |
| `@coveord/plasma-llms` | LLM docs artifact (`llms.txt` etc.) — **data-only** | yes | `60.2.1` |
| `@coveord/plasma-mcp-server` | MCP server over those docs | yes | `60.2.1` |
| `@coveord/plasma-storybook` | docs site | **`private: true`** | `60.0.2-next.2` |
| `@coveord/plasma-figma-code-connect` | Figma Code Connect | **`private: true`** | `60.0.2-next.2` |

`@coveord/plasma-style` and `@coveord/plasma-react` are **not in master** — they are in maintenance mode on a `v53` branch (AGENTS.md, README.md).

npm dist-tags for `@coveord/plasma-mantine` (https://registry.npmjs.org/@coveord%2Fplasma-mantine): `{ legacy: '53.1.4', alpha: '55.7.2-alpha.1', next: '61.0.0-next.2', latest: '61.2.0' }`, 354 versions. So `legacy`/`alpha`/`next`/`latest` tags are all actively used; `next` is driven by changesets `pre` mode.

### Root `package.json`

Source: https://raw.githubusercontent.com/coveo/plasma/master/package.json

- `"private": true`, `"type": "module"`, `version: 59.8.0` — note the root version has **drifted** from the packages (61.x). Changesets does not version a private root (`privatePackages.version: false`), so the root `version` field is dead weight. Prism should not treat root `version` as meaningful.
- `"packageManager": "pnpm@12.2.1+sha512.<hash>"` — pnpm pinned **with integrity hash** (corepack verifies it). Node 24 in CI.
- `"preinstall": "npx only-allow pnpm"` — hard-blocks npm/yarn.
- Scripts worth copying verbatim in shape: `build: turbo run build`, `start: turbo run build --filter=!@coveord/plasma-storybook && pnpm --recursive --parallel start`, `test: turbo run test --concurrency=1`, `clean: pnpm --recursive --parallel run clean`, `lintfix: pnpm --recursive --parallel lintfix`, `fmt: oxfmt` / `fmt:check: oxfmt --check`.
- Release scripts are thin aliases so workflows don't inline commands: `release:publish: changeset publish`, `release:pre:enter:next: changeset pre enter next`, `release:pre:exit: changeset pre exit`, `release:pre:publish:next: changeset publish`, `changeset:version: changeset version`, `changeset:new: node scripts/newChangeset.js`, `changeset:validate: node scripts/validateChangesets.js`.
- Root `lint-staged`: `**/*.{js,jsx,ts,tsx,mjs,json,md,yml,html}` → `oxfmt --write --no-error-on-unmatched-pattern`; `**/*.{scss,css}` → `stylelint --fix` then `oxfmt --write`. `.husky/pre-commit` is just `pnpm precommit`.

### Toolchain

Source: AGENTS.md — https://raw.githubusercontent.com/coveo/plasma/master/AGENTS.md

- **Build:** `tsgo` (the `@typescript/native-preview` TypeScript compiler) — **no bundler**.
- **Lint/format:** `oxlint` + `oxfmt` (explicitly *not* ESLint/Prettier), plus `stylelint-config-standard-scss`.
- **Test:** Vitest 5 + React Testing Library, run with `cross-env TZ=UTC`.
- Configs: https://raw.githubusercontent.com/coveo/plasma/master/.oxfmtrc.json (`printWidth: 120`, `tabWidth: 4`, `singleQuote: true`, `bracketSpacing: false`, ignore `CHANGELOG.md`, `**/dist`, `packages/react-icons/src/generated`, plus an `overrides` block setting `tabWidth: 2` for `pnpm-workspace.yaml`); https://raw.githubusercontent.com/coveo/plasma/master/oxlint.config.ts (`defineConfig({ plugins: [...], jsPlugins: ['eslint-plugin-testing-library', 'eslint-plugin-storybook'], options: { typeAware: true }, rules: {...} })`); https://raw.githubusercontent.com/coveo/plasma/master/.stylelintrc.

### turbo.json

Source: https://raw.githubusercontent.com/coveo/plasma/master/turbo.json

```json
{
    "$schema": "https://turborepo.org/schema.json",
    "remoteCache": {
        "teamSlug": "plasma",
        "apiUrl": "https://djcopdhbb4ijlio2hgabt64kjy0lxwet.lambda-url.us-east-1.on.aws"
    },
    "tasks": {
        "build": {
            "dependsOn": ["^build"],
            "outputs": ["dist/**", "storybook-static/**"],
            "outputLogs": "new-only",
            "env": ["CI", "PLASMA_BASE_URL"]
        },
        "test": {
            "dependsOn": ["^build"],
            "outputs": [],
            "inputs": ["$TURBO_DEFAULT$", "src/**/*.spec.*"],
            "outputLogs": "new-only"
        }
    }
}
```

Notables: remote cache is a **self-hosted AWS Lambda URL** (authenticated via `TURBO_TOKEN`, set as a workflow-level env in every workflow; `scripts/turboLogin.js` runs in a `pnpm:devPreinstall` hook). `env: ["CI", "PLASMA_BASE_URL"]` on `build` makes the base URL part of the hash — necessary because it gets baked into the generated `llms.txt`. `build` declares `outputs` so CI caches artifacts; `test` deliberately declares `outputs: []` but narrows `inputs` to spec files so tests don't re-run on doc-only edits.

Only one package overrides the graph — https://raw.githubusercontent.com/coveo/plasma/master/packages/react-icons/turbo.json:

```json
{
    "extends": ["//"],
    "tasks": {
        "build": { "dependsOn": ["^build", "generate"] },
        "generate": {
            "dependsOn": ["^build"],
            "outputs": ["src/generated/**"],
            "inputs": ["$TURBO_DEFAULT$", "bin/**"],
            "outputLogs": "new-only"
        }
    }
}
```

`"extends": ["//"]` means "inherit root, ignore nothing"; `generate` is a turbo task whose *output is checked-in source* (`src/generated/**`) derived from `bin/**`. That's the pattern for any generated-code package.

### ESM-only packaging

Source: https://raw.githubusercontent.com/coveo/plasma/master/packages/mantine/package.json and `packages/tsconfig-base.json`

- Every package: `"type": "module"`. No `main`, no `require` condition, no CJS output, no bundler, no `tsup`/`rollup`/`vite` for libraries.
- `exports` maps only `types` + `import` conditions. Subpath exports for every internally-reachable surface plus `./package.json`:

```json
"exports": {
    ".":                       { "import": "./dist/index.js" },
    "./plasmantine":           { "types": "./dist/theme.d.ts", "import": "./dist/theme.js" },
    "./core":                  { "types": "./dist/core.d.ts",  "import": "./dist/core.js" },
    "./hooks":                 { "types": "./dist/hooks.d.ts", "import": "./dist/hooks.js" },
    "./form":                  { "types": "./dist/form.d.ts",  "import": "./dist/form.js" },
    "./notifications":         { "types": "./dist/notifications.d.ts", "import": "./dist/notifications.js" },
    "./components/*":          { "types": "./dist/components/*/*.d.ts", "import": "./dist/components/*/*.js" },
    "./factory":               { "types": "./dist/factory.d.ts", "import": "./dist/factory.js" },
    "./context":               { "types": "./dist/context.d.ts", "import": "./dist/context.js" },
    "./package.json":          "./package.json"
}
```

- `"files": ["dist"]` (tokens also ships `icons`, `scss`, `css`), `"sideEffects": true` for mantine (it imports CSS), `"sideEffects": []` for the pure packages.
- `"prepublishOnly": "publint"` on every publishable package — the packaging linter runs before each publish.
- Shared TS base (https://raw.githubusercontent.com/coveo/plasma/master/packages/tsconfig-base.json): `module`/`moduleResolution: "nodenext"`, `target: esnext`, `jsx: react-jsx`, `declaration: true`, **`declarationMap: true`**, `sourceMap: true`, `inlineSources: true`, `strict: true`, and `${configDir}` placeholders so each package extends it without re-stating paths.
- The build is literally "emit TS + copy assets": https://raw.githubusercontent.com/coveo/plasma/master/scripts/build.js spawns `tsgo --project ./tsconfig.build.json`, then `globSync('src/**/*.{css,svg,json,png,jpg}')` and copies each into `dist/` preserving layout. `scripts/start.js` calls the same `build({watch: true})` with `fs.watch('src', {recursive: true})` for assets (comment notes recursive watch is macOS/Windows-only and acceptable because watch mode is dev-only, never CI).
- Internal deps use **`workspace:*`** exclusively (so changesets' `bumpVersionsWithWorkspaceProtocolOnly: true` works).

---

## 2. Changesets config, versioning, and release wiring

Source: https://raw.githubusercontent.com/coveo/plasma/master/.changeset/config.json

```json
{
    "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
    "changelog": ["./changelog.cjs", { "repo": "coveo/plasma" }],
    "commit": false,
    "fixed": [],
    "linked": [],
    "access": "public",
    "baseBranch": "master",
    "updateInternalDependencies": "patch",
    "bumpVersionsWithWorkspaceProtocolOnly": true,
    "privatePackages": { "version": false, "tag": false }
}
```

Key decisions, each with a reason:

- **`fixed: []` and `linked: []`** — packages are **not lockstep-versioned**. They are independently versioned and independently published; `plasma-mantine` is at 61.2.0 while `plasma-tokens` is at 60.0.0. Interdependency is handled by `updateInternalDependencies: "patch"`: bumping `plasma-mantine` automatically bumps the `workspace:*` ranges pointing at `plasma-tokens`/`plasma-react-icons` and emits a dependency-only changelog entry.
- **`bumpVersionsWithWorkspaceProtocolOnly: true`** — only `workspace:` ranges are rewritten, so third-party semver ranges are never touched.
- **`privatePackages: {version: false, tag: false}`** — `plasma-storybook` and `plasma-figma-code-connect` still get a `version` field bumped in source but are excluded from changelogs and never published. (Their versions do still move: both read `60.0.2-next.2`.)
- **`commit: false`** — the release PR action does the commit.
- **`access: public`** — required for scoped packages.

### Custom changelog generator

Source: https://raw.githubusercontent.com/coveo/plasma/master/.changeset/changelog.cjs

A CJS wrapper around `@changesets/changelog-github` that:
1. **Returns `''` for every release line while `.changeset/pre.json` has `mode: "pre"`** — so the `next` branch's prerelease publishes generate zero changelog noise, and the stable `CHANGELOG.md` only gets entries when the version is final.
2. Renders simple entries as `- Summary [#123](url)` (PR link from `@changesets/get-github-info`).
3. Supports **"rich" entries**: if the changeset body contains markdown headings, it renders as `#### Title [#PR](url)` + body, and **re-levels the body headings relatively** (`normalizeHeadings`) so the shallowest body heading becomes `h5` and always nests under the `h4` title, clamped at `h6`.
4. Delegates `getDependencyReleaseLine` to the stock generator.

This is the piece that makes the enforced "body headings start at a single `#`" rule safe.

### Three workflows, three jobs

Sources:
- https://raw.githubusercontent.com/coveo/plasma/master/.github/workflows/ci.yml
- https://raw.githubusercontent.com/coveo/plasma/master/.github/workflows/release-pr.yml
- https://raw.githubusercontent.com/coveo/plasma/master/.github/workflows/cd.yml
- Composite actions: `.github/actions/{setup,build,test,comment-on-pr,configure-git-ssh}/action.yml`

**`ci.yml`** (`on: pull_request`) — four parallel jobs:
1. `release-preview` — runs `node scripts/releasePreview.js`, captures stdout into `$GITHUB_OUTPUT` as a `message<<EOF` heredoc, and posts/updates a PR comment via a local composite action with `avoidRepostsWith: '<!-- changesets-release-preview -->'` and `updateExisting: 'true'` (so it never spams; it edits the existing comment, keyed on an HTML marker). Skipped on `changeset-release/*` branches.
2. `lint` — `pnpm lint` + `pnpm fmt:check` + **`pnpm changeset:validate`**.
3. `test` — `pnpm test -- --silent`.
4. `demo` — builds Storybook, **`cp -r ./packages/llms/dist/. ./packages/storybook/storybook-static/`**, deploys to Chromatic, and comments a per-branch preview URL (branch name slugified, lowercased, truncated to 37 chars — Chromatic's subdomain limit).

**`release-pr.yml`** (`on: push` to `master`) — the classic changesets "Version Packages" PR, via `step-security/changeset-action@v1.9.0` (a hardened fork of `changesets/action`) with `version: pnpm changeset:version`, `commit`/`title: 'chore(release): version packages'`, `commitMode: github-api`. Merging that PR is what stages the version bumps; it does **not** publish.

**`cd.yml`** (`on: workflow_dispatch` only — **manual**, gated to `master` or `next`, `environment: production`, `concurrency: group: github.ref_name`):
- Always: setup → build → lint → test.
- On `master`: `step-security/changeset-action` with `publish: pnpm release:publish`, `createGithubReleases: true`.
- On `next`: configure a git SSH deploy key → if `.changeset/pre.json` doesn't exist, `pnpm release:pre:enter:next` → `pnpm changeset:version` → commit `chore(release): version packages [skip ci]` and `git push deploy HEAD:next` → `changeset-action` with `publish: pnpm release:pre:publish:next`, `createGithubReleases: false`.
- Then: copy `packages/llms/dist/.` into `storybook-static/` and `chromaui/action` with `autoAcceptChanges: true`, `exitZeroOnChanges: true`, `branchName: github.ref_name`.

So the two-branch model is: **`master` = stable, `next` = changesets `pre` mode with `next` dist-tag**, and deploys are human-triggered rather than push-triggered.

### Release preview (the nicest bit)

Source: https://raw.githubusercontent.com/coveo/plasma/master/scripts/releasePreview.js

Wraps `pnpm exec changeset status --since=origin/master --verbose`, parses its ANSI-coloured stdout with regexes into `{type, name, nextVersion}` rows, filters out private packages (discovered via `pnpm list --recursive --depth -1 --json`), and emits a Markdown table grouped Patch/Minor/Major. When changes are detected but no changeset exists, it emits an explicit warning comment telling the author to run `pnpm changeset`. This gives every PR a "what would this publish?" answer without a human running anything.

### Changeset authoring is a validated, skill-supported format

- `pnpm changeset:new [major|minor|patch] [-p <pkg>]` (https://raw.githubusercontent.com/coveo/plasma/master/scripts/newChangeset.js) scaffolds `.changeset/<adjective>-<noun>-<verb>.md` (same adjective/noun/verb word lists changesets uses) pre-filled with a bump-appropriate skeleton: `patch` = title only; `minor` = title + explanation paragraph; `major` = title + explanation + `# Migration` section with a ` ```diff ` before/after block.
- `pnpm changeset:validate` (https://raw.githubusercontent.com/coveo/plasma/master/scripts/validateChangesets.js) is a ~210-line validator that CI runs and that **fails the PR**. Enforced rules:
  - Frontmatter must parse; every package must be a real workspace package name; every bump must be `major|minor|patch`.
  - Title = first non-empty, non-`<!--` line after frontmatter. Must exist, must not be a heading, must not start with a list marker, **must not end with a period**, **must not start with `**BREAKING:**`**, and **must be ≤ 100 characters**.
  - Body headings must start at a single `#` (h1).
  - **Body must not use markdown lists** — checked by a fence-aware scanner so ` ```diff ` blocks' `-`/`+` markers don't false-positive.
  - `major` requires a body **and** a `# Migration` section; `minor` requires a body.
  - Ignores `README.md`, `config.json`, `pre.json`, `changelog.cjs`.
- Rationale (CONTRIBUTING.md): the changeset *is* the consumer-facing CHANGELOG entry, so it's written from the consumer's perspective, not the implementation's. https://raw.githubusercontent.com/coveo/plasma/master/CONTRIBUTING.md ("Writing changesets"), plus two agent skills: `.github/skills/changesets-author/SKILL.md` and `.../references/template.md`.

---

## 3. `packages/llms` — what it contains and how it's generated

Source: https://raw.githubusercontent.com/coveo/plasma/master/packages/llms/README.md and `src/*`

**Answer to "from source or from docs MDX, so it can't drift?":** neither. The per-component `.md` files are **hand-maintained and are the single source of truth**. They are *not* generated from TypeScript types or from Storybook MDX. Drift is managed by process, not by codegen:
- The `.md` files live in `packages/llms/src/components/*.md` (66 files) and `packages/llms/src/content/*.md` (5 files).
- An in-repo agent skill, `.github/skills/plasma-component-docs/` (SKILL.md + `references/format.md`), encodes the exact expected format so agents regenerate/audit them consistently; AGENTS.md's "Component documentation" checklist makes "update the spec in `packages/llms/src/components/<ComponentName>.md`" step 1 of any public-API change.
- The *derived* artifacts (`llms.txt`, `llms-full.txt`, `dist/` copies, MCP `data.json`) **are** fully generated, so those can't drift.

### Layout

```
packages/llms/
  package.json          # data-only package, see below
  src/
    build.ts            # the generator
    llms-txt.md         # template for llms.txt      ({{COMPONENT_LIST}}, {{CONTENT_LIST}}, {{BASE_URL}})
    llms-txt.ts         # renders llms.txt
    llms-full-txt.md    # template for llms-full.txt ({{COMPONENT_DOCS}}, {{CONTENT_DOCS}})
    llms-full-txt.ts    # renders llms-full.txt
    skill.md            # template for plasma-skill.md ({{BASE_URL}})
    components/*.md     # 66 hand-written component specs  ← source of truth
    content/*.md        # Voice, WritingMechanics, ProductVocabulary, TargetAudience, Glossary
```

`package.json` (https://raw.githubusercontent.com/coveo/plasma/master/packages/llms/package.json): `"type": "module"`, `"files": ["dist"]`, `"sideEffects": []`, **no `exports`, no `main`, no `types`** — it publishes no JavaScript at all. `scripts.build` is `pnpm clean && node src/build.ts` (TypeScript is executed directly, no compile step). Only devDeps: `gray-matter`, `rimraf`, `@types/node`, `typescript`.

### The generator

Source: https://raw.githubusercontent.com/coveo/plasma/master/packages/llms/src/build.ts

1. `BASE_URL = process.env.PLASMA_BASE_URL ?? 'https://plasma.coveo.com'` — overridable so PR previews generate correct absolute URLs (`PLASMA_BASE_URL=http://localhost:6006 pnpm build`; CI sets it to the Chromatic branch URL).
2. `readDocs(dir)` → for each `*.md` **sorted**, `gray-matter` parses YAML frontmatter and returns `{slug: basename sans .md, name: data.name ?? slug, description: data.description ?? '', content}` (frontmatter stripped).
3. `writeDocs(entries, outDir)` → writes one `<slug>.md` per entry **plus an `index.json` manifest** `[{slug, name, description}]`.
4. Writes `dist/llms.txt`, `dist/llms-full.txt`, `dist/plasma-skill.md`.
5. Every `write()` does `content.replaceAll('{{BASE_URL}}', BASE_URL)` and **prepends a UTF-8 BOM to `.md`/`.txt` outputs** — verified live: `https://plasma.coveo.com/llms.txt` begins with `﻿# Plasma…`. (A quirk to *not* copy; Prism should emit clean UTF-8.)

`llms-txt.ts` fills the template: each component becomes
`- [${name}](${baseUrl}/llms/components/${slug}.md): ${description || '…component from @coveord/plasma-mantine'}`.

`llms-full-txt.ts` builds one giant file by concatenating entries joined by `\n\n${'─'.repeat(80)}\n\n`, and per entry: drops the doc's own top-level `# ` heading, strips the trailing `---\n\n[Full Plasma documentation](…)` footer, collapses 3+ blank lines, and **shifts every heading down two levels** (`^(#{1,6} )` → `##$1`) so the whole file nests under a `### ${name}` header.

### Live output shape (verified 2026-09-14)

- `https://plasma.coveo.com/llms.txt` — 12,187 bytes. H1 → one-paragraph intro → a `> Always import from @coveord/plasma-mantine…` blockquote → "For a single consolidated file… use `- [url](url)`" → `## Components` list → `## Content Guidelines` list → **`## Optional`** section pointing at Mantine for the ~90 pass-through components:
  > Plasma re-exports ~90 Mantine components unchanged. For components not listed above, refer to Mantine's documentation — but always import from `@coveord/plasma-mantine`, not from `@mantine/*` packages.
  > - [Mantine component index](https://mantine.dev/llms.txt) …
  > - [Mantine full documentation](https://mantine.dev/llms-full.txt) …
- `https://plasma.coveo.com/llms-full.txt` — 289,307 bytes (~283 KB).
- `https://plasma.coveo.com/plasma-skill.md` — 3,780 bytes.
- `https://plasma.coveo.com/llms/components/index.json` — the manifest, served statically.
- Published npm tarball `@coveord/plasma-llms@60.2.1` contains **75 files**: `dist/llms.txt`, `dist/llms-full.txt`, `dist/plasma-skill.md`, `dist/llms/components/*.md` + `index.json`, `dist/llms/content/*.md` + `index.json`.

So **one build artifact has three consumers**: (a) npm consumers of `@coveord/plasma-llms`, (b) the static docs site (CI `cp`s `packages/llms/dist/.` into `storybook-static/`), (c) the MCP server's `data.json`.

### Per-component MD format

Source: https://raw.githubusercontent.com/coveo/plasma/master/.github/skills/plasma-component-docs/references/format.md

```markdown
---
name: ComponentName                ← REQUIRED
description: One-sentence description used in llms.txt index.  ← REQUIRED
---

## Props

## Sub-components ← omit if none

## TypeScript namespace aliases ← optional, after Props/Sub-components, before Usage

## Usage

​```tsx
[most common use case — copy-pasteable snippet, including imports]
​```

---

[Full Plasma documentation]({{BASE_URL}})
```

Rules that make these genuinely LLM-useful:

- **RFC 2119 keywords (`MUST`/`MUST NOT`/`SHOULD`/`SHOULD NOT`/`MAY`), always uppercase**, express requirement levels — and only ever about *the developer using the component*, never the library's internal behaviour. `✗ "The button MUST show a loading state…"` → `✓ "shows a loading state…"`. Vague imperatives ("always", "never", "prefer", "avoid") are banned in favour of the keyword.
- **Two Props forms.** Form A (no Plasma-specific props): `_No additional props beyond the Mantine base component._`. Form B:
  ```
  > Extends: `MantineBaseProps`, `OtherInterface`. Only Plasma-specific props are listed below; refer to Mantine documentation for inherited props.

  **`propName`** `string` · required · default: `undefined` — What it does.
  ```
  Fixed separators: `·` (U+00B7) between metadata fields, `—` (spaced em dash) before the description. `required`/`optional` stated for every prop. `default:` always shown (`undefined` when absent — required props always get `undefined`). Inherited Mantine props go only in the `> Extends:` note. JSDoc copied verbatim from source when available.
- **Sub-components** section lists every static property on the export (`Button.Primary`, `Button.Secondary`, `Alert.Information`, …) with the standing line "You SHOULD use these over setting props manually."
- **Body sections** in practice (see `Accordion.md`, `Button.md`): `# Usage guidance` with `## What problem does it solve?`, `## When to use it`, `## When not to use it`, `## Decision-making guidance`, `## Variants`, `## States`, `## Interaction notes`, `## Accessibility expectations`, `## Content guidance`, `## Common anti-patterns`.
- Example of the *steering* these docs do (`Button.md`): "Ignore Mantine's `variant` values (`filled`, `light`, `outline`, `subtle`, `default`); always select emphasis through the Plasma sub-components below." — i.e. the spec documents a **narrowed API**, which is only honest because the wrapper actually removes the prop.

---

## 4. `packages/mcp-server` — tools, schemas, transports

Sources: https://raw.githubusercontent.com/coveo/plasma/master/packages/mcp-server/package.json, `README.md`, `src/server.ts`, `src/createServer.ts`, `lib/build.ts`, `src/tools/*`

**Stack: `tmcp`, not the official `@modelcontextprotocol/sdk`.**

```json
"bin": { "plasma-mcp-server": "./dist/server.js" },
"type": "module",
"sideEffects": [],
"dependencies": {
    "@tmcp/adapter-valibot": "0.1.6",
    "@tmcp/transport-stdio": "0.4.3",
    "tmcp": "1.19.4",
    "valibot": "1.4.2"
},
"devDependencies": { "@coveord/plasma-llms": "workspace:*", … },
"scripts": { "build": "pnpm clean && node lib/build.ts && tsc --project tsconfig.build.json", … }
```

Note `@coveord/plasma-llms` is a **devDependency** — it's needed to *bundle* `data.json` at build time, not at runtime.

### Build: docs are bundled, not fetched

`lib/build.ts` reads `../../llms/dist` (hard-fails with `❌ llms dist not found… Run pnpm build in @coveord/plasma-llms first.`) and writes a single `dist/data.json` of shape:

```ts
interface LlmsData {
    index: string;                    // contents of llms.txt
    full: string;                     // contents of llms-full.txt
    skill: string;                    // contents of plasma-skill.md
    components: {name, description, content}[];           // from index.json + <slug>.md
    contentGuidelines: {name, slug, description, content}[];
}
```

`src/server.ts` (the `bin` entry) then does a **statically-analysable dynamic import with an import attribute**:

```ts
const {default: data} = (await import(new URL('./data.json', import.meta.url).href, {with: {type: 'json'}})) as {default: LlmsData};
```

Net effect: **zero runtime network calls, zero file I/O, zero fs reads**. The npm package is fully self-contained; `npx -y @coveord/plasma-mcp-server` just works.

### Transport: stdio only

`src/server.ts`: `new StdioTransport(server); transport.listen(); console.error('Plasma MCP Server running on stdio');` — there is **no HTTP/SSE/streamable transport**. Plasma's MCP is a local stdio process; the remote/consumable surface is the static `llms.txt` files instead. Worth noting because Prism's map calls for "remote MCP on Workers + stdio" — that's an *extension* beyond what plasma does, not a mirror of it.

### The six tools

Source: `src/createServer.ts` + `README.md` tool table.

| Tool | Input schema (valibot) | Returns |
| --- | --- | --- |
| `list_components` | — | all documented component names |
| `get_component_doc` | `{component}` | full Markdown doc for one component |
| `get_component_props` | `{component}` | just the props table |
| `search_docs` | `{query}` | top 5 matches across components + guidelines |
| `list_content_guidelines` | — | all guideline names |
| `get_content_guideline` | `{guideline}` | full Markdown doc for one guideline |

Mechanics worth mirroring:

- `createServer(data)` is a **pure function of the data** — the transport and the data loading both live outside it. Makes the server trivially unit-testable (`vitest.config.ts` uses `environment: 'node'`, `dir: './src'`, `include: ['**/*.spec.ts']`).
- Schemas are valibot objects with `v.pipe(v.string(), v.description('…'))`, so the description lands in the tool's JSON Schema and the LLM sees it.
- Errors are returned as `{content: [{type: 'text', text}], isError: true}` — a discriminated `ToolResult = ToolSuccess | ToolError` union, not thrown.
- Lookups are **case-insensitive** via `new Map(data.components.map((c) => [c.name.toLowerCase(), c]))`.
- `search_docs` is deliberately dependency-free: lowercase, split on whitespace, count regex matches of each escaped term across `name + description + content`, sum, filter `> 0`, sort desc, `slice(0, 5)`, and render as `# Search Results for "…"\n\nFound N result(s):\n\n## Name (Content Guideline)\n\n<desc>\n\n<content>` joined by `\n\n---\n\n`. No embeddings, no index, no deps.
- Server identity: `{name: 'plasma-mcp-server', version: pkg.version}` where `pkg` is read with `import pkg from '../package.json' with {type: 'json'}` — the MCP-reported version always equals the npm version.
- Capabilities: `{capabilities: {tools: {}}}` — tools only, no resources/prompts.

### Pairing with the Mantine MCP

Source: https://raw.githubusercontent.com/coveo/plasma/master/README.md ("AI Coding Agents") and `packages/llms/src/skill.md`

Plasma's answer to "our docs cover 66 components but we re-export ~90": **delegate upward, but pin the import.**

- Root README ships ready-to-paste MCP configs for six clients: Claude Code (project `.mcp.json` + `claude mcp add plasma -- npx -y @coveord/plasma-mcp-server`), Opencode (`opencode.json`), GitHub Copilot CLI (`copilot mcp add …`), VS Code agent mode (`.vscode/mcp.json`), Kiro (`.kiro/steering/plasma.md` + `.kiro/settings/mcp.json`), Codex CLI (`~/.codex/config.toml`). All six name **both** servers:
  ```json
  { "mcpServers": {
      "plasma":  { "command": "npx", "args": ["-y", "@coveord/plasma-mcp-server"] },
      "mantine": { "command": "npx", "args": ["-y", "@mantine/mcp-server"] }
  } }
  ```
- The three-layer split, verbatim from README: **"Plasma skill: persistent setup, import, and documentation lookup conventions / Plasma MCP: authoritative on-demand Plasma-specific props, sub-components, usage, and content guidelines / Mantine MCP: on-demand fallback for re-exported components and inherited props."** And: "The skill uses static `@coveord/plasma-llms` files only as a fallback when MCP is unavailable."
- The skill encodes the order: "Step 1: Query Plasma first… Step 2: Fall back to Mantine… Even when Mantine supplies the API reference, import the component from `@coveord/plasma-mantine`." Plus an explicit client-prefix caveat: "MCP clients may prefix the tool names with the server name."
- Verified `@mantine/mcp-server` (https://registry.npmjs.org/@mantine%2Fmcp-server, latest `9.6.1`, `bin: {"mcp-server": "bin/mcp-server.cjs"}`) exposes exactly the four tools the skill names — **`list_items`, `get_item_doc`, `get_item_props`, `search_docs`** — with env knobs `MANTINE_MCP_DATA_URL` (default `https://mantine.dev/mcp`) and `MANTINE_MCP_TIMEOUT_MS` (default 10000). The tool *names are the same shape* (`list_*`/`get_*_doc`/`get_*_props`/`search_docs`), which is clearly deliberate so agents transfer between them.

---

## 5. Docs site

**It is Storybook, not a Next.js/Fumadocs site.** `plasma.coveo.com` is Chromatic hosting `packages/storybook`.

Source: https://raw.githubusercontent.com/coveo/plasma/master/packages/storybook/package.json

```json
{ "name": "@coveord/plasma-storybook", "private": true, "type": "module",
  "scripts": { "build": "storybook build --stats-json", "lint": "oxlint", "start": "storybook dev -p 6007" },
  "dependencies": { "@coveord/plasma-mantine": "workspace:*", "@coveord/plasma-react-icons": "workspace:*",
                    "@mantine/*": "9.2.1", "react": "19.2.7", "react-dom": "19.2.7",
                    "@faker-js/faker": "10.5.0", "dayjs": "…", "react-hook-form": "7.81.0" },
  "devDependencies": { "storybook": "10.5.2", "@storybook/react-vite": "10.5.2",
                       "@storybook/addon-docs": "10.5.2", "vite": "8.1.5", "@vitejs/plugin-react": "6.0.3",
                       "postcss-preset-mantine": "1.18.0", … } }
```

- **`@storybook/addon-docs` is the only addon.** `features: {interactions: false, actions: false}` — it's a docs site, not a playground. No Controls-driven knobs culture (`controls: {disableSaveFromUI: true}`).
- `.storybook/main.ts`: `stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)']`, `framework: getAbsolutePath('@storybook/react-vite')`, `staticDirs: ['../public']`.
- Demos are **`.stories.tsx` files co-located by functional category**, not by component name:
  ```
  src/components/call-to-action/{Button,ActionIcon,NavLink,Pagination,…}.stories.tsx
  src/components/data-display/{Badge,Card,Image,Pill,Table}.stories.tsx
  src/components/feedback/{Alert,InfoToken,Loader,Notification,Progress,Skeleton,StatusToken,Stepper,Tooltip,…}.stories.tsx
  src/components/forms-and-inputs/{array,boolean,date,number,string}/*.stories.tsx
  src/components/layout/{Accordion,AppShell,ChildForm,Header,Modal,Navigation,Prompt,ScrollArea,StickyFooter,Tabs,…}.stories.tsx
  src/components/typography/{EllipsisText,Kbd}.stories.tsx
  src/components/foundation/{colors,iconography,radii,shadows,spacings,typography,variables}/*.{mdx,stories.tsx,tsx}
  src/overview/{GettingStarted,UsingLLMs}.mdx
  src/content/{AboutContent,Glossary,ProductVocabulary,TargetAudience,Voice,WritingMechanics}.mdx + DoTable.tsx
  src/changelogs/{mantine,tokens,react-icons,llms,mcp-server}.mdx
  ```
  Note `src/content/*.mdx` and `packages/llms/src/content/*.md` are **two hand-maintained copies of the same content guidelines** in different formats (human Storybook MDX vs. LLM Markdown). That's the one place plasma *does* duplicate source of truth.
- Ordering is enforced in `preview.tsx` `parameters.options.storySort.order`: `@overview` → `@foundation` → `@content` → `@components` → `'*'` → `changelogs`, with the components group sub-ordered Overview / Call to action / Forms and inputs / Feedback / Layout / Data display / Typography / Miscellaneous.
- Provider wiring: `decorators: [useColorScheme, withTheme]`, a `globalTypes.primaryColor` toolbar (swaps Mantine's primary colour, default `'teal'`), `docs.container: ThemedDocsContainer`, `docs.components: plasmaMarkdownOverrides` (custom Markdown renderers), `docs.codePanel: true`, `docs.toc.headingSelector: 'h2'`.
- Styles are imported as CSS cascade layers in `preview.tsx`: `@mantine/core/styles.layer.css`, `@mantine/dates/styles.layer.css`, `@mantine/notifications/styles.layer.css`, plus local `reset.css`/`headings.css`.
- Visual regression is **Chromatic**, configured via `chromatic.config.json`, run only from CI with `onlyChanged: true` + `exitOnceUploaded: true`.
- Icons in tests are stubbed by a shipped Vite plugin: `packages/mantine/vitest.config.ts` uses `plugins: [plasmaIconsMockPlugin()]` from `@coveord/plasma-react-icons/vite-plugin` — the icons package ships its own test double.

**Two deploy paths, one artifact.** Both CI (`demo` job) and CD `cp -r ./packages/llms/dist/. ./packages/storybook/storybook-static/` before uploading, so `plasma.coveo.com/llms.txt` is served by the same static host as the component docs. The LLM surface is *distributed with the docs site*, not a separate deployment.

---

## 6. The `Plasmantine` provider pattern

Source: https://raw.githubusercontent.com/coveo/plasma/master/packages/mantine/src/theme/Plasmantine.tsx (38 lines, reproduced in full)

```tsx
import '../styles/global.css';

import {
    Combobox, createTheme, MantineProvider, MantineProviderProps,
    mergeThemeOverrides, Popover,
} from '@mantine/core';
import {FunctionComponent} from 'react';
import {mergeCSSVariablesResolvers} from './mergeCSSVariablesResolvers.js';
import {plasmaCSSVariablesResolver} from './plasmaCSSVariablesResolver.js';
import {plasmaTheme} from './Theme.js';

const emptyTheme = {};
const testThemeOverride = createTheme({
    components: {
        Combobox: Combobox.extend({defaultProps: {middlewares: {inline: true}}}),
        Popover: Popover.extend({defaultProps: {middlewares: {inline: true}}}),
    },
});

export const Plasmantine: FunctionComponent<MantineProviderProps> = ({
    children,
    theme: externalTheme = emptyTheme,
    cssVariablesResolver: externalCSSVariablesResolver,
    env,
    ...others
}) => {
    const theme =
        env === 'test'
            ? mergeThemeOverrides(plasmaTheme, testThemeOverride, externalTheme, emptyTheme)
            : mergeThemeOverrides(plasmaTheme, externalTheme, emptyTheme);
    const cssVariablesResolver = mergeCSSVariablesResolvers(plasmaCSSVariablesResolver, externalCSSVariablesResolver);

    return (
        <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} env={env} {...others}>
            {children}
        </MantineProvider>
    );
};
```

The five transferable ideas:

1. **It's a transparent wrapper, not a replacement.** Props type is literally `MantineProviderProps` and unknown props are forwarded. Consumers never lose access to the underlying provider's API (forcedColorScheme, defaultColorScheme, cssVariablesSelector, …).
2. **Composition order is explicit and documented by position:** `mergeThemeOverrides(plasmaTheme, externalTheme, emptyTheme)` — Plasma first, consumer second, so the consumer wins. `emptyTheme` is a stable identity (`const emptyTheme = {}` outside the component) to avoid re-creating an object every render.
3. **A separate `env === 'test'` theme branch.** In tests only, it injects `Combobox`/`Popover` `defaultProps: {middlewares: {inline: true}}` — a jsdom-friendly popper configuration. Theme behaviour differs by environment without leaking test concerns into prod.
4. **CSS variables are merged, not replaced.** `mergeCSSVariablesResolvers(plasmaCSSVariablesResolver, externalCSSVariablesResolver)` composes Plasma's resolver with any consumer's, so both sets of custom properties survive. Files: `src/theme/plasmaCSSVariablesResolver.ts`, `src/theme/mergeCSSVariablesResolvers.ts`, `src/theme/plasmaVariantColorResolver.ts`.
5. **It's a separate subpath export** (`@coveord/plasma-mantine/plasmantine` → `src/theme.ts` → `./theme/Plasmantine.js`), not the root entry, so importing the provider doesn't drag in the component barrel.

Supporting files: `src/theme/Theme.tsx` (~19 KB — the `plasmaTheme = createTheme({...})` with per-component overrides, importing icons from `@coveord/plasma-react-icons` and colors from `@coveord/plasma-tokens`), `src/theme/PlasmaColors.ts`, `src/index.ts`.

`src/index.ts` (https://raw.githubusercontent.com/coveo/plasma/master/packages/mantine/src/index.ts, 174 `export` statements) also does **module augmentation** to make tokens type-safe through Mantine's own API:

```ts
declare module '@mantine/core' {
    export interface MantineThemeColorsOverride {
        colors: Record<keyof typeof PlasmaColors | (string & {}), MantineColorsTuple>;
    }
}
```

---

## 7. Enforcing "always import from plasma-mantine"

There is **no lint rule**. `oxlint.config.ts` has no `no-restricted-imports`-style rule; the only relevant config is `jsPlugins: ['eslint-plugin-testing-library', 'eslint-plugin-storybook']` plus four targeted `off` rules. Enforcement is three-fold, all of it structural:

1. **Completeness is generated, so the rule is *satisfiable*.** `packages/mantine/scripts/GenerateMantineComponentExports.ts` (https://raw.githubusercontent.com/coveo/plasma/master/packages/mantine/scripts/GenerateMantineComponentExports.ts) `fetch()`es Mantine's upstream component index — `https://raw.githubusercontent.com/mantinedev/mantine/refs/heads/master/packages/%40mantine/core/src/components/index.ts` — regexes out every `export * from './X';`, diffs against the directories present in `src/components/`, and for every Mantine component Plasma does *not* override writes:
   ```ts
   export {Component, type ComponentFactory, type ComponentProps} from '@mantine/core';
   ```
   at `src/components/<Name>/<Name>.ts`. Run manually via `pnpm generate:components:exports` (`node --experimental-strip-types scripts/…`). **This is the load-bearing piece:** every upstream Mantine component is guaranteed a re-export path, so "import from plasma-mantine instead" is always possible. Without it the invariant would rot the moment Mantine ships a new component.
2. **The barrel makes the rule *necessary*, not just possible.** `src/index.ts` starts with `export * from '@mantine/core'` (plus `@mantine/hooks`, `@mantine/form`, `@mantine/notifications`, `@mantine/carousel`, `@mantine/dates` types, `@tanstack/table-core`) and then re-exports each component — 174 export statements. Since `@mantine/core` is fully re-exported through the one package, there is never a reason to reach for it directly.
3. **The rule is restated in every agent-touching surface**, always with the same phrasing ("even when Mantine docs were the reference source"): root `README.md`, `packages/mantine/README.md`, `AGENTS.md`, `packages/llms/src/llms-txt.md` (baked into the served `llms.txt`), and `packages/llms/src/skill.md` (with ✓/✗ code examples). It appears as a blockquote `> **Import invariant:** …` in three separate files.

Companion convention, same surfaces: **"Prefer Plasma sub-components over raw props"** — `Button.Primary` not `<Button variant="filled">`. And `Chip.md` documents that Plasma *removes* an inherited prop: "Selectable pill-shaped control that strips the Mantine `variant` prop to enforce Plasma styling."

---

## 8. Agent-surface extras worth stealing outright

- **`AGENTS.md` is a separate, terser file from `CONTRIBUTING.md`**, and its stated goal is explicit: "let an agent contribute a complete, review-ready pull request **without having to ask a human how**." https://raw.githubusercontent.com/coveo/plasma/master/AGENTS.md. Contains: package table (with a "maintenance mode — do not add features" row), stack, setup, a command table, code-style rules (print width 120, tab width 4, single quotes; functional components; **named exports**; `PascalCase.tsx` components / `camelCase.ts` utilities / co-located `*.spec.ts(x)`), test conventions (**no "should" prefix** — `it('returns true when value is valid')`), a "What CI checks on a PR" list, and a **"Gotchas"** section (don't edit generated files; don't add features to maintenance-mode packages; use `workspace:*`; deps pinned exactly; Apache-2.0 headers).
- **In-repo agent skills** at `.github/skills/` — `plasma-component-docs`, `converting-md-to-storybook-mdx` (Step 1), `storybook-component-guidelines` (Step 2), `changesets-author`. Each is `SKILL.md` + `references/*.md` (format spec, examples, validation checklist, PR workflow). These are how the hand-maintained docs stay consistent — the format spec *is* the validation.
- **CI quirk documented in both AGENTS.md and the workflow:** if `pnpm lint` fails with `Error: Invalid tsconfig`, set `OXLINT_TSGOLINT_DANGEROUSLY_SUPPRESS_PROGRAM_DIAGNOSTICS=true`. Both `ci.yml` and `cd.yml` set it inline with that comment.
- **Supply-chain hardening** everywhere: `minimumReleaseAge: 10080` (7 days) in `pnpm-workspace.yaml` with targeted excludes; `step-security/harden-runner` with `egress-policy: audit` as the *first* step of every job; every third-party action pinned **by commit SHA with a version comment** (`actions/checkout@3d3c42e… # v7`); OpenSSF Scorecard, CodeQL, dependency-review, and `publish-figma` workflows alongside ci/cd; Renovate with `github>coveo/renovate-presets`, `group:allNonMajor`, auto-merge for minor/patch, `internalChecksFilter: strict`, weekly `lockFileMaintenance`, and grouped majors for `@tanstack/*` (they must move together).

---

## Recommendations for `@nanisoft/prism-*`

Ordered by leverage. antd v6 / React 19 substitutions noted where plasma's choice is Mantine-specific.

1. **Copy the ESM packaging recipe exactly.** `"type": "module"`, `exports` with only `types` + `import`, `files: ["dist"]`, `sideEffects` set honestly (`true` for anything importing CSS, `[]` otherwise), `"prepublishOnly": "publint"` on every publishable package, internal deps as `workspace:*`, one shared `packages/tsconfig-base.json` with `${configDir}` + `nodenext` + `declarationMap: true`. Skip the bundler: `tsc -b`-style emit + a ~40-line asset-copy script (`globSync('src/**/*.{css,svg,json,png,jpg}')` → `dist/`) is sufficient and gives you correct `.d.ts` + declaration maps for free. antd ships its own types, so no bundling is needed there either.

2. **Do NOT lockstep-version.** Keep `.changeset/config.json` at `fixed: []`, `linked: []`, `updateInternalDependencies: "patch"`, `bumpVersionsWithWorkspaceProtocolOnly: true`, `access: public`, `privatePackages: {version: false, tag: false}`. Independently versioned `prism-ui` vs `prism-tokens` is strictly better than a fake lockstep, and `updateInternalDependencies: patch` keeps the `workspace:*` ranges honest automatically.

3. **Adopt the three-workflow release shape, with two changes for Cloudflare.** `ci.yml` (PR: release-preview comment + lint + test + demo), `release-pr.yml` (push to `main` → Version Packages PR), `cd.yml` (`workflow_dispatch`, gated to `main`/`next`, `environment: production`). Two adjustments: (a) plasma's CD is manual — if you want push-to-deploy, keep the same job structure but add a `push: branches: [main]` trigger and keep `concurrency: group: github.ref_name`; (b) add a `wrangler deploy` step after publish. Do copy the **`next` branch = `changeset pre enter next`** pattern with the `next` dist-tag, and the custom `changelog.cjs` that **returns `''` during pre mode** (it's 15 lines and keeps your stable CHANGELOG clean through prerelease churn).

4. **Steal `releasePreview.js` and `validateChangesets.js` whole.** The PR comment showing exactly which packages would bump to which versions is high value for near-zero code; the validator's rules (≤100-char title, no trailing period, no `**BREAKING:**` prefix, prose-only body, `# Migration` section required for major) are the difference between a readable CHANGELOG and a wall of bullets. Ship the matching `changeset:new` scaffold plus a `changesets-author` skill so agents produce conforming changesets first try. **Prism-specific addition:** since `prism-tokens` → `prism-ui` is a real dependency chain, make the `major` template's `# Migration` section mandatory (already the case) and add a rule that a `major` on `prism-tokens` must explain the `prism-ui` consequence.

5. **Make `prism-ui` complete by codegen, not by discipline.** Port `GenerateMantineComponentExports.ts` to fetch antd's component index and write `export {X, type XProps} from 'antd'` proxies for every antd component Prism doesn't wrap. This is the single mechanism that makes "always import from `@nanisoft/prism-ui`, never `antd`" actually enforceable — no lint rule needed, and it self-heals when antd ships new components. Then state the invariant identically in: root `README.md`, `packages/ui/README.md`, `AGENTS.md`, the `llms.txt` template, and the public skill. Re-export `@ant-design/icons` and `ConfigProvider`-adjacent surfaces (`theme`, `App`, `notification`, `message`, `Modal.confirm`) through subpath exports the same way plasma splits `./plasmantine`, `./core`, `./hooks`, `./form`, `./notifications`.

6. **`PrismProvider` = the `Plasmantine` shape.** A ~40-line transparent wrapper: props type is antd `ConfigProviderProps`, unknown props forwarded, `mergeThemeOverrides(createPrismTheme(), externalTheme)` with Plasma first / consumer second, a stable `const emptyTheme = {}` module constant, a `env === 'test'` branch only if jsdom genuinely needs one, and a **composed** CSS-variables/token resolver rather than a replacing one. Ship it as its own subpath export (`@nanisoft/prism-ui/provider`) so importing it doesn't pull the component barrel. Add antd's equivalent of plasma's module augmentation (`declare module 'antd'` / theme token typing) so brand tokens are type-checked through antd's own API.

7. **Build `prism-llms` as a data-only npm package, and make it the *single* derived artifact.** No `exports`/`main`/`types`; `files: ["dist"]`; `sideEffects: []`; `build: node src/build.ts` executed directly with TypeScript. Contents: `dist/llms.txt`, `dist/llms-full.txt`, `dist/prism-skill.md`, `dist/llms/components/<Name>.md` + `index.json`, `dist/llms/content/<Slug>.md` + `index.json`. Interpolate a `{{BASE_URL}}` placeholder from `PRISM_BASE_URL` and declare it in turbo's `build.env` (plasma does this for exactly this reason). **Do not emit a BOM** — plasma's served `llms.txt` starts with `﻿`, which is a wart. For the antd pairing: copy plasma's `llms.txt` `## Optional` section verbatim in spirit — "Prism re-exports ~N antd components unchanged; for those, see antd's `llms.txt`, but always import from `@nanisoft/prism-ui`" with links to `https://ant.design/llms.txt`.

8. **Per-component MD: use plasma's exact format, including RFC 2119.** Frontmatter `{name, description}` (description = the one-liner that becomes the `llms.txt` bullet); `## Props` with the `·`/`—` separator convention and `required`/`default:` on every prop, inherited antd props collapsed into a `> Extends:` note; `## Sub-components`; optional `## TypeScript namespace aliases`; `## Usage` with a self-contained copy-pasteable `tsx` snippet including imports; a `---` footer link. Then the part plasma gets right and most design systems don't: **uppercase RFC 2119 keywords (`MUST`/`SHOULD`/`MAY`) describing *the developer's* choices, never the library's internals**, and a ban on vague imperatives. Also copy the "two Props forms" rule — `_No additional props beyond the antd base component._` is a *feature*: it tells the agent to go read antd's docs for that component, which is exactly right.
   **Prism-specific addition:** plasma documents a *narrowed* API (`Button.md`: "Ignore Mantine's `variant` values… always select emphasis through the Plasma sub-components below") because the wrapper actually removes the prop. If Prism ships `components → blocks → pages` inside `prism-ui`, the blocks need the same treatment — `## Blocks` and `## Pages` sections in the same file, so an agent discovers the pre-composed layer without a second lookup.

9. **`prism-mcp-server`: same architecture, and reconsider the transport.** Keep the separation plasma nailed — `createServer(data)` as a pure function of bundled data, transport and data-loading outside it, tools registered with valibot (or zod) schemas whose `.description()` lands in the JSON Schema, errors as `{content, isError: true}` not throws, case-insensitive lookup Maps, and a dependency-free term-frequency `search_docs` capped at 5 results. Keep `list_*` / `get_*_doc` / `get_*_props` / `search_docs` naming aligned with both plasma and antd so agents transfer. Bundle docs into a single `dist/data.json` loaded via `import(new URL('./data.json', import.meta.url).href, {with: {type: 'json'}})` — statically analysable, zero runtime I/O, so `npx -y @nanisoft/prism-mcp-server` just works. **Divergence:** plasma is stdio-only and gets its remote reach from static `llms.txt` files. Prism's map calls for "remote MCP on Workers + stdio" — that's a superset, so treat plasma as the stdio reference and add the Workers transport separately; the stdio package stays dependency-minimal and the Worker is a thin deployable over the same `createServer(data)`.
   **Name the paired server.** Plasma's root README documents the antd-equivalent pairing explicitly across six clients. Prism should ship a ready-to-paste `.mcp.json` with **both** `@nanisoft/prism-mcp-server` and the antd MCP (ant.design's `llms.txt` at minimum; add an antd MCP entry if/when one ships under `@ant-design/*`), plus a skill that says "query Prism first for Prism-specific behaviour; fall back to antd for inherited props; **always import from `@nanisoft/prism-ui`**." Mirror plasma's tool-name shape (`list_items`/`get_item_doc`/`get_item_props`/`search_docs`) for the antd server so agents transfer cleanly.

10. **Do not mirror the docs-site decision — it's the one place Prism should differ.** `packages/storybook` is a fine choice *for a component playground*, but plasma's site is Chromatic-hosted Storybook 10 with `addon-docs` only and `features: {interactions: false, actions: false}`. Prism's map already specifies Fumadocs headless + `ComponentDemo` + Cloudflare Workers Static Assets, which is a better fit for a landing page + docs + blog. **What *is* worth copying from plasma's site:** (a) the two-deploy-paths-one-artifact trick — `cp -r ./packages/llms/dist/. <static-output>/` so `/llms.txt` is served by the same host as the docs, no separate deployment; (b) `storySort.order` for a canonical documentation reading order; (c) docs organised by *functional category* rather than alphabetically; (d) Chromatic (or equivalent) as the visual-regression backend, run from CI only with `onlyChanged: true`.
    **Watch one drift risk plasma has:** `packages/storybook/src/content/*.mdx` and `packages/llms/src/content/*.md` are two hand-maintained copies of the same content guidelines. Prism's Fumadocs MDX should be the single source and `prism-llms` should *generate* its content pages from it — that's a genuinely better shape than plasma's, and it's cheap to do from day one.

11. **Write the `AGENTS.md` plasma writes.** Separate from and terser than `CONTRIBUTING.md`, opening with the goal "contribute a review-ready PR without having to ask a human how". Must include: package table with explicit maintenance-mode rows, a command table, code-style rules (plasma: 120/4/single quotes, functional components, **named exports**, `PascalCase.tsx`), test conventions (co-located `*.spec.ts(x)`, **no "should" prefix**), a "What CI checks on a PR" list, a **"Gotchas"** section (never edit generated files or `dist/`; use `workspace:*`; licence headers), and the documented lint workaround. Also ship in-repo skills at `.github/skills/` for the two hand-maintained artifacts that would otherwise drift — plasma's `plasma-component-docs` (format spec + validation checklist) and `changesets-author` are the models.

12. **Adopt plasma's supply-chain posture; it's cheap and it's what makes the npm story credible.** `minimumReleaseAge: 10080` (+ `minimumReleaseAgeExclude` for the packages you need same-day), `allowBuilds` denying every postinstall script, `saveExact: true`, `only-allow pnpm`, `packageManager` pinned with its sha512 integrity hash, `step-security/harden-runner` with `egress-policy: audit` first in every job, and **every third-party Actions pin by commit SHA with a trailing version comment** (`actions/checkout@<sha> # v7`). Plasma's remote turbo cache is a self-hosted Lambda URL — Prism should use Vercel's or skip remote caching entirely until build times demand it.

---

## Open questions this research settles / leaves open

Settled: monorepo shape (flat `packages/*`, no `apps/`), versioning policy (independent, not lockstep), release topology (3 workflows, `master`/`next`, manual CD), `llms` generation (hand-maintained source, fully generated derived artifacts), MCP tool set and bundling strategy, provider pattern, and how the import invariant is actually enforced (codegen completeness, not linting).

Leaves open for Prism (deliberately outside this ticket): a remote/Workers MCP transport (plasma has no precedent), Fumadocs-vs-Storybook (Prism has decided; plasma is not a useful precedent), and whether `prism-tokens` should ship raw non-TS assets (`scss/`, `css/`, `icons/*`) via `exports` subpaths the way `plasma-tokens` does — plasma's answer is yes and it works well, but Prism's antd `theme` object may not need file-level tokens at all.
