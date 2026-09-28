---
'@nanisoft/prism-ui': minor
'@nanisoft/prism-llms': patch
---

Add `DocsShell`, a documentation page that takes a site's navigation as data

`DocsShell` is a documentation screen: a navigation rail, the document, a
contents rail, and a pager to the neighbouring pages. It replaces the unstyled
`docs-shell` the retired line published, and it is the Page the three NaniSoft
product sites already import by that name.

The navigation is data. A tree of one page and a tree of twenty-seven render the
same way, at any depth, and the frame is sized by what the caller passed rather
than by a fixed arrangement, so three sites whose documentation sets differ in
shape share one Page with no per-site fork.

- `nav` and `toc` are closed unions of `page`, `group` and `divider`. Both are
  read in the order given: nothing is sorted or alphabetised, so a site that
  files its rail as a pipeline and its contents as a reference has both in one
  render.
- The pager is derived from `nav` and `currentHref`. There is no `neighbours`
  prop, so a neighbour that is not in the tree cannot be expressed, and each
  consumer loses one derivation of its own.
- A group with no `href` renders a `span` rather than an anchor with no
  destination. The three sites spell that case today as an empty string, and two
  of them carry a stylesheet rule that styles the result back into a label; those
  rules are now deletable.
- A section carries no status, no badge, no count, no collapse and no sort. A
  status written into a title stays in the title as words.
- Both rails are bounded against the viewport, because one site's tree is half
  again as tall as another's.

The corpus fix that shipped with it: the props extractor read each declaration
body twice with two depth counters that disagreed, so a Page whose `index.tsx`
re-exported a value and a type from one sibling published every prop twice and
swept the members of its navigation union into its own prop list. It now reads
each body once.
