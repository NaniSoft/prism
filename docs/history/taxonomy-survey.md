# Taxonomy survey: the UI problems modern product surfaces need solved

Author: a research subagent, commissioned as a read-only survey.
Retrieval date for every external URL in this document: **2026-09-28**.
Written against the Prism working tree at `C:\Users\dpven\source\nanisoft\prism`.

## What this document is

A catalogue of **108 product categories** taken from the public category listing at
<https://www.shadcnblocks.com/blocks>, each one restated as a user problem and a
business problem in plain language, each one assigned a Prism tier, and each one
judged against the Prism surface that exists today.

The vendor's site is used here as a **taxonomy source only**: the list of which
categories of product surface exist in the market, and the stated purpose of each
one. Nothing was read from its source code, its component registry, its
documentation prose, or its asset files, and nothing from it is reproduced here.
Every problem statement below stands on its own: if the vendor disappeared
tomorrow, the reasoning for every row would be unchanged.

## Sources

| Source | URL | Retrieved | Used for |
| --- | --- | --- | --- |
| Category index | <https://www.shadcnblocks.com/blocks> | 2026-09-28 | The authoritative list of 108 category slugs and their block counts |
| Category listing pages | `https://www.shadcnblocks.com/blocks/<slug>` (all 108 read, all returned HTTP 200) | 2026-09-28 | Each category's heading and stated purpose, and the titles of the entries listed under it |
| Prism roster | `packages/ui/src/catalog.ts` in this repo | 2026-09-28 | The 34 Components, 19 Blocks and 7 Pages that exist today |
| Prism vocabulary | `CONTEXT.md` in this repo | 2026-09-28 | Component, Block, Page, Item, Kind, Category, Section definitions |
| Prism deferred tail | `DESIGN.md` "Known Open Items" in this repo | 2026-09-28 | The v1.1 roster tail, the decided-not-built `live` Kind, and the Patterns, Templates and Workflows decision |
| W3C ARIA Authoring Practices patterns index | <https://www.w3.org/WAI/ARIA/apg/patterns/> | 2026-09-28 | The cross-cutting interaction pattern set, including Feed, Grid and Meter |
| Carbon data table usage | <https://carbondesignsystem.com/components/data-table/usage/> | 2026-09-28 | Cross-cutting data-table concerns: Expandable, Selectable, pagination, table toolbar, searching, sorting, batch actions, inline actions, overflow menu, loading |
| Carbon pagination usage | <https://carbondesignsystem.com/components/pagination/usage/> | 2026-09-28 | Pagination pairing with data table size, overflow content, responsive behaviour |
| Carbon search usage | <https://carbondesignsystem.com/components/search/usage/> | 2026-09-28 | Search states, placement, sizing |
| Carbon tag usage | <https://carbondesignsystem.com/components/tag/usage/> | 2026-09-28 | Read-only, dismissible, selectable and operational tag roles, plus overflow content |
| Carbon modal usage | <https://carbondesignsystem.com/components/modal/usage/> | 2026-09-28 | Modal variants including Passive, Transactional, Danger, Acknowledgment, Progress and AI presence; focus, loading, validation |
| OpenAI platform docs navigation | <https://platform.openai.com/docs/guides/agent-builder> | 2026-09-28 | Agent surface vocabulary: Agents API, Agents SDK, ChatKit, tool workflows, performance and quality, cost and throughput, safety and governance, operations |
| LangGraph docs navigation | <https://docs.langchain.com/oss/python/langgraph/overview> | 2026-09-28 | Agent application surfaces: Capabilities, Production, Frontend, observability, deployment |
| AI SDK docs navigation | <https://ai-sdk.dev/docs/introduction> | 2026-09-28 | Build, Scale, Secure, Generative UI, Templates and Starter Kits |

## How to read the columns

**Prism tier** is the level at which the problem's durable answer belongs. It uses
the five levels Prism has named in `DESIGN.md`, not the catalogue Kind:

- **Foundations**: the answer is a token, a pack, a mode, a surface property or a
  decoration. No catalogue item.
- **Components**: a focused, accessible, product-agnostic export with one job.
  Where a Block or a Page is the right shape, the row says so, because Block and
  Page are Kinds and not tiers.
- **Patterns**: prose documentation of a recurring composition of Items. Not a
  catalogue item, per the recorded decision.
- **Templates**: an arrangement of Pages, declared as data and checked against
  the catalogue by one gate.
- **Workflows**: a multi-screen user journey, owned by the consumer. Documented,
  never shipped, because Prism never fetches and never imports a router.

**Status** is one of five values:

| Status | Meaning |
| --- | --- |
| COVERED | An existing Item answers the problem as a category states it |
| PARTIAL | Existing Items take it most of the way; the residual is real and nameable |
| GAP | Nothing today answers it |
| DEFERRED | Named in the `DESIGN.md` v1.1 tail, so a committed answer already exists |
| OUT | Excluded by a recorded Prism rule rather than by oversight |

## Roster counted from source

Read from `packages/ui/src/catalog.ts`, not from prose, so the counts are not
stale. Names below are Prism's own, quoted as identifiers.

**Components, 34:** Button, CtaLink, Badge, Card, Section, Breadcrumb, Pagination,
Field, Input, Textarea, Alert, Skeleton, Separator, Table, Typography, Kbd, Diagram,
ProductMark, Prose, FactList, ProductSwitcher, Select, Checkbox, RadioGroup, Switch,
Slider, Progress, Tooltip, Accordion, Dialog, DropdownMenu, Popover, Tabs, Avatar.

**Blocks, 19:** Hero01, FeatureGrid01, Stats01, Pricing01, Cta01, PageHeader01,
DataTable01, SettingsPanel01, AuthForm01, AppShell01, ProcessRail01, StatusLedger01,
ProductGrid01, StackGrid01, LogoStrip01, NoteGrid01, InstrumentPanel01, SiteHeader,
SiteFooter.

**Pages, 7:** MarketingPage, DashboardPage, SettingsPage, AuthPage, NotFoundPage,
BlogPostPage, DocsShell.

**Deferred to v1.1, from `DESIGN.md` "Known Open Items":** Components `empty`
(returning as the `empty-state-01` Block), `collapsible`, `spinner`, `toast`,
`alert-dialog`, `sheet`, `command`, `combobox`, `calendar`, `date-picker`,
`scroll-area`, `aspect-ratio`, `hover-card`, `context-menu`, `menubar`,
`navigation-menu`, `toggle`, `toggle-group`, `input-otp`, `item`, `button-group`,
`input-group`, `carousel`, `chart`, `sidebar`, `form`, `number-field`, `meter`,
`resizable`, `native-select`, standalone `label`; Blocks `faq-01`, `logo-cloud-01`,
`testimonial-01`, `newsletter-01`; Pages `onboarding-page`, `pricing-page`,
`error-page`.

**Decided and not built:** a fourth Kind, working title `live`, for surface whose
content changes without a navigation event. It is the declared home for an agent
console, an execution flow and a monitoring view, and Prism would own the event
log surface, the tool-call ledger, the status tiers and the run controls while the
consumer owns the socket, the transport and the persistence.

---

# Part 1: the 108 category records

Evidence for every row in this part is the category listing page at
`https://www.shadcnblocks.com/blocks/<slug>`, retrieved 2026-09-28, read for its
heading and the titles of the entries listed under it.

## Cluster A: marketing narrative and persuasion (18 categories)

### hero
- **User problem**: I land on a page and within a few seconds need to know what this is, who it is for, and what to do next.
- **Business problem**: The first viewport is the only place the majority of visitors ever look. A page that fails to orient or to offer an action loses the visit before any other copy is read.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Hero01` is a centered hero with an optional eyebrow and one or two actions. The category asks for the other common answers too: a split with product imagery, a hero carrying a product screenshot, a hero with an embedded social proof line. `MarketingPage` composes `Hero01` and nothing else into the first screen.
- **Evidence**: <https://www.shadcnblocks.com/blocks/hero>, 2026-09-28.

### feature
- **User problem**: I need to understand what the product actually does, in enough detail to judge whether it solves my problem, before I commit any attention.
- **Business problem**: Feature communication is the main substitute for a salesperson in self-serve and free-tier funnels. Vague feature lists lose trials; specific ones convert them.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `FeatureGrid01` covers the grid, and `NoteGrid01` covers a plain grid of titled points. The alternating split with an image, the numbered step with a caption, and the feature row with a shared hover state are not answered.
- **Evidence**: <https://www.shadcnblocks.com/blocks/feature>, 2026-09-28.

### cta
- **User problem**: I have read enough and I want the next thing: request access, start a trial, buy, book a call.
- **Business problem**: Every page needs a defined exit into the funnel. A page that ends without one strands the reader, and the traffic it already earned is lost.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Cta01` is a closing call to action on a filled primary surface. The category also names a muted checklist variant and a split variant with imagery beside it.
- **Evidence**: <https://www.shadcnblocks.com/blocks/cta>, 2026-09-28.

### bento
- **User problem**: I want a dense visual summary of a product's surface area, where each tile demonstrates one capability rather than asserting it in words.
- **Business problem**: A product with many capabilities cannot be argued for in a single linear list. The tiled layout lets each capability carry its own miniature demonstration and keeps the page to one screen.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `FeatureGrid01` and `NoteGrid01` are uniform grids. A bento is by definition non-uniform, with per-tile span and height, and Prism has no Block that expresses an arbitrary tile arrangement.
- **Evidence**: <https://www.shadcnblocks.com/blocks/bento>, 2026-09-28.

### background-pattern
- **User problem**: The page is legible but flat. I want the surface to carry texture so the content sits on something rather than floating.
- **Business problem**: Low-contrast flat layouts read as unfinished. A restrained surface treatment is the cheapest available lift in perceived build quality, and it costs no layout work.
- **Prism tier**: Foundations.
- **Status**: GAP, with a boundary worth stating. A static wash is expressible as a gradient whose colour stops are semantic, which Prism's gradient rule already permits. An animated pattern is not, because `DESIGN.md` records that motion is state feedback only and that there are no decorative keyframes. So the gap is real but bounded, and the boundary is a rule rather than an omission.
- **Evidence**: <https://www.shadcnblocks.com/blocks/background-pattern>, 2026-09-28.

### shader
- **User problem**: I want an expressive, moving visual that makes the product feel technical and alive before I have read anything.
- **Business problem**: This is a brand and category bet. It suits products whose differentiation is technical sophistication, and it actively misleads products whose value is calm and administrative.
- **Prism tier**: Foundations.
- **Status**: OUT. Prism's motion doctrine forbids decorative keyframes, and a raymarched or interactive shader is decorative animation by definition. This is a deliberate exclusion, and `DESIGN.md` names it as a rule rather than leaving it as a gap.
- **Evidence**: <https://www.shadcnblocks.com/blocks/shader>, 2026-09-28.

### process
- **User problem**: I need to understand how the work gets done, step by step, so I can judge whether the effort is worth committing.
- **Business problem**: Process visibility is the main objection-handling tool for services and for any product with an onboarding or integration burden. Stated steps shorten the perceived risk of starting.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `ProcessRail01` draws two to four steps on one line, each with an ordinal, a name and a caption. The category also names a sticky sidebar variant that holds one step while the reader scrolls the corresponding section, which is a different interaction, not a different layout.
- **Evidence**: <https://www.shadcnblocks.com/blocks/process>, 2026-09-28.

### experience
- **User problem**: I am evaluating a person or a small team and I want to see where they have worked and what they did there, in one place.
- **Business problem**: For consultancies, agencies and senior hires, a work history is the primary proof of capability. It also shortens the qualification call.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `ProcessRail01` expresses ordered steps but not attributed history with dates and organisations. There is no Block for a person's or an organisation's record of past work.
- **Evidence**: <https://www.shadcnblocks.com/blocks/experience>, 2026-09-28.

### about
- **User problem**: Before I commit to a vendor, I want to know what kind of organisation this is, what it values, and who runs it.
- **Business problem**: Trust in an unknown vendor is the largest single blocker in B2B evaluation. An about surface is the cheapest available answer to it, and enterprise procurement asks for it directly.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `NoteGrid01`, `StackGrid01` and `ProductGrid01` each cover one grid an about page tends to contain, but there is no Block that answers the question the page is asked to answer.
- **Evidence**: <https://www.shadcnblocks.com/blocks/about>, 2026-09-28.

