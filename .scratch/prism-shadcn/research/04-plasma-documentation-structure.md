---
Labels: wayfinder:research
Type: research
Answers: .scratch/prism-shadcn/issues/04-plasma-documentation-structure-index.md
Sources: plasma.coveo.com (live, Storybook build), github.com/coveo/plasma @ master
Fetched: 2026-09-26
---

# coveo/plasma documentation structure, as a specification

Scope: this reports **plasma's** structure precisely, so a decision can be made
against a specification rather than an impression. It does not propose a
structure for `@nanisoft/prism`.

Everything below is read from primary sources:

- `https://plasma.coveo.com/index.json` (Storybook index v5, 47,560 bytes, 159 entries)
- `https://plasma.coveo.com/llms.txt` (12,429 chars), `llms-full.txt` (286,062 chars),
  `plasma-skill.md` (4,179 chars), `llms/{components,content,foundations}/index.json`
- `https://raw.githubusercontent.com/coveo/plasma/master/...` for every source file

**Byte sizes are exact**, from the GitHub trees API
(`https://api.github.com/repos/coveo/plasma/git/trees/master?recursive=1`,
2,711 blobs, `truncated: false`). Where I quote a live `plasma.coveo.com`
markdown file I give its character length, because the build rewrites it.

Repository was **not** cloned.

---

## 1. The index, as a specification

`index.json` is `{"v": 5, "entries": {…}}` and nothing else — no `ref`, no
`previewAnnotations`. **159 entries: 79 `type: "docs"` + 80 `type: "story"`.**

Grouping is read from each entry's `title` field, split on `/`. The `@` prefix
is **part of the title string**, not metadata: `docs` entries carry the full
two-segment title (`"@components/Call to action/Button"`), while `story` entries
carry only the first two segments (`"@components/Call to action"`) plus a
`name` (`"Demo"`) and an `exportName`.

### Complete grouping tree

| Top-level group | 2nd-level subgroup | docs | stories |
| --- | --- | ---: | ---: |
| `@overview` | Getting Started | 1 | 0 |
| `@overview` | Using LLMs | 1 | 0 |
| | **`@overview` total** | **2** | **0** |
| `@foundation` | Colors | 1 | 1 |
| `@foundation` | Iconography | 1 | 1 |
| `@foundation` | Radii | 1 | 1 |
| `@foundation` | Shadows | 1 | 1 |
| `@foundation` | Spacings | 1 | 1 |
| `@foundation` | Typography | 1 | 1 |
| `@foundation` | Variables | 1 | 1 |
| | **`@foundation` total** | **7** | **7** |
| `@content` | About Content | 1 | 0 |
| `@content` | Audience | 1 | 0 |
| `@content` | Voice | 1 | 0 |
| `@content` | Writing mechanics | 1 | 0 |
| `@content` | Product vocabulary | 1 | 0 |
| `@content` | Glossary | 1 | 0 |
| | **`@content` total** | **6** | **0** |
| `@components` | Overview | 1 | 0 |
| `@components` | Call to action | 8 | 9 |
| `@components` | Forms and inputs | 20 | 25 |
| `@components` | Feedback | 11 | 14 |
| `@components` | Layout | 11 | 13 |
| `@components` | Data display | 5 | 5 |
| `@components` | Typography | 2 | 6 |
| `@components` | Miscellaneous | 1 | 1 |
| | **`@components` total** | **59** | **73** |
| `changelogs` | plasma-llms | 1 | 0 |
| `changelogs` | plasma-mantine | 1 | 0 |
| `changelogs` | plasma-mcp-server | 1 | 0 |
| `changelogs` | plasma-react-icons | 1 | 0 |
| `changelogs` | plasma-tokens | 1 | 0 |
| | **`changelogs` total** | **5** | **0** |
| | **GRAND TOTAL** | **79** | **80** |

Five top-level groups. Four are `@`-prefixed; **`changelogs` is not**, which is
why the sidebar's `storySort` list has to name it explicitly after the `'*'`
wildcard.

### `attached-mdx` vs `unattached-mdx`

Every `docs` entry carries a discriminating tag, and it lines up exactly with
whether `storiesImports` is non-empty:

| Tag | Count | `storiesImports` | Where |
| --- | ---: | --- | --- |
| `attached-mdx` | **65** | non-empty (one sibling `*.stories.tsx`) | 7 `@foundation` + 58 `@components` |
| `unattached-mdx` | **14** | `[]` | 2 `@overview` + 6 `@content` + 1 `@components/Overview` + 5 `changelogs` |

The single exception inside `@components` is `components-overview--docs`
(`./src/components/ComponentsOverview.mdx`), which is prose with a JSX table,
not a story binding.

Both kinds also always carry `dev`, `test`, `manifest`. Stories carry `test`,
`manifest` and a `subtype: "story"`; foundation stories additionally carry a
`!dev` tag in their `*.stories.tsx` `meta.tags`, which is why foundation
stories are not counted in Storybook's default dev set.

### Second-level subgroups in full (component roster)

`@components/Call to action` — 8: ActionIcon, Anchor, Breadcrumbs, Button,
CloseButton, CopyToClipboard, NavLink, Pagination.

`@components/Forms and inputs` — 20: Chip, Collection, Facet, MultiSelect,
Checkbox, Switch, DatePickerInput, MonthPickerInput, TimePicker,
YearPickerInput, NumberInput, Slider, CodeEditor, PasswordInput, Radio,
RadioCard, SegmentedControl, Select, TextInput, Textarea.

`@components/Feedback` — 11: Alert, InfoToken, LastUpdated, Loader,
Notification, PrerequisitesList, Progress, Skeleton, StatusToken, Stepper,
Tooltip.

`@components/Layout` — 11: Accordion, AppShell, BrowserPreview, ChildForm,
Header, Modal, Navigation, Prompt, ScrollArea, StickyFooter, Tabs.

`@components/Data display` — 5: Badge, Card, Image, Pill, Table.

`@components/Typography` — 2: EllipsisText, Kbd.

`@components/Miscellaneous` — 1: Menu.

### Story `name` distribution (80 stories)

- `Demo` — **52** (the near-universal convention)
- `Overview` — 3 (`colors--overview`, `iconography--overview`, `variables--overview`)
- `Default` — 3 (`switch--default`, `stepper--default`, `stickyfooter--default`)
- named after the page — 4 (`Radii`, `Shadows`, `Spacings`, `Typography`)
- named variants — 18: `With Children`, `Legacy`, `Checkbox Item`,
  `Checkbox Group`, `Checkbox All States`, `Switch Group`, `Radio Item`,
  `Radio Group`, `With Navigation`, `Notification System`,
  `Prerequisite List Item`, `Modal With Tabs`, `Modal With Table`, and five
  `EllipsisText` variants (`Ellipsis Text Default Long`, `… Default Short`,
  `… Line Clamp Long`, `… Line Clamp Short`, `… No Wrap Container`)

`exportName` always equals the PascalCase of `name`.

### Directory depth is deeper than the sidebar

`@components/Forms and inputs` has filesystem subdirectories
`array/ boolean/ date/ number/ string/` and `@foundation` has
`colors/ iconography/ radii/ shadows/ spacings/ typography/ variables/`. None of
these appear in any `title`, so the sidebar is strictly two levels deep while
the file tree is three or four. **Inference:** the extra directory level is
purely organisational (a thematic split with no navigation consequence).

### `storySort` (the ordering source of truth)

`packages/storybook/.storybook/preview.tsx`, 2,431 bytes,
`parameters.options.storySort.order`:

```ts
'@overview',
['Getting Started', 'Using LLMs'],
'@foundation',
['Overview', 'Colors', 'Iconography', 'Radii', 'Shadows', 'Spacings', 'Typography'],
'@content',
['About Content', 'Audience', 'Voice', 'Writing mechanics', 'Product vocabulary', 'Glossary'],
'@components',
['Overview', 'Call to action', 'Forms and inputs', 'Feedback', 'Layout',
 'Data display', 'Typography', 'Miscellaneous'],
'*',
'changelogs',
```

Note: the `@foundation` sub-list names `'Overview'` (which does not exist as a
foundation entry) and omits `'Variables'`. **The order list is stale for
`@foundation`; `Variables` therefore sorts by its own name after `Typography`.**
Everything else matches the index exactly.

### Full 159-entry table is in the analysis, not reproduced here

Every entry's `id`, `importPath`, `type`, `tags`, `exportName` was extracted
and is reproducible from `index.json` alone. The shape is uniform:

```json
"button--docs": {
  "id": "button--docs",
  "title": "@components/Call to action/Button",
  "name": "Docs",
  "importPath": "./src/components/call-to-action/Button.mdx",
  "storiesImports": ["./src/components/call-to-action/Button.stories.tsx"],
  "type": "docs",
  "tags": ["dev", "test", "manifest", "attached-mdx"]
},
"button--demo": {
  "type": "story", "subtype": "story",
  "id": "button--demo", "name": "Demo",
  "title": "@components/Call to action",
  "importPath": "./src/components/call-to-action/Button.stories.tsx",
  "tags": ["test", "manifest"],
  "exportName": "Demo"
}
```

---

## 2. The per-component page skeleton, exactly

### The small extreme: `Button.mdx` (1,712 bytes)

`packages/storybook/src/components/call-to-action/Button.mdx`, in full order:

```
import {Canvas, Controls, Meta} from '@storybook/addon-docs/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

Action button that triggers tasks and provides async loading and disabled-tooltip feedback.

## Overview
## Usage           → <Canvas of={ButtonStories.Demo} />
                   → <Controls of={ButtonStories.Demo} />
## Guidelines
### When to use
### When not to use
### Best practices
### Content guidelines
```

### The large extreme: `Table.mdx` (1,846 bytes)

`packages/storybook/src/components/data-display/Table.mdx` is the **largest
component MDX in the repository**. Its section order is *identical* to Button's:

```
# Table
## Overview
## Usage        → <Canvas of={TableStories.Demo} /> / <Controls … />
## Guidelines
### When to use
### When not to use
### Best practices
### Content guidelines
```

The size difference (1,712 → 1,846 bytes) is entirely **prose volume inside
`Best practices` and `Content guidelines`** (6 and 4 bullets against Button's 4
and 4), not extra sections.

Worth stating plainly: **the component MDX pages do not scale with the
component.** The page for a 13-prop, sub-component-rich, store-coordinated
`Table` is 1,846 bytes. The page for a `Button` with 9 sub-components is 1,712.
Table's real weight is in `Table.stories.tsx` (**18,514 bytes** — the largest
story file in the repo) and in `packages/llms/src/components/Table.md`
(**11,544 bytes**, the largest agent spec).

The largest MDX files on the site are not component pages at all:
`content/WritingMechanics.mdx` (23,066), `components/ComponentsOverview.mdx`
(15,799), `content/ProductVocabulary.mdx` (8,932), `content/Voice.mdx` (8,022),
`overview/UsingLLMs.mdx` (6,393).

### Empirical section-frequency across all 59 MDX files under `src/components/`

I parsed every one. **58 of 58** attached component pages have the *exact same*
outline:

```
# <Name>
## Overview
## Usage
## Guidelines
### When to use
### When not to use
### Best practices
[### Content guidelines]   ← optional
```

Not one page deviates. Not one page has a Variants, States, Accessibility,
Props, API, Examples, or Do/Don't section. The 59th file,
`ComponentsOverview.mdx`, is the unattached catalogue page (§4 below).

So, derived from 58/58 rather than from the skill's prose:

**Required (58/58):** story namespace import; `<Meta of={…} />`; H1 = component
name; one-sentence description immediately under the H1; `## Overview`;
`## Usage` containing a `<Canvas of={…} />`; `## Guidelines`; `### When to
use`; `### When not to use`; `### Best practices`.

**Optional (37/58 present, 21/58 absent):** `### Content guidelines`. It is
present exactly on the components that own user-facing copy. Absent on:
ActionIcon, Breadcrumbs, CloseButton, Pagination, Slider, Loader, Progress,
Skeleton, StatusToken, InfoToken, AppShell, ScrollArea.

**Optional (30/58 present, 28/58 absent):** `<Controls of={…} />`. Present on
all 8 call-to-action, all 5 data-display, all 4 date pickers, 8 of 9 string
inputs (all but Radio), NumberInput, Slider, CodeEditor, PasswordInput,
RadioCard, SegmentedControl, Select, TextInput, Textarea, Accordion, Kbd,
LastUpdated. Absent on all of Feedback except LastUpdated, all of Layout except
Accordion, all four array inputs, both booleans, the rest of Data display minus
none, Menu, EllipsisText, AppShell.

