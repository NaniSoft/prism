# @nanisoft/prism-tokens

## 0.5.1

### Patch Changes

- 2fc6a0a: Retune `muted-foreground` so muted text clears 4.5:1 on the muted surface
  
  The base pack's `muted-foreground` moves from neutral 500 to neutral 600. It
  cleared 4.5:1 on the page background but fell to 4.34:1 on `muted`, where the
  pill, avatar fallback, kbd and tab-list pattern place it. The contrast gate now
  also checks `muted-foreground` on `muted`. The pastel packs were already pinned
  to their neutral 700 and are unchanged.

## 0.5.0

Prism was rebuilt from a fresh repository on a clean break. The token pipeline is
DTCG 2025.10 compiled with Style Dictionary, the semantic names keep the shadcn
contract verbatim, and motion, typography, spacing, shadows, breakpoints and
containers all reach CSS through a single `@theme static` block.

Changesets are appended above this entry for every published change.