### our-story
- **User problem**: I want the history of an organisation told as a narrative, not as a list of dates.
- **Business problem**: Origin stories are how a brand earns permission to charge more, and how a company aligns its own staff. They also do real work in recruitment.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `ProcessRail01` and `StatusLedger01` are ordered but flat; a story surface is scroll-linked or chaptered, which is a different interaction.
- **Evidence**: <https://www.shadcnblocks.com/blocks/our-story>, 2026-09-28.

### gallery
- **User problem**: I want to look at many images quickly, and to inspect one closely when something catches my eye.
- **Business problem**: Visual proof is the substitute for a physical sample. A browsable gallery lets a customer self-qualify without a sales call.
- **Prism tier**: Components tier, shipping as a Component plus a Block for the layout.
- **Status**: GAP. Prism has no image surface, no carousel and no lightbox. `carousel` and `aspect-ratio` are both named in the v1.1 tail, so the primitives are committed and the composite is not.
- **Evidence**: <https://www.shadcnblocks.com/blocks/gallery>, 2026-09-28.

### incentives
- **User problem**: I want to know what I get for committing: free shipping, a guarantee, a bonus, a service level.
- **Business problem**: Incentive strips near a purchase decision measurably move it, and they let a retailer state terms that would be too dense to put in product copy.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `FeatureGrid01` can hold the items but has no incentive semantics and no per-item icon treatment.
- **Evidence**: <https://www.shadcnblocks.com/blocks/incentives>, 2026-09-28.

### timeline
- **User problem**: I need to see a sequence of dated events and understand both what happened and when.
- **Business problem**: Time-ordered state is how organisations prove history to auditors, to customers and to their own staff. It is also the clearest statement of a project's phases.
- **Prism tier**: Components tier, shipping as a Component for the rail and a Block for the layout.
- **Status**: GAP. Prism has no timeline. `StatusLedger01` is a flat ledger of names and four status tiers with no time axis, and `ProcessRail01` has no dates.
- **Evidence**: <https://www.shadcnblocks.com/blocks/timeline>, 2026-09-28.

### list
- **User problem**: I have a set of things and I want to see them all at once, in rows, with enough per row to tell them apart.
- **Business problem**: Any set larger than a screen needs a canonical row form, or every team invents one and the product stops looking like itself.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `ProductGrid01` is exactly this: hairline rows with a mark, a name, a tagline and a destination. `DataTable01` is the dense version. The gap is the flexible middle, a list whose per-row fields are the consumer's to choose.
- **Evidence**: <https://www.shadcnblocks.com/blocks/list>, 2026-09-28.

### newsletter
- **User problem**: I want to receive updates from a company without giving them an account.
- **Business problem**: It is the cheapest permission asset a company has. It captures demand from people who are not ready to buy and it keeps a content programme alive.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: DEFERRED. `newsletter-01` is named in the v1.1 Block tail. `Field`, `Input` and `Button` cover the mechanics today; the composed surface does not exist.
- **Evidence**: <https://www.shadcnblocks.com/blocks/newsletter>, 2026-09-28.

### service
- **User problem**: I am considering one specific service and I want to know what it involves, what it costs, and who delivers it.
- **Business problem**: A service detail page is the working surface of a professional services firm. It answers scoping questions that a sales call would otherwise have to answer one at a time.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `Prose` and `DocsShell` can render the body, but Prism has no Page that models a service detail screen, and `DocsShell` states two rules that a service page would contradict, namely that a section is a label and not a control and that a group with no index is a label and not a route.
- **Evidence**: <https://www.shadcnblocks.com/blocks/service>, 2026-09-28.

### services
- **User problem**: I want to see everything a company does, each item with enough detail to tell whether it is relevant to me.
- **Business problem**: The services page is how a company with a broad offer gets a visitor to self-select into one conversation rather than into none.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `FeatureGrid01` holds the grid and can carry per-item detail, but the category's typical shape is a row with an included-items list and a duration, which `FeatureGrid01` does not express.
- **Evidence**: <https://www.shadcnblocks.com/blocks/services>, 2026-09-28.

### skills
- **User problem**: I want to see what someone can actually do, with the evidence, before I commit to them.
- **Business problem**: A skills surface is how a services business, a marketplace or a hiring process turns an abstract claim into a checkable one. It shortens screening.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. The nearest existing surface is `StackGrid01`, which surveys what a product is assembled from and what it built itself. That is a system inventory; it does not carry per-skill evidence or a usage signal.
- **Evidence**: <https://www.shadcnblocks.com/blocks/skills>, 2026-09-28.

## Cluster B: proof, trust and reputation (15 categories)

### testimonial
- **User problem**: I want to hear from people in my position who have already done this, in their own words.
- **Business problem**: Social proof is the most reliable conversion lever in B2C and a required one in B2B, where the buyer is explicitly looking for evidence that the risk is acceptable.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: DEFERRED. `testimonial-01` is named in the v1.1 Block tail. `Avatar`, `Card` and `Badge` cover the mechanics; the composed surface does not exist.
- **Evidence**: <https://www.shadcnblocks.com/blocks/testimonial>, 2026-09-28.

### case-studies
- **User problem**: I want to see how an organisation with problems like mine solved them, with outcomes.
- **Business problem**: A case study is the only asset that answers both the champion and the economic buyer at once. It is usually the last document read before a signature.
- **Prism tier**: Components tier, shipping as a Block for the index.
- **Status**: GAP. `ProductGrid01` can list them and `Stats01` can carry the outcome numbers, but there is no Block that models the case study index with a metric per entry.
- **Evidence**: <https://www.shadcnblocks.com/blocks/case-studies>, 2026-09-28.

### case-study
- **User problem**: I want to read one case study end to end, with the outcome stated plainly and the detail there if I want it.
- **Business problem**: Long-form proof is the artefact that closes deals, and it is the artefact most often outsourced to a CMS that drifts from the design system.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `BlogPostPage` is the nearest thing and it is wrong in three specific ways: it names a standfirst and a byline, it has no metric band, and it places a trail to neighbouring posts where a case study needs a breadcrumb back to the set and a related-case rail.
- **Evidence**: <https://www.shadcnblocks.com/blocks/case-study>, 2026-09-28.

### team
- **User problem**: I want to know who I would be working with and what each of them is good at.
- **Business problem**: In services and in enterprise software the buying committee buys people. A named team with visible expertise is how a firm converts a capability claim into a relationship.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `ProductGrid01` gives the hairline rows, `Avatar` gives the person, and `FactList` gives the term and value pairs. What is missing is the per-person surface with an expertise signal and an expand-in-place bio.
- **Evidence**: <https://www.shadcnblocks.com/blocks/team>, 2026-09-28.

### awards
- **User problem**: I want to see that this organisation has been externally recognised, and when.
- **Business problem**: Third-party validation shortens procurement. It is also, for a young company, one of the few credibility signals available.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `LogoStrip01` shows marks with no names, no dates and no link through to the awarding body. A row of dated, linked recognitions is a different surface.
- **Evidence**: <https://www.shadcnblocks.com/blocks/awards>, 2026-09-28.

### trust-strip
- **User problem**: Before I act, I want a compact line telling me whether this is safe: guarantees, ratings, certifications, seller standing.
- **Business problem**: A trust strip is a compliance surface as much as a reassurance surface. Putting the guarantee where the decision happens measurably reduces abandonment and reduces disputes.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `LogoStrip01` carries the marks and `Badge` carries the pills. Neither expresses a guarantee, and neither gives each item a destination.
- **Evidence**: <https://www.shadcnblocks.com/blocks/trust-strip>, 2026-09-28.

### logos
- **User problem**: I want to see, in one glance, who already uses this.
- **Business problem**: Customer logos are the cheapest social proof available and the one most often reused across a company's pages. They are also frequently unlawful to display without permission, which makes the surface worth owning centrally.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: COVERED, with a named tail. `LogoStrip01` is the answer: a single line of short phrases, explicitly modelled as the transition band between a hero and the section that follows. `logo-cloud-01` is deferred in the v1.1 tail, which is the grid variant.
- **Evidence**: <https://www.shadcnblocks.com/blocks/logos>, 2026-09-28.

### stats
- **User problem**: I want a small number of figures that tell me the scale of a claim, and ideally whether the figure is going up.
- **Business problem**: Numbers are the cheapest proof that does not require reading. They carry credibility on a landing page and they carry goal progress inside the product.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Stats01` is a KPI row with optional directional deltas, which is the product-side answer. The marketing-side answers named here include a period toggle, a radial reading and a figure tied to a timeline, none of which `Stats01` expresses.
- **Evidence**: <https://www.shadcnblocks.com/blocks/stats>, 2026-09-28.

### stats-card
- **User problem**: In a dense interface I want one metric with its trend, its comparison and its context, on its own surface.
- **Business problem**: The metric tile is the atomic unit of every operations dashboard. Standardising it is what makes a dashboard read as one system.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: COVERED. `DESIGN.md` records the decision that the old `stat-card` Block folds into `Stats01` rather than shipping separately. The category's variants named here are trend, sparkline, progress and comparison; `Stats01` carries the value and the optional delta, and the sparkline form is what `chart` in the v1.1 tail will carry.
- **Evidence**: <https://www.shadcnblocks.com/blocks/stats-card>, 2026-09-28.

### compare
- **User problem**: I am choosing between two or three options and I need the differences laid out against each other on the same axes.
- **Business problem**: A comparison table lets a buyer self-serve a decision that would otherwise require a sales engineer. It also protects the sales team from being asked to compare things that are actually equal.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Table`, `Accordion`, `Tabs` and `Badge` cover the mechanics and `ProductGrid01` gives the column shape. What is missing is the Block that binds them, and in particular the axis-row treatment where a row is one capability and a cell is present, absent or differs.
- **Evidence**: <https://www.shadcnblocks.com/blocks/compare>, 2026-09-28.

### compare-products
- **User problem**: I want to put two specific products side by side and act on the result: pick one, or add one.
- **Business problem**: Side-by-side comparison with an action on each column is the last step of a retail funnel and the first step of a considered B2B purchase. Carrying the action is what makes it a decision surface rather than a reference.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `Table` gives rows and `Button` gives the action, but there is no Block that pairs a comparison axis with a per-column decision control, and no handling for adding and removing a column.
- **Evidence**: <https://www.shadcnblocks.com/blocks/compare-products>, 2026-09-28.

### community
- **User problem**: I want to find the other people using this and the places they talk.
- **Business problem**: A community surface converts users into support capacity and gives a company early warning when something breaks.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `Avatar` and `Badge` cover the parts. There is no Block that states, per destination, where the community is and whether it is currently active.
- **Evidence**: <https://www.shadcnblocks.com/blocks/community>, 2026-09-28.

