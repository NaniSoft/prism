---
'@nanisoft/prism-ui': minor
---

Add `SiteNavbar`, the site bar with the controls a reader needs on every page

`SiteHeader` is a lockup, a product switcher and a slot. It is not a search box, a
menu of the family's sites, a colour chooser, a light and dark control, or a
navigation that survives the width at which a horizontal row stops fitting, and all
five NaniSoft sites had written the missing parts themselves: Prism's own site had
search and a colour chooser and no way to reach its four siblings, and each of the
four had a row of five product marks where a menu belongs and no search, no mode
control and no navigation at all below its own row's threshold.

`SiteNavbar` is that bar. `search`, `sites`, `theme`, `mode` and `nav` are each
optional, so a site that owns none of the four controls renders the whole bar as a
server Component and ships no client JavaScript for it. Every string is a prop: the
Block ships no site name, no default navigation, no "Search" and no list of packs or
sites.

```tsx
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar'

<SiteNavbar
  product={{ id: 'nexus', name: 'Nexus', pack: 'lavender' }}
  defaultPack="lavender"
  defaultMode="dark"
  navLabel="Site"
  mobileLabels={{ open: 'Open menu', close: 'Close menu' }}
  nav={NAV}
  currentSiteId="nexus"
  sitesLabel="The family"
  sites={SITES}
  search={{ indexUrl: '/api/search', label: 'Search documentation', messages: COPY }}
  mode={{ lightLabel: 'Switch to dark mode', darkLabel: 'Switch to light mode' }}
/>
```

`currentPath` is the alternative to marking `current` on each link, for a site that
composes the bar once in a root layout and is therefore handed no pathname.

Also new: `SearchDialog`, the search the bar opens. It fetches a static JSON index
on the first activation and ranks it in the browser, and the ranking is a scorer
rather than an inverted index: every query token has to match somewhere, so a
two-word query narrows instead of listing most of a documentation set. There is no
stemming and no typo tolerance, which is a deliberate trade against taking a search
dependency into a package that otherwise depends on a design system and a token
pipeline and nothing else.

`DropdownMenuItem` now takes `render`, so a menu item can be the link it navigates to
rather than a focusable element wrapped around one. Two tab stops for one row, and a
reader who middle-clicks a row that only looks like a link, are what that fixes.