**Observed inconsistency (flagged, not inferred):** `feedback/Alert.stories.tsx`
(1,851 bytes) *does* define a full `argTypes` block including `table.type.summary`
and `table.defaultValue.summary`, yet `feedback/Alert.mdx` has no `<Controls>`.
56 of 58 stories declare `argTypes` (only `miscellaneous/Menu.stories.tsx` and
`typography/EllipsisText.stories.tsx` do not), so Controls presence does **not**
track argTypes presence. Only `call-to-action/Pagination.stories.tsx` uses
`table: {disable: true}`. The skill's stated rule ("omit Controls when the
panel would be empty, misleading, or dominated by implementation-only values")
is therefore applied by judgement, not mechanically.

### Purpose of each section (per `references/page-structure.md`)

| Section | Purpose, in the skill's words | Mandatory? |
| --- | --- | --- |
| `<Meta of={…} />` | "Inherit sidebar title and ID through `<Meta of={ComponentStories} />`" | yes |
| H1 | component name | yes |
| one-sentence description | the frontmatter description, "edited for human readers if needed" | yes |
| `## Overview` | "the role of the component and the problem it solves". "Do not repeat the component description word for word in Overview." | yes |
| `## Usage` | owns everything visible: variants, states, the demo, the controls. "Usage should communicate visible options and states whenever possible." | yes |
| `<Controls />` | interactive props panel, only when the story exposes meaningful args | no |
| `## Guidelines` | the decision layer | yes |
| `### When to use` | contexts and selection criteria | yes |
| `### When not to use` | misuses **with the named alternative**: "use `ActionIcon`", "use a link" | yes |
| `### Best practices` | "the most consequential decision, hierarchy, layout, and behavior guidance". Also the home for any "essential nonvisual requirement when a demo cannot communicate it". | yes |
| `### Content guidelines` | how to write the component's labels, titles, messages. "A short bullet list is enough." | only when the component has meaningful user-facing copy |
| component-specific section | "only when essential guidance does not fit Best practices" | exceptional |

Explicitly **not** standard, from `page-structure.md`: "Variants, states, and
accessibility sections are not standard."

And from `SKILL.md` §6: "Keep variants, states, accessibility inventories,
props, and code samples out when Usage already communicates them."

### Variant A — page attached to a story (58 pages)

Bindings, verbatim from `Button.mdx` and `Table.mdx`:

```mdx
import {Canvas, Controls, Meta} from '@storybook/addon-docs/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />          ← binds sidebar title + id from the story meta
...
<Canvas of={ButtonStories.Demo} />   ← renders the named export inside a live canvas
<Controls of={ButtonStories.Demo} /> ← renders that story's Controls table
```

Mechanics that matter:

- The MDX **does not repeat the title** on `<Meta>`. The skill is explicit:
  "Do not duplicate the story title on `Meta`. The `of` binding supplies the
  title and ID from the story metadata." The title lives in the story's `meta.title`
  (`'@components/Call to action/Button'`) and the sidebar slug in `meta.id`
  (`'Button'`).
- `docs.parameters.codePanel: true` in `preview.tsx`, so every `<Canvas>`
  also renders the story's source in a code panel. The demo *is* the example.
- `docs.parameters.toc.headingSelector: 'h2'` — the in-page table of contents
  shows **only H2s**. That is the mechanical reason Guidelines subsections are
  H3 and not H2: the TOC is Overview / Usage / Guidelines, three items.
- `.storybook/main.ts`, 647 bytes, discovers both kinds:
  `stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)']`.

### Variant B — unattached prose page (14 pages)

No story namespace, no `Canvas`, no `Controls`. The title and id are declared
inline on `<Meta>`, and there is **no `id` in the `title` string's `@`
prefix**, so the `@` group has to be written out by hand:

```mdx
import {Meta} from '@storybook/addon-docs/blocks';

<Meta title="@overview/Getting Started" id="getting-started" />
```

Instances: `overview/GettingStarted.mdx`, `overview/UsingLLMs.mdx`, all six
`content/*.mdx`, `components/ComponentsOverview.mdx`, and the five
`changelogs/*.mdx`. The `@foundation` pages are a **third** thing — attached to
a story, but not a component: see §4.

There is a fourth, unremarked pattern: `changelogs/*.mdx` (408–441 bytes) use
`<Unstyled>` + `<Markdown options={{overrides: plasmaMarkdownOverrides}}>` to
render a `CHANGELOG.md` imported `?raw` from another package, reusing the shared
component map in `.storybook/plasmaMarkdownOverrides.tsx` (5,246 bytes) that
also backs `docs.parameters.components`. That map is how headings get link
anchors, how `a` becomes `Anchor`, how fenced code becomes `<Source>`, and how
`h3`–`h6` ids get scoped under their nearest h2 to de-duplicate changelog
headings.

---

## 3. Controls and API tables

### How the props table is produced

There is no hand-written props table in the human layer. **Storybook's Controls
table is generated from the story's `argTypes`**, and plasma feeds it four
fields per arg. From `references/arg-types.md`:

> - `control` and `options`, when the value is directly editable
> - `description`, written in plain language
> - `table.type.summary`, showing the useful public type
> - `table.defaultValue.summary`, showing the actual component default
>
> "Use string summaries for types and defaults. Write union values with quotes
> when the values are string literals."

The three columns that appear are therefore **Name / Description / Type /
Default** (Storybook's default `Controls` table columns; `description` is
rendered as the description cell and `table.*` supply the type and default
cells). **`table.category`, `table.label` and any custom columns are never
used anywhere in the repo.**

`Button.stories.tsx` (3,936 bytes), the annotated form, verbatim:

```tsx
const meta: Meta<ButtonStoryArgs> = {
    title: '@components/Call to action/Button',
    id: 'Button',
    parameters: {layout: 'centered'},
    argTypes: {
        buttonVariant: {
            control: 'select',
            options: buttonVariants,
            description: 'Selects the Plasma button sub-component used by this example.',
            table: {
                type: {summary: "'Primary' | 'Secondary' | 'Tertiary' | 'Quaternary' | 'DestructivePrimary' | 'DestructiveSecondary' | 'DestructiveTertiary' | 'DestructiveQuaternary'"},
                defaultValue: {summary: "'Primary'"},
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the button.',
            table: {type: {summary: 'boolean'}, defaultValue: {summary: 'false'}},
        },
        loading: {
            control: 'boolean',
            description: 'Shows a loading indicator and prevents interaction.',
            table: {type: {summary: 'boolean'}, defaultValue: {summary: 'false'}},
        },
        children: {
            control: 'text',
            description: 'Content rendered inside the button.',
            table: {type: {summary: 'ReactNode'}, defaultValue: {summary: 'undefined'}},
        },
        onClick: {
            action: 'clicked',
            description: 'Runs when the user selects the button.',
            table: {
                type: {summary: 'ClickHandler<HTMLButtonElement>'},
                defaultValue: {summary: 'undefined'},
            },
        },
        withRightSection: {
            control: 'boolean',
            description: 'Toggles an icon after the button label in this example.',
            table: {type: {summary: 'boolean'}, defaultValue: {summary: 'false'}},
        },
        withLeftSection: {
            control: 'boolean',
            description: 'Toggles an icon before the button label in this example.',
            table: {type: {summary: 'boolean'}, defaultValue: {summary: 'false'}},
        },
    },
    args: {
        buttonVariant: 'Primary', children: 'Button',
        onClick: () => showNotification({message: 'Button clicked', autoClose: false}),
        loading: false, withRightSection: false, withLeftSection: false, disabled: false,
    },
};
```

`Table.stories.tsx` (18,514 bytes) uses the same shape for 16 args, and is the
clearest demonstration of the **synthetic adapter argument** rule — 15 of its
16 args are story-only toggles whose descriptions all end in "…in this example"
(`'Adds a text filter to this example.'`, `'Toggles between populated and empty
states in this example.'`), and only `loading` is a public prop:

```tsx
type StoryArgs = TableProps<Person> & {
    withFilter: boolean;
    withPredicateFilter: boolean;
    controlPlacement: 'header' | 'toolbar';
    …15 more
};

argTypes: {
    loading: {
        control: 'boolean',
        description: 'Shows loading placeholders and prevents row selection.',
        table: {type: {summary: 'boolean'}, defaultValue: {summary: 'false'}},
    },
    withFilter: {
        control: 'boolean',
        description: 'Adds a text filter to this example.',
        table: {type: {summary: 'boolean'}, defaultValue: {summary: 'false'}},
    },
    controlPlacement: {
        control: 'radio',
        options: ['header', 'toolbar'],
        description: 'Places the example filters in the table header or in a toolbar.',
        table: {type: {summary: "'header' | 'toolbar'"}, defaultValue: {summary: "'header'"}},
    },
    …
}
```

Note `faker.seed(42)` and `faker.setDefaultRefDate(SEEDED_DATE)` at module
scope, with the comment "Set the seed for faker to avoid mismatch in chromatic."

`packages/storybook/src/Args.ts` (3,235 bytes) is the shared arg library for the
inputs: an `Arg<T> = {type, initialValue}` pair so the `argTypes` entry and the
story `args` value can never drift, exported as
`Args = {label, description, error, required, disabled, readOnly, placeholder, clearable, labelInfo, type}`.
`forms-and-inputs/InputWrapperArgs.ts` (1,861) and
`forms-and-inputs/LabelInfoArgs.tsx` (779) extend it. The `type` arg is the
representative union form:

```tsx
const type: Arg<'default' | 'multiple' | 'range'> = {
    type: {
        control: 'radio',
        options: ['default', 'multiple', 'range'],
        description: 'Picker type',
        table: {
            defaultValue: {summary: 'default'},
            type: {summary: "'default' | 'multiple' | 'range'"},
        },
    },
    initialValue: 'default',
};
```

### The rules the skill states, and the ones it does not

Enforced (from `references/arg-types.md` + `validation-checklist.md`):

1. Four required fields per exposed arg, quoted above.
2. `table.type.summary` is the **public** type, never the control widget type.
   Its worked example: "a boolean demo toggle that inserts an icon does not
   change a public `ReactNode` prop into `boolean`."
3. `table.defaultValue.summary` is the **component** default, and the rule is
   emphatic: "Do not infer a component default from the representative story's
   `args`." "Story `args` define the initial demo state, not the component API
   default. They may differ intentionally so the demo contains meaningful
   content."
4. Synthetic story-only args must be "clearly named", must document "the story
   default and the synthetic type", and "Do not present an adapter value as
   though it were the public prop value."
5. Control-to-value mapping table: boolean → `boolean`; number → `number` or
   range; short string union → `select` / `inline-radio` / `radio` + `options`;
   free text → `text`; callback → Storybook action, **no editable control**;
   complex object or React node → disable the control or introduce an adapter.
6. `table: {disable: true}` for "irrelevant inherited props [that] would
   distract from the representative demo."
7. Verification source order: implementation/JSDoc → wrapper defaults → tests →
   read-only spec → Mantine docs for inherited props → existing story metadata.
   "When an inherited default depends on Mantine, verify the supported Mantine
   version instead of guessing."

Not stated as a rule, but uniform in practice: the description is always a
**full sentence ending in a period**, and it describes the effect on the
rendered component, never the widget.

**Observed, not enforced:** the `onClick`/`action` arg in `Button.stories.tsx`
is *not* annotated in `Button.mdx`'s Controls panel sense — it is, but only
because the page includes `<Controls>`. The skill's rule "Do not fabricate args
solely to make the Controls block nonempty" is what the synthetic `with*` args
in `Table.stories.tsx` arguably strain against; they are, however, doing real
work in the demo.

### The convention for a component that re-exports upstream Mantine unchanged

This is the case `Anchor` is, and there are **two** conventions, one per layer.

**Agent layer — the `> Extends:` note, and two accepted forms.**
`packages/llms/src/components/Anchor.md` (3,534 bytes):

```markdown
## Props

> Extends: `AnchorProps` from `@mantine/core`. No additional Plasma-specific props beyond the Mantine base component.
```

That is the H2 followed by *nothing else*. 13 specs do this: Anchor,
Breadcrumbs, Input, NavLink, Progress, Radio, ScrollArea, SegmentedControl,
Slider, Stepper, Switch, Tabs, TextInput.

`references/format.md` names that shape **Form A** and prescribes an italic
shorthand for it:

