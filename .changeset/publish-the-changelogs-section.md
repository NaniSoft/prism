---
'@nanisoft/prism-llms': minor
'@nanisoft/prism-mcp-server': minor
---

Publish the Changelogs Section, and put the changelogs in the agent surface

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
