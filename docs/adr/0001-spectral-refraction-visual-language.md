---
Status: accepted
---

# Spectral Refraction as Prism's visual language

Prism's visual language is the **Spectral Refraction** system: the neutral surface is the beam, and the brand hues are its refractions. v1 shipped two hues (blue, green) as **brand packs**; the spectrum has since widened to five pastel-voiced packs — blue, green, lavender, rose, peach (ADR-0005) — each in light and dark (beam) modes, and each pack still generates its own variant-tinted neutral atmosphere, so a pack is a full re-expression, not a repainted primary. The system diverges from stock antd deliberately: hairline elevation (border + tint in the plane, one cool-tinted shadow reserved for floating layers), 4px radius family (SM 2 / base 4 / LG 6 / outer 4), Archivo Variable with JetBrains Mono (display set wide — the width axis is the refraction), 80/160/280ms strongly decelerating motion with bounce banned, one accent flooding live states, dithered-not-blended brand gradients, and success joining the green pack. Chosen via an impeccable direction roll (user locked the pick card over the roll-assigned pen-plotter drafting).

Full direction and token-level values: `.scratch/prism/issues/08-prism-visual-language.md`. Product truth: `PRODUCT.md`.

## Considered options

- **Pen-plotter drafting** (roll-assigned, runner-up): machine-drawn hairline precision; its flat-ink/hairline discipline is folded into the winner rather than adopted wholesale.
- **Metro typographic tiles** (competitive): a real interface language, but Windows-8 associations read dated; "one accent owns every live state" survives.
- **One-bit desktop** (declined): dither-as-hierarchy fights docs readability; kept pattern-based texture only.
- **Orizuru paper folds** (declined): the metaphor served craft-teaching, not a component language; kept state explicitness.
- **antd stock look**: rejected explicitly — it is the generic-admin-template anti-goal the brief bans.

## Consequences

- `@nanisoft/prism-tokens` must generate per-pack neutral ramps for both modes (ticket 09), not ship one fixed gray.
- `PrismProvider` bundles two OFL fonts as `@font-face` — a size cost apps accept by importing Prism.
- Dark mode must be configured per pack (tinted grounds), not left to antd's default dark algorithm.
