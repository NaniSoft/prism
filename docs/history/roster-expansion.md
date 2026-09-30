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
