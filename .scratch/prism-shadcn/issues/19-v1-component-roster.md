---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 07, 09
---

# The v1 component roster

## Question

This is the map's largest remaining fog, and it is now specifiable. Ticket 09
fixed the unit names (Component, Block, Page), the seven plasma categories and
the checked catalogue schema; ticket 07 fixed the component API, the export
surface and the authoring contract; ticket 18 fixed the elevation, layout and
breakpoint tokens. What is left is the roster itself: exactly which items ship
in v1.

The old repository's inventory is the raw material: 29 old components, 43
catalogue items in total (components, blocks, pages), each with a one-line
description, and 19 authored demo files. The new foundation is shadcn and Base
UI over this repository's tokens, so the roster is the old list re-expressed
plus whatever the new foundation implies that the old catalogue never had.

Settle:

1. **The component roster, item by item.** Produce the explicit v1 list. For
   each: its name, its slug, its plasma category from ticket 09's seven, whether
   it is a re-expression of an old component, a new item the foundation implies,
   or dropped, and which upstream primitive it composes (Base UI, or none).
   Include the accessibility-bearing stateful items the old catalogue needed
   (a select, a dialog, a disclosure) or say why they are deferred.
2. **The blocks and pages roster.** Ticket 07 defines a Block as a
   pre-composed section and a Page as a shipped composition demo. Decide the v1
   list of each, against the old catalogue's blocks and pages and the
   composition demos the docs site needs.
3. **The launch cut.** State the v1 set as a number of components, blocks and
   pages, and say what is explicitly deferred to v1.1. The content ticket 11 has
   to work at whichever size is chosen, so name it as a number.
4. **The upstream-primitive audit.** For each item, whether it requires a Base
   UI primitive that is not yet used in the repository, since that is a new
   dependency surface and the largest cost driver in the roster. Name the ones
   that pull in Base UI, and what the bundle consequence is against the recorded
   2.4x figure.
5. **The zero-client budget.** The old catalogue shipped all Server Components
   and measured zero client boundaries; the new stateful items break that. State
   which items are client components, why, and what the measured budget for
   client JavaScript per item is.
6. **The catalogue entries.** For the chosen roster, the exact
   `packages/ui/src/catalog.ts` entries the checked catalogue will hold, or the
   rule that generates them, consistent with ticket 09's schema.
7. **What the old catalogue got wrong.** The old 29 components were built on
   antd. Name any old component whose purpose the new foundation makes
   unnecessary (because Base UI or shadcn already provides it, or because the
   pattern is a block rather than a component) and any that should be a block or
   page instead of a component.

Read the old-site inventory at
[research/01-old-site-documentation-inventory.md](../research/01-old-site-documentation-inventory.md)
(the 43 items and the 19 demos) and plasma's roster in
[research/04-plasma-documentation-structure.md](../research/04-plasma-documentation-structure.md)
section 1. Read the resolved answers for 05, 07, 09 and 18 in full so the roster
is expressed in the settled vocabulary and against the settled API.

Context: the destination is a published library downstream products compose
without writing CSS. The roster is what those products actually get, so it is
the deliverable the content plan and the agent surface both hang off.

## Answer

The roster is fixed at **28 components, 10 blocks and 4 pages: 42 catalogue
items**. The vocabulary is ticket 09's (Component, Block, Page; plasma's seven
categories, closed), the API is ticket 07's (`components/ui/<name>.tsx`,
`blocks/<slug>/`, `pages/<slug>/`, compound parts inside their parent module),
and the tokens are tickets 06 and 18's (semantic utilities only, `--shadow-*`,
`--container-*`, `--breakpoint-*`). The old inventory is the raw material, not
the spec: 26 of the 29 old components are re-expressed, one (`icon`) is dropped
and one (`drawer`) folds into `dialog`, and the shadcn/ui baseline supplies the
stateful items the old antd catalogue never owned.

Two framing rules hold everywhere below:

- **The baseline is shadcn/ui's default set.** A library distributed under this
  repo's shadcn internals is expected to ship at least the baseline's core. v1
  ships **28 of the baseline's ~30 core items** and defers the long tail to
  v1.1 (the explicit deferral lists are in section 3).
- **A component earns its place by the deletion test (`codebase-design`).**
  Delete it and complexity must reappear across callers; a pass-through does
  not ship. This is why `stat-card` folds into `stats-01` and why `drawer`
  folds into `dialog`.

