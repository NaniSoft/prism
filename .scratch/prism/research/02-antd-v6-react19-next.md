# 02 — antd v6 + React 19 + Next.js App Router + static export

- **Researched:** 2026-09-14
- **Method:** primary sources only — npm registry metadata (`npm view`, exact `peerDependencies`/`dependencies`/`time`), package tarballs unpacked and read (`antd@6.6.4`, `@ant-design/cssinjs@2.1.2`, `@ant-design/nextjs-registry@1.3.0`), ant.design docs (v6), nextjs.org docs (16.3.5), tailwindcss.com + `preflight.css` source, GitHub API release data.
- **Feeds:** `@nanisoft/prism-ui` wrapper design, `apps/site` Next.js config, `createPrismTheme()` token architecture.

---

## 1. Exact versions & compat matrix (verified 2026-09-14)

| Package | Latest (`dist-tags.latest`) | Published | `peerDependencies` (verbatim) |
| --- | --- | --- | --- |
| `antd` | **6.6.4** | **2026-09-14** | `react: '>=18.0.0'`, `react-dom: '>=18.0.0'` |
| `@ant-design/icons` | **6.3.4** | 2026-08-31 | `react: '>=16.0.0'`, `react-dom: '>=16.0.0'` |
| `@ant-design/cssinjs` | **2.1.2** | 2026-04-02 | `react: '>=16.0.0'`, `react-dom: '>=16.0.0'` |
| `@ant-design/cssinjs-utils` | **2.1.2** | 2026-06-02 | `react: '>=18'`, `react-dom: '>=18'` |
| `@ant-design/nextjs-registry` | **1.3.0** | **2025-11-27** | `antd: '>=5.0.0'`, `next: '>=14.0.0'`, `react: '>=16.0.0'`, `react-dom: '>=16.0.0'`, `@ant-design/cssinjs: '>=1.0.0'` |
| `@ant-design/static-style-extract` | **2.1.0** | 2026-04-02 | **`antd: '>=6.0.0'`**, `react: '>=18.0.0'` |
| `@ant-design/v5-patch-for-react-19` | 1.0.3 | 2026-04-02 | `antd: '>=5.22.6'`, `react: '>=19.0.0'` — **not needed on antd v6** |
| `@ant-design/pro-components` | 2.8.10 (2025-07-17) | — | **`antd: '^4.24.15 \|\| ^5.11.2'`** — antd 6 **NOT** supported |
| `@ant-design/pro-components` | **`3.1.14-7`** (`beta` tag, 2026-08-28) | — | **`antd: '^6.0.0'`**, `react: '>=18.0.0'` |
| `@ant-design/x` | **2.9.0** | 2026-07-28 | **`antd: '^6.1.1'`**, `react: '>=18.0.0'` |
| `next` | **16.3.5** | 2026-09-12 | `react: '^18.2.0 \|\| 19.0.0-rc-… \|\| ^19.0.0'`; `node >= 20.9.0` |
| `next` (15.x line) | 15.5.25 (`backport` tag) | — | same react range |
| `react` / `react-dom` | **19.3.0** | 2026-09-11 | — |
| `fumadocs-core` | 16.15.10 | — | `next: '16.x.x'`, `react: '^19.2.0'` |
| `fumadocs-mdx` | 15.4.0 | — | `next: '^15.3.0 \|\| ^16.0.0'`, `react: '^19.2.0'` |
| `fumadocs-ui` | 16.15.10 | — | `next: '16.x.x'`, `react: '^19.2.0'`; deps `@fumadocs/tailwind: '0.1.1'` |

### antd 6.x minor timeline

| Minor | Date |
| --- | --- |
| 6.0.0 | 2025-11-21 |
| 6.1.0 | 2025-12-08 |
| 6.2.0 | 2026-01-13 |
| 6.3.0 | 2026-02-10 |
| 6.4.0 | 2026-05-14 |
| 6.5.0 | 2026-06-27 |
| 6.6.0 | 2026-08-10 |
| 6.6.4 | 2026-09-14 (today) |

Cadence is roughly one minor per 4–7 weeks with frequent patches — a `^6.6` caret range is safe; the 6.3.x window is where the `size` enum renames landed, so pin `>= 6.3.7` if you want to avoid eating those mid-flight.

### Two decisive ecosystem facts

1. **`@ant-design/pro-components@2` (latest) cannot be installed next to antd 6** without a peer-dep override. antd 6 support lives only in **v3, which is still `beta`** (`3.1.14-7`, `beta` dist-tag, first 3.x alpha in 2025, beta cadence Jul–Aug 2026). No stable 3.0.0 exists yet.
2. **`@ant-design/x@2` is antd-6-only** (`^6.1.1`) — X v2 and antd v6 are lockstep. X v1 is the antd-5 line.

---

## 2. What `@ant-design/nextjs-registry` actually does

Source read from the published tarball (`package/es/AntdRegistry.js`, v1.3.0). The whole component is:

