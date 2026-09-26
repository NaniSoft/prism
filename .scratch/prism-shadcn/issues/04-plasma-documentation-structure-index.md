---
Labels: wayfinder:research
Type: research
Status: resolved
---

# What is coveo/plasma's documentation structure, page for page

## Question

The brief this effort answers is "the launched website docs must contain
documentation similar to `coveo.plasma.com`, refer its index to get a better
clarity". Plasma's site is a Storybook, so what is actually being asked for is
its *documentation structure*, not its renderer. This ticket turns that into a
page-level specification.

Against `github.com/coveo/plasma` branch `master` and the live
`plasma.coveo.com`, report:

1. **The index, as a specification.** `https://plasma.coveo.com/index.json`
   returns 159 entries across five `@`-prefixed groups: `@overview`,
   `@foundation`, `@content`, `@components`, `changelogs`. Give the full
   top-level and second-level grouping tree, with the count of documentation
   pages and stories at each level. This tree is the thing being imitated, so
   it needs to be exact rather than approximate.
2. **The per-component page skeleton**, exactly. Take `Button.mdx` and `Table.mdx`
   as the two extremes and give the section order, which sections are required
   versus optional, and what each section is for. Note the two variants: pages
   attached to a story, and unattached prose pages.
3. **The controls and API tables.** How the props table is produced, what
   columns it has, how `argTypes` are annotated to feed it, and the convention
   for a component that re-exports an upstream component unchanged.
4. **The `@foundation` section**, page by page: colours, iconography, radii,
   shadows, spacings, typography, variables. What each page shows and how it is
   built. This repository has a token browser and a themes page, and the
   question is how those map onto plasma's foundation section.
5. **The `@content` section**, page by page: About Content, Audience, Voice,
   Writing mechanics, Product vocabulary, Glossary. What a section of this kind
   contains, and whether it is documentation of the design system or of the
   organisation's writing.
6. **The `@overview` section**: Getting Started and Using LLMs. What each
   covers and how long.
7. **The agent-facing spec format** in `packages/llms/src/components/`. The
   frontmatter, the required H1s and H2s, the RFC 2119 voice, the props
   definition-list format, and why the props are a definition list rather than
   a table. The old MCP server extracts props with a regular expression
   keyed on the `## Props` heading, so the format is load-bearing and the
   constraint needs stating exactly.
8. **The two registers.** plasma keeps a hand-written agent spec and a
   separate human page in deliberately different voices, and its own
   documentation skill forbids copying between them. Establish the rule and the
   reasoning, since deciding whether to copy that separation is a decision this
   map still has to make.
9. **What to copy and what to leave.** The user named plasma as the reference
   for documentation depth. Separate what is a documentation-structure
   convention worth adopting from what is a Storybook implementation detail
   that has no equivalent under fumadocs.

Do not propose a structure for our site. Report plasma's, precisely, so the
decision can be made against a specification instead of an impression.

## Answer

Full specification in
[research/04-plasma-documentation-structure.md](../research/04-plasma-documentation-structure.md),
102 KB, parsed from the live `index.json` and the repository source rather than
described from the outside.

### The index, exactly

159 entries: **79 `docs` and 80 `stories`**, across five top-level groups.
`@overview` 2 docs and 0 stories, `@foundation` 7 and 7, `@content` 6 and 0,
`@components` 59 and 73, `changelogs` 5 and 0. Split by the discriminating tag:
**65 `attached-mdx`** with a `storiesImports` sibling, being 7 foundation and 58
component pages, and **14 `unattached-mdx`** being 2 overview, 6 content, 1
component overview and 5 changelogs. Exact second-level counts are in the file.

Two details worth carrying. `changelogs` is the only group without an `@` prefix,
so the convention is not universal even inside plasma. And `@foundation`'s
`storySort` list is stale: it names an `Overview` entry that does not exist and
omits `Variables`. plasma's own sidebar ordering is not maintained, which is
worth knowing before treating it as a specification.

### The page skeleton, and where the weight actually is

All 58 component MDX files are byte-identical in outline: H1, Overview, Usage,
Guidelines, When to use, When not to use, Best practices, with Content guidelines
optional. `Table.mdx` at 1 846 bytes is the **largest** component page, barely
bigger than `Button.mdx` at 1 712 bytes.

So plasma's per-component prose is about 1.7 KB. The weight sits elsewhere: the
story for the same Table is 18 514 bytes and its agent spec is 11 544. A reader
comparing our catalogue to plasma's should compare the whole item, not the page.

### Controls and API tables

Generated from `argTypes` via four fields: `control` with `options`,
`description`, `table.type.summary` and `table.defaultValue.summary`. The rule
worth stealing is that the reported default is the **component's** default, never
the story's `args` value, because a story's default is a demonstration choice and
reporting it as the component's default is a lie.

The re-export case is instructive: a pass-through component sets
`component: Anchor` and hand-curates four rows, narrowing `options` to the
recommended values while still reporting the true upstream default of `'md'`.

The MCP extraction regex is `/## Props\n([\s\S]*?)(?=\n## |$)/`. Consequences:
`## Props` must be a literal H2, `###` is safe, and the ordering of
`# API reference` and `## Usage` is part of the contract rather than a style
choice.

### Foundations, content, and the two registers

Foundation pages are 170 to 197 byte MDX shells that host a 2.5 to 8.2 KB story
plus a CSS module. The page is a mount point; the content is code.

`@content` is **organisational writing practice, not design-system
documentation**, quoted directly from `Voice.md` and `ProductVocabulary.md`. That
settles whether to adopt the section: adopting plasma's `@content` group means
adopting a voice and product-vocabulary policy, not a set of design-system
pages.

The agent spec format has exactly two frontmatter keys, `name` and
`description`, and a one-entry-per-line `## Props` definition list rather than a
table.

The two registers are separated by **validators, not by taste**: RFC 2119
language is required in the agent layer and forbidden in the human layer, and the
em dash is permitted in one and banned in the other. plasma ships this as three
skills under `.github/skills/`, with the storybook skill explicitly forbidden
from editing the agent specs.

### Two flags the brief did not ask for

**The agent specs are 3 to 6 times larger than the human pages.** The
machine-facing layer is the substantial one, which inverts the intuition that
documentation is for people.

**The human layer's voice rules have no build gate.** `fmt:check`, the Storybook
build and oxlint cannot detect a stray `MUST` or an em dash in a page. The
separation is well specified and poorly enforced, so a decision to copy it
should also decide how it is checked, or it will drift silently.

