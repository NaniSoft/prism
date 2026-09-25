# Surface brief — Prism-owned Base UI system and docs

## Scope and mode

Scope: `packages/ui` plus `apps/site`, carrying the token, corpus, and MCP consequences through the repository. The site is Read + Persuade: docs must be scannable and complete, while the landing page must make the system's mechanism obvious in its first viewport.

## Audience, job, proof

Human and agent developers need one import boundary, a comprehensible component → block → page catalog, live copyable examples, and reliable theme switching. Proof is the actual npm package, live themed specimens, generated docs/API data, `llms.txt`, and the live read-only MCP.

## Direction

**THESIS:** Prism becomes source it owns: accessible Base UI behavior, Prism-authored recipes, and npm-delivered compositions—without asking consumers to assemble or understand an upstream component system.

**OWN-WORLD:** Spectral Refraction remains unchanged: five pastel grounds, mid-tone inks, white/dusk-tinted islands, 1px variant-tinted hairlines, 2/4/6/4 radii, Archivo Variable width-axis display, JetBrains Mono annotations, one floating shadow, dither texture, and 80/160/280ms decelerating motion.

**STORY:** A developer sees a real interactive system, understands the three composition layers, imports only Prism, and can hand the same contract to an agent through docs, corpus, or MCP.

**FIRST VIEWPORT:** A split thesis: left, the plain-language promise and two routes (human quickstart / agent corpus); right, a live component specimen that filters the real catalog and demonstrates focus, selection, and data display. The pack × mode switch remains in the header.

**FORM:** The established world is retained. Structure follows shadcnblocks' components → blocks → pages organization and its pattern-first composition discipline, but no stock shadcn layout or default theme is copied.

## Signature interaction

The live refraction specimen: search or command through the catalog while the same plate demonstrates real stateful controls; hovering/selecting entries changes focus and visible state without leaving the page.

## Constraints and unresolved decisions

Consumers use React + `@nanisoft/prism-ui` only; Base UI stays internal. The first catalog is curated rather than exhaustive. Historical records stay historical. Visual-regression infrastructure and a copy-out registry remain later efforts.

## Direction contract

**THESIS:** Prism's differentiator is owned source: accessible primitives, branded recipes, and complete compositions behind one import, not a generated mirror of somebody else's library.

**OWN-WORLD:** Spectral Refraction stays intact—pastel atmosphere, AA-safe mid-tone ink, white or dusk-tinted islands, hairline planes, one cool floating shadow, beam-crisp 2/4/6/4 geometry, Archivo width-axis headlines, JetBrains Mono annotations, dither—not-gradient texture, and zero-overshoot 80/160/280ms motion.

**STORY:** A human can understand, install, and compose Prism in minutes; an agent receives the same vocabulary and source through docs, `llms.txt`, and MCP; neither needs to know or install the primitive layer.

**FIRST VIEWPORT:** At 1180px, a 1:1 split lands below the 64px header: the left column carries the refracted display title, concise owned-system promise, and paired human/agent actions; the right column is one bordered live specimen with catalog search, a focusable result list, and a small stateful control plate. The theme controls stay in the header; no centered sales hero or generic card grid.

**FORM:** Existing Spectral Refraction world; structure derived from shadcnblocks' layered catalog and pattern-first blocks, not its visual styling. Seed: `spectral-refraction-owned-source` (user-pinned replacement brief; no replacement-world roll).

FINISH: the run's exit condition, verbatim "unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance".
