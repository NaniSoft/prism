# First Figma import fixture — Prism (blue pack)

**Regenerated from the real build (2026-09-19, ticket 18's pack pass).** These
four files are byte-for-byte the `dist/figma/blue/` output of
`@nanisoft/prism-tokens` — the pinned brand hexes, the shadow-as-STRING export
with its `$extensions["prism.shadow"]` composite, and the collision-free
tier-1 alias names. They remain the pipeline-verification fixture for the
ticket-14 acceptance run.

## What it verifies (the ticket-14 acceptance run)

Drop all four files into **Variables Import** (Microsoft) inside
`NaniSoft Design System`, selecting `manifest.json`. Expect:

1. Two collections: `prism.primitive` (one `Default` mode) and
   `prism.semantic` with exactly two modes, **Light listed first = default**.
2. Variables created for COLOR (hex), dimension/`px` → FLOAT, and STRING
   tokens.
3. **Info lines for the three `duration` tokens** ("not supported") —
   expected; the plugin reports its gaps. Zero *errors*.
4. `prism.semantic` values resolve as **aliases** of `prism.primitive`
   values (cross-collection `VARIABLE_ALIAS`).
5. The floating shadow lands as a **STRING variable** with the CSS
   `box-shadow` value — not as an effect, and with no "shadow tokens aren't
   supported" line (it ships as `$type: "string"` on purpose; the composite
   rides in `$extensions["prism.shadow"]`).
6. `$description` texts land as variable descriptions, incl. the STAND-IN
   notes.

Then **publish the library** (Assets → Libraries → Publish) — the manual
design-side release gate.

## Why per-collection files + manifest

`toDtcg(pack, mode)` emits one document per pack × mode; the build script
partitions it into one modeless primitives file + one semantics file per
mode, because Microsoft's importer is manifest-driven with one file per
(collection × mode). Recorded in ADR-0002 §2d. Verification detail:
`.scratch/prism/research/14-figma-shadow-plugin-verification.md`.
