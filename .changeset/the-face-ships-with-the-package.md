---
'@nanisoft/prism-ui': minor
---

The face ships from the component package, so a site writes one custom property for its typeface and nothing else

`@nanisoft/prism-ui` declared `--font-sans: Inter, ui-sans-serif, system-ui, ...` and shipped no font file. Naming a family is not shipping it: the first entry resolved to nothing and every page fell through to the platform's UI face, which is the one face a design system never means by its first choice. All four consumer sites were compensating with their own custom property and a build-time network fetch, and the company site had already shipped that way by accident.

The face is here now, as three latin roman weights with the licence beside them, and the `@font-face` sources are relative to the emitted stylesheet so they resolve from a consumer's install rather than from the consumer's origin. That last point is the old line's failure exactly: it emitted the face at an absolute path, which resolved against whichever site imported it, and the face silently failed in all four repositories.

A consumer's own override is now unnecessary rather than merely discouraged. `--font-sans` resolves to a face this package ships, so a site that deletes its `--font-sans` override still renders in the design system's face rather than in the platform's.

Three gates hold the arrangement, and none of them is discipline:

- `check:typeface.mjs` fails a token family that names no face this package ships and no family the reader's own machine provides, read from the **emitted** stylesheet rather than the source. The original defect was invisible in source: the rules shipped, the subsets were preloaded, and only the class carrying the variable was missing, so the family resolved to nothing at computed-value time with no error anywhere.
- the same gate fails an `@font-face` source that is absolute or a web-root path, which is how the old line failed silently.
- the build refuses to emit a stylesheet that names a face it did not copy, so a package cannot ship a sheet pointing at a file that is not in the tarball.

The face is 70.7 KB and every consumer installs it whether or not it renders a page, because a subpath does not reduce install size. That is the accepted price of one package instead of two.

The weight axis is absent, deliberately. The design system retired the width axis, and optical sizing, which it approximated, is the browser's initial behaviour, so a file carrying a width range is not the file this design asked for. 700 is absent for a second reason: the authored scale emits it and the shipped source renders it nowhere, and a 23.8 KB file no page renders is 23.8 KB every consumer downloads forever.
