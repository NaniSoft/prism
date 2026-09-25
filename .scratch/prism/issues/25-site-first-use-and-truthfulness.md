# Site first-use and truthfulness hardening

Status: resolved

## Problem

The site critique found that the landing page presents static controls as if they were live, does not give agents a first-class entry point, repeats the theme gallery without comparison, and makes a demo promise that generated pass-through pages do not yet meet. The implementation also has small token-contract and recovery-state drift.

## Scope

- Make the landing search and specimen controls useful or unmistakably preview-only.
- Add a clear human and agent start-here path, including install, docs, `llms.txt`, and MCP.
- Make the demo contract truthful and give pass-through docs an honest no-demo state.
- Distill the theme gallery into comparable, responsive expressions with visible pack labels.
- Fix token/opacity/shadow drift, catalog descriptions, clipboard recovery, and status announcements.
- Run the site build, tests, and Impeccable detector; record remaining limitations.

## Acceptance

- Every visible control either performs a meaningful local action or is labeled as a preview.
- A first-time visitor can reach install, first component, `llms.txt`, and MCP in one pass.
- Component pages do not imply a live demo when one is unavailable.
- The theme gallery remains live but requires less scanning and works at narrow widths.
- No new hard-coded design-token drift; recovery and theme changes are announced accessibly.

## Answer

Implemented the full critique pass on 2026-09-25. The landing specimen now has live catalog search, routed actions, and local state controls; the landing and footer expose a human quickstart plus `llms.txt` and the `POST /mcp` setup. The theme gallery groups each pack's light and beam-dark islands together and gives every island local controls and a shell hand-off with a live status. The docs corpus now auto-wires registered demos and explicitly points unregistered items to the appropriate MCP, with Button/Input/Switch examples and a Quickstart guide added. Token drift was removed from the daylight copy, plate shadow, dither mask, and design sidecar; catalog descriptions, clipboard recovery, mobile labels, and theme announcements were added. `turbo.json` now orders the llms drift check after the site generator to keep the determinism gate stable. `pnpm check`, `pnpm lint`, `pnpm test`, and the site production build pass; the Impeccable detector returned no findings for the changed TSX surfaces. Browser visual inspection remains unavailable because no desktop browser is connected.
