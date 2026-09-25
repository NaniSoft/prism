---
name: Prism
description: One design language, many expressions — the pastel five-pack spectrum under the Spectral Refraction world (five packs × light/beam-dark, AA-gated).
colors:
  blue-ink: "#2563EB"
  blue-ink-beam: "#4C8DF6"
  blue-ground: "#EEF3FC"
  blue-beam-ground: "#0D1730"
  green-ink: "#117A3B"
  green-ink-beam: "#22C55E"
  green-ground: "#E9F6EF"
  green-beam-ground: "#0C1812"
  lavender-ink: "#6A58CE"
  lavender-ink-beam: "#9D8DF4"
  lavender-ground: "#F2F1FB"
  lavender-beam-ground: "#131022"
  rose-ink: "#BC3A6C"
  rose-ink-beam: "#F08CB4"
  rose-ground: "#FBF1F5"
  rose-beam-ground: "#1A111C"
  peach-ink: "#B04A17"
  peach-ink-beam: "#F2A05C"
  peach-ground: "#FBF3EA"
  peach-beam-ground: "#1D140D"
  surface: "#FFFFFF"
  text-on-ink: "#FFFFFF"
  state-success: "#15803D"
  state-warning: "#B45309"
  state-error: "#DC2626"
  state-info: "#2563EB"
typography:
  display:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(38px, 5.4vw, 52px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 125, 'wght' 600"
  headline:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 118, 'wght' 600"
  title:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    fontVariation: "'wdth' 118, 'wght' 600"
  subtitle:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    fontVariation: "'wdth' 112"
  banner:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 118, 'wght' 600"
  body:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  prose:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.72
  secondary:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "12px"
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.04em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "6px"
  pill: "100px"
spacing:
  unit: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.blue-ink}"
    textColor: "{colors.text-on-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "4px 15px"
    height: "32px"
  button-default:
    backgroundColor: "{colors.surface}"
    textColor: "{typography.body.color}"
    rounded: "{rounded.md}"
    padding: "4px 15px"
    height: "32px"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "4px 11px"
    height: "32px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  tag:
    backgroundColor: "{colors.surface}"
    textColor: "{typography.body.color}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
  nav-link:
    textColor: "{typography.body.color}"
    typography: "{typography.body}"
---

# Design System: Prism

## Overview

**Creative North Star: "Spectral Refraction"**

Prism is a beam of white light through a prism: the neutral surface is the beam, and the brand hues are its refractions. One design language expresses itself as five pastel brand packs — blue, green, lavender, rose, peach — each in light and beam-dark, ten expressions of one voice. Colour is carried by the *atmosphere*, not by shouting: pastel-tinted page grounds, variant-tinted hairlines, and tinted washes on live states, while components themselves float as crisp white islands. Density is standard antd (14px UI base on a 4px grid); the divergence from stock antd is deliberate and encoded in tokens — hairline elevation, the 4px radius family, Archivo Variable set wide, 80/160/280ms decelerating motion, and dither-instead-of-blend texture.

Everything is machine-legible by construction: five packs are data in `prismBrandPacks`, validated at definition time against WCAG AA gates, and every site surface rides `--prism-*` CSS variables so a single class swap on `<html>` re-expresses the whole page.

**Key Characteristics:**

- Pastel atmosphere, mid-tone ink — the ink must hold AA on its own ground, so pastel lives in grounds and washes, never in the accent itself.
- Hairline elevation: 1px tinted borders do the in-plane work; exactly one cool-tinted shadow exists, for floating layers only.
- Archivo Variable with the width axis (`wdth`) as the brand's "refraction"; JetBrains Mono for code and micro-annotations.
- Dithered, never blended: texture is 1px dot fields and Bayer patterns, not smooth gradients.
- Ten pre-baked theme rulesets; theming is a class swap, flash-free before first paint.

## Colors

Five packs, one grammar: each pack supplies an ink (its own hue at a mid-tone), a pastel ground, a tinted text base, and variant-tinted hairlines — so a pack is a full re-expression of the neutral atmosphere, never a repainted primary on gray. Values below are the light-mode ground and both inks; text bases are tinted near-blacks (`#1A2A4A` blue, `#162A1A` green, `#262044` lavender, `#331B29` rose, `#3A241A` peach) and fixed pale tints in beam-dark.

### Primary (per pack — the ink)

