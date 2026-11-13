---
'@nanisoft/prism-ui': patch
---

Every anchored popup the package portals now carries its `z` on the Base UI
positioner: the dropdown menu and its submenus, the context menu and its
submenus, and the menubar's menus. Popover, Select, Tooltip, HoverCard and
NavigationMenu already did, which is why a site's colour chooser could open
behind the page while the select beside it opened above it.

The positioner is the element Base UI places with an inline `transform`, and a
transformed element is a stacking context, so the `z-50` the popup itself
carried was trapped inside a context the page could outrank. The ground contract
gives the page's `main` `z-index: 1`, and an unranked positioner painted below
it: a menu opened from the bar landed behind the hero and its clicks reached the
page. The fix joins the positioner to the layer its popup always claimed.

The same release repairs the provider's first render. A `PrismProvider` whose
`defaultMode` is `system` reported the reader's own preference while the theme
was still unresolved, which the server render beside it cannot know, so the mode
toggle hydrated as a mismatch on every system-dark reader of a site that
defaults to the system mode. The unresolved render now reports the light member
on both sides, and the mount resolution replaces it with the truth before a
reader can act.
