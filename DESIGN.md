---
name: Prism
description: One design language, many expressions — the pastel five-pack spectrum in light and beam-dark, AA-gated.
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
  surface-light: "#FFFFFF"
  text-on-ink-light: "#FFFFFF"
  text-on-ink-beam: "#0A0F1C"
  state-success: "#15803D"
  state-warning: "#B45309"
  state-error: "#DC2626"
  state-info: "#2563EB"
typography:
  display:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(38px, 5vw, 52px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 125, 'wght' 600"
  banner:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(40px, 6vw, 68px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.018em"
    fontVariation: "'wdth' 122, 'wght' 600"
  headline:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(30px, 3vw, 38px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 118, 'wght' 600"
  title:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.008em"
    fontVariation: "'wdth' 114, 'wght' 600"
  body:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  prose:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    lineHeight: 1.72
  secondary:
    fontFamily: "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    lineHeight: 1.55
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.055em"
rounded:
  sm: "2px"
  base: "4px"
  lg: "6px"
  outer: "4px"
spacing:
  unit: "4px"
  step: "4px"
---

# Design System: Prism

## North star: Spectral Refraction

Prism treats the neutral surface as a beam and the brand hues as its
refractions. One grammar expresses itself as five pastel packs — blue, green,
lavender, rose, and peach — in light and beam-dark. The atmosphere carries the
pastel: tinted grounds, variant-tinted hairlines, and quiet live-state washes.
Interaction color stays a readable mid-tone ink.

The visual system is implemented as plain CSS over `--prism-*` custom
properties. A theme is data, so a pack or mode can change the whole surface
without a runtime style extractor or a flash.

## Color

### The five packs

| Pack | Light ink | Beam-dark ink | Light ground | Beam ground |
| --- | --- | --- | --- | --- |
| Blue | `#2563EB` | `#4C8DF6` | `#EEF3FC` | `#0D1730` |
| Green | `#117A3B` | `#22C55E` | `#E9F6EF` | `#0C1812` |
| Lavender | `#6A58CE` | `#9D8DF4` | `#F2F1FB` | `#131022` |
| Rose | `#BC3A6C` | `#F08CB4` | `#FBF1F5` | `#1A111C` |
| Peach | `#B04A17` | `#F2A05C` | `#FBF3EA` | `#1D140D` |

Each pack also owns a tinted text base and hairline. Light containers are
white islands on the pastel ground. Beam-dark containers lift away from the
tinted ground as elevation increases; they never become pure black or a generic
gray. Text and state values are contrast-gated at definition time.

### Semantic roles

The public CSS vocabulary uses roles such as `--prism-background`,
`--prism-surface`, `--prism-foreground`, `--prism-primary`, `--prism-border`,
`--prism-ring`, state roles, radii, motion, and elevation. Components consume
roles rather than raw pack values. The four state meanings — success, warning,
error, and info — stay semantically stable across the spectrum.

### Named rules

- **Pastel is atmosphere:** tint grounds, hairlines, and washes; keep ink
  readable.
- **Tinted live state:** selection and focus use a controlled ink wash, never a
  low-contrast solid accent.
- **Shared state hues:** meaning does not drift merely because the pack changes.
- **Dither, not blend:** texture is made from one-pixel dot fields and Bayer
  patterns, not smooth brand-hue gradients.

## Typography

**Interface and display:** Archivo Variable, with the width axis as the brand's
refraction gesture. **Code and machine annotations:** JetBrains Mono.

- Display: 600 weight, `wdth 125`, 38–52px, tight 1.06 leading.
- Site banner: 600 weight, `wdth 122`, 40–68px, 1.0 leading; this is the one
  campaign-scale treatment for the marketing shell, not the package display.
- Headline: 600 weight, `wdth 118`, 30–38px, 1.08 leading.
- Title: 600 weight, 16–22px, with restrained `wdth 110–114` settings.
- Body: 14px / 1.65; docs prose: 15px / 1.72.
- Secondary chrome: 12–13px; labels and code: JetBrains Mono, 11–12px, with
  modest positive tracking.
- One grotesque carries the interface; mono annotates real content and never
  replaces it.

## Layout and density

The base grid is 4px. The primary content and page max-width is 1180px, with
responsive gutters handled by the composed shell. Reusable controls use a
28 / 32 / 40px small / default / large height family. Product layouts should
use the smallest layer that owns the job: component for one responsibility,
block for repeated product structure, and page for a complete composition.
Layout CSS belongs to the consuming app; Prism's recipes own the visual
language.

Responsive behavior is explicit: dense grids compress at 1080px, the landing
window wall becomes two-column at 980px, navigation and application shells hand
off to a drawer at 860px, and narrow gutters and stacked actions begin at
640px. Data surfaces scroll rather than crushing content. Every interactive
target retains a visible focus state and a usable touch size, including on
coarse pointers.

## Elevation and depth

Hairline elevation is the default. One-pixel borders and surface tint shifts
separate in-plane content. The single permitted shadow is reserved for
genuinely floating layers — dialogs, drawers, popovers, and menus. Buttons,
inputs, cards, and ordinary page regions do not cast ambient shadows.

## Shape

The radius family is 2 / 4 / 6 / 4 pixels. Borders are one pixel. Rounded swatch
dots are a recurring brand ornament, but pill-shaped containers are not the
system's default shape.

## Motion

Motion is restrained and strongly decelerating:

- fast: 80ms;
- standard: 160ms;
- slow: 280ms;
- standard curve: `cubic-bezier(0.25, 1, 0.5, 1)`;
- opacity-only transitions may use linear easing.

There is no bounce, elastic, or overshoot. Respect reduced-motion preferences
and keep transitions purposeful: state change, orientation, disclosure, or
layer movement.

## Component language

- **Actions:** `Button` uses primary, secondary, ghost, destructive, and link
  variants; the consequence of the action chooses the variant.
- **Forms:** `Field` coordinates labels, descriptions, validity, and errors;
  inputs and textareas use the same hairline and focus grammar.
- **Navigation:** breadcrumbs, tabs, pagination, and application shell blocks
  communicate position without competing with content.
- **Overlays:** dialogs, drawers, popovers, and tooltips use the nearest Prism
  portal target and the one floating shadow.
- **Feedback:** alerts, badges, progress, skeletons, and empty states use
  semantic state roles and accessible announcements.
- **Data display:** cards, tables, typography, avatars, and separators provide
  the quiet structural surfaces for product content.

Blocks compose these components for application shells, auth forms, data
tables, settings, page headers, stats, demos, and site chrome. Pages compose
blocks for auth, dashboards, settings, docs, and editorial layouts.

## Do / Don't

### Do

- Keep pack and mode choices in the theme data and let the CSS scope change the
  surface.
- Use semantic roles, documented `className` hooks, and `data-prism` markers for
  composition.
- Keep component behavior accessible by default and use the shipped example as
  the source of truth.
- Keep application data, routing, and business language in the consuming app.
- Test light and beam-dark expressions, including focus and reduced-motion
  states.

### Don't

- Add a second UI runtime or expose Base UI as an application dependency.
- Hand-pick a raw hex, introduce a sixth pack, or change the radius and motion
  families without a product decision.
- Use gradients for brand texture, ambient shadows for ordinary elevation, or
  bounce/overshoot easing.
- Reach into internal DOM structure or copy Prism implementation CSS into an
  application.
- Present synthetic demos as customer evidence or invent product claims.