- **Azure Ink** (#2563EB light / #4C8DF6 beam-dark): the blue pack's accent — links, primary buttons, focus rings, selected states. 4.64:1 on its pastel sky ground.
- **Spring Ink** (#117A3B / #22C55E): the green pack. 4.88:1 on pastel mint. In the green pack, success is the ink's own hue family.
- **Violet Ink** (#6A58CE / #9D8DF4): lavender. 4.81:1 on pale lilac.
- **Magenta-Rose Ink** (#BC3A6C / #F08CB4): rose. 4.80:1 on pale blush.
- **Coral Terracotta Ink** (#B04A17 / #F2A05C): peach. 4.98:1 on peach-cream.

Beam-dark inks are each lightened one step of the same hue — the tinted dark ground demands it, and the validation gate holds them at ≥3:1 (large/UI) there while light mode is held to 4.5:1 because the ink doubles as the body-link colour.

### Secondary (the atmosphere)

- **Pastel Grounds** (light): #EEF3FC / #E9F6EF / #F2F1FB / #FBF1F5 / #FBF3EA — the page ground (`colorBgLayout`), the single largest colour field on any screen.
- **Beam Grounds** (dark): #0D1730 / #0C1812 / #131022 / #1A111C / #1D140D — dusk-tinted, never pure black. Surfaces lighten as they elevate (container +8%, elevated +12%), derived by antd's dark neutral generator from the tinted base, not hand-authored.

### Neutral

- **Surface** (#FFFFFF): light-mode container. Components are white islands on the pastel ground; the ground is tinted, the island is not.
- **Text bases** (per pack, tinted toward the ink's hue; beam-dark text #E8EEF9-family): text tiers derive as alpha tints of the base — secondary 68%, tertiary 45% (placeholders; antd's 25% derivation fails AA on tinted grounds), faint 30%.
- **Hairlines**: the pack's own hue at low alpha — light `rgba(ink-hue, 0.10)`, beam-dark `rgba(ink-hue, 0.16–0.18)`; `hairlineFaint` is a lighter tint still (6% light / 10% dark).

### Named Rules

**The Pastel-Is-Atmosphere Rule.** Pastel is the voice of grounds, hairlines, washes, and beam-dark; the ink stays a mid-tone of its own hue. A literal pastel ink cannot pass the AA gate (it doubles as body-link colour in light mode, 4.5:1), and white-on-pastel button text is unreadable — the gate defines the reading.

**The Tinted-Wash Rule.** The accent floods live states — selection, active, pressed — as a tinted wash of the ink (`accentLive`: ink at 10% in light, 20% in beam-dark), never solid ink, so text on a selected surface stays legible. The focus ring is the same wash at 35% / 55%.

**The Shared-State-Hues Rule.** Success green (#15803D), warning amber (#B45309), error red (#DC2626), and info blue (#2563EB) are identical across all five packs — meaning never shifts with the spectrum. Only the blue pack's info is its own ink. Success and warning were darkened from their stock 600-shades so they hold AA (4.5:1) as text on the white surface; `defineBrandPack()` now gates state hues on both the light surface and the beam ground.

## Typography

**Display Font:** Archivo Variable (variable, wght 400–700, wdth axis loaded; fallback -apple-system/Segoe UI/Roboto stack)
**Body Font:** Archivo Variable (same stack)
**Label/Mono Font:** JetBrains Mono (variable, 400–700; ui-monospace fallback)

**Character:** One grotesque carries everything; the width axis — not size inflation — is the brand gesture. Display text is set wide and semi-bold ("refracted"), code and micro-labels set in a contrasting mono. Antd's stock size ramp is preserved; the voice comes from weight and width.

### Hierarchy

- **Display** (600, clamp(38px, 5.4vw, 52px), 1.06, `wdth` 125, -0.015em): hero and gallery titles only, via `DisplayTitle` (default `width: "refracted"`).
- **Headline** (600, 30–36px, 1.08, `wdth` 118): section closers and page-level `h2`s.
- **Title** (600, 16–20px, `wdth` 112–118): page titles (`wdth` 118), band/island names (116), card headers (112).
- **Body** (400, 14px UI, 1.65): default antd size. Docs prose is 15px / 1.72 with a ~64ch max; ledes 15px / 1.7 at 46–62ch.
- **Label / mono annotation** (JetBrains Mono, 10.5–12px, letter-spacing 0.04–0.06em, uppercase for group headers): code blocks, token names, plate annotations (`<Button />`), band indices (`01`), section group headers, and the hex readouts in the theme gallery.

### Named Rules

**The Width-Axis-Is-the-Refraction Rule.** Display emphasis is expressed with `font-variation-settings: 'wdth'`, in a fixed ladder — 125 for display, 118/116 for titles and names, 110–114 for prose headings — never with letter-spacing tricks or size jumps alone.

**The Mono-Annotation Rule.** Machine-voice labels (code identifiers, indices, hexes, group headers) are JetBrains Mono at 10.5–12px with 0.04–0.06em tracking; they annotate real content and never substitute for it.

## Layout

A single centred container, max-width 1180px with 24px gutters, on antd's 4px grid (`sizeUnit`/`sizeStep` = 4). Vertical rhythm is generous: landing sections pad 64–88px; docs pages pad 40px top / 96px bottom. The docs skeleton is a 240px sidebar + fluid column (48px gap), widening to 240 / fluid / 200px when a TOC is present; sidebars stick at 84px below the 60px header.

Responsive behaviour, as built:

- **≤1180px**: header brand note drops.
- **≤1080px**: pack-switcher labels collapse to swatch dots; the docs TOC appears (≥1080px only); themes grid goes two-column.
- **≤960px**: landing hero collapses to one column.
- **≤860px**: header nav wraps to its own row (scrollable horizontally).
- **≤720px**: spectrum strip and themes strip stack to one column; prose tables and code blocks scroll.

Opacity, not extra greys, does the de-emphasis work: secondary text in site chrome is the text colour at 0.66–0.82 opacity.

## Elevation & Depth

Hairline elevation with exactly one shadow. In-plane separation is 1px variant-tinted borders (`colorBorder` strong / `colorBorderSecondary`–`colorSplit` faint) plus the tinted pastel ground showing between white islands. Buttons and inputs are flat — every component-level shadow is zeroed at the theme level (`Button.*Shadow: none`, `Input.*Shadow: none`), and `boxShadowSecondary`/`Tertiary` are `none`, so antd's stock multi-layer shadows never appear.

### Shadow Vocabulary

- **Floating** (`0 4px 16px 0 rgba(11, 18, 32, 0.16)` light / `0 4px 16px 0 rgba(11, 18, 32, 0.24)` beam-dark): the single permitted shadow, cool-tinted in both modes, byte-identical across the antd `boxShadow` map token, prism-ui CSS, and the DTCG export. Reserved for genuinely floating layers: modals, drawers, popovers, dropdowns.

### Named Rules

**The One-Shadow Rule.** One cool-tinted shadow exists, for floating layers only. Nothing in the plane casts it; a bordered surface is already elevated.

## Shapes

The radius family is 2 / 4 / 6 / 4 (`borderRadiusSM` 2, seed `borderRadius` 4, `borderRadiusLG` 6, outer 4) — beam-crisp: softly squared, never pill-shaped surfaces (the only pill is a progress track, 100px). It is hand-set in the closed map-token allowlist because antd's `genRadius(4)` cannot produce it. Borders are always 1px (`lineWidth: 1`); dashed borders are the dashed-button affordance, not decoration. Swatch dots are the recurring circular silhouette — 9–14px circles carrying an inset white hairline (`inset 0 0 0 1px rgb(255 255 255 / 0.3)`) so pale pastels read on white — and rounded swatch squares (2px, the `sm` radius) appear in the gallery's hex readouts.

## Components

### Buttons

- **Shape:** 4px radius (the family's base); no shadow in any variant.
- **Primary:** solid ink fill, `textOnInk` text (#FFFFFF in light), 32px tall, `4px 15px` padding; the pack's ink is the only primary colour.
- **Hover:** antd's seeded derivation (lightened ink) at 160ms; **Focus:** the 2px tinted wash ring (`controlOutline`), never a glow.
- **Default / Text / Link / Dashed:** white surface with a strong hairline; text and link variants are naked ink; dashed uses the 1px dashed hairline.

### Inputs / Fields

- **Style:** white surface, 1px strong hairline, 4px radius, `4px 11px` padding, 32px tall; prefix icons in the text-secondary tint.
- **Focus:** border shifts to the ink plus the 2px tinted wash ring; `activeShadow` is `none` — the ring comes from the allowlist token, not a component shadow.
- **Placeholder:** the pack's textTertiary (45% tint) — kept legible and hue-true on tinted grounds.

### Cards / Containers (islands)

- **Corner Style:** 6px outer (lg); inner plates 4px.
- **Background:** `colorBgContainer` — white in light mode, the derived lift in beam-dark. Inside a themed island, always `bg-container`, never `bg-layout` (dark themes emit no layout override, so chrome would fall through to the shell).
- **Shadow Strategy:** none — hairline border only, per The One-Shadow Rule.
- **Internal Padding:** 16–24px (demo bodies 32px 24px; gallery islands 18px 20px).

### Tags / Chips

- **Style:** 2px radius, 1px hairline, tinted or state-coloured fills; solid variants take `textOnInk`. Semantic tags use the shared state hues.

### Navigation

- **Header:** sticky, 60px row, `color-mix(in srgb, bg-layout 88%, transparent)` with an 8px backdrop blur, 1px bottom hairline. Brand wordmark set refracted (`wdth` 125, `wght` 600, 18px); links 13px at 0.82 opacity, resolving to full opacity + ink on hover. The switcher lives here: one Segmented for the five packs, each option led by its ink swatch dot, plus one for light / beam-dark.
- **Docs nav / TOC:** 13px, 6px gaps, group headers as mono uppercase micro-labels at 0.6 opacity.

### Segmented Switcher with Swatch Dots (signature)

The pack switcher is the system in miniature: five 9px ink dots (each with the inset white hairline), labels that collapse to dots alone under 1080px. The same dot grammar scales up through the landing spectrum strip (13px dots, one cell per pack painted in its own light ground, saturate 1.35 on hover) and the /themes gallery (11–14px dots beside hex readouts).

### Themed Island (signature)

A self-contained region carrying its own `prism-<pack>-<mode>` variable class or nested `PrismProvider` — every value inside, chrome included, is the island's own theme. Used by all ten gallery islands and by the landing's "docs in daylight" peek, which always renders the *current shell pack's* light expression, never a leftover island.

### Dither Band (signature)

Texture, not gradient: a 96px field of 1px ink dots on a 3px grid at 0.28 opacity, masked to fade downward (`radial-gradient(ink 1px, transparent 1px)` / 3px 3px). Prism-ui also ships 4×4 Bayer-pattern dithers (`.prism-dither--light` / `--dark`, opacity 0.04) for brand surfaces. Dither sits behind decorative surfaces only, never under interactive or live-state surfaces.

## Do's and Don'ts

### Do:

- **Do** keep every pack's ink at ≥4.5:1 on its light ground and ≥3:1 on its beam ground — `defineBrandPack()` fails the build otherwise; a new pack is one data entry plus tests, never a script edit.
- **Do** tint every neutral from the pack's own hue (hairlines, washes, text bases) so each pack is a full re-expression.
- **Do** use the motion scale 80ms / 160ms / 280ms with `cubic-bezier(0.25, 1, 0.5, 1)` (strongly decelerating); opacity changes run linear.
- **Do** keep surfaces white in light mode and let them lighten on elevate in beam-dark (derived from the tinted `colorBgBase`; dark mode adds no ground overrides).
- **Do** express a pack or mode switch as the `prism-<pack>-<mode>` class on `<html>`, applied by the blocking boot script before first paint (localStorage key `prism-theme`, default `blue-dark`).
- **Do** annotate with mono micro-labels and swatch dots — the system's two recurring ornaments.

### Don't:

- **Don't** use pure black or pure white as a ground (validation-enforced); beam-dark grounds are dusk-tinted, light grounds pastel.
- **Don't** add a second shadow or reuse the floating shadow in-plane; don't ship a control with a shadow — they are zeroed at the theme level.
- **Don't** blend gradients of the brand hue for texture or energy — use the dither (1px dot fields, Bayer patterns).
- **Don't** use bounce, elastic, or overshoot easing; the curve family is one strongly decelerating bezier, and durations outside 80/160/280ms need an allowlist-grade justification.
- **Don't** hand-set antd map tokens outside the closed 17-key allowlist (radius SM/LG, 280ms slow, light ground, scrim, hairlines, live-state wash, focus ring, placeholder, one shadow or none); where a seed exists, set the seed.
- **Don't** repaint the primary on a fixed grey and call it a new pack, and don't invent a sixth pack id ad hoc — `PrismPackId` is stable API (cssVar classes, storage, DTCG, MCP slugs).
- **Don't** hand-write antd token values in app CSS — ride the `--prism-*` variables so every rule re-themes with the class swap.
