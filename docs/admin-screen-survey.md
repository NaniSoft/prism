# Admin screen survey: the UI problems an admin product surface must solve

Author: a research subagent, commissioned as a read-only survey.
Retrieval date for every external URL in this document: **2026-10-07**.
Written against the Prism working tree at `C:\Users\dpven\source\repos\nanisoft\prism`.

## What this document is

A survey of the **admin screen space as a problem space**: which administrative
screens exist as a category of product surface, what the person using each one is
trying to do, and what the product owner cares about. Every screen is then judged
against the Prism surface that exists today and assigned a Prism tier.

The vendor's site is used here as a **taxonomy source only**: the navigation
structure of an admin kit, the list of screen titles and route slugs under each
section, and the one line each listing gives as a section's stated purpose.
Nothing was read from its source code, its component registry, its documentation
prose, its example code or its asset files, and nothing from it is reproduced
here. The private authenticated registry was not fetched at all. No rendered page
was re-created, and no screen's visual composition, element order, markup or
styling is restated anywhere below: a vendor listing names a screen, and this
document states the problem behind that name in its own words.

Every problem statement stands on its own: if the vendor disappeared tomorrow, the
reasoning for every row would be unchanged.

**This is a working input, not a record of a completed effort.** It lives in
`docs/` and not in `docs/history/` because the decision-map exercise it feeds has
not happened yet.

## Sources

| Source | URL | Retrieved | Used for |
| --- | --- | --- | --- |
| Admin Kit template listing | <https://www.shadcnblocks.com/template/admin> | 2026-10-07 | The kit's stated page count, its named sub apps, and its stated purpose for each sub app |
| Admin Kit sales and listing page | <https://www.shadcnblocks.com/admin-dashboard> | 2026-10-07 | The numbered enumeration of every screen title under each sub app, and the per sub app totals |
| Vendor Page category listing | <https://www.shadcnblocks.com/pages> | 2026-10-07 | Confirming that the admin screens sit in the Admin Kit and not in the vendor's separate Page category set, which is marketing only |
| Prism catalogue | `packages/ui/src/catalog.ts` in this repo | 2026-10-07 | The Components, Blocks, Pages and live Items that exist today, counted from the file |
| Prism vocabulary | `CONTEXT.md` in this repo | 2026-10-07 | Item, Kind, Component, Block, Page, Category, and the retired words this document avoids |
| Prism design record | `DESIGN.md` in this repo, including "Known Open Items" | 2026-10-07 | The five tiers, the `live` Kind as built, the Patterns, Templates and Workflows decision, the naming convention |
| Older taxonomy survey | `docs/history/taxonomy-survey.md` in this repo | 2026-10-07 | Its roster counts, which are stale, and its own finding that no commercial category names an agent surface |
| OpenAI platform docs, Agent Builder | <https://platform.openai.com/docs/guides/agent-builder> | 2026-10-07 | Agent surface vocabulary: workflow, typed node and edge, publish and version, preview run, trace grading, evaluation, deployment, safety |
| LangGraph and LangSmith docs overview | <https://docs.langchain.com/oss/python/langgraph/overview> | 2026-10-07 | Orchestration vocabulary: durable execution, streaming, human in the loop, persistence, tracing, evaluation, deployment, a visual builder |
| AI SDK docs introduction | <https://ai-sdk.dev/docs/introduction> | 2026-10-07 | Chat and generative surface vocabulary: a core call surface, a UI hook surface, a harness surface, and stream and response primitives consumed the same way by all three |
| Carbon data table usage | <https://carbondesignsystem.com/components/data-table/usage/> | 2026-10-07 | Cross cutting table concerns that recur across nearly every admin screen: selection, expansion, a batch action bar, a toolbar, an overflow menu, pagination, loading |

Which source is which: the two shadcnblocks pages are the single taxonomy source
and supply the screen inventory. The three agent and product documentation pages
are independent corroboration for the problem space, and each was chosen because
it names what an admin surface for a modern product has to do rather than because
it resembles the taxonomy source. Carbon is an independent design system
documentation source and supplies the cross cutting interaction vocabulary, not
the screen list.

## How to read the columns

**Screen** is the row's unit and it is a unit of the problem space, not a Prism
Kind. Prism has three catalogue Kinds and no fourth for this: a "screen" in this
document is what the market calls a page of an application, and the row says
which Prism answer it wants.

**Prism tier** is the level at which the problem's durable answer belongs. It uses
the five levels Prism names in `DESIGN.md`, not the catalogue Kind:

- **Foundations**: the answer is a token, a pack, a mode, a surface property or a
  decoration. No catalogue Item.
- **Components**: a focused, accessible, product agnostic export with one job.
  Where a Block or a Page is the right shape, the row says so, because Block and
  Page are Kinds and not tiers.
- **Patterns**: prose documentation of a recurring composition of Items. Not a
  catalogue Item, per the recorded decision.
- **Templates**: an arrangement of Pages, declared as data and checked against the
  catalogue by one gate.
- **Workflows**: a multi screen user journey, owned by the consumer. Documented,
  never shipped, because Prism never fetches and never imports a router.

**Status** is one of five values:

| Status | Meaning |
| --- | --- |
| COVERED | An existing Item answers the problem as the listing states it |
| PARTIAL | Existing Items take it most of the way; the residual is real and nameable |
| GAP | Nothing today answers it |
| DEFERRED | Named in a `DESIGN.md` tail that has not shipped |
| OUT | Excluded by a recorded Prism rule rather than by oversight |

**Nearest existing Prism Block or Page** names the closest Item by identifier, or
"none" when no Item comes close. A Component is not listed here even when it
supplies the mechanics, because the question is whether a shipped Block or Page
already carries this problem.

**Candidate Prism name** is given for every GAP and every PARTIAL, in the kebab
spelling the catalogue uses, with the exported name following the same convention
(`data-table-01` exports as `DataTable01`, `dashboard-page` as `DashboardPage`).
The name is a proposal for the decision-map exercise, not a decision, and two
naming questions it cannot answer on its own are listed in the final section.

## Roster counted from source

Counted from `packages/ui/src/catalog.ts` on 2026-10-07 by reading the `kind`
discriminator on every entry, not from prose anywhere.

**Components, 132:** Button, CtaLink, Badge, Card, Section, Breadcrumb,
Pagination, Field, Input, Textarea, Alert, Skeleton, LiveRegion, Separator,
Spinner, Toast, Command, Combobox, Calendar, DatePicker, InputGroup, NumberField,
OneTimeCode, Label, Form, ChartFrame, Sidebar, Item, ScrollArea, AspectRatio,
Carousel, Toggle, ToggleGroup, NativeSelect, ButtonGroup, TableSort, Diff,
Timeline, Table, Typography, Kbd, Mark, Tree, Diagram, PulseGraph, PulseSeries,
SignalField, ProductMark, Prose, FactList, ProductSwitcher, Select, Checkbox,
RadioGroup, Switch, Slider, Progress, AlertDialog, Collapsible, ContextMenu,
HoverCard, Menubar, NavigationMenu, Resizable, Sheet, CommandPalette, Meter,
Tooltip, Accordion, Dialog, DropdownMenu, Popover, Tabs, Avatar, SearchDialog,
Metric, Status, Price, RelativeTime, Sparkline, ContributionGraph, Chart,
CodeBlock, Lightbox, Steps, SearchField, PasswordField, TagGroup, Dropzone,
FileUpload, MiniCalendar, ListPanel, DataToolbar, FilterPanel, AvatarGroup,
PackSwatch, Announcement, ModeToggle, PackSwitcher, Pill, BillingSource, Drawer,
ImageZoom, VideoPlayer, EmojiPicker, RepoStars, ChoiceCard, IntensityGrid,
ProportionList, CohortGrid, MultiCombobox, CreatableCombobox, RangeField,
PlatformModifierKey, ImageListField, RepeatableRows, TextFormatToolbar,
PromptComposer, LifecycleButton, ReorderableList, Checklist, FormDialog,
FormWizard, StatefulTable, NestedTabs, MegaMenu, TaskProgress, SplitButton,
Stepper, OverflowActions, SelectionToolbar, MoneyField.