```js
'use client';

import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';
import React, { useState } from 'react';

var AntdRegistry = function AntdRegistry(props) {
  var [cache] = useState(function () { return createCache(); });   // one cache, lazy init
  useServerInsertedHTML(function () {
    var styleText = extractStyle(cache, { plain: true, once: true });
    if (styleText.includes('.data-ant-cssinjs-cache-path{content:"";}')) {
      return null;
    }
    return React.createElement("style", {
      id: "antd-cssinjs",
      "data-rc-order": "prepend",
      "data-rc-priority": "-1000",   // inserted BEFORE client-generated antd styles
      dangerouslySetInnerHTML: { __html: styleText }
    });
  });
  return React.createElement(StyleProvider, { ...props, cache: cache });
};
```

What that means concretely:

- It is a **client component** (`'use client'` at the top) that owns a single cssinjs `CacheEntity` and supplies it via `StyleProvider`.
- It uses Next's **`useServerInsertedHTML`** hook to flush `extractStyle(cache, { plain: true, once: true })` as an inline `<style>` into `<head>` **before** any content that uses those rules.
- `data-rc-order="prepend"` + `data-rc-priority="-1000"` force the SSR block to be ordered **ahead of** the styles antd generates on the client, so hydration does not double-insert or reshuffle.
- All extra props are forwarded to `StyleProvider` — so `<AntdRegistry layer hashPriority="high">` works. **`layer` is the prop you want** (see §5).
- It does **not** write a `.css` file, does not do "whole export", and has no static-export-specific code path.

### Is it needed for `output: 'export'`? **Yes.**

`useServerInsertedHTML` runs during *any* server render, and a static export is still a build-time server render. Next's own docs, both sides:

> "When you run `next build` to generate a static export, Server Components consumed inside the `app` directory will run during the build, similar to traditional static-site generation. The resulting component will be rendered into static HTML for the initial page load."
> — <https://nextjs.org/docs/app/guides/static-exports>

> "Client Components are prerendered to HTML during `next build`."
> — <https://nextjs.org/docs/app/guides/static-exports>

> "During server rendering, styles will be extracted to a global registry and flushed to the `<head>` of your HTML. This ensures the style rules are placed before any content that might use them."
> — <https://nextjs.org/docs/app/guides/css-in-js>

So under `output: 'export'` the `<style id="antd-cssinjs">` block is **baked into each `out/*.html`** at build time. Without `AntdRegistry` the exported HTML would carry zero antd CSS and every route would paint unstyled.