### reviews
- **User problem**: I want to read what buyers said, filtered by the thing I care about, and see how much of it there is.
- **Business problem**: Review surfaces carry the quality signal that search results cannot, and the distribution shape of that signal is itself persuasive. A retailer without a review surface loses to one with it at equal price.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Table` carries the rows, `Accordion` the expansion, `Badge` the rating. What is missing is the aggregate: the average and the distribution, which the category explicitly pairs with the list.
- **Evidence**: <https://www.shadcnblocks.com/blocks/reviews>, 2026-09-28.

### industries
- **User problem**: I want to know whether this product understands the specific constraints of my sector.
- **Business problem**: Sector-specific framing is how a horizontal product reaches a vertical buyer, and it is how a company decides which segments to build for.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `ProductGrid01` gives the rows and `Accordion` the expand. What is missing is the expansion that swaps a per-sector description or image in place, which is a content-slot problem rather than a layout one.
- **Evidence**: <https://www.shadcnblocks.com/blocks/industries>, 2026-09-28.

### careers
- **User problem**: I want to see the open roles, what they are grouped by, and what each one actually is.
- **Business problem**: A careers surface is a recruiting surface. Grouping roles by department and filtering them is what turns a long list into an application funnel.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `ProductGrid01` and `FactList` give the rows and the metadata, and `Breadcrumb` gives the trail, but there is no Page that models a grouped and filterable role list.
- **Evidence**: <https://www.shadcnblocks.com/blocks/careers>, 2026-09-28.

## Cluster C: editorial publishing and technical content (9 categories)

### blog
- **User problem**: I want to see what this organisation has been thinking about, and find the pieces relevant to me.
- **Business problem**: A blog index is an acquisition surface and an SEO surface simultaneously. It is also how a company publishes the thinking that makes its sales claims checkable.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `BlogPostPage` ships, so the article exists. The index does not: there is no Page that takes a set of posts with authors and dates and filters them. `DESIGN.md` also records that the old `blog-layout` item never ships, which leaves the index genuinely unowned.
- **Evidence**: <https://www.shadcnblocks.com/blocks/blog>, 2026-09-28.

### blog-post
- **User problem**: I want to read one long piece comfortably, know who wrote it and when, and see what to read next.
- **Business problem**: The article is where a company's expertise is demonstrated. Getting the reading experience right is what keeps the traffic that acquired the visit.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: COVERED. `BlogPostPage` is a complete blog post screen with title, standfirst, byline carrying both a display and a machine date, the body at the measure, and a trail to the neighbouring posts. `Prose` holds the body to the measure.
- **Evidence**: <https://www.shadcnblocks.com/blocks/blog-post>, 2026-09-28.

### content
- **User problem**: I am reading a long document and I want to know what is in it and where I am, without losing my place.
- **Business problem**: Long-form documentation is where enterprise buyers self-educate. A navigable long document measurably increases the time to evaluation.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `DocsShell` is close: a rail whose shape arrives as data, the document at the measure, a contents rail and a derived pager. But `DocsShell` states two rules that content pages must break: a section carries no status, no count, no collapse and no sort, and a group with no index renders a label rather than a route. A content hub needs exactly those affordances, so the shell cannot be reused unchanged.
- **Evidence**: <https://www.shadcnblocks.com/blocks/content>, 2026-09-28.

### resources
- **User problem**: I want a library of material with enough metadata to judge whether a piece is worth opening.
- **Business problem**: A resources hub is how a company sells to people who are not ready to buy, and it is the surface a field team sends links from.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `ProductGrid01` can list and `Tabs` can filter, but there is no Page that models a resource library with category filtering, a featured entry and an author, and no Block for the resource card with its metadata.
- **Evidence**: <https://www.shadcnblocks.com/blocks/resources>, 2026-09-28.

### resource
- **User problem**: I want to read one guide with a trail back to where I found it, and a way to share it.
- **Business problem**: A single guide is the artefact a sales team emails. It has to survive being detached from the site and still look like the company.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `Prose`, `Breadcrumb` and `BlogPostPage` cover the body, the trail and the share affordance. What is missing is the guide-specific shell with a persistent topic rail.
- **Evidence**: <https://www.shadcnblocks.com/blocks/resource>, 2026-09-28.

### changelog
- **User problem**: I want to know what changed, when, and whether it affects me.
- **Business problem**: A changelog is the cheapest trust signal a software company can publish, and the cheapest defence when a customer reports something as new. It is also how an existing customer discovers a feature they would not have bought for.
- **Prism tier**: Components tier, shipping as a Block for the feed and a Page for a release.
- **Status**: GAP. `StatusLedger01` and `Badge` cover the status vocabulary. Prism has no changelog feed, no release grouping by date, and no release detail surface. Prism's own site has three changelog content directories, so the problem is live in this repository and unowned in the system.
- **Evidence**: <https://www.shadcnblocks.com/blocks/changelog>, 2026-09-28.

### download
- **User problem**: I want the software or the asset for my platform, at a version I can verify.
- **Business problem**: A download surface is a conversion surface and a support surface at once. Unclear platform targeting generates the single most common class of avoidable support ticket.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `FeatureGrid01` holds a grid of platform cards and `Badge` holds a version. What is missing is the version and checksum framing, which is a per-platform fact-list rather than a feature tile.
- **Evidence**: <https://www.shadcnblocks.com/blocks/download>, 2026-09-28.

### code-example
- **User problem**: I want to see how this is called, in my language, and copy it exactly.
- **Business problem**: For a developer-facing product the example is the documentation. Showing it in the reader's language removes a step from the first successful call.
- **Prism tier**: Components tier, shipping as a Component for the snippet and a Block for the layout.
- **Status**: GAP. `Kbd` marks a key and `Tabs` switches between options. Prism has no code surface, no copy affordance, and no language-tabbed snippet.
- **Evidence**: <https://www.shadcnblocks.com/blocks/code-example>, 2026-09-28.

### faq
- **User problem**: I have a specific question and I want it answered without asking anyone.
- **Business problem**: An FAQ absorbs support volume, reduces pre-purchase friction and, on a commerce site, measurably reduces returns.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: DEFERRED. `faq-01` is named in the v1.1 Block tail. `Accordion` ships today and carries the disclosure behaviour; the composed block and its categorised form do not exist.
- **Evidence**: <https://www.shadcnblocks.com/blocks/faq>, 2026-09-28.

## Cluster D: pricing and purchase decisions (4 categories)

### pricing
- **User problem**: I want to know what it costs, what I get at each level, and which level is right for me.
- **Business problem**: The pricing table is the highest-traffic, highest-stakes page in a self-serve product. Its job is to make the middle tier obvious, and that job is usually done by layout rather than by words.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Pricing01` is a plan comparison with one highlighted tier, which is the core decision mechanic. Missing: the billing period switch, the per-plan feature checklist as a first-class object, the comparison table beneath the cards, and the annual discount framing. `pricing-page` is separately named in the v1.1 Page tail.
- **Evidence**: <https://www.shadcnblocks.com/blocks/pricing>, 2026-09-28.

### rate-card
- **User problem**: I want a published price list with the terms attached, so I can decide without asking anyone for a quote.
- **Business problem**: A rate card is how a professional services firm removes the procurement bottleneck of an unknown price. Publishing one also anchors the negotiation.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Pricing01` carries the plan and `ProcessRail01` carries the steps. What is missing is the binding of a rate to the steps that produce it, which is the actual problem.
- **Evidence**: <https://www.shadcnblocks.com/blocks/rate-card>, 2026-09-28.

### deals
- **User problem**: I want the offer, the deadline and the conditions, without leaving what I am doing.
- **Business problem**: An interruption-based offer captures demand that a passive banner would not, and a tiered bundle raises average order value. It also carries a real risk of training customers to wait for discounts.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `Dialog`, `Popover` and `Badge` cover the parts. Prism has no offer surface and, more importantly, no announcement primitive that both announces an interruption and can be dismissed and remembered as dismissed.
- **Evidence**: <https://www.shadcnblocks.com/blocks/deals>, 2026-09-28.

### offer-modal
- **User problem**: I am mid-task and an offer appears; I want to judge it and get back to what I was doing.
- **Business problem**: An interrupt converts better than a banner and annoys more. Doing it well is a measurable revenue-versus-retention trade, which is why the surface is worth owning rather than rebuilding.
- **Prism tier**: Patterns.
- **Status**: PARTIAL. `Dialog` is the mechanics and `Popover` the lighter form. The missing part is the pattern itself: when to interrupt, how long to wait, how to remember a dismissal, and how to be quiet for a returning customer.
- **Evidence**: <https://www.shadcnblocks.com/blocks/offer-modal>, 2026-09-28.

## Cluster E: commerce discovery and merchandising (14 categories)

### ecommerce-hero
- **User problem**: I am shopping and the top of the page is the only place a featured collection or product can be sold.
- **Business problem**: Storefront real estate above the fold is the highest-value inventory a retailer has. It is also where seasonal merchandising is executed, so it has to be re-themeable without a release.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Hero01` covers the centred marketing hero. The commerce form adds a paired product card and a rotation, which is a content-shape difference rather than a layout one.
- **Evidence**: <https://www.shadcnblocks.com/blocks/ecommerce-hero>, 2026-09-28.

### product-categories
- **User problem**: I do not know what this shop sells and I need to navigate by category.
- **Business problem**: Category navigation is how a large catalogue stays browsable, and it is the structure search engines index. A retailer with categories outranks one without them.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `ProductGrid01` gives the rows and `Accordion` the grouping. Missing: the image-led category tile, which needs `aspect-ratio` and an image surface.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-categories>, 2026-09-28.

### product-list
- **User problem**: I want to see a set of products in a consistent format and act on any of them without leaving the list.
- **Business problem**: The listing is where a store's conversion rate is actually decided. Standardising it across teams is what stops a catalogue from becoming visually incoherent.
- **Prism tier**: Components tier, shipping as a Block for the grid and a Component for the tile.
- **Status**: PARTIAL. `ProductGrid01` gives the row form and `Card` gives the tile. What is missing is the product tile as a Component with the fields a shopper compares on: image, name, price, variant, availability.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-list>, 2026-09-28.

### product-card
- **User problem**: I want to judge one product from its tile: what it looks like, what it costs, what is in stock, and add it if it is right.
- **Business problem**: The product tile is the highest-repeated surface in any store. Every merchandising decision lands on it.
- **Prism tier**: Components tier, shipping as a Component.
- **Status**: PARTIAL. `Card`, `Badge` and `Button` are the parts. What is missing is the tile as one composed unit, including the hover-to-act affordance the category describes and the variant and rating signals.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-card>, 2026-09-28.

### product-detail
- **User problem**: I am deciding on one product and I need the full specification, the available variants, the reviews and a way to buy it.
- **Business problem**: The detail page is where a store either justifies a price or loses the sale to a competitor tab. It is also the page most likely to need a persistent buy control.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. The primitives exist in abundance: `Card`, `Accordion`, `RadioGroup`, `Select`, `Table`, `Tabs`, `Button`. There is no Page that assembles them into the decision surface this category describes.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-detail>, 2026-09-28.

### product-gallery
- **User problem**: I want to see a product from several angles, and enlarge one image when the thumbnail is not enough.
- **Business problem**: Visual confidence is the main driver of apparel and furniture return rates. A weak gallery surface is a returns cost centre.
- **Prism tier**: Components tier, shipping as a Component.
- **Status**: GAP. Prism has no image surface, no lightbox and no zoom. `carousel` and `aspect-ratio` are in the v1.1 tail; the composite is not planned.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-gallery>, 2026-09-28.

### product-quick-view
- **User problem**: I am browsing and I want to check a product's details without losing my place in the list.
- **Business problem**: Quick view measurably increases add-to-cart rate in list browsing, because it removes the navigation cost of curiosity. It is a direct revenue surface.
- **Prism tier**: Workflows.
- **Status**: PARTIAL. `Dialog` and `Popover` are the mechanics. The missing part is the workflow: what state the list keeps while the overlay is open, and what happens to focus on close.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-quick-view>, 2026-09-28.

### product-search
- **User problem**: I know what I want and I want to find it fast, from anywhere in the store.
- **Business problem**: Search is where a large catalogue's users actually go. A store with poor search does not have fewer searches, it has abandoned ones and an unsellable long tail.
- **Prism tier**: Components tier, shipping as a Component.
- **Status**: GAP. `command` and `combobox` are both named in the v1.1 Component tail, which means the primitives are committed. What is missing is the commerce-shaped overlay: results grouped, trending when empty, and a promoted row.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-search>, 2026-09-28.

### product-specs
- **User problem**: I want the full specification, grouped by kind, and I want to reach the part I care about without scrolling the whole thing.
- **Business problem**: Specifications are where a considered purchase is confirmed or abandoned, and they are the surface most often owned by a plugin that drifts from the design system.
- **Prism tier**: Components tier, shipping as a Component.
- **Status**: PARTIAL. `Table` gives the rows, `FactList` the term and value pairs, and `Accordion` and `Tabs` both give the grouping. What is missing is the specification group as a single unit with consistent headers across groups.
- **Evidence**: <https://www.shadcnblocks.com/blocks/product-specs>, 2026-09-28.

### shop-the-look
- **User problem**: I want to buy the whole outfit or the whole room, not just the one thing I looked at.
- **Business problem**: Bundle and collection surfaces raise average order value directly and reduce the decision cost of a coordinated purchase.
- **Prism tier**: Workflows.
- **Status**: GAP. The problem is coordination, not layout: several product references that must be selected, added and priced as one action. Prism ships no such unit and no part-selection state.
- **Evidence**: <https://www.shadcnblocks.com/blocks/shop-the-look>, 2026-09-28.

