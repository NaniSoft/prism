# @nanisoft/prism-llms

## 0.5.0

### Minor Changes

- 76c8d96: Fourteen items, four catalogue gates, and a Block that publishes its interface
  
  **Fourteen items ship.** Three Components (`Prose`, `FactList`, `ProductSwitcher`),
  nine Blocks (`ProcessRail01`, `StatusLedger01`, `ProductGrid01`, `StackGrid01`,
  `LogoStrip01`, `NoteGrid01`, `InstrumentPanel01`, `SiteHeader`, `SiteFooter`) and two
  Pages (`NotFoundPage`, `BlogPostPage`). Every one of them earns its place by the
  growth rule rather than by taste: a marketing Block when at least three of the four
  sites compose that section today, a Component when it has one job no existing
  Component can express. The evidence is in the ticket and in each item's own
  JSDoc, which names the sites and the line numbers.
  
  **The three contested shapes are settled as specified, and the specifications
  held.** A process rail admits four steps and refuses five, in the type: `steps` is
  a tuple union, so a five-element array is a compile error and not a fifth column. A
  status ledger has four tiers rather than five, and the words for a tier are the
  caller's: the four sites between them use eight words for those four states
  (`live`, `available` and `complete` are one; `approved`, `specified` and `designed`
  are one; then `planned`; then `direction`), and the vocabulary is what `statusLabel`
  is for. A product row's mark is two parts because a filled dot fails contrast on a
  light card, so the mark is `ProductMark`: a hairline ring in `brand-ink` around a
  core in the product's own `primary` fill, with the name in the brand ink beside it.
  
  **Four gates the catalogue's own rules depend on now exist and are wired into
  `check` and, because they read only `src/`, into `build`.** `check-item-docs`
  holds AGENTS.md's claim that a documentation comment is the only path from an Item
  to its published interface. `check-block-copy` holds DESIGN.md's claim that a
  Block ships no copy and no sample data. `check-item-category` holds CONTEXT.md's
  closed set of seven Categories and the sentence that a Block and a Page have none.
  `check-block-imports` holds the claim that a Block fetches nothing and a Page
  imports no router and no data client. Each resolves its roots from its own
  location, fails a root that resolves to nothing, prints its coverage and every
  exclusion on every run, has no report-only mode, and is proved red by a fixture
  before it is proved green.
  
  **Two of those four gates were red on the tree they were written against, and both
  findings were real.** `check-item-docs` found seven exported functions whose
  documentation comment was not attached to the declaration: `CardHeader`,
  `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `SectionHeading` and
  `Hero01`. A comment three functions above a declaration does not reach the emitted
  `.d.ts`, so those seven were absent from the corpus. `check-block-copy` found
  `pricing-01` rendering the word "Popular" on a featured plan that passed no badge:
  a hardcoded claim every consumer of the Block inherited, published by the corpus as
  part of the Block's own documentation. The fallback is gone; a featured plan with
  no badge now renders no badge.
  
  **Five additive fields on four shipped items**, each with three of the four
  consumers passing a value the item could not take, counted per consumer with a
  file and a line and never per string. `SectionHeading.index`, for the mono ordinal
  all four sites render above every section head (www `Landing.tsx:49`, atlas
  `landing.tsx:48`, nexus `Landing.tsx:38`, alphalens `Landing.tsx:66`).
  `Cta01.secondaryAction`, for the pair of actions all four closing bands render
  (www `Landing.tsx:186`, atlas `landing.tsx:243`, nexus `Landing.tsx:221`,
  alphalens `Landing.tsx:285`). `Cta01.note`, for the footnote three of the four
  render under it (atlas `landing.tsx:250`, nexus `Landing.tsx:228`, alphalens
  `Landing.tsx:292`). `FeatureGrid01.numbered`, for the ordinal all four render on
  every card (www `Landing.tsx:166`, atlas `landing.tsx:116`, nexus `Landing.tsx:132`,
  alphalens `Landing.tsx:142`). `Hero01.align`, for the left-aligned hero three of
  the four compose (atlas `landing.tsx:69`, nexus `Landing.tsx:63`, alphalens
  `Landing.tsx:87`). All five are additive: nothing changed shape and nothing was
  removed.
  
  **A Block and a Page publish both an interface section and a composition section.**
  `packages/llms` read the extractor's output for a Block and threw the interface half
  away, so the tool told an agent a Block had no own props. The extractor reads a
  named props type off an emitted declaration whether that declaration belongs to a
  Component or to a Block, so both sections are now built and both are assembled into
  the mirror file, `llms-full.txt` and the Store's `doc`.
  
  The Store now carries both fields for every kind, and `get_item_props` prints
  both when it has both. The sentence "a Block has no own props" is gone from the
  tool as well as from the published document. It was the one place the two
  sections were still exclusive, because that tool branched on `item.props` and
  fell back to the composition section, so a Block was answered with its
  composition and a denial of the interface it publishes. The test asserts the
  sentence's absence, so a refactor that restores it fails even if the composition
  is still printed, and a second test covers the one-present case so the
  both-present branch cannot swallow it.
  
  **Four accessible names became required props** on `SiteHeader`, `LogoStrip01`,
  `NotFoundPage` and `BlogPostPage`, and a Block that ships no copy ships no
  reader-facing copy either. `navLabel`, `productsLabel`, `label`, `linksLabel` and
  `trailLabel` are words a screen reader reads out, and no Block should be choosing
  them for a consumer whose site calls its own landmarks something else. This is the
  one breaking change in the release, and it is on four new Blocks and two new Pages
  plus one new required prop on `SiteHeader`, all of which are new in the same
  release, so no existing call site changes.
  
  **`ProductSwitcher.label` has no default** for the same reason: a consumer whose set
  is not a set of products should pass its own word rather than accept a claim about
  what the set is.

### Patch Changes

- 4832359: Build the corpus after the changelog routes are copied, and declare what it reads
  
  The corpus asserts that every published package shipping a changelog has a route
  in the site's content tree, and those routes are written by a copy step that
  belongs to the site package. The copy ran after this package was built, so on a
  cold machine the build failed with a message that read like a changelog file had
  been deleted, and a warm machine never saw the failure at all.
  
  The copy is now the task `@nanisoft/site#copy-changelogs`, which this build
  depends on in the task graph, and this build declares the content tree, the Item
  documentation tree, the two site script modules the builder imports, the
  workspace globs, the published manifests and the changelogs as its inputs, so a
  change to any of them rebuilds the corpus instead of replaying a cached one.
  
  The assertion is unchanged and still fails a published package the site does not
  publish, which is how a changelog path the corpus advertised while the site
  returned 404 for it was found. Its message now says which of the two causes it
  is. No corpus byte changes: the emitted corpus is the same.