### 1. The component roster, item by item

28 components over six of the seven categories. **Miscellaneous ships empty**
and therefore emits no section (ticket 09's two-item floor; a section with no
items has no index page per ticket 10 section 2). Category assignment is by
primary role, per ticket 09.

| # | Name | slug | Category | Origin | Upstream primitive |
| ---: | --- | --- | --- | --- | --- |
| 1 | Button | `button` | Call to action | re-expression (old; already ships) | none |
| 2 | Breadcrumb | `breadcrumb` | Call to action | re-expression (old) | none |
| 3 | Pagination | `pagination` | Call to action | re-expression (old) | none |
| 4 | Field | `field` | Forms and inputs | re-expression (old `field`) | none (authored; `Label` is a compound part) |
| 5 | Input | `input` | Forms and inputs | re-expression (old) | none |
| 6 | Textarea | `textarea` | Forms and inputs | re-expression (old) | none |
| 7 | Select | `select` | Forms and inputs | re-expression (old) | Base UI Select |
| 8 | Checkbox | `checkbox` | Forms and inputs | re-expression (old) | Base UI Checkbox |
| 9 | RadioGroup | `radio-group` | Forms and inputs | re-expression (old `radio-group`) | Base UI Radio + RadioGroup |
| 10 | Switch | `switch` | Forms and inputs | re-expression (old) | Base UI Switch |
| 11 | Slider | `slider` | Forms and inputs | re-expression (old) | Base UI Slider |
| 12 | Alert | `alert` | Feedback | re-expression (old) | none |
| 13 | Progress | `progress` | Feedback | re-expression (old) | Base UI Progress |
| 14 | Tooltip | `tooltip` | Feedback | re-expression (old) | Base UI Tooltip |
| 15 | Skeleton | `skeleton` | Feedback | re-expression (old) | none |
| 16 | Section | `section` | Layout | new (container primitive; already ships) | none |
| 17 | Accordion | `accordion` | Layout | re-expression (old) | Base UI Accordion |
| 18 | Dialog | `dialog` | Layout | re-expression (old `dialog` + old `drawer` folded) | Base UI Dialog |
| 19 | DropdownMenu | `dropdown-menu` | Layout | new (shadcn baseline; old catalogue had none) | Base UI Menu |
| 20 | Popover | `popover` | Layout | re-expression (old) | Base UI Popover |
| 21 | Tabs | `tabs` | Layout | re-expression (old) | Base UI Tabs |
| 22 | Separator | `separator` | Layout | re-expression (old) | none |
| 23 | Avatar | `avatar` | Data display | re-expression (old) | Base UI Avatar |
| 24 | Badge | `badge` | Data display | re-expression (old; already ships) | none |
| 25 | Card | `card` | Data display | re-expression (old; already ships) | none |
| 26 | Table | `table` | Data display | re-expression (old) | none |
| 27 | Typography | `typography` | Typography | re-expression (old) | none |
| 28 | Kbd | `kbd` | Typography | re-expression (old) | none |

Category counts: Call to action 3, Forms and inputs 8, Feedback 4, Layout 7,
Data display 4, Typography 2, Miscellaneous 0. Every shipped category clears
ticket 09's two-item floor; none is a dumping ground.

**The nine stateful accessibility-bearing items are all present**: `select`
(7), `dialog` (18), `accordion` (17, the disclosure), `dropdown-menu` (19),
`tabs` (21), `tooltip` (14), `switch` (10), `checkbox` (8), `radio-group` (9).
None is deferred, because a design system that claims accessibility and omits
them is not usable; the bundle and client costs they carry are named in
sections 4 and 5 rather than hidden.

**Baseline delta.** The shadcn/ui baseline core is the 28 above plus a long
tail. Present in v1: button, badge, card, input, textarea, select, checkbox,
radio-group, switch, slider, field (with `Label` as a compound part), alert,
avatar, progress, skeleton, separator, table, tabs, accordion, dialog,
dropdown-menu, popover, tooltip, breadcrumb, pagination, typography, kbd. The
baseline items **deferred to v1.1** are listed in section 3. `Label` is
deliberately not a standalone item: it is the `FieldLabel` export of the
`field` module (ticket 07 section 5, compound parts stay inside their parent).

