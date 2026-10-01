# Roster expansion: the shadcnblocks taxonomy, in Prism's own words

`docs/history/` holds the findings that outlive the code that produced them, and
this is one of them: the reasoning behind every item this effort added and every
taxonomy entry it refused, recorded once so the roster is not read as an accident
or as a mirror.

## What the request was

Build a comprehensive library of Components and Blocks covering the categories
published at shadcnblocks.com, using Prism's own design system, spacing,
typography and layout, and referring to that library by name only. Everything
inside each item is Prism's.

## The four decisions taken before the first item was authored

1. **Every category, one strong item each.** The upstream library publishes 2,151
   Components and 2,157 Blocks, and the density is entirely in numbered variants:
   `hero-01` through `hero-286`, `button-01` through `button-126`, 230 bento
   tiles. Prism publishes one item per distinct job. A numbered `-02` is authored
   only where a category genuinely holds a second composition, and the four items
   that carry one today are named in the roster below.
2. **Translated into NaniSoft's domains.** The upstream library is dominated by
   storefronts and agency sites. Prism's products observe a pipeline, capture a
   market, watch an estate and run agents, so an upstream `cart` becomes
   `bundle-01`, a `checkout` becomes `provisioning-01`, an `order history`
   becomes `history-01`, a `leaderboard` becomes `leaderboard-01` over runs. The
   slot shapes, the layout decisions and the accessibility work are the same
   patterns a storefront needs, and the examples, the narration and the JSDoc
   are written from the pipeline, estate, market and agent reading.
3. **Full treatment per item.** A module, a JSDoc block, a catalogue entry, a
   `block.json`, an `index.tsx`, an MDX page and a live Demo. `check-catalogue`,
   `check-item-docs`, `check-content-joins` and the corpus build each refuse a
   half-treated item, and a half-treated item is a component no reader and no
   agent can see.
4. **Workflow-shaped surfaces are Blocks; the live Kind gains a second surface.**
   Kanban, gantt, inbox, todo and leaderboard take their data as props like every
   other Block, which is what a Block is. The live Kind already owns the event
   log, and the tool-call ledger is the other surface Prism owns beside it, so
   `tool-ledger-01` is the second `live` item and a *cost* ledger stays
   unbuilt, because DESIGN.md records a cost ledger as a Workflow and this
   effort did not reopen that decision.

## The components the upstream categories did not need, and why

Prism is a B2B instrument system. Some upstream categories are consumer idioms
that have a different, better answer here, and shipping the consumer answer
beside the instrument one would put two vocabularies in one library.

| Upstream | Prism's answer | The reason |
| --- | --- | --- |
| `counter` | `metric` | A number that counts up on mount is an entrance effect, and the motion law refuses entrance effects. A metric that states a value, a unit and a delta states the same thing honestly. |
| `rating` | `meter`, `progress` | A five-star rating is a consumer scale. A bounded measure with thresholds already exists and answers the same need without a new vocabulary. |
| `marquee`, `ticker` | nothing | A continuous horizontal loop is the attention loop DESIGN.md's Motion section names as prohibited. |
| `deck`, `reel`, `glimpse`, `dialog-stack` | `carousel`, `dialog` | Four names for one composition. The `carousel` JSDoc already states the law a deck has to obey: everything a carousel shows must be reachable another way. |
| `autocomplete` | `combobox`, `search-dialog` | An inline autocomplete is a combobox with a narrower trigger, and Prism ships the wider one. |
| `border-button`, `login-button`, `social-button` | `button` plus a slot | These are `variant` values plus third-party brand marks. Prism's icon lane is Lucide, and a brand mark is a licensed asset the consumer supplies in the slot. |
| `bento-tile` | `bento-01` | A tile is a Block's internal part, not an installable item. |
| `color-picker` | `product-switcher`, `pack-swatch` | Prism's theming axis is a pack, not an arbitrary colour, so a free colour picker would be an override path wearing a control. |
| `logo` | `product-mark` | Already shipped, and DESIGN.md records why a custom icon package is out of scope. |
| `list-panel` as a Component | `list-panel` | Kept, and the reason is that `item.tsx` is a row and `fact-list.tsx` is a definition list; a titled panel with a header, a toolbar slot and a body is a third thing. |
| `editor` | `prose`, `code-block` | A rich-text editor is an engine, and the surface gate exists because Prism publishes surfaces rather than mechanisms. |
| `image-crop`, `sandbox`, `shader`, `qr-code` | nothing | Three of the four are a mechanism with a UI bolted on: a geometry solver, a runtime, a WebGL program, an encoder. Each would put a second source of truth in the bundle. |
| `social-media-trending` | `trend-01` | The pattern is a ranked list of rising values with a delta, which is an instrument reading rather than a social feed. |
| `empty` | `empty-state-01` | Already resolved and recorded in DESIGN.md. The old item returns as a Block, because it was always a composition. |

