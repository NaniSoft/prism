---
'@nanisoft/prism-ui': minor
---

The elevation scale is three steps or it is nothing, and the gate now says so

`SearchDialog` shipped `shadow-lg`, and `DESIGN.md` said no shipped component
uses one. Both were true once and neither was true when the sentence was last
read: the Component took `shadow-lg` as an override on top of the `shadow-md` its
own `DialogContent` already draws, and the site's skip link took `focus:shadow-lg`
under a heading that named "the theme disclosure and mobile nav panels" as the
only places it was allowed.

**`shadow-lg` is not an authored step, so neither of those was drawing an authored
shadow.** The token package emits `--shadow-xs`, `--shadow-sm` and `--shadow-md`
and nothing else, so `shadow-lg` resolved against Tailwind's own stock theme. That
is the second source of truth this package exists to prevent, and the reason it
was invisible is that Tailwind's `shadow-lg` is a perfectly good black-alpha
shadow: nothing looked wrong. What was wrong is that a retune of the elevation
scale would have moved every lifted surface in every consumer and left that panel
exactly where it was.

**`SearchDialog` now says nothing about elevation at all.** The panel is the one
lifted element over a modal scrim, which is what `--shadow-md` is for, and
`DialogContent` already draws it, so the override is deleted rather than
replaced. A consumer who styles `DialogContent` keeps styling it, which was not
true of a hardcoded `shadow-lg` sitting on top of it.

**`scripts/check-elevation-layout.mjs` now fails on any `shadow-*` step the token
source did not author**, in every root it reads, the site's own source included.
It reads the authored set from `shadow.tokens.json` rather than from a list beside
the gate, for the reason the width rule beside it reads the container names from
`layout.tokens.json`: a gate whose subject is the authored scale cannot be
answered by a second copy of it. `shadow-none` is allowed, because the absence of
a shadow is not one more step of the scale, and `shadow-inner` is not, because it
is a shadow nobody authored.

**There is no docs-only exception any more, and that is the part worth arguing
with.** The exemption said site apparatus is not installable surface. The site's
own Tailwind build is a second consumer of the same token package, so "the site"
is not outside the system, it is inside it twice: a site class resolving a shadow
out of Tailwind is the second source of truth wearing the word apparatus. The
site's skip link draws `shadow-md` now, which is what it should have drawn.

The bump is `minor` rather than `patch` because a consumer who styles the search
panel's elevation sees it move from Tailwind's `lg` to Prism's `md`, which is a
visible change to a published surface and the right one.