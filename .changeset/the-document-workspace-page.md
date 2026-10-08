---
'@nanisoft/prism-ui': minor
---

`DocumentPage`, the document and research workspace

A new Page arrives at `@nanisoft/prism-ui/pages/document-page`. It draws one
document read in full, its body held to the reading measure, and one or more
regions beside it.

**It is authored beside `DocsShell`, and neither of that Page's two rules is
relaxed.** A section stays a label and not a control, and a group with no index
stays a label and not a route, because both are statements about a documentation
site's navigation tree and this workspace never asks that question. A status
belongs to a region of one document, and a route is the document's own contents.
No consumer of `DocsShell` is affected.

**One Page draws all seven screens.** The document is `RecordDetail01` and the
body is `Prose`; a version list is an `activity` region, a source or output list
is a `table` region, a comment thread is a `members` or a `table` region, and the
evidence comparison matrix is a `comparison` region drawn by `Compare01`. The
region union is by arrangement and not by subject matter, so the Page mints no
document, version, comment or source type and ships no sentence. The editor, the
fetch, the retention, the share, the export and the permission are the consumer's.

The Page ships with a catalogue entry, a JSDoc block, an Item page and a Demo, a
corpus and store entry, a composition test and an accessibility test over its
heading structure and named regions.