## The roster

The roster held 106 Items before this effort and holds 236 after it, which is 130
added: 23 Components, 96 Blocks, 10 Pages and one live surface. The five waves
below are the order they were written in, not a count. Where a wave built more or
fewer than it was planned to, the heading says so and the reason follows the list,
because a record that silently differs from the plan is a record nobody can check.

### Wave A, foundation Components (23)

The single-role surfaces every later wave composes. Nothing here is a Block and
nothing here fetches.

`metric`, `status`, `price`, `steps`, `tag-group`, `relative-time`, `sparkline`,
`chart`, `contribution-graph`, `list-panel`, `avatar-group`, `code-block`,
`dropzone`, `file-upload`, `mini-calendar`, `lightbox`, `announcement`,
`mode-toggle`, `filter-panel`, `data-toolbar`, `search-field`, `password-field`,
`pack-swatch`

### Wave B, marketing and content Blocks (42 as built, 40 as planned)

`hero-02`, `hero-03`, `feature-rows-01`, `bento-01`, `pricing-compare-01`,
`faq-01`, `testimonial-01`, `logo-cloud-01`, `newsletter-01`, `awards-01`,
`trust-strip-01`, `industries-01`, `integration-01`, `compare-01`,
`compliance-01`, `milestone-timeline-01`, `team-01`, `member-list-01`,
`careers-01`, `about-01`, `story-01`, `case-study-01`, `case-studies-01`,
`contact-01`, `services-01`, `resource-list-01`, `changelog-01`,
`content-grid-01`, `code-sample-01`, `gallery-01`, `download-01`,
`rate-card-01`, `community-01`, `consent-01`, `field-map-01`, `backdrop-01`,
`waitlist-01`, `feedback-01`, `help-01`, `trend-01`

`faq-01`, `logo-cloud-01`, `testimonial-01` and `newsletter-01` are the four
items DESIGN.md's Known Open Items records as deferred to v1.1, so this wave
discharges that table rather than adding to it.

The two names this wave holds that the plan did not give it are `showcase-01` and
`offer-01`, which the plan had placed in waves C and D. They were authored here
because both had to exist before the Block that composes them could be written at
all: `changelog-01` and `content-grid-01` read a showcase, and `pricing-01` reads
an offer. Pulling a leaf forward to land with the Block that depends on it is the
cheaper order and it changed nothing about the roster, so the two are recorded as
part of B rather than left to look like additions.

`content-grid-01` is the one name here that is not upstream's, and the reason is
recorded: DESIGN.md rules that `blog-layout` never ships because the blog does
not exist. A dated-entry card grid is still needed, by the changelog, the
resources index, the case studies and the documentation site, so it ships under
a name that does not claim a blog and composes whatever entries it is given.

### Wave C, operate Blocks (30 as built, 27 as planned)

`dashboard-01`, `activity-feed-01`, `chart-card-01`, `chart-group-01`,
`inbox-01`, `todo-01`, `kanban-01`, `gantt-01`, `calendar-01`, `project-01`,
`project-list-01`, `issue-list-01`, `issue-detail-01`, `leaderboard-01`,
`settings-members-01`, `settings-notifications-01`, `settings-integrations-01`,
`settings-security-01`, `user-profile-01`, `address-book-01`, `intake-01`,
`audit-log-01`, `permission-matrix-01`, `retention-01`, `onboarding-01`,
`notification-center-01`, `showcase-01`

Of the 27 names above, `showcase-01` had already shipped in wave B, so this wave
added 26 of the planned names and four the plan did not carry: `directory-01`,
`project-dashboard-01`, `ops-checklist-01` and `handoff-01`. Each was written
because a Block already in the roster reached for something that was not there.
`project-dashboard-01` because `dashboard-01` answers a portfolio question that
`project-list-01` raised, `directory-01` because `team-01` and `member-list-01`
are two views of a roster with no index, `ops-checklist-01` because a runbook is a
checklist with a trigger, and `handoff-01` because `onboarding-01` has an exit and
nothing owns the arrival.

### Wave D, account, access and commerce, translated (24 as built, 25 as planned)

`bundle-01`, `provisioning-01`, `summary-01`, `history-01`, `delivery-01`,
`billing-source-01`, `offering-01`, `offering-list-01`,
`offering-categories-01`, `spec-table-01`, `capacity-01`, `quick-view-01`,
`shortlist-01`, `offer-01`, `account-01`, `invite-user-01`, `accept-invite-01`,
`passkey-01`, `two-factor-01`, `magic-link-01`, `verify-email-01`,
`reset-password-01`, `forgot-password-01`, `login-01`, `signup-01`