**Blocks, 119:** EmptyState01, Hero01, FeatureGrid01, Stats01, Pricing01, Cta01,
PageHeader01, DataTable01, SettingsPanel01, AuthForm01, AppShell01, ProcessRail01,
ProcessFlow01, RunConsole01, StatusLedger01, ProductGrid01, StackGrid01,
LogoStrip01, NoteGrid01, InstrumentPanel01, SiteHeader, SiteNavbar, SiteFooter,
Hero02, Hero03, FeatureRows01, Bento01, Showcase01, TrustStrip01, PricingCompare01,
Compare01, RateCard01, Offer01, Faq01, Testimonial01, LogoCloud01, Awards01,
Compliance01, Team01, MemberList01, CaseStudy01, About01, Story01, CaseStudies01,
Careers01, Industries01, Services01, ContentGrid01, ResourceList01, Changelog01,
CodeSample01, Gallery01, Download01, Newsletter01, Waitlist01, Feedback01,
Contact01, Consent01, Help01, Backdrop01, Trend01, FieldMap01, MilestoneTimeline01,
Integration01, Community01, ActivityFeed01, AddressBook01, AuditLog01, Calendar01,
ChartCard01, ChartGroup01, Dashboard01, Directory01, Gantt01, Handoff01, Inbox01,
Intake01, IssueDetail01, NotificationCenter01, IssueList01, Kanban01, Leaderboard01,
Onboarding01, OpsChecklist01, PermissionMatrix01, Project01, ProjectDashboard01,
Retention01, SettingsIntegrations01, SettingsMembers01, SettingsNotifications01,
SettingsSecurity01, Todo01, UserProfile01, AcceptInvite01, Account01,
BillingSource01, Bundle01, Capacity01, Delivery01, ForgotPassword01, History01,
InviteUser01, Login01, MagicLink01, Offering01, OfferingCategories01,
OfferingList01, Passkey01, Provisioning01, QuickView01, ResetPassword01,
Shortlist01, Signup01, SpecTable01, Summary01, TwoFactor01, VerifyEmail01.

**Pages, 17:** MarketingPage, DashboardPage, SettingsPage, AuthPage, NotFoundPage,
BlogPostPage, DocsShell, AboutPage, CareersPage, ChangelogPage, ContactPage,
ErrorPage, LegalPage, OnboardingPage, PricingPage, SearchPage, StatusPage.

**live, 2:** RunStream01, ToolLedger01.

**The discrepancy with `docs/history/taxonomy-survey.md` is stated rather than
hidden.** That document was written on 2026-09-28 and reports 34 Components, 19
Blocks and 7 Pages. Two of its three figures are now badly stale: Blocks went from
19 to 119 and Pages from 7 to 17. Its Components figure of 34 is also stale, and
the brief's own figure of 34 is the same stale number rather than a fresh count:
the file holds **132**. The survey document is left as it was written, because
`DESIGN.md` records that `docs/history/` holds a record as it was written and is
deliberately not edited to match today.

**Two further corrections to the brief this document was commissioned with.**
First, `DESIGN.md` does **not** now record the `live` Kind as decided and not
built. Its "Known Open Items" records the opposite: the Kind is built, the name
`live` is settled, `RunStream01` is the first Item of it, `ToolLedger01` is the
second, and it shipped as the breaking release `0.11.0`. Second, and consequent
on that, this document has not been asked to work around a decided-not-built
`live` Kind and does not: it treats streaming screens against a Kind that exists,
using the line `DESIGN.md` itself draws, that a surface which changes in flight
is `live` and a read mostly record which changes as a run completes is a Workflow.

**The v1.1 deferred tail is empty.** `DESIGN.md` records that it shipped in full
in 2026-09 and that v1.1 has no roster work left. There is consequently no
DEFERRED row anywhere in this document, and that is the state of the tree rather
than a judgement.

---

# Part 1: the screen records

Every row below comes from the numbered enumeration on the Admin Kit sales and
listing page, retrieved 2026-10-07, read for the screen titles and the section
totals only.

## Section A: ecommerce (34 screens)

Stated purpose, as the listing gives it: catalogue to shipping, covering
products, variants, orders, customers and shipping labels, with multi step forms
and typed records.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| `dashboard` 1 | I open the shop and need one view of whether it is trading | The owner decides stock and staffing from this and nowhere else | DashboardPage | Components (Page) | COVERED | none |
| `dashboard` 2 | I need the same view weighted toward money rather than volume | Different roles read the same shop differently, so one fixed summary hides half of them | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| `dashboard` 3 | I need the summary weighted toward inventory at risk | Stockouts are the loss a retailer cannot recover later | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| `dashboard` 4 | I need the summary weighted toward customers | A retailer that cannot see its repeat buyers cannot price for them | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| `dashboard` 5 | I need the summary weighted toward fulfilment | Orders in a stuck state are revenue already lost | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| `dashboard` 6 | I need the summary weighted toward suppliers | A retailer cannot answer a supplier question without this | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| `dashboard` 7 | I need the summary weighted toward discounts | Margin is invisible until someone assembles it | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| `dashboard` 8 | I need the summary weighted toward regions | A retailer expanding geographically has no view of where demand is | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| `dashboard` 9 | I need the summary weighted toward returns | Returns are the second largest cost in apparel and are usually untracked | Dashboard01 | Components (Block) | PARTIAL | `dashboard-02` |
| add product | I need to enter a new product completely, in one pass | The write path is where a catalogue actually gets built, and a broken one caps the whole store | none | Components (Block) | GAP | `product-form-01` |
| add product 2 | I need the same entry with variants and options | Variant depth is what separates a catalogue that sells from one that does not | none | Components (Block) | GAP | `product-form-02` |
| edit product | I need to change one product without recreating it | Re entry is how catalogue data decays | none | Components (Block) | GAP | `product-form-01` |
| edit product 2 | I need to edit a product's variants specifically | Editing one variant wrongly loses a whole line | none | Components (Block) | GAP | `product-form-02` |
| product detail 1 | I need to see everything about one product before changing it | Every merchandising decision is made on this one surface | QuickView01 | Components (Page) | GAP | `product-detail-page` |
| product detail 2 | I need the same record with its sales history beside it | A price change made without the history is a guess | QuickView01 | Components (Page) | GAP | `product-detail-page` |
| product list 1 | I need to see every product and act on any of them | The catalogue index is the highest repeated screen in a store | DataTable01 | Components (Block) | PARTIAL | `product-list-01` |
| product list 2 | I need the index with the fields a merchandiser compares on | Comparing on the wrong fields is how a range gets mispriced | DataTable01 | Components (Block) | PARTIAL | `product-list-01` |
| product list 3 | I need the index grouped by category | An ungrouped catalogue stops being navigable at a few hundred rows | DataTable01 | Components (Block) | PARTIAL | `product-list-01` |
| product list 4 | I need the index as a picture rather than a grid | Visual comparison is how apparel is bought | DataTable01 | Components (Block) | PARTIAL | `product-list-01` |
| add new order | I need to enter an order taken outside the store | Trade customers and phone sales are real revenue with no other capture path | none | Components (Block) | GAP | `order-form-01` |
| edit order | I need to change an order that already exists | Order changes are routine and are where disputes start | none | Components (Block) | GAP | `order-form-01` |
| order list 1 | I need to see every order and find the one I want | Fulfilment is a queue and the queue has to be readable | DataTable01 | Components (Block) | PARTIAL | `order-list-01` |
| order list 2 | I need the queue filtered by state | Working the queue means working one state at a time | DataTable01 | Components (Block) | PARTIAL | `order-list-01` |
| order list 3 | I need the queue filtered by date | Late orders are found by date, not by state | DataTable01 | Components (Block) | PARTIAL | `order-list-01` |
| order detail 1 | I need to see everything about one order | Every fulfilment decision is made here | Summary01 | Components (Page) | PARTIAL | `order-detail-page` |
| order detail 2 | I need the order with its customer beside it | Fulfilment fails on customer detail more often than on the order | Summary01 | Components (Page) | PARTIAL | `order-detail-page` |
| add customer | I need to enter a customer who bought in person | Walk in buyers are still customers and still drive returns and disputes | none | Components (Block) | GAP | `customer-form-01` |
| edit customer | I need to correct or enrich a customer record | Customer data quality decides segmentation quality | none | Components (Block) | GAP | `customer-form-01` |
| customer list 1 | I need to see every customer and act on any of them | The customer index is the spine of retention work | DataTable01 | Components (Block) | PARTIAL | `customer-list-01` |
| customer detail | I need one customer's orders, addresses and history | Every service conversation needs this in one place | UserProfile01 | Components (Page) | PARTIAL | `customer-detail-page` |
| create shipping label | I need to produce a label for a parcel | Labels are the last un automated step in most small stores | none | Components (Block) | GAP | `shipping-label-01` |
| edit shipping label | I need to correct a label after it is bought | A wrong address on a bought label is money already spent | none | Components (Block) | GAP | `shipping-label-01` |
| shipment list 1 | I need to see what is in transit | A store with parcels moving and no view of them cannot answer a customer | DataTable01 | Components (Block) | PARTIAL | `shipment-list-01` |
| shipment detail | I need one shipment's history and its events | Customers ask where a parcel is, and the answer is a chain of events | History01 | Components (Page) | PARTIAL | `shipment-detail-page` |

