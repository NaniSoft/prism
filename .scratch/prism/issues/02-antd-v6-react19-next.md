---
Type: research
Status: resolved
Labels: wayfinder:research, ready-for-agent
---

## Question

How do antd v6 + React 19 + Next.js App Router + static export fit together for (a) a wrapper component library and (b) a statically exported docs site?

Cover:
- Current versions & compat matrix: antd v6, `@ant-design/icons`, React 19, Next 15/16 — as of September 2026.
- `@ant-design/nextjs-registry` (or successor): App Router SSR style extraction — and what `output: 'export'` changes.
- antd CSS-in-JS (@ant-design/cssinjs) in static builds: extraction, hashing, FOUC risks, dark mode without flash.
- `ConfigProvider` theme token schema (`token` / `components` / `algorithm`): capabilities and limits for mapping a custom token tier onto antd tokens; dark algorithm composition; multi-brand theme packs.
- Tailwind preflight vs antd resets: the conflict surface, given surrounding tooling (fumadocs ecosystem) leans Tailwind.
- antd v5 → v6 deltas relevant to a wrapper library (breaking changes, deprecations).
- What "complete antd ecosystem" means concretely: ProComponents / Ant Design X versions compatible with antd v6 + React 19 (feeds the later dashboard/admin fog, and any blocks that lean on them).

Output: integration guidance + a pinned-version recommendation for the monorepo.

## Answer

The stack works, and static export is the *easy* case, not the hard one: `@ant-design/nextjs-registry@^1.3.0` is still the right tool because `useServerInsertedHTML` fires during build-time prerender, so the `<style id="antd-cssinjs">` block is baked into every `out/*.html`. Pin `antd@^6.6.4` (released 2026-09-14, floor `>=6.3.7`), `react@^19.3.0`, `next@^16.3.5`, `@ant-design/icons@^6.3.4`; drop `@ant-design/v5-patch-for-react-19`. For dark mode with no flash, set `cssVar: { key: 'prism-light' | 'prism-dark', prefix: 'prism' }, hashed: false` — because all theme identity collapses into one `.{cssVar.key}{ --ant-*: … }` ruleset while component CSS is theme-agnostic, both variable sets can be pre-baked with `@ant-design/static-style-extract@^2.1.0` (`extractStyle(cache, { types: 'cssVar' })`) and flipped by an inline blocking script that swaps a class on `<html>`. `createPrismTheme()` must set `cssVar.key` explicitly (antd otherwise derives it from `useId()`, which is unstable across the build/client boundary). `createPrismTheme()` should translate prism tokens to **seed tokens + algorithms**, never hand-set map tokens, and set `components[X].algorithm: true` wherever derivation is expected. The Tailwind preflight conflict is mostly moot: headless `fumadocs-core@16` has no Tailwind dependency — only `fumadocs-ui` (excluded) pulls `@fumadocs/tailwind`; if Tailwind arrives later, use `<AntdRegistry layer>` plus antd's documented `@layer theme, base, antd, components, utilities` order. **The real blocker is ProComponents**: latest `@ant-design/pro-components@2.8.10` peer-requires `antd ^4.24 || ^5.11` and cannot take antd 6; antd-6 support exists only in the `3.1.14-7` **beta**, so v1 should omit it and build dashboard blocks on plain antd v6. `@ant-design/x@^2.9.0` is healthy and antd-6-only (`^6.1.1`). Full findings, exact peer-dependency tables, the v5→v6 breaking-change list, and source URLs: `.scratch/prism/research/02-antd-v6-react19-next.md`.

