---
'@nanisoft/prism-ui': minor
---

Export the `Stat` and `Stats01Props` types from `stats-01`

A caller that builds the `stats` array could not name the type it was building,
so it had to infer it or annotate the array as `any`, and a rename of a field on
`Stat` then stopped being a compile error at every call site. Both types are
now exported from the subpath, alongside the Block.
