---
'@nanisoft/prism-ui': minor
---

A call to action with a destination renders a link, and an icon is required only where a tile is

Every primary call to action in the Block family declared an `href` its type then
never rendered. The control was a `<button>` with no handler: the type said the
component could navigate, the documentation implied it, and the markup could not
do either. Sixteen of them across the family, five of them to another origin.

**`CtaLink` is a new Component.** It renders a native `<a>` and carries the
visual weight of a call to action, so assistive technology announces a link and
the browser's own affordances all work: a status bar showing the destination, a
context menu to copy it, middle-click to open a new tab. It is a Component in its
own right rather than an `as` or `href` prop on `Button`, which is the answer
`BreadcrumbLink` and `PaginationLink` already give twice in this package. It is a
server component, so the swap costs no client JavaScript.

`href` is required on `CtaLink`: an anchor without one is not a link. `newTab` is
a declared prop and the only way to open a new browsing context, because `target`
is not accepted, so the relationship cannot be opted out of by accident. When it
is set, `rel` defaults to `noopener noreferrer`; a consumer that needs a
different relationship passes `rel` and it wins. Prism does not parse the
destination and does not decide what counts as external.

**`Cta01` no longer offers an action that navigates nothing.** `Cta01Action`'s
`href` is required, there is no optional arm and no dead-button arm, and a new
`actionSlot` takes a control the Block does not own, such as a client router's
link. The Block makes no guess about cross-origin. The one rendered change in
this release is a button becoming the link its type always said it was: the link
is styled from the same recipe as the button it replaces, at every shared variant
and size, and a test asserts that class-for-class.

**`FeatureGrid01`'s icon is required only where a tile is rendered.** The
requirement is a union discriminated on `variant` rather than an optional prop,
because an optional prop turns a safe-at-render condition into an unsafe one and
permits an empty accent tile per feature. The `icon` variant is the one an
omitted `variant` selects, so the default and the required icon live on the same
arm; the `bare` variant renders no tile and requires no icon, and the type says
so rather than the renderer finding out. `IconFeature` and `BareFeature` are
exported, and the union is the type the site's API table is extracted from.

**The version the four downstream site plans pin is `0.6.0`.** It is
`@nanisoft/prism-ui@0.6.0`, and `@nanisoft/prism-tokens@0.6.0` with it, because the
two are linked in `.changeset/config.json` and the pending
`a-server-rendered-pack-boundary-can-be-mode-correct` changeset already declares a
minor for both from `0.5.1`. This one declares a minor as well and so does not
raise it.

Migration: a `Cta01` action needs a destination. Where the action was a label
alone, give it the `href` it was always declared with, or move the control into
the new `actionSlot`. A `FeatureGrid01` in the `bare` variant can now drop the
`icon` its type used to demand; the `icon` variant still demands one per feature.
