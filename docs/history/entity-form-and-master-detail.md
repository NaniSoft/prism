# Entity form and master-detail: how established design systems express them

Author: a research subagent, commissioned as a read-only survey.
Retrieval date for every external URL in this document: **2026-10-07**.
Written against the Prism working tree at `C:\Users\dpven\source\repos\nanisoft\prism`.

This document resolves issue 155 (`NaniSoft/prism`): *How established design systems
express an entity form and a master-detail split, and what did each decide about
who owns the field set and who owns the selection.* It is prior art, not a
decision. Nothing here recommends what Prism should do; the decision map's job is
the decision.

**No vendor template was read.** No shadcnblocks page was fetched, and no
third-party mirror of a paid admin template was read. The non-derivation method
recorded in `docs/history/provenance.md` applies here exactly as it applies to
code: a rendered vendor page is a prior author's expression, so the rendered page
was not used. Other systems' own documentation was read, which is what this
repository already does and what `docs/history/taxonomy-survey.md` did when it
cited Carbon for data table, pagination, search, tag and modal concerns.

## Sources

| Source | URL | Retrieved | Used for |
| --- | --- | --- | --- |
| Carbon data table usage | <https://carbondesignsystem.com/components/data-table/usage/> | 2026-10-07 | Selection as a component variant rather than a state object; the check-all checkbox's indeterminate state; the batch action bar appearing on selection and disabling row actions; radio selection for single select; the toolbar as the home of global actions |
| Carbon form usage | <https://carbondesignsystem.com/components/form/usage/> | 2026-10-07 | Anatomy as header, body, footer; form as "purposefully simple out of the box, and users are responsible for configuring it"; required versus optional as a form-wide convention decided per product; labels, helper text, tooltip help and placeholder text as four distinct affordances; the three input families |
| Carbon forms pattern | <https://carbondesignsystem.com/patterns/forms-pattern/> | 2026-10-07 | Grouping under section titles; order as a documented convention; client-side validation on blur as advice the Form component does not implement; bound entry controls not needing field validation; dedicated page versus dialog versus side panel form variants, with an input-count threshold; multistep forms and progress indicators; two named documentation gaps (inline editing, rules) |
| Carbon empty states pattern | <https://carbondesignsystem.com/patterns/empty-states/> | 2026-10-07 | The three kinds of empty state (no data, user action, error management); empty states explicitly including side panels; the rule that an empty state replaces the element it would otherwise show |
| Carbon UI shell right panel usage | <https://carbondesignsystem.com/components/ui-shell-right-panel/usage/> | 2026-10-07 | Carbon's only documented detail pane; its "there is no selected state" rule; its dismissal rule; its silence on what a panel shows before anything has been invoked |
| Polaris migration: bulk actions | <https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/unstable-bulk-actions> | 2026-10-07 | Polaris removing its bulk-action toolbar from the library and assigning selected IDs, page calculations, cross-page scope, mutations and clearing to the app; the two-state selection scope (explicit IDs versus all matching the query, sent as a filter snapshot plus excluded IDs); post-action selection clearing rules; per-row and select-all accessibility labels; the refusal to key selection by row index |
| Polaris references index | <https://polaris.shopify.com/components/tables/index-table> | 2026-10-07 | Recording that the component URL is retired and now redirects to the Polaris references index, so this is the mechanism's current home |
| Ant Design Form | <https://ant.design/components/form> | 2026-10-07 | The `fields: FieldData[]` prop, documented and discouraged; `Form.Item` `rules` as validation inside the field declaration; `requiredMark` as a Form-level policy; `NamePath` identity; `labelCol` and `wrapperCol` as authored layout; `Form.List`; cross-field `dependencies`; three named FAQ gaps; the "onFieldsChange fires three times" documented defect |
| shadcn/ui forms index | <https://ui.shadcn.com/docs/components/form> | 2026-10-07 | The current forms page offering three form libraries and no form component of its own; `Field` as markup with "complete flexibility over the markup and styling" |
| shadcn/ui React Hook Form guide | <https://ui.shadcn.com/docs/forms/react-hook-form> | 2026-10-07 | The Zod schema as type, validator and field-name source simultaneously; the four grouping components; the per-field-type wiring each control needs; the five validation modes; error display through `data-invalid` and `aria-invalid` |
| shadcn/ui Data Table guide | <https://ui.shadcn.com/docs/components/data-table> | 2026-10-07 | shadcn/ui declining to ship a data table component; selection as `rowSelection` state passed in and out; the selected count as a plain div; `aria-label="Select row"`; the three underlying libraries the same component now documents against |
| GOV.UK Service Manual: structuring forms | <https://www.gov.uk/service-manual/design/form-structure> | 2026-10-07 | One thing per page; the question protocol; saving answers as one benefit of the page-per-question split; branching and loops |
| GOV.UK Design System: question pages | <https://design-system.service.gov.uk/patterns/question-pages/> | 2026-10-07 | A question page as a form posting to a handler with a back link and a continue button; "(optional)" on optional labels and never an asterisk; hint text constraints; the progress indicator guidance and the list of indicators to avoid; "Question 3 of 9" as a caption, not a navigation rail |
| W3C ARIA APG: grid pattern | <https://www.w3.org/WAI/ARIA/apg/patterns/grid/> | 2026-10-07 | `aria-multiselectable`-style selection semantics as `aria-selected` on cells and rows; the select-all, row-select and range-extend key set; what the pattern does not say about announcing selection |
| Prism vocabulary | `CONTEXT.md` in this repo | 2026-10-07 | Component, Block, Page, Item, Kind, Category definitions and the retired words this document avoids |
| Prism design record | `DESIGN.md` in this repo, including "Known Open Items" | 2026-10-07 | The five tiers, the Block that fetches nothing, Prism never importing a router |
| Admin screen survey | `docs/admin-screen-survey.md` in this repo | 2026-10-07 | The counts of in-scope record-index screens and multi-step screens this research was asked to serve |

