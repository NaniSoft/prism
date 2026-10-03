---
'@nanisoft/prism-ui': minor
---

`DocsShell` lays out three columns from `lg` rather than two

The documentation frame's third track named a screen the emitted theme closes, so
the class compiled to nothing and the contents rail fell into an implicit `auto`
track: two columns at every width from 1024 pixels, with the article column about
340 pixels wide at 1024, on this site and in all four consumers. The rail is
15rem, the document takes the rest, and the contents rail is 13rem, all from `lg`,
which is where both rails already appeared. No prop, import or rendered element
changes, and the third track still exists only when you pass `toc`.

**`check-breakpoint-variants.mjs` is new, and it is a gate rather than a fix.** It
reads every responsive variant out of the class strings in the component package
and the site and compares it to the screens the token package emits, read from
`layout.tokens.json` and from the build that closes `xl` and `2xl`. A class
written against a screen the theme does not have is now a finding with a file and
a line, and every other gate was green through the one above because each of them
held the value rather than the class.