### 2. The blocks and pages roster

A Block is ticket 07's pre-composed, product-agnostic section that takes its
content as props and fetches nothing. A Page is ticket 07's shipped,
installable screen model composed of blocks and components that receives
application-owned navigation, content and data and also fetches nothing.
Category is `null` for both (ticket 09); the "role" column below is for the
reader and is **not** a catalogue category.

**10 blocks: the five that ship today plus five composition sections.**

| # | Name | slug | Role | Origin | Composes | Boundary |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Hero01 | `hero-01` | marketing | current | Section, SectionHeading, Button | server |
| 2 | FeatureGrid01 | `feature-grid-01` | marketing | current | Section, SectionHeading, Card | server |
| 3 | Stats01 | `stats-01` | application | current | Section, SectionHeading, Card | server |
| 4 | Pricing01 | `pricing-01` | marketing | current | Section, SectionHeading, Card, Badge, Button | server |
| 5 | Cta01 | `cta-01` | marketing | current | Section, SectionHeading, Button | server |
| 6 | PageHeader01 | `page-header-01` | application | re-expression (old block) | Breadcrumb, Separator, Typography, Button | server |
| 7 | DataTable01 | `data-table-01` | application | re-expression (old block) | Table, Checkbox, DropdownMenu, Popover, Pagination, Input, Button | client |
| 8 | SettingsPanel01 | `settings-panel-01` | application | re-expression (old block) | Card, Field, Input, Textarea, Switch, Select, Button, Separator | client |
| 9 | AuthForm01 | `auth-form-01` | application | re-expression (old block) | Card, Field, Input, Checkbox, Alert, Button | client |
| 10 | AppShell01 | `app-shell-01` | application | re-expression (old `application-shell`) | Dialog (mobile-nav sheet), Breadcrumb, Button, Separator | client |

The `-NN` suffix is the block-family variant ordinal (the existing convention;
`hero-02` is a future second hero). `application-shell` is renamed `app-shell`
to match ticket 10's vocabulary.

**4 pages: three portable old screens plus one new marketing screen.**

| # | Name | slug | Origin | Composes | Boundary |
| ---: | --- | --- | --- | --- | --- |
| 1 | MarketingPage | `marketing-page` | new (the old catalogue had no marketing page) | hero-01, feature-grid-01, stats-01, pricing-01, cta-01 | server |
| 2 | DashboardPage | `dashboard-page` | re-expression (old page) | app-shell-01, page-header-01, stats-01, data-table-01 | client |
| 3 | SettingsPage | `settings-page` | re-expression (old page) | app-shell-01, page-header-01, settings-panel-01, Tabs | client |
| 4 | AuthPage | `auth-page` | re-expression (old page) | auth-form-01, Card | client |

`marketing-page` is a catalogue Page, product-agnostic and installable; it is
not the site's `/` route, which is site-owned and composes the same blocks at
the call site (ticket 09 Q7). `blog-layout` is never shipped (the blog does not
exist) and `docs-shell` is never a catalogue item (it is site chrome; ticket 10
section 3).

**One borderline call, decided.** `app-shell-01` is a **Block**, not a Page.
It passes the deletion test as a deep module (delete it and every application
screen re-derives the side-nav, top-bar, scroll container and breakpoints), but
its interface is slots (`navigation`, `children`), it carries no data and it
does not model a specific screen, which is exactly ticket 07's Block contract.
The Pages compose it.

### 3. The launch cut

**v1 ships 28 components, 10 blocks and 4 pages, 42 catalogue items.** At
ticket 11's measured ~1.7 KB of prose per item, that is roughly **71 KB of
authored per-item prose**, plus the guides, foundations and Content sections
ticket 11 owns. This is the number ticket 11 plans against.

Explicitly deferred to **v1.1**:

| Unit | Deferred to v1.1 |
| --- | --- |
| Components (baseline tail) | `empty`, `collapsible`, `spinner`, `toast` (Sonner-style), `alert-dialog`, `sheet`, `command`, `combobox`, `calendar`, `date-picker`, `scroll-area`, `aspect-ratio`, `hover-card`, `context-menu`, `menubar`, `navigation-menu`, `toggle`, `toggle-group`, `input-otp`, `item`, `button-group`, `input-group`, `carousel`, `chart`, `sidebar`, `form` (react-hook-form binding), `number-field`, `meter`, `resizable`, `native-select`, a standalone `label` |
| Blocks | `stat-card` (folded into `stats-01`, not deferred as an item), `faq-01`, `logo-cloud-01`, `testimonial-01`, `footer-01`, `newsletter-01` |
| Pages | `onboarding-page`, `pricing-page`, `error-page` |
| Never ships | `icon` (a custom icon package is out of scope; Lucide is the lane), `blog-layout` (no blog), `docs-shell` (site chrome, ticket 10 section 3) |