**Not consulted, and why.** Material Design 3's guidance at
`https://m3.material.io/components/text-fields/guidelines` returns only "This
website requires JavaScript" to a plain fetch (retrieved 2026-10-07), so no
statement about Material Design 3 is made anywhere below. Radix Themes'
`/themes/docs/components/form` returns HTTP 404 (retrieved 2026-10-07) and no
form documentation was located there. Both are listed again in the final section.

## The two settled Prism decisions this sits downstream of

These are decided and are **not** what this research is for. They are stated here
so a reader does not mistake them for open questions, and so the findings below
are read as answering what remains.

1. **Prism accepts typed data as Block content, and owns its shape.** A Block may
   take a typed record, a field specification, or an event list as props. Prism
   owns the shape and the vocabulary; the consumer owns the values and the fetch;
   a Block fetches nothing.
2. **Prism owns the master and detail split, and owns no selection state.** The
   split is a composition Block rendering an index pane beside a detail pane,
   holding no selection at all. Selection, routing, and which record is open
   belong to the consumer, because Prism never imports a router.

Everything below narrows what those two decisions still have to specify.

## 1. The entity form across systems

Seven sources, five of them systems and two of them the bodies that write the
rules behind a system's own components.

| System | How a form or field set is declared | Is validation part of that declaration | How field types are expressed | How grouping and order are expressed | Is layout authored or derived |
| --- | --- | --- | --- | --- | --- |
| Carbon (IBM) | Composition only. A `Form` Component takes no field list; its own usage page says it is "purposefully simple out of the box, and users are responsible for configuring it" | No. Validation is advice, not API: the pattern recommends validating "as soon as the field loses focus" and separately notes that bound entry controls "only allow valid entries, so field validation isn't needed" | By choosing an input Component: free-form, selection, bound entry. The pattern names which control suits which context | Grouping is prose: "Group related tasks under section titles". Order is prose: "Follow a logical, predictable order, e.g first name first, last name second" | Authored. Vertical spacing, one or two columns, gutter mode and label alignment are all stated as design decisions, not derived |
| Polaris (Shopify) | Composition only, and the shape is delegated: Polaris fields are form-associated custom elements whose named values participate in `FormData`, so the library draws markup and the app's code submits | No. Error text lives on the field's `error` property, and server errors are mapped "by stable field name" with the warning "Don't rely on translated labels as error keys" | By choosing the field Component, plus `valuePropName`-style differences per control | Grouping is markup (`FieldSet` and legend in shadcn's version of the same pattern); order is JSX order | Authored. `FormLayout` exists purely to arrange fields and "stacks fields vertically but also supports horizontal groups of fields" |
| Ant Design | Two mechanisms, and the system documents and discourages the data one. `Form` accepts a `fields: FieldData[]` prop, described as "Control of form fields through state management (such as redux). Not recommended for non-strong demand" | Yes, and unavoidably. `Form.Item` carries `rules: Rule[]` with `required`, `type`, `min`, `max`, `len`, `pattern`, `enum`, `validator`, `transform`, `warningOnly`. Required styling is derived from the rules unless the item sets `required={false}` | By the Component placed inside `Form.Item`, with per-control binding flags such as `valuePropName="checked"` for Switch and Checkbox | Grouping: none. No group or section concept exists; the nearest is a `Form.Item` with `shouldUpdate`. Order: JSX order | Authored, in the most literal sense: `labelCol` and `wrapperCol` take grid spans such as `{span: 3, offset: 12}`, and the FAQ explains you should not set a label's grid props at all |
| shadcn/ui | No form component. The forms page offers React Hook Form, TanStack Form and Formisch, and says `Field` gives "complete flexibility over the markup and styling" | Yes, but as a side effect of the type. A Zod schema is at once the value type (`z.infer`), the validator, and the source of the field names, so a field cannot have a shape without having a rule | By choosing the control, and wiring it by hand per type: spread `field` for `Input`, `value` plus `onValueChange` for `Select`, `onCheckedChange` plus array operations for a `Checkbox` group | Grouping is markup: `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent`, and a `data-slot="checkbox-group"` attribute that the docs say must be set for spacing to be right | Partly authored, partly derived. `Field orientation` takes `horizontal`, `vertical` or `responsive` and derives alignment from it; column count is never stated |
| GOV.UK | Markup against a native `form` with an `action` and a `method`, plus a back link and a continue button. The page template, not a field list, is the deliverable | No. Validation is a separate pattern ("Recover from validation errors") and the question page's own HTML carries `novalidate` | By choosing the input Component. One question becomes three inputs where that is the right shape: the docs state that "Asking a question does not necessarily mean you should use one form field. For example, date of birth is best captured with 3 text fields" | Grouping is the page boundary, then a `fieldset` with a `legend`. Section name is a `caption` above the `h1`, explicitly not the heading | Authored, and to a stated measure: two-thirds width by default, with the caveat that full width may suit text-heavy answers |
| W3C ARIA APG | Not a form system. It specifies roles and states for interactive containers and delegates form semantics to the HTML form element | No. It requires that validation messages advise the user, via the forms tutorial it links, and says nothing about where rules live | Not applicable at this level; roles such as `textbox` and roles for grouping | Not applicable at this level | Not applicable at this level |
| TanStack Table (as shadcn/ui's mechanism) | Columns declared as data with `header`, `cell`, `accessor` and `display`; features opted into by a `tableFeatures()` object so unused behaviour is tree-shaken | No. Sorting, filtering and pagination are state and functions the caller passes in; the guide wires `onSortingChange`, `onColumnFiltersChange`, `onRowSelectionChange` | By the column's accessor kind and its `accessorFn`, and by the control the column definition renders | Columns are ordered by array order; there is no group concept | Authored by the caller; the table only supplies primitives |

### Synthesis: what a field specification type has to contain

Read across the row above and the consensus is not that field sets are declared
as data. Four of the five systems that have a form declare **no field list at
all**, and the fifth, Ant Design, ships a `fields` prop and then documents
against using it. What the systems do agree on is the set of facts a field must
carry, and those facts are consistent enough to name:

- **A key that is the value's own key, not a label.** Ant Design identifies a
  field by a `NamePath`, a path into the values object, so the field's identity is
  the place its value lives. Polaris makes the same point from the other side and
  warns against keys made of the words in a label. Everything downstream of a
  field specification depends on this: error mapping, grouping, and any
  cross-field rule.
- **A type that resolves to a Component and to a value shape at the same time.**
  Ant Design expresses it as a `Rule` `type` plus a `required` flag; shadcn/ui
  expresses it as a schema member; Carbon expresses it as a prose decision table
  ("captures several words maximum" for a text input). The first two are the same
  idea and the third is the same idea in the medium a design system can actually
  reach a developer in.
- **Requiredness as a per-field fact plus a form-wide policy.** This is the sharpest
  convergence in the survey, and it is a convergence on a two-part answer.
  Ant Design makes the mark a `Form` level prop, `requiredMark`, with the
  explicit statement that "You can not config to single Form.Item since this is a
  Form level config". Carbon decides it by counting: if the majority of fields are
  required, mark only the optional ones, and "the overall number of form fields
  for your entire product should inform your treatment". GOV.UK states the same
  inversion from the other direction: mark "(optional)", and "Never mark mandatory
  fields with asterisks". A field specification that carries `required` per field
  but does not also carry the form's marking policy has adopted half of what three
  systems consider one decision.
- **Help text split by what the reader must have versus what they might want.**
  Carbon names four affordances and gives each a rule: helper text "is always
  available, even when the field is focused, that's why it's the correct choice for
  need-to-know information"; tooltip text is for context and must never hold
  essential information; placeholder text "disappears once the user begins input
  data, it should not contain crucial information". GOV.UK adds a length rule
  ("Keep each hint to a single short sentence, without any full stops") and a
  refusal ("Do not use links in hint text"). One `help` string cannot express this;
  a specification needs at least the two tiers, and arguably the four.
- **Grouping as an ordered tree with a heading and an optional description.**
  Carbon: group headings with "a short and precise" text "and you can add a short
  description of the group if necessary". shadcn/ui: `FieldLegend` plus
  `FieldDescription` inside a `FieldSet`. GOV.UK: the page heading, with the
  section name demoted to a caption above it. All three treat a group's heading as
  a real document-level object rather than a bold row.
- **Order as data, with a rule about what order means.** Every system that has an
  opinion says the order is chosen and must be justified: Carbon's "logical,
  predictable order"; GOV.UK's whole structuring guide is about choosing an order
  and starting from the questions that reveal eligibility. A field specification
  that carries an array of fields has order, and every one of these systems says
  the order is a decision somebody has to make and defend, which is an argument
  for the array rather than an object.
- **Layout kept out of the field, and that is a real disagreement.** Carbon,
  Polaris and GOV.UK all separate layout from content, and Ant Design puts layout
  at the Form level via `labelCol` and `wrapperCol` with per-item override
  explicitly discouraged. shadcn/ui puts a per-field `orientation` on the field
  itself. Two shapes, and no source reconciles them.

### Where validation sits, stated as a disagreement rather than a consensus

The survey does not converge here and the disagreement is the finding.

**Against:** Carbon ships a `Form` Component that takes no rules and recommends
client-side validation in a prose pattern, with one sharp carve-out where
validation is designed away rather than implemented, because bound entry controls
"only allow valid entries". GOV.UK ships no validation API and points at a separate
pattern for recovering from errors. Polaris puts the error string on the field.

**For:** Ant Design's `Form.Item.rules` and shadcn/ui's Zod schema both put the
rule inside the field's own declaration, and shadcn/ui cannot avoid it because the
schema is the type. A Zod object with no `.optional()` is a required field; there
is no way to declare a field's shape without declaring its rule.

**The incompatibility:** shadcn/ui's arrangement makes the field specification
self-validating, and Ant Design's makes it self-describing. Carbon's and GOV.UK's
make the specification a rendering description and leave the rules outside,
because a rendering description is the part a design system can own and a rules
engine is a dependency. A system that takes a field specification as Block content
has to pick one of these, and the three systems that own validation also own a
state store, a store ant Design offers through its own `FormInstance` and shadcn/ui
offers through the caller's `useForm`.

## 2. The index plus detail pairing, and the empty detail pane

### How each system expresses the pairing

- **Carbon** documents two different things and neither is a persistent split. The
  data table's expandable variant reveals a row panel below the row, and its own
  guidance says that when the expanded content feels cramped, "consider taking the
  user to a dedicated page, side panel, or data table". The detail surface is a
  destination, not a pane. The only documented detail pane in the whole system is
  the UI shell right panel, which is a header-triggered overlay.
- **Polaris** has no master-detail pattern documented at all. Its index pattern is
  a single column, and its best practice for an index table row is that clicking it
  should "navigate to the resource's details page". Selection, filtering, sorting
  and pagination are one surface with a toolbar.
- **Ant Design** ships a `Splitter` as a layout Component and a `Drawer`, and
  documents no composite pairing.
- **GOV.UK** does not express it. Its closest thing is the page-per-question model,
  which is a sequential flow rather than a simultaneous two-pane view.
- **shadcn/ui** ships `Sidebar` for the master side and `Sheet` or `Drawer` for an
  overlay, and documents no pairing.
- **The ARIA APG** has no master-detail pattern. The nearest is the grid pattern,
  which is one composite with cell-level selection.

So the honest reading is that **none of the six systems surveyed owns a persistent
index-pane-beside-detail-pane composition as a named, documented pattern.** Each
one owns the index (Carbon, Polaris, shadcn/ui) or the transient detail overlay
(Carbon's right panel, shadcn/ui's Sheet, Ant Design's Drawer), and the pairing
itself is assembled by the consuming product. Prism's settled decision to own the
split is ahead of the prior art rather than behind it.

### The empty detail pane, which is where the prior art is thinnest

This is the sharpest thing the survey produced, and it is a finding about absence.

**Carbon's answer is to not have the pane.** The UI shell right panel is invoked by
an icon, floats over page content, and is dismissed by selecting an item or by
clicking the icon. There is no state in which the panel exists and is empty, because
the panel does not exist until it is asked for. Carbon also states a rule that
matters for a selection-free split: **"There is no selected state for right panel
items. Even if a user is currently within one of the panel items, the item
remains unselected."** That is a system deliberately refusing to represent the
thing Prism's split must not represent.

**Carbon's empty state vocabulary does not cover it either.** The empty states
pattern is thorough and it names three kinds: no data (first use), user action
(including "No results when searching" and completion confirmations), and error
management (permissions, systems, configuration, unsupported action). Empty states
"can occur anywhere your app can display data, including but not limited to
dashboards, data tables, tiles, full pages, and side panels". Three kinds, and
**not one of them is "there is data and the reader has not chosen yet."** Every
Carbon empty state is about the absence of data, the consequence of a user action,
or a failure. A detail pane with an index beside it and nothing chosen is none of
those, so Carbon's own taxonomy, applied honestly, produces no answer. It also
gives the rule that makes an empty pane a real problem rather than a cosmetic one:
"Empty states should replace the element that would ordinarily show", because
otherwise "a screen reader read the entire table before getting to the message".
The pane before a selection is the one empty state that is not about data at all,
and it is the one a screen reader user hits first.

**Polaris and shadcn/ui avoid the question by not having the pane**, for the same
structural reason as Carbon: selection navigates. Polaris's own best practice is
that an index row click should navigate to the details page, and a page has a
record in it or is not rendered.

**The ARIA APG has no pattern to fall back on.** Its grid pattern specifies
`aria-selected` on cells and rows and a full key set for selection, and nothing at
all about two panes, about which pane holds focus, or about what the second pane
announces when nothing is selected. There is no `aria` relationship in the
pattern set that says "this region shows the item selected over there", because
such a relationship does not exist in ARIA.

**What this means for the shape of the question rather than its answer.** Three
observations that the map can use and this survey can support, none of which is a
recommendation:

1. The empty detail pane is not a special case of an empty state. In every
   system's vocabulary it is a fourth kind: the pane is present, it is capable of
   showing content, and the reason it has none is that no selection exists yet.
   Carbon's three kinds are about why data is missing; this one is about whose
   choice has not been made.
2. Because the split holds no selection, a Block that renders it cannot know
   whether it is in this state, which means the empty pane cannot be a default
   the Block draws. It has to be something the consumer supplies, which makes it a
   required input to the split rather than an optional refinement of it. That is a
   consequence of the settled decision, and no system surveyed supplies a precedent
   for supplying it.
3. The two systems that get closest, Carbon and Polaris, both solve it by
   removing the pane from the resting state. A consumer who wants a persistent
   split has to solve the empty pane themselves in both, and neither leaves behind
   a documented pattern to copy.

## 3. Bulk selection and batch actions

All 35 in-scope record-index screens need this and none of it is decided yet, so
the survey's job is to name what a selection model has to express and where the
mechanism and the action are separated.

### What the selection model has to express

From the two systems that document selection in full:

- **A set of stable identities.** Polaris holds `selectedIds` as a `Set` of resource
  IDs and derives the row checkbox state from `selectedIds.has(id)`. shadcn/ui
  holds a `rowSelection` object and derives both the header checkbox and the row
  checkbox from it, with the selected count read from
  `getFilteredSelectedRowModel().rows.length`.
- **A count, and the noun it counts in.** Polaris requires a `resourceName` of
  `{singular, plural}` and a `selectedItemsCount` that is either a number or the
  string `'All'`. The noun is data, not a fragment in the Block's own copy. This
  is the same rule Prism's own `NewsletterValue` and `LogoCloudLogo` types follow.
- **A two-state page scope.** Polaris states the rule for the header checkbox
  exactly: `allOnPageSelected` is true when the page is not empty and every page
  ID is in the set; `someOnPageSelected` is true when at least one is and all is
  not. Both Carbon and shadcn/ui carry the same third state on the header
  checkbox: Carbon says the header "check all" checkbox "has three states, check,
  unchecked, and indeterminate" while row checkboxes have two.
- **A scope beyond the current page, or an honest refusal of one.** Polaris treats
  this as a distinct mode, not an extension of the set: "Store whether selection
  represents explicit IDs or all resources matching the current query. For
  query-wide selection, send the filter snapshot plus excluded IDs to the backend
  instead of loading thousands of IDs into the browser." The visible consequence is
  a second step in the toolbar, and a warning to put the total in the destructive
  confirmation: "Delete 2,430 products is safer than Delete selected products."
- **What happens to the selection when the action finishes.** Polaris is
  unusually explicit: "After success, clear selection, refresh the data, and show
  confirmation. After failure, preserve selection so that the user can retry."
  Earlier guidance adds the destructive case: "Keep selection if the mutation fails
  so that the merchant can retry; clear it only after success or an explicit
  cancel." Carbon gives the interaction counterpart and nothing about the state:
  while batch mode is active "single action icons and overflow menus on the row
  should be disabled", and batch mode ends by "select the cancel button on the far
  right of the bar or deselect all items".
- **When the selection is invalidated.** Polaris: clear query-wide selection "when
  search, filters, sort scope, or the underlying resource set changes enough to
  make the selection ambiguous", and clear or reconcile selection "including
  through browser Back or Forward navigation". Note that this is a statement about
  application state, reached by an app that owns its router.

### Separating mechanism from action

The separation is the same everywhere and it is total.

Carbon keeps selection inside the table Component and puts the action list in the
toolbar; the batch action bar "appears at the top of the table, presenting a set
of possible actions to apply to all select items", and the toolbar is "reserved for
global table actions such as table settings, complex filters, exporting, or
editing table data", capped at "up to five actions". Polaris went further than any
other system and removed the toolbar from the library altogether: "Polaris web
components don't provide a standalone bulk-actions toolbar... The app owns selected
resource IDs, page-selection calculations, cross-page scope, mutations, results,
and clearing selection." Its own migration guidance says to render the highest-value
action as one visible button and everything else in a menu.

So the shape Prism's decision implies matches both: the mechanism is what is
selected and how it is announced, the action is what happens, and the two meet at
exactly one place. Polaris names that place precisely: "When `selectedIds.size` is
greater than zero, replace the normal filter controls with a bulk-action area in the
table's `filters` slot." **The filter controls are displaced, not added to.** That is
a layout decision with a consequence, and it is the only one either system makes.

### Announcing selection to assistive technology

This is the weakest area in the survey and it is weak in a way that is worth
recording.

- The **ARIA APG grid pattern** specifies `aria-selected` on the selected cell or
  row and a key set (`Control + A` select all, `Shift + Space` select row,
  `Shift` plus arrows extend the selection). It says nothing about announcing a
  selection count, and it says nothing about announcing the result of a batch
  action.
- **Carbon** documents the batch action bar as a visual affordance and specifies
  the indeterminate state for the header checkbox, but does not specify any
  announcement of the count or of the batch mode entering and leaving.
- **shadcn/ui** puts the count in a plain `div` in the pagination footer
  ("0 of 5 row(s) selected.") with no live region, and labels every row checkbox
  `aria-label="Select row"`, which is identical for every row.
- **Polaris** is the only system that addresses naming and it addresses only the
  label: "Put a specific `accessibilityLabel` on the select-all checkbox and each
  row checkbox", and, for the count, "Render a visible count such as 3 selected in
  the bulk-action bar. Derive it from app state."

Two concrete disagreements sit inside that last list. Polaris says "Don't use row
indexes as IDs. Sorting, filtering, deletion, and pagination can change an index
while an action is pending", and shadcn/ui's documented selection is an unkeyed
`rowSelection` object over TanStack Table's default row identity, with no
`getRowId` anywhere in the guide. And Polaris requires each row checkbox to name
its resource; shadcn/ui's guide names every one of them `Select row`. Both are
live in the two most widely copied React design systems, on the same screen, at
the same moment.

Prism already ships a `LiveRegion` Component, which is noted here only because
that no surveyed system specifies how to use one for this. It is a fact about the
Prism catalogue, read from `docs/admin-screen-survey.md`, not a claim that any
system does this.

## 4. Multi-step forms

Sixteen in-scope screens need this, and Prism never imports a router, so the
question is who holds the step.

### Who holds step state

- **GOV.UK holds it in the URL, by making each step a page.** One thing per page,
  and each page is a real navigation with a back link, a continue button labelled
  "Continue", and a form posting to a handler. The step is the address. Its
  guidance on what this buys is explicit: it "helps you save a user's answers
  automatically as they go" and "handle branching questions and loops", because
  answers live server-side and the address names the step. The design system
  publishes the **page template and the one Component**, never the sequence. What
  the consumer owns is the order, the branching and the persistence.
- **Carbon documents a multistep form as a layout, not a mechanism.** "A multistep
  form spreads form fields across multiple screens and incorporates a progress
  indicator (vertical or horizontal)... There should be a logical relationship
  between the fields on each screen and a linear relationship between sections." It
  calls the approach good because it "allows for saving form progress along the
  journey and allows users to return to a previous step", but it names no API for
  any of that, and its progress indicator is a Component rather than a store.
- **Ant Design ships `Steps`** as a navigation Component, and the form store's
  `preserve` flag (default `true`, "Keep field value even when field removed") is
  the only thing in its API that touches step transitions. The step index is the
  caller's `useState`.
- **Polaris** documents no multi-step form pattern; its forms guidance is about
  the save bar and about spacing.
- **shadcn/ui** documents none either. No wizard, no stepper, in any of the three
  library guides.

### On navigation, refresh, and deep link

Only GOV.UK answers, and it answers by construction: the step is a URL, so refresh
and deep link are free and Back is meaningful. The one caution it gives is about
the browser Back button specifically: "Some users do not trust browser back
buttons when they're entering data", which is why the back link component exists
beside it, and "do not break the browser back button... The browser back button
should still work, but show users a sensible message rather than let them perform
the action again" for one-shot actions.

Carbon and Ant Design both assume something holds the step, and both are silent
about what happens to it across a refresh, because in each case it is the
application's problem. For Prism, which never imports a router, that silence is the
finding: three of the five systems make step state a consumer concern by
construction and publish nothing about it, and the one system that does publish
something publishes a URL, which is the one thing Prism cannot own.

### The progress indicator disagreement, which is sharper than it looks

GOV.UK's guidance on progress is unusually specific and it argues against the
shape Prism's `Stepper` and `ProcessRail01` Components have. It says to "Start by
testing your form without a progress indicator", "Try improving the order, type or
number of questions before adding a progress indicator", and "Only include the
total number of questions if you can do so reliably". Then it lists what a progress
indicator must **not** do: show all questions at once, allow navigation to previous
questions, and show the current question. Indicators of that kind "are often not
noticed, take up lots of space, do not scale well on small screens, can distract
and confuse some users, make it hard to write good labels for the steps, and make
it hard to handle conditional sections", and "A number of GOV.UK services have
removed this style of progress indicator without any negative effects."

Its own recommended form is the smallest possible one: a caption reading
"Question 3 of 9" above the `h1`. Carbon's is a Component with vertical and
horizontal forms, and says a multistep form "incorporates a progress indicator
(vertical or horizontal) to track a user's status step by step" and "allows users
to return to a previous step to review their submissions". Carbon's is the
navigable rail; GOV.UK's is a caption. Both are legitimate, and they are different
products.

## 5. What each system got wrong or left to the consumer

The section worth the most effort. Each item is a specific claim with its source,
and the pattern across them is the useful part.

### Carbon (IBM)

- **It documents that it has no answer, twice, in its own words.** The forms
  pattern says "Carbon does not have consolidated guidance around inline editing.
  Since it's something a lot of products approach in different ways, we'd like to
  offer more robust, centralized guidance in the future", and again "Carbon does
  not have consolidated guidance around rules within forms". A system that owns
  the field cannot even describe its own separators.
- **Requiredness is a cross-product policy with no mechanism.** "Consider the
  overall number of required and optional fields in the forms for your entire
  product. The pattern used should be consistent throughout your product, or at
  minimum consistent between all of the same type of form within your product." Then
  the example: "if you have 100 types of connections properties forms and the fields
  are optional in 85 of the 100 forms, all 100 should use the required pattern." A
  convention a system asks you to hold across a portfolio of products with no API
  holding it is a convention that will drift.
- **Batch mode is specified as interaction and not as state.** "When batch mode is
  active, single action icons and overflow menus on the row should be disabled", and
  the only exits named are a cancel button or deselecting everything. Nothing states
  what happens to a partially completed action when the selection changes underneath it.
- **Its empty state taxonomy has a hole where a split pane is.** Three kinds, and
  the pane-before-a-selection is none of them. See section 2.
- **A bound-entry carve-out that quietly moves validation.** "Bound entry controls
  ... only allow valid entries, so field validation isn't needed." The same form can
  therefore mix fields that validate and fields that cannot, with nothing in the
  declaration recording which is which.

### Polaris (Shopify)

- **It deleted its own answer to bulk actions and told everyone to build one.** "Polaris
  web components don't provide a standalone bulk-actions toolbar." Every consumer now
  writes a select-all checkbox, a per-row checkbox, a count, a promoted action and a
  menu. This is the correct architectural instinct and the worst possible ergonomic
  outcome, and both are documented on the same page.
- **Its component documentation is mid-migration and the old URLs are gone.** The
  `IndexTable` page at `https://polaris.shopify.com/components/tables/index-table`
  now redirects to the Polaris references index (retrieved 2026-10-07). A system
  whose per-component documentation is a redirect has moved its pattern guidance
  into migration notes, which is the right place for it and the worst place to look
  for it. Treat the migration guides as the current primary source and the retired
  component URLs as gone.
- **It leaves a half-modeled state in the reader's hands.** The selected count is
  described as something to "render" and to "derive from app state", and the
  accessibility label is something to "put" on a checkbox. Neither is specified as a
  live region or an announced message, so a selection change is silent to assistive
  technology in a system whose documentation is otherwise unusually precise about
  focus restoration and destructive confirmations.
- **It disallows a common responsive choice on accessibility grounds and gives no
  alternative.** Bulk actions are hidden on small screens with
  `condensed={useBreakpoints().smDown}`, and the reason given is that "Hiding bulk
  actions means a merchant can't select multiple items at once, so it should only be
  used when the bulk actions are not essential to the merchant's workflow." Hiding
  the control is treated as removing the capability, not as a layout change, and the
  page offers no way to keep selection available at a narrow width.

### Ant Design

- **It ships the field-set-as-data prop and tells you not to use it.** `fields:
  FieldData[]`, described as "Control of form fields through state management (such
  as redux). Not recommended for non-strong demand." This is the only system in the
  survey that lets a Block take a field list, and the only one that says it should
  not be done. For Prism's settled decision this is the single most relevant prior
  data point in the document, and it cuts against the decision rather than for it.
- **Validation leaks into the change event.** The FAQ for
  `onFieldsChange` firing three times says: "Validating is also part of the value
  updating... In each `onFieldsChange`, you will get false > true > false with
  `isFieldValidating`." A declared field set makes the store's own event channel
  noisy in a way the system documents and does not fix.
- **A declared field set cannot carry a label or an error.** "Form.List use
  renderProps which mean internal structure is flexible. Thus `label` and `error`
  can not have best place." Where the field set is data, the two most visible
  per-field affordances have no home in it.
- **Grouping does not exist.** There is no group, section or fieldset object in the
  form API. The nearest mechanisms are `shouldUpdate`, which re-renders a subtree,
  and nesting, which is not a group but a name path.
- **Its scroll-to-error depends on an attribute the system does not own.** "It is
  recommended to forward the ref to the form control elements first", and
  "`scrollToFirstError` and `scrollToField` depend on the `id` attribute passed to
  form controls." A custom control that drops its `id` silently loses the system's
  error focus management.
- **Setting a value programmatically is invisible to the change channel, on
  purpose.** "`setFieldsValue` do not trigger `onFieldsChange` or `onValuesChange`?
  It's by design."

### shadcn/ui

- **It declined to ship the two things Prism is being asked to build, in writing.**
  On the data table: "It doesn't make sense to combine all of these variations into
  a single component. If we do that, we'll lose the flexibility that headless UI
  provides. So instead of a data-table component, I thought it would be more helpful
  to provide a guide on how to build your own." On forms: the forms index offers
  three form libraries and no form component. The current documentation is a guide
  per problem rather than an answer per problem.
- **Its own data table guide uses an identity it elsewhere warns against.** Selection
  is an unkeyed `rowSelection` object, no `getRowId` appears anywhere, and Polaris,
  documenting the same problem, says "Don't use row indexes as IDs. Sorting,
  filtering, deletion, and pagination can change an index while an action is
  pending."
- **Every row checkbox is announced identically.** `aria-label="Select row"` in the
  documented implementation, against Polaris's "Give every row checkbox an
  accessibility label that includes the resource name."
- **The field set and the validator are the same object, which removes a choice
  rather than making one.** A Zod schema is the type, the rules and the field names
  at once. There is no version of that arrangement in which a field has a shape and
  no rule, and no version in which the rule can be swapped for another library
  without replacing the type.
- **The per-field-type wiring is a switch the consumer writes, per field, every
  time.** Spread `field` for text, `value` plus `onValueChange` for a select,
  `value` plus `onChange` for a radio group, `checked` plus `onCheckedChange` plus
  array filtering for a checkbox group, and `data-slot="checkbox-group"` for the
  spacing to come out right. That is the field-type-to-control mapping, expressed as
  prose in a guide rather than as an abstraction anywhere.
- **It documents the same component against three different libraries.** The Data
  Table page lists a Base UI variant, a React Aria variant and a Radix UI variant.
  Three answers to one component is a signal that the component's substance lives
  in the dependency.

### GOV.UK

- **Its answer is a routing decision, so it transfers to nothing.** One thing per
  page works because each step is a document with an address, answers persist
  server-side, and branching is ordinary server code. A system that cannot own a
  route can copy the page template and the field affordances and none of the flow.
- **It holds requiredness as a product-wide convention with no mechanism either.**
  "In most contexts, add '(optional)' to the labels of optional fields", for radios
  and checkboxes on the legend, and "Never mark mandatory fields with asterisks."
  Meanwhile it points at a question protocol to justify each question, which is a
  discipline with no artifact.
- **It is openly undecided about the pattern consumers need most.** The search
  index for the Design System backlog carries teams asking whether the
  check-your-answers page can navigate back to a step without re-walking the flow,
  and whether the long list needs a manage-then-return variant. Those are the
  exact questions a multi-step form raises, and they are open in the system that
  invented the pattern.
- **It has reversed itself on form structure at least once, in public.** The
  Service Manual's own research blog records "no more accordions" and a move away
  from treating one-question-per-page's costs as real ("Users rarely or never look
  at the progress indicators. The team working on Carer's Allowance removed the
  progress indicators from their form and it made no difference at all to the
  completion rates"), while Carbon's forms pattern still lists accordion forms as
  a technique. A system whose own recommendation on structure has moved this
  recently is weak prior art for Prism on structure specifically.

### W3C ARIA APG

- **The grid pattern specifies mechanics and no announcements.** `aria-selected`,
  a full key set, and nothing about telling a screen reader user that a selection
  changed, that a batch mode entered, or that a batch action completed.
- **It has no pattern for a two-pane surface at all**, and no ARIA relationship that
  expresses "this region shows the item selected over there". A system that owns the
  split cannot reach for a spec here.
- **Its data grid and layout grid sections share a key set and warn that wrapping
  "would be disorienting if it was used in a data grid"**, which means the same
  markup answers two different questions depending on what is in it. Selection
  behaviour keyed off "is this a data grid" is not something a composition Block can
  determine for a pane it did not classify.

### The pattern across all of them

- **Every system that owns selection owns the mechanism and none owns the action,
  and two of them have now removed the toolbar that used to connect them.** The
  meeting point is one slot that the filter controls vacate.
- **Every system that owns forms refuses to own the rules, except the two whose
  rules engine is the point** (Ant Design and shadcn/ui, where the validator is also
  the state store).
- **Every system that expresses a split expresses it as an overlay, and the
  persistent split is unowned across the whole survey.**
- **The three most-used React systems all leave selection announcement to the
  consumer, and all three do it differently enough to be mutually incompatible.**

## 6. Open questions this research did not settle

No recommendations. These are the questions this survey did not answer, and each
one names what would answer it.

1. **Material Design 3 is absent.** `https://m3.material.io/components/text-fields/guidelines`
   returned only "This website requires JavaScript" to a plain fetch (2026-10-07),
   so no Material Design 3 claim appears anywhere above. Its text field, checklist,
   list and adaptive-layout guidance on field grouping, on the supporting pane, and
   on announcing selection is unread, and any of it could contradict the table in
   section 1.
2. **Radix is absent.** `https://www.radix-ui.com/themes/docs/components/form` returned
   HTTP 404 (2026-10-07) and no form documentation was located. Radix Themes
   historically carried a `Form` with server-side validation, which would have been
   the most direct answer to the validation question of any system here.
3. **No system surveyed answers the empty detail pane.** The finding is an absence,
   and an absence in six documentation sets is weak evidence about what the answer
   should be. A platform that ships the split as shipped software, rather than as
   guidance, would settle it. Material Design 3's adaptive layouts may be that
   source.
4. **Announcement of a selection change is unowned.** What should be said, in what
   politeness, and whether it is said at all, is unspecified in all six. W3C's
   live-region practice pages were not fetched.
5. **Nothing was found on what happens to a half-finished batch action when the
   selection changes underneath it.** Polaris covers failure and success; no source
   covers the third case.
6. **Whether a field specification can carry a repeatable group.** Ant Design's
   `Form.List` is the only documented repeatable and its own FAQ says it cannot
   carry a label or an error. GOV.UK's date input (three inputs for one question)
   is the opposite approach, and the two are not reconciled anywhere.
7. **Cross-field validation has one implementation and no guidance.** Ant Design's
   `dependencies` is the only documented mechanism found, and it carries an explicit
   warning that it "shouldn't be used together with `shouldUpdate`, since it may
   result in conflicting update logic".
8. **The relationship between a field specification and a record's read-only view is
   unexamined.** Every source here is about writing. The `Summary01` and
   `SpecTable01` problems are a different shape and no source surveyed covers them.

---

**What a reader should do with this.** Treat it as prior art with an uneven
evidence base. Six systems are documented from primary sources fetched on
2026-10-07, two named systems were unreachable and are absent rather than
approximated, and the sharpest findings are absences and disagreements rather
than convergences. Where this document says a system does something, the URL in
the Sources table was fetched and read; where it says a system does not, that is
the reading of what was fetched, and a system that has not published the thing is
not the same as a system that has decided against it.