### wishlist
- **User problem**: I want to keep something for later, and be told when it becomes cheaper.
- **Business problem**: A wishlist is a retained-intent list. It is the highest-quality remarketing audience a retailer has and it predicts repeat purchase.
- **Prism tier**: Components tier, shipping as a Block, with a workflow behind it.
- **Status**: PARTIAL. `ProductGrid01` lists and `Badge` marks. The missing parts are the multi-list model, the price-drop signal, and the share action.
- **Evidence**: <https://www.shadcnblocks.com/blocks/wishlist>, 2026-09-28.

### banner
- **User problem**: Something changed that I need to know about, and I need to know without hunting for it.
- **Business problem**: A dismissible banner is the general-purpose announcement channel: incidents, maintenance, new navigation, a changed policy. Owning it centrally is what stops every team building their own.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Cta01` is a filled band and `Alert` is a static callout. Missing: the dismissal model and the persistent re-entry point, which is the whole reason a banner exists.
- **Evidence**: <https://www.shadcnblocks.com/blocks/banner>, 2026-09-28.

### promo-banner
- **User problem**: I want to know about a promotion, a delivery cutoff, or how close a sale is to ending, and how much is left.
- **Business problem**: Countdown and stock-pressure banners are the highest-volume merchandising surface in retail and the one with the clearest revenue attribution.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `Progress` gives a bar and `Badge` gives a label. There is no time-bound announcement primitive, and no way to express a running deadline without a consumer-owned timer.
- **Evidence**: <https://www.shadcnblocks.com/blocks/promo-banner>, 2026-09-28.

### social-media-trending
- **User problem**: I want to see what people are posting about this and buy from what I see.
- **Business problem**: User-generated content is the cheapest high-converting social proof a brand has, and shopping directly from it shortens the path from attention to order.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. Prism has no media surface at all, so every variant here is blocked on the same missing primitive as `gallery` and `product-gallery`.
- **Evidence**: <https://www.shadcnblocks.com/blocks/social-media-trending>, 2026-09-28.

## Cluster F: cart, checkout and order lifecycle (8 categories)

### ecommerce-navbar
- **User problem**: I want to reach any part of the store, and always be able to see what is in my cart.
- **Business problem**: The storefront bar is where navigation depth, category structure and cart state meet. A cart count that is stale or hidden is a direct conversion loss.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `SiteHeader` is a brand lockup, an optional product switcher, the site navigation and a slot for application controls. The missing parts are the mega-menu treatment and a first-class cart affordance with a count, which is exactly what the slot was designed to let a consumer supply.
- **Evidence**: <https://www.shadcnblocks.com/blocks/ecommerce-navbar>, 2026-09-28.

### ecommerce-footer
- **User problem**: I want the secondary destinations, especially policy, delivery and returns, which I will need before I need the primary ones.
- **Business problem**: The footer is where a store puts the links that reduce disputes. It is also the last surface a shopper sees before leaving, and a place for the retention offer.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `SiteFooter` is a brand lockup, grouped destinations, off-site links and a slot for the legal line. The commerce additions are a newsletter capture and payment and delivery marks.
- **Evidence**: <https://www.shadcnblocks.com/blocks/ecommerce-footer>, 2026-09-28.

### shopping-cart
- **User problem**: I want to see what I have chosen, change the quantities and variants, and know what it will cost.
- **Business problem**: The cart is where hesitation becomes a decision. Any friction here, and especially any uncertainty about the total, costs orders at the last possible moment.
- **Prism tier**: Workflows.
- **Status**: PARTIAL. `ProductGrid01` lists the lines, `Table` gives structure, `Badge` the availability, `Dialog` and `Popover` the sheet and the mini-cart. What is missing is the cart as a unit: line mutation, quantity step, removal with undo, and the shipping-progress signal.
- **Evidence**: <https://www.shadcnblocks.com/blocks/shopping-cart>, 2026-09-28.

### checkout
- **User problem**: I want to enter my details once, see clearly what I am buying, and pay without being asked for anything twice.
- **Business problem**: Checkout is the highest-scrutiny screen in commerce and where every avoidable field costs money. It is also the most regulated: it collects address data under consent rules that differ by jurisdiction.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `Field`, `Input`, `Select`, `RadioGroup`, `Checkbox` and `Accordion` cover the controls, and `AuthForm01` is a proven precedent for a card-shaped form with labelled fields, a remember control and an error slot. What is missing is the Page: the sectioned step model, the saved-versus-new address choice, and the summary that stays visible.
- **Evidence**: <https://www.shadcnblocks.com/blocks/checkout>, 2026-09-28.

### order-summary
- **User problem**: I have just paid and I want to see exactly what I bought, what it cost, and where it is going.
- **Business problem**: The confirmation is where chargeback disputes are won or lost. A summary the customer can point at is the first line of defence.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `FactList` gives the totals, `Table` the lines, `Badge` the state. The confirmation as a composition, with the delivery address and the state, does not exist.
- **Evidence**: <https://www.shadcnblocks.com/blocks/order-summary>, 2026-09-28.

### order-history
- **User problem**: I want to find a past order and see where it has got to, and what I can still do about it.
- **Business problem**: Order history is a self-service support surface. Every question it answers is a ticket not raised, and it is where repeat purchase starts.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `Table`, `Tabs`, `Pagination` and `Badge` cover the mechanics completely. What is missing is the Page, and in particular per-line status, which is the thing a customer actually asks about.
- **Evidence**: <https://www.shadcnblocks.com/blocks/order-history>, 2026-09-28.

### payment-methods
- **User problem**: I want to see the cards I have saved, which is the default, and change or remove one safely.
- **Business problem**: Stored payment methods are the single largest driver of repeat purchase in retail. Managing them badly causes both failed charges and chargebacks.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `RadioGroup` chooses, `Badge` marks the default, `Card` gives the surface. What is missing is the unit: a payment method with its expiry, its default state and its edit affordance, kept in one place.
- **Evidence**: <https://www.shadcnblocks.com/blocks/payment-methods>, 2026-09-28.

### live-purchase
- **User problem**: I want to see that other people are buying right now, which tells me the product is worth buying.
- **Business problem**: Social proof in its most immediate form. It raises conversion, and it is also a place where a dishonest implementation destroys trust permanently.
- **Prism tier**: Foundations for the framing, Workflows for the behaviour.
- **Status**: GAP. The relevant decision already exists in this repository: `DESIGN.md` records a fourth Kind, working title `live`, for surface whose content changes without a navigation event, and names an event log surface and run controls as its contents. The `live` Kind is not in `CATALOG_KINDS`. So the problem is identified and the surface is deliberately not built, and the reasoning is that the consumer owns the socket and the transport.
- **Evidence**: <https://www.shadcnblocks.com/blocks/live-purchase>, 2026-09-28; `DESIGN.md` "Known Open Items", this repo, 2026-09-28.

## Cluster G: identity and access (10 categories)

### signup
- **User problem**: I want to create an account, ideally with a provider I already trust, and know what I am agreeing to.
- **Business problem**: Signup is the top of the activation funnel. Every additional field and every unaddressed doubt costs completed accounts, and it is also where the consent record for marketing and privacy is created.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `AuthPage` is a full authentication screen composing a sign-in form with an optional supporting card, and `AuthForm01` is a card with labelled credential fields, a remember control and an error slot. The catalogue names `AuthPage` as a sign-in screen, so registration is the stated residual rather than an oversight: there is no multi-field registration form and no social provider grouping.
- **Evidence**: <https://www.shadcnblocks.com/blocks/signup>, 2026-09-28.

### login
- **User problem**: I want to get back into the product quickly, including with a provider I already use.
- **Business problem**: Login friction is abandonment. Provider sign-in also lowers support volume and reduces credential handling.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: COVERED. `AuthPage` and `AuthForm01` are exactly this, including the error slot that a failed sign-in needs. The provider-button grouping is a composition a consumer can build from `Button`, and `Kbd` covers the credential hint.
- **Evidence**: <https://www.shadcnblocks.com/blocks/login>, 2026-09-28.

### magic-link
- **User problem**: I do not want to remember a password and I am willing to wait a few seconds for a link.
- **Business problem**: Passwordless sign-in removes the password reset queue entirely, which is a support-cost and security-posture win at once.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `AuthForm01` and `Input` carry the mechanics. What is missing is the two-state flow: the address request, then the sent state with the ability to change the address.
- **Evidence**: <https://www.shadcnblocks.com/blocks/magic-link>, 2026-09-28.

### forgot-password
- **User problem**: I have forgotten my password and I need a way to start recovering it without an account manager.
- **Business problem**: A self-serve recovery path is a support-cost reduction and a security requirement. A missing one is how accounts get abandoned permanently.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `AuthForm01` is a general credential form and does not model the sent-state confirmation that recovery requires. No Prism Item owns recovery.
- **Evidence**: <https://www.shadcnblocks.com/blocks/forgot-password>, 2026-09-28.

### reset-password
- **User problem**: I have the recovery link and I need to choose a password I will remember and that meets the rules.
- **Business problem**: Password policy has to be stated at the moment of choice, or users fail validation repeatedly and abandon.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `Field`, `Input` and `Alert` cover the parts, and `FieldError` covers a failed rule. The screen that assembles them and shows the rules list live does not exist.
- **Evidence**: <https://www.shadcnblocks.com/blocks/reset-password>, 2026-09-28.

### two-factor
- **User problem**: I am asked for a second factor and I want to enter it quickly, or use a recovery code when my authenticator is gone.
- **Business problem**: Two-factor is frequently a hard requirement in enterprise procurement. A surface that fails here locks out paying customers.
- **Prism tier**: Components tier, shipping as a Page, with `input-otp` as its primitive.
- **Status**: GAP. `input-otp` is named in the v1.1 Component tail. The pairing step and the recovery-code path are not owned by anything.
- **Evidence**: <https://www.shadcnblocks.com/blocks/two-factor>, 2026-09-28.

### passkey
- **User problem**: I want to sign in with a device credential and never type a password again.
- **Business problem**: Passkeys remove phishing and remove the reset queue together. They are also the answer to a security questionnaire.
- **Prism tier**: Components tier, shipping as a Component prompt with a Page around it.
- **Status**: GAP. The WebAuthn ceremony is consumer-owned by necessity, but the prompt state, the failure state and the explanation still need a surface, and none exists.
- **Evidence**: <https://www.shadcnblocks.com/blocks/passkey>, 2026-09-28.

### verify-email
- **User problem**: I signed up and I need to confirm the address is mine before I can go any further.
- **Business problem**: Unverified addresses are undeliverable addresses. The confirmation prompt is the difference between a contactable customer and a bounce, and it is the first thing a deliverability audit asks for.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. The prompt needs a code entry, a resend with a cooldown and a change-address path. `Input`, `Field` and `Alert` cover the parts; nothing assembles them.
- **Evidence**: <https://www.shadcnblocks.com/blocks/verify-email>, 2026-09-28.

### accept-invite
- **User problem**: Somebody has invited me to a workspace and I need to see which one, who invited me, and what I am joining before I accept.
- **Business problem**: The invite is the mechanism by which a seat is provisioned. Getting the context right is what stops a user accepting an invite into the wrong workspace.
- **Prism tier**: Workflows.
- **Status**: GAP. `AuthPage` can host the form and `ProductMark` and `FactList` can state the workspace, but the join decision and its consequences are unowned.
- **Evidence**: <https://www.shadcnblocks.com/blocks/accept-invite>, 2026-09-28.

### invite-user
- **User problem**: I want to add people to my workspace, in bulk, and see who has not yet accepted.
- **Business problem**: Invitation is a growth loop inside an account. The unaccepted state is also how an administrator discovers that onboarding has stalled.
- **Prism tier**: Workflows.
- **Status**: PARTIAL. `DataTable01` carries the member list with selection, `Dialog` and `Popover` the entry form, `Field` the addresses, `Avatar` and `Badge` the pending state. What is missing is the invite lifecycle as one unit: send, resend, revoke, and the copyable link.
- **Evidence**: <https://www.shadcnblocks.com/blocks/invite-user>, 2026-09-28.

## Cluster H: first-run and onboarding (2 categories)

### onboarding
- **User problem**: I have an account and I do not yet know what to do first, and I want the product to tell me rather than leave me to guess.
- **Business problem**: Activation is the step between signup and value, and it is where the majority of new accounts are lost. A guided first run shortens time to first value and reduces the support load that follows a bad first hour.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: DEFERRED. `onboarding-page` is named in the v1.1 Page tail. `Progress`, `Accordion` and `Field` cover the mechanics today. Note the tension worth resolving before it ships: a multi-step wizard is exactly the surface `DocsShell` refuses to be, because a step is a control and a progress indicator is a status, so an onboarding page cannot be a DocsShell composition.
- **Evidence**: <https://www.shadcnblocks.com/blocks/onboarding>, 2026-09-28; `DESIGN.md` "Known Open Items", this repo, 2026-09-28.

### waitlist
- **User problem**: The product is not available to me yet and I want to record my interest and know what happens next.
- **Business problem**: A waitlist is how a company sizes demand before it builds, and it is the cheapest possible list to acquire.
- **Prism tier**: Components tier, shipping as a Block or a Page.
- **Status**: GAP. `Field`, `Input` and `Button` cover the form and `Avatar` a social row. What is missing is the joined state and, where used, a truthful position in the queue.
- **Evidence**: <https://www.shadcnblocks.com/blocks/waitlist>, 2026-09-28.

## Cluster I: account, profile and preferences (7 categories)

### settings-profile
- **User problem**: I want to change my name, my picture and my preferences, and see the result before I save.
- **Business problem**: Profile data is used in every shared surface in the product. Letting a user control it reduces support requests and improves internal identification.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `SettingsPanel01` is a settings form grouped into sections of text, select and switch fields, which is most of it. Missing: the avatar and cover upload, and any preview of the change.
- **Evidence**: <https://www.shadcnblocks.com/blocks/settings-profile>, 2026-09-28.

### settings-members
- **User problem**: I want to see who has access, change what they can do, and remove the ones who have left.
- **Business problem**: Access administration is the core of enterprise administration and the most common source of a security finding. It is also where offboarding is done, often badly.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `DataTable01` gives the list with selection and `Avatar`, `Badge` and `Checkbox` the per-row facts. What is missing is the role change as a per-row control, and the bulk selection model this category explicitly calls for.
- **Evidence**: <https://www.shadcnblocks.com/blocks/settings-members>, 2026-09-28.

### settings-notifications
- **User problem**: I want to decide what I am told about and how, per category and per channel.
- **Business problem**: Notification volume is the top driver of email unsubscribes and of muted in-app alerts. Granular control protects the channel that carries the messages a business depends on.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: COVERED. `SettingsPanel01` grouped into switch fields is exactly the per-category model, `Switch` and `Checkbox` are the two answer types, and `SettingsPage` composes tabs of grouped settings forms. The one form not covered is the two-channel matrix where a row crosses two columns; that is a layout variant rather than a missing capability.
- **Evidence**: <https://www.shadcnblocks.com/blocks/settings-notifications>, 2026-09-28.

### settings-integrations
- **User problem**: I want to see what this product is connected to, whether the connection is healthy, and turn one off.
- **Business problem**: Integrations are where a customer's data lives. An admin needs to answer "what is this connected to and can I trust it" without writing a support ticket.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `SettingsPanel01`, `Switch` and `Badge` carry the list and its state. Missing: category navigation across a large set, search across connections, and any per-connection activity indicator.
- **Evidence**: <https://www.shadcnblocks.com/blocks/settings-integrations>, 2026-09-28.

### user-profile
- **User problem**: I want to see who somebody is, what they have done and how to reach them.
- **Business problem**: A profile is how an organisation's internal tools answer "who owns this" and "who do I ask". It is the surface that keeps accountability findable.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Avatar`, `FactList`, `Card` and `Tabs` cover the parts. What is missing is the profile as one composed unit, and in particular the case where the profile is a whole screen rather than a card in a list.
- **Evidence**: <https://www.shadcnblocks.com/blocks/user-profile>, 2026-09-28.

