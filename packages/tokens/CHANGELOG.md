# @nanisoft/prism-tokens

## 0.15.0

### Minor Changes

- 6dc7bb8: There is one container namespace, and `max-w-6xl` no longer resolves
  
  **If you wrote `max-w-6xl`, `max-w-2xl`, `max-w-xl`, `max-w-lg`, `max-w-md`,
  `max-w-sm` or `max-w-5xl` against this package, that class now produces no rule at
  all.** Nothing errors and nothing warns: the element simply loses its cap and lays
  out at whatever its parent gives it. Grep your own repository for `max-w-` before
  you upgrade. The replacements are in the list below and every one of them resolves.
  
  The reason is the defect this release ends. `@nanisoft/prism-tokens` authors three
  container widths and Tailwind ships thirteen of its own, and until now both shipped
  in the same stylesheet. Three of Tailwind's were numerically identical to three of
  ours: its largest at 72rem beside `--container-page`, its fifth at 42rem beside
  `--container-measure`, its fourth at 36rem beside `--container-measure-narrow`.
  Nothing rendered differently, so nothing failed and every gate was green. What it
  cost was that one width had two names, and the first retune of an authored token
  would have moved every surface reaching it by one spelling and left every surface
  reaching it by the other exactly where it was. `Section`, `SiteHeader`,
  `SiteFooter`, `ChartCard01`, `DocsShell` and `QuickView01` all used the Tailwind
  spelling of the page column; `Cta01` and `SectionHeading` used the Tailwind
  spellings of the two measures.
  
  The token build now closes the whole namespace, with
  `--container-*: initial` ahead of the authored entries rather than a list of the
  seven steps that happened to be emitted. A wildcard is the load-bearing word: the
  thirteen names it retires are `3xs 2xs xs sm md lg xl 2xl 3xl 4xl 5xl 6xl 7xl`,
  and a list would have been a second list to keep in step with a dependency's
  default theme, which is the event the line exists to survive. Order matters and is
  asserted: Tailwind resolves a theme in source order, and the same declaration
  written after the authored entries clears all eight of ours and ships no container
  at all.
  
  **What to write instead**
  
  | You wrote | Write | Value |
  | --- | --- | --- |
  | `max-w-6xl` | `max-w-page` | 72rem |
  | `max-w-2xl` | `max-w-measure` | 42rem |
  | `max-w-xl` | `max-w-measure-narrow` | 36rem |
  | `max-w-md` on a dialog or an alert | `max-w-overlay-dialog` | 28rem |
  | `max-w-lg` on a form dialog | `max-w-overlay-form` | 32rem |
  | `max-w-xl` on a command palette or a search | `max-w-overlay-palette` | 36rem |
  | `max-w-sm` on a side sheet or a drawer | `max-w-overlay-panel` | 24rem |
  | `max-w-5xl` on a lightbox | `max-w-overlay-media` | 64rem |
  
  **An overlay's width is a property of the kind of surface it is, not of the page
  grid underneath it**, and that is why the five overlay widths are authored rather
  than carried on a Tailwind name. A retune of the reading measure must not move a
  dialog and a retune of the page column must not move either, so the two families
  are named apart inside the one container group. They share a group because
  Tailwind 4's `max-w-*` resolves `--spacing-*` and `--container-*` and nothing
  else, so a maximum width that is to be a token has to live in one of those two
  namespaces or it is a value written in a Component. `overlay-palette` and
  `measure-narrow` are both 36rem; that is two measurements that happen to agree and
  not one measurement with two names, and the token source says so and the emitted
  contract holds it to saying so.
  
  **Nothing is supposed to change where you can see it.** Every migration above
  preserves the exact rendered width, so a page that only consumed this stylesheet
  looks the same before and after. What changes is the next retune: it now moves one
  surface rather than half of them.
  
  **A width that was arithmetic on the spacing base is left alone, deliberately.**
  `max-w-96`, `max-w-72`, `max-w-64`, `max-w-32` and `max-w-20` resolve to
  `calc(var(--spacing) * N)` and never touched the container namespace at all. They
  are how a chart's axis band, a token table's column and a documentation frame are
  sized, where nobody took a decision and naming one would invent it. They stay.
  
  **Two gates now hold this down, because the question has two sides.**
  `scripts/check-elevation-layout.mjs` reads every `w-*` and `max-w-*` name out of
  the class strings and holds it to the container group read out of the token source,
  so a width nobody authored is a finding with a file and a line; it reads
  `apps/site/items` as well as `apps/site/src` and `packages/ui/src`, because that is
  where the documentation Demos live and where the site's own build scans.
  `packages/ui/scripts/check-container-namespace.mjs` reads the built stylesheet and
  holds the artefact: that the theme block declares exactly the authored containers,
  that none of Tailwind's thirteen steps is declared or read, that the close is
  written ahead of the entries rather than after them, and that every container width
  this package writes is emitted as a utility reading its own variable. It reads the
  step list out of the installed `tailwindcss/theme.css` rather than restating it, so
  a dependency that adds a step is covered without an edit. Tailwind's extractor
  reads this package's comments as well as its code, so a retired class name written
  down in a JSDoc block used to emit a utility; there is now a rule about that too.
  
  **The bump is `minor` rather than `major`, and the argument is the version line
  rather than the severity.** A class a consumer wrote stops producing a rule with no
  error, which is breaking by any ordinary reading, and this entry says so plainly.
  `major` in this repository publishes `1.0.0`, and every release to date has been
  `minor` on a `0.y.z` line where the `y` is already the breaking-equivalent slot.
  Publishing 1.0.0 with this change in it would assert an API stability guarantee
  this library has not earned, and it would be the first release in the project's
  history to use the bump at all. The break is real and is the subject of this
  entry; the number it lands on is the line's decision and the line is pre-1.0.
  
  **One collateral repair on the documentation site, recorded here because it is
  why `globals.css` moved.** The site's own build and this package's meet in one
  `utilities` layer, and this package emits a bare `.grid-cols-6` as the base of the
  `lg:` variant four of its Blocks use. That bare rule landed after the site's
  `sm:grid-cols-11`, so every colour ramp on the Foundations page was drawing six
  columns at every width above 640 against a comment beside the class saying
  eleven. Whether `check-utility-cascade.mjs` saw it depended on which order two
  content-hashed CSS chunks sorted in, which this change perturbed and which nothing
  about the tree controls. Neither side is wrong, so the site's variant is restated
  in the `site-variants` layer that already exists for six other collisions. The
  repaired behaviour is on the documentation site only; nothing in this package
  changes.
