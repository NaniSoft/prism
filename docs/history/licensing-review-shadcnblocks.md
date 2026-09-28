# Licensing review: Prism against shadcnblocks

**Question asked:** does Prism currently hold any licensing or legal exposure
relative to the paid product sold at shadcnblocks.com?

**Date of review:** 2026-09-28. All external sources retrieved on that date.

**This document is not legal advice.** It reports what the terms say and what the
repository contains. A lawyer decides whether any of it matters.

---

## Verdict

**No evidence of derivation from, or copying of, shadcnblocks' paid Components
was found.** The repository contains no reference to shadcnblocks in any source
file, any configuration, any commit message, or any published artefact. Where
the repository's own history mentions shadcnblocks, it does so to state a
deliberate non-derivation.

**NaniSoft holds no shadcnblocks licence** (confirmed 2026-09-28). That is the
favourable position and not merely the low-exposure one: a paid licence would
have prohibited building a UI library using Components, and Prism is a public MIT
UI library. Holding one and deriving would have been the bad state. Holding none
and not deriving is the state that is actually true. See Part 4, which also
separates the three products whose names are easily conflated, and records the
one of them that no purchase protects against.

**Three real gaps do exist**, none of them shadcnblocks-related:

1. Four already-published npm tarballs ship an MIT `LICENSE` with **no
   `THIRD-PARTY-NOTICES.md`** (severity: low, but it is a stated house rule the
   published artefacts do not meet).
2. The GitHub repository description says Prism is **"Ant Design-based"**, which
   is false of the current code and unsupported by any notice.
3. One Block demo renders **real third-party commercial names** on the public
   documentation site, inside the one Block whose JSDoc forbids exactly that.

---

## Part 1: What shadcnblocks' terms actually say

Source: `https://shadcnblocks.com/license` (retrieved 2026-09-28). There is no
separate Terms of Service; `/terms` and `/terms-of-service` both 404.

### Ownership and inheritance

> "All Components remain the copyrighted property of Shadcnblocks.com. This
> agreement grants only the permissions described above-all other rights are
> reserved. Shadcnblocks.com reserves the right to pursue legal remedies for any
> unauthorized use of the Components outside the scope of this license."

The License Agreement **never mentions shadcn/ui, MIT, or any upstream
license**. It is a direct proprietary grant, not a sub-licence of shadcn/ui's
MIT. So "it is built on shadcn/ui, which is MIT" is not a defence the vendor's
own terms leave open.

### Restrictions (verbatim, complete)

> "The Licensee may not:
> - Resell or redistribute the Components or their derivatives separate from an
>   End Product.
> - Use the Components to create a product that directly competes with
>   Shadcnblocks.com or the original Components.
> - Share or distribute the Components outside the scope of your license type."

### The examples of restrictions (verbatim, complete)

This is the clause that answers the question directly:

> "Examples of restrictions:
> - **Publishing the Components or their derivatives in a public repository.**
> - **Building a UI library using Components and distributing it, for sale or
>   for free.**
> - Creating Figma, Sketch, or other design kits based on Components and
>   distributing them, for sale or for free.
> - Producing themes, templates, or starter kits using Components and
>   distributing them, for sale or for free.
> - Creating a "website builder" that allows End Users to create their own
>   websites using Components.
> - Creating an AI generator trained on Components, or incorporating Components
>   into a tool that allows End Users to generate websites or applications.
> - Publishing Components or their derivatives on marketplaces like Themeforest
>   or 21st.dev.
> The above examples are illustrative and not exhaustive."

Plus, at the head of the agreement:

> "The distribution of Shadcnblocks.com Components or derivatives through
> marketplaces, AI site builders, code generation tools, or any automated
> component generation platform is strictly prohibited under this License
> Agreement."

**So the two clauses that would bite Prism are conditional on derivation:**
"publishing Components or their derivatives in a public repository", and
"building a UI library using Components". Prism is a public MIT UI library, so
if any of its code were shadcnblocks Components or derivatives, both clauses
would apply at once. Neither is triggered, because no Component was derived.

### License types

> "Shadcnblocks.com offers two license types: **Standard** and **Team**. Both
> types inherit the full set of permitted uses, restrictions, and obligations
> described above. The difference between them is how access is managed and the
> number of users permitted."

