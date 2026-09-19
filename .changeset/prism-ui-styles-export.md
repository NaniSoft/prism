---
'@nanisoft/prism-ui': patch
---

prism-ui: the `./styles.css` export actually ships now — the build copies `src/styles.css` into `dist/` (tsc never emitted it, so the export dangled until the site became the first consumer).