## Section B: project management (32 screens)

Stated purpose, as the listing gives it: one issue record powering a list, a
board, a timeline, a calendar, a grid and an inbox, with ranking, rescheduling
and inline editing.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| `dashboard` 1 | I open the project and need to know where it stands | A manager decides whether to intervene from this screen alone | ProjectDashboard01 | Components (Page) | COVERED | none |
| `dashboard` 2 | I need the same view weighted toward delivery dates | Slippage is invisible until it is summarised | ProjectDashboard01 | Components (Page) | PARTIAL | `project-dashboard-02` |
| `dashboard` 3 | I need the same view weighted toward who is loaded | Overallocating one person is the most common delivery failure | ProjectDashboard01 | Components (Page) | PARTIAL | `project-dashboard-02` |
| `dashboard` 4 | I need the same view weighted toward what is blocked | Blocked work ages silently and is the main cause of a missed date | ProjectDashboard01 | Components (Page) | PARTIAL | `project-dashboard-02` |
| project list 1 | I need to see every project and open one | The portfolio index is how a lead chooses what to fund | Project01 | Components (Page) | PARTIAL | `project-list-page` |
| project list 2 | I need the portfolio filtered by state | A portfolio cannot be read as one list without grouping | Project01 | Components (Page) | PARTIAL | `project-list-page` |
| project list 3 | I need the portfolio filtered by client | Agencies and consultancies work per client and cannot mix them | Project01 | Components (Page) | PARTIAL | `project-list-page` |
| project list 4 | I need the portfolio filtered by health | Status is a judgement and needs a place to be recorded | Project01 | Components (Page) | PARTIAL | `project-list-page` |
| project detail 1 | I need one project's whole state in one place | A project record scattered across tools is a project nobody can hand over | Project01 | Components (Page) | PARTIAL | `project-detail-page` |
| project detail 2 | I need the same project with its people and its budget | Utilisation and cost per project are the two numbers a sponsor asks for | Project01 | Components (Page) | PARTIAL | `project-detail-page` |
| team list 1 | I need to see the teams and what each owns | Team shape is an org decision that needs a visible record | MemberList01 | Components (Page) | PARTIAL | `team-list-page` |
| team list 2 | I need the teams as they will be staffed next quarter | Capacity planning is done here or nowhere | MemberList01 | Components (Page) | PARTIAL | `team-list-page` |
| team list 3 | I need to compare teams on delivery | Comparing delivery between teams is how process is improved | MemberList01 | Components (Page) | PARTIAL | `team-list-page` |
| member list 1 | I need to see everyone and what they are working on | Utilisation is the question every services business is asked | MemberList01 | Components (Page) | COVERED | none |
| member list 2 | I need to see capacity per person rather than per team | Capacity is only actionable at person granularity | MemberList01 | Components (Page) | PARTIAL | `member-list-page` |
| member list 3 | I need to see time actually logged against a person | Billable utilisation is a finance number with no other source | MemberList01 | Components (Page) | PARTIAL | `member-list-page` |
| issue list 1 | I need to see every issue and act on any of them | The issue index is where delivery work actually happens | IssueList01 | Components (Block) | COVERED | none |
| issue list 2 | I need the same issues filtered by owner | Working a queue means working one owner at a time | IssueList01 | Components (Block) | PARTIAL | `issue-list-02` |
| issue calendar | I need to see when work is due | A date view is the only way to see collisions between teams | Calendar01 | Components (Block) | COVERED | none |
| issue calendar 2 | I need to see the dates and drag work to a new one | Rescheduling is the most frequent edit in planning software | Calendar01 | Components (Block) | PARTIAL | `issue-calendar-01` |
| issue detail 1 | I need everything about one issue in one place | An issue read across three tools gets closed without being fixed | IssueDetail01 | Components (Block) | COVERED | none |
| issue detail 2 | I need the same issue with its whole history | A decision without its history gets relitigated | IssueDetail01 | Components (Block) | PARTIAL | `issue-detail-02` |
| issue kanban 1 | I need to see work by state and move it | Board is the format teams actually plan in | Kanban01 | Components (Block) | COVERED | none |
| issue kanban 2 | I need the board with ranked ordering inside a state | Ordering inside a state is how a team decides what is next | Kanban01 | Components (Block) | PARTIAL | `kanban-02` |
| issue kanban 3 | I need the board scoped to one person | A personal board is how an individual plans a week | Kanban01 | Components (Block) | PARTIAL | `kanban-02` |
| issue gantt 1 | I need to see dependencies and durations | Dependencies are what make a plan a plan | Gantt01 | Components (Block) | COVERED | none |
| issue spreadsheet | I need to see and edit many issues as a grid | Bulk editing is the reason planners outgrow a board | StatefulTable | Components (Block) | GAP | `record-grid-01` |
| inbox 1 | I need one place for everything waiting on me | An unread queue is how work gets lost between people | Inbox01 | Components (Page) | COVERED | none |
| inbox 2 | I need the inbox filtered by kind of work | One undifferentiated inbox is one undifferentiated day | Inbox01 | Components (Page) | PARTIAL | `inbox-02` |
| inbox 3 | I need the inbox filtered by project | Multi project work needs a per project queue | Inbox01 | Components (Page) | PARTIAL | `inbox-02` |
| inbox 4 | I need the inbox scoped to one assignee | Delegation is not visible without an assignee view | Inbox01 | Components (Page) | PARTIAL | `inbox-02` |
| inbox email 1 | I need to read a message thread beside the queue it came from | Half the work in an agency arrives by mail and is then rekeyed | Inbox01 | Components (Block) | PARTIAL | `inbox-mail-01` |

## Section C: payments and billing (36 screens)

