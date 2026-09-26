# Prism

Prism is NaniSoft's design system: design tokens, a published React component
library that downstream products compose without writing CSS, a documentation
site, and a machine-readable agent surface. This file is the vocabulary. It
defines the words this repository uses and names the words it has retired. It is
a glossary and nothing else.

## Language

### Theming

**Pack**:
One of the authored palettes: the neutral base pack `default`, and the five
pastels Blush, Mint, Lavender, Sky and Peach. A pack owns a generated OKLCH ramp
family and its own radius.
_Avoid_: brand pack, colourway, color scheme, theme.

**Mode**:
The appearance of a pack: `light` or `dark`.
_Avoid_: beam-dark, theme, appearance.

**Theme**:
One pack in one mode (pack times mode), such as Blush dark or the default light.
A theme is a fully resolved token set, not an object and not an API; there is no
theme factory.
_Avoid_: skin, preset, pack, mode.

**Pack id**:
The string that selects a pack at runtime: `default`, `blush`, `mint`,
`lavender`, `sky` or `peach`. Absence of a pack id means the default pack.
_Avoid_: theme id, colour key.

### Tokens

**Foundation token**:
A raw ramp value that carries no meaning, authored in the foundation tier of the
token source.
_Avoid_: primitive, primitive token, base value.

**Semantic token**:
A named intent, authored as an alias into the foundation tier. Its name is
emitted verbatim as a CSS custom property, and components reach meaning through
semantic tokens only.
_Avoid_: primitive, variable, theme variable.

**Token contract**:
The set of semantic token names emitted verbatim as CSS custom properties, byte
for byte identical to shadcn's variable contract. A name in the contract is
stable across versions and changes only in a breaking release.
_Avoid_: theme API, variable map.

**Token**:
A value in the DTCG source, either foundation or semantic. A token is the
source; a CSS custom property is its emitted form.
_Avoid_: variable (when the token source is meant).

### Composition

**Component**:
A focused, accessible, product-agnostic export with one job, and a catalogue
item of kind `component`. Compound parts, such as the pieces of a dialog, stay
inside the parent module and do not form a second vocabulary.
_Avoid_: primitive, widget, pass-through, wrapper, control.

**Block**:
A pre-composed, product-agnostic section assembled from components. A Block
takes its content as props and fetches no application data.
_Avoid_: widget, template, pattern, section.

**Page**:
A complete structural composition of Blocks and Components that models a whole
screen. A Page receives application-owned navigation, content and data.
_Avoid_: layout, screen, template.

**Item**:
One entry in the catalogue, of any kind. The corpus and the agent surface
address catalogue entries as items, and `kind` says which of Component, Block or
Page it is.
_Avoid_: entry, doc, component (when any kind is meant).

**Kind**:
The closed discriminator on an item: `component`, `block` or `page`, always
singular.
_Avoid_: type, category, layer.

**Category**:
One of the seven role groups a Component is assigned to: Call to action, Forms
and inputs, Feedback, Layout, Data display, Typography and Miscellaneous. A
Block or a Page has no category.
_Avoid_: kind, group, folder.

**Catalogue**:
The checked list of every Component, Block and Page, and the single source for
navigation, generated item documentation, the corpus and the agent surface. Its
code identifiers keep the `catalog` spelling; prose uses catalogue.
_Avoid_: catalog (in prose), registry, index.

**Registry**:
The shadcn registry inside the component package: its manifest, config and
scripts. It is an internal integrity artifact, never a public install lane, and
never a second catalogue.
_Avoid_: distribution lane, public registry, catalogue.

**Owned source**:
Prism-authored TypeScript, CSS and tokens that a consumer composes through
documented package exports. It names the public system, not permission to fork a
copy of it.
_Avoid_: wrapper around another design system, generated proxy, copied source.

**Internal dependency**:
A dependency used inside a package to provide behaviour or structure, such as
Base UI or Tailwind in the component package. It is never part of the public
surface.
_Avoid_: internal primitive, public dependency, extension API.

**Provider**:
The optional client module that carries pack and mode through context and writes
the two document-element attributes. It has no override path.
_Avoid_: theme factory, override surface, theme object.

### Source and agents

**Corpus**:
The deterministic projection of the catalogue and the documentation into
`llms.txt`, the Markdown mirror tree, and the store the MCP server serves.
_Avoid_: hand-maintained reference, duplicated documentation, data dump.

**Store**:
The type-checked projection of the corpus that the MCP server reads at runtime.
It is generated, never hand-edited.
_Avoid_: database, cache.

**Agent surface**:
The corpus and the read-only MCP endpoint through which an agent reads the same
catalogue, props, examples and tokens as the documentation site.
_Avoid_: agent door, second product, telemetry surface.

## Retired words

These words are historical. Do not revive them in code, comments, issues or
prose.

- **primitive** as a unit noun: the units are Component, Block and Page, and the
  raw ramps are foundation tokens.
- **colourway**: say pack.
- **variant** as a unit noun: a component may take a `variant` prop, but a
  variant is never a catalogue unit and never a synonym for item.
- **beam-dark**: the mode is `dark`.
- **pass-through** and **wrapper**: a component that re-exports an internal
  dependency unchanged is still a Component.
- **agent door**: say agent surface.
- **internal primitive**: say internal dependency.
- **catalog**: in prose, say catalogue.
- **layer** as a unit noun: the units are Component, Block and Page, and "tier"
  names the token levels.
- **Spectral Refraction**, **Archivo Variable** and **JetBrains Mono**: the
  dropped visual identity. The system uses Inter and the packs named above.
