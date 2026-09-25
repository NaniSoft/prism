# 02 — Curated Prism component catalog

Type: task
Status: resolved
Blocked by: 01

## Question

Replace generated pass-throughs with a curated, production-grade catalog of Prism-owned components built on accessible internal Base UI primitives and the Spectral Refraction CSS recipes.

## Acceptance

- The catalog covers core actions, forms, navigation, overlays, feedback, data display, and layout.
- Every item has stable typed props, semantic class/data hooks, keyboard/focus behavior, and tests.
- Registry/catalog metadata has no upstream pass-through seam.
- Representative demos and API extraction work without external UI packages in consuming code.

## Answer

Shipped the curated 29-component catalog in `packages/ui/src/catalog.ts` and owned component implementations. Components use Base UI only inside `prism-ui`, expose Prism props/classes/data hooks, and retain accessible keyboard, focus, and state behavior. The generated pass-through registry, compatibility aliases, and upstream symbol surface were removed; catalog, product, API extraction, and UI tests cover the new boundary.