Stated purpose, as the listing gives it: recurring revenue summaries,
subscriptions, invoice composition, and webhook delivery with retry.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| `dashboard` 1 | I open billing and need to know what arrived this month | Recurring revenue is the number the business is run on | Dashboard01 | Components (Page) | PARTIAL | `billing-dashboard-02` |
| `dashboard` 2 | I need the same weighted toward growth in recurring revenue | Growth is decided from a trend, not a total | Dashboard01 | Components (Page) | PARTIAL | `billing-dashboard-02` |
| `dashboard` 3 | I need the same weighted toward churn | Churn found late is churn not prevented | Dashboard01 | Components (Page) | PARTIAL | `billing-dashboard-02` |
| `dashboard` 4 | I need the same weighted toward failed payments | Failed payments are the largest recoverable revenue loss | Dashboard01 | Components (Page) | PARTIAL | `billing-dashboard-02` |
| `dashboard` 5 | I need the same weighted toward plan mix | Plan mix decides both price and support load | Dashboard01 | Components (Page) | PARTIAL | `billing-dashboard-02` |
| `dashboard` 6 | I need the same weighted toward tax and compliance | Tax liability is a legal obligation with a deadline | Dashboard01 | Components (Page) | PARTIAL | `billing-dashboard-02` |
| transactions | I need to see every movement of money in and out | A ledger a business cannot read is a ledger it cannot trust | DataTable01 | Components (Page) | PARTIAL | `transaction-list-page` |
| transactions list 2 | I need the same filtered by type and by date | Reconciliation is done in slices, not in one pass | DataTable01 | Components (Page) | PARTIAL | `transaction-list-page` |
| transaction detail | I need one movement and everything behind it | A disputed charge is answered from this one record | Summary01 | Components (Page) | GAP | `transaction-detail-page` |
| transaction detail 2 | I need the same movement with its raw processor record | Support and accounting disagree until the processor record is visible | Summary01 | Components (Page) | GAP | `transaction-detail-page` |
| customers | I need to see who owes money and who has paid | Credit exposure is the reason a finance team needs this screen | Directory01 | Components (Page) | PARTIAL | `customer-directory-01` |
| customers list 2 | I need the same as a sortable list | Balance ranking decides who gets chased first | DataTable01 | Components (Page) | PARTIAL | `customer-list-01` |
| customer detail | I need one payer's billing and payment record | Chasing a payer needs the whole relationship at once | MemberList01 | Components (Page) | PARTIAL | `customer-detail-page` |
| customer detail 2 | I need the same record with its seats and its plan | Seat count is what the invoice is actually about | MemberList01 | Components (Page) | PARTIAL | `customer-detail-page` |
| customer detail 3 | I need the same record with its invoices and receipts | A payer disputing an invoice needs the document trail | MemberList01 | Components (Page) | PARTIAL | `customer-detail-page` |
| enterprise client detail | I need one large account across its workspaces and its contract | Enterprise revenue is lost on administrative friction, not on price | MemberList01 | Components (Page) | GAP | `account-detail-page` |
| subscriptions | I need to see every subscription and its state | Subscription state is the business model, tracked as data | DataTable01 | Components (Page) | PARTIAL | `subscription-list-page` |
| subscriptions 2 | I need the same filtered by plan | Plan changes are the most common billing support call | DataTable01 | Components (Page) | PARTIAL | `subscription-list-page` |
| subscriptions 3 | I need the same filtered by renewal date | Renewals are where revenue is won or lost on timing | DataTable01 | Components (Page) | PARTIAL | `subscription-list-page` |
| subscriptions 4 | I need the same as a calendar of what renews when | A renewal calendar is a forecasting tool, not a list | DataTable01 | Components (Page) | PARTIAL | `subscription-list-page` |
| create subscription | I need to start a subscription on a customer's behalf | Manual starts are how sales assisted deals close | none | Components (Block) | GAP | `subscription-form-01` |
| subscription detail | I need one subscription's full lifecycle | A cancellation argument is won on the lifecycle record | Summary01 | Components (Page) | PARTIAL | `subscription-detail-page` |
| invoice list 1 | I need to see every invoice and its state | Invoicing is the function that has to be legible to an auditor | DataTable01 | Components (Page) | PARTIAL | `invoice-list-page` |
| invoice list 2 | I need the same filtered by state | Collections work is done state by state | DataTable01 | Components (Page) | PARTIAL | `invoice-list-page` |
| invoice list 3 | I need the same filtered by customer | Chasing is customer led far more often than state led | DataTable01 | Components (Page) | PARTIAL | `invoice-list-page` |
| invoice list 4 | I need the same filtered by date range | Period close is a date range operation | DataTable01 | Components (Page) | PARTIAL | `invoice-list-page` |
| invoice list 5 | I need the same for export and download | A finance team needs the file, not the screen | DataTable01 | Components (Page) | PARTIAL | `invoice-list-page` |
| create invoice | I need to compose an invoice correctly the first time | A malformed invoice is a support ticket and a delayed payment | none | Components (Block) | GAP | `invoice-form-01` |
| create invoice 2 | I need to compose one with multiple lines and discounts | Real invoices are not one line and one amount | none | Components (Block) | GAP | `invoice-form-02` |
| create invoice 3 | I need to compose one with tax applied | Tax rules are a compliance obligation, not a preference | none | Components (Block) | GAP | `invoice-form-03` |
| invoice detail | I need one invoice and who has seen it | Whether a customer received an invoice is a real dispute | Summary01 | Components (Page) | PARTIAL | `invoice-detail-page` |
| invoice detail 2 | I need the same invoice with its line items and payments | Part payment and part dispute both need line level detail | Summary01 | Components (Page) | PARTIAL | `invoice-detail-page` |
| invoice detail 3 | I need the same invoice as a document to send | The artefact the customer actually receives is the point | Summary01 | Components (Page) | PARTIAL | `invoice-detail-page` |
| webhooks | I need to see what was delivered, what failed, and what was retried | Silent delivery failure means silent data loss downstream | none | Components (Block) | GAP | `delivery-log-01` |
| payment workflow | I need to see a failed payment move through its recovery states | Recovery is where most failed payment revenue is actually saved | ProcessFlow01 | Components (Block) | GAP | `payment-recovery-01` |
| delivery simulator | I need to rehearse a payment path without moving money | Rehearsing a path is how teams find out a flow breaks in production | none | Workflows | GAP | `payment-sandbox-01` |

## Section D: task management (14 screens)

Stated purpose, as the listing gives it: an inbox, a today view, projects and an
activity record on one task record, with nested lists and due dates.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| all tasks | I need every task I hold in one list | A personal task system stops working the moment the list is incomplete | Todo01 | Components (Page) | COVERED | none |
| create task | I need to add a task without leaving where I am | Capture cost is the single biggest determinant of whether a task system is used | FormDialog | Components (Block) | PARTIAL | `task-form-01` |
| today | I need to know what to do today | A day shaped by a list is the entire value of the product | none | Components (Page) | GAP | `today-page` |
| upcoming | I need to see what is coming rather than what is due | Forward planning is a different task from today's work | Todo01 | Components (Page) | PARTIAL | `task-view-page` |
| important | I need the tasks I marked as significant | Priority has to be recorded somewhere or it is re argued daily | Todo01 | Components (Page) | PARTIAL | `task-view-page` |
| personal tasks | I need my own tasks separated from everything else | Shared and personal work is mixed in most tools and regretted in all of them | Todo01 | Components (Page) | PARTIAL | `task-view-page` |
| work projects | I need tasks grouped under projects | Grouping is what makes a flat task list survivable | Todo01 | Components (Page) | PARTIAL | `task-project-page` |
| shopping list | I need the same task surface over a different record | The shape does not change when the subject does, and that is the finding | Todo01 | Components (Page) | COVERED | none |
| health and fitness | I need the same task surface over a different record | Same shape, different words, same interaction cost if unowned | Todo01 | Components (Page) | COVERED | none |
| learning goals | I need the same task surface over a different record | A repeated goal is a task with a date attached | Todo01 | Components (Page) | COVERED | none |
| activity | I need to see what happened and when | An activity record is what makes a tool's state defensible | ActivityFeed01 | Components (Block) | COVERED | none |
| settings | I need to configure how my task lists behave | Preferences are table stakes in any system people use daily | SettingsPanel01 | Components (Page) | COVERED | none |
| trash | I need to recover something I deleted by mistake | Deletion confidence is what makes an aggressive delete acceptable | none | Components (Page) | GAP | `trash-page` |
| notifications | I need to know what changed that needs me | An unread change is lost work | NotificationCenter01 | Components (Block) | COVERED | none |

## Section E: users, account and settings (11 screens)

Stated purpose, as the listing gives it: the chrome around the applications:
people, preferences, profile, billing, plans, connected applications and
notifications.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| `dashboard` 10 | I open the account area and need to know what applies to me | The chrome around the apps is designed or it reads as unfinished | Dashboard01 | Components (Page) | PARTIAL | `account-dashboard-01` |
| `dashboard` 11 | I need the same weighted toward my own recent activity | A personal activity summary is how a user confirms their own work happened | Dashboard01 | Components (Page) | PARTIAL | `account-dashboard-01` |
| `dashboard` 12 | I need the same weighted toward what needs my attention | An attention summary is the difference between checking and avoiding a screen | Dashboard01 | Components (Page) | PARTIAL | `account-dashboard-01` |
| users | I need to see everyone with access and remove it | Access that cannot be revoked is a security finding at audit | SettingsMembers01 | Components (Page) | COVERED | none |
| tasks | I need to see what other people have been asked to do | Delegation without visibility is how work is lost | MemberList01 | Components (Page) | PARTIAL | `user-tasks-page` |
| general | I need to set the preferences that are not personal | Organisation wide defaults are a cost control, not a convenience | SettingsPanel01 | Components (Page) | COVERED | none |
| profile | I need to control what others see about me | Profile control is a data protection obligation in most jurisdictions | UserProfile01 | Components (Page) | COVERED | none |
| billing | I need to see and change how I am charged | Billing is the screen customers open before they cancel | BillingSource01 | Components (Page) | PARTIAL | `billing-settings-01` |
| plans | I need to compare what I am on against what I could be on | An upgrade is a purchase that needs the plan comparison to exist somewhere | Pricing01 | Components (Page) | PARTIAL | `plan-settings-01` |
| connected apps | I need to see what has access to my data and disconnect it | Every connected application is an unmonitored data path | SettingsIntegrations01 | Components (Page) | COVERED | none |
| notifications | I need to choose what I am told about and how often | Notification settings are the difference between an app and an intrusion | SettingsNotifications01 | Components (Page) | COVERED | none |