Standard is one individual; Team is up to 10 employees and contractors. There
is **no** tier named Personal, Commercial, Extended or Developer. Verified
against `/license` and against a full-text search of `/pricing` (zero matches
for `Extended`, `Developer License`, `Personal`, `Commercial` as tier names).

Governing law: Australia, exclusive jurisdiction the courts of Australia.

### Delivery

Private authenticated registry at `https://www.shadcnblocks.com/r/{style}/{name}`
with a `Bearer` key. Confirmed empirically: `/r/hero1` returns HTTP 200 with a
full payload; `/r/hero125`, `/r/pricing1`, `/r/stats1`, `/r/cta1` all return
HTTP 401 without auth. No npm package exists under `scope:shadcnblocks`. There
is no vendor CLI; it uses upstream `shadcn`.

### The free-blocks repository carries a different, non-OSI license

`https://github.com/shadcnblocks/shadcn-ui-blocks` ("55 free marketing blocks
for shadcn/ui") ships **MIT + Commons Clause**, not plain MIT:

> "## Commons Clause Restriction
> You may use this Software, including for any commercial purpose, so long as
> you do not sell, sublicense, or redistribute the components themselves-whether
> alone, in a bundle, or as a ported version."

GitHub classifies the repo as `spdx_id: NOASSERTION`, key `other`.

The Commons Clause bars exactly what a Prism would be if derived: a
redistributed UI library. It is not OSI-approved, so calling it "MIT" would be
wrong. **Unverified:** which text governs a given free download, since the
registry-delivered payload carries no `license` field and no header, and the
repository's own README points at the same public block gallery the registry
serves from.

### The vendor's own relationship statements, both recorded

- `/about`: "a library of extra blocks and components **built using the open
  source shadcn/ui library**"
- `/about`: "All of our blocks are custom-built from scratch… **We don't use
  open-source code**"

These are in tension with each other. Both are on the vendor's site. Neither
appears in the License Agreement.

### shadcn/ui, for contrast

`shadcn-ui/ui` is `MIT License, Copyright (c) 2023 shadcn`. Its own framing:

> "This is not a component library. It is how you build your component library."

Its registry item schema has **no `license` field**, so no registry payload
carries one, from shadcn or from shadcnblocks. shadcnblocks is listed in
shadcn's own open-source registry index as `@shadcnblocks`.

---

## Part 2: What Prism actually contains

### The registry is internal and is gated out of every tarball

`packages/ui/registry.json` and `packages/ui/components.json` reference
`ui.shadcn.com` in two places only, both as JSON-Schema `$schema` identifiers,
which are never fetched. `"style": "base-nova"` is Prism's own Base UI style
name, not a shadcn style. No `registries` key, no `registry:https` dependency,
no external registry base URL anywhere.

`scripts/verify-tarballs.mjs` fails a release if any of these reach npm:

```js
{ pattern: /(^|\/)registry\.json$/, message: 'internal registry leaked' },
{ pattern: /(^|\/)components\.json$/, message: 'internal registry config leaked' },
{ pattern: /(^|\/)public\/r\//, message: 'internal registry output leaked' },
```

The same script requires `LICENSE` and `THIRD-PARTY-NOTICES.md` in every
tarball (lines 187-188). This gate is why the current line is clean, and why
the two failures in Part 3 are visible rather than silent.

### No file carries a vendor string

Worktree-wide, case-insensitive, excluding `node_modules`: zero hits for
`shadcnblocks`, `shadcnblocks.com`, `Shadcn Blocks`, or `license key`.

All 39 hits for `shadcn` fall into exactly three categories:

| Category | Example | File:line |
| --- | --- | --- |
| The public MIT variable contract, as a compatibility target | "the semantic names are shadcn's variable contract" | `DESIGN.md:244-248` |
| A refusal of the copy-out model | "an internal integrity artifact, never a public install lane" | `AGENTS.md`, `DESIGN.md:604` |
| A JSON-Schema identifier for the public MIT CLI | `"$schema": "https://ui.shadcn.com/schema.json"` | `packages/ui/components.json:2` |

### Git history

`git log --all -S"shadcnblocks"` returns two commits: `af80270` and `b1dd68c`.
In `af80270` the string appears **only inside `.scratch/` planning documents**,
now deleted, and always in a sentence asserting non-derivation:

> "Structure follows shadcnblocks' components → blocks → pages organization and
> its pattern-first composition discipline, **but no stock shadcn layout or
> default theme is copied**."
> - `.scratch/prism-base-ui/direction-contract.md:21` (deleted)

> "Taxonomy: components → blocks → pages. shadcnblocks informs the organization
> and composition depth, **not Prism's visual identity**."
> - `.scratch/prism-base-ui/map.md:14` (deleted)

> "Build representative **shadcnblocks-inspired** production compositions while
> keeping the taxonomy and Spectral Refraction voice Prism-owned."
> - `.scratch/prism-base-ui/issues/03-blocks-and-pages.md:9` (deleted)

`b1dd68c` is the DTCG rebuild, which deleted `.scratch/` entirely. The current
tree has zero hits. The `.scratch` documents are the honest record: the
taxonomy and the composition depth were consciously taken as **organisational**
inspiration, with the visuals and the code declared Prism-owned from the start.

### The `-01` naming overlap, measured against the vendor's actual convention

Six Block names coincide with a shadcnblocks name: `hero-01`, `cta-01`,
`pricing-01`, `stats-01`, `feature-grid-01`, `logo-strip-01`. Thirteen of
nineteen do not (`instrument-panel-01`, `status-ledger-01`, `process-rail-01`,
`stack-grid-01`, `note-grid-01`, `site-header`, `site-footer`).

Naming overlap is not evidence of copying, and three checks confirm it here:

**1. The convention itself is Prism's, not the vendor's.** shadcnblocks names
its blocks `hero1`, `hero115`, `cta10`, `pricing2`, `feature166`, `stats8`,
`logos8` - a bare numeral with no hyphen, and the numeral is a catalogue index
rather than a family ordinal. Prism uses `hero-01`, a hyphen and a zero-padded
two-digit family ordinal. A scan of all 108 block-category slugs on
`https://shadcnblocks.com/blocks` found **zero** containing a digit, and zero
hyphen-number tokens in the page. Prism's convention is documented in-repo as
its own rule:

> "The `01` suffix is the variant ordinal of the hero family, and this one is
> the centered form." - `apps/site/items/block/hero-01/hero-01.mdx:9-10`

and encoded as a gate in `packages/ui/scripts/check-catalogue.mjs`.

**2. Where the names came from is recorded.** Every documented name decision
cites NaniSoft's own four consumer sites, never an external catalogue:

> "The name follows the four import lines rather than the shape of this table,
> because a published name cannot be cheaply changed and there is no redirect
> lane for item routes." - `DESIGN.md:885-894`

**3. The code is structurally unrelated.** The free shadcnblocks sources are
public, so they can be compared directly. I diffed Prism's class strings
against `hero1.tsx`, `pricing2.tsx`, `stats8.tsx`, `feature1.tsx` and `cta10.tsx`
at `raw.githubusercontent.com/shadcnblocks/shadcn-ui-blocks`. **Zero shared
runs of 3 to 6 consecutive Tailwind tokens** in any pair. The shapes differ
structurally too: shadcnblocks' `hero1` is a two-column grid with an
`image`/`imageDark` prop pair and a `defaultProps` object of vendor copy;
Prism's `Hero01` is a single centered column with an `align` prop, a
`headingLevel` prop, and **no default props at all**.

### The Blocks record their own copy-purge in JSDoc

This is the strongest single piece of evidence, because paid template blocks
hardcode demo copy and Prism's Blocks explicitly document having had that copy
removed:

| Block | JSDoc record | File:line |
| --- | --- | --- |
| `hero-01` | "an earlier version shipped a hardcoded **'Now in open beta' pill**, which meant every consumer who installed this block inherited a status badge making a claim about their product" | `hero.tsx:15-19` |
| `cta-01` | "It previously shipped the catalog's own pitch ('Start with one block, keep the tokens') and a hardcoded 'Browse the catalog' button" | `cta.tsx:76-80` |
| `pricing-01` | "It previously hardcoded '$0 / $24 / $68', 'Talk to us', 'MIT licence' and 'Figma library'" | `pricing.tsx:41-46` |
| `stats-01` | "This block used to carry a hardcoded set reading **'128 blocks shipped' and '9.4k weekly installs'. Those were invented figures about a library nobody installs yet**" | `stats.tsx:50-55` |
| `feature-grid-01` | "It previously hardcoded the catalog's own selling points under the heading 'Why this catalog', so an installed block argued for the library inside the consumer's product" | `feature-grid.tsx:73-76` |
| `logo-strip-01` | "There is no default list of technologies, no default list of customers and no default list of words: a strip that hardcoded any of them would hand every consumer a claim about who uses their product" | `logo-strip.tsx:18-21` |

I confirmed the `pricing-01` claim in history rather than taking the JSDoc at
its word: `git show b1dd68c:packages/ui/src/components/ds/blocks/pricing-01/pricing.tsx`
contains those five strings **only inside the JSDoc comment at line 42**, and
nowhere in the code. The JSDoc is telling the truth about its own past.

And the purge is enforced, not merely narrated.
`packages/ui/scripts/check-block-copy.mjs` (560 lines) exists solely to fail the
build on any word-shaped string literal in a Block, and its own header names
the defect it was written for:

> "`pricing-01` shipped exactly this: a featured plan with no badge of its own
> rendered the word 'Popular', which is a claim about a plan a consumer may not
> have."

A repository holding copied paid template markup could not pass its own build.

### The component layer is Base UI, and shadcnblocks' is not

`@radix-ui` appears **zero** times in the repository. The primitive layer is
`@base-ui/react`, imported per component:

```
accordion.tsx:3   @base-ui/react/accordion
avatar.tsx:3      @base-ui/react/avatar
checkbox.tsx:3    @base-ui/react/checkbox
dialog.tsx:3      @base-ui/react/dialog
dropdown-menu.tsx:3  @base-ui/react/menu
popover.tsx:3     @base-ui/react/popover
progress.tsx:3    @base-ui/react/progress
radio-group.tsx:3 @base-ui/react/radio, /radio-group
select.tsx:3      @base-ui/react/select
slider.tsx:3      @base-ui/react/slider
switch.tsx:3      @base-ui/react/switch
tabs.tsx:3        @base-ui/react/tabs
tooltip.tsx:3     @base-ui/react/tooltip
```

The commit `af80270` is titled "Complete Prism-owned Base UI clean break", and
the prior published line was **Ant Design**-based, not shadcn-based
(`packages/ui/package.json` at `af80270^`: "components, blocks, and pages over
Ant Design v6"). So the history runs *away* from both Ant Design and Radix,
toward a substrate shadcnblocks does not use.

Where Prism deliberately departs from shadcn/ui, it says so in the source, and
locks the departure with a test:

> "The focus ring is `ring-ring` at full strength, **not shadcn's stock
> `focus-visible:ring-ring/50`**… 50% of this ring composites to between 1.14:1
> and 2.74:1 against every surface in all six themes and clears 3:1 in none of
> them, which fails WCAG 1.4.11… **The stock value is kept here deliberately as
> a deviation from upstream**." - `packages/ui/src/components/ui/button.tsx:7-14`

Locked at `packages/ui/test/focus-indicators-gate.test.tsx:245`.

Ten of the thirty-four Components do not exist in shadcn/ui at all:
`Typography`, `Section`, `SectionHeading`, `CtaLink`, `Field`, `Diagram`,
`ProductMark`, `ProductSwitcher`, `FactList`, `Prose`.

### shadcn/ui influence that IS present, and is permitted

shadcn/ui is MIT, so reuse is lawful. Two traces, stated plainly:

- `packages/ui/src/lib/utils.ts:4-6` is shadcn/ui's canonical `cn()` helper:
  `twMerge(clsx(inputs))`. Two lines, the most widely copied line in the shadcn
  ecosystem, conventionally not individually attributed.
- The `cva` variant recipes on `button`, `alert`, `badge`, `cta-link` and
  `typography` use shadcn's variant names (`default`, `destructive`, `outline`,
  `secondary`, `ghost`, `link`) and the `data-slot` convention.

Neither is a legal problem. If a stricter attribution posture is wanted,
`utils.ts` is the single place to note it. Note also that `class-variance-authority`
itself is **Apache-2.0**, correctly declared as such at
`THIRD-PARTY-NOTICES.md:24` amid an otherwise-MIT set.

### Demo and sample data

No external image host, CDN, avatar service or stock-photo service appears
anywhere in `apps/`. Every URL is `prism.nanisoft.com`, a sibling
`*.nanisoft.com` domain, `nanisoft.com`, `github.com/NaniSoft/*`, `example.com`,
`127.0.0.1`, or a `$schema`/namespace/licence-text reference. The one image
asset is an inline `data:` SVG (`avatar.tsx:3-4`).

Findings, in descending order of attention:

| Finding | Location | Assessment |
| --- | --- | --- |
| Real commercial third-party names render on the public site: `Fyers v3`, `yfinance`, `nselib / nse-xbrl`, `NSE filings`. Fyers is a real Indian brokerage; NSE is a real exchange. | `apps/site/items/block/logo-strip-01/logo-strip-01.tsx:8` | **Fix.** A reader can reasonably read a logo strip as a customer or partner claim. This is NaniSoft's real data stack, so the strings are honest, but the block's own JSDoc forbids shipping a claim, and the demo supplies one. Neutral placeholders, or a `label` that frames them as source kinds, cost nothing. |
| `Ada Lovelace` as example-user data. | `avatar.tsx:21`, `field.tsx:17` | **Cosmetic.** A real historical person, deceased 1852, in the `John Doe` register. Worth changing only for consistency: the same files use `AL`, `PR`, `SM` as initials, so only `AL` maps to a named person. |
| Microsoft sample-data company names: `Northwind`, `Contoso`, `Fabrikam`, `Adventure Works`, `Litware`, `Proseware`. | 16 occurrences across 8 files, e.g. `data-table-01.tsx:9-14`, duplicated verbatim at `dashboard-page.tsx:14-19` | **Cosmetic.** Decades-old public sample data, no trademark issue in this use. The verbatim duplication between two files is a maintenance smell, not a legal one. |
| No testimonials, no "trusted by", no customer logos, no review quotes anywhere. | searched `testimonial`, `trusted by`, `customers`, `as seen`, `join … companies`, `used by` across `apps/` | Clean. This is where paid templates most often carry copied content. |
| Emails are all `example.com`. | `auth-form-01.tsx:25`, `auth-page.tsx:26`, `input.tsx:10`, `field.tsx:34` | Clean. IANA-reserved. |
| Pricing and stats are abstract placeholders. | `pricing-01.tsx:10-12`, `stats-01.tsx:11-14` | Clean. "First plan", "First metric". The site's own landing page computes its counts live from the catalogue. |

### Fonts and binaries

Two files, both SIL OFL 1.1, with the licence text committed beside them at
`apps/site/src/fonts/LICENSE.txt` and the attribution recorded at
`THIRD-PARTY-NOTICES.md:35-41`. No `.svg`, `.png`, `.jpg` or `.webp` exists in
the repository outside `apps/site/e2e/__screenshots__/`, which are
Playwright-captured baselines of the site's own pages.

### What Prism says about itself

> "Prism is owned source. It uses Base UI for accessible interaction behavior
> internally, then applies its own props, anatomy, tokens and composition
> patterns." - `apps/site/content/overview/architecture.mdx:6-8`

> "The Prism packages are MIT-licensed, copyright NaniSoft, 2026… Attribution
> and third-party notices live in the repository's `THIRD-PARTY-NOTICES.md`."
> - `apps/site/content/overview/brand.mdx:6-8`

> "Because the semantic names are shadcn's variable contract, an unmodified
> shadcn block or theme works against the packs with no rename."
> - `architecture.mdx:57-58`

That last one is the honest statement of the relationship: Prism targets
shadcn's **public MIT variable contract** for interoperability, which is a
compatibility decision and not a source of code.

---

## Part 3: Findings that are real, ranked

### 1. Four published tarballs ship without `THIRD-PARTY-NOTICES.md`

| Package | Version | `LICENSE` | `THIRD-PARTY-NOTICES.md` |
| --- | --- | --- | --- |
| `prism-ui` | 0.2.0, 0.3.0, 0.4.0 | yes | **no** |
| `prism-tokens` | 0.2.0, 0.3.0 | yes | **no** |
| `prism-llms` | 0.2.0, 0.3.0, 0.4.0 | yes | **no** |
| `prism-mcp-server` | 0.2.0, 0.3.0 | yes | **no** |
| `prism-ui` | **0.5.0** | **no** | **no** |
| `prism-tokens` | **0.5.0** | **no** | **no** |
| `prism-ui` | 0.5.1, 0.6.0 | yes | yes |
| `prism-tokens` | 0.5.1, 0.6.0 | yes | yes |
| `prism-llms` | 0.5.0 | yes | yes |
| `prism-mcp-server` | 0.4.0 | yes | yes |

`@nanisoft/prism-ui@0.5.0` and `@nanisoft/prism-tokens@0.5.0` ship **no
`LICENSE` file at all**, while their `package.json` declares `"license": "MIT"`.
MIT requires the copyright notice to be included in copies, so those two
tarballs are the sharpest edge here. Their 34 and 35 entries are respectively
`src/`, `registry.json`, `public/r/` and `components.json` - the 0.5.0 line
published source and the registry, which the current line correctly gates out.

The other eight ship an MIT `LICENSE` but no notices file, so the `LICENSE`
condition is met and only the house rule in `CONTRIBUTING.md:280-281` is
breached ("Third-party works are attributed in `THIRD-PARTY-NOTICES.md`"). The
notices file did not exist until commit `d23e039`, which post-dates all of
them.

`prism-ui@0.2.0` through `0.4.0` are the Ant Design-based line, and their
`dist/` is 461-463 files of Ant Design re-exports. antd is MIT, so the
underlying grant is fine; the missing notices file is the gap, and it is now
historical.

**Remedy:** the current line is correct and gated. The historical line is
either accepted as-is, or republished under a deprecation note. npm does not
allow overwriting a published version, so the practical options are a
`deprecated` npm dist-tag, a note in the changelog, or a fresh version. Worth
deciding explicitly rather than by default.

### 2. The GitHub repository description is false and unsupported

`github.com/NaniSoft/prism` is described as:

> "Prism - one design language, many expressions. **NaniSoft's Ant Design-based
> design system**."

Ant Design is not a dependency of the current code (`@radix-ui` and `antd`
both appear zero times in `packages/ui`; `scripts/check-no-legacy-line.mjs`
asserts antd's absence from the lockfile). It was accurate for the 0.2-0.4
line and is not now. `THIRD-PARTY-NOTICES.md` does not list Ant Design either,
so the description asserts a lineage that nothing in the repository supports.

This is a public, first-party, uncorrected misstatement about a third-party
project. Low legal risk, real reputational cost, and a one-line fix.

### 3. `logo-strip-01` demo renders real third-party brands

Covered above. `apps/site/items/block/logo-strip-01/logo-strip-01.tsx:8`.

### 4. The four sibling sites have no license or notices

`landing-page`, `nexus`, `atlas` and `alphalens` each have a `package.json` with
no `license` field, and no `LICENSE` or `THIRD-PARTY-NOTICES.md` file. All four
are `"private": true`, so nothing is published and the omission has no
consequence today. The three older ones still depend on
`@nanisoft/prism-ui@0.4.0` and `@ant-design/nextjs-registry`, so if any of them
is ever opened up, the notices work has not been done for it.

### 5. The `.scratch` record is the one thing to be aware of

The deleted planning documents state that shadcnblocks informed the
taxonomy. That is organisational inspiration, which the vendor's terms do not
restrict, and the same documents state that no layout, theme or code was
copied. There is no exposure in it. But it is on the public git history of
`main` (`af80270` is an ancestor of `origin/main`), so anyone auditing the
repository will read it. It is more reassuring that it exists and says what it
says than if it had been quietly rewritten.

---

## Part 4: The licence position, confirmed

**Confirmed by NaniSoft on 2026-09-28: NaniSoft holds no shadcnblocks licence.**
Neither Standard nor Team, and no purchase by any contributor. This closes the one
question Part 1 of this review left open, because a purchase would not have shown
up in the code.

The answer is more favourable than "less exposure", and the reason is worth stating
plainly, because it inverts the intuition:

- **A licence would have been the worse position.** The License Agreement's own
  examples of what is prohibited include building a UI library using Components.
  Prism is a public MIT UI library. So the bad state was always *hold a licence and
  derive from it*, and the good state is the one that is actually true: no licence,
  no derivation.
- **No licence means no grant at all.** Standard and Team are the only sources of
  permission under the License Agreement, and neither is held, so there is no
  permission to use their Components in the first place. Independent authorship is
  therefore required rather than merely prudent. It is not a belt-and-braces
  posture chosen for comfort; it is the only lawful position available.
- **Access confirms it independently.** Their delivery is a private authenticated
  registry. Without a Bearer key the registry answers 401, so the Components are
  not obtainable. Independent authorship is not only permitted, it is the only
  available path. (One block, `/r/hero1`, answered 200 without a key at the time of
  review. Availability of a single payload is not permission to use it.)

### Three products, and the distinction matters

The phrase "a shadcn licence" is ambiguous across three separate things, and
conflating them is how a clean position gets lost:

| Product | Terms | Does a purchase help? |
| --- | --- | --- |
| shadcn/ui | MIT, "This is not a component library. It is how you build your component library." | No purchase exists or is needed. |
| shadcnblocks paid Components | Proprietary, Australian law, Standard or Team | Yes, and it would be the wrong thing to hold. |
| shadcnblocks free-blocks repo | MIT **plus Commons Clause** | No purchase is involved, so **no licence protects against this one.** |

The third row is the one that is easy to miss. The free-blocks repository is
publicly downloadable with no account and no purchase, and its Commons Clause
restricts use on terms that "do not sell, sublicense, or redistribute the
components themselves, whether alone, in a bundle, or as a ported version." That
clause attaches to the free download, not to a paid tier. Declining to buy a
licence does not exempt anyone from it.

What keeps Prism clear of the Commons Clause is the no-derivation finding in Part 2,
and only that. The shared-token diff against the five free blocks is zero, the
component layer is Base UI rather than theirs, no vendor string appears in any
source file, and the Block JSDoc records the removal of exactly the copy a template
ships.

### What still would change this verdict

One thing only: **evidence that a Block's source was taken or adapted from a
shadcnblocks payload**, whether from a paid registry or from the free repository.
The vendor's terms would then prohibit the public repository and the
UI-library distribution, the MIT grant over the affected code would be void, and
the Commons Clause would independently bar redistribution of the components
themselves. Today the shared-token diff is zero, the shapes differ, and no
shadcnblocks string appears anywhere in the repository.

---

## Appendix: sources

| Claim | Source | Retrieved |
| --- | --- | --- |
| License Agreement, restrictions, examples, tiers, ownership, governing law | `https://shadcnblocks.com/license` | 2026-09-28 |
| No separate ToS | `https://shadcnblocks.com/terms`, `/terms-of-service` (both 404) | 2026-09-28 |
| Tier names, absence of Extended/Developer/Personal/Commercial | `https://shadcnblocks.com/pricing` full-text | 2026-09-28 |
| Free vs pro statement | `https://shadcnblocks.com/faq` (content in `/_astro/GeneralFaq.*.js`) | 2026-09-28 |
| MIT + Commons Clause on the free-blocks repo | `https://raw.githubusercontent.com/shadcnblocks/shadcn-ui-blocks/master/LICENSE.md` | 2026-09-28 |
| `NOASSERTION` classification | `https://api.github.com/repos/shadcnblocks/shadcn-ui-blocks/license` | 2026-09-28 |
| Free-block source, for token diff | `https://raw.githubusercontent.com/shadcnblocks/shadcn-ui-blocks/master/src/block/{hero1,pricing2,stats8,feature1,cta10,logos8}.tsx` | 2026-09-28 |
| Block naming, 108 category slugs, zero digits | `https://shadcnblocks.com/blocks` | 2026-09-28 |
| Registry gating: `/r/hero1` 200, paid 401 | `https://www.shadcnblocks.com/r/hero1` | 2026-09-28 |
| shadcn/ui MIT, "not a component library" | `shadcn-ui/ui` `LICENSE`, `README.md` | 2026-09-28 |
| shadcnblocks listed as `@shadcnblocks` in shadcn's registry index | `https://ui.shadcn.com/registry` | 2026-09-28 |
| Prism LICENSE | `prism/LICENSE:1-3` | in-repo |
| Prism notices | `THIRD-PARTY-NOTICES.md`, identical across all four packages (same SHA-256) | in-repo |
| Inter OFL 1.1 | `apps/site/src/fonts/LICENSE.txt:1-5` | in-repo |
| Tarball contents for all 19 published versions | `https://registry.npmjs.org/@nanisoft/{prism-ui,prism-tokens,prism-llms,prism-mcp-server}` and each `.tgz` | 2026-09-28 |
| GitHub repo description | `https://api.github.com/repos/NaniSoft/prism` | 2026-09-28 |

**Unverified, and left unverified:** which license text governs a free
shadcnblocks download from the registry versus from the GitHub repo (the
payload has no `license` field); whether paid payloads carry a header (the
authenticated payload was not retrieved); Team-plan pricing (rendered
client-side); the effective date of the current License Agreement; whether
Plasma (Coveo), named in `docs/docs-site-spec.md:21-24` as the information
architecture reference, imposes any terms on the organisational inspiration it
was used for.
