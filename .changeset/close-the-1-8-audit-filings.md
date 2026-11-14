---
'@nanisoft/prism-ui': minor
---

Close the 1.8 audit's upstream filings: the grid the narrowing promised, the panel's new-tab, the documented pair the sheet now emits, and an engine the field owns

- `DSGrid`'s one-column template below `sm` is explicit (`grid-cols-1`, `repeat(1, minmax(0, 1fr))`) instead of the implicit track a bare `grid` leaves. An implicit auto track sizes to its content's max-content, so a tile carrying its own legible floor (a `Diagram` at the width its labels stop being legible) grew the page at phone width and scrolled it sideways; the track is clamped now and the overflow belongs to the tile's own scroll container, the bargain those Components document.
- The mobile panel's entries accept `newTab`. The panel is the site's navigation and navigates in place, so a `mobileOnly` entry whose destination leaves the site can now open the way the row would have, and a destination held back to the panel no longer loses the way it opened.
- The stylesheet emits `hidden`, `sm:inline-flex` and `xl:inline-flex`, the classes the site-navbar documentation prescribes for the cluster-action half of that pair and no Component of Prism's own uses. A consumer of the published sheet could write neither, which left the documented arrangement legal on the site that builds its own Tailwind and unwritable in the four consumer repositories the sheet exists for.
- `TsparticlesField` mounts the engine directly and holds the whole chain: loads are serialized per field so two never race the same element, a container that arrives after an unmount is destroyed on arrival, and an engine rejection (the `TSP-1101` the 1.8 audit caught as an uncaught page error) reaches `console.warn` with the static floor standing behind the field, never the page. `@tsparticles/react` is no longer a dependency: its load promise was the uncaught path, and its provider's callback-stability contract was the defect 1.7.1 fixed.