## Section F: developer console (4 screens)

Stated purpose, as the listing gives it: the chrome a real console needs, being
an overview, keys, webhooks and an event record.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| overview | I open the console and need to know what the system is doing | A developer facing product without an overview is a product with no first screen | InstrumentPanel01 | Components (Page) | PARTIAL | `console-overview-page` |
| api keys | I need to create a credential, see it once, and revoke it later | Key lifecycle is the most security sensitive screen a product ships | none | Components (Block) | GAP | `api-key-01` |
| webhooks | I need to configure where events are sent | Every integration begins with configuring a destination | SettingsIntegrations01 | Components (Block) | PARTIAL | `webhook-endpoint-01` |
| events and logs | I need to see what happened, in order, with enough detail to act | Debugging without an event record is guesswork with a billing clock running | History01 | Components (Block) | GAP | `event-log-01` |

## Section G: identity and error (8 screens)

Stated purpose, as the listing gives it: the entry and failure surfaces around
everything else.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| login | I need to prove who I am | The entry surface is the most visited and least designed screen in a product | Login01 | Components (Page) | COVERED | none |
| register | I need to create an account | Acquisition is wasted if the first screen after it is broken | Signup01 | Components (Page) | COVERED | none |
| forgot password | I cannot get in and need a route back in | Locked out users are silent churn | ForgotPassword01 | Components (Page) | COVERED | none |
| unauthorized | I am not allowed here and need to know what to do | An unexplained refusal costs a support ticket every time | ErrorPage | Components (Page) | COVERED | none |
| forbidden | I am refused and need to know what would grant access | Telling a user what is missing turns a refusal into an action | ErrorPage | Components (Page) | COVERED | none |
| not found | I followed something that is gone | A dead end with no way back is the most avoidable support call | NotFoundPage | Components (Page) | COVERED | none |
| internal server error | Something broke and I need to know it was not me | An unlabelled server error reads as a broken product | ErrorPage | Components (Page) | COVERED | none |
| maintenance error | The product is down on purpose and I need to know when it returns | Planned downtime given without a shape destroys trust more than the outage | ErrorPage | Components (Page) | PARTIAL | `maintenance-page` |

## Section H: AI chat and agents (80 screens)

Stated purpose, as the listing gives it: composers, conversations, a model
catalogue, usage analytics, workflow canvases and an agent studio.

