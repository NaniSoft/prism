---
'@nanisoft/prism-llms': minor
'@nanisoft/prism-mcp-server': minor
---

Publish seven Sections, and keep every published URL resolving

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
