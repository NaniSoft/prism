---
'@nanisoft/prism-tokens': patch
'@nanisoft/prism-ui': patch
---

Retune `muted-foreground` so muted text clears 4.5:1 on the muted surface

The base pack's `muted-foreground` moves from neutral 500 to neutral 600. It
cleared 4.5:1 on the page background but fell to 4.34:1 on `muted`, where the
pill, avatar fallback, kbd and tab-list pattern place it. The contrast gate now
also checks `muted-foreground` on `muted`. The pastel packs were already pinned
to their neutral 700 and are unchanged.