| Screen | User problem | Business problem | Nearest existing Item | Tier | Status | Candidate name |
| --- | --- | --- | --- | --- | --- | --- |
| composer 1 | I need to start a request to a model and see it answer | The composer is the whole product for a chat surface | PromptComposer | Components (Block) | PARTIAL | `composer-01` |
| composer 2 | I need the composer with attachments | Input shape changes what the product can be used for | PromptComposer | Components (Block) | PARTIAL | `composer-01` |
| composer 3 | I need the composer with tools visible | Not knowing what the model can call is the top support question in agent products | PromptComposer | Components (Block) | PARTIAL | `composer-01` |
| composer 4 | I need the composer with a chosen model | Model choice is a user decision wherever models differ | PromptComposer | Components (Block) | PARTIAL | `composer-01` |
| composer 5 | I need the composer with saved requests | Repeated requests are the strongest signal of what to build next | PromptComposer | Components (Block) | PARTIAL | `composer-01` |
| composer 6 | I need the composer in a side panel beside other work | Context switching is what makes a chat app unusable inside a larger product | PromptComposer | Components (Block) | PARTIAL | `composer-01` |
| composer 7 | I need the composer with response controls beside it | Streaming and stopping are controls, not implementation detail | PromptComposer | Components (Block) | PARTIAL | `composer-01` |
| conversation 1 | I need to read one exchange and continue it | A conversation is the unit a person thinks in | none | live | GAP | `conversation-live` |
| conversation 2 | I need the same with the request shown as structured data | Comparing what was sent is how a user learns the product | none | live | GAP | `conversation-live` |
| conversation 3 | I need the same with each step of a tool call visible | An agent that acts invisibly is an agent nobody will leave running | none | live | GAP | `conversation-live` |
| conversation 4 | I need the same with reasoning collapsed by default | Verbosity is the main reason agent products get abandoned | none | live | GAP | `conversation-live` |
| conversation 5 | I need the same with images and files in the thread | Mixed media is what distinguishes a useful assistant from a text box | none | live | GAP | `conversation-live` |
| conversation 6 | I need the same with the request branching | Trying an alternative without losing the first is how people explore | none | live | GAP | `conversation-live` |
| conversation 7 | I need the same editable before it is sent | Editing a draft is cheaper than rewriting a request | none | live | GAP | `conversation-live` |
| conversation 8 | I need the same with inline citations | Trust in an answer is a function of being able to check it | none | live | GAP | `conversation-live` |
| conversation 9 | I need the same searchable | Finding an old answer is the main reason people keep a history | none | live | GAP | `conversation-live` |
| conversation 10 | I need the same with the answer copied out of the chat | Taking the answer elsewhere is the most common next action | none | live | GAP | `conversation-live` |
| conversation 11 | I need the same shared with a colleague | A result one person found and another needs is work done twice | none | live | GAP | `conversation-live` |
| conversation 12 | I need the same with an export | An export is how a conversation becomes evidence | none | live | GAP | `conversation-live` |
| conversation 13 | I need the same with the model shown per turn | Models change mid thread in agent products and users notice | none | live | GAP | `conversation-live` |
| conversation 14 | I need the same with cost shown per turn | Cost per turn is how an agent product is kept affordable | none | live | GAP | `conversation-live` |
| conversation 15 | I need the same with latency shown per turn | Latency is the reason a chat product feels slow rather than broken | none | live | GAP | `conversation-live` |
| conversation 16 | I need the same on a dark surface suited to long reading | Reading a long answer is a different task from skimming one | none | live | GAP | `conversation-live` |
| conversation 17 | I need the same with the thread beside a document | Reading beside a source is the difference between an answer and a guess | none | live | GAP | `conversation-live` |
| conversation 18 | I need the same with a live progress indicator | Not knowing whether a long answer is working is the main abandonment cause | none | live | GAP | `conversation-live` |
| conversation 19 | I need the same with the run stoppable | An unstoppable run is the first thing a user asks for | none | live | GAP | `conversation-live` |
| conversation 20 | I need the same with a retry that keeps context | Retrying from scratch loses the work already done | none | live | GAP | `conversation-live` |
| conversation 21 | I need the same with the run approved step by step | Approval gates are how an agent is allowed to act at all | none | Workflows | GAP | `approval-queue-01` |
| conversation 22 | I need the same with the run paused and resumed | Long work that cannot pause cannot be supervised | none | live | GAP | `conversation-live` |
| conversation 23 | I need the same with a branch of the thread compared to another | Comparing two answers is how a user decides which to trust | none | live | GAP | `conversation-live` |
| profile 1 | I need to see and set how the assistant behaves to me | An assistant that cannot be configured is used by two people and satisfies neither | UserProfile01 | Components (Page) | PARTIAL | `operator-profile-page` |
| model catalog | I need to see what models exist and what each is for | A model catalog is the difference between a product and an integration | none | Components (Page) | GAP | `model-catalog-page` |
| model details | I need everything about one model before choosing it | Model choice is expensive to reverse and is made under uncertainty | none | Components (Page) | GAP | `model-detail-page` |
| model pricing | I need to know what each model costs | Cost per model is the only thing that makes a model choice defensible | Pricing01 | Components (Page) | PARTIAL | `model-pricing-page` |
| model benchmarks | I need to know how models compare on this product's work | General benchmarks are not evidence about a specific task | ChartGroup01 | Components (Page) | PARTIAL | `benchmark-page` |
| api keys | I need to create a credential for the model provider | Provider keys are the first thing a developer asks for | none | Components (Block) | GAP | `api-key-01` |
| audio playground | I need to try a voice or sound capability without building for it | Trying before building is how a capability gets adopted at all | PromptComposer | Components (Block) | GAP | `playground-01` |
| plugins | I need to see what can extend the product and turn it on | Extensibility is the retention answer to a platform | Integration01 | Components (Block) | PARTIAL | `plugin-list-01` |
| billing | I need to see what this product is costing me | An unpredictable bill ends a product's use by a team | BillingSource01 | Components (Page) | PARTIAL | `ai-billing-01` |
| credit usage | I need to see what is left of what I bought | Prepaid credit is a balance, and balances need a screen | Capacity01 | Components (Block) | PARTIAL | `credit-usage-01` |
| usage insights | I need to understand where the usage goes | Aggregate usage is what turns a bill into a decision | ChartGroup01 | Components (Page) | PARTIAL | `usage-insights-01` |
| model usage | I need to see usage per model specifically | Per model usage is what tells you which model to drop | ChartCard01 | Components (Page) | PARTIAL | `model-usage-01` |
| api requests | I need to see the calls made against my key | A request record is the first thing a developer asks for when something is wrong | History01 | Components (Page) | PARTIAL | `request-log-01` |
| batch jobs | I need to see long running work and where it got to | Batch work fails in the middle and the failure must be findable | none | Components (Page) | GAP | `batch-job-page` |
| incidents | I need to see what broke, how badly, and since when | Incident communication is a contractual and a trust obligation | StatusLedger01 | Components (Page) | PARTIAL | `incident-page` |
| tokenizer | I need to see how a piece of text is counted and why | Counters are invisible until they are wrong and unexplained | PromptComposer | Components (Block) | GAP | `token-estimator-01` |
| evaluations | I need to see how the product was judged against a set of cases | Without a scored record, a change in quality is a matter of opinion | ToolLedger01 | Components (Page) | GAP | `evaluation-run-page` |
| response review | I need to read a sample of real outputs and judge them | Sampling real output is the only review that finds real problems | none | Components (Page) | GAP | `response-review-page` |
| project settings | I need to set what applies to this project | Scope boundaries are what make a multi project product governable | SettingsPanel01 | Components (Page) | COVERED | none |
| organization settings | I need to set what applies to the whole organisation | Organisation wide policy is where governance actually lives | SettingsPanel01 | Components (Page) | COVERED | none |
| workflow 1 | I need to build a multi step run and see its shape | A visual run builder is how a non developer gets automation | none | Components (Page) | GAP | `workflow-canvas-page` |
| workflow 2 | I need the same with typed inputs and outputs between steps | A step without a declared contract is an integration that fails silently | none | Components (Page) | GAP | `workflow-canvas-page` |
| workflow 3 | I need the same rehearsed on real input before it ships | Rehearsal is what stops a broken run reaching a customer | none | Workflows | GAP | `workflow-run-page` |
| automation 1 | I need a trigger and a consequence, without drawing a canvas | Most automations are two things and a canvas is overkill for them | none | Components (Block) | GAP | `automation-01` |
| automation 2 | I need the same with conditions between the two | A condition is what makes an automation safe to leave running | none | Components (Block) | GAP | `automation-02` |
| document 1 | I need a long document I can read and refer back to | Documents are how a product's thinking gets reused | Prose | Components (Page) | GAP | `document-workspace-page` |
| document 2 | I need the same document with its versions | A document without versions cannot be corrected | Prose | Components (Page) | GAP | `document-workspace-page` |
| document 3 | I need the same document with its comments | Commenting is how a document gets agreed rather than circulated | Prose | Components (Page) | GAP | `document-workspace-page` |
| document 4 | I need the same document with the sources beside it | A generated document is only usable if its sources are checkable | Prose | Components (Page) | GAP | `document-workspace-page` |
| document 5 | I need the same document with what it produced beside it | A document that generated nothing is a document nobody trusts | Prose | Components (Page) | GAP | `document-workspace-page` |
| document 6 | I need the same document as something I can send | The deliverable, not the editor, is what the reader receives | Prose | Components (Page) | GAP | `document-workspace-page` |
| research 1 | I need to gather evidence and reach a conclusion that is defensible | Research is the highest judgement work an agent product does | Prose | Components (Page) | GAP | `research-workspace-page` |
| evidence comparison matrix | I need two pieces of evidence compared on the same axes | Comparison is what turns gathered evidence into a decision | Compare01 | Components (Page) | GAP | `comparison-matrix-01` |
| visual inspection | I need to look at what was produced and judge it visually | A product that produces images has to be reviewed as images | ImageListField | Components (Page) | GAP | `inspection-01` |
| commerce copilot | I need help inside the shop while I am working in it | An assistant in context is worth several times one in a separate place | PromptComposer | Components (Block) | GAP | `copilot-panel-01` |
| mobile screen workspace | I need to see a mobile form of the work on a desktop screen | Mixed device work is real for anyone shipping a mobile client | none | Components (Page) | GAP | `device-frame-01` |
| video variations | I need to judge and select between generated video takes | Selection is the decision; playback is only the means of making it | VideoPlayer | Components (Page) | GAP | `media-variant-01` |
| youtube content | I need to work from video the user pointed at | Source ingest is the first step of most content work | VideoPlayer | Components (Page) | GAP | `media-source-01` |
| skill 1 | I need to see one capability in full, what it does and what it costs | A capability catalogue is useless without a detail per entry | none | Components (Page) | GAP | `skill-detail-page` |
| skills manager | I need to see all capabilities and turn them on and off | Governance of what an agent may do is the security boundary | none | Components (Page) | GAP | `skill-list-page` |
| agent builder | I need to build an agent and see how it is put together | An agent nobody can inspect is an agent nobody can approve | ProcessFlow01 | Components (Page) | GAP | `agent-builder-page` |
| integrations | I need to connect this agent to the rest of the stack | An agent with no connections is a chat window | Integration01 | Components (Page) | COVERED | none |
| skills workspace | I need to compose and test a capability set as a whole | A capability is only meaningful as a set | none | Components (Page) | GAP | `skill-workspace-page` |
| agent 1 | I need everything about one agent, its configuration and its record | An agent record is what an auditor asks for | none | Components (Page) | GAP | `agent-detail-page` |
| agent factory 1 | I need to produce many agents from a definition | Producing agents one at a time is the bottleneck in most programmes | none | Components (Page) | GAP | `agent-batch-page` |
| agent traces | I need to see exactly what an agent did, step by step | A trace is the difference between debugging and guessing | ToolLedger01 | Components (Page) | GAP | `trace-page` |
| agent workspace | I need an agent's configuration and its live state together | Separating configuration from state means never knowing which is running | none | Components (Page) | GAP | `agent-workspace-page` |
| agent configuration | I need to set what an agent is allowed to do | Least privilege on an agent is the whole safety argument | SettingsPanel01 | Components (Page) | PARTIAL | `agent-config-01` |
| subagent canvas | I need to see how an agent delegates across subagents | Delegation is invisible from the outside and is where surprises come from | ProcessFlow01 | Components (Page) | GAP | `agent-canvas-page` |
| mixed agent canvas | I need deterministic and model driven steps on one diagram | Mixing the two is the defining capability and the defining risk | ProcessFlow01 | Components (Page) | GAP | `agent-canvas-page` |

---

# Part 2: screen archetypes

The 219 listed screens are not 219 problems. Deduplicated by the shape of the
interaction rather than by the subject matter, they collapse into **21
archetypes**, and every screen above is assigned to exactly one of them. The
counts below sum to 219 and were produced by assigning each enumerated screen to
one archetype, not by estimating.

