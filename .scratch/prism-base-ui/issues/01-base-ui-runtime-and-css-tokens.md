# 01 — Base UI runtime and CSS token foundation

Type: task
Status: resolved

## Question

Replace the retired theme compiler/runtime lane with a dependency-light Prism theme object, accessible Base UI dependency boundary, and flash-free plain-CSS variable delivery while preserving all five pastel packs and both modes.

## Acceptance

- `prism-tokens` exposes primitives, semantics, and resolved CSS custom properties with no component-library lane.
- `PrismProvider` scopes a Prism theme and link/direction context without framework adapters.
- `prism-ui/styles.css` ships component recipes plus every pre-baked pack × mode variable class.
- Runtime and package graphs contain no active retired component packages.
- Token, provider, and packaging tests cover contrast, determinism, nesting, and the consumer boundary.

## Answer

Implemented the Prism-owned token and runtime foundation. `prism-tokens` now exposes frozen primitives, semantics, CSS variables, and stable `cssVarKey` scopes for all five packs and both modes; `PrismProvider` owns theme, link, direction, and portal context; and the published stylesheet bakes ten deterministic scopes plus Prism recipes. The old theme compiler, runtime adapters, and active legacy package edges are gone. Token, provider, theming, and declaration-boundary tests pass.