```markdown
## Props

_No additional props beyond the Mantine base component._
```

29 of the 62 specs use Form A literally (`Accordion`, `Alert`, `AppShell`,
`Checkbox`, `Chip`, `Image`, `Input`, `Kbd`, `Loader`, `Menu`,
`MonthPickerInput`, `MultiSelect`, `NavLink`, `Notification`, `NumberInput`,
`Pagination`, `PasswordInput`, `Pill`, `Progress`, `Radio`, `ScrollArea`,
`SegmentedControl`, `Select`, `Skeleton`, `Slider`, `Stepper`, `Switch`, `Tabs`,
`TextInput`). So **both forms are live in the same directory** — the
`> Extends:` blockquote is used 52 times in total, the italic shorthand 29
times, and 13 files carry the blockquote with zero prop entries. The
`> Extends:` note always names the base types and always ends with the same
sentence: "Only Plasma-specific props are listed below; refer to Mantine
documentation for inherited props." One variant (`PrerequisitesList.md`)
tightens it: "inherited props MUST be referenced in Mantine documentation."

**Human layer — hand-curate a subset of the inherited props.**
`Anchor.stories.tsx` (1,875 bytes) does **not** skip Controls. It points
Storybook's docgen at the real component and then hand-writes four rows:

```tsx
const meta: Meta<typeof Anchor> = {
    title: '@components/Call to action/Anchor',
    id: 'Anchor',
    component: Anchor,          ← 47 of 58 stories do this; Button does not
    parameters: {layout: 'centered'},
    argTypes: {
        size: {
            control: 'select',
            options: ['xs', 'sm'],
            description: 'Sets the font size and line height of the link.',
            table: {
                defaultValue: {summary: "'md'"},
                type: {summary: 'MantineSize | (string & {})'},
            },
        },
        href: {
            control: 'text',
            description: 'Sets the link destination.',
            table: {type: {summary: 'string'}, defaultValue: {summary: 'undefined'}},
        },
        children: {
            control: 'text',
            description: 'Content rendered inside the link.',
            table: {type: {summary: 'ReactNode'}, defaultValue: {summary: 'undefined'}},
        },
        target: {
            control: 'select',
            options: ['_self', '_blank', '_parent', '_top'],
            description: 'Sets where the linked destination opens.',
            table: {
                defaultValue: {summary: 'undefined'},
                type: {summary: 'HTMLAttributeAnchorTarget'},
            },
        },
    },
    args: {href: 'https://plasma.coveo.com', children: 'Plasma Design System', target: '_blank', size: 'sm'},
};
```

So the convention is: **inherit the types (`component: Anchor` + `Meta<typeof
Anchor>`), then curate.** Four things to copy from it:

1. `table.type.summary` is allowed to be the **upstream** type verbatim
   (`'MantineSize | (string & {})'`, `'HTMLAttributeAnchorTarget'`) rather than a
   simplified lie. The skill's own example in `arg-types.md` is the simplified
   form (`"'sm' | 'md' | 'lg'"`); `Anchor.stories.tsx` shows the rule is
   "use the public named type when expanding it would be noisy."
2. `options` is **narrowed to the values plasma recommends** (`['xs','sm']`)
   while `table.defaultValue.summary` reports the **true** upstream default
   (`'md'`). This is the cleanest instance in the repo of the skill's rule that
   the demo's arg values and the component's API default are different things.
3. There is no `> Extends:` equivalent in the human layer, because
   `plasmaDocsComponents` / docgen already shows inherited props; the page just
   curates the four worth showing.
4. 47 of 58 stories set `component:`; the 11 that don't (`ActionIcon`,
   `Breadcrumbs`, `Button`, `CloseButton`, `NavLink`, `Collection`, `Facet`,
   `CodeEditor`, `PasswordInput`, `AppShell`, `Modal`) are the ones that need a
   **synthetic** arg or a **sub-component switch**, so they declare an explicit
   `type ButtonStoryArgs = Omit<ButtonProps, …> & {…}` instead and dispatch in
   `render` (`const ButtonComponent = Button[buttonVariant] as ComponentType<ButtonProps>`).

### `packages/llms/src/components/Button.md` under `## Props` — verbatim

The agent layer's props are **not a table**. It is a one-entry-per-line
definition list. `Button.md` is 5,335 bytes; frontmatter is 3 lines
(`---`, `name: Button`, `description: …`, `---`); the `## Props` section
verbatim:

```markdown
## Props

> Extends: `ButtonProps`, `ButtonWithDisabledTooltipProps`. Only Plasma-specific props are listed below; refer to Mantine documentation for inherited props.

**`onClick`** `ClickHandler<HTMLButtonElement>` · optional · default: `undefined` — Handler executed on click. Async handlers MAY be used; the button shows a loading state while the promise resolves.
**`disabledTooltip`** `string` · optional · default: `undefined` — The tooltip message displayed when the button is disabled.
**`disabled`** `boolean` · optional · default: `undefined` — Indicates whether the button underneath the tooltip is disabled.
**`disabledTooltipProps`** `Omit<TooltipProps, 'disabled' | 'label' | 'children'>` · optional · default: `undefined` — Additional tooltip props MAY be set on the disabled button tooltip.
**`fullWidth`** `boolean` · optional · default: `undefined` — When provided, sets the button width to 100% of the parent element.
```

Grammar, from `references/format.md` "Form B":

- `**\`propName\`**` — bold, backticked, the exact public prop name
- `` `Type` `` — a backticked type; string-literal unions are written with
  quotes
- `·` (U+00B7 MIDDLE DOT, spaces around it) separates the metadata fields
- `required` or `optional`, explicitly, always
- `default: \`X\`` — always present, `undefined` when there is none; a
  required prop still gets `default: \`undefined\``. A real computed default is
  written as an expression: ``default: `() => []` `` for `Table.getRowActions`,
  ``default: `[Table.Layouts.Rows]` `` for `Table.layouts`
- `—` (em dash, spaced) separates the metadata from the description
- description in one line, JSDoc copied verbatim from the TypeScript source
  when available
- **no blank lines between entries** — that is what makes it a list, and it
  keeps token cost low

Entry counts across the 62 agent specs range from 0 to 20 (`Facet.md` 20,
`Collection.md` 19, `Table.md` 16, `CodeEditor.md` 14, `Textarea.md` 12).

`## Sub-components` follows as a plain bullet list of static properties, with
the same RFC 2119 note repeated: "Plasma provides pre-configured sub-components
as convenience wrappers. **You SHOULD use these over setting props manually.**"

### Why the format is load-bearing: the MCP regex

`packages/mcp-server/src/tools/getComponentProps.ts` (651 bytes), in full:

```ts
const propsMatch = doc.content.match(/## Props\n([\s\S]*?)(?=\n## |$)/);
const propsSection = propsMatch ? `## Props\n${propsMatch[1]}` : '_No props documentation available._';
return {text: `# ${doc.name} Props\n\n${propsSection}`};
```

The extraction is keyed on **the literal two-hash-hash, space, capital-P
`## Props` followed by a newline**, and it terminates at **the next `\n## `** or
end of file. Consequences, all of which the format is built to satisfy:

- `## Props` must be a real ATX H2 at the start of a line, with exactly one
  space after `##`, and must not be a `### Props` (that would not match) nor
  `# Props` (that would not match, and would also be swallowed by the
  terminator lookahead on the *previous* section).
- A `### Something` H3 inside the props section is **safe** — the terminator is
  `\n## ` with a space, so `\n### ` does not match. `PrerequisitesList.md`
  relies on this: it has `## Sub-components` then `### PrerequisitesList.Item
  Props` with three more `**\`…\`**` entries, and the top-level `## Props`
  extraction stops at `## Sub-components`, not at the `###`.
- Nothing before `## Props` can contain a line starting `## Props`, or the
  extraction starts in the wrong place. The `# API reference` H1 immediately
  before it is what guarantees this.
- A trailing `---` + `[Full Plasma documentation](…)` footer is **inside** the
  extracted span for any spec where `## Usage` is the last H2… except it is not:
  every spec ends with `## Usage`, so the lookahead terminates at `## Usage` and
  the footer is always excluded. The `# API reference` / `## Usage` ordering is
  therefore part of the contract, not just style.
- `llms-full-txt.ts` strips the footer separately, with its own regex
  (`/\n---\n\n\[Full Plasma documentation\]\([^)]+\)\s*$/m`), because in
  `llms-full.txt` the headings are shifted up by two levels and `## Usage`
  becomes `#### Usage`, which the `## Props`-anchored extractor in
  `getComponentProps` would still find (it only looks for the literal
  `## Props`).

The definition-list format specifically is a **token-efficiency decision**: 5
props on 5 lines, no header row, no separator row, no padding, and it is
re-readable as a table by a model but costs a fraction of the tokens. Compare
the `## Props` **table** in the foundations spec, which plasma does use in
`packages/llms/src/foundations/Foundations.md` (5,972 bytes) — because
foundations are *not* served through `get_component_props`; they go through
`get_foundations` (405 bytes), which returns the whole document. **The format
is per-consumer:** definition list for the regex-keyed prop tool, tables
wherever the whole document is returned.

---

## 4. The `@foundation` section, page by page

**Every one of the seven foundation MDX files is 170–197 bytes. Every one is
the same six lines.** They host a single `<Story of={…} />`; all the content
lives in the `.stories.tsx` and, where needed, a `.module.css`. This is the
"tiny MDX that just hosts a block" pattern, and it is the inverse of the
component pages (tiny MDX, large story).

All seven stories share one `meta` shape:

```tsx
const meta: Meta = {
    title: '@foundation/Variables',      // the whole title, no third segment
    id: 'variables',                      // lowercase, unlike components
    tags: ['!dev'],                       // excluded from Storybook's dev set
    parameters: {
        layout: 'padded',
        controls: {disable: true},        // no Controls panel, ever
    },
};
```

and every page wraps its content in `FoundationWrapper`
(`packages/storybook/src/components/foundation/FoundationWrapper.tsx`, 460
bytes), which is a `Stack` containing a Plasma `<Header p={0}
description={…}>` — so the page's title and one-sentence description are
**component props, not Markdown**.

| Page | MDX | `.stories.tsx` | CSS module | Content type |
| --- | ---: | ---: | ---: | --- |
| Colors | 174 | 4,851 | `Colors.module.css` 1,715 | interactive swatch grid |
| Iconography | 197 | 8,225 | — | two searchable/paginated icon tables |
| Radii | 170 | 2,537 | — | token table + live radius preview |
| Shadows | 177 | 2,900 | `ShadowsTable.module.css` 97 | token table + live shadow preview |
| Spacings | 182 | 2,529 | — | token table + live size preview |
| Typography | 195 | 8,033 | — | two token tables + live type specimens |
| Variables | 186 | 5,902 | `Variables.module.css` 236 | six full CSS-variable tables |

Shared helpers: `FoundationWrapper.tsx` (460) and
`foundation/CSSVariableValue.tsx` (254), the latter being the single most reused
idea in the section — six lines that read the **resolved** value out of the
live cascade:

```tsx
export const CSSVariableValue = ({name}: {name: string}) => {
    const rootStyles = window.getComputedStyle(document.documentElement);
    return <Code>{rootStyles.getPropertyValue(name).trim()}</Code>;
};
```

### The MDX file, verbatim (`Colors.mdx`, 174 bytes)

```mdx
import {Meta, Story} from '@storybook/addon-docs/blocks';
import * as ColorStories from './Colors.stories';

<Meta of={ColorStories} />

<Story of={ColorStories.Overview} />
```

Note: `<Story of={…} />`, not `<Canvas of={…} />`. The other six name their
export after the page (`Radii`, `Shadows`, `Spacings`, `Typography`) or
`Overview` (Iconography, Variables). Also note the import alias in
`Colors.mdx` is `ColorStories` for a file called `Colors.stories` — a small
inconsistency against the `ButtonStories` convention the skill prescribes.

### `Colors.stories.tsx` — the pattern, in detail

4,851 bytes. Structure:

1. **A typed, closed list of palettes**, `satisfies`-checked against the real
   token type so the list cannot drift from the theme:

```tsx
import type {PlasmaColors} from '@coveord/plasma-mantine';
type ColorName = keyof typeof PlasmaColors;
const colorSections = [
    {title: 'Colors', colors: ['red','orange','yellow','green','teal','cyan','blue',
                              'indigo','navy','violet','grape','gray','dark']},
] as const satisfies ReadonlyArray<{title: string; colors: readonly ColorName[]}>;
```

