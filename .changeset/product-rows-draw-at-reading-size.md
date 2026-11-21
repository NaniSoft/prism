---
'@nanisoft/prism-ui': minor
---

`ProductGrid01` rows draw at the size a platform band is read at

The closing product band on every landing page drew its rows like table rows: a
mark at the smallest drawn size, one line of padding under a hairline, and a
tagline at the caption step. A band whose job is the one place a reader decides
which product to leave for read as a footnote about the products it names.

Each row now draws its mark at `lg`, steps its tagline to the body size above
the small breakpoint, breathes at six lines of padding, and rounds its hover
wash at the `lg` radius so the row reads as a surface rather than as a
highlight painted over a rule. The API, the anchor semantics, the boundary on
`ProductMark` and the two-level `tagline` and `detail` rule are unchanged, and
a consumer sees the change without editing anything. A caller whose product set
lives in a working area composes the table suite, which is what it is for.
