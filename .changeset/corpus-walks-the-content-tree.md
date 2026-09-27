---
'@nanisoft/prism-llms': patch
---

Make the corpus walk the content tree, and make a missing Section fail

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