2. **The value shown is resolved, never authored.** `useMantineTheme()` →
   `theme.colors[group]`, so the page reads the live Plasmantine theme and
   re-renders against the toolbar's `primaryColor` global.

3. **The whole card is an affordance.** `UnstyledButton` per swatch with
   `aria-label={`Copy ${group} shade ${index}`}`, `useClipboard({timeout: 1000})`,
   and a Tooltip whose label is the state machine:
   `` `Copied ${active.color}` `` when copied, else
   `'Hover shades for preview, click to copy HEX value'`. Hover and focus both
   set `active`; `onMouseLeave` on the card resets it.

4. **Contrast is computed, not asserted.** Every swatch's foreground comes from
   `getContrastColor({color, theme: {...theme, luminanceThreshold: 0.25},
   autoContrast: true})`.

5. **The page teaches the token name, not just the colour.** Each card prints
   `` `--mantine-color-${group}-${active.index}` `` and the resolved hex
   side by side.

6. **Layout is CSS, in a module, and it is responsive.** `.grid` is
   `repeat(auto-fit, minmax(280px, 1fr))`; `.swatches` is
   `repeat(10, minmax(0, 1fr))` — one column per shade, so the 10-shade ramp is
   legible at a glance. A `@media (width <= 48em)` block reduces card padding and
   swatch height. `:hover` and `:focus-visible` share a
   `translateY(-1px)`; transitions are 120 ms on `transform` and `box-shadow`.

7. **The header and the page are one component.**
   `<FoundationWrapper title="Colors" description="The Plasma theme defines semantic and palette color tokens used across components and states.">`

### The other six, briefly

- **Radii / Shadows / Spacings** are the *same* page three times: a hardcoded
  row array (`['default','none','xs','sm','md','lg','xl','xxl']` for radii;
  `xs…xl` for shadows; `xxs…xl` for spacings), a `getVariableName` helper, a
  four-column `createColumnHelper` definition (`Size` in `<Code fw={600}>`,
  `Variable` in `<Code>`, `Value` via `<CSSVariableValue>` with
  `enableSorting: false` throughout, and an untitled `preview` column), driven by
  `useTable({initialState: {totalEntries}, enableRowSelection: false})` and
  `getRowId={({size}) => size}`. The preview column is the whole point: a 64×64
  `Box` with `borderRadius: var(--mantine-radius-{size})`, a 120×64 `Box` with
  `boxShadow: var(--mantine-shadow-{size})`, and a
  `width/height: var(--mantine-spacing-{size})` `Box` with `minWidth: 4`.
  These three pages are 2,529–2,900 bytes of *deliberate* repetition.
- **Typography** (8,033) is two of those tables — headings `h1`–`h6` and text
  sizes `xxs`–`xl`, each row carrying name / fontSize / lineHeight / fontWeight
  as **CSS variable names** — plus a live specimen column that renders
  `"Headings"` and `"Text Sizes"` at the resolved values, with
  `fontFamily: 'canada-type-gibson, sans-serif'` hard-coded. A secondary
  `<Header variant="secondary">` inside separates the two sub-tables.
- **Iconography** (8,225) is the most functional page in the section: two
  `Table` instances with `getFilteredRowModel()` and `getPaginationRowModel()`,
  a `Table.Header` holding a `Table.Filter` and a `Table.Predicate id="variant"`
  of `['16px','24px','32px','48px','56px','64px']`, `Table.Footer` with
  `Table.PerPage values={[10,25,100]}` and `Table.Pagination`, and a
  `Table.NoData` rendering a `BlankSlate` with a clear-filters
  `Button.Tertiary`. The Plasma-icons table's Code cell emits
  `` `<${variant} height={${size}} />` ``, interpolating from the *current
  predicate*, so the snippet and the rendered icon are always the same size. The
  Tabler table derives the component name by PascalCase-ing the icon name
  (`alert-circle` → `IconAlertCircle`) and emits `` `<${componentName} size={24} />` ``.
- **Variables** (5,902) is the token *browser*: `plasmaCSSVariablesResolver`
  from the live theme, then six `VariableBlock`s — `coveo-variables`,
  `light-coveo-variables`, `dark-coveo-variables`, `mantine-variables`,
  `light-mantine-variables`, `dark-mantine-variables` — each a
  `getVariables(resolved, prefix)` filter over the three namespaces
  (`--coveo-`, `--mantine-`, plus the `light` and `dark` overrides). Each block
  is a permalink `<Anchor href={'#'+id}>` with a hover-revealed
  `LinksSize16Px` and `id={id}` on a `div` with `scrollMarginTop: '100px'`.
  Values that are `color-mix(...)` or `var(--mantine-color…)` get a
  `ColorSwatch` via a `ColorPreview` component that regex-tests the value shape
  and returns `null` otherwise. `getTransformedScaledValue` rewrites
  `calc(x * y)` down to `x`. This story opts out of visual regression:
  `parameters: {chromatic: {disableSnapshot: true}}`.

**Every foundation page is a table with a live preview column, or a browser.**
There is not a paragraph of prose anywhere in `@foundation`; the single
sentence of description per page is a `description` prop on `FoundationWrapper`.

---

## 5. The `@content` section, page by page

### Direct answer

**`@content` is documentation of the organisation's writing practice and product
vocabulary. It is not documentation of the design system.** Only one of the six
pages (`Glossary`) is about the design system, and even that page is about
*the vocabulary of design-system documentation*, not about any component or
token. Nothing in `@content` describes a component, a prop, a token, a layout
rule, or an accessibility requirement.

The clearest single proof is the group label in the agent register: `llms.txt`
calls it **`## Content Guidelines`**, and `skill.md` calls it
`## Content Guidelines` and scopes it as "content guidelines for writing UX
copy in Coveo products… Always follow these when writing user-facing text such
as labels, errors, tooltips, and descriptions."

### Page inventory

| Sidebar label | MDX path | Bytes | H1 | `id` | llms counterpart |
| --- | --- | ---: | --- | --- | --- |
| About Content | `content/AboutContent.mdx` | 1,628 | `# About Content` | `content-about` | **none** |
| Audience | `content/TargetAudience.mdx` | 6,070 | `# Target Audience` | `content-target-audience` | `content/TargetAudience.md` 1,750 |
| Voice | `content/Voice.mdx` | 8,022 | `# Voice` | `content-voice` | `content/Voice.md` 3,884 |
| Writing mechanics | `content/WritingMechanics.mdx` | 23,066 | `# Writing Mechanics` | `content-writing-mechanics` | `content/WritingMechanics.md` 9,727 |
| Product vocabulary | `content/ProductVocabulary.mdx` | 8,932 | `# Product Names & Vocabulary` | `content-product-vocabulary` | `content/ProductVocabulary.md` 7,875 |
| Glossary | `content/Glossary.mdx` | 5,598 | `# Glossary` | `guidance-glossary` | `content/Glossary.md` 4,264 |

**No MDX file in `src/content/` has YAML frontmatter.** The frontmatter lives
only in the `packages/llms/src/content/*.md` files. The human pages get their
title from `<Meta title="@content/…" id="…" />`. `Glossary.mdx` even carries an
explicit pointer comment: `{/* For the agent-friendly version of this
documentation, see packages/llms/src/content/Glossary.md */}`.

Section skeletons, in full:

- **About Content** — `## Who is this for?`, `## Glossary`. 1,628 bytes, the
  shortest, and the only page with no `llms` twin. It defines the scope of the
  whole section: `"Content" is the information in the UX working alongside the
  visual design. It includes any text, images or videos in the Coveo
  Administration Console interface…`
- **Audience** — `## User personas` (and only that H2; personas are `###`-free,
  rendered as `Avatar`/`Card`/`Blockquote` JSX). 6,070 bytes, 57% of which is
  JSX.
- **Voice** — `## Understanding _voice_ and _tone_`, `## What is Coveo's
  voice?` → `### Clear` / `### Human` / `### Helpful`, `## Choosing the right
  tone`. 8,022 bytes.
- **Writing mechanics** — `## Vocabulary` (`### Coveo-specific terms`, `###
  Acronyms & initialisms`, `### Third-party terms`), `## Capitalization` (`###
  Sentence case`, `### Title case`, `### When to capitalize`, `### Referring to
  UI elements in copy`), `## Punctuation` (`### Periods`, `### Colons`, `###
  Exclamation marks`, `### Apostrophes`, `### Spacing`, `### Ellipses`), `##
  Grammar` (`### Voice`, `### Tense`, `### Person`, `### Contractions`, `###
  Sentence length`), `## Syntax & structure` (`### Instructions`, `### Plain
  language`, `### Reducing jargon`). 23,066 bytes — **the largest file in
  `src/`** — and the only page using `---` horizontal rules as top-level
  section separators.
- **Product vocabulary** — `## Sentence case`, `## Title case` (`### Pages and
  navigation`, `### Sources`, `### Tools and libraries`, `### Coveo products and
  models`, `### Third-party products`), `## Terms to avoid`. 8,932 bytes.
- **Glossary** — `# Glossary` then one H2 per letter: `## A`, `## C`, `## D`,
  `## E`, `## F`, `## I`, `## L`, `## M`, `## P`, `## S`, `## T`, `## U`,
  `## V`. 5,598 bytes. **A–Z letter headings, no J/K/O/Q/R/W/X/Y/Z entries.**

Sidebar labels are sentence case (`Audience`, `Writing mechanics`, `Product
vocabulary`) while the H1s are title case (`Target Audience`, `Writing
Mechanics`, `Product Names & Vocabulary`). The `id` `guidance-glossary` is a
leftover from a `guidance` group that no longer exists in the title.

### Quoting `Voice.md` (3,884 bytes) — agent register

```markdown
---
name: Voice
description: Coveo's required voice qualities (clear, human, helpful) and how to apply tone by context.
---

## Voice of Coveo

Voice is fixed. It never changes across the product.
Every piece of UX copy must be **clear**, **human**, and **helpful**.
All three, always.

### Clear

Write like a knowledgeable colleague explaining something, not a technical manual.

**Required:**

- Use plain words
- Be as short as possible
- Say exactly what to do or where to go
```

and the tone matrix, which is pure product-copy guidance with no design-system
content whatsoever:

```markdown
**Errors · failures · empty states · complex features**
User's state: Frustrated, confused
Tone: Matter-of-fact and respectful — direct, no softening
Example: "No query pipelines found. Try changing or clearing your filters."

**Completed setups · upgrades**
User's state: Pleased, encouraged
Tone: Slightly enthusiastic — one exclamation mark maximum
Example: "Success! Your query pipeline "pipeline-123" has been saved."
```

closing with:

```markdown
> **Note:** These voice qualities are principles — apply judgment when applying
> them. For concrete mechanical rules (capitalization, punctuation, word limits),
> follow WritingMechanics.md exactly.
```

"query pipelines", "sources rebuilding", "your search box" — Coveo product
features. Not tokens.

### Quoting `ProductVocabulary.md` (7,875 bytes) — agent register

```markdown
RULE: Always use the spelling and capitalization shown here. Do not rely on other
Coveo sources or documentation — vocabulary is not standardized across them.
```

```markdown
## Sentence case

RULE: Write these terms in sentence case (lowercase) in all descriptions and body text.

- analytics — use when referring to data or events (e.g., "the analytics data").
  Formerly "usage analytics". To distinguish from a third-party product, use
  "Coveo Analytics" instead.
- query pipeline
- ranking expression rule
```

```markdown
### Sources
Sources available in the Administration Console.
- Amazon S3
- Confluence Cloud
- Khoros Community
- Salesforce
- Shopify
```

```markdown
## Terms to avoid

RULE: Never use the terms in the left column. Use the replacement in the right column instead.

| Avoid                                                                                   | Use instead            |
| --------------------------------------------------------------------------------------- | ---------------------- |
| Auth                                                                                    | Authentication         |
| Admin console / Admin. Console / Admin UI / Admin portal / Coveo Administration Console | Administration Console |
| HIP                                                                                     | Hosted Insight Panel   |
| Pop up / Popup / Pop-up                                                                 | Modal                  |
```

That last table is the tell: the deliverable of this section is a **banned-terms
list for UI strings**. The word "Modal" appears because a *button label* is
wrong, not because the design system defines a Modal.

