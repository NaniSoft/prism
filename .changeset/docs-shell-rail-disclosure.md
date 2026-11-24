---
'@nanisoft/prism-ui': minor
---

DocsShell's navigation rail stands behind a disclosure below lg

Below the `lg` cut the rail's one copy of the tree now stands behind a named trigger and opens in place, so a phone reader reaches the article one tap from the navigation instead of past the whole tree. It is the deliberate client island the 0.16.1 removal commit asked for: the tree is still drawn once at every width, the disclosure wraps it rather than repeating it, there is no second `<nav>` under the rail's accessible name, and the trigger carrying `navLabel` is the only control the frame holds. The island renders open, which is the server's answer and the answer for a reader with scripting disabled, and once script is present it agrees with the frame's own `lg` cut via `matchMedia`, closed below it and open above it, so the one cost is a fold at hydration that is stated in the JSDoc rather than hidden. The rail-level slots `docs-rail-disclosure`, `docs-rail-trigger` and `docs-rail-panel` are new, and the retired `docs-nav-compact` and `docs-nav-disclosure` names stay retired.