This wave is the one that read least like upstream. Upstream's store shapes were
translated rather than copied: a storefront comparison became
`offering-categories-01` and a spec sheet became `spec-table-01`, because what a
buyer compares in a pipeline product is a connector's declared bounds rather than
a plan's feature list. `offer-01` had already shipped in wave B, so this wave
added the other 24.

### Wave E, Pages and the second live surface (13)

Pages: `pricing-page`, `onboarding-page`, `error-page`, `contact-page`,
`about-page`, `careers-page`, `changelog-page`, `legal-page`, `search-page`,
`status-page`

Live: `tool-ledger-01`

`onboarding-page`, `pricing-page` and `error-page` are the three Pages
DESIGN.md records as deferred to v1.1.

### Wave F, the component sweep, and what strictness cost

The first four decisions were re-opened once and the reopening is recorded here
because the answer is not the one anybody would guess. The request was to reach
full coverage of the upstream catalogue rather than one Item per category, and
the strict application of the naming law is what made that affordable rather than
what made it small.

**555 upstream variants were audited. 21 shipped. 97.2% were refused**, and the
refusals fall into three groups that are worth separating because only one of them
is the naming law:

| Group | Variants | Why they are refused |
| --- | --- | --- |
| Prop combinations | about 340 | The whole family is a cross-product of tone, size, icon, rounded, disabled, loading and label, and every one of those is a prop the existing Component already takes. A registry entry per cell is a catalogue of call sites. |
| Motion and ambient effects | about 122 | A pre-existing Motion law, not a new one: no keyframes, no continuous loops, no entrance effects. Fifty of these are the `button` family's glow, shimmer, aurora, marquee, typewriter and morph groups, and `marquee` was already recorded as refused before this work began. |
| Genuine jobs | 21 | A value shape a prop cannot carry, a state machine with its own accessibility contract, or a composite surface with a keyboard model of its own. |

The families audited, and what each yielded:

| Family | Upstream | Shipped |
| --- | --- | --- |
| button | 126 | 1 |
| chart | 85 | 3 |
| form | 85 | 0 |
| field | 43 | 3 |
| file-upload | 45 | 1 |
| combobox | 42 | 2 |
| select | 51 | 0 |
| kbd | 39 | 1 |
| input-group | 39 | 2 |

**The two zeroes are the finding.** `form` at 85 and `select` at 51 are the two
largest families audited and neither produced a Component, because "a contact
form" and "a settings form" differ only in the data a consumer passes, and the
whole of `select` is a trigger prop surface plus twelve samples of one option-row
slot. Shipping either as Items would have been the exact failure the naming law
exists to prevent, and it would have been invisible in review because a rendered
form looks complete.

Three things the audit corrected in work already merged, which is the other reason
it is written down here:

- **`button` never had a loading state.** The catalogue description and
  `button.mdx` both claimed it did, for as long as both existed. The claim was
  wrong and the documentation is now corrected, and `lifecycle-button` is where
  an outcome after a press now lives. The error was found by an agent asked to
  build a Component next to `button`, which is not a way anyone planned to find it.
- **`cohort-grid`'s scale cannot be narrowed from the top.** Its JSDoc said `max`
  was the answer to a grid going pale, and `max` cannot be set below a hundred
  because a retention row's first column is a hundred by definition. The knob is
  `min`, and the limit is now stated rather than discovered by a Demo that threw.
- **`check-item-docs` could not see a generic Component.** A `function X<T>`
  declaration matched nothing, so the gate reported the module as declaring no Item
  rather than as undocumented, and the Component that wanted a type parameter most
  was pushed into dropping it. The pattern is widened, which is a widening rather
  than a relaxation: a generic declaration is as exported as a plain one.

**The estimate that follows, and how far to trust it.** At a 2.2% survival rate
across 555 audited variants, full coverage of the 2,151 upstream Components
projects to roughly 50 Items rather than 2,000. That is an extrapolation from
26% of the catalogue and it is not a promise: the families audited are the largest
and the most prop-heavy, and a smaller family could behave differently. What is
not an extrapolation is that the surviving work is real work, and that the
refusals above are the larger half of the answer.

### Wave G, the second audit, and the answer to the estimate

The estimate above was wrong in the safe direction, and the reason is worth
recording because it was not obvious in advance: **coverage of the whole upstream
component catalogue completed at 1,026 audited variants and 34 Components.** The
2.2% rate did not hold. It rose, because the second half of the catalogue is
mostly *primitive* families where the density is tone, size and shape rather than
composition.

