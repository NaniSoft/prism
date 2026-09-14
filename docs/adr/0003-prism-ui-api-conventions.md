---
Status: accepted
---

# prism-ui API conventions

`@nanisoft/prism-ui` is the only UI surface Prism consumers touch: apps import components, blocks, and pages from it and never from `antd` or `@ant-design/*` at runtime (plasma's invariant, adopted in ticket 01 and restated in `AGENTS.md`). The package carries a **three-layer taxonomy — components → blocks → pages — inside one npm package**, separated by subpath exports rather than by package or version, because the layers change together and independent-versioning them would manufacture lockstep churn (ticket 01's release model). Fidelity to antd is **generated, not maintained**: every antd component Prism does not wrap gets a codegen'd proxy re-export, which is what keeps the "always import from `prism-ui`" invariant satisfiable and self-healing across antd upgrades. Hand-written wrappers are the exception, gated by a closed list of justifications — every wrapper is a parity liability the package pays for at each antd bump. `PrismProvider` is a transparent wrapper over antd `ConfigProvider`: it owns theme composition, mounts antd's `App`, and adapts routing; it owns nothing else.

Enforcement is structural (codegen + pnpm's isolated `node_modules`), never a lint rule — plasma's lesson from ticket 01. The open calls the human still owns are recorded in ticket 10's Draft proposal; this ADR states the shape they'd land in.

## The export surface

Single source of truth is the `exports` map in `packages/ui/package.json`. Everything reachable through it is public API; everything else in `dist/` is private even though it is physically present. Deep imports are impossible by construction, not by convention.

```
packages/ui/src/
├── index.ts                        # root barrel: provider + components + blocks + pages (never icons)
├── provider/
│   ├── PrismProvider.tsx           # ConfigProvider wrapper + App + link adapter
│   ├── mergePrismTheme.ts          # exported so apps can compose themes without the provider
│   ├── PrismLinkContext.tsx        # usePrismLink()
│   └── index.ts                    → @nanisoft/prism-ui/provider
├── components/
│   ├── index.ts                    → @nanisoft/prism-ui/components
│   ├── button/index.ts             → @nanisoft/prism-ui/components/button        (generated)
│   └── display-title/
│       ├── DisplayTitle.tsx
│       └── index.ts                → @nanisoft/prism-ui/components/display-title   (hand-written)
├── blocks/
│   ├── index.ts                    → @nanisoft/prism-ui/blocks
│   ├── page-header/{PageHeader.tsx,index.ts}
│   └── component-demo/{ComponentDemo.tsx,index.ts}
├── pages/
│   ├── index.ts                    → @nanisoft/prism-ui/pages
│   ├── docs-shell/{DocsShell.tsx,index.ts}
│   └── blog-layout/{BlogLayout.tsx,index.ts}
├── generated/
│   ├── antd-components.ts          # codegen — one proxy module per unwrapped antd component
│   └── icons.ts                    # codegen — @ant-design/icons re-export
├── wrapped-registry.ts             # hand-maintained list of wrapped components (see below)
└── styles.css                      # @font-face (Archivo Variable, JetBrains Mono), display
                                    # width-axis class, dither patterns; imported by the app
```

`exports` map (types + `import` only, per the repo's ESM-only, no-bundler rule):

```json
{
  ".":              { "types": "./dist/index.d.ts",              "import": "./dist/index.js" },
  "./provider":     { "types": "./dist/provider/index.d.ts",     "import": "./dist/provider/index.js" },
  "./components":   { "types": "./dist/components/index.d.ts",   "import": "./dist/components/index.js" },
  "./components/*": { "types": "./dist/components/*/index.d.ts", "import": "./dist/components/*/index.js" },
  "./blocks":       { "types": "./dist/blocks/index.d.ts",       "import": "./dist/blocks/index.js" },
  "./blocks/*":     { "types": "./dist/blocks/*/index.d.ts",     "import": "./dist/blocks/*/index.js" },
  "./pages":        { "types": "./dist/pages/index.d.ts",        "import": "./dist/pages/index.js" },
  "./pages/*":      { "types": "./dist/pages/*/index.d.ts",      "import": "./dist/pages/*/index.js" },
  "./icons":        { "types": "./dist/generated/icons.d.ts",    "import": "./dist/generated/icons.js" },
  "./styles.css":   "./dist/styles.css",
  "./package.json": "./package.json"
}
```

Naming and module rules:

- Directories are kebab-case and mirror antd's component id (`input-number`, `tree-select`); blocks and pages are kebab-case compounds (`page-header`, `docs-shell`). Files are `PascalCase.tsx` next to an `index.ts` barrel; utilities are `camelCase.ts`; tests are co-located `<Name>.test.tsx`.
- Named exports only, no default exports anywhere. Props interfaces are `<Name>Props`, exported from the same module. Components are function components returning `ReactElement`; `ref` flows through as a normal prop (React 19) — no `forwardRef`.
- **No layer suffixes in names.** The subpath carries the taxonomy: it is `prism-ui/blocks/page-header`, and the export is `PageHeader` — never `PageHeaderBlock`.
- A component that wraps exactly one antd component keeps antd's export name. Prism-original components get a plain descriptive name (`ComponentDemo`, `DitherSurface`). The `Prism` prefix is reserved for `PrismProvider`, `PrismTheme`, and `usePrism*` hooks.
- The root barrel is for ergonomics; `./icons` is deliberately excluded from it (800+ names), and production code should prefer per-item subpaths. Icons are re-exported `@ant-design/icons` — no custom icons package (map, Out of scope).
- `styles.css` is **imported by the app**, not by `PrismProvider`, so `"sideEffects": []` stays honest and apps control cascade order. This is the documented one-line setup step; ADR-0001's "apps accept the fonts by importing Prism" is satisfied by it.
- The antd invariant binds **consumers**, not `prism-ui` internals: `packages/ui` may deep-import `antd/es/...` freely. First-party packages are not covered by the invariant — apps import `@nanisoft/prism-tokens` (for `createPrismTheme()` and token data) and `@nanisoft/prism-ui` directly; `prism-ui` never re-exports prism-tokens' surface, so there is one owner per API.

## What PrismProvider owns

`PrismProvider` extends antd's `ConfigProviderProps`, forwards unknown props, and renders `ConfigProvider → App → children`. Same shape as plasma's `Plasmantine`: transparent, ~40 lines, consumer wins.

| Owns | Forwards (no opinion) | Never owns |
| --- | --- | --- |
| antd `ConfigProvider` mount | `locale` — typed `Locale`, no bundled locales, no default override | Data fetching, storage, global app state |
| Default theme from `@nanisoft/prism-tokens` (`createPrismTheme()`, blue pack, light mode) and consumer `theme` merged **per key, consumer last** — `token` and `components[X]` deep-merge per component, never replaced by reference | `direction` — forwarded; v1 is not RTL-tested, and the docs say so | Routing (adapts it only — `link?: ComponentType` prop → `usePrismLink()`; default is a plain `<a>`) |
| antd `App` mount, so `App.useApp()` works everywhere and context-blind statics (`Modal.confirm`, `message.x`) are never needed | `componentSize`, `form`, `popupMatchSelectWidth`, `renderEmpty`, all remaining `ConfigProviderProps` | SSR style extraction — `@ant-design/nextjs-registry`, `@ant-design/static-style-extract`, and the dark-mode class-swap script are app-level (ticket 02) |
| The link adapter context (`usePrismLink()`), the only routing seam | | `<html>` class management. The contract is: `createPrismTheme()` sets `cssVar.key` to `prism-light` / `prism-dark` (ticket 02), and the app puts that class on `<html>` and flips it |
| `mergePrismTheme(prismTheme, consumerTheme)`, exported for composition | | i18n catalogs for Prism's *own* copy — none exists in v1; the first Prism-authored string (the `ComponentDemo` copy button) triggers a small Prism-locale merge slot (open call in ticket 10) |

Dark mode is configured per pack by the theme (ADR-0001), not by the provider: mode selection is `createPrismTheme({ pack, mode })` in `prism-tokens`, passed as `theme`. `PrismProvider` takes no `pack`/`mode` sugar props.

## antd re-export policy

Three tiers, with the tier decided by the registry, not by taste at review time.

**1. Pass-through (generated — the default).** Every antd component Prism does not wrap is re-exported untouched from `src/generated/antd-components.ts`, one proxy module per component, emitted into `src/components/<antd-id>/index.ts`:

```ts
// packages/ui/src/components/button/index.ts — GENERATED by scripts/generateAntdExports.mjs
export { Button, type ButtonProps } from 'antd';
```

The generator parses the **installed** antd entry (`node_modules/antd/es/index.js` + `index.d.ts`, `export { default as X } from './x'` lines and the `export type` lines beside them) — not upstream `master` as plasma does, so the generated set always matches the exact version consumers resolve, and generation is hermetic and offline. `@ant-design/icons` gets the same treatment into `src/generated/icons.ts` (plus the `Icon` types). Non-component surfaces that don't appear in the component index — `ConfigProvider`, `App`, `theme`, `message`, `notification`, `version`, and the static sub-components (`Typography.Text`, `Form.Item`, `Table.Column`) — come from a hand-maintained allowlist beside the generator, because they are few and stable.

**2. Wrapped (hand-written — the exception).** A wrapper exists only if it does one of four jobs:

- **`brand-behavior`** — it expresses brand behavior antd's token surface cannot. If the delta is expressible as seed tokens, algorithms, or `components[X]` config, it *must* live in `createPrismTheme()` and the component is not wrapped (ADR-0001 + ticket 02: seed + algorithms, never hand-set map tokens).
- **`api-narrowing`** — it removes or renames props whose every use breaks the language (plasma's `Chip` precedent), and always names the replacement in the JSDoc.
- **`invariant`** — it enforces a rule consumers would otherwise break (e.g. a `useFeedback()` hook that routes through `App.useApp()` instead of context-blind statics).
- **`upstream-gap`** — it fixes an antd behavior/a11y defect, and must link the upstream issue and carry a deletion plan for when antd fixes it.

Anything else is not a component wrapper — it is a **block**. Expected v1 wrapper count is small (single digits); the count is a tracked number in `wrapped-registry.ts`, and additions need a review-level argument, not a whim.

**3. Not exported.** antd internals and de-facto-deprecated surfaces are simply absent. If a consumer needs something not exported, that is a design-system decision recorded here or in a ticket — never a "just import antd" escape hatch.

### Worked example: pass-through vs wrapped

`Button` is the most brand-visible surface in the system and is **not wrapped**. Every Spectral Refraction delta on it — 4px radius family, 80/160/280ms decelerating motion, brand-ink flood on live states, hairline borders — is expressible in `createPrismTheme()` via seed tokens and algorithms. Wrapping it would add a parity liability and zero API delta; `prism-llms` documents it as "no additional props beyond the antd base component" and points at antd's docs.

`DisplayTitle` **is wrapped**, because its entire reason to exist is that ADR-0001's signature move — the width axis as refraction (`wght 600, wdth up to 125`) — is a CSS `font-variation-settings` concern antd's `ThemeConfig` cannot express:

```tsx
// packages/ui/src/components/display-title/DisplayTitle.tsx
import { Typography } from 'antd';
import type { TitleProps } from 'antd/es/typography/Title';

export interface DisplayTitleProps extends TitleProps {
  /** 'refracted' applies the display width axis (wdth 125). Default. */
  width?: 'normal' | 'refracted';
}

export function DisplayTitle({ width = 'refracted', className, ...rest }: DisplayTitleProps) {
  const display = width === 'refracted' ? 'prism-display prism-display--refracted' : 'prism-display';
  return <Typography.Title className={[display, className].filter(Boolean).join(' ')} {...rest} />;
}
```

Both files carry a registry entry (the pass-through implicitly, by being generated; the wrapper explicitly):

```ts
// packages/ui/src/wrapped-registry.ts — hand-maintained
export const wrappedComponents = [
  {
    antdName: 'Typography.Title',
    exportName: 'DisplayTitle',
    removedProps: [],
    justification: 'brand-behavior',
  },
] as const;
```

### Parity across antd upgrades

antd bumps arrive as a normal dependency PR, and four mechanisms make the PR self-auditing:

1. `turbo run generate` (turbo task with `outputs: ["src/generated/**"]`, `inputs: ["$TURBO_DEFAULT$", "scripts/**"]` — plasma's checked-in-generated-source pattern) regenerates the proxies from the newly installed antd, so the diff in the PR *is* the antd delta: new components appear as new proxy modules (a minor for `prism-ui`), removed components fail the build loudly.
2. `packages/ui/test/parity.test.ts` asserts: every generated name resolves on the installed antd; no generated name also appears in `wrappedComponents` (a wrapped component must not simultaneously ship as a pass-through); and no hand-written file under `src/components/**` exports an antd name absent from the registry, so wrappers cannot appear outside the registry.
3. Wrapper prop parity is a type-level test per wrapper: `Omit<AntdProps, removedProps> extends WrapperProps` must hold, with `removedProps` non-empty only when the registry declares an `api-narrowing` justification. An antd prop rename or removal that a wrapper inherits breaks compilation in the wrapper's own test, not in a consumer's build.
4. The bump PR carries a changeset whose body names what antd added, deprecated, or removed and what Prism did about it; `prism-llms` regenerates from Fumadocs MDX in the same PR (ticket 16), and the "pass-through → see antd's llms.txt" pointer count is asserted so the catalog cannot silently drift from the proxies.

An antd **major** is a `prism-ui` major by definition: the pass-through tier's public types change with antd's.

## The taxonomy

| Layer | Is | Boundary style | Lives at |
| --- | --- | --- | --- |
| **components** | one antd component, pass-through or wrapped | composition-in (antd props, children, render props) | `./components/<name>` |
| **blocks** | pre-composed components, one reusable purpose, no page frame | data-in for canonical content, composition-in at the edges | `./blocks/<name>` |
| **pages** | full-page compositions that own the frame | data-in at the boundary | `./pages/<name>` |

Layering is downward only — `pages → blocks → components → antd`, plus `provider/` (hooks and `mergePrismTheme`) reachable from all three. No upward imports, no sibling imports (`block → block` is not allowed; shared pieces get extracted downward into components). Inside the repo this is the one place a lint rule is correct: oxlint restricted-imports per directory (`src/pages/**` may not import `../components`' siblings, etc.), because the consumer-facing invariant is already enforced structurally.

Prop conventions:

- **components** — antd's own props, full stop. A wrapper may add props; it removes them only under `api-narrowing`.
- **blocks** — typed data props for the canonical slots, `ReactNode` slot props for anything app-specific. `PageHeader` takes `{ title, subtitle?, breadcrumb?, actions?: ReactNode }`; `ComponentDemo` (docs format v1, ticket 12) takes `{ title?, description?, demo: ReactNode, source: string, language?: string }`. A `render*` prop is permitted only when no slot can cover the need, and blocks never accept props that encode an arbitrary JSX *tree* — that is what composition is for.
- **pages** — Prism-owned structural view-model props (nav tree, TOC entries, neighbours, frontmatter fields), `children` for the article body, and slot props for chrome (header, footer, sidebar overrides). `DocsShell` and `BlogLayout` are the v1 inhabitants (ticket 03); the landing page is deliberately **not** a prism-ui page — it is app-level composition of blocks (ticket 11).

Cross-cutting rules that make the taxonomy survive contact with the site:

- `prism-ui` ships **zero data fetching**: no `fetch`, no storage access, no app state. Every layer is a pure function of props + theme/link context. This is what keeps static export (ticket 03) trivial and every layer RTL-testable.
- `prism-ui` never imports `next/*` or `fumadocs-*`. Fumadocs objects are *data*; `pages` accept Prism-owned structural prop types that are deliberately shaped so the app can map loader output into them (`toPrismTree()` lives in `apps/site`). No `fumadocs-core` dependency — and no silent structural coupling either: the props are ours, and fumadocs changing shape becomes an app-side compile error, not a runtime surprise in a published package.
- Links resolve through `usePrismLink()`; a block that needs navigation takes `href` and renders the adapter, so routing stays the app's business.

## Styling extension points

Ordered from most to least sanctioned; each tier is public API, everything below it is off-limits.

1. **Tokens.** Anything token-expressible goes through `createPrismTheme()` and the `theme` prop, merged consumer-last by `mergePrismTheme()`. This is where brand divergence belongs (ADR-0001), including per-component config.
2. **antd's per-component `components[X]` config**, forwarded by `PrismProvider` and deep-merged per component — consumers can add `className`, `style`, or token overrides to any antd component without Prism's involvement.
3. **Documented hooks on Prism-owned components.** Every Prism-original component and block accepts `className`, `style`, and `styles?: Partial<Record<SlotName, CSSProperties>>` (antd v6's semantic-DOM convention) for its named slots, merges consumer classes last, and stamps a stable marker: class `prism-<name>` (`prism-block-page-header`) plus `data-prism="<name>"`. No hash classes anywhere (`hashed: false`, ticket 02).
4. **CSS custom properties.** `styles.css` is authored inside `@layer prism` so consumer utilities and app CSS always win the cascade; the `--prism-*` semantic variables emitted from `prism-tokens` (naming owned by ticket 09) are overridable on the theme class roots.
5. **Escape hatch of last resort**: composition — wrap the block, or pass a slot. That's it.

Off-limits, and worth saying in docs: descendant selectors into antd's internal DOM, `!important` against `prism-*` classes, and importing anything outside the `exports` map. If a documented hook can't express a need, the fix is a new hook (a ticket), not a selector.

## Deprecation and versioning

The package versions once (plasma-shaped independent changesets, ticket 01); the taxonomy is organizational, so a layer shows up in the *changelog and docs*, not in a separate version. Semver is read per layer:

- **Pass-through components**: Prism never deprecates them on its own. antd's deprecations propagate with a pointer to antd's migration note (minor), and antd's removals propagate at our next major.
- **Wrapped / Prism-original components**: adding an optional prop is a minor; removing or narrowing a prop is a major; changing a default value is a minor with the change in the changeset title, unless it visibly breaks layouts — then prefer adding a prop and deprecating the old behavior instead.
- **Blocks**: additive props within a minor. Breaking changes — prop removed or renamed, a required prop added, a documented hook broken — take a major with a `# Migration` section (already mandatory in the changeset validator, ticket 01); a major on `prism-tokens` must explain the `prism-ui` consequence.
- **Pages**: same as blocks, plus an explicit rule that internal DOM churn is *not* semver-breaking as long as the documented hooks (tier 3 above) still work — but it is announced in the changeset, because the whole point of the hook tiers is that nobody should have been reaching into the internals.

Deprecation lifecycle, uniform across layers: `@deprecated` JSDoc naming the replacement, a changeset, a "Deprecated" section in the component's docs page, removal no earlier than the next major. Since `prism-llms` is generated from the same Fumadocs MDX (map, ticket 01's drift lesson), a deprecation cannot exist in the docs and be absent from the LLM surface.

## Considered options

- **Wrap everything; antd hidden behind a Prism-only API** (the Mantine-UI-kit shape): declined. Every antd upgrade becomes a Prism upgrade, and the pass-through tier's value — antd's docs, MCP, and ecosystem apply verbatim — evaporates. Plasma's model (mostly generated pass-through, few overrides) is the one that survives upgrades.
- **Wrapper set decided case by case in review**: declined in favor of the closed four-justification list plus `wrapped-registry.ts`; "it seemed nice" is not a justification, and the registry makes the bar machine-checkable.
- **antd as `peerDependency`**: competitive — it lets consumers pin antd, but it forces every app to declare antd (inviting direct imports) and permits version skew. Chose **direct dependency**: pnpm's isolated `node_modules` then makes the invariant *physical* — apps cannot import antd because antd is not in their graph.
- **pages taking fumadocs types via a peer dependency**: declined. It couples the npm package to a docs framework for the sake of saving the app one adapter function; structural Prism-owned props keep `prism-ui` framework-free and put drift where it is caught at compile time in the app.
- **One package per taxonomy layer**: declined. The layers change together and would force near-lockstep releases (ticket 01 explicitly avoids lockstep); subpaths give the same ergonomics with one changeset.
- **Icons in the root barrel**: declined — 800+ names in every barrel consumer; `./icons` stays a separate subpath.
- **`PrismProvider` importing its own CSS** (plasma's `import '../styles.css'`): declined. It would force `sideEffects: true` and surrender cascade ordering; the app-imported `styles.css` keeps both.
- **Lint-enforced import invariant**: declined for consumers (codegen + package isolation, per plasma), adopted only for *internal* layering, where no codegen equivalent exists.

## Consequences

- `packages/ui`'s `package.json` grows real dependencies (`antd`, `@ant-design/icons`) and the wildcard `exports` map above; the placeholder `src/index.tsx` / `PrismPlaceholder` and `apps/site`'s usage are replaced by this layout.
- Two generator scripts and a parity test suite become load-bearing; the turbo `generate` task with checked-in outputs is what makes antd bumps reviewable.
- Wrapper count is a maintained number; each wrapper owes a registry entry, a justification, and (for `upstream-gap`) a deletion plan.
- `prism-llms` needs the pass-through pointer ("Prism re-exports N antd components unchanged — see antd's docs, but import from `@nanisoft/prism-ui`") and `## Blocks` / `## Pages` sections in the per-item format (ticket 16), so an agent discovers the composed layers without a second lookup.
- `apps/site` owns an adapter layer (`toPrismTree`), the `styles.css` import, and the `<html>` dark-mode class contract from ticket 02; `prism-ui` stays free of `next` and `fumadocs-*`.
- The site-i18n fog (map) stays open until the first Prism-authored string ships, at which point `PrismProvider` grows a Prism-locale merge slot rather than adopting antd's locale wholesale.
- ADR-0001's token-level demands land in `createPrismTheme()` (ticket 09), not here; this ADR's job is to make sure nothing about the wrapper layer *duplicates* what tokens can already say.