| Archetype | Screens | Share | What it is | Slugs |
| --- | --- | --- | --- | --- |
| Record index | 37 | 17 percent | A sortable, filterable, paginated list of records with per row actions and batch actions | product list 1 to 4, order list 1 to 3, customer list 1, shipment list 1, project list 1 to 4, team list 1 to 3, member list 1 to 3, issue list 1 to 2, issue spreadsheet, transactions, transactions list 2, customers list 2, subscriptions 1 to 4, invoice list 1 to 5, users, incidents, skills manager |
| Conversation | 30 | 14 percent | A thread of messages that arrives over time, with a composer beneath it | inbox 1 to 4, inbox email 1, notifications, conversation 1 to 23, commerce copilot |
| Record detail | 24 | 11 percent | One record read mostly, with its relationships and its history | product detail 1 to 2, order detail 1 to 2, customer detail, shipment detail, project detail 1 to 2, issue detail 1 to 2, transaction detail 1 to 2, customer detail 1 to 3, enterprise client detail, subscription detail, invoice detail 1 to 3, profile 1, model details, skill 1, agent 1 |
| Metric summary | 23 | 11 percent | A small number of figures with trend and context, above supporting detail | ecommerce dashboard 1 to 9, project dashboard 1 to 4, billing dashboard 1 to 6, account dashboard 10 to 12, console overview |
| Record write form | 17 | 8 percent | Create or edit one record, with validation and a save | add product 1 to 2, edit product 1 to 2, add new order, edit order, add customer, edit customer, create shipping label, edit shipping label, create subscription, create invoice 1 to 3, create task, api keys (both listings) |
| Settings panel | 13 | 6 percent | Grouped preferences that change behaviour without navigating away | settings (task app), general, profile, billing, plans, connected apps, notifications (account), webhooks (console), billing (ai), project settings, organization settings, integrations, agent configuration |
| Task view | 11 | 5 percent | A record list narrowed by a person chosen rule: today, soon, flagged, mine, grouped | all tasks, today, upcoming, important, personal tasks, work projects, shopping list, health and fitness, learning goals, trash, tasks |
| Node canvas | 11 | 5 percent | A diagram of steps and edges that is edited rather than read | workflow 1 to 3, automation 1 to 2, agent builder, skills workspace, agent factory 1, agent workspace, subagent canvas, mixed agent canvas |
| Composer | 8 | 4 percent | An input surface for producing a request, with controls around it | composer 1 to 7, tokenizer |
| Document workspace | 7 | 3 percent | A long authored document with its sources, its versions and what it produced | document 1 to 6, research 1 |
| Log and event stream | 7 | 3 percent | An append only record of what happened, filterable and inspectable | webhooks (billing), events and logs, api requests, batch jobs, evaluations, response review, agent traces |
| Error and status | 5 | 2 percent | A screen that explains a refusal, a loss or a planned outage and offers a route out | unauthorized, forbidden, not found, internal server error, maintenance error |
| Usage and cost breakdown | 5 | 2 percent | Where money or volume went, sliced by dimension | model pricing, model benchmarks, credit usage, usage insights, model usage |
| Media review | 4 | 2 percent | Judge produced media: look, compare, select | visual inspection, mobile screen workspace, video variations, youtube content |
| Board | 3 | 1 percent | Cards by state with ranking inside a state | issue kanban 1 to 3 |
| Identity | 3 | 1 percent | Prove or recover an identity | login, register, forgot password |
| Directory index | 3 | 1 percent | A browsable set of things with a summary, not a working list | customers (billing), model catalog, plugins |
| Rehearsal surface | 3 | 1 percent | Try a path without committing it | payment workflow, delivery simulator, audio playground |
| Date view | 2 | 1 percent | Work placed on a calendar and moved along it | issue calendar, issue calendar 2 |
| Dated history | 2 | 1 percent | A sequence of dated events, read rather than worked | issue gantt 1, activity |
| Comparison matrix | 1 | under 1 percent | Several things judged on the same axes | evidence comparison matrix |

**One correction to the table above.** The task view row named ten slugs against
its own count of eleven, the omitted row being `all tasks` in Section D, which is
COVERED by `Todo01`; the cell now names it and reads as eleven. Part 1 is
trusted, being the only section that carries one row per enumerated screen, and it
holds eleven task view rows.

**Three things the archetype table says that the raw count does not.**

The largest archetype is the record index at 37 screens, and it is the one Prism
is closest to owning, because `DataTable01`, `StatefulTable`, `DataToolbar`,
`FilterPanel`, `SelectionToolbar`, `TableSort`, `Pagination` and `Checkbox` are
already published. Twenty three more screens are a metric summary, which
`Dashboard01` and `DashboardPage` largely answer. Together those two are 60
screens and 27 percent of the whole space, and neither is where the risk sits.

The risk sits in the shapes that need an interaction the current surface cannot
express. Five of them are named in this survey and each is stated against what
Prism has:

1. **Master and detail split.** A record index beside the record it opens, with
   the list retaining its own filters and position while the detail is edited.
   Prism has `Drawer`, `Sheet`, `ListPanel`, `Resizable` and `AppShell01`, and
   none of them states that the list behind must keep its state. Every one of the
   37 record index screens wants this, and Carbon's data table usage states the
   same problem independently by naming a side panel as a destination for
   expansion content.
2. **Wizard and multi step flow.** A sequence where each step constrains the next
   and progress has to be legible. Prism has `Steps`, `Stepper`, `FormWizard` and
   `Checklist`, which is most of the parts, and the 17 record write form screens
   plus the invoice composer variants want exactly this. What is missing is a
   stated answer about whether a wizard is a Block that takes a step list as data
   or a Workflow the consumer owns.
3. **Bulk selection and batch action.** Selecting many records and applying one
   action to all of them, with the selected state visibly displacing the row
   actions. Prism ships `SelectionToolbar` and `Checkbox`, and Carbon's usage
   names the same interaction as a distinct mode with an exit, which Prism has no
   vocabulary for.
4. **Audit or timeline view.** A dated, attributed record of what happened.
   Prism has `AuditLog01`, `History01`, `ActivityFeed01`, `MilestoneTimeline01`
   and the `Timeline` Component, so the parts are here; what is missing is a
   stated rule about what an audit record must carry that a history record does
   not, because the two are currently one idea in the catalogue.
5. **Scheduled and recurring job view.** A job that runs on a schedule, with its
   next run, its last result and its history. The listings name a payment
   recovery flow and a batch job page, and neither is answered by any Prism Item.
   There is no scheduled or recurring concept in the catalogue at all.

**Live and streaming screens, treated against the recorded decision rather than
around it.** The `live` Kind is built, named and released, and it holds exactly
two Items today: `RunStream01` and `ToolLedger01`. Its recorded definition is a
surface whose content changes over time without a navigation event, and its
recorded line is that a read mostly record which changes as a run completes or as
a person decides is a Workflow rather than a Kind. Applying that line to this
survey:

- The **conversation** screens are `live`. A thread gains a message while the
  person is looking at it, with no navigation, and 23 of the 30 screens in the
  conversation archetype are that shape. The consumer owns the socket and the
  transport; Prism would own the streaming message surface and the run controls,
  which is what `RunStream01` already does.
- **Conversation 21**, where a run waits for a person to approve it, is a
  **Workflow**, not `live`, because it changes when a person decides. That single
  row is the clearest application of the recorded line in the whole survey.
- **Agent traces**, **evaluations**, **response review** and **events and logs**
  are read mostly records. They are Workflows and Page compositions, not the
  fourth Kind, and they are the four places where this survey most expects an
  argument to be made in the other direction.

## Part 3: coverage gaps, ranked

Ranked by the number of listed screens standing behind each gap. Counts are the
number of rows at that status within the named archetype, taken from Part 1.

**1. Conversation and message stream: 24 GAP screens.** The 23 conversation
screens plus commerce copilot. There is no Block or Page that is a conversation,
and the primitives that would fill one (`PromptComposer` for the composer, `Inbox01`
for a thread, `RunStream01` for the arriving text) exist in three separate places
with no stated relationship. **The one decision to settle first:** does the
conversation become the second `live` Item family, owned by the consumer's
socket and rendered from an event list, or is it a Page composed from `Inbox01`
and `PromptComposer` that re renders on navigation? Everything else about the
conversation depends on this, including whether the 23 screens are 23 Items.

**2. Record write form: 16 GAP screens, 15 of them in scope.** Every create and
edit screen across ecommerce, billing, tasks and the developer console. `Form`
exists as a Component and `AuthForm01` is a proven card shaped precedent, but
nothing states how a Block takes a field set. Sixteen of the seventeen record
write form rows are GAP; the seventeenth, `create task`, is PARTIAL because
`FormDialog` answers it. One of the two api key rows sits in Section H and leaves
scope with it, so 15 of the 16 remain in scope. **The one decision to settle
first:** is an entity form a Block that takes a field specification as data, or is
it always a consumer owned `Form` with Prism supplying only the shell? This
decides 16 screens at once and it is the decision most likely to be got wrong by
copying a consumer's markup.

**3. Node canvas: 11 GAP screens.** The workflow builder, the automation builder,
the agent builder, the agent factory and the two agent canvases. Prism has no
canvas surface of any kind. **The one decision to settle first:** is a canvas
inside Prism at all, given that it is a two dimensional editing surface with its
own selection, zoom, drag and undo model, or is a canvas OUT on the grounds that
it is an application rather than a design system surface? Both answers are
defensible and they lead to very different amounts of work.

