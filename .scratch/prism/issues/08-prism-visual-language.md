---
Type: grilling
Status: resolved
Labels: wayfinder:grilling, ready-for-human
---

## Question

What does Prism *look* like? Define the v1 visual language for the NaniSoft brand:

- Color: brand hue + ramp character, neutrals, semantic colors; dark mode's character (true dark vs elevated dark).
- Typography: typeface(s), scale, weight strategy.
- Shape & space: radius, density, spacing rhythm, elevation/shadow philosophy.
- Motion personality: restraint level, durations, easing defaults (antd motion tokens).
- Where Prism deliberately diverges from stock antd — the divergence *is* the brand.

Output: a written direction (an ADR, when domain-modeling creates the docs) precise enough for the token spec (ticket 09) to implement. React to concrete samples, not adjectives.

## Answer

Resolved 2026-09-14 (grilling + impeccable: init → direction roll → token-level grilling; the user locked every decision). **The v1 visual language is the Spectral Refraction system** — the neutral surface is the beam; blue and green are its refractions. Recorded as ADR-0001 (`docs/adr/0001-spectral-refraction-visual-language.md`); glossary terms in `CONTEXT.md`; product truth now in `PRODUCT.md` (AI agents are the design system's primary users).

### The language (precise enough for ticket 09 to implement)

1. **Two brand packs, variant-tinted atmospheres.** Blue and green packs each generate their own neutral ramp from their hue at low chroma: blue light bg `#F7F9FC` / dark bg `#0B1220`; green light bg `#F7FAF8` / dark bg `#0A1612`. A pack is a full re-expression, not a repainted primary.
2. **Beam dark.** Dark mode is light through a medium: tinted grounds, surfaces *lighten* as they elevate, cool hairlines (`rgba(147,178,255,.16)`-family), primary text `#E8EEF9`. Not pure black, not antd's gray dark.
3. **Hairline elevation.** Flat ink fields in the plane; elevation = 1px border + surface tint shift. Exactly one shadow — cool-tinted `0 4px 16px rgba(11,18,32,.16)` — reserved for floating layers (dropdown, modal, popover). No ambient glow.
4. **4px radius.** SM 2 · base 4 · LG 6 (nested) · outer 4. Beam-crisp vs antd's 6.
5. **Archivo Variable + JetBrains Mono.** Display set expanded (wght 600, wdth up to 125 — the width axis *is* the refraction); UI text normal width, 400–500; mono for code, token names, annotations. Both OFL; `PrismProvider` ships the `@font-face`.
6. **Fast, decelerating motion.** motionDurationFast/Mid/Slow = 80/160/280ms; standard curve `cubic-bezier(0.25, 1, 0.5, 1)`; opacity linear; bounce/spring banned in brand skins; `prefers-reduced-motion` honored.
7. **One accent owns live states.** Selection/active/pressed flood flat with the brand ink (white-on-ink).
8. **Semantics relate to the packs.** In the blue pack, success is a distinct green (`#16A34A`) and info = brand blue; in the green pack, success = brand ink and info = blue (`#2563EB`, the other band); error `#DC2626` and warning `#D97706` conventional in both.
9. **Pattern, not blur.** Brand-expression gradients are dithered in the two inks, never blended toward gray.
10. **Named, replayable states.** Docs show hover/focus/active/disabled deliberately per component.

**Never**: generic admin template · toy-startup playful · heavy enterprise legacy.

### How it was chosen

Impeccable direction roll (seed `dbdf5b70`, operate mode): the roll assigned *pen-plotter drafting*; the user locked the pick card **Spectral Refraction**. Verdicts: Metro typographic tiles competitive (its live-state discipline survives); one-bit desktop and orizuru paper folds declined (their kept disciplines — pattern-not-blur, state explicitness — adopted into the language). The category standard was offered and not taken.

### Defaults set without grilling (reopen freely)

- **Type scale**: antd's stock size ramp (14px UI base) — brand voice comes from weight/width, not size; display sizing is owned by prism-ui pages (DocsShell/BlogLayout), not the token pack.
- **Spacing**: antd's 4px-grid margin scale, unchanged.
- **Density**: default (comfortable); compact stays available via antd's algorithm, never forked.

### Unblocks

Ticket 09 (token architecture spec) is now unblocked — it must implement per-pack neutral generation, both modes per pack, and the divergence tokens above.