## 0.2.0

### Minor Changes

- c0cc0a9: Publish seven Sections, and keep every published URL resolving
  
  `STORE_SECTIONS` is `overview`, `foundation`, `content`, `changelogs` where it
  was `docs`, `foundations`, `content`, `changelogs`, and `STORE_SECTION_TITLES`
  carries the Section's own name beside its directory. The two are a pair for a
  reason: the directory is the route a page is addressed by and `get_page` matches
  on it, and the name is what `llms.txt` groups pages under and what `list_pages`
  counts. A Section renamed without its label renamed would be advertised under two
  names in two artifacts, and a page whose `section` no longer names a live
  directory is a page no tool can reach.
  
  The reading order of the prose Sections is the site's: Overview, then Foundation,
  then Content, then the catalogue, then the Changelogs. The corpus is regenerated
  at build, so `llms.txt`, `llms-full.txt`, `data.json` and every mirror under `md/`
  advertise the new routes, and the site Worker answers each old route with a
  permanent redirect generated from the same manifest. An agent holding a cached
  `llms.txt` from before this release resolves every URL it names and is told
  nothing about the move.
  
  Nothing in the item surface moves. The forty-two catalogue routes are the same
  forty-two addresses, their mirrors are byte-identical, and the nine tools keep
  their names and their positions; `list_pages` and `get_page` are unchanged apart
  from the Section names they group and describe, which is a parameter on the
  existing tools and not a rename of any of them.
- b1125a0: Publish the Changelogs Section, and put the changelogs in the agent surface
  
  There was no Changelogs Section, so the only record of a change in a published
  package was a file inside its tarball. A reader now has one route per published
  package and an agent can ask for it. Both halves land together, so a Section never
  exists without being in the Corpus.
  
  The per-package pages are byte-for-byte copies of each published package's own
  `CHANGELOG.md`, written by a copy step inside the build the site already runs.
  That is the whole reason for the shape: a hand-maintained copy of a changelog
  drifts from what was published while continuing to look correct, and it is a third
  place to remember alongside the changeset and the JSDoc. The published packages
  are discovered from the workspace, so publishing a package is what adds a route,
  and a package that ships a changelog and no route fails the build in three
  places. The reference design system this is modelled on has reader-facing
  changelog pages and no such gate, which is how every one of them can be deleted
  and leave its continuous integration green.
  
  `STORE_SECTIONS` gains `changelogs`, so `llms.txt`, `llms-full.txt` and the
  Markdown mirror carry a Changelogs group, and the content walk reads the second
  extension the Section needs: a copied changelog is plain Markdown, and a walk
  filtered to `.mdx` would have left the whole Section out of the agent surface
  with a green build. The walk already recursed, so a page nested inside a Section
  reaches the Corpus the same way it did before.
  
  `PrismDocsStore` gains a required `changelogs` field carrying each package's
  bytes, its route and its version entries, and the MCP server gains one read-only
  tool, `get_changelog(package, version?)`, registered last. The eight existing
  tools keep their names and their positions: a Section joining the Corpus is a
  parameter on `list_pages` and `get_page`, which now read the Sections from the
  Store rather than from a list of the three prose Sections, and not a rename of
  anything. `get_changelog` returns the package's own file, because a generated
  summary would drift the moment a release was published, and a breaking change in
  a published package is exactly what a consuming agent has to be able to find.

### Patch Changes

- cbf442f: Make the corpus walk the content tree, and make a missing Section fail
  
  The generator read one directory per Section and filtered it to `.mdx`, so a page
  one folder deeper was absent from `llms.txt`, from `llms-full.txt`, from the
  `PrismDocsStore` and from every read-only MCP tool, with a green build. The walk
  now recurses, and a page's route, its `slug` and its Markdown mirror all come
  from where the page sits in the tree, so nesting content publishes a page
  instead of losing it.
  
  The same file guarded the Section loop with `if (!existsSync(dir)) continue`, so a
  Section that was declared and not on disk, which is what renaming one does, was
  skipped silently and deleted from every agent surface. It now throws.
  
  `llms.txt`, `llms-full.txt`, `data.json` and `md/**` are byte-for-byte unchanged
  for the current flat tree.

## 0.1.0

The first versioned line of the rebuilt Prism agent corpus. One build-fresh
`dist/` carries `llms.txt`, `llms-full.txt`, `prism-skill.md`, the per-item
Markdown mirror and `data.json`, the `PrismDocsStore` projection.

Changesets are appended above this entry for every published change.