**4. Record detail: 8 GAP screens and 15 PARTIAL.** The detail half of the record
problem. `Summary01` and `QuickView01` are near neighbours and neither states the
two things a record detail must do: hold a record's relationships without becoming
a page of unrelated cards, and place actions against the record rather than at the
top of the screen. The 24 rows of the archetype are 8 GAP, 15 PARTIAL and one
COVERED, that one being `issue detail 1`, which `IssueDetail01` answers. **The one
decision to settle first:** is a record detail a Page, or a Block that renders
inside `AppShell01`'s split beside its own record index? The answer is the same
for all 24 archetype screens and it decides whether Prism owns the master and
detail shape at all.

**5. Document and research workspace: 7 GAP screens.** The six document screens
and research. `DocsShell` is the nearest thing and it states two rules these
screens would break, because in a document workspace a section carries a status
and a group with no index is a route. **The one decision to settle first:** does a
document workspace reuse `DocsShell` and therefore relax its two stated rules, or
is it a separate Page that does not inherit them? Relaxing the rules is the more
expensive option and it affects every consumer already relying on them.

**6. Log, event and trace record: 6 GAP screens.** Webhook delivery records, the
developer console event record, batch jobs, evaluations, response review and
agent traces. `History01`, `AuditLog01` and `ToolLedger01` each hold part of it.
**The one decision to settle first:** is a log a Block that takes an array of
typed events, or is every one of these a consumer owned record over a Prism
`Timeline`? The first is more useful and the second is more honest about who owns
the data.

**7. Credential and secret lifecycle: 2 GAP screens.** The api key screens in
the developer console and the AI listing. `FormDialog` covers creation and
nothing covers reveal once, rotate or revoke. Only the console row is in scope;
the AI listing row leaves scope with Section H. **The one decision to settle
first:** does Prism ship a surface whose whole job is holding a secret, given that
a Block that renders a secret is a Block that can leak one?

**8. Rehearsal and simulation: 3 GAP screens.** Payment recovery, the delivery
simulator and the audio playground. **The one decision to settle first:** is a
sandbox a product surface or a developer tool? A sandbox owned by a consumer's own
credentials is arguably the second, and the honest answer may be OUT for all
three.

**9. Saved task view: 2 GAP screens.** Today and trash. The other nine screens in
the archetype are answered by `Todo01` or are PARTIAL. **The one decision to settle
first:** is a saved view a configurable filter over one Block, or does each named
view become an Item? Ten of the eleven screens say the first, which is the reason
this gap is last and not higher.

**10. Catalogue and capability detail: 4 GAP screens.** The model catalogue, the
model detail record, the skill detail record and the agent detail record sit
across the directory and detail archetypes, and all four are GAP in Part 1. **The
one decision to settle first:** does Prism ship an entity detail shape, or does
each product define its own? This overlaps gap 4 and should be settled with it
rather than separately.

**The four counts above were recomputed against Part 1, which is authoritative.**
Part 1 is the only section carrying one row per enumerated screen, so where a
count disagrees with the rows it summarises the count is what is wrong. Gap 2 is
16 rather than 17 because `create task` is PARTIAL; gap 4 has 15 PARTIAL rather
than 16 because `issue detail 1` is COVERED; gap 7 is 2 rather than 3 because
there are two api key rows, one in Section F and one in Section H; and gap 10 is
4 rather than 3 because it named four rows.

## Part 4: what this survey does not decide

This document is an input to a decision-map exercise. The following are the
questions it deliberately leaves open, and naming them is the point of writing it
rather than a list of answers.

**The screen to Block mapping rule.** The rows above say a candidate name such as
`invoice-form-01`, but nothing here decides whether one archetype with many
subjects becomes one Block with data, or one Block per subject. The evidence cuts
both ways and is stated rather than resolved: three screens in the task
application are COVERED by a single `Todo01` across three different subjects,
which argues for one Block; while 37 record index screens differ in which columns
matter, which argues for per subject Blocks with a shared shape. The rule needs
deciding before any name above is adopted.

**Whether layout fidelity or re derivation under Prism's token law wins.** Every
row's judgement is made against Prism's own rules: a Block takes content as props,
a Page receives application owned data, and no raw value or ramp step is reachable
from a component. That means a screen listed as PARTIAL stays PARTIAL even where
the market's version is easy to reproduce, because reproducing it would breach the
token law. No row in this document is a fidelity claim and none should be read as
one.

**Whether a second form of the same answer becomes a new `-02` Block or a new
Page.** The candidates `dashboard-02` through `dashboard-09` and
`project-dashboard-02` through `-05` assume a rule that does not exist yet. The
alternative is that the existing Block takes a weighting prop, which is a smaller
change and a smaller published surface, or that a variant becomes a Page because a
whole screen is a different thing from a section. Twenty six of the GAP and
PARTIAL rows in Parts 1 and 3 turn on this one question.

**What "replicate" excludes.** Four things are out of scope by this document's own
terms and by the recorded decisions, and none of them is currently written down as
an exclusion anywhere: demo data, live chart data, backend behaviour, and
transport. `DESIGN.md` records that Prism never fetches and never imports a
router; this survey adds that a screen's mock records, its chart series, its save
handler and its socket are the consumer's, always. A candidate Item therefore
takes its content as props and is worth nothing without them, which is the correct
posture but should be stated as a rule rather than inferred per Item.

**Six further questions this survey raises without answering.**

1. Whether `AppShell01` is the answer to master and detail, or whether that shape
   is a separate Block that the shell merely hosts. Every one of the 37 record
   index screens depends on this.
2. Whether the `live` Kind takes a second Item family, which is gap 1 above and
   the largest single decision in this document.
3. Whether a bulk selection mode is a state or a mode, since Carbon's usage names
   it as a mode that disables the row actions and Prism has no vocabulary for a
   mode that is not a pack or a Mode.
4. Whether an audit record and a history record are one Item or two. They are one
   idea in the catalogue today and the arguments for splitting them are compliance
   driven rather than visual.
5. Whether a canvas is OUT. Gap 3 above, and the answer removes eleven screens from
   scope entirely.
6. Whether a canvas free node list, as `ProcessFlow01` already is, is enough for
   the workflow and agent surfaces, which would convert gap 3 from 11 screens to
   3 and is the cheapest available answer if it holds.

## Part 5: what was and was not enumerated

**The count is verified and it is 219.** The Admin Kit sales and listing page,
retrieved 2026-10-07, enumerates every screen with a three digit number running
from 001 to 219 with no gap in the sequence, and the per section totals it states
sum to the same figure: ecommerce 34, project management 32, payments 36, task
management 14, users and settings 11, developer console 4, identity and error 8,
AI chat and agents 80. That is 219. The team's figure of 219 is correct.

**Two listing inconsistencies are worth recording because they affect any reader
checking the arithmetic.** The section headings and the numbered sequence do not
appear in the same order on the page: the task management, developer console and
users and settings sections are listed after the AI chat heading in the reading
order while their numbers sit between 103 and 139. And the listing gives two
prices for the same kit, one on each page. Neither changes the count.

**Part 3 enumerates ten gaps, not seven.** The ranked gaps are numbered 1 to 10
and the count was checked against the ten numbered headings the section holds. No
figure anywhere in this document said seven, so no number had to be corrected to
reach ten; the note is recorded here because a reader counting the headings
should land on ten, and because the four gap figures corrected above were
recomputed rather than carried forward.

**What could not be enumerated, and why.**

- **Route slugs.** The listings give screen titles, not route paths. Every row
  above therefore quotes the listing's own title and marks the route position
  where the listing supplies one, and invents no path. A screen titled
  "Product List 1" is four distinct screens whose routes this survey cannot name.
- **Which screens differ from each other, and how.** The listing gives titles
  only. Two screens titled "Dashboard 1" and "Dashboard 2" within ecommerce are
  two different compositions, and nothing public says what differs. Every status
  judgement above is therefore made at the level of the problem the title names,
  which is the only level the source supports, and it is the reason the record
  index archetype is PARTIAL rather than COVERED for most of its 37 screens.
- **Any screen held behind the authenticated registry.** Not fetched, and the
  survey does not depend on it.
- **Whether a named screen is one surface or several.** A listing entry called
  "Conversation 13" may be one screen or the thirteenth of a set. This survey
  counts it as one screen because that is what the listing enumerates, and says so
  in the count above.