The antd Next.js doc says the registry exists "to extract and inject antd's first-screen styles into HTML to avoid page flicker" and shows it wrapping `{children}` in `app/layout.tsx` — the only other note is that dot-notation sub-components (`<Select.Option />`) are not reachable from Server Components, so re-export them from a `'use client'` module (this matters for `prism-ui`'s re-export surface).

Sources: <https://ant.design/docs/react/use-with-next> · <https://github.com/ant-design/nextjs-registry>

---

## 3. Static builds: extraction, hashing, FOUC, dark mode without flash

### 3a. The two extraction modes (antd's own framing)

From <https://ant.design/docs/react/server-side-rendering>:

| Mode | Mechanism | Pros | Cons |
| --- | --- | --- | --- |
| **Inline** | `useServerInsertedHTML` + `extractStyle(cache)` (what `AntdRegistry` does) | no extra network request; per-page styles only | HTML grows; "the speed of the first screen rendering will be affected" (ref antd#39891) |
| **Whole export** | pre-bake a `.css` file with `@ant-design/static-style-extract`, ship via `<link>` | cacheable, reused across pages, HTML stays small | "if there are multiple themes in the page, additional baking is required" |

`@ant-design/static-style-extract@2.1.0` is **antd-6-only** (`peerDependencies.antd: '>=6.0.0'`) — it is the v6-native whole-export tool:

```tsx
import { extractStyle } from '@ant-design/static-style-extract';
const css = extractStyle((node) => (
  <ConfigProvider theme={{ token: { colorPrimary: 'red' } }}>{node}</ConfigProvider>
));
fs.writeFileSync('./public/antd.min.css', css);
```

It also accepts `{ includes: ['Button'] }` for partial extraction. Run it from a `prebuild` npm hook — a natural fit for static export, since the output is a plain file in `public/`.

### 3b. Hashing: what to turn off and why

`@ant-design/cssinjs@2.1.2` `StyleProviderProps` (read from `es/StyleContext.d.ts`):

```ts
interface StyleContextProps {
  cache: CacheEntity;
  defaultCache: boolean;
  hashPriority?: 'low' | 'high';   // 'low' => :where(.css-xxxx) — needs Chrome 88+
  container?: Element | ShadowRoot;
  ssrInline?: boolean;             // not recommended
  transformers?: Transformer[];    // no dynamic update
  linters?: Linter[];              // no dynamic update
  layer?: boolean;                 // wrap css in @layer to avoid global style conflict
  autoPrefix?: boolean;
}
```

`extractStyle(cache, { plain?: boolean; types?: 'style' | 'token' | 'cssVar' | …; once?: boolean })` — **`types` is the lever most people miss**: you can extract *only* the CSS-variable token block and skip per-component style rules entirely.

`ThemeConfig.hashed` (antd `config-provider/context.d.ts`): "是否开启 `hashed` 属性。如果你的应用中只存在一个版本的 antd，你可以设置为 `false` 来进一步减小样式体积." For prism-ui — where apps import only prism-ui, which imports only one antd — **`hashed: false` is correct**: it removes the `.css-vQsMHC` patch classes entirely, shrinks output, and makes class names deterministic across builds (good for static HTML diffing / visual regression later).

Confirmed from `antd@6.6.4/dist/antd.css`: it contains **zero** `css-XXXXXX` hashed classes and **zero** `@layer` blocks, and 1164 distinct `--ant-*` custom properties. It is a theme-independent, hashed-free stylesheet that references variables only.

### 3c. Where CSS variables actually land (the load-bearing detail)

Read from `@ant-design/cssinjs@2.1.2/es/util/css-variables.js` + `es/hooks/useCacheToken.js`:

```js
const baseSelector = `${where({ hashCls, hashPriority })}.${hashId}`;
const selector = scopes.length ? scopes.map(s => `${baseSelector}.${s}`).join(', ') : baseSelector;
return `${selector}{${Object.entries(cssVars).map(([k,v]) => `${k}:${v};`).join('')}}`;
```

and in `useCacheToken`, `transformToken(mergedDerivativeToken, cssVar.key, …)` → `hashId` **is `cssVar.key`**. So the emitted block is literally:

```css
.css-var-root { --ant-color-primary: #1677ff; … }
```

…where `css-var-root` is the value of `theme.cssVar.key`. Per-component CSS then reads `var(--ant-color-primary)`.

**This is the whole no-flash strategy in one sentence:** because theme identity lives entirely in one `.cssVar-key { --ant-*: … }` ruleset and component CSS is theme-agnostic, you can bake *both* variable sets at build time and flip themes with a class swap — no runtime regeneration, no flash.

Default keys, from `config-provider/hooks/useTheme.js` and `theme/useToken.js`:

```js
const themeKey = useId();
const cssVarKey = `css-var-${themeKey.replace(/:/g, '')}`;   // ← random per mount
// ...
key: themeConfig.cssVar?.key || cssVarKey
```

and antd ships a **dev warning for exactly this**:

> `'Missing key in `cssVar` config. Please upgrade to React 18 or set `cssVar.key` manually in each ConfigProvider inside `cssVar` enabled ConfigProvider.'`

So `cssVar.key` **must be set explicitly** by `createPrismTheme()` — a `useId()`-derived key is unstable across the build/client boundary and across builds, which would break static output.

### 3d. Dark mode without flash — recommended strategy for static export

1. **Enable `cssVar` + `hashed: false`** with a *stable* key per appearance:
   ```tsx
   <ConfigProvider theme={{ cssVar: { key: 'prism-light', prefix: 'prism' }, hashed: false }}>
   <ConfigProvider theme={{ cssVar: { key: 'prism-dark',  prefix: 'prism' }, hashed: false, algorithm: theme.darkAlgorithm }}>
   ```
   Distinct keys give two non-colliding variable namespaces (`.prism-light`, `.prism-dark`).
2. **Bake both variable blocks at build time.** Render a throwaway tree per appearance and call `extractStyle(cache, { types: 'cssVar', plain: true })` (via `@ant-design/static-style-extract`, or a custom build step) → write `public/prism-tokens.css` containing `.prism-light{…}` and `.prism-dark{…}`. This is the "whole export" mode; antd explicitly warns it requires extra baking per theme, which is exactly what this step does.
3. **Ship both blocks in one cacheable `<link>`** and put the *active* key on `<html>`:
   ```html
   <html class="prism-dark">
   ```
4. **Kill the flash with a blocking inline script in `<head>`** (before the stylesheet, before paint) that reads the persisted choice — `localStorage` for an explicit toggle, `matchMedia('(prefers-color-scheme: dark)')` for system — and sets the class synchronously. Static export has no server, so this script is the only place the decision can be made pre-paint. Keep it tiny and inline (it must not be a deferred module).
5. **Client hydration:** `PrismProvider` reads the same value in `useState`'s initialiser and renders the matching `ConfigProvider`. Because component CSS is shared and only variable *values* differ, the first client render produces byte-identical class names to the exported HTML → no hydration mismatch, no restyle.

Why not `algorithm` alone with no `cssVar`? Without CSS variables, changing `algorithm` regenerates every component's style rules at runtime — under a static export the pre-baked HTML has the *light* rules inline, so the first paint is light and then snaps dark. That is the FOUC. `cssVar` is what converts a runtime style swap into a static class swap.

Fallback if the two-namespace dance is unwanted: `theme={{ zeroRuntime: true }}` (antd 6.0.0+) plus `import 'antd/dist/antd.css'`. antd's docs note the precompiled file "excludes hashed class names" and, when combined with `@layer`, "must explicitly specify a layer" via `@import url(antd.css) layer(antd)`. Verified: `antd@6.6.4/dist/antd.css` is 1,018,549 bytes, variables on a `.css-var-*` scope, no `@layer`, no hash classes. Downside: it ships rules for all 74 components whether used or not, so it is the blunt option — right as a diagnostic, not as the default.

Sources: <https://ant.design/docs/react/customize-theme> · <https://ant.design/docs/react/server-side-rendering> · <https://ant.design/docs/react/compatible-style>

---

## 4. `ConfigProvider` theme schema — token / components / algorithm for multi-brand packs

Exact `ThemeConfig` from `antd@6.6.4/config-provider/context.d.ts`:

```ts
export type ComponentsConfig = {
  [key in keyof OverrideToken]?: OverrideToken[key] & {
    algorithm?: boolean | MappingAlgorithm | MappingAlgorithm[];
  };
};

export interface ThemeConfig {
  token?: Partial<AliasToken>;
  components?: ComponentsConfig;
  algorithm?: MappingAlgorithm | MappingAlgorithm[];   // default defaultAlgorithm
  inherit?: boolean;                                    // default true
  hashed?: boolean;                                     // default true
  cssVar?: boolean | CSSVarConfig;                      // { prefix, key, ignore, unitless, preserve }
  zeroRuntime?: boolean;                                // v6.0.0+
  override?: OverrideToken;
}
```

Preset algorithms: `theme.defaultAlgorithm`, `theme.darkAlgorithm`, `theme.compactAlgorithm`. Compose as an array:

```tsx
theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] }}
```

### What it can do for `createPrismTheme()`

- **Seed-token-level brand mapping works well.** Set `colorPrimary`, `borderRadius`, `fontSize`, `controlHeight`, `wireframe`, `motion` and let antd derive all map/alias tokens. antd: "In most cases, using Seed Tokens is sufficient for custom themes."
- **`components[Name].algorithm` gives per-component re-derivation.** The documented restriction: "By default, all component tokens can only override global token and will not be derived based on Seed Token." Set `algorithm: true` to inherit the global algorithm for that component, or pass a custom one. This is the correct hook for "this brand's buttons derive differently."
- **Nesting + `inherit` is the multi-brand mechanism.** Nested `ConfigProvider`s inherit unchanged tokens; `inherit: false` isolates a subtree. A brand pack is just a `ThemeConfig`; brand *packs* are a record of them.
- **`cssVar.prefix` renames the variable namespace** (default follows `prefixCls`, i.e. `ant`). `cssVar: { prefix: 'prism' }` yields `--prism-color-primary` — important for a wrapper library so prism's variables never collide with a host app's raw antd variables.
- **`override` exists** in the type (antd's mechanism for the `:where`-free "override" token layer and for multi-theme-alongside-multi-theme setups).

### Limits — where a custom token tier does *not* map cleanly

- **Map tokens are not a real override tier.** antd's own warning on `colorBgBase` / `colorTextBase`: "PLEASE DO NOT USE this Seed Token directly in the code!" Gradient relationships (hover/active/bg/border) are produced by the algorithm; overriding individual map tokens (`colorPrimaryBg`) breaks those relationships. **Rule for `createPrismTheme()`: prism tokens should translate to seed tokens + algorithms, never to hand-set map tokens.** Accept map-token overrides only as an explicit escape hatch.
- **Component token overrides are not seed-derived by default** (see above) — every `components[X]` block that expects derivation needs `algorithm: true`, otherwise it silently behaves as a flat override.
- **Alias tokens are a flat overlay**, not a tier: `AliasToken` inherits all Seed + Map properties, so an alias override can mask a map value you meant to derive.
- **`token` mutation is shallow-merged, `components` is per-key deep-merged** (verified in `useTheme.js`: `mergedComponents[componentName] = { ...mergedComponents[componentName], ...theme.components[componentName] }`) — so a prism base theme + brand pack merge is predictable at the component level.
- **Static methods bypass context.** `message.xxx` / `Modal.xxx` / `notification.xxx` ignore `ConfigProvider`; use the `App` component or `Modal.useModal()` + `contextHolder`. prism-ui should re-export `App` and mandate it in `DocsShell`.
- **Toggling `theme` between `undefined` and an object remounts children** — pass `{}` instead of `undefined`. Relevant to a provider that conditionally applies a theme.
- Token consumption for non-antd surfaces: `const { token } = useToken()` (hook) and `theme.getDesignToken(config)` (static, works outside React). The latter is the bridge for emitting prism's own CSS custom properties from the same source of truth.

Sources: <https://ant.design/docs/react/customize-theme> · antd 6.6.4 type definitions

---

## 5. Tailwind preflight vs antd

### The conflict surface (exact rules, from `tailwindcss/preflight.css` @ main)

```css
*,::after,::before,::backdrop,::file-selector-button {
  box-sizing: border-box;
  border: 0 solid;          /* ← kills antd's implicit borders on variant="outlined" controls */
}
button, input, select, optgroup, textarea, ::file-selector-button {
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  border-radius: 0;         /* ← kills antd's border-radius unless the component sets it */
  background-color: transparent;  /* ← the classic "antd Button is transparent" bug */
  opacity: 1;
}
h1,h2,h3,h4,h5,h6 { font-size: inherit; font-weight: inherit; }
ol,ul,menu { list-style: none; }
img,svg,video,canvas,audio,iframe,embed,object { display: block; vertical-align: middle; }
[hidden]:where(:not([hidden="until-found"])) { display: none !important; }
```

Tailwind v4 puts preflight in `@layer base`:

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
```

Note the asymmetry: unlayered antd CSS **beats** `@layer base` preflight (unlayered wins over layered in the cascade), so v4 is *less* broken than v3 by default — but the moment either side is placed in a layer wrongly, or antd goes into `@layer antd` *after* `base`, the `border: 0 solid` and `background-color: transparent` resets resurface. `antd@6.6.4/dist/reset.css` (3,587 B, opt-in, **not** imported by `antd.css`) also fights preflight head-on — it sets `h1..h6 { margin: 0 0 .5em; font-weight: 500 }`, `ol,ul,dl { margin: 1em 0 }`, `img { vertical-align: middle; border-style: none }`. **Do not import `antd/dist/reset.css` alongside Tailwind.**

### antd's official answer: `@layer` ordering

<https://ant.design/docs/react/compatible-style> prescribes lowering antd's selector weight and ordering layers:

```tsx
<StyleProvider layer>          {/* must wrap ConfigProvider — "you must wrap ConfigProvider to update icon-related styles" */}
  <ConfigProvider><MyApp /></ConfigProvider>
</StyleProvider>
```

This turns `:where(.css-bAMboO).ant-btn` into `@layer antd { … }`. Then:

**Tailwind v4** — "Place `antd` in the right position":

```less
@layer theme, base, antd, components, utilities;
@import 'tailwindcss';
```

**Tailwind v3** — "Place `tailwind-base` before `antd`":

```less
@layer tailwind-base, antd;
@layer tailwind-base { @tailwind base; }
@tailwind components;
@tailwind utilities;
```

Two caveats from the same page: (1) in SSR the `@layer …, antd;` declaration must be present **before** the SSR-injected style block — under static export that means the layer-order statement lives in the global stylesheet that loads before the inlined `antd-cssinjs` style; (2) with `zeroRuntime`, "the precompiled antd.css must explicitly specify a layer" via `@import url(antd.css) layer(antd)`, otherwise its unlayered specificity defeats the mechanism.

### The prism-specific answer

**The conflict may not exist at all.** `fumadocs-core@16.15.10` has **no Tailwind dependency** (verified `dependencies`: yaml, shiki, remark, unified, zbsearch, remark-gfm, …). Tailwind arrives only via `fumadocs-ui` (`@fumadocs/tailwind@0.1.1`) — and the map already rules out fumadocs-ui styling. So a headless fumadocs + prism-ui site ships **no Tailwind preflight unless prism adds it**.

Recommendation: **do not add Tailwind to `apps/site` in v1.** antd's token system plus `useToken()` covers the styling need, and dropping preflight removes an entire class of cascade bugs from a wrapper library whose selling point is "it just looks right." If Tailwind is added later (v2 brand gallery, marketing pages), enable `<StyleProvider layer>` from day one and fix the layer order — do not reach for `!important`.

Source: <https://ant.design/docs/react/compatible-style> · <https://tailwindcss.com/docs/preflight> · <https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/preflight.css>

---

## 6. antd v5 → v6 deltas that hit a wrapper library

From <https://ant.design/docs/react/migration-v6>. Grouped by blast radius for `prism-ui`.

### Environment

- **React ≥ 18**; React ≤ 17 unsupported. **Remove `@ant-design/v5-patch-for-react-19`** — its import is no longer needed.
- **`@ant-design/icons` ≥ 6.0.0 required**; icons v6 is *incompatible with antd v5* — upgrade both together. (prism-ui re-exports `@ant-design/icons`, so this is a prism-ui peer-dep constraint: `@ant-design/icons@^6.3.4`.)
- Modern browsers only; IE unsupported; **CSS variables on by default**.

### Structural (highest blast radius for a wrapper)

- **Component DOM structure changed across many components.** Anything in prism-ui that targets internals (`.ant-*` selectors in CSS or tests) must be re-verified. This is the single most likely source of silent breakage.
- **`size` enum unification** (landed 6.3.0–6.3.2): `default` → `medium` on Avatar, Badge, Card, Progress, Steps, Switch, Spin; Descriptions `default`→`large`, `middle`→`medium`; Table and Divider `middle`→`medium`. A wrapper that forwards a `size` prop needs a translation layer or a documented breaking change.
- **`bordered` → `variant`** across Input, Select, Cascader, TreeSelect, DatePicker, Card, Tag (`bordered={false}` → `variant="filled"`), InputNumber.
- **`direction` → `orientation`** on Space, Space.Compact, Splitter, Steps, Collapse (`expandIconPosition` → `expandIconPlacement`), Divider (`type` → `orientation`), Timeline (`mode="left|right"` → `"start|end"`).
- **`items` everywhere** — `Anchor`, `Breadcrumb`, `Descriptions`, `Menu`, `Tabs`, `Timeline` all lose `children`/`routes` forms. Wrappers that render `.*.Item` children break.
- **`styles` / `classNames` object slots replace `xxxStyle` / `xxxClassName`**: `headStyle`→`styles.header`, `bodyStyle`→`styles.body`, `overlayStyle`→`styles.root`, `dropdownStyle`→`styles.popup.root`, `contentWrapperStyle`→`styles.wrapper`, `drawerStyle`→`styles.section`, `labelStyle`→`styles.label`, `valueStyle`→`styles.content`, `listStyle`→`styles.section`. **prism-ui should expose its own `styles`/`classNames` slots that map 1:1 onto antd's, since that is antd's forward direction.**
- **`destroyOnClose`/`destroyInactivePanel`/`destroyPopupOnHide`/`destroyInactiveTabPane` → `destroyOnHidden`.**

### Behavioural

- **Overlay mask blur:** new `mask` option. Blur was **default-on in 6.0.0–6.2.x**, **default-off from 6.3.0**; re-enable via `ConfigProvider` `modal={{ mask: { blur: true } }}` and `drawer={{ mask: { blur: true } }}`. A wrapper must pick and document this deliberately (v6.6.x default = off).
- **`Tag` no longer has a trailing `margin-inline-end`**; restore via `ConfigProvider` `tag.styles.root: { marginInlineEnd: 8 }`. Wraps into prism's base theme, not per-call-site.
- **`Form.List` `onFinish` no longer includes unregistered child items.**
- **`showArrow` defaults to true** on Select / Cascader / TreeSelect; hide with `suffixIcon={null}`.
- **`Select` etc.: `onDropdownVisibleChange` → `onOpenChange`.**

### Deprecated (still functional in v6, removed in v7 — the wrapper's debt clock)

A long tail of renames that antd keeps warning about, including: Alert `message`→`title`, `closeText`/`closeIcon`→`closable.*`; Avatar.Group `maxCount`→`max={{count}}`; BackTop → `FloatButton.BackTop`; Button `Group`→`Space.Compact`; Button `iconPosition`→`iconPlacement`; Calendar `dateCellRender`→`cellRender`; Carousel `dotPosition`→`dotPlacement`; Dropdown `Dropdown.Button`→`Space.Compact + Dropdown + Button`; Image `visible`→`open`; Modal `maskClosable`→`mask.closable`; Notification `btn`→`actions`, `message`→`title`; Progress `strokeWidth`/`width`→`size`, `trailColor`→`railColor`; Slider `tipFormatter`→`tooltip.formatter`, `onAfterChange`→`onChangeComplete`; Space `direction`→`orientation`, `split`→`separator`; Statistic `valueStyle`→`styles.content`, `<Statistic.Countdown/>`→`<Statistic.Timer type="countdown"/>`; Steps `labelPlacement`→`titlePlacement`, `progressDot`→`type="dot"`; Table `pagination.position`→`pagination.placement`, `onSelectAll`/`onSelectInvert`/`onSelectMultiple`/`onSelectNone`→`onChange`; Tabs `tabPosition`→`tabPlacement`, `indicatorSize`→`indicator={{size}}`; Transfer `operations`→`actions`; Tooltip `overlay*`→`classNames.root`/`styles.*`; ConfigProvider `dropdownMatchSelectWidth`→`popupMatchSelectWidth`.

**Wrapper-library implication:** prism-ui must not forward deprecated props verbatim, or v7 becomes a prism breaking release. Instead prism-ui should (a) accept its own prop names matching the *v6/v7* spelling, (b) map to v6 APIs, and (c) run `@ant-design/cli`'s deprecation scan (`antd migrate` / `antd lint` / `antd doctor`) in CI to catch leakage.

### Migration mechanics

- Recommended path: land on latest v5.x, clear every deprecation warning, then upgrade. Run the Ant Design CLI to scan for deprecated APIs.
- An "atomic migration" (installing v6 under a package alias alongside v5) exists but is **explicitly not recommended** — irrelevant for a greenfield monorepo like prism.

---

## 7. Ecosystem: what "complete antd ecosystem" means on antd 6 + React 19

### ProComponents — **the weak link**

- `@ant-design/pro-components@2.8.10` (latest, 2025-07-17, **14 months stale**): `peerDependencies.antd: '^4.24.15 || ^5.11.2'`. **Not installable against antd 6 without `pnpm.overrides` / `--legacy-peer-deps`, and unsupported.**
- `@ant-design/pro-components@3.1.14-7` (`beta` dist-tag, 2026-08-28): `peerDependencies.antd: '^6.0.0'`, `react: '>=18.0.0'`. Deps are already v6-native (`@ant-design/cssinjs ^2.1.2`, `@ant-design/cssinjs-utils 2.1.2`, `@ant-design/icons ^6.3.2`). **But there is no stable 3.0.0** — the last stable line is 2.8.10.
- Sub-packages mirror this: `@ant-design/pro-layout@7.22.7` / `@ant-design/pro-table@3.21.0` are v2-era.
- GitHub releases for the repo stop at `@ant-design/pro-components@2.8.6` (2025-02-17) in the visible release list; the repo's `MIGRATION-GUIDE.md` on `master` is a third-party fork cherry-pick doc (`topiam/fork`), **not** an official v2→v3 migration guide. There is no official migration document yet.
- v3 beta drops `@emotion/css`-era styling in favour of cssinjs-utils and adds `@dnd-kit/*`, `swr`, `lodash-es`, `path-to-regexp@8` — a real dependency-surface change for a wrapper library.

**Consequence for the map's "Dashboard/admin catalog":** it is blocked on ProComponents v3 reaching stable, or it must be built on plain antd v6 (Table + Form + Layout + Flex) inside prism-ui blocks. Given prism's taxonomy (components → blocks → pages, everything npm-delivered), building `ProTable`-lite blocks on raw antd v6 is the lower-risk path and removes a beta dependency from the published package. Revisit ProComponents once 3.0.0 ships.

### Ant Design X — **healthy, antd-6-native**

- `@ant-design/x@2.9.0` (2026-07-28): `peerDependencies.antd: '^6.1.1'`, `react: '>=18.0.0'`. Deps already v6-native (`@ant-design/cssinjs ^2.0.1`, `@ant-design/cssinjs-utils ^2.0.2`, `@ant-design/icons ^6.0.0`, `@ant-design/fast-color ^3.0.0`).
- X v1.x is the antd-5 line; **v2 requires antd 6** — <https://x.ant.design/docs/react/migration-v2>: "Please upgrade antd in your project to the latest version of 6.x first," with 2.1.0 noted as broadly antd-5-compatible.
- X v2 breaking changes to plan for: `useXAgent` removed, `useXChat` fully refactored, new `useXConversations` and Chat Provider interface; `Bubble` `messageRender`→`contentRender`; `Bubble.List` needs explicit height for scroll hosting; `Sender` `actions`→`suffix`; `Attachments.FileCard` → standalone `FileCard` with `size`→`byte`; `ThoughtChain` redesigned and `items[].extra` removed; runtime tooling moved to **`@ant-design/x-sdk`**.

### Next.js + fumadocs

- `next@16.3.5` accepts `react ^18.2.0 || ^19.0.0`, needs `node >= 20.9.0`; 15.x line is in maintenance (`backport` tag = 15.5.25). **Go Next 16** — fumadocs-core 16.x peer-requires `next: '16.x.x'` anyway.
- `fumadocs-core@16.15.10` peer-requires `react: '^19.2.0'` → forces React ≥ 19.2, so `react@19.3.0` is the floor.
- `fumadocs-core` carries **no Tailwind**; `fumadocs-mdx@15.4.0` peer-requires `next ^15.3 || ^16`, `react ^19.2.0`.

---

## 8. Pinned-version recommendation (as of 2026-09-14)

| Package | Pin | Why |
| --- | --- | --- |
| `antd` | `^6.6.4` (floor `>=6.3.7`) | current latest (released today); `>=6.3.7` clears the 6.3.x `size` enum churn; `^6.6` for new minors |
| `react` / `react-dom` | `^19.3.0` | antd peer `>=18`, but `fumadocs-core@16` forces `^19.2.0`; 19.3.0 is current |
| `next` | `^16.3.5` | current stable; required by fumadocs-core 16; `output: 'export'` unchanged since v14 |
| `@ant-design/icons` | `^6.3.4` | **required** by antd 6; re-export from prism-ui, no separate icons package |
| `@ant-design/cssinjs` | `^2.1.2` | peer of antd 6 / nextjs-registry / static-style-extract |
| `@ant-design/cssinjs-utils` | `^2.1.2` | needed by `@ant-design/x` and pro-components v3 |
| `@ant-design/nextjs-registry` | `^1.3.0` | devDeps already on `next ^16.0.4` + `antd ^6.0.0`; use `<AntdRegistry layer>` |
| `@ant-design/static-style-extract` | `^2.1.0` (devDep of `apps/site`) | antd-6-only whole-export; generates `prism-tokens.css` at build time |
| `@ant-design/v5-patch-for-react-19` | **omit** | antd 6 does not need it; migration-v6 says remove |
| `@ant-design/pro-components` | **omit for v1** | latest (2.8.10) does not support antd 6; v3 is `3.1.14-7` beta. Revisit at 3.0.0 stable |
| `@ant-design/x` | `^2.9.0` — **only when the AI/chat surface is built** | antd-6-only; peer `^6.1.1` satisfied by 6.6.4 |
| `fumadocs-core` / `fumadocs-mdx` | `^16.15.10` / `^15.4.0` | headless, no Tailwind, `next 16.x` + `react ^19.2` |
| `fumadocs-ui` | **omit** | map decision (headless); also the only thing that would pull in Tailwind |
| `typescript` | `^5.9.x` | antd 6.6.4 devDeps on `typescript ^5.9.3` |

### Non-version pins (configuration, not packages)

| Setting | Value |
| --- | --- |
| `next.config.ts` | `output: 'export'` |
| `ConfigProvider theme` | `{ cssVar: { key: 'prism-light' \| 'prism-dark', prefix: 'prism' }, hashed: false }` — **`cssVar.key` must be explicit** (antd warns if you rely on `useId`) |
| `StyleProvider` | `<AntdRegistry layer>` — only if/when Tailwind is introduced |
| `antd/dist/reset.css` | **do not import** (conflicts with any future preflight; antd's own component CSS already handles resets) |
| Node | `>= 20.9.0` (Next 16 engine) |
| ESM | ESM-only is fine: `@ant-design/nextjs-registry` ships `module: ./es/index`, `main: ./lib/index`; antd 6.6.4 ships `es/` + `lib/` + `dist/` |

---

## 9. Risks / open items

1. **ProComponents is the single biggest schedule risk.** antd 6 landed 2025-11-21 and ProComponents still has no stable antd-6 release ~10 months later. Any dashboard/admin block that leans on `ProTable`/`ProLayout` should be planned against plain antd v6 until 3.0.0 ships. Feeds the map's "Dashboard/admin catalog" item.
2. **`cssVar.key` stability is a silent-failure trap.** Antd defaults it to `css-var-${useId()}`. If `createPrismTheme()` does not set it, static HTML and client hydration disagree and dark mode flashes. Must be a lint/test rule in prism-ui.
3. **DOM-structure changes in v6 are unenumerated.** antd says "DOM structure of many components was optimized" without a per-component list — prism-ui's RTL tests and any `styles.*` slot mappings need a full sweep, not a diff review.
4. **`zeroRuntime` is a real v6 feature but poorly documented** — no dedicated doc page (404 at `/docs/react/zero-runtime`; the only coverage is a section on `customize-theme` and a note on `compatible-style`). Treat it as a diagnostic lever, not the default, until antd documents it properly.
5. **`@ant-design/x` moves fast** (2.6.0 → 2.9.0 between April and July 2026, with a `2.8.0-beta` line). Pin tightly and upgrade deliberately; the v1→v2 migration was large.
6. **antd deprecated props are removed in v7.** prism-ui must speak v6 spellings only, and CI should run `@ant-design/cli` (`antd lint`, `antd migrate`, `antd doctor`) over `packages/prism-ui` to catch forwarding of deprecated props.

---

## 10. Source URLs

**antd (v6 docs, primary)**
- Migration v5→v6: <https://ant.design/docs/react/migration-v6>
- Customize theme (token/components/algorithm/cssVar/hashed/zeroRuntime): <https://ant.design/docs/react/customize-theme>
- Server-side rendering (inline vs whole export, `hashPriority`): <https://ant.design/docs/react/server-side-rendering>
- CSS compatible (`@layer`, StyleProvider `layer`, Tailwind v3/v4 ordering): <https://ant.design/docs/react/compatible-style>
- Use with Next.js (`AntdRegistry`): <https://ant.design/docs/react/use-with-next>
- FAQ (Tailwind priority, dot-notation sub-components in App Router): <https://ant.design/docs/react/faq>
- Docs index: <https://ant.design/docs/react/introduce>

**Packages (npm registry metadata + unpacked tarballs, 2026-09-14)**
- <https://www.npmjs.com/package/antd> (6.6.4)
- <https://www.npmjs.com/package/@ant-design/icons> (6.3.4)
- <https://www.npmjs.com/package/@ant-design/cssinjs> (2.1.2)
- <https://www.npmjs.com/package/@ant-design/cssinjs-utils> (2.1.2)
- <https://www.npmjs.com/package/@ant-design/nextjs-registry> (1.3.0) · source: <https://github.com/ant-design/nextjs-registry>
- <https://www.npmjs.com/package/@ant-design/static-style-extract> (2.1.0)
- <https://www.npmjs.com/package/@ant-design/v5-patch-for-react-19> (1.0.3)
- <https://www.npmjs.com/package/@ant-design/pro-components> (2.8.10 / 3.1.14-7 beta)
- <https://www.npmjs.com/package/@ant-design/x> (2.9.0)

**GitHub (releases / source)**
- antd releases: <https://github.com/ant-design/ant-design/releases> (6.6.4 published 2026-09-14T06:25:28Z)
- pro-components releases: <https://github.com/ant-design/pro-components/releases>
- antd Next.js examples: <https://github.com/ant-design/ant-design-examples/tree/main/examples> (`with-nextjs-app-router-inline-style`, `with-nextjs-extract-style`, `with-nextjs-generate-css-on-demand`, `with-nextjs-inline-style`)
- Tailwind preflight source: <https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/preflight.css>

**Next.js (16.3.5 docs)**
- Static export (`output: 'export'`, last updated 2026-08-25): <https://nextjs.org/docs/app/guides/static-exports>
- CSS-in-JS (`useServerInsertedHTML`, lists `ant-design` as supported): <https://nextjs.org/docs/app/guides/css-in-js>

**ProComponents / Ant Design X / Fumadocs / Tailwind**
- <https://procomponents.ant.design/>
- <https://x.ant.design/docs/react/introduce>
- <https://x.ant.design/docs/react/migration-v2>
- <https://fumadocs.dev/> (core 16.15.10 / mdx 15.4.0 / ui 16.15.10)
- <https://tailwindcss.com/docs/preflight>
