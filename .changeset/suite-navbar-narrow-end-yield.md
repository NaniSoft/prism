---
'@nanisoft/prism-ui': minor
---

`SiteNavbar` yields the sites menu and the pack chooser below `sm`

Five 44 pixel controls and the brand lockup need about 400 pixels, so on a phone the row pushed its last control off the viewport edge and the page scrolled horizontally. Below 640 pixels the two menus that are choices about where to be now leave the row; search, the mode control, any `actions` and the mobile trigger remain, and that row fits a 320 pixel viewport. Nothing changes at `sm` and above. A reader who needs the family switcher or the pack chooser on a phone no longer has it on the row; if that reader matters to your site, keep the bar to one menu or pass fewer controls.