### address-book
- **User problem**: I have several addresses and I want to see them, choose a default, and edit one without leaving the page I am on.
- **Business problem**: Addresses are regulated personal data in most jurisdictions. Centralising them means one deletion path rather than many, and it is where wrong data causes failed deliveries and returns.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Dialog`, `Field`, `Input`, `Checkbox` and `Table` cover the mechanics. Missing: the address as a unit with a default state and an edit-in-place mode, which is a composition problem.
- **Evidence**: <https://www.shadcnblocks.com/blocks/address-book>, 2026-09-28.

### feedback
- **User problem**: I want to tell the people who built this what I think, quickly, without writing an essay.
- **Business problem**: In-product feedback is the cheapest research instrument a product has, and a rated prompt at the right moment is worth more than a survey. It is also where a product discovers that something is broken.
- **Prism tier**: Workflows, with Components as the mechanics.
- **Status**: PARTIAL. `Dialog`, `Field`, `Slider`, `RadioGroup` and `Textarea` cover the mechanics completely. What is missing is the workflow: when to ask, the multi-step shape, and how the response is attributed to a moment rather than to a person.
- **Evidence**: <https://www.shadcnblocks.com/blocks/feedback>, 2026-09-28.

## Cluster J: data, tables and analytics (5 categories)

### data-table
- **User problem**: I have many records and I need to find one, compare rows, act on a selection, and not lose my place.
- **Business problem**: The data table is the working surface of every operations product. When it is wrong, the product is wrong, because it is where the work happens.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: COVERED. `DataTable01` is a table section with a toolbar, filters, row selection and pagination; `Table` gives the semantic elements; `Pagination` moves between pages; `Checkbox` drives selection. The two behaviours the category names that Prism does not yet answer are expand-a-row and column sorting order, both of which are consumer concerns layered on the same surface.
- **Evidence**: <https://www.shadcnblocks.com/blocks/data-table>, 2026-09-28; Carbon's data table usage page names Expandable, Selectable, Searching, Sorting and Batch actions as the concerns of this surface, <https://carbondesignsystem.com/components/data-table/usage/>, 2026-09-28.

### dashboard
- **User problem**: I open the product and I need to know, in one screen, whether anything is wrong.
- **Business problem**: A dashboard is a product's first impression for daily users and its first screen for executives. It is where a user decides whether to trust the tool.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: COVERED. `DashboardPage` composes the app shell, a page header, a KPI row and a data table, and `AppShell01`, `PageHeader01`, `Stats01` and `DataTable01` are all present as the parts.
- **Evidence**: <https://www.shadcnblocks.com/blocks/dashboard>, 2026-09-28.

### chart-card
- **User problem**: I want one measure, plotted, with enough context to know whether the shape matters.
- **Business problem**: A chart card is how an analytics product turns a number into a judgement. The card is the unit that decides how much of a dashboard a reader can scan.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `InstrumentPanel01` is a titled bar with a state dot and a slot for the instrument, which is the shell; the plot itself is missing. `chart` is named in the v1.1 Component tail, so the primitive is committed and the card is not. Prism's token source already authors `chart-1` through `chart-5` and the contrast gate already asserts that no two series resolve to the same value in any pack or mode, so the colour half of the answer is done and the surface half is not.
- **Evidence**: <https://www.shadcnblocks.com/blocks/chart-card>, 2026-09-28; `DESIGN.md` "Token Contract", this repo, 2026-09-28.

### chart-group
- **User problem**: I want several related measures together so I can see the relationship, not each one alone.
- **Business problem**: A single chart is a fact and a group is a conclusion. Products that only ship single charts push the correlation work onto the user's own spreadsheets.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP, blocked on the same missing primitive as `chart-card`, and additionally on the period and preset control this category pairs with the charts. `date-picker` and `calendar` are in the v1.1 tail.
- **Evidence**: <https://www.shadcnblocks.com/blocks/chart-group>, 2026-09-28.

### leaderboard
- **User problem**: I want to see how I rank against other people and by how much.
- **Business problem**: A leaderboard is a retention mechanism wherever there is a goal and a peer group: sales, challenges, learning, communities. It is also an internal transparency tool.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `DataTable01` gives the ranked rows and `Progress` the share of a total, and `Avatar` the person. What is missing is the rank expression itself, which is what makes a leaderboard a leaderboard.
- **Evidence**: <https://www.shadcnblocks.com/blocks/leaderboard>, 2026-09-28.

## Cluster K: records, projects and work tracking (7 categories)

### crud-companies
- **User problem**: I need to create a record, find it again, correct it, read it in full and eventually remove it.
- **Business problem**: The record lifecycle is the backbone of every admin tool. Done inconsistently it is the reason an admin product feels unfinished, and it is where bulk and destructive actions need care.
- **Prism tier**: Patterns.
- **Status**: PARTIAL. `DataTable01`, `Table`, `Dialog`, `Field`, `Input` and `Select` cover list, create and detail between them. What is missing is the pattern that names the lifecycle and states the rules that travel with it: which actions are destructive, which require confirmation, and how a detail view relates to the list it came from.
- **Evidence**: <https://www.shadcnblocks.com/blocks/crud-companies>, 2026-09-28.

### project
- **User problem**: I am reading about one piece of work and I want the whole account: what it was, who was involved, what came out of it.
- **Business problem**: A project detail page is how a studio, an agency or an internal team proves the work. It is the artefact that wins the next commission.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `Prose` and `FactList` give the body and the metadata, and `Diagram` can state relationships. There is no Page that composes them, and no metadata column convention for credits and dates.
- **Evidence**: <https://www.shadcnblocks.com/blocks/project>, 2026-09-28.

### projects
- **User problem**: I want to see the body of work and narrow it to something relevant.
- **Business problem**: A portfolio index is the primary conversion surface for a creative or services business. Filterable portfolio browsing is how a visitor finds the relevant precedent instead of leaving.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `ProductGrid01` gives the rows and `Tabs` the grouping. What is missing is the Page and the project card, which needs an image surface and a year marker.
- **Evidence**: <https://www.shadcnblocks.com/blocks/projects>, 2026-09-28.

### todo-list
- **User problem**: I have tasks and I need to add them, order them, complete them, and know which are actually blocking me.
- **Business problem**: The task list is where a personal work surface proves itself weekly. If the list is pleasant to use it gets used; if not the work goes somewhere else and the tool loses the user.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: GAP. `Checkbox`, `Field`, `Input` and `Button` cover the row mechanics. What is missing is the list as a unit, including the split between open and completed, the priority or due expression, and the drag affordance the category describes.
- **Prism tier note**: `resizable` in the v1.1 tail is unrelated; nothing in the tail addresses the task list.
- **Evidence**: <https://www.shadcnblocks.com/blocks/todo-list>, 2026-09-28.

### help
- **User problem**: I am stuck and I want to send a question and know it reached someone.
- **Business problem**: A support request surface inside the product is where support volume becomes manageable. A contact form on the marketing site does not do this, because the reporter's context is not attached.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. `Field`, `Input`, `Textarea` and `Select` cover the form. What is missing is the request surface with its state, so a user can tell a submitted ticket from a lost one.
- **Evidence**: <https://www.shadcnblocks.com/blocks/help>, 2026-09-28.

### help-center
- **User problem**: I have a question and I want to search for the answer before I contact anyone.
- **Business problem**: Self-service deflection is the main lever on support cost, and the searchable help centre is where it happens.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: GAP. Blocked on the same missing search primitive as `product-search`, plus the category-and-article structure. `command` and `combobox` are in the v1.1 tail.
- **Evidence**: <https://www.shadcnblocks.com/blocks/help-center>, 2026-09-28.

### field-mapping
- **User problem**: I am importing data from somewhere else and I need to say which of their columns becomes which of my fields.
- **Business problem**: Data import is where a platform becomes usable on a customer's existing data, and it is also the most error-prone step in the product. A wrong mapping silently corrupts a customer's records.
- **Prism tier**: Workflows.
- **Status**: GAP. `Table` and `Dialog` cover the mechanics and `Alert` the failure state. What is missing is the mapping surface with per-column source and target selection, an unmatched-set state, and the preview of what will be produced. The same cluster of problems has a second form in this category: reconciling two versions of the same record, where the user must choose field by field and cannot simply overwrite.
- **Evidence**: <https://www.shadcnblocks.com/blocks/field-mapping>, 2026-09-28.

## Cluster L: integrations, platform and compliance (2 categories)

### integration
- **User problem**: I want to know what this connects to, and connect the one I need without reading documentation.
- **Business problem**: An integrations catalogue is a product's ecosystem, and it is the strongest single driver of adoption in a platform business. A company that cannot show its integrations cannot be evaluated against a competitor that can.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `StackGrid01` is a grid survey and `LogoStrip01` a line of marks. What is missing is the connect affordance and the category grouping, and in particular the state that says which of these are already connected.
- **Evidence**: <https://www.shadcnblocks.com/blocks/integration>, 2026-09-28.

### compliance
- **User problem**: I need to know whether this organisation meets the rules my organisation has to follow.
- **Business problem**: This surface is often a hard gate on enterprise revenue. Security questionnaires are the single largest source of lost B2B deals, and an answer published on the site shortens them.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: PARTIAL. `Badge` for certification marks, `FactList` for the specific controls, `NoteGrid01` for the practice list. What is missing is the block that binds a certification to its documentation, because a mark with no link to the evidence is the thing a reviewer rejects.
- **Evidence**: <https://www.shadcnblocks.com/blocks/compliance>, 2026-09-28.

## Cluster M: lead capture and sales conversations (2 categories)

### contact
- **User problem**: I want to ask a question or start a conversation, and I want to do it without finding the right email address first.
- **Business problem**: A contact surface is the top of the inbound funnel. It is also where consent for marketing and for privacy is recorded, which is a regulatory obligation rather than a design choice.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `AuthForm01` is the proven precedent for a card-shaped form with labelled fields and an error slot, and `Field`, `Input`, `Textarea` and `Select` cover the controls. What is missing is the Page and the multiple contact methods, so a visitor who wants to talk rather than type is not turned away.
- **Evidence**: <https://www.shadcnblocks.com/blocks/contact>, 2026-09-28.

### book-a-demo
- **User problem**: I want to see a time when someone is available and take one, without a back-and-forth over email.
- **Business problem**: For high-consideration sales this is the conversion mechanism. Removing scheduling friction from the highest-intent action is worth more than any other change to the funnel.
- **Prism tier**: Components tier, shipping as a Page.
- **Status**: PARTIAL. `AuthForm01` gives the form and `ProductGrid01` the logos. What is missing is the availability model, and the page that pairs a request with the reasons to book and the proof that the seller is credible.
- **Evidence**: <https://www.shadcnblocks.com/blocks/book-a-demo>, 2026-09-28.

## Cluster N: site chrome and navigation (5 categories)

### navbar
- **User problem**: I want to understand the shape of this site and move to any part of it, from anywhere.
- **Business problem**: Navigation is the site's information architecture made visible. When it is unclear, users leave, and the marketing team cannot tell which sections are working.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: COVERED. `SiteHeader` is the bar at the top of a product site: a brand lockup, an optional product switcher, the site navigation and a slot for application controls. The mega-menu treatment the category also names is a consumer composition over `DropdownMenu` and `Popover`, which both ship.
- **Evidence**: <https://www.shadcnblocks.com/blocks/navbar>, 2026-09-28.

### footer
- **User problem**: I want the secondary and legal destinations, and a way to tell that the organisation is real.
- **Business problem**: The footer carries the links that reduce disputes and the identity signals that reduce doubt. It is also the surface most likely to be rebuilt per site, so owning it centrally has direct maintenance value.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: COVERED. `SiteFooter` is a brand lockup, grouped destinations, the links that leave the site and a slot for the legal line.
- **Evidence**: <https://www.shadcnblocks.com/blocks/footer>, 2026-09-28.

### sidebar
- **User problem**: I am working in an application and I want the whole set of things I can do visible without a menu.
- **Business problem**: A persistent navigation rail is the difference between an application that feels operable and one that feels like a set of forms. It is the single most reused application layout.
- **Prism tier**: Components tier, shipping as a Component, with a Block for the application variants.
- **Status**: DEFERRED. `sidebar` is named in the v1.1 Component tail, and `AppShell01` already provides a desktop rail, a top bar and a mobile navigation sheet today. The named tail is worth noting carefully: Prism's token source already authors the whole `sidebar-*` family and the token contract names it, so the naming is committed and only the surface is outstanding.
- **Evidence**: <https://www.shadcnblocks.com/blocks/sidebar>, 2026-09-28; `DESIGN.md` "Colors" and "Token Contract", this repo, 2026-09-28.

### application-shell
- **User problem**: I open the product and I want to know where I am, what I can reach, and what my account is doing.
- **Business problem**: The shell is the frame every application screen inherits. Getting it wrong multiplies across every screen, which is why it is worth owning.
- **Prism tier**: Components tier, shipping as a Block.
- **Status**: COVERED. `AppShell01` is a navigation shell with a desktop rail, a top bar and a mobile navigation sheet.
- **Evidence**: <https://www.shadcnblocks.com/blocks/application-shell>, 2026-09-28.

### cookie-banner
- **User problem**: I want to know what is being stored about me and to agree, refuse or change my choice.
- **Business problem**: In most regulated markets this is a legal obligation, and consent state has to be provable. It is also a first-impression surface on every page, so it is worth getting right rather than bolting on.
- **Prism tier**: Components tier for the surface, Workflows for the preference model.
- **Status**: GAP. `Alert` gives the message, `Button` the actions and `Dialog` the deeper preference view. What is missing is the surface itself with the persisted, revisitable choice, which is a state problem rather than a layout one.
- **Evidence**: <https://www.shadcnblocks.com/blocks/cookie-banner>, 2026-09-28.

---

# Part 2: summary table

Retrieval date 2026-09-28 for every row. Status vocabulary is defined in Part 0.

| Category | Cluster | Prism tier | Status | Named existing Items |
| --- | --- | --- | --- | --- |
| about | A | Components (Block) | PARTIAL | NoteGrid01, StackGrid01, ProductGrid01 |
| accept-invite | G | Workflows | GAP | none |
| address-book | I | Components (Block) | PARTIAL | Dialog, Field, Input, Checkbox, Table |
| application-shell | N | Components (Block) | COVERED | AppShell01 |
| awards | B | Components (Block) | GAP | none |
| background-pattern | A | Foundations | GAP | none |
| banner | E | Components (Block) | PARTIAL | Cta01, Alert |
| bento | A | Components (Block) | GAP | none |
| blog | C | Components (Page) | PARTIAL | BlogPostPage |
| blog-post | C | Components (Page) | COVERED | BlogPostPage, Prose |
| book-a-demo | M | Components (Page) | PARTIAL | AuthForm01, ProductGrid01 |
| careers | B | Components (Page) | GAP | none |
| case-studies | B | Components (Block) | GAP | none |
| case-study | B | Components (Page) | GAP | none |
| changelog | C | Components (Block, Page) | GAP | StatusLedger01, Badge |
| chart-card | J | Components (Block) | GAP | InstrumentPanel01 |
| chart-group | J | Components (Block) | GAP | InstrumentPanel01 |
| checkout | F | Components (Page) | PARTIAL | Field, Input, Select, RadioGroup, Checkbox, Accordion, AuthForm01 |
| code-example | C | Components (Component, Block) | GAP | Kbd, Tabs |
| community | B | Components (Block) | GAP | Avatar, Badge |
| compare | B | Components (Block) | PARTIAL | Table, Accordion, Tabs, Badge |
| compare-products | B | Components (Block) | GAP | none |
| compliance | L | Components (Block) | PARTIAL | Badge, FactList, NoteGrid01 |
| contact | M | Components (Page) | PARTIAL | AuthForm01, Field, Input, Textarea |
| content | C | Components (Page) | PARTIAL | DocsShell, Prose |
| cookie-banner | N | Components, Workflows | GAP | Alert, Button, Dialog |
| crud-companies | K | Patterns | PARTIAL | DataTable01, Table, Dialog, Field |
| cta | A | Components (Block) | PARTIAL | Cta01 |
| dashboard | J | Components (Page) | COVERED | DashboardPage, AppShell01, PageHeader01, Stats01, DataTable01 |
| data-table | J | Components (Block) | COVERED | DataTable01, Table, Pagination, Checkbox |
| deals | D | Components (Block) | GAP | Dialog, Popover, Badge |
| download | C | Components (Block) | PARTIAL | FeatureGrid01, Badge |
| ecommerce-footer | F | Components (Block) | PARTIAL | SiteFooter |
| ecommerce-hero | E | Components (Block) | PARTIAL | Hero01 |
| ecommerce-navbar | F | Components (Block) | PARTIAL | SiteHeader |
| experience | A | Components (Block) | GAP | none |
| faq | C | Components (Block) | DEFERRED | Accordion; faq-01 in v1.1 tail |
| feature | A | Components (Block) | PARTIAL | FeatureGrid01, NoteGrid01 |
| feedback | I | Workflows, Components | PARTIAL | Dialog, Field, Slider, RadioGroup, Textarea |
| field-mapping | K | Workflows | GAP | Table, Dialog, Alert |
| footer | N | Components (Block) | COVERED | SiteFooter |
| forgot-password | G | Components (Page) | GAP | none |
| gallery | A | Components (Component, Block) | GAP | none |
| help | K | Components (Page) | GAP | Field, Input, Textarea, Select |
| help-center | K | Components (Page) | GAP | Accordion, Field; command, combobox in v1.1 tail |
| hero | A | Components (Block) | PARTIAL | Hero01, MarketingPage |
| incentives | A | Components (Block) | GAP | none |
| industries | B | Components (Block) | PARTIAL | ProductGrid01, Accordion |
| integration | L | Components (Block) | PARTIAL | StackGrid01, LogoStrip01 |
| invite-user | G | Workflows | PARTIAL | DataTable01, Dialog, Field, Avatar, Badge |
| leaderboard | J | Components (Block) | PARTIAL | DataTable01, Progress, Avatar |
| list | A | Components (Block) | PARTIAL | ProductGrid01, DataTable01, NoteGrid01 |
| live-purchase | F | Foundations, Workflows | GAP | StatusLedger01, InstrumentPanel01; `live` Kind decided, not built |
| login | G | Components (Page) | COVERED | AuthPage, AuthForm01, Kbd |
| logos | B | Components (Block) | COVERED | LogoStrip01; logo-cloud-01 in v1.1 tail |
| magic-link | G | Components (Page) | PARTIAL | AuthForm01, Input |
| navbar | N | Components (Block) | COVERED | SiteHeader |
| newsletter | A | Components (Block) | DEFERRED | newsletter-01 in v1.1 tail |
| offer-modal | D | Patterns | PARTIAL | Dialog, Popover |
| onboarding | H | Components (Page) | DEFERRED | onboarding-page in v1.1 tail; Progress, Accordion, Field |
| order-history | F | Components (Page) | PARTIAL | Table, Tabs, Pagination, Badge |
| order-summary | F | Components (Block) | PARTIAL | FactList, Table, Badge |
| our-story | A | Components (Block) | GAP | none |
| passkey | G | Components, Workflows | GAP | none |
| payment-methods | F | Components (Block) | PARTIAL | RadioGroup, Badge, Card |
| pricing | D | Components (Block) | PARTIAL | Pricing01; pricing-page in v1.1 tail |
| process | A | Components (Block) | PARTIAL | ProcessRail01 |
| product-card | E | Components (Component) | PARTIAL | Card, Badge, Button |
| product-categories | E | Components (Block) | PARTIAL | ProductGrid01, Accordion |
| product-detail | E | Components (Page) | GAP | Card, Accordion, RadioGroup, Select, Table, Tabs, Button |
| product-gallery | E | Components (Component) | GAP | none; carousel, aspect-ratio in v1.1 tail |
| product-list | E | Components (Block) | PARTIAL | ProductGrid01, Card |
| product-quick-view | E | Workflows | PARTIAL | Dialog, Popover |
| product-search | E | Components (Component) | GAP | command, combobox in v1.1 tail |
| product-specs | E | Components (Component) | PARTIAL | Table, FactList, Accordion, Tabs |
| project | K | Components (Page) | GAP | Prose, FactList, Diagram |
| projects | K | Components (Page) | PARTIAL | ProductGrid01, Tabs |
| promo-banner | E | Components (Block) | GAP | Progress, Badge |
| rate-card | D | Components (Block) | PARTIAL | Pricing01, ProcessRail01 |
| reset-password | G | Components (Page) | GAP | Field, Input, Alert |
| resource | C | Components (Page) | PARTIAL | Prose, Breadcrumb, BlogPostPage |
| resources | C | Components (Page) | GAP | ProductGrid01, Tabs, Avatar |
| reviews | B | Components (Block) | PARTIAL | Table, Accordion, Badge |
| service | A | Components (Page) | GAP | Prose, DocsShell |
| services | A | Components (Block) | PARTIAL | FeatureGrid01 |
| settings-integrations | I | Components (Block) | PARTIAL | SettingsPanel01, Badge, Switch |
| settings-members | I | Components (Block) | PARTIAL | DataTable01, Avatar, Badge, Checkbox |
| settings-notifications | I | Components (Block) | COVERED | SettingsPanel01, Switch, Checkbox, SettingsPage |
| settings-profile | I | Components (Block) | PARTIAL | SettingsPanel01, Avatar |
| shader | A | Foundations | OUT | excluded by the motion doctrine |
| shop-the-look | E | Workflows | GAP | none |
| shopping-cart | F | Workflows | PARTIAL | ProductGrid01, Table, Badge, Dialog, Popover |
| sidebar | N | Components (Component, Block) | DEFERRED | AppShell01 today; sidebar in v1.1 tail |
| signup | G | Components (Page) | PARTIAL | AuthPage, AuthForm01 |
| skills | A | Components (Block) | GAP | StackGrid01 |
| social-media-trending | E | Components (Block) | GAP | none |
| stats | B | Components (Block) | PARTIAL | Stats01 |
| stats-card | B | Components (Block) | COVERED | Stats01, by recorded decision |
| team | B | Components (Block) | PARTIAL | ProductGrid01, Avatar, FactList |
| testimonial | B | Components (Block) | DEFERRED | testimonial-01 in v1.1 tail |
| timeline | A | Components (Component, Block) | GAP | none |
| todo-list | K | Components (Block) | GAP | Checkbox, Field, Input, Button |
| trust-strip | B | Components (Block) | PARTIAL | LogoStrip01, Badge |
| two-factor | G | Components (Page) | GAP | input-otp in v1.1 tail |
| user-profile | I | Components (Block) | PARTIAL | Avatar, FactList, Card, Tabs |
| verify-email | G | Components (Page) | GAP | Field, Input, Alert |
| waitlist | H | Components (Block, Page) | GAP | Field, Input, Button, Avatar |
| wishlist | E | Components (Block), Workflows | PARTIAL | ProductGrid01, Badge |

### Counts

| Status | Count |
| --- | --- |
| COVERED | 10 |
| PARTIAL | 51 |
| GAP | 41 |
| DEFERRED | 5 |
| OUT | 1 |
| **Total** | **108** |

### Where the categories fall by tier

| Tier | Categories |
| --- | --- |
| Foundations | background-pattern, shader, live-purchase (framing half) |
| Components | 92 |
| Patterns | crud-companies, offer-modal |
| Templates | none of the 108 is a template problem |
| Workflows | accept-invite, invite-user, feedback, quick-view, shopping-cart, shop-the-look, cookie-banner (state half), field-mapping, live-purchase (behaviour half) |

The concentration in the Components tier is itself the finding: the market's
taxonomy is overwhelmingly about *surfaces*, and almost nothing in it is about
*arrangements* or *journeys*. That is a gap in the market's vocabulary as much as
in Prism's, and it is the argument for the Patterns, Templates and Workflows work
`DESIGN.md` has already decided.

---

# Part 3: cluster analysis

Fourteen clusters, partitioned so that every category sits in exactly one and no
cluster is smaller than two categories or larger than eighteen.

The partition is driven by the **question the user is asking**, not by the industry
the page serves. That matters because it is what makes the clusters portable: the
same question gets the same answer regardless of whether the surface is a store, a
hospitality dashboard or a developer tool, and that reuse is the whole economic
argument for a shared design system.

| Cluster | Name | Categories | Count | The question it answers |
| --- | --- | --- | --- | --- |
| A | Marketing narrative and persuasion | hero, feature, cta, bento, background-pattern, shader, process, experience, about, our-story, gallery, incentives, timeline, list, newsletter, service, services, skills | 18 | Why should I care? |
| B | Proof, trust and reputation | testimonial, case-studies, case-study, team, awards, trust-strip, logos, stats, stats-card, compare, compare-products, community, reviews, industries, careers | 15 | Why should I believe you? |
| C | Editorial publishing and technical content | blog, blog-post, content, resources, resource, changelog, download, code-example, faq | 9 | What do you know about this? |
| D | Pricing and purchase decisions | pricing, rate-card, deals, offer-modal | 4 | What will this cost me and what do I get? |
| E | Commerce discovery and merchandising | ecommerce-hero, product-categories, product-list, product-card, product-detail, product-gallery, product-quick-view, product-search, product-specs, shop-the-look, wishlist, banner, promo-banner, social-media-trending | 14 | What do I want, and where is it? |
| F | Cart, checkout and order lifecycle | ecommerce-navbar, ecommerce-footer, shopping-cart, checkout, order-summary, order-history, payment-methods, live-purchase | 8 | I want it. Let me pay. |
| G | Identity and access | signup, login, magic-link, forgot-password, reset-password, two-factor, passkey, verify-email, accept-invite, invite-user | 10 | Who am I, and am I allowed? |
| H | First-run and onboarding | onboarding, waitlist | 2 | What do I do first? |
| I | Account, profile and preferences | settings-profile, settings-members, settings-notifications, settings-integrations, user-profile, address-book, feedback | 7 | How do I make this mine? |
| J | Data, tables and analytics | data-table, dashboard, chart-card, chart-group, leaderboard | 5 | What is happening in my business? |
| K | Records, projects and work tracking | crud-companies, project, projects, todo-list, help, help-center, field-mapping | 7 | What is the work, and where did I leave it? |
| L | Integrations, platform and compliance | integration, compliance | 2 | What does this touch, and is it safe? |
| M | Lead capture and sales conversations | contact, book-a-demo | 2 | I want to talk to someone. |
| N | Site chrome and navigation | navbar, footer, sidebar, application-shell, cookie-banner | 5 | Where am I, and how do I move? |

## Why fourteen and not fewer

Clusters G, F and J are each internally irreducible. G has ten distinct problems
because credential recovery, second factors, device credentials and email
confirmation fail in different ways and each has its own failure state. F has
eight because navigation, browsing, cart, payment entry, confirmation, history and
stored methods are separate problems with separate failure modes. J has five
because the table, the dashboard, the single measure, the measure group and the
ranking are genuinely different reading tasks.

Merging G and I into one "account" cluster would produce twenty categories with no
internal structure, which is the test that fails: a cluster nobody can subdivide is
a shelf, not a partition.

## Why fourteen and not more

Fifteen is the largest defensible number, and it splits **Cluster M** in two. Contact
and book-a-demo are both top-of-funnel lead capture, but the second is a scheduling
problem and the first is a contact-details problem, and they diverge on whether the
outcome is a booked time or a returned message.

The split is not worth making, because the shared answer is one composed form over
the same primitives and no new Item falls out of it. That is the criterion used
throughout: **a split earns its place only if it yields a different Prism Item.** On
that test, fourteen is right and fifteen is one too many.

## Two clusters that are really cross-cutting

**Cluster A** (18) and **Cluster B** (15) together are 33 of 108 categories, and they
are both answers to the same two questions: attention and credibility. What makes
them separate is that A is composed by the seller about the product and B is
composed of statements by third parties. A founder writes a hero; a customer writes
a testimonial. The distinction matters to Prism because it determines who owns the
content, and therefore whether the Item takes copy as props or takes an attributed
record as data.

Note also that A contains both `background-pattern` and `shader`, which are
decoration rather than communication. They sit in A because they are used to serve
the persuasion question, and both are recorded as gaps or exclusions for that
reason rather than because decoration was overlooked.

---

# Part 4: the gap list

## Well covered: three areas

**Site chrome (Cluster N), 5 categories, 4 covered or deferred.**
`SiteHeader` answers `navbar`. `SiteFooter` answers `footer`. `AppShell01` answers
`application-shell`. The `sidebar` Component is named in the v1.1 tail and Prism's
token source already authors the entire `sidebar-*` family, so only the surface is
outstanding. The one real gap is `cookie-banner`, which needs a persisted and
revisitable preference rather than a layout.
This is the strongest area of Prism's coverage and it is the area with the best
reuse: chrome is identical across every consumer site.

**Data and analytics (Cluster J), 5 categories, 2 covered.**
`DataTable01` with `Table`, `Pagination` and `Checkbox` answers `data-table` fully.
`DashboardPage` with `AppShell01`, `PageHeader01`, `Stats01` and `DataTable01`
answers `dashboard` fully. The remaining three are blocked on a single missing
primitive, `chart`, which is already in the v1.1 tail. Notably, Prism's colour half
of the chart answer is **done**: `chart-1` through `chart-5` are authored semantic
tokens and the contrast gate already asserts that no two series resolve to the same
value in any pack or mode and prints the tightest pair. The tokens exist and the
surface does not, which is an unusually favourable position.

**Proof of identity (Cluster G, partly), 10 categories, 1 covered.**
`AuthPage` and `AuthForm01` answer `login`. Everything else in the cluster is open,
and the open part is not a styling problem: `forgot-password`, `reset-password`,
`two-factor`, `passkey` and `verify-email` are five small screens that differ only in
their label text, their field set and their two-state flow, and they all want the
same shape. `magic-link` is the same two-state shape. That is a genuine opportunity
for one Parametric Page answering six categories, and it is the single highest-leverage
identity finding in this survey.

## Partially covered: four areas

**Settings and account (Cluster I), 7 categories, 1 covered, 6 partial.**
`settings-notifications` is covered because `SettingsPanel01` grouped into switch
fields *is* that problem. The other six are partial for the same underlying reason:
each is a small unit the catalogue composes from existing Items but does not itself
own. `settings-members` is the most valuable, because per-row role control and bulk
selection are behaviours rather than layouts and they are what an enterprise
administrator actually needs.

**Editorial (Cluster C), 9 categories, 1 covered, 1 deferred, 1 partial-by-design, 6 open.**
`blog-post` is covered by `BlogPostPage` and `faq` is deferred as `faq-01`. The
interesting constraint is `content`: `DocsShell` cannot be reused for a content hub
because `DESIGN.md` states that a section carries no status, no count, no collapse
and no sort, and that a group with no index renders a label rather than a route. A
content hub needs exactly those affordances. This is a deliberate Prism rule meeting
a real product need, and it should be resolved by a new Page rather than by
loosening the rule.

**Marketing narrative (Cluster A), 18 categories, 0 covered, 1 deferred, 8 partial, 8 gaps, 1 excluded.**
This is Prism's weakest large area and the one where the catalogue is most
marketing-shaped. `Hero01`, `FeatureGrid01`, `Cta01` and `ProcessRail01` are all
strong items, and `MarketingPage` composes four of them, but each exists in exactly
one layout. The market's taxonomy has 313 `feature` variants and 285 `hero`
variants, which tells you the real problem is not the block but the **variant
problem**: how a system expresses a small number of layouts honestly instead of
shipping two hundred forty near-identical blocks. Prism has no answer for that yet,
and `PRODUCT.md` explicitly refuses to be "a mirror of a large upstream catalogue",
which is the right position and also the hard one.

**Commerce (Clusters E and F), 22 categories, 0 covered.**
Nothing is covered, nothing is partial enough to be called close, and this is the
largest single block of unmet demand in the survey. Six Block categories and five
Page categories have no answer. The most concentrated sub-problem is the **product
unit**: `product-card`, `product-list`, `product-detail`, `product-gallery`,
`product-specs`, `wishlist` and `shop-the-look` all need one coherent product record
expressed consistently, and Prism has `ProductMark` and `ProductGrid01` but no
product-as-a-component. Every one of those seven is blocked on that single unit.

## Entirely uncovered: five areas

**Commerce end to end (22 categories, 0 covered).**
Named above. Worth stating plainly: a retail or marketplace product built on Prism
today would have to author its own product tile, product detail, cart, checkout,
order confirmation, order history, payment method management, search overlay,
gallery and comparison table. That is roughly a quarter of a store's UI, and it is
the clearest single case for a domain layer above Blocks.

**Identity and recovery (9 of 10 categories uncovered).**
Named above. One Page shape would answer six.

**Editorial and support surfaces (`changelog`, `resources`, `resource`, `content`,
`code-example`, `download`, `help`, `help-center`, 8 open).**
Notable because Prism's own documentation site has three changelog content
directories at `apps/site/content/changelogs/`, so `changelog` is a problem this
repository already has and has not given to the system.

**Analytics surfaces (`chart-card`, `chart-group`, 2 open).**
Blocked on one deferred Component. Cheapest large win in the survey: one primitive
unlocks two Blocks and completes the third cluster.

**Projects and work tracking (`project`, `projects`, `todo-list`, `help`,
`help-center`, `field-mapping`, `crud-companies`, `experience`, `our-story`,
`awards`, `incentives`, `skills`, `changelog`, `careers`, `case-study`, 15 open
across K, A and B).**
The record lifecycle is the through-line. `crud-companies` is classified as a
**Pattern**, not a Block, and that is the right call: list, create, detail and
destroy is a sequence that Prism documents and the consumer assembles from
`DataTable01`, `Dialog` and `Field`. One well-written Pattern would answer
`crud-companies`, `settings-members`, `projects` and `invite-user` at once.

## Two gaps the 108 do not name at all

These came from the AI, agentic and enterprise documentation information
architectures in the source table, not from the category listing. They are listed
here because their absence from a 108-category commercial taxonomy is itself a
finding.

**The agentic surface has no category.** None of the 108 names a run, a tool call,
an approval, a trace or a cost. The agentic documentation I read divides the
territory into capabilities, production, observability and deployment
(<https://docs.langchain.com/oss/python/langgraph/overview>), into build, scale,
secure and generative UI (<https://ai-sdk.dev/docs/introduction>), and into tool
workflows, performance and quality, cost and throughput, safety and governance, and
operations (<https://platform.openai.com/docs/guides/agent-builder>). That is a
consistent set of problems appearing across three independent sources and absent
from this taxonomy.
Prism has already identified part of it: `DESIGN.md` decides a fourth Kind,
`live`, and names an event log surface, a tool-call ledger, status tiers and run
controls as its contents. What is missing from that decision is the surface that
does **not** change in place, namely the run history, the approval queue and the
cost ledger. Naming them now would be the point of expanding into Workflows.

**Enterprise control has no category.** None of the 108 names an audit trail, a
role or permission matrix, a retention or deletion control, or a consent record.
`compliance` is the nearest, and it is a marketing surface about certifications
rather than a product surface about access. For an enterprise design system this is
the largest hole in the survey, and it is not visible because the commercial
taxonomy is built for self-serve buyers who are assumed to be individuals.

---

# Part 5: cross-cutting patterns

These recur across many categories. The point of listing them separately is that
each one is a case where **one Prism Item can serve a dozen categories**, which is
where the leverage is.

Ranked by number of the 108 that need them.

| Rank | Pattern | Categories needing it | Existing Prism coverage | Assessment |
| --- | --- | --- | --- | --- |
| 1 | Set navigation: search, sort, filter | data-table, product-search, help-center, dashboard, chart-group, blog, resources, projects, careers, settings-members, settings-integrations, product-list, wishlist, order-history, settings-notifications, product-categories | `Pagination` ships. No search, sort or filter primitive | **Highest leverage.** Two primitives, fifteen categories |
| 2 | Empty, loading and error states | every paged, filtered or fetched category: data-table, product-list, help-center, blog, resources, projects, search, invitations, orders | `Skeleton` and `Alert` ship; `empty-state-01` Block and `spinner` Component are deferred | Near-complete. The one to insist on is empty-state-01 as a Block, which `DESIGN.md` has already decided |
| 3 | Bulk selection and batch action | data-table, settings-members, invite-user, gallery, wishlist, products, settings-integrations, feedback | `Checkbox` ships. No batch action bar | **High leverage.** One Block answers eight categories. Carbon names Batch actions and Inline actions as concerns of the same surface |
| 4 | Destructive action confirmation | settings-members, order-history, payments, address-book, projects, field-mapping, integrations, account deletion, passkeys | `Dialog` ships; `alert-dialog` is deferred | Deferred already. The rule that matters is which actions require it and which do not |
| 5 | Responsive table to card collapse | data-table, order-history, settings-members, project, projects, products, reviews, help, address-book, product-list | `Table` ships with no collapse story | **Unowned.** `DESIGN.md` closes breakpoints at `lg` at 64rem, so the breakpoint exists and nothing expresses the transformation |
| 6 | Two-state sent and confirmed flow | magic-link, forgot-password, reset-password, verify-email, accept-invite, invite-user, newsletter, waitlist, feedback, book-a-demo, contact | none | **High leverage.** One pattern answers ten categories. All ten are "fill a field, then confirm something happened" |
| 7 | Identity and attribution | team, testimonial, reviews, blogs, changelog, case-studies, community, todos, leaderboard, comments, settings-members, user-profile | `Avatar` and `FactList` ship | **Highest leverage.** One Block, twelve categories. Nothing owns an attributed record with an avatar, a name, a timestamp and a role |
| 8 | Metadata line: date, author, category, reading time, count | blog, blog-post, resources, changelog, case-studies, careers, project, gallery, leaderboard, settings-members, downloads | `Kbd` for machine values, `Typography` for text. No metadata primitive | **High leverage.** One Component, twelve categories |
| 9 | Media surface: image with a known ratio, a carousel, a lightbox | gallery, product-gallery, product-card, project, projects, team, testimonial, case-studies, blog-post, ecommerce-hero, shop-the-look, social-media-trending, industries, download, product-categories | none. `carousel` and `aspect-ratio` are deferred | **Highest leverage.** Nothing owns an image at all, and fifteen categories are blocked on it |
| 10 | Rate, price and quantity with its unit | pricing, rate-card, product-card, product-detail, order-summary, product-list, stats, chart-card, incentives, promo-banner, leaderboard | none | **High leverage.** One Component, eleven categories. The rule that makes it safe is tabular numerals, which Prism already authors |
| 11 | Menu and overflow actions | data-table, dashboard, product-card, gallery, projects, team, blogs, settings, applications | `DropdownMenu` ships in full, with submenus, checkboxes and radio items | **Well covered.** The risk is over-use, not absence |
| 12 | Onboarding and progressive disclosure | onboarding, settings-profile, settings-integrations, payment-methods, product-detail, product-search, empty states, invite-user, address-book, newsletter | `Accordion` and `Progress` ship | Mostly the composition, which belongs in Patterns and Workflows rather than in a new Item |
| 13 | Notification and activity centre | settings-notifications, live-purchase, changelog, dashboard, alerts, order-status, invite-user, cookie-banner, feedback, team mentions | none | **Unowned and high value.** The nearest existing Items are `StatusLedger01` and `InstrumentPanel01`, which are read-only views rather than a feed |
| 14 | Permissions and role visibility | settings-members, teams, projects, compliance, integrations, sharing, agents | none | **Unowned and invisible in the 108.** See Part 4 |
| 15 | Audit trail | compliance, settings-members, settings-integrations, field-mapping, admin | `Timeline` would serve it and does not exist | **Unowned and invisible in the 108.** See Part 4 |
| 16 | Import and export with mapping | field-mapping, settings-integrations, orders, contacts, data-table, address-book | none | Partially visible, as `field-mapping`. Export has no home anywhere |
| 17 | Undo and reversible action | cart, settings, todos, address-book, products, orders, files | none | **Unowned.** The absence is what makes bulk actions feel dangerous |
| 18 | Time and range selection | chart-group, changelog, order-history, bookings, timelines, reports | `date-picker` and `calendar` are deferred | Deferred already, and more categories need them than the tail currently implies |

## The three to build first

**Media surface.** Fifteen categories are blocked on Prism having no image, no
carousel and no lightbox. `aspect-ratio` and `carousel` are already in the v1.1 tail,
so the primitives are committed, and the composite is worth one Component and one
Block. Nothing else in this survey has that ratio of blocked categories to work
required.

**Attributed record.** One Block carrying an avatar, a name, a timestamp and a role,
used by twelve categories. `Avatar` and `FactList` are the two halves and neither
Item joins them. This is the highest-leverage Block in the survey by category count.

**Two-state sent-and-confirmed.** Ten categories are the same flow. This is a
Pattern rather than an Item, which makes it cheap, and it is the clearest
demonstration of what the newly decided Patterns Section is for.

---

# Part 6: limitations

Read this section before acting on anything above.

## What was not read, deliberately

**No block or component source was fetched or read.** No registry payload under
`/r/`, no file from `raw.githubusercontent.com/shadcnblocks/**`, and no GitHub
repository content. Where a page HTML contained inline class attributes, they were
discarded without being read into the analysis and appear nowhere in this document.

**No code, CSS, prop names, API shapes, component identifiers, file structures,
documentation prose or assets were extracted or reproduced.** The only vendor text
used is the category name and the entry titles that appear as headings on the public
category listing pages, and even the entry titles were used only to understand which
user problem a category serves.

**No implementation, naming or architecture recommendation was taken from the
vendor.** Every Prism tier assignment, status and gap judgement in this document
was made against `packages/ui/src/catalog.ts` and `DESIGN.md` in this repository.

## What could not be accessed

Nothing on the vendor's side. All 108 category listing pages returned HTTP 200 and
all 108 slugs were confirmed against the category index, which lists them with their
block counts. The index count of 108 was independently reproduced by extracting the
category links from the page.

The public documentation surfaces all returned HTTP 200 and were read at the level of
their section headings. One URL, a Carbon batch-actions page, returned HTTP 404 and
was replaced by the batch-actions sections within the Carbon data table usage page,
which carries the same headings. That is a substitution, and it is recorded here
rather than hidden: the batch-actions guidance was read from the data table page, not
from a dedicated page.

## What is unverified

**The category taxonomy is a snapshot.** 108 slugs as at 2026-09-28. This is a
commercial catalogue and it changes; a category may be added, renamed or removed
without notice.

**The per-category block counts were read but not used as evidence.** A count says
how many variants exist, not what problem they solve, and several categories have
counterintuitive counts, such as `field-mapping` at two entries next to `faq` at
twenty-six. Nothing in this document rests on those counts.

**The purpose of each category is inferred from its name, its stated page purpose
and the titles of the entries listed under it.** The page-level purpose text is
templated and identical across categories, so it carries no information. The
inference is sound for unambiguous categories and weaker for the ambiguous ones.
The following were the hardest to place, and each placement is a judgement rather
than a reading: `list`, `content`, `resource`, `skills`, `timeline`, `experience`,
`incentives`, `field-mapping`, `live-purchase`, `social-media-trending`,
`banner` versus `promo-banner`, `service` versus `services`, `project` versus
`projects`, `case-study` versus `case-studies`, `help` versus `help-center`,
`resource` versus `resources`, `stats` versus `stats-card`.

**Category overlaps are real and the partition resolves them arbitrarily.**
`product-categories` and `product-list` could both sit in E or in a browse cluster.
`banner` and `promo-banner` differ by intent, not by structure, and both were placed
in E on the grounds that they are merchandising surfaces. A different partition
would move a dozen categories without changing any gap finding.

**No category was tested against a real product.** Every user and business problem
statement here is reasoned from the category's stated purpose and from product
documentation information architecture, not from user research. The reasoning is
expected to stand on its own, and it is not expected to be complete.

**Prism's coverage was judged against the working tree on 2026-09-28, not against
the published packages.** `packages/ui/src/catalog.ts` is the checked list, and
`DESIGN.md` records that the live roster is whatever `check-catalogue.mjs` reports.
If the working tree and the published packages have drifted, this document is
describing the tree.

**The 34, 19 and 7 counts were read from `packages/ui/src/catalog.ts` directly**
rather than taken from `DESIGN.md` prose, because `DESIGN.md` explicitly declines
to restate the roster and states that a stale count in prose is worse than no count.

**The two "gaps the 108 do not name" are findings about a commercial taxonomy, not
about the market.** An enterprise or agentic design system may well cover audit and
permissions thoroughly. What can be said is that a 108-category commercial block
catalogue aimed at self-serve buyers does not name them, which means the
requirements will arrive from specific consumers rather than from a shared
vocabulary.

## One thing worth flagging about method

The vendor's taxonomy is a useful instrument precisely because it is the market's
own list of what to build, gathered at scale and continuously maintained. Its
weakness is the mirror image of its strength: it is organised by *surface*, so it
has almost no vocabulary for arrangement, for state, for permissions, or for
machine behaviour. That is not a defect in the taxonomy, it is what a taxonomy of
blocks is. Reading it as a list of problems rather than as a list of blocks is what
makes it usable here, and it is why the Patterns, Templates and Workflows levels
matter more for Prism than any of the 108 categories do.