Note the `RULE:` prefix convention: a machine-greppable, uppercase-instruction
inline directive rather than a heading, used ~6 times in this file. And note
this file **does** use Markdown pipe tables, because it is not MDX and not
Storybook-rendered — the agent layer has no `remark-gfm` constraint.

### The one design-system page in the section

`Glossary.md` (4,264 bytes) is the crossover, and its own `description` says so:
"Definitions for terms used in the Plasma design system. Use these definitions
when interpreting or generating design-system-related content." It defines
`Component`, `Core component`, `Design system`, `Design token`, `Foundation`,
`Interaction pattern`, `Experience pattern`, `Library origin`, `Anti-pattern`,
`Content guidelines`, `Contextual mapping`, `Long-form copy`, `UX copy`,
`Visual foundations`. Quoting two:

```markdown
- Core component — A general-purpose, product-agnostic building block (e.g., Button, Input, Dropdown, Checkbox, Modal, Tabs). If it assumes Coveo data or a Coveo-specific concept, it is NOT a core component.
- Foundation — A fundamental rule, value, or asset on which components and patterns are built (color, typography, spacing, radius, elevation, motion, breakpoints, accessibility expectations)
```

So `@content/Glossary` is the boundary case, and the map should treat it as
belonging to whichever side it is placed on. Everything else in the group is
organisational.

### The one structural asymmetry

`@content` has **6 human pages and 5 agent files**. `About Content` is
human-only; there is no `AboutContent.md` in `packages/llms/src/content/`. It
is the section's own scope-defining page, and an agent has no use for it.

---

## 6. The `@overview` section

Two pages, both unattached prose, both using inline `<Meta title id>`, both
importing Plasma components for structure.

### `overview/GettingStarted.mdx` — 3,248 bytes

File name is `GettingStarted.mdx`; sidebar title is `@overview/Getting Started`;
`id` is `getting-started`; **H1 is `# Plasma`, not `# Getting Started`.** The
H1 is the product; the sidebar label is the task.

Section headings in full:

```
# Plasma
## Getting Started
### Installation
### Setup
### Usage
## Next Steps
```

Coverage, in order: what Plasma is in two sentences ("Plasma is Coveo's design
system for the Administration Console. It provides Mantine-based React
components, design tokens, icons, and content guidelines for Coveo products.");
required install command; a sentence deferring optional Mantine packages; a
**five-row, two-column JSX `<Table>` (`Package` / `Use it for`)** linking each
of `@coveord/plasma-mantine`, `plasma-tokens`, `plasma-react-icons`,
`plasma-llms`, `plasma-mcp-server` to its GitHub `tree/master/packages/…` path
with a one-line purpose; `Plasmantine` setup with the two `tsx` blocks
(provider, then "Import the styles for any optional Mantine package you use");
a minimal `Button.Primary` render; and `## Next Steps` containing a single
`<Anchor href="./?path=/docs/using-llms--docs">Using Plasma with LLMs</Anchor>`.
That href is a Storybook-internal `?path=/docs/…` URL — **an
implementation detail with no fumadocs equivalent**; the equivalent would be a
frontmatter link or a next-page link.

### `overview/UsingLLMs.mdx` — 6,393 bytes

Section headings in full:

```
# Using LLMs
## Set up your AI tool
```

**One H2. No subsections at all.** The entire body is a single
`<Accordion variant="filled">` with six `Accordion.Item`s, one per agent
tooling, and the prose lives inside `<Accordion.Panel>` bodies:

| `value` | `Accordion.Control` |
| --- | --- |
| `claude-code` | Claude Code |
| `codex-cli` | Codex CLI |
| `github-copilot-cli` | GitHub Copilot CLI |
| `github-copilot-vscode` | GitHub Copilot in VS Code |
| `kiro` | Kiro |
| `opencode` | Opencode |

Each panel is a two-step recipe, and **the skill-file destination path differs
per tool** — this is the page's actual payload:

- Claude Code → `.claude/skills/plasma/SKILL.md`; `.mcp.json` with
  `mcpServers` → `npx -y @coveord/plasma-mcp-server` + `@mantine/mcp-server`;
  "Run `/mcp` in Claude Code to verify both servers are connected."
- Codex CLI → `.agents/skills/plasma/SKILL.md`; `~/.codex/config.toml` with
  `[mcp_servers.plasma] command = "npx"`; project-scoped by
  `CODEX_HOME=.codex`.
- Copilot CLI → "Load it in the terminal: `/skill
  https://plasma.coveo.com/plasma-skill.md`" (a **remote** load, no file
  written) + `copilot mcp add plasma -- npx -y @coveord/plasma-mcp-server`.
- Copilot in VS Code → `.github/skills/plasma/SKILL.md`; `.vscode/mcp.json` with
  a `servers` map and `"type": "stdio"`; verify via "**MCP: List Servers** in
  the Command Palette".
- Kiro → `.kiro/steering/plasma.md`, paste the skill and **replace its
  frontmatter** with `inclusion: always`; `.kiro/settings/mcp.json`; "Restart
  Kiro after saving the file."
- Opencode → `.opencode/skills/plasma/SKILL.md`; `opencode.json` with a `$schema:
  https://opencode.ai/config.json` and an `mcp` map of `{"type": "local",
  "command": ["npx","-y","@coveord/plasma-mcp-server"], "enabled": true}`.

Preceded by one sentence framing the two mechanisms: "The **Plasma skill**
gives your agent persistent setup, import, and documentation lookup
conventions. The **Plasma and Mantine MCP servers** give your agent access to the
entire design system documentation efficiently."

So `@overview` = **install the library** (`GettingStarted`) + **install the
agent surface** (`UsingLLMs`), 9,641 bytes combined, ~1% of the site's content.

---

## 7. The agent-facing spec format

### Build pipeline: `packages/llms/src/build.ts` (4,198 bytes)

```
src/components/*.md  ─┐
src/content/*.md    ─┼─→ readDocs()  → writeDocs() → dist/llms/<dir>/<slug>.md
src/foundations/*.md ─┘                    +           dist/llms/<dir>/index.json
src/llms-txt.md      + generateLlmsTxt()    →         dist/llms.txt
src/llms-full-txt.md + generateLlmsFullTxt() →        dist/llms-full.txt
src/skill.md         (read verbatim)        →         dist/plasma-skill.md
```

Mechanics, exactly:

```ts
const BASE_URL = process.env.PLASMA_BASE_URL ?? 'https://plasma.coveo.com';
const UTF8_BOM = '\uFEFF';
const bomPrefix = (filePath: string): string =>
    (filePath.endsWith('.md') || filePath.endsWith('.txt') ? UTF8_BOM : '');

const write = (filePath: string, content: string) => {
    const interpolated = content.replaceAll('{{BASE_URL}}', BASE_URL);
    fs.writeFileSync(filePath, bomPrefix(filePath) + interpolated, 'utf-8');
    …
};
```

`readDocs` filters `.md`, **sorts the directory listing alphabetically**,
derives `slug = path.basename(file, '.md')`, and parses with `gray-matter`:

```ts
return {
    slug,
    name: (data.name as string) ?? slug,
    description: (data.description as string) ?? '',
    content,           // frontmatter stripped
};
```

`writeDocs` writes one `<slug>.md` per entry (frontmatter already stripped, so
`served/Button.md` begins `\n# Usage guidance`) and one manifest.

### `{{BASE_URL}}` placeholder mechanism

Literal string `{{BASE_URL}}`, replaced by `String.prototype.replaceAll` in the
single `write()` chokepoint. Every text output therefore passes through it. It
appears in exactly three authored places:

1. `src/llms-txt.md` — the `llms-full.txt` self-link:
   `- [{{BASE_URL}}/llms-full.txt]({{BASE_URL}}/llms-full.txt)`
2. `src/skill.md` — the five fallback URLs in `## Fallback When MCP Is
   Unavailable`
3. Every `src/components/*.md` — the footer
   `[Full Plasma documentation]({{BASE_URL}})`

`plasma-component-docs/SKILL.md` states the rule: "Use the literal placeholder
`{{BASE_URL}}` — it is substituted at build time." `packages/llms/README.md`
adds that `PLASMA_BASE_URL` overrides the default, e.g.
`PLASMA_BASE_URL=http://localhost:6006 pnpm build`.

Because `write()` is the only writer, the build is **location-agnostic**: the
same `src/` produces the Storybook-hosted URLs and a local-preview set. Note the
`llms-txt.ts` generator does *not* use the placeholder for its own links — it
receives `baseUrl` as a parameter and interpolates `{baseUrl}/llms/components/…`
directly. The placeholder is for the two *template* files only.

### BOM prefixing

Every `.md` and `.txt` output is written with a leading **UTF-8 BOM**
(`\uFEFF`); `index.json` is not (the predicate is the extension). Reason not
stated anywhere in the repo — **inference:** so that a browser or a naive
UTF-8 reader serving these as `text/plain` / `text/markdown` cannot mistake a
leading `#` for nothing, and so that editors reliably detect UTF-8. The live
`https://plasma.coveo.com/plasma-skill.md` returns
`Content-Type: text/markdown`. **Flagged: the rationale is not documented.**

### `index.json` manifest

`writeDocs` emits, per directory, a JSON array of `{slug, name, description}` in
the same alphabetical order, with `JSON.stringify(index, null, 2)`. Three
manifests, live and confirmed:

- `https://plasma.coveo.com/llms/components/index.json` — **10,872 bytes, 62
  entries**
- `https://plasma.coveo.com/llms/content/index.json` — **973 bytes, 5 entries**
  (Glossary, ProductVocabulary, TargetAudience, Voice, WritingMechanics —
  note: **alphabetical by filename**, so `TargetAudience` is third, and the
  `name` is `Target Audience`)
- `https://plasma.coveo.com/llms/foundations/index.json` — **1 entry**
  (`Foundations`)

There is **no root `llms/index.json`** (404). The manifest has exactly three
keys per entry and is the input shape for the MCP server's `DocData`
(`packages/mcp-server/src/tools/types.ts`, 462 bytes).

### The RFC 2119 voice convention

From `.github/skills/plasma-component-docs/references/format.md` (5,295 bytes),
"RFC 2119 Keywords":

> Component specs MUST use RFC 2119 keywords (always uppercased) to express
> requirement levels unambiguously:
>
> | Keyword | Use when |
> | **MUST** / **REQUIRED** | No alternative is acceptable |
> | **MUST NOT** | Absolutely forbidden |
> | **SHOULD** / **RECOMMENDED** | Strongly preferred; deviation requires a reason |
> | **SHOULD NOT** | Strongly discouraged; valid reasons may exist |
> | **MAY** / **OPTIONAL** | Genuinely discretionary |

Plus a **critical rule** and a worked four-example block:

