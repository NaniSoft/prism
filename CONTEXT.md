# Prism

NaniSoft's design system — one Spectral Refraction language expressed through
five pastel brand packs and two modes. Applications build on
`@nanisoft/prism-ui`; they do not depend on the implementation primitives that
make the package accessible.

## Language

### Brand structure

**Brand pack**:
One of the five registered brand expressions — blue, green, lavender, rose, or
peach. A pack owns its ink, tinted grounds, text base, hairlines, and state
washes. _Avoid_: color scheme, palette, variant color.

**Mode**:
The appearance of a pack: light or beam-dark. _Avoid_: theme (a theme encodes
a pack and a mode).

**Theme**:
A frozen `PrismTheme` returned by `createPrismTheme({ pack, mode })`, including
resolved primitives, semantic meanings, and CSS custom properties. _Avoid_:
skin, preset.

**Spectral Refraction**:
The visual world in which the neutral beam remains a surface and the five brand
hues tint its grounds, hairlines, washes, and dark atmosphere. Pastel is the
voice of the atmosphere; mid-tone ink carries interaction and text meaning.
_Avoid_: gradient mesh, glow.

**Beam dark**:
Dark mode as light passing through a medium: tinted near-black grounds, surfaces
that lift as they elevate, and cool hairlines. _Avoid_: true black, generic gray
dark.

**Brand ink**:
A pack's AA-safe mid-tone hue, used for links, primary actions, focus, and
selected meaning. _Avoid_: pastel accent, unqualified primary color.

**Hairline elevation**:
Depth in the plane expressed with a one-pixel border and a surface tint shift.
The single permitted shadow is reserved for genuinely floating layers such as
dialogs and popovers. _Avoid_: ambient shadow, glow, stacked card shadows.

### Composition

**Component**:
A focused, accessible Prism export that owns one interaction or visual
responsibility. Compound parts such as dialog or select parts remain inside the
component's public module and do not create a second catalog vocabulary.
_Avoid_: pass-through, raw upstream component.

**Block**:
A pre-composed product pattern assembled from components, such as
`ApplicationShell`, `DataTable`, or `SettingsPanel`. Blocks accept data and
content slots but do not fetch application data. _Avoid_: widget, copied
template.

**Page**:
A complete structural composition assembled from blocks and components, such as
`DashboardPage` or `DocsShell`. Pages receive application-owned navigation,
content, and data. _Avoid_: layout, screen.

**Catalog**:
The checked, curated list of Prism components, blocks, and pages in
`packages/ui/src/catalog.ts`. It is the source for navigation, docs generation,
the LLM corpus, and MCP metadata. _Avoid_: registry of upstream exports,
compatibility list.

### Source and agents

**Owned source**:
Prism-authored TypeScript and CSS that consumers can inspect, compose, and copy
through documented package exports. The phrase describes the public system, not
permission to fork implementation files into an app. _Avoid_: wrapper around
another design system, generated proxy.

**Internal primitive**:
Base UI or a native HTML element used inside `prism-ui` to provide behavior or
structure. It is descriptive implementation metadata, never a second consumer
import. _Avoid_: public dependency, extension API.

**Corpus**:
The deterministic projection of the docs source into `llms.txt`, per-item
Markdown, guide mirrors, and `PrismDocsStore`. _Avoid_: hand-maintained API
reference, duplicated documentation.

**Agent door**:
The MCP and generated corpus entry points that give an agent the same catalog,
usage rules, props, examples, and theme data as the human site. _Avoid_: a
second product or a telemetry surface.

## Visual commitments

- Five pastel packs × light and beam-dark, with AA contrast gates.
- Archivo Variable for the interface and JetBrains Mono for code and machine
  annotations.
- Radii 2 / 4 / 6 / 4 pixels, one-pixel hairlines, and one cool-tinted floating
  shadow.
- Dither fields and dot patterns instead of blended brand gradients.
- Strongly decelerating motion at 80 / 160 / 280 milliseconds; no bounce or
  overshoot.
- Flash-free theme scopes based on stable `prism-<pack>-<mode>` classes.

## Vocabulary guardrails

When writing code, tests, issues, or prose, use **component**, **block**,
**page**, **brand pack**, **mode**, **theme**, **semantic token**, **owned
source**, and **agent door**. Do not revive pass-through, wrapper, antd lane, or
upstream delegation language from the historical implementation.