- 6dc7bb8: Ship the interface face and its metric-adjusted fallback, and stop the site loading its own
  
  `@nanisoft/prism-ui` shipped three Inter weights and no fallback face, so a reader
  waiting on the web font saw the platform's UI face jump into place when Inter
  arrived. The stylesheet now also ships a local Arial carrying Inter's metrics
  through `size-adjust`, `ascent-override`, `descent-override` and
  `line-gap-override`, and `--font-sans` names it immediately after Inter, so the
  swap window occupies Inter's own line box. The four numbers are measured off the
  shipped face rather than chosen, and they are the ones `next/font` measured for the
  same typeface, so the line box is unchanged from what the documentation site had.
  
  A fourth face ships beside them: Inter italic at weight 400, the Latin subset of
  the same release, covering the same 230 codepoints as its upright siblings.
  `Prose` sets `blockquote` in italic and the surface had been asking for a style no
  shipped file provided, so every consumer has been reading a synthesized oblique.
  One real face covers every weight a browser asks for, because the font matcher
  takes the closest available weight rather than synthesizing once a face exists.
  The whole set is 93.5 KB, up 22.8 KB, and no consumer has to do anything.
  
  **The documentation site no longer loads a face of its own.** It shipped a 723 KiB
  unsubsetted variable Inter and its italic through `next/font/local`, preloaded both
  in all 581 exported documents, and applied the result to `<body>` as a directly set
  `--font-sans`. A directly applied custom property outranks an inherited one, so the
  library's faces were never fetched on the site that documents them: a missing or
  corrupt shipped font rendered perfectly there with every gate green. The site now
  resolves the same stack you do, which is the only way it can be evidence for the
  package. If you were relying on the site to look right while your own copy of Inter
  was broken, that is now a failure you can see.

## 0.10.0

### Minor Changes

- 75434f8: Add a running figure to the system, and the ambient cycle scale that prices it
  
  The system had one law of motion: motion is state feedback, on an 80/160/280
  millisecond scale, and there are no keyframes anywhere. That law was right and
  it held. It also meant a product page could say what its product does and show
  nothing about it, which is what happened to four sites at once.
  
  This adds the second law, and it is a separate law rather than an exception to
  the first. Feedback is a response to something the reader did. A cycle is a
  demonstration of something the system does, and no reader is waiting for it.
  The test for which one a motion is does not require taste: stop the animation
  and ask whether the figure is still true and still legible.
  
  **New Components**
  
  - `PulseGraph` draws a running system: named nodes, the relations between them, a
    marker travelling a rail, and a breathing focus. A node's `lane` says it is a
    stage in a sequence, which draws the rail; a node with no lane is a field.
    `carries` on a relation says the line is carrying something, and draws a head
    at its end so the claim survives motion being off.
  - `PulseSeries` draws a live instrument: columns rising out of a caller-named
    baseline, with a reticle crossing them once per cycle. The values are the
    caller's own and the tallest sets the scale.
  - `SignalField` is a field of marks: the atmosphere a figure is drawn over.
    Decorative by default, still unless asked to drift, and honestly named as the
    one component in the system that is texture.
  
  **`Hero01` gains the band it was missing**
  
  All four sites hand-wrote the same two-column grid, each with its own gap and its
  own breakpoint. It is now the `instrument` slot, and an action naming an `href`
  renders as a real link rather than a button that goes nowhere. The centred form
  is unchanged, so this is additive.
  
  **New tokens**
  
  `ambient` and `ambient-ease` are two closed groups measured in seconds, separate
  from `duration` because folding them in would have made one name mean both 280ms
  and 7.2s. The emitted contract asserts the closed set and fails any cycle under
  one second, because a sub-second cycle is a flicker and no value in the 80 to
  280ms band could ever have caught that.
  
  **What this does not change**
  
  Nothing is hidden. No ambient rule sets `opacity: 0` and nothing waits for a
  script, an intersection or a timer, so every figure is complete at first paint
  and a consumer needs no exception to enable the `hidden-state` gate. Reduced
  motion is one `animation: none`, and because every resting state is the full
  form, that reader gets the same figure, still. All three are server Components,
  so this adds zero bytes of client JavaScript.

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
