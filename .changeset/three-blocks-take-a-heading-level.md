---
'@nanisoft/prism-ui': minor
---

`SiteFooter`, `DataTable01` and `RunConsole01` take a heading level

Three Blocks drew a hard-coded `<h2>`. A fixed level is right for a Block at the top
of a page and wrong everywhere else, and all three are Blocks a product opens inside
something: a footer as the last region of a settings page, a table in a drawer, a run
console in a panel. In each case the heading became a sibling of the heading the
surrounding section already had, so "skip to the next heading at or below level two"
walks straight past the thing the reader came to read.

All three take `headingLevel?: HeadingLevel` and default to `'h2'`, which is the
arrangement every other Block in this package already uses and which
`childLevel()` exists to compose. Nothing rendered changes for a caller that passes
nothing. `DataTable01`'s JSDoc had claimed the fix was needed, so this is the code
catching up to its own documentation.

**The audit behind this said `SiteFooter` was the only Block in the tree with no
`headingLevel` prop. It was three.** The count matters because it changes the shape of
the fix: a single instance reads as a judgement call about that Block and a class of
three reads as a rule the package had not finished applying, which is what this
release says.
