---
Labels: wayfinder:research
Type: research
Status: resolved
---

# What documentation content exists in the old Prism, and what survives the move

## Question

The old repository is public at `github.com/NaniSoft/prism`, branch `main`, and
its site is live at `prism.nanisoft.com`. Its prose is the part of it worth
keeping: this repository's own `DESIGN.md` records that it has no declared
brand north star, and the user has said the old content is better while the old
visuals are not.

Produce an inventory of that content, so the documentation plan can be written
against facts rather than against a URL.

Report, with file paths and sizes:

1. **The full route and section map** of `apps/site`. Every route, what loads
   it, and whether the content behind it is authored MDX, generated, or both.
   Include the blog and `/docs/brand`.
2. **The guides.** Every prose page outside the per-item pages: what it is
   called, its path, its frontmatter, and roughly how long it is. The old map
   claims six guides.
3. **The per-item documentation, item by item.** For all 43 items, the doc
   page's path, the sections it contains, and how long it is. Then classify
   each section as one of: portable verbatim, portable after editing, or
   coupled to the old implementation. A section that documents antd internals,
   a Base UI prop, a Spectral Refraction token, or the old theme model is
   coupled. This classification is the point of the ticket.
4. **The blog.** Every post: title, date, tags, length, and whether it is about
   the design system itself or about NaniSoft products. A post about the
   product is not design-system documentation.
5. **The brand policy page** at `/docs/brand`, in full. It is a legal and
   trademark document, not a tutorial, and it may survive the visual change
   untouched.
6. **The agent-facing corpus** in `packages/llms/src`: the layout, the file
   count, the per-item spec format, the invariants enforced by
   `prism-llms#check`, and how much of the spec text is coupled to the old
   implementation rather than to the component's behaviour.
7. **What the old site does that plasma does not**, and **what plasma does that
   the old site does not**, judged on documentation structure only. Both are
   named as references, so the differences are decisions waiting to be made.

Do not propose a structure. Report what is there, with paths, and let the
decision be made in the documentation content plan.

## Answer

Full report in
[research/01-old-site-documentation-inventory.md](../research/01-old-site-documentation-inventory.md).
Three of this ticket's premises turned out to be wrong, and the corrections
matter more than the inventory.

### There is no per-item prose to classify

All 43 `apps/site/content/{components,blocks,pages}/<item>/index.mdx` files are
emitted by `stubMdx()` in `packages/llms/scripts/generate-content.mjs`, carry a
`prism:generated-owned v2` marker, and contain **zero `##` headings**. Git history
confirms they never were: `button/index.mdx` has two commits and the earlier one
was the v1 antd pass-through stub, also generated.

So the requested classification of "every section of every page" resolves into
its actual components:

- 43 one-line descriptions in `packages/ui/src/catalog.ts`
- 19 authored demo `.tsx` files
- a 452-byte template repeated 43 times

Classified at the level that actually exists, across 230 section instances:
**37 portable verbatim, 1 portable after edit, 192 coupled**, or 83.5 percent
coupled by count but about 3.4 percent by bytes, because the coupled parts are
the small ones. Every coupled instance is listed in the report.

**This is the single most important finding on the map.** The decision to keep
the old repository's content was made on the belief that a 43-item documented
catalogue existed. What exists is roughly 30 KB of authored prose in total.

### The six guides are plasma's, not Prism's

About Content, Audience, Voice, Writing mechanics, Product vocabulary and
Glossary is plasma's `@content` group, which plasma publishes as its Content
Guidelines. Prism's `/docs` has six guides with entirely different names:
**Quickstart, Architecture, Composition, Theming, Agent workflow, Brand
policy**, 14 727 bytes in total. That is the whole authored prose budget of the
old documentation site, and it is the thing worth carrying over.

### The blog has never had a post

`content/blog/` is a single 0-byte `.gitkeep` with one commit in its history. The
live `/blog` renders the empty state and `/rss.xml` has zero items. There is no
blog content to carry, so the blog question in the site architecture ticket is
"author one or drop the section", not "port the posts".

### The corpus is generated, not authored

`packages/llms/src` is four TypeScript modules totalling 16 867 bytes: a
generator, not a corpus. The corpus is build output in a gitignored `dist/`. The
62 files the old map counted are artifacts, so they cannot be carried over as
content; the generator and its seven drift invariants can. The seven invariants
in `check.mjs` are real and each was read in the code.

### The brand policy page is not portable untouched

`/docs/brand` has a "What is ours" section that names Spectral Refraction and the
old pack identifiers. Under the new identity those names are wrong, so the page
currently contradicts itself and needs rewriting rather than copying. It is a
legal and trademark document, so the rewrite has to preserve its intent.

### Layout correction

`apps/site/src` does not exist. The application is `apps/site/{app,components,
lib,scripts,worker,test}`.

### Inferences, flagged

The GitHub API rate-limited partway through, so commit history came from `.atom`
feeds. The full history of `button` was verified; the other 42 items being
always-generated is an inference from probing 24 plausible slugs at two SHAs
rather than from a full tree listing, so a file that was not probed could
theoretically have existed at `721b5f43`. The report also lists the non-site
prose deliberately excluded: the ADRs, `.scratch/prism/`, and the root documents.