> **Critical rule:** only use these keywords when the subject is **the developer
> using the component**. Never use them to describe what the component or
> library does internally.
>
> - ✓ "MAY be provided to explain why the item is disabled." (user's choice)
> - ✓ "Async handlers MAY be provided; the button shows a loading state while
>   the promise resolves." (user's choice + plain fact)
> - ✗ "The button MUST show a loading state…" → write: "shows a loading state…"
> - ✗ "The card MUST render this content as its label." → write: "Rendered as
>   the primary label."
>
> Avoid vague imperatives like "always", "never", "prefer", or "avoid" in
> user-facing rules — replace them with the appropriate RFC 2119 keyword.

The subject rule is visible in practice. `Button.md`'s `## Accessibility
expectations`:

```markdown
- Button text MUST describe the action that will happen.
- Disabled buttons SHOULD explain the missing requirement when the reason is not visible nearby.
- Destructive buttons SHOULD use wording that makes the consequence clear.
```

All three subjects are "you / the developer". Whereas the prop descriptions,
whose subject is the component, carry **no** keyword: "Handler executed on
click.", "The tooltip message displayed when the button is disabled.",
"Indicates whether the button underneath the tooltip is disabled."

`## Sub-components` is the one place the two mix, and the skill sanctions it:
"Plasma provides pre-configured sub-components as convenience wrappers. You
SHOULD use these over setting props manually." The subject is still you.

### Required H1/H2 structure of a component spec

Enumerated empirically from all **62** files in `packages/llms/src/components/`,
cross-checked against `format.md`.

**Frontmatter — exactly two keys, both required, no third field exists
anywhere:** `name` and `description`. Verified on all 62.

```markdown
---
name: ComponentName                ← REQUIRED, = sidebar/display name
description: One-sentence …        ← REQUIRED, used in llms.txt index
---
```

**H1s.** 57 of 62 use exactly two H1s, in this order:

```
# Usage guidance
# API reference
```

The five deviations, all explained:

| File | H1s | Why |
| --- | --- | --- |
| `DateRangePicker.md` | `# Usage guidance` only | `## Deprecation` is placed *before* it, and `## Props` follows directly; the `# API reference` H1 was dropped |
| `BlankSlate.md` | none | `## Deprecation`, `## Props`, `## Usage` only (deprecated, minimal) |
| `PrerequisitesList.md` | none | `## Props`, `## Sub-components`, `## TypeScript namespace aliases`, `## Usage` |
| `Navigation.md` | none | `## Props`, `## Sub-components`, `## Hooks`, `## CSS Variables`, `## TypeScript namespace aliases`, `## Usage` |
| `ComponentsOverview.md` | `# Components` | the catalogue page; H2s are the seven component categories |

`format.md` documents the canonical shape as starting at `## Props` and does not
mention the `# Usage guidance` / `# API reference` pair at all — **the two-H1
convention is de facto, not specified.** Flagged.

**H2s — observed frequency across 62 files (out of 62):**

| H2 | Files | Layer | Required? |
| --- | ---: | --- | --- |
| `## Props` | 61 | API | **yes** (`ComponentsOverview` is the only one without) |
| `## Usage` | 61 | API | **yes** (same exception) |
| `## What problem does it solve?` | 58 | guidance | de facto yes |
| `## When to use it` | 57 | guidance | de facto yes |
| `## When not to use it` | 57 | guidance | de facto yes |
| `## Decision-making guidance` | 57 | guidance | de facto yes |
| `## Common anti-patterns` | 54 | guidance | optional |
| `## Accessibility expectations` | 43 | guidance | optional |
| `## Content guidance` | 29 | guidance | optional |
| `## Interaction notes` | 26 | guidance | optional |
| `## States` | 25 | guidance | optional |
| `## Sub-components` | 25 | API | optional — "omit if none" |
| `## TypeScript namespace aliases` | 22 | API | optional |
| `## Variants` | 16 | guidance | optional |
| `## Deprecation` | 2 | guidance | only for deprecated components |
| `## <the 7 component categories>` | 1 each | catalogue | `ComponentsOverview` only |
| `## Hooks` | 1 | API | `Navigation` only |
| `## CSS Variables` | 1 | API | `Navigation` only |
| `## Semantic colours` | 1 | guidance | one component only |
| `## \`useTable\` row selection options` | 1 | API | `Table` only |

`format.md`'s prescribed order is: `## Props` → `## Sub-components` (omit if
none) → `## TypeScript namespace aliases` (optional, "after `Props` and
`Sub-components`, and before `Usage`") → `## Usage` → `---` → footer. The
`TypeScript namespace aliases` section has a fixed two-sentence preamble:
"These type-only aliases are available for annotations and do not add runtime
static properties." and the rule "List a resolvable compound child's aliases
only through its qualifying parent namespace (for example, `Modal.Footer.Props`),
never as standalone child aliases."

`## Usage` rules, verbatim: "MUST appear after all other sections (Props,
Sub-components) and before the footer link. MUST show the most common real-world
usage as a self-contained `tsx` snippet. SHOULD use Plasma sub-components where
they exist. MAY include 2–3 examples for components with multiple important
patterns (e.g. async click, disabled state). **MUST NOT be exhaustive** — the
Props table covers the full API." (Note the doc calls `## Props` "the Props
table" even though it is a definition list — a leftover from an earlier format.)

`Button.md`'s `## Usage` closes with three trailing bullets after the code
fence — a convention the skill does not describe:

```markdown
- Use sub-components (`Button.Primary`, `Button.Secondary`, etc.) for semantic variants instead of passing `variant` manually.
- Async `onClick` handlers automatically show a loading state until the promise settles.
- Pair `disabled` with `disabledTooltip` to explain why an action is unavailable.
```

### The 80-char rule delimiter in `llms-full.txt`

`packages/llms/src/llms-full-txt.ts` (1,661 bytes), verbatim:

```ts
const BOUNDARY = `\n\n${'─'.repeat(80)}\n\n`;
```

**U+2500 BOX DRAWINGS LIGHT HORIZONTAL, repeated exactly 80 times, wrapped in
one blank line above and below.** Applied as
`components.map(formatEntry).join(BOUNDARY)`, and the same `BOUNDARY` between
content guidelines and foundations. Confirmed live: the first occurrence is at
character offset 10,679 of the 286,062-character `llms-full.txt`, between the
last `Glossary` bullet (`- Visual foundations — Foundational visual properties:
border radius, shadows, opacity, motion`) and `### Product Vocabulary`.

`formatEntry` does four transforms per document, in this order:

1. `.replace(/^# .+\n/m, '')` — "Remove the top-level heading (replaced by the
   `###` header above)"
2. `.replace(/\n---\n\n\[Full Plasma documentation\]\([^)]+\)\s*$/m, '')` —
   "Strip the trailing 'Full Plasma documentation' link found in component docs"
3. `.replace(/\n{3,}/g, '\n\n')` — "Collapse excessive blank lines into a single
   blank line"
4. `.replace(/^(#{1,6} )/gm, '##$1')` — "Shift all headings down two levels to
   nest under the `###` entry header"

Then `### ${entry.name}\n\n${entry.description}` is prepended. Result: `## Quick
Start` from the template, `### Foundations` / `### Button` per entry, `##
Foundations` from the source's `# Foundations`, `### Colors` from its `##
Colors`, `#### Usage` from its `## Usage`. The `[[`# Usage guidance`]]` and
`[[`# API reference`]]` H1s are shifted to `##` and therefore *merge visually*
with the entry's own `##` children in the concatenated file.

`llms-full-txt.md` (689 bytes) is the template: H1, one-paragraph positioning,
`## Quick Start` with a `bash` install block and a `tsx` `Plasmantine` block,
then `## Foundations` `{{FOUNDATION_DOCS}}`, `## Content Guidelines`
`{{CONTENT_DOCS}}`, `## Components` `{{COMPONENT_DOCS}}`.

### `llms.txt` and the `## Optional` escape hatch

`packages/llms/src/llms-txt.md` (1,083 bytes) + `llms-txt.ts` (1,301 bytes).
`generateLlmsTxt` builds one line per entry per group:

```ts
`- [${c.name}](${baseUrl}/llms/components/${c.slug}.md): ${c.description || `${c.name} component from @coveord/plasma-mantine`}`
```

Live `llms.txt` is 12,429 chars with four H2s — `## Foundations`,
`## Content Guidelines`, `## Components`, `## Optional` — and **71 bullets**
(62 components + 5 content guidelines + 1 foundation… which is 68; the
remaining 3 are the two Mantine links plus the `llms-full.txt` link in the
header). Every description is filled from frontmatter; the fallback strings
(`'${c.name} component from @coveord/plasma-mantine'`, `g.name`) exist but no
live entry uses them.

The `## Optional` section is a deliberate, quotable statement about scope:

