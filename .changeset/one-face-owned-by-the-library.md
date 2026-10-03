---
'@nanisoft/prism-ui': minor
'@nanisoft/prism-tokens': minor
---

Ship the interface face and its metric-adjusted fallback, and stop the site loading its own

`@nanisoft/prism-ui` shipped three Inter weights and no fallback face, so a reader
waiting on the web font saw the platform's UI face jump into place when Inter
arrived. The stylesheet now also ships a local Arial carrying Inter's metrics
through `size-adjust`, `ascent-override`, `descent-override` and
`line-gap-override`, and `--font-sans` names it immediately after Inter, so the
swap window occupies Inter's own line box. The four numbers are measured off the
shipped face rather than chosen, and they are the ones `next/font` measured for the
same typeface, so the line box is unchanged from what the documentation site had.

A fourth face ships beside them: Inter italic at weight 400, the Latin subset of
the same release, covering the same 230 codepoints as its upright siblings.
`Prose` sets `blockquote` in italic and the surface had been asking for a style no
shipped file provided, so every consumer has been reading a synthesized oblique.
One real face covers every weight a browser asks for, because the font matcher
takes the closest available weight rather than synthesizing once a face exists.
The whole set is 93.5 KB, up 22.8 KB, and no consumer has to do anything.

**The documentation site no longer loads a face of its own.** It shipped a 723 KiB
unsubsetted variable Inter and its italic through `next/font/local`, preloaded both
in all 581 exported documents, and applied the result to `<body>` as a directly set
`--font-sans`. A directly applied custom property outranks an inherited one, so the
library's faces were never fetched on the site that documents them: a missing or
corrupt shipped font rendered perfectly there with every gate green. The site now
resolves the same stack you do, which is the only way it can be evidence for the
package. If you were relying on the site to look right while your own copy of Inter
was broken, that is now a failure you can see.