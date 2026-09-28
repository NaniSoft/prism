# @nanisoft/prism-tokens

## 0.6.0

### Minor Changes

- 4f9ce77: A server-rendered pack boundary can now be mode-correct
  
  The only dark selector for a pack was `[data-pack="<id>"].dark`, which requires
  the mode class on the same element. A server cannot know the reader's mode, so a
  subtree carrying a second pack rendered in that pack's light values on a dark
  page. The token build now emits the two-member list
  
  ```
  [data-pack="<id>"].dark, .dark [data-pack="<id>"]
  ```
  
  as one rule with one declaration block, for all five packs. The compound half is
  retained, because it is what a dark surface on a light page is and it is a
  capability the package already published.
  
  Consumers get a second change alongside it. `themeAttributes` now takes `mode` as
  optional, because a required one is that same impossibility written into the type:
  the only way to ask for a boundary with no mode class of its own was to pass
  `'light'` as a guess, and the guess is wrong for half of readers. Omitting `mode`
  is the honest spelling of "wear the mode of the element carrying `.dark`". The
  change is a widening, so every existing caller still compiles.
  
  The theme-boundary law in `DESIGN.md` is rewritten to match. It previously
  instructed an implementer to put `data-pack` and `class="dark"` on a boundary
  together, which works for a client-applied boundary and cannot work for a
  server-rendered one.
- 5dcb347: Every colour role now has a contrast row or a stated reason, and there is a brand ink
  
  The contrast gate decided what to measure by a naming convention: any root token ending in
  `-foreground` had to be the first element of a pair. Six of the seven roles that were in no row at
  all could not be reported by that rule, because `chart-1` through `chart-5` and `sidebar-border`
  do not end in `-foreground`, and `sidebar-ring` does not either. A new role therefore defaulted to
  silence. The gate now walks the token source instead of the table, so a role nobody has written
  down is a failure rather than an absence, and the role set is read from `src/semantic/` rather than
  from the pair table, or the walk would be checking the table against itself.
  
  `sidebar-ring` is what the walk immediately found. It had no row at all, and its shipped values
  measured 2.42:1 in the base pack's light mode, 1.73:1 in its dark mode, 2.86:1 in Mint and 2.97:1
  in Sky against the sidebar surface: a focus indicator four of twelve pack and mode combinations
  could not be seen against, reported as compliant because it was not measured. The values moved, not
  the row. The base pack goes from neutral 400 and neutral 700 to neutral 500 in both modes, because
  the base pack's ring is one ramp rather than two; the pastels go from brand 500 to brand 600 in
  light, because the sidebar is neutral 50 rather than neutral 0 and brand 500 is one step short of
  3:1 in two packs. The dark pastels keep brand 300 at 8.06:1 or better. `sidebar-border` gains an
  advisory row on the sidebar surface with the same judgement `border` and `input` already carry,
  which is how its 1.18:1 to 1.37:1 became a number on the record rather than an unmeasured value.
  
  `chart-1` through `chart-5` are exempted with a reason rather than measured against a ground. A
  series is a graphic object: shadcn consumes the five as the stroke and fill of a series and reads
  its tooltip and legend text from `foreground` and `muted-foreground`, which are each gated against
  their own ground. What binds a five-way set is that no two series resolve to the same value, so
  that is what the gate asserts instead, in every pack and both modes. The measured tightest pair is
  37/255 in a channel, Peach in dark mode between `chart-1` and `chart-5`. No minimum separation is
  asserted, because a threshold with no standard behind it is a number that gets bent. `radius` is
  exempted as a length rather than a colour, and the exclusion is a declared entry with a reason
  instead of a name filter buried in a loop. Every exemption is printed on every run with the roles
  that share it.
  
  **`brand-ink` is a new semantic role: a brand hue read as text.** Three sites want a brand colour
  they can read on a surface and `primary` cannot serve it, because `primary` is a fill: a pastel
  brand 400 measures 2.20:1 to 2.44:1 on its own pack's page and 1.90:1 to 2.05:1 on the accent
  surface. It is brand 700 in light and brand 200 in dark, in all five packs and the base, and it is
  gated at 4.5:1 against three grounds rather than one: the page, a card, and the accent surface.
  The accent is the ground that decides the step in both directions, because a light ink has to
  survive the pack's own brand 100 and a dark ink has to survive brand 800, and brand 600 and brand
  400 respectively are the steps that fail each. The measured worst case across all six sources, both
  modes and all three grounds is 5.57:1 in Mint's light mode. The dark step is brand 200 rather than
  the brand 300 the accent ground would have permitted, because brand 300 is `primary` in every
  pack's dark mode and a brand ink that is the brand fill is the confusion the role exists to end. A
  test asserts that `brand-ink` never resolves to the same value as `primary`, `primary-foreground`
  or `foreground` in any source or mode.
  
  **The two values that were already in the contract are the two answers this gate rules out, and
  both are written into `DESIGN.md` as prohibitions with a number attached.** `primary-foreground` is
  the pack's brand 950 step, in both modes and all five packs, published under three further names in
  light mode, and it is the value a reader of the contract reaches for when they want the brand colour
  as text. It clears its own row by 7.39:1 to 11.06:1 and it measures 1.00:1 to 1.82:1 on the dark
  page ground, the dark card and the dark accent surface. In light mode it reads 15.05:1 to 18.05:1
  on the page, so half the modes it looks right and half it disappears, and no row in the contract
  could see the difference. `ring` is the other: the pack's brand hue as a non-text boundary, gated
  at 3:1 against the page ground alone, and it measures 2.66:1 to 4.35:1 on the accent surface in all
  six light-mode sources. Neither was wrong arithmetically. Both are invisible on the ground a brand
  ink lands on, and both now have a role that is measured there.
  
  **A role is measured in both modes or the run fails.** Every colour role, exempt ones included, has
  to resolve to an sRGB value in light and in dark in every pack, so an exemption buys a role freedom
  from a ground and never from a mode. This is what a role present in one mode and absent from the
  other looks like, and the build's own key-set guard does not reach it because it compares light
  against light.
  
  The old `-foreground` name test is gone rather than kept beside the walk. It was never a second
  opinion on coverage, which the walk settles, and its only additional content is that a role named
  `*-foreground` must be the foreground of a row rather than the background of one, which is a claim
  about the shadcn naming convention and belongs to the Contract Rule.
  
  No consumer action is required. `brand-ink` is additive: it is a new custom property, the stylesheet
  gains a `text-brand-ink` utility, and no existing token changed except `sidebar-ring`, whose value
  moved in the base pack and in the light mode of every pastel. A consumer that styled its own sidebar
  focus ring from `--sidebar-ring` will see a more visible ring, which is the point.

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