> Plasma re-exports ~90 Mantine components unchanged. For components not listed
> above, refer to Mantine's documentation — but always import from
> `@coveord/plasma-mantine`, not from `@mantine/*` packages.
>
> - [Mantine component index](https://mantine.dev/llms.txt): index of all Mantine components
> - [Mantine full documentation](https://mantine.dev/llms-full.txt): complete Mantine component docs (props, usage)

The header block states the import invariant as two blockquotes ("Always import
from `@coveord/plasma-mantine`, not directly from a `@mantine/*` package." /
"Wrap your app with the `Plasmantine` provider…") and links `llms-full.txt`.
`packages/llms/README.md` says the design is "Inspired by Mantine's llms.txt
guide", and that `dist/` must not be edited by hand.

### Complete list of generated output files

From `build.ts`'s `main()`:

```
dist/llms/components/<slug>.md        × 62   (frontmatter stripped, {{BASE_URL}} resolved, BOM)
dist/llms/components/index.json       ×  1   ({slug,name,description} × 62, 2-space indent, no BOM)
dist/llms/content/<slug>.md           ×  5
dist/llms/content/index.json          ×  1   (× 5)
dist/llms/foundations/<slug>.md       ×  1   (Foundations.md)
dist/llms/foundations/index.json      ×  1   (× 1)
dist/llms.txt                                (template {{FOUNDATION_LIST}}/{{CONTENT_LIST}}/{{COMPONENT_LIST}})
dist/llms-full.txt                           (template {{FOUNDATION_DOCS}}/{{CONTENT_DOCS}}/{{COMPONENT_DOCS}})
dist/plasma-skill.md                          (verbatim copy of src/skill.md)
```

**72 files, 5 of them manifests/indexes.** Build-time log: "📄 Writing output
files…", per-file `  ✓  <relpath> (N KB)`, and the closing line "✅ Done!
Generated docs for 62 components, 5 content guidelines, and 1 foundations."

### What `plasma-skill.md` contains, section by section

`packages/llms/src/skill.md`, 4,125 bytes → served at
`https://plasma.coveo.com/plasma-skill.md`, **4,179 chars** live (BOM +
`{{BASE_URL}}` × 5 expansions). It has **YAML frontmatter** — the only generated
`.md` that keeps it, because it is a skill file, not a reference:

```yaml
---
name: plasma
description: Plasma design system setup, conventions, and component documentation
  for `@coveord/plasma-mantine`, Coveo's Mantine-based React component library.
  Use when building or modifying UI in a project that uses Plasma, looking up
  component props or usage patterns, setting up a new Plasma project, or any
  task involving `@coveord/plasma-mantine` components.
---
```

Then, in order:

1. **Unheaded intro** — "Plasma is Coveo's design system built on top of
   [Mantine](https://mantine.dev/). It provides React components, a custom theme,
   design tokens, and icons for Coveo Cloud products."
2. `## Install` — one `bash` block:
   `pnpm add @coveord/plasma-mantine @mantine/core @mantine/hooks @mantine/notifications react react-dom`
3. `## Setup` — `Plasmantine` provider `tsx` block plus the two `@mantine/*/styles.css` imports.
4. `## Key Conventions` — three bullets: always import from
   `@coveord/plasma-mantine`; prefer Plasma sub-components over raw props
   (`Button.Primary` not `<Button variant="filled">`); the theme is already
   applied so don't create a separate `MantineProvider`.
5. `## Finding Component Docs` — "MCP clients may prefix the tool names with the
   server name." **Step 1: Query Plasma first** — names four tools
   (`list_components`, `get_component_doc`, `get_component_props`,
   `search_docs`) and says Plasma "is authoritative for Plasma-specific
   behaviour, props, sub-components, and usage patterns". **Step 2: Fall back to
   Mantine** — `list_items`, `get_item_doc`, `get_item_props`, `search_docs`,
   with the caveat "Even when Mantine supplies the API reference, import the
   component from `@coveord/plasma-mantine`."
6. `## Content Guidelines` — `list_content_guidelines`,
   `get_content_guideline` (naming `Voice`, `Writing Mechanics`,
   `Product Vocabulary`, `Target Audience`), `search_docs`.
7. `## Foundations` — `get_foundations`, `search_docs`.
8. `## Fallback When MCP Is Unavailable` — a fenced block of the four
   `{{BASE_URL}}/…` URLs, then a sentence about `llms-full.txt` ("Use the full
   documentation only when a task genuinely requires bulk context"), then
   `https://mantine.dev/llms.txt`.
9. `## Import invariant` — restates the rule with a two-way `tsx` example using
   `// ✓ Always — even for components only documented by Mantine` and
   `// ✗ Never`.

`AGENTS.md` explains the audience split: this public skill "is intended for
agents using Plasma in consumer applications; **agents contributing to this
repository do not need to install it**." It also names the two internal skills
and the doc-change order: update the `llms` spec → rebuild → "Keep Storybook
docs in sync (use the `storybook-component-docs` skill)" → update JSDoc/README.

---

## 8. The two registers

### The two file families

| | human-facing | agent-facing |
| --- | --- | --- |
| path | `packages/storybook/src/components/**/*.mdx` | `packages/llms/src/components/*.md` |
| extension | `.mdx` (JSX) | `.md` (plain Markdown) |
| count | 58 component pages (+ 1 catalogue) | 62 component specs |
| binding | `<Meta of={Stories} />` + `<Canvas>` | YAML frontmatter + `##` skeleton |
| frontmatter | none | `name`, `description` |
| footer | none | `[Full Plasma documentation]({{BASE_URL}})` |
| examples | rendered live in a canvas | fenced `tsx` |
| props | Storybook Controls table (generated) | `## Props` definition list (hand-written) |
| voice | MUST/SHOULD/MAY **forbidden**; **no em dashes** | MUST/SHOULD/MAY **required**; em dash is the field separator |
| tables | **Markdown pipe tables banned** (`remark-gfm` not configured) | Markdown pipe tables fine |
| size per component | 1,144–1,846 bytes | 1,604–11,544 bytes |

**The size inversion is the headline finding.** The agent spec is **3× to 6×
larger** than the human page for the same component (`Button` 5,335 vs 1,712;
`Table` 11,544 vs 1,846; `Anchor` 3,534 vs 1,292). The human layer has
*converged* on a small fixed shape; the agent layer carries the full
inventory. That is the opposite of what "documentation for agents is a
short extract" would suggest, and it is the direct consequence of the division
of labour: Controls replaces the props table, and the story replaces the
examples.

### `.github/skills/storybook-component-docs/` — the human-layer enforcer

9,487 bytes. Frontmatter `name: storybook-component-docs`, and a description
that already encodes the separation: "Use when adding a component docs page,
rewriting an existing page for UX designers and developers… **Treat component
specs in packages/llms/src/components as read-only source material.**"

It delegates to four reference files: `page-structure.md` (5,646),
`mdx-patterns.md` (3,330), `arg-types.md` (5,252), `validation-checklist.md`
(2,928).

**Source priority list** (SKILL.md §3, verbatim, six ranks):

> 1. Explicit user requirements
> 2. Accurate content and custom examples in the existing MDX page
> 3. Story behavior and controls
> 4. The read-only component specification
> 5. Component implementation and tests
> 6. Repository writing guidance
>
> "Implementation and tests govern actual behavior. The component specification
> supplies intended usage guidance. Preserve existing MDX only when it remains
> accurate. **Report meaningful discrepancies instead of silently choosing one
> source.**"

Rank 4 of 6 is the whole point: the spec is authoritative for *guidance* and
subordinate to the *story* and the *implementation*. It is not a summary of the
spec, and it is not downstream of it in any mechanical sense.

**The prohibition on copying.** SKILL.md "This skill does not:" — four
relevant lines:

> - Edit, move, rename, or delete files under `packages/llms/src/components/`.
> - Copy complete API references, prop inventories, namespace aliases, or
>   generated examples into Storybook.
> - Create an intermediate converted page or intermediate commit.
> - Edit component implementation unless the user expands the task beyond
>   documentation.

"Create an intermediate converted page" bans the obvious shortcut (generate the
MDX from the `.md`) because it would collapse the two registers into one voice.
The checklist makes it a gate: "The agent-facing specification is unchanged" and
"Confirm this operation did not change `packages/llms/src/components/`."

`page-structure.md` reinforces it with a **mapping table** and a synthesis rule:

> | Specification content | Storybook destination |
> | `What problem does it solve?` | Description and Overview |
> | `When to use it` | When to use |
> | `Decision-making guidance` | Best practices |
> | `Common anti-patterns` | Best practices or When not to use |
> | Variants and visible states | **Usage** |
> | Props and sub-components | **Story controls or generated API information** |
> | Code examples | **Stories** |
> | TypeScript aliases | **Omit** |
>
> "Synthesize the read-only specification instead of copying it." … "Merge
> duplicated positive and negative rules." … "Prefer one direct recommendation
> over separate decision and anti-pattern bullets that say the same thing."

Note the destination column: three of the ten rows route *into Usage*, i.e.
they become a live demo rather than prose. The mapping is not prose → prose.

**Voice rules for the human layer** (SKILL.md §6, and mirrored in
`validation-checklist.md`):

> - Write in active voice, plain language, sentence case, and American English.
> - Address the reader as "you" when direct instruction is useful.
> - **Avoid agent-oriented directives such as `MUST`, `SHOULD`, and `MAY`.**
> - **Do not use em dashes.**
> - Apply `packages/llms/src/content/WritingMechanics.md` to UI-copy examples.
>   Treat its UX-copy length limits as guidance, not rigid limits for developer
>   documentation.
>
> Do not invent behavior, usage rules, or content guidance.
> Do not add external citations to the MDX page.

The checklist makes both bans verifiable: "No agent-oriented `MUST`, `SHOULD`, or
`MAY` directives remain." and "No em dashes appear in new prose."

And SKILL.md §6, first paragraph, is the compression rule: "The Guidelines
section normally contains: `When to use` / `When not to use` / `Best practices` /
`Content guidelines`, only when the component contains meaningful user-facing
copy. **Keep variants, states, accessibility inventories, props, and code
samples out when Usage already communicates them.**"

**The `remark-gfm` constraint** (SKILL.md §7, `mdx-patterns.md` "Tables", and
`validation-checklist.md`):

> Do not use Markdown pipe tables because this Storybook does not configure
> `remark-gfm`.
> "This Storybook does not configure `remark-gfm`, so Markdown pipe tables render
> incorrectly. Use a Plasma table component instead."

with the exact JSX escape hatch:

```mdx
import {MantineTable as Table} from '@coveord/plasma-mantine';

<Table withTableBorder withColumnBorders>
    <Table.Thead>
        <Table.Tr><Table.Th>Column A</Table.Th><Table.Th>Column B</Table.Th></Table.Tr>
    </Table.Thead>
    <Table.Tbody>
        <Table.Tr><Table.Td>Value</Table.Td><Table.Td>Value</Table.Td></Table.Tr>
    </Table.Tbody>
</Table>
```

Used in `GettingStarted.mdx` and `ComponentsOverview.mdx`. Note the aliasing
(`MantineTable as Table`) exists precisely so the JSX reads like Markdown table
source. **I verified this is a *syntax* constraint, not a rendering one:**
`.storybook/plasmaMarkdownOverrides.tsx` maps `table`/`thead`/`tbody`/`tr`/`th`/
`td` to Mantine table components, so HTML `<table>` markup renders styled — it
is GFM's *pipe-syntax parser* that is absent, so `| a | b |` never becomes a
`<table>` at all.

**The MDX-escaping rule** (`mdx-patterns.md` "JSX-sensitive prose"), because MDX
parses prose as JSX:

| Context | Action |
| --- | --- |
| Fenced code block | Leave unchanged |
| Inline code | Leave unchanged |
| Bare `<tag>` in prose | Write `&lt;tag&gt;` |
| Bare `</tag>` in prose | Write `&lt;/tag&gt;` |
| Bare `{` in prose | Write `&#123;` |
| Bare `}` in prose | Write `&#125;` |

Plus "Source-only syntax": the YAML frontmatter and the
`[Full Plasma documentation]({{BASE_URL}})` footer "Do not copy either into
Storybook MDX."

**Workflow gates** (SKILL.md §1, §8, `validation-checklist.md`): never edit on
`master`; record pre-existing tracked *and untracked* changes as user-owned;
format with `oxfmt`; `pnpm fmt:check`; `pnpm --filter @coveord/plasma-storybook
build`; lint if a story changed; verify each exposed argType in the generated
Controls table; `git diff --check`; and the closing instruction "**Use command
exit status to determine whether a build passed. Do not infer success from
generated file timestamps.**" Do not commit, push, or open a PR without an
explicit request.

### `.github/skills/plasma-component-docs/` — the agent-layer enforcer

2,683 bytes, plus `references/format.md` (5,295). Its `description` fires on
"write docs for [Component]", "update the LLM spec for [Component]", "add
[Component] to llms", "document [Component] for LLM consumption".

Its source list is only three rows — implementation, stories, existing spec —
with **no Markdown files**:

| Source | Path pattern |
| --- | --- |
| Component implementation | `packages/mantine/src/components/<Name>/<Name>.tsx` |
| Storybook stories | `packages/storybook/src/**/<Name>.stories.tsx` |
| Existing spec (if updating) | `packages/llms/src/components/<Name>.md` |

It extracts exactly three things: "Plasma-specific props — props defined in the
Plasma wrapper (not inherited from Mantine). Include prop name, type, required
flag, default, and JSDoc description."; "Sub-components — static properties
assigned to the component"; "Extends — if the component extends a Mantine base,
note it in the Props section header". Plus usage examples "From stories".

Its key rules: `description` must be one sentence; "Omit the Props table
entirely if no Plasma-specific props exist — use the `_No additional props_`
shorthand instead"; "End every file with `[Full Plasma documentation]({{BASE_URL}})`";
rebuild with `pnpm turbo run build --filter=@coveord/plasma-llms`.

**It is silent on the human layer.** No mention of
`packages/storybook/src/components/` as something to keep in sync, no "do not
edit the MDX". The write-protection is one-directional: the human skill may not
touch the agent specs, and the agent skill does not reach into Storybook. The
bidirectional half of the contract lives in `AGENTS.md` ("When you change a
component's public API: 1. Update the spec… 3. Keep Storybook docs in sync")
and in the human skill's Definition of done ("The agent-facing specification is
unchanged").

### The reasoning behind the separation, as far as it is stated

1. **The two layers have opposite compression pressure.** The human layer is
   capped at ~1.8 KB per component by the "keep it concise enough to scan"
   rule and by the fact that a demo shows more than a paragraph. The agent
   layer has no such cap and wants completeness. Sharing one file would force
   one of the two to lose.
2. **The voice must differ, and the difference is mechanical, not stylistic.**
   RFC 2119 keywords are meaningful to a model parsing a requirement and noise
   to a designer reading a page. Em dashes are the `## Props` field separator
   in one layer and banned in the other. A single file cannot satisfy both
   validators, so the validators *are* the separation.
3. **The extraction is regex-keyed.** `get_component_props` needs an H2 named
   exactly `## Props` containing a machine-parseable definition list, and needs
   the footer stripped and the frontmatter gone. None of that survives into a
   rendered MDX page, where the same information is already in the Controls
   table. So the duplication is not merely discouraged, it is *unusable*.
4. **Authority is split by question, not by section.** Implementation governs
   behaviour, the spec governs intended usage, the story governs what the demo
   shows. A single file forces one authority; the skill's source-priority list
   and its "Report meaningful discrepancies instead of silently choosing one
   source" make the conflict visible instead.
5. **The prohibition on mechanical conversion is the load-bearing clause.** Both
   skills could be satisfied by generating the MDX from the `.md`. Both forbid
   it: "Create an intermediate converted page or intermediate commit", "Use the
   specification frontmatter description as source material, **then edit it for
   human readers if needed**", "Synthesize the read-only specification instead
   of copying it", "Do not replace the whole file merely to enforce a
   template." **Inference:** the authors have seen generated pages and rejected
   them; a generated page reproduces the agent voice, the em dashes, the
   RFC 2119 keywords, and the prop inventory, all four of which the human
   checklist forbids.

**Weakness of the arrangement, worth naming:** the human layer's compliance is
judged by checklist, not by a build gate. `pnpm fmt:check`, the Storybook build
and oxlint are the only enforced commands, and none of them can detect a
`MUST` in prose, an em dash, or a copied prop inventory. And the empirical scan
shows drift: 30/58 pages carry Controls while 56/58 stories declare `argTypes`,
`Button.stories.tsx` and `Anchor.stories.tsx` disagree on whether to set
`component:`, 13 specs use the italic Form A and 13 others use the `> Extends:`
blockquote for the same "nothing to list" case, and the `@foundation`
`storySort` list is stale. So the separation is well *specified* and poorly
*enforced*.

---

## 9. What to copy and what to leave

### Worth adopting as documentation-structure convention

1. **The `@`-prefixed, two-level sidebar taxonomy.** Five groups, four
   `@`-prefixed, one not. The order is a *task* order, not an alphabet:
   overview → foundation → content → components → changelogs. Foundation before
   content before components is the dependency order a reader actually has.
   Adopt the taxonomy shape; the `@` prefix is cosmetic and is arguably a
   Storybook-ism (it exists because `storySort` matches on the raw title
   segment — under fumadocs the group is a directory, and the prefix would be
   redundant). Adopt:
   - **one page per foundation token family, and a hard split between token
     *pages* (Colors, Typography, Spacings, Radii, Shadows, Iconography) and
     token *inventory* (Variables).** Plasma needed both and gave them
     different shapes. A token browser is not a colour page.
2. **A `@content` / content-guidelines group that is explicitly about writing,
   not about components.** plasma's group is organisational (voice, mechanics,
   vocabulary, audience, glossary) and its agent-register label is
   "Content Guidelines", not "Design System". If Prism's design system owns a
   vocabulary (component names, token names, mode names), that vocabulary page
   is the one page in this group that belongs to the design system; the rest is
   product-UX writing and is arguably out of scope for a component library's
   site. **The `Glossary` boundary case is a decision this map has to make
   explicitly**, and the two-register split makes the cost of deciding visible.
3. **The per-component page skeleton, verbatim.** H1 = component name, one
   sentence, `Overview`, `Usage`, `Guidelines` → `When to use` / `When not to
   use` / `Best practices`, optional `Content guidelines`. It is empirically
   uniform across 58/58 pages, it is 1.1–1.8 KB, and the ceiling is the point:
   it forces variants and states into a live demo rather than a bullet list, and
   forces "when not to use" to name a named alternative. **Note the mapping in
   `page-structure.md` is renderer-agnostic** — it routes specification content
   to "Usage", which under fumadocs means "a rendered demo", exactly as it means
   a Canvas here.
4. **The H2-only table of contents.** `toc: {headingSelector: 'h2'}` gives
   three TOC entries per component page. The three-tier heading discipline
   (H1 page, H2 section, H3 sub-guideline) is what makes that possible and it
   transfers to any doc site.
5. **The two-register separation, with a one-directional write ban.** Adopt the
   separation, the source-priority list, the mapping table, and especially the
   prohibition on mechanical conversion. The two validators (MUST/MAY allowed
   vs forbidden; em dash allowed vs forbidden) are the mechanism that keeps the
   registers from drifting into each other, and they are the part most likely to
   be lost if the separation is adopted without them. Given that Prism already
   has an `llms` package and an MCP server to port, the agent register is a
   first-class deliverable, not a derived artifact.
6. **The agent spec's structural contract, independent of its prose.** Exactly
   two frontmatter keys. Exactly one `## Props` H2 whose body is either
   `_No additional props beyond the base component._` or an `> Extends:` note
   plus `**\`prop\`** \`Type\` · required|optional · default: \`X\` — Description`
   lines with no blank lines between them. `## Usage` last, before the footer.
   The footer carrying `{{BASE_URL}}`, substituted by a single `write()`
   chokepoint at build time. **The `·` (U+00B7) separator and the explicit
   `required`/`optional` on every entry are worth copying verbatim** — they are
   what makes the list parseable without a table.
7. **`llms.txt` as an index, `llms-full.txt` as the single-file fallback, and a
   per-component URL scheme**, plus the **80-character U+2500 rule** between
   concatenated documents and the **BOM on every text output**. The rule
   character is worth stealing precisely because it cannot occur in prose.
8. **The `## Optional` escape-hatch section in `llms.txt`.** plasma states
   plainly what it does *not* document and where to go instead, in three lines.
   That is the cheapest possible scope statement and it prevents an agent from
   concluding that an undocumented component does not exist.
9. **Foundation pages as live token readers, not prose.** The
   `FoundationWrapper` pattern (title + one-sentence description as component
   props, content as a rendered table) and the six-line
   `CSSVariableValue` component that reads
   `getComputedStyle(document.documentElement).getPropertyValue(name)`. Under
   fumadocs the equivalent is a client component that reads
   `getComputedStyle(document.documentElement)` at runtime; the point is that the
   **page reads the live cascade, so it is always true**, and each row pairs
   `Name` / `Variable` / resolved `Value` / live `Preview`. Every foundation page
   in plasma has a preview column. Adopt the row shape, not the
   `createColumnHelper` incantation.
10. **The `Args.ts` pattern of pairing an argType with its initial value in one
    object**, so a control and its demo value cannot drift. Renderer-agnostic.
11. **The `ts`x`-fenced examples in the agent spec being the same snippets the
    stories render**, so the two layers cannot disagree about usage.

### Storybook implementation detail with no fumadocs equivalent

1. **`<Meta of={…} />` / `<Meta title id>`.** The binding that makes a page
   inherit its sidebar title and slug from the story meta. Under fumadocs a
   page's route and title come from its file path and frontmatter; there is no
   story to bind to. **The `> Do not duplicate the story title on Meta` rule
   has no analogue and its loss is a real loss** — it was the mechanism
   preventing title duplication. Under fumadocs, frontmatter
   (`title`, `description`) becomes the single source, which serves the same
   purpose.
2. **`<Canvas of={…} />` and `<Controls of={…} />`.** Canvas renders a live
   story; Controls renders its argTypes panel. fumadocs has no built-in
   equivalent. The *substance* is portable — a rendered demo and a props table —
   but it must be built (a client component + a props table generated from
   extracted types, or a `react-docgen`/TypeScript-driven props page). The
   mapping row "Props and sub-components → Story controls or generated API
   information" is the portable half: **`table.type.summary` /
   `table.defaultValue.summary` / `description` is a good props-table schema
   regardless of renderer**, and the distinction it forces between the
   *component* default and the *demo* default is renderer-independent and worth
   keeping.
3. **`argTypes`.** The Storybook key. Its rules (control-to-value mapping,
   public-type-not-widget-type, component-default-not-args-default, synthetic
   args named as such) are all good practice and all portable; the container
   is not. `Args.ts`'s pairing trick is portable.
4. **`parameters.options.storySort.order`.** Sidebar ordering expressed as a
   JS array of title segments and `'*'`. fumadocs ordering is a file-tree or
   `meta.json` `order` field — strictly better, and it removes plasma's stale
   `@foundation` list. The *convention* worth keeping is that ordering is
   declared, explicit, and never alphabetical-by-accident.
5. **`.storybook/main.ts` / `preview.tsx` / `manager.ts`** (647 / 2,431 / 900
   bytes): the `../src/**/*.mdx` glob, the `globalTypes.primaryColor` toolbar,
   `useColorScheme` + `withTheme` decorators, the `MutationObserver` that
   rewrites "Storybook" out of `document.title`. All Storybook chrome. The
   *intent* behind a few is portable and worth keeping: a primary-colour
   switcher, a light/dark default from `prefers-color-scheme`, and a
   `changelogs` group that renders each package's `CHANGELOG.md` through the
   same component map as everything else.
6. **`plasmaMarkdownOverrides.tsx` (5,246 bytes).** The h1–h6 → Plasma `Title`
   with link anchors, `a` → `Anchor`, fenced code → `<Source>`, `table/*` →
   Mantine table, and the h3–h6 id-scoping trick. The *scoping* trick (prefix
   h3–h6 with the nearest h2's slug) is a genuinely reusable idea for any site
   that renders many changelogs, and the `stripPrLinkFromId` regex for
   slugified inline links is too. The rest is a Storybook
   `components`/`overrides` mechanism.
7. **`tags: ['dev','test','manifest','attached-mdx'|'unattached-mdx']`** and
   `tags: ['!dev']`. Storybook's test-runner tagging. The *distinction* the tags
   encode — attached to a story vs standalone prose — is real and worth keeping
   in our own metadata, because it is exactly the distinction that determines
   whether a page has a demo.
8. **`subtype: "story"`, `exportName`, `id: 'Button'` (uppercase) vs
   `id: 'colors'` (lowercase).** Storybook slug conventions. Under fumadocs the
   route comes from the path; nothing to carry over. Note the inconsistency
   itself is a small argument for path-derived routes.
9. **Chromatic.** `chromatic.config.json` (117 bytes) is only
   `{"externals": ["packages/mantine/src/**"]}`; the real Chromatic usage is the
   `faker.seed(42)` comment, the
   `parameters: {chromatic: {disableSnapshot: true}}` on the Variables story,
   and the AGENTS.md CI lane that "builds Storybook and deploys a Chromatic
   preview". **Inference:** visual regression is dev-tooling on the renderer, so
   it transfers to whatever visual-regression lane Prism adopts, not to fumadocs
   as such. `faker` seeding for deterministic snapshots is portable and
   cheap.
10. **MDX-in-Storybook syntax hazards** — `&lt;tag&gt;`, `&#123;`, `&#125;`,
    the JSX table escape hatch. All three exist only because Storybook compiles
    MDX with MDX's JSX-aware parser and no GFM. **fumadocs is MDX and does
    configure GFM** (it uses remark-gfm for the tables plasma has to hand-build
    in JSX). So under fumadocs: pipe tables work, the JSX-table rule is
    obsolete, and the `&lt;`/`&#123;` escaping rule is likely obsolete too. This
    is the single clearest case where a plasma constraint is a *renderer* defect
    rather than a documentation principle — worth naming so it is not copied.
11. **`docs.codePanel: true`** auto-attaching a source panel to every Canvas.
    A Storybook affordance. The portable idea is "the demo and its source are
    one unit", which fumadocs would need to build.
12. **`<Story of={…} />`** in the foundation MDX (as opposed to `<Canvas>`).
    Purely a Storybook block.

### One hybrid worth calling out

**The foundation page shape is renderer-independent and plasma got it right
without any Storybook dependency.** A 170-byte MDX file that contains nothing
but a title binding and one block, with all the content in a 2.5–8.2 KB
component and an optional CSS module, is a *separation of the page shell from
the page content* that any renderer can express — under fumadocs it is simply
an MDX page importing a client component. It is also why the foundation pages
carry no prose at all: the page's single sentence is a `description` prop, and
the rest is a table with a live preview column. **Adopt the shape; discard the
`<Story of={…} />` binding.**

---

## Could not find / explicitly flagged

- **Rationale for the UTF-8 BOM.** `build.ts` implements it; nothing in the
  repo, the two skills, `AGENTS.md`, or `packages/llms/README.md` explains
  why. Inference offered, marked as such.
- **The `# Usage guidance` / `# API reference` pair is de facto, not
  specified.** It appears in 57/62 files and is absent from
  `format.md`'s template, which starts at `## Props`. Reported from the corpus.
- **`## Props` is called "the Props table" in `format.md`** while being a
  definition list. Almost certainly a leftover from an earlier table format.
  This matters because it hints the format may have changed once already —
  which is a risk to note if the format is copied.
- **Two incompatible spellings of the "nothing to list" case** coexist in
  `packages/llms/src/components/`: the `> Extends:` blockquote (52 files, 13
  with zero entries) and the italic `_No additional props…_` shorthand (29
  files). `format.md` only documents the shorthand as Form A.
- **The `@foundation` `storySort` list is stale**: it names `'Overview'`, which
  does not exist under `@foundation`, and omits `'Variables'`.
- **No CI gate enforces the human layer's voice rules.** `pnpm fmt:check`, the
  Storybook build and oxlint cannot detect a `MUST`, an em dash, or a copied
  prop inventory. The separation is specified, not enforced.
- **`Controls` presence does not track `argTypes` presence** (30/58 pages vs
  56/58 stories). `feedback/Alert.stories.tsx` defines a complete `argTypes`
  block and `feedback/Alert.mdx` omits `<Controls>`. No rule predicts this.
- **`packages/llms/src/components/` has 62 files; `src/components/` in the
  Storybook package has 58 component pages + 1 catalogue.** The extras on the
  agent side are `BlankSlate`, `DateRangePicker` (both deprecated — they get a
  `## Deprecation` H2, 2 files total), `Input` (documented in the agent
  register as a base wrapper plus a `LabelInfo` sub-component, but has no
  Storybook page), and `ComponentsOverview` (which *does* have a page).
  `Input` is the one genuinely agent-only component spec.
- **`packages/llms/src/components/Input.md` is the only file with an
  `InputWrapper` sub-heading structure** (one H3) alongside `Menu.md` (one H3),
  `Navigation.md` (five H3s) and `Table.md` (one H3). Reported as observed.
- **No `remark-gfm` in the Storybook MDX pipeline is asserted, not
  independently verified.** I verified the *consequence* is consistent with the
  code: `plasmaMarkdownOverrides.tsx` maps HTML `table`/`thead`/`tbody`/`tr`/
  `th`/`td` to Mantine components (so HTML tables render), while no pipe-table
  syntax appears in any file under `packages/storybook/src/`, whereas pipe
  tables *do* appear freely in `packages/llms/src/**` (plain Markdown). That
  asymmetry is strong evidence but I did not inspect Storybook's own MDX
  pipeline configuration beyond `.storybook/main.ts` (which contains no
  `remarkPlugins`).
- **The `.github/skills/` directory is not indexed by any registry file** in
  the repo that I found; the only wiring is the prose in `AGENTS.md`
  ("## Internal skills"). A third skill, `changesets-author`
  (3,454 bytes + `references/template.md`, 1,816 bytes), exists and is out of
  scope for this ticket.