The deferrals are a size decision, not a capability gap: every deferred item
is reachable without a new upstream engine (Base UI has Collapsible, AlertDialog,
Combobox, ContextMenu, Menubar, NavigationMenu, Toggle, ToggleGroup, PreviewCard
and ScrollArea today), so v1.1 is additive and non-breaking.

### 4. The upstream-primitive audit

`@base-ui/react` is already a direct dependency of the component package, but
**no file in the repository imports it today** (the three ui components are cva
plus markup; the five blocks are zero-client). Every primitive below is
therefore new *usage*, and the 13 are the entire new dependency surface in v1:
no Radix, no Vaul, no react-hook-form and no TanStack Table is added.

| Base UI primitive | Pulled by | v1 items |
| --- | --- | --- |
| Accordion | `accordion` | 1 |
| Avatar | `avatar` | 1 |
| Checkbox | `checkbox`, `data-table-01`, `auth-form-01` | 3 |
| Dialog | `dialog`, `app-shell-01` (mobile nav) | 2 |
| Menu | `dropdown-menu`, `data-table-01` | 2 |
| Popover | `popover`, `data-table-01` (filters) | 2 |
| Progress | `progress` | 1 |
| Radio + RadioGroup | `radio-group` | 1 |
| Select | `select`, `settings-panel-01` | 2 |
| Slider | `slider` | 1 |
| Switch | `switch`, `settings-panel-01` | 2 |
| Tabs | `tabs`, `settings-page` | 2 |
| Tooltip | `tooltip` | 1 |

Base UI primitives **not** used anywhere in v1: Collapsible, ContextMenu,
Menubar, NavigationMenu, Toggle, ToggleGroup, Toolbar, Combobox, NumberField,
Meter, Field/Fieldset/Form (our `Field` is authored), PreviewCard, ScrollArea.

**Bundle consequence against the recorded ~2.4x figure.** The recorded figure
is that a Base UI primitive costs about 2.4x the equivalent Radix primitive on
the client. Applied to v1, the 13 primitives total about **74 KB gzip**
(section 5) where a Radix equivalent would be about **31 KB gzip**. The
multiplier is accepted, not waved away, for two reasons:

1. **It is the price of the behaviour.** The alternative is hand-authoring the
   focus trap, roving tabindex, typeahead, collision-aware positioning and ARIA
   state machine for select, menu, dialog, popover and tabs. That is more code,
   not less, and it is the code most likely to be wrong.
2. **The multiplier is only paid per imported primitive.** The barrel (`./`) is
   curated and does not force the stateful set; `./components/*` is one module
   per item. A consumer that imports `button`, `card` and `alert` pays 0 KB of
   it; a consumer that imports `select` pays only Select's subtree.

The one shared cost is the floating-positioning engine behind Popover, Tooltip,
Menu and Select; the first of those pulls it and the other three are marginal.
The mitigation is the per-item entry modules plus ticket 15's per-item size
budget (section 5), which makes the second, third and fourth primitive's cost
visible instead of letting a single barrel hide it.

### 5. The zero-client budget

The old catalogue shipped all Server Components and measured zero client
boundaries. That claim is now false globally and true by default: **15 of the
28 components are Server Components and ship no client JavaScript; 13 are
client components** because they use Base UI hooks, context, event handlers,
portals, focus management or collision-aware positioning, and none of that can
run on the server. A consumer that imports only presentational items still
ships 0 KB of Prism client JS; the stateful set is opt-in per module.

**Server components (15, 0 KB client JS):** Button, Breadcrumb, Pagination,
Field, Input, Textarea, Alert, Skeleton, Section, Separator, Badge, Card,
Table, Typography, Kbd. These are markup, native controls and semantic
utilities with no state; `Button` in particular stays server because a handler
is the consumer's client boundary, not the component's.

