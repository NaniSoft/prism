---
'@nanisoft/prism-ui': minor
---

`SiteNavbar` is opaque, and `sticky` can be turned off

The bar was `bg-background/80` with a `backdrop-blur`. A backdrop filter is
evaluated against everything painted behind the element, and this element is a
full-viewport-width sticky bar, so on a scrolling page the browser re-sampled and
re-blurred the backdrop on every frame of the scroll, on every page of every site
that composes it. The bar is now `bg-background` with a `border-border` hairline,
which is what `SiteHeader` has always shipped.

**The blur was not kept behind an `@supports` check, because a capability check does
not pay for it.** `@supports (backdrop-filter: blur(1px))` is false only in a
browser that was not compositing anything, and true in every browser that does the
expensive thing, so it changes no reader's cost. It would also have left a third
outcome in the world and the worst of the three: a bar that is a flat eighty
percent veil with unblurred text passing under it.

**Opaque is also the more legible of the candidates, and that is the part a token
can be held to.** An opaque bar makes the bar's own contrast the pair
`muted-foreground` on `background`, in every pack and in both modes, which is the
pair the contrast gate already checks. An eighty percent background has no token
pair at all, because the colour under it is whatever the reader's scroll position
has brought there and no token in this system describes it.

`will-change` is not on the bar and is not proposed for it. Nothing on the bar
animates, so a compositing hint applied at rest has no frame to be ready for and
nothing that would release it. This package ships no `will-change` anywhere.

**`sticky={false}` now works.** The prop was destructured and never reached the
class list, so a site that passed it was given the sticky bar it had asked not to
have. The default is unchanged and for the reason it was there: the bar is how a
reader leaves the page they are on, and it takes that with them on exactly the long
pages where it is needed.

Two things to know if you were styling against the old bar:

- A rule that set the bar's background translucency has nothing to sit on now. Set
  the colour on the page behind the bar, or leave the bar the way `SiteHeader` has
  it.
- A rule that relied on the bar being translucent to hide a heading as it scrolled
  under will no longer hide it, which is the point.

The bump is `minor` because the bar's default appearance changes on every page of
every consumer. No prop, import or landmark changes.
