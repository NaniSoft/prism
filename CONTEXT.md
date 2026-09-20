# Prism

NaniSoft's design system — one design language (the Spectral Refraction system), many expressions. Apps build on `@nanisoft/prism-ui` and never on antd directly.

## Language

### Brand structure

**Brand pack**:
One of the five brand color expressions — blue, green, lavender, rose, or peach (ADR-0005). Each pack generates its own complete atmosphere: primary ramp, variant-tinted neutrals, and mode-specific grounds.
_Avoid_: color scheme, palette, variant color

**Mode**:
The appearance of a pack — light or dark. Dark is always beam dark.
_Avoid_: theme (a theme *encodes* a pack + mode pairing)

**Theme**:
The ConfigProvider-ready object `createPrismTheme()` returns: one brand pack rendered in one mode.
_Avoid_: skin, preset

### Visual system

**Refraction**:
The visual world: the neutral surface is white light, and the brand hues (the pastel five-pack spectrum, ADR-0005) are its refractions. Brand-expression gradients are dithered in the pack inks, never blended toward gray.
_Avoid_: gradient mesh, glow

**Variant-tinted neutrals**:
Neutral ramps generated from the active pack's hue at low chroma — every pack tints its own grays from its own ink (periwinkle-cast in blue, lilac-cast in lavender, and so on).
_Avoid_: pure gray, antd gray

**Beam dark**:
Dark mode as light through a medium: tinted near-black grounds, surfaces that lighten as they elevate, cool hairlines.
_Avoid_: true black, gray dark

**Brand ink**:
A pack's primary hue — a mid-tone that survives the AA gate — used as flat fields and links; the pastel voice lives in the atmosphere (grounds, hairlines, washes), never in the ink.
_Avoid_: primary color, accent color (unqualified)

**Hairline elevation**:
Depth in the plane expressed as a 1px border plus a surface tint shift; the single permitted shadow is cool-tinted and reserved for floating layers (dropdown, modal, popover).
_Avoid_: box-shadow elevation, ambient shadow, glow

### Taxonomy

**Pass-through component**:
An antd component re-exported unchanged through `prism-ui` by generated proxy exports. Every Prism delta on it is a token, never a wrapper.
_Avoid_: re-export (unqualified), plain antd

**Wrapped component**:
An antd component whose export Prism replaces, gated by exactly one closed justification — `brand-behavior`, `api-narrowing`, `invariant`, `upstream-gap` — and tracked in `wrapped-registry.ts`. Anything else is a block.
_Avoid_: custom component, override

**Block**:
A pre-composed component inside `prism-ui` (`PageHeader`, `ComponentDemo`) — data-in for canonical slots plus `ReactNode` slot props. An organization layer, never a second package.
_Avoid_: widget, template

**Page**:
A full-page composition (`DocsShell`, `BlogLayout`) taking Prism-owned structural types via `toPrismTree()` — no `next`/`fumadocs-*` dependency in the package.
_Avoid_: layout, screen