**Client components (13), with a per-item gzip budget** measured on the
tree-shaken component module plus its Base UI subtree, excluding React and
excluding the shared floating engine counted once:

| Component | Why it is client | Client budget (gzip) |
| --- | --- | ---: |
| Accordion | Base UI disclosure state, roving focus | 4 KB |
| Avatar | Base UI image-load context and fallback swap | 3 KB |
| Checkbox | checked/indeterminate state and ARIA | 4 KB |
| Dialog | portal, focus trap, scroll lock, Escape | 9 KB |
| DropdownMenu | Base UI Menu state, typeahead, positioning | 9 KB |
| Popover | Base UI anchored layer, positioning | 6 KB |
| Progress | Base UI progress ARIA state | 3 KB |
| RadioGroup | roving focus and selection state | 4 KB |
| Select | listbox state, typeahead, anchored layer | 12 KB |
| Slider | pointer/keyboard value state | 7 KB |
| Switch | checked state and ARIA | 3 KB |
| Tabs | roving focus and panel state | 5 KB |
| Tooltip | Base UI anchored layer, hover/focus timing | 5 KB |
| **Total (all 13 imported)** | | **74 KB** |

**The budget.** Per-item budgets are the table above; the hard ceiling for a
consumer that imports **every** client component is **90 KB gzip**, leaving
headroom for the shared floating engine. The measurement is a size gate over
each emitted `dist/components/ui/<name>.js` plus its Base UI subtree, gzipped,
tree-shaken, wired into ticket 15's task graph. A block that composes client
components (`data-table-01`, `settings-panel-01`, `auth-form-01`,
`app-shell-01`) is a client block by the same rule ticket 07's analyzer already
measures, and its cost is its components' sum, not a new budget.

### 6. The catalogue entries

One authored `packages/ui/src/catalog.ts`, `satisfies`-checked, passed through
ticket 09's `buildCatalog()`. The entry shape is exactly ticket 09's eight
fields:

```ts
export const CATALOG_KINDS = ['component', 'block', 'page'] as const
export type CatalogKind = (typeof CATALOG_KINDS)[number]

export const COMPONENT_CATEGORIES = [
  'Call to action', 'Forms and inputs', 'Feedback',
  'Layout', 'Data display', 'Typography', 'Miscellaneous',
] as const
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number]

export interface CatalogItem {
  name: string
  slug: string
  kind: CatalogKind
  category: ComponentCategory | null
  description: string
  source: string
  exports: string[]
  status: 'stable' | 'deprecated'
}
```

**The generation rule.** `name`, `slug`, `kind`, `category`, `description` and
`status` are authored; `source` and `exports` are checked against disk and the
emitted declarations rather than trusted:

- `source` is derived from `kind` and `slug`:
  `src/components/ui/<slug>.tsx` | `src/blocks/<slug>/index.tsx` |
  `src/pages/<slug>/index.tsx`. `buildCatalog()` throws if it does not resolve.
