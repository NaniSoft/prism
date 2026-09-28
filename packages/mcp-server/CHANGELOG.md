# @nanisoft/prism-mcp-server

## 0.2.1

### Patch Changes

- Updated dependencies [4832359]
- Updated dependencies [76c8d96]
  - @nanisoft/prism-llms@0.3.0

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

- Updated dependencies [cbf442f]
- Updated dependencies [c0cc0a9]
- Updated dependencies [b1125a0]
  - @nanisoft/prism-llms@0.2.0

## 0.1.0

The first versioned line of the rebuilt Prism MCP surface. The package is
transport-free: `createPrismMcpServer(store, options)` returns an `McpServer`
that the site Worker connects to the Agents SDK at `/mcp`. Eight read-only
retrieval tools answer over the bundled `PrismDocsStore`.

Changesets are appended above this entry for every published change.
