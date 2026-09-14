# Prism

NaniSoft's design system — one design language (the Spectral Refraction system), many expressions. Apps build on `@nanisoft/prism-ui` and never on antd directly.

## Language

### Brand structure

**Brand pack**:
One of the two brand color expressions — blue or green. Each pack generates its own complete atmosphere: primary ramp, variant-tinted neutrals, and mode-specific grounds.
_Avoid_: color scheme, palette, variant color

**Mode**:
The appearance of a pack — light or dark. Dark is always beam dark.
_Avoid_: theme (a theme *encodes* a pack + mode pairing)

**Theme**:
The ConfigProvider-ready object `createPrismTheme()` returns: one brand pack rendered in one mode.
_Avoid_: skin, preset

### Visual system

**Refraction**:
The visual world: the neutral surface is white light, and the brand hues (blue, green) are its refractions. Brand-expression gradients are dithered in the two inks, never blended toward gray.
_Avoid_: gradient mesh, glow

**Variant-tinted neutrals**:
Neutral ramps generated from the active pack's hue at low chroma — cool grays in the blue pack, green-cast grays in the green pack.
_Avoid_: pure gray, antd gray

**Beam dark**:
Dark mode as light through a medium: tinted near-black grounds, surfaces that lighten as they elevate, cool hairlines.
_Avoid_: true black, gray dark

**Brand ink**:
A pack's saturated primary hue, used as flat fields — most visibly as the accent that floods live states (selection, active, pressed).
_Avoid_: primary color, accent color (unqualified)

**Hairline elevation**:
Depth in the plane expressed as a 1px border plus a surface tint shift; the single permitted shadow is cool-tinted and reserved for floating layers (dropdown, modal, popover).
_Avoid_: box-shadow elevation, ambient shadow, glow