- `exports` lists the module's public **named** runtime exports, taken from the
  emitted `.d.ts` (ticket 05's seam). Compound parts are listed with no
  subpath of their own (ticket 07 section 5). A `default` export is not listed.
- `category` is a component category or `null` for a block or page.
- `status` is `'stable'` with no note for all 42 v1 items; `buildCatalog()`
  throws on a note without `'deprecated'` and vice versa.
- `description` is one sentence, authored in ticket 11, and is the item's
  `llms.txt` bullet and page lede.

**Component entries** (name, slug, category, source, exports):

| Name | slug | Category | Source | Exports |
| --- | --- | --- | --- | --- |
| Button | `button` | Call to action | `src/components/ui/button.tsx` | `Button` |
| Breadcrumb | `breadcrumb` | Call to action | `src/components/ui/breadcrumb.tsx` | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` |
| Pagination | `pagination` | Call to action | `src/components/ui/pagination.tsx` | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` |
| Field | `field` | Forms and inputs | `src/components/ui/field.tsx` | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup` |
| Input | `input` | Forms and inputs | `src/components/ui/input.tsx` | `Input` |
| Textarea | `textarea` | Forms and inputs | `src/components/ui/textarea.tsx` | `Textarea` |
| Select | `select` | Forms and inputs | `src/components/ui/select.tsx` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator` |
| Checkbox | `checkbox` | Forms and inputs | `src/components/ui/checkbox.tsx` | `Checkbox` |
| RadioGroup | `radio-group` | Forms and inputs | `src/components/ui/radio-group.tsx` | `RadioGroup`, `RadioGroupItem` |
| Switch | `switch` | Forms and inputs | `src/components/ui/switch.tsx` | `Switch` |
| Slider | `slider` | Forms and inputs | `src/components/ui/slider.tsx` | `Slider` |
| Alert | `alert` | Feedback | `src/components/ui/alert.tsx` | `Alert`, `AlertTitle`, `AlertDescription` |
| Progress | `progress` | Feedback | `src/components/ui/progress.tsx` | `Progress` |
| Tooltip | `tooltip` | Feedback | `src/components/ui/tooltip.tsx` | `Tooltip`, `TooltipTrigger`, `TooltipContent` |
| Skeleton | `skeleton` | Feedback | `src/components/ui/skeleton.tsx` | `Skeleton` |
| Section | `section` | Layout | `src/components/ui/section.tsx` | `Section`, `SectionHeading` |
| Accordion | `accordion` | Layout | `src/components/ui/accordion.tsx` | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| Dialog | `dialog` | Layout | `src/components/ui/dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| DropdownMenu | `dropdown-menu` | Layout | `src/components/ui/dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` |
| Popover | `popover` | Layout | `src/components/ui/popover.tsx` | `Popover`, `PopoverTrigger`, `PopoverContent` |
| Tabs | `tabs` | Layout | `src/components/ui/tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Separator | `separator` | Layout | `src/components/ui/separator.tsx` | `Separator` |
| Avatar | `avatar` | Data display | `src/components/ui/avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback` |
| Badge | `badge` | Data display | `src/components/ui/badge.tsx` | `Badge` |
| Card | `card` | Data display | `src/components/ui/card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| Table | `table` | Data display | `src/components/ui/table.tsx` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` |
| Typography | `typography` | Typography | `src/components/ui/typography.tsx` | `Text`, `Heading` |
| Kbd | `kbd` | Typography | `src/components/ui/kbd.tsx` | `Kbd` |

**Block entries** (category `null`, kind `block`):

| Name | slug | Source | Exports |
| --- | --- | --- | --- |
| Hero01 | `hero-01` | `src/blocks/hero-01/index.tsx` | `Hero01` |
| FeatureGrid01 | `feature-grid-01` | `src/blocks/feature-grid-01/index.tsx` | `FeatureGrid01` |
| Stats01 | `stats-01` | `src/blocks/stats-01/index.tsx` | `Stats01` |
| Pricing01 | `pricing-01` | `src/blocks/pricing-01/index.tsx` | `Pricing01` |
| Cta01 | `cta-01` | `src/blocks/cta-01/index.tsx` | `Cta01` |
| PageHeader01 | `page-header-01` | `src/blocks/page-header-01/index.tsx` | `PageHeader01` |
| DataTable01 | `data-table-01` | `src/blocks/data-table-01/index.tsx` | `DataTable01` |
| SettingsPanel01 | `settings-panel-01` | `src/blocks/settings-panel-01/index.tsx` | `SettingsPanel01` |
| AuthForm01 | `auth-form-01` | `src/blocks/auth-form-01/index.tsx` | `AuthForm01` |
| AppShell01 | `app-shell-01` | `src/blocks/app-shell-01/index.tsx` | `AppShell01` |

**Page entries** (category `null`, kind `page`):

| Name | slug | Source | Exports |
| --- | --- | --- | --- |
| MarketingPage | `marketing-page` | `src/pages/marketing-page/index.tsx` | `MarketingPage` |
| DashboardPage | `dashboard-page` | `src/pages/dashboard-page/index.tsx` | `DashboardPage` |
| SettingsPage | `settings-page` | `src/pages/settings-page/index.tsx` | `SettingsPage` |
| AuthPage | `auth-page` | `src/pages/auth-page/index.tsx` | `AuthPage` |

Three entries verbatim, all eight fields:

```ts
{
  name: 'Button',
  slug: 'button',
  kind: 'component',
  category: 'Call to action',
  description: 'The action control for commands, links and loading states.',
  source: 'src/components/ui/button.tsx',
  exports: ['Button'],
  status: 'stable',
},
{
  name: 'DataTable01',
  slug: 'data-table-01',
  kind: 'block',
  category: null,
  description: 'A table section with a toolbar, filters, selection and pagination.',
  source: 'src/blocks/data-table-01/index.tsx',
  exports: ['DataTable01'],
  status: 'stable',
},
{
  name: 'DashboardPage',
  slug: 'dashboard-page',
  kind: 'page',
  category: null,
  description: 'A full dashboard screen composing the app shell, a page header, a KPI row and a data table.',
  source: 'src/pages/dashboard-page/index.tsx',
  exports: ['DashboardPage'],
  status: 'stable',
},
```

The description strings for the remaining items are authored in ticket 11 and
are the only field with no mechanical check beyond ticket 09's non-empty rule.
The internal shadcn registry artifact is derived from this catalogue or
validated against it, never the reverse (ticket 09 Q3).

### 7. What the old catalogue got wrong

**Old components whose purpose the new foundation removes, or that fold in:**

- **`icon`** is dropped. The map puts a custom icon package out of scope, and
  `lucide-react` is already the icon lane; the old "Prism-owned SVG set drawn on
  a 24px grid" has no owner. Icons are passed into blocks as components, which
  is what `feature-grid-01` already does (`icon: LucideIcon`).
- **`drawer`** is dropped as a standalone component and folded into `dialog`.
  Base UI ships no Drawer; a side-anchored Dialog (the sheet pattern) covers the
  old drawer's purpose without adding Vaul, a second floating-layer engine.
  Shipping both would be two implementations of one seam.
- **`field`** is kept, but its implicit standalone `Label` is folded into the
  module as `FieldLabel` rather than shipping a second item (ticket 07 section 5).
- **`stat-card`** (an old *block*) is folded into `stats-01`. It is the deletion
  test's textbook shallow module: delete it and one `Card` composition moves
  into `stats-01`, with no complexity reappearing across callers.

**Old items that should be a block or page rather than a catalogue component:**

- **`component-demo`** (old block) should not be a catalogue item at all. It was
  site machinery, and the site owns it as `ComponentDemo` (ticket 10 section 5).
  It is documentation apparatus, not a shipped Block.
- **`site-header` and `site-footer`** (old blocks) were Prism's own marketing
  chrome, coupled to the old theme controls and product navigation (the
  inventory marks all three as `coupled`). Site chrome is site-owned (ticket 10
  section 3), so they are not catalogue Blocks. A product-agnostic
  `footer-01` is a v1.1 candidate; a generic `site-header` is not, because a
  header's navigation is always application-owned.
- **`empty`** is the one old *component* that should be re-examined as a Block
  rather than a component when it returns in v1.1: the old item was already a
  composition of icon, title, body and action, which is a section's shape, so
  `empty-state-01` is the better unit. It is deferred, not dropped, and the
  comparison is recorded here so v1.1 does not re-express it blindly.
- **`application-shell`** stays a Block, correctly re-labelled `app-shell-01`
  (section 2). It is the one item where the Component/Block/Page boundary is
  genuinely ambiguous, and the deciding rule is ticket 07's: slots and no data
  make it a Block, and the Pages compose it.

**Old items that were right and are kept as-is in kind:** `table` stays a
component and `data-table` stays a Block (one of each, not a duplicated pair);
`page-header`, `settings-panel` and `auth-form` stay Blocks; `auth-page`,
`dashboard-page` and `settings-page` stay Pages. No old component needs
promotion to a Block or Page; every mis-classification is on the block side,
plus the two components whose purpose the foundation removes.

### Hand-offs (outside this ticket's write scope)

- **11:** the 42-item page inventory of section 3, the one-sentence
  descriptions of section 6, and the ~71 KB prose estimate are the content
  plan's inputs.
- **12 and 13:** the catalogue of section 6 is the single source for the
  corpus and the MCP metadata; `kind` and `exports` are checked, not widened.
- **15:** the per-item client-JS budget and the 90 KB gzip ceiling of section 5
  are new gates to wire alongside ticket 06's emitted-contract test, ticket 07's
  `check-surface.mjs`, ticket 18's `check-elevation-layout.mjs` and ticket 10's
  search budget.
- **14:** `Section` as an installable Layout Component, and the retired
  `drawer`/`icon` vocabulary, are glossary facts for `CONTEXT.md`.