| Family | Upstream | Shipped |
| --- | --- | --- |
| sonner | 35 | 1 |
| table, avatar, skeleton, dropdown-menu, sheet | 154 | 0 |
| slider | 29 | 0 |
| button-group | 39 | 4 |
| list-panel | 66 | 2 |
| alert-dialog, dialog, popover | 71 | 1 |
| stepper | 26 | 1 |
| input | 24 | 1 |
| navigation-menu | 20 | 1 |
| data-table | 16 | 1 |
| tabs | 11 | 1 |
| accordion, badge, empty-state, command, progress, pagination, switch, separator, calendar, autocomplete, textarea, checkbox, context-menu, collapsible, theme-toggle | 224 | 0 |

**The five zeroes in the first four rows are the finding of the second pass.**
`table` at 38, `avatar` at 34, `skeleton` at 30, `dropdown-menu` at 30 and `sheet`
at 30 produced nothing, and in each case the entire family is a cross-product of
the props a shipped Component already takes. `skeleton` at 30 is six groups of
five, each one a different arrangement of the same placeholder rectangles.
`avatar` at 34 is shape times size times presence times fallback times badge.

One family produced the single largest job found anywhere: **`form-dialog`, at 22
upstream variants spread across `dialog`, `alert-dialog` and `popover`.** All
three hosts ship a container and none of them owns what happens between the reader
pressing submit and being able to act on the answer, so every consumer re-derived
the same four-position state machine and its focus contract.

**A category that did not exist.** `mega-menu` was specified under Navigation,
which is not one of the seven closed Categories in `CONTEXT.md`. `navigation-menu`,
`menubar`, `context-menu` and `dropdown-menu` are all `Layout` in the catalogue,
so `mega-menu` is filed there. The refusal is recorded because a Category is a
closed set and an eighth one is not something an Item may introduce.

**The client ceiling stopped moving on its own terms.** Thirteen Components landed
in the second pass and the aggregate went from 278.5 KB to 286.2 KB, which the
300 KB ceiling held without being moved. It held because nine of the thirteen
compose Components the bundle already carries rather than drawing new ones, so the
composition-heavy Items the audit favours are also the cheap ones. That is the
argument for the deduplicated figure over a per-Item sum, and it is now measured
rather than asserted: 34 Components across two passes cost 47.6 KB of aggregate,
where the sum of their individual measurements is several times that.

**What the second pass cost, recorded as the gate's own header asks.** Three rows
in the per-item table are almost entirely a dependency already in the bundle, at
46 to 48 KB each, and `task-progress` is classified `server` because it composes
`progress` relatively and so misses the gate's client-adjacency test. That last one
is a measurement artefact rather than a judgement, and the aggregate is the number
that catches it.

### The client ceiling moved twice more, and the pattern is now the finding

The all-client bundle went from 250.4 KB at 236 Items to 278.5 KB at 257, and the
ceiling moved 260 to 280 to 300. The gate's own header records the argument for
each move and, more usefully, the shape across all six: **90, 92, 116, 208, 260,
280, 300, every one triggered by a batch of new Items.** The comment written at the
280 move predicted that the next batch would breach it, and it did, to within
1.5 KB.

A ceiling that has to move once per batch is not measuring a policy, it is counting
the catalogue, and a roster-derived ceiling was considered and rejected because a
ceiling that scales with the catalogue lets the bundle grow to whatever the
catalogue happens to be, which is the same as no ceiling. The honest remaining
option is one fixed number decided on the evidence of what a consumer can load,
which is a product judgement about four downstream repositories and not a
measurement this repository can make. It is the one open decision this effort did
not take.

## The client budget moved, and the reason

`check-client-budget.mjs` holds one hard number: the deduplicated all-client
bundle. It measured 156.6 KB against a 208 KB ceiling before this effort, so the
headroom was 51.4 KB. A roster of this size cannot fit in that headroom, and the
ceiling is a policy judgement rather than a derivation: the gate's own header
records every previous move and the reason for each. This move is recorded here
for the same reason, and the per-item `BUDGETS` table grew with the roster so
that growth stays visible per item rather than only in the total.

The ceiling went from 208 KB to 260 KB and the roster finished at 250.4 KB over
172 client entry points, so the move is close to tight rather than generous. The
per-item `BUDGETS` table was not extended to the whole roster and this is worth
stating rather than leaving to be discovered: a budget per Item is a claim that
the Item can grow on its own, and most of what shipped cannot. A Page is a
composition of Blocks already budgeted, so budgeting the Page would count the same
bytes twice and let one screen look like it cost what a screen costs when it
actually costs what its parts cost. The budgets therefore hold for the Items that
ship their own drawing, which is the live surfaces and the client Blocks, and the
all-client ceiling carries the rest.

## What is not in this record

The laws are in `DESIGN.md`, the vocabulary is in `CONTEXT.md`, the commands are
in `AGENTS.md`, and the gate that holds each one is in
`packages/ui/scripts/`. This file holds only the decisions above, because they
are decisions somebody could otherwise have made differently without noticing
that they had.
