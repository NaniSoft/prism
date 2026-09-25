# Prism Base UI clean break

## Decision

Replace Prism's generated upstream pass-through model with a Prism-owned, shadcn-style source catalog. Base UI is an internal accessibility primitive dependency of `@nanisoft/prism-ui`; consumers install React and Prism only. This is a clean breaking rewrite, not a compatibility layer.

## User decisions (2026-09-25)

- Consumers should need only React and `@nanisoft/prism-ui`; Base UI stays behind Prism.
- Remove the old public API instead of preserving temporary aliases.
- Ship a curated production-grade system, not one-for-one parity with the previous catalog.
- Organize components → blocks → pages using shadcnblocks as organizational inspiration.
- Preserve Spectral Refraction: five pastel packs, light and beam-dark, pastel atmosphere with mid-tone AA-safe ink.
- Revamp the package, docs website, generated corpus, MCP prose, and current project documentation together.

## Product truth to preserve

- Prism remains NaniSoft's agent-ready design system and npm product.
- The spectral world, fonts, hairline elevation, radius family, dither texture, motion curve, contrast gates, taxonomy, and human/agent doors remain.
- Static export, Cloudflare Worker assets, live `/mcp`, `llms.txt`, MD mirrors, and one-source-of-truth docs generation remain.

## Constraints

- No UI component package in consumer code other than Prism.
- No Tailwind requirement; the shipped system uses plain CSS and Prism tokens.
- Base UI is a direct internal dependency of `prism-ui` and is never re-exported as a consumer API.
- Historical ADDs/ADRs and research are preserved as history; current docs and product truth must not describe the retired implementation as active.
- Existing in-flight first-use hardening work is preserved where its product intent survives the rewrite.

## Acceptance

- Runtime/package graph has no active legacy component runtime or framework adapter.
- `pnpm build`, `pnpm test`, `pnpm check`, and `pnpm lint` pass.
- The site renders, builds for static export, and the docs corpus/MCP parse the new catalog.
- Desktop and mobile screenshots show both a light and beam-dark expression with no first-paint theme flash.
- The docs demonstrate the component → block → page model, real live examples, and agent entry points without retired-library routing.
